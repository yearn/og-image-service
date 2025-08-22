import { ImageResponse } from 'next/og'
export const runtime = 'edge'

const BRANDS = {
  yearn: {
    gradient: 'linear-gradient(225deg, #b51055ff 0%, #263490ff 100%)',
    cta: 'Earn With Yearn',
  },
  bearn: {
    gradient: 'linear-gradient(225deg, #004bff 0%, #00c2ff 100%)',
    cta: 'Built by Mom',
  },
} as const

export default async function handler(req: Request) {
  // @ts-ignore
  const url = new URL(req.url)
  const brandKey = (url.searchParams.get('brand') ||
    'yearn') as keyof typeof BRANDS
  const brand = BRANDS[brandKey] || BRANDS.yearn
  const title = url.searchParams.get('title') || 'OG Image Service'

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: brand.gradient,
        }}
      >
        <div style={{ color: 'white', fontSize: 72, fontWeight: 800 }}>
          {title}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
