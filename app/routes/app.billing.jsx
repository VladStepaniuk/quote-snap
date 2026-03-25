/**
 * Billing route — handles plan selection and redirects to Shopify confirmation.
 */
import { redirect } from "react-router";
import { PLANS } from "../utils/plans";

export { PLANS };

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const { billing } = await authenticate.admin(request);

  const { hasActivePayment, appSubscriptions } = await billing.check({
    plans: [PLANS.starter.name, PLANS.pro.name],
    isTest: process.env.NODE_ENV !== "production",
  });

  return Response.json({
    plans: PLANS,
    currentPlan: hasActivePayment
      ? appSubscriptions[0]?.name?.toLowerCase() || "free"
      : "free",
  });
};

export const action = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const { billing } = await authenticate.admin(request);

  const formData = await request.formData();
  const plan = formData.get("plan");

  if (!plan || plan === "free") {
    const { hasActivePayment, appSubscriptions } = await billing.check({
      plans: [PLANS.starter.name, PLANS.pro.name],
      isTest: process.env.NODE_ENV !== "production",
    });

    if (hasActivePayment) {
      await billing.cancel({
        subscriptionId: appSubscriptions[0].id,
        isTest: process.env.NODE_ENV !== "production",
        prorate: true,
      });
    }

    return redirect("/app");
  }

  const selectedPlan = PLANS[plan];
  if (!selectedPlan) return Response.json({ error: "Invalid plan" }, { status: 400 });

  await billing.request({
    plan: selectedPlan.name,
    isTest: process.env.NODE_ENV !== "production",
    returnUrl: `${process.env.SHOPIFY_APP_URL}/app/billing`,
  });
};
