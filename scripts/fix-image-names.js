const fs = require('fs');
const path = require('path');

// 이미지 파일명 매핑
const imageNameMapping = {
  // archaeology
  'archaeology_010_글씨가 새겨진 그릇': 'archaeology_001_comb_pattern_pottery',
  'archaeology_011_관꽂이': 'archaeology_002_jeweled_shoes',
  'archaeology_012_백제금동대향로': 'archaeology_003_landscape_phoenix_brick',
  'archaeology_013_갑옷과 투구': 'archaeology_004_earrings',
  'archaeology_014_금관': 'archaeology_005_gold_crown',
  'archaeology_015_말탄사람토기': 'archaeology_006_horse_rider',
  'archaeology_016_토우 붙은 항아리': 'archaeology_007_celadon_bottle',
  'archaeology_017_도깨비무늬기와': 'archaeology_008_sword_dagger',
  'archaeology_018_뼈담는 그릇': 'archaeology_009_bronze_bell',
  'archaeology_019_글씨가 있는 불비상': 'archaeology_010_iron_pot',
  
  // art
  'art_002_안평대군이 쓴 소상팔경시첩': 'art_001_celadon_vase',
  'art_003_석봉한호가 류여장에게써준 서첩': 'art_002_white_jar',
  'art_004_추사김정희가쓴 자신의 별호에 관한 글': 'art_003_buncheong_bottle',
  'art_005_이명기필 강세황초상': 'art_004_landscape_painting',
  'art_006_김홍도 풍속도첩': 'art_005_portrait_official',
  'art_007_이인문 강산무진도': 'art_006_calligraphy_poem',
  'art_008_정선 풍악도첩': 'art_007_buddha_statue',
  'art_009_홍세섭 유압도': 'art_008_temple_bell',
  'art_010_맹호도': 'art_009_celadon_incense',
  'art_011_미원계회도': 'art_010_wooden_cabinet',
  
  // history
  'history_001_무구정광대다라니경': 'history_001_dharani_sutra',
  'history_002_대보적경': 'history_002_royal_document',
  'history_003_고려관리허재의석관': 'history_003_royal_seal',
  'history_004_신라 진흥왕이 북한산시찰후 세운 비': 'history_004_map_korea',
  'history_005_대동여지도': 'history_005_joseon_chronicle',
  'history_006_이성계호적': 'history_006_armor_helmet',
  'history_007_진충귀에게 내린 조선개국원종공신 임명문서': 'history_007_military_banner',
  'history_008_대한제국 황태자 책봉 금책': 'history_008_royal_robe',
  'history_009_고려 인종임금 시책': 'history_009_stone_monument',
  'history_010_철인왕후옥책': 'history_010_bronze_mirror',
  
  // donation
  'donation_001_분청사기박지모란당초문병': 'donation_001_jade_ornament',
  'donation_002_초조본유가사지론': 'donation_002_lacquer_box',
  'donation_003_청동제투구': 'donation_003_pottery_vessel',
  'donation_004_문갑': 'donation_004_silk_painting',
  'donation_005_팔걸이': 'donation_005_bronze_vessel',
  'donation_006_나전반짇고리': 'donation_006_ceramic_plate',
  'donation_007_오리모양토기': 'donation_007_wood_sculpture',
  'donation_008_백자난초무늬호리병': 'donation_008_metal_craft',
  'donation_009_건칠불두': 'donation_009_stone_pagoda',
  'donation_010_보살무늬수막새': 'donation_010_textile_fabric',
  
  // asia
  'asia_001_청자 어룡식 화병': 'asia_001_chinese_celadon',
  'asia_002_백자쌍엽문접시': 'asia_002_japanese_pottery',
  'asia_003_대리석제 불상': 'asia_003_indian_sculpture',
  'asia_004_청동궤': 'asia_004_thai_bronze',
  'asia_005_당삼채마': 'asia_005_vietnamese_ceramic',
  'asia_006_불법을 수호하는 신': 'asia_006_mongol_artifact',
  'asia_007_창조신복희와 여와': 'asia_007_tibetan_thangka',
  'asia_008_허리띠버클': 'asia_008_persian_textile',
  'asia_009_이마리 도자기': 'asia_009_ottoman_calligraphy',
  'asia_010_칠기 혼수품': 'asia_010_malay_kris'
};

function fixImageNames() {
  const artworksDir = path.join(process.cwd(), 'public', 'artworks');
  
  console.log('🔧 이미지 파일명 수정 시작...');
  
  const files = fs.readdirSync(artworksDir);
  let renamedCount = 0;
  
  files.forEach(file => {
    // 파일명에서 확장자와 " 2" 부분 제거
    const baseName = file.replace(/( 2)?\.jpg$/, '');
    
    // 매핑에서 새 이름 찾기
    const newBaseName = imageNameMapping[baseName];
    
    if (newBaseName) {
      const oldPath = path.join(artworksDir, file);
      const newFileName = file.includes(' 2.jpg') ? `${newBaseName}_2.jpg` : `${newBaseName}.jpg`;
      const newPath = path.join(artworksDir, newFileName);
      
      if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ ${file} → ${newFileName}`);
        renamedCount++;
      }
    }
  });
  
  console.log(`\n✨ 총 ${renamedCount}개 파일 이름 변경 완료!`);
}

// 스크립트 실행
if (require.main === module) {
  fixImageNames();
}

module.exports = { fixImageNames };