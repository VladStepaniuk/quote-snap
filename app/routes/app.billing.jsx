/**
 * Billing route — GET ?plan=starter|pro triggers subscription via GraphQL
 */
import { redirect, useLoaderData, useLocation, useFetcher } from "react-router";
import { useEffect } from "react";
import { authenticate } from "../shopify.server";

import { PLANS } from "../utils/plans";

const PLAN_CONFIG = {
  starter: { amount: "9.00", trialDays: 7 },
  pro: { amount: "29.00", trialDays: 7 },
};

async function getActiveSub(admin) {
  const resp = await admin.graphql(`
    query {
      currentAppInstallation {
        activeSubscriptions { name status id }
      }
    }
  `);
  const data = await resp.json();
  const subs = data?.data?.currentAppInstallation?.activeSubscriptions || [];
  return subs.find((s) => s.status === "ACTIVE") || null;
}

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");

  const returnUrl = `https://quote-snap-production.up.railway.app/billing-return?shop=${session.shop}`;

  // Upgrade — create subscription and redirect to Shopify confirmation
  if (plan && plan !== "free" && PLAN_CONFIG[plan]) {
    const config = PLAN_CONFIG[plan];
    const planName = PLANS[plan]?.name;
    const isTest = process.env.SHOPIFY_BILLING_TEST === "true";

    const resp = await admin.graphql(`
      mutation createSub($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int, $test: Boolean) {
        appSubscriptionCreate(
          name: $name
          lineItems: $lineItems
          returnUrl: $returnUrl
          trialDays: $trialDays
          test: $test
        ) {
          confirmationUrl
          appSubscription { id status }
          userErrors { field message }
        }
      }
    `, {
      variables: {
        name: planName,
        returnUrl,
        trialDays: config.trialDays,
        test: isTest,
        lineItems: [{
          plan: {
            appRecurringPricingDetails: {
              price: { amount: config.amount, currencyCode: "USD" },
              interval: "EVERY_30_DAYS",
            },
          },
        }],
      },
    });

    const data = await resp.json();
    const result = data?.data?.appSubscriptionCreate;
    console.log("billing result:", JSON.stringify(result));
    if (result?.confirmationUrl) {
      // Return URL as JSON — client will do window.top.location.href to escape iframe
      return Response.json({ confirmationUrl: result.confirmationUrl });
    }
  }

  // Downgrade to free — cancel active subscription
  if (plan === "free") {
    const active = await getActiveSub(admin);
    if (active) {
      await admin.graphql(`
        mutation cancel($id: ID!) {
          appSubscriptionCancel(id: $id) {
            appSubscription { id status }
          }
        }
      `, { variables: { id: active.id } });
    }
    return redirect("/app");
  }

  const active = await getActiveSub(admin);
  const currentPlan = active
    ? active.name.toLowerCase().includes("pro") ? "pro" : "starter"
    : "free";

  return Response.json({ plans: PLANS, currentPlan });
};

export { PLANS };

export default function BillingPage() {
  const { plans, currentPlan } = useLoaderData();
  const { search } = useLocation();
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.confirmationUrl) {
      window.top.location.href = fetcher.data.confirmationUrl;
    }
  }, [fetcher.data]);

  const planHref = (planKey) => {
    const params = new URLSearchParams(search);
    params.set("plan", planKey);
    return `/app/billing?${params.toString()}`;
  };

  const planList = [
    { key: "free", ...plans.free },
    { key: "starter", ...plans.starter },
    { key: "pro", ...plans.pro },
  ];

  return (
    <s-page heading="Billing" inlineSize="base">
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px", display: "grid", gap: 16 }}>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.95rem" }}>
          Choose the plan that fits your store. All paid plans include a 7-day free trial.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {planList.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            return (
              <div
                key={plan.key}
                style={{
                  border: isCurrent ? "2px solid #008060" : "1px solid #e3e7ed",
                  borderRadius: 12,
                  padding: "20px 18px",
                  background: isCurrent ? "#f0f8f5" : "#fff",
                  display: "grid",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#111827" }}>{plan.name}</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", marginTop: 4 }}>
                    {plan.amount === 0 ? "Free" : `$${plan.amount}/mo`}
                  </div>
                  {plan.trialDays && (
                    <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>
                      {plan.trialDays}-day free trial
                    </div>
                  )}
                </div>

                <ul style={{ margin: 0, padding: "0 0 0 16px", color: "#374151", fontSize: "0.875rem", lineHeight: 1.7 }}>
                  {plan.features.map((f) => <li key={f}>{f}</li>)}
                </ul>

                {isCurrent ? (
                  <div style={{ textAlign: "center", fontWeight: 600, color: "#008060", fontSize: "0.875rem" }}>
                    ✓ Current plan
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={fetcher.state !== "idle"}
                    onClick={() => fetcher.load(planHref(plan.key))}
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      background: plan.key === "free" ? "#f3f4f6" : "#008060",
                      color: plan.key === "free" ? "#374151" : "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: fetcher.state !== "idle" ? "wait" : "pointer",
                      opacity: fetcher.state !== "idle" ? 0.7 : 1,
                    }}
                  >
                    {fetcher.state !== "idle" ? "Loading…" : plan.key === "free" ? "Downgrade to Free" : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </s-page>
  );
}
