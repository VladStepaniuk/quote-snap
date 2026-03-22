# QuoteSnap — Theme App Extension

This extension adds the storefront behaviour for QuoteSnap:
- Hides product prices based on rules
- Replaces "Add to Cart" with a configurable quote CTA
- Shows a modal quote request form
- Submits quote requests via the app proxy to the Remix backend

## Files

| File | Purpose |
|---|---|
| `blocks/quotesnap.liquid` | Theme block — merchant adds this to their product page template |
| `assets/quotesnap.js` | Client-side rules evaluation + DOM manipulation + form handling |
| `assets/quotesnap.css` | Styles for the CTA button, modal, and form |
| `locales/en.default.json` | Translatable strings |

## How it works

1. Merchant adds the **QuoteSnap** block to their product page in the Shopify theme editor
2. On page load, `quotesnap.js` calls `/apps/quotesnap/rules?shop=...` via the app proxy
3. The app proxy route (`app.proxy.rules.jsx`) returns the shop's active rules from Prisma
4. The script evaluates rules against the current product + customer state
5. If a rule matches: hides prices and/or injects the quote CTA button
6. Customer clicks CTA → modal opens → fills form → submits to `/apps/quotesnap/quote-request`
7. Quote is stored in the DB and visible in the admin dashboard

## App proxy routes

- `GET /apps/quotesnap/rules` → `app/routes/app.proxy.rules.jsx`
- `POST /apps/quotesnap/quote-request` → `app/routes/app.proxy.quote-request.jsx`

## Theme compatibility

Works with any Online Store 2.0 theme (Dawn, Sense, Craft, etc.).
Price hiding covers the most common selectors across popular themes.
If a customer's theme uses custom price selectors, they can be added to `PRICE_SELECTORS` in `quotesnap.js`.
