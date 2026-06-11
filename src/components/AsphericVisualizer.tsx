import React, { useMemo, useState } from 'react';
import { AlertCircleIcon, XIcon, HelpCircleIcon } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface LensPosition {
  etX_start: number;
  etX_end: number;
  grooveX: number;
  frontApexX: number;
  backApexX: number;
}

interface HoverLabel {
  title: string;
  desc: string;
  x: number;
  y: number;
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

function generateAsphericCurvePath(
  etX: number,
  yVal: number,
  R: number,
  conic: number,
  coeffs: { A2: number; A4: number; A6: number; A8: number },
  scale: number,
  fromTop: boolean,
  direction: number, // -1 = bows left (front), +1 = bows right (back diverging)
): string {
  if (!Number.isFinite(R)) return '';

  const steps = 40;
  const startY = fromTop ? -yVal : yVal;
  const endY = fromTop ? yVal : -yVal;
  const step = (endY - startY) / steps;

  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const y = startY + step * i;
    const sag = getAsphericSag(R, Math.abs(y), conic, coeffs);
    const x = etX - direction * sag;
    points.push(`${x * scale} ${y * scale}`);
  }
  return points.join(' L ');
}

function generateSphericalCurvePath(
  etX: number,
  yVal: number,
  R: number,
  scale: number,
  sweep: number,
): string {
  if (!Number.isFinite(R)) return '';
  return `A ${Math.abs(R) * scale} ${Math.abs(R) * scale} 0 0 ${sweep} ${etX * scale} ${yVal * scale}`;
}

export const AsphericVisualizer: React.FC<AsphericVisualizerProps> = React.memo(({
  lens,
  frame,
  patient,
  result,
  lang,
  view,
  highlightedLimit = null,
}) => {
  const t = translations[lang];
  const [hoveredLabel, setHoveredLabel] = useState<HoverLabel | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  const PX_PER_MM = view === 'top' ? 4 : 6;
  const VIEWBOX_W = 550;
  const VIEWBOX_H = 550;
  const centerX = VIEWBOX_W / 2;
  const centerY = view === 'top' ? VIEWBOX_H / 2 : 240;

  const primaryPos = useMemo<LensPosition>(() => {
    const etX_start = -result.anteriorProtrusion + result.s1;
    const etX_end = etX_start + result.et;
    const grooveX = etX_start + result.et / 2;
    const frontApexX = -result.anteriorProtrusion;
    const backApexX = frontApexX + result.ct;
    return { etX_start, etX_end, grooveX, frontApexX, backApexX };
  }, [result]);

  const yVal = frame.a / 2;
  const { etX_start, etX_end } = primaryPos;

  const frontSweep = 0;
  const sweepBack = result.backPower >= 0 ? 0 : 1;
  const scale = PX_PER_MM;

  // Front surface direction: always bows left (-1)
  const frontDir = -1;
  // Back surface direction: +1 = bows right (diverging), -1 = bows left (converging)
  const backDir = result.backPower < 0 ? 1 : -1;

  // Generate front surface path (aspheric or spherical fallback)
  const frontSurfacePath = lens.asphericFront.isActive
    ? `M ${etX_start * scale} ${-yVal * scale} L ${generateAsphericCurvePath(etX_start, yVal, result.r1, lens.asphericFront.conic, lens.asphericFront, scale, true, frontDir)}`
    : `M ${etX_start * scale} ${-yVal * scale} ${generateSphericalCurvePath(etX_start, yVal, result.r1, scale, frontSweep)}`;

  // Generate back surface path (aspheric or spherical fallback)
  const backSurfacePath = lens.asphericBack.isActive
    ? `L ${generateAsphericCurvePath(etX_end, yVal, result.r2, lens.asphericBack.conic, lens.asphericBack, scale, false, backDir)}`
    : `L ${generateSphericalCurvePath(etX_end, -yVal, result.r2, scale, sweepBack)}`;

  const lensPath = `${frontSurfacePath} L ${etX_end * scale} ${yVal * scale} ${backSurfacePath} Z`;

  const clampedLabelX = Math.max(-centerX + 15, Math.min((etX_end + 10) * scale, VIEWBOX_W - 65 - centerX));

  return (
    <div className="relative w-full h-full min-h-[300px] bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner">
      <div className="absolute inset-0 lab-grid" />

      <div className="absolute top-8 left-8 border-l-2 border-slate-300 dark:border-slate-700 pl-4 py-1 z-10 text-left">
        <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          {view === 'side' ? t.crossSection : view === 'top' ? t.topDown : t.frontView}
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-[9px] italic">{t.visualSim}</p>
      </div>

      {highlightedLimit && (
        <Card className="absolute top-8 right-8 max-w-[280px] p-4 bg-amber-500/10 dark:bg-amber-500/15 backdrop-blur-md border-amber-500/30 rounded-2xl flex items-start gap-2.5 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 text-left z-20">
          <AlertCircleIcon className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div>
            <h4 className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1 leading-none">
              {t.limitWarningTitle}
            </h4>
            <p className="text-[9.5px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              {highlightedLimit === 'a' && t.limitWarningA(frame.a, Number((result.y * 2 + 2).toFixed(0)))}
              {highlightedLimit === 'b' && t.limitWarningB(frame.b)}
              {highlightedLimit === 'dbl' && t.limitWarningDbl(frame.dbl)}
              {highlightedLimit === 'ed' && t.limitWarningEd(frame.ed, frame.a)}
            </p>
          </div>
        </Card>
      )}

      <svg width="100%" height="100%" viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} preserveAspectRatio="xMidYMid meet" className="filter drop-shadow-xl cursor-crosshair">
        <defs>
          <linearGradient id="aspheric-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="20%" stopColor="#94a3b8" />
            <stop offset="40%" stopColor="#cbd5e1" />
            <stop offset="60%" stopColor="#94a3b8" />
            <stop offset="80%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>
        {view === 'side' ? (
          <>
            <FrameProfile
              frame={frame}
              result={result}
              pos={primaryPos}
              scale={PX_PER_MM}
              centerX={centerX}
              centerY={centerY}
              lang={lang}
            />

            <FrontView
              frame={frame}
              patient={patient}
              result={result}
              lang={lang}
              isMain={false}
              highlightedLimit={highlightedLimit}
            />

            {/* Lens cross-section */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <path
                d={lensPath}
                fill="#8b5cf6"
                fillOpacity={0.2}
                stroke="#8b5cf6"
                strokeWidth="1.5"
                strokeOpacity={0.5}
              />

              {/* Aspheric surface annotations */}
              {lens.asphericFront.isActive && (
                <text
                  x={(etX_start - result.s1 / 2) * scale}
                  y={(-yVal - 12) * scale}
                  textAnchor="middle"
                  className="text-[7px] font-bold fill-violet-500 uppercase tracking-wider"
                >
                  ASPH
                </text>
              )}
              {lens.asphericBack.isActive && (
                <text
                  x={(etX_end + result.s2 / 2) * scale}
                  y={(-yVal - 12) * scale}
                  textAnchor="middle"
                  className="text-[7px] font-bold fill-violet-500 uppercase tracking-wider"
                >
                  ASPH
                </text>
              )}

              {/* CT Label */}
              <g className="text-[10px] font-mono select-none">
                <rect
                  x={(primaryPos.frontApexX + (result.ct / 2)) * scale - 24}
                  y={-23}
                  width={48}
                  height={12}
                  fill="#0f172a"
                  fillOpacity={0.08}
                  rx={3}
                />
                <text
                  x={(primaryPos.frontApexX + (result.ct / 2)) * scale}
                  y={-14}
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-[9px] font-bold"
                >
                  CT: {result.ct.toFixed(1)}mm
                </text>
              </g>

              {/* ET Label */}
              <g className="text-[10px] font-mono select-none">
                <rect
                  x={clampedLabelX - 4}
                  y={(yVal + 3) * scale - 9}
                  width={48}
                  height={12}
                  fill="#0f172a"
                  fillOpacity={0.08}
                  rx={3}
                />
                <text
                  x={clampedLabelX}
                  y={(yVal + 3) * scale}
                  fill="currentColor"
                  className="text-[9px] font-bold"
                >
                  ET: {result.et.toFixed(1)}mm
                </text>
              </g>

              {/* Aberration display */}
              {(lens.asphericFront.isActive || lens.asphericBack.isActive) && (
                <text
                  x={(etX_start - 5) * scale}
                  y={(yVal + 20) * scale}
                  className="text-[7px] fill-slate-500 font-mono"
                >
                  SA₀: {result.sa0.toFixed(3)} | Coma: {result.comaX.toFixed(3)}
                </text>
              )}
            </g>
          </>
        ) : view === 'top' ? (
          <TopDownView
            lens={lens as any}
            frame={frame}
            patient={patient}
            result={result as any}
            compareResult={undefined}
            lang={lang}
            scale={PX_PER_MM}
            centerX={centerX}
            centerY={centerY}
            primaryPos={primaryPos}
            comparePos={null}
            highlightedLimit={highlightedLimit}
          />
        ) : (
          <FrontView
            frame={frame}
            patient={patient}
            result={result}
            lang={lang}
            isMain={true}
            highlightedLimit={highlightedLimit}
          />
        )}

        {hoveredLabel && (
          <g transform={`translate(${hoveredLabel.x + centerX}, ${hoveredLabel.y + centerY - 25})`} className="pointer-events-none z-50">
            <rect x={-80} y={-32} width={160} height={26} rx={6} fill="#0f172a" fillOpacity={0.96} stroke="#334155" strokeWidth={1} />
            <polygon points="-5,-5 0,0 5,-5" transform="translate(0, 0)" fill="#0f172a" stroke="#334155" strokeWidth={0.5} />
            <rect x={-4} y={-6} width={8} height={2} fill="#0f172a" />
            <text x={0} y={-19} textAnchor="middle" fill="#f1f5f9" className="text-[7.5px] font-sans font-bold">
              {hoveredLabel.title}
            </text>
            <text x={0} y={-9} textAnchor="middle" fill="#cbd5e1" className="text-[7px] font-sans">
              {hoveredLabel.desc}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      {isLegendOpen ? (
        <Card className="absolute bottom-6 right-6 p-3 bg-white/95 dark:bg-slate-950/95 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-xl space-y-2 shadow-md min-w-[145px] text-left transition-all duration-200 animate-in fade-in zoom-in-95 select-none md:bottom-8 md:right-8 z-20">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t.legend}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setIsLegendOpen(false)} className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" aria-label={t.collapseLegend} title={t.collapseLegend}>
              <XIcon size={10} />
            </Button>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-sm shadow-violet-500/40"></div>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-350 uppercase tracking-wider">{t.primarySpec}</span>
            </div>
            {lens.asphericFront.isActive && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wider">ASPH</span>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-350">Front</span>
              </div>
            )}
            {lens.asphericBack.isActive && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-violet-500 uppercase tracking-wider">ASPH</span>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-350">Back</span>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="absolute bottom-6 right-6 z-20 md:bottom-8 md:right-8 transition-all duration-200 animate-in fade-in zoom-in-95">
          <Popover>
            <PopoverTrigger
              className="flex items-center gap-1.5 px-3 py-2 bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-full shadow-md hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group active:scale-95"
              title={t.showLegend}
            >
              <span className="flex items-center -space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 border border-white dark:border-slate-900 shadow-sm" />
              </span>
              <HelpCircleIcon size={11} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </PopoverTrigger>
            <PopoverContent side="top" align="end" sideOffset={8} className="w-56 p-3 bg-white/95 dark:bg-slate-950/95 border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-xl z-50 text-left backdrop-blur-sm">
              <div className="space-y-2 select-none">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold pb-1 border-b border-slate-100 dark:border-slate-800">
                  {t.visualLegend}
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-sm shrink-0 mt-0.5"></div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{t.primarySpec}</div>
                      <div className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">
                        {t.primaryDesc}
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => setIsLegendOpen(true)} className="w-full mt-1.5 h-7 text-[9px] font-extrabold uppercase tracking-wider">
                  {t.pinLegend}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
});
