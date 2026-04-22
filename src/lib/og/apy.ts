import { YBOLD_VAULT_ADDRESS } from './data'

const KATANA_CHAIN_ID = 747474

type KatanaRewardAprData = {
  katanaAppRewardsAPR?: number
  fixedRateKatanaRewards?: number
}

export type KatanaApyBreakdown = {
  native: number
  kat: number
}

function toFiniteNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed)
    ? parsed
    : undefined
}

function getKatanaRecordForVault(vault: any, katanaAprs: any | undefined): any {
  if (!vault?.address || !katanaAprs) return undefined

  const normalized = vault.address.toLowerCase().replace(/^0x/, '')
  const withPrefix = `0x${normalized}`

  return (
    katanaAprs[normalized] ||
    katanaAprs[withPrefix] ||
    katanaAprs[vault.address] ||
    katanaAprs[vault.address.toLowerCase()]
  )
}

export function getKatanaRewardAprData(
  record: any
): KatanaRewardAprData | undefined {
  const extra = record?.apr?.extra
  if (!extra) return undefined

  const katanaAppRewardsAPR =
    toFiniteNumber(extra.katanaAppRewardsAPR) ??
    toFiniteNumber(extra.katanaRewardsAPR)
  const fixedRateKatanaRewards =
    toFiniteNumber(extra.fixedRateKatanaRewards) ??
    toFiniteNumber(extra.FixedRateKatanaRewards)

  if (
    katanaAppRewardsAPR === undefined &&
    fixedRateKatanaRewards === undefined
  ) {
    return undefined
  }

  return {
    katanaAppRewardsAPR,
    fixedRateKatanaRewards,
  }
}

export function hasKatanaRewardAprData(record: any): boolean {
  return getKatanaRewardAprData(record) !== undefined
}

function getKatanaRewardAprDataForVault(
  vault: any,
  katanaAprs: any | undefined
): KatanaRewardAprData | undefined {
  return (
    getKatanaRewardAprData(vault) ??
    getKatanaRewardAprData(getKatanaRecordForVault(vault, katanaAprs))
  )
}

function calculateKatanaRewardApr(
  data: KatanaRewardAprData | undefined
): number {
  return (data?.katanaAppRewardsAPR || 0) + (data?.fixedRateKatanaRewards || 0)
}

function getHistoricalBaseAPY(vault: any): number | undefined {
  if (!vault?.apr?.points) return undefined

  const monthly = toFiniteNumber(vault.apr.points.monthAgo)
  if (typeof monthly === 'number' && monthly > 0) return monthly

  const weekly = toFiniteNumber(vault.apr.points.weekAgo)
  if (typeof weekly === 'number') return weekly

  return monthly
}

export function getKatanaEstimatedApyBreakdown(
  vault: any,
  katanaAprs: any | undefined
): KatanaApyBreakdown | undefined {
  if (vault?.chainID !== KATANA_CHAIN_ID) return undefined

  const katanaRewardAprData = getKatanaRewardAprDataForVault(vault, katanaAprs)
  if (!katanaRewardAprData) return undefined

  return {
    native:
      toFiniteNumber(vault.apr?.forwardAPR?.netAPR) ??
      toFiniteNumber(vault.apr?.netAPR) ??
      0,
    kat: calculateKatanaRewardApr(katanaRewardAprData),
  }
}

export function getKatanaHistoricalApyBreakdown(
  vault: any,
  katanaAprs: any | undefined
): KatanaApyBreakdown | undefined {
  if (vault?.chainID !== KATANA_CHAIN_ID) return undefined

  const katanaRewardAprData = getKatanaRewardAprDataForVault(vault, katanaAprs)
  const native = getHistoricalBaseAPY(vault)

  if (!katanaRewardAprData || typeof native !== 'number') return undefined

  return {
    native,
    kat: calculateKatanaRewardApr(katanaRewardAprData),
  }
}

export function calculateEstimatedAPY(
  vault: any,
  katanaAprs: any | undefined,
  yBoldApr: { estimatedAPY: number } | null
): [number, number | undefined] {
  if (!vault?.apr) return [0, undefined]

  if (
    vault.address.toLowerCase() === YBOLD_VAULT_ADDRESS.toLowerCase() &&
    yBoldApr
  )
    return [yBoldApr.estimatedAPY || 0, undefined]

  const katanaEstimatedBreakdown = getKatanaEstimatedApyBreakdown(vault, katanaAprs)
  if (katanaEstimatedBreakdown) {
    return [katanaEstimatedBreakdown.native + katanaEstimatedBreakdown.kat, undefined]
  }

  const sumRewards =
    (vault.apr.extra?.stakingRewardsAPR || 0) +
    (vault.apr.extra?.gammaRewardAPR || 0)

  const underlying = vault.apr.forwardAPR?.netAPR || vault.apr.netAPR || 0
  const rewards = sumRewards > 0 ? sumRewards : undefined
  return [underlying, rewards]
}

export function calculateHistoricalAPY(
  vault: any,
  katanaAprs: any | undefined,
  yBoldApr: { historicalAPY: number } | null
): number {
  if (
    vault.address.toLowerCase() === YBOLD_VAULT_ADDRESS.toLowerCase() &&
    yBoldApr
  )
    return yBoldApr.historicalAPY

  const katanaHistoricalBreakdown = getKatanaHistoricalApyBreakdown(vault, katanaAprs)
  if (katanaHistoricalBreakdown) {
    return katanaHistoricalBreakdown.native + katanaHistoricalBreakdown.kat
  }

  return getHistoricalBaseAPY(vault) || 0
}
