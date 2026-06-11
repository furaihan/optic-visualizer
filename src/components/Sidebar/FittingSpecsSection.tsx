import React from "react";
import { PatientParameters } from "../../lib/optic-engine/types";
import { translations, Language } from "../../lib/translations";
import { UserIcon, EyeIcon, RulerIcon, ChevronDownIcon } from "lucide-react";
import { INPUT_SPECS } from "../../lib/optic-engine/validation";
import { Control } from "./Control";
import { BevelControl } from "./BevelControl";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
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
          <UserIcon size={12} className={cn("text-orange-500", "transition-colors")} />
          <span>{t.fittingSpecs}</span>
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
            label={t.pd}
            unit="mm"
            min={INPUT_SPECS.pd.min}
            max={INPUT_SPECS.pd.max}
            step={INPUT_SPECS.pd.step}
            value={patient.pd}
            onChange={(v) => onPatientChange({ ...patient, pd: v })}
            lang={lang}
            icon={<EyeIcon size={13} className="text-orange-500" />}
            isRecalculating={false}
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
            icon={<RulerIcon size={13} className="text-orange-500" />}
            isRecalculating={false}
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
