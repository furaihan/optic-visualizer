import { useState, useRef, useEffect } from "react";
import { AsphericSidebar } from "./AsphericSidebar";
import { AsphericVisualizer } from "./AsphericVisualizer";
import { SummaryCard } from "./cards/SummaryCard";
import { CurvatureCard } from "./cards/CurvatureCard";
import { RecommendationCard } from "./cards/RecommendationCard";
import { useAsphericContext } from "../contexts/AsphericContext";
import { ScrollArea } from "./ui/scroll-area";
import ErrorBoundary from "./ErrorBoundary";
import { useSearch, useMatchRoute, useNavigate } from '@tanstack/react-router';
import type { SimulatorSearchParams } from '../routes/index';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { translations } from "../lib/translations";

export function AsphericDesktopGrid({
  Header,
  Footer,
  Alerts,
}: {
  Header: React.ReactNode;
  Footer: React.ReactNode;
  Alerts: React.ReactNode;
}) {
  const search = useSearch({ strict: false }) as SimulatorSearchParams;
  const lang = search.lang || 'id';
  const view = search.view || 'side';

  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const currentMode = matchRoute({ to: '/aspheric/advanced' }) ? 'advanced' : 'simple';
  const t = translations[lang];

  const [isRecalculating, setIsRecalculating] = useState(false);

  const {
    lens,
    frame,
    patient,
    bevelPercent,
    frameType,
    setLens,
    setFrame,
    setPatient,
    setBevelPercent,
    setFrameType,
    result,
    highlightedLimit,
    setHighlightedLimit,
  } = useAsphericContext();

  const prevDepsRef = useRef({ lens, frame, patient, bevelPercent, frameType });

  useEffect(() => {
    const hasChanged =
      lens !== prevDepsRef.current.lens ||
      frame !== prevDepsRef.current.frame ||
      patient !== prevDepsRef.current.patient ||
      bevelPercent !== prevDepsRef.current.bevelPercent ||
      frameType !== prevDepsRef.current.frameType;

    if (hasChanged) {
      setIsRecalculating(true);
      prevDepsRef.current = { lens, frame, patient, bevelPercent, frameType };
      const timer = setTimeout(() => setIsRecalculating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [lens, frame, patient, bevelPercent, frameType]);

  const handleTabChange = (value: string) => {
    navigate({ to: `/aspheric/${value}`, search: (prev: any) => prev });
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden w-full">
      <div className="shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
        <AsphericSidebar lang={lang} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {Header}
        {Alerts}
        <ScrollArea className="flex-1 min-h-0 pl-0.5">
          <div className="flex flex-col gap-4 md:pr-3 pb-6 p-3 md:p-4 lg:p-6">
            <Tabs value={currentMode} onValueChange={handleTabChange} className="w-full flex-col">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="grid w-64 grid-cols-2 h-9 p-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/50 dark:border-slate-800/80">
                  <TabsTrigger value="simple" className="text-xs font-semibold">{t.tabImage}</TabsTrigger>
                  <TabsTrigger value="advanced" className="text-xs font-semibold">{t.tabStatistics}</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="simple" className="flex flex-col gap-4 focus-visible:outline-none">
                <div className="shrink-0">
                  <ErrorBoundary fallback={<div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-xl text-xs">Summary Card Error</div>}>
                    <SummaryCard
                      result={result}
                      lang={lang}
                      frame={frame}
                      lens={{ sph: lens.sph, cyl: lens.cyl, axis: lens.axis, index: lens.index, baseCurve: lens.baseCurve }}
                      isLoading={isRecalculating}
                      isAdvanced={false}
                    />
                  </ErrorBoundary>
                </div>
                <div className="min-h-[400px] h-[50vh] xl:h-[500px]">
                  <ErrorBoundary fallback={<div className="h-full w-full flex items-center justify-center border border-red-200 bg-red-50 text-red-600 rounded-xl text-xs">Visualizer Rendering Error</div>}>
                    <AsphericVisualizer
                      lens={lens}
                      frame={frame}
                      patient={patient}
                      result={result}
                      lang={lang}
                      view={view}
                      frameType={frameType}
                      highlightedLimit={highlightedLimit}
                    />
                  </ErrorBoundary>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="flex flex-col gap-4 focus-visible:outline-none">
                <div className="shrink-0">
                  <ErrorBoundary fallback={<div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-xl text-xs">Summary Card Error</div>}>
                    <SummaryCard
                      result={result}
                      lang={lang}
                      frame={frame}
                      lens={{ sph: lens.sph, cyl: lens.cyl, axis: lens.axis, index: lens.index, baseCurve: lens.baseCurve }}
                      isLoading={isRecalculating}
                    />
                  </ErrorBoundary>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CurvatureCard result={result} lang={lang} />
                  <RecommendationCard
                    result={result}
                    lensIndex={lens.index}
                    lang={lang}
                    isLoading={isRecalculating}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
        {Footer}
      </div>
    </div>
  );
}
