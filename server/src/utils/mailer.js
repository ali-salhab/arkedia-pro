const { Resend } = require("resend");

let resend = null;

function getResend() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

/**
 * FROM address. Must be a verified domain in your Resend account.
 * During development you can use the Resend sandbox sender:
 *   onboarding@resend.dev  (only delivers to your Resend-verified email)
 * For production set RESEND_FROM_EMAIL in your environment variables.
 */
function fromAddress() {
  return process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
}

/**
 * Send an email verification link to a newly registered client.
 *
 * @param {object} opts
 * @param {string} opts.toEmail   - recipient address
 * @param {string} opts.toName    - recipient display name
 * @param {string} opts.verifyUrl - full verification URL
 */
async function sendVerificationEmail({ toEmail, toName, verifyUrl }) {
  const r = getResend();

  const siteName = process.env.SITE_NAME || "Travky";
  const primaryColor = "#173f78";

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>تأكيد البريد الإلكتروني</title>
</head>
<body style="margin:0;padding:0;background:#f0f4fa;font-family:Arial,Helvetica,sans-serif;direction:rtl">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4fa;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr>
          <td style="background:${primaryColor};padding:32px 40px;text-align:center">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px">${siteName}</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px">منصة الحجز المتكاملة</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px">
            <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;font-weight:900">مرحباً ${toName} 👋</h2>
            <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7">
              شكراً لتسجيلك في ${siteName}! لإتمام إنشاء حسابك، يرجى تأكيد عنوان بريدك الإلكتروني بالنقر على الزر أدناه.
            </p>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px">
              <tr>
                <td style="border-radius:14px;background:${primaryColor}">
                  <a href="${verifyUrl}"
                    style="display:inline-block;padding:16px 48px;color:#fff;font-size:16px;font-weight:900;text-decoration:none;border-radius:14px">
                    تأكيد البريد الإلكتروني
                  </a>
                </td>
              </tr>
            </table>

            <!-- Fallback link -->
            <p style="margin:0 0 8px;color:#64748b;font-size:13px">إذا لم يعمل الزر، انسخ الرابط التالي والصقه في متصفحك:</p>
            <p style="margin:0 0 32px;word-break:break-all">
              <a href="${verifyUrl}" style="color:${primaryColor};font-size:13px">${verifyUrl}</a>
            </p>

            <!-- Warning -->
            <div style="background:#fff8e6;border:1px solid #fde68a;border-radius:12px;padding:16px">
              <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6">
                ⏱ هذا الرابط صالح لمدة <strong>24 ساعة</strong> فقط.
                إذا لم تطلب إنشاء حساب، يمكنك تجاهل هذه الرسالة بأمان.
              </p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} ${siteName} — جميع الحقوق محفوظة</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `مرحباً ${toName},\n\nيرجى تأكيد بريدك الإلكتروني بفتح الرابط التالي:\n${verifyUrl}\n\nصالح لمدة 24 ساعة.\n\n${siteName}`;

  const { error } = await r.emails.send({
    from: fromAddress(),
    to: [toEmail],
    subject: `تأكيد البريد الإلكتروني — ${siteName}`,
    html,
    text,
  });

  if (error) throw new Error(error.message || "Failed to send verification email");
}

module.exports = { sendVerificationEmail };
