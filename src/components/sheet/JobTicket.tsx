import React from 'react';
import {
  CalculationResult,
  FrameParameters,
  FrameType,
  LensParameters,
  PatientParameters,
} from '../../lib/optic-engine/types';
import { Language, translations } from '../../lib/translations';
import { GroupMarker, type SheetGroup } from '../Sidebar/GroupMarker';

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
  /** Fields per block. Narrow panels read better with two. */
  columns?: 2 | 3;
  /**
   * `classic` is the ticket the landing page shows, and it is left exactly as
   * it was. `compact` is the workbench's: the same order in a shorter strip,
   * with the short field names, so the sheet and its schedule land inside the
   * first screen.
   */
  variant?: 'classic' | 'compact';
}

type Cell = { key: string; short?: string; value: string };

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
  columns = 3,
  variant = 'classic',
}) => {
  const t = translations[lang];
  const compact = variant === 'compact';
  const signed = (v: number, digits = 2) => `${v > 0 ? '+' : ''}${v.toFixed(digits)}`;

  const frameTypeLabel =
    frameType === 'full' ? t.fullRim : frameType === 'half' ? t.halfRim : t.rimless;

  const blocks: { title: string; group: SheetGroup; cells: Cell[] }[] = [
    {
      title: t.rxLine,
      group: 'rx',
      cells: [
        { key: 'SPH', value: signed(lens.sph) },
        { key: 'CYL', value: signed(lens.cyl) },
        { key: 'AXIS', value: `${lens.axis}°` },
        { key: t.refractiveIndex, short: t.shortIndex, value: lens.index.toFixed(2) },
        { key: 'BC', value: `${lens.baseCurve.toFixed(2)} D` },
      ],
    },
    {
      title: t.frameLine,
      group: 'frame',
      cells: [
        { key: 'A', value: `${frame.a}` },
        { key: 'B', value: `${frame.b}` },
        { key: 'DBL', value: `${frame.dbl}` },
        { key: 'ED', value: `${frame.ed}` },
        { key: t.frameDepth, short: t.shortDepth, value: `${frame.depth.toFixed(1)} mm` },
        { key: t.frameType, short: t.shortType, value: frameTypeLabel },
      ],
    },
    {
      title: t.fittingLine,
      group: 'fit',
      cells: [
        { key: 'PD', value: `${patient.pd}` },
        { key: t.fittingHeight, short: t.shortHeight, value: `${patient.fittingHeight}` },
        { key: t.bevelPos, short: t.shortBevel, value: `${Math.round(bevelPercent * 100)}%` },
        { key: t.framePd, short: t.shortFramePd, value: `${(frame.a + frame.dbl).toFixed(0)} mm` },
        {
          key: t.decentration,
          short: t.shortDecentration,
          value: `${result.decentration.toFixed(2)} mm`,
        },
      ],
    },
  ];

  return (
    <div
      data-ui
      className={`sheet-rise delay-1 grid grid-cols-1 rounded-sm bg-sheet-panel ${
        compact
          ? 'gap-x-8 gap-y-3 p-3 @lg:grid-cols-3'
          : 'gap-x-10 gap-y-7 p-5 lg:grid-cols-3'
      }`}
    >
      {blocks.map((block) => (
        <div key={block.title} className="flex min-w-0 flex-col gap-2">
          <p className="flex items-center gap-2 text-[13px] font-medium text-sheet-ink">
            <GroupMarker group={block.group} />
            <span className="truncate">{block.title}</span>
          </p>
          <dl
            className={`grid gap-x-4 ${
              compact
                ? 'grid-cols-2 gap-y-1.5 @xl:grid-cols-3'
                : `gap-y-3 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`
            }`}
          >
            {block.cells.map((cell) => (
              <div key={cell.key} className="flex min-w-0 flex-col gap-0.5">
                <dt
                  className={`leading-tight text-sheet-muted ${
                    compact ? 'truncate text-[13px]' : 'text-[13px]'
                  }`}
                >
                  {compact ? (cell.short ?? cell.key) : cell.key}
                </dt>
                <dd
                  className={`font-medium leading-tight text-sheet-ink tnum ${
                    compact ? 'text-[18px]' : 'text-[22px]'
                  }`}
                >
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
