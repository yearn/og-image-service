import type { NextRequest } from 'next/server'

const DEFAULT_PUBLIC_ASSET_ORIGIN = 'https://og.yearn.fi'

function normalizePublicAssetOrigin(value: string | undefined): string | null {
  const candidate = value?.trim()
  if (!candidate) return null

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return parsed.toString().replace(/\/+$/, '')
  } catch {
    return null
  }
}

export function resolvePublicAssetBaseUrl(
  origin: string,
  protocol: 'http' | 'https'
): string {
  const configuredOrigin = normalizePublicAssetOrigin(
    process.env.OG_ASSET_ORIGIN
  )
  if (configuredOrigin) return configuredOrigin

  if (origin.endsWith('.vercel.app')) return DEFAULT_PUBLIC_ASSET_ORIGIN

  return `${protocol}://${origin}`
}

export function resolveOrigin(req: NextRequest): {
  origin: string
  protocol: 'http' | 'https'
} {
  const vercelUrl = process.env.VERCEL_URL?.trim()
  const defaultAllowed = [
    'yearn.fi',
    'og.yearn.fi',
    'localhost:3000',
    'localhost',
    'app.yearn.fi',
    ...(vercelUrl ? [vercelUrl] : []),
  ]
  const allowedHosts = (process.env.ALLOWED_HOSTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const allowed = Array.from(new Set([...defaultAllowed, ...allowedHosts]))
  const rawCandidates = [
    req.headers.get('x-forwarded-host') || '',
    req.headers.get('host') || '',
    req.nextUrl?.host || '',
    (() => {
      try {
        return new URL(req.url).host
      } catch {
        return ''
      }
    })(),
  ]

  const candidates = rawCandidates
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean)

  const validatedOrigin =
    candidates.find((candidate) => {
      if (allowed.includes(candidate)) return true
      const candidateHost = candidate.split(':')[0]
      if (allowed.includes(candidateHost)) return true
      return candidate.endsWith('.vercel.app')
    }) || 'og.yearn.fi'

  const forwardedProto = req.headers.get('x-forwarded-proto')
  const requestProtocol = req.nextUrl?.protocol === 'http:' ? 'http' : 'https'
  const protocol: 'http' | 'https' = validatedOrigin.includes('localhost')
    ? 'http'
    : forwardedProto === 'http' || forwardedProto === 'https'
      ? forwardedProto
      : requestProtocol

  return { origin: validatedOrigin, protocol }
}
