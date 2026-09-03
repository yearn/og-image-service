import { describe, expect, test } from 'bun:test'
import {
  calculateEstimatedAPY,
  calculateHistoricalAPY,
  getKatanaEstimatedApyBreakdown,
  getKatanaHistoricalApyBreakdown,
  hasKatanaRewardAprData,
} from './apy'

function makeVault(overrides: Record<string, any> = {}) {
  return {
    address: '0x0000000000000000000000000000000000000001',
    chainID: 747474,
    apr: {
      netAPR: 0.03,
      extra: {},
      points: {
        monthAgo: 0.02,
        weekAgo: 0.03,
      },
      forwardAPR: {
        netAPR: 0.068,
      },
    },
    ...overrides,
  }
}

describe('Katana OG APY helpers', () => {
  test('detects explicit Katana reward fields but ignores steer points', () => {
    expect(
      hasKatanaRewardAprData(
        makeVault({
          apr: {
            extra: {
              steerPointsPerDollar: 9.99,
            },
          },
        })
      )
    ).toBe(false)

    expect(
      hasKatanaRewardAprData(
        makeVault({
          apr: {
            extra: {
              katanaAppRewardsAPR: 0,
              fixedRateKatanaRewards: 0,
              steerPointsPerDollar: 9.99,
            },
          },
        })
      )
    ).toBe(true)
  })

  test('uses snapshot Katana reward fields for estimated APY and ignores steer points', () => {
    const breakdown = getKatanaEstimatedApyBreakdown(
      makeVault({
        apr: {
          netAPR: 0.03,
          extra: {
            katanaAppRewardsAPR: 0.0916,
            fixedRateKatanaRewards: 0.35,
            steerPointsPerDollar: 0.1883,
          },
          points: {
            monthAgo: 0.02,
            weekAgo: 0.03,
          },
          forwardAPR: {
            netAPR: 0.068,
          },
        },
      }),
      undefined
    )
    const [estimatedApy, rewardsAPR] = calculateEstimatedAPY(
      makeVault({
        apr: {
          netAPR: 0.03,
          extra: {
            katanaAppRewardsAPR: 0.0916,
            fixedRateKatanaRewards: 0.35,
            steerPointsPerDollar: 0.1883,
          },
          points: {
            monthAgo: 0.02,
            weekAgo: 0.03,
          },
          forwardAPR: {
            netAPR: 0.068,
          },
        },
      }),
      undefined,
      null
    )

    expect(breakdown).toEqual({
      native: 0.068,
      kat: 0.4416,
    })
    expect(estimatedApy).toBeCloseTo(0.5096, 6)
    expect(rewardsAPR).toBeUndefined()
  })

  test('calculates Katana 30 day APY from monthAgo plus snapshot reward fields', () => {
    const breakdown = getKatanaHistoricalApyBreakdown(
      makeVault({
        apr: {
          netAPR: 0.03,
          extra: {
            katanaAppRewardsAPR: 0.0916,
            fixedRateKatanaRewards: 0.35,
            steerPointsPerDollar: 0.1883,
          },
          points: {
            monthAgo: 0.02,
            weekAgo: 0.03,
          },
          forwardAPR: {
            netAPR: 0.068,
          },
        },
      }),
      undefined
    )
    const historicalApy = calculateHistoricalAPY(
      makeVault({
        apr: {
          netAPR: 0.03,
          extra: {
            katanaAppRewardsAPR: 0.0916,
            fixedRateKatanaRewards: 0.35,
            steerPointsPerDollar: 0.1883,
          },
          points: {
            monthAgo: 0.02,
            weekAgo: 0.03,
          },
          forwardAPR: {
            netAPR: 0.068,
          },
        },
      }),
      undefined,
      null
    )

    expect(breakdown).toEqual({
      native: 0.02,
      kat: 0.4416,
    })
    expect(historicalApy).toBeCloseTo(0.4616, 6)
  })

  test('falls back to weekAgo when monthAgo is zero', () => {
    const historicalApy = calculateHistoricalAPY(
      makeVault({
        apr: {
          netAPR: 0.03,
          extra: {
            katanaAppRewardsAPR: 0.0916,
            fixedRateKatanaRewards: 0.35,
          },
          points: {
            monthAgo: 0,
            weekAgo: 0.03,
          },
          forwardAPR: {
            netAPR: 0.068,
          },
        },
      }),
      undefined,
      null
    )

    expect(historicalApy).toBeCloseTo(0.4716, 6)
  })

  test('falls back to legacy Katana APR service reward fields when snapshot fields are absent', () => {
    const vault = makeVault({
      apr: {
        netAPR: 0.03,
        extra: {
          steerPointsPerDollar: 100,
        },
        points: {
          monthAgo: 0.02,
          weekAgo: 0.03,
        },
        forwardAPR: {
          netAPR: 0.04,
        },
      },
    })
    const katanaAprs = {
      '0x0000000000000000000000000000000000000001': {
        apr: {
          extra: {
            katanaRewardsAPR: 0.11,
            FixedRateKatanaRewards: 0.35,
            steerPointsPerDollar: 100,
          },
        },
      },
    }

    const [estimatedApy] = calculateEstimatedAPY(vault, katanaAprs, null)
    const historicalApy = calculateHistoricalAPY(vault, katanaAprs, null)

    expect(estimatedApy).toBeCloseTo(0.5, 6)
    expect(historicalApy).toBeCloseTo(0.48, 6)
  })

  test('preserves non-Katana estimated and historical APY behavior', () => {
    const vault = makeVault({
      chainID: 1,
      apr: {
        netAPR: 0.025,
        extra: {
          stakingRewardsAPR: 0.01,
          gammaRewardAPR: 0.02,
        },
        points: {
          monthAgo: 0.02,
          weekAgo: 0.01,
        },
        forwardAPR: {
          netAPR: 0.03,
        },
      },
    })

    const [estimatedApy, rewardsAPR] = calculateEstimatedAPY(
      vault,
      undefined,
      null
    )
    const historicalApy = calculateHistoricalAPY(vault, undefined, null)

    expect(estimatedApy).toBeCloseTo(0.03, 6)
    expect(rewardsAPR).toBeCloseTo(0.03, 6)
    expect(historicalApy).toBeCloseTo(0.02, 6)
  })

  test('applies yBOLD APY overrides to the ysyBOLD staking vault', () => {
    const vault = makeVault({
      address: '0x23346B04a7f55b8760E5860AA5A77383D63491cD',
      chainID: 1,
    })
    const yBoldApr = {
      estimatedAPY: 0.0612,
      historicalAPY: 0.0464,
    }

    const [estimatedApy] = calculateEstimatedAPY(vault, undefined, yBoldApr)
    const historicalApy = calculateHistoricalAPY(
      vault,
      undefined,
      yBoldApr
    )

    expect(estimatedApy).toBe(0.0612)
    expect(historicalApy).toBe(0.0464)
  })
})
