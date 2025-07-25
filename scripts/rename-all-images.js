const fs = require('fs');
const path = require('path');

const artworksDir = path.join(__dirname, '..', 'public', 'artworks');

// 모든 파일 목록 가져오기
const files = fs.readdirSync(artworksDir);

// 한글이 포함된 파일만 필터링
const koreanFiles = files.filter(file => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(file));

console.log(`Found ${koreanFiles.length} files with Korean names`);

// 각 파일에 대해 영문 이름으로 변경
koreanFiles.forEach(file => {
  // 파일명을 간단한 영문으로 변환
  let newName = file
    .replace(/찍개/g, 'chopper')
    .replace(/빗/g, 'comb')
    .replace(/빗치레개/g, 'comb_ornament')
    .replace(/마구 꾸미개/g, 'horse_ornament')
    .replace(/장신구/g, 'accessories')
    .replace(/굽다리 접시/g, 'pedestal_dish')
    .replace(/금귀걸이/g, 'gold_earrings')
    .replace(/금관/g, 'gold_crown')
    .replace(/장식대도/g, 'decorated_sword')
    .replace(/유개장경호/g, 'lidded_jar')
    .replace(/기마 인물형 토기/g, 'horse_rider_pottery')
    .replace(/토우장식 긴목항아리/g, 'figurine_jar')
    .replace(/오리모양 토기/g, 'duck_shaped_pottery')
    .replace(/서수형 토기/g, 'animal_shaped_pottery')
    .replace(/호형대구/g, 'tiger_buckle')
    .replace(/문자가 있는 벽돌/g, 'inscribed_brick')
    .replace(/미술/g, 'art')
    .replace(/금동미륵보살반가사유상/g, 'gilt_bronze_maitreya')
    .replace(/백제금동대향로/g, 'baekje_incense_burner')
    .replace(/신라금관/g, 'silla_gold_crown')
    .replace(/청자상감운학문매병/g, 'celadon_maebyeong')
    .replace(/경천사지십층석탑/g, 'gyeongcheonsa_pagoda')
    .replace(/백자달항아리/g, 'moon_jar')
    .replace(/분청사기조화어문편병/g, 'buncheong_flat_bottle')
    .replace(/청자철화초충문매병/g, 'celadon_iron_maebyeong')
    .replace(/백자청화매조죽문항아리/g, 'blue_white_jar')
    .replace(/청동은입사포류수금문향완/g, 'bronze_incense_burner')
    .replace(/금강전도/g, 'diamond_mountains')
    .replace(/인왕제색도/g, 'inwang_jesaek')
    .replace(/단원풍속도첩/g, 'danwon_genre_paintings')
    .replace(/미인도/g, 'beauty_portrait')
    .replace(/초충도수병/g, 'insects_flowers_screen')
    .replace(/책가도/g, 'books_scholars_screen')
    .replace(/화조도/g, 'flowers_birds')
    .replace(/산수화/g, 'landscape_painting')
    .replace(/사군자/g, 'four_gentlemen')
    .replace(/일월오봉도/g, 'sun_moon_five_peaks')
    .replace(/기증/g, 'donation')
    .replace(/근대회화/g, 'modern_painting')
    .replace(/근대조각/g, 'modern_sculpture')
    .replace(/근대공예/g, 'modern_craft')
    .replace(/근대서예/g, 'modern_calligraphy')
    .replace(/근대도자/g, 'modern_ceramics')
    .replace(/역사/g, 'history')
    .replace(/아시아/g, 'asia')
    .replace(/ 2\.jpg$/, '.jpg') // 중복 파일 제거
    .replace(/\s+/g, '_'); // 공백을 언더스코어로
    
  const oldPath = path.join(artworksDir, file);
  const newPath = path.join(artworksDir, newName);
  
  if (oldPath !== newPath) {
    // 대상 파일이 이미 존재하면 삭제 (중복 파일인 경우)
    if (fs.existsSync(newPath)) {
      fs.unlinkSync(oldPath);
      console.log(`Removed duplicate: ${file}`);
    } else {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed: ${file} -> ${newName}`);
    }
  }
});

console.log('Batch renaming completed!');