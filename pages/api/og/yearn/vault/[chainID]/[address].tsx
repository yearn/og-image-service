/* eslint-disable @next/next/no-img-element */
import type { NextRequest } from 'next/server'
import { TypeMarkYearnNaughty } from '@lib/icons/TypeMarkYearn-naughty'
import { BRANDS } from '@lib/og/brands'
import {
  isYvUsdAddress,
  isValidChainID,
  isValidEthereumAddress,
  normalizeEthereumAddress,
} from '@lib/og/data'
import { loadFonts, renderVaultOG, renderYvUsdOG } from '@lib/og/render'
import { resolveOrigin } from '@lib/og/origin'
import { resolveStandardVaultOGData } from '@lib/og/vaultData'
import { resolveYvUsdOGData } from '@lib/og/yvusd'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  const url = req.url || req.nextUrl?.pathname || ''
  const match = url.match(/\/api\/og\/yearn\/vault\/(\d+)\/([a-fA-F0-9x]+)/i)
  const chainID = match?.[1] || '1'
  const address = normalizeEthereumAddress(match?.[2] || '')
  if (!isValidChainID(chainID) || !isValidEthereumAddress(address))
    return new Response('Invalid chainID or address', { status: 400 })

  const isYvUsdRequest = isYvUsdAddress(chainID, address)
  const brand = isYvUsdRequest ? BRANDS.yvusd : BRANDS.yearn

  const { origin, protocol } = resolveOrigin(req)
  const { aeonikRegular, aeonikBold, aeonikMono } = await loadFonts(
    origin,
    protocol
  )

  const brandMark = (
    <TypeMarkYearnNaughty width={300} height={90} color={brand.logoColor} />
  )

  if (isYvUsdRequest) {
    const data = await resolveYvUsdOGData()
    return renderYvUsdOG(
      brand,
      data,
      { aeonikRegular, aeonikBold, aeonikMono },
      brandMark,
      { origin, protocol }
    )
  }

  const data = await resolveStandardVaultOGData(chainID, address)
  return renderVaultOG(
    brand,
    data,
    { aeonikRegular, aeonikBold, aeonikMono },
    brandMark,
    { origin, protocol }
  )
}
