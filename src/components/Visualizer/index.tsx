import React, { useMemo, useState } from 'react';
import { translations } from '../../lib/translations';
import { VisualizerProps, LensPosition, CaliperTarget } from './types';
import { LensProfile } from './LensProfile';
import { FrameProfile } from './FrameProfile';
import { FrontView } from './FrontView';
import { TopDownView } from './TopDownView';
import { EdgeDetail } from './EdgeDetail';
import { SheetDefs } from './SheetDefs';
import { useMediaQuery } from '../../hooks/useMediaQuery';

type CaliperRow = {
  id: Exclude<CaliperTarget, null>;
  name: string;
  value: string;
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

    const calipers: CaliperRow[] = [
      { id: 'ct', name: t.center, value: mm(result.ct), limit: '≥ 1.00', ok: result.ct >= 1, note: t.caliperCt },
      { id: 'et', name: t.edgeThick, value: mm(result.et), limit: '≤ 6.00', ok: result.et <= 6, note: t.caliperEt },
      {
        id: 'anterior',
        name: t.anteriorProt,
        value: mm(result.anteriorProtrusion),
        limit: '≤ 1.50',
        ok: result.anteriorProtrusion <= 1.5,
        note: t.caliperAnterior,
      },
      {
        id: 'posterior',
        name: t.posteriorProt,
        value: mm(result.posteriorProtrusion),
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
    const S = 6;
    const detailZoom = 13;
    const frontScale = 2.6;

    const minX = -Math.max(result.anteriorProtrusion, compareResult?.anteriorProtrusion ?? 0);
    const maxX = Math.max(
      frame.depth + result.posteriorProtrusion,
      frame.depth + (compareResult?.posteriorProtrusion ?? 0),
      1,
    );
    const sectionW = (maxX - minX) * S;
    const sectionH = (frame.b + 8) * S;

    const detailW = (maxX - minX) * detailZoom;
    const detailH = 7.5 * detailZoom;

    const frontW = (frame.a * 2 + frame.dbl) * frontScale;
    const frontH = (frame.b + 8) * frontScale;

    const PAD = 34;
    const GAP = 54;
    const LABEL_BAND = 56;

    const BOARD_W = compact
      ? PAD + sectionW + 26 + detailW + PAD
      : PAD + sectionW + GAP + detailW + GAP + frontW + PAD + 30;
    // The sheet is one screen tall where it can be: the board takes what is
    // left after the claim, the order and the schedule.
    const BOARD_H = Math.max(sectionH, detailH, compact ? 0 : frontH) + PAD + LABEL_BAND + 18;    const originX = PAD + Math.abs(minX) * S;
    const originY = PAD + Math.max(sectionH, detailH, frontH) / 2;
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
          <p className="text-[13px] text-sheet-muted">{t.scaleNote}</p>
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
                  ? `0 0 ${(frame.a * 2 + frame.dbl) * S + 160} ${(frame.b + 10) * S + 120}`
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
                    fontSize={12}
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

                {/* Each drawing names itself, as a sheet's views do. */}
                <g className="text-sheet-muted" fill="currentColor" fontSize={12}>
                  <text x={originX} y={BOARD_H - 14} textAnchor="middle">
                    {t.crossSection}
                  </text>
                  <text x={detailOriginX + detailW / 2} y={BOARD_H - 14} textAnchor="middle">
                    {t.edgeDetail}
                  </text>
                  {!compact && (
                    <text x={frontOriginX + frontW / 4} y={BOARD_H - 14} textAnchor="middle">
                      {t.frontView}
                    </text>
                  )}
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
                originY={PAD + (frame.b * S) / 2 + 20}
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
                  <span className="text-[18px] font-medium leading-tight text-sheet-ink tnum">
                    {row.value}
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
