export type BrandKey = 'yearn' | 'katana'

export type BrandConfig = {
  gradient: string
  cta: string
  logoColor: string
  bgPath?: string // optional public path for full-bleed background image
}

export const BRANDS: Record<BrandKey, BrandConfig> = {
  yearn: {
    gradient: 'linear-gradient(225deg, #b51055ff 0%, #263490ff 100%)',
    cta: 'Earn With Yearn',
    logoColor: '#FFFFFF',
  },
  katana: {
    gradient:
      'radial-gradient(100% 100% at 100% 100%, #ffb413ff 0%, #e04300cc 30%, #263490ff 100%)',
    cta: 'Enter the Dojo',
    logoColor: '#FFFFFF',
    bgPath: '/graphics/katana-bg.png',
  },
}
