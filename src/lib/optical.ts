/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  recommendation?: {
    index: number;
    material: string;
    reason: string;
    thinness: string;
    abbe: number;
  };
}

export type FrameType = 'full' | 'half' | 'rimless';

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

  // For thickness simulator, we calculate at the most powerful meridian
  // to show "worst case" thickness.
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

  // 2. Calculation radius (y)
  const y = (ed / 2) + decentrationCombined;

  // 3. Radius of curvature (in mm)
  const r1 = 1000 * (index - 1) / baseCurve;
  const backPower = calculationPower - baseCurve;
  const r2 = backPower === 0 ? Infinity : 1000 * (index - 1) / Math.abs(backPower);

  // 4. Sagitta (s = R - sqrt(R^2 - y^2))
  function getSag(r: number, yVal: number): number {
    if (r === Infinity) return 0;
    if (yVal >= Math.abs(r)) return Math.abs(r);
    return Math.abs(r) - Math.sqrt(Math.pow(r, 2) - Math.pow(yVal, 2));
  }

  const s1 = getSag(r1, y);
  const s2 = getSag(r2, y);

  // 5. Thickness (CT and ET)
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

  // 6. Protrusion (Dynamic bevel position)
  const groovePosition = depth * bevelPercent;
  
  const etX_start = groovePosition - et / 2;
  const etX_end = groovePosition + et / 2;

  const frontMostX = etX_start - s1;
  const backMostX = etX_end; 
  
  const anteriorProtrusion = Math.max(0, -frontMostX);
  const posteriorProtrusion = Math.max(0, backMostX - depth);

  // 7. Enhanced Recommendation Engine based on Knowledge Base
  // Spherical Equivalent (S.E) = Sph + 1/2 Cyl
  const se = Math.abs(sph + (cyl / 2));
  
  let recIndex = 1.50;
  let recMaterial = "CR-39";
  let recReason = "";
  let thinness = "0%";
  let abbe = 58;

  // Base recommendation by power
  if (se <= 2.00) {
    recIndex = 1.50;
    recMaterial = "CR-39";
    recReason = "Low power: Standard index provides excellent clarity (highest Abbe value).";
    thinness = "0%";
    abbe = 58;
  } else if (se <= 3.00) {
    recIndex = 1.56;
    recMaterial = "Mid-Index (NK-55)";
    recReason = "Mid power: 1.56 index balances cost and ~15% thickness reduction.";
    thinness = "15%";
    abbe = 38;
  } else if (se <= 5.00) {
    recIndex = 1.61;
    recMaterial = "High-Index (MR-8)";
    recReason = "High power: 1.61 index offers ~25% reduction and high impact resistance.";
    thinness = "25%";
    abbe = 42;
  } else if (se <= 8.00) {
    recIndex = 1.67;
    recMaterial = "Ultra High-Index (MR-10)";
    recReason = "Very high power: 1.67 index significantly reduces edge thickness (~35%).";
    thinness = "35%";
    abbe = 32;
  } else {
    recIndex = 1.74;
    recMaterial = "Premium Index (MR-174)";
    recReason = "Extreme power: 1.74 technology is critical for aesthetics (~45% thinner).";
    thinness = "45%";
    abbe = 33;
  }

  // Frame Type overrides
  if (frameType === 'half' && recIndex < 1.56) {
    recIndex = 1.56;
    recMaterial = "NK-55";
    recReason = "Half-rim detected: Minimum 1.56 required for tensile strength (prevents chipping).";
    thinness = "15%";
    abbe = 38;
  } else if (frameType === 'rimless') {
    if (recIndex < 1.61) {
        recIndex = 1.61;
        recMaterial = "MR-8";
        recReason = "Rimless detected: 1.61 (MR-8) is mandatory for drilling durability and flex.";
        thinness = "25%";
        abbe = 42;
    }
  }

  // Eye size penalty: If lens is minus and frame A is large (> 54), suggest one step higher if possible
  if (calculationPower < 0 && a >= 54 && recIndex < 1.74) {
      if (recIndex === 1.50) recIndex = 1.56;
      else if (recIndex === 1.56) recIndex = 1.61;
      else if (recIndex === 1.61) recIndex = 1.67;
      else if (recIndex === 1.67) recIndex = 1.74;
      recReason += " Note: Large eye size increases edge thickness; higher index recommended.";
  }

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
    recommendation: {
      index: recIndex,
      material: recMaterial,
      reason: recReason,
      thinness,
      abbe
    }
  };
}

export const OPTICAL_ENGINE_VERSION = 'AMP_V4.1.2';

