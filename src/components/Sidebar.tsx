import React, { useState } from "react";
import {
  FrameParameters,
  LensIndex,
  FrameType,
} from "../lib/optic-engine/types";
import { translations, Language } from "../lib/translations";
import {
  FrameIcon,
  ChevronDownIcon,
  CopyIcon,
  AlertCircleIcon,
  ZapIcon,
  GaugeIcon,
  RulerIcon,
} from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./ui/collapsible";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { LabelWithTooltip } from "./Sidebar/LabelWithTooltip";
import { Control } from "./Sidebar/Control";
import { FrameInput } from "./Sidebar/FrameInput";
import { LensParametersSection } from "./Sidebar/LensParametersSection";
import { FittingSpecsSection } from "./Sidebar/FittingSpecsSection";
import { RefractiveIndexDropdown } from "./Sidebar/RefractiveIndexDropdown";
import { SidebarHeader } from "./Sidebar/SidebarHeader";

import { useOpticalContext } from "../contexts/OpticalContext";
import { INPUT_SPECS } from "../lib/optic-engine/validation";

interface SidebarProps {
  lang: Language;
  isMobile?: boolean;
}

// ============================================
// Reusable Components
// ============================================

/**
 * LimitAlertButton - Single source of truth untuk frame param alerts
 */
interface LimitAlertButtonProps {
  fieldName: "a" | "b" | "dbl" | "ed";
  isExceeding: boolean;
  title: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isHighlighted: boolean;
  onClick: () => void;
}

const LimitAlertButton: React.FC<LimitAlertButtonProps> = ({
  fieldName,
  isExceeding,
  title,
  onMouseEnter,
  onMouseLeave,
  isHighlighted,
  onClick,
}) => (
  <Button
    variant="ghost"
    size="icon"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
    className={cn(
      "w-5 h-5 rounded-full transition-all shrink-0 hover:bg-transparent",
      "hover:scale-110 active:scale-95",
      isExceeding
        ? "text-amber-500 hover:text-amber-600 animate-pulse-soft bg-amber-500/10"
        : "text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500",
    )}
    title={title}
    aria-label={`Toggle ${fieldName} limit warning highlight`}
    aria-pressed={isHighlighted}
  >
    <AlertCircleIcon size={11} />
  </Button>
);

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

const FrameParamField: React.FC<FrameParamFieldProps> = ({
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

/**
 * ParameterGroup - Collapsible section for parameter groups
 */
interface ParameterGroupProps {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  groupKey: string;
  isOpen: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}

const ParameterGroup: React.FC<ParameterGroupProps> = ({
  title,
  icon: Icon,
  iconColor,
  groupKey,
  isOpen,
  onToggle,
  children,
}) => (
  <Collapsible
    open={isOpen}
    onOpenChange={() => onToggle(groupKey)}
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
        <Icon size={12} className={cn(iconColor, "transition-colors")} />
        <span>{title}</span>
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
      <FieldGroup className="mt-3 text-left py-1 gap-4">{children}</FieldGroup>
    </CollapsibleContent>
  </Collapsible>
);

import { ItemGroup, Item, ItemTitle } from "./ui/item";
import { Field, FieldLabel, FieldContent, FieldGroup } from "./ui/field";

/**
 * FrameTypeSelector - Toggle buttons for frame type
 */
interface FrameTypeSelectorProps {
  frameType: FrameType;
  onFrameTypeChange: (type: FrameType) => void;
  lang: Language;
}

const FrameTypeSelector: React.FC<FrameTypeSelectorProps> = ({
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

/**
 * BevelControl - Bevel positioning slider + percentage input
 */
interface BevelControlProps {
  bevelPercent: number;
  onBevelChange: (percent: number) => void;
  lang: Language;
}

import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { FrameGeometrySection } from "./Sidebar/FrameGeometrySection";

const BevelControl: React.FC<BevelControlProps> = ({
  bevelPercent,
  onBevelChange,
  lang,
}) => {
  const t = translations[lang];

  return (
    <Field orientation="vertical" className="pt-2">
      <FieldLabel className="w-auto flex-none m-0 items-center">
        <LabelWithTooltip
          label={t.bevelPos}
          lang={lang}
          isUppercaseHeader
          className="text-[10px] text-slate-400 font-bold uppercase tracking-wider"
          icon={<ZapIcon size={11} className="text-orange-500" />}
        />
      </FieldLabel>
      <div className="flex flex-row items-center gap-2 sm:gap-3 mt-1 w-full">
        {/* Label Front */}
        <span className="text-[9px] font-bold text-slate-400 min-w-fit">
          {t.bevelFront}
        </span>

        {/* Slider */}
        <div className="flex-1 w-full min-w-0">
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[bevelPercent]}
            onValueChange={(val: readonly number[] | number) =>
              onBevelChange(Array.isArray(val) ? val[0] : (val as number))
            }
            className="w-full cursor-pointer"
            aria-label="Bevel positioning slider"
          />
        </div>

        {/* Label Back */}
        <span className="text-[9px] font-bold text-slate-400 min-w-fit">
          {t.bevelBack}
        </span>

        {/* Percentage Input */}
        <div className="w-18 min-w-[72px] shrink-0">
          <InputGroup className="h-7 w-full border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <InputGroupInput
              type="number"
              min={0}
              max={100}
              step={1}
              value={Math.round(bevelPercent * 100)}
              onChange={(e) =>
                onBevelChange(
                  Math.min(
                    100,
                    Math.max(0, parseFloat(e.target.value || "0")),
                  ) / 100,
                )
              }
              className="w-full h-7 pl-2 pr-1 text-[11px] font-mono font-bold hover:bg-slate-50 dark:hover:bg-slate-900"
              aria-label="Bevel percentage numeric input"
            />
            <InputGroupAddon
              align="inline-end"
              className="pr-2 pl-0 text-[10px] text-slate-400 pointer-events-none"
            >
              %
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </Field>
  );
};

/**
 * ComparisonModeToggle - Compare lens indices
 */
interface ComparisonModeToggleProps {
  compareMode: boolean;
  compareIndex: LensIndex;
  indices: LensIndex[];
  onCompareModeChange: (enabled: boolean) => void;
  onCompareIndexChange: (index: LensIndex) => void;
  lang: Language;
}

const ComparisonModeToggle: React.FC<ComparisonModeToggleProps> = ({
  compareMode,
  compareIndex,
  indices,
  onCompareModeChange,
  onCompareIndexChange,
  lang,
}) => {
  const t = translations[lang];

  return (
    <Card className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/80 shadow-none">
      <Field orientation="vertical" className="space-y-3">
        <div className="flex flex-row items-center justify-between w-full">
          <FieldLabel className="w-auto flex-none m-0 items-center">
            <LabelWithTooltip
              label={t.compareMode}
              lang={lang}
              isUppercaseHeader
              className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider"
              icon={<CopyIcon size={11} className="text-slate-400" />}
            />
          </FieldLabel>
          <Switch
            checked={compareMode}
            onCheckedChange={onCompareModeChange}
            aria-label={t.compareMode}
          />
        </div>

        <FieldContent>
          <div
            className={`overflow-hidden transition-all duration-200 ease-out ${
              compareMode ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <RefractiveIndexDropdown
              index={compareIndex}
              onChange={onCompareIndexChange}
              indices={indices}
              lang={lang}
              showLabel={false}
              showIcon={false}
            />
          </div>
        </FieldContent>
      </Field>
    </Card>
  );
};




// ============================================
// Main Sidebar Component
// ============================================

export const Sidebar: React.FC<SidebarProps> = ({ lang, isMobile = false }) => {
  const {
    lens,
    setLens,
    frame,
    setFrame,
    patient,
    setPatient,
    compareMode,
    setCompareMode,
    compareIndex,
    setCompareIndex,
    bevelPercent,
    setBevelPercent,
    frameType,
    setFrameType,
    highlightedLimit,
    setHighlightedLimit,
    result,
    validation,
  } = useOpticalContext();

  const t = translations[lang];
  const indices: LensIndex[] = [1.5, 1.56, 1.6, 1.67, 1.74];
  const requiredBlank = result.y * 2 + 2;

  const [openGroup, setOpenGroup] = useState<Record<string, boolean>>({
    lens: true,
    frame: true,
    fitting: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroup((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Render form content - shared between mobile & desktop
  const renderFormContent = () => (
    <>
      {/* Lens Parameters */}
      <LensParametersSection
        lens={lens}
        onLensChange={setLens}
        lang={lang}
        indices={indices}
        isOpen={openGroup.lens}
        onToggle={toggleGroup}
      />

      {/* Frame Geometry */}
      <ParameterGroup
        title={t.frameGeometry}
        icon={FrameIcon}
        iconColor="text-emerald-500"
        groupKey="frame"
        isOpen={openGroup.frame}
        onToggle={toggleGroup}
      >
        <FrameGeometrySection
          frame={frame}
          frameType={frameType}
          onFrameChange={setFrame}
          onFrameTypeChange={setFrameType}
          highlightedLimit={highlightedLimit}
          onHighlightedLimitChange={setHighlightedLimit}
          validation={validation}
          requiredBlank={requiredBlank}
          lang={lang}
        />
      </ParameterGroup>

      {/* Fitting Specifications */}
      <FittingSpecsSection
        patient={patient}
        onPatientChange={setPatient}
        bevelPercent={bevelPercent}
        onBevelChange={setBevelPercent}
        lang={lang}
        isOpen={openGroup.fitting}
        onToggle={toggleGroup}
      />

      {/* Comparison Mode */}
      <ComparisonModeToggle
        compareMode={compareMode}
        compareIndex={compareIndex}
        indices={indices}
        onCompareModeChange={setCompareMode}
        onCompareIndexChange={setCompareIndex}
        lang={lang}
      />
    </>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <Card className="space-y-4 px-4 py-3 rounded-2xl border-slate-200/60 dark:border-slate-800/80 shadow-sm max-w-xl mx-auto">
        {renderFormContent()}
      </Card>
    );
  }

  // Desktop Layout
  return (
    <aside
      className={cn(
        "shrink-0 bg-white dark:bg-slate-950",
        "border-r border-slate-100 dark:border-slate-850",
        "flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.015)]",
        "text-left transition-all duration-200",
        "w-[300px] lg:w-[340px]",
      )}
    >
      {/* Header */}
      <SidebarHeader lang={lang} />

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 py-4 space-y-2">{renderFormContent()}</div>
      </ScrollArea>
    </aside>
  );
};
