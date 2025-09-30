
// src/app/api/stripe/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createSupabaseAdminClient } from '@/lib/supabase';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabase = createSupabaseAdminClient();

// Get the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`✅ Received Stripe event: ${event.type}`);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const businessId = session.client_reference_id;
      
      console.log(`[checkout.session.completed] Processing for client_reference_id (businessId): ${businessId}`);
      
      if (!businessId) {
        console.error('❌ [checkout.session.completed] Webhook Error: Missing businessId (client_reference_id) in checkout session.');
        break;
      }
      
      if (!session.subscription) {
          console.error(`❌ [checkout.session.completed] Webhook error for business ${businessId}: Checkout session is missing subscription ID.`);
          break;
      }
      
      console.log(`[checkout.session.completed] Session completed for business ID: ${businessId}`);
      
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      console.log(`[checkout.session.completed] Retrieved subscription ${subscription.id} for business ${businessId}.`);

      const { error } = await supabase
        .from('businesses')
        .update({
          status: 'active',
          stripe_customer_id: subscription.customer as string,
          renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', businessId);
      
      if (error) {
        console.error(`❌ [checkout.session.completed] Supabase error updating business ${businessId}:`, error.message);
      } else {
        console.log(`✅ [checkout.session.completed] Business ${businessId} status updated to 'active'.`);
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;
      const customerId = invoice.customer as string;

      if (subscriptionId) {
        console.log(`[invoice.payment_succeeded] Processing for subscription: ${subscriptionId}, Customer: ${customerId}`);
        
        const { data: business, error: findError } = await supabase
            .from('businesses')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

        if (findError || !business) {
            console.error('❌ [invoice.payment_succeeded] Supabase error finding business for customer', customerId, findError?.message);
            break;
        }

        console.log(`[invoice.payment_succeeded] Found business ${business.id} for customer ${customerId}.`);
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const { error: updateError } = await supabase
            .from('businesses')
            .update({
                status: 'active',
                renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', business.id);
        
        if (updateError) {
             console.error(`❌ [invoice.payment_succeeded] Supabase error updating business ${business.id} renewal:`, updateError.message);
        } else {
            console.log(`✅ [invoice.payment_succeeded] Business ${business.id} renewal date updated.`);
        }
      } else {
          console.log('[invoice.payment_succeeded] Received for an invoice without a subscription ID. Skipping.');
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      console.log(`[invoice.payment_failed] Processing for customer: ${customerId}`);
      const { error } = await supabase
        .from('businesses')
        .update({ status: 'inactive' })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error(`❌ [invoice.payment_failed] Supabase error updating business status to inactive for customer ${customerId}:`, error.message);
      } else {
        console.log(`✅ [invoice.payment_failed] Business with customer ID ${customerId} status updated to 'inactive' due to failed payment.`);
      }
      break;
    }

    case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        console.log(`[customer.subscription.deleted] Processing for subscription ${subscription.id} for customer ${customerId}.`);

        const { error } = await supabase
            .from('businesses')
            .update({ status: 'inactive' })
            .eq('stripe_customer_id', customerId);

        if (error) {
            console.error(`❌ [customer.subscription.deleted] Supabase error updating business status to inactive for customer ${customerId}:`, error.message);
        } else {
            console.log(`✅ [customer.subscription.deleted] Business with customer ID ${customerId} status updated to 'inactive' due to subscription cancellation.`);
        }
        break;
    }

    default:
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
