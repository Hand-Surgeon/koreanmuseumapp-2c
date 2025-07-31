const fs = require('fs');
const path = require('path');

// Read the current translations file
const translationsPath = path.join(__dirname, '..', 'data', 'translations.ts');
let content = fs.readFileSync(translationsPath, 'utf8');

// Find where to insert new translations (after th translations)
const thEndMatch = content.match(/  th: \{[\s\S]*?\n  \},/);
if (!thEndMatch) {
  console.error('Could not find Thai translations');
  process.exit(1);
}

const insertPosition = content.indexOf(thEndMatch[0]) + thEndMatch[0].length;

// New translations to add
const newTranslations = `
  vi: {
    // 공통
    nationalMuseum: "Bảo tàng Quốc gia Hàn Quốc",
    masterpieces100: "Kiệt tác",
    totalItems: "Tổng cộng",
    nationalTreasure: "Quốc bảo",
    treasure: "Bảo vật",
    featured: "Nổi bật",
    search: "Tìm kiếm",
    filter: "Bộ lọc",
    category: "Danh mục",
    period: "Thời kỳ",
    all: "Tất cả",
    noResults: "Không tìm thấy kết quả",
    noResultsDesc: "Vui lòng thử từ khóa khác",
    resetFilters: "Đặt lại bộ lọc",
    backToHome: "Quay lại trang chủ",

    // 메인 페이지
    subtitle: "Kho tàng di sản văn hóa Hàn Quốc",
    koreanCulturalHeritage: "Phòng triển lãm",
    specialExhibition: "Triển lãm đặc biệt",
    preciousCulturalProperties: "Di sản văn hóa quý giá",
    essenceOfKoreanCulture: "Tinh hoa văn hóa Hàn Quốc",

    // 전시관
    archaeologyHall: "Phòng Khảo cổ",
    artHall: "Phòng Nghệ thuật",
    historyHall: "Phòng Lịch sử",
    asiaHall: "Phòng Châu Á",
    donationHall: "Phòng Hiến tặng",

    // 전시관 설명
    archaeologyDesc: "Hiện vật khảo cổ từ thời tiền sử đến Silla thống nhất",
    artDesc: "Nghệ thuật truyền thống Hàn Quốc",
    historyDesc: "Tài liệu lịch sử từ cổ đại đến cận đại",
    asiaDesc: "Di sản văn hóa các nước châu Á",
    donationDesc: "Bộ sưu tập quý giá từ các nhà hảo tâm",

    // 카테고리
    pottery: "Gốm",
    bronze: "Đồ đồng",
    metalcraft: "Kim loại thủ công",
    ceramics: "Gốm sứ",
    sculpture: "Điêu khắc",
    calligraphy: "Thư pháp",
    painting: "Hội họa",
    jewelry: "Trang sức",
    architecture: "Kiến trúc",
    stoneTools: "Công cụ đá",
    weapons: "Vũ khí",
    printing: "In ấn",
    maps: "Bản đồ",
    documents: "Tài liệu",
    books: "Sách",
    lacquerware: "Đồ sơn mài",
    buddhistPainting: "Tranh Phật",

    // 시대
    paleolithic: "Thời kỳ đồ đá cũ",
    neolithic: "Thời kỳ đồ đá mới",
    bronzeAge: "Thời kỳ đồ đồng",
    threeKingdoms: "Tam Quốc",
    unifiedSilla: "Silla thống nhất",
    goryeo: "Goryeo",
    joseon: "Joseon",
    china: "Trung Quốc",
    japan: "Nhật Bản",
    centralAsia: "Trung Á",
    southeastAsia: "Đông Nam Á",

    // 기타
    mainWorks: "Tác phẩm chính",
    moreArtifacts: "Xem thêm hiện vật",
    artifactList: "Danh sách hiện vật",
    relatedArtifacts: "Hiện vật liên quan",
    detailedInfo: "Thông tin chi tiết",
    material: "Chất liệu",
    dimensions: "Kích thước",
    location: "Nơi phát hiện",
    exhibitionRoom: "Phòng triển lãm",
    artifactNumber: "Số hiện vật",
    culturalPropertyDesignation: "Chỉ định di sản văn hóa",
  },
  id: {
    // 공통
    nationalMuseum: "Museum Nasional Korea",
    masterpieces100: "Karya Masterpiece",
    totalItems: "Total",
    nationalTreasure: "Harta Nasional",
    treasure: "Harta Karun",
    featured: "Unggulan",
    search: "Cari",
    filter: "Filter",
    category: "Kategori",
    period: "Periode",
    all: "Semua",
    noResults: "Tidak ada hasil pencarian",
    noResultsDesc: "Silakan coba kata kunci lain",
    resetFilters: "Reset filter",
    backToHome: "Kembali ke beranda",

    // 메인 페이지
    subtitle: "Khazanah Warisan Budaya Korea",
    koreanCulturalHeritage: "Ruang Pameran",
    specialExhibition: "Pameran Khusus",
    preciousCulturalProperties: "Warisan Budaya Berharga",
    essenceOfKoreanCulture: "Esensi Budaya Korea",

    // 전시관
    archaeologyHall: "Ruang Arkeologi",
    artHall: "Ruang Seni",
    historyHall: "Ruang Sejarah",
    asiaHall: "Ruang Asia",
    donationHall: "Ruang Donasi",

    // 전시관 설명
    archaeologyDesc: "Artefak arkeologi dari prasejarah hingga Silla Bersatu",
    artDesc: "Seni tradisional Korea",
    historyDesc: "Dokumen sejarah dari kuno hingga modern",
    asiaDesc: "Warisan budaya negara-negara Asia",
    donationDesc: "Koleksi berharga dari para donatur",

    // 카테고리
    pottery: "Tembikar",
    bronze: "Perunggu",
    metalcraft: "Kerajinan logam",
    ceramics: "Keramik",
    sculpture: "Patung",
    calligraphy: "Kaligrafi",
    painting: "Lukisan",
    jewelry: "Perhiasan",
    architecture: "Arsitektur",
    stoneTools: "Alat batu",
    weapons: "Senjata",
    printing: "Percetakan",
    maps: "Peta",
    documents: "Dokumen",
    books: "Buku",
    lacquerware: "Pernis",
    buddhistPainting: "Lukisan Buddha",

    // 시대
    paleolithic: "Zaman Batu Tua",
    neolithic: "Zaman Batu Baru",
    bronzeAge: "Zaman Perunggu",
    threeKingdoms: "Tiga Kerajaan",
    unifiedSilla: "Silla Bersatu",
    goryeo: "Goryeo",
    joseon: "Joseon",
    china: "Tiongkok",
    japan: "Jepang",
    centralAsia: "Asia Tengah",
    southeastAsia: "Asia Tenggara",

    // 기타
    mainWorks: "Karya utama",
    moreArtifacts: "Lebih banyak artefak",
    artifactList: "Daftar artefak",
    relatedArtifacts: "Artefak terkait",
    detailedInfo: "Informasi detail",
    material: "Bahan",
    dimensions: "Ukuran",
    location: "Lokasi penemuan",
    exhibitionRoom: "Ruang pameran",
    artifactNumber: "Nomor artefak",
    culturalPropertyDesignation: "Penetapan warisan budaya",
  },
  es: {
    // 공통
    nationalMuseum: "Museo Nacional de Corea",
    masterpieces100: "Obras Maestras",
    totalItems: "Total",
    nationalTreasure: "Tesoro Nacional",
    treasure: "Tesoro",
    featured: "Destacado",
    search: "Buscar",
    filter: "Filtrar",
    category: "Categoría",
    period: "Período",
    all: "Todo",
    noResults: "No se encontraron resultados",
    noResultsDesc: "Por favor, intente con otra palabra clave",
    resetFilters: "Restablecer filtros",
    backToHome: "Volver al inicio",

    // 메인 페이지
    subtitle: "Tesoro del Patrimonio Cultural Coreano",
    koreanCulturalHeritage: "Salas de Exposición",
    specialExhibition: "Exposición Especial",
    preciousCulturalProperties: "Patrimonio Cultural Valioso",
    essenceOfKoreanCulture: "Esencia de la Cultura Coreana",

    // 전시관
    archaeologyHall: "Sala de Arqueología",
    artHall: "Sala de Arte",
    historyHall: "Sala de Historia",
    asiaHall: "Sala de Asia",
    donationHall: "Sala de Donaciones",

    // 전시관 설명
    archaeologyDesc: "Artefactos arqueológicos desde la prehistoria hasta Silla Unificada",
    artDesc: "Arte tradicional coreano",
    historyDesc: "Documentos históricos desde la antigüedad hasta la era moderna",
    asiaDesc: "Patrimonio cultural de países asiáticos",
    donationDesc: "Valiosas colecciones de donantes",

    // 카테고리
    pottery: "Cerámica",
    bronze: "Bronce",
    metalcraft: "Orfebrería",
    ceramics: "Porcelana",
    sculpture: "Escultura",
    calligraphy: "Caligrafía",
    painting: "Pintura",
    jewelry: "Joyería",
    architecture: "Arquitectura",
    stoneTools: "Herramientas de piedra",
    weapons: "Armas",
    printing: "Impresión",
    maps: "Mapas",
    documents: "Documentos",
    books: "Libros",
    lacquerware: "Laca",
    buddhistPainting: "Pintura budista",

    // 시대
    paleolithic: "Paleolítico",
    neolithic: "Neolítico",
    bronzeAge: "Edad de Bronce",
    threeKingdoms: "Tres Reinos",
    unifiedSilla: "Silla Unificada",
    goryeo: "Goryeo",
    joseon: "Joseon",
    china: "China",
    japan: "Japón",
    centralAsia: "Asia Central",
    southeastAsia: "Sudeste Asiático",

    // 기타
    mainWorks: "Obras principales",
    moreArtifacts: "Más artefactos",
    artifactList: "Lista de artefactos",
    relatedArtifacts: "Artefactos relacionados",
    detailedInfo: "Información detallada",
    material: "Material",
    dimensions: "Dimensiones",
    location: "Lugar de hallazgo",
    exhibitionRoom: "Sala de exposición",
    artifactNumber: "Número de artefacto",
    culturalPropertyDesignation: "Designación de patrimonio cultural",
  },
  ar: {
    // 공통
    nationalMuseum: "المتحف الوطني الكوري",
    masterpieces100: "روائع",
    totalItems: "المجموع",
    nationalTreasure: "كنز وطني",
    treasure: "كنز",
    featured: "مميز",
    search: "بحث",
    filter: "تصفية",
    category: "الفئة",
    period: "الفترة",
    all: "الكل",
    noResults: "لم يتم العثور على نتائج",
    noResultsDesc: "يرجى المحاولة بكلمة مفتاحية أخرى",
    resetFilters: "إعادة تعيين الفلاتر",
    backToHome: "العودة إلى الصفحة الرئيسية",

    // 메인 페이지
    subtitle: "كنز التراث الثقافي الكوري",
    koreanCulturalHeritage: "قاعات العرض",
    specialExhibition: "معرض خاص",
    preciousCulturalProperties: "التراث الثقافي الثمين",
    essenceOfKoreanCulture: "جوهر الثقافة الكورية",

    // 전시관
    archaeologyHall: "قاعة الآثار",
    artHall: "قاعة الفنون",
    historyHall: "قاعة التاريخ",
    asiaHall: "قاعة آسيا",
    donationHall: "قاعة التبرعات",

    // 전시관 설명
    archaeologyDesc: "القطع الأثرية من عصور ما قبل التاريخ إلى سيلا الموحدة",
    artDesc: "الفن الكوري التقليدي",
    historyDesc: "الوثائق التاريخية من العصور القديمة إلى الحديثة",
    asiaDesc: "التراث الثقافي للدول الآسيوية",
    donationDesc: "مجموعات قيمة من المتبرعين",

    // 카테고리
    pottery: "فخار",
    bronze: "برونز",
    metalcraft: "حرف معدنية",
    ceramics: "خزف",
    sculpture: "نحت",
    calligraphy: "خط",
    painting: "رسم",
    jewelry: "مجوهرات",
    architecture: "عمارة",
    stoneTools: "أدوات حجرية",
    weapons: "أسلحة",
    printing: "طباعة",
    maps: "خرائط",
    documents: "وثائق",
    books: "كتب",
    lacquerware: "أعمال اللك",
    buddhistPainting: "لوحات بوذية",

    // 시대
    paleolithic: "العصر الحجري القديم",
    neolithic: "العصر الحجري الحديث",
    bronzeAge: "العصر البرونزي",
    threeKingdoms: "الممالك الثلاث",
    unifiedSilla: "سيلا الموحدة",
    goryeo: "غوريو",
    joseon: "جوسون",
    china: "الصين",
    japan: "اليابان",
    centralAsia: "آسيا الوسطى",
    southeastAsia: "جنوب شرق آسيا",

    // 기타
    mainWorks: "الأعمال الرئيسية",
    moreArtifacts: "المزيد من القطع الأثرية",
    artifactList: "قائمة القطع الأثرية",
    relatedArtifacts: "قطع أثرية ذات صلة",
    detailedInfo: "معلومات مفصلة",
    material: "المادة",
    dimensions: "الأبعاد",
    location: "موقع الاكتشاف",
    exhibitionRoom: "قاعة العرض",
    artifactNumber: "رقم القطعة الأثرية",
    culturalPropertyDesignation: "تصنيف التراث الثقافي",
  },
  fr: {
    // 공통
    nationalMuseum: "Musée National de Corée",
    masterpieces100: "Chefs-d'œuvre",
    totalItems: "Total",
    nationalTreasure: "Trésor National",
    treasure: "Trésor",
    featured: "En vedette",
    search: "Rechercher",
    filter: "Filtrer",
    category: "Catégorie",
    period: "Période",
    all: "Tout",
    noResults: "Aucun résultat trouvé",
    noResultsDesc: "Veuillez essayer avec un autre mot-clé",
    resetFilters: "Réinitialiser les filtres",
    backToHome: "Retour à l'accueil",

    // 메인 페이지
    subtitle: "Trésor du patrimoine culturel coréen",
    koreanCulturalHeritage: "Salles d'exposition",
    specialExhibition: "Exposition spéciale",
    preciousCulturalProperties: "Patrimoine culturel précieux",
    essenceOfKoreanCulture: "Essence de la culture coréenne",

    // 전시관
    archaeologyHall: "Salle d'archéologie",
    artHall: "Salle d'art",
    historyHall: "Salle d'histoire",
    asiaHall: "Salle d'Asie",
    donationHall: "Salle des donations",

    // 전시관 설명
    archaeologyDesc: "Artefacts archéologiques de la préhistoire à Silla unifié",
    artDesc: "Art traditionnel coréen",
    historyDesc: "Documents historiques de l'antiquité à l'ère moderne",
    asiaDesc: "Patrimoine culturel des pays asiatiques",
    donationDesc: "Collections précieuses de donateurs",

    // 카테고리
    pottery: "Poterie",
    bronze: "Bronze",
    metalcraft: "Orfèvrerie",
    ceramics: "Céramique",
    sculpture: "Sculpture",
    calligraphy: "Calligraphie",
    painting: "Peinture",
    jewelry: "Bijoux",
    architecture: "Architecture",
    stoneTools: "Outils en pierre",
    weapons: "Armes",
    printing: "Impression",
    maps: "Cartes",
    documents: "Documents",
    books: "Livres",
    lacquerware: "Laque",
    buddhistPainting: "Peinture bouddhiste",

    // 시대
    paleolithic: "Paléolithique",
    neolithic: "Néolithique",
    bronzeAge: "Âge du bronze",
    threeKingdoms: "Trois Royaumes",
    unifiedSilla: "Silla unifié",
    goryeo: "Goryeo",
    joseon: "Joseon",
    china: "Chine",
    japan: "Japon",
    centralAsia: "Asie centrale",
    southeastAsia: "Asie du Sud-Est",

    // 기타
    mainWorks: "Œuvres principales",
    moreArtifacts: "Plus d'artefacts",
    artifactList: "Liste des artefacts",
    relatedArtifacts: "Artefacts connexes",
    detailedInfo: "Informations détaillées",
    material: "Matériau",
    dimensions: "Dimensions",
    location: "Lieu de découverte",
    exhibitionRoom: "Salle d'exposition",
    artifactNumber: "Numéro d'artefact",
    culturalPropertyDesignation: "Désignation du patrimoine culturel",
  },`;

// Insert new translations
const newContent = content.slice(0, insertPosition) + newTranslations + content.slice(insertPosition);

// Write back to file
fs.writeFileSync(translationsPath, newContent, 'utf8');

console.log('Successfully added translations for vi, id, es, ar, and fr!');

// Also remove the temporary translations file
const tempTranslationsPath = path.join(__dirname, '..', 'data', 'translations-new-languages.ts');
if (fs.existsSync(tempTranslationsPath)) {
  fs.unlinkSync(tempTranslationsPath);
  console.log('Removed temporary translations file');
}