import React from 'react';
import { FrameParameters, CalculationResult } from '../../lib/optical';
import { Language, translations } from '../../lib/i18n';
import { LensPosition } from './types';

interface FrameProfileProps {
  frame: FrameParameters;
  result: CalculationResult;
  pos: LensPosition;
  scale: number;
  centerX: number;
  centerY: number;
  lang: Language;
}

export const FrameProfile: React.FC<FrameProfileProps> = ({
  frame,
  result,
  pos,
  scale,
  centerX,
  centerY,
  lang,
}) => {
  const t = translations[lang];
  const yVal = frame.a / 2;
  const rimH = 5; 

  // Current lens positions for overhang labels
  const { etX_start, etX_end, grooveX: currentGrooveX } = pos;

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
