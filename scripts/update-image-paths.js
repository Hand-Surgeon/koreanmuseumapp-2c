const fs = require('fs');
const path = require('path');

// 이미지 경로 매핑
const imagePathMapping = {
  'archaeology_001_빗살무늬토기': 'archaeology_001_comb_pattern_pottery',
  'archaeology_002_요령식동검': 'archaeology_002_liaoning_bronze_dagger',
  'archaeology_003_산수봉황무늬 벽돌': 'archaeology_003_landscape_phoenix_brick',
  'archaeology_004_귀걸이': 'archaeology_004_earrings',
  'archaeology_005_주먹도끼': 'archaeology_005_hand_axe',
  'archaeology_006_덧무늬토기': 'archaeology_006_applique_pottery',
  'archaeology_007_농경무늬가 새겨진 청동기': 'archaeology_007_agricultural_bronze',
  'archaeology_008_방울': 'archaeology_008_bell',
  'archaeology_009_오리 토기': 'archaeology_009_duck_pottery',
  'archaeology_010_찍개': 'archaeology_010_chopper',
  'archaeology_011_빗': 'archaeology_011_comb',
  'archaeology_012_빗치레개': 'archaeology_012_comb_ornament',
  'archaeology_013_마구 꾸미개': 'archaeology_013_horse_ornament',
  'archaeology_014_장신구': 'archaeology_014_accessories',
  'archaeology_015_굽다리 접시': 'archaeology_015_pedestal_dish',
  'archaeology_016_금귀걸이': 'archaeology_016_gold_earrings',
  'archaeology_017_금관': 'archaeology_017_gold_crown',
  'archaeology_018_장식대도': 'archaeology_018_decorated_sword',
  'archaeology_019_유개장경호': 'archaeology_019_lidded_jar',
  'archaeology_020_기마 인물형 토기': 'archaeology_020_horse_rider_pottery',
  'archaeology_021_토우장식 긴목항아리': 'archaeology_021_figurine_jar',
  'archaeology_022_오리모양 토기': 'archaeology_022_duck_shaped_pottery',
  'archaeology_023_서수형 토기': 'archaeology_023_animal_shaped_pottery',
  'archaeology_024_호형대구': 'archaeology_024_tiger_buckle',
  'archaeology_025_문자가 있는 벽돌': 'archaeology_025_inscribed_brick',
};

// artifacts.ts 파일 읽기
const artifactsPath = path.join(__dirname, '..', 'data', 'artifacts.ts');
let content = fs.readFileSync(artifactsPath, 'utf8');

// 각 매핑에 대해 치환
Object.entries(imagePathMapping).forEach(([oldName, newName]) => {
  const oldPattern = new RegExp(`/artworks/${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.jpg`, 'g');
  const newPath = `/artworks/${newName}.jpg`;
  
  const beforeCount = (content.match(oldPattern) || []).length;
  content = content.replace(oldPattern, newPath);
  const afterCount = (content.match(new RegExp(newPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  
  if (beforeCount > 0) {
    console.log(`Updated ${beforeCount} occurrence(s) of ${oldName} to ${newName}`);
  }
});

// 파일 저장
fs.writeFileSync(artifactsPath, content, 'utf8');

console.log('Image paths update completed!');