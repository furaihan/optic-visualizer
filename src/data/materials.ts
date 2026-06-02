/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OpticalMaterial {
  id: string;
  name: string;
  index: number;
  abbe: number;
  density: number; // Density in g/cm³
  seRange: { min: number; max: number };
  thinness: string; // Aesthetic thinness compared to 1.50
}

export const MATERIALS_DB: OpticalMaterial[] = [
  {
    id: 'cr39',
    name: 'CR-39 (Standard)',
    index: 1.50,
    abbe: 58,
    density: 1.32,
    seRange: { min: 0, max: 2.0 },
    thinness: '0%'
  },
  {
    id: 'nk55',
    name: 'Mid-Index (NK-55)',
    index: 1.56,
    abbe: 38,
    density: 1.24,
    seRange: { min: 2.0, max: 3.0 },
    thinness: '15%'
  },
  {
    id: 'mr8',
    name: 'High-Index (MR-8)',
    index: 1.61,
    abbe: 42,
    density: 1.30,
    seRange: { min: 3.0, max: 5.0 },
    thinness: '25%'
  },
  {
    id: 'mr10',
    name: 'Ultra High-Index (MR-10)',
    index: 1.67,
    abbe: 32,
    density: 1.35,
    seRange: { min: 5.0, max: 8.0 },
    thinness: '35%'
  },
  {
    id: 'mr174',
    name: 'Premium Index (MR-174)',
    index: 1.74,
    abbe: 33,
    density: 1.47,
    seRange: { min: 8.0, max: Infinity },
    thinness: '45%'
  }
];

export const FRAME_TYPE_OVERRIDES = {
  'half': {
    minIndex: 1.56,
    materialId: 'nk55',
    reasonId: 'Half-rim detected: Minimum 1.56 required for tensile strength (prevents chipping).',
    reasonEn: 'Half-rim detected: Minimum 1.56 required for tensile strength (prevents chipping).'
  },
  'rimless': {
    minIndex: 1.61,
    materialId: 'mr8',
    reasonId: 'Rimless detected: 1.61 (MR-8) is mandatory for drilling durability and flex.',
    reasonEn: 'Rimless detected: 1.61 (MR-8) is mandatory for drilling durability and flex.'
  }
};

export const ERGONOMIC_LIMITS = {
  a: { min: 35, max: 65 },
  b: { min: 20, max: 55 },
  dbl: { min: 10, max: 28 },
  ed: { min: 35, max: 75 },
  pd: { min: 40, max: 80 },
  fittingHeight: { min: 5, max: 40 }
};
