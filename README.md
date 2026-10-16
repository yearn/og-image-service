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
- `OG_ASSET_ORIGIN` optional public host for OG fonts and background assets; protected Vercel previews default to `https://og.yearn.fi`
- `ALLOWED_HOSTS` optional comma list for request-origin resolution (defaults to yearn.fi and localhost)

## Run locally

```bash
bun install 
bun run dev
```

## Deploy

- Ship to Vercel as a separate project. Set the env vars above. Routes run on Edge.

## Powerglove cards

- `/api/og/powerglove` — general project card
- `/api/og/powerglove/vault/[chainID]/[address]` — vault card with expected, 7-day, and 30-day APYs, snapshot NAV, fees, network, underlying token, and shortened vault address
- `/powerglove-review/index.html` — review gallery with the live main-page card, all nine Powerglove chains, all four vault types, and five design studies

The Powerglove route supports Ethereum, Optimism, GnosisChain, Polygon, Fantom, Base, Arbitrum, Katana, and Berachain.

Cards use the Powerglove design handoff, Aeonik, and a 1200 × 630 full-bleed white canvas. The faint SVG chart is a fixed decorative brand motif, independent of vault values or history. Long names and symbols are truncated to fit. Missing APYs, NAV, and fees render as an em dash; genuine zero remains zero. Optional deployment/version/symbol metadata is hidden when absent.

Vault cards read raw Kong snapshots so unavailable values are preserved. Katana expected APY reuses the yearn.fi OG calculation, combining its native rate with KAT app rewards and fixed-rate KAT rewards into one headline. Other vaults prefer `performance.estimated.apy`, then Oracle net APY, then weekly-compounded net APR. A gross Oracle APR is fee-adjusted only if both fees are known. Historical APYs use the snapshot's distinct weekly/monthly fields without substituting one for the other. Katana adds the same KAT incentives used by the yearn.fi historical OG to each available period; missing history remains unavailable. yBOLD uses staking-vault yield and performance fees, and yvUSD uses the APR service's APY for the requested vault address, falling back only to a snapshot estimate identified as `yvusd-estimated-apr`. Cards show each requested vault individually rather than the paired locked/unlocked presentation in Powerglove.

Successful images cache for five minutes. Unavailable vault snapshots return an uncached 503 with a retry hint; invalid chain/address requests return 400. NAV is the snapshot USD valuation, not a live on-chain valuation. Existing Yearn and Katana routes are unchanged.

Regenerate the illustrative review PNGs using the same renderer:

```bash
bun scripts/export-powerglove.tsx
```

Review values and addresses in the design exports are fixtures, not live measurements. The gallery labels these separately from live route images.
