import { FrameParameters, FrameType } from "@/src/lib/optic-engine/types";
import { INPUT_SPECS } from "@/src/lib/optic-engine/validation";
import { translations, Language } from "@/src/lib/translations";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircleIcon, GaugeIcon } from "lucide-react";
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

  // Frame parameter definitions
  const frameParams = [
    {
      key: "a" as const,
      label: t.aSize,
      specs: INPUT_SPECS.a,
      alertTitle: t.ergonomicLimitsA,
    },
    {
      key: "b" as const,
      label: t.bSize,
      specs: INPUT_SPECS.b,
      alertTitle: t.ergonomicLimitsB,
    },
    {
      key: "dbl" as const,
      label: "DBL",
      specs: INPUT_SPECS.dbl,
      alertTitle: t.ergonomicLimitsDbl,
    },
    {
      key: "ed" as const,
      label: "ED",
      specs: INPUT_SPECS.ed,
      alertTitle: t.ergonomicLimitsEd,
    },
  ];

  // Validation helper
  const hasError = (field: string) =>
    validation.errors.some((e) => e.field === field);

  // Validation checks
  const exceeding = {
    a:
      frame.a < INPUT_SPECS.a.min ||
      frame.a > INPUT_SPECS.a.max ||
      requiredBlank > 85,
    b:
      frame.b < INPUT_SPECS.b.min ||
      frame.b > INPUT_SPECS.b.max ||
      hasError("fittingHeight"),
    dbl: frame.dbl < INPUT_SPECS.dbl.min || frame.dbl > INPUT_SPECS.dbl.max,
    ed: frame.ed < frame.a || frame.ed > INPUT_SPECS.ed.max,
  };

  const isAnyExceeding = Object.values(exceeding).some((v) => v);

  return (
    <>
      {/* Frame Parameters Grid */}
      <div className="space-y-4">
        {/* Top Row: A & B */}
        <div className="grid grid-cols-2 gap-3">
          {frameParams.slice(0, 2).map((param) => (
            <FrameParamField
              key={param.key}
              label={param.label}
              value={frame[param.key]}
              min={param.specs.min}
              max={param.specs.max}
              isExceeding={exceeding[param.key]}
              fieldName={param.key}
              onValueChange={(val) =>
                onFrameChange({ ...frame, [param.key]: val })
              }
              onMouseEnter={onHighlightedLimitChange}
              onMouseLeave={() => onHighlightedLimitChange(null)}
              highlightedLimit={highlightedLimit}
              alertTitle={param.alertTitle}
              lang={lang}
            />
          ))}
        </div>

        {/* Bottom Row: DBL & ED */}
        <div className="grid grid-cols-2 gap-3">
          {frameParams.slice(2, 4).map((param) => (
            <FrameParamField
              key={param.key}
              label={param.label}
              value={frame[param.key]}
              min={param.specs.min}
              max={param.specs.max}
              isExceeding={exceeding[param.key]}
              fieldName={param.key}
              onValueChange={(val) =>
                onFrameChange({ ...frame, [param.key]: val })
              }
              onMouseEnter={onHighlightedLimitChange}
              onMouseLeave={() => onHighlightedLimitChange(null)}
              highlightedLimit={highlightedLimit}
              alertTitle={param.alertTitle}
              lang={lang}
            />
          ))}
        </div>
      </div>

      {/* Frame Depth */}
      <Control
        label={t.frameDepth}
        unit="mm"
        min={1}
        max={10}
        step={0.1}
        value={frame.depth}
        onChange={(v) => onFrameChange({ ...frame, depth: v })}
        lang={lang}
        icon={<GaugeIcon size={13} className="text-emerald-500" />}
        isRecalculating={false}
      />

      {/* Frame Type Selector */}
      <FrameTypeSelector
        frameType={frameType}
        onFrameTypeChange={onFrameTypeChange}
        lang={lang}
      />

      {/* Warning Message */}
      <AnimatePresence>
        {isAnyExceeding && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="text-[9px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-2 rounded-lg flex items-start gap-1.5 border border-amber-200/50 dark:border-amber-800/30">
              <AlertCircleIcon
                size={12}
                className="shrink-0 mt-px"
                aria-hidden="true"
              />
              <span className="leading-snug font-medium">
                {t.ergonomicWarning}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
