/**
 * GDPR Webhook: customers/redact
 * Shopify instructs us to delete all data for a specific customer.
 */
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, payload } = await authenticate.webhook(request);

  const customerEmail = payload?.customer?.email;

  console.log(`[GDPR] customers/redact shop=${shop} email=${customerEmail}`);

  // Delete all quote requests from this customer
  if (customerEmail) {
    await db.quoteRequest.deleteMany({
      where: { shop, customerEmail },
    });
  }

  await db.gdprRequest.create({
    data: {
      shop,
      type: "CUSTOMER_REDACT",
      customerId: String(payload?.customer?.id ?? ""),
      customerEmail: String(customerEmail ?? ""),
      payload: JSON.stringify(payload),
    },
  });

  return new Response();
};
