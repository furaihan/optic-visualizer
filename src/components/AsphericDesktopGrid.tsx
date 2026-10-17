import { useState } from "react";
import { AsphericSidebar } from "./AsphericSidebar";
import { AsphericVisualizer } from "./AsphericVisualizer";
import { JobTicket } from "./sheet/JobTicket";
import { MeasurementSheet } from "./sheet/MeasurementSheet";
import { RecommendationRow } from "./sheet/RecommendationRow";
import { useAsphericContext } from "../contexts/AsphericContext";
import { ScrollArea } from "./ui/scroll-area";
import ErrorBoundary from "./ErrorBoundary";
import { useSearch, useNavigate } from '@tanstack/react-router';
import type { SimulatorSearchParams } from '../types/search-params';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { translations } from "../lib/translations";
import { AppFooter } from "./layout/AppFooter";
import { ValidationAlerts } from "./layout/ValidationAlerts";
import { HeaderBar } from "./layout/HeaderBar";

/**
 * The aspheric workbench. Same sheet as the spherical one, with the aspheric
 * surface parameters in the inspector and the same measurement table below.
 */
export function AsphericDesktopGrid() {
  const search = useSearch({ strict: false }) as unknown as SimulatorSearchParams;
  const lang = search.lang;
  const view = search.view;
  const navigate = useNavigate();
  const t = translations[lang];
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

  const {
    lens,
    frame,
    patient,
    bevelPercent,
    frameType,
    result,
  } = useAsphericContext();

  const lensForSheet = {
    sph: lens.sph,
    cyl: lens.cyl,
    axis: lens.axis,
    index: lens.index,
    baseCurve: lens.baseCurve,
  };

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden bg-sheet-ground">
      <div className="hidden shrink-0 bg-sheet-ground md:block">
        <AsphericSidebar lang={lang} />
      </div>

      <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <HeaderBar
          lang={lang}
          view={view}
          activeTab="visualizer"
          onViewChange={(v) => navigate({ search: { ...search, view: v } } as any)}
        />
        <ValidationAlerts lang={lang} />

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-8 px-3 pb-12 pt-4 sm:px-4">
            <div className="flex flex-col gap-2 lg:max-w-[64ch]">
              <h1 className="text-[28px] font-medium leading-[1.15] tracking-[-0.025em] text-sheet-ink sm:text-[34px]">
                {t.asphericMode}
              </h1>
              <p className="max-w-[58ch] text-[16px] leading-relaxed text-sheet-ink">
                {t.asphericParams}
              </p>
            </div>

            <JobTicket
              lens={lensForSheet}
              frame={frame}
              patient={patient}
              result={result}
              frameType={frameType}
              bevelPercent={bevelPercent}
              lang={lang}
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
              <Tabs
                value={mode}
                onValueChange={(v) => setMode(v as 'simple' | 'advanced')}
                className="min-w-0"
              >
                <TabsList className="h-9 gap-0 rounded-none bg-sheet-panel p-1">
                  <TabsTrigger
                    value="simple"
                    className="h-full rounded-none px-3 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
                  >
                    {t.tabImage}
                  </TabsTrigger>
                  <TabsTrigger
                    value="advanced"
                    className="h-full rounded-none px-3 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
                  >
                    {t.tabStatistics}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="simple" className="mt-6 flex flex-col gap-8 focus-visible:outline-none">
                  <MeasurementSheet
                    result={result}
                    lang={lang}
                    frame={frame}
                    lens={lensForSheet}
                    isAdvanced={false}
                  />
                  <RecommendationRow result={result} lensIndex={lens.index} lang={lang} />
                </TabsContent>

                <TabsContent value="advanced" className="mt-6 flex flex-col gap-8 focus-visible:outline-none">
                  <MeasurementSheet
                    result={result}
                    lang={lang}
                    frame={frame}
                    lens={lensForSheet}
                    isAdvanced
                  />
                  <RecommendationRow result={result} lensIndex={lens.index} lang={lang} />
                </TabsContent>
              </Tabs>

              <div className="order-first min-w-0 lg:order-none lg:sticky lg:top-0">
                <div className="h-[52vh] min-h-[360px] lg:h-[calc(100dvh-8rem)]">
                  <ErrorBoundary
                    fallback={
                      <div className="flex h-full items-center justify-center bg-sheet-panel p-6 text-[16px] text-sheet-ink">
                        {t.simError}
                      </div>
                    }
                  >
                    <AsphericVisualizer
                      lens={lens}
                      frame={frame}
                      patient={patient}
                      result={result}
                      lang={lang}
                      view={view}
                      frameType={frameType}
                      highlightedLimit={null}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <AppFooter lang={lang} />
      </div>
    </div>
  );
}
