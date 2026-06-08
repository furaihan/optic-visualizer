import React, { useState, useEffect } from 'react';
import { MinusIcon, PlusIcon, LightbulbIcon } from "lucide-react";
import { Language, translations } from '../../lib/translations';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../ui/input-group';
import { Field, FieldLabel, FieldContent, FieldDescription } from '../ui/field';
import { cn } from '../../lib/utils';
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
    <Field orientation="vertical" className="py-1.5 gap-1.5">
      <FieldLabel className="w-auto flex-none m-0 items-center">
        <LabelWithTooltip 
          label={label} 
          lang={lang} 
          className="select-none leading-tight dark:text-slate-300" 
          icon={icon} 
        />
      </FieldLabel>
      <FieldContent>
        <InputGroup className={cn("h-8 transition-colors duration-300 w-full", isRecalculating ? "ring-2 ring-blue-400/50 border-blue-400 bg-blue-50/50 dark:bg-blue-900/30" : "")}>
           <InputGroupAddon align="inline-start" className="pl-0 border-r border-slate-100 dark:border-slate-800">
            <InputGroupButton
              size="icon-xs"
              onClick={() => commitVal(value - step)}
              title="Decrease"
              className="w-8 h-full rounded-none"
            >
              <MinusIcon size={11} strokeWidth={3} className="text-slate-500 dark:text-slate-400" />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupInput 
            type="text"
            value={typedVal}
            onChange={handleTypedChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="text-center font-mono text-xs font-bold text-slate-800 dark:text-slate-100 px-0 h-8 w-full"
          />
           <InputGroupAddon align="inline-end" className="pr-0 border-l border-slate-100 dark:border-slate-800">
            <InputGroupButton
              size="icon-xs"
              onClick={() => commitVal(value + step)}
              title="Increase"
              className="w-8 h-full rounded-none"
            >
              <PlusIcon size={11} strokeWidth={3} className="text-slate-500 dark:text-slate-400" />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end" className="pr-2 pl-1 pointer-events-none text-[10px] text-slate-400 font-mono font-bold w-6 text-right">
            {unit}
          </InputGroupAddon>
        </InputGroup>
      </FieldContent>
      {label.includes("(BC)") && (
        <FieldDescription className="mt-0 bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded-lg border border-blue-100/30 dark:border-blue-900/30 flex gap-2 w-full flex-none">
          <LightbulbIcon size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <span>
            <span><strong>{translations[lang].bcRecLabel}</strong> {translations[lang].bcRecText}</span>
          </span>
        </FieldDescription>
      )}
    </Field>
  );
};
