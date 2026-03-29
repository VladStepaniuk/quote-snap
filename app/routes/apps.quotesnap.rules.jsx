import prisma from "../db.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json({ error: "Missing shop" }, { status: 400 });
  }

  const [rules, settings] = await Promise.all([
    prisma.quoteRule.findMany({
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
    }),
    prisma.shopSettings.findUnique({ where: { shop } }),
  ]);

  const customization = {
    buttonLabel: settings?.buttonLabel || "Request a Quote",
    buttonBgColor: settings?.buttonBgColor || "#008060",
    buttonTextColor: settings?.buttonTextColor || "#ffffff",
    buttonBorderRadius: settings?.buttonBorderRadius || "4",
    formTitle: settings?.formTitle || "Request a Quote",
    formSuccessMsg: settings?.formSuccessMsg || "Thank you! We'll be in touch soon.",
    formShowCompany: settings?.formShowCompany ?? true,
    formSubmitLabel: settings?.formSubmitLabel || "Submit Request",
  };

  return Response.json({ rules, customization }, {
    headers: {
      "Access-Control-Allow-Origin": `https://${shop}`,
      "Cache-Control": "no-store",
    },
  });
};
