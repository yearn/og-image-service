import { afterEach, describe, expect, mock, test } from 'bun:test'
import { fetchVaultData, fetchYBoldApr, normalizeKongVaultSnapshot } from './fetchers'

const ORIGINAL_FETCH = global.fetch
const ORIGINAL_KONG_REST_URL = process.env.KONG_REST_URL
const ORIGINAL_YDAEMON_BASE_URI = process.env.YDAEMON_BASE_URI

afterEach(() => {
  global.fetch = ORIGINAL_FETCH
  if (ORIGINAL_KONG_REST_URL === undefined) {
    delete process.env.KONG_REST_URL
  } else {
    process.env.KONG_REST_URL = ORIGINAL_KONG_REST_URL
  }
  if (ORIGINAL_YDAEMON_BASE_URI === undefined) {
    delete process.env.YDAEMON_BASE_URI
  } else {
    process.env.YDAEMON_BASE_URI = ORIGINAL_YDAEMON_BASE_URI
  }
})

describe('Kong vault snapshot normalization', () => {
  test('maps Kong snapshot fields into the OG vault shape for Katana vaults', () => {
    const normalized = normalizeKongVaultSnapshot({
      address: '0x80c34BD3A3569E126e7055831036aa7b212cB159',
      chainId: 747474,
      name: 'vbUSDC yVault',
      symbol: 'yvvbUSDC',
      decimals: 6,
      asset: {
        address: '0x203A662b0BD271A6ed5a60EdFbd04bFce608FD36',
        name: 'Vault Bridge USDC',
        symbol: 'vbUSDC',
        decimals: '6',
      },
      tvl: {
        close: 18806574.538983293,
      },
      performance: {
        oracle: {
          apr: 0.06566843618088732,
          apy: 0.06782834953930439,
          netAPY: 0.06123456789,
        },
        estimated: {
          type: 'katana-estimated-apr',
          components: {
            katanaBonusAPY: 0,
            katanaAppRewardsAPR: 0.020118608540646715,
            steerPointsPerDollar: 0.227,
            fixedRateKatanaRewards: 0.032847499999999995,
          },
        },
        historical: {
          net: 0.008555529616836255,
          weeklyNet: 0.008555529616836255,
          monthlyNet: 0.00921756354738168,
          inceptionNet: 0.021401895676158356,
        },
      },
    })

    expect(normalized).toEqual({
      address: '0x80c34BD3A3569E126e7055831036aa7b212cB159',
      chainID: 747474,
      name: 'vbUSDC yVault',
      token: {
        address: '0x203A662b0BD271A6ed5a60EdFbd04bFce608FD36',
        name: 'Vault Bridge USDC',
        symbol: 'vbUSDC',
        decimals: 6,
      },
      tvl: {
        tvl: 18806574.538983293,
      },
      apr: {
        type: 'katana-estimated-apr',
        netAPR: 0.008555529616836255,
        extra: {
          stakingRewardsAPR: 0,
          gammaRewardAPR: 0,
          katanaBonusAPY: 0,
          katanaAppRewardsAPR: 0.020118608540646715,
          steerPointsPerDollar: 0.227,
          fixedRateKatanaRewards: 0.032847499999999995,
        },
        points: {
          weekAgo: 0.008555529616836255,
          monthAgo: 0.00921756354738168,
          inception: 0.021401895676158356,
        },
        forwardAPR: {
          type: 'estimated',
          netAPR: 0.06123456789,
          composite: {
            boost: 0,
            poolAPY: 0,
            boostedAPR: 0,
            baseAPR: 0,
            cvxAPR: 0,
            rewardsAPR: 0,
            v3OracleCurrentAPR: 0,
            v3OracleStratRatioAPR: 0,
            keepCRV: 0,
            keepVELO: 0,
            cvxKeepCRV: 0,
          },
        },
      },
    })
  })

  test('fetches Kong snapshots from the default REST base URL', async () => {
    delete process.env.KONG_REST_URL

    const fetchMock = mock(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe(
        'https://kong.yearn.fi/api/rest/snapshot/747474/0x80c34BD3A3569E126e7055831036aa7b212cB159'
      )

      return {
        ok: true,
        json: async () => ({
          address: '0x80c34BD3A3569E126e7055831036aa7b212cB159',
          chainId: 747474,
          name: 'vbUSDC yVault',
          symbol: 'yvvbUSDC',
          decimals: 6,
          asset: {
            address: '0x203A662b0BD271A6ed5a60EdFbd04bFce608FD36',
            name: 'Vault Bridge USDC',
            symbol: 'vbUSDC',
            decimals: '6',
          },
          tvl: { close: 10 },
          performance: {
            historical: { net: 0.01, weeklyNet: 0.01, monthlyNet: 0.02, inceptionNet: 0.03 },
          },
        }),
      } as Response
    })

    global.fetch = fetchMock as typeof fetch

    const vault = await fetchVaultData(
      '747474',
      '0x80c34BD3A3569E126e7055831036aa7b212cB159'
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(vault?.name).toBe('vbUSDC yVault')
    expect(vault?.tvl?.tvl).toBe(10)
  })

  test('falls back to yDaemon when Kong snapshot fetching fails', async () => {
    delete process.env.KONG_REST_URL
    delete process.env.YDAEMON_BASE_URI

    const fetchMock = mock(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url === 'https://kong.yearn.fi/api/rest/snapshot/747474/0x80c34BD3A3569E126e7055831036aa7b212cB159') {
        return {
          ok: false,
          status: 403,
        } as Response
      }

      if (url === 'https://ydaemon.yearn.fi/747474/vaults/0x80c34BD3A3569E126e7055831036aa7b212cB159') {
        return {
          ok: true,
          json: async () => ({
            address: '0x80c34BD3A3569E126e7055831036aa7b212cB159',
            chainID: 747474,
            name: 'USDC yVault',
            token: {
              address: '0x203A662b0BD271A6ed5a60EdFbd04bFce608FD36',
              name: 'Vault Bridge USDC',
              symbol: 'vbUSDC',
              decimals: 6,
            },
            tvl: { tvl: 18806547.346547082 },
            apr: {
              netAPR: 0.009217438151773116,
              points: {
                weekAgo: 0.00860720591038322,
                monthAgo: 0.009217438151773116,
              },
              extra: {},
              forwardAPR: {
                netAPR: null,
              },
            },
          }),
        } as Response
      }

      throw new Error(`Unexpected fetch: ${url}`)
    })

    global.fetch = fetchMock as typeof fetch

    const vault = await fetchVaultData(
      '747474',
      '0x80c34BD3A3569E126e7055831036aa7b212cB159'
    )

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(vault?.name).toBe('USDC yVault')
    expect(vault?.chainID).toBe(747474)
    expect(vault?.token.decimals).toBe(6)
    expect(vault?.tvl?.tvl).toBe(18806547.346547082)
  })

  test('prefers the ysYBOLD staking snapshot oracle netAPY for yBOLD estimated APY', async () => {
    delete process.env.KONG_REST_URL

    const fetchMock = mock(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe(
        'https://kong.yearn.fi/api/rest/snapshot/1/0x23346B04a7f55b8760E5860AA5A77383D63491cD'
      )

      return {
        ok: true,
        json: async () => ({
          address: '0x23346B04a7f55b8760E5860AA5A77383D63491cD',
          chainId: 1,
          name: 'Staked yBOLD',
          symbol: 'ysyBOLD',
          decimals: 18,
          asset: {
            address: '0x9F4330700a36B29952869fac9b33f45EEdd8A3d8',
            name: 'yBOLD',
            symbol: 'yBOLD',
            decimals: '18',
          },
          apy: {
            net: 0.04639864387148984,
          },
          tvl: { close: 1 },
          performance: {
            historical: { net: 0.04639864387148984 },
            oracle: {
              netAPY: 0.0344,
              apy: 0.0355,
              apr: 0.0349,
            },
          },
        }),
      } as Response
    })

    global.fetch = fetchMock as typeof fetch

    const apr = await fetchYBoldApr(
      '1',
      '0x23346B04a7f55b8760E5860AA5A77383D63491cD'
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(apr).toEqual({
      estimatedAPY: 0.0344,
      historicalAPY: 0.04639864387148984,
    })
  })

  test('falls back to the ysYBOLD staking snapshot oracle APY when netAPY is unavailable', async () => {
    delete process.env.KONG_REST_URL

    const fetchMock = mock(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe(
        'https://kong.yearn.fi/api/rest/snapshot/1/0x23346B04a7f55b8760E5860AA5A77383D63491cD'
      )

      return {
        ok: true,
        json: async () => ({
          address: '0x23346B04a7f55b8760E5860AA5A77383D63491cD',
          chainId: 1,
          name: 'Staked yBOLD',
          symbol: 'ysyBOLD',
          decimals: 18,
          asset: {
            address: '0x9F4330700a36B29952869fac9b33f45EEdd8A3d8',
            name: 'yBOLD',
            symbol: 'yBOLD',
            decimals: '18',
          },
          apy: {
            net: 0.04639864387148984,
          },
          tvl: { close: 1 },
          performance: {
            historical: { net: 0.04639864387148984 },
            oracle: {
              apy: 0.0355,
              apr: 0.0349,
            },
          },
        }),
      } as Response
    })

    global.fetch = fetchMock as typeof fetch

    const apr = await fetchYBoldApr(
      '1',
      '0x23346B04a7f55b8760E5860AA5A77383D63491cD'
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(apr).toEqual({
      estimatedAPY: 0.0355,
      historicalAPY: 0.04639864387148984,
    })
  })

  test('falls back to yDaemon APR values for yBOLD when Kong is unavailable', async () => {
    delete process.env.KONG_REST_URL
    delete process.env.YDAEMON_BASE_URI

    const fetchMock = mock(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url === 'https://kong.yearn.fi/api/rest/snapshot/1/0x23346B04a7f55b8760E5860AA5A77383D63491cD') {
        return {
          ok: false,
          status: 403,
        } as Response
      }

      if (url === 'https://ydaemon.yearn.fi/1/vaults/0x23346B04a7f55b8760E5860AA5A77383D63491cD') {
        return {
          ok: true,
          json: async () => ({
            address: '0x23346B04a7f55b8760E5860AA5A77383D63491cD',
            chainID: 1,
            name: 'Staked yBOLD',
            token: {
              address: '0x9F4330700a36B29952869fac9b33f45EEdd8A3d8',
              name: 'yBOLD',
              symbol: 'yBOLD',
              decimals: 18,
            },
            apr: {
              netAPR: 0.04639864387148984,
              points: {
                weekAgo: 0.0549088591759741,
                monthAgo: 0.04639864387148984,
              },
              extra: {},
              forwardAPR: {
                netAPR: null,
              },
            },
          }),
        } as Response
      }

      throw new Error(`Unexpected fetch: ${url}`)
    })

    global.fetch = fetchMock as typeof fetch

    const apr = await fetchYBoldApr(
      '1',
      '0x23346B04a7f55b8760E5860AA5A77383D63491cD'
    )

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(apr).toEqual({
      estimatedAPY: 0.04639864387148984,
      historicalAPY: 0.04639864387148984,
    })
  })
})
