import React, { useState, useEffect } from 'react';
import { Minus, Plus, Lightbulb } from 'lucide-react';
import { Language, translations } from '../../lib/translations';
import { Input } from '../ui/input';
import { LabelWithTooltip } from './LabelWithTooltip';

interface ControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit: string;
  lang: Language;
  icon?: React.ReactNode;
  isRecalculating?: boolean;
}

export const Control: React.FC<ControlProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange, 
  unit, 
  lang, 
  icon,
  isRecalculating
}) => {
  const [typedVal, setTypedVal] = useState(value.toString());

  useEffect(() => {
    setTypedVal(value.toString());
  }, [value]);

  const isAxis = unit === '°';
  const inputWidthClass = isAxis ? 'min-w-12 max-w-14' : 'min-w-16 max-w-20';

  const commitVal = (v: number) => {
    const snapped = Math.round(v / step) * step;
    const clamped = Math.min(max, Math.max(min, snapped));
    const fixed = parseFloat(clamped.toFixed(10));
    onChange(fixed);
    setTypedVal(fixed.toString());
  };

  const handleTypedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedVal(e.target.value);
  };

  const handleBlur = () => {
    const parsed = parseFloat(typedVal);
    if (isNaN(parsed)) {
      setTypedVal(value.toString());
    } else {
      commitVal(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = parseFloat(typedVal);
      if (!isNaN(parsed)) {
        commitVal(parsed);
      }
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[11px] py-1">
        <LabelWithTooltip 
          label={label} 
          lang={lang} 
          className="pr-1 select-none leading-tight dark:text-slate-300" 
          icon={icon} 
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`flex items-center border border-slate-200 dark:border-slate-800 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-400/30 rounded-lg overflow-hidden bg-white dark:bg-slate-950 shadow-sm h-8 transition-colors duration-300 ${isRecalculating ? 'ring-2 ring-blue-400/50 border-blue-400 bg-blue-50/50 dark:bg-blue-900/30' : ''}`}>
            <button 
              onClick={() => commitVal(value - step)}
              className="w-8 h-8 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-r border-slate-100 dark:border-slate-800/60 transition-colors active:bg-slate-200 dark:active:bg-slate-800 cursor-pointer animate-none"
              title="Decrease"
            >
              <Minus size={11} strokeWidth={3} />
            </button>
            <Input 
              type="text"
              value={typedVal}
              onChange={handleTypedChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={`border-0 focus:ring-2 focus:ring-blue-400/30 focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-blue-50/30 dark:focus:bg-blue-950/20 rounded-none bg-white dark:bg-slate-950 text-center font-mono text-xs font-bold text-slate-800 dark:text-slate-100 p-0 h-8 ${inputWidthClass}`}
            />
            <button 
              onClick={() => commitVal(value + step)}
              className="w-8 h-8 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-l border-slate-100 dark:border-slate-800/60 transition-colors active:bg-slate-200 dark:active:bg-slate-800 cursor-pointer animate-none"
              title="Increase"
            >
              <Plus size={11} strokeWidth={3} />
            </button>
          </div>
          <span className="text-slate-400 dark:text-slate-500 font-mono font-bold w-6 text-[10px] text-left shrink-0 pl-1 select-none">{unit}</span>
        </div>
      </div>

      {label.includes("(BC)") && (
        <div className="text-[10px] text-slate-500 leading-normal mt-1 bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded-lg border border-blue-100/30 dark:border-blue-900/30 flex gap-2">
          <Lightbulb size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <span>
            <span><strong>{translations[lang].bcRecLabel}</strong> {translations[lang].bcRecText}</span>
          </span>
        </div>
      )}
    </div>
  );
};
