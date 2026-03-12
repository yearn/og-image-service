# Update the yvUSD OG Card

## Summary

- Implement the live OG change in `og-image-service`, because `yearn.fi-bento` only sets `og:image` metadata and already points vault pages at `https://og.yearn.fi/api/og/yearn/vault/...`.
- Treat yvUSD as a special product card: both yvUSD Ethereum vault URLs should render the same dual-variant OG image.
- Canonicalize the yvUSD OG card to the unlocked product identity: always show `yvUSD`, always show the unlocked vault address in the footer, and ignore the requested route address once the request is identified as yvUSD.

## Key Changes

- Add yvUSD detection in `og-image-service` for chain `1` and the two known yvUSD vault addresses.
- Add a yvUSD-specific data resolver that fetches both yvUSD vault payloads from yDaemon and fetches the yvUSD APR service payload.
- Resolve yvUSD estimated APY per variant from APR-service `apy` first, then fall back to yDaemon forward/net APY if the APR service is missing.
- Resolve yvUSD historical APY per variant from yDaemon monthly APY, with weekly APY fallback when monthly is unavailable.
- Keep generic vault cards unchanged; branch into a dedicated yvUSD renderer only when the requested vault is one of the two yvUSD addresses.
- Add a dedicated `yvusd` brand/render mode for the special card instead of overloading the generic Yearn renderer.
- Apply the same yvUSD special handling to both `/api/og/yearn/vault/...` and the back-compat `/api/og/vault/...` path through shared helper code so the card cannot drift by route.
- On the back-compat `/api/og/vault/...` path, ignore `?brand=katana` for yvUSD and force the `yvusd` render mode.
- Add self-hosted OG assets inside `og-image-service/public/graphics/`, moving the intended `yvUSD-seal.png` and `yvusd-og-bg.png` source assets from `yearn.fi-bento` into this repo.
- Render the yvUSD card with the seal logo, the `yvusd-og-bg.png` background, and the same stacked metric-row layout used by the standard card:
  - `Estimated APY`: `(lock icon) Locked | (unlock icon) Unlocked`
  - `30-Day APY`: `(lock icon) Locked | (unlock icon) Unlocked`
  - `Vault TVL`: combined yvUSD TVL
- Keep TVL on the card, but switch it to combined yvUSD TVL so the dual-variant card reflects the product rather than one route address.
- Keep the yvUSD footer/address canonical to the unlocked vault address even when the locked vault URL is requested.

## Public Interfaces

- Add `YVUSD_APR_SERVICE_API` to `og-image-service` env handling.
- Default that env to `https://yearn-yvusd-apr-service.vercel.app/api/aprs` so OG values match the current site's yvUSD APR source.
- No external route or metadata URL changes are needed in `yearn.fi-bento`.

## Test Plan

- Run `bun run lint` and `bun run build` in `og-image-service`.
- Add unit coverage for yvUSD address detection, APR-service precedence, historical APY fallback, and combined TVL derivation in the shared yvUSD helpers.
- Manually preview the Yearn OG route for both yvUSD addresses and confirm both render the same special yvUSD card.
- Verify the card uses the seal logo, the yvUSD background, always shows the unlocked footer address, and shows locked/unlocked values inline on the standard-card metric rows for `Estimated APY` and `30-Day APY`.
- Verify a non-yvUSD Yearn vault still renders the existing generic card unchanged.
- Verify fallback behavior when the APR service or one of the two yvUSD vault fetches is unavailable: the card should still render with degraded values instead of failing the whole image.
- Verify `/api/og/vault/...?...brand=katana` still renders the yvUSD card with yvUSD branding when the address is one of the two yvUSD vaults.

## Assumptions

- `30 Day APY` should follow the same site meaning already used elsewhere: monthly/30D APY with weekly fallback.
- The special yvUSD OG card is product-level, so combined TVL is preferred over showing one requested address's TVL.
- No code change is required in `yearn.fi-bento` beyond using it as the temporary source location for the intended yvUSD OG assets that now need to live in this repo.
