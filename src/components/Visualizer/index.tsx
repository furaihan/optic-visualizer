import React, { useMemo, useState } from 'react';
import { AlertCircle, X, HelpCircle } from 'lucide-react';
import { translations } from '../../lib/i18n';
import { VisualizerProps, HoverLabel, LensPosition } from './types';
import { LensProfile } from './LensProfile';
import { FrameProfile } from './FrameProfile';
import { FrontView } from './FrontView';
import { TopDownView } from './TopDownView';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

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
  const [isLegendOpen, setIsLegendOpen] = useState(true);

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
    <div className="relative w-full h-full min-h-[300px] bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner">
      {/* Background Lab Grid */}
      <div className="absolute inset-0 lab-grid" />

      <div className="absolute top-8 left-8 border-l-2 border-slate-300 dark:border-slate-700 pl-4 py-1 z-10 text-left">
        <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          {view === 'side' ? t.crossSection : view === 'top' ? t.topDown : t.frontView}
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-[9px] italic">{t.visualSim}</p>
      </div>

      {/* Floating Exceeded/Warning Alert Card */}
      {highlightedLimit && (
        <div className="absolute top-8 right-8 max-w-[280px] p-4 bg-amber-500/10 dark:bg-amber-500/15 backdrop-blur-md border border-amber-500/30 rounded-2xl flex items-start gap-2.5 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 text-left z-20">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div>
            <h4 className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1 leading-none">
              {(t as any).limitWarningTitle || "Batas Struktural Terlampaui!"}
            </h4>
            <p className="text-[9.5px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
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

      {/* Dimension Labels Overlay / Collapsible Legend */}
      {isLegendOpen ? (
        <div className="absolute bottom-6 right-6 p-3 bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-xl space-y-2 shadow-md min-w-[145px] text-left transition-all duration-200 animate-in fade-in zoom-in-95 select-none md:bottom-8 md:right-8 z-20">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {lang === 'id' ? 'Legenda' : 'Legend'}
            </span>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              aria-label="Collapse legend"
              title={lang === "id" ? "Sembunyikan legenda" : "Collapse legend"}
            >
              <X size={10} />
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40"></div>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-350 uppercase tracking-wider">{t.primarySpec}</span>
            </div>
            {compareResult && compareLens && (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40"></div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-350 uppercase tracking-wider">{t.comparison} ({compareLens.index.toFixed(2)})</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Collapsed Panel utilizing Popover Shadcn */
        <div className="absolute bottom-6 right-6 z-20 md:bottom-8 md:right-8 transition-all duration-200 animate-in fade-in zoom-in-95">
          <Popover>
            <PopoverTrigger
              className="flex items-center gap-1.5 px-3 py-2 bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-full shadow-md hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group active:scale-95"
              title={lang === "id" ? "Tampilkan legenda" : "Show legend details"}
            >
              {/* Display tiny colored indicator circle icons */}
              <span className="flex items-center -space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white dark:border-slate-900 shadow-sm" />
                {compareResult && compareLens && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-slate-900 shadow-sm" />
                )}
              </span>
              
              {/* Mini help icon */}
              <HelpCircle size={11} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </PopoverTrigger>
            <PopoverContent 
              side="top" 
              align="end" 
              sideOffset={8} 
              className="w-56 p-3 bg-white/95 dark:bg-slate-950/95 border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-xl z-50 text-left backdrop-blur-sm"
            >
              <div className="space-y-2 select-none">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold pb-1 border-b border-slate-100 dark:border-slate-800">
                  {lang === 'id' ? 'Legenda Visual' : 'Visual Legend'}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shrink-0 mt-0.5"></div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{t.primarySpec}</div>
                      <div className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">
                        {lang === 'id' ? 'Lensa utama Anda sekarang' : 'Current active layout specs'}
                      </div>
                    </div>
                  </div>
                  
                  {compareResult && compareLens && (
                    <div className="flex items-start gap-2 pt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shrink-0 mt-0.5"></div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                          {t.comparison} ({compareLens.index.toFixed(2)})
                        </div>
                        <div className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">
                          {lang === 'id' ? 'Lensa untuk perbandingan indeks' : 'Secondary overlay for comparison'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setIsLegendOpen(true)}
                  className="w-full mt-1.5 py-1 text-center text-[9px] font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100/70 dark:hover:bg-blue-950/40 border border-blue-200/30 dark:border-blue-900/40 rounded-lg transition-all uppercase tracking-wider cursor-pointer"
                >
                  {lang === 'id' ? 'Sematkan Legenda' : 'Pin Legend'}
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};
