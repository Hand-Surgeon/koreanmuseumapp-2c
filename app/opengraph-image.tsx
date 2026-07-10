import { ImageResponse } from 'next/og'

export const alt = '국립중앙박물관 명품 100선'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 50%, #fef3c7 100%)',
          color: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          padding: 80,
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 5, marginBottom: 28 }}>
          DIGITAL COLLECTION
        </div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, lineHeight: 1.2 }}>
          MUSEUM 100
        </div>
        <div style={{ display: 'flex', fontSize: 30, marginTop: 30 }}>
          KOREAN CULTURAL HERITAGE
        </div>
      </div>
    ),
    size,
  )
}
