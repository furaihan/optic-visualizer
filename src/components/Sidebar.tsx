import React from 'react';
import { LensParameters, FrameParameters, PatientParameters, FrameType } from '../lib/optical';
import { translations, Language } from '../lib/i18n';
import { Layers, Frame, User, Minus, Plus, Search, Settings, ChevronDown } from 'lucide-react';

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
}

const Control: React.FC<ControlProps> = ({ label, value, min, max, step, onChange, unit, lang }) => {
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
    setTypedVal(raw); // Allow typing negative numbers, decimals freely
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
        <label className="text-slate-600 font-medium pr-1 select-none leading-tight">{label}</label>
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center border border-slate-200 rounded overflow-hidden shadow-sm bg-white">
            <button 
              onClick={() => commitVal(parseFloat((value - step).toFixed(10)))}
              className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border-r border-slate-200 active:bg-slate-200 cursor-pointer"
              title="Decrease"
            >
              <Minus size={11} strokeWidth={3} />
            </button>
            <input
              type="text"
              value={typedVal}
              onChange={handleTypedChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={`${inputWidthClass} text-center text-[11px] font-mono font-bold text-blue-600 border-r border-slate-200 py-1.5 outline-none focus:bg-blue-50`}
            />
            <button 
              onClick={() => commitVal(parseFloat((value + step).toFixed(10)))}
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
        <div className="text-[10px] text-slate-500 leading-normal mt-1 bg-blue-50/50 p-2 rounded-lg border border-blue-100/30">
          {lang === 'id' ? (
            <span>💡 Rekomendasi: <strong>4.00 - 8.00 D</strong>. Base datar direferensikan untuk lensa minus tinggi, base cembung untuk plus.</span>
          ) : (
            <span>💡 Recommended: <strong>4.00 - 8.00 D</strong>. Flatter curves suit high minus, steeper curves suit high plus lenses.</span>
          )}
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
}) => {
  const t = translations[lang];
  const indices = [1.5, 1.56, 1.6, 1.67, 1.74];

  // Section collapse state
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
          />
          <Control 
            label={t.cylinder} unit=" D" min={-10} max={0} step={0.25}
            value={lens.cyl} onChange={(v: number) => setLens({ ...lens, cyl: v })} lang={lang}
          />
          <Control 
            label={t.axis} unit="°" min={0} max={180} step={1}
            value={lens.axis} onChange={(v: number) => setLens({ ...lens, axis: v })} lang={lang}
          />
          <div className="space-y-1.5">
            <label className="text-slate-600 text-[11px] font-medium">{t.refractiveIndex}</label>
            <div className="grid grid-cols-5 gap-1">
              {indices.map(idx => (
                <button
                  key={idx}
                  onClick={() => setLens({ ...lens, index: idx })}
                  className={`py-1.5 rounded text-[10px] font-bold transition-all border ${
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
          />
        </InputGroup>

        <InputGroup title={t.frameGeometry} icon={Frame} iconColor="text-emerald-500" groupKey="frame">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">{t.aSize}</label>
              <input 
                type="number" value={frame.a} onChange={(e) => setFrame({...frame, a: parseFloat(e.target.value)})}
                className="w-full text-center text-xs font-mono font-bold text-blue-600 bg-white border border-slate-200 rounded py-1.5 outline-none focus:bg-blue-50 focus:border-blue-300 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">{t.bSize}</label>
              <input 
                type="number" value={frame.b} onChange={(e) => setFrame({...frame, b: parseFloat(e.target.value)})}
                className="w-full text-center text-xs font-mono font-bold text-blue-600 bg-white border border-slate-200 rounded py-1.5 outline-none focus:bg-blue-50 focus:border-blue-300 transition-colors shadow-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">DBL</label>
              <input 
                type="number" value={frame.dbl} onChange={(e) => setFrame({...frame, dbl: parseFloat(e.target.value)})}
                className="w-full text-center text-xs font-mono font-bold text-blue-600 bg-white border border-slate-200 rounded py-1.5 outline-none focus:bg-blue-50 focus:border-blue-300 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">ED</label>
              <input 
                type="number" value={frame.ed} onChange={(e) => setFrame({...frame, ed: parseFloat(e.target.value)})}
                className="w-full text-center text-xs font-mono font-bold text-blue-600 bg-white border border-slate-200 rounded py-1.5 outline-none focus:bg-blue-50 focus:border-blue-300 transition-colors shadow-sm"
              />
            </div>
          </div>
          <Control label={t.frameDepth} unit="mm" min={1} max={10} step={0.1} value={frame.depth} onChange={(v: number) => setFrame({ ...frame, depth: v })} lang={lang} />
          
          <div className="space-y-1.5 pt-2">
            <label className="text-slate-600 text-[11px] font-medium">{t.frameType}</label>
            <div className="grid grid-cols-3 gap-1">
              {(['full', 'half', 'rimless'] as FrameType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setFrameType(type)}
                  className={`py-1.5 px-2 rounded text-[10px] font-bold text-center transition-all border ${
                    frameType === type 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span>{type === 'full' ? t.fullRim : type === 'half' ? t.halfRim : t.rimless}</span>
                </button>
              ))}
            </div>
          </div>
        </InputGroup>

        <InputGroup title={t.fittingSpecs} icon={User} iconColor="text-orange-500" groupKey="fitting">
          <Control label={t.pd} unit="mm" min={40} max={80} step={0.5} value={patient.pd} onChange={(v: number) => setPatient({ ...patient, pd: v })} lang={lang} />
          <Control label={t.fittingHeight} unit="mm" min={10} max={40} step={0.5} value={patient.fittingHeight} onChange={(v: number) => setPatient({ ...patient, fittingHeight: v })} lang={lang} />
          
          <div className="pt-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 mb-2">
              <span>{t.bevelPos}</span>
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

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
           <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.compareMode}</h4>
              <button 
                onClick={() => setCompareMode(!compareMode)}
                className={`w-9 h-5 rounded-full relative transition-all ${compareMode ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                 <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${compareMode ? 'left-5' : 'left-1'}`} />
              </button>
           </div>
           {compareMode && (
              <div className="grid grid-cols-5 gap-1">
                {indices.map(idx => (
                  <button
                    key={idx}
                    onClick={() => setCompareIndex(idx)}
                    className={`py-1.5 rounded text-[10px] font-bold transition-all border ${
                      compareIndex === idx 
                        ? 'bg-slate-800 border-slate-800 text-white' 
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {idx.toFixed(2)}
                  </button>
                ))}
              </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <aside className="w-72 h-screen bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-[2px_0_12px_rgba(0,0,0,0.02)] z-30">
      {/* Compact Header Area */}
      <div className="p-5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white p-1 rounded-lg border border-slate-105 flex items-center justify-center shrink-0">
            {/* Minimalist SVG logo */}
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
          />
          <Control 
            label={t.cylinder} unit=" D" min={-10} max={0} step={0.25}
            value={lens.cyl} onChange={(v: number) => setLens({ ...lens, cyl: v })} lang={lang}
          />
          <Control 
            label={t.axis} unit="°" min={0} max={180} step={1}
            value={lens.axis} onChange={(v: number) => setLens({ ...lens, axis: v })} lang={lang}
          />
          <div className="space-y-1.5 pt-2">
            <label className="text-slate-600 text-[11px] font-medium">{t.refractiveIndex}</label>
            <div className="grid grid-cols-3 gap-1">
              {indices.map(idx => (
                <button
                  key={idx}
                  onClick={() => setLens({ ...lens, index: idx })}
                  className={`py-1.5 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                    lens.index === idx 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-505/20' 
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
          />
        </InputGroup>

        <InputGroup title={t.frameGeometry} icon={Frame} iconColor="text-emerald-500" groupKey="frame">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">{t.aSize}</label>
              <input 
                type="number" value={frame.a} onChange={(e) => setFrame({...frame, a: parseFloat(e.target.value)})}
                className="w-full text-center text-xs font-mono font-bold text-blue-600 bg-white border border-slate-200 rounded py-1.5 outline-none focus:bg-blue-50 focus:border-blue-300 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">{t.bSize}</label>
              <input 
                type="number" value={frame.b} onChange={(e) => setFrame({...frame, b: parseFloat(e.target.value)})}
                className="w-full text-center text-xs font-mono font-bold text-blue-600 bg-white border border-slate-200 rounded py-1.5 outline-none focus:bg-blue-50 focus:border-blue-300 transition-colors shadow-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">DBL</label>
              <input 
                type="number" value={frame.dbl} onChange={(e) => setFrame({...frame, dbl: parseFloat(e.target.value)})}
                className="w-full text-center text-xs font-mono font-bold text-blue-600 bg-white border border-slate-200 rounded py-1.5 outline-none focus:bg-blue-50 focus:border-blue-300 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">ED</label>
              <input 
                type="number" value={frame.ed} onChange={(e) => setFrame({...frame, ed: parseFloat(e.target.value)})}
                className="w-full text-center text-xs font-mono font-bold text-blue-600 bg-white border border-slate-200 rounded py-1.5 outline-none focus:bg-blue-50 focus:border-blue-300 transition-colors shadow-sm"
              />
            </div>
          </div>
          <Control label={t.frameDepth} unit="mm" min={1} max={10} step={0.1} value={frame.depth} onChange={(v: number) => setFrame({ ...frame, depth: v })} lang={lang} />
          
          <div className="space-y-1.5 pt-2">
            <label className="text-slate-600 text-[11px] font-medium">{t.frameType}</label>
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
          <Control label={t.pd} unit="mm" min={40} max={80} step={0.5} value={patient.pd} onChange={(v: number) => setPatient({ ...patient, pd: v })} lang={lang} />
          <Control label={t.fittingHeight} unit="mm" min={10} max={40} step={0.5} value={patient.fittingHeight} onChange={(v: number) => setPatient({ ...patient, fittingHeight: v })} lang={lang} />
          
          <div className="pt-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 mb-2">
              <span>{t.bevelPos}</span>
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
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.compareMode}</h4>
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
                    className={`py-1.5 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                      compareIndex === idx 
                        ? 'bg-slate-800 border-slate-800 text-white shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {idx.toFixed(2)}
                  </button>
                ))}
              </div>
           )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 shadow-[0_-4px_16px_rgba(0,0,0,0.015)]">
        <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-150 transform active:scale-95 shadow-md shadow-slate-900/10 cursor-pointer">
          {t.calculateFull}
        </button>
      </div>
    </aside>
  );
};
