import { FrameType } from "@/src/lib/optic-engine/types";
import { Language, translations } from "@/src/lib/translations";
import { Field, FieldContent, FieldLabel } from "@shadcn/field";
import { LabelWithTooltip } from "./LabelWithTooltip";

/**
 * Frame type as three pressed states in a row, not three radio dots.
 * The choice is structural: it changes which index the engine will allow.
 */
interface FrameTypeSelectorProps {
  frameType: FrameType;
  onFrameTypeChange: (type: FrameType) => void;
  lang: Language;
}

export const FrameTypeSelector: React.FC<FrameTypeSelectorProps> = ({
  frameType,
  onFrameTypeChange,
  lang,
}) => {
  const t = translations[lang];
  const types: Array<{ value: FrameType; label: string }> = [
    { value: "full", label: t.fullRim },
    { value: "half", label: t.halfRim },
    { value: "rimless", label: t.rimless },
  ];

  return (
    <Field orientation="vertical" className="gap-1.5">
      <FieldLabel className="m-0 w-auto flex-none items-center">
        <LabelWithTooltip label={t.frameType} lang={lang} />
      </FieldLabel>
      <FieldContent>
        <div
          role="radiogroup"
          aria-label={t.frameType}
          className="grid grid-cols-3 gap-1 bg-sheet-stage p-1"
        >
          {types.map(({ value, label }) => {
            const active = frameType === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onFrameTypeChange(value)}
                className={`min-h-9 px-1.5 py-1 text-[13px] leading-tight transition-colors duration-150 ${
                  active
                    ? 'bg-sheet-ground font-medium text-sheet-ink'
                    : 'text-sheet-muted hover:bg-sheet-stage hover:text-sheet-ink'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </FieldContent>
    </Field>
  );
};
