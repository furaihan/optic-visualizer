import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Visualizer } from "./components/Visualizer";
import { SummaryCard } from "./components/SummaryCard";
import { CurvatureCard } from "./components/CurvatureCard";
import { RecommendationCard } from "./components/RecommendationCard";
import {
  calculateLens,
  LensParameters,
  FrameParameters,
  PatientParameters,
  FrameType,
  OPTICAL_ENGINE_VERSION,
} from "./lib/optical";
import { translations, Language } from "./lib/i18n";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [lang, setLang] = useState<Language>("id");
  const [view, setView] = useState<"side" | "top" | "front">("side");
  const [activeTab, setActiveTab] = useState<
    "visualizer" | "summary" | "parameters"
  >("visualizer");
  const t = translations[lang];

  const [lens, setLens] = useState<LensParameters>({
    sph: -4.0,
    cyl: 0.0,
    axis: 0,
    index: 1.6,
    baseCurve: 4.0,
  });

  const [frame, setFrame] = useState<FrameParameters>({
    a: 52,
    b: 40,
    dbl: 18,
    depth: 4.5,
    ed: 54,
  });

  const [patient, setPatient] = useState<PatientParameters>({
    pd: 63,
    fittingHeight: 22,
  });

  const [compareMode, setCompareMode] = useState(false);
  const [compareIndex, setCompareIndex] = useState(1.74);
  const [bevelPercent, setBevelPercent] = useState(0.33);
  const [frameType, setFrameType] = useState<FrameType>("full");

  const result = useMemo(
    () => calculateLens(lens, frame, patient, 1.0, bevelPercent, frameType),
    [lens, frame, patient, bevelPercent, frameType],
  );

  const compareResult = useMemo(() => {
    if (!compareMode) return undefined;
    return calculateLens(
      { ...lens, index: compareIndex },
      frame,
      patient,
      1.0,
      bevelPercent,
      frameType,
    );
  }, [
    lens,
    frame,
    patient,
    compareMode,
    compareIndex,
    bevelPercent,
    frameType,
  ]);

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

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <div className="hidden md:block shrink-0">
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
        />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Bar */}
        <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-[10px] md:text-[11px] tracking-widest text-slate-400 uppercase truncate max-w-[120px] sm:max-w-none">
              {t.title}
            </h2>
            <div className="h-4 w-px bg-slate-200"></div>
            <div
              className={`gap-1 bg-slate-50 p-0.5 md:p-1 rounded-lg border border-slate-200/50 ${activeTab !== "visualizer" ? "hidden md:flex" : "flex"}`}
            >
              <button
                onClick={() => setView("side")}
                className={`px-2 md:px-3 py-0.5 text-[8px] md:text-[9px] font-bold rounded-md border transition-all ${view === "side" ? "bg-white shadow-sm border-slate-200 text-slate-700" : "border-transparent text-slate-400"}`}
              >
                {t.sideProfile}
              </button>
              <button
                onClick={() => setView("top")}
                className={`px-2 md:px-3 py-0.5 text-[8px] md:text-[9px] font-bold rounded-md border transition-all ${view === "top" ? "bg-white shadow-sm border-slate-200 text-slate-700" : "border-transparent text-slate-400"}`}
              >
                {t.topDown}
              </button>
              <button
                onClick={() => setView("front")}
                className={`px-2 md:px-3 py-0.5 text-[8px] md:text-[9px] font-bold rounded-md border transition-all ${view === "front" ? "bg-white shadow-sm border-slate-200 text-slate-700" : "border-transparent text-slate-400"}`}
              >
                {t.frontView}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-slate-50 p-0.5 md:p-1 rounded-lg border border-slate-200/50">
              <button
                onClick={() => setLang("id")}
                className={`px-2 md:px-2.5 py-0.5 text-[8px] md:text-[9px] font-bold rounded-md border transition-all ${lang === "id" ? "bg-white shadow-sm border-slate-200 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                ID
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2 md:px-2.5 py-0.5 text-[8px] md:text-[9px] font-bold rounded-md border transition-all ${lang === "en" ? "bg-white shadow-sm border-slate-200 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                EN
              </button>
            </div>
          </div>
        </header>

        {/* Visualization Content */}
        <div className="flex-1 overflow-hidden p-3 md:p-4 lg:p-6 flex flex-col gap-3 md:gap-4">
          {/* Mobile Tab Control */}
          <div className="md:hidden flex p-1 bg-slate-100 border border-slate-200 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab("visualizer")}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                activeTab === "visualizer"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-700 border border-transparent"
              }`}
            >
              {t.tabVisualizer}
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                activeTab === "summary"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-700 border border-transparent"
              }`}
            >
              {t.tabSummary}
            </button>
            <button
              onClick={() => setActiveTab("parameters")}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                activeTab === "parameters"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/40"
                  : "text-slate-500 hover:text-slate-700 border border-transparent"
              }`}
            >
              {t.tabParameters}
            </button>
          </div>

          {/* DESKTOP VIEWPORT: md:flex */}
          <div className="hidden md:flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar md:pr-1.5 pb-6">
            {/* Summary Stats Grid (Compact) */}
            <div className="shrink-0">
              <SummaryCard
                result={result}
                compareResult={compareResult}
                lang={lang}
                frame={frame}
                lens={lens}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
              {/* Simulation Component - Large Center */}
              <div className="lg:col-span-2 h-[480px] min-h-[380px]">
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
                />
              </div>

              {/* Technical breakdown column */}
              <div className="flex flex-col gap-4">
                <CurvatureCard result={result} lang={lang} />
                <RecommendationCard
                  result={result}
                  lensIndex={lens.index}
                  lang={lang}
                />
              </div>
            </div>
          </div>

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
                  />
                </motion.div>
              )}

              {activeTab === "summary" && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 overflow-y-auto space-y-4 pb-6 custom-scrollbar pr-0.5"
                >
                  <SummaryCard
                    result={result}
                    compareResult={compareResult}
                    lang={lang}
                    frame={frame}
                    lens={lens}
                  />
                  <CurvatureCard result={result} lang={lang} />
                  <RecommendationCard
                    result={result}
                    lensIndex={lens.index}
                    lang={lang}
                  />
                </motion.div>
              )}

              {activeTab === "parameters" && (
                <motion.div
                  key="parameters"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 overflow-y-auto pb-6 custom-scrollbar pr-0.5"
                >
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
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Info (Subtle) */}
        <footer className="h-7 bg-white border-t border-slate-200 text-slate-400 px-4 md:px-6 flex items-center justify-between text-[8px] font-mono shrink-0 z-20 overflow-hidden">
          <div className="flex gap-4 md:gap-6 uppercase tracking-[0.1em] truncate mr-2">
            <span className="flex gap-1 md:gap-1.5">
              <span className="text-slate-300">{t.framePd}:</span>{" "}
              {(frame.a + frame.dbl).toFixed(1)}mm
            </span>
            <span className="flex gap-1 md:gap-1.5">
              <span className="text-slate-300">{t.decentration}:</span>{" "}
              {result.decentration.toFixed(2)}mm
            </span>
            <span className="flex gap-1 md:gap-1.5">
              <span className="text-slate-300">{t.minBlank}:</span>{" "}
              {(result.y * 2 + 2).toFixed(0)}mm
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-[7px] text-slate-300 shrink-0">
            <span className="hidden sm:inline">
              {t.engine}: {OPTICAL_ENGINE_VERSION}
            </span>
            <span className="uppercase">© 2026 {t.labs}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
