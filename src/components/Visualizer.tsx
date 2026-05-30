import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { CalculationResult, FrameParameters, LensParameters, PatientParameters, FrameType } from '../lib/optical';
import { translations, Language } from '../lib/i18n';

interface VisualizerProps {
  lens: LensParameters;
  frame: FrameParameters;
  patient: PatientParameters;
  result: CalculationResult;
  compareResult?: CalculationResult;
  compareLens?: LensParameters;
  lang: Language;
  view: 'side' | 'top' | 'front';
  frameType?: FrameType;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  lens,
  frame,
  patient,
  result,
  compareResult,
  compareLens,
  lang,
  view,
  frameType,
}) => {
  const t = translations[lang];
  const [hoveredLabel, setHoveredLabel] = React.useState<{ title: string; desc: string; x: number; y: number } | null>(null);
  // Scaling factors
  const PX_PER_MM = view === 'top' ? 4 : 6; 
  const VIEWBOX_W = 550;
  const VIEWBOX_H = 550;
  
  // Centers
  const centerX = VIEWBOX_W / 2;
  const centerY = view === 'top' ? VIEWBOX_H / 2 : 240; 

  // Precalculate primary lens positions to avoid redundancy
  const primaryPos = useMemo(() => {
    const etX_start = -result.anteriorProtrusion + result.s1;
    const etX_end = etX_start + result.et;
    const grooveX = etX_start + result.et / 2;
    const frontApexX = -result.anteriorProtrusion;
    const backApexX = frontApexX + result.ct;
    return { etX_start, etX_end, grooveX, frontApexX, backApexX };
  }, [result]);

  // Precalculate compare lens positions if compareResult exists
  const comparePos = useMemo(() => {
    if (!compareResult) return null;
    const etX_start = -compareResult.anteriorProtrusion + compareResult.s1;
    const etX_end = etX_start + compareResult.et;
    const grooveX = etX_start + compareResult.et / 2;
    const frontApexX = -compareResult.anteriorProtrusion;
    const backApexX = frontApexX + compareResult.ct;
    return { etX_start, etX_end, grooveX, frontApexX, backApexX };
  }, [compareResult]);

  // Re-syncing visualizer to optical engine:
  const renderLensProfile = (
    l: LensParameters,
    r: CalculationResult,
    color: string,
    opacity: number,
    label?: string
  ) => {
    const scale = PX_PER_MM;
    const yVal = frame.a / 2;

    // To align the lens perfectly with the frame's 0 to depth range:
    const pos = r === result ? primaryPos : (comparePos || primaryPos);
    const { etX_start, etX_end, frontApexX } = pos;

    const getCurvePath = (x1: number, y1: number, x2: number, y2: number, rVal: number, sweep: number) => {
      if (!Number.isFinite(rVal)) {
        return `L ${x2 * scale} ${y2 * scale}`;
      }
      return `A ${Math.abs(rVal) * scale} ${Math.abs(rVal) * scale} 0 0 ${sweep} ${x2 * scale} ${y2 * scale}`;
    };

    const sweepBack = r.backPower >= 0 ? 0 : 1;

    const lensPath = `M ${etX_start * scale} ${-yVal * scale}
                      ${getCurvePath(etX_start, -yVal, etX_start, yVal, r.r1, 0)}
                      L ${etX_end * scale} ${yVal * scale}
                      ${getCurvePath(etX_end, yVal, etX_end, -yVal, r.r2, sweepBack)}
                      Z`;

    const rawLabelX = (etX_end + 10) * scale;
    const clampedLabelX = Math.max(-centerX + 15, Math.min(rawLabelX, VIEWBOX_W - 65 - centerX));

    return (
      <g transform={`translate(${centerX}, ${centerY})`} key={label || 'lens'}>
        <motion.path
          initial={false}
          animate={{ d: lensPath }}
          fill={label === 'secondary' ? "url(#diagonal-stripes)" : color}
          fillOpacity={label === 'secondary' ? 1.0 : opacity}
          stroke={color}
          strokeWidth={label === 'secondary' ? "1.5" : "1"}
          strokeOpacity={opacity + 0.3}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        
        {/* Dimensions Labels */}
        <g className="text-[10px] font-mono select-none">
          {/* CT Tooltip Area */}
          <g 
            className="cursor-help pointer-events-auto"
            onMouseEnter={() => setHoveredLabel({
              title: `Center Thickness (CT): ${r.ct.toFixed(2)}mm`,
              desc: lang === 'id' ? "Ketebalan pusat lensa" : "Thickness at optical center",
              x: (frontApexX + (r.ct / 2)) * scale,
              y: -14
            })}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            <rect 
              x={(frontApexX + (r.ct / 2)) * scale - 24} 
              y={-23} 
              width={48} 
              height={12} 
              fill="#0f172a" 
              fillOpacity={0.08} 
              rx={3} 
            />
            <text 
              x={(frontApexX + (r.ct / 2)) * scale} 
              y={-14} 
              textAnchor="middle" 
              fill="currentColor"
              className="text-[9px] font-bold"
            >
              CT: {r.ct.toFixed(1)}mm
            </text>
          </g>

          {/* ET Tooltip Area */}
          <g 
            className="cursor-help pointer-events-auto"
            onMouseEnter={() => setHoveredLabel({
              title: `Edge Thickness (ET): ${r.et.toFixed(2)}mm`,
              desc: lang === 'id' ? "Ketebalan tepi terluar lensa" : "Thickness at lens outer boundary",
              x: clampedLabelX + 24,
              y: (yVal + 3) * scale
            })}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            <rect 
              x={clampedLabelX - 4} 
              y={(yVal + 3) * scale - 9} 
              width={48} 
              height={12} 
              fill="#0f172a" 
              fillOpacity={0.08} 
              rx={3} 
            />
            <text x={clampedLabelX} y={(yVal + 3) * scale} fill="currentColor" className="text-[9px] font-bold">
              ET: {r.et.toFixed(1)}mm
            </text>
          </g>
        </g>
      </g>
    );
  };

  const renderFrame = () => {
    const scale = PX_PER_MM;
    const yVal = frame.a / 2;
    const rimH = 5; 

    // Current lens positions for overhang labels
    const { etX_start, etX_end, grooveX: currentGrooveX } = primaryPos;

    return (
      <g transform={`translate(${centerX}, ${centerY})`} className="text-slate-400">
        <rect 
          x={0} y={(-yVal - rimH) * scale} 
          width={frame.depth * scale} height={rimH * scale} 
          fill="currentColor" fillOpacity="0.2" 
          stroke="url(#metallic-gradient)" strokeWidth="1.5"
          rx={2}
        />
        <rect 
          x={0} y={yVal * scale} 
          width={frame.depth * scale} height={rimH * scale} 
          fill="currentColor" fillOpacity="0.2" 
          stroke="url(#metallic-gradient)" strokeWidth="1.5"
          rx={2}
        />

        <g transform={`translate(${frame.depth * scale}, ${(-yVal - rimH + 1) * scale})`}>
          <rect 
            x={-1 * scale} y={-0.5 * scale} 
            width={3 * scale} height={3 * scale} 
            fill="url(#metallic-gradient)" stroke="#1e293b" strokeWidth="0.5" 
            rx={0.5} 
          />
          <path 
            d={`M 2 ${1 * scale} Q ${15 * scale} ${1 * scale}, ${40 * scale} ${5 * scale}`}
            fill="none" stroke="currentColor" strokeWidth={2 * scale} strokeOpacity="0.15" strokeLinecap="round"
          />
        </g>
        
        {/* Groove Guide */}
        <line 
          x1={currentGrooveX * scale} y1={(-yVal - rimH) * scale}
          x2={currentGrooveX * scale} y2={(yVal + rimH) * scale}
          stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.3"
        />
        <text x={currentGrooveX * scale} y={(-yVal - rimH - 10) * scale} textAnchor="middle" className="text-[7px] font-bold uppercase tracking-widest fill-slate-500">
          {t.groove}
        </text>

        {/* Frame Depth Label */}
        <text x={(frame.depth / 2) * scale} y={(yVal + rimH + 15) * scale} textAnchor="middle" className="text-[10px] uppercase font-bold fill-slate-500">
          {t.frameDepth}: {frame.depth}mm
        </text>

        {/* Overhang Indicators with Labels */}
        <g>
          {/* Anterior Overhang (Front) */}
          {result.anteriorProtrusion > 0 && (
            <g>
              <line 
                x1={-result.anteriorProtrusion * scale} y1={(-yVal - rimH - 5) * scale}
                x2={0} y2={(-yVal - rimH - 5) * scale}
                stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2"
              />
              <text 
                x={(-result.anteriorProtrusion / 2) * scale} 
                y={(-yVal - rimH - 12) * scale} 
                textAnchor="middle" 
                className="text-[8px] font-bold fill-red-500 uppercase tracking-tighter"
              >
                ANT: {result.anteriorProtrusion.toFixed(1)}mm
              </text>
            </g>
          )}
          {/* Posterior Overhang (Back) */}
          {result.posteriorProtrusion > 0 && (
            <g>
              <line 
                x1={frame.depth * scale} y1={(-yVal - rimH - 5) * scale}
                x2={(frame.depth + result.posteriorProtrusion) * scale} y2={(-yVal - rimH - 5) * scale}
                stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2"
              />
              <text 
                x={(frame.depth + result.posteriorProtrusion / 2) * scale} 
                y={(-yVal - rimH - 12) * scale} 
                textAnchor="middle" 
                className="text-[8px] font-bold fill-orange-500 uppercase tracking-tighter"
              >
                POST: {result.posteriorProtrusion.toFixed(1)}mm
              </text>
            </g>
          )}
        </g>
      </g>
    );
  };

  const renderFrontView = (isMain = false) => {
    // Scaling for front view
    // Bounded scales for thumbnail view to prevent overflow on large frames
    const maxThumbnailW = 85;
    const maxThumbnailH = 70;
    const boundedScale = Math.min(maxThumbnailW / frame.a, maxThumbnailH / frame.b, 1.6);
    const F_SCALE = isMain ? 5 : boundedScale; 
    
    // Position offsets
    let fx, fy;
    if (isMain) {
      fx = (VIEWBOX_W - (frame.a + frame.dbl) * F_SCALE) / 2;
      fy = (VIEWBOX_H - frame.b * F_SCALE) / 2;
    } else {
      fx = 40;
      fy = VIEWBOX_H - (frame.b * F_SCALE) - 35;
    }

    const rimThickness = 2.5 * F_SCALE;

    return (
      <g transform={`translate(${fx}, ${fy})`} className="text-slate-400">
         {/* Container background block for non-main thumbnail */}
         {!isMain && (
           <rect 
             x={-15} 
             y={-22} 
             width={frame.a * F_SCALE + 30} 
             height={frame.b * F_SCALE + 50} 
             fill="#f8fafc" 
             fillOpacity={0.75} 
             stroke="#cbd5e1" 
             strokeWidth="1" 
             strokeDasharray="4 2"
             rx={8} 
           />
         )}
         {/* Dimensions Labels - A & B */}
         {isMain && (
           <g className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest">
             {/* A Size Label */}
             <line x1={0} y1={-20} x2={frame.a * F_SCALE} y2={-20} stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
             <text x={frame.a * F_SCALE / 2} y={-30} textAnchor="middle">A: {frame.a}mm</text>
             
             {/* B Size Label */}
             <line x1={-20} y1={0} x2={-20} y2={frame.b * F_SCALE} stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
             <text x={-30} y={frame.b * F_SCALE / 2} textAnchor="middle" transform={`rotate(-90, -30, ${frame.b * F_SCALE / 2})`}>B: {frame.b}mm</text>

             {/* DBL Label */}
             <line x1={frame.a * F_SCALE} y1={frame.b * F_SCALE / 2} x2={(frame.a + frame.dbl) * F_SCALE} y2={frame.b * F_SCALE / 2} stroke="#3b82f6" strokeWidth="1.5" />
             <text x={(frame.a + frame.dbl/2) * F_SCALE} y={frame.b * F_SCALE / 2 - 10} textAnchor="middle" className="fill-blue-500">DBL: {frame.dbl}mm</text>
           </g>
         )}

         {/* Frame Rim */}
         <rect 
           x={-rimThickness/2} y={-rimThickness/2} 
           width={frame.a * F_SCALE + rimThickness} height={frame.b * F_SCALE + rimThickness} 
           fill="none" 
           stroke="url(#metallic-gradient)" strokeWidth={rimThickness}
           rx={isMain ? 8 : 4}
         />

         {/* Backdrop for lens */}
         <rect 
           x={0} y={0} 
           width={frame.a * F_SCALE} height={frame.b * F_SCALE} 
           fill="white" fillOpacity={isMain ? 0.3 : 0.5} 
           rx={isMain ? 6 : 4}
         />
         
         {/* ED Circle */}
         <circle 
           cx={frame.a * F_SCALE / 2} cy={frame.b * F_SCALE / 2} 
           r={frame.ed * F_SCALE / 2} 
           fill="none" stroke="#3b82f6" strokeWidth={isMain ? 2 : 1} strokeDasharray="6 3" opacity="0.4"
         />
         {isMain && (
           <text 
             x={frame.a * F_SCALE / 2 + (frame.ed * F_SCALE / 2)} 
             y={frame.b * F_SCALE / 2 - 10} 
             className="text-[9px] fill-blue-400 font-bold"
           >
             ED: {frame.ed}mm
           </text>
         )}

         {/* Pupil / PD Marker */}
         <g transform={`translate(${(frame.a / 2 - result.decentration) * F_SCALE}, ${(frame.b - patient.fittingHeight) * F_SCALE})`}>
            <circle r={2 * F_SCALE} fill="#ef4444" className="filter drop-shadow-sm" />
            <line x1={-15} y1={0} x2={15} y2={0} stroke="#ef4444" strokeWidth="1.5" />
            <line x1={0} y1={-15} x2={0} y2={15} stroke="#ef4444" strokeWidth="1.5" />
            {isMain && (
              <text y={-22} textAnchor="middle" className="text-[10px] font-black fill-red-500 uppercase tracking-widest">{t.pupil} (PD)</text>
            )}
         </g>

         {/* Lens Overhang (Heatmap Style) */}
         {isMain && (
           <g>
             {/* Visual indicator of overhang areas */}
             <rect 
               x={-4} y={-4} 
               width={frame.a * F_SCALE + 8} height={frame.b * F_SCALE + 8} 
               fill="none" stroke="#f59e0b" strokeWidth={result.et > 5 ? 6 : 2} 
               strokeOpacity={Math.min(0.3, result.et / 30)}
               strokeDasharray="10 5"
               rx={12}
             />
             <text x={frame.a * F_SCALE + 15} y={frame.b * F_SCALE + 15} className="text-[8px] fill-orange-500 font-bold uppercase italic">
               Max Protrusion: {Math.max(result.anteriorProtrusion, result.posteriorProtrusion).toFixed(1)}mm
             </text>
           </g>
         )}

         {/* Left Eye Hint if Main */}
         {isMain && (
           <g opacity="0.3">
             <rect 
               x={(frame.a + frame.dbl) * F_SCALE} y={0}
               width={frame.a * F_SCALE} height={frame.b * F_SCALE}
               fill="none" stroke="currentColor" strokeWidth="1" rx="8"
             />
             <text 
               x={(frame.a + frame.dbl + frame.a/2) * F_SCALE} 
               y={frame.b * F_SCALE + 20} 
               textAnchor="middle" 
               className="text-[8px] fill-slate-300 uppercase"
             >
               Left Eye
             </text>
           </g>
         )}

         {!isMain && (
           <>
             {/* Labels */}
             <text x={frame.a * F_SCALE / 2} y={-10} textAnchor="middle" className="text-[9px] font-bold fill-slate-500 uppercase tracking-widest">{t.frontView}</text>
             <text x={frame.a * F_SCALE / 2} y={(frame.b * F_SCALE) + 15} textAnchor="middle" className="text-[8px] fill-slate-400">Size: {frame.a} x {frame.b}mm</text>
           </>
         )}
      </g>
    );
  };

  const renderTopDown = () => {
    const scale = PX_PER_MM;
    const a = frame.a;
    const dbl = frame.dbl;
    const depth = frame.depth;
    
    // Lens profiles for top down
    // We'll reuse the logic but horizontal
    const getLensPathTop = (r: CalculationResult, l: LensParameters, side: number) => {
      const pos = r === result ? primaryPos : comparePos!;
      const { etX_start, etX_end } = pos;
      
      const r1 = Math.abs(r.r1);
      const r2 = Math.abs(r.r2);
      const sweepBack = r.backPower >= 0 ? 0 : 1;
      
      const getPt = (lx: number, ly: number) => `${centerX + lx * side * scale} ${centerY + ly * scale}`;
      
      const p1 = getPt(dbl/2, etX_start);
      const p2 = getPt(dbl/2 + a, etX_start);
      const p3 = getPt(dbl/2 + a, etX_end);
      const p4 = getPt(dbl/2, etX_end);

      const path = `M ${p1}
                    A ${r1 * scale} ${r1 * scale} 0 0 ${side === 1 ? 1 : 0} ${p2}
                    L ${p3}
                    A ${r2 * scale} ${r2 * scale} 0 0 ${side === 1 ? (1 - sweepBack) : sweepBack} ${p4}
                    Z`;
      return path;
    };

    const currentGrooveX = primaryPos.grooveX;

    return (
      <g>
        {/* Bridge */}
        <path 
          d={`M ${centerX - (dbl/2) * scale} ${centerY + currentGrooveX * scale} 
              Q ${centerX} ${centerY + (currentGrooveX - 5) * scale} 
                ${centerX + (dbl/2) * scale} ${centerY + currentGrooveX * scale}`}
          fill="none" stroke="#334155" strokeWidth="3" strokeOpacity="0.5"
        />
        
        {/* Frame Rims (Top/Bottom) */}
        {[-1, 1].map(side => (
          <g key={side}>
            <rect 
              x={centerX + (side === 1 ? dbl/2 : -dbl/2 - a) * scale}
              y={centerY}
              width={a * scale}
              height={depth * scale}
              fill="#334155" fillOpacity="0.1"
              stroke="url(#metallic-gradient)" strokeWidth="1.5"
              rx={2}
            />
            {/* Refined Temple arms with curves */}
            <g>
              {/* Hinge Joint */}
              <rect 
                x={centerX + (side === 1 ? dbl/2 + a - 1 : -dbl/2 - a - 1) * scale}
                y={centerY + 0.5 * scale}
                width={2 * scale} height={3 * scale}
                fill="url(#metallic-gradient)"
                rx={0.5}
              />
              {/* Curved Temple Arm */}
              <path 
                d={side === 1 
                  ? `M ${centerX + (dbl/2 + a) * scale} ${centerY + 2 * scale} 
                     C ${centerX + (dbl/2 + a + 5) * scale} ${centerY + 2 * scale}, 
                       ${centerX + (dbl/2 + a + 8) * scale} ${centerY + 20 * scale}, 
                       ${centerX + (dbl/2 + a + 4) * scale} ${centerY + 50 * scale}`
                  : `M ${centerX - (dbl/2 + a) * scale} ${centerY + 2 * scale} 
                     C ${centerX - (dbl/2 + a + 5) * scale} ${centerY + 2 * scale}, 
                       ${centerX - (dbl/2 + a + 8) * scale} ${centerY + 20 * scale}, 
                       ${centerX - (dbl/2 + a + 4) * scale} ${centerY + 50 * scale}`
                }
                fill="none" 
                stroke="#334155" 
                strokeWidth={2.5 * scale} 
                strokeOpacity="0.15" 
                strokeLinecap="round"
              />
            </g>
          </g>
        ))}

        {/* Lenses */}
        {[-1, 1].map(side => {
          const { etX_start, etX_end } = primaryPos;
          
          return (
            <g key={`lenses-${side}`}>
               {compareResult && compareLens && (
                  <motion.path 
                    animate={{ d: getLensPathTop(compareResult, compareLens, side) }}
                    fill="url(#diagonal-stripes)" fillOpacity="1.0" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5"
                  />
               )}
               <motion.path 
                  animate={{ d: getLensPathTop(result, lens, side) }}
                  fill="#3b82f6" fillOpacity="0.25" stroke="#3b82f6" strokeOpacity="0.4"
               />

               {/* Overhang Indicators Top/Side */}
               <g>
                 {/* Anterior */}
                 {etX_start < 0 && (
                    <line 
                      x1={centerX + (side === 1 ? dbl/2 + result.decentration : -dbl/2 - result.decentration) * scale}
                      y1={centerY + etX_start * scale}
                      x2={centerX + (side === 1 ? dbl/2 + result.decentration : -dbl/2 - result.decentration) * scale}
                      y2={centerY}
                      stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 1"
                    />
                 )}
                 {/* Posterior */}
                 {etX_end > depth && (
                    <line 
                      x1={centerX + (side === 1 ? dbl/2 + result.decentration : -dbl/2 - result.decentration) * scale}
                      y1={centerY + depth * scale}
                      x2={centerX + (side === 1 ? dbl/2 + result.decentration : -dbl/2 - result.decentration) * scale}
                      y2={centerY + etX_end * scale}
                      stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 1"
                    />
                 )}
               </g>
            </g>
          );
        })}

        {/* Labels */}
        <text x={centerX} y={centerY - 40} textAnchor="middle" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest">
           {t.topDown}
        </text>
        <text x={centerX - (dbl/2 + a/2) * scale} y={centerY + depth * scale + 20} textAnchor="middle" className="text-[9px] fill-slate-400">
           {t.pd}: {patient.pd}mm
        </text>
      </g>
    );
  };

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
            {renderFrame()}
            {renderFrontView(false)}
            
            {/* Comparison Result (Rendered first if exists to show behind) */}
            {compareResult && compareLens && (
              renderLensProfile(compareLens, compareResult, "#10b981", 0.15, "secondary")
            )}

            {/* Normal Mode or Base Result */}
            {renderLensProfile(lens, result, "#3b82f6", 0.25, "primary")}
          </>
        ) : view === 'top' ? (
          renderTopDown()
        ) : (
          renderFrontView(true)
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
