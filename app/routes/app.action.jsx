import { authenticate } from "../shopify.server";
import { handleQuoteDashboardAction } from "../models/quotes.server";

// Action-only route — no loader, no component.
// Targeted by useFetcher from app._index to avoid iframe navigation/routing bugs.
export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const result = await handleQuoteDashboardAction({ shop: session.shop, formData, admin });
  return Response.json(result);
};
