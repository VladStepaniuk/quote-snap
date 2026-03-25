/**
 * GDPR Webhook: shop/redact
 * Shopify instructs us to delete ALL data for a shop (48h after uninstall).
 */
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop } = await authenticate.webhook(request);

  console.log(`[GDPR] shop/redact shop=${shop}`);

  // Delete everything for this shop
  await db.$transaction([
    db.quoteRequest.deleteMany({ where: { shop } }),
    db.quoteRule.deleteMany({ where: { shop } }),
    db.gdprRequest.deleteMany({ where: { shop } }),
    db.session.deleteMany({ where: { shop } }),
  ]);

  return new Response();
};
