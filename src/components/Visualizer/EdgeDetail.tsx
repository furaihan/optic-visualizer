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
}

/**
 * The edge, magnified: the bevel groove, the edge thickness, and the two
 * protrusions, drawn at a larger scale because that is the part a lab judges.
 * This is the detail callout a technical drawing puts beside its main view.
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

  const halfH = rimH * 2.1;
  const top = originY - halfH;
  const bottom = originY + halfH;

  const anterior = result.anteriorProtrusion;
  const posterior = result.posteriorProtrusion;

  const ink = 'text-sheet-ink';
  const muted = 'text-sheet-muted';
  const accent = 'text-sheet-accent';
  const warn = 'text-sheet-warning';

  return (
    <g transform={`translate(${originX}, 0)`}>
      {/* Rim bands, top and bottom. */}
      <rect x={0} y={top} width={depth} height={rimH} className={ink} fill="currentColor" fillOpacity={0.26} />
      <rect x={0} y={bottom - rimH} width={depth} height={rimH} className={ink} fill="currentColor" fillOpacity={0.26} />

      {/* The lens edge, in section: a straight slab at this magnification. */}
      <rect
        x={etStart}
        y={top + rimH}
        width={et}
        height={bottom - top - rimH * 2}
        className={accent}
        fill="currentColor"
        fillOpacity={0.2}
        stroke="currentColor"
        strokeWidth={2}
      />

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
          fontSize={12.5}
          fontWeight={600}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          ET {result.et.toFixed(2)}
        </text>
      </g>

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
            fontSize={12.5}
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
            fontSize={12.5}
            fontWeight={600}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {posterior.toFixed(2)}
          </text>
        </g>
      )}

      {/* Frame depth, under the detail. */}
      <g className={muted}>
        <line
          x1={0}
          y1={bottom + 12}
          x2={depth}
          y2={bottom + 12}
          stroke="currentColor"
          strokeWidth={1.3}
          markerStart="url(#sheet-arrow)"
          markerEnd="url(#sheet-arrow)"
        />
        <text
          x={depth / 2}
          y={bottom + 26}
          textAnchor="middle"
          fill="currentColor"
          fontSize={12}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {t.frameDepth} {frame.depth.toFixed(1)}
        </text>
      </g>
    </g>
  );
};
