export type Language = 'id' | 'en';

export const translations = {
  id: {
    title: 'Analisis Interaktif',
    tabParameters: 'Parameter',
    tabVisualizer: 'Visualisasi',
    tabSummary: 'Ringkasan',
    sideProfile: 'Profil Samping',
    topDown: 'Atas Bawah',
    future: 'Segera',
    labOrder: 'PESANAN LAB',
    curvatureSpecs: 'Spek Kelengkungan',
    r1Front: 'R1 Radius Depan',
    r2Back: 'R2 Radius Belakang',
    s1Sag: 'S1 Sagitta Depan',
    s2Sag: 'S2 Sagitta Belakang',
    geometricAudit: 'Audit Geometris',
    volumeReduction: 'Indeks {index} mengurangi volume tepi sebesar {percent}% dibanding standar CR-39.',
    volumeCompact: 'PADAT',
    volumeElevated: 'MENONJOL',
    volumeLabel: 'Volume',
    framePd: 'PD BINGKAI',
    decentration: 'DESENTRASI',
    minBlank: 'MIN. BLANK',
    engine: 'MESIN',
    labs: 'Aktriyo Measuring Project',
    
    // Sidebar
    baseCurve: 'Tingkat Kelengkungan (BC)',
    lensParams: 'Parameter Lensa',
    sphere: 'Ukuran (SPH)',
    cylinder: 'Silinder (CYL)',
    axis: 'Axis',
    refractiveIndex: 'Indeks Bias',
    frameGeometry: 'Geometri Bingkai',
    aSize: 'Ukuran A',
    bSize: 'Ukuran B',
    dbl: 'Jarak Hidung (DBL)',
    ed: 'Diameter Efektif (ED)',
    frameDepth: 'Ketebalan Bingkai',
    fittingSpecs: 'Spesifikasi Fitting',
    pd: 'Jarak Pupil (PD)',
    fittingHeight: 'Tinggi Fitting',
    frameType: 'Jenis Bingkai',
    fullRim: 'Full Rim',
    halfRim: 'Half Rim (Senar)',
    rimless: 'Rimless (Bor)',
    bevelPos: 'Posisi Bevel (Lensa)',
    bevelFront: 'DEPAN',
    bevelBack: 'BELAKANG',
    recomTitle: 'Rekomendasi Lensa',
    bestChoice: 'Pilihan Terbaik',
    aiConsultant: 'Konsultasi AI Optik',
    getAiRec: 'Dapatkan Rekomendasi AI',
    aiLoading: 'Menganalisis Data Optik...',
    aiError: 'Gagal mendapatkan rekomendasi AI.',
    compareMode: 'Mode Banding',
    calculateFull: 'Hitung Detail Lengkap',

    // Summary Card
    edgeThick: 'Ketebalan Tepi',
    center: 'Tengah',
    anteriorProt: 'Tonjolan Depan',
    posteriorProt: 'Tonjolan Belakang',
    lensWeight: 'Estimasi Berat Lensa',
    thick: 'Tebal',
    medium: 'Sedang',
    thin: 'Tipis',
    moderate: 'Sedang',
    noticeable: 'Terlihat',
    flush: 'Rata',
    optimized: 'Teroptimasi',

    // Visualizer
    crossSection: 'Tampilan Potongan Melintang',
    visualSim: 'Skala 5:1 mm (Simulasi Visual)',
    primarySpec: 'Spek Utama',
    comparison: 'Perbandingan',
    frontView: 'Tampilan Depan',
    threeDView: 'Tampilan 3D',
    overhang: 'Overhang',
    pupil: 'Pupil',
    groove: 'Alur (Groove)',

    // Tooltips
    tipSphere: 'Daya sferis lensa untuk mengoreksi rabun jauh (minus) atau rabun dekat (plus).',
    tipCylinder: 'Kekuatan silinder untuk mengoreksi astigmatisme (kelengkungan kornea tidak merata).',
    tipAxis: 'Sudut kemiringan (0–180 derajat) untuk mengarahkan koreksi astigmatisme.',
    tipRefractiveIndex: 'Indeks bias bahan lensa. Indeks lebih tinggi menghasilkan lensa yang lebih tipis.',
    tipBaseCurve: 'Kurva dasar permukaan depan lensa. Mempengaruhi ketebalan pusat (CT) dan kelengkungan lensa.',
    tipASize: 'Lebar horizontal dari bingkai lensa diukur dari ujung ke ujung.',
    tipBSize: 'Tinggi vertikal dari bingkai lensa diukur dari atas ke bawah.',
    tipDbl: 'Jarak terdekat antara lensa kanan dan kiri di jembatan hidung bingkai.',
    tipEd: 'Diameter Efektif: panjang diagonal terluar dari bukaan rim lensa bingkai.',
    tipFittingHeight: 'Tinggi vertikal dari batas bawah lubang lensa hingga pusat pupil mata.',
    tipPd: 'Jarak Pupil: jarak horizontal antara pusat kedua pupil mata.',
    tipFrameDepth: 'Ketebalan bingkai fisik (rim) yang menyelimuti tepi lensa.',
    tipFrameType: 'Jenis kuncian pemasangan bingkai (Rim penuh, Gantung senar, atau Rimless bor).',
    tipBevelPos: 'Menentukan letak alur/bevel penahan secara proporsional di sepanjang tebal tepi lensa.',
    tipCompareMode: 'Aktifkan mode ini untuk membandingkan parameter lensa utama dengan parameter lensa perbandingan.',
    limitWarningTitle: 'Batas Struktural Terlampaui!',
    limitWarningA: 'Lebar lensa (A-Size: {val}mm) di luar batas standar 35–65mm atau ukuran blank yang dibutuhkan ({blankVal}mm) melebihi batas 80mm.',
    limitWarningB: 'Tinggi lensa (B-Size: {val}mm) di luar batas standar 20–55mm atau posisi pupil mata berada di luar bingkai fisiknya.',
    limitWarningDbl: 'Lebar jembatan hidung (DBL: {val}mm) di luar standar anatomi wajah manusia 10–28mm.',
    limitWarningEd: 'Diameter Efektif (ED: {val}mm) tidak boleh lebih kecil dari lebar A-Size ({aVal}mm) atau melampaui batas produksi 75mm.',
  },
  en: {
    title: 'Interactive Analysis',
    tabParameters: 'Parameters',
    tabVisualizer: 'Visualizer',
    tabSummary: 'Summary',
    sideProfile: 'Side Profile',
    topDown: 'Top Down',
    future: 'Future',
    labOrder: 'LAB ORDER',
    curvatureSpecs: 'Curvature Specs',
    r1Front: 'R1 Front Radius',
    r2Back: 'R2 Back Radius',
    s1Sag: 'S1 Front Sag',
    s2Sag: 'S2 Back Sag',
    geometricAudit: 'Geometric Audit',
    volumeReduction: 'The {index} index lens reduces edge volume by {percent}% relative to base CR-39 standard materials.',
    volumeCompact: 'COMPACT',
    volumeElevated: 'ELEVATED',
    volumeLabel: 'Volume',
    framePd: 'FRAME PD',
    decentration: 'DECENTRATION',
    minBlank: 'MIN BLANK',
    engine: 'ENGINE',
    labs: 'Aktriyo Measuring Project',

    // Sidebar
    baseCurve: 'Base Curve (BC)',
    lensParams: 'Lens Parameters',
    sphere: 'Sphere (SPH)',
    cylinder: 'Cylinder (CYL)',
    axis: 'Axis',
    refractiveIndex: 'Refractive Index',
    frameGeometry: 'Frame Geometry',
    aSize: 'A-Size',
    bSize: 'B-Size',
    dbl: 'Distance Between Lenses (DBL)',
    ed: 'Effective Diameter (ED)',
    frameDepth: 'Frame Depth',
    fittingSpecs: 'Fitting Specs',
    pd: 'Pupil Distance (PD)',
    fittingHeight: 'Fitting Height',
    frameType: 'Frame Type',
    fullRim: 'Full Rim',
    halfRim: 'Half Rim (String)',
    rimless: 'Rimless (Drill)',
    bevelPos: 'Bevel Position',
    bevelFront: 'FRONT',
    bevelBack: 'BACK',
    recomTitle: 'Index Recommendation',
    bestChoice: 'Best Choice',
    aiConsultant: 'Optic AI Consultant',
    getAiRec: 'Get AI Recommendation',
    aiLoading: 'Analyzing Optical Data...',
    aiError: 'Failed to get AI recommendation.',
    compareMode: 'Compare Mode',
    calculateFull: 'Calculate Full Specs',

    // Summary Card
    edgeThick: 'Edge Thick.',
    center: 'Center',
    anteriorProt: 'Anterior Prot.',
    posteriorProt: 'Posterior Prot.',
    lensWeight: 'Est. Lens Weight',
    thick: 'Thick',
    medium: 'Medium',
    thin: 'Thin',
    moderate: 'Moderate',
    noticeable: 'Noticeable',
    flush: 'Flush',
    optimized: 'Optimized',

    // Visualizer
    crossSection: 'Cross-Sectional View',
    visualSim: 'Scale 5:1 mm (Visual Simulation)',
    primarySpec: 'Primary Spec',
    comparison: 'Comparison',
    frontView: 'Front View',
    threeDView: '3D View',
    overhang: 'Overhang',
    pupil: 'Pupil',
    groove: 'Groove',

    // Tooltips
    tipSphere: 'Spherical power to correct nearsightedness (minus) or farsightedness (plus).',
    tipCylinder: 'Cylinder power to correct astigmatism (irregularly shaped cornea).',
    tipAxis: 'Angle (0–180 degrees) orienting the astigmatism cylinder correction.',
    tipRefractiveIndex: 'Refractive index of the lens. Higher index enables thinner and lighter profiles.',
    tipBaseCurve: 'Curvature of the lens front surface. Affects center thickness (CT) and lens dome structure.',
    tipASize: 'Horizontal lens width inside the frame box.',
    tipBSize: 'Vertical lens height inside the frame box.',
    tipDbl: 'Distance Between Lenses: bridge width of the frame.',
    tipEd: 'Effective Diameter: longest diagonal width of the lens shape.',
    tipFittingHeight: 'Vertical distance from the lower frame rims up to pupil center.',
    tipPd: 'Pupillary Distance: horizontal distance between centers of both pupils.',
    tipFrameDepth: 'Physical depth/thickness of the frame rim housing the lens.',
    tipFrameType: 'The structural rim mounting design of the frame.',
    tipBevelPos: 'Adjusts the depth-wise position of the bevel track along the lens outer edge.',
    tipCompareMode: 'Enable this mode to compare primary lens specifications with a control lens.',
    limitWarningTitle: 'Structural Limit Intercept!',
    limitWarningA: 'Lens width (A-Size: {val}mm) is outside the 35–65mm standard or requires lens blank ({blankVal}mm) exceeding 80mm.',
    limitWarningB: 'Lens height (B-Size: {val}mm) is outside the 20–55mm standard or pupil height lies outside the frame bounds.',
    limitWarningDbl: 'Bridge distance (DBL: {val}mm) is outside standard anatomical range of 10–28mm.',
    limitWarningEd: 'Effective Diameter (ED: {val}mm) cannot be less than its A-Size ({aVal}mm) or exceeds 75mm.',
  }
};

export const getTooltipByLabel = (label: string, lang: Language): string => {
  const t = translations[lang] as any;
  const normalized = label.trim().toLowerCase();

  // Check direct matches with current translation values
  if (normalized === (t.sphere || '').toLowerCase()) return t.tipSphere || '';
  if (normalized === (t.cylinder || '').toLowerCase()) return t.tipCylinder || '';
  if (normalized === (t.axis || '').toLowerCase()) return t.tipAxis || '';
  if (normalized === (t.refractiveIndex || '').toLowerCase()) return t.tipRefractiveIndex || '';
  if (normalized === (t.baseCurve || '').toLowerCase()) return t.tipBaseCurve || '';
  if (normalized === (t.aSize || '').toLowerCase()) return t.tipASize || '';
  if (normalized === (t.bSize || '').toLowerCase()) return t.tipBSize || '';
  if (normalized === 'dbl' || normalized === (t.dbl || '').toLowerCase()) return t.tipDbl || '';
  if (normalized === 'ed' || normalized === (t.ed || '').toLowerCase()) return t.tipEd || '';
  if (normalized === (t.fittingHeight || '').toLowerCase()) return t.tipFittingHeight || '';
  if (normalized === (t.pd || '').toLowerCase()) return t.tipPd || '';
  if (normalized === (t.frameDepth || '').toLowerCase()) return t.tipFrameDepth || '';
  if (normalized === (t.frameType || '').toLowerCase()) return t.tipFrameType || '';
  if (normalized === (t.bevelPos || '').toLowerCase()) return t.tipBevelPos || '';
  if (normalized === (t.compareMode || '').toLowerCase()) return t.tipCompareMode || '';

  // Fallback pattern matching
  if (normalized.includes('sferis') || normalized.includes('sphere') || normalized.includes('ukuran (sph)')) {
    return t.tipSphere || '';
  }
  if (normalized.includes('silinder') || normalized.includes('cylinder') || normalized.includes('cyl')) {
    return t.tipCylinder || '';
  }
  if (normalized.includes('axis')) {
    return t.tipAxis || '';
  }
  if (normalized.includes('index') || normalized.includes('bias') || normalized.includes('indeks')) {
    return t.tipRefractiveIndex || '';
  }
  if (normalized.includes('kelengkungan') || normalized.includes('curve') || normalized.includes('bc')) {
    return t.tipBaseCurve || '';
  }
  if (normalized.includes('a-size') || normalized.includes('ukuran a')) {
    return t.tipASize || '';
  }
  if (normalized.includes('b-size') || normalized.includes('ukuran b')) {
    return t.tipBSize || '';
  }
  if (normalized.includes('hidung') || normalized.includes('between') || normalized.includes('dbl')) {
    return t.tipDbl || '';
  }
  if (normalized.includes('diameter') || normalized.includes('ed')) {
    return t.tipEd || '';
  }
  if (normalized.includes('tinggi') || normalized.includes('height')) {
    return t.tipFittingHeight || '';
  }
  if (normalized.includes('pd') || normalized.includes('pupil') || normalized.includes('jarak pupil')) {
    return t.tipPd || '';
  }
  if (normalized.includes('kedalaman') || normalized.includes('depth') || normalized.includes('ketebalan bingkai')) {
    return t.tipFrameDepth || '';
  }
  if (normalized.includes('tipe') || normalized.includes('type') || normalized.includes('jenis bingkai')) {
    return t.tipFrameType || '';
  }
  if (normalized.includes('bevel') || normalized.includes('kemiringan') || normalized.includes('posisi bevel')) {
    return t.tipBevelPos || '';
  }
  if (normalized.includes('compare') || normalized.includes('banding')) {
    return t.tipCompareMode || '';
  }

  return '';
};
