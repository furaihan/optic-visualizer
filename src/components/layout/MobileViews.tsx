import { useState, useRef, useEffect } from "react";
import { Sidebar } from "../Sidebar";
import { Visualizer } from "../Visualizer";
import { SummaryCard } from "../cards/SummaryCard";
import { CurvatureCard } from "../cards/CurvatureCard";
import { RecommendationCard } from "../cards/RecommendationCard";
import { useOpticalContext } from "../../contexts/OpticalContext";
import { ScrollArea } from "../ui/scroll-area";
import ErrorBoundary from "../ErrorBoundary";
import { useSearch } from '@tanstack/react-router';

import type { SimulatorSearchParams } from '../../routes/index';

export function MobileViews() {
  const search = useSearch({ strict: false }) as SimulatorSearchParams;
  const lang = search.lang || 'id';
  const view = search.view || 'side';
  const activeTab = search.activeTab || 'visualizer';

  const [isRecalculating, setIsRecalculating] = useState(false);

  const {
    lens,
    frame,
    patient,
    bevelPercent,
    frameType,
    compareMode,
    compareIndex,
    setLens,
    setFrame,
    setPatient,
    setBevelPercent,
    setFrameType,
    setCompareMode,
    setCompareIndex,
    result,
    compareResult,
    highlightedLimit,
    setHighlightedLimit
  } = useOpticalContext();

  const prevDepsRef = useRef({ lens, frame, patient, compareMode, compareIndex, bevelPercent, frameType });

  useEffect(() => {
    const hasChanged = 
      lens !== prevDepsRef.current.lens || 
      frame !== prevDepsRef.current.frame || 
      patient !== prevDepsRef.current.patient ||
      compareMode !== prevDepsRef.current.compareMode ||
      compareIndex !== prevDepsRef.current.compareIndex ||
      bevelPercent !== prevDepsRef.current.bevelPercent ||
      frameType !== prevDepsRef.current.frameType;
      
    if (hasChanged) {
      setIsRecalculating(true);
      prevDepsRef.current = { lens, frame, patient, compareMode, compareIndex, bevelPercent, frameType };
      const timer = setTimeout(() => setIsRecalculating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [lens, frame, patient, compareMode, compareIndex, bevelPercent, frameType]);

  return (
    <div className="md:hidden flex flex-col flex-1 min-h-0 overflow-hidden mt-3">
      {activeTab === "visualizer" && (
        <div className="flex-1 flex flex-col min-h-0 animate-tab-enter">
          <ErrorBoundary fallback={<div className="h-full w-full flex items-center justify-center border border-red-200 bg-red-50 text-red-600 rounded-xl text-xs">Visualizer Error</div>}>
            <Visualizer
              lens={lens}
              frame={frame}
              patient={patient}
              result={result}
              compareResult={compareResult}
              compareLens={compareMode ? { ...lens, index: compareIndex } : undefined}
              lang={lang}
              view={view}
              frameType={frameType}
              highlightedLimit={highlightedLimit}
            />
          </ErrorBoundary>
        </div>
      )}

      {activeTab === "summary" && (
        <div className="flex-1 flex flex-col min-h-0 animate-tab-enter-up">
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-4 pb-6 pr-1.5">
              <ErrorBoundary fallback={<div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-xl text-xs">Summary Card Error</div>}>
                <SummaryCard
                  result={result}
                  compareResult={compareResult}
                  lang={lang}
                  frame={frame}
                  lens={lens}
                  isLoading={isRecalculating}
                />
              </ErrorBoundary>
              <CurvatureCard result={result} lang={lang} />
              <RecommendationCard
                result={result}
                lensIndex={lens.index}
                lang={lang}
                isLoading={isRecalculating}
              />
            </div>
          </ScrollArea>
        </div>
      )}

      {activeTab === "parameters" && (
        <div className="flex-1 flex flex-col min-h-0 animate-tab-enter-up">
          <ScrollArea className="flex-1 min-h-0">
            <div className="pb-6 pr-1.5">
              <Sidebar lang={lang} isMobile={true} />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
