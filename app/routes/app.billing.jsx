/**
 * Billing route — GET ?plan=starter|pro triggers subscription via GraphQL
 */
import { redirect, useLoaderData, useLocation, useFetcher, useRevalidator } from "react-router";
import { useEffect, useState } from "react";
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
    return Response.json({ cancelled: true });
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
  const { revalidate } = useRevalidator();
  const [confirm, setConfirm] = useState(null); // { planKey, label, isDowngrade }

  useEffect(() => {
    if (fetcher.data?.confirmationUrl) {
      window.top.location.href = fetcher.data.confirmationUrl;
    }
    if (fetcher.data?.cancelled) {
      revalidate();
    }
  }, [fetcher.data]);

  const planHref = (planKey) => {
    const params = new URLSearchParams(search);
    params.set("plan", planKey);
    return `/app/billing?${params.toString()}`;
  };

  const planOrder = { free: 0, starter: 1, pro: 2 };
  const planList = [
    { key: "free", ...plans.free },
    { key: "starter", ...plans.starter },
    { key: "pro", ...plans.pro },
  ];

  const doAction = (planKey) => {
    setConfirm(null);
    fetcher.load(planHref(planKey));
  };

  const s = {
    btn: (variant) => ({
      width: "100%",
      padding: "10px 0",
      background: variant === "primary" ? "#008060" : variant === "danger" ? "#fff" : "#f3f4f6",
      color: variant === "primary" ? "#fff" : variant === "danger" ? "#b91c1c" : "#374151",
      border: variant === "danger" ? "1px solid #fca5a5" : "none",
      borderRadius: 8,
      fontWeight: 600,
      fontSize: "0.875rem",
      cursor: fetcher.state !== "idle" ? "wait" : "pointer",
      opacity: fetcher.state !== "idle" ? 0.7 : 1,
    }),
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    modal: {
      background: "#fff", borderRadius: 12, padding: 28, maxWidth: 400, width: "90%",
      display: "grid", gap: 16,
    },
  };

  return (
    <s-page heading="Billing" inlineSize="base">
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px", display: "grid", gap: 16 }}>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.95rem" }}>
          Choose the plan that fits your store. All paid plans include a 7-day free trial.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {planList.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            const isUpgrade = planOrder[plan.key] > planOrder[currentPlan];
            const isDowngrade = planOrder[plan.key] < planOrder[currentPlan];

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
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ textAlign: "center", fontWeight: 600, color: "#008060", fontSize: "0.875rem" }}>
                      ✓ Current plan
                    </div>
                    {plan.key !== "free" && (
                      <button type="button" disabled={fetcher.state !== "idle"}
                        onClick={() => setConfirm({ planKey: "free", label: "Cancel subscription", isDowngrade: true })}
                        style={{ ...s.btn("danger"), fontSize: "0.8rem", padding: "7px 0" }}>
                        Cancel subscription
                      </button>
                    )}
                  </div>
                ) : isUpgrade ? (
                  <button type="button" disabled={fetcher.state !== "idle"}
                    onClick={() => setConfirm({ planKey: plan.key, label: `Upgrade to ${plan.name}`, isDowngrade: false })}
                    style={s.btn("primary")}>
                    {fetcher.state !== "idle" ? "Loading…" : `Upgrade to ${plan.name}`}
                  </button>
                ) : isDowngrade && plan.key !== "free" ? (
                  <button type="button" disabled={fetcher.state !== "idle"}
                    onClick={() => setConfirm({ planKey: plan.key, label: `Downgrade to ${plan.name}`, isDowngrade: true })}
                    style={s.btn("danger")}>
                    {`Downgrade to ${plan.name}`}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {confirm && (
        <div style={s.overlay} onClick={() => setConfirm(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Confirm plan change</div>
            <p style={{ margin: 0, color: "#374151", fontSize: "0.9rem" }}>
              {confirm.planKey === "free"
                ? "Are you sure you want to cancel your subscription? You will lose access to paid features immediately."
                : confirm.isDowngrade
                ? `Are you sure you want to downgrade to ${planList.find(p => p.key === confirm.planKey)?.name}? Some features may no longer be available.`
                : `You will be redirected to Shopify to confirm your upgrade.`}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setConfirm(null)}
                style={{ padding: "8px 18px", border: "1px solid #e3e7ed", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 600 }}>
                Cancel
              </button>
              <button type="button" onClick={() => doAction(confirm.planKey)}
                style={{ padding: "8px 18px", border: "none", borderRadius: 7, background: confirm.isDowngrade ? "#b91c1c" : "#008060", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                {confirm.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </s-page>
  );
}
