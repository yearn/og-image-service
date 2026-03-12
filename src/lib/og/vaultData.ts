import { calculateEstimatedAPY, calculateHistoricalAPY } from './apy'
import {
  formatUSD,
  getChainName,
  normalizeEthereumAddress,
  YBOLD_STAKING_ADDRESS,
  YBOLD_VAULT_ADDRESS,
} from './data'
import { fetchKatanaAprs, fetchVaultData, fetchYBoldApr } from './fetchers'

export type StandardVaultOGData = {
  icon: string
  name: string
  estimatedApy: string
  rewardsAPR?: string
  minBoost?: string
  historicalApy: string
  tvlUsd: string
  chainName: string
  address: string
}

export async function resolveStandardVaultOGData(
  chainID: string,
  address: string
): Promise<StandardVaultOGData> {
  const normalizedAddress = normalizeEthereumAddress(address)
  const vault = await fetchVaultData(chainID, normalizedAddress)
  let katanaAprs: any | null = null
  if (chainID === '747474') katanaAprs = await fetchKatanaAprs()
  let yBoldApr: { estimatedAPY: number; historicalAPY: number } | null = null
  if (normalizedAddress === YBOLD_VAULT_ADDRESS.toLowerCase()) {
    yBoldApr = await fetchYBoldApr(chainID, YBOLD_STAKING_ADDRESS)
  }

  if (vault) {
    const [underlyingAPY, rewardsAPR] = calculateEstimatedAPY(
      vault,
      katanaAprs || undefined,
      yBoldApr
    )
    const hist = calculateHistoricalAPY(vault, yBoldApr)
    return {
      icon: `${
        process.env.BASE_YEARN_ASSETS_URI
      }/${chainID}/${vault.token.address.toLowerCase()}/logo-128.png`,
      name: vault.name?.replace(/\s+Vault$/, '') || 'Yearn Vault',
      estimatedApy: `${(underlyingAPY * 100).toFixed(2)}%`,
      rewardsAPR: rewardsAPR ? `${(rewardsAPR * 100).toFixed(2)}%` : undefined,
      minBoost: rewardsAPR ? `${(rewardsAPR * 10).toFixed(2)}%` : undefined,
      historicalApy: hist === -1 ? '--%' : `${(hist * 100).toFixed(2)}%`,
      tvlUsd: formatUSD(vault.tvl?.tvl || 0),
      chainName: getChainName(parseInt(chainID, 10)),
      address: normalizedAddress,
    }
  }

  return {
    icon: `${
      process.env.BASE_YEARN_ASSETS_URI
    }/${chainID}/${normalizedAddress.toLowerCase()}/logo-128.png`,
    name: 'Yearn Vault',
    estimatedApy: '0.00%',
    historicalApy: '0.00%',
    tvlUsd: '$0',
    chainName: getChainName(parseInt(chainID, 10)),
    address: normalizedAddress,
  }
}
