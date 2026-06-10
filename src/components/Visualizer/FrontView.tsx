import React from 'react';
import { FrameParameters, PatientParameters, CalculationResult } from '../../lib/optic-engine/types';
import { Language, translations } from '../../lib/translations';

interface FrontViewProps {
  frame: FrameParameters;
  patient: PatientParameters;
  result: CalculationResult;
  lang: Language;
  isMain?: boolean;
  highlightedLimit?: 'a' | 'b' | 'dbl' | 'ed' | null;
}

export const FrontView: React.FC<FrontViewProps> = ({
  frame,
  patient,
  result,
  lang,
  isMain = false,
  highlightedLimit = null,
}) => {
  const t = translations[lang];
  const VIEWBOX_W = 550;
  const VIEWBOX_H = 550;

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
         <g className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest text-left">
           {/* A Size Label */}
           <g className={highlightedLimit === 'a' ? "text-amber-500 fill-amber-500 font-extrabold animate-pulse-soft" : "text-slate-400 fill-slate-400"}>
             <line 
               x1={0} y1={-20} x2={frame.a * F_SCALE} y2={-20} 
               stroke="currentColor" 
               strokeWidth={highlightedLimit === 'a' ? 3 : 1} 
               strokeDasharray={highlightedLimit === 'a' ? "0" : "4 2"} 
             />
             <text x={frame.a * F_SCALE / 2} y={-30} textAnchor="middle">
               A: {frame.a}mm {highlightedLimit === 'a' && '⚠️'}
             </text>
           </g>
           
           {/* B Size Label */}
           <g className={highlightedLimit === 'b' ? "text-amber-500 fill-amber-500 font-extrabold animate-pulse-soft" : "text-slate-400 fill-slate-400"}>
             <line 
               x1={-20} y1={0} x2={-20} y2={frame.b * F_SCALE} 
               stroke="currentColor" 
               strokeWidth={highlightedLimit === 'b' ? 3 : 1} 
               strokeDasharray={highlightedLimit === 'b' ? "0" : "4 2"} 
             />
             <text x={-30} y={frame.b * F_SCALE / 2} textAnchor="middle" transform={`rotate(-90, -30, ${frame.b * F_SCALE / 2})`}>
               B: {frame.b}mm {highlightedLimit === 'b' && '⚠️'}
             </text>
           </g>

           {/* DBL Label */}
           <g className={highlightedLimit === 'dbl' ? "text-amber-500 fill-amber-500 font-extrabold animate-pulse-soft" : "text-blue-500 fill-blue-500"}>
             <line 
               x1={frame.a * F_SCALE} y1={frame.b * F_SCALE / 2} x2={(frame.a + frame.dbl) * F_SCALE} y2={frame.b * F_SCALE / 2} 
               stroke="currentColor" 
               strokeWidth={highlightedLimit === 'dbl' ? 3.5 : 1.5} 
             />
             <text x={(frame.a + frame.dbl/2) * F_SCALE} y={frame.b * F_SCALE / 2 - 10} textAnchor="middle" className="font-bold">
               DBL: {frame.dbl}mm {highlightedLimit === 'dbl' && '⚠️'}
             </text>
           </g>
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
       <g className={highlightedLimit === 'ed' ? "text-amber-500 fill-amber-500 font-extrabold animate-pulse-soft" : "text-blue-400 fill-blue-400"}>
         <circle 
           cx={frame.a * F_SCALE / 2} cy={frame.b * F_SCALE / 2} 
           r={frame.ed * F_SCALE / 2} 
           fill="none" 
           stroke={highlightedLimit === 'ed' ? "currentColor" : "#3b82f6"} 
           strokeWidth={highlightedLimit === 'ed' ? 3.5 : (isMain ? 2 : 1)} 
           strokeDasharray={highlightedLimit === 'ed' ? "8 4" : "6 3"} 
           opacity={highlightedLimit === 'ed' ? 0.9 : 0.4}
         />
         {isMain && (
           <text 
             x={frame.a * F_SCALE / 2 + (frame.ed * F_SCALE / 2)} 
             y={frame.b * F_SCALE / 2 - 10} 
             className="text-[9px] font-bold fill-current"
           >
             ED: {frame.ed}mm {highlightedLimit === 'ed' && '⚠️'}
           </text>
         )}
       </g>

       {/* Pupil / PD Marker */}
       <g transform={`translate(${(frame.a / 2 - result.decentration) * F_SCALE}, ${(frame.b - patient.fittingHeight) * F_SCALE})`}>
          <circle r={2 * F_SCALE} fill="#ef4444" className="filter drop-shadow-sm" />
          <line x1={-15} y1={0} x2={15} y2={0} stroke="#ef4444" strokeWidth="1.5" />
          <line x1={0} y1={-15} x2={0} y2={15} stroke="#ef4444" strokeWidth="1.5" />
          {isMain && (
            <text y={-22} textAnchor="middle" className="text-[10px] font-black fill-red-500 uppercase tracking-widest text-left">{t.pupil} (PD)</text>
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
           <text x={frame.a * F_SCALE + 15} y={frame.b * F_SCALE + 15} className="text-[8px] fill-orange-500 font-bold uppercase italic text-left">
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
             className="text-[8px] fill-slate-300 uppercase text-left"
           >
             Left Eye
           </text>
         </g>
       )}

       {!isMain && (
         <>
           {/* Labels */}
           <text x={frame.a * F_SCALE / 2} y={-10} textAnchor="middle" className="text-[9px] font-bold fill-slate-500 uppercase tracking-widest text-left">{t.frontView}</text>
           <text x={frame.a * F_SCALE / 2} y={(frame.b * F_SCALE) + 15} textAnchor="middle" className="text-[8px] fill-slate-400 text-left">Size: {frame.a} x {frame.b}mm</text>
         </>
       )}
    </g>
  );
};
