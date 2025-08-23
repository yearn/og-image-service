/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { TypeMarkYearnNaughty } from '@lib/icons/TypeMarkYearn-naughty'
import { BRANDS } from '@lib/og/brands'
import {
  formatUSD,
  getChainName,
  isValidChainID,
  isValidEthereumAddress,
  YBOLD_STAKING_ADDRESS,
  YBOLD_VAULT_ADDRESS,
} from '@lib/og/data'
import { calculateEstimatedAPY, calculateHistoricalAPY } from '@lib/og/apy'
import {
  fetchKatanaAprs,
  fetchVaultData,
  fetchYBoldApr,
} from '@lib/og/fetchers'
import { loadFonts, renderVaultOG } from '@lib/og/render'
import { resolveOrigin } from '@lib/og/origin'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  const url = req.url || req.nextUrl?.pathname || ''
  const match = url.match(/\/api\/og\/yearn\/vault\/(\d+)\/([a-fA-F0-9x]+)/i)
  const chainID = match?.[1] || '1'
  const address = match?.[2] || ''
  if (!isValidChainID(chainID) || !isValidEthereumAddress(address))
    return new Response('Invalid chainID or address', { status: 400 })

  const brand = BRANDS.yearn

  const vault = await fetchVaultData(chainID, address)
  let katanaAprs: any | null = null
  if (chainID === '747474') katanaAprs = await fetchKatanaAprs()
  let yBoldApr: { estimatedAPY: number; historicalAPY: number } | null = null
  if (address.toLowerCase() === YBOLD_VAULT_ADDRESS.toLowerCase())
    yBoldApr = await fetchYBoldApr(chainID, YBOLD_STAKING_ADDRESS)

  const data = (() => {
    if (vault) {
      const [underlyingAPY, rewardsAPR] = calculateEstimatedAPY(
        vault,
        katanaAprs || undefined,
        yBoldApr
      )
      const est = underlyingAPY
      const rewards = rewardsAPR
      const hist = calculateHistoricalAPY(vault, yBoldApr)
      return {
        icon: `${
          process.env.BASE_YEARN_ASSETS_URI
        }/${chainID}/${vault.token.address.toLowerCase()}/logo-128.png`,
        name: vault.name?.replace(/\s+Vault$/, '') || 'Yearn Vault',
        estimatedApy: `${(est * 100).toFixed(2)}%`,
        rewardsAPR: rewards ? `${(rewards * 100).toFixed(2)}%` : undefined,
        minBoost: rewards ? `${(rewards * 10).toFixed(2)}%` : undefined,
        historicalApy: hist === -1 ? '--%' : `${(hist * 100).toFixed(2)}%`,
        tvlUsd: formatUSD(vault.tvl?.tvl || 0),
        chainName: getChainName(parseInt(chainID, 10)),
        address,
      }
    }
    return {
      icon: `${process.env.BASE_YEARN_ASSETS_URI}/${chainID}/${address}/logo-128.png`,
      name: 'Yearn Vault',
      estimatedApy: '0.00%',
      historicalApy: '0.00%',
      tvlUsd: '$0',
      chainName: getChainName(parseInt(chainID, 10)),
      address,
    }
  })()

  const { origin, protocol } = resolveOrigin(req)
  const { aeonikRegular, aeonikBold, aeonikMono } = await loadFonts(
    origin,
    protocol
  )

  return renderVaultOG(
    brand,
    data,
    { aeonikRegular, aeonikBold, aeonikMono },
    <TypeMarkYearnNaughty width={300} height={90} color={brand.logoColor} />,
    { origin, protocol }
  )
}
