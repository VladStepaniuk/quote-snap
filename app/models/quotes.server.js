import prisma from "../db.server";
import { evaluatePreview, normalizeCsv } from "../utils/quote-preview";
import { getMaxRules } from "../utils/plans.js";

const quoteSnapProductSnapshotQuery = `#graphql
  query QuoteSnapProductSnapshot {
    products(first: 250) {
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
    // Per-rule customization (null = use store default)
    buttonBgColor: getTrimmedString(formData, "buttonBgColor") || null,
    buttonTextColor: getTrimmedString(formData, "buttonTextColor") || null,
    buttonBorderRadius: getTrimmedString(formData, "buttonBorderRadius") || null,
    formTitle: getTrimmedString(formData, "ruleFormTitle") || null,
    formSuccessMsg: getTrimmedString(formData, "ruleFormSuccessMsg") || null,
    formShowCompany: formData.get("ruleFormShowCompany") === "on" ? true : formData.get("ruleFormShowCompany") === "off" ? false : null,
    formSubmitLabel: getTrimmedString(formData, "ruleFormSubmitLabel") || null,
    fontFamily: getTrimmedString(formData, "ruleFontFamily") || null,
    fontSize: getTrimmedString(formData, "ruleFontSize") || null,
    modalBgColor: getTrimmedString(formData, "modalBgColor") || null,
    modalTextColor: getTrimmedString(formData, "modalTextColor") || null,
    inputBgColor: getTrimmedString(formData, "inputBgColor") || null,
    inputTextColor: getTrimmedString(formData, "inputTextColor") || null,
    submitBgColor: getTrimmedString(formData, "submitBgColor") || null,
    submitTextColor: getTrimmedString(formData, "submitTextColor") || null,
  };
}

function validateRulePayload(payload) {
  if (!payload.name) return "Rule name is required.";
  if (payload.scope !== "all_products" && !payload.scopeValue)
    return "Scope value is required for product or collection rules.";
  if (payload.visibility === "tagged_customers" && !payload.customerTag)
    return "Customer tag is required for tagged-customer rules.";
  return null;
}

async function getProductSnapshot(admin) {
  const response = await admin.graphql(quoteSnapProductSnapshotQuery);
  const responseJson = await response.json();
  return responseJson.data?.products?.nodes ?? [];
}

async function getCollectionSnapshot(admin) {
  const resp = await admin.graphql(`#graphql
    query { collections(first: 250) { nodes { id title } } }
  `);
  const json = await resp.json();
  return json.data?.collections?.nodes ?? [];
}

async function getCurrentPlan(admin) {
  try {
    const resp = await admin.graphql(`
      query {
        currentAppInstallation {
          activeSubscriptions { name status }
        }
      }
    `);
    const data = await resp.json();
    const subs = data?.data?.currentAppInstallation?.activeSubscriptions || [];
    console.log("[getCurrentPlan] subs:", JSON.stringify(subs));
    const active = subs.find((s) => s.status === "ACTIVE" || s.status === "PENDING");
    if (!active) return "free";
    console.log("[getCurrentPlan] active:", active.name, active.status);
    return active.name.toLowerCase().includes("pro") ? "pro" : "starter";
  } catch (e) {
    console.error("[getCurrentPlan] error:", e?.message || e);
    return "free";
  }
}

async function saveRule(shop, formData, admin) {
  const ruleId = getTrimmedString(formData, "id");
  const payload = buildRulePayload(formData, shop);
  const validationError = validateRulePayload(payload);
  if (validationError) return { ok: false, error: validationError };

  // Enforce plan rule limits on create
  if (!ruleId) {
    const plan = await getCurrentPlan(admin);
    const maxRules = getMaxRules(plan);
    if (maxRules !== null) {
      const count = await prisma.quoteRule.count({ where: { shop } });
      if (count >= maxRules) {
        return {
          ok: false,
          error: `Your ${plan} plan allows up to ${maxRules} rule${maxRules === 1 ? "" : "s"}. Upgrade to add more.`,
        };
      }
    }
    await prisma.quoteRule.create({ data: payload });
    return { ok: true, message: "Rule saved." };
  }

  const existingRule = await prisma.quoteRule.findFirst({
    where: { id: ruleId, shop },
    select: { id: true },
  });
  if (!existingRule) return { ok: false, error: "Rule not found." };

  await prisma.quoteRule.update({ where: { id: ruleId }, data: payload });
  return { ok: true, message: "Rule saved." };
}

async function deleteRule(shop, formData) {
  const ruleId = getTrimmedString(formData, "id");
  await prisma.quoteRule.deleteMany({ where: { id: ruleId, shop } });
  return { ok: true, message: "Rule deleted." };
}

async function deleteRequest(shop, formData) {
  const id = getTrimmedString(formData, "id");
  await prisma.quoteRequest.deleteMany({ where: { id, shop } });
  return { ok: true, message: "Quote request deleted." };
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

export async function getAnalytics(shop) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [total, last30, byProduct] = await Promise.all([
    prisma.quoteRequest.count({ where: { shop } }),
    prisma.quoteRequest.count({ where: { shop, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.quoteRequest.groupBy({
      by: ["productId"],
      where: { shop },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
    }),
  ]);

  // Daily counts for last 14 days
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const recent = await prisma.quoteRequest.findMany({
    where: { shop, createdAt: { gte: fourteenDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const dailyMap = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = 0;
  }
  for (const r of recent) {
    const key = r.createdAt.toISOString().slice(0, 10);
    if (key in dailyMap) dailyMap[key]++;
  }

  return {
    total,
    last30,
    topProducts: byProduct.map((r) => ({ productId: r.productId, count: r._count.productId })),
    daily: Object.entries(dailyMap).map(([date, count]) => ({ date, count })),
  };
}

export async function getQuoteDashboardData({ shop, admin, billing }) {
  const [rules, requests, products, collections, currentPlan] = await Promise.all([
    prisma.quoteRule.findMany({ where: { shop }, orderBy: { createdAt: "asc" } }),
    prisma.quoteRequest.findMany({ where: { shop }, orderBy: { createdAt: "desc" }, take: 200 }),
    getProductSnapshot(admin),
    getCollectionSnapshot(admin),
    getCurrentPlan(admin),
  ]);

  const maxRules = getMaxRules(currentPlan);

  const newCount = requests.filter((r) => r.status === "new").length;
  return { shop, rules, requests, products, collections, currentPlan, maxRules, newCount, supportEmail: "support@quotesnap.app" };
}

export async function handleQuoteDashboardAction({ shop, formData, admin }) {
  const intent = getTrimmedString(formData, "intent");
  switch (intent) {
    case "save-rule": return saveRule(shop, formData, admin);
    case "delete-rule": return deleteRule(shop, formData);
    case "delete-request": return deleteRequest(shop, formData);
    case "seed-request": return seedRequest(shop, formData);
    case "preview": return previewRules(shop, formData);
    default: return { ok: false, error: "Unknown action." };
  }
}
