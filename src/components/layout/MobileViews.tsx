import { useState } from "react";
import { Sidebar } from "../Sidebar";
import { Visualizer } from "../Visualizer";
import { JobTicket } from "../sheet/JobTicket";
import { MeasurementSheet } from "../sheet/MeasurementSheet";
import { RecommendationRow } from "../sheet/RecommendationRow";
import { useOpticalContext } from "../../contexts/OpticalContext";
import { ScrollArea } from "../ui/scroll-area";
import ErrorBoundary from "../ErrorBoundary";
import { useSearch } from '@tanstack/react-router';
import type { SimulatorSearchParams } from '../../types/search-params';
import { translations } from "../../lib/translations";

/**
 * The phone composition, which is its own layout rather than the desktop
 * squeezed: the drawing first and full-bleed, the order under it, then the
 * measurements.
 */
export function MobileViews() {
  const search = useSearch({ strict: false }) as unknown as SimulatorSearchParams;
  const lang = search.lang;
  const view = search.view;
  const activeTab = search.activeTab;
  const t = translations[lang];

  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

  const {
    lens,
    frame,
    patient,
    bevelPercent,
    frameType,
    compareMode,
    compareIndex,
    result,
    compareResult,
    validation,
  } = useOpticalContext();

  const compareLens = compareMode ? { ...lens, index: compareIndex } : undefined;

  const board = (
    <ErrorBoundary
      fallback={
        <div className="flex h-full items-center justify-center bg-sheet-panel p-6 text-[16px] text-sheet-ink">
          {t.simError}
        </div>
      }
    >
      <Visualizer
        lens={lens}
        frame={frame}
        patient={patient}
        result={result}
        compareResult={compareResult}
        compareLens={compareLens}
        lang={lang}
        view={view}
        frameType={frameType}
        highlightedLimit={null}
        bevelPercent={bevelPercent}
      />
    </ErrorBoundary>
  );

  return (
    <div className="mt-3 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:hidden">
      {activeTab === "visualizer" && (
        <div className="sheet-fade flex min-h-0 flex-1 flex-col">
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-6 pb-8">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-[24px] font-medium leading-[1.15] tracking-[-0.02em] text-sheet-ink">
                  {t.workbenchTitle}
                </h1>
                <p className="text-[16px] leading-relaxed text-sheet-ink">{t.workbenchLead}</p>
              </div>

              <div
                className={`min-w-0 ${
                  compareMode ? 'h-[78vh] min-h-[520px]' : 'h-[74vh] min-h-[480px]'
                }`}
              >
                {board}
              </div>

              <JobTicket
                lens={lens}
                frame={frame}
                patient={patient}
                result={result}
                frameType={frameType}
                bevelPercent={bevelPercent}
                lang={lang}
                compareIndex={compareMode ? compareIndex : undefined}
                compareResult={compareResult}
              />
            </div>
          </ScrollArea>
        </div>
      )}

      {activeTab === "summary" && (
        <div className="sheet-fade flex min-h-0 flex-1 flex-col">
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-6 pb-8">
              <div className="flex items-baseline gap-1 bg-sheet-panel p-1">
                <button
                  type="button"
                  onClick={() => setMode('simple')}
                  className={`min-h-9 flex-1 px-3 text-[13px] font-medium transition-colors duration-150 ${
                    mode === 'simple'
                      ? 'bg-sheet-ground text-sheet-ink'
                      : 'text-sheet-muted hover:text-sheet-ink'
                  }`}
                  aria-pressed={mode === 'simple'}
                >
                  {t.tabImage}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('advanced')}
                  className={`min-h-9 flex-1 px-3 text-[13px] font-medium transition-colors duration-150 ${
                    mode === 'advanced'
                      ? 'bg-sheet-ground text-sheet-ink'
                      : 'text-sheet-muted hover:text-sheet-ink'
                  }`}
                  aria-pressed={mode === 'advanced'}
                >
                  {t.tabStatistics}
                </button>
              </div>

              <MeasurementSheet
                result={result}
                compareResult={compareResult}
                lang={lang}
                frame={frame}
                lens={lens}
                isAdvanced={mode === 'advanced'}
              />
              <RecommendationRow result={result} lensIndex={lens.index} lang={lang} />
            </div>
          </ScrollArea>
        </div>
      )}

      {activeTab === "parameters" && (
        <div className="sheet-fade flex min-h-0 flex-1 flex-col">
          <ScrollArea className="min-h-0 flex-1">
            <div className="pb-8">
              <Sidebar lang={lang} isMobile />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
