import { FrameType } from "@/src/lib/optic-engine/types";
import { Language, translations } from "@/src/lib/translations";
import { Field, FieldContent, FieldLabel } from "@shadcn/field";
import { RadioGroup, RadioGroupItem } from "@shadcn/radio-group";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { FrameIcon } from "lucide-react";
import { Label } from "@shadcn/label";

/**
 * FrameTypeSelector - Toggle buttons for frame type
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
    <Field orientation="vertical">
      <FieldLabel className="w-auto flex-none m-0 items-center mb-2">
        <LabelWithTooltip
          label={t.frameType}
          lang={lang}
          className="select-none leading-tight dark:text-slate-300"
          icon={<FrameIcon size={13} className="text-emerald-500" />}
        />
      </FieldLabel>
      <FieldContent>
        <RadioGroup
          value={frameType}
          onValueChange={(val) => onFrameTypeChange(val as FrameType)}
          className="flex flex-col gap-2.5 mt-1"
        >
          {types.map(({ value, label }) => (
            <div className="flex items-center space-x-2" key={value}>
              <RadioGroupItem value={value} id={`frame-type-${value}`} />
              <Label
                htmlFor={`frame-type-${value}`}
                className="text-xs font-medium cursor-pointer"
              >
                {label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FieldContent>
    </Field>
  );
};
