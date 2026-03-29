import { useLoaderData, useFetcher, useLocation } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  const settings = await prisma.shopSettings.findUnique({ where: { shop } });

  let currentPlan = "free";
  try {
    const resp = await admin.graphql(`query { currentAppInstallation { activeSubscriptions { name status } } }`);
    const data = await resp.json();
    const subs = data?.data?.currentAppInstallation?.activeSubscriptions || [];
    const active = subs.find((s) => s.status === "ACTIVE" || s.status === "PENDING");
    if (active) currentPlan = active.name.toLowerCase().includes("pro") ? "pro" : "starter";
  } catch {}

  return Response.json({
    currentPlan,
    notificationEmail: settings?.notificationEmail || "",
    emailEnabled: settings?.emailEnabled ?? true,
    buttonLabel: settings?.buttonLabel || "Request a Quote",
    buttonBgColor: settings?.buttonBgColor || "#008060",
    buttonTextColor: settings?.buttonTextColor || "#ffffff",
    buttonBorderRadius: settings?.buttonBorderRadius || "4",
    formTitle: settings?.formTitle || "Request a Quote",
    formSuccessMsg: settings?.formSuccessMsg || "Thank you! We'll be in touch soon.",
    formShowCompany: settings?.formShowCompany ?? true,
    formSubmitLabel: settings?.formSubmitLabel || "Submit Request",
  });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const notificationEmail = String(formData.get("notificationEmail") || "").trim();
  const emailEnabled = formData.get("emailEnabled") === "on";
  const buttonLabel = String(formData.get("buttonLabel") || "Request a Quote").trim().slice(0, 80);
  const buttonBgColor = String(formData.get("buttonBgColor") || "#008060").trim();
  const buttonTextColor = String(formData.get("buttonTextColor") || "#ffffff").trim();
  const buttonBorderRadius = String(formData.get("buttonBorderRadius") || "4").trim();
  const formTitle = String(formData.get("formTitle") || "Request a Quote").trim().slice(0, 80);
  const formSuccessMsg = String(formData.get("formSuccessMsg") || "Thank you! We'll be in touch soon.").trim().slice(0, 200);
  const formShowCompany = formData.get("formShowCompany") === "on";
  const formSubmitLabel = String(formData.get("formSubmitLabel") || "Submit Request").trim().slice(0, 80);

  await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    update: { notificationEmail, emailEnabled, buttonLabel, buttonBgColor, buttonTextColor, buttonBorderRadius, formTitle, formSuccessMsg, formShowCompany, formSubmitLabel },
    create: { shop: session.shop, notificationEmail, emailEnabled, buttonLabel, buttonBgColor, buttonTextColor, buttonBorderRadius, formTitle, formSuccessMsg, formShowCompany, formSubmitLabel },
  });

  return Response.json({ ok: true });
};

const s = {
  wrap: { maxWidth: 620, padding: "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  card: { background: "#fff", border: "1px solid #e3e7ed", borderRadius: 12, padding: "24px 28px", marginBottom: 20 },
  cardTitle: { fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 4 },
  cardDesc: { fontSize: "0.85rem", color: "#6b7280", marginBottom: 20 },
  grid: { display: "grid", gap: 16 },
  label: { fontSize: "0.78rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5, display: "block" },
  input: { border: "1px solid #e3e7ed", borderRadius: 8, padding: "9px 12px", fontSize: "0.875rem", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  colorRow: { display: "flex", alignItems: "center", gap: 10 },
  colorSwatch: { width: 36, height: 36, borderRadius: 6, border: "1px solid #e3e7ed", cursor: "pointer", padding: 0 },
  checkRow: { display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" },
  btnSave: { background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" },
  savedMsg: { color: "#15803d", fontSize: "0.875rem", fontWeight: 600 },
  locked: { background: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: 12, padding: "28px", textAlign: "center", marginBottom: 20 },
  lockedIcon: { fontSize: "1.8rem", marginBottom: 8 },
  lockedTitle: { fontWeight: 700, color: "#111827", marginBottom: 6 },
  lockedDesc: { fontSize: "0.85rem", color: "#6b7280", marginBottom: 14 },
  upgradeLink: { color: "#4f46e5", fontWeight: 700, fontSize: "0.875rem" },
};

export default function SettingsPage() {
  const data = useLoaderData();
  const { currentPlan } = data;
  const fetcher = useFetcher();
  const { search } = useLocation();
  const billingUrl = `/app/billing${search}`;
  const saved = fetcher.data?.ok;
  const isPro = currentPlan === "pro";

  return (
    <fetcher.Form method="post">
      <div style={s.wrap}>

        {/* Email notifications */}
        <div style={s.card}>
          <div style={s.cardTitle}>Email notifications</div>
          <div style={s.cardDesc}>Get notified every time a customer submits a quote request.</div>
          <div style={s.grid}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={s.label}>Notification email</span>
              <input type="email" name="notificationEmail" defaultValue={data.notificationEmail} placeholder="you@yourstore.com" style={s.input} />
            </label>
            <label style={s.checkRow}>
              <input type="checkbox" name="emailEnabled" defaultChecked={data.emailEnabled} style={{ accentColor: "#4f46e5", width: 16, height: 16 }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Enable email notifications</span>
            </label>
          </div>
        </div>

        {/* Button customization */}
        {isPro ? (
          <div style={s.card}>
            <div style={s.cardTitle}>Button customization</div>
            <div style={s.cardDesc}>Customize the "Request a Quote" button appearance on your storefront.</div>
            <div style={s.grid}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={s.label}>Button label</span>
                <input type="text" name="buttonLabel" defaultValue={data.buttonLabel} maxLength={80} style={s.input} />
              </label>
              <div style={s.row2}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={s.label}>Background colour</span>
                  <div style={s.colorRow}>
                    <input type="color" name="buttonBgColor" defaultValue={data.buttonBgColor} style={{ ...s.colorSwatch, width: 44, height: 36 }} />
                    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{data.buttonBgColor}</span>
                  </div>
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={s.label}>Text colour</span>
                  <div style={s.colorRow}>
                    <input type="color" name="buttonTextColor" defaultValue={data.buttonTextColor} style={{ ...s.colorSwatch, width: 44, height: 36 }} />
                    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{data.buttonTextColor}</span>
                  </div>
                </label>
              </div>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={s.label}>Border radius (px)</span>
                <input type="number" name="buttonBorderRadius" defaultValue={data.buttonBorderRadius} min="0" max="50" style={{ ...s.input, maxWidth: 120 }} />
              </label>
            </div>
          </div>
        ) : (
          <div style={s.locked}>
            <div style={s.lockedIcon}>🎨</div>
            <div style={s.lockedTitle}>Button customization — Pro plan</div>
            <div style={s.lockedDesc}>Customize button colours, label, and border radius to match your brand.</div>
            <a href={billingUrl} style={s.upgradeLink}>Upgrade to Pro →</a>
          </div>
        )}

        {/* Form customization */}
        {isPro ? (
          <div style={s.card}>
            <div style={s.cardTitle}>Form customization</div>
            <div style={s.cardDesc}>Customize the quote request modal shown to customers.</div>
            <div style={s.grid}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={s.label}>Modal title</span>
                <input type="text" name="formTitle" defaultValue={data.formTitle} maxLength={80} style={s.input} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={s.label}>Submit button label</span>
                <input type="text" name="formSubmitLabel" defaultValue={data.formSubmitLabel} maxLength={80} style={s.input} />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={s.label}>Success message</span>
                <input type="text" name="formSuccessMsg" defaultValue={data.formSuccessMsg} maxLength={200} style={s.input} />
              </label>
              <label style={s.checkRow}>
                <input type="checkbox" name="formShowCompany" defaultChecked={data.formShowCompany} style={{ accentColor: "#4f46e5", width: 16, height: 16 }} />
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Show "Company" field in form</span>
              </label>
            </div>
          </div>
        ) : (
          <div style={s.locked}>
            <div style={s.lockedIcon}>📝</div>
            <div style={s.lockedTitle}>Form customization — Pro plan</div>
            <div style={s.lockedDesc}>Set a custom modal title, success message, submit label, and toggle the company field.</div>
            <a href={billingUrl} style={s.upgradeLink}>Upgrade to Pro →</a>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button type="submit" style={s.btnSave}>Save settings</button>
          {saved && <span style={s.savedMsg}>✓ Saved</span>}
        </div>
      </div>
    </fetcher.Form>
  );
}
