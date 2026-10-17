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

/**
 * One numeric input: a stepper on each side and the value in the middle.
 * Figures are tabular so a column of them lines up.
 */
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
}) => {
  const [typedVal, setTypedVal] = useState(value.toString());

  useEffect(() => {
    setTypedVal(value.toString());
  }, [value]);

  const commitVal = (v: number) => {
    const snapped = Math.round(v / step) * step;
    const clamped = Math.min(max, Math.max(min, snapped));
    const fixed = parseFloat(clamped.toFixed(10));
    onChange(fixed);
    setTypedVal(fixed.toString());
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
    <Field orientation="vertical" className="gap-1.5 py-1">
      <FieldLabel className="m-0 w-auto flex-none items-center">
        <LabelWithTooltip
          label={label}
          lang={lang}
          className="select-none leading-tight text-sheet-ink"
          icon={icon}
        />
      </FieldLabel>
      <FieldContent>
        <InputGroup className="h-9 w-full rounded-sm border-sheet-ground bg-sheet-ground">
          <InputGroupAddon align="inline-start" className="pl-0">
            <InputGroupButton
              size="icon-xs"
              onClick={() => commitVal(value - step)}
              title="Decrease"
              aria-label={`${label} decrease`}
              className="h-full w-8 rounded-none text-sheet-muted hover:bg-sheet-stage hover:text-sheet-ink"
            >
              <MinusIcon size={12} strokeWidth={2.5} aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            inputMode="decimal"
            value={typedVal}
            onChange={(e) => setTypedVal(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-label={label}
            className="h-9 w-full px-0 text-center text-[16px] font-medium text-sheet-ink tnum"
          />
          <InputGroupAddon align="inline-end" className="pr-0">
            <InputGroupButton
              size="icon-xs"
              onClick={() => commitVal(value + step)}
              title="Increase"
              aria-label={`${label} increase`}
              className="h-full w-8 rounded-none text-sheet-muted hover:bg-sheet-stage hover:text-sheet-ink"
            >
              <PlusIcon size={12} strokeWidth={2.5} aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupAddon
            align="inline-end"
            className="pointer-events-none w-7 pl-1 pr-2 text-right text-[13px] text-sheet-muted tnum"
          >
            {unit}
          </InputGroupAddon>
        </InputGroup>
      </FieldContent>
      {label.includes("(BC)") && (
        <FieldDescription className="mt-1 flex w-full flex-none gap-2 bg-sheet-info p-2.5 text-[13px] leading-snug text-sheet-ink">
          <LightbulbIcon size={14} className="mt-0.5 shrink-0 text-sheet-accent" aria-hidden="true" />
          <span>
            <strong className="font-medium">{translations[lang].bcRecLabel}</strong>{' '}
            {translations[lang].bcRecText}
          </span>
        </FieldDescription>
      )}
    </Field>
  );
};
