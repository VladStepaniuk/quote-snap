/**
 * Billing route — handles plan selection and redirects to Shopify confirmation.
 */
import { redirect, useLoaderData } from "react-router";
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

  return await billing.request({
    plan: selectedPlan.name,
    isTest: process.env.NODE_ENV !== "production",
    returnUrl: `${process.env.SHOPIFY_APP_URL}/app/billing`,
  });
};

export default function BillingPage() {
  const { plans, currentPlan } = useLoaderData();

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
                  border: isCurrent ? "2px solid #4f46e5" : "1px solid #e3e7ed",
                  borderRadius: 12,
                  padding: "20px 18px",
                  background: isCurrent ? "#eef2ff" : "#fff",
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
                  <div style={{ textAlign: "center", fontWeight: 600, color: "#4f46e5", fontSize: "0.875rem" }}>
                    Current plan
                  </div>
                ) : (
                  <form method="post">
                    <input type="hidden" name="plan" value={plan.key} />
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "10px 0",
                        background: plan.key === "free" ? "#f3f4f6" : "#4f46e5",
                        color: plan.key === "free" ? "#374151" : "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                      }}
                    >
                      {plan.key === "free" ? "Downgrade to Free" : `Upgrade to ${plan.name}`}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </s-page>
  );
}
