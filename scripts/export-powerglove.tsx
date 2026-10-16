import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { renderPowergloveOG } from '../src/lib/og/powergloveRender'
import type { PowergloveCardData } from '../src/lib/og/powerglove'

const font = async (name: string) => {
  const bytes = await readFile(new URL(`../public/fonts/${name}.ttf`, import.meta.url))
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}
const fonts = { aeonikRegular: await font('Aeonik-Regular'), aeonikBold: await font('Aeonik-Bold'), aeonikMono: await font('AeonikMono-Regular') }
const standard: PowergloveCardData = {
  name: 'USDC-1 yVault', symbol: 'yvUSDC-1', version: '3.0.2', deployed: 'March 2024', chainID: 1, chainName: 'Ethereum', asset: 'USDC', address: '0xBe53A109B494E5c9f97b9Cd39Fe969BE68BF6204',
  expectedApy: .0405, weeklyApy: .0323, monthlyApy: .0366, nav: 19330676, managementFee: 0, performanceFee: .1,
}
const studies: [string, PowergloveCardData | undefined][] = [
  ['project', undefined], ['vault', standard],
  ['long', { ...standard, name: 'Curve crvUSD / USDC Factory yVault', symbol: 'yvCurve-crvUSD-USDC', version: '3.0.4', deployed: 'June 2025', asset: 'crvUSD / USDC', expectedApy: .0642, weeklyApy: .0581, monthlyApy: .0608, nav: 8420195 }],
  ['missing', { ...standard, name: 'WETH yVault', symbol: 'yvWETH', deployed: 'September 2026', asset: 'WETH', expectedApy: undefined, weeklyApy: undefined, monthlyApy: undefined, nav: 125840 }],
  ['base', { ...standard, name: 'USDC yVault', symbol: 'yvUSDC', version: '3.0.4', deployed: 'June 2025', chainID: 8453, chainName: 'Base', address: '0xc3BD0A2193c8F027B82ddE3611D18589ef3f62a9', expectedApy: .0524, weeklyApy: .0489, monthlyApy: .0512, nav: 3842610 }],
]
const output = new URL('../public/powerglove-review/', import.meta.url)
await mkdir(output, { recursive: true })
for (const [name, data] of studies) {
  const response = renderPowergloveOG(fonts, data)
  await writeFile(new URL(`${name}.png`, output), new Uint8Array(await response.arrayBuffer()))
  console.log(`Exported ${name}.png`)
}
