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

export interface CalculationResult {
  error?: boolean;
  errorMessage?: string;
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

export interface AsphericCalculationResult {
  error?: boolean;
  errorMessage?: string;
  ct: number;
  et: number;
  anteriorProtrusion: number;
  posteriorProtrusion: number;
  r1: number;
  r2: number;
  backPower: number;
  s1: number;
  s2: number;
  decentration: number;
  y: number;
  weight: number;
  density: number;
  // Aspheric-specific results
  sa0: number;           // Spherical aberration at center
  comaX: number;         // Coma aberration
  recommendation?: {
    index: number;
    material: string;
    reason: string;
    thinness: string;
    abbe: number;
  };
}


export type FrameType = 'full' | 'half' | 'rimless';
