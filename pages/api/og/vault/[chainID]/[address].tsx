/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { TypeMarkYearnNaughty } from '@lib/icons/TypeMarkYearn-naughty'

export const runtime = 'edge'

// Brand config
const BRANDS = {
  yearn: {
    gradient: 'linear-gradient(225deg, #b51055ff 0%, #263490ff 100%)',
    cta: 'Earn With Yearn',
    logoColor: '#FFFFFF',
  },
  bearn: {
    gradient: 'linear-gradient(225deg, #004bff 0%, #00c2ff 100%)',
    cta: 'Built by Mom',
    logoColor: '#FFFFFF',
  },
} as const

const ALLOWED_CHAIN_IDS = [1, 10, 137, 250, 8453, 42161, 747474]
const YBOLD_VAULT_ADDRESS = '0x9F4330700a36B29952869fac9b33f45EEdd8A3d8'
const YBOLD_STAKING_ADDRESS = '0x23346B04a7f55b8760E5860AA5A77383D63491cD'

function isValidChainID(chainID: string): boolean {
  return ALLOWED_CHAIN_IDS.includes(Number(chainID))
}

function isValidEthereumAddress(address: string): boolean {
  return (
    /^0x[a-fA-F0-9]{40}$/.test(address) || /^[a-fA-F0-9]{40}$/.test(address)
  )
}

function getChainName(chainId: number): string {
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

function formatUSD(amount: number): string {
  if (amount < 1000) return `$${amount.toFixed(2)}`
  if (amount < 1e6) return `$${(amount / 1e3).toFixed(2)}K`
  if (amount < 1e9) return `$${(amount / 1e6).toFixed(2)}M`
  if (amount < 1e12) return `$${(amount / 1e9).toFixed(2)}B`
  return `$${(amount / 1e12).toFixed(1)}T`
}

async function fetchVaultData(chainID: string, address: string) {
  const baseUri = process.env.YDAEMON_BASE_URI
  if (!baseUri || !baseUri.startsWith('https://')) return null
  try {
    const res = await fetch(
      `${baseUri}/${chainID}/vault/${address}?strategiesDetails=withDetails&strategiesCondition=inQueue`,
      {
        headers: { 'User-Agent': 'og-image-service/1.0' },
        signal: AbortSignal.timeout(10_000),
      }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function fetchKatanaAprs(): Promise<any | null> {
  const url = process.env.KATANA_APR_SERVICE_API
  if (!url) return null
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'og-image-service/1.0' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function fetchYBoldApr(
  chainID: string
): Promise<{ estimatedAPY: number; historicalAPY: number } | null> {
  if (chainID !== '1') return null
  const baseUri = process.env.YDAEMON_BASE_URI
  if (!baseUri || !baseUri.startsWith('https://')) return null
  try {
    const res = await fetch(
      `${baseUri}/${chainID}/vault/${YBOLD_STAKING_ADDRESS}?strategiesDetails=withDetails&strategiesCondition=inQueue`,
      {
        headers: { 'User-Agent': 'og-image-service/1.0' },
        signal: AbortSignal.timeout(10_000),
      }
    )
    if (!res.ok) return null
    const st = await res.json()
    if (!st?.apr) return null
    return {
      estimatedAPY: st.apr.forwardAPR?.netAPR || st.apr.netAPR || 0,
      historicalAPY: st.apr.netAPR || 0,
    }
  } catch {
    return null
  }
}

function calculateKatanaAPY(extra: Record<string, number>): number {
  const { katanaRewardsAPR: _legacy, ...rest } = extra || {}
  return Object.values(rest).reduce(
    (s, v) => s + (typeof v === 'number' ? v : 0),
    0
  )
}

function calculateEstimatedAPY(
  vault: any,
  katanaAprs: any | null,
  yBoldApr: { estimatedAPY: number } | null
): number {
  if (!vault?.apr) return 0
  if (
    vault.address.toLowerCase() === YBOLD_VAULT_ADDRESS.toLowerCase() &&
    yBoldApr
  )
    return yBoldApr.estimatedAPY
  if (vault.chainID === 747474 && katanaAprs) {
    const normalized = vault.address.toLowerCase().replace('0x', '')
    const withPrefix = `0x${normalized}`
    const extra =
      katanaAprs[normalized]?.apr?.extra ||
      katanaAprs[withPrefix]?.apr?.extra ||
      katanaAprs[vault.address]?.apr?.extra
    return extra ? calculateKatanaAPY(extra) : 0
  }
  const sumRewards =
    (vault.apr.extra?.stakingRewardsAPR || 0) +
    (vault.apr.extra?.gammaRewardAPR || 0)
  if (vault.apr.forwardAPR?.type === '' || !vault.apr.forwardAPR?.type) {
    if ((vault.apr.extra?.stakingRewardsAPR || 0) > 0)
      return (vault.apr.extra.stakingRewardsAPR || 0) + (vault.apr.netAPR || 0)
    return vault.apr.netAPR || 0
  }
  if (
    vault.chainID === 1 &&
    (vault.apr.forwardAPR.composite?.boost || 0) > 0 &&
    !vault.apr.extra?.stakingRewardsAPR
  ) {
    return vault.apr.forwardAPR.netAPR || 0
  }
  if (sumRewards > 0) return sumRewards + (vault.apr.forwardAPR.netAPR || 0)
  const hasCurrent = (vault.apr.forwardAPR?.netAPR || 0) > 0
  if (hasCurrent) return vault.apr.forwardAPR.netAPR
  return vault.apr.netAPR || 0
}

function calculateHistoricalAPY(
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

export default async function handler(req: NextRequest) {
  const url = req.url || req.nextUrl?.pathname || ''
  const match = url.match(/\/api\/og\/vault\/(\d+)\/([a-fA-F0-9x]+)/i)
  const chainID = match?.[1] || '1'
  const address = match?.[2] || ''
  if (!isValidChainID(chainID) || !isValidEthereumAddress(address))
    return new Response('Invalid chainID or address', { status: 400 })

  const brandKey = (req.nextUrl?.searchParams.get('brand') ||
    'yearn') as keyof typeof BRANDS
  const brand = BRANDS[brandKey] || BRANDS.yearn

  const vault = await fetchVaultData(chainID, address)
  let katanaAprs: any | null = null
  if (chainID === '747474') katanaAprs = await fetchKatanaAprs()
  let yBoldApr: { estimatedAPY: number; historicalAPY: number } | null = null
  if (address.toLowerCase() === YBOLD_VAULT_ADDRESS.toLowerCase())
    yBoldApr = await fetchYBoldApr(chainID)

  const data = (() => {
    if (vault) {
      const est = calculateEstimatedAPY(vault, katanaAprs, yBoldApr)
      const hist = calculateHistoricalAPY(vault, yBoldApr)
      return {
        icon: `${process.env.BASE_YEARN_ASSETS_URI}/${chainID}/${vault.token.address}/logo-128.png`,
        name: vault.name?.replace(/\s+Vault$/, '') || 'Yearn Vault',
        estimatedApy: `${(est * 100).toFixed(2)}%`,
        historicalApy: hist === -1 ? '--%' : `${(hist * 100).toFixed(2)}%`,
        tvlUsd: formatUSD(vault.tvl?.tvl || 0),
        chainName: getChainName(parseInt(chainID, 10)),
      }
    }
    return {
      icon: `${process.env.BASE_YEARN_ASSETS_URI}/${chainID}/${address}/logo-128.png`,
      name: 'Yearn Vault',
      estimatedApy: '0.00%',
      historicalApy: '0.00%',
      tvlUsd: '$0',
      chainName: getChainName(parseInt(chainID, 10)),
    }
  })()

  const defaultAllowed = [
    'yearn.fi',
    'localhost:3000',
    'localhost',
    'app.yearn.fi',
  ]
  const allowedHosts = (process.env.ALLOWED_HOSTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const allowed = allowedHosts.length ? allowedHosts : defaultAllowed
  const rawOrigin =
    req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
  const originHost = rawOrigin.split(':')[0]
  const originPort = rawOrigin.split(':')[1]
  const validatedOrigin = allowed.includes(rawOrigin)
    ? rawOrigin
    : allowed.includes(originHost)
    ? originHost + (originPort ? ':' + originPort : '')
    : 'yearn.fi'
  const protocol = validatedOrigin.includes('localhost') ? 'http' : 'https'

  // Load fonts
  let aeonikRegular: ArrayBuffer | undefined,
    aeonikBold: ArrayBuffer | undefined,
    aeonikMono: ArrayBuffer | undefined
  try {
    const reg = await fetch(
      `${protocol}://${validatedOrigin}/fonts/Aeonik-Regular.ttf`
    )
    if (!reg.ok) throw new Error('Aeonik-Regular.ttf')
    aeonikRegular = await reg.arrayBuffer()
    const bold = await fetch(
      `${protocol}://${validatedOrigin}/fonts/Aeonik-Bold.ttf`
    )
    if (!bold.ok) throw new Error('Aeonik-Bold.ttf')
    aeonikBold = await bold.arrayBuffer()
    const mono = await fetch(
      `${protocol}://${validatedOrigin}/fonts/AeonikMono-Regular.ttf`
    )
    if (!mono.ok) throw new Error('AeonikMono-Regular.ttf')
    aeonikMono = await mono.arrayBuffer()
  } catch (err) {
    return new Response(
      `Font loading error: ${err instanceof Error ? err.message : String(err)}`,
      { status: 500 }
    )
  }

  const vaultName = data.name
  const vaultIcon = data.icon
  const estimatedApyValue = data.estimatedApy
  const historicalApyValue = data.historicalApy
  const tvlValue = data.tvlUsd
  const footerText = `${data.chainName} | ${address.slice(
    0,
    6
  )}...${address.slice(-4)}`
  const earnWithYearnText = brand.cta

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          backgroundColor: 'white',
        }}
      >
        <div
          style={{
            flex: '1 1 0',
            alignSelf: 'stretch',
            background: brand.gradient,
            overflow: 'hidden',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <div
            style={{
              alignSelf: 'stretch',
              paddingLeft: 70,
              paddingRight: 70,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              display: 'flex',
            }}
          >
            <div
              style={{
                flex: '1 1 0',
                alignSelf: 'stretch',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
              }}
            >
              <div
                style={{
                  flex: '1 1 0',
                  height: '100%',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  gap: 20,
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    alignSelf: 'stretch',
                    height: 'auto',
                    paddingTop: 56,
                    paddingBottom: 20,
                    gap: 6,
                    overflow: 'hidden',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 20,
                      display: 'flex',
                    }}
                  >
                    <img
                      src={vaultIcon}
                      alt={vaultName}
                      width="48"
                      height="48"
                      style={{ borderRadius: 0 }}
                    />
                    <div
                      style={{
                        color: 'white',
                        fontSize: 64,
                        fontFamily: 'Aeonik',
                        fontWeight: '700',
                        wordWrap: 'break-word',
                        overflow: 'visible',
                      }}
                    >
                      {vaultName}
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: 'right',
                      color: 'white',
                      fontSize: 28,
                      fontFamily: 'Aeonik',
                      fontWeight: '300',
                      wordWrap: 'break-word',
                    }}
                  >
                    {footerText}
                  </div>
                </div>
                <div
                  style={{
                    width: 450,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 30,
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      alignSelf: 'stretch',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <div
                      style={{
                        textAlign: 'right',
                        color: 'white',
                        fontSize: 32,
                        fontFamily: 'Aeonik',
                        fontWeight: '300',
                        wordWrap: 'break-word',
                      }}
                    >
                      Estimated APY:
                    </div>
                    <div
                      style={{
                        textAlign: 'right',
                        color: 'white',
                        fontSize: 48,
                        fontFamily: 'Aeonik',
                        fontWeight: '700',
                        wordWrap: 'break-word',
                      }}
                    >
                      {estimatedApyValue}
                    </div>
                  </div>
                  <div
                    style={{
                      alignSelf: 'stretch',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <div
                      style={{
                        textAlign: 'right',
                        color: 'white',
                        fontSize: 32,
                        fontFamily: 'Aeonik',
                        fontWeight: '300',
                        wordWrap: 'break-word',
                      }}
                    >
                      Historical APY:
                    </div>
                    <div
                      style={{
                        alignSelf: 'stretch',
                        textAlign: 'right',
                        color: 'white',
                        fontSize: 32,
                        fontFamily: 'Aeonik',
                        fontWeight: '300',
                        wordWrap: 'break-word',
                      }}
                    >
                      {historicalApyValue}
                    </div>
                  </div>
                  <div
                    style={{
                      alignSelf: 'stretch',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    <div
                      style={{
                        textAlign: 'right',
                        color: 'white',
                        fontSize: 32,
                        fontFamily: 'Aeonik',
                        fontWeight: '300',
                        wordWrap: 'break-word',
                      }}
                    >
                      Vault TVL:
                    </div>
                    <div
                      style={{
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        display: 'flex',
                      }}
                    >
                      <div
                        style={{
                          alignSelf: 'stretch',
                          textAlign: 'right',
                          color: 'white',
                          fontSize: 32,
                          fontFamily: 'Aeonik',
                          fontWeight: '300',
                          wordWrap: 'break-word',
                        }}
                      >
                        {tvlValue}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              width: '100%',
              paddingBottom: 40,
              paddingLeft: 70,
              paddingRight: 70,
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              display: 'flex',
            }}
          >
            <div
              style={{
                width: 309,
                height: 85,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <TypeMarkYearnNaughty
                width={300}
                height={90}
                color={brand.logoColor}
              />
            </div>
            <div
              style={{
                textAlign: 'right',
                color: 'white',
                fontSize: 48,
                fontFamily: 'Aeonik',
                fontWeight: '700',
                wordWrap: 'break-word',
              }}
            >
              {earnWithYearnText}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Aeonik', data: aeonikRegular, weight: 400, style: 'normal' },
        { name: 'Aeonik', data: aeonikBold, weight: 700, style: 'normal' },
        { name: 'AeonikMono', data: aeonikMono, weight: 400, style: 'normal' },
      ],
    }
  )
}
