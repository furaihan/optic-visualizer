import React from "react";
import { PatientParameters } from "../../lib/optic-engine/types";
import { translations, Language } from "../../lib/translations";
import { INPUT_SPECS } from "../../lib/optic-engine/validation";
import { Control } from "./Control";
import { BevelControl } from "./BevelControl";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { FieldGroup } from "../ui/field";

interface FittingSpecsSectionProps {
  patient: PatientParameters;
  onPatientChange: (patient: PatientParameters) => void;
  bevelPercent: number;
  onBevelChange: (percent: number) => void;
  lang: Language;
  isOpen: boolean;
  onToggle: (key: string) => void;
}

export const FittingSpecsSection: React.FC<FittingSpecsSectionProps> = ({
  patient,
  onPatientChange,
  bevelPercent,
  onBevelChange,
  lang,
  isOpen,
  onToggle,
}) => {
  const t = translations[lang];

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={() => onToggle("fitting")}
      className="py-1"
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full cursor-pointer items-center justify-between py-2 text-left",
          "text-[13px] font-medium text-sheet-ink outline-none",
          "transition-colors duration-150 hover:text-sheet-accent",
        )}
      >
        <span>{t.fittingSpecs}</span>
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
            label={t.pd}
            unit="mm"
            min={INPUT_SPECS.pd.min}
            max={INPUT_SPECS.pd.max}
            step={INPUT_SPECS.pd.step}
            value={patient.pd}
            onChange={(v) => onPatientChange({ ...patient, pd: v })}
            lang={lang}
          />
          <Control
            label={t.fittingHeight}
            unit="mm"
            min={INPUT_SPECS.fittingHeight.min}
            max={INPUT_SPECS.fittingHeight.max}
            step={INPUT_SPECS.fittingHeight.step}
            value={patient.fittingHeight}
            onChange={(v) => onPatientChange({ ...patient, fittingHeight: v })}
            lang={lang}
          />

          <BevelControl
            bevelPercent={bevelPercent}
            onBevelChange={onBevelChange}
            lang={lang}
          />
        </FieldGroup>
      </CollapsibleContent>
    </Collapsible>
  );
};
