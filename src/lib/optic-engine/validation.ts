import {
  LensParameters,
  FrameParameters,
  PatientParameters,
} from "./types";
import { ERGONOMIC_LIMITS } from "../../data/materials";
import {
  backRadius,
  buildOpening,
  farthestRimDistance,
  frontRadius,
  powerInMeridian,
  rimRadius,
} from "./geometry";

export interface ValidationError {
  field: string;
  messageId: string;
  messageEn: string;
  isFatal: boolean; // If true, calculation should be suspended or fallback used
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const INPUT_SPECS = {
  sph: { step: 0.25, min: -20, max: 20, label: "SPH" },
  cyl: { step: 0.25, min: -10, max: 0, label: "CYL" },
  axis: { step: 1, min: 0, max: 180, label: "AXIS" },
  baseCurve: { step: 0.25, min: 0.25, max: 12, label: "BC" },
  minThickness: { step: 0.05, min: 0.5, max: 3, label: "MIN_THICKNESS" },
  pd: { step: 0.5, min: 40, max: 80, label: "PD" },
  fittingHeight: { step: 0.5, min: 5, max: 40, label: "FH" },
  a: { step: 1, min: 35, max: 65, label: "A_SIZE" },
  b: { step: 1, min: 20, max: 55, label: "B_SIZE" },
  dbl: { step: 1, min: 10, max: 28, label: "DBL" },
  ed: { step: 1, min: 35, max: 75, label: "ED" },
};

/**
 * Validates optical inputs for extreme physics values and logical consistency
 */
export function validateOpticalParams(
  lens: LensParameters,
  frame: FrameParameters,
  patient: PatientParameters,
): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. Nan & Finite Checks (Fatal)
  const isAllFinite =
    Number.isFinite(lens.sph) &&
    Number.isFinite(lens.cyl) &&
    Number.isFinite(lens.index) &&
    Number.isFinite(lens.baseCurve) &&
    Number.isFinite(frame.a) &&
    Number.isFinite(frame.b) &&
    Number.isFinite(frame.dbl) &&
    Number.isFinite(frame.depth) &&
    Number.isFinite(frame.ed) &&
    Number.isFinite(patient.pd) &&
    Number.isFinite(patient.fittingHeight);

  if (!isAllFinite) {
    errors.push({
      field: "global",
      messageId: "Semua parameter harus berupa angka valid.",
      messageEn: "All parameters must be valid finite numbers.",
      isFatal: true,
    });
    return { isValid: false, errors };
  }

  // 2. Physical geometry & edge cases
  if (frame.a <= 0 || frame.b <= 0 || frame.dbl <= 0 || frame.ed <= 0) {
    errors.push({
      field: "frame",
      messageId: "Dimensi bingkai harus lebih besar dari nol.",
      messageEn: "Frame dimensions must be greater than zero.",
      isFatal: true,
    });
    return { isValid: false, errors };
  }

  // ED cannot be less than A
  if (frame.ed < frame.a) {
    errors.push({
      field: "ed",
      messageId: "ED tidak boleh kurang dari ukuran horizontal lensa (A).",
      messageEn: "ED cannot be less than horizontal eye size (A).",
      isFatal: false,
    });
  }

  // The shape of the lens is the A x B box with its corners cut back to the
  // circle of diameter ED. A circle wider than the diagonal of the box cuts
  // nothing off at all, so the ED is no longer describing the lens.
  if (frame.ed > Math.hypot(frame.a, frame.b)) {
    errors.push({
      field: "ed",
      messageId:
        "ED lebih besar dari diagonal bingkai (A × B), sehingga ED tidak lagi menentukan bentuk lensanya.",
      messageEn:
        "ED is larger than the frame's diagonal (A x B), so it no longer describes the shape of the lens.",
      isFatal: false,
    });
  }

  // 3. Ergonomic / Out-of-bounds Warnings
  if (!Number.isFinite(lens.axis) || lens.axis < 0 || lens.axis > 180) {
    errors.push({
      field: "axis",
      messageId: "Axis harus antara 0-180°.",
      messageEn: "Axis must be between 0-180°.",
      isFatal: false,
    });
  }

  if (
    patient.pd < ERGONOMIC_LIMITS.pd.min ||
    patient.pd > ERGONOMIC_LIMITS.pd.max
  ) {
    errors.push({
      field: "pd",
      messageId: `Pupil Distance (PD) di luar batas klinis (${ERGONOMIC_LIMITS.pd.min}-${ERGONOMIC_LIMITS.pd.max}mm).`,
      messageEn: `Pupillary Distance (PD) is outside regular clinical range (${ERGONOMIC_LIMITS.pd.min}-${ERGONOMIC_LIMITS.pd.max}mm).`,
      isFatal: false,
    });
  }

  if (patient.fittingHeight > frame.b - 2) {
    errors.push({
      field: "fittingHeight",
      messageId: "Tinggi pasang melebihi tinggi bingkai yang dipilih.",
      messageEn: "Fitting height is too high for the chosen frame height (B).",
      isFatal: false,
    });
  }

  if (patient.fittingHeight < ERGONOMIC_LIMITS.fittingHeight.min) {
    errors.push({
      field: "fittingHeight",
      messageId: `Tinggi pasang di bawah batas nyaman (${ERGONOMIC_LIMITS.fittingHeight.min}mm).`,
      messageEn: `Fitting height is below recommended ergonomic limit (${ERGONOMIC_LIMITS.fittingHeight.min}mm).`,
      isFatal: false,
    });
  }

  // 4. Decentration and blank calculation validation
  const framePD = frame.a + frame.dbl;
  const decentration = Math.abs(framePD - patient.pd) / 2;
  const opening = buildOpening(frame, patient);
  // The blank has to hold the shape around the optical centre, so it is twice
  // the farthest the rim reaches from the pupil, plus the two millimetres of
  // edging allowance. The same rule the engine uses.
  const requiredBlank = 2 * farthestRimDistance(opening) + 2;

  if (requiredBlank > 85) {
    errors.push({
      field: "decentration",
      messageId:
        "Kombinasi ukuran bingkai dan PD membutuhkan diameter bahan lensa yang tidak lazim (>85mm).",
      messageEn:
        "Frame size and PD combination requires an extremely large lens blank (>85mm).",
      isFatal: false,
    });
  }

  // Sagitta physical real-world checks (prevent root of negative numbers).
  // The aperture is the frame opening, and the back surface is a different
  // curve in every meridian, so each direction is checked on its own.
  const index = lens.index;
  const baseCurve = lens.baseCurve;
  const r1 = frontRadius(index, baseCurve);

  let impossible = false;
  for (let i = 0; i < 36 && !impossible; i += 1) {
    const theta = i * 10;
    const radius = rimRadius(opening, theta);
    const power = powerInMeridian(theta, lens.sph, lens.cyl, lens.axis);
    const r2 = backRadius(index, power - baseCurve);
    if (
      radius >= Math.abs(r1) ||
      (r2 !== Infinity && radius >= Math.abs(r2))
    ) {
      impossible = true;
    }
  }

  if (impossible) {
    errors.push({
      field: "baseCurve",
      messageId:
        "Lengkung lensa tidak kompatibel dengan ukuran mata bingkai (Sifat geometris melebihi batas kurva).",
      messageEn:
        "Lens curvature is incompatible with eye diameter (geometric exception due to steep curve).",
      isFatal: true, // Fatally breaks the sagitta equations (NaN)
    });
  }

  const fatalExists = errors.some((e) => e.isFatal);

  return {
    isValid: !fatalExists,
    errors,
  };
}

/**
 * Snaps any input to a specific step and clamps to bounds
 */
export function clampAndSnapInput(
  value: number,
  spec: { step: number; min: number; max: number },
): number {
  const steps = Math.round(value / spec.step);
  const snapped = steps * spec.step;
  return Math.min(spec.max, Math.max(spec.min, snapped));
}

