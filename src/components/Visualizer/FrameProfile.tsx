import React from 'react';
import { CalculationResult, FrameParameters } from '../../lib/optic-engine/types';
import { translations, Language } from '../../lib/translations';
import { LensPosition } from './types';
import { ExtLine } from './SheetDefs';

interface FrameProfileProps {
  frame: FrameParameters;
  result: CalculationResult;
  pos: LensPosition;
  scale: number;
  /** Drawing origin: x = front face of the rim, y = the frame's vertical centre. */
  originX: number;
  originY: number;
  lang: Language;
  activeTarget?: string | null;
  onSelectTarget?: (target: string | null) => void;
}

/**
 * The rim in cross-section: a solid band of frame depth above and below the
 * lens, the bevel groove marked by a dashed position line, and the two
 * protrusions dimensioned in their own band above the drawing so nothing
 * collides with anything else.
 */
export const FrameProfile: React.FC<FrameProfileProps> = ({
  frame,
  result,
  pos,
  scale,
  originX,
  originY,
  lang,
  activeTarget = null,
  onSelectTarget,
}) => {
  const t = translations[lang];
  const halfB = (frame.b / 2) * scale;
  const rim = 5 * scale;
  const depth = frame.depth * scale;
  const { grooveX } = pos;

  const top = originY - halfB - rim;
  const bottom = originY + halfB + rim;

  const anterior = result.anteriorProtrusion;
  const posterior = result.posteriorProtrusion;
  // Two dimension bands above the rim: protrusion (measured off the rim faces)
  // on the outer band, and CT above the lens inside it. Nothing overlaps.
  const topBand = top - 54;

  return (
    <g transform={`translate(${originX}, 0)`}>
      {/* Rim band, top and bottom: the slot the lens edge sits in. The rim is
          drawn as a band that meets the lens edge, so the section reads as one
          object rather than a lens floating between two slabs. */}
      <rect
        x={0}
        y={top}
        width={depth}
        height={rim + 0.5}
        className="text-sheet-ink"
        fill="currentColor"
        fillOpacity={0.3}
      />
      <rect
        x={0}
        y={bottom - rim - 0.5}
        width={depth}
        height={rim + 0.5}
        className="text-sheet-ink"
        fill="currentColor"
        fillOpacity={0.3}
      />
      {/* The slot line: where the rim meets the lens, drawn once. */}
      <line
        x1={0}
        y1={top + rim}
        x2={depth}
        y2={top + rim}
        className="text-sheet-ink"
        stroke="currentColor"
        strokeWidth={1}
        strokeOpacity={0.35}
      />
      <line
        x1={0}
        y1={bottom - rim}
        x2={depth}
        y2={bottom - rim}
        className="text-sheet-ink"
        stroke="currentColor"
        strokeWidth={1}
        strokeOpacity={0.35}
      />

      {/* Bevel groove. */}
      <g
        className={`cursor-help ${activeTarget === 'groove' ? 'text-sheet-warning' : 'text-sheet-muted'}`}
        onMouseEnter={() => onSelectTarget?.('groove')}
        onMouseLeave={() => onSelectTarget?.(null)}
        onClick={() => onSelectTarget?.(activeTarget === 'groove' ? null : 'groove')}
      >
        <line
          x1={grooveX}
          y1={top}
          x2={grooveX}
          y2={bottom}
          stroke="currentColor"
          strokeWidth={activeTarget === 'groove' ? 1.75 : 1}
          strokeOpacity={activeTarget === 'groove' ? 1 : 0.6}
          strokeDasharray="6 5"
        />
        <text
          x={grooveX}
          y={bottom + 34}
          textAnchor="middle"
          fill="currentColor"
          fontSize={12.5}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {Math.round(frame.depth ? (grooveX / scale / frame.depth) * 100 : 0)}%
        </text>
      </g>

      {/* Anterior protrusion, measured from the front face of the rim. */}
      {anterior > 0 && (
        <g className="text-sheet-warning">
          <ExtLine x1={0} y1={top} x2={-anterior * scale} y2={top} />
          <line
            x1={-anterior * scale}
            y1={topBand}
            x2={0}
            y2={topBand}
            stroke="currentColor"
            strokeWidth={activeTarget === 'anterior' ? 2 : 1.4}
            markerStart="url(#sheet-arrow)"
            markerEnd="url(#sheet-arrow)"
            className="cursor-help"
            onMouseEnter={() => onSelectTarget?.('anterior')}
            onMouseLeave={() => onSelectTarget?.(null)}
            onClick={() => onSelectTarget?.(activeTarget === 'anterior' ? null : 'anterior')}
          />
          <text
            x={(-anterior * scale) / 2}
            y={topBand - 8}
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

      {/* Posterior protrusion, measured from the back face of the rim. */}
      {posterior > 0 && (
        <g className="text-sheet-warning">
          <ExtLine x1={depth} y1={top} x2={depth + posterior * scale} y2={top} />
          <line
            x1={depth}
            y1={topBand}
            x2={depth + posterior * scale}
            y2={topBand}
            stroke="currentColor"
            strokeWidth={activeTarget === 'posterior' ? 2 : 1.4}
            markerStart="url(#sheet-arrow)"
            markerEnd="url(#sheet-arrow)"
            className="cursor-help"
            onMouseEnter={() => onSelectTarget?.('posterior')}
            onMouseLeave={() => onSelectTarget?.(null)}
            onClick={() => onSelectTarget?.(activeTarget === 'posterior' ? null : 'posterior')}
          />
          <text
            x={depth + (posterior * scale) / 2}
            y={topBand - 8}
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
    </g>
  );
};
