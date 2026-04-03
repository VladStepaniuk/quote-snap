import { useEffect, useMemo, useRef, useState } from "react";
import { useLoaderData, useRevalidator, useLocation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  getQuoteDashboardData,
  handleQuoteDashboardAction,
  getAnalytics,
} from "../models/quotes.server";
import { defaultPreviewInput } from "../utils/quote-preview";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const [data, analytics] = await Promise.all([
    getQuoteDashboardData({ shop: session.shop, admin }),
    getAnalytics(session.shop),
  ]);
  const appUrl = process.env.SHOPIFY_APP_URL || "https://quote-snap-production.up.railway.app";
  return Response.json({ ...data, analytics, appUrl });
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const result = await handleQuoteDashboardAction({ shop: session.shop, formData, admin });
  return Response.json(result);
};

const s = {
  page: { padding: "20px 24px", maxWidth: 1100, margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#202223" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 },
  statCard: { background: "#fff", border: "1px solid #e1e3e5", borderRadius: 8, padding: "16px 20px" },
  statNum: { fontSize: "2rem", fontWeight: 800, color: "#202223", display: "block", lineHeight: 1.1 },
  statLabel: { fontSize: "0.78rem", fontWeight: 600, color: "#6d7175", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4, display: "block" },
  grid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, alignItems: "start" },
  card: { background: "#fff", border: "1px solid #e1e3e5", borderRadius: 8, padding: "20px", marginBottom: 14 },
  cardTitle: { fontSize: "0.9rem", fontWeight: 700, color: "#202223", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: "0.75rem", fontWeight: 600, color: "#6d7175", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 },
  input: { width: "100%", border: "1px solid #c9cccf", borderRadius: 4, padding: "7px 10px", fontSize: "0.875rem", fontFamily: "inherit", boxSizing: "border-box", color: "#202223" },
  select: { width: "100%", border: "1px solid #c9cccf", borderRadius: 4, padding: "7px 10px", fontSize: "0.875rem", fontFamily: "inherit", background: "#fff", boxSizing: "border-box", color: "#202223" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 },
  checkRow: { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 4, marginBottom: 12 },
  checkLabel: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: "#202223", cursor: "pointer" },
  btnPrimary: { background: "#008060", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" },
  btnSecondary: { background: "#fff", color: "#202223", border: "1px solid #c9cccf", borderRadius: 4, padding: "8px 16px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" },
  btnDanger: { background: "#fff", color: "#d82c0d", border: "1px solid #d82c0d", borderRadius: 4, padding: "8px 16px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" },
  btnRow: { display: "flex", gap: 8, marginTop: 12 },
  ruleCard: { border: "1px solid #e1e3e5", borderRadius: 6, padding: "16px", marginBottom: 10, background: "#f6f6f7" },
  ruleCardTitle: { fontSize: "0.8rem", fontWeight: 700, color: "#6d7175", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 },
  requestCard: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f2f3", paddingBottom: 10, marginBottom: 10 },
  requestInfo: { flex: 1 },
  requestName: { fontWeight: 600, fontSize: "0.875rem", color: "#202223" },
  requestMeta: { fontSize: "0.8rem", color: "#6d7175", marginTop: 2 },
  requestMsg: { fontSize: "0.8rem", color: "#202223", marginTop: 4, fontStyle: "italic" },
  emptyState: { color: "#8c9196", fontSize: "0.875rem", padding: "20px 0", textAlign: "center" },
  tag: { display: "inline-block", background: "#f2f7fe", color: "#1f5199", borderRadius: 4, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 },
  addBtn: { width: "100%", background: "#fff", border: "1px dashed #c9cccf", borderRadius: 6, padding: "10px", color: "#6d7175", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", marginTop: 4 },
  scrollList: { maxHeight: 380, overflowY: "auto", paddingRight: 4 },
  deleteQuoteBtn: { background: "none", border: "none", color: "#8c9196", cursor: "pointer", fontSize: "1rem", padding: "0 4px", lineHeight: 1, flexShrink: 0 },
  notice: { background: "#f0f8f5", border: "1px solid #b5e0d3", borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: "0.875rem", color: "#108043" },
  errorNotice: { background: "#fff4f4", border: "1px solid #fda29b", borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: "0.875rem", color: "#d82c0d" },
  barWrap: { display: "flex", alignItems: "stretch", gap: 3, height: 70, marginTop: 8 },
  bar: { flex: 1, background: "#008060", borderRadius: "2px 2px 0 0", minHeight: 2 },
  barLabel: { fontSize: "0.6rem", color: "#8c9196", textAlign: "center", marginTop: 2 },
  planBadge: { display: "inline-block", background: "#f2f7fe", color: "#1f5199", borderRadius: 4, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600, marginLeft: 6 },
};

const FONT_OPTIONS = [
  { label: "Theme default", value: "inherit" },
  { label: "System UI", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Georgia (serif)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
];

function RuleForm({ rule, onSave, onDelete, onCancel, isPro, products, collections }) {
  const [scope, setScope] = useState(rule.scope || "all_products");
  const [visibility, setVisibility] = useState(rule.visibility || "all_visitors");
  const [showCustom, setShowCustom] = useState(false);
  const [preview, setPreview] = useState({
    btnBg: rule.buttonBgColor || "#008060",
    btnColor: rule.buttonTextColor || "#ffffff",
    btnRadius: rule.buttonBorderRadius || "4",
    btnLabel: rule.quoteButtonLabel || "Request a Quote",
    btnFontSize: rule.buttonFontSize || rule.fontSize || "16",
    submitBg: rule.submitBgColor || rule.buttonBgColor || "#008060",
    submitColor: rule.submitTextColor || rule.buttonTextColor || "#ffffff",
    modalBg: rule.modalBgColor || "#ffffff",
    modalColor: rule.modalTextColor || "#111827",
    inputBg: rule.inputBgColor || "#ffffff",
    inputColor: rule.inputTextColor || "#111827",
    formFontSize: rule.formFontSize || rule.fontSize || "16",
    fontFamily: rule.fontFamily || "inherit",
    title: rule.formTitle || "Request a Quote",
    showCompany: rule.formShowCompany !== false,
  });
  const containerRef = useRef(null);

  const p = (key) => (val) => setPreview(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    const container = containerRef.current;
    if (!container) return;
    const fd = new FormData();
    container.querySelectorAll("input, select, textarea").forEach((el) => {
      if (!el.name) return;
      if (el.type === "checkbox") { if (el.checked) fd.set(el.name, "on"); }
      else fd.set(el.name, el.value);
    });
    fd.set("intent", "save-rule");
    fd.set("id", rule.id);
    onSave(fd);
  };

  const colorRow = (items) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 8, marginBottom: 8 }}>
      {items.map(({ label, name, val, key, defaultVal }) => (
        <label key={name} style={{ display: "grid", gap: 3 }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#6d7175", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="color" name={name} defaultValue={defaultVal}
              onChange={e => key && p(key)(e.target.value)}
              style={{ width: 36, height: 30, borderRadius: 5, border: "1px solid #d1d5db", cursor: "pointer", padding: 2, flexShrink: 0 }} />
            <span style={{ fontSize: "0.72rem", color: "#6d7175", fontFamily: "monospace" }}>{val}</span>
          </div>
        </label>
      ))}
    </div>
  );

  return (
    <div ref={containerRef} style={s.ruleCard}>
      <div style={s.ruleCardTitle}>{rule.id ? `Editing: ${rule.name || "Rule"}` : "New rule"}</div>
      <div style={s.row2}>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={s.label}>Rule name</span>
          <input style={s.input} name="name" defaultValue={rule.name} placeholder="e.g. Guests request quote" />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={s.label}>Button label</span>
          <input style={s.input} name="quoteButtonLabel" defaultValue={rule.quoteButtonLabel || "Request a Quote"} onChange={e => p("btnLabel")(e.target.value)} />
        </label>
      </div>

      {/* Live button preview */}
      <div style={{ background: "#f9fafb", border: "1px solid #e3e7ed", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>Button:</span>
        <button type="button" style={{ background: preview.btnBg, color: preview.btnColor, border: "none", borderRadius: `${preview.btnRadius}px`, padding: "10px 20px", fontWeight: 600, fontSize: `${preview.btnFontSize}px`, cursor: "default", fontFamily: preview.fontFamily !== "inherit" ? preview.fontFamily : undefined }}>
          {preview.btnLabel || "Request a Quote"}
        </button>
      </div>
      <div style={s.row3}>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={s.label}>Scope</span>
          <select style={s.select} name="scope" defaultValue={rule.scope || "all_products"} onChange={(e) => setScope(e.target.value)}>
            <option value="all_products">All products</option>
            <option value="product">Specific product</option>
            <option value="collection">Collection</option>
          </select>
        </label>
        {scope === "product" && (
          <label style={{ display: "grid", gap: 4 }}>
            <span style={s.label}>Product</span>
            <select style={s.select} name="scopeValue" defaultValue={rule.scopeValue || ""}>
              <option value="">— select product —</option>
              {(products || []).map((p) => (
                <option key={p.id} value={p.id.split("/").pop()}>{p.title}</option>
              ))}
            </select>
          </label>
        )}
        {scope === "collection" && (
          <label style={{ display: "grid", gap: 4 }}>
            <span style={s.label}>Collection</span>
            <select style={s.select} name="scopeValue" defaultValue={rule.scopeValue || ""}>
              <option value="">— select collection —</option>
              {(collections || []).map((c) => (
                <option key={c.id} value={c.id.split("/").pop()}>{c.title}</option>
              ))}
            </select>
          </label>
        )}
        {scope === "all_products" && (
          <input type="hidden" name="scopeValue" value="" />
        )}
        <label style={{ display: "grid", gap: 4 }}>
          <span style={s.label}>Audience</span>
          <select style={s.select} name="visibility" defaultValue={rule.visibility || "all_visitors"} onChange={e => setVisibility(e.target.value)}>
            <option value="all_visitors">All visitors</option>
            <option value="guests_only">Guests only</option>
            <option value="tagged_customers">Tagged customers</option>
          </select>
        </label>
        {visibility === "tagged_customers" && (
          <label style={{ display: "grid", gap: 4 }}>
            <span style={s.label}>Customer tag</span>
            <input style={s.input} name="customerTag" defaultValue={rule.customerTag || ""} placeholder="e.g. wholesale" />
          </label>
        )}
      </div>
      <div style={s.checkRow}>
        <label style={s.checkLabel}>
          <input type="checkbox" name="hidePrice" defaultChecked={rule.hidePrice !== false} />
          Hide price
        </label>
        <label style={s.checkLabel}>
          <input type="checkbox" name="replaceAddToCart" defaultChecked={rule.replaceAddToCart !== false} />
          Replace Add to Cart
        </label>
        <label style={s.checkLabel}>
          <input type="checkbox" name="enabled" defaultChecked={rule.enabled !== false} />
          Enabled
        </label>
      </div>

      {/* Per-rule customization — Pro only */}
      {isPro ? (
        <div style={{ marginTop: 12, borderTop: "1px solid #f1f2f3", paddingTop: 10 }}>
          <button type="button" onClick={() => setShowCustom(v => !v)} style={{ background: showCustom ? "#f0f9f6" : "none", border: "1px solid #008060", borderRadius: 6, cursor: "pointer", color: "#008060", fontWeight: 600, fontSize: "0.8rem", padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
            {showCustom ? "▾" : "▸"} Customize button &amp; form
          </button>
          {showCustom && (
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

              {/* Left: controls */}
              <div style={{ display: "grid", gap: 10 }}>

                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>🎨 Button</div>
                {colorRow([
                  { label: "Background", name: "buttonBgColor", val: preview.btnBg, key: "btnBg", defaultVal: rule.buttonBgColor || "#008060" },
                  { label: "Text", name: "buttonTextColor", val: preview.btnColor, key: "btnColor", defaultVal: rule.buttonTextColor || "#ffffff" },
                ])}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label style={{ display: "grid", gap: 3 }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#6d7175", textTransform: "uppercase" }}>Radius (px)</span>
                    <input type="number" name="buttonBorderRadius" defaultValue={rule.buttonBorderRadius || "4"} min="0" max="50" onChange={e => p("btnRadius")(e.target.value)} style={{ ...s.input, maxWidth: "100%" }} />
                  </label>
                  <label style={{ display: "grid", gap: 3 }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#6d7175", textTransform: "uppercase" }}>Font size (px)</span>
                    <input type="number" name="buttonFontSize" defaultValue={rule.buttonFontSize || rule.fontSize || "16"} min="12" max="32" onChange={e => p("btnFontSize")(e.target.value)} style={{ ...s.input, maxWidth: "100%" }} />
                  </label>
                </div>

                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4, marginBottom: 2 }}>📝 Form</div>
                {colorRow([
                  { label: "Modal bg", name: "modalBgColor", val: preview.modalBg, key: "modalBg", defaultVal: rule.modalBgColor || "#ffffff" },
                  { label: "Text colour", name: "modalTextColor", val: preview.modalColor, key: "modalColor", defaultVal: rule.modalTextColor || "#111827" },
                ])}
                {colorRow([
                  { label: "Input bg", name: "inputBgColor", val: preview.inputBg, key: "inputBg", defaultVal: rule.inputBgColor || "#ffffff" },
                  { label: "Input text", name: "inputTextColor", val: preview.inputColor, key: "inputColor", defaultVal: rule.inputTextColor || "#111827" },
                ])}
                {colorRow([
                  { label: "Submit bg", name: "submitBgColor", val: preview.submitBg, key: "submitBg", defaultVal: rule.submitBgColor || rule.buttonBgColor || "#008060" },
                  { label: "Submit text", name: "submitTextColor", val: preview.submitColor, key: "submitColor", defaultVal: rule.submitTextColor || rule.buttonTextColor || "#ffffff" },
                ])}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label style={{ display: "grid", gap: 3 }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#6d7175", textTransform: "uppercase" }}>Form font (px)</span>
                    <input type="number" name="formFontSize" defaultValue={rule.formFontSize || rule.fontSize || "16"} min="12" max="32" onChange={e => p("formFontSize")(e.target.value)} style={{ ...s.input, maxWidth: "100%" }} />
                  </label>
                  <label style={{ display: "grid", gap: 3 }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#6d7175", textTransform: "uppercase" }}>Font family</span>
                    <select name="ruleFontFamily" defaultValue={rule.fontFamily || "inherit"} onChange={e => p("fontFamily")(e.target.value)} style={s.select}>
                      {FONT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </label>
                </div>

                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4, marginBottom: 2 }}>✏️ Text</div>
                <label style={{ display: "grid", gap: 3 }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#6d7175", textTransform: "uppercase" }}>Form title</span>
                  <input style={s.input} name="ruleFormTitle" defaultValue={rule.formTitle || ""} placeholder="Request a Quote" maxLength={80} onChange={e => p("title")(e.target.value || "Request a Quote")} />
                </label>
                <label style={{ display: "grid", gap: 3 }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#6d7175", textTransform: "uppercase" }}>Success message</span>
                  <input style={s.input} name="ruleFormSuccessMsg" defaultValue={rule.formSuccessMsg || ""} placeholder="Thank you! We'll be in touch soon." maxLength={200} />
                </label>
                <label style={s.checkLabel}>
                  <input type="checkbox" name="ruleFormShowCompany" defaultChecked={rule.formShowCompany !== false} onChange={e => p("showCompany")(e.target.checked)} style={{ accentColor: "#008060", width: 15, height: 15 }} />
                  <span style={{ fontSize: "0.875rem", color: "#374151" }}>Show "Company" field</span>
                </label>
                <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Leave fields blank to use store defaults.</div>
              </div>

              {/* Right: live form preview */}
              <div style={{ position: "sticky", top: 16 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>👁 Live preview</div>
                <div style={{
                  background: preview.modalBg,
                  color: preview.modalColor,
                  borderRadius: 12,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                  padding: "20px",
                  fontFamily: preview.fontFamily !== "inherit" ? preview.fontFamily : "-apple-system, sans-serif",
                  fontSize: `${preview.formFontSize}px`,
                  border: "1px solid rgba(0,0,0,0.06)",
                }}>
                  <div style={{ fontWeight: 700, fontSize: "1.15em", marginBottom: 4, paddingRight: 24 }}>{preview.title}</div>
                  <div style={{ fontSize: "0.82em", opacity: 0.55, marginBottom: 16 }}>Product name here</div>
                  {[["Name", "Your name"], ["Email", "you@example.com"], ...(preview.showCompany ? [["Company (optional)", "ACME Ltd"]] : [])].map(([lbl, ph]) => (
                    <div key={lbl} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "0.82em", fontWeight: 600, marginBottom: 4, color: preview.modalColor }}>{lbl}</div>
                      <div style={{
                        background: preview.inputBg,
                        color: preview.inputColor,
                        border: `1.5px solid #d1d5db`,
                        borderRadius: 6,
                        padding: "8px 10px",
                        fontSize: "0.95em",
                        opacity: 0.7,
                      }}>{ph}</div>
                    </div>
                  ))}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: "0.82em", fontWeight: 600, marginBottom: 4, color: preview.modalColor }}>Message</div>
                    <div style={{
                      background: preview.inputBg,
                      color: preview.inputColor,
                      border: "1.5px solid #d1d5db",
                      borderRadius: 6,
                      padding: "8px 10px",
                      fontSize: "0.95em",
                      height: 56,
                      opacity: 0.7,
                    }}></div>
                  </div>
                  <button type="button" style={{
                    background: preview.submitBg,
                    color: preview.submitColor,
                    border: "none",
                    borderRadius: `${preview.btnRadius}px`,
                    padding: "10px 16px",
                    fontWeight: 600,
                    fontSize: "0.95em",
                    width: "100%",
                    cursor: "default",
                    fontFamily: "inherit",
                  }}>Submit Request</button>
                </div>
              </div>

            </div>
          )}
        </div>
      ) : null}

      <div style={s.btnRow}>
        <button style={s.btnPrimary} type="button" onClick={handleSave}>Save</button>
        {rule.id && <button style={s.btnDanger} type="button" onClick={() => onDelete(rule.id)}>Delete</button>}
        {!rule.id && <button style={s.btnSecondary} type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}

export default function Index() {
  const { shop, rules, requests, products, collections, currentPlan, maxRules, analytics } = useLoaderData();
  const { revalidate } = useRevalidator();
  const { search } = useLocation();
  const [previewInput, setPreviewInput] = useState(defaultPreviewInput);
  const [selectedProductId, setSelectedProductId] = useState(defaultPreviewInput.productId);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [showAddRule, setShowAddRule] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);

  const postAction = async (fd) => {
    const appUrl = "https://quote-snap-production.up.railway.app";
    const params = new URLSearchParams(search);
    try {
      // window.shopify is the App Bridge global injected by Shopify on every embedded page
      const token = await window.shopify.idToken();
      const resp = await fetch(`${appUrl}/app/save?${params.toString()}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await resp.json().catch(() => ({}));
      if (data.preview) {
        setPreviewResult(data.preview);
      } else if (data.message) {
        setStatusMessage(data.message);
        setStatusError(null);
        setShowAddRule(false);
        revalidate();
      } else if (data.error) {
        setStatusError(data.error);
        setStatusMessage(null);
      } else {
        revalidate();
      }
    } catch (err) {
      setStatusError("Request failed: " + (err?.message || err));
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      const fallback = products[0].id;
      setSelectedProductId((c) => c || fallback);
      setPreviewInput((c) => ({ ...c, productId: c.productId === defaultPreviewInput.productId ? fallback : c.productId }));
    }
  }, [products]);

  const productMap = useMemo(() => {
    const m = {};
    for (const p of products) {
      m[p.id] = p.title; // full GID
      m[p.id.split("/").pop()] = p.title; // numeric ID tail
    }
    return m;
  }, [products]);

  const productLabel = (id) => productMap[id] || id.split("/").pop();

  const saveRule = (fd) => {
    postAction(fd);
  };

  const deleteRule = (id) => {
    const fd = new FormData();
    fd.set("intent", "delete-rule");
    fd.set("id", id);
    postAction(fd);
  };

  const deleteRequest = (id) => {
    const fd = new FormData();
    fd.set("intent", "delete-request");
    fd.set("id", id);
    postAction(fd);
  };

  const runPreview = () => {
    const fd = new FormData();
    fd.set("intent", "preview");
    fd.set("productId", previewInput.productId);
    fd.set("collectionIds", previewInput.collectionIds);
    fd.set("tags", previewInput.tags);
    if (previewInput.loggedIn) fd.set("loggedIn", "on");
    postAction(fd);
  };

  const exportCsv = () => {
    // Open CSV export in new tab to trigger file download
    const search = typeof window !== "undefined" ? window.location.search : "";
    window.open(`/app/export-csv${search}`, "_blank");
  };

  const productOptions = products.map((p) => ({ value: p.id, label: p.title, collections: p.collections.nodes }));

  const maxBar = Math.max(1, ...analytics.daily.map((d) => d.count));

  const canAddRule = maxRules === null || rules.length < maxRules;

  return (
    <s-page heading="QuoteSnap" inlineSize="base">
      <div style={s.page}>
        {statusMessage && <div style={s.notice}>{statusMessage}</div>}
        {statusError && <div style={s.errorNotice}>{statusError}</div>}

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statNum}>{analytics.total}</span>
            <span style={s.statLabel}>Total quotes</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNum}>{analytics.last30}</span>
            <span style={s.statLabel}>Last 30 days</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNum}>{rules.length}{maxRules !== null ? <span style={{ fontSize: "1rem", color: "#6d7175" }}>/{maxRules}</span> : null}</span>
            <span style={s.statLabel}>Rules used<span style={s.planBadge}>{currentPlan}</span></span>
          </div>
        </div>

        <div style={s.grid}>
          {/* Left — Rules */}
          <div>
            {/* Analytics chart — Pro only */}
            {currentPlan === "pro" ? (
            <div style={s.card}>
              <div style={s.cardTitle}>Quote requests — last 14 days</div>
              <div style={s.barWrap}>
                {analytics.daily.map((d) => (
                  <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                      <div style={{ ...s.bar, width: "100%", height: `${d.count > 0 ? Math.max(6, Math.round((d.count / maxBar) * 56)) : 0}px`, background: d.count > 0 ? "#008060" : "#e4e5e7" }} title={`${d.date}: ${d.count}`} />
                    </div>
                    <div style={s.barLabel}>{d.date.slice(5)}</div>
                  </div>
                ))}
              </div>
              {analytics.topProducts.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ ...s.label, marginBottom: 8 }}>Top products</div>
                  {analytics.topProducts.map((p) => (
                    <div key={p.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", padding: "3px 0", borderBottom: "1px solid #f1f2f3" }}>
                      <span style={{ color: "#6d7175", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>{productLabel(p.productId)}</span>
                      <span style={{ fontWeight: 600, color: "#202223" }}>{p.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            ) : (
            <div style={{ ...s.card, textAlign: "center", padding: "24px", color: "#6d7175" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📊</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Analytics — Pro plan</div>
              <div style={{ fontSize: "0.85rem", marginBottom: 12 }}>Upgrade to Pro to see quote trends and top products.</div>
              <a href={`/app/billing${search}`} style={{ color: "#008060", fontWeight: 600, fontSize: "0.85rem" }}>Upgrade to Pro →</a>
            </div>
            )}

            {/* Rules */}
            <div style={s.card}>
              <div style={s.cardTitle}>
                <span>Visibility rules</span>
                <span style={s.tag}>{rules.length}{maxRules !== null ? `/${maxRules}` : ""} rule{rules.length !== 1 ? "s" : ""}</span>
              </div>

              {rules.length === 0 && !showAddRule && (
                <div style={s.emptyState}>No rules yet. Add your first rule to start hiding prices.</div>
              )}

              {rules.map((rule) => <RuleForm key={rule.id} rule={rule} onSave={saveRule} onDelete={deleteRule} onCancel={() => setShowAddRule(false)} isPro={currentPlan === "pro"} products={products} collections={collections} />)}

              {showAddRule ? (
                <RuleForm rule={{ id: "", name: "", quoteButtonLabel: "Request a Quote", scope: "all_products", scopeValue: "", visibility: "all_visitors", hidePrice: true, replaceAddToCart: true, enabled: true }} onSave={saveRule} onDelete={deleteRule} onCancel={() => setShowAddRule(false)} isPro={currentPlan === "pro"} products={products} collections={collections} />
              ) : canAddRule ? (
                <button style={s.addBtn} onClick={() => setShowAddRule(true)}>+ Add rule</button>
              ) : (
                <div style={{ ...s.errorNotice, marginTop: 8, textAlign: "center" }}>
                  Plan limit reached ({rules.length}/{maxRules} rules). <a href={`/app/billing${search}`} style={{ color: "#008060" }}>Upgrade</a> to add more.
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "grid", gap: 14 }}>
            {/* Quote requests */}
            <div style={s.card}>
              <div style={s.cardTitle}>
                <span>Recent quotes</span>
                {requests.length > 0 && currentPlan !== "free" && (
                  <button style={{ ...s.btnSecondary, padding: "4px 10px", fontSize: "0.78rem" }} type="button" onClick={exportCsv}>
                    ↓ CSV
                  </button>
                )}
              </div>
              {requests.length === 0 ? (
                <div style={s.emptyState}>No quote requests yet.</div>
              ) : (
                <div style={s.scrollList}>
                  {requests.map((r) => (
                    <div key={r.id} style={s.requestCard}>
                      <div style={s.requestInfo}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={s.requestName}>{r.customerName}</span>
                          <span style={{ fontSize: "0.75rem", color: "#6d7175" }}>{r.company || ""}</span>
                        </div>
                        <div style={s.requestMeta}>{r.customerEmail}</div>
                        <div style={s.requestMeta}>📦 {productLabel(r.productId)}</div>
                        {r.message && <div style={s.requestMsg}>"{r.message}"</div>}
                      </div>
                      <button style={s.deleteQuoteBtn} type="button" title="Delete" onClick={() => deleteRequest(r.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview */}
            <div style={s.card}>
              <div style={s.cardTitle}>Storefront preview</div>
              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 4 }}>
                  <span style={s.label}>Product</span>
                  <select style={s.select} value={selectedProductId} onChange={(e) => {
                    const v = e.target.value;
                    const p = productOptions.find((x) => x.value === v);
                    setSelectedProductId(v);
                    setPreviewInput((c) => ({ ...c, productId: v, collectionIds: (p?.collections || []).map((x) => x.id).join(", ") }));
                  }}>
                    {productOptions.length === 0 && <option value="">No products</option>}
                    {productOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </label>
                <label style={s.checkLabel}>
                  <input type="checkbox" checked={previewInput.loggedIn} onChange={(e) => setPreviewInput((c) => ({ ...c, loggedIn: e.target.checked }))} style={{ accentColor: "#008060" }} />
                  <span>Customer is logged in</span>
                </label>
                {previewInput.loggedIn && (
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={s.label}>Customer tags (comma-separated)</span>
                    <input style={s.input} placeholder="e.g. wholesale, vip" value={previewInput.tags} onChange={(e) => setPreviewInput((c) => ({ ...c, tags: e.target.value }))} />
                  </label>
                )}
                <button style={s.btnPrimary} type="button" onClick={runPreview}>Run preview</button>
                {previewResult && (() => {
                  const pv = previewResult;
                  const matched = !!pv.matchingRuleId;
                  return (
                    <div style={{ borderRadius: 8, overflow: "hidden", border: `1.5px solid ${matched ? "#008060" : "#e3e7ed"}`, fontSize: "0.82rem" }}>
                      {/* Header */}
                      <div style={{ background: matched ? "#008060" : "#f3f4f6", color: matched ? "#fff" : "#6b7280", padding: "8px 12px", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                        {matched ? "✅" : "⚪"} {pv.message}
                      </div>
                      <div style={{ padding: "12px", display: "grid", gap: 8, background: "#fff" }}>
                        {/* What the customer sees */}
                        <div style={{ fontWeight: 700, color: "#374151", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>What the customer sees</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          <div style={{ background: pv.priceVisible ? "#f0fdf4" : "#fef2f2", borderRadius: 6, padding: "6px 10px", display: "flex", gap: 6, alignItems: "center" }}>
                            <span>{pv.priceVisible ? "✅" : "🚫"}</span>
                            <span style={{ color: "#374151" }}>Price <b>{pv.priceVisible ? "visible" : "hidden"}</b></span>
                          </div>
                          <div style={{ background: pv.addToCartVisible ? "#f0fdf4" : "#fef2f2", borderRadius: 6, padding: "6px 10px", display: "flex", gap: 6, alignItems: "center" }}>
                            <span>{pv.addToCartVisible ? "✅" : "🚫"}</span>
                            <span style={{ color: "#374151" }}>Add to Cart <b>{pv.addToCartVisible ? "visible" : "hidden"}</b></span>
                          </div>
                          <div style={{ background: pv.quoteButtonVisible ? "#f0fdf4" : "#f3f4f6", borderRadius: 6, padding: "6px 10px", display: "flex", gap: 6, alignItems: "center", gridColumn: "1/-1" }}>
                            <span>{pv.quoteButtonVisible ? "✅" : "⚪"}</span>
                            <span style={{ color: "#374151" }}>Quote button <b>{pv.quoteButtonVisible ? `showing — "${pv.quoteButtonLabel || "Request a Quote"}"` : "not shown"}</b></span>
                          </div>
                        </div>
                        {/* Matched rule details */}
                        {matched && pv.rule && (
                          <>
                            <div style={{ fontWeight: 700, color: "#374151", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>Matched rule details</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                              <div style={{ color: "#6b7280" }}>Scope: <span style={{ color: "#374151", fontWeight: 600 }}>{pv.rule.scope === "all_products" ? "All products" : pv.rule.scope === "product" ? `Product: ${pv.rule.scopeValue}` : `Collection: ${pv.rule.scopeValue}`}</span></div>
                              <div style={{ color: "#6b7280" }}>Audience: <span style={{ color: "#374151", fontWeight: 600 }}>{pv.rule.visibility === "all_visitors" ? "All visitors" : pv.rule.visibility === "guests_only" ? "Guests only" : `Tagged: ${pv.rule.customerTag || "—"}`}</span></div>
                            </div>
                          </>
                        )}
                        {!matched && (
                          <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>No active rule matched this product + visitor combination. The storefront shows the normal price and Add to Cart button.</div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
