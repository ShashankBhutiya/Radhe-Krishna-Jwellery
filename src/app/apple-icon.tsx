import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #211a17 0%, #4b3425 60%, #87613a 100%)',
          borderRadius: '36px',
          border: '4px solid #d6aa58',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            fontFamily: 'serif',
            fontSize: 72,
            fontWeight: 500,
            letterSpacing: 2,
            color: '#e7c680',
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          }}
        >
          RK
        </div>
        <div
          style={{
            fontSize: 12,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#fbf8f3',
            marginTop: 4,
            opacity: 0.9,
          }}
        >
          Jewellery
        </div>
      </div>
    ),
    size,
  );
}
