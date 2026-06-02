import React from 'react';
import { motion } from 'motion/react';
import { LensParameters, CalculationResult } from '../../lib/optical';
import { Language, translations } from '../../lib/i18n';
import { LensPosition, HoverLabel } from './types';

interface LensProfileProps {
  lens: LensParameters;
  result: CalculationResult;
  pos: LensPosition;
  color: string;
  opacity: number;
  label?: 'primary' | 'secondary';
  scale: number;
  centerX: number;
  centerY: number;
  frameA: number;
  lang: Language;
  onHoverLabel: (hover: HoverLabel | null) => void;
  primaryPos: LensPosition;
  comparePos: LensPosition | null;
}

export const LensProfile: React.FC<LensProfileProps> = ({
  lens,
  result,
  pos,
  color,
  opacity,
  label = 'primary',
  scale,
  centerX,
  centerY,
  frameA,
  lang,
  onHoverLabel,
}) => {
  const t = translations[lang];
  const yVal = frameA / 2;
  const { etX_start, etX_end, frontApexX } = pos;

  const getCurvePath = (x1: number, y1: number, x2: number, y2: number, rVal: number, sweep: number) => {
    if (!Number.isFinite(rVal)) {
      return `L ${x2 * scale} ${y2 * scale}`;
    }
    return `A ${Math.abs(rVal) * scale} ${Math.abs(rVal) * scale} 0 0 ${sweep} ${x2 * scale} ${y2 * scale}`;
  };

  const sweepBack = result.backPower >= 0 ? 0 : 1;

  const lensPath = `M ${etX_start * scale} ${-yVal * scale}
                    ${getCurvePath(etX_start, -yVal, etX_start, yVal, result.r1, 0)}
                    L ${etX_end * scale} ${yVal * scale}
                    ${getCurvePath(etX_end, yVal, etX_end, -yVal, result.r2, sweepBack)}
                    Z`;

  const rawLabelX = (etX_end + 10) * scale;
  // Viewport width boundary calculations
  const VIEWBOX_W = 550;
  const clampedLabelX = Math.max(-centerX + 15, Math.min(rawLabelX, VIEWBOX_W - 65 - centerX));

  return (
    <g transform={`translate(${centerX}, ${centerY})`} key={label}>
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
          onMouseEnter={() => onHoverLabel({
            title: `Center Thickness (CT): ${result.ct.toFixed(2)}mm`,
            desc: lang === 'id' ? "Ketebalan pusat lensa" : "Thickness at optical center",
            x: (frontApexX + (result.ct / 2)) * scale,
            y: -14
          })}
          onMouseLeave={() => onHoverLabel(null)}
        >
          <rect 
            x={(frontApexX + (result.ct / 2)) * scale - 24} 
            y={-23} 
            width={48} 
            height={12} 
            fill="#0f172a" 
            fillOpacity={0.08} 
            rx={3} 
          />
          <text 
            x={(frontApexX + (result.ct / 2)) * scale} 
            y={-14} 
            textAnchor="middle" 
            fill="currentColor"
            className="text-[9px] font-bold"
          >
            CT: {result.ct.toFixed(1)}mm
          </text>
        </g>

        {/* ET Tooltip Area */}
        <g 
          className="cursor-help pointer-events-auto"
          onMouseEnter={() => onHoverLabel({
            title: `Edge Thickness (ET): ${result.et.toFixed(2)}mm`,
            desc: lang === 'id' ? "Ketebalan tepi terluar lensa" : "Thickness at lens outer boundary",
            x: clampedLabelX + 24,
            y: (yVal + 3) * scale
          })}
          onMouseLeave={() => onHoverLabel(null)}
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
            ET: {result.et.toFixed(1)}mm
          </text>
        </g>
      </g>
    </g>
  );
};
