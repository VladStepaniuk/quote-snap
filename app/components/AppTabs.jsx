import { useLocation } from "react-router";

const TABS = [
  { label: "Dashboard", to: "/app" },
  { label: "Inbox", to: "/app/inbox" },
  { label: "Customization", to: "/app/customization" },
  { label: "Billing", to: "/app/billing" },
  { label: "Settings", to: "/app/settings" },
];

export function AppTabs({ newCount }) {
  const { pathname, search } = useLocation();

  return (
    <div style={{
      display: "flex",
      gap: 0,
      borderBottom: "1px solid #e3e7ed",
      marginBottom: 20,
      background: "#fff",
      paddingLeft: 4,
    }}>
      {TABS.map(({ label, to }) => {
        const isActive = to === "/app" ? pathname === "/app" : pathname.startsWith(to);
        return (
          <a
            key={to}
            href={`${to}${search}`}
            style={{
              padding: "12px 20px",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? "#4f46e5" : "#6b7280",
              borderBottom: isActive ? "2px solid #4f46e5" : "2px solid transparent",
              marginBottom: -1,
              transition: "color 120ms ease",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {label}
            {label === "Inbox" && newCount > 0 && (
              <span style={{ background: "#d72c0d", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: "0.72rem", fontWeight: 700 }}>
                {newCount}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}
