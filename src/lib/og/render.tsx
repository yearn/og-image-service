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

export function renderVaultOG(
  brand: BrandConfig,
  data: {
    icon: string
    name: string
    estimatedApy: string
    rewardsAPR?: string
    minBoost?: string
    historicalApy: string
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
  opts?: { origin?: string; protocol?: 'http' | 'https' }
) {
  const footerText = `${data.chainName} | ${data.address.slice(
    0,
    6
  )}...${data.address.slice(-4)}`
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
                    width: 500,
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
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginTop: data.rewardsAPR ? '20px' : '0px',
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
                        alignItems: 'flex-end',
                        marginTop: data.rewardsAPR ? '10px' : '0px',
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
                        }}
                      >
                        {data.estimatedApy}
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
                      {data.historicalApy}
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
                        {data.tvlUsd}
                      </div>
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
      </div>
    ),
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
    }
  )
}
