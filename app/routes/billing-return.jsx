/**
 * Billing return route — called by Shopify after payment confirmation
 * Shopify appends ?shop= itself, so we read that directly
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  // Shopify appends ?shop= to returnUrl automatically
  const shop = url.searchParams.get("shop");
  if (shop) {
    const shopName = shop.replace(".myshopify.com", "");
    return Response.redirect(
      `https://admin.shopify.com/store/${shopName}/apps/quotesnap`,
      302
    );
  }
  return Response.redirect("https://admin.shopify.com", 302);
};
