import React from 'react';
import { CalculationResult, FrameParameters, LensParameters } from '../lib/optical';
import { translations, Language } from '../lib/translations';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2, Info, ChevronDown, MoveHorizontal, Compass, Diameter, Scale, X } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface SummaryCardProps {
  result: CalculationResult;
  compareResult?: CalculationResult;
  lang: Language;
  frame?: FrameParameters;
  lens?: LensParameters;
  isLoading?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ result, compareResult, lang, frame, lens, isLoading }) => {
  const t = translations[lang];
  const [activePanel, setActivePanel] = React.useState<'none' | 'warnings' | 'guide'>('none');

  const getDeltaElement = (key: 'et' | 'ct' | 'anteriorProtrusion' | 'posteriorProtrusion' | 'weight') => {
    if (!compareResult) return null;
    const currVal = result[key];
    const prevVal = compareResult[key];
    if (currVal === undefined || prevVal === undefined) return null;
    
    const diff = currVal - prevVal;
    if (Math.abs(diff) < 0.05) return null;

    const isPositive = diff > 0;
    const isWorse = diff > 0; // For lens thickness & protrusions, more is worse/thicker.
    
    const colorClass = isWorse 
      ? 'text-rose-600 bg-rose-50 border-rose-100/50' 
      : 'text-emerald-600 bg-emerald-50 border-emerald-100/50';
      
    const Icon = isWorse ? ArrowUpRight : ArrowDownRight;
    const formatted = `${isPositive ? '+' : ''}${diff.toFixed(2)}`;

    return (
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${colorClass} leading-none shadow-sm`}>
        <Icon size={10} className="stroke-[3]" />
        {formatted}
      </span>
    );
  };

  interface StatItemProps {
    label: string;
    value: number;
    unit: string;
    status: string;
    statusColor: string;
    icon?: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    iconColor?: string;
    resultKey?: 'et' | 'ct' | 'anteriorProtrusion' | 'posteriorProtrusion' | 'weight';
    isLoading?: boolean;
  }

  const StatItem = ({ 
    label, 
    value, 
    unit, 
    status, 
    statusColor, 
    icon: Icon, 
    iconColor = "text-slate-400 dark:text-slate-500 font-bold",
    resultKey,
    isLoading
  }: StatItemProps) => {
    const deltaNode = resultKey ? getDeltaElement(resultKey) : null;
    
    return (
      <div className="bg-white dark:bg-slate-950 p-2.5 sm:p-3.5 flex flex-col justify-between hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors h-full snap-start shrink-0 w-[36%] sm:w-[28%] md:w-auto md:flex-1 border-r border-slate-200 dark:border-slate-800/80 last:border-r-0">
        <div className="space-y-1.5 flex-1 flex flex-col">
          <div className="flex items-center gap-1">
            {Icon && <Icon size={12} className={iconColor} strokeWidth={2.5} />}
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{label}</p>
          </div>
          
          <div className="flex items-baseline gap-1.5 flex-wrap mt-auto">
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <>
                <p className="text-lg md:text-xl font-mono font-bold text-slate-800 dark:text-slate-100 leading-none">
                  {value.toFixed(2)}
                  <span className="text-[9px] ml-0.5 font-sans font-medium text-slate-400 dark:text-slate-500 lowercase">{unit}</span>
                </p>
                {deltaNode && <div className="scale-75 origin-left -ml-1 flex-shrink-0">{deltaNode}</div>}
              </>
            )}
          </div>
        </div>

        <div className="mt-2.5">
          {isLoading ? (
            <Skeleton className="h-3 w-10 rounded" />
          ) : (
            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider border ${statusColor} leading-none truncate max-w-full`}>
              {status}
            </span>
          )}
        </div>
      </div>
    );
  };

  const getETStatus = (et: number) => {
    if (et > 6) return { label: t.thick, color: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-350 dark:border-rose-900/60', icon: AlertTriangle, iconColor: 'text-rose-500' };
    if (et > 4) return { label: t.medium, color: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-350 dark:border-amber-900/60', icon: ArrowUpRight, iconColor: 'text-amber-500' };
    return { label: t.thin, color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-350 dark:border-emerald-900/60', icon: CheckCircle2, iconColor: 'text-emerald-500' };
  };

  const getProtrusionStatus = (val: number) => {
    if (val > 2) return { label: t.moderate, color: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-350 dark:border-rose-900/60', icon: AlertTriangle, iconColor: 'text-rose-500' };
    if (val > 0.5) return { label: t.noticeable, color: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-350 dark:border-amber-900/60', icon: ArrowUpRight, iconColor: 'text-amber-500' };
    return { label: t.flush, color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-350 dark:border-emerald-900/60', icon: CheckCircle2, iconColor: 'text-emerald-500' };
  };

  const getWeightStatus = (w: number) => {
    if (w > 15) return { label: t.weightHeavy, color: 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-350 dark:border-rose-900/60' };
    if (w > 10) return { label: t.weightModerate, color: 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-350 dark:border-amber-900/60' };
    if (w > 5) return { label: t.weightLight, color: 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-350 dark:border-emerald-900/60' };
    return { label: t.weightUltralight, color: 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-350 dark:border-blue-900/60' };
  };

  const etStatus = getETStatus(result.et);
  const antStatus = getProtrusionStatus(result.anteriorProtrusion);
  const postStatus = getProtrusionStatus(result.posteriorProtrusion);
  const weightStatus = getWeightStatus(result.weight);

  const isAnteriorUnsafe = result.anteriorProtrusion > 1.5;
  const isPosteriorUnsafe = result.posteriorProtrusion > 2.0;
  const isUnsafe = isAnteriorUnsafe || isPosteriorUnsafe;

  const totalPower = lens ? (lens.sph + (lens.cyl < 0 ? 0 : lens.cyl)) : 0;
  const isHighPower = lens ? (Math.abs(lens.sph) >= 4.0 || Math.abs(totalPower) >= 4.0) : false;
  const isHighDecentration = result.decentration > 3.0 && isHighPower;
  const inducedPrism = lens ? (Math.abs(totalPower) * (result.decentration / 10)) : 0;

  const hasWarnings = isUnsafe || isHighDecentration;

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight ml-1 uppercase">{t.tabSummary || 'Summary'}</h2>
        <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80 shadow-sm">
          {hasWarnings && (
            <button
              onClick={() => setActivePanel(p => p === 'warnings' ? 'none' : 'warnings')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                activePanel === 'warnings' 
                  ? 'bg-white dark:bg-slate-900 shadow text-amber-600 dark:text-amber-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              <AlertTriangle size={12} className={isUnsafe ? 'text-red-500' : 'text-amber-500'} />
              <span className="uppercase tracking-wider">Warnings ({(isUnsafe ? 1 : 0) + (isHighDecentration ? 1 : 0)})</span>
            </button>
          )}
          <button
            onClick={() => setActivePanel(p => p === 'guide' ? 'none' : 'guide')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-md transition-all ${
              activePanel === 'guide' 
                ? 'bg-white dark:bg-slate-900 shadow text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent'
            }`}
          >
            <Info size={12} />
            <span className="uppercase tracking-wider">{t.guideTitle}</span>
          </button>
        </div>
      </div>

      {/* Warnings Panel */}
      {activePanel === 'warnings' && hasWarnings && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {isUnsafe && (
            <div className="bg-red-50/90 dark:bg-rose-950/30 border border-red-200/50 dark:border-rose-900/40 p-3.5 rounded-xl text-[11.5px] text-red-800 dark:text-rose-200 flex items-start gap-3 shadow-sm border-l-4 border-l-red-500 leading-relaxed group">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-black text-rose-800 dark:text-rose-300 tracking-wide uppercase text-[10.5px] break-words mt-0.5">
                  {t.lowCompatibility}
                </p>
                <div className="text-slate-600 dark:text-rose-200/80 font-medium space-y-1 mt-1.5 break-words">
                  {isAnteriorUnsafe && (
                    <p>{t.anteriorWarning.replace('{val}', result.anteriorProtrusion.toFixed(1))}</p>
                  )}
                  {isPosteriorUnsafe && (
                    <p>{t.posteriorWarning.replace('{val}', result.posteriorProtrusion.toFixed(1))}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isHighDecentration && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3.5 rounded-xl text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-3 shadow-sm border-l-4 border-l-amber-500 leading-relaxed group">
              <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={15} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-black uppercase tracking-wide text-amber-900 dark:text-amber-300 text-[10.5px] break-words mt-1">
                  {t.highDecentration}
                </p>
                <p className="mt-1.5 text-slate-600 dark:text-amber-200/80 font-medium font-sans break-words">
                  {t.decentrationWarning.replace('{decentration}', result.decentration.toFixed(1)).replace('{prism}', inducedPrism.toFixed(1))}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide Panel */}
      {activePanel === 'guide' && (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 grid gap-4 p-4 rounded-xl sm:grid-cols-2 lg:grid-cols-4 text-xs text-slate-600 dark:text-slate-300 leading-normal shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1 bg-slate-50/40 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {t.guideEtLabel}
            </h5>
            <p className="text-slate-500 dark:text-slate-400 pl-3 leading-relaxed mt-1 text-[11px]">{t.guideEtDesc}</p>
          </div>
          
          <div className="space-y-1 bg-slate-50/40 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {t.guideCtLabel}
            </h5>
            <p className="text-slate-500 dark:text-slate-400 pl-3 leading-relaxed mt-1 text-[11px]">{t.guideCtDesc}</p>
          </div>
          
          <div className="space-y-1 bg-slate-50/40 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {t.guideProtLabel}
            </h5>
            <p className="text-slate-500 dark:text-slate-400 pl-3 leading-relaxed mt-1 text-[11px]">{t.guideProtDesc}</p>
          </div>
          
          <div className="space-y-1 bg-slate-50/40 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {t.guideWeightLabel}
            </h5>
            <p className="text-slate-500 dark:text-slate-400 pl-3 leading-relaxed mt-1 text-[11px]">{t.guideWeightDesc}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-200/60 dark:bg-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex overflow-x-auto snap-x snap-mandatory shadow-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <StatItem 
          label={t.edgeThick} 
          value={result.et} unit="mm"
          status={etStatus.label} statusColor={etStatus.color}
          icon={etStatus.icon} iconColor={etStatus.iconColor}
          resultKey="et"
          isLoading={isLoading}
        />
        <StatItem 
          label={t.center} 
          value={result.ct} unit="mm"
          status={t.optimized} statusColor="bg-blue-50 text-blue-700 border border-blue-100/50"
          icon={CheckCircle2} iconColor="text-blue-500"
          resultKey="ct"
          isLoading={isLoading}
        />
        <StatItem 
          label={t.anteriorProt} 
          value={result.anteriorProtrusion} unit="mm"
          status={antStatus.label} statusColor={antStatus.color}
          icon={antStatus.icon} iconColor={antStatus.iconColor}
          resultKey="anteriorProtrusion"
          isLoading={isLoading}
        />
        <StatItem 
          label={t.posteriorProt} 
          value={result.posteriorProtrusion} unit="mm"
          status={postStatus.label} statusColor={postStatus.color}
          icon={postStatus.icon} iconColor={postStatus.iconColor}
          resultKey="posteriorProtrusion"
          isLoading={isLoading}
        />
        <StatItem 
          label={t.lensWeight} 
          value={result.weight} unit="g"
          status={weightStatus.label} statusColor={weightStatus.color}
          icon={Scale} iconColor="text-indigo-500"
          resultKey="weight"
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Clinical Specs Row (highly visible on mobile & desktop without truncation) */}
      {frame && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex overflow-x-auto snap-x snap-mandatory divide-x divide-slate-100 dark:divide-slate-800/80 shadow-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center justify-between sm:justify-start gap-3 p-2.5 px-3 hover:bg-slate-50/40 dark:hover:bg-slate-900/80 transition-colors shrink-0 w-[45%] sm:w-auto sm:flex-1 snap-start">
            <div className="flex items-center gap-1.5 min-w-0">
              <MoveHorizontal size={13} className="text-slate-400 group-hover:text-blue-500 shrink-0" aria-hidden="true" />
              <span className="font-bold text-slate-500 dark:text-slate-400 text-[8px] sm:text-[9px] uppercase tracking-wider truncate hidden sm:inline-block">{t.framePd}</span>
              <span className="font-bold text-slate-500 dark:text-slate-400 text-[8px] sm:text-[9px] uppercase tracking-wider truncate sm:hidden">F.PD</span>
            </div>
            {isLoading ? <Skeleton className="h-4 w-10 ml-auto sm:ml-2" /> : (
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-[13px] sm:text-sm ml-auto sm:ml-2">
                {(frame.a + frame.dbl).toFixed(1)}
                <span className="text-[9px] font-normal text-slate-400 ml-0.5">mm</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-3 p-2.5 px-3 hover:bg-slate-50/40 dark:hover:bg-slate-900/80 transition-colors shrink-0 w-[45%] sm:w-auto sm:flex-1 snap-start">
            <div className="flex items-center gap-1.5 min-w-0">
              <Compass size={13} className="text-slate-400 shrink-0" aria-hidden="true" />
              <span className="font-bold text-slate-500 dark:text-slate-400 text-[8px] sm:text-[9px] uppercase tracking-wider truncate hidden sm:inline-block">{t.decentration}</span>
              <span className="font-bold text-slate-500 dark:text-slate-400 text-[8px] sm:text-[9px] uppercase tracking-wider truncate sm:hidden">Dec.</span>
            </div>
            {isLoading ? <Skeleton className="h-4 w-10 ml-auto sm:ml-2" /> : (
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-[13px] sm:text-sm ml-auto sm:ml-2">
                {result.decentration.toFixed(2)}
                <span className="text-[9px] font-normal text-slate-400 ml-0.5">mm</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-3 p-2.5 px-3 hover:bg-slate-50/40 dark:hover:bg-slate-900/80 transition-colors shrink-0 w-[45%] sm:w-auto sm:flex-1 snap-start">
            <div className="flex items-center gap-1.5 min-w-0">
              <Diameter size={13} className="text-slate-400 shrink-0" aria-hidden="true" />
              <span className="font-bold text-slate-500 dark:text-slate-400 text-[8px] sm:text-[9px] uppercase tracking-wider truncate hidden sm:inline-block">{t.minBlank}</span>
              <span className="font-bold text-slate-500 dark:text-slate-400 text-[8px] sm:text-[9px] uppercase tracking-wider truncate sm:hidden">Blank</span>
            </div>
            {isLoading ? <Skeleton className="h-4 w-10 ml-auto sm:ml-2" /> : (
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-[13px] sm:text-sm ml-auto sm:ml-2">
                {(result.y * 2 + 2).toFixed(0)}
                <span className="text-[9px] font-normal text-slate-400 ml-0.5">mm</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
