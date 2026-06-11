import React, { useState } from "react";
import { LensParameters, LensIndex } from "../../lib/optic-engine/types";
import { translations, Language } from "../../lib/translations";
import {
  LayersIcon,
  ApertureIcon,
  GaugeIcon,
  ZapIcon,
  EyeIcon,
} from "lucide-react";
import { INPUT_SPECS } from "../../lib/optic-engine/validation";
import { Control } from "./Control";
import { RefractiveIndexDropdown } from "./RefractiveIndexDropdown";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { FieldGroup } from "../ui/field";

interface LensParametersSectionProps {
  lens: LensParameters;
  onLensChange: (lens: LensParameters) => void;
  lang: Language;
  indices: LensIndex[];
  isOpen: boolean;
  onToggle: (key: string) => void;
}

export const LensParametersSection: React.FC<LensParametersSectionProps> = ({
  lens,
  onLensChange,
  lang,
  indices,
  isOpen,
  onToggle,
}) => {
  const t = translations[lang];

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={() => onToggle("lens")}
      className="border-b border-slate-100 dark:border-slate-800 last:border-0 py-3"
    >
      <CollapsibleTrigger
        className={cn(
          "w-full text-[11px] font-bold text-slate-500 hover:text-slate-800",
          "dark:text-slate-400 dark:hover:text-slate-200 uppercase tracking-wider",
          "flex items-center justify-between py-2 cursor-pointer transition-colors outline-none",
          "hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded px-1 -mx-1",
        )}
      >
        <div className="flex items-center gap-1.5">
          <LayersIcon size={12} className={cn("text-blue-500", "transition-colors")} />
          <span>{t.lensParams}</span>
        </div>
        <ChevronDownIcon
          size={14}
          className={cn(
            "text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <FieldGroup className="mt-3 text-left py-1 gap-4">
          <Control
            label={t.sphere}
            unit=" D"
            min={INPUT_SPECS.sph.min}
            max={INPUT_SPECS.sph.max}
            step={INPUT_SPECS.sph.step}
            value={lens.sph}
            onChange={(v) => onLensChange({ ...lens, sph: v })}
            lang={lang}
            icon={<ApertureIcon size={13} className="text-blue-500" />}
            isRecalculating={false}
          />
          <Control
            label={t.cylinder}
            unit=" D"
            min={INPUT_SPECS.cyl.min}
            max={INPUT_SPECS.cyl.max}
            step={INPUT_SPECS.cyl.step}
            value={lens.cyl}
            onChange={(v) => onLensChange({ ...lens, cyl: v })}
            lang={lang}
            icon={<GaugeIcon size={13} className="text-blue-500" />}
            isRecalculating={false}
          />
          <Control
            label={t.axis}
            unit="°"
            min={INPUT_SPECS.axis.min}
            max={INPUT_SPECS.axis.max}
            step={INPUT_SPECS.axis.step}
            value={lens.axis}
            onChange={(v) => onLensChange({ ...lens, axis: v })}
            lang={lang}
            icon={<ZapIcon size={13} className="text-blue-500" />}
            isRecalculating={false}
          />

          <RefractiveIndexDropdown
            index={lens.index}
            onChange={(v) => onLensChange({ ...lens, index: v })}
            indices={indices}
            lang={lang}
          />

          <Control
            label={t.baseCurve}
            unit=" D"
            min={INPUT_SPECS.baseCurve.min}
            max={INPUT_SPECS.baseCurve.max}
            step={INPUT_SPECS.baseCurve.step}
            value={lens.baseCurve}
            onChange={(v) => onLensChange({ ...lens, baseCurve: v })}
            lang={lang}
            icon={<ApertureIcon size={13} className="text-blue-500" />}
            isRecalculating={false}
          />
        </FieldGroup>
      </CollapsibleContent>
    </Collapsible>
  );
};
