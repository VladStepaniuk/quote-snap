/**
 * Email notifications via Resend.
 * Sends a notification to the merchant when a new quote request arrives.
 */
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "QuoteSnap <notifications@quotesnap.app>";

/**
 * @param {{
 *   to: string,
 *   shop: string,
 *   customerName: string,
 *   customerEmail: string,
 *   company?: string,
 *   productId: string,
 *   message?: string,
 * }} params
 */
export async function sendQuoteNotification({
  to,
  shop,
  customerName,
  customerEmail,
  company,
  productId,
  message,
}) {
  if (!resend || !to) return;

  const productNum = productId?.split("/").pop() || productId;
  const adminUrl = `https://${shop}/admin/products/${productNum}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New quote request from ${customerName} — ${shop}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #f9fafb;">
          <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #e3e7ed;">
            <div style="margin-bottom: 20px;">
              <span style="background: #eef2ff; color: #4f46e5; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px;">New Quote Request</span>
            </div>

            <h1 style="margin: 0 0 4px; font-size: 1.3rem; color: #111827;">You have a new quote request</h1>
            <p style="margin: 0 0 24px; color: #6b7280; font-size: 0.9rem;">From your store <strong>${shop}</strong></p>

            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 130px;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #111827;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;"><a href="mailto:${customerEmail}" style="color: #4f46e5;">${customerEmail}</a></td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Company</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${company}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Product</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;"><a href="${adminUrl}" style="color: #4f46e5;">View in Shopify</a></td>
              </tr>
              ${message ? `
              <tr>
                <td style="padding: 10px 0; color: #6b7280; vertical-align: top;">Message</td>
                <td style="padding: 10px 0; color: #111827;">${message}</td>
              </tr>` : ""}
            </table>

            <div style="margin-top: 24px;">
              <a href="https://${shop}/admin/apps/quotesnap" style="display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 0.875rem;">View in QuoteSnap</a>
            </div>
          </div>
          <p style="text-align: center; margin-top: 20px; font-size: 0.78rem; color: #9ca3af;">
            You're receiving this because you have email notifications enabled in QuoteSnap.<br>
            <a href="https://${shop}/admin/apps/quotesnap/app/settings" style="color: #9ca3af;">Manage notification settings</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    // Fail silently — never break quote submission due to email error
    console.error("[QuoteSnap] Email notification failed:", err?.message);
  }
}
