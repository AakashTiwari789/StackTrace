import crypto from 'crypto';

export const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export const otpHTML = (otp) => {
    return `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Email Verification OTP</title>
        </head>

        <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding:40px 16px;">
                        <table width="100%" max-width="600px" cellpadding="0" cellspacing="0"
                            style="background:#ffffff; border-radius:8px; overflow:hidden;">

                            <!-- Header -->
                            <tr>
                                <td style="padding:24px; background:#0f172a; color:#ffffff; text-align:center;">
                                    <h1 style="margin:0; font-size:22px;">StackTrace</h1>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:32px; color:#111827;">
                                    <h2 style="margin-top:0;">Your OTP for email verification</h2>
                                    <p style="font-size:15px; line-height:1.6;">
                                        Your OTP for verifying your email is: <strong>${otp}</strong>
                                    </p>

                                    <p style="font-size:14px; color:#374151;">
                                        This OTP will expire in 5 minutes. If you didn't request this, you can safely ignore
                                        this email.
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding:16px; background:#f9fafb; color:#6b7280; font-size:12px; text-align:center;">
                                    © ${new Date().getFullYear()} StackTrace. All rights reserved.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>

        </html>
        `;
}