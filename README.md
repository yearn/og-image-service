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

- `KONG_REST_URL` optional, defaults to `https://kong.yearn.fi/api/rest` (vault snapshots)
- `BASE_YEARN_ASSETS_URI` e.g. `https://cdn.jsdelivr.net/gh/yearn/tokenassets@main` (vault logos)
- `KATANA_APR_SERVICE_API` optional Katana APR fallback when Kong snapshots do not include Katana reward fields
- `YDAEMON_BASE_URI` optional override for the yDaemon base URL used for vault data
- `YVUSD_APR_SERVICE_API` optional for yvUSD APR overlay; defaults to `https://yearn-yvusd-apr-service.vercel.app/api/aprs`
- `ALLOWED_HOSTS` optional comma list for font origin resolution (defaults to yearn.fi and localhost)

## Run locally

```bash
bun install 
bun run dev
```

## Deploy

- Ship to Vercel as a separate project. Set the env vars above. Routes run on Edge.
