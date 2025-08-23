export const ALLOWED_CHAIN_IDS = [1, 10, 137, 250, 8453, 42161, 747474]
export const YBOLD_VAULT_ADDRESS = '0x9F4330700a36B29952869fac9b33f45EEdd8A3d8'
export const YBOLD_STAKING_ADDRESS =
  '0x23346B04a7f55b8760E5860AA5A77383D63491cD'

export function isValidChainID(chainID: string): boolean {
  return ALLOWED_CHAIN_IDS.includes(Number(chainID))
}

export function isValidEthereumAddress(address: string): boolean {
  return (
    /^0x[a-fA-F0-9]{40}$/.test(address) || /^[a-fA-F0-9]{40}$/.test(address)
  )
}

export function getChainName(chainId: number): string {
  switch (chainId) {
    case 1:
      return 'Ethereum'
    case 10:
      return 'Optimism'
    case 137:
      return 'Polygon'
    case 250:
      return 'Fantom'
    case 8453:
      return 'Base'
    case 42161:
      return 'Arbitrum'
    case 747474:
      return 'Katana'
    default:
      return `Chain ${chainId}`
  }
}

export function formatUSD(amount: number): string {
  if (amount < 1000) return `$${amount.toFixed(2)}`
  if (amount < 1e6) return `$${(amount / 1e3).toFixed(2)}K`
  if (amount < 1e9) return `$${(amount / 1e6).toFixed(2)}M`
  if (amount < 1e12) return `$${(amount / 1e9).toFixed(2)}B`
  return `$${(amount / 1e12).toFixed(1)}T`
}
