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
    features: ["5 rules", "Priority email support", "CSV export"],
  },
  pro: {
    name: "Pro",
    amount: 29,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 7,
    features: [
      "Unlimited rules",
      "Email notifications",
      "Analytics",
      "Priority support",
    ],
  },
};
