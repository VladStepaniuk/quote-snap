import { useState } from "react";
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
  page: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  layout: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start", padding: "20px", maxWidth: 1000 },
  left: { display: "grid", gap: 20 },
  card: { background: "#fff", border: "1px solid #e3e7ed", borderRadius: 12, padding: "24px 28px" },
  cardTitle: { fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 4 },
  cardDesc: { fontSize: "0.85rem", color: "#6b7280", marginBottom: 20 },
  grid: { display: "grid", gap: 16 },
  label: { fontSize: "0.78rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5, display: "block" },
  input: { border: "1px solid #e3e7ed", borderRadius: 8, padding: "9px 12px", fontSize: "0.875rem", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  colorRow: { display: "flex", alignItems: "center", gap: 10 },
  checkRow: { display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" },
  btnSave: { background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" },
  savedMsg: { color: "#15803d", fontSize: "0.875rem", fontWeight: 600 },
  locked: { background: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: 12, padding: "28px", textAlign: "center" },
  lockedIcon: { fontSize: "1.8rem", marginBottom: 8 },
  lockedTitle: { fontWeight: 700, color: "#111827", marginBottom: 6 },
  lockedDesc: { fontSize: "0.85rem", color: "#6b7280", marginBottom: 14 },
  upgradeLink: { color: "#4f46e5", fontWeight: 700, fontSize: "0.875rem" },
  // Preview
  previewWrap: { position: "sticky", top: 20 },
  previewCard: { background: "#fff", border: "1px solid #e3e7ed", borderRadius: 12, padding: "20px" },
  previewTitle: { fontSize: "0.78rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 },
  previewStorefront: { background: "#f8f9fa", borderRadius: 8, padding: "20px", marginBottom: 16, border: "1px solid #e3e7ed" },
  previewProductTitle: { fontWeight: 700, fontSize: "0.95rem", color: "#111", marginBottom: 6 },
  previewPrice: { fontSize: "0.8rem", color: "#6b7280", marginBottom: 12 },
  previewModal: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 10, padding: "16px", marginTop: 16 },
  previewModalTitle: { fontWeight: 700, fontSize: "0.9rem", color: "#111", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f0f0f0" },
  previewField: { background: "#f9fafb", border: "1px solid #e3e7ed", borderRadius: 6, padding: "7px 10px", fontSize: "0.78rem", color: "#9ca3af", marginBottom: 8 },
  previewSuccess: { textAlign: "center", padding: "12px 8px", color: "#15803d", fontSize: "0.82rem", fontWeight: 600 },
};

function LivePreview({ btn, form }) {
  const [showSuccess, setShowSuccess] = useState(false);
  return (
    <div style={s.previewWrap}>
      <div style={s.previewCard}>
        <div style={s.previewTitle}>Live preview</div>

        {/* Storefront button */}
        <div style={s.previewStorefront}>
          <div style={s.previewProductTitle}>Example Product</div>
          <div style={s.previewPrice}>Price hidden · Quote only</div>
          <button
            type="button"
            style={{
              background: btn.bg,
              color: btn.color,
              borderRadius: btn.radius + "px",
              border: "none",
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              width: "100%",
            }}
            onClick={() => setShowSuccess(false)}
          >
            {btn.label || "Request a Quote"}
          </button>
        </div>

        {/* Mini modal preview */}
        <div style={s.previewModal}>
          <div style={s.previewModalTitle}>{form.title || "Request a Quote"}</div>
          {showSuccess ? (
            <div style={s.previewSuccess}>✓ {form.successMsg || "Thank you! We'll be in touch soon."}</div>
          ) : (
            <>
              <div style={s.previewField}>Your name</div>
              <div style={s.previewField}>Email address</div>
              {form.showCompany && <div style={s.previewField}>Company (optional)</div>}
              <div style={s.previewField}>Message (optional)</div>
              <button
                type="button"
                style={{ background: btn.bg, color: btn.color, borderRadius: btn.radius + "px", border: "none", padding: "8px 16px", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", width: "100%", marginTop: 4 }}
                onClick={() => setShowSuccess(true)}
              >
                {form.submitLabel || "Submit Request"}
              </button>
            </>
          )}
        </div>
        <div style={{ fontSize: "0.72rem", color: "#9ca3af", textAlign: "center", marginTop: 8 }}>Click submit to preview success state</div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const data = useLoaderData();
  const { currentPlan } = data;
  const fetcher = useFetcher();
  const { search } = useLocation();
  const billingUrl = `/app/billing${search}`;
  const saved = fetcher.data?.ok;
  const isPro = currentPlan === "pro";

  // Live preview state
  const [btnLabel, setBtnLabel] = useState(data.buttonLabel);
  const [btnBg, setBtnBg] = useState(data.buttonBgColor);
  const [btnColor, setBtnColor] = useState(data.buttonTextColor);
  const [btnRadius, setBtnRadius] = useState(data.buttonBorderRadius);
  const [formTitle, setFormTitle] = useState(data.formTitle);
  const [formSubmitLabel, setFormSubmitLabel] = useState(data.formSubmitLabel);
  const [formSuccessMsg, setFormSuccessMsg] = useState(data.formSuccessMsg);
  const [formShowCompany, setFormShowCompany] = useState(data.formShowCompany);

  return (
    <div style={s.page}>
      <fetcher.Form method="post">
        <div style={s.layout}>
          {/* Left column — controls */}
          <div style={s.left}>

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
                    <input type="text" name="buttonLabel" value={btnLabel} onChange={(e) => setBtnLabel(e.target.value)} maxLength={80} style={s.input} />
                  </label>
                  <div style={s.row2}>
                    <label style={{ display: "grid", gap: 6 }}>
                      <span style={s.label}>Background colour</span>
                      <div style={s.colorRow}>
                        <input type="color" name="buttonBgColor" value={btnBg} onChange={(e) => setBtnBg(e.target.value)} style={{ width: 44, height: 36, borderRadius: 6, border: "1px solid #e3e7ed", cursor: "pointer", padding: 0 }} />
                        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{btnBg}</span>
                      </div>
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                      <span style={s.label}>Text colour</span>
                      <div style={s.colorRow}>
                        <input type="color" name="buttonTextColor" value={btnColor} onChange={(e) => setBtnColor(e.target.value)} style={{ width: 44, height: 36, borderRadius: 6, border: "1px solid #e3e7ed", cursor: "pointer", padding: 0 }} />
                        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{btnColor}</span>
                      </div>
                    </label>
                  </div>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={s.label}>Border radius (px)</span>
                    <input type="number" name="buttonBorderRadius" value={btnRadius} onChange={(e) => setBtnRadius(e.target.value)} min="0" max="50" style={{ ...s.input, maxWidth: 120 }} />
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
                    <input type="text" name="formTitle" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} maxLength={80} style={s.input} />
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={s.label}>Submit button label</span>
                    <input type="text" name="formSubmitLabel" value={formSubmitLabel} onChange={(e) => setFormSubmitLabel(e.target.value)} maxLength={80} style={s.input} />
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={s.label}>Success message</span>
                    <input type="text" name="formSuccessMsg" value={formSuccessMsg} onChange={(e) => setFormSuccessMsg(e.target.value)} maxLength={200} style={s.input} />
                  </label>
                  <label style={s.checkRow}>
                    <input type="checkbox" name="formShowCompany" checked={formShowCompany} onChange={(e) => setFormShowCompany(e.target.checked)} style={{ accentColor: "#4f46e5", width: 16, height: 16 }} />
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

          {/* Right column — live preview (Pro only) */}
          {isPro && (
            <LivePreview
              btn={{ label: btnLabel, bg: btnBg, color: btnColor, radius: btnRadius }}
              form={{ title: formTitle, submitLabel: formSubmitLabel, successMsg: formSuccessMsg, showCompany: formShowCompany }}
            />
          )}
        </div>
      </fetcher.Form>
    </div>
  );
}
