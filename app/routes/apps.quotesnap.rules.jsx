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
        // Per-rule customization
        buttonBgColor: true,
        buttonTextColor: true,
        buttonBorderRadius: true,
        formTitle: true,
        formSuccessMsg: true,
        formShowCompany: true,
        formSubmitLabel: true,
        fontFamily: true,
        fontSize: true,
        modalBgColor: true,
        modalTextColor: true,
        inputBgColor: true,
        inputTextColor: true,
        submitBgColor: true,
        submitTextColor: true,
        buttonFontSize: true,
        formFontSize: true,
      },
    }),
    prisma.shopSettings.findUnique({ where: { shop } }),
  ]);

  // Store-level defaults
  const storeDefaults = {
    buttonLabel: settings?.buttonLabel || "Request a Quote",
    buttonBgColor: settings?.buttonBgColor || "#008060",
    buttonTextColor: settings?.buttonTextColor || "#ffffff",
    buttonBorderRadius: settings?.buttonBorderRadius || "4",
    formTitle: settings?.formTitle || "Request a Quote",
    formSuccessMsg: settings?.formSuccessMsg || "Thank you! We'll be in touch soon.",
    formShowCompany: settings?.formShowCompany ?? true,
    formSubmitLabel: settings?.formSubmitLabel || "Submit Request",
    fontFamily: settings?.fontFamily || "inherit",
    fontSize: settings?.fontSize || "16",
  };

  // Merge per-rule overrides with store defaults
  const rulesWithCustomization = rules.map((rule) => ({
    ...rule,
    customization: {
      buttonLabel: rule.quoteButtonLabel || storeDefaults.buttonLabel,
      buttonBgColor: rule.buttonBgColor || storeDefaults.buttonBgColor,
      buttonTextColor: rule.buttonTextColor || storeDefaults.buttonTextColor,
      buttonBorderRadius: rule.buttonBorderRadius || storeDefaults.buttonBorderRadius,
      formTitle: rule.formTitle || storeDefaults.formTitle,
      formSuccessMsg: rule.formSuccessMsg || storeDefaults.formSuccessMsg,
      formShowCompany: rule.formShowCompany !== null && rule.formShowCompany !== undefined ? rule.formShowCompany : storeDefaults.formShowCompany,
      formSubmitLabel: rule.formSubmitLabel || storeDefaults.formSubmitLabel,
      fontFamily: rule.fontFamily || storeDefaults.fontFamily,
      fontSize: rule.fontSize || storeDefaults.fontSize,
      modalBgColor: rule.modalBgColor || "#ffffff",
      modalTextColor: rule.modalTextColor || "#111827",
      inputBgColor: rule.inputBgColor || "#ffffff",
      inputTextColor: rule.inputTextColor || "#111827",
      submitBgColor: rule.submitBgColor || rule.buttonBgColor || storeDefaults.buttonBgColor,
      submitTextColor: rule.submitTextColor || rule.buttonTextColor || storeDefaults.buttonTextColor,
      buttonFontSize: rule.buttonFontSize || storeDefaults.fontSize,
      formFontSize: rule.formFontSize || storeDefaults.fontSize,
    },
  }));

  return Response.json({ rules: rulesWithCustomization, customization: storeDefaults }, {
    headers: {
      "Access-Control-Allow-Origin": `https://${shop}`,
      "Cache-Control": "no-store",
    },
  });
};
