/**
 * Billing return route — called by Shopify after payment confirmation
 * No auth needed — just redirect into the embedded admin
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (shop) {
    const shopName = shop.replace(".myshopify.com", "");
    return Response.redirect(
      `https://admin.shopify.com/store/${shopName}/apps/quote-snap`,
      302
    );
  }
  // Fallback
  return Response.redirect("https://admin.shopify.com", 302);
};
