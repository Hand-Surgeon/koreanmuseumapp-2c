const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 이미지 준비 스크립트
async function prepareImages() {
  const publicDir = path.join(process.cwd(), 'public');
  const artworksDir = path.join(publicDir, 'artworks');
  
  // artworks 디렉토리 생성
  if (!fs.existsSync(artworksDir)) {
    fs.mkdirSync(artworksDir, { recursive: true });
  }

  // 임시 이미지 생성 (실제로는 실제 이미지로 대체)
  const artifacts = require('../data/artifacts').artifacts;
  
  console.log('🖼️  이미지 준비 시작...');
  
  for (const artifact of artifacts) {
    const variants = ['main', 'side', 'detail', 'closeup'];
    
    for (const variant of variants) {
      const filename = `artifact-${artifact.id}-${variant}.jpg`;
      const filepath = path.join(artworksDir, filename);
      
      // 이미지가 없으면 플레이스홀더 생성
      if (!fs.existsSync(filepath)) {
        await createPlaceholder(filepath, artifact.name.ko, variant);
      }
      
      // 다양한 크기로 최적화
      await optimizeImage(filepath, artifact.id, variant);
    }
  }
  
  console.log('✅ 이미지 준비 완료!');
}

// 플레이스홀더 이미지 생성
async function createPlaceholder(filepath, name, variant) {
  const width = 1200;
  const height = 1200;
  const backgroundColor = getColorForVariant(variant);
  
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: backgroundColor
    }
  })
  .composite([{
    input: Buffer.from(`
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
        <text x="50%" y="50%" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle">
          ${name}
        </text>
        <text x="50%" y="60%" font-family="Arial" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle">
          ${variant}
        </text>
      </svg>
    `),
    top: 0,
    left: 0
  }])
  .jpeg({ quality: 80 })
  .toFile(filepath);
}

// 변형별 색상
function getColorForVariant(variant) {
  const colors = {
    main: '#1e40af',    // 파란색
    side: '#7c3aed',    // 보라색
    detail: '#dc2626',  // 빨간색
    closeup: '#059669'  // 초록색
  };
  return colors[variant] || '#6b7280';
}

// 이미지 최적화
async function optimizeImage(filepath, artifactId, variant) {
  const formats = [
    { width: 300, suffix: 'thumb' },
    { width: 600, suffix: 'card' },
    { width: 1200, suffix: 'detail' },
    { width: 1920, suffix: 'hero' }
  ];
  
  for (const format of formats) {
    const outputPath = filepath.replace('.jpg', `-${format.suffix}.webp`);
    
    if (!fs.existsSync(outputPath)) {
      await sharp(filepath)
        .resize(format.width, format.width, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toFile(outputPath);
    }
  }
  
  // 블러 플레이스홀더 생성
  const blurPath = filepath.replace('.jpg', '-blur.jpg');
  if (!fs.existsSync(blurPath)) {
    await sharp(filepath)
      .resize(10, 10)
      .blur(5)
      .jpeg({ quality: 50 })
      .toFile(blurPath);
  }
}

// 스크립트 실행
if (require.main === module) {
  prepareImages().catch(console.error);
}

module.exports = { prepareImages };