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
 * The lens in cross-section: front radius R1 on the left, back radius R2 on the
 * right, closed at the frame height. Filled with the prescription ink, or drawn
 * as a dashed outline when it is the comparison material.
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
  const yVal = (frameB / 2) * scale;
  const { etX_start, etX_end } = pos;

  const arc = (x: number, to: number, rVal: number, sweep: number) => {
    if (!Number.isFinite(rVal)) {
      return `L ${x * scale} ${to}`;
    }
    return `A ${Math.abs(rVal) * scale} ${Math.abs(rVal) * scale} 0 0 ${sweep} ${x * scale} ${to}`;
  };

  const sweepBack = result.backPower >= 0 ? 0 : 1;

  const lensPath = `M ${etX_start * scale} ${-yVal}
                    ${arc(etX_start, yVal, result.r1, 0)}
                    L ${etX_end * scale} ${yVal}
                    ${arc(etX_end, -yVal, result.r2, sweepBack)}
                    Z`;

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
