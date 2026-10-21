import React, { useMemo, useState } from 'react';
import { translations } from '../../lib/translations';
import { VisualizerProps, LensPosition, CaliperTarget } from './types';
import { LensProfile } from './LensProfile';
import { FrameProfile } from './FrameProfile';
import { FrontView } from './FrontView';
import { TopDownView } from './TopDownView';
import { EdgeDetail } from './EdgeDetail';
import { SheetDefs } from './SheetDefs';
import { CompareLegend } from './CompareLegend';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useElementSize } from '../../hooks/useElementWidth';
import { sheetGeometry, SHEET, CHAR_WIDTH, frontViewBox } from './sheet';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

type CaliperRow = {
  id: Exclude<CaliperTarget, null>;
  name: string;
  /** The short name, for the sheet's narrow row. */
  short: string;
  /** The value with its unit. */
  value: string;
  /** The value on its own, for the narrow row where the unit does not fit. */
  number: string;
  compareValue?: string;
  /** The threshold, with its unit. */
  limit: string;
  /** The threshold on its own, for the narrow row. */
  limitShort: string;
  ok: boolean;
  note: string;
};

/**
 * The sheet's proportions live in ./sheet, so the spherical board and the
 * aspheric board are cut from the same pattern.
 */

/**
 * The drawing board.
 *
 * A lab sheet, not a dashboard: one wide drawing strip — the section, the edge
 * magnified as a detail callout, and the front elevation — and beneath it the
 * schedule of what the drawing measures, with each dimension's tolerance. A
 * dimension on the drawing and its row in the schedule light up together.
 */
export const Visualizer: React.FC<VisualizerProps> = React.memo(
  ({
    lens,
    frame,
    patient,
    result,
    compareResult,
    compareLens,
    lang,
    view,
    highlightedLimit = null,
    bevelPercent = 0.33,
    variant = 'classic',
    onViewChange,
  }) => {
    const t = translations[lang];
    const [target, setTarget] = useState<CaliperTarget>(null);
    const sheet = SHEET[variant];
    const { ref: boardRef, width, height } = useElementSize<HTMLDivElement>();

    const primaryPos = useMemo<LensPosition>(() => {
      const groovePosition = frame.depth * bevelPercent;
      const etX_start = groovePosition - result.et / 2;
      const etX_end = groovePosition + result.et / 2;
      const grooveX = groovePosition;
      const frontApexX = etX_start - result.s1;
      const backApexX = frontApexX + result.ct;
      return { etX_start, etX_end, grooveX, frontApexX, backApexX };
    }, [result, frame.depth, bevelPercent]);

    const comparePos = useMemo<LensPosition | null>(() => {
      if (!compareResult) return null;
      const groovePosition = frame.depth * bevelPercent;
      const etX_start = groovePosition - compareResult.et / 2;
      const etX_end = groovePosition + compareResult.et / 2;
      const grooveX = groovePosition;
      const frontApexX = etX_start - compareResult.s1;
      const backApexX = frontApexX + compareResult.ct;
      return { etX_start, etX_end, grooveX, frontApexX, backApexX };
    }, [compareResult, frame.depth, bevelPercent]);

    const mm = (v: number) => `${v.toFixed(2)} mm`;

    // In compare mode each caliper also reports the comparison material, so the
    // schedule under the drawing becomes the comparison table. The delta is
    // stated next to it: the numbers are what the drawing cannot show at scale.
    // The comparison value only: the delta is stated in the legend and again on
    // the edge detail, and repeating it here made the value line wrap, which
    // cost the drawing 25px of height.
    const against = (compareValue: number) => compareValue.toFixed(2);

    const calipers: CaliperRow[] = [
      {
        id: 'ct',
        name: t.center,
        short: t.shortCalCenter,
        value: mm(result.ct),
        number: result.ct.toFixed(2),
        compareValue: compareResult ? against(compareResult.ct) : undefined,
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
        compareValue: compareResult ? against(compareResult.et) : undefined,
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
        compareValue: compareResult ? against(compareResult.anteriorProtrusion) : undefined,
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
        compareValue: compareResult ? against(compareResult.posteriorProtrusion) : undefined,
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

    const active = calipers.find((c) => c.id === target) ?? null;

    // On a phone the three drawings cannot sit side by side legibly, so the
    // board shows the section and the edge detail; the front elevation has its
    // own view. The scale is the same, so the numbers still hold.
    const compact = useMediaQuery('(max-width: 767px)');

    // Three drawings at three scales, as a lab sheet sets them: the section for
    // thickness, the edge magnified as a detail, the elevation for the frame.
    // The detail is magnified further in compare mode, because that is where
    // the difference between two indices is a shape and not just a number.
    const S = 6;
    const comparing = Boolean(compareResult);
    // The detail is magnified until it is as tall as the section, and no
    // further: the board is height-bound, so a taller detail would only shrink
    // the whole sheet back down again.
    const detailZoom = comparing ? 14 : 13;

    const minX = -Math.max(result.anteriorProtrusion, compareResult?.anteriorProtrusion ?? 0);
    const maxX = Math.max(
      frame.depth + result.posteriorProtrusion,
      frame.depth + (compareResult?.posteriorProtrusion ?? 0),
      1,
    );
    const sectionW = (maxX - minX) * S;
    // The section's true drawn height: the lens spans B, and the rim is a 5mm
    // band above and below it (FrameProfile draws it at 5 * scale each side).
    // Declaring anything less lets the rim overflow the board; declaring more
    // wastes the height the board is already short of.
    const sectionH = (frame.b + 10) * S;

    const detailW = (maxX - minX) * detailZoom;
    // The detail's real height: the rim band is drawn at 5 * zoom above and
    // below the centre line, at 1.8 bands — not the nominal 7.5 the old figure
    // assumed, which both over-declared the board and let the drawing overrun.
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

    const viewTitle =
      view === 'side' ? t.crossSection : view === 'top' ? t.topDown : t.frontView;

    // The center thickness is measured across the lens, which sits close to
    // the sheet's left edge. Its value is kept inside the sheet: centred on
    // the line where it fits, and at the line's start where it does not.
    const ctText = `CT ${result.ct.toFixed(2)}`;
    const ctHalf = (ctText.length * CHAR_WIDTH) / 2;
    const ctCentre = originX + ((primaryPos.frontApexX + primaryPos.backApexX) / 2) * S;
    const ctLabel =
      ctCentre - ctHalf >= 4
        ? { x: ctCentre, anchor: 'middle' as const }
        : { x: originX + primaryPos.frontApexX * S + 6, anchor: 'start' as const };

    const pick = (next: Exclude<CaliperTarget, null>) =>
      setTarget((current) => (current === next ? null : next));

    return (
      <div
        data-ui
        ref={boardRef}
        className="flex h-full min-h-[340px] w-full flex-col overflow-hidden rounded-sm bg-sheet-stage"
      >
        {/* The sheet's header says what the sheet has to say beyond the
            drawing itself: the drawing switcher, the comparison, or the
            view's own name. On the workbench it is only there when there is
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

            {compareResult && view !== 'front' && variant === 'classic' && (
              <CompareLegend
                lang={lang}
                index={lens.index}
                compareIndex={compareLens?.index ?? null}
                result={result}
                compareResult={compareResult}
              />
            )}
            {variant === 'classic' && !(compareResult && view !== 'front') && (
              <p className="text-[13px] text-sheet-muted">
                {compareResult && view === 'front' ? t.compareFrontNote : t.scaleNote}
              </p>
            )}
          </div>
        )}

        {/* The drawing strip. It keeps a floor of its own so the schedule
            below can never squeeze it to a sliver on a short screen. */}
        <div className="min-h-[200px] flex-1">
          <svg
            width="100%"
            height="100%"
            viewBox={
              view === 'side'
                ? `0 0 ${BOARD_W} ${BOARD_H}`
                : view === 'front'
                  ? // The A dimension is drawn above the opening, and the rim
                    // above that, so the view needs headroom the old box did not
                    // allow: the label was clipped by the sheet's own edge. The
                    // view's own name sits below the rim, which needs the same
                    // allowance at the foot.
                    (() => {
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

            {view === 'side' ? (
              <>
                <FrameProfile
                  frame={frame}
                  result={result}
                  pos={primaryPos}
                  scale={S}
                  originX={originX}
                  originY={originY}
                  lang={lang}
                  activeTarget={target}
                  onSelectTarget={(next) => setTarget(next as CaliperTarget)}
                />

                <LensProfile
                  result={result}
                  pos={primaryPos}
                  scale={S}
                  originX={originX}
                  originY={originY}
                  frameB={frame.b}
                  tone="primary"
                  active={target === 'et' || target === 'ct'}
                />

                {/* The comparison is drawn above the primary: its outline is
                    unfilled, so it stays legible wherever it crosses the
                    primary's fill. Drawing it first would bury it. */}
                {compareResult && compareLens && comparePos && (
                  <LensProfile
                    result={compareResult}
                    pos={comparePos}
                    scale={S}
                    originX={originX}
                    originY={originY}
                    frameB={frame.b}
                    tone="compare"
                  />
                )}

                {/* CT across the lens. The value sits above the line, and when
                    the line is too close to the sheet's edge for the value to
                    fit, the value moves to the line's start rather than off
                    the sheet. */}
                <g
                  className={`cursor-help ${target === 'ct' ? 'text-sheet-warning' : 'text-sheet-ink'}`}
                  onMouseEnter={() => setTarget('ct')}
                  onMouseLeave={() => setTarget(null)}
                  onClick={() => pick('ct')}
                >
                  <line
                    x1={originX + primaryPos.frontApexX * S}
                    y1={originY - (frame.b / 2) * S * 0.55}
                    x2={originX + primaryPos.backApexX * S}
                    y2={originY - (frame.b / 2) * S * 0.55}
                    stroke="currentColor"
                    strokeWidth={target === 'ct' ? 2 : 1.4}
                    markerStart="url(#sheet-arrow)"
                    markerEnd="url(#sheet-arrow)"
                  />
                  <text
                    x={ctLabel.x}
                    y={originY - (frame.b / 2) * S * 0.55 - 8}
                    textAnchor={ctLabel.anchor}
                    fill="currentColor"
                    fontSize={16}
                    fontWeight={600}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    CT {result.ct.toFixed(2)}
                  </text>
                </g>

                <EdgeDetail
                  frame={frame}
                  result={result}
                  pos={primaryPos}
                  lang={lang}
                  zoom={detailZoom}
                  originX={detailOriginX}
                  originY={originY}
                  activeTarget={target}
                  onSelectTarget={(next) => setTarget(next as CaliperTarget)}
                  compareResult={compareResult}
                  comparePos={comparePos}
                />

                {showFront && (
                  <FrontView
                    frame={frame}
                    patient={patient}
                    result={result}
                    lang={lang}
                    scale={frontScale}
                    originX={frontOriginX}
                    originY={frontOriginY}
                    highlightedLimit={highlightedLimit}
                  />
                )}

                {/* Each drawing names itself, as a sheet's views do. The names
                    are clamped inside the board: a longer translation (the
                    Indonesian "Tampilan Potongan Melintang") would otherwise
                    run off the left edge of the sheet. */}
                <g className="text-sheet-muted" fill="currentColor" fontSize={16}>
                  {[
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
                  ].map((label) => {
                    const half = (label.text.length * CHAR_WIDTH) / 2;
                    const x = Math.min(Math.max(label.x, half + 4), BOARD_W - half - 4);
                    return (
                      <text key={label.text} x={x} y={BOARD_H - sheet.nameY} textAnchor="middle">
                        {label.text}
                      </text>
                    );
                  })}
                </g>
              </>
            ) : view === 'front' ? (
              <FrontView
                frame={frame}
                patient={patient}
                result={result}
                lang={lang}
                scale={S}
                originX={PAD + (frame.a + frame.dbl) * S}
                originY={PAD + DIM_BAND + (frame.b * S) / 2}
                isMain
                highlightedLimit={highlightedLimit}
              />
            ) : (
              <TopDownView
                lens={lens}
                frame={frame}
                patient={patient}
                result={result}
                compareResult={compareResult}
                compareLens={compareLens}
                lang={lang}
                scale={S}
                centerX={(frame.a + frame.dbl / 2) * S + 50}
                centerY={(frame.depth + 6) * S}
                primaryPos={primaryPos}
                comparePos={comparePos}
                highlightedLimit={highlightedLimit}
              />
            )}
          </svg>
        </div>

        {/* The schedule: what the drawing measures, and its tolerance. */}
        <div className={`shrink-0 px-2 ${variant === 'classic' ? 'pb-2' : 'pb-1.5'}`}>
          <div
            className={`grid gap-px bg-sheet-stage ${
              compact ? 'grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            }`}
          >
            {calipers.map((row, index) => {
              const isActive = target === row.id;
              return (
                <button
                  key={row.id}
                  type="button"
                  onMouseEnter={() => setTarget(row.id)}
                  onMouseLeave={() => setTarget(null)}
                  onFocus={() => setTarget(row.id)}
                  onBlur={() => setTarget(null)}
                  onClick={() => pick(row.id)}
                  aria-pressed={isActive}
                  className={`sheet-rise delay-${index + 1} flex flex-col gap-0.5 text-left transition-colors duration-150 ${
                    compact
                      ? 'px-1 py-1'
                      : variant === 'classic'
                        ? 'px-3 py-2'
                        : 'px-3 py-1'
                  } ${
                    isActive ? 'bg-sheet-ground' : 'bg-sheet-panel hover:bg-sheet-info'
                  }`}
                >
                  {/* On a narrow sheet the row is two lines: the caliper's name
                      above, the value below. Every line the schedule takes is
                      a line the drawing does not get, and the thresholds are
                      in the table under the sheet. */}
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
                        <span
                          className={`font-medium text-sheet-ink tnum ${
                            variant === 'classic' ? 'text-[20px]' : 'text-[18px]'
                          }`}
                        >
                          {row.value}
                        </span>
                        {row.compareValue && (
                          <span className="text-[13px] text-sheet-muted tnum">
                            → {row.compareValue}
                          </span>
                        )}
                      </span>
                      <span
                        className={`leading-tight tnum ${
                          row.ok ? 'text-sheet-muted' : 'text-sheet-warning'
                        } ${variant === 'classic' ? 'text-[13px]' : 'text-[12px]'}`}
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
          {variant === 'classic' ? (
            <p
              key={active ? active.id : 'hint'}
              className={`caliper-snap mt-2 min-h-[20px] px-1 text-[13px] leading-snug ${
                active ? 'text-sheet-ink' : 'text-sheet-muted'
              }`}
            >
              {active ? active.note : t.caliperHint}
            </p>
          ) : (
            <div className="mt-1.5 flex min-h-[20px] items-baseline justify-between gap-4 px-1">
              <p
                key={active ? active.id : 'hint'}
                className={`caliper-snap text-[13px] leading-snug ${
                  active ? 'text-sheet-ink' : 'text-sheet-muted'
                } ${compact ? 'line-clamp-1' : ''}`}
              >
                {active ? active.note : t.caliperHint}
              </p>
              {compareResult && view !== 'front' ? (
                <CompareLegend
                  lang={lang}
                  index={lens.index}
                  compareIndex={compareLens?.index ?? null}
                  result={result}
                  compareResult={compareResult}
                />
              ) : !compact ? (
                <p className="shrink-0 whitespace-nowrap text-[13px] text-sheet-muted">
                  {view === 'side'
                    ? t.sheetScaleNote
                        .replace('{s}', String(S))
                        .replace('{f}', String(frontScale))
                    : t.sheetScaleSingle.replace('{s}', String(S))}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.lens === nextProps.lens &&
      prevProps.frame === nextProps.frame &&
      prevProps.patient === nextProps.patient &&
      prevProps.result === nextProps.result &&
      prevProps.compareResult === nextProps.compareResult &&
      prevProps.compareLens === nextProps.compareLens &&
      prevProps.lang === nextProps.lang &&
      prevProps.view === nextProps.view &&
      prevProps.highlightedLimit === nextProps.highlightedLimit &&
      prevProps.frameType === nextProps.frameType &&
      prevProps.bevelPercent === nextProps.bevelPercent &&
      prevProps.variant === nextProps.variant &&
      prevProps.onViewChange === nextProps.onViewChange
    );
  },
);
