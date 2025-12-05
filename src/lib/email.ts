import nodemailer from 'nodemailer';

// Email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@coursemaster.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Create transporter (only if SMTP credentials are provided)
let transporter: nodemailer.Transporter | null = null;

if (SMTP_USER && SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  return transporter !== null;
}

/**
 * Send email using nodemailer
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  if (!transporter) {
    console.warn('Email not configured. Skipping email send.');
    return;
  }

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });
    console.log(`✅ Email sent to ${options.to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw error - email failure shouldn't break the application
    // In production, you might want to log to an error tracking service
  }
}

/**
 * Generate welcome email HTML template
 */
export function getWelcomeEmailTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to CourseMaster</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to CourseMaster!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Hi ${name},</p>
          <p style="font-size: 16px;">
            Thank you for joining CourseMaster! We're excited to have you on board.
          </p>
          <p style="font-size: 16px;">
            You can now:
          </p>
          <ul style="font-size: 16px; padding-left: 20px;">
            <li>Browse our extensive course catalog</li>
            <li>Enroll in courses that interest you</li>
            <li>Track your learning progress</li>
            <li>Complete assignments and quizzes</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/courses" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Browse Courses
            </a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          <p style="font-size: 14px; color: #666;">
            Happy learning!<br>
            The CourseMaster Team
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} CourseMaster. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  if (!isEmailConfigured()) {
    console.log(`📧 Welcome email would be sent to ${email} (email not configured)`);
    return;
  }

  await sendEmail({
    to: email,
    subject: 'Welcome to CourseMaster! 🎓',
    html: getWelcomeEmailTemplate(name),
  });
}
