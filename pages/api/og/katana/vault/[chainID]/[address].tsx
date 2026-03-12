/* eslint-disable @next/next/no-img-element */
import type { NextRequest } from 'next/server'
import { BRANDS } from '@lib/og/brands'
import {
  isValidChainID,
  isValidEthereumAddress,
  normalizeEthereumAddress,
} from '@lib/og/data'
import { loadFonts, renderVaultOG } from '@lib/og/render'
import { resolveOrigin } from '@lib/og/origin'
import { resolveStandardVaultOGData } from '@lib/og/vaultData'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  const url = req.url || req.nextUrl?.pathname || ''
  const match = url.match(/\/api\/og\/katana\/vault\/(\d+)\/([a-fA-F0-9x]+)/i)
  const chainID = match?.[1] || '1'
  const address = normalizeEthereumAddress(match?.[2] || '')
  if (!isValidChainID(chainID) || !isValidEthereumAddress(address))
    return new Response('Invalid chainID or address', { status: 400 })

  const brand = BRANDS.katana

  const data = await resolveStandardVaultOGData(chainID, address)

  const { origin, protocol } = resolveOrigin(req)
  const { aeonikRegular, aeonikBold, aeonikMono } = await loadFonts(
    origin,
    protocol
  )

  const brandMark = (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: '40px' }}>
      <img
        src={`${protocol}://${origin}/graphics/yearnxkatana-typemark.png`}
        alt="Yearn × Katana"
        height={75}
        style={{ objectFit: 'contain', display: 'block' }}
      />
    </div>
  )

  return renderVaultOG(
    brand,
    data,
    { aeonikRegular, aeonikBold, aeonikMono },
    brandMark,
    { origin, protocol }
  )
}
