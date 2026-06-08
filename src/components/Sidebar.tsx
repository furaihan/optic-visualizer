import React, { useState } from 'react';
import { LensParameters, FrameParameters, PatientParameters, FrameType, LensIndex } from '../lib/optical';
import { translations, Language } from '../lib/translations';
import {
  LayersIcon, FrameIcon, UserIcon, ChevronDownIcon, EyeIcon, RulerIcon,
  ApertureIcon, GaugeIcon, ZapIcon, CopyIcon, ArrowRightIcon, AlertCircleIcon
} from "lucide-react";
import { Button, buttonVariants } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { cn } from '../lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from './ui/dropdown-menu';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { motion, AnimatePresence } from 'framer-motion';
import { LabelWithTooltip } from './Sidebar/LabelWithTooltip';
import { Control } from './Sidebar/Control';
import { FrameInput } from './Sidebar/FrameInput';

import { useOpticalContext } from '../contexts/OpticalContext';
import { INPUT_SPECS } from '../lib/validation';

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
  fieldName: 'a' | 'b' | 'dbl' | 'ed';
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
        : "text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500"
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
  fieldName: 'a' | 'b' | 'dbl' | 'ed';
  onValueChange: (value: number) => void;
  onMouseEnter: (field: 'a' | 'b' | 'dbl' | 'ed' | null) => void;
  onMouseLeave: () => void;
  highlightedLimit: 'a' | 'b' | 'dbl' | 'ed' | null;
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
        onClick={() => onMouseEnter(highlightedLimit === fieldName ? null : fieldName)}
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
        "hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded px-1 -mx-1"
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
          isOpen && "rotate-180"
        )}
      />
    </CollapsibleTrigger>
    <CollapsibleContent>
      <FieldGroup className="mt-3 text-left py-1 gap-4">
        {children}
      </FieldGroup>
    </CollapsibleContent>
  </Collapsible>
);

import { ItemGroup, Item, ItemTitle } from './ui/item';
import { Field, FieldLabel, FieldContent, FieldGroup } from './ui/field';

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
    { value: 'full', label: t.fullRim },
    { value: 'half', label: t.halfRim },
    { value: 'rimless', label: t.rimless },
  ];

  return (
    <Field orientation="vertical">
      <FieldLabel className="w-auto flex-none m-0 items-center">
        <LabelWithTooltip
          label={t.frameType}
          lang={lang}
          className="text-[11px]"
          icon={<FrameIcon size={13} className="text-emerald-500" />}
        />
      </FieldLabel>
      <FieldContent>
        <ToggleGroup className="grid grid-cols-3 gap-1 w-full mt-1">
          {types.map(({ value, label }) => (
            <ToggleGroupItem
              key={value}
              pressed={frameType === value}
              onPressedChange={(pressed) => {
                if (pressed) onFrameTypeChange(value);
              }}
              aria-label={label}
              className={cn(
                "w-full h-auto py-2 px-3 rounded text-[10px] font-bold text-center",
                "transition-all border cursor-pointer border-transparent",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
                "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400",
                "hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200",
                "data-[state=on]:bg-emerald-600 data-[state=on]:border-emerald-600 dark:data-[state=on]:bg-emerald-500 dark:data-[state=on]:border-emerald-500 data-[state=on]:text-white data-[state=on]:shadow-sm data-[state=on]:hover:bg-emerald-700 dark:data-[state=on]:hover:bg-emerald-600 data-[state=on]:hover:text-white"
              )}
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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

import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group';

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
      <FieldContent className="flex-row items-center gap-2 sm:gap-3 mt-1">
        {/* Label Front */}
        <span className="text-[9px] font-bold text-slate-400 min-w-fit">{t.bevelFront}</span>

        {/* Slider */}
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[bevelPercent]}
          onValueChange={(val: readonly number[] | number) =>
            onBevelChange(Array.isArray(val) ? val[0] : (val as number))
          }
          className="flex-1 cursor-pointer"
          aria-label="Bevel positioning slider"
        />

        {/* Label Back */}
        <span className="text-[9px] font-bold text-slate-400 min-w-fit">{t.bevelBack}</span>

        {/* Percentage Input */}
        <div className="w-14 shrink-0">
          <InputGroup className="h-7 w-full border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <InputGroupInput
              type="number"
              min={0}
              max={100}
              step={1}
              value={Math.round(bevelPercent * 100)}
              onChange={(e) =>
                onBevelChange(Math.min(100, Math.max(0, parseFloat(e.target.value || "0"))) / 100)
              }
              className="w-full h-7 pl-2 pr-0 text-[10px] text-center font-mono font-bold hover:bg-slate-50 dark:hover:bg-slate-900"
              aria-label="Bevel percentage numeric input"
            />
            <InputGroupAddon align="inline-end" className="pr-1.5 pl-0 text-[8px] text-slate-400 pointer-events-none">
              %
            </InputGroupAddon>
          </InputGroup>
        </div>
      </FieldContent>
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
          <AnimatePresence>
            {compareMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      "w-full justify-between h-8 px-3 font-semibold text-xs"
                    )}
                    aria-label="Comparison material indices"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRightIcon size={12} className="text-slate-500" />
                      <span>{compareIndex.toFixed(2)}</span>
                    </div>
                    <ChevronDownIcon size={14} className="opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--anchor-width)] min-w-0" align="start">
                    <DropdownMenuRadioGroup
                      value={compareIndex.toString()}
                      onValueChange={(val) => onCompareIndexChange(parseFloat(val) as LensIndex)}
                    >
                      {indices.map(idx => (
                        <DropdownMenuRadioItem
                          key={idx}
                          value={idx.toString()}
                          className="font-medium text-xs"
                        >
                          {idx.toFixed(2)}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>
        </FieldContent>
      </Field>
    </Card>
  );
};

/**
 * FrameGeometrySection - All frame parameters in data-driven layout
 */
interface FrameGeometrySectionProps {
  frame: FrameParameters;
  frameType: FrameType;
  onFrameChange: (frame: FrameParameters) => void;
  onFrameTypeChange: (type: FrameType) => void;
  highlightedLimit: 'a' | 'b' | 'dbl' | 'ed' | null;
  onHighlightedLimitChange: (limit: 'a' | 'b' | 'dbl' | 'ed' | null) => void;
  validation: { errors: Array<{ field: string }> };
  requiredBlank: number;
  lang: Language;
}

const FrameGeometrySection: React.FC<FrameGeometrySectionProps> = ({
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
      key: 'a' as const,
      label: t.aSize,
      specs: INPUT_SPECS.a,
      alertTitle: t.ergonomicLimitsA,
    },
    {
      key: 'b' as const,
      label: t.bSize,
      specs: INPUT_SPECS.b,
      alertTitle: t.ergonomicLimitsB,
    },
    {
      key: 'dbl' as const,
      label: 'DBL',
      specs: INPUT_SPECS.dbl,
      alertTitle: t.ergonomicLimitsDbl,
    },
    {
      key: 'ed' as const,
      label: 'ED',
      specs: INPUT_SPECS.ed,
      alertTitle: t.ergonomicLimitsEd,
    },
  ];

  // Validation helper
  const hasError = (field: string) => validation.errors.some(e => e.field === field);

  // Validation checks
  const exceeding = {
    a: frame.a < INPUT_SPECS.a.min || frame.a > INPUT_SPECS.a.max || requiredBlank > 85,
    b: frame.b < INPUT_SPECS.b.min || frame.b > INPUT_SPECS.b.max || hasError('fittingHeight'),
    dbl: frame.dbl < INPUT_SPECS.dbl.min || frame.dbl > INPUT_SPECS.dbl.max,
    ed: frame.ed < frame.a || frame.ed > INPUT_SPECS.ed.max,
  };

  const isAnyExceeding = Object.values(exceeding).some(v => v);

  return (
    <>
      {/* Frame Parameters Grid */}
      <div className="space-y-4">
        {/* Top Row: A & B */}
        <div className="grid grid-cols-2 gap-3">
          {frameParams.slice(0, 2).map(param => (
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

        {/* Bottom Row: DBL & ED */}
        <div className="grid grid-cols-2 gap-3">
          {frameParams.slice(2, 4).map(param => (
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
              <AlertCircleIcon size={12} className="shrink-0 mt-px" aria-hidden="true" />
              <span className="leading-snug font-medium">{t.ergonomicWarning}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================
// Main Sidebar Component
// ============================================

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  isMobile = false
}) => {
  const {
    lens, setLens,
    frame, setFrame,
    patient, setPatient,
    compareMode, setCompareMode,
    compareIndex, setCompareIndex,
    bevelPercent, setBevelPercent,
    frameType, setFrameType,
    highlightedLimit, setHighlightedLimit,
    result, validation
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
    setOpenGroup(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Render form content - shared between mobile & desktop
  const renderFormContent = () => (
    <>
      {/* Lens Parameters */}
      <ParameterGroup
        title={t.lensParams}
        icon={LayersIcon}
        iconColor="text-blue-500"
        groupKey="lens"
        isOpen={openGroup.lens}
        onToggle={toggleGroup}
      >
        <Control
          label={t.sphere}
          unit=" D"
          min={INPUT_SPECS.sph.min}
          max={INPUT_SPECS.sph.max}
          step={INPUT_SPECS.sph.step}
          value={lens.sph}
          onChange={(v) => setLens({ ...lens, sph: v })}
          lang={lang}
          icon={<ApertureIcon size={13} className="text-blue-500" />}
          isRecalculating={false}
        />
        <Control
          label={t.cylinder}
          unit=" D"
          min={INPUT_SPECS.cyl.min}
          max={INPUT_SPECS.cyl.max}
          step={INPUT_SPECS.cyl.step}
          value={lens.cyl}
          onChange={(v) => setLens({ ...lens, cyl: v })}
          lang={lang}
          icon={<GaugeIcon size={13} className="text-blue-500" />}
          isRecalculating={false}
        />
        <Control
          label={t.axis}
          unit="°"
          min={INPUT_SPECS.axis.min}
          max={INPUT_SPECS.axis.max}
          step={INPUT_SPECS.axis.step}
          value={lens.axis}
          onChange={(v) => setLens({ ...lens, axis: v })}
          lang={lang}
          icon={<ZapIcon size={13} className="text-blue-500" />}
          isRecalculating={false}
        />

        {/* Refractive Index Dropdown */}
        <Field orientation="vertical">
          <FieldLabel className="w-auto flex-none m-0 items-center">
            <LabelWithTooltip
              label={t.refractiveIndex}
              lang={lang}
              className="text-[11px]"
              icon={<EyeIcon size={13} className="text-blue-500" />}
            />
          </FieldLabel>
          <FieldContent>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(buttonVariants({ variant: 'outline' }), "w-full justify-between h-9 px-3 font-semibold text-xs")}
                aria-label={t.refractiveIndex}
              >
                {lens.index.toFixed(2)}
                <ChevronDownIcon size={14} className="opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--anchor-width)] min-w-0" align="start">
                <DropdownMenuRadioGroup
                  value={lens.index.toString()}
                  onValueChange={(val) => setLens({ ...lens, index: parseFloat(val) as LensIndex })}
                >
                  {indices.map(idx => (
                    <DropdownMenuRadioItem key={idx} value={idx.toString()} className="font-medium text-xs">
                      {idx.toFixed(2)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </FieldContent>
        </Field>

        <Control
          label={t.baseCurve}
          unit=" D"
          min={INPUT_SPECS.baseCurve.min}
          max={INPUT_SPECS.baseCurve.max}
          step={INPUT_SPECS.baseCurve.step}
          value={lens.baseCurve}
          onChange={(v) => setLens({ ...lens, baseCurve: v })}
          lang={lang}
          icon={<ApertureIcon size={13} className="text-blue-500" />}
          isRecalculating={false}
        />
      </ParameterGroup>

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
      <ParameterGroup
        title={t.fittingSpecs}
        icon={UserIcon}
        iconColor="text-orange-500"
        groupKey="fitting"
        isOpen={openGroup.fitting}
        onToggle={toggleGroup}
      >
        <Control
          label={t.pd}
          unit="mm"
          min={INPUT_SPECS.pd.min}
          max={INPUT_SPECS.pd.max}
          step={INPUT_SPECS.pd.step}
          value={patient.pd}
          onChange={(v) => setPatient({ ...patient, pd: v })}
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
          onChange={(v) => setPatient({ ...patient, fittingHeight: v })}
          lang={lang}
          icon={<RulerIcon size={13} className="text-orange-500" />}
          isRecalculating={false}
        />

        <BevelControl
          bevelPercent={bevelPercent}
          onBevelChange={setBevelPercent}
          lang={lang}
        />
      </ParameterGroup>

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
    <aside className={cn(
      "shrink-0 bg-white dark:bg-slate-950",
      "border-r border-slate-100 dark:border-slate-850",
      "flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.015)]",
      "text-left transition-all duration-200",
      "w-[300px] lg:w-[340px]"
    )}>
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-850">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
              <rect x="42" y="10" width="16" height="35" fill="#1e73be" rx="2" transform="rotate(-45 50 50)" />
              <rect x="42" y="55" width="16" height="35" fill="#2d9e4b" rx="2" transform="rotate(-45 50 50)" />
              <rect x="42" y="10" width="16" height="35" fill="#31a8dd" rx="2" transform="rotate(45 50 50)" />
              <rect x="42" y="55" width="16" height="35" fill="#84cc16" rx="2" transform="rotate(45 50 50)" />
              <circle cx="50" cy="50" r="4" fill="#1e73be" />
            </svg>
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-slate-100 font-extrabold text-sm tracking-tight leading-none mb-1">
              AKTRIYO
            </h1>
            <h2 className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-none m-0">
              {t.institute}
            </h2>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[8px] font-black uppercase bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded tracking-wider">
            Measuring Project
          </span>
          <span className="text-[8px] bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-mono border border-slate-200/60 dark:border-slate-800/80 uppercase tracking-tight">
            {t.title}
          </span>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 py-4 space-y-2">
          {renderFormContent()}
        </div>
      </ScrollArea>
    </aside>
  );
};