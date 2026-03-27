/**
 * Billing return route — called by Shopify after payment confirmation
 * Redirects back into the embedded admin app
 */
import { redirect } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopName = session.shop.replace(".myshopify.com", "");
  // Redirect into embedded admin context
  return redirect(
    `https://admin.shopify.com/store/${shopName}/apps/quote-snap`
  );
};
