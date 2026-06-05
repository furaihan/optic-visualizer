import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculationResult, FrameParameters, LensParameters } from '../lib/optical';
import { translations, Language } from '../lib/translations';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2, Info, ChevronDown, MoveHorizontal, Compass, Diameter, Scale, X } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent } from './ui/card';

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
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold font-mono border ${colorClass} leading-none shadow-sm transition-all duration-200 hover:shadow-md`}>
        <Icon size={12} className="stroke-[2.5]" />
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
      <Card className="group bg-white dark:bg-slate-950 p-4 flex flex-col justify-between hover:shadow-md dark:hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-slate-900/80 hover:-translate-y-[2px] transition-all duration-300 h-full shadow-sm border border-slate-100 dark:border-slate-700/50 rounded-2xl backdrop-blur-sm bg-gradient-to-b from-white/98 dark:from-slate-950/98 to-white/95 dark:to-slate-950/95">
        <div className="space-y-3 flex-1 flex flex-col">
          <div className="flex items-center gap-2 group-hover:translate-x-0.5 transition-transform duration-200">
            {Icon && <Icon size={16} className={`${iconColor} group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200`} strokeWidth={2.2} />}
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest truncate">
              {label}
            </p>
          </div>
          
          <div className="flex items-baseline gap-2 flex-wrap mt-auto group-hover:scale-y-[1.02] transition-transform duration-200 origin-left">
            {isLoading ? (
              <Skeleton className="h-8 w-16 rounded-lg" />
            ) : (
              <>
                <p className="text-2xl font-mono font-black text-slate-900 dark:text-slate-50 leading-none tracking-tight">
                  {value.toFixed(2)}
                  <span className="text-xs ml-1.5 font-sans font-semibold text-slate-400 dark:text-slate-500 lowercase tracking-widest">{unit}</span>
                </p>
                {deltaNode && <div className="scale-90 origin-left flex-shrink-0">{deltaNode}</div>}
              </>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100/80 dark:border-slate-800/80">
          {isLoading ? (
            <Skeleton className="h-6 w-16 rounded-md mt-1" />
          ) : (
            <span className={`inline-block px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 group-hover:shadow-sm ${statusColor} leading-none truncate max-w-full`}>
              {status}
            </span>
          )}
        </div>
      </Card>
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
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full" />
          <h2 className="text-sm font-black text-slate-900 dark:text-slate-50 tracking-tighter uppercase">{t.tabSummary || 'Summary'}</h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-50/80 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-sm">
          {hasWarnings && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setActivePanel(p => p === 'warnings' ? 'none' : 'warnings')}
              className={`flex items-center gap-2 px-3 py-2 text-[10px] font-bold rounded-lg transition-all duration-200 ${
                activePanel === 'warnings' 
                  ? 'bg-white dark:bg-slate-900/90 shadow-md text-amber-600 dark:text-amber-400 border border-amber-200/40 dark:border-amber-800/40' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-700/30'
              }`}
            >
              <AlertTriangle size={12} className={isUnsafe ? 'text-red-500 animate-pulse' : 'text-amber-500'} />
              <span className="uppercase tracking-wider font-semibold">Warnings ({(isUnsafe ? 1 : 0) + (isHighDecentration ? 1 : 0)})</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setActivePanel(p => p === 'guide' ? 'none' : 'guide')}
            className={`flex items-center gap-2 px-3 py-2 text-[10px] font-bold rounded-lg transition-all duration-200 ${
              activePanel === 'guide' 
                ? 'bg-white dark:bg-slate-900/90 shadow-md text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-800/40' 
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-700/30'
            }`}
          >
            <Info size={12} className="flex-shrink-0" />
            <span className="uppercase tracking-wider font-semibold">{t.guideTitle}</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {/* Warnings Panel */}
        {activePanel === 'warnings' && hasWarnings && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 py-2">
              {isUnsafe && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="relative"
                >
                  <div className="absolute -left-1.5 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-rose-500 rounded-full" />
                  <Card className="bg-red-50/95 dark:bg-rose-950/25 border-red-200/60 dark:border-rose-900/50 p-4 rounded-2xl text-xs text-red-800 dark:text-rose-200 flex items-start gap-4 shadow-sm backdrop-blur-sm leading-relaxed group">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200" size={18} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-rose-800 dark:text-rose-300 tracking-wide uppercase text-[11px] break-words mt-0.5">
                        {t.lowCompatibility}
                      </p>
                      <div className="text-slate-700 dark:text-rose-200/85 font-medium space-y-1.5 mt-2 break-words">
                        {isAnteriorUnsafe && (
                          <p>{t.anteriorWarning.replace('{val}', result.anteriorProtrusion.toFixed(1))}</p>
                        )}
                        {isPosteriorUnsafe && (
                          <p>{t.posteriorWarning.replace('{val}', result.posteriorProtrusion.toFixed(1))}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {isHighDecentration && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <div className="absolute -left-1.5 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-400 rounded-full" />
                  <Card className="bg-amber-50/95 dark:bg-amber-950/25 border-amber-200/60 dark:border-amber-900/50 p-4 rounded-2xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-4 shadow-sm backdrop-blur-sm leading-relaxed group">
                    <AlertTriangle className="text-amber-500 shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200" size={18} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="font-black uppercase tracking-wide text-amber-900 dark:text-amber-300 text-[11px] break-words mt-1">
                        {t.highDecentration}
                      </p>
                      <p className="mt-2 text-slate-700 dark:text-amber-200/85 font-medium font-sans break-words">
                        {t.decentrationWarning.replace('{decentration}', result.decentration.toFixed(1)).replace('{prism}', inducedPrism.toFixed(1))}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Guide Panel */}
        {activePanel === 'guide' && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <Card className="grid gap-4 p-5 my-2 rounded-2xl sm:grid-cols-2 lg:grid-cols-4 shadow-sm border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-br from-slate-50/60 dark:from-slate-900/40 to-slate-50/40 dark:to-slate-950/20 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-2.5 bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-700/30 hover:shadow-sm transition-all duration-200"
              >
                <h5 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 text-xs uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                  {t.guideEtLabel}
                </h5>
                <p className="text-slate-600 dark:text-slate-400 pl-5 leading-relaxed text-[11px] font-medium">{t.guideEtDesc}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2.5 bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-700/30 hover:shadow-sm transition-all duration-200"
              >
                <h5 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 text-xs uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                  {t.guideCtLabel}
                </h5>
                <p className="text-slate-600 dark:text-slate-400 pl-5 leading-relaxed text-[11px] font-medium">{t.guideCtDesc}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-2.5 bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-700/30 hover:shadow-sm transition-all duration-200"
              >
                <h5 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 text-xs uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  {t.guideProtLabel}
                </h5>
                <p className="text-slate-600 dark:text-slate-400 pl-5 leading-relaxed text-[11px] font-medium">{t.guideProtDesc}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2.5 bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-700/30 hover:shadow-sm transition-all duration-200"
              >
                <h5 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 text-xs uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                  {t.guideWeightLabel}
                </h5>
                <p className="text-slate-600 dark:text-slate-400 pl-5 leading-relaxed text-[11px] font-medium">{t.guideWeightDesc}</p>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
          status={t.optimized} statusColor="bg-blue-50 text-blue-700 border border-blue-100/50 dark:bg-blue-950/20 dark:text-blue-350 dark:border-blue-900/60"
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

      {/* Secondary Clinical Specs Row */}
      {frame && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="group bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 p-4 hover:shadow-md dark:hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-slate-900/60 transition-all duration-300 shadow-sm bg-gradient-to-b from-white/98 dark:from-slate-950/98 to-white/95 dark:to-slate-950/95 backdrop-blur-sm">
            <div className="flex items-center gap-3 min-w-0 group-hover:translate-x-0.5 transition-transform duration-200">
              <MoveHorizontal size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 shrink-0 transition-colors duration-200" aria-hidden="true" />
              <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px] uppercase tracking-widest truncate">{t.framePd}</span>
            </div>
            {isLoading ? <Skeleton className="h-6 w-12 rounded-md" /> : (
              <span className="font-mono font-black text-slate-800 dark:text-slate-100 text-lg tracking-tight">
                {(frame.a + frame.dbl).toFixed(1)}
                <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5">mm</span>
              </span>
            )}
          </Card>

          <Card className="group bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 p-4 hover:shadow-md dark:hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-slate-900/60 transition-all duration-300 shadow-sm bg-gradient-to-b from-white/98 dark:from-slate-950/98 to-white/95 dark:to-slate-950/95 backdrop-blur-sm">
            <div className="flex items-center gap-3 min-w-0 group-hover:translate-x-0.5 transition-transform duration-200">
              <Compass size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 shrink-0 transition-colors duration-200" aria-hidden="true" />
              <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px] uppercase tracking-widest truncate">{t.decentration}</span>
            </div>
            {isLoading ? <Skeleton className="h-6 w-12 rounded-md" /> : (
              <span className="font-mono font-black text-slate-800 dark:text-slate-100 text-lg tracking-tight">
                {result.decentration.toFixed(2)}
                <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5">mm</span>
              </span>
            )}
          </Card>

          <Card className="group bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 p-4 hover:shadow-md dark:hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-slate-900/60 transition-all duration-300 shadow-sm bg-gradient-to-b from-white/98 dark:from-slate-950/98 to-white/95 dark:to-slate-950/95 backdrop-blur-sm">
            <div className="flex items-center gap-3 min-w-0 group-hover:translate-x-0.5 transition-transform duration-200">
              <Diameter size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 shrink-0 transition-colors duration-200" aria-hidden="true" />
              <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px] uppercase tracking-widest truncate">{t.minBlank}</span>
            </div>
            {isLoading ? <Skeleton className="h-6 w-12 rounded-md" /> : (
              <span className="font-mono font-black text-slate-800 dark:text-slate-100 text-lg tracking-tight">
                {(result.y * 2 + 2).toFixed(0)}
                <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5">mm</span>
              </span>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};