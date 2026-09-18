import { ImageResponse } from 'next/og';

export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 30% 30%, #4b3425 0%, #211a17 100%)',
          borderRadius: '22%',
          border: '2px solid #d6aa58',
          boxShadow: 'inset 0 0 6px rgba(214, 170, 88, 0.4)',
        }}
      >
        <div
          style={{
            fontFamily: 'serif',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: -0.5,
            color: '#e7c680',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          RK
        </div>
      </div>
    ),
    size,
  );
}
