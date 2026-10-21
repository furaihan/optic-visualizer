export interface OpticalMaterial {
  id: string;
  name: string;
  index: number;
  abbe: number;
  density: number; // Density in g/cm³
  seRange: { min: number; max: number };
  /** Why this index is the one for this power band, in English. */
  reasonEn: string;
  /** The same reason, in Indonesian. */
  reasonId: string;
}

export const MATERIALS_DB: OpticalMaterial[] = [
  {
    id: 'cr39',
    name: 'CR-39 (Standard)',
    index: 1.5,
    abbe: 58,
    density: 1.32,
    seRange: { min: 0, max: 2.0 },
    reasonEn:
      'Low power: Standard index provides excellent clarity (highest Abbe value).',
    reasonId:
      'Daya rendah: Indeks standar memberi kejelasan terbaik (nilai Abbe tertinggi).',
  },
  {
    id: 'nk55',
    name: 'Mid-Index (NK-55)',
    index: 1.56,
    abbe: 38,
    density: 1.24,
    seRange: { min: 2.0, max: 3.0 },
    reasonEn:
      'Mid power: 1.56 index balances cost against a thinner edge than CR-39.',
    reasonId:
      'Daya sedang: Indeks 1.56 menyeimbangkan biaya dengan tepi lebih tipis dari CR-39.',
  },
  {
    id: 'mr8',
    name: 'High-Index (MR-8)',
    index: 1.6,
    abbe: 42,
    density: 1.3,
    seRange: { min: 3.0, max: 5.0 },
    reasonEn:
      'High power: 1.60 index thins the edge further and keeps impact resistance.',
    reasonId:
      'Daya tinggi: Indeks 1.60 membuat tepi lebih tipis dan tetap tahan benturan.',
  },
  {
    id: 'mr10',
    name: 'Ultra High-Index (MR-10)',
    index: 1.67,
    abbe: 32,
    density: 1.35,
    seRange: { min: 5.0, max: 8.0 },
    reasonEn:
      'Very high power: 1.67 index cuts the edge and the weight further.',
    reasonId:
      'Daya sangat tinggi: Indeks 1.67 memangkas tepi dan berat lebih banyak.',
  },
  {
    id: 'mr174',
    name: 'Premium Index (MR-174)',
    index: 1.74,
    abbe: 33,
    density: 1.47,
    seRange: { min: 8.0, max: Infinity },
    reasonEn:
      'Extreme power: 1.74 technology is critical for aesthetics at this power.',
    reasonId:
      'Daya ekstrem: Teknologi 1.74 penting untuk tampilan estetik pada daya ini.',
  },
];

export const FRAME_TYPE_OVERRIDES = {
  half: {
    minIndex: 1.56,
    materialId: 'nk55',
    reasonId:
      'Half-rim terdeteksi: minimum 1.56 diperlukan agar kusen tidak mudah pecah.',
    reasonEn:
      'Half-rim detected: minimum 1.56 required so the groove does not chip.',
  },
  rimless: {
    minIndex: 1.6,
    materialId: 'mr8',
    reasonId:
      'Rimless terdeteksi: 1.60 (MR-8) diperlukan untuk ketahanan bor dan lenturan.',
    reasonEn:
      'Rimless detected: 1.60 (MR-8) is required for drill durability and flex.',
  },
};

export const ERGONOMIC_LIMITS = {
  a: { min: 35, max: 65 },
  b: { min: 20, max: 55 },
  dbl: { min: 10, max: 28 },
  ed: { min: 35, max: 75 },
  pd: { min: 40, max: 80 },
  fittingHeight: { min: 5, max: 40 },
};
