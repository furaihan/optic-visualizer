import React, { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { translations } from '../../lib/i18n';
import { VisualizerProps, HoverLabel, LensPosition } from './types';
import { LensProfile } from './LensProfile';
import { FrameProfile } from './FrameProfile';
import { FrontView } from './FrontView';
import { TopDownView } from './TopDownView';

export const Visualizer: React.FC<VisualizerProps> = ({
  lens,
  frame,
  patient,
  result,
  compareResult,
  compareLens,
  lang,
  view,
  highlightedLimit = null,
}) => {
  const t = translations[lang];
  const [hoveredLabel, setHoveredLabel] = useState<HoverLabel | null>(null);

  // Scaling factors
  const PX_PER_MM = view === 'top' ? 4 : 6; 
  const VIEWBOX_W = 550;
  const VIEWBOX_H = 550;
  
  // Centers
  const centerX = VIEWBOX_W / 2;
  const centerY = view === 'top' ? VIEWBOX_H / 2 : 240; 

  // Precalculate primary lens positions to avoid redundancy
  const primaryPos = useMemo<LensPosition>(() => {
    const etX_start = -result.anteriorProtrusion + result.s1;
    const etX_end = etX_start + result.et;
    const grooveX = etX_start + result.et / 2;
    const frontApexX = -result.anteriorProtrusion;
    const backApexX = frontApexX + result.ct;
    return { etX_start, etX_end, grooveX, frontApexX, backApexX };
  }, [result]);

  // Precalculate compare lens positions if compareResult exists
  const comparePos = useMemo<LensPosition | null>(() => {
    if (!compareResult) return null;
    const etX_start = -compareResult.anteriorProtrusion + compareResult.s1;
    const etX_end = etX_start + compareResult.et;
    const grooveX = etX_start + compareResult.et / 2;
    const frontApexX = -compareResult.anteriorProtrusion;
    const backApexX = frontApexX + compareResult.ct;
    return { etX_start, etX_end, grooveX, frontApexX, backApexX };
  }, [compareResult]);

  return (
    <div className="relative w-full h-full min-h-[300px] bg-slate-100 rounded-3xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner">
      {/* Background Lab Grid */}
      <div className="absolute inset-0 lab-grid" />

      <div className="absolute top-8 left-8 border-l-2 border-slate-300 pl-4 py-1 z-10 text-left">
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
          {view === 'side' ? t.crossSection : view === 'top' ? t.topDown : t.frontView}
        </h3>
        <p className="text-slate-400 text-[9px] italic">{t.visualSim}</p>
      </div>

      {/* Floating Exceeded/Warning Alert Card */}
      {highlightedLimit && (
        <div className="absolute top-8 right-8 max-w-[280px] p-4 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-2xl flex items-start gap-2.5 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 text-left z-20">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div>
            <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1 leading-none">
              {(t as any).limitWarningTitle || "Batas Struktural Terlampaui!"}
            </h4>
            <p className="text-[9.5px] text-slate-600 font-semibold leading-relaxed">
              {highlightedLimit === 'a' && (t as any).limitWarningA?.replace('{val}', String(frame.a)).replace('{blankVal}', (result.y * 2 + 2).toFixed(0))}
              {highlightedLimit === 'b' && (t as any).limitWarningB?.replace('{val}', String(frame.b))}
              {highlightedLimit === 'dbl' && (t as any).limitWarningDbl?.replace('{val}', String(frame.dbl))}
              {highlightedLimit === 'ed' && (t as any).limitWarningEd?.replace('{val}', String(frame.ed)).replace('{aVal}', String(frame.a))}
            </p>
          </div>
        </div>
      )}

      <svg width="100%" height="100%" viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} preserveAspectRatio="xMidYMid meet" className="filter drop-shadow-xl cursor-crosshair">
        <defs>
          <linearGradient id="metallic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="20%" stopColor="#94a3b8" />
            <stop offset="40%" stopColor="#cbd5e1" />
            <stop offset="60%" stopColor="#94a3b8" />
            <stop offset="80%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <pattern id="diagonal-stripes" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#10b981" strokeWidth="2.2" opacity="0.45" />
          </pattern>
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
            
            {/* Comparison Result (Rendered first if exists to show behind) */}
            {compareResult && compareLens && comparePos && (
              <LensProfile
                lens={compareLens}
                result={compareResult}
                pos={comparePos}
                color="#10b981"
                opacity={0.15}
                label="secondary"
                scale={PX_PER_MM}
                centerX={centerX}
                centerY={centerY}
                frameA={frame.a}
                lang={lang}
                onHoverLabel={setHoveredLabel}
                primaryPos={primaryPos}
                comparePos={comparePos}
              />
            )}

            {/* Normal Mode or Base Result */}
            <LensProfile
              lens={lens}
              result={result}
              pos={primaryPos}
              color="#3b82f6"
              opacity={0.25}
              label="primary"
              scale={PX_PER_MM}
              centerX={centerX}
              centerY={centerY}
              frameA={frame.a}
              lang={lang}
              onHoverLabel={setHoveredLabel}
              primaryPos={primaryPos}
              comparePos={comparePos}
            />
          </>
        ) : view === 'top' ? (
          <TopDownView
            lens={lens}
            frame={frame}
            patient={patient}
            result={result}
            compareResult={compareResult}
            compareLens={compareLens}
            lang={lang}
            scale={PX_PER_MM}
            centerX={centerX}
            centerY={centerY}
            primaryPos={primaryPos}
            comparePos={comparePos}
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

        {/* SVG-based Interactivity Tooltip */}
        {hoveredLabel && (
          <g transform={`translate(${hoveredLabel.x + centerX}, ${hoveredLabel.y + centerY - 25})`} className="pointer-events-none z-50">
            <rect
              x={-80}
              y={-32}
              width={160}
              height={26}
              rx={6}
              fill="#0f172a"
              fillOpacity={0.96}
              stroke="#334155"
              strokeWidth={1}
            />
            {/* Tooltip arrow */}
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

      {/* Dimension Labels Overlay */}
      <div className="absolute bottom-8 right-8 p-4 bg-white/80 border border-slate-200 backdrop-blur-md rounded-xl space-y-1.5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t.primarySpec}</span>
        </div>
        {compareResult && compareLens && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t.comparison} ({compareLens.index.toFixed(2)})</span>
          </div>
        )}
      </div>
    </div>
  );
};
