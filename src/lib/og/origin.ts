import type { NextRequest } from 'next/server'

function normalizeForwardedHost(rawHost: string): string {
  return rawHost.split(',')[0]?.trim() || ''
}

function isTrustedVercelHost(host: string): boolean {
  return host === 'vercel.app' || host.endsWith('.vercel.app')
}

export function resolveOrigin(req: NextRequest): {
  origin: string
  protocol: 'http' | 'https'
} {
  const defaultAllowed = [
    'yearn.fi',
    'og.yearn.fi',
    'localhost:3000',
    'localhost',
    '127.0.0.1',
    'app.yearn.fi',
  ]
  const allowedHosts = (process.env.ALLOWED_HOSTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const allowed = allowedHosts.length ? allowedHosts : defaultAllowed
  const rawOrigin = normalizeForwardedHost(
    req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
  )
  const originHost = rawOrigin.split(':')[0].toLowerCase()
  const originPort = rawOrigin.split(':')[1]
  const validatedOrigin =
    allowed.includes(rawOrigin) ||
    allowed.includes(originHost) ||
    isTrustedVercelHost(originHost)
      ? originHost + (originPort ? ':' + originPort : '')
      : 'yearn.fi'
  const protocol: 'http' | 'https' =
    validatedOrigin.includes('localhost') || validatedOrigin.startsWith('127.0.0.1')
      ? 'http'
      : 'https'
  return { origin: validatedOrigin, protocol }
}
