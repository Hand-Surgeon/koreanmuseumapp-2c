const fs = require('fs');
const path = require('path');

// 정확한 매핑 - artifacts.ts에서 참조하는 파일 -> 실제 존재하는 파일
const finalMapping = {
  // artifacts.ts에서 참조하지만 실제로는 다른 이름인 파일들
  '/artworks/archaeology_002_liaoning_bronze_dagger.jpg': '/artworks/archaeology_002_jeweled_shoes.jpg',
  '/artworks/archaeology_005_hand_axe.jpg': '/artworks/archaeology_005_gold_crown.jpg',
  '/artworks/archaeology_006_applique_pottery.jpg': '/artworks/archaeology_006_horse_rider.jpg',
  '/artworks/archaeology_007_agricultural_bronze.jpg': '/artworks/archaeology_007_celadon_bottle.jpg',
  '/artworks/archaeology_008_bell.jpg': '/artworks/archaeology_008_sword_dagger.jpg',
  '/artworks/archaeology_009_duck_pottery.jpg': '/artworks/archaeology_009_bronze_bell.jpg',
  '/artworks/art_025_천흥사범종.jpg': '/artworks/art_022_temple_bell.jpg',
  '/artworks/donation_011_hair_ornament.jpg': '/artworks/donation_011_hair_ornament_alt.jpg',
  '/artworks/history_011_handwritten_sutra.jpg': '/artworks/history_011_handwritten_sutra_alt.jpg',
  '/artworks/history_012_diplomatic_poems.jpg': '/artworks/history_012_diplomatic_poems_alt.jpg',
  '/artworks/history_015_inheritance_doc.jpg': '/artworks/history_015_inheritance_doc_alt.jpg',
};

function finalizeImageMapping() {
  const artifactsPath = path.join(process.cwd(), 'data', 'artifacts.ts');
  let content = fs.readFileSync(artifactsPath, 'utf8');
  
  console.log('🔧 최종 이미지 매핑 수정 시작...');
  
  let updatedCount = 0;
  
  // 각 매핑에 대해 치환
  Object.entries(finalMapping).forEach(([oldPath, newPath]) => {
    if (content.includes(oldPath)) {
      content = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
      console.log(`✅ ${oldPath} → ${newPath}`);
      updatedCount++;
    }
  });
  
  // 파일 저장
  fs.writeFileSync(artifactsPath, content);
  
  console.log(`\n✨ 총 ${updatedCount}개 이미지 경로 업데이트 완료!`);
}

// 스크립트 실행
if (require.main === module) {
  finalizeImageMapping();
}

module.exports = { finalizeImageMapping };