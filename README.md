# OG Image Service

A Vercel-ready microservice to generate Open Graph (OG) social images for Yearn properties.

- Next.js Edge Runtime using `next/og` ImageResponse
- Brand-aware route params to customize backgrounds, logos, and text
- Vault-aware for yearn.fi legacy patterns with security checks

## Routes

- `/api/og/yearn/vault/[chainID]/[address]` — yearn.fi vault card
- `/api/og/katana/vault/[chainID]/[address]` — Katana vault card
- `/api/og/simple` — Simple brand card (for testing)

## Env

- `YDAEMON_BASE_URI` e.g. `https://ydaemon.yearn.fi` (required for vault route)
- `BASE_YEARN_ASSETS_URI` e.g. `cdn.jsdelivr.net` (vault logos)
- `KATANA_APR_SERVICE_API` optional for Katana chain
- `ALLOWED_HOSTS` optional comma list for font origin resolution (defaults to yearn.fi and localhost)

## Run locally

```bash
bun install 
bun run dev
```

## Deploy

- Ship to Vercel as a separate project. Set the env vars above. Routes run on Edge.
