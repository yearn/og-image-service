import { afterEach, describe, expect, test } from 'bun:test'
import { resolvePublicAssetBaseUrl } from './origin'

const ORIGINAL_OG_ASSET_ORIGIN = process.env.OG_ASSET_ORIGIN

afterEach(() => {
  if (ORIGINAL_OG_ASSET_ORIGIN === undefined) {
    delete process.env.OG_ASSET_ORIGIN
  } else {
    process.env.OG_ASSET_ORIGIN = ORIGINAL_OG_ASSET_ORIGIN
  }
})

describe('OG public asset origin', () => {
  test('uses the public asset host for protected Vercel preview requests', () => {
    delete process.env.OG_ASSET_ORIGIN

    expect(
      resolvePublicAssetBaseUrl(
        'og-image-service-git-feature-yearn.vercel.app',
        'https'
      )
    ).toBe('https://og.yearn.fi')
  })

  test('keeps the request origin for local development', () => {
    delete process.env.OG_ASSET_ORIGIN

    expect(resolvePublicAssetBaseUrl('localhost:4242', 'http')).toBe(
      'http://localhost:4242'
    )
  })

  test('uses a configured public asset origin when supplied', () => {
    process.env.OG_ASSET_ORIGIN = 'https://assets.example.com/'

    expect(resolvePublicAssetBaseUrl('preview.vercel.app', 'https')).toBe(
      'https://assets.example.com'
    )
  })
})
