import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email configuration using nodemailer
 * Configure your email service credentials in .env file:
 * 
 * EMAIL_HOST=smtp.gmail.com
 * EMAIL_PORT=587
 * EMAIL_USER=your-email@gmail.com
 * EMAIL_PASSWORD=your-app-password
 * EMAIL_FROM=your-email@gmail.com
 * 
 * For Gmail, you need to:
 * 1. Enable 2-factor authentication
 * 2. Generate an "App Password" from Google Account settings
 * 3. Use the app password instead of your regular password
 */

const createTransporter = () => {
  // Check if email configuration exists
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email configuration not found in .env file');
    console.warn('⚠️  Email sending will be simulated (logged to console)');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter;
};

export const transporter = createTransporter();

/**
 * Send a single email
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    // If no transporter (no email config), simulate sending
    if (!transporter) {
      console.log('\n📧 [SIMULATED EMAIL]');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Message:', text);
      console.log('---\n');
      return { success: true, simulated: true };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send bulk emails with rate limiting
 */
export const sendBulkEmails = async (recipients, subject, message, eventTitle) => {
  const results = {
    successful: [],
    failed: [],
    total: recipients.length
  };

  // Create HTML version of the message
  const htmlMessage = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9353d3 0%, #643d88 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${subject}</h2>
          <p>Event: ${eventTitle}</p>
        </div>
        <div class="content">
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="footer">
          <p>This email was sent to you as a registered attendee of ${eventTitle}.</p>
          <p>© ${new Date().getFullYear()} Event Management Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send emails with a small delay to avoid rate limiting
  for (let i = 0; i < recipients.length; i++) {
    const email = recipients[i];
    
    try {
      await sendEmail(email, subject, message, htmlMessage);
      results.successful.push(email);
      
      // Add a small delay between emails (100ms) to avoid rate limiting
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error.message);
      results.failed.push({ email, error: error.message });
    }
  }

  return results;
};

export default { transporter, sendEmail, sendBulkEmails };
