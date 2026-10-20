import React from 'react';
import { FrameParameters, PatientParameters, CalculationResult } from '../../lib/optic-engine/types';
import { Language, translations } from '../../lib/translations';
import { DimH, DimV, ExtLine } from './SheetDefs';

interface FrontViewProps {
  frame: FrameParameters;
  patient: PatientParameters;
  result: CalculationResult;
  lang: Language;
  /** px per mm, shared with the section so the two views agree. */
  scale: number;
  /** Left edge of the right-hand opening (the one the order is for). */
  originX: number;
  /** Vertical centre of both openings. */
  originY: number;
  /** True when this is the only drawing on the board. */
  isMain?: boolean;
  highlightedLimit?: 'a' | 'b' | 'dbl' | 'ed' | null;
}

/**
 * Front elevation of the lens pair: the rim, the lens, the effective diameter
 * circle, the pupil crosshair, and the three dimensions a lab orders (A, B, DBL).
 */
export const FrontView: React.FC<FrontViewProps> = ({
  frame,
  patient,
  result,
  lang,
  scale,
  originX,
  originY,
  isMain = false,
  highlightedLimit = null,
}) => {
  const t = translations[lang];

  const openingW = frame.a * scale;
  const openingH = frame.b * scale;
  const rimW = 2.5 * scale;
  const bridge = frame.dbl * scale;

  // Right opening starts at originX; the left one ends at originX - bridge.
  const rightX = originX;
  const leftX = originX - bridge - openingW;

  const top = originY - openingH / 2;
  const bottom = originY + openingH / 2;

  const warn = 'text-sheet-warning';
  const ink = 'text-sheet-ink';
  const muted = 'text-sheet-muted';
  const rimInk = 'text-sheet-frame';
  const tone = (field: 'a' | 'b' | 'dbl' | 'ed') =>
    highlightedLimit === field ? warn : ink;

  const opening = (x: number, primary: boolean) => (
    <g key={x}>
      {/* Lens opening: a flat tint of the prescription ink, so the rim reads as
          a band of frame ink around it. */}
      <rect
        x={x}
        y={top}
        width={openingW}
        height={openingH}
        className={primary ? 'text-sheet-rx' : 'text-sheet-muted'}
        fill="currentColor"
        fillOpacity={primary ? 0.12 : 0.06}
      />
      {/* Rim: a drawn band of real thickness. */}
      <rect
        x={x}
        y={top}
        width={openingW}
        height={openingH}
        fill="none"
        className={primary ? rimInk : 'text-sheet-muted'}
        stroke="currentColor"
        strokeWidth={rimW}
        strokeOpacity={primary ? 0.55 : 0.28}
      />
      {/* Effective diameter: the circle the blank must cover. */}
      <circle
        cx={x + openingW / 2}
        cy={originY}
        r={(frame.ed * scale) / 2}
        fill="none"
        className={primary ? tone('ed') : 'text-sheet-muted'}
        stroke="currentColor"
        strokeWidth={primary && highlightedLimit === 'ed' ? 2.25 : 1.1}
        strokeDasharray={primary && highlightedLimit === 'ed' ? '7 4' : '5 5'}
        strokeOpacity={primary && highlightedLimit === 'ed' ? 1 : 0.45}
      />
      {/* Pupil and PD crosshair, in the fitting ink: this mark is the one thing
          on the drawing that comes from the fitting group, not from the frame. */}
      <g
        transform={`translate(${x + (frame.a / 2 - result.decentration) * scale}, ${
          originY + (frame.b / 2 - patient.fittingHeight) * scale
        })`}
        className="text-sheet-fit"
      >
        <circle r={7} fill="none" stroke="currentColor" strokeWidth={1.6} />
        <line x1={-13} y1={0} x2={13} y2={0} stroke="currentColor" strokeWidth={1} />
        <line x1={0} y1={-13} x2={0} y2={13} stroke="currentColor" strokeWidth={1} />
      </g>
    </g>
  );

  return (
    <g>
      {opening(leftX, false)}
      {opening(rightX, true)}

      {/* A: horizontal opening, above the right lens, above the ED circle. */}
      <g className={tone('a')}>
        <ExtLine x1={rightX} y1={top - rimW} x2={rightX} y2={top - 42} />
        <ExtLine x1={rightX + openingW} y1={top - rimW} x2={rightX + openingW} y2={top - 42} />
      </g>
      <DimH
        x1={rightX}
        x2={rightX + openingW}
        y={top - 34}
        label={`A ${frame.a}`}
        tone={highlightedLimit === 'a' ? 'warning' : 'ink'}
        active={highlightedLimit === 'a'}
      />

      {/* B: vertical opening, in its own column right of the rim. */}
      <g className={tone('b')}>
        <ExtLine x1={rightX + openingW + rimW} y1={top} x2={rightX + openingW + 46} y2={top} />
        <ExtLine x1={rightX + openingW + rimW} y1={bottom} x2={rightX + openingW + 46} y2={bottom} />
      </g>
      <DimV
        y1={top}
        y2={bottom}
        x={rightX + openingW + 38}
        label={`B ${frame.b}`}
        side="right"
        tone={highlightedLimit === 'b' ? 'warning' : 'ink'}
        active={highlightedLimit === 'b'}
      />

      {/* DBL: the bridge, between the two openings, in its own band below. */}
      <g className={tone('dbl')}>
        <ExtLine x1={leftX + openingW} y1={bottom + rimW} x2={leftX + openingW} y2={bottom + 40} />
        <ExtLine x1={rightX} y1={bottom + rimW} x2={rightX} y2={bottom + 40} />
      </g>
      <DimH
        x1={leftX + openingW}
        x2={rightX}
        y={bottom + 32}
        label={`DBL ${frame.dbl}`}
        tone={highlightedLimit === 'dbl' ? 'warning' : 'ink'}
        active={highlightedLimit === 'dbl'}
      />
      {/* ED value, below the circle it measures, clear of the DBL dimension. */}
      <text
        x={rightX + openingW / 2}
        y={bottom + 8}
        textAnchor="middle"
        className={tone('ed')}
        fill="currentColor"
        fontSize={16}
        fontWeight={600}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        ED {frame.ed}
      </text>

      <text
        x={rightX + openingW / 2}
        y={bottom + 54}
        textAnchor="middle"
        className={muted}
        fill="currentColor"
        fontSize={16}
      >
        {isMain ? t.frontView : ''}
      </text>
    </g>
  );
};
