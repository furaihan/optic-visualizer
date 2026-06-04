import React, { useState } from 'react';
import { LensParameters, FrameParameters, PatientParameters, FrameType, LensIndex } from '../lib/optical';
import { translations, Language } from '../lib/translations';
import { 
  Layers, 
  Frame, 
  User, 
  ChevronDown, 
  Eye, 
  Ruler, 
  Aperture, 
  Gauge, 
  Zap, 
  Copy, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { LabelWithTooltip } from './Sidebar/LabelWithTooltip';
import { Control } from './Sidebar/Control';
import { FrameInput } from './Sidebar/FrameInput';

interface SidebarProps {
  lens: LensParameters;
  setLens: (l: LensParameters) => void;
  frame: FrameParameters;
  setFrame: (f: FrameParameters) => void;
  patient: PatientParameters;
  setPatient: (p: PatientParameters) => void;
  compareMode: boolean;
  setCompareMode: (v: boolean) => void;
  compareIndex: LensIndex;
  setCompareIndex: (v: LensIndex) => void;
  bevelPercent: number;
  setBevelPercent: (v: number) => void;
  frameType: FrameType;
  setFrameType: (t: FrameType) => void;
  lang: Language;
  isMobile?: boolean;
  highlightedLimit: 'a' | 'b' | 'dbl' | 'ed' | null;
  setHighlightedLimit: (val: 'a' | 'b' | 'dbl' | 'ed' | null) => void;
  isLoading?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
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
  lang,
  isMobile = false,
  highlightedLimit,
  setHighlightedLimit,
  isLoading
}) => {
  const t = translations[lang];
  const indices: LensIndex[] = [1.5, 1.56, 1.6, 1.67, 1.74];

  // Optical verification threshold helper flags
  const framePD = frame.a + frame.dbl;
  const decentration = Math.abs(framePD - patient.pd) / 2;
  const decentrationV = Math.abs(patient.fittingHeight - frame.b / 2);
  const decentrationCombined = Math.sqrt(decentration * decentration + decentrationV * decentrationV);
  const requiredBlank = frame.ed + 2 * decentrationCombined + 2;

  const isExceedingA = frame.a < 35 || frame.a > 65 || requiredBlank > 80;
  const isExceedingB = frame.b < 20 || frame.b > 55 || patient.fittingHeight > frame.b - 2 || patient.fittingHeight < 5;
  const isExceedingDbl = frame.dbl < 10 || frame.dbl > 28;
  const isExceedingEd = frame.ed < frame.a || frame.ed > 75;

  const [openGroup, setOpenGroup] = useState<Record<string, boolean>>({
    lens: true,
    frame: true,
    fitting: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroup(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const InputGroup: React.FC<{
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    iconColor: string;
    groupKey: string;
    children: React.ReactNode;
  }> = ({ title, icon: Icon, iconColor, groupKey, children }) => {
    const isOpen = openGroup[groupKey] ?? true;
    return (
      <div className="border-b border-slate-100 dark:border-slate-800 last:border-0 py-3">
        <button 
          onClick={() => toggleGroup(groupKey)}
          className="w-full text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 uppercase tracking-wider flex items-center justify-between py-2 cursor-pointer transition-colors"
          aria-expanded={isOpen}
          aria-controls={`group-${groupKey}`}
        >
          <div className="flex items-center gap-1.5">
            <Icon size={12} className={iconColor} />
            <span>{title}</span>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div id={`group-${groupKey}`} className="grid gap-4 mt-3 animate-fade-in text-left">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Shared inner contents of the Parameter inputs
  const renderFormContent = () => (
    <>
      <InputGroup title={t.lensParams} icon={Layers} iconColor="text-blue-500" groupKey="lens">
        <Control 
          label={t.sphere} unit=" D" min={-20} max={20} step={0.25}
          value={lens.sph} onChange={(v) => setLens({ ...lens, sph: v })} lang={lang}
          icon={<Aperture size={13} className="text-blue-500" />}
          isRecalculating={isLoading}
        />
        <Control 
          label={t.cylinder} unit=" D" min={-10} max={0} step={0.25}
          value={lens.cyl} onChange={(v) => setLens({ ...lens, cyl: v })} lang={lang}
          icon={<Gauge size={13} className="text-blue-500" />}
          isRecalculating={isLoading}
        />
        <Control 
          label={t.axis} unit="°" min={0} max={180} step={1}
          value={lens.axis} onChange={(v) => setLens({ ...lens, axis: v })} lang={lang}
          icon={<Zap size={13} className="text-blue-500" />}
          isRecalculating={isLoading}
        />
        <div className="space-y-1.5 flex flex-col">
          <LabelWithTooltip label={t.refractiveIndex} lang={lang} className="text-[11px]" icon={<Eye size={13} className="text-blue-500" />} />
          <div className={`grid grid-cols-3 sm:grid-cols-5 md:grid-cols-3 gap-1.5 p-1 rounded-xl transition-colors duration-300 ${isLoading ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-transparent'}`} role="group" aria-label={t.refractiveIndex}>
            {indices.map(idx => (
              <button
                key={idx}
                onClick={() => setLens({ ...lens, index: idx })}
                className={`py-2 px-1 rounded-lg text-[10px] min-h-[36px] font-bold transition-all border cursor-pointer ${
                  lens.index === idx 
                    ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500 text-white shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-pressed={lens.index === idx}
              >
                {idx.toFixed(2)}
              </button>
            ))}
          </div>
        </div>
        <Control 
          label={t.baseCurve} unit=" D" min={0.25} max={12} step={0.25}
          value={lens.baseCurve} onChange={(v) => setLens({ ...lens, baseCurve: v })} lang={lang}
          icon={<Aperture size={13} className="text-blue-500" />}
          isRecalculating={isLoading}
        />
      </InputGroup>

      <InputGroup title={t.frameGeometry} icon={Frame} iconColor="text-emerald-500" groupKey="frame">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <LabelWithTooltip label={t.aSize} lang={lang} isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
              <button
                type="button"
                onMouseEnter={() => setHighlightedLimit('a')}
                onMouseLeave={() => setHighlightedLimit(null)}
                onClick={() => setHighlightedLimit(highlightedLimit === 'a' ? null : 'a')}
                className={`p-1 rounded-full transition-all cursor-pointer ${
                  isExceedingA 
                    ? 'text-amber-500 hover:text-amber-600 animate-pulse-soft bg-amber-500/10' 
                    : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500'
                }`}
                title={isExceedingA ? t.limitExceededTitle : t.ergonomicLimitsA}
                aria-label="Toggle frame parameter A limit warning highlight"
              >
                <AlertCircle size={11} />
              </button>
            </div>
            <FrameInput 
              value={frame.a} min={35} max={65} isExceeding={isExceedingA}
              onChange={(val) => setFrame({ ...frame, a: val })}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <LabelWithTooltip label={t.bSize} lang={lang} isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
              <button
                type="button"
                onMouseEnter={() => setHighlightedLimit('b')}
                onMouseLeave={() => setHighlightedLimit(null)}
                onClick={() => setHighlightedLimit(highlightedLimit === 'b' ? null : 'b')}
                className={`p-1 rounded-full transition-all cursor-pointer ${
                  isExceedingB 
                    ? 'text-amber-500 hover:text-amber-600 animate-pulse-soft bg-amber-500/10' 
                    : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500'
                }`}
                title={isExceedingB ? t.limitExceededTitle : t.ergonomicLimitsB}
                aria-label="Toggle frame parameter B limit warning highlight"
              >
                <AlertCircle size={11} />
              </button>
            </div>
            <FrameInput 
              value={frame.b} min={20} max={55} isExceeding={isExceedingB}
              onChange={(val) => setFrame({ ...frame, b: val })}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <LabelWithTooltip label="DBL" lang={lang} isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
              <button
                type="button"
                onMouseEnter={() => setHighlightedLimit('dbl')}
                onMouseLeave={() => setHighlightedLimit(null)}
                onClick={() => setHighlightedLimit(highlightedLimit === 'dbl' ? null : 'dbl')}
                className={`p-1 rounded-full transition-all cursor-pointer ${
                  isExceedingDbl 
                    ? 'text-amber-500 hover:text-amber-600 animate-pulse-soft bg-amber-500/10' 
                    : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500'
                }`}
                title={isExceedingDbl ? t.limitExceededTitle : t.ergonomicLimitsDbl}
                aria-label="Toggle bridge dbl limit warning highlight"
              >
                <AlertCircle size={11} />
              </button>
            </div>
            <FrameInput 
              value={frame.dbl} min={10} max={28} isExceeding={isExceedingDbl}
              onChange={(val) => setFrame({ ...frame, dbl: val })}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <LabelWithTooltip label="ED" lang={lang} isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
              <button
                type="button"
                onMouseEnter={() => setHighlightedLimit('ed')}
                onMouseLeave={() => setHighlightedLimit(null)}
                onClick={() => setHighlightedLimit(highlightedLimit === 'ed' ? null : 'ed')}
                className={`p-1 rounded-full transition-all cursor-pointer ${
                  isExceedingEd 
                    ? 'text-amber-500 hover:text-amber-600 animate-pulse-soft bg-amber-500/10' 
                    : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500'
                }`}
                title={isExceedingEd ? t.limitExceededTitle : t.ergonomicLimitsEd}
                aria-label="Toggle effective diameter ed limit warning highlight"
              >
                <AlertCircle size={11} />
              </button>
            </div>
            <FrameInput 
              value={frame.ed} min={35} max={75} isExceeding={isExceedingEd}
              onChange={(val) => setFrame({ ...frame, ed: val })}
            />
          </div>
        </div>
        
        <Control 
          label={t.frameDepth} unit="mm" min={1} max={10} step={0.1} 
          value={frame.depth} onChange={(v) => setFrame({ ...frame, depth: v })} lang={lang} 
          icon={<Gauge size={13} className="text-emerald-500" />} 
        />
        
        <div className="space-y-1.5 pt-2 flex flex-col">
          <LabelWithTooltip label={t.frameType} lang={lang} className="text-[11px]" icon={<Frame size={13} className="text-emerald-500" />} />
          <div className="grid grid-cols-3 md:grid-cols-1 gap-1" role="group" aria-label={t.frameType}>
            {(['full', 'half', 'rimless'] as FrameType[]).map(type => (
              <button
                key={type}
                onClick={() => setFrameType(type)}
                className={`py-2 px-3 rounded text-[10px] font-bold text-center md:text-left transition-all border flex justify-between items-center cursor-pointer ${
                  frameType === type 
                    ? 'bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500 text-white shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                }`}
                aria-pressed={frameType === type}
              >
                <span>{type === 'full' ? t.fullRim : type === 'half' ? t.halfRim : t.rimless}</span>
                {frameType === type && <div className="w-1.5 h-1.5 bg-white rounded-full hidden md:block"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Frame validation warnings */}
        {(isExceedingA || isExceedingB || isExceedingDbl || isExceedingEd) && (
          <div className="col-span-2 text-[9px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-2 rounded-lg flex items-start gap-1.5 mt-2 border border-amber-200/50 dark:border-amber-800/30">
            <AlertCircle size={12} className="shrink-0 mt-px" aria-hidden="true" />
            <span className="leading-snug font-medium">
              {t.ergonomicWarning}
            </span>
          </div>
        )}
      </InputGroup>

      <InputGroup title={t.fittingSpecs} icon={User} iconColor="text-orange-500" groupKey="fitting">
        <Control 
          label={t.pd} unit="mm" min={40} max={80} step={0.5} 
          value={patient.pd} onChange={(v) => setPatient({ ...patient, pd: v })} lang={lang} 
          icon={<Eye size={13} className="text-orange-500" />} 
        />
        <Control 
          label={t.fittingHeight} unit="mm" min={10} max={40} step={0.5} 
          value={patient.fittingHeight} onChange={(v) => setPatient({ ...patient, fittingHeight: v })} lang={lang} 
          icon={<Ruler size={13} className="text-orange-500" />} 
        />
        
        <div className="pt-2">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 mb-2">
            <LabelWithTooltip 
              label={t.bevelPos} 
              lang={lang} 
              isUppercaseHeader 
              className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" 
              icon={<Zap size={11} className="text-orange-500" />} 
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-slate-400">{t.bevelFront}</span>
            <input 
              type="range" min={0} max={1} step={0.01} value={bevelPercent}
              onChange={(e) => setBevelPercent(parseFloat(e.target.value))}
              className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
              aria-label="Bevel positioning slider"
            />
            <span className="text-[9px] font-bold text-slate-400">{t.bevelBack}</span>
            <div className="flex items-center px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 w-[42px]">
              <input 
                type="number" 
                min={0} max={100} step={1} 
                value={Math.round(bevelPercent * 100)}
                onChange={(e) => setBevelPercent(Math.min(100, Math.max(0, parseFloat(e.target.value || "0"))) / 100)}
                className="w-full text-[9px] text-center font-mono bg-transparent outline-none text-slate-600 dark:text-slate-300 appearance-none"
                aria-label="Bevel percentage numeric input"
              />
              <span className="text-[8px] text-slate-400">%</span>
            </div>
          </div>
        </div>
      </InputGroup>

      <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
        <div className="flex flex-row items-center justify-between">
          <LabelWithTooltip 
            label={t.compareMode} 
            lang={lang} 
            isUppercaseHeader 
            className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider" 
            icon={<Copy size={11} className="text-slate-400" aria-hidden="true" />} 
          />
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              aria-label={t.compareMode}
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {compareMode && (
          <div className="grid grid-cols-3 gap-1" role="group" aria-label="Comparison material indices">
            {indices.map(idx => (
              <button
                key={idx}
                onClick={() => setCompareIndex(idx)}
                className={`py-1.5 rounded text-[10px] font-bold transition-all border cursor-pointer flex items-center justify-center gap-1 ${
                  compareIndex === idx 
                    ? 'bg-slate-800 dark:bg-slate-200 border-slate-800 dark:border-slate-200 text-white dark:text-slate-950 shadow-sm' 
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                }`}
                aria-pressed={compareIndex === idx}
              >
                {compareIndex === idx && <ArrowRight size={9} />}
                {idx.toFixed(2)}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="space-y-4 px-4 py-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm max-w-xl mx-auto">
        {renderFormContent()}
      </div>
    );
  }

  return (
    <aside className="w-[280px] lg:w-[320px] shrink-0 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-850 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.015)] text-left transition-all duration-200">
      {/* Clinic/App Branding Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-850">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
              <rect x="42" y="10" width="16" height="35" fill="#1e73be" rx="2" transform="rotate(-45 50 50)" />
              <rect x="42" y="55" width="16" height="35" fill="#2d9e4b" rx="2" transform="rotate(-45 50 50)" />
              <rect x="42" y="10" width="16" height="35" fill="#31a8dd" rx="2" transform="rotate(45 50 50)" />
              <rect x="42" y="55" width="16" height="35" fill="#84cc16" rx="2" transform="rotate(45 50 50)" />
              <circle cx="50" cy="50" r="4" fill="#1e73be" />
            </svg>
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-slate-100 font-extrabold text-sm tracking-tight leading-none mb-1">
              AKTRIYO
            </h1>
            <h2 className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-none m-0">
              {t.institute}
            </h2>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[8px] font-black uppercase bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded tracking-wider">Measuring Project</span>
          <span className="text-[8px] bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-mono border border-slate-200/60 dark:border-slate-800/80 uppercase tracking-tight">
            {t.title}
          </span>
        </div>
      </div>

      {/* Main Form Fields (Scrollable) */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 py-4 space-y-2">
          {renderFormContent()}
        </div>
      </ScrollArea>
    </aside>
  );
};
