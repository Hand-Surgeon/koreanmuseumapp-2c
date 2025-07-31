const fs = require('fs');
const path = require('path');

// 남은 한글 파일명 매핑
const remainingMapping = {
  // art 섹션의 남은 한글 파일들
  'art_012_감지금니화엄경사경': 'art_011_portrait',
  'art_013_감로도': 'art_012_gold_sutra',
  'art_014_괘불': 'art_013_nectar_painting',
  'art_016_사방탁자': 'art_014_hanging_scroll',
  'art_017_나전대모불자': 'art_015_lacquer_whisk',
  'art_018_반가사유상': 'art_016_pensive_bodhisattva',
  'art_019_연가칠년명금동불입상': 'art_017_gilt_bronze_buddha',
  'art_020_순금제아미타불좌상_순금제불입상': 'art_018_gold_buddha',
  'art_022_춘궁리출토 철불좌상': 'art_019_iron_buddha',
  'art_023_감은사동탑 사리기': 'art_020_sarira_casket',
  'art_024_청동은입사물가풍경무늬정병': 'art_021_bronze_kundika',
  'art_025_천흥사범종': 'art_022_temple_bell',
  'art_026_청자 참외 모양 병': 'art_023_celadon_melon',
  'art_027_청자 연꽃넝쿨무늬 매병': 'art_024_celadon_lotus',
  'art_028_청자 칠보무늬 향로': 'art_025_celadon_incense',
  'art_029_청자 사자장식 향로': 'art_026_celadon_lion',
  'art_030_청자 모란넝쿨무늬 주전자': 'art_027_celadon_peony',
  'art_031_청자 대나무 학무늬 매병': 'art_028_celadon_bamboo',
  'art_032_청자 버드나무무늬 병': 'art_029_celadon_willow',
  'art_033_청자 모란무늬 항아리': 'art_030_celadon_jar',
  'art_034_분청사기 용무늬 항아리': 'art_031_buncheong_dragon',
  'art_035_분청사기 모란넝쿨무늬 항아리': 'art_032_buncheong_peony',
  'art_036_분청사기 모란무늬 자라병': 'art_033_buncheong_turtle',
  'art_037_백자 넝쿨무늬 대접': 'art_034_white_bowl',
  'art_038_백자 매화 새무늬 항아리': 'art_035_white_plum',
  'art_039_백자 끈무늬 병': 'art_036_white_cord',
  'art_040_백자 매화 대나무 무늬 항아리': 'art_037_white_bamboo',
  'art_041_백자철화 포도넝쿨 무늬 항아리': 'art_038_white_grape',
  'art_042_경천사 10층석탑': 'art_039_stone_pagoda',
  
  // asia 섹션의 남은 한글 파일들
  'asia_002_백자쌍엽문접시': 'asia_002_white_leaf_plate',
  'asia_003_대리석제 불상': 'asia_003_marble_buddha',
  'asia_006_불법을 수호하는 신': 'asia_006_guardian_deity',
  'asia_007_창조신복희와 여와': 'asia_007_fuxi_nuwa',
  'asia_009_이마리 도자기': 'asia_009_imari_porcelain',
  'asia_010_칠기 혼수품': 'asia_010_lacquer_wedding',
  'asia_011_가네샤 석조신상': 'asia_011_ganesha_statue',
  'asia_012_금제벨트': 'asia_012_gold_belt',
  
  // history 섹션의 남은 한글 파일들
  'history_002_대보적경': 'history_002_mahavaipulya_sutra',
  'history_007_진충귀에게 내린 조선개국원종공신 임명문서': 'history_007_founding_merit',
  'history_009_고려 인종임금 시책': 'history_009_goryeo_poem',
  'history_013_명나라로 가는 바닷길': 'history_013_sea_route',
  'history_014_대방광원각수다라요의경언해': 'history_014_sutra_commentary',
  
  // donation 섹션의 남은 한글 파일들
  'donation_002_초조본유가사지론': 'donation_002_yogacara_text',
  'donation_004_문갑': 'donation_004_document_chest',
  'donation_005_팔걸이': 'donation_005_armrest',
  'donation_007_오리모양토기': 'donation_007_duck_pottery',
  'donation_008_백자난초무늬호리병': 'donation_008_orchid_bottle',
  'donation_010_보살무늬수막새': 'donation_010_roof_tile',
  'donation_011_金銅製 떨잠형 머리장식': 'donation_011_hair_ornament',
  'donation_012_도깨비무늬사래기와': 'donation_012_demon_tile',
  'donation_015_문갑': 'donation_015_cabinet',
  
  // misc 섹션
  'misc_001_미수허목이 쓴 삼척 동해비의 원고': 'misc_001_donghaebimun',
  'misc_021_감산사 미륵보살입상_아미타불입상': 'misc_021_maitreya_amitabha'
};

function renameKoreanFiles() {
  const artworksDir = path.join(process.cwd(), 'public', 'artworks');
  
  console.log('🔧 남은 한글 파일명 변경 시작...');
  
  const files = fs.readdirSync(artworksDir);
  let renamedCount = 0;
  
  files.forEach(file => {
    // 파일명에서 확장자와 " 2" 부분 제거
    const baseName = file.replace(/( 2)?\.jpg$/, '');
    
    // 매핑에서 새 이름 찾기
    const newBaseName = remainingMapping[baseName];
    
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
  renameKoreanFiles();
}

module.exports = { renameKoreanFiles };