import { TypeMarkYearnNaughty } from '@lib/icons/TypeMarkYearn-naughty'
import { ImageResponse } from 'next/og'

const COLORS = {
  background: '#F2EFE9',
  surface: '#FFFEFC',
  navy: '#111B4D',
  yearnBlue: '#0657F9',
  electricBlue: '#405BE5',
  boldGreen: '#5FD67C',
  yellow: '#FFDC37',
  mutedText: '#858CAE',
  border: 'rgba(17, 27, 77, 0.12)',
}

export function renderYBoldOG(
  data: {
    estimatedApy: string
    historicalApy: string
    tvlUsd: string
    chainName: string
    address: string
  },
  fonts: {
    aeonikRegular: ArrayBuffer
    aeonikBold: ArrayBuffer
    aeonikMono: ArrayBuffer
  }
) {
  const addressLabel = `${data.address.slice(0, 6)}...${data.address.slice(-4)}`

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        backgroundColor: COLORS.background,
        color: COLORS.navy,
        fontFamily: 'Aeonik',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -80,
          top: -108,
          width: 250,
          height: 250,
          borderRadius: 250,
          backgroundColor: COLORS.yellow,
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 118,
          top: 0,
          width: 104,
          height: 52,
          borderRadius: '0 0 104px 104px',
          backgroundColor: COLORS.electricBlue,
          display: 'flex',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 38,
          left: 60,
          right: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TypeMarkYearnNaughty
          width={185}
          height={54}
          color={COLORS.yearnBlue}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 138,
          left: 60,
          right: 60,
          bottom: 100,
          display: 'flex',
          alignItems: 'stretch',
          gap: 54,
        }}
      >
        <div
          style={{
            width: 610,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
            }}
          >
            <svg
              width="88"
              height="88"
              viewBox="0 0 128 128"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="64.17" cy="64.02" r="61.57" fill="#0675F9" />
              <path
                d="M106.66 67.95c4.52 13.59-2.84 28.27-16.42 32.79-13.59 4.52-28.27-2.84-32.79-16.42-4.52-13.59 2.84-28.27 16.42-32.79 13.59-4.52 28.27 2.84 32.79 16.42ZM71.07 22.13l-22.29-.34-1.25 80.85 22.29.34 1.25-80.85ZM29.56 31.12 14.17 46.83l34.19 33.5.33-29.45-19.13-19.76Z"
                fill="#FFFEFC"
              />
            </svg>
            <div
              style={{
                color: COLORS.navy,
                fontSize: 76,
                fontWeight: '700',
                letterSpacing: -3,
                lineHeight: 1,
                display: 'flex',
              }}
            >
              yBOLD
            </div>
          </div>

          <div
            style={{
              marginTop: 28,
              maxWidth: 580,
              color: COLORS.navy,
              fontSize: 43,
              fontWeight: '400',
              letterSpacing: -1.2,
              lineHeight: 1.08,
              display: 'flex',
            }}
          >
            Earn on BOLD
          </div>
          <div
            style={{
              marginTop: 18,
              maxWidth: 560,
              color: 'rgba(17, 27, 77, 0.72)',
              fontSize: 24,
              fontWeight: '400',
              lineHeight: 1.3,
              display: 'flex',
            }}
          >
            Yearn allocates across Liquity V2 Stability Pools and compounds the
            returns.
          </div>

          <div
            style={{
              marginTop: 28,
              paddingTop: 17,
              borderTop: `1px solid ${COLORS.border}`,
              width: 530,
              color: COLORS.mutedText,
              fontFamily: 'Aeonik Mono',
              fontSize: 16,
              display: 'flex',
              gap: 10,
            }}
          >
            <span>{data.chainName}</span>
            <span>•</span>
            <span>{addressLabel}</span>
          </div>
        </div>

        <div
          style={{
            flex: '1 1 0',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            backgroundColor: COLORS.surface,
            padding: '32px 34px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              color: COLORS.mutedText,
              fontSize: 19,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                backgroundColor: COLORS.boldGreen,
                display: 'flex',
              }}
            />
            7-day realized APY
          </div>
          <div
            style={{
              marginTop: 8,
              color: COLORS.yearnBlue,
              fontSize: 82,
              lineHeight: 1,
              fontWeight: '700',
              letterSpacing: -3,
              display: 'flex',
            }}
          >
            {data.estimatedApy}
          </div>

          <div
            style={{
              marginTop: 42,
              paddingTop: 20,
              borderTop: `1px solid ${COLORS.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                color: COLORS.mutedText,
                fontSize: 18,
                display: 'flex',
              }}
            >
              30-day realized APY
            </div>
            <div
              style={{
                color: COLORS.navy,
                fontSize: 24,
                fontWeight: '700',
                display: 'flex',
              }}
            >
              {data.historicalApy}
            </div>
          </div>
          <div
            style={{
              marginTop: 16,
              paddingTop: 18,
              borderTop: `1px solid ${COLORS.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                color: COLORS.mutedText,
                fontSize: 18,
                display: 'flex',
              }}
            >
              Total deposits
            </div>
            <div
              style={{
                color: COLORS.navy,
                fontSize: 24,
                fontWeight: '700',
                display: 'flex',
              }}
            >
              {data.tvlUsd}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 60,
          bottom: 35,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 9,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 48,
            backgroundColor: COLORS.yearnBlue,
            display: 'flex',
          }}
        />
        <div
          style={{
            width: 48,
            height: 24,
            borderRadius: '48px 48px 0 0',
            backgroundColor: COLORS.yellow,
            display: 'flex',
          }}
        />
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 7,
            backgroundColor: COLORS.boldGreen,
            display: 'flex',
          }}
        />
        <div
          style={{
            width: 134,
            height: 12,
            marginBottom: 18,
            borderRadius: 12,
            backgroundColor: COLORS.navy,
            display: 'flex',
          }}
        />
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Aeonik',
          data: fonts.aeonikRegular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Aeonik',
          data: fonts.aeonikBold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Aeonik Mono',
          data: fonts.aeonikMono,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  )
}
