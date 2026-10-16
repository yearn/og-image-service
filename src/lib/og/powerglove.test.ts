import { afterEach, describe, expect, test } from 'bun:test'
import { mapPowergloveSnapshot, powerglovePercent, resolvePowergloveExpectedApy, resolvePowergloveCardData } from './powerglove'

import { resolveStandardVaultOGData } from './vaultData'

const identity = { address: '0xBe53A109B494E5c9f97b9Cd39Fe969BE68BF6204', chainId: 1 }

describe('Powerglove snapshot cards', () => {
  test('preserves missing APYs, fees, and NAV instead of inventing zero', () => {
    const data = mapPowergloveSnapshot(identity)
    for (const key of ['expectedApy', 'weeklyApy', 'monthlyApy', 'nav', 'managementFee', 'performanceFee'] as const) expect(data[key]).toBeUndefined()
    expect(data.deployed).toBeUndefined()
    expect(powerglovePercent(undefined)).toBe('—')
  })
  test('preserves genuine zero and negative historical APY', () => {
    const data = mapPowergloveSnapshot({ ...identity, tvl: { close: 0 }, fees: { managementFee: 0, performanceFee: 1000 }, apy: { weeklyNet: 0, monthlyNet: -.02 }, performance: { estimated: { apy: 0 }, oracle: { netAPY: .04 } } })
    expect(data.expectedApy).toBe(0)
    expect(data.weeklyApy).toBe(0)
    expect(data.monthlyApy).toBe(-.02)
    expect(data.nav).toBe(0)
    expect(data.managementFee).toBe(0)
    expect(data.performanceFee).toBe(.1)
    expect(powerglovePercent(0)).toBe('0%')
  })
  test('does not substitute weekly APY for an unavailable month', () => {
    const data = mapPowergloveSnapshot({ ...identity, performance: { historical: { weeklyNet: .04 } } })
    expect(data.weeklyApy).toBe(.04)
    expect(data.monthlyApy).toBeUndefined()
  })
  test('converts net APR to APY using Powerglove weekly compounding', () => {
    expect(resolvePowergloveExpectedApy({ ...identity, performance: { oracle: { netAPR: .05 } } })).toBeCloseTo((1 + .05 / 52) ** 52 - 1, 12)
  })
  test('adjusts gross oracle APR for fees only when fees are known', () => {
    const input = { ...identity, performance: { oracle: { apr: .05 } } }
    expect(resolvePowergloveExpectedApy(input)).toBeUndefined()
    expect(resolvePowergloveExpectedApy({ ...input, fees: { managementFee: 200, performanceFee: 1000 } })).toBeCloseTo((1 + .027 / 52) ** 52 - 1, 12)
  })
  test('formats deployment and accepts numeric strings without accepting malformed numbers', () => {
    const data = mapPowergloveSnapshot({ ...identity, inceptTime: '1710258455', fees: { performanceFee: .1 }, apy: { weeklyNet: '0.03', monthlyNet: 'bad' } })
    expect(data.deployed).toBe('March 2024')
    expect(data.performanceFee).toBe(.1)
    expect(data.weeklyApy).toBe(.03)
    expect(data.monthlyApy).toBeUndefined()
  })
})

const originalFetch = global.fetch
afterEach(() => { global.fetch = originalFetch })

describe('Powerglove live resolution', () => {
  test('rejects mismatched snapshots', async () => {
    global.fetch = (async () => Response.json({ ...identity, chainId: 8453 })) as typeof fetch
    expect(await resolvePowergloveCardData('1', identity.address)).toBeNull()
  })
  test('returns unavailable after an upstream failure', async () => {
    global.fetch = (async () => new Response('Unavailable', { status: 503 })) as typeof fetch
    expect(await resolvePowergloveCardData('1', identity.address)).toBeNull()
  })
  test('uses staking history and the larger oracle or weekly APY for yBOLD', async () => {
    const address = '0x9F4330700a36B29952869fac9b33f45EEdd8A3d8'
    global.fetch = (async (input: string | URL | Request) => {
      const staking = String(input).toLowerCase().includes('0x23346')
      return Response.json({ ...identity, address, tvl: { close: 500 }, ...(staking ? { address: '0x23346B04a7f55b8760E5860AA5A77383D63491cD', apy: { weeklyNet: .06, monthlyNet: .04 }, fees: { performanceFee: 1000 }, performance: { oracle: { netAPY: .05 } } } : {}) })
    }) as typeof fetch
    const data = await resolvePowergloveCardData('1', address)
    expect(data?.expectedApy).toBe(.06)
    expect(data?.monthlyApy).toBe(.04)
    expect(data?.performanceFee).toBe(.1)
    expect(data?.nav).toBe(500)
  })
  test('does not substitute an unrelated oracle estimate when yvUSD overlay is unavailable', async () => {
    const address = '0x696d02Db93291651ED510704c9b286841d506987'
    global.fetch = (async (input: string | URL | Request) => String(input).includes('/snapshot/')
      ? Response.json({ ...identity, address, performance: { oracle: { netAPY: .07 } } })
      : new Response('Unavailable', { status: 503 })) as typeof fetch
    expect((await resolvePowergloveCardData('1', address))?.expectedApy).toBeUndefined()
  })
})

describe('Katana APY parity with yearn.fi OG', () => {
  const cases = [
    { label: 'native plus app and fixed KAT rewards without double counting the estimate', native: .04, estimated: .49, app: .1, fixed: .35, total: .49 },
    { label: 'zero native rate with positive KAT rewards', native: 0, estimated: .4, app: .1, fixed: .35, total: .45 },
    { label: 'explicit zero rewards', native: .04, estimated: .2, app: 0, fixed: 0, total: .04 },
    { label: 'estimated native fallback when Oracle net APY is absent', native: undefined, estimated: .02, app: .03, fixed: .05, total: .1 },
  ]
  for (const example of cases) {
    test(example.label, async () => {
      const snapshot = {
        ...identity, chainId: 747474,
        apy: { weeklyNet: .02, monthlyNet: .03 },
        performance: {
          oracle: { netAPY: example.native },
          estimated: { apy: example.estimated, components: { katanaAppRewardsAPR: example.app, fixedRateKatanaRewards: example.fixed, steerPointsPerDollar: 999 } },
        },
      }
      global.fetch = (async () => Response.json(snapshot)) as typeof fetch
      const powerglove = await resolvePowergloveCardData('747474', identity.address)
      const yearn = await resolveStandardVaultOGData('747474', identity.address)
      expect(powerglove?.expectedApy).toBeCloseTo(example.total, 12)
      expect(`${(powerglove!.expectedApy! * 100).toFixed(2)}%`).toBe(yearn.estimatedApy)
      expect(powerglove?.weeklyApy).toBeCloseTo(.02 + example.app + example.fixed, 12)
      expect(powerglove?.monthlyApy).toBeCloseTo(.03 + example.app + example.fixed, 12)
      expect(`${(powerglove!.monthlyApy! * 100).toFixed(2)}%`).toBe(yearn.historicalApy)
    })
  }
})

test('Katana incentives preserve missing history and genuine zero periods', async () => {
  global.fetch = (async () => Response.json({
    ...identity, chainId: 747474, apy: { monthlyNet: 0 },
    performance: { estimated: { components: { katanaAppRewardsAPR: .03, fixedRateKatanaRewards: .02 } } },
  })) as typeof fetch
  const data = await resolvePowergloveCardData('747474', identity.address)
  expect(data?.weeklyApy).toBeUndefined()
  expect(data?.monthlyApy).toBeCloseTo(.05, 12)
})
