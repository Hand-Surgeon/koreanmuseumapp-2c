const fs = require('fs');
const path = require('path');

// artifacts.ts 파일 읽기
const artifactsPath = path.join(process.cwd(), 'data', 'artifacts.ts');
const content = fs.readFileSync(artifactsPath, 'utf8');

// 유물 정보 추출
const artifacts = [];
const artifactMatches = content.matchAll(/{[\s\S]*?id:\s*(\d+),[\s\S]*?name:\s*{[\s\S]*?ko:\s*"([^"]+)"[\s\S]*?},[\s\S]*?image:\s*"([^"]+)"[\s\S]*?hall:\s*"([^"]+)"[\s\S]*?}/g);

for (const match of artifactMatches) {
  artifacts.push({
    id: parseInt(match[1]),
    name: match[2],
    image: match[3],
    hall: match[4]
  });
}

// 실제 이미지 파일들
const imageDir = path.join(process.cwd(), 'public', 'artworks');
const imageFiles = fs.readdirSync(imageDir)
  .filter(f => f.endsWith('.jpg') && !f.includes('_2.jpg'))
  .sort();

// 매핑 검증
console.log('🔍 유물-이미지 매핑 검증\n');

const imageFilenames = imageFiles.map(f => `/artworks/${f}`);
const mismatches = [];

artifacts.forEach(artifact => {
  const imageName = artifact.image.split('/').pop();
  
  // 이미지 파일명에서 유물과 관련된 키워드 확인
  let isCorrect = false;
  
  if (artifact.hall === '고고관' && imageName.startsWith('archaeology_')) {
    isCorrect = true;
  } else if (artifact.hall === '미술관' && imageName.startsWith('art_')) {
    isCorrect = true;
  } else if (artifact.hall === '역사관' && imageName.startsWith('history_')) {
    isCorrect = true;
  } else if (artifact.hall === '아시아관' && imageName.startsWith('asia_')) {
    isCorrect = true;
  } else if (artifact.hall === '기증관' && imageName.startsWith('donation_')) {
    isCorrect = true;
  }
  
  if (!imageFilenames.includes(artifact.image)) {
    mismatches.push({
      id: artifact.id,
      name: artifact.name,
      hall: artifact.hall,
      image: artifact.image,
      issue: '이미지 파일이 존재하지 않음'
    });
  } else if (!isCorrect) {
    mismatches.push({
      id: artifact.id,
      name: artifact.name,
      hall: artifact.hall,
      image: artifact.image,
      issue: '잘못된 카테고리의 이미지'
    });
  }
});

// 결과 출력
console.log(`총 유물 수: ${artifacts.length}`);
console.log(`검증된 유물 수: ${artifacts.length - mismatches.length}`);
console.log(`문제가 있는 유물 수: ${mismatches.length}\n`);

if (mismatches.length > 0) {
  console.log('⚠️  문제가 있는 유물들:');
  mismatches.forEach(m => {
    console.log(`\nID ${m.id}: ${m.name} (${m.hall})`);
    console.log(`  현재 이미지: ${m.image}`);
    console.log(`  문제: ${m.issue}`);
  });
  
  // 각 홀별로 사용 가능한 이미지 보여주기
  console.log('\n📸 사용 가능한 이미지들:');
  
  const categories = ['archaeology', 'art', 'history', 'asia', 'donation'];
  categories.forEach(cat => {
    const catImages = imageFiles.filter(f => f.startsWith(cat + '_'));
    console.log(`\n[${cat}] ${catImages.length}개 이미지:`);
    catImages.slice(0, 10).forEach(img => console.log(`  - ${img}`));
    if (catImages.length > 10) console.log(`  ... 외 ${catImages.length - 10}개`);
  });
}

// 이미지 사용 현황
console.log('\n📊 이미지 사용 현황:');
const usedImages = new Set(artifacts.map(a => a.image.split('/').pop()));
const unusedImages = imageFiles.filter(img => !usedImages.has(img));

console.log(`전체 이미지 파일: ${imageFiles.length}개`);
console.log(`사용중인 이미지: ${usedImages.size}개`);
console.log(`미사용 이미지: ${unusedImages.length}개`);

if (unusedImages.length > 0) {
  console.log('\n미사용 이미지들:');
  unusedImages.slice(0, 20).forEach(img => console.log(`  - ${img}`));
  if (unusedImages.length > 20) console.log(`  ... 외 ${unusedImages.length - 20}개`);
}