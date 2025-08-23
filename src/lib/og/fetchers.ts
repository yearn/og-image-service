export async function fetchVaultData(chainID: string, address: string) {
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

export async function fetchKatanaAprs(): Promise<any | null> {
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

export async function fetchYBoldApr(
  chainID: string,
  stakingAddress: string
): Promise<{ estimatedAPY: number; historicalAPY: number } | null> {
  if (chainID !== '1') return null
  const baseUri = process.env.YDAEMON_BASE_URI
  if (!baseUri || !baseUri.startsWith('https://')) return null
  try {
    const res = await fetch(
      `${baseUri}/${chainID}/vault/${stakingAddress}?strategiesDetails=withDetails&strategiesCondition=inQueue`,
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
