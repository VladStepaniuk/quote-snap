/**
 * App Proxy: GET /apps/quotesnap/rules
 * Returns the active QuoteRules for the current shop.
 * Called by the storefront JS — must be public (no auth), scoped by shop subdomain.
 */
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // Shopify injects the shop param on app proxy requests
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json({ error: "Missing shop" }, { status: 400 });
  }

  const rules = await prisma.quoteRule.findMany({
    where: { shop, enabled: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      scope: true,
      scopeValue: true,
      visibility: true,
      customerTag: true,
      hidePrice: true,
      replaceAddToCart: true,
      quoteButtonLabel: true,
      enabled: true,
    },
  });

  return Response.json(rules, {
    headers: {
      "Access-Control-Allow-Origin": `https://${shop}`,
      "Cache-Control": "no-store",
    },
  });
};
