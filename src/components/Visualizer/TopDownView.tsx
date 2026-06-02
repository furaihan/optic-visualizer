import React from 'react';
import { motion } from 'motion/react';
import { LensParameters, FrameParameters, PatientParameters, CalculationResult } from '../../lib/optical';
import { Language, translations } from '../../lib/i18n';
import { LensPosition } from './types';

interface TopDownViewProps {
  lens: LensParameters;
  frame: FrameParameters;
  patient: PatientParameters;
  result: CalculationResult;
  compareResult?: CalculationResult;
  compareLens?: LensParameters;
  lang: Language;
  scale: number;
  centerX: number;
  centerY: number;
  primaryPos: LensPosition;
  comparePos: LensPosition | null;
  highlightedLimit?: 'a' | 'b' | 'dbl' | 'ed' | null;
}

export const TopDownView: React.FC<TopDownViewProps> = ({
  lens,
  frame,
  patient,
  result,
  compareResult,
  compareLens,
  lang,
  scale,
  centerX,
  centerY,
  primaryPos,
  comparePos,
  highlightedLimit = null,
}) => {
  const t = translations[lang];
  const a = frame.a;
  const dbl = frame.dbl;
  const depth = frame.depth;
  
  // Lens profiles for top down
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
        fill="none" 
        stroke={highlightedLimit === 'dbl' ? "#f59e0b" : "#334155"} 
        strokeWidth={highlightedLimit === 'dbl' ? "5" : "3"} 
        strokeOpacity={highlightedLimit === 'dbl' ? "0.9" : "0.5"}
        className={highlightedLimit === 'dbl' ? "animate-pulse" : ""}
      />
      
      {/* Frame Rims (Top/Bottom) */}
      {[-1, 1].map(side => (
        <g key={side}>
          <rect 
            x={centerX + (side === 1 ? dbl/2 : -dbl/2 - a) * scale}
            y={centerY}
            width={a * scale}
            height={depth * scale}
            fill={highlightedLimit === 'a' ? "#f59e0b" : "#334155"} 
            fillOpacity={highlightedLimit === 'a' ? 0.3 : 0.1}
            stroke={highlightedLimit === 'a' ? "#f59e0b" : "url(#metallic-gradient)"} 
            strokeWidth={highlightedLimit === 'a' ? "2.5" : "1.5"}
            className={highlightedLimit === 'a' ? "animate-pulse" : ""}
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
                fill="#3b82f6" fillOpacity={highlightedLimit === 'a' || highlightedLimit === 'ed' ? 0.35 : 0.25} 
                stroke={highlightedLimit === 'a' || highlightedLimit === 'ed' ? "#f59e0b" : "#3b82f6"} 
                strokeOpacity="0.4"
                className={highlightedLimit === 'a' || highlightedLimit === 'ed' ? "animate-pulse" : ""}
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

      {/* Floating Highlight indicators in TopDown */}
      {highlightedLimit === 'ed' && (
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={frame.ed * scale / 2} 
          fill="none" 
          stroke="#f59e0b" 
          strokeWidth="3" 
          strokeDasharray="6 4" 
          className="animate-pulse"
        />
      )}

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
