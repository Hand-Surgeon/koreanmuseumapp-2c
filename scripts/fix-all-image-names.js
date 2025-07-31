const fs = require('fs');
const path = require('path');

// artifacts.ts에서 실제로 참조하는 이미지 파일명들
const expectedImageMapping = {
  // 이미 영문으로 된 파일들은 그대로 유지
  'archaeology_001_comb_pattern_pottery': 'archaeology_001_comb_pattern_pottery',
  'archaeology_002_jeweled_shoes': 'archaeology_002_liaoning_bronze_dagger',
  'archaeology_003_landscape_phoenix_brick': 'archaeology_003_landscape_phoenix_brick', 
  'archaeology_004_earrings': 'archaeology_004_earrings',
  'archaeology_005_gold_crown': 'archaeology_005_hand_axe',
  'archaeology_006_horse_rider': 'archaeology_006_applique_pottery',
  'archaeology_007_celadon_bottle': 'archaeology_007_agricultural_bronze',
  'archaeology_008_sword_dagger': 'archaeology_008_bell',
  'archaeology_009_bronze_bell': 'archaeology_009_duck_pottery',
  'archaeology_010_iron_pot': 'archaeology_010_glazed_pottery',
  
  // 아직 한글로 남아있는 파일들
  'archaeology_015_말탄사람토기': 'archaeology_015_horse_rider_pottery',
  'archaeology_016_토우 붙은 항아리': 'archaeology_016_figurine_jar',
  'archaeology_017_도깨비무늬기와': 'archaeology_017_demon_tile',
  'archaeology_018_뼈담는 그릇': 'archaeology_018_bone_container',
  'archaeology_019_글씨가 있는 불비상': 'archaeology_019_inscribed_stele',
  
  // Art 섹션
  'art_012_감지금니화엄경사경': 'art_012_gold_sutra',
  'art_013_감로도': 'art_013_nectar_ritual_painting',
  'art_014_괘불': 'art_014_hanging_buddha',
  'art_016_사방탁자': 'art_016_square_table',
  'art_017_나전대모불자': 'art_017_mother_pearl_whisk',
  'art_018_반가사유상': 'art_018_pensive_bodhisattva',
  'art_019_연가칠년명금동불입상': 'art_019_gilt_bronze_buddha',
  'art_020_순금제아미타불좌상_순금제불입상': 'art_020_pure_gold_buddha',
  'art_022_춘궁리출토 철불좌상': 'art_022_iron_buddha',
  'art_023_감은사동탑 사리기': 'art_023_sarira_casket',
  'art_024_청동은입사물가풍경무늬정병': 'art_024_bronze_kundika',
  'art_025_천흥사범종': 'art_025_temple_bell',
  'art_026_청자 참외 모양 병': 'art_026_celadon_melon_bottle',
  'art_027_청자 연꽃넝쿨무늬 매병': 'art_027_celadon_lotus_vase',
  'art_028_청자 칠보무늬 향로': 'art_028_celadon_incense_burner',
  'art_029_청자 사자장식 향로': 'art_029_celadon_lion_incense',
  'art_030_청자 모란넝쿨무늬 주전자': 'art_030_celadon_peony_pitcher',
  'art_031_청자 대나무 학무늬 매병': 'art_031_celadon_bamboo_vase',
  'art_032_청자 버드나무무늬 병': 'art_032_celadon_willow_bottle',
  'art_033_청자 모란무늬 항아리': 'art_033_celadon_peony_jar',
  'art_034_분청사기 용무늬 항아리': 'art_034_buncheong_dragon_jar',
  'art_035_분청사기 모란넝쿨무늬 항아리': 'art_035_buncheong_peony_jar',
  'art_036_분청사기 모란무늬 자라병': 'art_036_buncheong_turtle_bottle',
  'art_037_백자 넝쿨무늬 대접': 'art_037_white_porcelain_bowl',
  'art_038_백자 매화 새무늬 항아리': 'art_038_white_plum_jar',
  'art_039_백자 끈무늬 병': 'art_039_white_cord_bottle',
  'art_040_백자 매화 대나무 무늬 항아리': 'art_040_white_plum_bamboo_jar',
  'art_041_백자철화 포도넝쿨 무늬 항아리': 'art_041_white_grape_jar',
  'art_042_경천사 10층석탑': 'art_042_pagoda',
  
  // Asia 섹션
  'asia_001_청자 어룡식 화병': 'asia_001_dragon_vase',
  'asia_002_백자쌍엽문접시': 'asia_002_white_leaf_plate',
  'asia_003_대리석제 불상': 'asia_003_marble_buddha',
  'asia_004_청동궤': 'asia_004_bronze_chest',
  'asia_005_당삼채마': 'asia_005_tang_horse',
  'asia_006_불법을 수호하는 신': 'asia_006_guardian_deity',
  'asia_007_창조신복희와 여와': 'asia_007_fuxi_nuwa',
  'asia_008_허리띠버클': 'asia_008_belt_buckle',
  'asia_009_이마리 도자기': 'asia_009_imari_porcelain',
  'asia_010_칠기 혼수품': 'asia_010_lacquer_wedding',
  'asia_011_가네샤 석조신상': 'asia_011_ganesha_statue',
  'asia_012_금제벨트': 'asia_012_gold_belt',
  
  // History 섹션
  'history_001_무구정광대다라니경': 'history_001_dharani_sutra',
  'history_002_대보적경': 'history_002_mahavaipulya_sutra',
  'history_003_고려관리허재의석관': 'history_003_stone_coffin',
  'history_004_신라 진흥왕이 북한산시찰후 세운 비': 'history_004_silla_monument',
  'history_005_대동여지도': 'history_005_daedong_map',
  'history_006_이성계호적': 'history_006_yi_seong_gye_record',
  'history_007_진충귀에게 내린 조선개국원종공신 임명문서': 'history_007_founding_merit_document',
  'history_008_대한제국 황태자 책봉 금책': 'history_008_golden_investiture',
  'history_009_고려 인종임금 시책': 'history_009_goryeo_poem',
  'history_010_철인왕후옥책': 'history_010_queen_jade_book',
  'history_011_손으로 쓴 화엄경': 'history_011_handwritten_sutra',
  'history_012_조선과중국의학자들이 주고받은 시': 'history_012_diplomatic_poems',
  'history_013_명나라로 가는 바닷길': 'history_013_sea_route_map',
  'history_014_대방광원각수다라요의경언해': 'history_014_sutra_commentary',
  'history_015_재산상속문서': 'history_015_inheritance_document',
  
  // Donation 섹션
  'donation_001_분청사기박지모란당초문병': 'donation_001_buncheong_bottle',
  'donation_002_초조본유가사지론': 'donation_002_yogacara_text',
  'donation_003_청동제투구': 'donation_003_bronze_helmet',
  'donation_004_문갑': 'donation_004_document_chest',
  'donation_005_팔걸이': 'donation_005_armrest',
  'donation_006_나전반짇고리': 'donation_006_sewing_basket',
  'donation_007_오리모양토기': 'donation_007_duck_pottery',
  'donation_008_백자난초무늬호리병': 'donation_008_orchid_bottle',
  'donation_009_건칠불두': 'donation_009_lacquer_buddha_head',
  'donation_010_보살무늬수막새': 'donation_010_roof_tile',
  'donation_011_金銅製 떨잠형 머리장식': 'donation_011_hair_ornament',
  'donation_012_도깨비무늬사래기와': 'donation_012_demon_roof_tile',
  'donation_015_문갑': 'donation_015_cabinet',
  
  // Misc 섹션
  'misc_001_미수허목이 쓴 삼척 동해비의 원고': 'misc_001_donghaebimun_manuscript',
  'misc_021_감산사 미륵보살입상_아미타불입상': 'misc_021_maitreya_amitabha'
};

// artifacts.ts의 실제 참조를 기반으로 한 정확한 매핑
const artifactsMapping = {
  // archaeology (고고관)
  'archaeology_010_글씨가 새겨진 그릇': 'archaeology_010_글씨가 새겨진 그릇',
  'archaeology_011_관꽂이': 'archaeology_011_관꽂이',
  'archaeology_012_백제금동대향로': 'archaeology_012_백제금동대향로',
  'archaeology_013_갑옷과 투구': 'archaeology_013_갑옷과 투구',
  'archaeology_014_금관': 'archaeology_014_금관',
  'archaeology_015_말탄사람토기': 'archaeology_015_말탄사람토기',
  'archaeology_016_토우 붙은 항아리': 'archaeology_016_토우 붙은 항아리',
  'archaeology_017_도깨비무늬기와': 'archaeology_017_도깨비무늬기와',
  'archaeology_018_뼈담는 그릇': 'archaeology_018_뼈담는 그릇',
  'archaeology_019_글씨가 있는 불비상': 'archaeology_019_글씨가 있는 불비상',
  
  // art (미술관)
  'art_002_안평대군이 쓴 소상팔경시첩': 'art_001_portrait',
  'art_003_석봉한호가 류여장에게써준 서첩': 'art_002_안평대군이 쓴 소상팔경시첩',
  'art_004_추사김정희가쓴 자신의 별호에 관한 글': 'art_003_석봉한호가 류여장에게써준 서첩',
  'art_005_이명기필 강세황초상': 'art_004_추사김정희가쓴 자신의 별호에 관한 글',
  'art_006_김홍도 풍속도첩': 'art_005_이명기필 강세황초상',
  'art_007_이인문 강산무진도': 'art_006_김홍도 풍속도첩',
  'art_008_정선 풍악도첩': 'art_007_이인문 강산무진도',
  'art_009_홍세섭 유압도': 'art_008_정선 풍악도첩',
  'art_010_맹호도': 'art_009_홍세섭 유압도',
  'art_011_미원계회도': 'art_010_맹호도',
  'art_012_감지금니화엄경사경': 'art_011_미원계회도',
  'art_013_감로도': 'art_012_감지금니화엄경사경',
  'art_014_괘불': 'art_013_감로도',
  'art_016_사방탁자': 'art_014_괘불',
  'art_017_나전대모불자': 'art_016_사방탁자',
  'art_018_반가사유상': 'art_017_나전대모불자',
  'art_019_연가칠년명금동불입상': 'art_018_반가사유상',
  'art_020_순금제아미타불좌상_순금제불입상': 'art_019_연가칠년명금동불입상',
  'art_022_춘궁리출토 철불좌상': 'art_020_순금제아미타불좌상_순금제불입상',
  'art_023_감은사동탑 사리기': 'art_022_춘궁리출토 철불좌상',
  'art_024_청동은입사물가풍경무늬정병': 'art_023_감은사동탑 사리기',
  'art_025_천흥사범종': 'art_024_청동은입사물가풍경무늬정병',
  'art_026_청자 참외 모양 병': 'art_025_천흥사범종',
  'art_027_청자 연꽃넝쿨무늬 매병': 'art_026_청자 참외 모양 병',
  'art_028_청자 칠보무늬 향로': 'art_027_청자 연꽃넝쿨무늬 매병',
  'art_029_청자 사자장식 향로': 'art_028_청자 칠보무늬 향로',
  'art_030_청자 모란넝쿨무늬 주전자': 'art_029_청자 사자장식 향로',
  'art_031_청자 대나무 학무늬 매병': 'art_030_청자 모란넝쿨무늬 주전자',
  'art_032_청자 버드나무무늬 병': 'art_031_청자 대나무 학무늬 매병',
  'art_033_청자 모란무늬 항아리': 'art_032_청자 버드나무무늬 병',
  'art_034_분청사기 용무늬 항아리': 'art_033_청자 모란무늬 항아리',
  'art_035_분청사기 모란넝쿨무늬 항아리': 'art_034_분청사기 용무늬 항아리',
  'art_036_분청사기 모란무늬 자라병': 'art_035_분청사기 모란넝쿨무늬 항아리',
  'art_037_백자 넝쿨무늬 대접': 'art_036_분청사기 모란무늬 자라병',
  'art_038_백자 매화 새무늬 항아리': 'art_037_백자 넝쿨무늬 대접',
  'art_039_백자 끈무늬 병': 'art_038_백자 매화 새무늬 항아리',
  'art_040_백자 매화 대나무 무늬 항아리': 'art_039_백자 끈무늬 병',
  'art_041_백자철화 포도넝쿨 무늬 항아리': 'art_040_백자 매화 대나무 무늬 항아리',
  'art_042_경천사 10층석탑': 'art_041_백자철화 포도넝쿨 무늬 항아리',
  
  // asia (아시아관)
  'asia_001_청자 어룡식 화병': 'asia_001_청자 어룡식 화병',
  'asia_002_백자쌍엽문접시': 'asia_002_백자쌍엽문접시',
  'asia_003_대리석제 불상': 'asia_003_대리석제 불상',
  'asia_004_청동궤': 'asia_004_청동궤',
  'asia_005_당삼채마': 'asia_005_당삼채마',
  'asia_006_불법을 수호하는 신': 'asia_006_불법을 수호하는 신',
  'asia_007_창조신복희와 여와': 'asia_007_창조신복희와 여와',
  'asia_008_허리띠버클': 'asia_008_허리띠버클',
  'asia_009_이마리 도자기': 'asia_009_이마리 도자기',
  'asia_010_칠기 혼수품': 'asia_010_칠기 혼수품',
  'asia_011_가네샤 석조신상': 'asia_011_가네샤 석조신상',
  'asia_012_금제벨트': 'asia_012_금제벨트',
  
  // history (역사관)
  'history_001_무구정광대다라니경': 'history_001_무구정광대다라니경',
  'history_002_대보적경': 'history_002_대보적경',
  'history_003_고려관리허재의석관': 'history_003_고려관리허재의석관',
  'history_004_신라 진흥왕이 북한산시찰후 세운 비': 'history_004_신라 진흥왕이 북한산시찰후 세운 비',
  'history_005_대동여지도': 'history_005_대동여지도',
  'history_006_이성계호적': 'history_006_이성계호적',
  'history_007_진충귀에게 내린 조선개국원종공신 임명문서': 'history_007_진충귀에게 내린 조선개국원종공신 임명문서',
  'history_008_대한제국 황태자 책봉 금책': 'history_008_대한제국 황태자 책봉 금책',
  'history_009_고려 인종임금 시책': 'history_009_고려 인종임금 시책',
  'history_010_철인왕후옥책': 'history_010_철인왕후옥책',
  'history_011_손으로 쓴 화엄경': 'history_011_손으로 쓴 화엄경',
  'history_012_조선과중국의학자들이 주고받은 시': 'history_012_조선과중국의학자들이 주고받은 시',
  'history_013_명나라로 가는 바닷길': 'history_013_명나라로 가는 바닷길',
  'history_014_대방광원각수다라요의경언해': 'history_014_대방광원각수다라요의경언해',
  'history_015_재산상속문서': 'history_015_재산상속문서',
  
  // donation (기증관)
  'donation_001_분청사기박지모란당초문병': 'donation_001_분청사기박지모란당초문병',
  'donation_002_초조본유가사지론': 'donation_002_초조본유가사지론',
  'donation_003_청동제투구': 'donation_003_청동제투구',
  'donation_004_문갑': 'donation_004_문갑',
  'donation_005_팔걸이': 'donation_005_팔걸이',
  'donation_006_나전반짇고리': 'donation_006_나전반짇고리',
  'donation_007_오리모양토기': 'donation_007_오리모양토기',
  'donation_008_백자난초무늬호리병': 'donation_008_백자난초무늬호리병',
  'donation_009_건칠불두': 'donation_009_건칠불두',
  'donation_010_보살무늬수막새': 'donation_010_보살무늬수막새',
  'donation_011_金銅製 떨잠형 머리장식': 'donation_011_金銅製 떨잠형 머리장식',
  'donation_012_도깨비무늬사래기와': 'donation_012_도깨비무늬사래기와',
  'donation_015_문갑': 'donation_015_문갑',
  
  // misc
  'misc_001_미수허목이 쓴 삼척 동해비의 원고': 'misc_001_미수허목이 쓴 삼척 동해비의 원고',
  'misc_021_감산사 미륵보살입상_아미타불입상': 'misc_021_감산사 미륵보살입상_아미타불입상'
};

function fixAllImageNames() {
  const artworksDir = path.join(process.cwd(), 'public', 'artworks');
  
  console.log('🔧 모든 이미지 파일명 수정 시작...');
  
  const files = fs.readdirSync(artworksDir);
  let renamedCount = 0;
  
  // 아무것도 변경하지 않고 현재 상태만 확인
  files.forEach(file => {
    if (file.match(/[\u3131-\uD79D]/) || file.includes(' ')) {
      console.log(`한글/공백 포함 파일: ${file}`);
    }
  });
  
  console.log(`\n✨ 현재 ${files.length}개 파일 확인 완료!`);
}

// 스크립트 실행
if (require.main === module) {
  fixAllImageNames();
}

module.exports = { fixAllImageNames };