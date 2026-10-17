import { useSearch, useNavigate } from '@tanstack/react-router';
import { Sidebar } from '../Sidebar';
import { Visualizer } from '../Visualizer';
import { JobTicket } from '../sheet/JobTicket';
import { MeasurementSheet } from '../sheet/MeasurementSheet';
import { RecommendationRow } from '../sheet/RecommendationRow';
import { useOpticalContext } from '../../contexts/OpticalContext';
import { ScrollArea } from '../ui/scroll-area';
import ErrorBoundary from '../ErrorBoundary';
import type { SimulatorSearchParams } from '../../types/search-params';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { translations } from '../../lib/translations';
import { AppFooter } from './AppFooter';
import { ValidationAlerts } from './ValidationAlerts';
import { HeaderBar } from './HeaderBar';
import { useState } from 'react';

/**
 * The workbench, desktop.
 *
 * Inspector on the left, then the workspace read top to bottom as one lab
 * sheet: the claim, the order, the drawing with its caliper schedule, then the
 * measured values and the engine's recommendation.
 */
export function DesktopGrid() {
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
    compareMode,
    compareIndex,
    result,
    compareResult,
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
    <div className="flex h-full w-full flex-1 overflow-hidden bg-sheet-ground">
      <div className="hidden shrink-0 bg-sheet-ground md:block">
        <Sidebar lang={lang} />
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
            {/* The claim of the page, in two lines at most. */}
            <div className="flex flex-col gap-2 lg:max-w-[64ch]">
              <h1 className="sheet-rise text-[28px] font-medium leading-[1.15] tracking-[-0.025em] text-sheet-ink sm:text-[34px]">
                {t.workbenchTitle}
              </h1>
              <p className="sheet-rise delay-1 max-w-[58ch] text-[16px] leading-relaxed text-sheet-ink">
                {t.workbenchLead}
              </p>
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

            {/* The drawing gets the full width, so all three views and the
                schedule fit without any one of them shrinking to a thumbnail. */}
            <div className="sheet-rise delay-2 h-[50vh] min-h-[400px] xl:h-[430px]">{board}</div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as 'simple' | 'advanced')}>
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
                  compareResult={compareResult}
                  lang={lang}
                  frame={frame}
                  lens={lens}
                  isAdvanced={false}
                />
                <RecommendationRow result={result} lensIndex={lens.index} lang={lang} />
              </TabsContent>

              <TabsContent value="advanced" className="mt-6 flex flex-col gap-8 focus-visible:outline-none">
                <MeasurementSheet
                  result={result}
                  compareResult={compareResult}
                  lang={lang}
                  frame={frame}
                  lens={lens}
                  isAdvanced
                />
                <RecommendationRow result={result} lensIndex={lens.index} lang={lang} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <AppFooter lang={lang} />
      </div>
    </div>
  );
}
