import React, { useState } from "react";
import {
  LensIndex,
  FrameType,
  AsphericSurfaceConfig,
} from "../lib/optic-engine/types";
import { translations, Language } from "../lib/translations";
import { ChevronDownIcon } from "lucide-react";
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
import { GroupMarker } from "./Sidebar/GroupMarker";

import { useAsphericContext } from "../contexts/AsphericContext";
import { INPUT_SPECS } from "../lib/optic-engine/validation";

/**
 * The step of each polynomial term.
 *
 * The terms are the even powers of the radius in millimetres, so the numbers
 * are small and each power needs a step of its own: an A4 of a couple of
 * parts in a million is a fifth of a millimetre of surface at the edge of
 * the frame.
 */
const COEFFICIENT_STEP: Record<'A2' | 'A4' | 'A6' | 'A8', number> = {
  A2: 0.00001,
  A4: 0.0000001,
  A6: 0.000000001,
  A8: 0.00000000001,
};

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
    <div className="space-y-3 border border-sheet-stage p-3">
      {/* Header with active toggle */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-sheet-ink">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-sheet-muted">{t.surfaceActive}</span>
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
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-sheet-muted">{t.conicConstant}</span>
              <span className="text-[16px] font-medium text-sheet-ink tnum">
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
              className="flex w-full items-center justify-between gap-1 py-1 text-left text-[13px] font-medium text-sheet-ink transition-colors hover:text-sheet-accent"
            >
              Coefficients
              <ChevronDownIcon
                size={14}
                className={cn("text-sheet-muted transition-transform", showCoeffs && "rotate-180")}
              />
            </button>
            {showCoeffs && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(['A2', 'A4', 'A6', 'A8'] as const).map((coeff) => (
                  <div key={coeff} className="flex flex-col gap-0.5">
                    <span className="text-[13px] text-sheet-muted">{coeff}</span>
                    <input
                      type="number"
                      step={COEFFICIENT_STEP[coeff]}
                      title="The even powers of the radius in millimetres. An A4 of 2e-7 moves the surface about a fifth of a millimetre at a 30 mm radius."
                      value={config[coeff]}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        onChange({ ...config, [coeff]: isNaN(v) ? 0 : v });
                      }}
                      className="h-9 w-full rounded-sm bg-sheet-ground px-2 text-[16px] font-medium text-sheet-ink tnum focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent"
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
  const requiredBlank = (result.minBlank ?? result.y * 2 + 2);

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
      <div className="py-1">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between gap-2 py-2 text-left text-[13px] font-medium text-sheet-ink outline-none transition-colors hover:text-sheet-accent"
          onClick={() => toggleGroup("aspheric")}
        >
          <span className="flex min-w-0 items-center gap-2">
            <GroupMarker group="rx" />
            <span className="truncate">{t.asphericParams}</span>
          </span>
          <ChevronDownIcon
            size={15}
            className={cn(
              "shrink-0 text-sheet-muted transition-transform duration-200",
              openGroup.aspheric && "rotate-180",
            )}
          />
        </button>
        {openGroup.aspheric && (
          <FieldGroup className="mt-2 gap-4 py-1 text-left">
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
      <div className="py-1">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between gap-2 py-2 text-left text-[13px] font-medium text-sheet-ink outline-none transition-colors hover:text-sheet-accent"
          onClick={() => toggleGroup("frame")}
        >
          <span className="flex min-w-0 items-center gap-2">
            <GroupMarker group="frame" />
            <span className="truncate">{t.frameGeometry}</span>
          </span>
          <ChevronDownIcon
            size={15}
            className={cn(
              "shrink-0 text-sheet-muted transition-transform duration-200",
              openGroup.frame && "rotate-180",
            )}
          />
        </button>
        {openGroup.frame && (
          <FieldGroup className="mt-2 gap-4 py-1 text-left">
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
      <div className="mx-auto max-w-xl bg-sheet-ground p-1">
        {renderFormContent()}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "flex h-full w-[320px] shrink-0 flex-col bg-sheet-panel lg:w-[352px]",
        "text-left",
      )}
    >
      <SidebarHeader lang={lang} />
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-5 pb-8">{renderFormContent()}</div>
      </ScrollArea>
    </aside>
  );
};
