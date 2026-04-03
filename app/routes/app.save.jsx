import { authenticate } from "../shopify.server";
import { handleQuoteDashboardAction } from "../models/quotes.server";

// Dedicated action endpoint — targeted by fetch() + Bearer token from app._index
export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const result = await handleQuoteDashboardAction({ shop: session.shop, formData, admin });
  return Response.json(result);
};

export const loader = async ({ request }) => {
  // Needed so React Router doesn't 404 on GET (e.g. prefetch)
  await authenticate.admin(request);
  return Response.json({ ok: true });
};
