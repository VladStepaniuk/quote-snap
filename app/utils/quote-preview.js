export const defaultPreviewInput = {
  productId: "gid://shopify/Product/1",
  collectionIds: "",
  loggedIn: false,
  tags: "",
};

export function normalizeCsv(value = "") {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function scopePriority(rule) {
  if (rule.scope === "product") {
    return 3;
  }

  if (rule.scope === "collection") {
    return 2;
  }

  return 1;
}

function matchesScope(rule, productId, collectionIds) {
  if (rule.scope === "all_products") {
    return true;
  }

  const scopeValue = (rule.scopeValue || "").trim();

  if (rule.scope === "product") {
    return scopeValue === productId.trim();
  }

  return collectionIds.includes(scopeValue);
}

function matchesVisibility(rule, loggedIn, tags) {
  if (rule.visibility === "all_visitors") {
    return true;
  }

  if (rule.visibility === "guests_only") {
    return !loggedIn;
  }

  const customerTag = (rule.customerTag || "").trim().toLowerCase();

  return customerTag
    ? tags.some((tag) => tag.toLowerCase() === customerTag)
    : false;
}

export function evaluatePreview(rules, payload) {
  const matchingRule = [...rules]
    .filter((rule) => rule.enabled)
    .sort((left, right) => scopePriority(right) - scopePriority(left))
    .find(
      (rule) =>
        matchesScope(rule, payload.productId, payload.collectionIds) &&
        matchesVisibility(rule, payload.loggedIn, payload.tags),
    );

  if (!matchingRule) {
    return {
      priceVisible: true,
      addToCartVisible: true,
      quoteButtonVisible: false,
      quoteButtonLabel: null,
      matchingRuleId: null,
      message: "No matching rule. Storefront behaves normally.",
    };
  }

  return {
    priceVisible: !matchingRule.hidePrice,
    addToCartVisible: !matchingRule.replaceAddToCart,
    quoteButtonVisible: matchingRule.replaceAddToCart || matchingRule.hidePrice,
    quoteButtonLabel: matchingRule.quoteButtonLabel,
    matchingRuleId: matchingRule.id,
    message: `Rule "${matchingRule.name}" matched for this shopper and product.`,
  };
}