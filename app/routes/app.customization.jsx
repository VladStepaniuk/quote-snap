import { useState } from "react";
import { useLoaderData, useFetcher, useLocation } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const FONT_OPTIONS = [
  { label: "Theme default", value: "inherit" },
  { label: "System UI", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Georgia (serif)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
];

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const settings = await prisma.shopSettings.findUnique({ where: { shop: session.shop } });

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
    buttonLabel: settings?.buttonLabel || "Request a Quote",
    buttonBgColor: settings?.buttonBgColor || "#008060",
    buttonTextColor: settings?.buttonTextColor || "#ffffff",
    buttonBorderRadius: settings?.buttonBorderRadius || "4",
    formTitle: settings?.formTitle || "Request a Quote",
    formSuccessMsg: settings?.formSuccessMsg || "Thank you! We'll be in touch soon.",
    formShowCompany: settings?.formShowCompany ?? true,
    formSubmitLabel: settings?.formSubmitLabel || "Submit Request",
    fontFamily: settings?.fontFamily || "inherit",
    fontSize: settings?.fontSize || "16",
  });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const f = await request.formData();

  const data = {
    buttonLabel: String(f.get("buttonLabel") || "Request a Quote").trim().slice(0, 80),
    buttonBgColor: String(f.get("buttonBgColor") || "#008060").trim(),
    buttonTextColor: String(f.get("buttonTextColor") || "#ffffff").trim(),
    buttonBorderRadius: String(f.get("buttonBorderRadius") || "4").trim(),
    formTitle: String(f.get("formTitle") || "Request a Quote").trim().slice(0, 80),
    formSuccessMsg: String(f.get("formSuccessMsg") || "Thank you! We'll be in touch soon.").trim().slice(0, 200),
    formShowCompany: f.get("formShowCompany") === "on",
    formSubmitLabel: String(f.get("formSubmitLabel") || "Submit Request").trim().slice(0, 80),
    fontFamily: String(f.get("fontFamily") || "inherit").trim(),
    fontSize: String(f.get("fontSize") || "16").trim(),
  };

  await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    update: data,
    create: { shop: session.shop, ...data },
  });

  return Response.json({ ok: true });
};

const s = {
  page: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  layout: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start", padding: "20px", maxWidth: 1060 },
  left: { display: "grid", gap: 20 },
  card: { background: "#fff", border: "1px solid #e3e7ed", borderRadius: 12, padding: "24px 28px" },
  cardTitle: { fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 4 },
  cardDesc: { fontSize: "0.85rem", color: "#6b7280", marginBottom: 20 },
  grid: { display: "grid", gap: 16 },
  label: { fontSize: "0.78rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5, display: "block" },
  input: { border: "1px solid #e3e7ed", borderRadius: 8, padding: "9px 12px", fontSize: "0.875rem", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  select: { border: "1px solid #e3e7ed", borderRadius: 8, padding: "9px 12px", fontSize: "0.875rem", fontFamily: "inherit", width: "100%", boxSizing: "border-box", background: "#fff" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
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
  previewModal: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 10, padding: "16px", marginTop: 16 },
  previewField: { background: "#f9fafb", border: "1px solid #e3e7ed", borderRadius: 6, padding: "7px 10px", fontSize: "0.78rem", color: "#9ca3af", marginBottom: 8 },
};

function LivePreview({ btn, form, font }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const fontStyle = { fontFamily: font.family === "inherit" ? "-apple-system, sans-serif" : font.family, fontSize: font.size + "px" };

  return (
    <div style={s.previewWrap}>
      <div style={s.previewCard}>
        <div style={s.previewTitle}>Live preview</div>

        <div style={s.previewStorefront}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111", marginBottom: 6 }}>Example Product</div>
          <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: 12 }}>Price hidden · Quote only</div>
          <button type="button" onClick={() => setShowSuccess(false)} style={{
            background: btn.bg, color: btn.color,
            borderRadius: btn.radius + "px", border: "none",
            padding: "10px 20px", fontWeight: 600,
            cursor: "pointer", width: "100%",
            ...fontStyle,
          }}>
            {btn.label || "Request a Quote"}
          </button>
        </div>

        <div style={s.previewModal}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f0f0f0", ...fontStyle }}>
            {form.title || "Request a Quote"}
          </div>
          {showSuccess ? (
            <div style={{ textAlign: "center", padding: "12px 8px", color: "#15803d", fontWeight: 600, ...fontStyle }}>
              ✓ {form.successMsg || "Thank you! We'll be in touch soon."}
            </div>
          ) : (
            <>
              <div style={{ ...s.previewField, ...fontStyle }}>Your name</div>
              <div style={{ ...s.previewField, ...fontStyle }}>Email address</div>
              {form.showCompany && <div style={{ ...s.previewField, ...fontStyle }}>Company (optional)</div>}
              <div style={{ ...s.previewField, ...fontStyle }}>Message (optional)</div>
              <button type="button" onClick={() => setShowSuccess(true)} style={{
                background: btn.bg, color: btn.color,
                borderRadius: btn.radius + "px", border: "none",
                padding: "8px 16px", fontWeight: 600,
                cursor: "pointer", width: "100%", marginTop: 4,
                ...fontStyle,
              }}>
                {form.submitLabel || "Submit Request"}
              </button>
            </>
          )}
        </div>
        <div style={{ fontSize: "0.72rem", color: "#9ca3af", textAlign: "center", marginTop: 8 }}>
          Click submit to preview success state
        </div>
      </div>
    </div>
  );
}

export default function CustomizationPage() {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const { search } = useLocation();
  const billingUrl = `/app/billing${search}`;
  const saved = fetcher.data?.ok;
  const isPro = data.currentPlan === "pro";

  const [btnLabel, setBtnLabel] = useState(data.buttonLabel);
  const [btnBg, setBtnBg] = useState(data.buttonBgColor);
  const [btnColor, setBtnColor] = useState(data.buttonTextColor);
  const [btnRadius, setBtnRadius] = useState(data.buttonBorderRadius);
  const [formTitle, setFormTitle] = useState(data.formTitle);
  const [formSubmitLabel, setFormSubmitLabel] = useState(data.formSubmitLabel);
  const [formSuccessMsg, setFormSuccessMsg] = useState(data.formSuccessMsg);
  const [formShowCompany, setFormShowCompany] = useState(data.formShowCompany);
  const [fontFamily, setFontFamily] = useState(data.fontFamily);
  const [fontSize, setFontSize] = useState(data.fontSize);

  const LockedCard = ({ icon, title, desc }) => (
    <div style={s.locked}>
      <div style={s.lockedIcon}>{icon}</div>
      <div style={s.lockedTitle}>{title} — Pro plan</div>
      <div style={s.lockedDesc}>{desc}</div>
      <a href={billingUrl} style={s.upgradeLink}>Upgrade to Pro →</a>
    </div>
  );

  return (
    <div style={s.page}>
      <fetcher.Form method="post">
        <div style={s.layout}>
          <div style={s.left}>

            {/* Button */}
            {isPro ? (
              <div style={s.card}>
                <div style={s.cardTitle}>Button</div>
                <div style={s.cardDesc}>Customize the "Request a Quote" button on your storefront.</div>
                <div style={s.grid}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={s.label}>Button label</span>
                    <input type="text" name="buttonLabel" value={btnLabel} onChange={(e) => setBtnLabel(e.target.value)} maxLength={80} style={s.input} />
                  </label>
                  <div style={s.row2}>
                    <label style={{ display: "grid", gap: 6 }}>
                      <span style={s.label}>Background colour</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input type="color" name="buttonBgColor" value={btnBg} onChange={(e) => setBtnBg(e.target.value)} style={{ width: 44, height: 36, borderRadius: 6, border: "1px solid #e3e7ed", cursor: "pointer", padding: 0 }} />
                        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{btnBg}</span>
                      </div>
                    </label>
                    <label style={{ display: "grid", gap: 6 }}>
                      <span style={s.label}>Text colour</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            ) : <LockedCard icon="🎨" title="Button customization" desc="Customize button colours, label, and border radius to match your brand." />}

            {/* Form */}
            {isPro ? (
              <div style={s.card}>
                <div style={s.cardTitle}>Quote form</div>
                <div style={s.cardDesc}>Customize the modal shown to customers when they click your button.</div>
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
            ) : <LockedCard icon="📝" title="Form customization" desc="Set a custom modal title, success message, submit label, and toggle the company field." />}

            {/* Typography */}
            {isPro ? (
              <div style={s.card}>
                <div style={s.cardTitle}>Typography</div>
                <div style={s.cardDesc}>Set the font family and size for the button and modal. "Theme default" inherits your store's font.</div>
                <div style={s.grid}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={s.label}>Font family</span>
                    <select name="fontFamily" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} style={s.select}>
                      {FONT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={s.label}>Font size (px)</span>
                    <input type="number" name="fontSize" value={fontSize} onChange={(e) => setFontSize(e.target.value)} min="12" max="24" style={{ ...s.input, maxWidth: 120 }} />
                  </label>
                </div>
              </div>
            ) : <LockedCard icon="✏️" title="Typography" desc="Set a custom font family and size for your button and quote form." />}

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {isPro && <button type="submit" style={s.btnSave}>Save customization</button>}
              {saved && <span style={s.savedMsg}>✓ Saved</span>}
            </div>
          </div>

          {/* Live preview — Pro only */}
          {isPro && (
            <LivePreview
              btn={{ label: btnLabel, bg: btnBg, color: btnColor, radius: btnRadius }}
              form={{ title: formTitle, submitLabel: formSubmitLabel, successMsg: formSuccessMsg, showCompany: formShowCompany }}
              font={{ family: fontFamily, size: fontSize }}
            />
          )}
        </div>
      </fetcher.Form>
    </div>
  );
}
