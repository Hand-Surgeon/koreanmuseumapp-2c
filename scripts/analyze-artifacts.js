const fs = require('fs');
const path = require('path');

// artifacts.ts 파일 읽기
const artifactsPath = path.join(process.cwd(), 'data', 'artifacts.ts');
const content = fs.readFileSync(artifactsPath, 'utf8');

// 유물 정보 추출
const artifacts = [];
const artifactMatches = content.matchAll(/{\s*id:\s*(\d+),[\s\S]*?name:\s*{[\s\S]*?ko:\s*"([^"]+)"[\s\S]*?},[\s\S]*?image:\s*"([^"]+)"[\s\S]*?hall:\s*"([^"]+)"/g);

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

console.log('📋 유물 분석 결과\n');
console.log('=== 고고관 유물들 ===');
artifacts.filter(a => a.hall === '고고관').slice(0, 20).forEach(a => {
  console.log(`ID ${a.id}: ${a.name}`);
  console.log(`  현재 이미지: ${a.image}`);
  console.log('');
});

console.log('\n=== 실제 이미지 파일들 (archaeology) ===');
imageFiles.filter(f => f.startsWith('archaeology')).forEach(f => {
  console.log(f);
});

console.log('\n=== 미술관 유물들 ===');
artifacts.filter(a => a.hall === '미술관').slice(0, 20).forEach(a => {
  console.log(`ID ${a.id}: ${a.name}`);
  console.log(`  현재 이미지: ${a.image}`);
  console.log('');
});

console.log('\n=== 실제 이미지 파일들 (art) ===');
imageFiles.filter(f => f.startsWith('art')).slice(0, 20).forEach(f => {
  console.log(f);
});