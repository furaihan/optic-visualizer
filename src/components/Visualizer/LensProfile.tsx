import React from 'react';
import { CalculationResult } from '../../lib/optic-engine/types';
import { LensPosition } from './types';

interface LensProfileProps {
  result: CalculationResult;
  pos: LensPosition;
  scale: number;
  /** Drawing origin in viewBox units: x = front face of the rim, y = frame centre. */
  originX: number;
  originY: number;
  frameB: number;
  tone?: 'primary' | 'compare';
  active?: boolean;
}

/**
 * The lens in cross-section.
 *
 * The section is the vertical meridian through the optical centre, and it is
 * drawn from the engine's own geometry: the two surfaces are circles of the
 * front and back radii, the rim sits where the frame opening cuts them, and
 * the two vertices are where the engine says they are. The drawing and the
 * schedule therefore measure the same lens — the centre thickness on the
 * drawing is the centre thickness in the table.
 *
 * The comparison is never filled: at this scale the two outlines are a few
 * pixels apart, and a fill on top would bury the one underneath. A dashed
 * outline drawn above the primary's fill stays readable along its whole length.
 */
export const LensProfile: React.FC<LensProfileProps> = ({
  result,
  pos,
  scale,
  originX,
  originY,
  frameB,
  tone = 'primary',
  active = false,
}) => {
  const section = result.section;

  const arc = (rVal: number, sweep: number, x: number, y: number) => {
    if (!Number.isFinite(rVal)) {
      return `L ${x * scale} ${y * scale}`;
    }
    const r = Math.abs(rVal) * scale;
    return `A ${r} ${r} 0 0 ${sweep} ${x * scale} ${y * scale}`;
  };

  const lensPath = (() => {
    if (!section) {
      // No section geometry: fall back to the arcs of the frame height, so a
      // lens that could not be measured is still drawn.
      const yVal = (frameB / 2) * scale;
      const { etX_start, etX_end } = pos;
      const fallbackArc = (x: number, to: number, rVal: number, sweep: number) =>
        Number.isFinite(rVal)
          ? `A ${Math.abs(rVal) * scale} ${Math.abs(rVal) * scale} 0 0 ${sweep} ${x * scale} ${to}`
          : `L ${x * scale} ${to}`;
      return `M ${etX_start * scale} ${-yVal}
              ${fallbackArc(etX_start, yVal, result.r1, 0)}
              L ${etX_end * scale} ${yVal}
              ${fallbackArc(etX_end, -yVal, result.r2, result.backPower >= 0 ? 0 : 1)}
              Z`;
    }

    // The rim, in the frame's own vertical coordinates: the optical centre may
    // sit above or below the middle of the opening, so the two ends of the
    // section are not the same distance from the axis.
    const topY = -(section.ocY + section.radiusTop);
    const bottomY = section.radiusBottom - section.ocY;

    const frontTopX = section.frontApexZ + section.frontOffsetTop;
    const frontBottomX = section.frontApexZ + section.frontOffsetBottom;
    const backTopX = section.backApexZ + section.backOffsetTop;
    const backBottomX = section.backApexZ + section.backOffsetBottom;

    // The front surface bulges towards the front, so its arc is drawn one way
    // round. The back surface bulges towards the back only when its radius is
    // negative, which is when the arc turns the other way.
    const sweepBack = section.r2 > 0 ? 1 : 0;

    return `M ${frontTopX * scale} ${topY * scale}
            ${arc(section.r1, 0, frontBottomX, bottomY)}
            L ${backBottomX * scale} ${bottomY * scale}
            ${arc(Math.abs(section.r2), sweepBack, backTopX, topY)}
            Z`;
  })();

  const isCompare = tone === 'compare';

  return (
    <g transform={`translate(${originX}, ${originY})`}>
      <path
        key={`${result.ct}-${result.et}-${result.s1}-${result.s2}`}
        d={lensPath}
        fill={isCompare ? 'none' : 'currentColor'}
        fillOpacity={isCompare ? 0 : active ? 0.26 : 0.16}
        className={`${isCompare ? 'text-sheet-ink' : 'text-sheet-rx'} ${
          isCompare ? '' : 'section-redraw'
        }`}
        stroke="currentColor"
        strokeWidth={isCompare ? 2 : active ? 2.4 : 1.9}
        strokeOpacity={isCompare ? 0.9 : 1}
        strokeDasharray={isCompare ? '7 4' : undefined}
        strokeLinecap={isCompare ? 'round' : undefined}
      />
    </g>
  );
};
