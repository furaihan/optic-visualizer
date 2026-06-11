import { MATERIALS_DB, FRAME_TYPE_OVERRIDES } from "../../data/materials";
import {
  FrameParameters,
  PatientParameters,
  AsphericLensParameters,
  AsphericCalculationResult,
} from "./types";
/**
 * Calculate aspheric sag: z(y) = (y²/R) / (1 + √(1 - (1+K)(y/R)²)) + polynomial
 */
export function getAsphericSag(
  R: number,
  yVal: number,
  conic: number,
  coeffs: { A2: number; A4: number; A6: number; A8: number },
): number {
  if (R === Infinity || !Number.isFinite(R)) return 0;

  const absR = Math.abs(R);
  const yAbs = Math.abs(yVal);

  // Spherical part
  const yEffective = Math.min(yAbs, absR * 0.999);
  const discriminant = absR * absR - (1 + conic) * yEffective * yEffective;

  if (discriminant < 0) return 0;

  const sphericalSag =
    (yEffective * yEffective) /
    absR /
    (1 + Math.sqrt(discriminant / (absR * absR)));

  // Polynomial aspheric terms
  const y2 = yVal * yVal;
  const y4 = y2 * y2;
  const y6 = y4 * y2;
  const y8 = y4 * y4;

  const asphericTerms =
    coeffs.A2 * y2 + coeffs.A4 * y4 + coeffs.A6 * y6 + coeffs.A8 * y8;

  return sphericalSag + asphericTerms;
}

/**
 * Main aspheric lens calculation
 */
export function calculateAsphericLens(
  lens: AsphericLensParameters,
  frame: FrameParameters,
  patient: PatientParameters,
  minThickness: number = 1.0,
  bevelPercent: number = 0.33,
  frameType: string = "full",
): AsphericCalculationResult {
  const { sph, cyl, index, baseCurve, asphericFront, asphericBack } = lens;
  const { a, dbl, ed, depth } = frame;
  const { pd, fittingHeight } = patient;

  // Decentration (same as spherical)
  const framePD = a + dbl;
  const decentration = Math.abs(framePD - pd) / 2;
  const decentrationV = Math.abs(fittingHeight - frame.b / 2);
  const decentrationCombined = Math.sqrt(
    decentration * decentration + decentrationV * decentrationV,
  );
  const y = ed / 2 + decentrationCombined;

  // Powers
  const totalPower = sph + (cyl < 0 ? 0 : cyl);
  const minPower = sph + (cyl < 0 ? cyl : 0);

  let calculationPower = sph;
  if (Math.abs(sph + cyl) > Math.abs(sph)) {
    calculationPower = sph + cyl;
  }

  // Radii
  const r1 = (1000 * (index - 1)) / baseCurve;
  const backPower = calculationPower - baseCurve;
  const r2 =
    backPower === 0 ? Infinity : (1000 * (index - 1)) / Math.abs(backPower);

  // ASPHERIC SAGITTA - use getAsphericSag if active, else fallback to sphere
  const s1 = asphericFront.isActive
    ? getAsphericSag(r1, y, asphericFront.conic, {
        A2: asphericFront.A2,
        A4: asphericFront.A4,
        A6: asphericFront.A6,
        A8: asphericFront.A8,
      })
    : r1 === Infinity
      ? 0
      : Math.abs(r1) -
        Math.sqrt(Math.max(0, Math.abs(r1) * Math.abs(r1) - y * y));

  const s2 = asphericBack.isActive
    ? getAsphericSag(r2, y, asphericBack.conic, {
        A2: asphericBack.A2,
        A4: asphericBack.A4,
        A6: asphericBack.A6,
        A8: asphericBack.A8,
      })
    : r2 === Infinity
      ? 0
      : Math.abs(r2) -
        Math.sqrt(Math.max(0, Math.abs(r2) * Math.abs(r2) - y * y));

  // Thickness (same logic as spherical for now - dapat di-refine)
  let ct: number, et: number;

  if (calculationPower >= 0) {
    et = minThickness;
    if (backPower <= 0) {
      ct = et + Math.abs(s1) - Math.abs(s2);
    } else {
      ct = et + Math.abs(s1) + Math.abs(s2);
    }
  } else {
    ct = minThickness;
    if (backPower <= 0) {
      et = ct + Math.abs(s2 - s1);
    } else {
      et = ct + Math.abs(s1) + Math.abs(s2);
    }
  }

  ct = Math.max(ct, minThickness);
  et = Math.max(et, minThickness);

  if (isNaN(ct) || !isFinite(ct)) ct = minThickness;
  if (isNaN(et) || !isFinite(et)) et = minThickness;

  // Protrusion
  const groovePosition = depth * bevelPercent;
  const etX_start = groovePosition - et / 2;
  const etX_end = groovePosition + et / 2;
  const frontMostX = etX_start - s1;
  const backMostX = etX_end;

  const anteriorProtrusion = Math.max(0, -frontMostX);
  const posteriorProtrusion = Math.max(0, backMostX - depth);

  // Material recommendation
  const se = Math.abs(sph + cyl / 2);
  let bestMatch = MATERIALS_DB.find(
    (m) => se >= m.seRange.min && se < m.seRange.max,
  );
  if (!bestMatch) {
    bestMatch = MATERIALS_DB[0];
  }

  let recIndex = bestMatch.index;
  let recMaterial = bestMatch.name;
  let thinness = bestMatch.thinness;
  let abbe = bestMatch.abbe;
  let recReason = "Aspheric lens optimized for aberration correction.";

  // Density
  let density = 1.32;
  const indexMatch = MATERIALS_DB.find(
    (m) => Math.abs(m.index - index) < 0.015,
  );
  if (indexMatch) {
    density = indexMatch.density;
  }

  // Weight
  const areaMm2 = Math.PI * (a / 2) * (frame.b / 2);
  const avgThickMm = (ct + et) / 2;
  const volumeCm3 = (areaMm2 * avgThickMm) / 1000;
  const weight = volumeCm3 * density;

  // Simplified aberration metrics
  const sa0 =
    asphericFront.conic !== 0 ? Math.abs(asphericFront.conic * 0.05) : 0;
  const comaX = 0; // Placeholder

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
    sa0,
    comaX,
    recommendation: {
      index: recIndex,
      material: recMaterial,
      reason: recReason,
      thinness,
      abbe,
    },
  };
}

export const ASPHERIC_ENGINE_VERSION = "AMP_ASPH_V1.0.0";
