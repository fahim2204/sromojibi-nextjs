import nodemailer from "nodemailer";

interface ISendOtpEmailOptions {
  to: string;
  fullName: string;
  otp: string;
}

const escapeHtml = (str: string): string => {
  return str.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
};

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "465", 10);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === "true",
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
};

export const sendVerificationOtpEmail = async ({ to, fullName, otp }: ISendOtpEmailOptions): Promise<boolean> => {
  const transporter = getTransporter();

  const from = process.env.SMTP_FROM || `"Sromojibi" <noreply@sromojibi.com>`;
  const subject = `${otp} is your Sromojibi verification code`;

  const safeFullName = escapeHtml(fullName.trim() || "User");
  const safeOtp = escapeHtml(otp.trim());

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email address</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);">
          <!-- Header -->
          <tr>
            <td style="background-color: #064e3b; padding: 24px 32px; text-align: left;">
              <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Sromojibi<span style="color: #34d399;">.com</span></span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px; text-align: left;">
              <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">
                Verify your email address
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #475569;">
                Hello ${safeFullName}, enter this 6-digit code to complete your Sromojibi account registration:
              </p>

              <!-- Main OTP Focal Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px 16px;">
                    <div style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #065f46; font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; text-indent: 10px;">
                      ${safeOtp}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Security Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 13px; color: #64748b; line-height: 1.6;">
                    ⏱️ Code expires in <strong>10 minutes</strong>.<br>
                    🔒 <strong>Never share this code</strong> with anyone.
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                If you did not request this verification code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
              &copy; ${new Date().getFullYear()} Sromojibi &bull; Connecting Skilled Workers Across Bangladesh
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[Mailer Warning] SMTP server not configured (SMTP_HOST / SMTP_USER / SMTP_PASS). Dev OTP for ${to}: [${otp}]`
      );
    } else {
      console.warn("[Mailer Warning] SMTP server not configured.");
    }
    return false;
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error(`[Mailer Error] Failed to send OTP email to ${to}:`, error);
    console.warn(`[Mailer Notice] Dev OTP fallback for ${to}: [${otp}]`);
    return false;
  }
};

export const sendPasswordResetOtpEmail = async ({ to, fullName, otp }: ISendOtpEmailOptions): Promise<boolean> => {
  const transporter = getTransporter();

  const from = process.env.SMTP_FROM || `"Sromojibi" <noreply@sromojibi.com>`;
  const subject = `${otp} is your Sromojibi password reset code`;

  const safeFullName = escapeHtml(fullName.trim() || "User");
  const safeOtp = escapeHtml(otp.trim());

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);">
          <!-- Header -->
          <tr>
            <td style="background-color: #064e3b; padding: 24px 32px; text-align: left;">
              <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Sromojibi<span style="color: #34d399;">.com</span></span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px; text-align: left;">
              <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">
                Reset your password
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #475569;">
                Hello ${safeFullName}, enter this 6-digit code to reset your account password:
              </p>

              <!-- Main OTP Focal Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px 16px;">
                    <div style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #065f46; font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; text-indent: 10px;">
                      ${safeOtp}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Security Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 13px; color: #64748b; line-height: 1.6;">
                    ⏱️ Code expires in <strong>10 minutes</strong>.<br>
                    🔒 <strong>Never share this code</strong> with anyone.
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
              &copy; ${new Date().getFullYear()} Sromojibi &bull; Connecting Skilled Workers Across Bangladesh
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[Mailer Warning] SMTP server not configured (SMTP_HOST / SMTP_USER / SMTP_PASS). Password Reset OTP for ${to}: [${otp}]`
      );
    } else {
      console.warn("[Mailer Warning] SMTP server not configured.");
    }
    return false;
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error(`[Mailer Error] Failed to send password reset OTP email to ${to}:`, error);
    console.warn(`[Mailer Notice] Dev Reset OTP fallback for ${to}: [${otp}]`);
    return false;
  }
};
