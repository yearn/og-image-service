/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import { BrandConfig } from './brands'

export async function loadFonts(origin: string, protocol: 'http' | 'https') {
  let aeonikRegular: ArrayBuffer,
    aeonikBold: ArrayBuffer,
    aeonikMono: ArrayBuffer
  const fetchFont = async (name: string) => {
    const res = await fetch(`${protocol}://${origin}/fonts/${name}`)
    if (!res.ok) throw new Error(name)
    return res.arrayBuffer()
  }
  aeonikRegular = await fetchFont('Aeonik-Regular.ttf')
  aeonikBold = await fetchFont('Aeonik-Bold.ttf')
  aeonikMono = await fetchFont('AeonikMono-Regular.ttf')
  return { aeonikRegular, aeonikBold, aeonikMono }
}

function getPublicAssetUrl(
  path: string,
  opts?: { origin?: string; protocol?: 'http' | 'https' },
) {
  return `${opts?.protocol || 'https'}://${opts?.origin || 'yearn.fi'}${path}`
}

function LockClosedIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 384 384"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M229.4 153.95l-.03-53.42c-.04-15.75-8.46-29.91-20.43-38.29-13.64-9.55-30.5-11.61-45.68-5.31-18.26 7.58-30.32 25.35-30.37 45.16l-.13 51.87h141.9c21.24-.01 37.91 16.45 37.91 37.4l.04 149.06c0 21.07-16.62 37.79-37.71 37.79l-188.04-.06c-20.6 0-37.22-16.63-37.22-37.12l.02-150.13c0-19.99 15.88-35.73 35.55-36.93l.19-52.02c.14-40.25 26.71-76.45 64.44-90.44 34.08-12.64 72.33-3.68 98.14 21.55 18.16 17.75 28.88 41.31 28.95 66.74l.03 54.17" fill="#000000" />
      <path d="M283.25 166.45c.41.57.8 1.16 1.09 1.79 2.45 5.33-.52 27.37-1.72 34.37-13.86 80.54-86.47 144.35-167.97 148.56l-50.31.57-1.38-1.49c-1.21-2.69-2.07-5.12-2.07-8.21v-150.49c-.01-16.11 13.23-27.23 28.88-26.47 13.03.63 25.12.13 38.36.12l147.5-.02c2.95 0 5.37.51 7.62 1.28Z" fill="#E0E0E0" />
      <path d="M62.96 350.24l44.2-.35c97.95-.78 181.36-87.27 176.09-183.44 10.92 3.74 18.05 13.33 18.05 24.88l.02 149.08c0 14.85-11.54 26.42-26.42 26.42l-188.04-.03c-11.04 0-20.56-6.86-23.9-16.57Z" fill="#C4C4C4" />
      <path d="M240.71 153.95l-.07-54.16c-.09-19.3-10.59-36.75-25.36-47.01-16.77-11.64-37.43-14.05-55.95-6.52-22.36 9.09-37.46 30.57-37.67 54.54l-.37 41.74c-.07.59-.26 1.47-.67 1.5-2.65.18-22.18.74-23.05-.02-.28-.25-.47-.6-.64-.99l.14-46.28c3.19-33.87 25.2-63.41 57.15-74.94 29.69-10.72 62.75-2.95 85.38 18.79 16.57 15.91 25.99 37.23 26.02 60.18l.02 53.17" fill="#E2E2E2" />
      <path d="M121.3 142.54c-.03 3.56.87 7.18-.06 11.29l-24.75-.25.59-56.83.21 45.82 24.01-.03Z" fill="#C8C8C8" />
      <path d="M201.89 314.32l-41.65-.02c-3.76-.08-6-3.15-5.52-6.84l5.77-44.22c-9.73-11.34-8.84-27.6 1.46-37.68 10.49-10.27 27.19-10.42 37.76-.52 10.91 10.21 11.76 26.83 1.97 38.24l5.68 44.21c.45 3.46-1.61 6.55-5.48 6.83Z" fill="#000000" />
      <path d="M195.4 302.94l-28.64.12 5.24-40.7c.32-2.29-.6-4.16-2.17-5.69-6.53-6.38-6.34-16.54-.25-22.75s16.32-6.35 22.51-.5c6.78 6.42 6.88 16.99.12 23.48-1.58 1.51-2.24 3.36-2 5.65l5.19 40.39Z" fill="#9E9E9E" />
    </svg>
  )
}

function LockOpenIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 453 384"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M211.37 147.98l-.02 5.97h141.9c21.24-.01 37.91 16.45 37.91 37.4l.04 149.06c0 21.07-16.62 37.79-37.71 37.79l-188.04-.06c-20.6 0-37.22-16.63-37.22-37.12l.02-150.13c0-19.99 15.88-35.73 35.55-36.93l.02-4.99" fill="#000000" />
      <path d="M211.37 149.96l-.17-47.04c-.14-40.25-26.71-76.45-64.44-90.44C112.68-.16 74.43 8.8 48.62 34.03c-18.16 17.75-28.88 41.31-28.95 66.74l-.04 2.18c-.02 9.07 7.09 16.28 16.18 16.29h15.04c9.1.01 16.31-7.08 16.33-16.2l.04-1.52c.04-15.75 8.46-29.91 20.43-38.29 13.64-9.55 30.5-11.61 45.68-5.31 18.26 7.58 30.32 25.35 30.37 45.16l.12 45.9" fill="#000000" />
      <path d="M361.84 166.45c.41.57.8 1.16 1.09 1.79 2.45 5.33-.52 27.37-1.72 34.37-13.86 80.54-86.47 144.35-167.97 148.56l-50.31.57-1.38-1.49c-1.21-2.69-2.07-5.12-2.07-8.21v-150.49c-.01-16.11 13.23-27.23 28.88-26.47 13.03.63 25.12.13 38.36.12l147.5-.02c2.95 0 5.37.51 7.62 1.28Z" fill="#E0E0E0" />
      <path d="M141.55 350.24l44.2-.35c97.95-.78 181.36-87.27 176.09-183.44 10.92 3.74 18.05 13.33 18.05 24.88l.02 149.08c0 14.85-11.54 26.42-26.42 26.42l-188.04-.03c-11.04 0-20.56-6.86-23.9-16.57Z" fill="#C4C4C4" />
      <path d="M175.5 142.54c.07.59.26 1.47.67 1.5 2.65.18 22.18.74 23.05-.02.28-.25.47-.6.64-.99l-.14-46.28c-3.19-33.87-25.2-63.41-57.15-74.94-29.69-10.72-62.75-2.95-85.38 18.79-16.57 15.91-25.99 37.23-26.02 60.18l-.02 1.11c0 2.59 1.89 4.87 4.6 4.95 5.31.15 10.47.15 15.77 0 2.65-.07 4.55-2.27 4.56-4.81l.08-2.24c.09-19.3 10.59-36.75 25.36-47.01 16.77-11.64 37.43-14.05 55.95-6.52 22.36 9.09 37.46 30.57 37.67 54.54l.37 41.74Z" fill="#E2E2E2" />
      <path d="M200.2 147.98c.1 1.86.1 3.8-.36 5.85l-24.75-.25.05-5.06" fill="#C8C8C8" />
      <path d="M175.14 148.53l.06-5.96h.68l24.01-.02c-.02 1.78.2 3.58.31 5.44" fill="#C8C8C8" />
      <path d="M280.48 314.32l-41.65-.02c-3.76-.08-6-3.15-5.52-6.84l5.77-44.22c-9.73-11.34-8.84-27.6 1.46-37.68 10.49-10.27 27.19-10.42 37.76-.52 10.91 10.21 11.76 26.83 1.97 38.24l5.68 44.21c.45 3.46-1.61 6.55-5.48 6.83Z" fill="#000000" />
      <path d="M273.99 302.94l-28.64.12 5.24-40.7c.32-2.29-.6-4.16-2.17-5.69-6.53-6.38-6.34-16.54-.25-22.75s16.32-6.35 22.51-.5c6.78 6.42 6.88 16.99.12 23.48-1.58 1.51-2.24 3.36-2 5.65l5.19 40.39Z" fill="#9E9E9E" />
    </svg>
  )
}

export function renderVaultOG(
  brand: BrandConfig,
  data: {
    icon: string
    name: string
    estimatedApy: string
    estimatedApyBreakdown?: string
    rewardsAPR?: string
    minBoost?: string
    historicalApy: string
    historicalApyBreakdown?: string
    tvlUsd: string
    chainName: string
    address: string
  },
  fonts: {
    aeonikRegular: ArrayBuffer
    aeonikBold: ArrayBuffer
    aeonikMono: ArrayBuffer
  },
  brandMark?: React.ReactElement,
  opts?: { origin?: string; protocol?: 'http' | 'https' },
) {
  const footerText = `${data.chainName} | ${data.address.slice(
    0,
    6,
  )}...${data.address.slice(-4)}`
  const earnWithYearnText = brand.cta
  const hasInlineApyBreakdown = Boolean(
    data.estimatedApyBreakdown || data.historicalApyBreakdown,
  )
  const metricsWidth = hasInlineApyBreakdown ? 760 : 500
  const metricLabelWidth = 250
  const metricMainValueWidth = 170
  const metricBreakdownWidth = hasInlineApyBreakdown ? 300 : 0
  return new ImageResponse(
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
          background: brand.bgPath ? 'transparent' : brand.gradient,
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          display: 'flex',
          position: 'relative',
        }}
      >
        {brand.bgPath && (
          <img
            src={`${opts?.protocol || 'https'}://${
              opts?.origin || 'yearn.fi'
            }${brand.bgPath}`}
            alt=""
            width="1200"
            height="630"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        )}
        {/* Header */}
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
                    src={data.icon}
                    alt={data.name}
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
                    {data.name}
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

              {/* Metrics */}
              <div
                style={{
                  width: metricsWidth,
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
                    justifyContent: hasInlineApyBreakdown
                      ? 'flex-start'
                      : 'space-between',
                    alignItems: 'center',
                    display: 'flex',
                    gap: hasInlineApyBreakdown ? 20 : 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      marginTop: data.rewardsAPR ? '20px' : '0px',
                      ...(hasInlineApyBreakdown
                        ? { width: metricLabelWidth, flexShrink: 0 }
                        : {}),
                    }}
                  >
                    <div
                      style={{
                        textAlign: 'right',
                        color: 'white',
                        fontSize: 32,
                        fontFamily: 'Aeonik',
                        fontWeight: '300',
                        overflow: 'visible',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      Estimated APY:
                    </div>
                    {data.rewardsAPR && (
                      <div
                        style={{
                          textAlign: 'left',
                          color: 'white',
                          fontSize: 24,
                          fontFamily: 'Aeonik',
                          fontWeight: '300',
                          display: 'flex',
                          alignItems: 'center',
                          marginTop: 10,
                        }}
                      >
                        Rewards APR:
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: hasInlineApyBreakdown ? 'flex-start' : 'flex-end',
                      marginTop: data.rewardsAPR ? '10px' : '0px',
                      ...(!hasInlineApyBreakdown ? { flex: '1 1 0' } : {}),
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: hasInlineApyBreakdown
                          ? 'flex-start'
                          : 'flex-end',
                        gap: 14,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'right',
                          color: 'white',
                          fontSize: 48,
                          fontFamily: 'Aeonik',
                          fontWeight: '700',
                          wordWrap: 'break-word',
                          ...(hasInlineApyBreakdown
                            ? { width: metricMainValueWidth, flexShrink: 0 }
                            : {}),
                        }}
                      >
                        {data.estimatedApy}
                      </div>
                      {data.estimatedApyBreakdown && (
                        <div
                          style={{
                            textAlign: 'right',
                            color: 'rgba(255, 255, 255, 0.82)',
                            fontSize: 22,
                            fontFamily: 'Aeonik',
                            fontWeight: '400',
                            whiteSpace: 'nowrap',
                            marginBottom: 6,
                            width: metricBreakdownWidth,
                            flexShrink: 0,
                          }}
                        >
                          {data.estimatedApyBreakdown}
                        </div>
                      )}
                    </div>
                    {data.rewardsAPR && (
                      <div
                        style={{
                          textAlign: 'right',
                          color: 'white',
                          fontSize: 24,
                          fontFamily: 'Aeonik',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            marginRight: 4,
                            fontSize: 18,
                          }}
                        >
                          ⚡️
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            fontSize: 24,
                            margin: '0 4px',
                          }}
                        >
                          <div>{data.minBoost}</div>
                          <div style={{ display: 'flex', margin: '0 8px' }}>
                            &nbsp;&rarr;&nbsp;
                          </div>
                          <div>{data.rewardsAPR}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    alignSelf: 'stretch',
                    justifyContent: hasInlineApyBreakdown
                      ? 'flex-start'
                      : 'space-between',
                    alignItems: 'center',
                    display: 'flex',
                    gap: hasInlineApyBreakdown ? 20 : 0,
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
                      ...(hasInlineApyBreakdown
                        ? { width: metricLabelWidth, flexShrink: 0 }
                        : {}),
                    }}
                  >
                    30-Day APY:
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: hasInlineApyBreakdown
                        ? 'flex-start'
                        : 'flex-end',
                      gap: 12,
                      whiteSpace: 'nowrap',
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
                        ...(hasInlineApyBreakdown
                          ? { width: metricMainValueWidth, flexShrink: 0 }
                          : {}),
                      }}
                    >
                      {data.historicalApy}
                    </div>
                    {data.historicalApyBreakdown && (
                      <div
                        style={{
                          textAlign: 'right',
                          color: 'rgba(255, 255, 255, 0.82)',
                          fontSize: 22,
                          fontFamily: 'Aeonik',
                          fontWeight: '400',
                          whiteSpace: 'nowrap',
                          marginBottom: 3,
                          width: metricBreakdownWidth,
                          flexShrink: 0,
                        }}
                      >
                        {data.historicalApyBreakdown}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    alignSelf: 'stretch',
                    justifyContent: hasInlineApyBreakdown
                      ? 'flex-start'
                      : 'space-between',
                    alignItems: 'center',
                    display: 'flex',
                    gap: hasInlineApyBreakdown ? 20 : 0,
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
                      ...(hasInlineApyBreakdown
                        ? { width: metricLabelWidth, flexShrink: 0 }
                        : {}),
                    }}
                  >
                    Vault TVL:
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: hasInlineApyBreakdown
                        ? 'flex-start'
                        : 'flex-end',
                      gap: 12,
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
                        ...(hasInlineApyBreakdown
                          ? { width: metricMainValueWidth, flexShrink: 0 }
                          : {}),
                      }}
                    >
                      {data.tvlUsd}
                    </div>
                    {hasInlineApyBreakdown && (
                      <div
                        style={{
                          width: metricBreakdownWidth,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            {brandMark}
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
          name: 'AeonikMono',
          data: fonts.aeonikMono,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  )
}

function renderYvUsdMetricValue(
  lockedValue: string,
  unlockedValue: string,
) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <LockClosedIcon size={24} />
        <div
          style={{
            marginLeft: 10,
            color: 'white',
            fontSize: 48,
            fontFamily: 'Aeonik',
            fontWeight: '700',
          }}
        >
          {lockedValue}
        </div>
      </div>
      <div
        style={{
          margin: '0 16px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: 26,
          fontFamily: 'Aeonik',
          fontWeight: '400',
        }}
      >
        |
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <LockOpenIcon size={24} />
        <div
          style={{
            marginLeft: 10,
            color: 'white',
            fontSize: 32,
            fontFamily: 'Aeonik',
            fontWeight: '700',
          }}
        >
          {unlockedValue}
        </div>
      </div>
    </div>
  )
}

export function renderYvUsdOG(
  brand: BrandConfig,
  data: {
    iconPath: string
    name: string
    estimatedApyLocked: string
    estimatedApyUnlocked: string
    historicalApyLocked: string
    historicalApyUnlocked: string
    tvlUsd: string
    chainName: string
    address: string
  },
  fonts: {
    aeonikRegular: ArrayBuffer
    aeonikBold: ArrayBuffer
    aeonikMono: ArrayBuffer
  },
  brandMark?: React.ReactElement,
  opts?: { origin?: string; protocol?: 'http' | 'https' },
) {
  const footerText = `${data.chainName} | ${data.address.slice(
    0,
    6,
  )}...${data.address.slice(-4)}`
  const earnWithYearnText = brand.cta

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        backgroundColor: '#081327',
      }}
    >
      <div
        style={{
          flex: '1 1 0',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {brand.bgPath && (
          <img
            src={getPublicAssetUrl(brand.bgPath, opts)}
            alt=""
            width="1200"
            height="630"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(4, 11, 30, 0.34) 0%, rgba(4, 11, 30, 0.72) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '56px 70px 40px 70px',
          }}
        >
          <div
            style={{
              alignSelf: 'stretch',
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
                    paddingTop: 0,
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
                      src={getPublicAssetUrl(data.iconPath, opts)}
                      alt={data.name}
                      width="96"
                      height="96"
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
                      {data.name}
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: 'right',
                      color: 'rgba(255, 255, 255, 0.78)',
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
                    width: 700,
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
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Estimated APY:
                    </div>
                      {renderYvUsdMetricValue(
                        data.estimatedApyLocked,
                        data.estimatedApyUnlocked,
                      )}
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
                        whiteSpace: 'nowrap',
                      }}
                    >
                      30-Day APY:
                    </div>
                      {renderYvUsdMetricValue(
                        data.historicalApyLocked,
                        data.historicalApyUnlocked,
                      )}
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
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Vault TVL:
                    </div>
                    <div
                      style={{
                        textAlign: 'right',
                        color: 'white',
                        fontSize: 32,
                        fontFamily: 'Aeonik',
                        fontWeight: '700',
                      }}
                    >
                      {data.tvlUsd}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
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
              {brandMark}
            </div>
            <div
              style={{
                textAlign: 'right',
                color: 'white',
                fontSize: 48,
                fontFamily: 'Aeonik',
                fontWeight: '700',
              }}
            >
              {earnWithYearnText}
            </div>
          </div>
        </div>
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
          name: 'AeonikMono',
          data: fonts.aeonikMono,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  )
}
