
'use server';

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<EmailSendResult> {
  // Check for environment variables at the start.
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_PORT ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    const errorMessage = 'Email environment variables (HOST, PORT, USER, PASS) are not set.';
    console.warn(errorMessage);
    console.log('--- ATTEMPTED EMAIL ---');
    console.log('--- TO: ', to);
    console.log('--- SUBJECT: ', subject);
    // In a real app, you might not want to log the full HTML content for security reasons.
    // console.log('--- HTML: ', html);
    // Returning an error message is better than just success: false
    return { success: false, error: errorMessage };
  }

  // Configure the transporter with the environment variables.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465, // `secure` is true if port is 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // It's better to configure TLS properly, but for some environments this might be needed.
    // tls: {
    //   rejectUnauthorized: false,
    // },
  });

  const mailOptions = {
    from: `"Review Router" <${process.env.EMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  };

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('SMTP server connection verified.');
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending email:', error);
    // Throwing an error here will cause the server action to fail with a 500 status.
    // This is appropriate as it's an unexpected server-side failure.
    // The calling action should catch this and return a user-friendly message.
    throw new Error(`Could not send email. SMTP Error: ${error.message}`);
  }
}
