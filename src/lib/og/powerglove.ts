import { ALLOWED_CHAIN_IDS, getChainName, isYBoldAddress, isYvUsdAddress, YBOLD_STAKING_ADDRESS } from './data'
import { fetchKatanaAprs, fetchKongVaultSnapshot, fetchYvUsdAprs, normalizeKongVaultSnapshot } from './fetchers'
import { calculateEstimatedAPY, getKatanaHistoricalApyBreakdown, hasKatanaRewardAprData } from './apy'
import { toFiniteNumber } from './number'
import { getYvUsdAprServiceVault } from './yvusd'

// Powerglove also supports Gnosis and Berachain; keep other brands unchanged.
export const POWERGLOVE_CHAIN_IDS = [...ALLOWED_CHAIN_IDS, 100, 80094]

type Numeric = number | string | null
export type PowergloveSnapshot = {
  address: string
  chainId: number
  name?: string
  symbol?: string
  apiVersion?: string
  inceptTime?: Numeric
  asset?: { symbol?: string }
  meta?: { name?: string }
  tvl?: { close?: Numeric }
  fees?: { managementFee?: Numeric; performanceFee?: Numeric }
  apy?: { weeklyNet?: Numeric; monthlyNet?: Numeric }
  performance?: {
    estimated?: { apy?: Numeric; apr?: Numeric; type?: string }
    oracle?: { netAPY?: Numeric; netAPR?: Numeric; apr?: Numeric; apy?: Numeric }
    historical?: { net?: Numeric; weeklyNet?: Numeric; monthlyNet?: Numeric }
  }
}
export type PowergloveCardData = {
  name: string
  symbol?: string
  version?: string
  deployed?: string
  chainID: number
  chainName: string
  asset?: string
  address: string
  expectedApy?: number
  weeklyApy?: number
  monthlyApy?: number
  nav?: number
  managementFee?: number
  performanceFee?: number
}

// Match Powerglove's Kong fee normalization: decimals or basis points.
function feeRate(value: unknown): number | undefined {
  const fee = toFiniteNumber(value)
  return fee === undefined || fee < 0 ? undefined : fee <= 1 ? fee : fee / 10_000
}

export function resolvePowergloveExpectedApy(snapshot: PowergloveSnapshot): number | undefined {
  const estimated = toFiniteNumber(snapshot.performance?.estimated?.apy)
  if (estimated !== undefined) return estimated
  const oracle = snapshot.performance?.oracle
  const netApy = toFiniteNumber(oracle?.netAPY)
  if (netApy !== undefined) return netApy
  let netApr = toFiniteNumber(oracle?.netAPR)
  if (netApr === undefined) {
    const grossApr = toFiniteNumber(oracle?.apr)
    const management = feeRate(snapshot.fees?.managementFee)
    const performance = feeRate(snapshot.fees?.performanceFee)
    // Do not invent fees when deriving a net rate from gross APR.
    if (grossApr === undefined || management === undefined || performance === undefined) return undefined
    netApr = Math.max(grossApr - management, 0) * (1 - Math.min(performance, 1))
  }
  return toFiniteNumber((1 + netApr / 52) ** 52 - 1)
}

export function mapPowergloveSnapshot(snapshot: PowergloveSnapshot): PowergloveCardData {
  const timestamp = toFiniteNumber(snapshot.inceptTime)
  const date = timestamp && timestamp > 0 ? new Date(timestamp * 1000) : undefined
  return {
    name: snapshot.name || snapshot.meta?.name || 'Yearn Vault',
    symbol: snapshot.symbol,
    version: snapshot.apiVersion,
    deployed: date && Number.isFinite(date.getTime()) ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : undefined,
    chainID: snapshot.chainId,
    chainName: snapshot.chainId === 100 ? 'GnosisChain' : snapshot.chainId === 80094 ? 'Berachain' : getChainName(snapshot.chainId),
    asset: snapshot.asset?.symbol,
    address: snapshot.address,
    expectedApy: resolvePowergloveExpectedApy(snapshot),
    weeklyApy: toFiniteNumber(snapshot.apy?.weeklyNet) ?? toFiniteNumber(snapshot.performance?.historical?.weeklyNet),
    monthlyApy: toFiniteNumber(snapshot.apy?.monthlyNet) ?? toFiniteNumber(snapshot.performance?.historical?.monthlyNet),
    nav: toFiniteNumber(snapshot.tvl?.close),
    managementFee: feeRate(snapshot.fees?.managementFee),
    performanceFee: feeRate(snapshot.fees?.performanceFee),
  }
}

export async function resolvePowergloveCardData(chainID: string, address: string): Promise<PowergloveCardData | null> {
  const snapshot: PowergloveSnapshot | null = await fetchKongVaultSnapshot(chainID, address)
  if (!snapshot || Number(snapshot.chainId) !== Number(chainID) || snapshot.address?.toLowerCase() !== address.toLowerCase()) return null
  const data = mapPowergloveSnapshot(snapshot)
  if (Number(chainID) === 747474) {
    // Use the same normalization, reward fallback, and total as the yearn.fi OG.
    const vault = normalizeKongVaultSnapshot(snapshot)
    const katanaAprs = hasKatanaRewardAprData(vault) ? undefined : await fetchKatanaAprs()
    // These are the native-rate inputs used by the shared Katana normalizer.
    // Check before normalization replaces missing values with zero. Known
    // incentives alone do not establish the complete expected vault APY.
    const { oracle, estimated, historical } = snapshot.performance || {}
    const hasNativeRate = [oracle?.netAPY, oracle?.apy, oracle?.apr, estimated?.apy, estimated?.apr, historical?.net]
      .some(value => toFiniteNumber(value) !== undefined)
    data.expectedApy = hasNativeRate ? calculateEstimatedAPY(vault, katanaAprs || undefined, null)[0] : undefined
    const incentives = getKatanaHistoricalApyBreakdown(vault, katanaAprs || undefined)?.kat ?? 0
    if (data.weeklyApy !== undefined) data.weeklyApy += incentives
    if (data.monthlyApy !== undefined) data.monthlyApy += incentives
  }
  if (isYBoldAddress(chainID, address)) {
    const staking = address.toLowerCase() === YBOLD_STAKING_ADDRESS.toLowerCase()
      ? snapshot : await fetchKongVaultSnapshot(chainID, YBOLD_STAKING_ADDRESS)
    // Staking yield cannot be replaced with the base vault's yield. Let the
    // route return an uncached, retryable 503 if its required snapshot fails.
    if (!staking || Number(staking.chainId) !== Number(chainID) || staking.address?.toLowerCase() !== YBOLD_STAKING_ADDRESS.toLowerCase()) return null
    const staked = mapPowergloveSnapshot(staking)
    const candidates = [staked.weeklyApy, resolvePowergloveExpectedApy({ ...staking, performance: { oracle: staking.performance?.oracle } })].filter((value): value is number => value !== undefined)
    data.name = 'yBOLD'
    data.symbol = 'yBOLD'
    data.expectedApy = candidates.length ? Math.max(...candidates) : undefined
    data.weeklyApy = staked.weeklyApy
    data.monthlyApy = staked.monthlyApy
    data.performanceFee = staked.performanceFee
  }
  if (isYvUsdAddress(chainID, address)) {
    const overlay = getYvUsdAprServiceVault(await fetchYvUsdAprs(), address)
    const estimate = snapshot.performance?.estimated
    data.expectedApy = toFiniteNumber(overlay?.apy) ?? (estimate?.type?.toLowerCase() === 'yvusd-estimated-apr' ? toFiniteNumber(estimate.apy) : undefined)
  }
  return data
}

export function powerglovePercent(value: number | undefined): string {
  return value === undefined ? '—' : `${(value * 100).toFixed(2).replace(/\.00$/, '')}%`
}
