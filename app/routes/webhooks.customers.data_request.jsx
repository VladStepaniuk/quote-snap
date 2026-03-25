/**
 * GDPR Webhook: customers/data_request
 * Merchant's customer requested their data — we must respond within 30 days.
 * We log the request; merchants handle actual data export manually or via email.
 */
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, payload } = await authenticate.webhook(request);

  const customerId = payload?.customer?.id;
  const customerEmail = payload?.customer?.email;
  const ordersRequested = payload?.orders_requested ?? [];

  console.log(`[GDPR] customers/data_request shop=${shop} customerId=${customerId} email=${customerEmail} orders=${ordersRequested.length}`);

  // Store the request so the merchant can see it in their dashboard
  await db.gdprRequest.create({
    data: {
      shop,
      type: "DATA_REQUEST",
      customerId: String(customerId ?? ""),
      customerEmail: String(customerEmail ?? ""),
      payload: JSON.stringify(payload),
    },
  });

  return new Response();
};
