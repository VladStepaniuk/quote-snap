/**
 * Billing route — handles plan selection and redirects to Shopify confirmation.
 * Plans: free (default), starter ($9/mo), pro ($29/mo)
 */
import { redirect } from "react-router";
import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";

export const PLANS = {
  free: {
    name: "Free",
    amount: 0,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    features: ["1 hide-price rule", "Unlimited quote requests", "Basic quote inbox"],
  },
  starter: {
    name: "Starter",
    amount: 9,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 7,
    features: ["5 rules", "Priority email support", "CSV export"],
  },
  pro: {
    name: "Pro",
    amount: 29,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 7,
    features: ["Unlimited rules", "Email notifications", "Analytics", "Priority support"],
  },
};

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") || "free";

  // Check current subscription
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
  const { billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const plan = formData.get("plan");

  if (!plan || plan === "free") {
    // Cancel existing subscription if downgrading to free
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
