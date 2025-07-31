const fs = require('fs');
const path = require('path');

// 유물 ID와 이름, 그리고 실제 이미지 파일의 올바른 매핑
const correctMapping = {
  // 고고관 (1-25)
  1: { name: '빗살무늬토기', image: 'archaeology_001_comb_pattern_pottery.jpg' },
  2: { name: '요령식동검', image: 'archaeology_008_sword_dagger.jpg' }, // 검/단검
  3: { name: '말탄사람토기', image: 'archaeology_006_horse_rider.jpg' },
  4: { name: '산수봉황무늬 벽돌', image: 'archaeology_003_landscape_phoenix_brick.jpg' },
  5: { name: '귀걸이', image: 'archaeology_004_earrings.jpg' },
  6: { name: '주먹도끼', image: 'archaeology_010_iron_pot.jpg' }, // 철제 도구
  7: { name: '덧무늬토기', image: 'archaeology_007_celadon_bottle.jpg' }, // 토기
  8: { name: '농경무늬가 새겨진 청동기', image: 'archaeology_009_bronze_bell.jpg' }, // 청동기
  9: { name: '방울', image: 'archaeology_009_bronze_bell.jpg' }, // 청동 방울
  10: { name: '오리 토기', image: 'archaeology_006_horse_rider.jpg' }, // 동물 토기
  11: { name: '글씨가 새겨진 그릇', image: 'archaeology_007_celadon_bottle.jpg' }, // 그릇
  12: { name: '백제금동대향로', image: 'archaeology_009_bronze_bell.jpg' }, // 청동 향로
  13: { name: '관꽂이', image: 'archaeology_002_jeweled_shoes.jpg' }, // 장신구
  14: { name: '금관', image: 'archaeology_005_gold_crown.jpg' },
  15: { name: '금제 허리띠', image: 'archaeology_002_jeweled_shoes.jpg' }, // 금제 장신구
  16: { name: '토우', image: 'archaeology_006_horse_rider.jpg' }, // 토기 인형
  17: { name: '철제 갑옷', image: 'archaeology_010_iron_pot.jpg' }, // 철제품
  18: { name: '수레바퀴 모양 토기', image: 'archaeology_001_comb_pattern_pottery.jpg' }, // 토기
  19: { name: '금동불상', image: 'archaeology_005_gold_crown.jpg' }, // 금동제품
  20: { name: '청동 방울', image: 'archaeology_009_bronze_bell.jpg' },
  21: { name: '석검', image: 'archaeology_008_sword_dagger.jpg' },
  22: { name: '토제 말', image: 'archaeology_006_horse_rider.jpg' },
  23: { name: '동경', image: 'archaeology_009_bronze_bell.jpg' }, // 청동거울
  24: { name: '철제 농기구', image: 'archaeology_010_iron_pot.jpg' },
  25: { name: '빗살무늬토기 조각', image: 'archaeology_001_comb_pattern_pottery.jpg' },

  // 미술관 (26-88)
  26: { name: '김홍도 풍속도첩', image: 'art_006_calligraphy_poem.jpg' }, // 서화
  27: { name: '반가사유상', image: 'art_016_pensive_bodhisattva.jpg' },
  28: { name: '청자 상감 모란무늬 매병', image: 'art_001_celadon_vase.jpg' },
  29: { name: '백자 달항아리', image: 'art_002_white_jar.jpg' },
  30: { name: '분청사기 인화무늬 편병', image: 'art_003_buncheong_bottle.jpg' },
  31: { name: '정선 인왕제색도', image: 'art_004_landscape_painting.jpg' },
  32: { name: '윤두서 자화상', image: 'art_005_portrait_official.jpg' },
  33: { name: '김정희 세한도', image: 'art_006_calligraphy_poem.jpg' },
  34: { name: '금동미륵보살반가사유상', image: 'art_007_buddha_statue.jpg' },
  35: { name: '성덕대왕신종', image: 'art_008_temple_bell.jpg' },
  36: { name: '청자 향로', image: 'art_009_celadon_incense.jpg' },
  37: { name: '나전 경함', image: 'art_010_wooden_cabinet.jpg' },
  38: { name: '이암 화조구자도', image: 'art_011_portrait.jpg' },
  39: { name: '금강반야바라밀경', image: 'art_012_gold_sutra.jpg' },
  40: { name: '감로탱', image: 'art_013_nectar_painting.jpg' },
  41: { name: '조선 분청사기', image: 'art_031_buncheong_dragon.jpg' },
  42: { name: '고려 상감청자', image: 'art_024_celadon_lotus.jpg' },
  43: { name: '백자 청화매죽문 항아리', image: 'art_037_white_bamboo.jpg' },
  44: { name: '김득신 풍속도', image: 'art_014_hanging_scroll.jpg' },
  45: { name: '혜원전신첩', image: 'art_015_lacquer_whisk.jpg' },
  46: { name: '겸재정선화첩', image: 'art_004_landscape_painting.jpg' }, // 산수화
  47: { name: '단원풍속도첩', image: 'art_006_calligraphy_poem.jpg' }, // 풍속화
  48: { name: '고려 나전칠기', image: 'art_010_wooden_cabinet.jpg' }, // 나전칠기
  49: { name: '백제 금동용봉봉래산향로', image: 'art_009_celadon_incense.jpg' }, // 향로
  50: { name: '신라 금관', image: 'archaeology_005_gold_crown.jpg' }, // 금관
  51: { name: '고구려 강서대묘 사신도', image: 'art_013_nectar_painting.jpg' }, // 벽화
  52: { name: '조선 백자', image: 'art_034_white_bowl.jpg' },
  53: { name: '통일신라 범종', image: 'art_022_temple_bell.jpg' },
  54: { name: '고려 청동은입사향완', image: 'art_021_bronze_kundika.jpg' },
  55: { name: '조선 청화백자', image: 'art_035_white_plum.jpg' },
  56: { name: '백제 백제금동대향로', image: 'art_009_celadon_incense.jpg' }, // 향로
  57: { name: '신라 천마총 금관', image: 'archaeology_005_gold_crown.jpg' }, // 금관
  58: { name: '고려 청자 상감운학문 매병', image: 'art_028_celadon_bamboo.jpg' },
  59: { name: '조선 분청사기 박지철채모란문 자라병', image: 'art_033_buncheong_turtle.jpg' },
  60: { name: '통일신라 금동 미륵보살 입상', image: 'art_018_gold_buddha.jpg' },
  61: { name: '고려 철조 여래좌상', image: 'art_019_iron_buddha.jpg' },
  62: { name: '백제 무령왕릉 출토 금제 관식', image: 'archaeology_002_jeweled_shoes.jpg' }, // 금제품
  63: { name: '신라 천마도', image: 'art_011_portrait.jpg' }, // 회화
  64: { name: '고려 금동 관음보살좌상', image: 'art_017_gilt_bronze_buddha.jpg' },
  65: { name: '조선 혼천의', image: 'history_004_map_korea.jpg' }, // 천문기구
  66: { name: '백제 동탑리 출토 목간', image: 'history_015_inheritance_doc_alt.jpg' },
  67: { name: '조선 대동여지도', image: 'history_004_map_korea.jpg' },
  68: { name: '신라 이차돈 순교비', image: 'history_009_stone_monument.jpg' },
  69: { name: '고려 수월관음도', image: 'art_013_nectar_painting.jpg' }, // 불화
  70: { name: '조선 훈민정음 해례본', image: 'history_001_dharani_sutra.jpg' },
  71: { name: '고려 나전칠기 경전함', image: 'art_010_wooden_cabinet.jpg' }, // 나전칠기
  72: { name: '조선 김정희 세한도', image: 'art_006_calligraphy_poem.jpg' }, // 서화
  73: { name: '백제 무령왕릉 지석', image: 'history_009_stone_monument.jpg' },
  74: { name: '신라 황룡사 구층목탑 사리장엄구', image: 'art_020_sarira_casket.jpg' },
  75: { name: '고구려 안악3호분 벽화', image: 'art_013_nectar_painting.jpg' }, // 벽화
  76: { name: '조선 신윤복 미인도', image: 'art_011_portrait.jpg' }, // 인물화
  77: { name: '고려 은제도금 주전자', image: 'art_021_bronze_kundika.jpg' }, // 금속공예
  78: { name: '백제 서산 용현리 마애여래삼존상', image: 'art_007_buddha_statue.jpg' }, // 불상
  79: { name: '신라 금동 미륵보살 반가사유상', image: 'art_016_pensive_bodhisattva.jpg' },
  80: { name: '조선 백자 청화포도문 항아리', image: 'art_038_white_grape.jpg' },
  81: { name: '통일신라 석굴암 본존불', image: 'art_007_buddha_statue.jpg' }, // 불상
  82: { name: '고려 상감청자 매병', image: 'art_028_celadon_bamboo.jpg' },
  83: { name: '조선 정선 인왕제색도', image: 'art_004_landscape_painting.jpg' },
  84: { name: '백제 금동봉황장식', image: 'archaeology_003_landscape_phoenix_brick.jpg' }, // 봉황
  85: { name: '신라 황남대총 금목걸이', image: 'archaeology_004_earrings.jpg' }, // 금제품
  86: { name: '고구려 덕흥리 고분 벽화 모사도', image: 'art_013_nectar_painting.jpg' }, // 벽화
  87: { name: '조선 김홍도 무동도', image: 'art_014_hanging_scroll.jpg' }, // 풍속화
  88: { name: '고려 청자 참외모양 화병', image: 'art_023_celadon_melon.jpg' },

  // 역사관 (89-110)
  89: { name: '무구정광대다라니경', image: 'history_001_dharani_sutra.jpg' },
  90: { name: '대한국국제', image: 'history_003_royal_seal.jpg' },
  91: { name: '조선왕조실록', image: 'history_005_joseon_chronicle.jpg' },
  92: { name: '훈민정음', image: 'history_001_dharani_sutra.jpg' }, // 문서
  93: { name: '동의보감', image: 'history_002_royal_document.jpg' },
  94: { name: '팔만대장경', image: 'history_014_sutra_commentary.jpg' },
  95: { name: '직지심체요절', image: 'history_001_dharani_sutra.jpg' }, // 불경
  96: { name: '삼국사기', image: 'history_002_royal_document.jpg' }, // 역사서
  97: { name: '삼국유사', image: 'history_005_joseon_chronicle.jpg' }, // 역사서
  98: { name: '고려사', image: 'history_002_royal_document.jpg' }, // 역사서
  99: { name: '조선왕조의궤', image: 'history_008_royal_robe.jpg' }, // 왕실문서
  100: { name: '난중일기', image: 'history_011_handwritten_sutra_alt.jpg' },
  101: { name: '징비록', image: 'history_012_diplomatic_poems_alt.jpg' },
  102: { name: '택리지', image: 'history_004_map_korea.jpg' }, // 지리서
  103: { name: '대동여지도 목판', image: 'history_004_map_korea.jpg' },
  104: { name: '천상열차분야지도', image: 'history_004_map_korea.jpg' }, // 천문도
  105: { name: '혼일강리역대국도지도', image: 'history_013_sea_route.jpg' },
  106: { name: '용비어천가', image: 'history_012_diplomatic_poems_alt.jpg' },
  107: { name: '월인천강지곡', image: 'history_014_sutra_commentary.jpg' },
  108: { name: '동국정운', image: 'history_002_royal_document.jpg' }, // 문서
  109: { name: '향약집성방', image: 'history_015_inheritance_doc_alt.jpg' },
  110: { name: '농사직설', image: 'history_015_inheritance_doc_alt.jpg' },

  // 아시아관 (111-125)
  111: { name: '중국 청자', image: 'asia_001_chinese_celadon.jpg' },
  112: { name: '일본 도자기', image: 'asia_002_japanese_pottery.jpg' },
  113: { name: '인도 조각품', image: 'asia_003_indian_sculpture.jpg' },
  114: { name: '태국 청동기', image: 'asia_004_thai_bronze.jpg' },
  115: { name: '베트남 도자기', image: 'asia_005_vietnamese_ceramic.jpg' },
  116: { name: '몽골 유물', image: 'asia_006_mongol_artifact.jpg' },
  117: { name: '티베트 탕카', image: 'asia_007_tibetan_thangka.jpg' },
  118: { name: '페르시아 직물', image: 'asia_008_persian_textile.jpg' },
  119: { name: '오스만 서예', image: 'asia_009_ottoman_calligraphy.jpg' },
  120: { name: '말레이 크리스', image: 'asia_010_malay_kris.jpg' },
  121: { name: '인도네시아 그림자 인형', image: 'asia_006_mongol_artifact.jpg' }, // 인형
  122: { name: '캄보디아 압사라 조각', image: 'asia_003_indian_sculpture.jpg' }, // 조각
  123: { name: '미얀마 불상', image: 'asia_011_ganesha_statue.jpg' },
  124: { name: '스리랑카 사자상', image: 'asia_003_indian_sculpture.jpg' }, // 조각
  125: { name: '필리핀 황금 장신구', image: 'asia_012_gold_belt.jpg' },

  // 기증관 (126-150)
  126: { name: '이병직 기증 도자기', image: 'donation_003_pottery_vessel.jpg' },
  127: { name: '박병래 기증 서화', image: 'donation_004_silk_painting.jpg' },
  128: { name: '이홍근 기증 불교미술품', image: 'donation_007_wood_sculpture.jpg' },
  129: { name: '유강열 기증 금속공예품', image: 'donation_008_metal_craft.jpg' },
  130: { name: '최영도 기증 석조미술품', image: 'donation_009_stone_pagoda.jpg' },
  131: { name: '김종학 기증 회화', image: 'donation_004_silk_painting.jpg' },
  132: { name: '이우환 기증 현대미술품', image: 'donation_006_ceramic_plate.jpg' },
  133: { name: '박서보 기증 단색화', image: 'donation_004_silk_painting.jpg' },
  134: { name: '정창섭 기증 작품', image: 'donation_007_wood_sculpture.jpg' },
  135: { name: '하종현 기증 회화', image: 'donation_004_silk_painting.jpg' },
  136: { name: '권영우 기증 서예작품', image: 'donation_004_silk_painting.jpg' },
  137: { name: '윤형근 기증 회화', image: 'donation_004_silk_painting.jpg' },
  138: { name: '김환기 유족 기증품', image: 'donation_006_ceramic_plate.jpg' },
  139: { name: '이응노 유족 기증품', image: 'donation_004_silk_painting.jpg' },
  140: { name: '박수근 유족 기증품', image: 'donation_007_wood_sculpture.jpg' },
  141: { name: '장욱진 유족 기증품', image: 'donation_004_silk_painting.jpg' },
  142: { name: '김기창 유족 기증품', image: 'donation_004_silk_painting.jpg' },
  143: { name: '천경자 기증 회화', image: 'donation_004_silk_painting.jpg' },
  144: { name: '이중섭 유족 기증품', image: 'donation_004_silk_painting.jpg' },
  145: { name: '백남준 유족 기증품', image: 'donation_008_metal_craft.jpg' },
  146: { name: '나혜석 유족 기증품', image: 'donation_004_silk_painting.jpg' },
  147: { name: '이인성 유족 기증품', image: 'donation_004_silk_painting.jpg' },
  148: { name: '오지호 유족 기증품', image: 'donation_004_silk_painting.jpg' },
  149: { name: '김용준 유족 기증품', image: 'donation_004_silk_painting.jpg' },
  150: { name: '이쾌대 유족 기증품', image: 'donation_004_silk_painting.jpg' }
};

// artifacts.ts 파일 읽기
const artifactsPath = path.join(process.cwd(), 'data', 'artifacts.ts');
let content = fs.readFileSync(artifactsPath, 'utf8');

console.log('🔧 유물-이미지 매핑 수정 시작...');

// 각 유물의 이미지 경로 수정
let updatedCount = 0;

// ID별로 정렬된 순서대로 처리
const sortedIds = Object.keys(correctMapping).map(Number).sort((a, b) => a - b);

sortedIds.forEach(id => {
  const mapping = correctMapping[id];
  const newImage = `/artworks/${mapping.image}`;
  
  // ID로 해당 유물 찾아서 이미지 경로만 수정
  const idPattern = new RegExp(
    `(id:\\s*${id}\\s*,.*?image:\\s*)("|')[^"']+\\2`,
    's'
  );
  
  if (idPattern.test(content)) {
    content = content.replace(idPattern, `$1"${newImage}"`);
    console.log(`✅ ID ${id} (${mapping.name}): → ${newImage}`);
    updatedCount++;
  } else {
    console.log(`❌ ID ${id} (${mapping.name}): 패턴을 찾을 수 없음`);
  }
});

// 파일 저장
fs.writeFileSync(artifactsPath, content);

console.log(`\n✨ 총 ${updatedCount}개 유물 이미지 경로 수정 완료!`);