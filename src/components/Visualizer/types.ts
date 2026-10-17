import {
  LensParameters,
  FrameParameters,
  PatientParameters,
  CalculationResult,
  FrameType,
} from "../../lib/optic-engine/types";
import { Language } from "../../lib/translations";

export interface VisualizerProps {
  lens: LensParameters;
  frame: FrameParameters;
  patient: PatientParameters;
  result: CalculationResult;
  compareResult?: CalculationResult;
  compareLens?: LensParameters;
  lang: Language;
  view: "side" | "top" | "front";
  frameType?: FrameType;
  highlightedLimit?: "a" | "b" | "dbl" | "ed" | null;
  /** Bevel position as a share of frame depth, for the groove caliper. */
  bevelPercent?: number;
}

export interface LensPosition {
  etX_start: number;
  etX_end: number;
  grooveX: number;
  frontApexX: number;
  backApexX: number;
}

/** The measurements a caliper can read off the board. */
export type CaliperTarget =
  | "ct"
  | "et"
  | "groove"
  | "anterior"
  | "posterior"
  | null;

export interface HoverLabel {
  title: string;
  desc: string;
  x: number;
  y: number;
}
