import { ImageResponse } from 'next/og';

export const alt = 'Radhe Krishna Jewellery — hand-finished imitation jewellery';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #211a17 0%, #4b3425 58%, #87613a 100%)',
          color: '#fbf8f3',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          padding: '72px',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div style={{ color: '#e7c680', fontSize: 26, letterSpacing: 9, textTransform: 'uppercase' }}>
          Radhe Krishna
        </div>
        <div style={{ fontFamily: 'serif', fontSize: 80, lineHeight: 1.05, marginTop: 28 }}>
          Jewellery that carries weight.
        </div>
        <div style={{ borderTop: '2px solid #d6aa58', marginTop: 38, paddingTop: 28, fontSize: 28 }}>
          Hand-finished imitation jewellery · Indore, India
        </div>
      </div>
    ),
    size,
  );
}
