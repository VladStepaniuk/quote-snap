import { useState } from "react";
import { useFetcher, useLoaderData, useRevalidator, useLocation } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const STATUS_COLORS = {
  new: { bg: "#fff3cd", color: "#856404", label: "New" },
  replied: { bg: "#d1ecf1", color: "#0c5460", label: "Replied" },
  closed: { bg: "#e2e3e5", color: "#383d41", label: "Closed" },
};

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  // Check plan
  let currentPlan = "free";
  try {
    const resp = await admin.graphql(`query { currentAppInstallation { activeSubscriptions { name status } } }`);
    const data = await resp.json();
    const subs = data?.data?.currentAppInstallation?.activeSubscriptions || [];
    const active = subs.find((s) => s.status === "ACTIVE" || s.status === "PENDING");
    if (active) currentPlan = active.name.toLowerCase().includes("pro") ? "pro" : "starter";
  } catch {}

  const requests = await prisma.quoteRequest.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const newCount = requests.filter((r) => r.status === "new").length;

  return Response.json({ requests, currentPlan, newCount });
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id");

  if (!id) return Response.json({ ok: false, error: "Missing id" });

  if (intent === "update-status") {
    const status = formData.get("status");
    await prisma.quoteRequest.update({ where: { id }, data: { status } });
    return Response.json({ ok: true });
  }

  if (intent === "save-notes") {
    const notes = formData.get("notes") || "";
    await prisma.quoteRequest.update({ where: { id }, data: { notes } });
    return Response.json({ ok: true });
  }

  if (intent === "delete") {
    await prisma.quoteRequest.delete({ where: { id } });
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false, error: "Unknown intent" });
};

export default function InboxPage() {
  const { requests, currentPlan, newCount } = useLoaderData();
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const { search } = useLocation();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const selectRequest = (r) => {
    setSelected(r);
    setNotes(r.notes || "");
  };

  const updateStatus = (id, status) => {
    fetcher.submit({ intent: "update-status", id, status }, { method: "POST" });
    if (selected?.id === id) setSelected({ ...selected, status });
    setTimeout(revalidate, 400);
  };

  const saveNotes = (id) => {
    fetcher.submit({ intent: "save-notes", id, notes }, { method: "POST" });
    setTimeout(revalidate, 400);
  };

  const deleteRequest = (id) => {
    fetcher.submit({ intent: "delete", id }, { method: "POST" });
    if (selected?.id === id) setSelected(null);
    setTimeout(revalidate, 400);
  };

  const s = {
    wrap: { padding: "20px", maxWidth: 960, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
    pageHeader: { marginBottom: 16 },
    title: { fontSize: "1.3rem", fontWeight: 700, color: "#202223", marginBottom: 4 },
    subtitle: { fontSize: "0.85rem", color: "#6d7175" },
    locked: { textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 10, border: "1px solid #e3e7ed" },
    lockedIcon: { fontSize: "2.5rem", marginBottom: 12 },
    lockedTitle: { fontWeight: 700, fontSize: "1.1rem", marginBottom: 8, color: "#202223" },
    lockedDesc: { color: "#6d7175", fontSize: "0.9rem", marginBottom: 16 },
    btnPrimary: { background: "#008060", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", textDecoration: "none", display: "inline-block" },
    filters: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
    filterBtn: (active) => ({ padding: "5px 14px", borderRadius: 20, border: "1px solid #e3e7ed", background: active ? "#008060" : "#fff", color: active ? "#fff" : "#6d7175", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }),
    layout: { display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16, alignItems: "start" },
    list: { display: "flex", flexDirection: "column", gap: 8 },
    card: (active) => ({ background: "#fff", borderRadius: 10, padding: "14px 16px", border: `1px solid ${active ? "#008060" : "#e3e7ed"}`, cursor: "pointer", transition: "border-color 0.15s" }),
    cardName: { fontWeight: 600, fontSize: "0.9rem", color: "#202223", marginBottom: 2 },
    cardMeta: { fontSize: "0.78rem", color: "#6d7175", marginBottom: 6 },
    cardMsg: { fontSize: "0.82rem", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    badge: (status) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700, background: STATUS_COLORS[status]?.bg || "#e2e3e5", color: STATUS_COLORS[status]?.color || "#383d41" }),
    detail: { background: "#fff", borderRadius: 10, border: "1px solid #e3e7ed", padding: "20px" },
    detailName: { fontWeight: 700, fontSize: "1.05rem", color: "#202223", marginBottom: 4 },
    detailMeta: { fontSize: "0.82rem", color: "#6d7175", marginBottom: 14 },
    detailMsg: { background: "#f9fafb", borderRadius: 8, padding: "12px", fontSize: "0.88rem", color: "#374151", marginBottom: 16, lineHeight: 1.5 },
    label: { fontSize: "0.78rem", fontWeight: 600, color: "#6d7175", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" },
    statusRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
    statusBtn: (active) => ({ padding: "5px 12px", borderRadius: 6, border: "1px solid #e3e7ed", background: active ? "#008060" : "#f4f6f8", color: active ? "#fff" : "#374151", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }),
    textarea: { width: "100%", padding: "10px", border: "1px solid #e3e7ed", borderRadius: 8, fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical", minHeight: 90, marginBottom: 10, boxSizing: "border-box" },
    btnRow: { display: "flex", gap: 8 },
    btnSave: { background: "#008060", color: "#fff", border: "none", borderRadius: 7, padding: "7px 16px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" },
    btnDelete: { background: "#fff", color: "#d72c0d", border: "1px solid #d72c0d", borderRadius: 7, padding: "7px 16px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" },
    empty: { textAlign: "center", padding: "40px 20px", color: "#6d7175", fontSize: "0.9rem" },
  };

  if (currentPlan === "free") {
    return (
      <div style={s.wrap}>
        <div style={s.locked}>
          <div style={s.lockedIcon}>📬</div>
          <div style={s.lockedTitle}>Premium Quote Inbox</div>
          <div style={s.lockedDesc}>Upgrade to Starter or Pro to access the full quote inbox with status tracking, reply notes, and filters.</div>
          <a href={`/app/billing${search}`} style={s.btnPrimary}>Upgrade plan →</a>
        </div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.pageHeader}>
        <div style={s.title}>Quote Inbox {newCount > 0 && <span style={{ background: "#d72c0d", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: "0.75rem", marginLeft: 6 }}>{newCount} new</span>}</div>
        <div style={s.subtitle}>{requests.length} total quote request{requests.length !== 1 ? "s" : ""}</div>
      </div>
      <div style={s.filters}>
        {["all", "new", "replied", "closed"].map((f) => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : STATUS_COLORS[f]?.label} {f !== "all" && `(${requests.filter((r) => r.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={s.empty}>No quotes in this filter.</div>
      ) : (
        <div style={s.layout}>
          {/* Left: list */}
          <div style={s.list}>
            {filtered.map((r) => (
              <div key={r.id} style={s.card(selected?.id === r.id)} onClick={() => selectRequest(r)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={s.cardName}>{r.customerName}</div>
                  <span style={s.badge(r.status)}>{STATUS_COLORS[r.status]?.label || r.status}</span>
                </div>
                <div style={s.cardMeta}>{r.customerEmail} · {new Date(r.createdAt).toLocaleDateString()}</div>
                <div style={s.cardMsg}>{r.message || "(no message)"}</div>
              </div>
            ))}
          </div>

          {/* Right: detail */}
          {selected ? (
            <div style={s.detail}>
              <div style={s.detailName}>{selected.customerName}</div>
              <div style={s.detailMeta}>{selected.customerEmail}{selected.company ? ` · ${selected.company}` : ""} · {new Date(selected.createdAt).toLocaleString()}</div>
              <div style={s.detailMsg}>{selected.message || "(no message)"}</div>

              <span style={s.label}>Status</span>
              <div style={s.statusRow}>
                {["new", "replied", "closed"].map((st) => (
                  <button key={st} style={s.statusBtn(selected.status === st)} onClick={() => updateStatus(selected.id, st)}>
                    {STATUS_COLORS[st].label}
                  </button>
                ))}
              </div>

              <span style={s.label}>Internal notes</span>
              <textarea
                style={s.textarea}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes, reply drafts, or follow-up reminders..."
              />

              <div style={s.btnRow}>
                <button style={s.btnSave} onClick={() => saveNotes(selected.id)}>Save notes</button>
                <button style={s.btnDelete} onClick={() => deleteRequest(selected.id)}>Delete</button>
              </div>
            </div>
          ) : (
            <div style={{ ...s.detail, display: "flex", alignItems: "center", justifyContent: "center", color: "#6d7175", fontSize: "0.9rem" }}>
              ← Select a quote to view details
            </div>
          )}
        </div>
      )}
    </div>
  );
}
