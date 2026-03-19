import {
  formatUSD,
  getChainName,
  toComparableEthereumAddress,
  YVUSD_CHAIN_ID,
  YVUSD_LOCKED_ADDRESS,
  YVUSD_UNLOCKED_ADDRESS,
} from './data'
import { fetchVaultData, fetchYvUsdAprs } from './fetchers'

type YvUsdAprServiceVault = {
  address?: string
  apr?: number | string | null
  apy?: number | string | null
}

type YvUsdVaultData = {
  apr?: {
    netAPR?: number
    forwardAPR?: {
      netAPR?: number
    }
    points?: {
      monthAgo?: number
      weekAgo?: number
    }
  }
  tvl?: {
    tvl?: number
  }
}

export type YvUsdOGData = {
  iconPath: string
  name: string
  estimatedApyLocked: string
  estimatedApyUnlocked: string
  historicalApyLocked: string
  historicalApyUnlocked: string
  tvlUsd: string
  chainName: string
  address: string
}

function toFiniteNumber(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined) return null
  const parsed = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(parsed) ? parsed : null
}

function toNonNegativeNumber(value: number | null | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
    return 0
  return value
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}

export function getYvUsdAprServiceVault(
  aprServicePayload: any | null,
  address: string,
): YvUsdAprServiceVault | null {
  const normalizedTarget = toComparableEthereumAddress(address)
  return (Object.values(aprServicePayload || {}).find((vault) => {
    const candidate = (vault as YvUsdAprServiceVault | null)?.address
    return (
      typeof candidate === 'string' &&
      toComparableEthereumAddress(candidate) === normalizedTarget
    )
  }) || null) as YvUsdAprServiceVault | null
}

export function resolveYvUsdEstimatedApy(
  aprServiceVault: YvUsdAprServiceVault | null,
  vault: YvUsdVaultData | null,
): number {
  return (
    toFiniteNumber(aprServiceVault?.apy) ??
    toFiniteNumber(vault?.apr?.forwardAPR?.netAPR) ??
    toFiniteNumber(vault?.apr?.netAPR) ??
    0
  )
}

export function resolveYvUsdHistoricalApy(
  vault: YvUsdVaultData | null,
): number {
  const monthly = toFiniteNumber(vault?.apr?.points?.monthAgo) ?? 0
  const weekly = toFiniteNumber(vault?.apr?.points?.weekAgo) ?? 0
  return monthly > 0 ? monthly : weekly
}

export function resolveYvUsdCombinedTvl(
  unlockedVault: YvUsdVaultData | null,
  lockedVault: YvUsdVaultData | null,
): number {
  return (
    toNonNegativeNumber(toFiniteNumber(unlockedVault?.tvl?.tvl)) +
    toNonNegativeNumber(toFiniteNumber(lockedVault?.tvl?.tvl))
  )
}

export async function resolveYvUsdOGData(): Promise<YvUsdOGData> {
  const [unlockedVault, lockedVault, aprServicePayload] = await Promise.all([
    fetchVaultData(String(YVUSD_CHAIN_ID), YVUSD_UNLOCKED_ADDRESS),
    fetchVaultData(String(YVUSD_CHAIN_ID), YVUSD_LOCKED_ADDRESS),
    fetchYvUsdAprs(),
  ])

  const unlockedAprServiceVault = getYvUsdAprServiceVault(
    aprServicePayload,
    YVUSD_UNLOCKED_ADDRESS,
  )
  const lockedAprServiceVault = getYvUsdAprServiceVault(
    aprServicePayload,
    YVUSD_LOCKED_ADDRESS,
  )

  return {
    iconPath: '/graphics/yvUSD-seal.png',
    name: 'yvUSD',
    estimatedApyLocked: formatPercent(
      resolveYvUsdEstimatedApy(lockedAprServiceVault, lockedVault),
    ),
    estimatedApyUnlocked: formatPercent(
      resolveYvUsdEstimatedApy(unlockedAprServiceVault, unlockedVault),
    ),
    historicalApyLocked: formatPercent(resolveYvUsdHistoricalApy(lockedVault)),
    historicalApyUnlocked: formatPercent(
      resolveYvUsdHistoricalApy(unlockedVault),
    ),
    tvlUsd: formatUSD(resolveYvUsdCombinedTvl(unlockedVault, lockedVault)),
    chainName: getChainName(YVUSD_CHAIN_ID),
    address: YVUSD_UNLOCKED_ADDRESS,
  }
}
