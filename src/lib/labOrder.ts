import type {
  CalculationResult,
  FrameParameters,
  FrameType,
  LensParameters,
  PatientParameters,
} from './optic-engine/types';
import type { AppTranslations } from './translations/types';

/**
 * The lab order as plain text: the format a lab can paste into its own sheet.
 *
 * Built from whatever the page holds, so the aspheric sheet copies the
 * aspheric order and the spherical sheet copies the spherical one. The copy
 * button reads these lines; it does not reach into a global state of its own.
 */
export function labOrderLines(
  lens: LensParameters,
  frame: FrameParameters,
  patient: PatientParameters,
  result: CalculationResult,
  frameType: FrameType,
  bevelPercent: number,
  t: AppTranslations
): string[] {
  const signed = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)}`;
  return [
    `${t.labOrder}`,
    `${t.rxLine}: SPH ${signed(lens.sph)}  CYL ${signed(lens.cyl)}  AXIS ${lens.axis}°  n ${lens.index.toFixed(2)}  BC ${lens.baseCurve.toFixed(2)}`,
    `${t.frameLine}: A ${frame.a}  B ${frame.b}  DBL ${frame.dbl}  ED ${frame.ed}  ${t.frameDepth} ${frame.depth.toFixed(1)} mm`,
    `${t.fittingLine}: PD ${patient.pd}  ${t.fittingHeight} ${patient.fittingHeight}  ${t.bevelPos} ${Math.round(bevelPercent * 100)}%`,
    `${t.edgeThick} ${result.et.toFixed(2)} mm  |  ${t.center} ${result.ct.toFixed(2)} mm`,
    `${t.anteriorProt} ${result.anteriorProtrusion.toFixed(2)} mm  |  ${t.posteriorProt} ${result.posteriorProtrusion.toFixed(2)} mm`,
    `${t.lensWeight} ${result.weight.toFixed(1)} g  |  ${t.minBlank} ${((result.minBlank ?? result.y * 2 + 2)).toFixed(0)} mm`,
    `${t.frameType}: ${frameType}`,
  ];
}
