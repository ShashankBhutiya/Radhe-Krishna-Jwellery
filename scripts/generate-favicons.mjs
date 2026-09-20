import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const APP_DIR = path.join(ROOT_DIR, 'src', 'app');

// High-resolution SVG for Radhe Krishna brand monogram
// Royal Indian jewellery atelier aesthetic: deep obsidian/espresso gradient, antique gold border, serif monogram
function createSvg(size) {
  const rx = Math.round(size * 0.22);
  const strokeWidth = Math.max(1.5, Math.round(size * 0.045));
  const fontSize = Math.round(size * 0.48);
  const textY = Math.round(size * 0.65);

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#4b3425" />
      <stop offset="55%" stop-color="#2c1f17" />
      <stop offset="100%" stop-color="#191310" />
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8e5b8" />
      <stop offset="40%" stop-color="#d6aa58" />
      <stop offset="80%" stop-color="#b68936" />
      <stop offset="100%" stop-color="#e7c680" />
    </linearGradient>
    <filter id="goldGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="${Math.max(1, Math.round(size * 0.02))}" stdDeviation="${Math.max(0.5, size * 0.02)}" flood-color="#000000" flood-opacity="0.85" />
    </filter>
  </defs>

  <!-- Background tile with subtle luxury rounded corners -->
  <rect x="${strokeWidth / 2}" y="${strokeWidth / 2}" width="${size - strokeWidth}" height="${size - strokeWidth}" rx="${rx}" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="${strokeWidth}" />

  <!-- Inner delicate border for larger sizes -->
  ${
    size >= 96
      ? `<rect x="${strokeWidth * 2.2}" y="${strokeWidth * 2.2}" width="${size - strokeWidth * 4.4}" height="${size - strokeWidth * 4.4}" rx="${rx * 0.7}" fill="none" stroke="#d6aa58" stroke-width="${Math.max(0.8, strokeWidth * 0.35)}" opacity="0.4" />`
      : ''
  }

  <!-- RK Monogram -->
  <text
    x="50%"
    y="${textY}"
    text-anchor="middle"
    font-family="'Cormorant Garamond', 'Cinzel', 'Georgia', 'Playfair Display', serif"
    font-size="${fontSize}px"
    font-weight="600"
    letter-spacing="${Math.round(size * -0.015)}px"
    fill="url(#goldGrad)"
    filter="url(#goldGlow)"
  >RK</text>
</svg>`.trim();
}

function pngsToIco(pngBuffers) {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved. Must always be 0.
  header.writeUInt16LE(1, 2); // Specifies image type: 1 for icon (.ICO) image.
  header.writeUInt16LE(pngBuffers.length, 4); // Specifies number of images in the file.

  let offset = 6 + 16 * pngBuffers.length;
  const dirEntries = [];

  for (const img of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0); // Width
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Size of image data
    entry.writeUInt32LE(offset, 12); // Offset of image data
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((b) => b.buffer)]);
}

async function run() {
  console.log('Generating favicon assets...');

  // 1. Generate SVG
  const svg512 = createSvg(512);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), svg512, 'utf8');
  console.log('Created public/favicon.svg');

  // 2. Generate PNGs at required resolutions
  const sizes = [16, 32, 48, 96, 180, 192, 512];
  const rendered = {};

  for (const s of sizes) {
    const svgForSize = createSvg(s);
    const pngBuffer = await sharp(Buffer.from(svgForSize))
      .resize(s, s)
      .png({ compressionLevel: 9 })
      .toBuffer();
    rendered[s] = pngBuffer;

    if (s === 48) {
      fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-48x48.png'), pngBuffer);
      fs.writeFileSync(path.join(PUBLIC_DIR, 'icon.png'), pngBuffer);
    }
    if (s === 96) fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-96x96.png'), pngBuffer);
    if (s === 180) {
      fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), pngBuffer);
      fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon-precomposed.png'), pngBuffer);
      fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-icon.png'), pngBuffer);
    }
    if (s === 192) fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-192x192.png'), pngBuffer);
    if (s === 512) fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-512x512.png'), pngBuffer);
    if (s === 16) fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-16x16.png'), pngBuffer);
    if (s === 32) fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-32x32.png'), pngBuffer);
  }

  console.log('Created all resolution PNGs in public/');

  // 3. Build multi-frame ICO containing 16x16, 32x32, 48x48
  const icoBuffer = pngsToIco([
    { width: 16, height: 16, buffer: rendered[16] },
    { width: 32, height: 32, buffer: rendered[32] },
    { width: 48, height: 48, buffer: rendered[48] },
  ]);

  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(APP_DIR, 'favicon.ico'), icoBuffer);
  console.log('Created public/favicon.ico and src/app/favicon.ico (Multi-frame 16x16, 32x32, 48x48 ICO)');

  console.log('Done!');
}

run().catch((err) => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
