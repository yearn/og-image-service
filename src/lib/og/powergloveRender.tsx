/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import { PowergloveCardData, powerglovePercent } from './powerglove'
import { loadFonts } from './render'

const blue = '#0657f9'
const muted = '#757b85'

// Decorative brand motif from the design handoff; independent of vault data.
function ChartMotif({ project }: { project: boolean }) {
  const seed = project ? 4 : 1
  const samples = Array.from({ length: 151 }, (_, index) => ({
    x: index * 8,
    height: 106 + 23 * Math.sin(index * .037 + seed) + 12 * Math.sin(index * .18),
    primary: 105 + 13 * Math.sin(index * .12 + seed) + 8 * Math.cos(index * .31),
    secondary: 113 + 5 * Math.sin(index * .09) + 4 * Math.cos(index * .26 + seed),
  }))
  return <svg width="1200" height={project ? 205 : 192} viewBox="0 0 1200 192" aria-hidden="true" style={{ position: 'absolute', left: 0, bottom: 0 }}>
    {samples.map(({ x, height }) => <rect key={x} x={x} y={192 - height} width="4" height={height} rx="2" fill={blue} opacity=".045"/>)}
    <polyline points={samples.map(({ x, secondary }) => `${x},${secondary}`).join(' ')} fill="none" stroke="#b7c0cd" strokeWidth="1.5" opacity=".55"/>
    <polyline points={samples.map(({ x, primary }) => `${x},${primary}`).join(' ')} fill="none" stroke="#5798ff" strokeWidth="2" opacity=".6"/>
  </svg>
}

function PowergloveMark() {
  return <svg width="32" height="32" viewBox="0 0 359.7 359.7" fill={blue}>
    <path d="M314.5,138.3l-46.6,45.6c2.6,8.3,3.9,17.1,3.9,26,0,24-9.6,46.6-27,63.6-17.4,17-40.5,26.3-65.1,26.3s-47.7-9.4-65.1-26.3c-17.4-17-27-39.6-27-63.6s1.3-17.7,3.9-26l-46.7-45.6c-11.8,21.3-18.6,45.7-18.6,71.6,0,82.8,68.7,149.8,153.4,149.8s153.4-67.1,153.4-149.8-6.7-50.3-18.6-71.6Z"/>
    <polygon points="149.1 239.8 210.4 239.8 210.4 144.5 314.9 42.4 271.5 0 179.8 89.6 88 0 44.6 42.4 149.1 144.4"/>
  </svg>
}

function clip(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value
}

export function renderPowergloveOG(fonts: Awaited<ReturnType<typeof loadFonts>>, data?: PowergloveCardData) {
  const metrics = data ? [
    ['Expected APY', powerglovePercent(data.expectedApy)],
    ['7-day APY', powerglovePercent(data.weeklyApy)],
    ['30-day APY', powerglovePercent(data.monthlyApy)],
    ['Total supply / NAV', data.nav === undefined ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.nav)],
    ['Management fee', powerglovePercent(data.managementFee)],
    ['Performance fee', powerglovePercent(data.performanceFee)],
    ['Network', data.chainName],
    ['Vault token', clip(data.asset || '—', 24)],
    ['Vault address', `${data.address.slice(0, 5)}…${data.address.slice(-4)}`],
  ] : []
  const response = new ImageResponse(
    <div style={{ width: 1200, height: 630, background: 'white', color: '#17191d', fontFamily: 'Aeonik', display: 'flex', flexDirection: 'column', padding: '44px 52px', overflow: 'hidden', position: 'relative' }}>
      <ChartMotif project={!data}/>
      <div style={{ display: 'flex', position: 'relative', alignItems: 'center', gap: 10, color: blue, fontSize: 24, fontWeight: 700 }}><PowergloveMark/>Yearn PowerGlove</div>
      {data ? <div style={{ display: 'flex', position: 'relative', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 35, height: 30, fontSize: 18, color: muted }}>
          {data.symbol && <span>{clip(data.symbol, 55)}</span>}
          {data.deployed && <span style={{ fontSize: 15, background: '#f4f5f7', padding: '6px 10px', borderRadius: 4 }}>Deployed {data.deployed}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 12, height: 62 }}>
          <div style={{ maxWidth: data.version ? 960 : 1096, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700, fontSize: data.name.length > 36 ? 44 : 52, letterSpacing: '-1.9px' }}>{clip(data.name, 100)}</div>
          {data.version && <span style={{ fontSize: 19, color: muted }}>{clip(data.version, 12)}</span>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 34, rowGap: 22 }}>
          {metrics.map(([label, value], index) => <div key={label} style={{ display: 'flex', flexDirection: 'column', width: '33.333%', height: index < 3 ? 68 : 60 }}>
            <span style={{ color: muted, fontSize: 18, marginBottom: 8 }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: value === '—' ? '#858b94' : '#17191d', fontSize: index < 3 ? 34 : index === 8 ? 22 : 24, fontFamily: index === 8 ? 'AeonikMono' : 'Aeonik', fontWeight: value === '—' ? 400 : 700, letterSpacing: '-.3px' }}>
              {value}
            </div>
          </div>)}
        </div>
      </div> : <div style={{ display: 'flex', position: 'relative', flexDirection: 'column', marginTop: 65 }}>
        <span style={{ color: muted, fontSize: 18 }}>Yearn Vault Analytics</span>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 70, lineHeight: 1.03, fontWeight: 700, letterSpacing: '-1.9px', marginTop: 12 }}><span>A closer look</span><span>at your vaults.</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', color: '#68717d', fontSize: 25, lineHeight: 1.4, marginTop: 22 }}><span>Yield, assets, and strategy insights.</span><span>All in one place.</span></div>
      </div>}
    </div>,
    { width: 1200, height: 630, fonts: [
      { name: 'Aeonik', data: fonts.aeonikRegular, weight: 400, style: 'normal' },
      { name: 'Aeonik', data: fonts.aeonikBold, weight: 700, style: 'normal' },
      { name: 'AeonikMono', data: fonts.aeonikMono, weight: 400, style: 'normal' },
    ] }
  )
  response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600')
  return response
}
