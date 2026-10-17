import React from 'react';
import {
  LensParameters,
  FrameParameters,
  PatientParameters,
  CalculationResult,
} from '../../lib/optic-engine/types';
import { Language, translations } from '../../lib/translations';
import { LensPosition } from './types';
import { DimH } from './SheetDefs';

interface TopDownViewProps {
  lens: LensParameters;
  frame: FrameParameters;
  patient: PatientParameters;
  result: CalculationResult;
  compareResult?: CalculationResult;
  compareLens?: LensParameters;
  lang: Language;
  scale: number;
  centerX: number;
  centerY: number;
  primaryPos: LensPosition;
  comparePos: LensPosition | null;
  highlightedLimit?: 'a' | 'b' | 'dbl' | 'ed' | null;
}

/**
 * Plan view: both lens openings seen from above, with the bridge between them
 * and the frame depth dimensioned once. The lens cross-section sits in each
 * opening, so protrusion is legible from this angle too.
 */
export const TopDownView: React.FC<TopDownViewProps> = ({
  lens,
  frame,
  patient,
  result,
  compareResult,
  compareLens,
  lang,
  scale,
  centerX,
  centerY,
  primaryPos,
  comparePos,
  highlightedLimit = null,
}) => {
  const t = translations[lang];
  const a = frame.a;
  const dbl = frame.dbl;
  const depth = frame.depth;

  const warn = 'text-sheet-warning';
  const accent = 'text-sheet-rx';
  const rimInk = 'text-sheet-frame';
  const muted = 'text-sheet-muted';

  const halfGap = (dbl / 2) * scale;
  const openingW = a * scale;
  const depthPx = depth * scale;

  const lensPath = (r: CalculationResult, pos: LensPosition, side: 1 | -1) => {
    const { etX_start, etX_end } = pos;
    const r1 = Math.abs(r.r1);
    const r2 = Math.abs(r.r2);
    const sweepBack = r.backPower >= 0 ? 0 : 1;

    const pt = (lx: number, ly: number) =>
      `${centerX + lx * side * scale} ${centerY + ly * scale}`;

    const p1 = pt(dbl / 2, etX_start);
    const p2 = pt(dbl / 2 + a, etX_start);
    const p3 = pt(dbl / 2 + a, etX_end);
    const p4 = pt(dbl / 2, etX_end);

    return `M ${p1}
            A ${r1 * scale} ${r1 * scale} 0 0 ${side === 1 ? 1 : 0} ${p2}
            L ${p3}
            A ${r2 * scale} ${r2 * scale} 0 0 ${side === 1 ? 1 - sweepBack : sweepBack} ${p4}
            Z`;
  };

  return (
    <g>
      {/* Bridge: a single drawn arc, the way a plan view shows it. */}
      <path
        d={`M ${centerX - halfGap} ${centerY + depthPx / 2}
            Q ${centerX} ${centerY - depthPx * 0.6}
              ${centerX + halfGap} ${centerY + depthPx / 2}`}
        fill="none"
        className={highlightedLimit === 'dbl' ? warn : rimInk}
        stroke="currentColor"
        strokeWidth={highlightedLimit === 'dbl' ? 3 : 2}
        strokeOpacity={highlightedLimit === 'dbl' ? 1 : 0.8}
        strokeLinecap="round"
      />

      {[-1, 1].map((side) => {
        const x = centerX + (side === 1 ? halfGap : -halfGap - openingW);
        return (
          <g key={side}>
            {/* Rim block in plan. */}
            <rect
              x={x}
              y={centerY}
              width={openingW}
              height={depthPx}
              className={highlightedLimit === 'a' ? warn : rimInk}
              fill="currentColor"
              fillOpacity={highlightedLimit === 'a' ? 0.24 : 0.16}
              rx={1.5}
            />

            {/* Temple arm, drawn once per side as a thin curve. */}
            <path
              d={
                side === 1
                  ? `M ${x + openingW} ${centerY + depthPx * 0.35}
                     C ${x + openingW + 14 * scale} ${centerY + depthPx * 0.35},
                       ${x + openingW + 20 * scale} ${centerY + depthPx * 0.9},
                       ${x + openingW + 12 * scale} ${centerY + 22 * scale}`
                  : `M ${x} ${centerY + depthPx * 0.35}
                     C ${x - 14 * scale} ${centerY + depthPx * 0.35},
                       ${x - 20 * scale} ${centerY + depthPx * 0.9},
                       ${x - 12 * scale} ${centerY + 22 * scale}`
              }
              fill="none"
              className={muted}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeOpacity={0.5}
              strokeLinecap="round"
            />

            {/* Comparison lens first, so the primary reads on top. */}
            {compareResult && compareLens && comparePos && (
              <path
                d={lensPath(compareResult, comparePos, side as 1 | -1)}
                fill="url(#section-hatch)"
                className={muted}
                stroke="currentColor"
                strokeWidth={1.2}
                strokeOpacity={0.7}
              />
            )}
            <path
              d={lensPath(result, primaryPos, side as 1 | -1)}
              fill="currentColor"
              fillOpacity={0.16}
              className={accent}
              stroke="currentColor"
              strokeWidth={1.6}
            />
          </g>
        );
      })}

      {/* Frame depth, dimensioned once under the right opening. */}
      <g className={muted}>
        <DimH
          x1={centerX + halfGap}
          x2={centerX + halfGap + openingW}
          y={centerY + depthPx + 26}
          label={`${depth.toFixed(1)}`}
          tone="muted"
        />
      </g>

      {/* PD, the one number that belongs to the patient rather than the frame. */}
      <text
        x={centerX - halfGap - openingW / 2}
        y={centerY + depthPx + 44}
        textAnchor="middle"
        className={muted}
        fill="currentColor"
        fontSize={11}
      >
        {t.pd} {patient.pd}
      </text>
    </g>
  );
};
