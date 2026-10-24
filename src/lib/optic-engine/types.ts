import type { SectionGeometry } from "./geometry";

export type LensIndex = 1.5 | 1.56 | 1.6 | 1.67 | 1.74;

export const VALID_INDICES: readonly LensIndex[] = [1.5, 1.56, 1.6, 1.67, 1.74];

export interface LensParameters {
  sph: number;
  cyl: number;
  axis: number;
  index: LensIndex;
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

export interface AsphericSurfaceConfig {
  conic: number;        // K value (-2 to 2)
  A2: number;          // Coefficients
  A4: number;
  A6: number;
  A8: number;
  isActive: boolean;
}

export interface AsphericLensParameters {
  sph: number;
  cyl: number;
  axis: number;
  index: LensIndex;
  baseCurve: number;
  asphericFront: AsphericSurfaceConfig;
  asphericBack: AsphericSurfaceConfig;
}

export interface LensRecommendation {
  index: number;
  material: string;
  reason: string;
  /** Kept for the ticket, but the number it shows is measured, not quoted. */
  thinness: string;
  abbe: number;
  /** The edge thickness the recommended material gives, in millimetres. */
  edgeThickness?: number;
  /** The edge thickness the material in hand gives, in millimetres. */
  currentEdgeThickness?: number;
  /** How much thinner the recommended material makes the lens, in millimetres. */
  saving?: number;
  /** The same saving as a percentage of the current edge thickness. */
  savingPercent?: number;
  /**
   * How much thinner the recommended material is than CR-39 would be for this
   * same lens, as a percentage.
   */
  referenceSavingPercent?: number;
}

export interface CalculationResult {
  error?: boolean;
  errorMessage?: string;
  ct: number; // Center Thickness
  et: number; // Edge Thickness, the thickest point around the rim
  /** The thinnest point of the rim, in millimetres. */
  etMin?: number;
  anteriorProtrusion: number;
  posteriorProtrusion: number;
  r1: number; // Radius front
  r2: number; // Radius back
  backPower: number; // Power of the back surface
  /** The back vertex power of the thickest-edge meridian, in dioptres. */
  vertexPower?: number;
  /** How far the vertex power is from the prescribed power, in dioptres. */
  vertexPowerError?: number;
  s1: number; // Sagitta front
  s2: number; // Sagitta back
  decentration: number; // Horizontal decentration per lens, in millimetres
  decentrationH?: number; // signed horizontal decentration (framePD - PD)/2
  decentrationV?: number; // signed vertical offset, fitting height - B/2
  y: number; // Farthest distance from the optical centre to the rim
  minBlank?: number; // Required blank diameter, in millimetres
  weight: number; // Estimated lens weight in grams
  density: number; // Material density in g/cm³
  /** The cross-section the side elevation draws. */
  section?: SectionGeometry;
  recommendation?: LensRecommendation;
  /** Back-surface power correction applied to every meridian for vertex power. */
  backPowerOffset?: number;
}

export interface AsphericCalculationResult {
  error?: boolean;
  errorMessage?: string;
  ct: number;
  et: number;
  /** The thinnest point of the rim, in millimetres. */
  etMin?: number;
  anteriorProtrusion: number;
  posteriorProtrusion: number;
  r1: number;
  r2: number;
  backPower: number;
  /** The back vertex power of the thickest-edge meridian, in dioptres. */
  vertexPower?: number;
  /** How far the vertex power is from the prescribed power, in dioptres. */
  vertexPowerError?: number;
  s1: number;
  s2: number;
  decentration: number;
  decentrationH?: number; // signed horizontal decentration (framePD - PD)/2
  decentrationV?: number; // signed vertical offset, fitting height - B/2
  y: number;
  minBlank?: number;
  weight: number;
  density: number;
  /** The cross-section the side elevation draws. */
  section?: SectionGeometry;
  // Aspheric-specific results
  /** The departure of the aspheric surface from a sphere at the rim, in mm. */
  departure: number; // Aspheric departure from the best-fit sphere
  /** The conic constant of the front surface. */
  conic?: number;
  recommendation?: LensRecommendation;
  /** Back-conic power correction applied to every meridian for vertex power. */
  backPowerOffset?: number;
}


export type FrameType = 'full' | 'half' | 'rimless';
