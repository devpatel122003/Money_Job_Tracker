// lib/email.ts
// Email service for password reset emails
// This example uses Resend (https://resend.com) - a modern email API
// You can replace with SendGrid, AWS SES, Mailgun, or any other email service

interface EmailConfig {
    apiKey: string
    fromEmail: string
    fromName: string
}

interface SendPasswordResetEmailParams {
    to: string
    resetUrl: string
    userName?: string
}

// Get email configuration from environment variables
function getEmailConfig(): EmailConfig {
    const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY
    const fromEmail = process.env.EMAIL_FROM || 'noreply@yourdomain.com'
    const fromName = process.env.EMAIL_FROM_NAME || 'Student Tracker'

    if (!apiKey) {
        throw new Error('Email API key not configured. Set RESEND_API_KEY or EMAIL_API_KEY environment variable.')
    }

    return { apiKey, fromEmail, fromName }
}

/**
 * Send password reset email using Resend
 * Docs: https://resend.com/docs/send-with-nodejs
 */
export async function sendPasswordResetEmail({ to, resetUrl, userName }: SendPasswordResetEmailParams): Promise<void> {
    const config = getEmailConfig()

    try {
        // Using Resend API
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `${config.fromName} <${config.fromEmail}>`,
                to: [to],
                subject: 'Reset Your Password - Student Tracker',
                html: getPasswordResetEmailHtml(resetUrl, userName),
                text: getPasswordResetEmailText(resetUrl, userName),
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Email sending failed:', error)
            throw new Error('Failed to send password reset email')
        }

        console.log(`Password reset email sent to ${to}`)
    } catch (error) {
        console.error('Error sending password reset email:', error)
        throw error
    }
}

/**
 * Alternative: Send using SendGrid
 * Uncomment and use this if you prefer SendGrid
 */
/*
export async function sendPasswordResetEmailSendGrid({ to, resetUrl, userName }: SendPasswordResetEmailParams): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) {
    throw new Error('SendGrid API key not configured')
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
      }],
      from: { email: process.env.EMAIL_FROM || 'noreply@yourdomain.com' },
      subject: 'Reset Your Password - Student Tracker',
      content: [
        { type: 'text/plain', value: getPasswordResetEmailText(resetUrl, userName) },
        { type: 'text/html', value: getPasswordResetEmailHtml(resetUrl, userName) },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to send password reset email')
  }
}
*/

/**
 * HTML email template for password reset
 */
function getPasswordResetEmailHtml(resetUrl: string, userName?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: bold;">Reset Your Password</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              ${userName ? `<p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">Hi ${userName},</p>` : ''}
              
              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                We received a request to reset your password for your Student Tracker account. Click the button below to create a new password:
              </p>
              
              <!-- Button -->
              <table role="presentation" style="margin: 32px 0;">
                <tr>
                  <td style="border-radius: 6px; background-color: #3b82f6;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px; line-height: 20px;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 24px; color: #3b82f6; font-size: 14px; line-height: 20px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <!-- Security Notice -->
              <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600;">Security Notice:</p>
                <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 20px;">
                  <li>This link expires in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                If you have any questions or concerns, please contact our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px;">
                This email was sent by Student Tracker<br>
                © ${new Date().getFullYear()} All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Plain text email template for password reset
 */
function getPasswordResetEmailText(resetUrl: string, userName?: string): string {
    return `
Reset Your Password

${userName ? `Hi ${userName},\n\n` : ''}We received a request to reset your password for your Student Tracker account.

Click the link below to create a new password:
${resetUrl}

SECURITY NOTICE:
- This link expires in 1 hour
- If you didn't request this, please ignore this email
- Never share this link with anyone

If you have any questions or concerns, please contact our support team.

© ${new Date().getFullYear()} Student Tracker. All rights reserved.
  `.trim()
}

/**
 * Send notification email when password is changed
 */
export async function sendPasswordChangedEmail(to: string, userName?: string): Promise<void> {
    const config = getEmailConfig()

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `${config.fromName} <${config.fromEmail}>`,
                to: [to],
                subject: 'Your Password Was Changed - Student Tracker',
                html: getPasswordChangedEmailHtml(userName),
                text: getPasswordChangedEmailText(userName),
            }),
        })

        if (!response.ok) {
            console.error('Failed to send password changed notification')
        }
    } catch (error) {
        console.error('Error sending password changed email:', error)
        // Don't throw - this is just a notification
    }
}

function getPasswordChangedEmailHtml(userName?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Changed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Password Changed Successfully</h1>
              ${userName ? `<p style="margin: 0 0 16px; color: #4b5563;">Hi ${userName},</p>` : ''}
              <p style="margin: 0 0 16px; color: #4b5563;">Your password was successfully changed. You can now use your new password to log in.</p>
              <div style="margin-top: 24px; padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Didn't change your password?</strong></p>
                <p style="margin: 8px 0 0; color: #991b1b; font-size: 14px;">If you didn't make this change, please contact support immediately.</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function getPasswordChangedEmailText(userName?: string): string {
    return `
Password Changed Successfully

${userName ? `Hi ${userName},\n\n` : ''}Your password was successfully changed. You can now use your new password to log in.

DIDN'T CHANGE YOUR PASSWORD?
If you didn't make this change, please contact support immediately.

© ${new Date().getFullYear()} Student Tracker.
  `.trim()
}