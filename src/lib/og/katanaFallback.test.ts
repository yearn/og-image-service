import { afterEach, describe, expect, test } from 'bun:test'
import { resolvePowergloveCardData } from './powerglove'
import { resolveStandardVaultOGData } from './vaultData'

const originalFetch = global.fetch
const originalKatanaApi = process.env.KATANA_APR_SERVICE_API
const address = '0x80c34BD3A3569E126e7055831036aa7b212cB159'
const fallbackUrl = 'https://katana-apr.example/api/aprs'

afterEach(() => {
  global.fetch = originalFetch
  if (originalKatanaApi === undefined) delete process.env.KATANA_APR_SERVICE_API
  else process.env.KATANA_APR_SERVICE_API = originalKatanaApi
})

describe('Katana snapshot-to-service reward fallback', () => {
  const cases = [
    { label: 'missing reward components use the APR service', components: undefined, fallback: true },
    { label: 'invalid reward components use the APR service', components: { katanaAppRewardsAPR: null, fixedRateKatanaRewards: 'invalid' }, fallback: true },
    { label: 'explicit zero snapshot rewards take precedence over the service', components: { katanaAppRewardsAPR: 0, fixedRateKatanaRewards: 0 }, fallback: false },
  ]
  for (const example of cases) {
    test(example.label, async () => {
      process.env.KATANA_APR_SERVICE_API = fallbackUrl
      let serviceCalls = 0
      global.fetch = (async (input: string | URL | Request) => {
        if (String(input) === fallbackUrl) {
          serviceCalls++
          return Response.json({ [address.toLowerCase().slice(2)]: { apr: { extra: { katanaRewardsAPR: .1, FixedRateKatanaRewards: .2 } } } })
        }
        expect(String(input)).toContain('/snapshot/747474/')
        return Response.json({
          address, chainId: 747474,
          performance: {
            oracle: { netAPY: .05 },
            estimated: { components: example.components },
            historical: { weeklyNet: .02, monthlyNet: .03 },
          },
        })
      }) as typeof fetch
      const powerglove = await resolvePowergloveCardData('747474', address)
      const yearn = await resolveStandardVaultOGData('747474', address)
      const rewards = example.fallback ? .3 : 0
      expect(serviceCalls).toBe(example.fallback ? 2 : 0)
      expect(powerglove?.expectedApy).toBeCloseTo(.05 + rewards, 12)
      expect(powerglove?.weeklyApy).toBeCloseTo(.02 + rewards, 12)
      expect(powerglove?.monthlyApy).toBeCloseTo(.03 + rewards, 12)
      expect(`${(powerglove!.expectedApy! * 100).toFixed(2)}%`).toBe(yearn.estimatedApy)
      expect(`${(powerglove!.monthlyApy! * 100).toFixed(2)}%`).toBe(yearn.historicalApy)
    })
  }
})
