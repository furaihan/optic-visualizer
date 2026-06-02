import React from 'react';
import { LensParameters, FrameParameters, PatientParameters, FrameType } from '../lib/optical';
import { translations, Language, getTooltipByLabel } from '../lib/i18n';
import { Layers, Frame, User, Minus, Plus, Search, Settings, ChevronDown, HelpCircle, Info, Eye, Ruler, Aperture, Gauge, Zap, ToggleRight, Copy, ArrowRight, Lightbulb, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';

interface SidebarProps {
  lens: LensParameters;
  setLens: (l: LensParameters) => void;
  frame: FrameParameters;
  setFrame: (f: FrameParameters) => void;
  patient: PatientParameters;
  setPatient: (p: PatientParameters) => void;
  compareMode: boolean;
  setCompareMode: (v: boolean) => void;
  compareIndex: number;
  setCompareIndex: (v: number) => void;
  bevelPercent: number;
  setBevelPercent: (v: number) => void;
  frameType: FrameType;
  setFrameType: (t: FrameType) => void;
  lang: Language;
  isMobile?: boolean;
  highlightedLimit: 'a' | 'b' | 'dbl' | 'ed' | null;
  setHighlightedLimit: (val: 'a' | 'b' | 'dbl' | 'ed' | null) => void;
}

interface ControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit: string;
  lang: Language;
  icon?: React.ReactNode;
}

interface LabelWithTooltipProps {
  label: string;
  lang: Language;
  className?: string;
  isUppercaseHeader?: boolean;
  icon?: React.ReactNode;
}

const LabelWithTooltip: React.FC<LabelWithTooltipProps> = ({ label, lang, className, isUppercaseHeader = false, icon }) => {
  const tooltipText = getTooltipByLabel(label, lang);
  if (!tooltipText) {
    return <span className={className}>{icon && <span className="mr-1.5">{icon}</span>}{label}</span>;
  }
  return (
    <Tooltip>
      <TooltipTrigger render={<span className={`inline-flex items-center gap-1 cursor-help hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${className || ''}`} />}>
        <div className="flex items-center gap-1">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className={isUppercaseHeader ? "font-bold uppercase tracking-wider text-[10px] text-slate-500" : "font-semibold text-slate-700"}>{label}</span>
        </div>
        <HelpCircle size={10} className="text-slate-400 shrink-0" />
      </TooltipTrigger>
      <TooltipContent className="p-2.5 max-w-[220px] text-[10.5px] font-sans font-medium leading-normal bg-slate-900 border border-slate-800 text-slate-100 rounded-lg shadow-xl shrink-0 z-50">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};

const Control: React.FC<ControlProps> = ({ label, value, min, max, step, onChange, unit, lang, icon }) => {
  const [typedVal, setTypedVal] = React.useState(value.toString());

  React.useEffect(() => {
    setTypedVal(value.toString());
  }, [value]);

  const isAxis = unit === '°';
  const inputWidthClass = isAxis ? 'w-12' : 'w-16';

  const commitVal = (v: number) => {
    const snapped = Math.round(v / step) * step;
    const clamped = Math.min(max, Math.max(min, snapped));
    const fixed = parseFloat(clamped.toFixed(10));
    onChange(fixed);
    setTypedVal(fixed.toString());
  };

  const handleTypedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTypedVal(raw);
  };

  const handleBlur = () => {
    const parsed = parseFloat(typedVal);
    if (isNaN(parsed)) {
      setTypedVal(value.toString());
    } else {
      commitVal(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = parseFloat(typedVal);
      if (!isNaN(parsed)) {
        commitVal(parsed);
      }
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[11px] py-1">
        <LabelWithTooltip label={label} lang={lang} className="pr-1 select-none leading-tight" icon={icon} />
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm h-8">
            <button 
              onClick={() => commitVal(value - step)}
              className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors active:bg-slate-200 cursor-pointer"
              title="Decrease"
            >
              <Minus size={11} strokeWidth={3} />
            </button>
            <Input 
              type="text"
              value={typedVal}
              onChange={handleTypedChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={`border-0 focus:ring-0 focus:border-0 rounded-none bg-white text-center font-mono text-xs font-bold text-slate-800 p-0 h-8 ${inputWidthClass}`}
            />
            <button 
              onClick={() => commitVal(value + step)}
              className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors active:bg-slate-200 cursor-pointer"
              title="Increase"
            >
              <Plus size={11} strokeWidth={3} />
            </button>
          </div>
          <span className="text-slate-400 font-mono font-bold w-6 text-[10px] text-left shrink-0 pl-1 select-none">{unit}</span>
        </div>
      </div>

      {label.includes("(BC)") && (
        <div className="text-[10px] text-slate-500 leading-normal mt-1 bg-blue-50/50 p-2 rounded-lg border border-blue-100/30 flex gap-2">
          <Lightbulb size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <span>
            {lang === 'id' ? (
              <span><strong>Rekomendasi:</strong> 4.00 - 8.00 D. Base datar untuk lensa minus tinggi, base cembung untuk plus.</span>
            ) : (
              <span><strong>Recommended:</strong> 4.00 - 8.00 D. Flatter curves suit high minus, steeper curves suit high plus.</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  lens, setLens,
  frame, setFrame,
  patient, setPatient,
  compareMode, setCompareMode,
  compareIndex, setCompareIndex,
  bevelPercent, setBevelPercent,
  frameType, setFrameType,
  lang,
  isMobile = false,
  highlightedLimit,
  setHighlightedLimit,
}) => {
  const t = translations[lang];
  const indices = [1.5, 1.56, 1.6, 1.67, 1.74];

  const framePD = frame.a + frame.dbl;
  const decentration = Math.abs(framePD - patient.pd) / 2;
  const decentrationV = Math.abs(patient.fittingHeight - frame.b / 2);
  const decentrationCombined = Math.sqrt(decentration * decentration + decentrationV * decentrationV);
  const requiredBlank = frame.ed + 2 * decentrationCombined + 2;

  const isExceedingA = frame.a < 35 || frame.a > 65 || requiredBlank > 80;
  const isExceedingB = frame.b < 20 || frame.b > 55 || patient.fittingHeight > frame.b - 2 || patient.fittingHeight < 5;
  const isExceedingDbl = frame.dbl < 10 || frame.dbl > 28;
  const isExceedingEd = frame.ed < frame.a || frame.ed > 75;

  const [openGroup, setOpenGroup] = React.useState<Record<string, boolean>>({
    lens: true,
    frame: true,
    fitting: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroup(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const InputGroup = ({ title, icon: Icon, iconColor, groupKey, children }: { title: string, icon: any, iconColor: string, groupKey: string, children: React.ReactNode }) => {
    const isOpen = openGroup[groupKey] ?? true;
    return (
      <div className="border-b border-slate-100 last:border-0 py-3">
        <button 
          onClick={() => toggleGroup(groupKey)}
          className="w-full text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between hover:text-slate-800 transition-colors py-2 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Icon size={12} className={iconColor} />
            <span>{title}</span>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="grid gap-4 mt-3 animate-fade-in">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="space-y-4 px-4 py-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm max-w-xl mx-auto">
        <InputGroup title={t.lensParams} icon={Layers} iconColor="text-blue-500" groupKey="lens">
          <Control 
            label={t.sphere} unit=" D" min={-20} max={20} step={0.25}
            value={lens.sph} onChange={(v: number) => setLens({ ...lens, sph: v })} lang={lang}
            icon={<Aperture size={13} className="text-blue-500" />}
          />
          <Control 
            label={t.cylinder} unit=" D" min={-10} max={0} step={0.25}
            value={lens.cyl} onChange={(v: number) => setLens({ ...lens, cyl: v })} lang={lang}
            icon={<Gauge size={13} className="text-blue-500" />}
          />
          <Control 
            label={t.axis} unit="°" min={0} max={180} step={1}
            value={lens.axis} onChange={(v: number) => setLens({ ...lens, axis: v })} lang={lang}
            icon={<Zap size={13} className="text-blue-500" />}
          />
          <div className="space-y-1.5 flex flex-col">
            <LabelWithTooltip label={t.refractiveIndex} lang={lang} className="text-[11px]" icon={<Eye size={13} className="text-blue-500" />} />
            <div className="grid grid-cols-5 gap-1">
              {indices.map(idx => (
                <button
                  key={idx}
                  onClick={() => setLens({ ...lens, index: idx })}
                  className={`py-1.5 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                    lens.index === idx 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  {idx.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
          <Control 
            label={t.baseCurve} unit=" D" min={0.25} max={12} step={0.25}
            value={lens.baseCurve} onChange={(v: number) => setLens({ ...lens, baseCurve: v })} lang={lang}
            icon={<Aperture size={13} className="text-blue-500" />}
          />
        </InputGroup>

        <InputGroup title={t.frameGeometry} icon={Frame} iconColor="text-emerald-500" groupKey="frame">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <LabelWithTooltip label={t.aSize} lang={lang} className="" isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
                <button
                  type="button"
                  onMouseEnter={() => setHighlightedLimit('a')}
                  onMouseLeave={() => setHighlightedLimit(null)}
                  onClick={() => setHighlightedLimit(highlightedLimit === 'a' ? null : 'a')}
                  className={`p-1 rounded-full transition-all cursor-pointer ${
                    isExceedingA 
                      ? 'text-amber-500 hover:text-amber-600 animate-pulse bg-amber-500/10' 
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                  title={isExceedingA ? (lang === 'id' ? "Batas struktural terlampaui! Sorot untuk melihat detail visual." : "Structural limit exceeded! Hover to see visual details.") : "Ergonomic Limits: 35-65mm."}
                >
                  <AlertCircle size={11} />
                </button>
              </div>
              <Input 
                type="number" value={frame.a} onChange={(e) => setFrame({...frame, a: parseFloat(e.target.value)})}
                className={`w-full text-center text-xs font-mono font-bold bg-white border ${
                  isExceedingA ? 'border-amber-500 text-amber-600 focus:ring-amber-500' : 'border-slate-200 text-blue-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <LabelWithTooltip label={t.bSize} lang={lang} className="" isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
                <button
                  type="button"
                  onMouseEnter={() => setHighlightedLimit('b')}
                  onMouseLeave={() => setHighlightedLimit(null)}
                  onClick={() => setHighlightedLimit(highlightedLimit === 'b' ? null : 'b')}
                  className={`p-1 rounded-full transition-all cursor-pointer ${
                    isExceedingB 
                      ? 'text-amber-500 hover:text-amber-600 animate-pulse bg-amber-500/10' 
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                  title={isExceedingB ? (lang === 'id' ? "Batas struktural terlampaui! Sorot untuk melihat detail visual." : "Structural limit exceeded! Hover to see visual details.") : "Ergonomic Limits: 20-55mm."}
                >
                  <AlertCircle size={11} />
                </button>
              </div>
              <Input 
                type="number" value={frame.b} onChange={(e) => setFrame({...frame, b: parseFloat(e.target.value)})}
                className={`w-full text-center text-xs font-mono font-bold bg-white border ${
                  isExceedingB ? 'border-amber-500 text-amber-600 focus:ring-amber-500' : 'border-slate-200 text-blue-600'
                }`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <LabelWithTooltip label="DBL" lang={lang} className="" isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
                <button
                  type="button"
                  onMouseEnter={() => setHighlightedLimit('dbl')}
                  onMouseLeave={() => setHighlightedLimit(null)}
                  onClick={() => setHighlightedLimit(highlightedLimit === 'dbl' ? null : 'dbl')}
                  className={`p-1 rounded-full transition-all cursor-pointer ${
                    isExceedingDbl 
                      ? 'text-amber-500 hover:text-amber-600 animate-pulse bg-amber-500/10' 
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                  title={isExceedingDbl ? (lang === 'id' ? "Batas struktural terlampaui! Sorot untuk melihat detail visual." : "Structural limit exceeded! Hover to see visual details.") : "Ergonomic Limits: 10-28mm."}
                >
                  <AlertCircle size={11} />
                </button>
              </div>
              <Input 
                type="number" value={frame.dbl} onChange={(e) => setFrame({...frame, dbl: parseFloat(e.target.value)})}
                className={`w-full text-center text-xs font-mono font-bold bg-white border ${
                  isExceedingDbl ? 'border-amber-500 text-amber-600 focus:ring-amber-500' : 'border-slate-200 text-blue-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <LabelWithTooltip label="ED" lang={lang} className="" isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
                <button
                  type="button"
                  onMouseEnter={() => setHighlightedLimit('ed')}
                  onMouseLeave={() => setHighlightedLimit(null)}
                  onClick={() => setHighlightedLimit(highlightedLimit === 'ed' ? null : 'ed')}
                  className={`p-1 rounded-full transition-all cursor-pointer ${
                    isExceedingEd 
                      ? 'text-amber-500 hover:text-amber-600 animate-pulse bg-amber-500/10' 
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                  title={isExceedingEd ? (lang === 'id' ? "Batas struktural terlampaui! Sorot untuk melihat detail visual." : "Structural limit exceeded! Hover to see visual details.") : "Ergonomic Limits: ED >= A and <= 75mm."}
                >
                  <AlertCircle size={11} />
                </button>
              </div>
              <Input 
                type="number" value={frame.ed} onChange={(e) => setFrame({...frame, ed: parseFloat(e.target.value)})}
                className={`w-full text-center text-xs font-mono font-bold bg-white border ${
                  isExceedingEd ? 'border-amber-500 text-amber-600 focus:ring-amber-500' : 'border-slate-200 text-blue-600'
                }`}
              />
            </div>
          </div>
          <Control label={t.frameDepth} unit="mm" min={1} max={10} step={0.1} value={frame.depth} onChange={(v: number) => setFrame({ ...frame, depth: v })} lang={lang} icon={<Gauge size={13} className="text-emerald-500" />} />
          
          <div className="space-y-1.5 pt-2 flex flex-col">
            <LabelWithTooltip label={t.frameType} lang={lang} className="text-[11px]" icon={<Frame size={13} className="text-emerald-500" />} />
            <div className="grid grid-cols-3 gap-1">
              {(['full', 'half', 'rimless'] as FrameType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setFrameType(type)}
                  className={`py-2 rounded text-[10px] font-bold text-center transition-all border cursor-pointer ${
                    frameType === type 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 shadow-none'
                  }`}
                >
                  {type === 'full' ? t.fullRim : type === 'half' ? t.halfRim : t.rimless}
                </button>
              ))}
            </div>
          </div>
        </InputGroup>

        <InputGroup title={t.fittingSpecs} icon={User} iconColor="text-orange-500" groupKey="fitting">
          <Control label={t.pd} unit="mm" min={40} max={80} step={0.5} value={patient.pd} onChange={(v: number) => setPatient({ ...patient, pd: v })} lang={lang} icon={<Eye size={13} className="text-orange-500" />} />
          <Control label={t.fittingHeight} unit="mm" min={10} max={40} step={0.5} value={patient.fittingHeight} onChange={(v: number) => setPatient({ ...patient, fittingHeight: v })} lang={lang} icon={<Ruler size={13} className="text-orange-500" />} />
          
          <div className="pt-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 mb-2">
              <LabelWithTooltip label={t.bevelPos} lang={lang} className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" icon={<Zap size={11} className="text-orange-500" />} />
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[9px] font-bold text-slate-400">{t.bevelFront}</span>
               <input 
                 type="range" min={0} max={1} step={0.01} value={bevelPercent}
                 onChange={(e) => setBevelPercent(parseFloat(e.target.value))}
                 className="flex-1 h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
               />
               <span className="text-[9px] font-bold text-slate-400">{t.bevelBack}</span>
            </div>
          </div>
        </InputGroup>
      </div>
    );
  }

  return (
    <aside className="w-[300px] shrink-0 bg-white border-r border-slate-100 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.015)] text-left">
      {/* Clinic/App Branding Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white p-1 rounded-lg border border-slate-100 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect x="42" y="10" width="16" height="35" fill="#1e73be" rx="2" transform="rotate(-45 50 50)" />
              <rect x="42" y="55" width="16" height="35" fill="#2d9e4b" rx="2" transform="rotate(-45 50 50)" />
              <rect x="42" y="10" width="16" height="35" fill="#31a8dd" rx="2" transform="rotate(45 50 50)" />
              <rect x="42" y="55" width="16" height="35" fill="#84cc16" rx="2" transform="rotate(45 50 50)" />
              <circle cx="50" cy="50" r="4" fill="#1e73be" />
            </svg>
          </div>
          <div>
            <h1 className="text-slate-900 font-extrabold text-sm tracking-tight leading-none mb-1">
              AKTRIYO
            </h1>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider leading-none">
              Instut Optometri Yogyakarta
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[8px] font-black uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded tracking-wider">Measuring Project</span>
          <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono border border-slate-200/60 uppercase tracking-tight">
            {t.title}
          </span>
        </div>
      </div>

      {/* Main Form Fields (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 custom-scrollbar">
        <InputGroup title={t.lensParams} icon={Layers} iconColor="text-blue-500" groupKey="lens">
          <Control 
            label={t.sphere} unit=" D" min={-20} max={20} step={0.25}
            value={lens.sph} onChange={(v: number) => setLens({ ...lens, sph: v })} lang={lang}
            icon={<Aperture size={13} className="text-blue-500" />}
          />
          <Control 
            label={t.cylinder} unit=" D" min={-10} max={0} step={0.25}
            value={lens.cyl} onChange={(v: number) => setLens({ ...lens, cyl: v })} lang={lang}
            icon={<Gauge size={13} className="text-blue-500" />}
          />
          <Control 
            label={t.axis} unit="°" min={0} max={180} step={1}
            value={lens.axis} onChange={(v: number) => setLens({ ...lens, axis: v })} lang={lang}
            icon={<Zap size={13} className="text-blue-500" />}
          />
          <div className="space-y-1.5 flex flex-col">
            <LabelWithTooltip label={t.refractiveIndex} lang={lang} className="text-[11px]" icon={<Eye size={13} className="text-blue-500" />} />
            <div className="grid grid-cols-3 gap-1">
              {indices.map(idx => (
                <button
                  key={idx}
                  onClick={() => setLens({ ...lens, index: idx })}
                  className={`py-1.5 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                    lens.index === idx 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {idx.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
          <Control 
            label={t.baseCurve} unit=" D" min={0.25} max={12} step={0.25}
            value={lens.baseCurve} onChange={(v: number) => setLens({ ...lens, baseCurve: v })} lang={lang}
            icon={<Aperture size={13} className="text-blue-500" />}
          />
        </InputGroup>

        <InputGroup title={t.frameGeometry} icon={Frame} iconColor="text-emerald-500" groupKey="frame">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <LabelWithTooltip label={t.aSize} lang={lang} className="" isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
                <button
                  type="button"
                  onMouseEnter={() => setHighlightedLimit('a')}
                  onMouseLeave={() => setHighlightedLimit(null)}
                  onClick={() => setHighlightedLimit(highlightedLimit === 'a' ? null : 'a')}
                  className={`p-1 rounded-full transition-all cursor-pointer ${
                    isExceedingA 
                      ? 'text-amber-500 hover:text-amber-600 animate-pulse bg-amber-500/10' 
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                  title={isExceedingA ? (lang === 'id' ? "Batas struktural terlampaui! Sorot untuk melihat detail visual." : "Structural limit exceeded! Hover to see visual details.") : "Ergonomic Limits: 35-65mm."}
                >
                  <AlertCircle size={11} />
                </button>
              </div>
              <Input 
                type="number" value={frame.a} onChange={(e) => setFrame({...frame, a: parseFloat(e.target.value)})}
                className={`w-full text-center text-xs font-mono font-bold bg-white border ${
                  isExceedingA ? 'border-amber-500 text-amber-600 focus:ring-amber-500' : 'border-slate-200 text-blue-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <LabelWithTooltip label={t.bSize} lang={lang} className="" isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
                <button
                  type="button"
                  onMouseEnter={() => setHighlightedLimit('b')}
                  onMouseLeave={() => setHighlightedLimit(null)}
                  onClick={() => setHighlightedLimit(highlightedLimit === 'b' ? null : 'b')}
                  className={`p-1 rounded-full transition-all cursor-pointer ${
                    isExceedingB 
                      ? 'text-amber-500 hover:text-amber-600 animate-pulse bg-amber-500/10' 
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                  title={isExceedingB ? (lang === 'id' ? "Batas struktural terlampaui! Sorot untuk melihat detail visual." : "Structural limit exceeded! Hover to see visual details.") : "Ergonomic Limits: 20-55mm."}
                >
                  <AlertCircle size={11} />
                </button>
              </div>
              <Input 
                type="number" value={frame.b} onChange={(e) => setFrame({...frame, b: parseFloat(e.target.value)})}
                className={`w-full text-center text-xs font-mono font-bold bg-white border ${
                  isExceedingB ? 'border-amber-500 text-amber-600 focus:ring-amber-500' : 'border-slate-200 text-blue-600'
                }`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <LabelWithTooltip label="DBL" lang={lang} className="" isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
                <button
                  type="button"
                  onMouseEnter={() => setHighlightedLimit('dbl')}
                  onMouseLeave={() => setHighlightedLimit(null)}
                  onClick={() => setHighlightedLimit(highlightedLimit === 'dbl' ? null : 'dbl')}
                  className={`p-1 rounded-full transition-all cursor-pointer ${
                    isExceedingDbl 
                      ? 'text-amber-500 hover:text-amber-600 animate-pulse bg-amber-500/10' 
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                  title={isExceedingDbl ? (lang === 'id' ? "Batas struktural terlampaui! Sorot untuk melihat detail visual." : "Structural limit exceeded! Hover to see visual details.") : "Ergonomic Limits: 10-28mm."}
                >
                  <AlertCircle size={11} />
                </button>
              </div>
              <Input 
                type="number" value={frame.dbl} onChange={(e) => setFrame({...frame, dbl: parseFloat(e.target.value)})}
                className={`w-full text-center text-xs font-mono font-bold bg-white border ${
                  isExceedingDbl ? 'border-amber-500 text-amber-600 focus:ring-amber-500' : 'border-slate-200 text-blue-600'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <LabelWithTooltip label="ED" lang={lang} className="" isUppercaseHeader icon={<Ruler size={11} className="text-emerald-500" />} />
                <button
                  type="button"
                  onMouseEnter={() => setHighlightedLimit('ed')}
                  onMouseLeave={() => setHighlightedLimit(null)}
                  onClick={() => setHighlightedLimit(highlightedLimit === 'ed' ? null : 'ed')}
                  className={`p-1 rounded-full transition-all cursor-pointer ${
                    isExceedingEd 
                      ? 'text-amber-500 hover:text-amber-600 animate-pulse bg-amber-500/10' 
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                  title={isExceedingEd ? (lang === 'id' ? "Batas struktural terlampaui! Sorot untuk melihat detail visual." : "Structural limit exceeded! Hover to see visual details.") : "Ergonomic Limits: ED >= A and <= 75mm."}
                >
                  <AlertCircle size={11} />
                </button>
              </div>
              <Input 
                type="number" value={frame.ed} onChange={(e) => setFrame({...frame, ed: parseFloat(e.target.value)})}
                className={`w-full text-center text-xs font-mono font-bold bg-white border ${
                  isExceedingEd ? 'border-amber-500 text-amber-600 focus:ring-amber-500' : 'border-slate-200 text-blue-600'
                }`}
              />
            </div>
          </div>
          <Control label={t.frameDepth} unit="mm" min={1} max={10} step={0.1} value={frame.depth} onChange={(v: number) => setFrame({ ...frame, depth: v })} lang={lang} icon={<Gauge size={13} className="text-emerald-500" />} />
          
          <div className="space-y-1.5 pt-2 flex flex-col">
            <LabelWithTooltip label={t.frameType} lang={lang} className="text-[11px]" icon={<Frame size={13} className="text-emerald-500" />} />
            <div className="grid grid-cols-1 gap-1">
              {(['full', 'half', 'rimless'] as FrameType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setFrameType(type)}
                  className={`py-2 px-3 rounded text-[10px] font-bold text-left transition-all border flex justify-between items-center cursor-pointer ${
                    frameType === type 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span>{type === 'full' ? t.fullRim : type === 'half' ? t.halfRim : t.rimless}</span>
                  {frameType === type && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </button>
              ))}
            </div>
          </div>
        </InputGroup>

        <InputGroup title={t.fittingSpecs} icon={User} iconColor="text-orange-500" groupKey="fitting">
          <Control label={t.pd} unit="mm" min={40} max={80} step={0.5} value={patient.pd} onChange={(v: number) => setPatient({ ...patient, pd: v })} lang={lang} icon={<Eye size={13} className="text-orange-500" />} />
          <Control label={t.fittingHeight} unit="mm" min={10} max={40} step={0.5} value={patient.fittingHeight} onChange={(v: number) => setPatient({ ...patient, fittingHeight: v })} lang={lang} icon={<Ruler size={13} className="text-orange-500" />} />
          
          <div className="pt-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 mb-2">
              <LabelWithTooltip label={t.bevelPos} lang={lang} isUppercaseHeader className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" icon={<Zap size={11} className="text-orange-500" />} />
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[9px] font-bold text-slate-400">{t.bevelFront}</span>
               <input 
                 type="range" min={0} max={1} step={0.01} value={bevelPercent}
                 onChange={(e) => setBevelPercent(parseFloat(e.target.value))}
                 className="flex-1 h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
               />
               <span className="text-[9px] font-bold text-slate-400">{t.bevelBack}</span>
            </div>
          </div>
        </InputGroup>

        <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-4">
           <div className="flex items-center justify-between">
              <LabelWithTooltip label={t.compareMode} lang={lang} isUppercaseHeader className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" icon={<Copy size={11} className="text-slate-400" />} />
              <button 
                onClick={() => setCompareMode(!compareMode)}
                className={`w-9 h-5 rounded-full relative transition-all cursor-pointer ${compareMode ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                 <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${compareMode ? 'left-5' : 'left-1'}`} />
              </button>
           </div>
           {compareMode && (
              <div className="grid grid-cols-3 gap-1">
                {indices.map(idx => (
                  <button
                    key={idx}
                    onClick={() => setCompareIndex(idx)}
                    className={`py-1.5 rounded text-[10px] font-bold transition-all border cursor-pointer flex items-center justify-center gap-1 ${
                      compareIndex === idx 
                        ? 'bg-slate-800 border-slate-800 text-white shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {compareIndex === idx && <ArrowRight size={9} />}
                    {idx.toFixed(2)}
                  </button>
                ))}
              </div>
           )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 shadow-[0_-4px_16px_rgba(0,0,0,0.015)]">
        <Button className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-150 transform active:scale-95 shadow-md shadow-slate-900/10 cursor-pointer flex items-center justify-center gap-2">
          <Zap size={11} />
          {t.calculateFull}
        </Button>
      </div>
    </aside>
  );
};