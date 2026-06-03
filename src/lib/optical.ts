/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MATERIALS_DB, FRAME_TYPE_OVERRIDES } from '../data/materials';

export type LensIndex = 1.5 | 1.56 | 1.6 | 1.67 | 1.74;

export const VALID_INDICES: readonly LensIndex[] = [1.5, 1.56, 1.6, 1.67, 1.74];

export function isValidIndex(value: unknown): value is LensIndex {
  return VALID_INDICES.includes(value as LensIndex);
}

export interface LensParameters {
  sph: number;
  cyl: number;
  axis: number;
  index: number;
  baseCurve: number;
}

export interface FrameParameters {
  a: number; // A-Size (Horizontal)
  b: number; // B-Size (Vertical)
  dbl: number; // Bridge
  depth: number; // Frame thickness/depth
  ed: number; // Effective Diameter
}

export interface PatientParameters {
  pd: number; // Pupil Distance
  fittingHeight: number; // Pupil Vertical
}

export interface CalculationResult {
  ct: number; // Center Thickness
  et: number; // Edge Thickness
  anteriorProtrusion: number;
  posteriorProtrusion: number;
  r1: number; // Radius front
  r2: number; // Radius back
  backPower: number; // Power of the back surface
  s1: number; // Sagitta front
  s2: number; // Sagitta back
  decentration: number;
  y: number; // Half diameter for max thickness calc
  weight: number; // Estimated lens weight in grams
  density: number; // Material density in g/cm³
  recommendation?: {
    index: number;
    material: string;
    reason: string;
    thinness: string;
    abbe: number;
  };
}

export type FrameType = 'full' | 'half' | 'rimless';

/**
 * PURE BUSINESS LOGIC: Calculates optical lens outputs based on geometric theory.
 * Entirely decoupled from component lifecycles of React.
 */
export function calculateLens(
  lens: LensParameters,
  frame: FrameParameters,
  patient: PatientParameters,
  minThickness: number = 1.0, // mm
  bevelPercent: number = 0.33, // 0 to 1 position
  frameType: FrameType = 'full'
): CalculationResult {
  const { sph, cyl, index, baseCurve } = lens;
  const { a, dbl, ed, depth } = frame;
  const { pd } = patient;

  // Most powerful meridian worst-case calculation
  const totalPower = sph + (cyl < 0 ? 0 : cyl); 
  const minPower = sph + (cyl < 0 ? cyl : 0);
  
  let calculationPower = sph;
  if (Math.abs(sph + cyl) > Math.abs(sph)) {
    calculationPower = sph + cyl;
  }

  // 1. Decentration
  const framePD = a + dbl;
  const decentration = Math.abs(framePD - pd) / 2; // Horizontal
  const decentrationV = Math.abs(patient.fittingHeight - frame.b / 2); // Vertical
  const decentrationCombined = Math.sqrt(decentration * decentration + decentrationV * decentrationV);

  // 2. Calculation diameter radius (y)
  const y = (ed / 2) + decentrationCombined;

  // 3. Curved surfaces radii (in mm)
  const r1 = 1000 * (index - 1) / baseCurve;
  const backPower = calculationPower - baseCurve;
  const r2 = backPower === 0 ? Infinity : 1000 * (index - 1) / Math.abs(backPower);

  // 4. Sagitta calculator (s = R - sqrt(R^2 - y^2))
  function getSag(r: number, yVal: number): number {
    if (r === Infinity || isNaN(r)) return 0;
    const absR = Math.abs(r);
    if (yVal >= absR) return absR; // clamp to maximum physical deflection
    const val = Math.pow(absR, 2) - Math.pow(yVal, 2);
    if (val < 0) return 0;
    return absR - Math.sqrt(val);
  }

  const s1 = getSag(r1, y);
  const s2 = getSag(r2, y);

  // 5. Thickness matching (Center vs Edge)
  let ct: number, et: number;

  if (calculationPower >= 0) {
    et = minThickness;
    if (backPower <= 0) {
       ct = et + s1 - s2;
    } else {
       ct = et + s1 + s2;
    }
  } else {
    ct = minThickness;
    if (backPower <= 0) {
       et = ct + s2 - s1;
    } else {
       et = ct + s1 + s2;
    }
  }

  ct = Math.max(ct, minThickness);
  et = Math.max(et, minThickness);

  // Fallback protection against infinite or NaN values in early calculations
  if (isNaN(ct) || !isFinite(ct)) ct = minThickness;
  if (isNaN(et) || !isFinite(et)) et = minThickness;

  // 6. Protrusion (Dynamic bevel placement inside frame slot)
  const groovePosition = depth * bevelPercent;
  
  const etX_start = groovePosition - et / 2;
  const etX_end = groovePosition + et / 2;

  const frontMostX = etX_start - s1;
  const backMostX = etX_end; 
  
  const anteriorProtrusion = Math.max(0, -frontMostX);
  const posteriorProtrusion = Math.max(0, backMostX - depth);

  // 7. Dynamic Recommendation Module querying centralized MATERIALS_DB
  const se = Math.abs(sph + (cyl / 2));
  
  // Find standard base material matching the Sphere Equivalent Power Range
  let bestMatch = MATERIALS_DB.find(m => se >= m.seRange.min && se < m.seRange.max);
  if (!bestMatch) {
    bestMatch = MATERIALS_DB[0];
  }

  let recIndex = bestMatch.index;
  let recMaterial = bestMatch.name;
  let thinness = bestMatch.thinness;
  let abbe = bestMatch.abbe;
  let recReason = "";

  // Set explanatory reasons based on clinical guidelines
  if (se <= 2.00) {
    recReason = "Low power: Standard index provides excellent clarity (highest Abbe value).";
  } else if (se <= 3.00) {
    recReason = "Mid power: 1.56 index balances cost and ~15% thickness reduction.";
  } else if (se <= 5.00) {
    recReason = "High power: 1.61 index offers ~25% reduction and high impact resistance.";
  } else if (se <= 8.00) {
    recReason = "Very high power: 1.67 index significantly reduces edge thickness (~35%).";
  } else {
    recReason = "Extreme power: 1.74 technology is critical for aesthetics (~45% thinner).";
  }

  // Inject structural overrides (Half-rim / Rimless stress support)
  const override = FRAME_TYPE_OVERRIDES[frameType as keyof typeof FRAME_TYPE_OVERRIDES];
  if (override && recIndex < override.minIndex) {
    const overrideMat = MATERIALS_DB.find(m => m.index === override.minIndex);
    if (overrideMat) {
      recIndex = overrideMat.index;
      recMaterial = overrideMat.name;
      thinness = overrideMat.thinness;
      abbe = overrideMat.abbe;
      recReason = override.reasonEn;
    }
  }

  // Eye size index penalty: If eye dimension is large (A >= 54) and high minus, recommend higher index
  if (calculationPower < 0 && a >= 54 && recIndex < 1.74) {
    const currentIndexOrder = [1.50, 1.56, 1.61, 1.67, 1.74];
    const currPos = currentIndexOrder.indexOf(recIndex);
    if (currPos !== -1 && currPos < currentIndexOrder.length - 1) {
      const nextIndex = currentIndexOrder[currPos + 1];
      const upgradeMat = MATERIALS_DB.find(m => m.index === nextIndex);
      if (upgradeMat) {
        recIndex = upgradeMat.index;
        recMaterial = upgradeMat.name;
        thinness = upgradeMat.thinness;
        abbe = upgradeMat.abbe;
        recReason += " Note: Large eye size increases edge thickness; higher index recommended.";
      }
    }
  }

  // 8. Dynamic density query from physical config database
  let density = 1.32; // Standard nylon/CR-39 density fallback
  const indexMatch = MATERIALS_DB.find(m => Math.abs(m.index - index) < 0.015);
  if (indexMatch) {
    density = indexMatch.density;
  }

  // Weight estimation per lens blank volume projection
  const areaMm2 = Math.PI * (a / 2) * (frame.b / 2);
  const avgThickMm = (ct + et) / 2;
  const volumeCm3 = (areaMm2 * avgThickMm) / 1000;
  const weight = volumeCm3 * density;

  return {
    ct,
    et,
    anteriorProtrusion,
    posteriorProtrusion,
    r1,
    r2,
    backPower,
    s1,
    s2,
    decentration,
    y,
    weight,
    density,
    recommendation: {
      index: recIndex,
      material: recMaterial,
      reason: recReason,
      thinness,
      abbe
    }
  };
}

export const OPTICAL_ENGINE_VERSION = 'AMP_V4.2.0';
