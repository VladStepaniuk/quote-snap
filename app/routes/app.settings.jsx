import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await prisma.shopSettings.findUnique({ where: { shop: session.shop } });
  return Response.json({
    notificationEmail: settings?.notificationEmail || "",
    emailEnabled: settings?.emailEnabled ?? true,
  });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const notificationEmail = String(formData.get("notificationEmail") || "").trim();
  const emailEnabled = formData.get("emailEnabled") === "on";
  await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    update: { notificationEmail, emailEnabled },
    create: { shop: session.shop, notificationEmail, emailEnabled },
  });
  return Response.json({ ok: true });
};

const s = {
  wrap: { padding: "20px", maxWidth: 600 },
  card: { background: "#fff", border: "1px solid #e3e7ed", borderRadius: 12, padding: "24px 28px" },
  cardTitle: { fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 4 },
  cardDesc: { fontSize: "0.85rem", color: "#6b7280", marginBottom: 20 },
  grid: { display: "grid", gap: 16 },
  label: { fontSize: "0.78rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5, display: "block" },
  input: { border: "1px solid #e3e7ed", borderRadius: 8, padding: "9px 12px", fontSize: "0.875rem", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  checkRow: { display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" },
  btnSave: { background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" },
  savedMsg: { color: "#15803d", fontSize: "0.875rem", fontWeight: 600 },
};

export default function SettingsPage() {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const saved = fetcher.data?.ok;

  return (
    <fetcher.Form method="post">
      <div style={s.wrap}>
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

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
          <button type="submit" style={s.btnSave}>Save settings</button>
          {saved && <span style={s.savedMsg}>✓ Saved</span>}
        </div>
      </div>
    </fetcher.Form>
  );
}
