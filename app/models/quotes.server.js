import prisma from "../db.server";
import { evaluatePreview, normalizeCsv } from "../utils/quote-preview";

const quoteSnapProductSnapshotQuery = `#graphql
  query QuoteSnapProductSnapshot {
    products(first: 12) {
      nodes {
        id
        title
        handle
        collections(first: 5) {
          nodes {
            id
            title
          }
        }
      }
    }
  }
`;

function getTrimmedString(formData, key, fallback = "") {
  return String(formData.get(key) || fallback).trim();
}

function buildRulePayload(formData, shop) {
  return {
    shop,
    name: getTrimmedString(formData, "name"),
    scope: getTrimmedString(formData, "scope", "all_products"),
    scopeValue: getTrimmedString(formData, "scopeValue"),
    visibility: getTrimmedString(formData, "visibility", "guests_only"),
    customerTag: getTrimmedString(formData, "customerTag"),
    hidePrice: formData.get("hidePrice") === "on",
    replaceAddToCart: formData.get("replaceAddToCart") === "on",
    quoteButtonLabel:
      getTrimmedString(formData, "quoteButtonLabel") || "Request a Quote",
    enabled: formData.get("enabled") === "on",
  };
}

function validateRulePayload(payload) {
  if (!payload.name) {
    return "Rule name is required.";
  }

  if (payload.scope !== "all_products" && !payload.scopeValue) {
    return "Scope value is required for product or collection rules.";
  }

  if (payload.visibility === "tagged_customers" && !payload.customerTag) {
    return "Customer tag is required for tagged-customer rules.";
  }

  return null;
}

async function getProductSnapshot(admin) {
  const response = await admin.graphql(quoteSnapProductSnapshotQuery);
  const responseJson = await response.json();

  return responseJson.data?.products?.nodes ?? [];
}

async function saveRule(shop, formData) {
  const ruleId = getTrimmedString(formData, "id");
  const payload = buildRulePayload(formData, shop);
  const validationError = validateRulePayload(payload);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  if (!ruleId) {
    await prisma.quoteRule.create({ data: payload });
    return { ok: true, message: "Rule saved." };
  }

  const existingRule = await prisma.quoteRule.findFirst({
    where: { id: ruleId, shop },
    select: { id: true },
  });

  if (!existingRule) {
    return { ok: false, error: "Rule not found." };
  }

  await prisma.quoteRule.update({
    where: { id: ruleId },
    data: payload,
  });

  return { ok: true, message: "Rule saved." };
}

async function deleteRule(shop, formData) {
  const ruleId = getTrimmedString(formData, "id");

  await prisma.quoteRule.deleteMany({
    where: { id: ruleId, shop },
  });

  return { ok: true, message: "Rule deleted." };
}

async function seedRequest(shop, formData) {
  await prisma.quoteRequest.create({
    data: {
      shop,
      customerName: "Alex Buyer",
      customerEmail: "alex@example.com",
      productId: getTrimmedString(formData, "productId", "gid://shopify/Product/1"),
      company: "Bulk Co",
      message: "Need wholesale pricing for 250 units.",
    },
  });

  return { ok: true, message: "Sample quote request created." };
}

async function previewRules(shop, formData) {
  const rules = await prisma.quoteRule.findMany({ where: { shop } });
  const preview = evaluatePreview(rules, {
    productId: getTrimmedString(formData, "productId"),
    collectionIds: normalizeCsv(getTrimmedString(formData, "collectionIds")),
    loggedIn: formData.get("loggedIn") === "on",
    tags: normalizeCsv(getTrimmedString(formData, "tags")),
  });

  return { ok: true, preview, message: "Preview updated." };
}

export async function getQuoteDashboardData({ shop, admin }) {
  const [rules, requests, products] = await Promise.all([
    prisma.quoteRule.findMany({
      where: { shop },
      orderBy: [{ createdAt: "asc" }],
    }),
    prisma.quoteRequest.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    getProductSnapshot(admin),
  ]);

  return {
    shop,
    rules,
    requests,
    products,
    supportEmail: "support@quotesnap.app",
  };
}

export async function handleQuoteDashboardAction({ shop, formData }) {
  const intent = getTrimmedString(formData, "intent");

  switch (intent) {
    case "save-rule":
      return saveRule(shop, formData);
    case "delete-rule":
      return deleteRule(shop, formData);
    case "seed-request":
      return seedRequest(shop, formData);
    case "preview":
      return previewRules(shop, formData);
    default:
      return { ok: false, error: "Unknown action." };
  }
}