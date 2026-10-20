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

type CaliperRow = {
  id: Exclude<CaliperTarget, null>;
  name: string;
  value: string;
  compareValue?: string;
  limit: string;
  ok: boolean;
  note: string;
};

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
  }) => {
    const t = translations[lang];
    const [target, setTarget] = useState<CaliperTarget>(null);

    const primaryPos = useMemo<LensPosition>(() => {
      const etX_start = -result.anteriorProtrusion + result.s1;
      const etX_end = etX_start + result.et;
      const grooveX = etX_start + result.et / 2;
      const frontApexX = -result.anteriorProtrusion;
      const backApexX = frontApexX + result.ct;
      return { etX_start, etX_end, grooveX, frontApexX, backApexX };
    }, [result]);

    const comparePos = useMemo<LensPosition | null>(() => {
      if (!compareResult) return null;
      const etX_start = -compareResult.anteriorProtrusion + compareResult.s1;
      const etX_end = etX_start + compareResult.et;
      const grooveX = etX_start + compareResult.et / 2;
      const frontApexX = -compareResult.anteriorProtrusion;
      const backApexX = frontApexX + compareResult.ct;
      return { etX_start, etX_end, grooveX, frontApexX, backApexX };
    }, [compareResult]);

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
        value: mm(result.ct),
        compareValue: compareResult ? against(compareResult.ct) : undefined,
        limit: '≥ 1.00',
        ok: result.ct >= 1,
        note: t.caliperCt,
      },
      {
        id: 'et',
        name: t.edgeThick,
        value: mm(result.et),
        compareValue: compareResult ? against(compareResult.et) : undefined,
        limit: '≤ 6.00',
        ok: result.et <= 6,
        note: t.caliperEt,
      },
      {
        id: 'anterior',
        name: t.anteriorProt,
        value: mm(result.anteriorProtrusion),
        compareValue: compareResult ? against(compareResult.anteriorProtrusion) : undefined,
        limit: '≤ 1.50',
        ok: result.anteriorProtrusion <= 1.5,
        note: t.caliperAnterior,
      },
      {
        id: 'posterior',
        name: t.posteriorProt,
        value: mm(result.posteriorProtrusion),
        compareValue: compareResult ? against(compareResult.posteriorProtrusion) : undefined,
        limit: '≤ 2.00',
        ok: result.posteriorProtrusion <= 2,
        note: t.caliperPosterior,
      },
      {
        id: 'groove',
        name: t.groove,
        value: `${Math.round(bevelPercent * 100)}%`,
        limit: '0–100',
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
    const frontScale = 2.6;

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

    const frontW = (frame.a * 2 + frame.dbl) * frontScale;
    const frontH = (frame.b + 8) * frontScale;

    const PAD = 24;
    const GAP = 44;
    // The bands above and below the drawing are sized to what is actually
    // drawn in them, not rounded up. The board is height-bound — 486 units of
    // canvas into ~350px — so every unit of slack here is taken straight out
    // of the type size: 60 units of margin is 60 units of smaller labels.
    // Above: the protrusion dimension and its value. Below: the groove
    // percentage and the view's own name.
    const DIM_BAND = 60;
    const LABEL_BAND = 46;

    const BOARD_W = compact
      ? PAD + sectionW + 26 + detailW + PAD
      : PAD + sectionW + GAP + detailW + GAP + frontW + PAD + 54;
    // The sheet is one screen tall where it can be: the board takes what is
    // left after the claim, the order and the schedule.
    const BOARD_H =
      Math.max(sectionH, detailH, compact ? 0 : frontH) + PAD + LABEL_BAND + DIM_BAND + 18;
    const originX = PAD + Math.abs(minX) * S;
    const originY = PAD + DIM_BAND + Math.max(sectionH, detailH, frontH) / 2;
    const detailOriginX = PAD + sectionW + (compact ? 26 : GAP) + Math.abs(minX) * detailZoom;
    const frontOriginX = PAD + sectionW + GAP + detailW + GAP + (frame.a + frame.dbl) * frontScale;
    const frontOriginY = originY;

    const viewTitle =
      view === 'side' ? t.crossSection : view === 'top' ? t.topDown : t.frontView;

    const pick = (next: Exclude<CaliperTarget, null>) =>
      setTarget((current) => (current === next ? null : next));

    return (
      <div
        data-ui
        className="flex h-full min-h-[340px] w-full flex-col overflow-hidden rounded-sm bg-sheet-stage"
      >
        <div className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 pt-3">
          <h2 className="text-[13px] font-medium text-sheet-ink">{viewTitle}</h2>
          {compareResult && view !== 'front' ? (
            <CompareLegend
              lang={lang}
              index={lens.index}
              compareIndex={compareLens?.index ?? null}
              result={result}
              compareResult={compareResult}
            />
          ) : (
            <p className="text-[13px] text-sheet-muted">
              {compareResult && view === 'front' ? t.compareFrontNote : t.scaleNote}
            </p>
          )}
        </div>

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
                    `0 -44 ${(frame.a * 2 + frame.dbl) * S + 160} ${(frame.b + 10) * S + 210}`
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

                {/* CT across the lens. */}
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
                    x={originX + ((primaryPos.frontApexX + primaryPos.backApexX) / 2) * S}
                    y={originY - (frame.b / 2) * S * 0.55 - 8}
                    textAnchor="middle"
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
                {!compact && (
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
                    { text: t.crossSection, x: originX },
                    { text: t.edgeDetail, x: detailOriginX + detailW / 2 },
                    ...(compact ? [] : [{ text: t.frontView, x: frontOriginX + frontW / 4 }]),
                  ].map((label) => {
                    const half = (label.text.length * 12 * 0.54) / 2;
                    const x = Math.min(Math.max(label.x, half + 4), BOARD_W - half - 4);
                    return (
                      <text key={label.text} x={x} y={BOARD_H - 14} textAnchor="middle">
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
        <div className="shrink-0 px-2 pb-2">
          <div className="grid grid-cols-2 gap-px bg-sheet-stage sm:grid-cols-3 lg:grid-cols-5">            {calipers.map((row, index) => {
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
                  className={`sheet-rise delay-${index + 1} flex flex-col gap-0.5 px-3 py-2 text-left transition-colors duration-150 ${
                    isActive ? 'bg-sheet-ground' : 'bg-sheet-panel hover:bg-sheet-info'
                  }`}
                >
                  <span className="text-[13px] leading-tight text-sheet-muted">{row.name}</span>
                  {/* The comparison value sits on the value's own line, not on a
                      line of its own: every extra line in the schedule takes
                      height straight out of the drawing above it. */}
                  <span className="flex items-baseline gap-1.5 leading-tight">
                    <span className="text-[20px] font-medium text-sheet-ink tnum">{row.value}</span>
                    {row.compareValue && (
                      <span className="text-[13px] text-sheet-muted tnum">
                        → {row.compareValue}
                      </span>
                    )}
                  </span>
                  <span className={`text-[13px] leading-tight tnum ${row.ok ? 'text-sheet-muted' : 'text-sheet-warning'}`}>
                    {row.ok ? t.withinLimit : t.overLimit} · {row.limit} mm
                  </span>
                </button>
              );
            })}
          </div>

          {/* The definition of whichever caliper is being read. */}
          <p
            key={active ? active.id : 'hint'}
            className={`caliper-snap mt-2 min-h-[20px] px-1 text-[13px] leading-snug ${
              active ? 'text-sheet-ink' : 'text-sheet-muted'
            }`}
          >
            {active ? active.note : t.caliperHint}
          </p>
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
      prevProps.bevelPercent === nextProps.bevelPercent
    );
  },
);
