import { toFiniteNumber } from './number'

const DEFAULT_KONG_REST_URL = 'https://kong.yearn.fi/api/rest'
const DEFAULT_YDAEMON_BASE_URL = 'https://ydaemon.yearn.fi'

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    const parsed = toFiniteNumber(value)
    if (typeof parsed === 'number') return parsed
  }
  return 0
}

function normalizeHttpsBaseUrl(rawValue: string | undefined, fallback: string): string {
  const normalizedFallback = fallback.replace(/\/+$/, '')
  const candidate = rawValue?.trim()

  if (!candidate) return normalizedFallback

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'https:') return normalizedFallback
    return parsed.toString().replace(/\/+$/, '')
  } catch {
    return normalizedFallback
  }
}

function getKongRestBaseUrl(): string {
  return normalizeHttpsBaseUrl(process.env.KONG_REST_URL, DEFAULT_KONG_REST_URL)
}

function getYDaemonBaseUrl(): string {
  return normalizeHttpsBaseUrl(process.env.YDAEMON_BASE_URI, DEFAULT_YDAEMON_BASE_URL)
}

async function fetchKongVaultSnapshot(
  chainID: string,
  address: string
): Promise<any | null> {
  const kongBaseUrl = getKongRestBaseUrl()
  return fetchJson(`${kongBaseUrl}/snapshot/${chainID}/${address}`)
}

async function fetchYDaemonVault(
  chainID: string,
  address: string
): Promise<any | null> {
  const yDaemonBaseUrl = getYDaemonBaseUrl()
  return fetchJson(`${yDaemonBaseUrl}/${chainID}/vaults/${address}`)
}

async function fetchJson(
  url: string,
  headers?: Record<string, string>
): Promise<any | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'og-image-service/1.0',
        ...headers,
      },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function normalizeYDaemonVault(vault: any): any | null {
  if (!vault?.address) return null

  const chainID = pickNumber(vault.chainID, vault.chainId)
  if (!chainID) return null

  return {
    ...vault,
    chainID,
    token: vault.token
      ? {
          ...vault.token,
          decimals: pickNumber(vault.token.decimals, vault.decimals, 18),
        }
      : {
          address: vault.address,
          name: vault.name || 'Vault Token',
          symbol: vault.symbol || '',
          decimals: pickNumber(vault.decimals, 18),
        },
  }
}

export function normalizeKongVaultSnapshot(snapshot: any): any | null {
  if (!snapshot?.address || !snapshot?.chainId) return null

  const asset = snapshot.asset
  const historical = snapshot.performance?.historical
  const oracle = snapshot.performance?.oracle
  const estimated = snapshot.performance?.estimated
  const estimatedComponents = estimated?.components
  const isKatanaVault = snapshot.chainId === 747474

  const fixedRateKatanaRewards =
    toFiniteNumber(estimatedComponents?.fixedRateKatanaRewards) ??
    toFiniteNumber(estimatedComponents?.FixedRateKatanaRewards) ??
    0

  const forwardNetAPR = isKatanaVault
    ? pickNumber(
        oracle?.netAPY,
        oracle?.apy,
        oracle?.apr,
        estimated?.apy,
        estimated?.apr,
        historical?.net
      )
    : pickNumber(
        estimated?.apy,
        estimated?.apr,
        oracle?.netAPY,
        oracle?.apy,
        oracle?.apr,
        historical?.net
      )

  return {
    address: snapshot.address,
    chainID: snapshot.chainId,
    name: snapshot.name || snapshot.meta?.name || snapshot.meta?.displayName || '',
    token: {
      address: asset?.address || snapshot.address,
      name: asset?.name || snapshot.name || 'Vault Token',
      symbol: asset?.symbol || snapshot.symbol || '',
      decimals: pickNumber(asset?.decimals, snapshot.decimals, 18),
    },
    tvl: {
      tvl: pickNumber(snapshot.tvl?.close),
    },
    apr: {
      type:
        snapshot.apy?.label ||
        estimated?.type ||
        ((oracle?.netAPY !== null && oracle?.netAPY !== undefined) ||
        (oracle?.apy !== null && oracle?.apy !== undefined)
          ? 'oracle'
          : 'unknown'),
      netAPR: pickNumber(snapshot.apy?.net, historical?.net),
      extra: {
        stakingRewardsAPR: 0,
        gammaRewardAPR: 0,
        katanaBonusAPY: pickNumber(estimatedComponents?.katanaBonusAPY),
        katanaAppRewardsAPR: pickNumber(estimatedComponents?.katanaAppRewardsAPR),
        steerPointsPerDollar: pickNumber(estimatedComponents?.steerPointsPerDollar),
        fixedRateKatanaRewards,
      },
      points: {
        weekAgo: pickNumber(snapshot.apy?.weeklyNet, historical?.weeklyNet),
        monthAgo: pickNumber(snapshot.apy?.monthlyNet, historical?.monthlyNet),
        inception: pickNumber(snapshot.apy?.inceptionNet, historical?.inceptionNet),
      },
      forwardAPR: {
        type: estimated ? 'estimated' : oracle ? 'oracle' : '',
        netAPR: forwardNetAPR,
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
  }
}

export async function fetchVaultData(chainID: string, address: string) {
  const snapshot = await fetchKongVaultSnapshot(chainID, address)
  const normalizedSnapshot = normalizeKongVaultSnapshot(snapshot)
  if (normalizedSnapshot) return normalizedSnapshot

  const vault = await fetchYDaemonVault(chainID, address)
  return normalizeYDaemonVault(vault)
}

export async function fetchKatanaAprs(): Promise<any | null> {
  const url = process.env.KATANA_APR_SERVICE_API
  if (!url) return null
  return fetchJson(url)
}

export async function fetchYvUsdAprs(): Promise<any | null> {
  const url = (
    process.env.YVUSD_APR_SERVICE_API ||
    'https://yearn-yvusd-apr-service.vercel.app/api/aprs'
  ).replace(/\/$/, '')
  if (!url.startsWith('https://')) return null
  return fetchJson(url, { Accept: 'application/json' })
}

export async function fetchYBoldApr(
  chainID: string,
  stakingAddress: string
): Promise<{ estimatedAPY: number; historicalAPY: number } | null> {
  if (chainID !== '1') return null

  const stakingSnapshot = await fetchKongVaultSnapshot(chainID, stakingAddress)
  const normalizedStakingSnapshot = normalizeKongVaultSnapshot(stakingSnapshot)
  if (normalizedStakingSnapshot?.apr) {
    const estimatedAPY =
      toFiniteNumber(stakingSnapshot?.performance?.oracle?.netAPY) ??
      toFiniteNumber(stakingSnapshot?.performance?.oracle?.apy) ??
      toFiniteNumber(stakingSnapshot?.performance?.oracle?.apr) ??
      toFiniteNumber(normalizedStakingSnapshot.apr.forwardAPR?.netAPR) ??
      toFiniteNumber(normalizedStakingSnapshot.apr.netAPR) ??
      0

    return {
      estimatedAPY,
      historicalAPY: normalizedStakingSnapshot.apr.netAPR || 0,
    }
  }

  const st = normalizeYDaemonVault(await fetchYDaemonVault(chainID, stakingAddress))
  if (!st?.apr) return null
  return {
    estimatedAPY: st.apr.forwardAPR?.netAPR || st.apr.netAPR || 0,
    historicalAPY: st.apr.netAPR || 0,
  }
}
