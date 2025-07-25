const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    // 기본 아이콘 생성 (박물관 테마)
    const iconSvg = `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#1e40af"/>
        <path d="M256 80 L356 180 L356 380 L156 380 L156 180 Z" fill="white" opacity="0.9"/>
        <rect x="196" y="240" width="40" height="140" fill="#1e40af"/>
        <rect x="236" y="240" width="40" height="140" fill="#1e40af"/>
        <rect x="276" y="240" width="40" height="140" fill="#1e40af"/>
        <path d="M256 100 L336 180 L176 180 Z" fill="white"/>
        <rect x="156" y="180" width="200" height="20" fill="white" opacity="0.8"/>
        <text x="256" y="140" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#1e40af">박물관</text>
      </svg>
    `;

    // SVG를 PNG로 변환
    const svgBuffer = Buffer.from(iconSvg);
    
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join('public', 'icons', `icon-${size}x${size}.png`));
      
      console.log(`Generated icon-${size}x${size}.png`);
    }

    // maskable 아이콘 생성 (안전 영역 고려)
    const maskableSvg = `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#1e40af"/>
        <circle cx="256" cy="256" r="192" fill="white" opacity="0.1"/>
        <path d="M256 160 L316 220 L316 340 L196 340 L196 220 Z" fill="white" opacity="0.9"/>
        <rect x="216" y="260" width="20" height="80" fill="#1e40af"/>
        <rect x="246" y="260" width="20" height="80" fill="#1e40af"/>
        <rect x="276" y="260" width="20" height="80" fill="#1e40af"/>
        <path d="M256 170 L306 220 L206 220 Z" fill="white"/>
        <text x="256" y="200" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#1e40af">박물관</text>
      </svg>
    `;

    const maskableBuffer = Buffer.from(maskableSvg);
    
    for (const size of sizes) {
      await sharp(maskableBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join('public', 'icons', `icon-maskable-${size}x${size}.png`));
      
      console.log(`Generated icon-maskable-${size}x${size}.png`);
    }

    // Apple Touch Icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join('public', 'apple-touch-icon.png'));
    
    console.log('Generated apple-touch-icon.png');

    // Favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join('public', 'favicon.png'));
    
    console.log('Generated favicon.png');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();