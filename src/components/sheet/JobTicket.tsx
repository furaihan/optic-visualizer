import React from 'react';
import {
  CalculationResult,
  FrameParameters,
  FrameType,
  LensParameters,
  PatientParameters,
} from '../../lib/optic-engine/types';
import { Language, translations } from '../../lib/translations';

interface JobTicketProps {
  lens: LensParameters;
  frame: FrameParameters;
  patient: PatientParameters;
  result: CalculationResult;
  frameType: FrameType;
  bevelPercent: number;
  lang: Language;
  compareIndex?: number;
  compareResult?: CalculationResult;
}

type Cell = { key: string; value: string; wide?: boolean };

/**
 * The lab order, as a ticket: the prescription, the frame and the fitting, in
 * the order a lab reads them. Values are set large and tabular; the grid wraps
 * rather than squeezing a column until the numbers touch.
 */
export const JobTicket: React.FC<JobTicketProps> = ({
  lens,
  frame,
  patient,
  result,
  frameType,
  bevelPercent,
  lang,
  compareIndex,
  compareResult,
}) => {
  const t = translations[lang];
  const signed = (v: number, digits = 2) => `${v > 0 ? '+' : ''}${v.toFixed(digits)}`;

  const frameTypeLabel =
    frameType === 'full' ? t.fullRim : frameType === 'half' ? t.halfRim : t.rimless;

  const blocks: { title: string; cells: Cell[] }[] = [
    {
      title: t.rxLine,
      cells: [
        { key: 'SPH', value: signed(lens.sph) },
        { key: 'CYL', value: signed(lens.cyl) },
        { key: 'AXIS', value: `${lens.axis}°` },
        { key: t.refractiveIndex, value: lens.index.toFixed(2) },
        { key: 'BC', value: `${lens.baseCurve.toFixed(2)} D` },
      ],
    },
    {
      title: t.frameLine,
      cells: [
        { key: 'A', value: `${frame.a}` },
        { key: 'B', value: `${frame.b}` },
        { key: 'DBL', value: `${frame.dbl}` },
        { key: 'ED', value: `${frame.ed}` },
        { key: t.frameDepth, value: `${frame.depth.toFixed(1)} mm` },
        { key: t.frameType, value: frameTypeLabel, wide: true },
      ],
    },
    {
      title: t.fittingLine,
      cells: [
        { key: 'PD', value: `${patient.pd}` },
        { key: t.fittingHeight, value: `${patient.fittingHeight}` },
        { key: t.bevelPos, value: `${Math.round(bevelPercent * 100)}%` },
        { key: t.framePd, value: `${(frame.a + frame.dbl).toFixed(0)} mm` },
        { key: t.decentration, value: `${result.decentration.toFixed(2)} mm` },
      ],
    },
  ];

  return (
    <div
      data-ui
      className="sheet-rise delay-1 grid grid-cols-1 gap-x-10 gap-y-7 rounded-sm bg-sheet-panel p-5 lg:grid-cols-3"
    >
      {blocks.map((block) => (
        <div key={block.title} className="flex min-w-0 flex-col gap-3">
          <p className="text-[13px] font-medium text-sheet-ink">{block.title}</p>
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
            {block.cells.map((cell) => (
              <div key={cell.key} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-[13px] leading-tight text-sheet-muted">{cell.key}</dt>
                <dd className="text-[22px] font-medium leading-tight text-sheet-ink tnum">
                  {cell.value}
                </dd>
              </div>
            ))}
          </dl>
          {block.title === t.fittingLine && compareResult && compareIndex != null && (
            <p className="text-[13px] leading-snug text-sheet-muted tnum">
              {t.compareAgainst} {compareIndex.toFixed(2)}: ET {compareResult.et.toFixed(2)} mm
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
