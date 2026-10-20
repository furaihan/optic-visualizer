import React from 'react';
import { CalculationResult, FrameParameters } from '../../lib/optic-engine/types';
import { Language, translations } from '../../lib/translations';
import { LensPosition } from './types';

interface EdgeDetailProps {
  frame: FrameParameters;
  result: CalculationResult;
  pos: LensPosition;
  lang: Language;
  /** Magnification relative to the section's scale. */
  zoom: number;
  /** Left edge of the detail frame in viewBox units. */
  originX: number;
  /** Vertical centre of the detail frame. */
  originY: number;
  activeTarget?: string | null;
  onSelectTarget?: (target: string | null) => void;
  /** The comparison material, when compare mode is on. */
  compareResult?: CalculationResult;
  comparePos?: LensPosition | null;
}

/**
 * The edge, magnified: the bevel groove, the edge thickness, and the two
 * protrusions, drawn at a larger scale because that is the part a lab judges.
 * This is the detail callout a technical drawing puts beside its main view.
 *
 * In compare mode this is the only drawing where the difference is a shape
 * rather than a number: the saved material is hatched between the two edge
 * slabs, so the eye reads the reduction without doing the subtraction.
 */
export const EdgeDetail: React.FC<EdgeDetailProps> = ({
  frame,
  result,
  pos,
  lang,
  zoom,
  originX,
  originY,
  activeTarget = null,
  onSelectTarget,
  compareResult,
  comparePos,
}) => {
  const t = translations[lang];

  // The detail frames the edge: from a little in front of the rim to a little
  // behind it, and the full edge thickness plus its rim band.
  const depth = frame.depth * zoom;
  const et = result.et * zoom;
  const rimH = 5 * zoom;

  const etStart = pos.etX_start * zoom;
  const etEnd = pos.etX_end * zoom;
  const groove = pos.grooveX * zoom;

  const halfH = rimH * 1.8;
  const top = originY - halfH;
  const bottom = originY + halfH;

  const anterior = result.anteriorProtrusion;
  const posterior = result.posteriorProtrusion;

  const ink = 'text-sheet-ink';
  const muted = 'text-sheet-muted';
  const accent = 'text-sheet-rx';
  const rimInk = 'text-sheet-frame';
  const warn = 'text-sheet-warning';

  const comparing = Boolean(compareResult && comparePos);
  const etStartC = comparePos ? comparePos.etX_start * zoom : etStart;
  const etEndC = comparePos ? comparePos.etX_end * zoom : etEnd;
  const etDelta = compareResult ? result.et - compareResult.et : 0;
  const etDeltaPct = compareResult && result.et > 0 ? (etDelta / result.et) * 100 : 0;

  // The material the comparison index saves, on each side of the groove. The
  // two slabs share a groove position, so the difference is symmetric and the
  // bands sit outside the thinner slab.
  const savedBands = comparing
    ? [
        { x: Math.min(etStart, etStartC), w: Math.abs(etStartC - etStart) },
        { x: Math.min(etEnd, etEndC), w: Math.abs(etEndC - etEnd) },
      ].filter((band) => band.w > 0.25)
    : [];

  const slabTop = top + rimH;
  const slabH = bottom - top - rimH * 2;

  return (
    <g transform={`translate(${originX}, 0)`}>
      {/* Rim bands, top and bottom. */}
      <rect x={0} y={top} width={depth} height={rimH} className={rimInk} fill="currentColor" fillOpacity={0.3} />
      <rect x={0} y={bottom - rimH} width={depth} height={rimH} className={rimInk} fill="currentColor" fillOpacity={0.3} />

      {/* The lens edge, in section: a straight slab at this magnification. */}
      <rect
        x={etStart}
        y={slabTop}
        width={et}
        height={slabH}
        className={accent}
        fill="currentColor"
        fillOpacity={0.2}
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* The saved material, hatched, drawn over the slab: it is the band left
          over once the thinner edge is cut, so it has to read as a distinct
          fill and not as a tint of the lens it sits on. */}
      {savedBands.map((band, i) => (
        <rect
          key={i}
          x={band.x}
          y={slabTop}
          width={band.w}
          height={slabH}
          fill="url(#section-hatch)"
          stroke="none"
        />
      ))}

      {/* The comparison edge: outline only, dashed, so the primary slab's fill
          cannot bury it. */}
      {comparing && (
        <rect
          x={etStartC}
          y={slabTop}
          width={etEndC - etStartC}
          height={slabH}
          fill="none"
          className={ink}
          stroke="currentColor"
          strokeWidth={1.75}
          strokeOpacity={0.85}
          strokeDasharray="7 4"
          strokeLinecap="round"
        />
      )}

      {/* The bevel groove. */}
      <g
        className={`cursor-help ${activeTarget === 'groove' ? warn : muted}`}
        onMouseEnter={() => onSelectTarget?.('groove')}
        onMouseLeave={() => onSelectTarget?.(null)}
        onClick={() => onSelectTarget?.(activeTarget === 'groove' ? null : 'groove')}
      >
        <line
          x1={groove}
          y1={top}
          x2={groove}
          y2={bottom}
          stroke="currentColor"
          strokeWidth={activeTarget === 'groove' ? 2.5 : 1.5}
          strokeDasharray="7 5"
        />
      </g>

      {/* Edge thickness, dimensioned inside the slab. */}
      <g
        className={`cursor-help ${activeTarget === 'et' ? warn : ink}`}
        onMouseEnter={() => onSelectTarget?.('et')}
        onMouseLeave={() => onSelectTarget?.(null)}
        onClick={() => onSelectTarget?.(activeTarget === 'et' ? null : 'et')}
      >
        <line
          x1={etStart}
          y1={originY}
          x2={etEnd}
          y2={originY}
          stroke="currentColor"
          strokeWidth={activeTarget === 'et' ? 2.5 : 1.6}
          markerStart="url(#sheet-arrow)"
          markerEnd="url(#sheet-arrow)"
        />
        <text
          x={(etStart + etEnd) / 2}
          y={originY - 9}
          textAnchor="middle"
          fill="currentColor"
          fontSize={16}
          fontWeight={600}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {result.et.toFixed(2)}
        </text>
      </g>

      {/* The comparison edge, dimensioned under the primary's line. */}
      {comparing && compareResult && (
        <g className={muted}>
          <line
            x1={etStartC}
            y1={originY + 30}
            x2={etEndC}
            y2={originY + 30}
            stroke="currentColor"
            strokeWidth={1.3}
            markerStart="url(#sheet-arrow)"
            markerEnd="url(#sheet-arrow)"
          />
          <text
            x={(etStartC + etEndC) / 2}
            y={originY + 46}
            textAnchor="middle"
            fill="currentColor"
            fontSize={16}
            fontWeight={600}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {compareResult.et.toFixed(2)}
          </text>
        </g>
      )}

      {/* Anterior and posterior protrusion, measured off the rim faces. */}
      {anterior > 0 && (
        <g className={warn}>
          <line
            x1={-anterior * zoom}
            y1={top - 16}
            x2={0}
            y2={top - 16}
            stroke="currentColor"
            strokeWidth={1.6}
            markerStart="url(#sheet-arrow)"
            markerEnd="url(#sheet-arrow)"
          />
          <text
            x={(-anterior * zoom) / 2}
            y={top - 24}
            textAnchor="middle"
            fill="currentColor"
            fontSize={16}
            fontWeight={600}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {anterior.toFixed(2)}
          </text>
        </g>
      )}
      {posterior > 0 && (
        <g className={warn}>
          <line
            x1={depth}
            y1={top - 16}
            x2={depth + posterior * zoom}
            y2={top - 16}
            stroke="currentColor"
            strokeWidth={1.6}
            markerStart="url(#sheet-arrow)"
            markerEnd="url(#sheet-arrow)"
          />
          <text
            x={depth + (posterior * zoom) / 2}
            y={top - 24}
            textAnchor="middle"
            fill="currentColor"
            fontSize={16}
            fontWeight={600}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {posterior.toFixed(2)}
          </text>
        </g>
      )}

      {/* Frame depth and the saved thickness on one line under the detail. They
          share the line because stacking them put two 12-unit labels 18 units
          apart, which at the board's scale is barely one line of text. */}
      <g className={muted}>
        <line
          x1={0}
          y1={bottom + 14}
          x2={depth}
          y2={bottom + 14}
          stroke="currentColor"
          strokeWidth={1.3}
          markerStart="url(#sheet-arrow)"
          markerEnd="url(#sheet-arrow)"
        />
      </g>
      <text
        x={depth / 2}
        y={bottom + 34}
        textAnchor="middle"
        className={comparing ? warn : muted}
        fill="currentColor"
        fontSize={16}
        fontWeight={comparing ? 600 : 400}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {comparing
          ? `${t.frameDepth} ${frame.depth.toFixed(1)} · ${t.delta} ${Math.abs(etDelta).toFixed(2)} mm (${etDeltaPct > 0 ? '+' : ''}${etDeltaPct.toFixed(0)}%)`
          : `${t.frameDepth} ${frame.depth.toFixed(1)}`}
      </text>
    </g>
  );
};
