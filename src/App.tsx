/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { Visualizer } from "./components/Visualizer";
import { SummaryCard } from "./components/SummaryCard";
import { CurvatureCard } from "./components/CurvatureCard";
import { RecommendationCard } from "./components/RecommendationCard";
import { useOpticalContext } from "./contexts/OpticalContext";
import { useTheme } from "./hooks/useTheme";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { OPTICAL_ENGINE_VERSION } from "./lib/optical";
import { translations, Language } from "./lib/translations";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "./components/ui/scroll-area";
import { Undo2, Redo2, RotateCcw, AlertTriangle, Sun, Moon } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import { useSearch, useNavigate } from '@tanstack/react-router';
import { type SimulatorSearchParams } from './routes/index';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}

export default function App() {
  const search = useSearch({ strict: false }) as SimulatorSearchParams;
  const navigate = useNavigate({ from: '/visualizer' });

  const lang = search.lang || 'id';

  const view = search.view || 'side';
  const setView = (newView: "side" | "top" | "front") => navigate({ search: (prev) => ({ ...prev, view: newView }) });

  const activeTab = search.activeTab || 'visualizer';
  const setActiveTab = (tab: "visualizer" | "summary" | "parameters") => navigate({ search: (prev) => ({ ...prev, activeTab: tab }) });

  const handleTabChange = setActiveTab;

  // Dark/Light Mode support
  const { theme, toggleTheme } = useTheme();

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const t = translations[lang];

  const [highlightedLimit, setHighlightedLimit] = useState<'a' | 'b' | 'dbl' | 'ed' | null>(null);

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
    validation,
    undo,
    redo,
    canUndo,
    canRedo,
    resetSession,
  } = useOpticalContext();

  const [isRecalculating, setIsRecalculating] = useState(false);
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

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setActiveTab("visualizer");
      }
    };
    handleResize(mql);
    mql.addEventListener("change", handleResize);
    return () => mql.removeEventListener("change", handleResize);
  }, []);

  // Keyboard shortcut listener for Ctrl+Z (Undo) and Ctrl+Y (Redo)
  useKeyboardShortcuts(undo, redo);

  return (
    <div className="flex flex-1 h-full overflow-hidden">
        <div className="hidden md:block shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
          <Sidebar
            lens={lens}
            setLens={setLens}
            frame={frame}
            setFrame={setFrame}
            patient={patient}
            setPatient={setPatient}
            compareMode={compareMode}
            setCompareMode={setCompareMode}
            compareIndex={compareIndex}
            setCompareIndex={setCompareIndex}
            bevelPercent={bevelPercent}
            setBevelPercent={setBevelPercent}
            frameType={frameType}
            setFrameType={setFrameType}
            lang={lang}
            highlightedLimit={highlightedLimit}
            setHighlightedLimit={setHighlightedLimit}
          />
        </div>

        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Header Bar */}
          <header className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-20 shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-[10px] md:text-[11px] tracking-widest text-slate-400 dark:text-slate-500 uppercase truncate max-w-[120px] sm:max-w-none">
                {t.title}
              </h1>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
              <div
                className={`gap-1 bg-slate-50 dark:bg-slate-950 p-0.5 md:p-1 rounded-lg border border-slate-200/50 dark:border-slate-800/80 ${activeTab !== "visualizer" ? "hidden md:flex" : "flex"}`}
              >
                <button
                  onClick={() => setView("side")}
                  className={`px-2 md:px-3 py-0.5 text-[8px] md:text-[9px] font-bold rounded-md border transition-all cursor-pointer ${view === "side" ? "bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-100 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                >
                  {t.sideProfile}
                </button>
                <button
                  onClick={() => setView("top")}
                  className={`px-2 md:px-3 py-0.5 text-[8px] md:text-[9px] font-bold rounded-md border transition-all cursor-pointer ${view === "top" ? "bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-100 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                >
                  {t.topDown}
                </button>
                <button
                  onClick={() => setView("front")}
                  className={`px-2 md:px-3 py-0.5 text-[8px] md:text-[9px] font-bold rounded-md border transition-all cursor-pointer ${view === "front" ? "bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-100 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                >
                  {t.frontView}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0 font-sans">
              {/* Undo / Redo controls */}
              <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className={`p-2 md:p-1.5 h-11 w-11 md:h-8 md:w-8 flex items-center justify-center rounded-md transition-all ${
                    canUndo ? "text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm cursor-pointer" : "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50"
                  }`}
                  title={t.undoTitle}
                  aria-label={t.undo}
                >
                  <Undo2 size={16} className="md:w-3 md:h-3" aria-hidden="true" />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className={`p-2 md:p-1.5 h-11 w-11 md:h-8 md:w-8 flex items-center justify-center rounded-md transition-all ${
                    canRedo ? "text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm cursor-pointer" : "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50"
                  }`}
                  title={t.redoTitle}
                  aria-label={t.redo}
                >
                  <Redo2 size={16} className="md:w-3 md:h-3" aria-hidden="true" />
                </button>
              </div>

              {/* Reset Session */}
              <button
                onClick={resetSession}
                className="p-2 md:p-1 px-3 md:px-2.5 h-11 min-w-[44px] md:h-8 md:min-w-0 rounded-lg text-[10px] md:text-[9px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/85 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                title={t.resetTitle}
                aria-label={t.resetSession}
              >
                <RotateCcw size={14} className="md:w-3 md:h-3" aria-hidden="true" />
                <span className="hidden sm:inline">{t.reset}</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 md:p-1.5 h-11 w-11 md:h-8 md:w-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/80 cursor-pointer transition-all flex items-center justify-center"
                title={theme === 'light' ? t.toggleDark : t.toggleLight}
                aria-label={theme === 'light' ? t.toggleDark : t.toggleLight}
              >
                {theme === 'light' ? <Moon size={16} className="md:w-3 md:h-3" aria-hidden="true" /> : <Sun size={16} className="md:w-3 md:h-3 text-amber-400" aria-hidden="true" />}
              </button>
            </div>
          </header>

          {/* Verification / Alert Warnings Bar */}
          {validation.errors.length > 0 && (
            <div className="bg-amber-50/90 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/40 px-4 md:px-6 py-2 shrink-0 animate-fade-in">
              <div className="flex items-start gap-2 max-w-7xl mx-auto">
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400 mb-0.5 whitespace-normal break-words">
                    {t.clinicalVerification}
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 font-medium leading-tight">
                    {validation.errors.map((err, i) => (
                      <li key={i} className="whitespace-normal break-words py-0.5">
                        {lang === 'id' ? err.messageId : err.messageEn}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Visualization Content */}
          <div className="flex-1 overflow-hidden p-3 md:p-4 lg:p-6 flex flex-col gap-3 md:gap-4">
            {/* Mobile Tab Control */}
            <div className="md:hidden flex p-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl shrink-0" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === "visualizer"}
                onClick={() => handleTabChange("visualizer")}
                className={`flex-1 min-h-[44px] py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  activeTab === "visualizer"
                    ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/40 dark:border-slate-800/80"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent"
                }`}
              >
                {t.tabVisualizer}
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "summary"}
                onClick={() => handleTabChange("summary")}
                className={`flex-1 min-h-[44px] py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  activeTab === "summary"
                    ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/40 dark:border-slate-800/80"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent"
                }`}
              >
                {t.tabSummary}
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "parameters"}
                onClick={() => handleTabChange("parameters")}
                className={`flex-1 min-h-[44px] py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  activeTab === "parameters"
                    ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/40 dark:border-slate-800/80"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent"
                }`}
              >
                {t.tabParameters}
              </button>
            </div>

            {/* DESKTOP VIEWPORT: md:flex */}
            <ScrollArea className="hidden md:block flex-1 min-h-0 pl-0.5">
              <div className="flex flex-col gap-4 md:pr-3 pb-6">
                {/* Summary Stats Grid (Compact) */}
              <div className="shrink-0">
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
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
                {/* Simulation Component - Large Center */}
                <div className="lg:col-span-2 min-h-[400px] h-[50vh] xl:h-[500px]">
                  <ErrorBoundary fallback={<div className="h-full w-full flex items-center justify-center border border-red-200 bg-red-50 text-red-600 rounded-xl text-xs">Visualizer Rendering Error</div>}>
                    <Visualizer
                      lens={lens}
                      frame={frame}
                      patient={patient}
                      result={result}
                      compareResult={compareResult}
                      compareLens={
                        compareMode ? { ...lens, index: compareIndex } : undefined
                      }
                      lang={lang}
                      view={view}
                      frameType={frameType}
                      highlightedLimit={highlightedLimit}
                    />
                  </ErrorBoundary>
                </div>

                {/* Technical breakdown column */}
                <div className="flex flex-col gap-4">
                  <CurvatureCard result={result} lang={lang} />
                  <RecommendationCard
                    result={result}
                    lensIndex={lens.index}
                    lang={lang}
                    isLoading={isRecalculating}
                  />
                </div>
              </div>
              </div>
            </ScrollArea>

            {/* MOBILE VIEWPORT: md:hidden */}
            <div className="md:hidden flex flex-col flex-1 min-h-0 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "visualizer" && (
                  <motion.div
                    key="visualizer"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 flex flex-col min-h-0"
                  >
                    <ErrorBoundary fallback={<div className="h-full w-full flex items-center justify-center border border-red-200 bg-red-50 text-red-600 rounded-xl text-xs">Visualizer Error</div>}>
                      <Visualizer
                        lens={lens}
                        frame={frame}
                        patient={patient}
                        result={result}
                        compareResult={compareResult}
                        compareLens={
                          compareMode ? { ...lens, index: compareIndex } : undefined
                        }
                        lang={lang}
                        view={view}
                        frameType={frameType}
                        highlightedLimit={highlightedLimit}
                      />
                    </ErrorBoundary>
                  </motion.div>
                )}

                {activeTab === "summary" && (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 flex flex-col min-h-0"
                  >
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
                  </motion.div>
                )}

                {activeTab === "parameters" && (
                  <motion.div
                    key="parameters"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 flex flex-col min-h-0"
                  >
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="pb-6 pr-1.5">
                        <Sidebar
                          lens={lens}
                          setLens={setLens}
                          frame={frame}
                          setFrame={setFrame}
                          patient={patient}
                          setPatient={setPatient}
                          compareMode={compareMode}
                          setCompareMode={setCompareMode}
                          compareIndex={compareIndex}
                          setCompareIndex={setCompareIndex}
                          bevelPercent={bevelPercent}
                          setBevelPercent={setBevelPercent}
                          frameType={frameType}
                          setFrameType={setFrameType}
                          lang={lang}
                          isMobile={true}
                          highlightedLimit={highlightedLimit}
                          setHighlightedLimit={setHighlightedLimit}
                        />
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Info (Subtle) */}
          <footer className="h-7 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-500 px-4 md:px-6 flex items-center justify-between text-[8px] font-mono shrink-0 z-20 overflow-hidden shadow-sm">
            <div className="flex gap-4 md:gap-6 uppercase tracking-[0.1em] truncate mr-2">
              <span className="flex gap-1 md:gap-1.5">
                <span className="text-slate-300 dark:text-slate-600">{t.framePd}:</span>{" "}
                {(frame.a + frame.dbl).toFixed(1)}mm
              </span>
              <span className="flex gap-1 md:gap-1.5">
                <span className="text-slate-300 dark:text-slate-600">{t.decentration}:</span>{" "}
                {result.decentration.toFixed(2)}mm
              </span>
              <span className="flex gap-1 md:gap-1.5">
                <span className="text-slate-300 dark:text-slate-600">{t.minBlank}:</span>{" "}
                {(result.y * 2 + 2).toFixed(0)}mm
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-4 text-[7px] text-slate-300 dark:text-slate-600 shrink-0">
              <span className="hidden sm:inline">
                {t.engine}: {OPTICAL_ENGINE_VERSION}
              </span>
              <span className="uppercase">© 2026 {t.labs}</span>
            </div>
          </footer>
        </div>
    </div>
  );
}
