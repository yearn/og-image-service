import { YBOLD_VAULT_ADDRESS } from './data'

export function calculateKatanaAPY(extra: Record<string, number>): number {
  const { katanaRewardsAPR: _legacy, ...rest } = extra || {}
  return Object.values(rest).reduce(
    (s, v) => s + (typeof v === 'number' ? v : 0),
    0
  )
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

  if (vault.chainID === 747474 && katanaAprs) {
    const normalized = vault.address.toLowerCase().replace('0x', '')
    const withPrefix = `0x${normalized}`
    const extra =
      katanaAprs[normalized]?.apr?.extra ||
      katanaAprs[withPrefix]?.apr?.extra ||
      katanaAprs[vault.address]?.apr?.extra
    const katAPY = extra ? calculateKatanaAPY(extra) : 0
    return [katAPY > 0 ? katAPY : 0, undefined]
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
  yBoldApr: { historicalAPY: number } | null
): number {
  if (
    vault.address.toLowerCase() === YBOLD_VAULT_ADDRESS.toLowerCase() &&
    yBoldApr
  )
    return yBoldApr.historicalAPY
  if (vault.chainID === 747474) return -1
  if (!vault?.apr?.points) return 0
  const monthly = vault.apr.points.monthAgo || 0
  const weekly = vault.apr.points.weekAgo || 0
  return monthly > 0 ? monthly : weekly
}
