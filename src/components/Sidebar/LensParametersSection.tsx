import React from "react";
import { LensParameters, LensIndex } from "../../lib/optic-engine/types";
import { translations, Language } from "../../lib/translations";
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
      className="py-1"
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full cursor-pointer items-center justify-between py-2 text-left",
          "text-[13px] font-medium text-sheet-ink outline-none",
          "transition-colors duration-150 hover:text-sheet-accent",
        )}
      >
        <span>{t.lensParams}</span>
        <ChevronDownIcon
          size={15}
          className={cn(
            "shrink-0 text-sheet-muted transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <FieldGroup className="gap-3 pb-3 pt-2 text-left">
          <Control
            label={t.sphere}
            unit="D"
            min={INPUT_SPECS.sph.min}
            max={INPUT_SPECS.sph.max}
            step={INPUT_SPECS.sph.step}
            value={lens.sph}
            onChange={(v) => onLensChange({ ...lens, sph: v })}
            lang={lang}
          />
          <Control
            label={t.cylinder}
            unit="D"
            min={INPUT_SPECS.cyl.min}
            max={INPUT_SPECS.cyl.max}
            step={INPUT_SPECS.cyl.step}
            value={lens.cyl}
            onChange={(v) => onLensChange({ ...lens, cyl: v })}
            lang={lang}
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
          />

          <RefractiveIndexDropdown
            index={lens.index}
            onChange={(v) => onLensChange({ ...lens, index: v })}
            indices={indices}
            lang={lang}
          />

          <Control
            label={t.baseCurve}
            unit="D"
            min={INPUT_SPECS.baseCurve.min}
            max={INPUT_SPECS.baseCurve.max}
            step={INPUT_SPECS.baseCurve.step}
            value={lens.baseCurve}
            onChange={(v) => onLensChange({ ...lens, baseCurve: v })}
            lang={lang}
          />
        </FieldGroup>
      </CollapsibleContent>
    </Collapsible>
  );
};
