import type { NextRequest } from 'next/server'
import { loadFonts } from '@lib/og/render'
import { resolveOrigin } from '@lib/og/origin'
import { renderPowergloveOG } from '@lib/og/powergloveRender'

export const runtime = 'edge'

export default async function handler(req: NextRequest) {
  const { origin, protocol } = resolveOrigin(req)
  return renderPowergloveOG(await loadFonts(origin, protocol))
}
