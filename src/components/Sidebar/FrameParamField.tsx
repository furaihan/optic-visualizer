import { Language } from "@/src/lib/translations";
import { Field, FieldContent, FieldLabel } from "@shadcn/field";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { FrameInput } from "./FrameInput";
import { LimitAlertButton } from "./LimitAlertButton";

/**
 * A frame dimension: its name, the range check, and the value.
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
    <div className="flex w-full items-center justify-between gap-2">
      <FieldLabel className="m-0 w-auto flex-none items-center">
        <LabelWithTooltip label={label} lang={lang} />
      </FieldLabel>
      {isExceeding && (
        <LimitAlertButton
          fieldName={fieldName}
          isExceeding={isExceeding}
          title={alertTitle}
          onMouseEnter={() => onMouseEnter(fieldName)}
          onMouseLeave={onMouseLeave}
          isHighlighted={highlightedLimit === fieldName}
          onClick={() => onMouseEnter(highlightedLimit === fieldName ? null : fieldName)}
        />
      )}
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
