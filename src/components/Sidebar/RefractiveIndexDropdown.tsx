import React from "react";
import { LensIndex } from "../../lib/optic-engine/types";
import { translations, Language } from "../../lib/translations";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../ui/dropdown-menu";
import { Field, FieldLabel, FieldContent } from "../ui/field";
import { LabelWithTooltip } from "./LabelWithTooltip";

interface RefractiveIndexDropdownProps {
  index: LensIndex;
  onChange: (index: LensIndex) => void;
  indices: LensIndex[];
  lang: Language;
  showLabel?: boolean;
  showIcon?: boolean;
}

/**
 * The index ladder, as a menu. The material name is the useful part: 1.61 means
 * nothing to a patient, MR-8 does to a lab.
 */
const MATERIAL_FOR: Record<number, string> = {
  1.5: 'CR-39',
  1.56: 'NK-55',
  1.6: 'MR-8',
  1.67: 'MR-10',
  1.74: 'MR-174',
};

export const RefractiveIndexDropdown: React.FC<RefractiveIndexDropdownProps> = ({
  index,
  onChange,
  indices,
  lang,
  showLabel = true,
}) => {
  const t = translations[lang];

  const trigger = (
    <DropdownMenuTrigger
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-sm border border-sheet-ground bg-sheet-ground px-3 text-left",
        "text-[16px] font-medium text-sheet-ink tnum transition-colors duration-150",
        "hover:bg-sheet-stage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent",
        showLabel ? "h-9" : "h-9",
      )}
      aria-label={t.refractiveIndex}
    >
      <span className="flex items-baseline gap-2">
        <span>{index.toFixed(2)}</span>
        <span className="text-[13px] font-normal text-sheet-muted">
          {MATERIAL_FOR[index] ?? ''}
        </span>
      </span>
      <ChevronDownIcon size={14} className="shrink-0 text-sheet-muted" aria-hidden="true" />
    </DropdownMenuTrigger>
  );

  const menu = (
    <DropdownMenuContent className="w-(--anchor-width) min-w-0 rounded-sm" align="start">
      <DropdownMenuRadioGroup
        value={index.toString()}
        onValueChange={(val) => onChange(parseFloat(val) as LensIndex)}
      >
        {indices.map((idx) => (
          <DropdownMenuRadioItem
            key={idx}
            value={idx.toString()}
            className="py-2 text-[16px] font-normal tnum"
          >
            <span className="flex w-full items-baseline justify-between gap-3">
              <span>{idx.toFixed(2)}</span>
              <span className="text-[13px] text-sheet-muted">{MATERIAL_FOR[idx] ?? ''}</span>
            </span>
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  );

  if (!showLabel) {
    return (
      <DropdownMenu>
        {trigger}
        {menu}
      </DropdownMenu>
    );
  }

  return (
    <Field orientation="vertical" className="gap-1.5">
      <FieldLabel className="m-0 w-auto flex-none items-center">
        <LabelWithTooltip label={t.refractiveIndex} lang={lang} />
      </FieldLabel>
      <FieldContent>
        <DropdownMenu>
          {trigger}
          {menu}
        </DropdownMenu>
      </FieldContent>
    </Field>
  );
};
