
'use server';
import 'dotenv/config';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { sendEmail } from './email';
import Stripe from 'stripe';
import { createSupabaseAdminClient } from './supabase';
import type { Business, Review, TeamUser, Payment, Database } from './types';
import { hashPassword, verifyPassword } from './crypto';
import { createSession, getSession, deleteSession } from './session';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const generateTempPassword = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

const generateBusinessId = () => {
    const min = 1111111111;
    const max = 9999999999;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

export async function login(prevState: any, data: FormData) {
  console.log('[login] Attempting login...');
  const supabase = createSupabaseAdminClient();
  const email = data.get('email') as string;
  const password = data.get('password') as string;

  const { data: user, error } = await supabase
    .from('users')
    .select('id, password, email_verified, business_id')
    .eq('email', email)
    .single();

  if (error || !user) {
    console.error('[login] User not found or DB error:', error?.message);
    return {
        success: false,
        message: "Invalid email or password. Please try again."
    }
  }

  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) {
    console.log(`[login] Invalid password for user: ${email}`);
    return {
        success: false,
        message: "Invalid email or password. Please try again."
    }
  }
  
  if (!user.email_verified) {
    console.log(`[login] User email not verified: ${email}. Redirecting to confirm-email.`);
    redirect(`/confirm-email?email=${encodeURIComponent(email)}`);
  }

  console.log(`[login] Login successful for user: ${user.id}. Creating session.`);
  
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString(), status: 'active' })
    .eq('id', user.id);

  await createSession(user.id);
  
  console.log('[login] Session creation attempted. Returning success.');
  return { success: true, message: 'Login successful.' };
}

export async function logout() {
    console.log('[logout] User logging out.');
    await deleteSession();
    redirect('/login');
}

const signupSchema = z
  .object({
    businessName: z.string().min(1, 'Business name is required.'),
    fullName: z.string().min(1, 'Full name is required.'),
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters long.'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function signup(prevState: any, formData: FormData) {
  const supabase = createSupabaseAdminClient();
  
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data provided.',
    };
  }

  const { email, password, fullName, businessName } = validatedFields.data;
  
  const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
  if (existingUser) {
    return { success: false, message: "A user with this email already exists." };
  }

  const defaultAmount = Number(process.env.NEXT_PUBLIC_DEFAULT_SUBSCRIPTION_AMOUNT) || 250;
  const defaultProductId = process.env.DEFAULT_STRIPE_PRODUCT_ID;
  const defaultPriceId = process.env.DEFAULT_STRIPE_PRICE_ID;
  const newBusinessId = generateBusinessId();

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      id: newBusinessId,
      name: businessName,
      owner_name: fullName,
      owner_email: email,
      status: 'inactive',
      subscription_amount: defaultAmount,
      stripe_product_id: defaultProductId,
      stripe_price_id: defaultPriceId,
      logo_url: `https://picsum.photos/seed/${businessName}/200/200`,
      redirect_threshold: 4,
      google_review_url: '',
    })
    .select()
    .single();

  if (businessError || !business) {
    console.error('Supabase business creation error:', businessError?.message);
    return { success: false, message: businessError?.message || "Could not create business." };
  }
  
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpiresAt = new Date(Date.now() + 3600 * 1000); // Expires in 1 hour

  const hashedPassword = await hashPassword(password);
  const { error: userError } = await supabase.from('users').insert({
    business_id: business.id,
    name: fullName,
    email,
    password: hashedPassword,
    role: 'Admin',
    status: 'invited',
    email_verified: false,
    verification_code: verificationCode,
    verification_expires_at: verificationExpiresAt.toISOString(),
  });

  if (userError) {
    console.error('Supabase user creation error:', userError?.message);
    await supabase.from('businesses').delete().eq('id', business.id);
    return { success: false, message: userError?.message || "Could not create user record." };
  }
  
  console.log('Signup for:', email, 'Business ID:', business.id);

  try {
    await sendEmail({
      to: email,
      subject: 'Confirm Your Email Address for Review Router',
      html: `
        <h1>Welcome, ${fullName}!</h1>
        <p>Thank you for signing up for Review Router for your business: <strong>${businessName}</strong>.</p>
        <p>Please use the following 6-digit code to confirm your email address:</p>
        <h2>${verificationCode}</h2>
        <p>This code will expire in one hour.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/confirm-email?email=${encodeURIComponent(email)}">Click here to enter your code</a>
      `,
    });
  } catch(e: any) {
    console.warn("Confirmation email could not be sent.", e.message);
    return { success: false, message: "We couldn't send a confirmation email. Please try again later." };
  }

  redirect(`/confirm-email?email=${encodeURIComponent(email)}`);
}

const confirmEmailSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6, 'Code must be 6 digits.'),
});

export async function confirmEmailAndLogin(prevState: any, formData: FormData) {
    console.log('[confirmEmailAndLogin] Attempting email confirmation...');
    const supabase = createSupabaseAdminClient();
    const validatedFields = confirmEmailSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        console.error('[confirmEmailAndLogin] Invalid form data.');
        return { success: false, message: 'Invalid code or email format.' };
    }

    const { email, code } = validatedFields.data;

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user) {
        console.error('[confirmEmailAndLogin] User not found.');
        return { success: false, message: 'User not found.' };
    }

    if (user.email_verified) {
        console.log('[confirmEmailAndLogin] Email already verified. Creating session.');
        await createSession(user.id);
        redirect('/dashboard');
    }

    if (user.verification_code !== code || new Date(user.verification_expires_at) < new Date()) {
        console.error('[confirmEmailAndLogin] Invalid or expired code.');
        return { success: false, message: 'Invalid or expired verification code.' };
    }

    const { error: updateError } = await supabase
        .from('users')
        .update({ 
            email_verified: true, 
            status: 'active',
            verification_code: null,
            verification_expires_at: null,
            last_login: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (updateError) {
        console.error('[confirmEmailAndLogin] Failed to update user account:', updateError.message);
        return { success: false, message: 'Failed to update your account. Please try again.' };
    }
    
    console.log(`[confirmEmailAndLogin] Verification successful for ${email}. Creating session.`);
    await createSession(user.id);
    redirect('/dashboard');
}

const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters long.'),
  customerName: z.string().optional(),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  businessId: z.string().min(1, 'Invalid business ID.'),
});

export async function submitReview(prevState: any, formData: FormData) {
  await sleep(1000);

  const validatedFields = reviewSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data provided.',
      success: false,
    };
  }

  const { rating, comment, customerName, email, businessId } = validatedFields.data;
  
  const supabase = createSupabaseAdminClient();
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('owner_email, name')
    .eq('id', businessId)
    .single();

  if (bizError || !business) {
    return { success: false, message: 'Business not found.' };
  }

  const { error: reviewError } = await supabase.from('reviews').insert({
    business_id: businessId,
    rating,
    comment,
    customer_name: customerName || "Anonymous",
  });

  if (reviewError) {
      console.error("Supabase review insert error:", reviewError);
      return { success: false, message: 'Could not save your review.' };
  }

  console.log('New Review Submitted for business:', businessId);

  return { success: true, message: 'Thank you! Your feedback has been received.' };
}

const settingsSchema = z.object({
  businessId: z.string(),
  businessName: z.string().min(1, 'Business name is required.').optional(),
  contactEmail: z.string().email('Please enter a valid email.').optional(),
  redirectThreshold: z.coerce.number().min(1).max(5).optional(),
  googleReviewUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  logoUrl: z.string().optional(),
});

export async function updateSettings(prevState: any, data: FormData) {
  await sleep(1000);
  const supabase = createSupabaseAdminClient();

  const rawData = Object.fromEntries(data.entries());
  const businessId = rawData.businessId as string;
  
  const validatedFields = settingsSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid data provided.',
      success: false,
    };
  }
  
  const { businessName, redirectThreshold, googleReviewUrl, logoUrl } = validatedFields.data;

  const updateData: Partial<Database['public']['Tables']['businesses']['Update']> = {};
  if (businessName) updateData.name = businessName;
  if (logoUrl) updateData.logo_url = logoUrl;
  if (redirectThreshold) updateData.redirect_threshold = redirectThreshold;
  if (googleReviewUrl) updateData.google_review_url = googleReviewUrl;
  

  const { error } = await supabase
    .from('businesses')
    .update(updateData)
    .eq('id', businessId);

  if (error) {
    console.error('Supabase settings update error:', error);
    return { success: false, message: 'Failed to save settings.' };
  }

  console.log('Settings Updated for ' + businessId, validatedFields.data);
  return { success: true, message: 'Settings saved successfully.' };
}

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
});

export async function updateProfile(prevState: any, data: FormData) {
  await sleep(1000);
  const supabase = createSupabaseAdminClient();
  const session = await getSession();
  if (!session?.userId) {
      return { success: false, message: 'Authentication required.' };
  }

  const validatedFields = profileSchema.safeParse(Object.fromEntries(data.entries()));

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid data provided.' };
  }

  const { error } = await supabase
    .from('users')
    .update({ name: validatedFields.data.name })
    .eq('id', session.userId);

  if (error) {
      return { success: false, message: 'Could not update profile.' };
  }

  return { success: true, message: 'Profile updated successfully.' };
}

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function changePassword(prevState: any, data: FormData) {
    await sleep(1000);
    const supabase = createSupabaseAdminClient();
    const session = await getSession();
    if (!session?.userId) {
        return { success: false, message: 'Authentication required.' };
    }

    const validatedFields = passwordSchema.safeParse(Object.fromEntries(data.entries()));

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid data provided.' };
    }

    const hashedPassword = await hashPassword(validatedFields.data.newPassword);
    const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', session.userId);

    if (error) {
        return { success: false, message: 'Could not update password.' };
    }
  
  return { success: true, message: 'Password updated successfully.' };
}

export async function forgotPassword(prevState: any, data: FormData) {
  const supabase = createSupabaseAdminClient();
  const email = data.get('email') as string;

  const { data: user, error } = await supabase.from('users').select('id, name').eq('email', email).single();
  if (error || !user) {
    return { success: false, message: "If an account with this email exists, a reset code has been sent." };
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

  const { error: updateError } = await supabase
    .from('users')
    .update({ verification_code: resetCode, verification_expires_at: expiresAt.toISOString() })
    .eq('id', user.id);

  if (updateError) {
    console.error("Forgot password update error:", updateError);
    return { success: false, message: "Could not generate a reset code." };
  }
  
  try {
    await sendEmail({
        to: email,
        subject: 'Your Password Reset Code',
        html: `<h1>Password Reset</h1><p>Your 6-digit code to reset your password is: <h2>${resetCode}</h2></p><p>This code will expire in one hour.</p>`
    });
  } catch (emailError) {
     return { success: false, message: "Could not send reset email. Please try again later." };
  }

  return {
    success: true,
    message: `A password reset code has been sent to ${email}.`,
    email: email
  };
}

const resetPasswordSchema = z
  .object({
    code: z.string().length(6, 'Code must be 6 digits.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
    email: z.string().email(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function resetPassword(prevState: any, data: FormData) {
    const supabase = createSupabaseAdminClient();
    const validatedFields = resetPasswordSchema.safeParse(Object.fromEntries(data.entries()));

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Invalid data provided.',
      };
    }
    
    const { code, password, email } = validatedFields.data;

    const { data: user, error } = await supabase.from('users').select('id, verification_code, verification_expires_at').eq('email', email).single();
    
    if (error || !user) {
        return { success: false, message: "Invalid reset code or email." };
    }

    if (user.verification_code !== code || new Date(user.verification_expires_at || 0) < new Date()) {
        return { success: false, message: 'Invalid or expired reset code.' };
    }

    const hashedPassword = await hashPassword(password);
    const { error: updateError } = await supabase
        .from('users')
        .update({ 
            password: hashedPassword,
            verification_code: null,
            verification_expires_at: null,
            status: 'active'
        })
        .eq('id', user.id);
    
    if (updateError) {
        return { success: false, message: 'Failed to reset your password. Please try again.' };
    }

    redirect('/login');
}


export async function createCheckoutSession(
    businessId: string,
    customerEmail: string
): Promise<{
    sessionId?: string;
    error?: string;
}> {
    if (!businessId || !customerEmail) {
        return { error: 'Business ID and Email are required.' };
    }
    
    const supabase = createSupabaseAdminClient();
    const { data: business, error: bizError } = await supabase.from('businesses').select().eq('id', businessId).single();

    if (bizError || !business) {
        return { error: 'Missing required data to create checkout session.' };
    }

    try {
        let customerId: string | undefined = business.stripe_customer_id;

        if (customerId) {
            console.log(`Found existing Stripe Customer ${customerId} in DB for business ${businessId}`);
        } else {
             const existingCustomers = await stripe.customers.list({ email: customerEmail, limit: 1 });
            if (existingCustomers.data.length > 0) {
                customerId = existingCustomers.data[0].id;
                console.log(`Found existing Stripe Customer ${customerId} for email ${customerEmail}`);
            } else {
                const customer = await stripe.customers.create({
                    email: customerEmail,
                    name: business.owner_name,
                    metadata: { businessId: business.id }
                });
                customerId = customer.id;
                console.log(`Created new Stripe Customer ${customerId} for email ${customerEmail}`);
            }
            
            if(customerId) {
                const { error: updateError } = await supabase.from('businesses').update({ stripe_customer_id: customerId }).eq('id', businessId);
                if (updateError) console.error("Failed to update business with stripe customer id");
            }
        }
        
        const priceId = business.stripe_price_id;
        if (!priceId) {
            return { error: 'Business subscription plan is not configured. Please contact support.' };
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            client_reference_id: businessId,
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?canceled=true`,
        });

        return session.id ? { sessionId: session.id } : { error: 'Could not create a checkout session.' };

    } catch (error) {
        console.error('Stripe Error:', error);
        return { error: 'Could not connect to Stripe.' };
    }
}

export async function createCustomerPortalSession(businessId: string): Promise<{
    url?: string;
    error?: string;
}> {
    const supabase = createSupabaseAdminClient();
    const { data: business, error: bizError } = await supabase.from('businesses').select().eq('id', businessId).single();
    
    if (bizError || !business || !business.stripe_customer_id) {
      return { error: 'Business not found or not linked to Stripe.' };
    }

    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: business.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing`,
        });

        return { url: portalSession.url };

    } catch (error) {
        console.error('Stripe Portal Error:', error);
        return { error: 'Could not create a customer portal session.' };
    }
}

export type FormattedInvoice = {
  id: string;
  date: Date;
  amount: number;
  status: Stripe.Invoice.Status;
  url: string | null;
};

export async function getPaymentHistory(
  businessId: string
): Promise<{
  invoices: FormattedInvoice[];
  error?: string;
}> {
  const supabase = createSupabaseAdminClient();
  const { data: business, error: bizError } = await supabase.from('businesses').select('stripe_customer_id').eq('id', businessId).single();

  if (bizError || !business || !business.stripe_customer_id) {
    return { invoices: [] };
  }

  try {
    const invoices = await stripe.invoices.list({ customer: business.stripe_customer_id, limit: 100 });
    const formattedInvoices: FormattedInvoice[] = invoices.data.map(
      invoice => ({
        id: invoice.id,
        date: new Date(invoice.created * 1000),
        amount: invoice.total / 100,
        status: invoice.status,
        url: invoice.hosted_invoice_url,
      })
    );
    return { invoices: formattedInvoices };
  } catch (error) {
    console.error('Stripe API error fetching invoices:', error);
    return { error: 'Could not fetch payment history.', invoices: [] };
  }
}

export async function getSubscriptionStatus(businessId: string): Promise<{
    status: 'active' | 'inactive';
    planName: string;
    amount: number;
    renewsAt: Date | null;
}> {
    const supabase = createSupabaseAdminClient();
    const { data: business, error: bizError } = await supabase.from('businesses').select().eq('id', businessId).single();
    
    if (bizError || !business) {
        return { status: 'inactive', planName: 'None', amount: 0, renewsAt: null };
    }

    return {
        status: business.status as 'active' | 'inactive',
        planName: business.status === 'active' ? 'Standard Plan' : 'None',
        amount: business.subscription_amount || 0,
        renewsAt: business.renews_at ? new Date(business.renews_at) : null,
    };
}

const inviteUserSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  role: z.enum(['Admin', 'Standard']),
});

export async function inviteUser(businessId: string, data: { name: string; email: string; role: 'Admin' | 'Standard'}) {
  const supabase = createSupabaseAdminClient();
  const { name, email, role } = data;

  const tempPassword = generateTempPassword();
  const hashedPassword = await hashPassword(tempPassword);

  const { error: userError } = await supabase.from('users').insert({
    business_id: businessId,
    name,
    email,
    password: hashedPassword,
    role,
    status: 'invited',
    email_verified: true,
  });

  if (userError) {
    console.error("Invite user error:", userError.message);
    return { success: false, message: `Failed to invite user: ${userError.message}` };
  }

  const { data: business, error: bizError } = await supabase.from('businesses').select('name').eq('id', businessId).single();

  try {
     await sendEmail({
      to: email,
      subject: `You've been invited to join ${business?.name || 'a team'} on Review Router`,
      html: `
        <h1>You're Invited!</h1>
        <p>You have been invited to join the <strong>${business?.name || ''}</strong> business account on Review Router.</p>
        <p>You can log in using the following temporary credentials:</p>
        <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Password:</strong> ${tempPassword}</li>
        </ul>
        <p>Please log in and change your password from your profile page as soon as possible.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login">Click here to Login</a>
      `,
    });
  } catch(e: any) {
    console.warn('Invite email could not be sent.', e.message);
    return { success: true, message: `User invited, but the welcome email could not be sent.` };
  }

  return { success: true, message: `An invitation email has been sent.` };
}

export async function deleteUser(businessId: string, userId: string) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('users').delete().eq('business_id', businessId).eq('id', userId);
    if(error){
        return { success: false, message: `User could not be deleted.` };
    }
    return { success: true, message: `User has been deleted successfully.` };
}
    
const createBusinessSchema = z.object({
    name: z.string().min(1, 'Business name is required.'),
    ownerName: z.string().min(1, 'Owner name is required.'),
    ownerEmail: z.string().email('Invalid email address.'),
    subscriptionAmount: z.coerce.number().min(0, 'Subscription must be a positive number.'),
    status: z.enum(['active', 'inactive']),
});
    

export async function createBusiness(data: z.infer<typeof createBusinessSchema>) {
    const supabase = createSupabaseAdminClient();
    const { name, ownerName, ownerEmail, subscriptionAmount, status } = data;
    const newBusinessId = generateBusinessId();

    let stripeProductId = process.env.DEFAULT_STRIPE_PRODUCT_ID;
    let stripePriceId = process.env.DEFAULT_STRIPE_PRICE_ID;

    if (subscriptionAmount !== Number(process.env.NEXT_PUBLIC_DEFAULT_SUBSCRIPTION_AMOUNT)) {
        try {
            const product = await stripe.products.create({
                name: `${name} - Custom Plan`,
            });
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(subscriptionAmount * 100),
                currency: 'usd',
                recurring: { interval: 'month' },
            });
            stripeProductId = product.id;
            stripePriceId = price.id;
        } catch (error) {
            console.error("Stripe custom plan creation error:", error);
            return { success: false, message: "Failed to create custom subscription plan in Stripe." };
        }
    }


    const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
            id: newBusinessId,
            name,
            owner_name: ownerName,
            owner_email: ownerEmail,
            subscription_amount: subscriptionAmount,
            status,
        })
        .select()
        .single();
    
    if (businessError) {
        console.error("Create business error:", businessError);
        return { success: false, message: "Failed to create business in database." };
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await hashPassword(tempPassword);

    await supabase.from('users').insert({
        business_id: business.id,
        name: ownerName,
        email: ownerEmail,
        password: hashedPassword,
        role: 'Admin',
        status: 'active',
        email_verified: true, 
    });

    try {
        await sendEmail({
            to: ownerEmail,
            subject: `Your New Business Account: ${name}`,
            html: `
                <h1>Welcome, ${ownerName}!</h1>
                <p>Your business account for <strong>${name}</strong> has been created by an administrator.</p>
                <p>You can now log in using the following temporary credentials:</p>
                <ul>
                    <li><strong>Email:</strong> ${ownerEmail}</li>
                    <li><strong>Password:</strong> ${tempPassword}</li>
                </ul>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login">Click here to Login</a>
            `
        });
    } catch (e: any) {
        console.warn("Business creation welcome email failed:", e.message);
        return { success: true, message: `Business created, but welcome email failed to send.` };
    }

    return { success: true, message: `Business created and welcome email sent.`, business };
}


export async function getBusinesses(): Promise<Business[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from('businesses').select('*');
    if (error) {
        console.error("Get Businesses Error:", error);
        return [];
    }
    const businesses = data || [];
    const businessesWithCounts = await Promise.all(businesses.map(async (business: any) => {
        const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('business_id', business.id);
        return { ...business, userCount: count || 0 };
    }));
    return businessesWithCounts as Business[];
}

export async function getBusiness(businessId?: string | null): Promise<Business | null> {
    if (!businessId) {
        const currentUser = await getCurrentUser();
        if (!currentUser?.businessId) return null;
        businessId = currentUser.businessId;
    }

    const supabase = createSupabaseAdminClient();

    const { data: businessData, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();
    
    if (error) {
        console.error(`Get Business (id: ${businessId}) Error:`, error);
        return null;
    }

    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('business_id', businessData.id);

    return { ...businessData, userCount: count || 0 } as Business;
}


export async function updateBusiness(id: string, data: Partial<Business>) {
    const supabase = createSupabaseAdminClient();
    
    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.userCount;
    delete updateData.createdAt;
    delete updateData.ownerEmail;
    delete updateData.ownerName;
    
    const { error } = await supabase.from('businesses').update(updateData).eq('id', id);
    if(error) {
        console.error("Update Business Error:", error);
        return { success: false, message: "Failed to update business." };
    }
    return { success: true, message: "Business updated." };
}

export async function getPayments(): Promise<Payment[]> {
    const supabase = createSupabaseAdminClient();
    const { data: businesses, error: bizError } = await supabase.from('businesses').select('id, name, stripe_customer_id');

    if (bizError) {
        console.error("Get Payments (Biz Fetch) Error:", bizError);
        return [];
    }

    const allPayments: Payment[] = [];

    for (const business of businesses) {
        if (business.stripe_customer_id) {
            try {
                const invoices = await stripe.invoices.list({
                    customer: business.stripe_customer_id,
                    limit: 100, // Max 100 per request
                });

                for (const invoice of invoices.data) {
                    allPayments.push({
                        id: invoice.id,
                        businessId: business.id,
                        businessName: business.name,
                        amount: invoice.amount_paid / 100,
                        date: new Date(invoice.created * 1000),
                        status: invoice.status === 'paid' ? 'succeeded' : (invoice.status || 'pending'),
                    });
                }
            } catch (stripeError) {
                console.error(`Failed to fetch invoices for customer ${business.stripe_customer_id}:`, stripeError);
            }
        }
    }

    return allPayments;
}

export async function getReviewsForBusiness(businessId: string): Promise<Review[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from('reviews').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
    if (error) {
        console.error("Get Reviews Error:", error);
        return [];
    }
    return data as Review[];
}

export async function getAllReviews(): Promise<Review[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from('reviews').select('*');
    if (error) {
        console.error("Get All Reviews Error:", error);
        return [];
    }
    return data as Review[];
}

export async function getTeamUsers(businessId: string): Promise<TeamUser[]> {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from('users').select('*').eq('business_id', businessId);
    if (error) {
        console.error("Get Team Users Error:", error);
        return [];
    }
    return data.map(u => ({
        id: u.id,
        businessId: u.business_id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: new Date(u.created_at),
        lastLogin: u.last_login ? new Date(u.last_login) : null,
        email_verified: u.email_verified,
        verification_code: u.verification_code,
        verification_expires_at: u.verification_expires_at,
    }));
}

export async function getCurrentUser(): Promise<TeamUser | null> {
  const session = await getSession();
  if (!session?.userId) {
    return null;
  }
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.from('users').select('*').eq('id', session.userId).single();
  if (error) {
    console.error("Get Current User Error:", error);
    return null;
  }
  return {
    id: data.id,
    businessId: data.business_id,
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
    createdAt: new Date(data.created_at),
    lastLogin: data.last_login ? new Date(data.last_login) : null,
    email_verified: data.email_verified,
    verification_code: data.verification_code,
    verification_expires_at: data.verification_expires_at,
  };
}


    
