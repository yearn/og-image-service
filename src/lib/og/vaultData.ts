import {
  calculateEstimatedAPY,
  calculateHistoricalAPY,
  getKatanaEstimatedApyBreakdown,
  getKatanaHistoricalApyBreakdown,
  hasKatanaRewardAprData,
} from './apy'
import {
  formatUSD,
  getChainName,
  getYearnTokenLogoUrl,
  YBOLD_STAKING_ADDRESS,
  YBOLD_VAULT_ADDRESS,
} from './data'
import { fetchKatanaAprs, fetchVaultData, fetchYBoldApr } from './fetchers'

export type StandardVaultOGData = {
  icon: string
  name: string
  estimatedApy: string
  estimatedApyBreakdown?: string
  rewardsAPR?: string
  minBoost?: string
  historicalApy: string
  historicalApyBreakdown?: string
  tvlUsd: string
  chainName: string
  address: string
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}

function formatKatanaApyBreakdown(
  native: number,
  kat: number
): string {
  return `(${formatPercent(native)} native, ${formatPercent(kat)} KAT)`
}

export async function resolveStandardVaultOGData(
  chainID: string,
  address: string
): Promise<StandardVaultOGData> {
  const vault = await fetchVaultData(chainID, address)
  let katanaAprs: any | null = null
  if (chainID === '747474' && vault && !hasKatanaRewardAprData(vault)) {
    katanaAprs = await fetchKatanaAprs()
  }
  let yBoldApr: { estimatedAPY: number; historicalAPY: number } | null = null
  if (address.toLowerCase() === YBOLD_VAULT_ADDRESS.toLowerCase()) {
    yBoldApr = await fetchYBoldApr(chainID, YBOLD_STAKING_ADDRESS)
  }

  if (vault) {
    const [underlyingAPY, rewardsAPR] = calculateEstimatedAPY(
      vault,
      katanaAprs || undefined,
      yBoldApr
    )
    const hist = calculateHistoricalAPY(vault, katanaAprs || undefined, yBoldApr)
    const estimatedKatanaBreakdown = getKatanaEstimatedApyBreakdown(
      vault,
      katanaAprs || undefined
    )
    const historicalKatanaBreakdown = getKatanaHistoricalApyBreakdown(
      vault,
      katanaAprs || undefined
    )
    return {
      icon: getYearnTokenLogoUrl(chainID, vault.token.address),
      name: vault.name?.replace(/\s+Vault$/, '') || 'Yearn Vault',
      estimatedApy: `${(underlyingAPY * 100).toFixed(2)}%`,
      estimatedApyBreakdown: estimatedKatanaBreakdown
        ? formatKatanaApyBreakdown(
            estimatedKatanaBreakdown.native,
            estimatedKatanaBreakdown.kat
          )
        : undefined,
      rewardsAPR: rewardsAPR ? `${(rewardsAPR * 100).toFixed(2)}%` : undefined,
      minBoost: rewardsAPR ? `${(rewardsAPR * 10).toFixed(2)}%` : undefined,
      historicalApy: `${(hist * 100).toFixed(2)}%`,
      historicalApyBreakdown: historicalKatanaBreakdown
        ? formatKatanaApyBreakdown(
            historicalKatanaBreakdown.native,
            historicalKatanaBreakdown.kat
          )
        : undefined,
      tvlUsd: formatUSD(vault.tvl?.tvl || 0),
      chainName: getChainName(parseInt(chainID, 10)),
      address,
    }
  }

  return {
    icon: getYearnTokenLogoUrl(chainID, address),
    name: 'Yearn Vault',
    estimatedApy: '0.00%',
    historicalApy: '0.00%',
    tvlUsd: '$0',
    chainName: getChainName(parseInt(chainID, 10)),
    address,
  }
}
