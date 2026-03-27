/**
 * Billing plans definition — shared between route and UI components.
 * NO server imports here.
 */
export const PLANS = {
  free: {
    name: "Free",
    amount: 0,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    maxRules: 1,
    features: [
      "1 hide-price rule",
      "Unlimited quote requests",
      "Basic quote inbox",
    ],
  },
  starter: {
    name: "Starter",
    amount: 9,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 7,
    maxRules: 5,
    features: ["5 rules", "CSV export", "Priority email support"],
  },
  pro: {
    name: "Pro",
    amount: 29,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 7,
    maxRules: null, // unlimited
    features: [
      "Unlimited rules",
      "Email notifications",
      "Analytics",
      "CSV export",
      "Priority support",
    ],
  },
};

export function getMaxRules(planName) {
  const key = (planName || "free").toLowerCase();
  return PLANS[key]?.maxRules ?? PLANS.free.maxRules;
}
