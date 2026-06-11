import React, { useState } from "react";
import {
  LensIndex,
  FrameType,
  AsphericSurfaceConfig,
} from "../lib/optic-engine/types";
import { translations, Language } from "../lib/translations";
import {
  FrameIcon,
  ChevronDownIcon,
  LayersIcon,
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Field, FieldLabel, FieldContent, FieldGroup } from "./ui/field";
import { ItemGroup, Item, ItemTitle } from "./ui/item";
import { LabelWithTooltip } from "./Sidebar/LabelWithTooltip";
import { Control } from "./Sidebar/Control";
import { LensParametersSection } from "./Sidebar/LensParametersSection";
import { FittingSpecsSection } from "./Sidebar/FittingSpecsSection";
import { FrameGeometrySection } from "./Sidebar/FrameGeometrySection";
import { SidebarHeader } from "./Sidebar/SidebarHeader";

import { useAsphericContext } from "../contexts/AsphericContext";
import { INPUT_SPECS } from "../lib/optic-engine/validation";

interface AsphericSidebarProps {
  lang: Language;
  isMobile?: boolean;
}

function AsphericSurfacePanel({
  title,
  config,
  onChange,
  lang,
}: {
  title: string;
  config: AsphericSurfaceConfig;
  onChange: (config: AsphericSurfaceConfig) => void;
  lang: Language;
}) {
  const t = translations[lang];
  const [showCoeffs, setShowCoeffs] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-3">
      {/* Header with active toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-400">{t.surfaceActive}</span>
          <Switch
            checked={config.isActive}
            onCheckedChange={(v) => onChange({ ...config, isActive: v })}
          />
        </div>
      </div>

      {config.isActive && (
        <>
          {/* Conic K slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-slate-500">{t.conicConstant}</span>
              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                {config.conic.toFixed(2)}
              </span>
            </div>
            <Slider
              min={-2}
              max={2}
              step={0.05}
              value={[config.conic]}
              onValueChange={(val: readonly number[] | number) =>
                onChange({ ...config, conic: (Array.isArray(val) ? val[0] : val) })
              }
              className="w-full cursor-pointer"
            />
          </div>

          {/* Coefficients expander */}
          <div>
            <button
              onClick={() => setShowCoeffs(!showCoeffs)}
              className="text-[9px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-wider flex items-center gap-1"
            >
              <ChevronDownIcon
                size={10}
                className={cn("transition-transform", showCoeffs && "rotate-180")}
              />
              Coefficients
            </button>
            {showCoeffs && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(['A2', 'A4', 'A6', 'A8'] as const).map((coeff) => (
                  <div key={coeff} className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-bold text-slate-400">{coeff}</span>
                    <input
                      type="number"
                      step={0.0001}
                      value={config[coeff]}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        onChange({ ...config, [coeff]: isNaN(v) ? 0 : v });
                      }}
                      className="w-full h-7 px-2 text-[10px] font-mono font-bold border border-slate-200 dark:border-slate-700 rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export const AsphericSidebar: React.FC<AsphericSidebarProps> = ({ lang, isMobile = false }) => {
  const {
    lens,
    setLens,
    frame,
    setFrame,
    patient,
    setPatient,
    setAsphericFront,
    setAsphericBack,
    bevelPercent,
    setBevelPercent,
    frameType,
    setFrameType,
    highlightedLimit,
    setHighlightedLimit,
    result,
    validation,
  } = useAsphericContext();

  const t = translations[lang];
  const indices: LensIndex[] = [1.5, 1.56, 1.6, 1.67, 1.74];
  const requiredBlank = result.y * 2 + 2;

  const [openGroup, setOpenGroup] = useState<Record<string, boolean>>({
    lens: true,
    aspheric: true,
    frame: true,
    fitting: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroup((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderFormContent = () => (
    <>
      {/* Lens Parameters */}
      <LensParametersSection
        lens={{
          sph: lens.sph,
          cyl: lens.cyl,
          axis: lens.axis,
          index: lens.index,
          baseCurve: lens.baseCurve,
        }}
        onLensChange={(l) => setLens({ ...lens, ...l })}
        lang={lang}
        indices={indices}
        isOpen={openGroup.lens}
        onToggle={toggleGroup}
      />

      {/* Aspheric Surface Controls */}
      <div className="border-b border-slate-100 dark:border-slate-800 last:border-0 py-3">
        <div
          className="w-full text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 uppercase tracking-wider flex items-center justify-between py-2 cursor-pointer transition-colors outline-none hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded px-1 -mx-1"
          onClick={() => toggleGroup("aspheric")}
        >
          <div className="flex items-center gap-1.5">
            <LayersIcon size={12} className="text-violet-500" />
            <span>{t.asphericParams}</span>
          </div>
          <ChevronDownIcon
            size={14}
            className={cn(
              "text-slate-400 transition-transform duration-200",
              openGroup.aspheric && "rotate-180",
            )}
          />
        </div>
        {openGroup.aspheric && (
          <FieldGroup className="mt-3 text-left py-1 gap-4">
            <AsphericSurfacePanel
              title={t.asphericSurfaceFront}
              config={lens.asphericFront}
              onChange={setAsphericFront}
              lang={lang}
            />
            <AsphericSurfacePanel
              title={t.asphericSurfaceBack}
              config={lens.asphericBack}
              onChange={setAsphericBack}
              lang={lang}
            />
          </FieldGroup>
        )}
      </div>

      {/* Frame Geometry */}
      <div className="border-b border-slate-100 dark:border-slate-800 last:border-0 py-3">
        <div
          className="w-full text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 uppercase tracking-wider flex items-center justify-between py-2 cursor-pointer transition-colors outline-none hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded px-1 -mx-1"
          onClick={() => toggleGroup("frame")}
        >
          <div className="flex items-center gap-1.5">
            <FrameIcon size={12} className="text-emerald-500" />
            <span>{t.frameGeometry}</span>
          </div>
          <ChevronDownIcon
            size={14}
            className={cn(
              "text-slate-400 transition-transform duration-200",
              openGroup.frame && "rotate-180",
            )}
          />
        </div>
        {openGroup.frame && (
          <FieldGroup className="mt-3 text-left py-1 gap-4">
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
          </FieldGroup>
        )}
      </div>

      {/* Fitting Specs */}
      <FittingSpecsSection
        patient={patient}
        onPatientChange={setPatient}
        bevelPercent={bevelPercent}
        onBevelChange={setBevelPercent}
        lang={lang}
        isOpen={openGroup.fitting}
        onToggle={toggleGroup}
      />
    </>
  );

  if (isMobile) {
    return (
      <div className="space-y-4 px-4 py-3 rounded-2xl border-slate-200/60 dark:border-slate-800/80 shadow-sm max-w-xl mx-auto bg-white dark:bg-slate-950">
        {renderFormContent()}
      </div>
    );
  }

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
      <SidebarHeader lang={lang} />
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 py-4 space-y-2">{renderFormContent()}</div>
      </ScrollArea>
    </aside>
  );
};
