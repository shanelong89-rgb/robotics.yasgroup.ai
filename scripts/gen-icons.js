const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0A0E1A;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0F1628;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="114" fill="url(#grad)"/>
  <text x="256" y="300" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="180" fill="white" text-anchor="middle" letter-spacing="-8">YAS</text>
  <circle cx="256" cy="380" r="20" fill="#14B8A6" opacity="0.8"/>
</svg>`;

async function generateIcons() {
  const svgBuffer = Buffer.from(svgIcon);
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `icon-${size}x${size}.png`));
    console.log(`Generated ${size}x${size}`);
  }
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(svgBuffer).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('All icons generated!');
}
generateIcons().catch(console.error);
