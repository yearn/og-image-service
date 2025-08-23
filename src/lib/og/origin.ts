import type { NextRequest } from 'next/server'

export function resolveOrigin(req: NextRequest): {
  origin: string
  protocol: 'http' | 'https'
} {
  const defaultAllowed = [
    'yearn.fi',
    'localhost:3000',
    'localhost',
    'app.yearn.fi',
  ]
  const allowedHosts = (process.env.ALLOWED_HOSTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const allowed = allowedHosts.length ? allowedHosts : defaultAllowed
  const rawOrigin =
    req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
  const originHost = rawOrigin.split(':')[0]
  const originPort = rawOrigin.split(':')[1]
  const validatedOrigin = allowed.includes(rawOrigin)
    ? rawOrigin
    : allowed.includes(originHost)
    ? originHost + (originPort ? ':' + originPort : '')
    : 'yearn.fi'
  const protocol: 'http' | 'https' = validatedOrigin.includes('localhost')
    ? 'http'
    : 'https'
  return { origin: validatedOrigin, protocol }
}
