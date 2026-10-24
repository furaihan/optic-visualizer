import React, { useMemo, useState } from 'react';
import { translations, Language } from '../lib/translations';
import { getAsphericSag } from '../lib/optic-engine/aspheric';
import {
  AsphericLensParameters,
  AsphericCalculationResult,
  FrameParameters,
  PatientParameters,
  FrameType,
} from '../lib/optic-engine/types';
import { FrameProfile } from './Visualizer/FrameProfile';
import { FrontView } from './Visualizer/FrontView';
import { TopDownView } from './Visualizer/TopDownView';
import { EdgeDetail } from './Visualizer/EdgeDetail';
import { SheetDefs } from './Visualizer/SheetDefs';
import { sheetGeometry, SHEET, CHAR_WIDTH, frontViewBox } from './Visualizer/sheet';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useElementSize } from '../hooks/useElementWidth';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface LensPosition {
  etX_start: number;
  etX_end: number;
  grooveX: number;
  frontApexX: number;
  backApexX: number;
}

interface AsphericVisualizerProps {
  lens: AsphericLensParameters;
  frame: FrameParameters;
  patient: PatientParameters;
  result: AsphericCalculationResult;
  lang: Language;
  view: 'side' | 'top' | 'front';
  frameType?: FrameType;
  highlightedLimit?: 'a' | 'b' | 'dbl' | 'ed' | null;
  /** Bevel position as a share of frame depth, for the groove caliper. */
  bevelPercent?: number;
  /** The sheet's proportions. The landing page does not draw this board. */
  variant?: 'classic' | 'workbench';
  /** The drawing switcher, when the page carries it on the drawing itself. */
  onViewChange?: (view: 'side' | 'top' | 'front') => void;
}

/**
 * The aspheric surface, sampled into a real path.
 *
 * z(y) = y²/R / (1 + √(1 − (1+K)y²/R²)) + A₂y² + A₄y⁴ + A₆y⁶ + A₈y⁸
 * The sphere is the fallback when a surface is switched off, so the drawing
 * always shows what the engine actually computed.
 */
function asphericPath(
  r1: number,
  r2: number,
  radiusTop: number,
  radiusBottom: number,
  ocY: number,
  front: { conic: number; A2: number; A4: number; A6: number; A8: number },
  back: { conic: number; A2: number; A4: number; A6: number; A8: number },
  scale: number,
  frontApexX: number,
  backApexX: number,
): string {
  const steps = 48;
  const frontPoints: string[] = [];
  const backPoints: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const y = -radiusTop + (radiusTop + radiusBottom) * (i / steps);
    const frontSag = asphericSag(r1, y, front.conic, front);
    const backSag = asphericSag(r2, y, back.conic, back);
    const sy = (-ocY + y) * scale;
    frontPoints.push(`${(frontApexX + frontSag) * scale} ${sy}`);
    backPoints.push(`${(backApexX + backSag) * scale} ${sy}`);
  }

  // The front surface from the top of the opening down, then the back surface
  // from the bottom back up, closed by the two edge faces.
  return `M ${frontPoints.join(' L ')} L ${backPoints.reverse().join(' L ')} Z`;
}

/**
 * The surface offset of an aspheric surface at the radius y.
 *
 * The radius is signed, so the surface stands behind its vertex when the
 * radius is positive and in front of it when the radius is negative, which
 * is what puts the rim of a convex back surface in the right place.
 */
function asphericSag(
  R: number,
  y: number,
  conic: number,
  coeffs: { A2: number; A4: number; A6: number; A8: number },
): number {
  if (!Number.isFinite(R)) return 0;
  return getAsphericSag(R, y, conic, coeffs);
}

/**
 * The aspheric workbench's drawing: the same sheet language as the spherical
 * one — the section, the edge magnified as a detail, the front elevation, and
 * the schedule of what the drawing measures — with the aspheric surface drawn
 * from its conic and coefficients.
 */
export const AsphericVisualizer: React.FC<AsphericVisualizerProps> = React.memo(
  ({
    lens,
    frame,
    patient,
    result,
    lang,
    view,
    highlightedLimit = null,
    bevelPercent = 0.33,
    variant = 'workbench',
    onViewChange,
  }) => {
    const t = translations[lang];
    const compact = useMediaQuery('(max-width: 767px)');
    const sheet = SHEET[variant];
    const { ref: boardRef, width, height } = useElementSize<HTMLDivElement>();
    const [target, setTarget] = useState<string | null>(null);

    const primaryPos = useMemo<LensPosition>(() => {
      // The lens sits in the bevel groove, exactly as it does on the
      // spherical sheet: the groove is at the same place on both boards, and
      // the edge is centred on it.
      const grooveX = frame.depth * bevelPercent;
      const etX_start = grooveX - result.et / 2;
      const etX_end = grooveX + result.et / 2;
      const frontApexX = result.section ? result.section.frontApexZ : etX_start - result.s1;
      const backApexX = result.section ? result.section.backApexZ : frontApexX + result.ct;
      return { etX_start, etX_end, grooveX, frontApexX, backApexX };
    }, [result, frame.depth, bevelPercent]);

    const S = 6;
    const detailZoom = 13;

    const halfHeight = (frame.b / 2) * S;
    const minX = -result.anteriorProtrusion;
    const maxX = frame.depth + result.posteriorProtrusion;
    const sectionW = (maxX - minX) * S;
    const sectionH = (frame.b + 10) * S;

    const detailW = (maxX - minX) * detailZoom;
    const detailH = 18 * detailZoom;

    const geo = sheetGeometry({
      variant,
      sectionW,
      sectionH,
      detailW,
      detailH,
      frontW1: frame.a * 2 + frame.dbl,
      frontH1: frame.b + 8,
      inset: Math.abs(minX) * S,
      detailInset: Math.abs(minX) * detailZoom,
      frontInset1: frame.a + frame.dbl,
      compact,
      canvasW: width,
      canvasH: height,
    });

    // The elevation is drawn at the magnification that fills the sheet, and it
    // gives up its place on the strip when no magnification fits.
    const frontScale = geo.frontScale ?? 2;
    const showFront = geo.frontScale !== null;

    const PAD = geo.pad;
    const DIM_BAND = geo.dimBand;
    const BOARD_W = geo.width;
    const BOARD_H = geo.height;
    const originX = geo.originX;
    const originY = geo.originY;
    const detailOriginX = geo.detailOriginX;
    const frontOriginX = geo.frontOriginX;
    const frontOriginY = originY;

    const { etX_start, etX_end } = primaryPos;

    // The section is the vertical meridian through the optical centre, drawn
    // from the engine's own geometry so that the shape on the board and the
    // numbers in the schedule are the same measurement.
    const section = result.section;
    const radiusTop = section ? section.radiusTop : frame.b / 2;
    const radiusBottom = section ? section.radiusBottom : frame.b / 2;
    const ocY = section ? section.ocY : patient.fittingHeight - frame.b / 2;

    const frontSurface = lens.asphericFront.isActive
      ? lens.asphericFront
      : { conic: 0, A2: 0, A4: 0, A6: 0, A8: 0 };
    const backSurface = lens.asphericBack.isActive
      ? lens.asphericBack
      : { conic: 0, A2: 0, A4: 0, A6: 0, A8: 0 };

    const lensPath = asphericPath(
      result.r1,
      section ? section.r2 : result.r2,
      radiusTop,
      radiusBottom,
      ocY,
      frontSurface,
      backSurface,
      S,
      primaryPos.frontApexX,
      primaryPos.backApexX,
    );

    const viewTitle =
      view === 'side' ? t.crossSection : view === 'top' ? t.topDown : t.frontView;

    // The center thickness is measured across the lens, which sits close to
    // the sheet's left edge. Its value is kept inside the sheet: centred on
    // the line where it fits, and at the line's start where it does not.
    const ctText = `CT ${result.ct.toFixed(2)}`;
    const ctHalf = (ctText.length * CHAR_WIDTH) / 2;
    const ctCentre = ((primaryPos.frontApexX + primaryPos.backApexX) / 2) * S;
    const ctLabel =
      ctCentre - ctHalf >= 4
        ? { x: ctCentre, anchor: 'middle' as const }
        : { x: primaryPos.frontApexX * S + 6, anchor: 'start' as const };

    const mm = (v: number) => `${v.toFixed(2)} mm`;

    // The schedule: what the drawing measures, and its tolerance. The same
    // calipers as the spherical sheet, so the two sheets can be read against
    // each other.
    const calipers = [
      {
        id: 'ct',
        name: t.center,
        short: t.shortCalCenter,
        value: mm(result.ct),
        number: result.ct.toFixed(2),
        limit: '≥ 1.00 mm',
        limitShort: '≥1.00',
        ok: result.ct >= 1,
        note: t.caliperCt,
      },
      {
        id: 'et',
        name: t.edgeThick,
        short: t.shortCalEdge,
        value: mm(result.et),
        number: result.et.toFixed(2),
        limit: '≤ 6.00 mm',
        limitShort: '≤6.00',
        ok: result.et <= 6,
        note: t.caliperEt,
      },
      {
        id: 'anterior',
        name: t.anteriorProt,
        short: t.shortCalAnterior,
        value: mm(result.anteriorProtrusion),
        number: result.anteriorProtrusion.toFixed(2),
        limit: '≤ 1.50 mm',
        limitShort: '≤1.50',
        ok: result.anteriorProtrusion <= 1.5,
        note: t.caliperAnterior,
      },
      {
        id: 'posterior',
        name: t.posteriorProt,
        short: t.shortCalPosterior,
        value: mm(result.posteriorProtrusion),
        number: result.posteriorProtrusion.toFixed(2),
        limit: '≤ 2.00 mm',
        limitShort: '≤2.00',
        ok: result.posteriorProtrusion <= 2,
        note: t.caliperPosterior,
      },
      {
        id: 'groove',
        name: t.groove,
        short: t.shortCalGroove,
        value: `${Math.round(bevelPercent * 100)}%`,
        number: `${Math.round(bevelPercent * 100)}%`,
        limit: '0–100%',
        limitShort: '0–100',
        ok: true,
        note: t.caliperGroove,
      },
    ];

    const displayedCalipers = result.error ? [] : calipers;

    const active = displayedCalipers.find((c) => c.id === target) ?? null;

    // The aspheric surfaces are named on the drawing itself, and their
    // controls are in the inspector, so the sheet does not repeat them.

    return (
      <div
        data-ui
        ref={boardRef}
        className="flex h-full min-h-[320px] w-full flex-col overflow-hidden rounded-sm bg-sheet-stage"
      >
        {/* The sheet's header says what the sheet has to say beyond the
            drawing itself. On the workbench it is only there when there is
            something to say — every row it takes is a row the drawing does
            not get. */}
        {(variant === 'classic' || onViewChange || view !== 'side') && (
          <div
            className={`flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 ${
              compact ? 'px-3 py-1' : 'px-4 pt-3'
            }`}
          >
            {onViewChange ? (
              <Tabs
                value={view}
                onValueChange={(v) => onViewChange(v as 'side' | 'top' | 'front')}
              >
                <TabsList
                  className={`gap-0 rounded-sm bg-sheet-panel p-0.5 ${
                    compact ? 'h-7' : 'h-8'
                  }`}
                >
                  <TabsTrigger
                    value="side"
                    className="h-full rounded-sm px-2 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
                  >
                    {t.sideProfile}
                  </TabsTrigger>
                  <TabsTrigger
                    value="top"
                    className="h-full rounded-sm px-2 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
                  >
                    {t.topDown}
                  </TabsTrigger>
                  <TabsTrigger
                    value="front"
                    className="h-full rounded-sm px-2 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
                  >
                    {t.frontView}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            ) : (
              <h2 className="text-[13px] font-medium text-sheet-ink">{viewTitle}</h2>
            )}

            {variant === 'classic' && (
              <p className="text-[13px] text-sheet-muted">{t.scaleNote}</p>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1">
          <svg
            width="100%"
            height="100%"
            viewBox={
              view === 'side'
                ? `0 0 ${BOARD_W} ${BOARD_H}`
                : view === 'front'
                  ? (() => {
                      const box = frontViewBox(frame, S, PAD, DIM_BAND);
                      return `${box.x} ${box.y} ${box.width} ${box.height}`;
                    })()
                  : `0 0 ${(frame.a * 2 + frame.dbl) * S + 120} ${(frame.depth + 10) * S + 150}`
            }
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`${viewTitle}. ${t.visualSim}`}
          >
            <SheetDefs />

            {result.error ? (
              <g className="text-sheet-warning">
                <text x={BOARD_W / 2} y={BOARD_H / 2} textAnchor="middle" fontSize={18}>
                  {result.errorMessage ?? t.invalidInput}
                </text>
              </g>
            ) : view === 'side' ? (
              <>
                <FrameProfile
                  frame={frame}
                  result={result as any}
                  pos={primaryPos}
                  scale={S}
                  originX={originX}
                  originY={originY}
                  lang={lang}
                  activeTarget={target}
                  onSelectTarget={(next) => setTarget(next)}
                />

                {/* The aspheric section itself. */}
                <g transform={`translate(${originX}, ${originY})`}>
                  <path
                    key={`${result.ct}-${result.et}-${result.s1}-${result.s2}`}
                    d={lensPath}
                    className="text-sheet-accent section-redraw"
                    fill="currentColor"
                    fillOpacity={0.16}
                    stroke="currentColor"
                    strokeWidth={2}
                  />

                  {/* Which surfaces are aspheric, and their conic constant. */}
                  {lens.asphericFront.isActive && (
                    <text
                      x={etX_start * S}
                      y={-halfHeight - 10}
                      textAnchor="middle"
                      className="text-sheet-accent"
                      fill="currentColor"
                      fontSize={16}
                      fontWeight={600}
                    >
                      ASPH K {lens.asphericFront.conic.toFixed(2)}
                    </text>
                  )}
                  {lens.asphericBack.isActive && (
                    <text
                      x={etX_end * S}
                      y={-halfHeight - 10}
                      textAnchor="middle"
                      className="text-sheet-accent"
                      fill="currentColor"
                      fontSize={16}
                      fontWeight={600}
                    >
                      ASPH K {lens.asphericBack.conic.toFixed(2)}
                    </text>
                  )}

                  {/* CT across the lens. The value is kept inside the sheet:
                      centred on the line where it fits, at the line's start
                      where it does not. */}
                  <line
                    x1={primaryPos.frontApexX * S}
                    y1={-halfHeight * 0.55}
                    x2={primaryPos.backApexX * S}
                    y2={-halfHeight * 0.55}
                    className="text-sheet-ink"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    markerStart="url(#sheet-arrow)"
                    markerEnd="url(#sheet-arrow)"
                  />
                  <text
                    x={ctLabel.x}
                    y={-halfHeight * 0.55 - 8}
                    textAnchor={ctLabel.anchor}
                    className="text-sheet-ink"
                    fill="currentColor"
                    fontSize={16}
                    fontWeight={600}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    CT {result.ct.toFixed(2)}
                  </text>

                  {/* ET across the edge. */}
                  <line
                    x1={primaryPos.etX_start * S}
                    y1={halfHeight * 0.55}
                    x2={primaryPos.etX_end * S}
                    y2={halfHeight * 0.55}
                    className="text-sheet-ink"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    markerStart="url(#sheet-arrow)"
                    markerEnd="url(#sheet-arrow)"
                  />
                  <text
                    x={((primaryPos.etX_start + primaryPos.etX_end) / 2) * S + 14}
                    y={halfHeight * 0.55 + 4}
                    textAnchor="start"
                    className="text-sheet-ink"
                    fill="currentColor"
                    fontSize={16}
                    fontWeight={600}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    ET {result.et.toFixed(2)}
                  </text>
                </g>

                {/* The edge, magnified: the same detail callout the spherical
                    sheet carries, so the two can be read against each other. */}
                <EdgeDetail
                  frame={frame}
                  result={result as any}
                  pos={primaryPos}
                  lang={lang}
                  zoom={detailZoom}
                  originX={detailOriginX}
                  originY={originY}
                  activeTarget={target}
                  onSelectTarget={(next) => setTarget(next)}
                />

                {showFront && (
                  <FrontView
                    frame={frame}
                    patient={patient}
                    result={result as any}
                    lang={lang}
                    scale={frontScale}
                    originX={frontOriginX}
                    originY={frontOriginY}
                    highlightedLimit={highlightedLimit}
                  />
                )}

                <g className="text-sheet-muted" fill="currentColor" fontSize={16}>
                  {(() => {
                    // The names of the views, clamped inside the board. On a
                    // narrow board there is not room for all three, and a name
                    // printed on top of another is worse than a name left out.
                    const placed: { text: string; x: number; half: number }[] = [];
                    for (const label of [
                      {
                        text: variant === 'classic' ? t.crossSection : t.shortCrossSection,
                        x: originX,
                      },
                      {
                        text: variant === 'classic' ? t.edgeDetail : t.shortEdgeDetail,
                        x: detailOriginX + detailW / 2,
                      },
                      ...(showFront
                        ? [
                            {
                              text: t.frontView,
                              x: frontOriginX + (frame.a * 2 + frame.dbl) * frontScale * 0.25,
                            },
                          ]
                        : []),
                    ]) {
                      const half = (label.text.length * CHAR_WIDTH) / 2;
                      const x = Math.min(Math.max(label.x, half + 4), BOARD_W - half - 4);
                      const clash = placed.some(
                        (p) => Math.abs(p.x - x) < p.half + half + 10,
                      );
                      if (clash) continue;
                      placed.push({ text: label.text, x, half });
                    }
                    return placed.map((label) => (
                      <text
                        key={label.text}
                        x={label.x}
                        y={BOARD_H - sheet.nameY}
                        textAnchor="middle"
                      >
                        {label.text}
                      </text>
                    ));
                  })()}
                </g>
              </>
            ) : view === 'front' ? (
              <FrontView
                frame={frame}
                patient={patient}
                result={result as any}
                lang={lang}
                scale={S}
                originX={PAD + (frame.a + frame.dbl) * S}
                originY={PAD + DIM_BAND + (frame.b * S) / 2 + 20}
                isMain
                highlightedLimit={highlightedLimit}
              />
            ) : (
              <TopDownView
                lens={lens as any}
                frame={frame}
                patient={patient}
                result={result as any}
                lang={lang}
                scale={S}
                centerX={(frame.a + frame.dbl / 2) * S + 50}
                centerY={(frame.depth + 6) * S}
                primaryPos={primaryPos}
                comparePos={null}
                highlightedLimit={highlightedLimit}
              />
            )}
          </svg>
        </div>

        {/* The schedule: what the drawing measures, and its tolerance, with the
            aspheric figures the engine produced below them. One grid, so the
            two rows read as one table. */}
        <div className="shrink-0 px-2 pb-1.5">
          <div
            className={`grid gap-px bg-sheet-stage ${
              compact ? 'grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            }`}
          >
            {displayedCalipers.map((row, index) => {
              const isActive = target === row.id;
              return (
                <button
                  key={row.id}
                  type="button"
                  onMouseEnter={() => setTarget(row.id)}
                  onMouseLeave={() => setTarget(null)}
                  onFocus={() => setTarget(row.id)}
                  onBlur={() => setTarget(null)}
                  onClick={() => setTarget(isActive ? null : row.id)}
                  aria-pressed={isActive}
                  className={`sheet-rise delay-${index + 1} flex flex-col gap-0.5 text-left transition-colors duration-150 ${
                    compact ? 'px-1 py-1' : 'px-3 py-1'
                  } ${
                    isActive ? 'bg-sheet-ground' : 'bg-sheet-panel hover:bg-sheet-info'
                  }`}
                >
                  {compact ? (
                    <>
                      <span className="text-[12px] leading-tight text-sheet-muted">
                        {row.short}
                      </span>
                      <span
                        className={`font-medium leading-tight tnum text-[16px] ${
                          row.ok ? 'text-sheet-ink' : 'text-sheet-warning'
                        }`}
                      >
                        {row.number}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[13px] leading-tight text-sheet-muted">
                        {row.name}
                      </span>
                      <span className="flex items-baseline gap-1.5 leading-tight">
                        <span className="text-[18px] font-medium text-sheet-ink tnum">
                          {row.value}
                        </span>
                      </span>
                      <span
                        className={`text-[12px] leading-tight tnum ${
                          row.ok ? 'text-sheet-muted' : 'text-sheet-warning'
                        }`}
                      >
                        {row.ok ? t.withinLimit : t.overLimit} · {row.limit}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* The caption row: the definition of whichever caliper is being
              read, and the scale the sheet is drawn at. */}
          <div className="mt-1.5 flex min-h-[20px] items-baseline justify-between gap-4 px-1">
            <p
              key={active ? active.id : 'hint'}
              className={`caliper-snap text-[13px] leading-snug ${
                active ? 'text-sheet-ink' : 'text-sheet-muted'
              } ${compact ? 'line-clamp-1' : ''}`}
            >
              {active ? active.note : t.caliperHint}
            </p>
            {variant === 'workbench' && !compact && (
              <p className="shrink-0 whitespace-nowrap text-[13px] text-sheet-muted">
                {view === 'side'
                  ? t.sheetScaleNote
                      .replace('{s}', String(S))
                      .replace('{f}', String(frontScale))
                  : t.sheetScaleSingle.replace('{s}', String(S))}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);
