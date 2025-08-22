# OG Image Service

A Vercel-ready microservice to generate Open Graph (OG) social images for Yearn properties and other brands.

- Next.js Edge Runtime using `next/og` ImageResponse
- Brand-aware route params to customize backgrounds, logos, and text
- Vault-aware for yearn.fi legacy patterns with security checks

## Routes

- `/api/og/vault/[chainID]/[address]` — Yearn vault card
- `/api/og/simple` — Simple brand card (for testing)

Brand is selected via `brand` query param or path prefix later, defaults to `yearn`.

## Env

- `YDAEMON_BASE_URI` e.g. `https://ydaemon.yearn.fi` (required for vault route)
- `BASE_YEARN_ASSETS_URI` e.g. `https://assets.yearn.network` (vault logos)
- `KATANA_APR_SERVICE_API` optional for Katana chain
- `ALLOWED_HOSTS` optional comma list for font origin resolution (defaults to yearn.fi and localhost)

## Run locally

```bash
pnpm i # or npm i / bun i
pnpm dev
```

## Deploy

- Ship to Vercel as a separate project. Set the env vars above. Routes run on Edge.
