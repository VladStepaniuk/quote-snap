import { Outlet, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function App() {
  return (
    <>
      <ui-nav-menu>
        <a href="/app" rel="home">Dashboard</a>
        <a href="/app/billing">Billing</a>
        <a href="/app/settings">Settings</a>
      </ui-nav-menu>
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
