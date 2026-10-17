import type { NextRequest } from 'next/server'
import { isValidEthereumAddress, normalizeEthereumAddress } from '@lib/og/data'
import { loadFonts } from '@lib/og/render'
import { resolveOrigin } from '@lib/og/origin'
import { POWERGLOVE_CHAIN_IDS, resolvePowergloveCardData } from '@lib/og/powerglove'
import { renderPowergloveOG } from '@lib/og/powergloveRender'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  const match = new URL(req.url).pathname.match(/^\/api\/og\/powerglove\/vault\/(\d+)\/([^/]+)\/?$/)
  const chainID = match?.[1] || ''
  const address = normalizeEthereumAddress(match?.[2] || '')
  if (!POWERGLOVE_CHAIN_IDS.includes(Number(chainID)) || !isValidEthereumAddress(address)) return new Response('Invalid chainID or address', { status: 400 })
  const { origin, protocol } = resolveOrigin(req)
  const data = await resolvePowergloveCardData(chainID, address)
  if (!data) return new Response('Vault data unavailable', { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } })
  return renderPowergloveOG(await loadFonts(origin, protocol), data)
}
