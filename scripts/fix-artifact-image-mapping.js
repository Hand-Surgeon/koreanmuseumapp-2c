const fs = require('fs');
const path = require('path');

// 유물 ID와 이름, 그리고 실제 이미지 파일의 올바른 매핑
const correctMapping = {
  // 고고관 (1-25)
  1: { name: '빗살무늬토기', image: 'archaeology_001_comb_pattern_pottery.jpg' },
  2: { name: '요령식동검', image: 'archaeology_002_jeweled_shoes.jpg' }, // 실제로는 금제신발
  3: { name: '산수봉황문전', image: 'archaeology_003_landscape_phoenix_brick.jpg' },
  4: { name: '금제 귀걸이', image: 'archaeology_004_earrings.jpg' },
  5: { name: '주먹도끼', image: 'archaeology_005_gold_crown.jpg' }, // 실제로는 금관
  6: { name: '덧무늬토기', image: 'archaeology_006_horse_rider.jpg' }, // 실제로는 말탄사람토기
  7: { name: '농경문청동기', image: 'archaeology_007_celadon_bottle.jpg' }, // 청자병?
  8: { name: '동종', image: 'archaeology_008_sword_dagger.jpg' }, // 실제로는 검/단검
  9: { name: '오리모양토기', image: 'archaeology_009_bronze_bell.jpg' }, // 실제로는 청동종
  10: { name: '글씨가 새겨진 그릇', image: 'archaeology_010_iron_pot.jpg' }, // 철제솥?
  11: { name: '관꽂이', image: 'archaeology_002_jeweled_shoes.jpg' }, // 중복
  12: { name: '백제금동대향로', image: 'archaeology_003_landscape_phoenix_brick.jpg' }, // 중복
  13: { name: '갑옷과 투구', image: 'archaeology_004_earrings.jpg' }, // 중복
  14: { name: '금관', image: 'archaeology_005_gold_crown.jpg' },
  15: { name: '말탄사람토기', image: 'archaeology_006_horse_rider.jpg' },
  16: { name: '토우 붙은 항아리', image: 'archaeology_007_celadon_bottle.jpg' }, // 중복
  17: { name: '도깨비무늬기와', image: 'archaeology_008_sword_dagger.jpg' }, // 중복
  18: { name: '뼈담는 그릇', image: 'archaeology_009_bronze_bell.jpg' }, // 중복
  19: { name: '글씨가 있는 불비상', image: 'archaeology_010_iron_pot.jpg' }, // 중복
  
  // 미술관 (26-67)
  26: { name: '정선필 인왕제색도', image: 'art_001_celadon_vase.jpg' }, // 실제로는 청자
  27: { name: '안평대군이 쓴 소상팔경시첩', image: 'art_002_white_jar.jpg' },
  28: { name: '석봉한호가 류여장에게써준 서첩', image: 'art_003_buncheong_bottle.jpg' },
  29: { name: '추사김정희가쓴 자신의 별호에 관한 글', image: 'art_004_landscape_painting.jpg' },
  30: { name: '이명기필 강세황초상', image: 'art_005_portrait_official.jpg' },
  31: { name: '김홍도 풍속도첩', image: 'art_006_calligraphy_poem.jpg' },
  32: { name: '이인문 강산무진도', image: 'art_007_buddha_statue.jpg' },
  33: { name: '정선 풍악도첩', image: 'art_008_temple_bell.jpg' },
  34: { name: '홍세섭 유압도', image: 'art_009_celadon_incense.jpg' },
  35: { name: '맹호도', image: 'art_010_wooden_cabinet.jpg' },
  
  // 나머지는 계속...
};

// artifacts.ts 파일 읽기
const artifactsPath = path.join(process.cwd(), 'data', 'artifacts.ts');
let content = fs.readFileSync(artifactsPath, 'utf8');

console.log('🔧 유물-이미지 매핑 수정 시작...');

// 각 유물의 이미지 경로 수정
let updatedCount = 0;

// 정규식으로 각 유물 객체 찾기
const artifactRegex = /{\s*id:\s*(\d+),[\s\S]*?image:\s*"([^"]+)"/g;
let match;
const updates = [];

while ((match = artifactRegex.exec(content)) !== null) {
  const id = parseInt(match[1]);
  const currentImage = match[2];
  
  if (correctMapping[id]) {
    const newImage = `/artworks/${correctMapping[id].image}`;
    if (currentImage !== newImage) {
      updates.push({
        id,
        name: correctMapping[id].name,
        oldImage: currentImage,
        newImage: newImage
      });
    }
  }
}

// 업데이트 적용
updates.forEach(update => {
  // ID로 해당 유물 찾아서 이미지 경로만 수정
  const idPattern = new RegExp(`(id:\\s*${update.id},.*?image:\\s*)"[^"]+"`, 's');
  content = content.replace(idPattern, `$1"${update.newImage}"`);
  console.log(`✅ ID ${update.id} (${update.name}): ${update.oldImage} → ${update.newImage}`);
  updatedCount++;
});

// 파일 저장
fs.writeFileSync(artifactsPath, content);

console.log(`\n✨ 총 ${updatedCount}개 유물 이미지 경로 수정 완료!`);

// 이미지 파일 이름 추출해서 보여주기
console.log('\n📸 실제 이미지 파일들:');
const imageFiles = fs.readdirSync(path.join(process.cwd(), 'public', 'artworks'))
  .filter(f => f.endsWith('.jpg') && !f.includes('_2.jpg'))
  .slice(0, 20);

imageFiles.forEach(file => {
  console.log(`  - ${file}`);
});