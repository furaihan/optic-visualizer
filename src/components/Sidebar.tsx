import React, { useState } from "react";
import { FrameType, LensIndex } from "../lib/optic-engine/types";
import { translations, Language } from "../lib/translations";
import { ChevronDownIcon } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";
import { Switch } from "./ui/switch";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible";
import { RefractiveIndexDropdown } from "./Sidebar/RefractiveIndexDropdown";
import { LensParametersSection } from "./Sidebar/LensParametersSection";
import { FittingSpecsSection } from "./Sidebar/FittingSpecsSection";
import { FrameGeometrySection } from "./Sidebar/FrameGeometrySection";
import { SidebarHeader } from "./Sidebar/SidebarHeader";

import { useOpticalContext } from "../contexts/OpticalContext";

interface SidebarProps {
  lang: Language;
  isMobile?: boolean;
}

/**
 * The inspector: every input the engine takes, in the order the work happens —
 * the prescription, the frame, the fitting. Three groups, all open, no chrome.
 */
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

  const renderFormContent = () => (
    <div className="flex flex-col">
      <LensParametersSection
        lens={lens}
        onLensChange={setLens}
        lang={lang}
        indices={indices}
        isOpen={openGroup.lens}
        onToggle={toggleGroup}
      />

      <Collapsible
        open={openGroup.frame}
        onOpenChange={() => toggleGroup("frame")}
        className="py-1"
      >
        <CollapsibleTrigger
          className={cn(
            "flex w-full cursor-pointer items-center justify-between py-2 text-left",
            "text-[13px] font-medium text-sheet-ink outline-none",
            "transition-colors duration-150 hover:text-sheet-accent",
          )}
        >
          <span>{t.frameGeometry}</span>
          <ChevronDownIcon
            size={15}
            className={cn(
              "shrink-0 text-sheet-muted transition-transform duration-200",
              openGroup.frame && "rotate-180",
            )}
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pb-3 pt-2">
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
          </div>
        </CollapsibleContent>
      </Collapsible>

      <FittingSpecsSection
        patient={patient}
        onPatientChange={setPatient}
        bevelPercent={bevelPercent}
        onBevelChange={setBevelPercent}
        lang={lang}
        isOpen={openGroup.fitting}
        onToggle={toggleGroup}
      />

      {/* Comparison: one switch, then the index it compares against. */}
      <div className="mt-3 flex flex-col gap-3 bg-sheet-panel p-3">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-sheet-ink">{t.compareMode}</span>
          <Switch
            checked={compareMode}
            onCheckedChange={setCompareMode}
            aria-label={t.compareMode}
          />
        </label>
        {compareMode && (
          <div className="sheet-fade">
            <RefractiveIndexDropdown
              index={compareIndex}
              onChange={setCompareIndex}
              indices={indices}
              lang={lang}
              showLabel={false}
            />
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="mx-auto max-w-xl bg-sheet-ground p-1">{renderFormContent()}</div>
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
