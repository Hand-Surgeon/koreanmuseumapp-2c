const fs = require('fs');
const path = require('path');

// 파일명 매핑
const fileMapping = {
  'archaeology_001_빗살무늬토기.jpg': 'archaeology_001_comb_pattern_pottery.jpg',
  'archaeology_002_요령식동검.jpg': 'archaeology_002_liaoning_bronze_dagger.jpg',
  'archaeology_003_산수봉황무늬 벽돌.jpg': 'archaeology_003_landscape_phoenix_brick.jpg',
  'archaeology_004_귀걸이.jpg': 'archaeology_004_earrings.jpg',
  'archaeology_005_주먹도끼.jpg': 'archaeology_005_hand_axe.jpg',
  'archaeology_006_덧무늬토기.jpg': 'archaeology_006_applique_pottery.jpg',
  'archaeology_007_농경무늬가 새겨진 청동기.jpg': 'archaeology_007_agricultural_bronze.jpg',
  'archaeology_008_방울.jpg': 'archaeology_008_bell.jpg',
  'archaeology_009_오리 토기.jpg': 'archaeology_009_duck_pottery.jpg',
  'archaeology_010_찍개.jpg': 'archaeology_010_chopper.jpg',
  // 추가 파일들...
};

const artworksDir = path.join(__dirname, '..', 'public', 'artworks');

// 파일명 변경
Object.entries(fileMapping).forEach(([oldName, newName]) => {
  const oldPath = path.join(artworksDir, oldName);
  const newPath = path.join(artworksDir, newName);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${oldName} -> ${newName}`);
  }
  
  // " 2.jpg" 버전도 처리
  const oldPath2 = path.join(artworksDir, oldName.replace('.jpg', ' 2.jpg'));
  if (fs.existsSync(oldPath2)) {
    fs.unlinkSync(oldPath2);
    console.log(`Removed duplicate: ${oldName.replace('.jpg', ' 2.jpg')}`);
  }
});

console.log('Image renaming completed!');