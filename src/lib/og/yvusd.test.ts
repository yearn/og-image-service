import { describe, expect, test } from 'bun:test'
import { isYvUsdAddress } from './data'
import {
  getYvUsdAprServiceVault,
  resolveYvUsdCombinedTvl,
  resolveYvUsdEstimatedApy,
  resolveYvUsdHistoricalApy,
  resolveYvUsdOGData,
} from './yvusd'

describe('yvUSD helpers', () => {
  test('detects yvUSD addresses on Ethereum only', () => {
    expect(
      isYvUsdAddress('1', '0x696d02Db93291651ED510704c9b286841d506987')
    ).toBe(true)
    expect(
      isYvUsdAddress('1', 'AaaFEa48472f77563961Cdb53291DEDfB46F9040')
    ).toBe(true)
    expect(
      isYvUsdAddress('10', '0x696d02Db93291651ED510704c9b286841d506987')
    ).toBe(false)
  })

  test('prefers APR service apy over yDaemon forward/net APR', () => {
    expect(
      resolveYvUsdEstimatedApy(
        { apy: '0.1234' },
        { apr: { forwardAPR: { netAPR: 0.08 }, netAPR: 0.07 } }
      )
    ).toBe(0.1234)
  })

  test('falls back to yDaemon APR values when APR service is unavailable', () => {
    expect(
      resolveYvUsdEstimatedApy(null, {
        apr: { forwardAPR: { netAPR: 0.08 }, netAPR: 0.07 },
      })
    ).toBe(0.08)
    expect(
      resolveYvUsdEstimatedApy(null, {
        apr: { netAPR: 0.07 },
      })
    ).toBe(0.07)
  })

  test('uses monthAgo for 30 day APY and falls back to weekAgo', () => {
    expect(
      resolveYvUsdHistoricalApy({
        apr: { points: { monthAgo: 0.05, weekAgo: 0.03 } },
      })
    ).toBe(0.05)
    expect(
      resolveYvUsdHistoricalApy({
        apr: { points: { monthAgo: 0, weekAgo: 0.03 } },
      })
    ).toBe(0.03)
  })

  test('uses base vault TVL which already includes locked deposits', () => {
    expect(
      resolveYvUsdCombinedTvl({ tvl: { tvl: 9300430.970722465 } })
    ).toBe(9300430.970722465)
  })

  test('renders total TVL without adding the locked wrapper snapshot', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input).toLowerCase()
      const locked = url.includes('0xaaafea48472f77563961cdb53291dedfb46f9040')
      return Response.json(url.includes('/snapshot/') ? {
        address: locked
          ? '0xAaaFEa48472f77563961Cdb53291DEDfB46F9040'
          : '0x696d02Db93291651ED510704c9b286841d506987',
        chainId: 1,
        tvl: { close: locked ? 3763363.1196666723 : 9300430.970722465 },
      } : {})
    }) as typeof fetch
    try {
      expect((await resolveYvUsdOGData()).tvlUsd).toBe('$9.30M')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test('preserves zero and ignores missing or invalid base vault TVL', () => {
    for (const value of [0, -10, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(resolveYvUsdCombinedTvl({ tvl: { tvl: value } })).toBe(0)
    }
    expect(resolveYvUsdCombinedTvl(null)).toBe(0)
    expect(resolveYvUsdCombinedTvl({})).toBe(0)
  })

  test('matches APR service vaults by normalized address', () => {
    const aprServicePayload = {
      unlocked: {
        address: '0x696d02db93291651ed510704c9b286841d506987',
        apy: 0.09,
      },
    }

    expect(
      getYvUsdAprServiceVault(
        aprServicePayload,
        '696d02Db93291651ED510704c9b286841d506987'
      )
    ).toEqual(aprServicePayload.unlocked)
  })
})
