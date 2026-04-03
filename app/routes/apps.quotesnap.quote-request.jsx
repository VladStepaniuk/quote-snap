/**
 * App Proxy: POST /apps/quotesnap/quote-request
 * Accepts a quote request from the storefront form and stores it in the DB.
 * Public endpoint — validated by required fields + shop param from Shopify proxy.
 */
import prisma from "../db.server";
import { sendQuoteNotification } from "../utils/email.server";

const MAX_LENGTH = 2000;

function sanitize(value, max = 255) {
  return String(value || "").trim().slice(0, max);
}

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json({ error: "Missing shop" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const customerName = sanitize(body.customerName);
  const customerEmail = sanitize(body.customerEmail);
  const productId = sanitize(body.productId);

  if (!customerName || !customerEmail || !productId) {
    return Response.json({ error: "Name, email, and product are required." }, { status: 422 });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return Response.json({ error: "Invalid email address." }, { status: 422 });
  }

  const record = await prisma.quoteRequest.create({
    data: {
      shop,
      customerName,
      customerEmail,
      productId,
      company: sanitize(body.company),
      message: sanitize(body.message, MAX_LENGTH),
      status: "new",
    },
  });

  // Fire-and-forget email notification
  const settings = await prisma.shopSettings.findUnique({ where: { shop } });
  if (settings?.emailEnabled && settings?.notificationEmail) {
    sendQuoteNotification({
      to: settings.notificationEmail,
      shop,
      customerName,
      customerEmail,
      company: sanitize(body.company),
      productId,
      message: sanitize(body.message, MAX_LENGTH),
    });
  }

  return Response.json({ ok: true, id: record.id }, {
    status: 201,
    headers: {
      "Access-Control-Allow-Origin": `https://${shop}`,
      "Cache-Control": "no-store",
    },
  });
};

// Handle CORS preflight
export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop") || "*";
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": `https://${shop}`,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  return Response.json({ error: "Not found" }, { status: 404 });
};
