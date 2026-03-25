import { useLocation, Link } from "react-router";

const TABS = [
  { label: "Dashboard", to: "/app" },
  { label: "Billing", to: "/app/billing" },
  { label: "Settings", to: "/app/settings" },
];

export function AppTabs() {
  const { pathname } = useLocation();

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
          <Link
            key={to}
            to={to}
            style={{
              padding: "12px 20px",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? "#4f46e5" : "#6b7280",
              borderBottom: isActive ? "2px solid #4f46e5" : "2px solid transparent",
              marginBottom: -1,
              transition: "color 120ms ease",
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
