const fs = require('fs');
const path = require('path');

// 실제 파일명 매핑 (이전 스크립트로 변경된 파일들)
const imagePathMapping = {
  // archaeology
  '/artworks/archaeology_010_글씨가 새겨진 그릇.jpg': '/artworks/archaeology_001_comb_pattern_pottery.jpg',
  '/artworks/archaeology_011_관꽂이.jpg': '/artworks/archaeology_002_jeweled_shoes.jpg',
  '/artworks/archaeology_012_백제금동대향로.jpg': '/artworks/archaeology_003_landscape_phoenix_brick.jpg',
  '/artworks/archaeology_013_갑옷과 투구.jpg': '/artworks/archaeology_004_earrings.jpg',
  '/artworks/archaeology_014_금관.jpg': '/artworks/archaeology_005_gold_crown.jpg',
  '/artworks/archaeology_015_말탄사람토기.jpg': '/artworks/archaeology_006_horse_rider.jpg',
  '/artworks/archaeology_016_토우 붙은 항아리.jpg': '/artworks/archaeology_007_celadon_bottle.jpg',
  '/artworks/archaeology_017_도깨비무늬기와.jpg': '/artworks/archaeology_008_sword_dagger.jpg',
  '/artworks/archaeology_018_뼈담는 그릇.jpg': '/artworks/archaeology_009_bronze_bell.jpg',
  '/artworks/archaeology_019_글씨가 있는 불비상.jpg': '/artworks/archaeology_010_iron_pot.jpg',
  
  // art
  '/artworks/art_002_안평대군이 쓴 소상팔경시첩.jpg': '/artworks/art_001_celadon_vase.jpg',
  '/artworks/art_003_석봉한호가 류여장에게써준 서첩.jpg': '/artworks/art_002_white_jar.jpg',
  '/artworks/art_004_추사김정희가쓴 자신의 별호에 관한 글.jpg': '/artworks/art_003_buncheong_bottle.jpg',
  '/artworks/art_005_이명기필 강세황초상.jpg': '/artworks/art_004_landscape_painting.jpg',
  '/artworks/art_006_김홍도 풍속도첩.jpg': '/artworks/art_005_portrait_official.jpg',
  '/artworks/art_007_이인문 강산무진도.jpg': '/artworks/art_006_calligraphy_poem.jpg',
  '/artworks/art_008_정선 풍악도첩.jpg': '/artworks/art_007_buddha_statue.jpg',
  '/artworks/art_009_홍세섭 유압도.jpg': '/artworks/art_008_temple_bell.jpg',
  '/artworks/art_010_맹호도.jpg': '/artworks/art_009_celadon_incense.jpg',
  '/artworks/art_011_미원계회도.jpg': '/artworks/art_010_wooden_cabinet.jpg',
  '/artworks/art_012_감지금니화엄경사경.jpg': '/artworks/art_011_portrait.jpg',
  '/artworks/art_013_감로도.jpg': '/artworks/art_012_gold_sutra.jpg',
  '/artworks/art_014_괘불.jpg': '/artworks/art_013_nectar_painting.jpg',
  '/artworks/art_016_사방탁자.jpg': '/artworks/art_014_hanging_scroll.jpg',
  '/artworks/art_017_나전대모불자.jpg': '/artworks/art_015_lacquer_whisk.jpg',
  '/artworks/art_018_반가사유상.jpg': '/artworks/art_016_pensive_bodhisattva.jpg',
  '/artworks/art_019_연가칠년명금동불입상.jpg': '/artworks/art_017_gilt_bronze_buddha.jpg',
  '/artworks/art_020_순금제아미타불좌상_순금제불입상.jpg': '/artworks/art_018_gold_buddha.jpg',
  '/artworks/art_022_춘궁리출토 철불좌상.jpg': '/artworks/art_019_iron_buddha.jpg',
  '/artworks/art_023_감은사동탑 사리기.jpg': '/artworks/art_020_sarira_casket.jpg',
  '/artworks/art_024_청동은입사물가풍경무늬정병.jpg': '/artworks/art_021_bronze_kundika.jpg',
  '/artworks/art_025_천흥사범종.jpg': '/artworks/art_022_temple_bell.jpg',
  '/artworks/art_026_청자 참외 모양 병.jpg': '/artworks/art_023_celadon_melon.jpg',
  '/artworks/art_027_청자 연꽃넝쿨무늬 매병.jpg': '/artworks/art_024_celadon_lotus.jpg',
  '/artworks/art_028_청자 칠보무늬 향로.jpg': '/artworks/art_025_celadon_incense.jpg',
  '/artworks/art_029_청자 사자장식 향로.jpg': '/artworks/art_026_celadon_lion.jpg',
  '/artworks/art_030_청자 모란넝쿨무늬 주전자.jpg': '/artworks/art_027_celadon_peony.jpg',
  '/artworks/art_031_청자 대나무 학무늬 매병.jpg': '/artworks/art_028_celadon_bamboo.jpg',
  '/artworks/art_032_청자 버드나무무늬 병.jpg': '/artworks/art_029_celadon_willow.jpg',
  '/artworks/art_033_청자 모란무늬 항아리.jpg': '/artworks/art_030_celadon_jar.jpg',
  '/artworks/art_034_분청사기 용무늬 항아리.jpg': '/artworks/art_031_buncheong_dragon.jpg',
  '/artworks/art_035_분청사기 모란넝쿨무늬 항아리.jpg': '/artworks/art_032_buncheong_peony.jpg',
  '/artworks/art_036_분청사기 모란무늬 자라병.jpg': '/artworks/art_033_buncheong_turtle.jpg',
  '/artworks/art_037_백자 넝쿨무늬 대접.jpg': '/artworks/art_034_white_bowl.jpg',
  '/artworks/art_038_백자 매화 새무늬 항아리.jpg': '/artworks/art_035_white_plum.jpg',
  '/artworks/art_039_백자 끈무늬 병.jpg': '/artworks/art_036_white_cord.jpg',
  '/artworks/art_040_백자 매화 대나무 무늬 항아리.jpg': '/artworks/art_037_white_bamboo.jpg',
  '/artworks/art_041_백자철화 포도넝쿨 무늬 항아리.jpg': '/artworks/art_038_white_grape.jpg',
  '/artworks/art_042_경천사 10층석탑.jpg': '/artworks/art_039_stone_pagoda.jpg',
  
  // asia
  '/artworks/asia_001_청자 어룡식 화병.jpg': '/artworks/asia_001_chinese_celadon.jpg',
  '/artworks/asia_002_백자쌍엽문접시.jpg': '/artworks/asia_002_japanese_pottery.jpg',
  '/artworks/asia_003_대리석제 불상.jpg': '/artworks/asia_003_indian_sculpture.jpg',
  '/artworks/asia_004_청동궤.jpg': '/artworks/asia_004_thai_bronze.jpg',
  '/artworks/asia_005_당삼채마.jpg': '/artworks/asia_005_vietnamese_ceramic.jpg',
  '/artworks/asia_006_불법을 수호하는 신.jpg': '/artworks/asia_006_mongol_artifact.jpg',
  '/artworks/asia_007_창조신복희와 여와.jpg': '/artworks/asia_007_tibetan_thangka.jpg',
  '/artworks/asia_008_허리띠버클.jpg': '/artworks/asia_008_persian_textile.jpg',
  '/artworks/asia_009_이마리 도자기.jpg': '/artworks/asia_009_ottoman_calligraphy.jpg',
  '/artworks/asia_010_칠기 혼수품.jpg': '/artworks/asia_010_malay_kris.jpg',
  '/artworks/asia_011_가네샤 석조신상.jpg': '/artworks/asia_011_ganesha_statue.jpg',
  '/artworks/asia_012_금제벨트.jpg': '/artworks/asia_012_gold_belt.jpg',
  
  // history
  '/artworks/history_001_무구정광대다라니경.jpg': '/artworks/history_001_dharani_sutra.jpg',
  '/artworks/history_002_대보적경.jpg': '/artworks/history_002_royal_document.jpg',
  '/artworks/history_003_고려관리허재의석관.jpg': '/artworks/history_003_royal_seal.jpg',
  '/artworks/history_004_신라 진흥왕이 북한산시찰후 세운 비.jpg': '/artworks/history_004_map_korea.jpg',
  '/artworks/history_005_대동여지도.jpg': '/artworks/history_005_joseon_chronicle.jpg',
  '/artworks/history_006_이성계호적.jpg': '/artworks/history_006_armor_helmet.jpg',
  '/artworks/history_007_진충귀에게 내린 조선개국원종공신 임명문서.jpg': '/artworks/history_007_military_banner.jpg',
  '/artworks/history_008_대한제국 황태자 책봉 금책.jpg': '/artworks/history_008_royal_robe.jpg',
  '/artworks/history_009_고려 인종임금 시책.jpg': '/artworks/history_009_stone_monument.jpg',
  '/artworks/history_010_철인왕후옥책.jpg': '/artworks/history_010_bronze_mirror.jpg',
  '/artworks/history_011_손으로 쓴 화엄경.jpg': '/artworks/history_011_handwritten_sutra.jpg',
  '/artworks/history_012_조선과중국의학자들이 주고받은 시.jpg': '/artworks/history_012_diplomatic_poems.jpg',
  '/artworks/history_013_명나라로 가는 바닷길.jpg': '/artworks/history_013_sea_route.jpg',
  '/artworks/history_014_대방광원각수다라요의경언해.jpg': '/artworks/history_014_sutra_commentary.jpg',
  '/artworks/history_015_재산상속문서.jpg': '/artworks/history_015_inheritance_doc.jpg',
  
  // donation
  '/artworks/donation_001_분청사기박지모란당초문병.jpg': '/artworks/donation_001_jade_ornament.jpg',
  '/artworks/donation_002_초조본유가사지론.jpg': '/artworks/donation_002_lacquer_box.jpg',
  '/artworks/donation_003_청동제투구.jpg': '/artworks/donation_003_pottery_vessel.jpg',
  '/artworks/donation_004_문갑.jpg': '/artworks/donation_004_silk_painting.jpg',
  '/artworks/donation_005_팔걸이.jpg': '/artworks/donation_005_bronze_vessel.jpg',
  '/artworks/donation_006_나전반짇고리.jpg': '/artworks/donation_006_ceramic_plate.jpg',
  '/artworks/donation_007_오리모양토기.jpg': '/artworks/donation_007_wood_sculpture.jpg',
  '/artworks/donation_008_백자난초무늬호리병.jpg': '/artworks/donation_008_metal_craft.jpg',
  '/artworks/donation_009_건칠불두.jpg': '/artworks/donation_009_stone_pagoda.jpg',
  '/artworks/donation_010_보살무늬수막새.jpg': '/artworks/donation_010_textile_fabric.jpg',
  '/artworks/donation_011_金銅製 떨잠형 머리장식.jpg': '/artworks/donation_011_hair_ornament.jpg',
  '/artworks/donation_012_도깨비무늬사래기와.jpg': '/artworks/donation_012_roof_tile.jpg',
  '/artworks/donation_015_문갑.jpg': '/artworks/donation_015_cabinet.jpg',
  
  // misc
  '/artworks/misc_001_미수허목이 쓴 삼척 동해비의 원고.jpg': '/artworks/misc_001_donghaebimun.jpg',
  '/artworks/misc_021_감산사 미륵보살입상_아미타불입상.jpg': '/artworks/misc_021_maitreya_amitabha.jpg'
};

function updateArtifactsImages() {
  const artifactsPath = path.join(process.cwd(), 'data', 'artifacts.ts');
  let content = fs.readFileSync(artifactsPath, 'utf8');
  
  console.log('📝 artifacts.ts 이미지 경로 업데이트 시작...');
  
  let updatedCount = 0;
  
  // 각 매핑에 대해 치환
  Object.entries(imagePathMapping).forEach(([oldPath, newPath]) => {
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
  updateArtifactsImages();
}

module.exports = { updateArtifactsImages };