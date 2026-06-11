import { Language } from "@/src/lib/translations";
import { Field, FieldContent, FieldLabel } from "@shadcn/field";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { RulerIcon } from "lucide-react";
import { FrameInput } from "./FrameInput";
import { LimitAlertButton } from "./LimitAlertButton";

/**
 * FrameParamField - Encapsulate frame parameter input + label + alert
 */
interface FrameParamFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  isExceeding: boolean;
  fieldName: "a" | "b" | "dbl" | "ed";
  onValueChange: (value: number) => void;
  onMouseEnter: (field: "a" | "b" | "dbl" | "ed" | null) => void;
  onMouseLeave: () => void;
  highlightedLimit: "a" | "b" | "dbl" | "ed" | null;
  alertTitle: string;
  lang: Language;
}

export const FrameParamField: React.FC<FrameParamFieldProps> = ({
  label,
  value,
  min,
  max,
  isExceeding,
  fieldName,
  onValueChange,
  onMouseEnter,
  onMouseLeave,
  highlightedLimit,
  alertTitle,
  lang,
}) => (
  <Field orientation="vertical" className="gap-1.5">
    <div className="flex items-center justify-between w-full">
      <FieldLabel className="w-auto flex-none m-0 items-center">
        <LabelWithTooltip
          label={label}
          lang={lang}
          isUppercaseHeader
          icon={<RulerIcon size={11} className="text-emerald-500" />}
        />
      </FieldLabel>
      <LimitAlertButton
        fieldName={fieldName}
        isExceeding={isExceeding}
        title={alertTitle}
        onMouseEnter={() => onMouseEnter(fieldName)}
        onMouseLeave={onMouseLeave}
        isHighlighted={highlightedLimit === fieldName}
        onClick={() =>
          onMouseEnter(highlightedLimit === fieldName ? null : fieldName)
        }
      />
    </div>
    <FieldContent>
      <FrameInput
        value={value}
        min={min}
        max={max}
        isExceeding={isExceeding}
        onChange={onValueChange}
      />
    </FieldContent>
  </Field>
);
