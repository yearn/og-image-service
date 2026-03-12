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

export async function fetchVaultData(chainID: string, address: string) {
  const baseUri = process.env.YDAEMON_BASE_URI
  if (!baseUri || !baseUri.startsWith('https://')) return null
  return fetchJson(
    `${baseUri}/${chainID}/vault/${address}?strategiesDetails=withDetails&strategiesCondition=inQueue`
  )
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
  const baseUri = process.env.YDAEMON_BASE_URI
  if (!baseUri || !baseUri.startsWith('https://')) return null
  const st = await fetchJson(
    `${baseUri}/${chainID}/vault/${stakingAddress}?strategiesDetails=withDetails&strategiesCondition=inQueue`
  )
  if (!st?.apr) return null
  return {
    estimatedAPY: st.apr.forwardAPR?.netAPR || st.apr.netAPR || 0,
    historicalAPY: st.apr.netAPR || 0,
  }
}
