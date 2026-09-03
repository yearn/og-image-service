import { afterEach, describe, expect, test } from 'bun:test'
import {
  DEFAULT_YEARN_ASSETS_URI,
  isYBoldAddress,
  getYearnTokenLogoUrl,
  normalizeYearnAssetsBaseUrl,
} from './data'

const ORIGINAL_BASE_YEARN_ASSETS_URI = process.env.BASE_YEARN_ASSETS_URI

afterEach(() => {
  if (ORIGINAL_BASE_YEARN_ASSETS_URI === undefined) {
    delete process.env.BASE_YEARN_ASSETS_URI
  } else {
    process.env.BASE_YEARN_ASSETS_URI = ORIGINAL_BASE_YEARN_ASSETS_URI
  }
})

describe('Yearn asset URL helpers', () => {
  test('detects the Ethereum yBOLD and ysyBOLD addresses', () => {
    expect(
      isYBoldAddress('1', '0x9f4330700A36b29952869fac9b33f45eedd8a3D8')
    ).toBe(true)
    expect(
      isYBoldAddress('1', '0x23346b04A7F55B8760e5860aa5a77383D63491CD')
    ).toBe(true)
    expect(
      isYBoldAddress('10', '0x9F4330700a36B29952869fac9b33f45EEdd8A3d8')
    ).toBe(false)
  })

  test('falls back to the default token-assets CDN when no base URL is provided', () => {
    delete process.env.BASE_YEARN_ASSETS_URI

    expect(normalizeYearnAssetsBaseUrl(undefined)).toBe(
      DEFAULT_YEARN_ASSETS_URI
    )
  })

  test('upgrades the legacy bare jsdelivr host to the default token-assets CDN', () => {
    expect(normalizeYearnAssetsBaseUrl('cdn.jsdelivr.net')).toBe(
      DEFAULT_YEARN_ASSETS_URI
    )
    expect(normalizeYearnAssetsBaseUrl('https://cdn.jsdelivr.net')).toBe(
      DEFAULT_YEARN_ASSETS_URI
    )
  })

  test('builds absolute token logo URLs from a root assets base URL', () => {
    expect(
      getYearnTokenLogoUrl(
        747474,
        '0x80c34BD3A3569E126e7055831036aa7b212cB159',
        'https://cdn.jsdelivr.net/gh/yearn/tokenassets@main'
      )
    ).toBe(
      'https://cdn.jsdelivr.net/gh/yearn/tokenassets@main/tokens/747474/0x80c34bd3a3569e126e7055831036aa7b212cb159/logo-128.png'
    )
  })

  test('does not duplicate the tokens segment when the base URL already includes it', () => {
    expect(
      getYearnTokenLogoUrl(
        '1',
        'AaaFEa48472f77563961Cdb53291DEDfB46F9040',
        'https://assets.example.com/tokens/'
      )
    ).toBe(
      'https://assets.example.com/tokens/1/0xaaafea48472f77563961cdb53291dedfb46f9040/logo-128.png'
    )
  })
})
