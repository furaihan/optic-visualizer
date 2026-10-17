import { FrameParameters, FrameType } from "@/src/lib/optic-engine/types";
import { INPUT_SPECS } from "@/src/lib/optic-engine/validation";
import { translations, Language } from "@/src/lib/translations";

import { FrameParamField } from "./FrameParamField";
import { Control } from "./Control";
import { FrameTypeSelector } from "./FrameTypeSelector";

interface FrameGeometrySectionProps {
  frame: FrameParameters;
  frameType: FrameType;
  onFrameChange: (frame: FrameParameters) => void;
  onFrameTypeChange: (type: FrameType) => void;
  highlightedLimit: "a" | "b" | "dbl" | "ed" | null;
  onHighlightedLimitChange: (limit: "a" | "b" | "dbl" | "ed" | null) => void;
  validation: { errors: Array<{ field: string }> };
  requiredBlank: number;
  lang: Language;
}

export const FrameGeometrySection: React.FC<FrameGeometrySectionProps> = ({
  frame,
  frameType,
  onFrameChange,
  onFrameTypeChange,
  highlightedLimit,
  onHighlightedLimitChange,
  validation,
  requiredBlank,
  lang,
}) => {
  const t = translations[lang];

  const frameParams = [
    { key: "a" as const, label: t.aSize, specs: INPUT_SPECS.a, alertTitle: t.ergonomicLimitsA },
    { key: "b" as const, label: t.bSize, specs: INPUT_SPECS.b, alertTitle: t.ergonomicLimitsB },
    { key: "dbl" as const, label: "DBL", specs: INPUT_SPECS.dbl, alertTitle: t.ergonomicLimitsDbl },
    { key: "ed" as const, label: "ED", specs: INPUT_SPECS.ed, alertTitle: t.ergonomicLimitsEd },
  ];

  const hasError = (field: string) => validation.errors.some((e) => e.field === field);

  const exceeding = {
    a: frame.a < INPUT_SPECS.a.min || frame.a > INPUT_SPECS.a.max || requiredBlank > 85,
    b: frame.b < INPUT_SPECS.b.min || frame.b > INPUT_SPECS.b.max || hasError("fittingHeight"),
    dbl: frame.dbl < INPUT_SPECS.dbl.min || frame.dbl > INPUT_SPECS.dbl.max,
    ed: frame.ed < frame.a || frame.ed > INPUT_SPECS.ed.max,
  };

  const isAnyExceeding = Object.values(exceeding).some(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {frameParams.map((param) => (
          <FrameParamField
            key={param.key}
            label={param.label}
            value={frame[param.key]}
            min={param.specs.min}
            max={param.specs.max}
            isExceeding={exceeding[param.key]}
            fieldName={param.key}
            onValueChange={(val) => onFrameChange({ ...frame, [param.key]: val })}
            onMouseEnter={onHighlightedLimitChange}
            onMouseLeave={() => onHighlightedLimitChange(null)}
            highlightedLimit={highlightedLimit}
            alertTitle={param.alertTitle}
            lang={lang}
          />
        ))}
      </div>

      <Control
        label={t.frameDepth}
        unit="mm"
        min={1}
        max={10}
        step={0.1}
        value={frame.depth}
        onChange={(v) => onFrameChange({ ...frame, depth: v })}
        lang={lang}
      />

      <FrameTypeSelector
        frameType={frameType}
        onFrameTypeChange={onFrameTypeChange}
        lang={lang}
      />

      {isAnyExceeding && (
        <p className="sheet-fade bg-sheet-alert p-2.5 text-[13px] leading-snug text-sheet-ink">
          {t.ergonomicWarning}
        </p>
      )}
    </div>
  );
};
