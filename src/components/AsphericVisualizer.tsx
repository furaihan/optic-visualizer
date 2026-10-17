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
import { SheetDefs } from './Visualizer/SheetDefs';
import { useMediaQuery } from '../hooks/useMediaQuery';

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
}

/**
 * The aspheric surface, sampled into a real path.
 *
 * z(y) = y²/R / (1 + √(1 − (1+K)y²/R²)) + A₂y² + A₄y⁴ + A₆y⁶ + A₈y⁸
 * The sphere is the fallback when a surface is switched off, so the drawing
 * always shows what the engine actually computed.
 */
function asphericPath(
  etX: number,
  halfHeight: number,
  R: number,
  conic: number,
  coeffs: { A2: number; A4: number; A6: number; A8: number },
  scale: number,
  fromTop: boolean,
  direction: number,
): string {
  if (!Number.isFinite(R)) return '';
  const steps = 48;
  const startY = fromTop ? -halfHeight : halfHeight;
  const endY = fromTop ? halfHeight : -halfHeight;
  const step = (endY - startY) / steps;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const y = startY + step * i;
    const sag = getAsphericSag(R, Math.abs(y), conic, coeffs);
    points.push(`${(etX - direction * sag) * scale} ${y * scale}`);
  }
  return points.join(' L ');
}

function sphericalArc(etX: number, y: number, R: number, scale: number, sweep: number): string {
  if (!Number.isFinite(R)) return '';
  return `A ${Math.abs(R) * scale} ${Math.abs(R) * scale} 0 0 ${sweep} ${etX * scale} ${y * scale}`;
}

/**
 * The aspheric workbench's drawing: the same sheet language as the spherical
 * one, with the aspheric surface drawn from its conic and coefficients and the
 * two aberration figures the engine reports.
 */
export const AsphericVisualizer: React.FC<AsphericVisualizerProps> = React.memo(
  ({ lens, frame, patient, result, lang, view, highlightedLimit = null }) => {
    const t = translations[lang];
    const compact = useMediaQuery('(max-width: 767px)');

    const primaryPos = useMemo<LensPosition>(() => {
      const etX_start = -result.anteriorProtrusion + result.s1;
      const etX_end = etX_start + result.et;
      const grooveX = etX_start + result.et / 2;
      const frontApexX = -result.anteriorProtrusion;
      const backApexX = frontApexX + result.ct;
      return { etX_start, etX_end, grooveX, frontApexX, backApexX };
    }, [result]);

    const S = 6;
    const frontScale = 2.6;

    const halfHeight = (frame.b / 2) * S;
    const rim = 5 * S;
    const minX = -result.anteriorProtrusion;
    const maxX = frame.depth + result.posteriorProtrusion;
    const sectionW = (maxX - minX) * S;

    const PAD = 34;
    const GAP = 54;
    const LABEL_BAND = 56;

    const frontW = (frame.a * 2 + frame.dbl) * frontScale;
    const frontH = (frame.b + 8) * frontScale;

    const BOARD_W = compact
      ? PAD + sectionW + PAD
      : PAD + sectionW + GAP + frontW + PAD + 60;
    const BOARD_H = Math.max((frame.b + 8) * S, frontH) + PAD + LABEL_BAND;

    const originX = PAD + Math.abs(minX) * S;
    const originY = PAD + BOARD_H / 2 - LABEL_BAND / 2;
    const frontOriginX = PAD + sectionW + GAP + (frame.a + frame.dbl) * frontScale;
    const frontOriginY = originY;

    const { etX_start, etX_end } = primaryPos;
    const frontDir = -1;
    const backDir = result.backPower < 0 ? 1 : -1;
    const sweepBack = result.backPower >= 0 ? 0 : 1;

    const frontPath = lens.asphericFront.isActive
      ? `M ${etX_start * S} ${-halfHeight} L ${asphericPath(
          etX_start,
          frame.b / 2,
          result.r1,
          lens.asphericFront.conic,
          lens.asphericFront,
          S,
          true,
          frontDir,
        )}`
      : `M ${etX_start * S} ${-halfHeight} ${sphericalArc(etX_start, frame.b / 2, result.r1, S, 0)}`;

    const backPath = lens.asphericBack.isActive
      ? `L ${asphericPath(
          etX_end,
          frame.b / 2,
          result.r2,
          lens.asphericBack.conic,
          lens.asphericBack,
          S,
          false,
          backDir,
        )}`
      : `L ${sphericalArc(etX_end, -frame.b / 2, result.r2, S, sweepBack)}`;

    const lensPath = `${frontPath} L ${etX_end * S} ${halfHeight} ${backPath} Z`;

    const viewTitle =
      view === 'side' ? t.crossSection : view === 'top' ? t.topDown : t.frontView;

    return (
      <div
        data-ui
        className="flex h-full min-h-[320px] w-full flex-col overflow-hidden rounded-sm bg-sheet-stage"
      >
        <div className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 pt-3">
          <h2 className="text-[13px] font-medium text-sheet-ink">{viewTitle}</h2>
          <p className="text-[13px] text-sheet-muted">{t.scaleNote}</p>
        </div>

        <div className="min-h-0 flex-1">
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
                      fontSize={12}
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
                      fontSize={12}
                      fontWeight={600}
                    >
                      ASPH K {lens.asphericBack.conic.toFixed(2)}
                    </text>
                  )}

                  {/* CT across the lens. */}
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
                    x={((primaryPos.frontApexX + primaryPos.backApexX) / 2) * S}
                    y={-halfHeight * 0.55 - 8}
                    textAnchor="middle"
                    className="text-sheet-ink"
                    fill="currentColor"
                    fontSize={12}
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
                    x={primaryPos.grooveX * S + 14}
                    y={halfHeight * 0.55 + 4}
                    textAnchor="start"
                    className="text-sheet-ink"
                    fill="currentColor"
                    fontSize={12}
                    fontWeight={600}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    ET {result.et.toFixed(2)}
                  </text>
                </g>

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

                <g className="text-sheet-muted" fill="currentColor" fontSize={12}>
                  <text x={originX} y={BOARD_H - 14} textAnchor="middle">
                    {t.crossSection}
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

        {/* The aspheric figures, as a schedule row under the drawing. */}
        <div className="shrink-0 px-2 pb-2">
          <div className="grid grid-cols-2 gap-px bg-sheet-stage sm:grid-cols-4">
            <div className="flex flex-col gap-0.5 bg-sheet-panel px-3 py-2">
              <span className="text-[13px] leading-tight text-sheet-muted">{t.conicConstant}</span>
              <span className="text-[18px] font-medium leading-tight text-sheet-ink tnum">
                {(lens.asphericFront.isActive ? lens.asphericFront.conic : lens.asphericBack.conic).toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 bg-sheet-panel px-3 py-2">
              <span className="text-[13px] leading-tight text-sheet-muted">{t.surfaceActive}</span>
              <span className="text-[16px] leading-tight text-sheet-ink">
                {[
                  lens.asphericFront.isActive ? t.asphericSurfaceFront : null,
                  lens.asphericBack.isActive ? t.asphericSurfaceBack : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'None'}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 bg-sheet-panel px-3 py-2">
              <span className="text-[13px] leading-tight text-sheet-muted">{t.sphAberration}</span>
              <span className="text-[18px] font-medium leading-tight text-sheet-ink tnum">
                {result.sa0.toFixed(3)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 bg-sheet-panel px-3 py-2">
              <span className="text-[13px] leading-tight text-sheet-muted">{t.coma}</span>
              <span className="text-[18px] font-medium leading-tight text-sheet-ink tnum">
                {result.comaX.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
