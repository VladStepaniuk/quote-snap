# QuoteSnap Shopify App

QuoteSnap is now scaffolded as a real embedded Shopify app. The current implementation gives you a working admin app inside Shopify with shop-scoped data persistence and preview logic.

Implemented now:

- embedded Shopify admin app
- Prisma-backed storage for rules and quote requests
- shop-scoped QuoteSnap rule management
- storefront behavior preview inside the admin app
- live product snapshot query from the connected Shopify store

Not implemented yet:

- theme app extension for real storefront hide-price behavior
- quote form injection on product pages
- live storefront request capture from the theme

## Local Shopify test flow

From this directory:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name quotesnap_models
shopify app dev --store nmj-creation-studio.myshopify.com
```

When the CLI is ready, open the preview URL it prints and install the app into the dev store.

## Validation done

The current embedded app passes:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Important note

You can test the QuoteSnap admin app in Shopify now. You cannot yet test live price hiding on the storefront because that requires a theme app extension, which is the next implementation step.
