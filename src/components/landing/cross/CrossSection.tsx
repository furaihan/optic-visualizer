import React, { useMemo } from 'react';
import type { CalculationResult } from '@lib/optic-engine/types';

/**
 * The lens in section, drawn from the engine's own geometry.
 *
 * Nothing here is an illustration of a lens: the two surfaces are arcs of the
 * front and back radii the engine solved, the rim sits where the frame
 * opening cuts them, and the two apexes are where the engine says they are.
 * The figures printed beside the drawing are read off the same numbers, so
 * the drawing and the table can never disagree.
 *
 * The optical cross is drawn on the same field: the horizontal meridian
 * through the optical centre, and the plane of that centre through the
 * material. A lens is those two meridians crossing; this is where the page
 * gets its structure from.
 */
export function CrossSection({
  result,
  frameB,
  bevelPercent,
  dimensions = true,
  className = '',
}: {
  result: CalculationResult;
  frameB: number;
  bevelPercent: number;
  dimensions?: boolean;
  className?: string;
}) {
  const draw = useMemo(() => {
    const s = result.section;
    if (!s || result.error) return null;

    // The rim, in the frame's own vertical coordinates.
    const topY = -(s.ocY + s.radiusTop);
    const bottomY = s.radiusBottom - s.ocY;
    const height = Math.max(bottomY - topY, 1);

    const frontTopX = s.frontApexZ + s.frontOffsetTop;
    const frontBottomX = s.frontApexZ + s.frontOffsetBottom;
    const backTopX = s.backApexZ + s.backOffsetTop;
    const backBottomX = s.backApexZ + s.backOffsetBottom;

    // The front surface bulges forward; the back one only turns the other way
    // when its radius is signed the other way.
    const sweepBack = s.r2 > 0 ? 1 : 0;

    const path =
      `M ${frontTopX} ${topY} ` +
      `A ${Math.abs(s.r1)} ${Math.abs(s.r1)} 0 0 0 ${frontBottomX} ${bottomY} ` +
      `L ${backBottomX} ${bottomY} ` +
      `A ${Math.abs(s.r2)} ${Math.abs(s.r2)} 0 0 ${sweepBack} ${backTopX} ${topY} Z`;

    const xs = [frontTopX, frontBottomX, backTopX, backBottomX];
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);

    // Padding in millimetres: the box must hold the figures the dimensions
    // print, so the top pad clears the edge-thickness label and the right pad
    // clears both numbers.
    const padY = height * 0.17;
    const padX = height * 0.14;

    const box = {
      x: minX - padX,
      y: topY - padY,
      w: maxX - minX + padX * 2,
      h: height + padY * 2,
    };

    return {
      path,
      box,
      topY,
      bottomY,
      height,
      minX,
      maxX,
      frontTopX,
      backTopX,
      frontApexZ: s.frontApexZ,
      backApexZ: s.backApexZ,
      centreX: (s.frontApexZ + s.backApexZ) / 2,
      et: Math.max(s.edgeTop, s.edgeBottom),
      ct: result.ct,
    };
  }, [result]);

  if (!draw) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <p className="cross-label" style={{ color: 'inherit' }}>
          {result.errorMessage ?? 'No section to draw'}
        </p>
      </div>
    );
  }

  const { box, height } = draw;
  const u = height; // the drawing's own unit: one frame height
  const hair = u * 0.0022;
  const outline = u * 0.0062;
  const fontSize = u * 0.072;

  // The two dimensions are read at the rim and at the centre, and both are
  // printed to the right of the line they measure.
  const etY = draw.topY - u * 0.05;
  const ctY = -u * 0.075;
  const labelX = draw.maxX + u * 0.05;
  // The dimension line stops a little before the figure it belongs to.
  const etLineEnd = draw.backTopX + u * 0.02;

  const tick = (x: number, y: number) => (
    <line
      x1={x}
      y1={y - u * 0.018}
      x2={x}
      y2={y + u * 0.018}
      stroke="currentColor"
      strokeWidth={hair * 1.4}
    />
  );

  return (
    <svg
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={`Lens section: edge thickness ${result.et.toFixed(2)} millimetres, centre thickness ${result.ct.toFixed(2)} millimetres.`}
    >
      {/* The optical cross: the meridian through the optical centre, and the
          plane that centre sits in. */}
      <g opacity="0.3">
        <line
          x1={box.x}
          y1={0}
          x2={box.x + box.w}
          y2={0}
          stroke="currentColor"
          strokeWidth={hair}
          strokeDasharray={`${u * 0.03} ${u * 0.022}`}
        />
        <line
          x1={draw.centreX}
          y1={box.y}
          x2={draw.centreX}
          y2={box.y + box.h}
          stroke="currentColor"
          strokeWidth={hair}
          strokeDasharray={`${u * 0.03} ${u * 0.022}`}
        />
      </g>
      <circle cx={draw.centreX} cy={0} r={u * 0.008} fill="currentColor" />

      {/* The material. */}
      <path
        d={draw.path}
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth={outline}
        strokeLinejoin="round"
        key={draw.path}
        className="cross-redraw"
      />

      {dimensions && (
        <g stroke="currentColor" fill="currentColor">
          {/* Edge thickness, at the rim. */}
          <line
            x1={draw.frontTopX}
            y1={etY}
            x2={etLineEnd}
            y2={etY}
            strokeWidth={hair * 1.4}
          />
          {tick(draw.frontTopX, etY)}
          {tick(etLineEnd, etY)}
          <text
            x={labelX}
            y={etY}
            fontSize={fontSize}
            dominantBaseline="middle"
            stroke="none"
            style={{ fontFamily: "'Kode Mono Variable', ui-monospace, monospace" }}
          >
            {result.et.toFixed(2)} mm
          </text>

          {/* Centre thickness, between the two apexes. */}
          <line
            x1={draw.frontApexZ}
            y1={ctY}
            x2={draw.backApexZ + u * 0.02}
            y2={ctY}
            strokeWidth={hair * 1.4}
          />
          {tick(draw.frontApexZ, ctY)}
          {tick(draw.backApexZ + u * 0.02, ctY)}
          <text
            x={labelX}
            y={ctY}
            fontSize={fontSize}
            dominantBaseline="middle"
            stroke="none"
            style={{ fontFamily: "'Kode Mono Variable', ui-monospace, monospace" }}
          >
            {result.ct.toFixed(2)} mm
          </text>
        </g>
      )}
    </svg>
  );
}

/**
 * The front elevation: the frame opening, and the pupil inside it.
 *
 * The opening is A by B with the bridge between the lenses. The pupil sits
 * where the fitting puts it, and the distance between the pupil and the middle
 * of the opening is the decentration the section is cut through — which is why
 * this drawing belongs beside the section and not in a gallery.
 */
export function CrossElevation({
  a,
  b,
  dbl,
  decentration = 0,
  className = '',
}: {
  a: number;
  b: number;
  dbl: number;
  decentration?: number;
  className?: string;
}) {
  const unit = Math.max(a, b);
  const pad = unit * 0.06;
  const gap = dbl;
  const boxW = a * 2 + gap + pad * 2;
  const boxH = b + pad * 2.1;

  const hair = unit * 0.0034;
  const rimW = unit * 0.0062;
  const r = Math.min(a, b) * 0.07;

  const rim = (x: number) => (
    <rect
      x={x}
      y={pad}
      width={a}
      height={b}
      rx={r}
      fill="none"
      stroke="currentColor"
      strokeWidth={rimW}
    />
  );

  const pupilY = pad + b / 2;
  const leftCentre = pad + a / 2;
  const rightCentre = pad + a + gap + a / 2;
  const leftPupil = leftCentre + decentration;
  const rightPupil = rightCentre - decentration;

  const diamond = (x: number) =>
    `M ${x} ${pupilY - unit * 0.055} L ${x + unit * 0.055} ${pupilY} L ${x} ${pupilY + unit * 0.055} L ${x - unit * 0.055} ${pupilY} Z`;

  return (
    <svg
      viewBox={`0 0 ${boxW} ${boxH}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={`Frame elevation: opening ${a} by ${b} millimetres, bridge ${dbl} millimetres, pupil offset ${decentration.toFixed(1)} millimetres from the centre of the opening.`}
    >
      {rim(pad)}
      {rim(pad + a + gap)}

      {/* The bridge. */}
      <line
        x1={pad + a}
        y1={pupilY}
        x2={pad + a + gap}
        y2={pupilY}
        stroke="currentColor"
        strokeWidth={hair}
        opacity="0.65"
      />

      {/* The centre each opening is drawn from. */}
      <g fill="none" stroke="currentColor" strokeWidth={hair}>
        <line
          x1={leftCentre}
          y1={pad}
          x2={leftCentre}
          y2={pad + b}
          strokeDasharray={`${hair * 4} ${hair * 4}`}
          opacity="0.5"
        />
        <line
          x1={rightCentre}
          y1={pad}
          x2={rightCentre}
          y2={pad + b}
          strokeDasharray={`${hair * 4} ${hair * 4}`}
          opacity="0.5"
        />
      </g>

      {/* The pupils, and the offset between each pupil and its centre. */}
      <g fill="currentColor">
        <path d={diamond(leftPupil)} />
        <path d={diamond(rightPupil)} />
      </g>
      <g stroke="currentColor" strokeWidth={hair} opacity="0.8">
        <line x1={leftCentre} y1={pupilY} x2={leftPupil} y2={pupilY} />
        <line x1={rightCentre} y1={pupilY} x2={rightPupil} y2={pupilY} />
      </g>

    </svg>
  );
}
