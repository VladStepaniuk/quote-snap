/**
 * Email notifications via Brevo (formerly Sendinblue) HTTP API.
 * Free tier: 300 emails/day, no domain verification required.
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
  if (!process.env.BREVO_API_KEY || !to) return;

  const productNum = productId?.split("/").pop() || productId;
  const adminUrl = `https://${shop}/admin/products/${productNum}`;

  const html = `
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
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><a href="mailto:${customerEmail}" style="color: #4f46e5;">${customerEmail}</a></td>
          </tr>
          ${company ? `<tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Company</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${company}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">Product</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;"><a href="${adminUrl}" style="color: #4f46e5;">View in Shopify</a></td>
          </tr>
          ${message ? `<tr>
            <td style="padding: 10px 0; color: #6b7280; vertical-align: top;">Message</td>
            <td style="padding: 10px 0; color: #111827;">${message}</td>
          </tr>` : ""}
        </table>
        <div style="margin-top: 24px;">
          <a href="https://${shop}/admin/apps/quotesnap" style="display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 0.875rem;">View in QuoteSnap</a>
        </div>
      </div>
    </div>
  `;

  try {
    console.log("[QuoteSnap] Sending email via Brevo to:", to);
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "QuoteSnap", email: process.env.BREVO_SENDER_EMAIL || "vladstepaniuk44@gmail.com" },
        to: [{ email: to }],
        subject: `New quote request from ${customerName} — ${shop}`,
        htmlContent: html,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[QuoteSnap] Brevo error:", JSON.stringify(data));
    } else {
      console.log("[QuoteSnap] Email sent, messageId:", data.messageId);
    }
  } catch (err) {
    console.error("[QuoteSnap] Email notification failed:", err?.message);
  }
}
