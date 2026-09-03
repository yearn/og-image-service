export const ALLOWED_CHAIN_IDS = [1, 10, 137, 250, 8453, 42161, 747474]
export const DEFAULT_YEARN_ASSETS_URI =
  'https://cdn.jsdelivr.net/gh/yearn/tokenassets@main'
export const YBOLD_VAULT_ADDRESS = '0x9F4330700a36B29952869fac9b33f45EEdd8A3d8'
export const YBOLD_STAKING_ADDRESS =
  '0x23346B04a7f55b8760E5860AA5A77383D63491cD'
export const YVUSD_CHAIN_ID = 1
export const YVUSD_UNLOCKED_ADDRESS =
  '0x696d02Db93291651ED510704c9b286841d506987'
export const YVUSD_LOCKED_ADDRESS =
  '0xAaaFEa48472f77563961Cdb53291DEDfB46F9040'

export function normalizeEthereumAddress(address: string): string {
  const withoutPrefix = address.replace(/^0x/i, '')
  return `0x${withoutPrefix}`
}

export function toComparableEthereumAddress(address: string): string {
  return normalizeEthereumAddress(address).toLowerCase()
}

export function isYvUsdAddress(chainID: string, address: string): boolean {
  if (Number(chainID) !== YVUSD_CHAIN_ID) return false
  const normalized = toComparableEthereumAddress(address)
  return (
    normalized === toComparableEthereumAddress(YVUSD_UNLOCKED_ADDRESS) ||
    normalized === toComparableEthereumAddress(YVUSD_LOCKED_ADDRESS)
  )
}

export function isYBoldAddress(
  chainID: string | number,
  address: string
): boolean {
  const normalized = toComparableEthereumAddress(address)
  return (
    Number(chainID) === 1 &&
    (normalized === toComparableEthereumAddress(YBOLD_VAULT_ADDRESS) ||
      normalized === toComparableEthereumAddress(YBOLD_STAKING_ADDRESS))
  )
}

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

export function normalizeYearnAssetsBaseUrl(
  baseUrl = process.env.BASE_YEARN_ASSETS_URI
): string {
  const trimmed = baseUrl?.trim()
  if (!trimmed) return DEFAULT_YEARN_ASSETS_URI

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const parsed = new URL(withProtocol)
    if (parsed.hostname === 'cdn.jsdelivr.net' && parsed.pathname === '/') {
      return DEFAULT_YEARN_ASSETS_URI
    }
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return DEFAULT_YEARN_ASSETS_URI
  }
}

export function getYearnTokenLogoUrl(
  chainID: string | number,
  address: string,
  baseUrl = process.env.BASE_YEARN_ASSETS_URI
): string {
  const normalizedBaseUrl = normalizeYearnAssetsBaseUrl(baseUrl)
  const tokenBaseUrl = /\/tokens?$/.test(normalizedBaseUrl)
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/tokens`

  return `${tokenBaseUrl}/${chainID}/${toComparableEthereumAddress(
    address
  )}/logo-128.png`
}
