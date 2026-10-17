import React from 'react';

/**
 * Shared SVG definitions for the drawing board.
 *
 * Everything here is drawn with a flat ink. There are no metallic gradients:
 * the frame is a solid tone step, the lens a flat tint, the comparison lens a
 * hatch, exactly as a technical sheet would print them.
 *
 * The ids are fixed (`sheet-arrow`, `section-hatch`) because the marker and
 * pattern paints are referenced by url() from sibling components.
 *
 * Paint servers do not inherit currentColor, so the two fills below read the
 * sheet tokens directly: a marker filled with the ink has to stay legible when
 * the ground flips from paper to dark board.
 */
export const SheetDefs: React.FC = () => (
  <defs>
    {/* Dimension-line arrowhead: filled, 7 units long. */}
    <marker
      id="sheet-arrow"
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="7"
      markerHeight="7"
      orient="auto-start-reverse"
      markerUnits="userSpaceOnUse"
    >
      <path d="M 0 1 L 9 5 L 0 9 Z" fill="var(--sheet-ink)" />
    </marker>

    {/* The comparison lens is hatched, so it reads as a second material
        without introducing a second hue. */}
    <pattern
      id="section-hatch"
      width="7"
      height="7"
      patternTransform="rotate(45 0 0)"
      patternUnits="userSpaceOnUse"
    >
      <rect width="7" height="7" fill="transparent" />
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="7"
        stroke="var(--sheet-muted)"
        strokeWidth="1.6"
        strokeOpacity="0.6"
      />
    </pattern>
  </defs>
);

/** A horizontal dimension line with arrows at both ends and its value above it. */
export const DimH: React.FC<{
  x1: number;
  x2: number;
  y: number;
  label?: string;
  tone?: 'ink' | 'muted' | 'warning';
  onClick?: () => void;
  active?: boolean;
}> = ({ x1, x2, y, label, tone = 'ink', onClick, active = false }) => {
  const colour =
    tone === 'warning' ? 'text-sheet-warning' : tone === 'muted' ? 'text-sheet-muted' : 'text-sheet-ink';
  const mid = (x1 + x2) / 2;
  return (
    <g
      className={`${colour} ${onClick ? 'cursor-help' : ''}`}
      onClick={onClick}
      opacity={active ? 1 : 0.92}
    >
      <line
        x1={x1}
        y1={y}
        x2={x2}
        y2={y}
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.25}
        markerStart="url(#sheet-arrow)"
        markerEnd="url(#sheet-arrow)"
      />
      {label && (
        <text
          x={mid}
          y={y - 6}
          textAnchor="middle"
          fill="currentColor"
          fontSize={11.5}
          fontWeight={600}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {label}
        </text>
      )}
    </g>
  );
};

/** A vertical dimension line with arrows at both ends and its value beside it. */
export const DimV: React.FC<{
  y1: number;
  y2: number;
  x: number;
  label?: string;
  tone?: 'ink' | 'muted' | 'warning';
  side?: 'left' | 'right';
  active?: boolean;
}> = ({ y1, y2, x, label, tone = 'ink', side = 'left', active = false }) => {
  const colour =
    tone === 'warning' ? 'text-sheet-warning' : tone === 'muted' ? 'text-sheet-muted' : 'text-sheet-ink';
  const mid = (y1 + y2) / 2;
  const labelX = side === 'left' ? x - 7 : x + 7;
  return (
    <g className={colour} opacity={active ? 1 : 0.92}>
      <line
        x1={x}
        y1={y1}
        x2={x}
        y2={y2}
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.25}
        markerStart="url(#sheet-arrow)"
        markerEnd="url(#sheet-arrow)"
      />
      {label && (
        <text
          x={labelX}
          y={mid}
          textAnchor={side === 'left' ? 'end' : 'start'}
          dominantBaseline="middle"
          fill="currentColor"
          fontSize={11.5}
          fontWeight={600}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {label}
        </text>
      )}
    </g>
  );
};

/** Extension line: the thin guide that carries a dimension out to its arrow. */
export const ExtLine: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = ({
  x1,
  y1,
  x2,
  y2,
}) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    className="text-sheet-muted"
    stroke="currentColor"
    strokeWidth={0.75}
    strokeOpacity={0.55}
  />
);
