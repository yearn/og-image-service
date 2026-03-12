import { describe, expect, test } from 'bun:test'
import { isYvUsdAddress } from './data'
import {
  getYvUsdAprServiceVault,
  resolveYvUsdCombinedTvl,
  resolveYvUsdEstimatedApy,
  resolveYvUsdHistoricalApy,
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

  test('sums unlocked and locked TVL while ignoring invalid values', () => {
    expect(
      resolveYvUsdCombinedTvl(
        { tvl: { tvl: 1250000 } },
        { tvl: { tvl: 875000 } }
      )
    ).toBe(2125000)
    expect(
      resolveYvUsdCombinedTvl(
        { tvl: { tvl: -10 } },
        { tvl: { tvl: Number.NaN } }
      )
    ).toBe(0)
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
