import { Outlet, useRouteError, NavLink } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

const navStyle = {
  display: "flex",
  gap: 4,
  padding: "8px 16px",
  borderBottom: "1px solid #e3e7ed",
  background: "#fff",
};

const linkStyle = {
  padding: "6px 14px",
  borderRadius: 8,
  fontSize: "0.875rem",
  fontWeight: 600,
  textDecoration: "none",
  color: "#6b7280",
};

const activeLinkStyle = {
  ...linkStyle,
  background: "#eef2ff",
  color: "#4f46e5",
};

export default function App() {
  return (
    <>
      <nav style={navStyle}>
        <NavLink to="/app" end style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/app/billing" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
          Billing
        </NavLink>
        <NavLink to="/app/settings" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
          Settings
        </NavLink>
      </nav>
      <Outlet />
    </>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
