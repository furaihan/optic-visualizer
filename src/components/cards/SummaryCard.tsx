import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FrameParameters, LensParameters, CalculationResult } from '../../lib/optic-engine/types';
import { translations, Language } from '../../lib/translations';
import { ArrowUpRightIcon, ArrowDownRightIcon, AlertTriangleIcon, CheckCircle2Icon, InfoIcon, MoveHorizontalIcon, CompassIcon, DiameterIcon, ScaleIcon } from "lucide-react";
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';

interface SummaryCardProps {
  result: CalculationResult;
  compareResult?: CalculationResult;
  lang: Language;
  frame?: FrameParameters;
  lens?: LensParameters;
  isLoading?: boolean;
  isAdvanced?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ result, compareResult, lang, frame, lens, isLoading, isAdvanced = true }) => {
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
    const isWorse = diff > 0;
    
    const colorClass = isWorse 
      ? 'text-rose-600 bg-rose-50 border-rose-100/50' 
      : 'text-emerald-600 bg-emerald-50 border-emerald-100/50';
      
    const Icon = isWorse ? ArrowUpRightIcon : ArrowDownRightIcon;
    const formatted = `${isPositive ? '+' : ''}${diff.toFixed(2)}`;

    return (
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${colorClass} leading-none shadow-sm transition-all duration-200 hover:shadow-md`}>
        <Icon size={10} className="stroke-[2.5]" />
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
    iconColor = "text-slate-400 dark:text-slate-500",
    resultKey,
    isLoading
  }: StatItemProps) => {
    const deltaNode = resultKey ? getDeltaElement(resultKey) : null;
    
    return (
      <Card className="group bg-white dark:bg-slate-950 p-1.5 flex flex-col justify-between hover:shadow-sm dark:hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-slate-900/80 hover:-translate-y-0.5 transition-all duration-300 h-full shadow-sm border border-slate-100 dark:border-slate-700/50 rounded-lg backdrop-blur-sm bg-gradient-to-b from-white/98 dark:from-slate-950/98 to-white/95 dark:to-slate-950/95">
        <div className="space-y-0.5 flex-1 flex flex-col">
          <div className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">
            {Icon && <Icon size={10} className={`${iconColor} group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200`} strokeWidth={2.2} />}
            <p className="text-[8px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest truncate">
              {label}
            </p>
          </div>
          
          <div className="flex items-baseline gap-1 flex-wrap group-hover:scale-y-[1.02] transition-transform duration-200 origin-left">
            {isLoading ? (
              <Skeleton className="h-4 w-10 rounded" />
            ) : (
              <>
                <p className="text-sm font-mono font-black text-slate-900 dark:text-slate-50 leading-none tracking-tight">
                  {value.toFixed(2)}
                  <span className="text-[7px] ml-0.5 font-sans font-semibold text-slate-400 dark:text-slate-500 lowercase tracking-widest">{unit}</span>
                </p>
                {deltaNode && <div className="scale-75 origin-left flex-shrink-0">{deltaNode}</div>}
              </>
            )}
          </div>
        </div>

        <div className="mt-0.5 pt-0.5 border-t border-slate-100/80 dark:border-slate-800/80">
          {isLoading ? (
            <Skeleton className="h-3 w-8 rounded" />
          ) : (
            <span className={`inline-block px-1 py-0.25 rounded text-[7px] font-bold uppercase tracking-widest border transition-all duration-200 group-hover:shadow-sm ${statusColor} leading-none truncate max-w-full`}>
              {status}
            </span>
          )}
        </div>
      </Card>
    );
  };

  const getETStatus = (et: number) => {
    if (et > 6) return { label: t.thick, color: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-350 dark:border-rose-900/60', icon: AlertTriangleIcon, iconColor: 'text-rose-500' };
    if (et > 4) return { label: t.medium, color: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-350 dark:border-amber-900/60', icon: ArrowUpRightIcon, iconColor: 'text-amber-500' };
    return { label: t.thin, color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-350 dark:border-emerald-900/60', icon: CheckCircle2Icon, iconColor: 'text-emerald-500' };
  };

  const getProtrusionStatus = (val: number) => {
    if (val > 2) return { label: t.moderate, color: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-350 dark:border-rose-900/60', icon: AlertTriangleIcon, iconColor: 'text-rose-500' };
    if (val > 0.5) return { label: t.noticeable, color: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-350 dark:border-amber-900/60', icon: ArrowUpRightIcon, iconColor: 'text-amber-500' };
    return { label: t.flush, color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-350 dark:border-emerald-900/60', icon: CheckCircle2Icon, iconColor: 'text-emerald-500' };
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
    <div className="space-y-1.5 relative">
      {/* Header with Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-0.5 h-4 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full flex-shrink-0" />
          <h2 className="text-xs font-black text-slate-900 dark:text-slate-50 tracking-tighter uppercase truncate">{t.tabSummary || 'Summary'}</h2>
        </div>
        <div className="flex items-center gap-1 bg-slate-50/80 dark:bg-slate-800/60 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-sm flex-shrink-0">
          {hasWarnings && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActivePanel(p => p === 'warnings' ? 'none' : 'warnings')}
              className={`flex items-center gap-1 px-2 py-1 text-[9px] font-bold rounded-md transition-all duration-200 ${
                activePanel === 'warnings' 
                  ? 'bg-white dark:bg-slate-900/90 shadow-sm text-amber-600 dark:text-amber-400 border border-amber-200/40 dark:border-amber-800/40' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-700/30'
              }`}
            >
              <AlertTriangleIcon size={10} className={isUnsafe ? 'text-red-500 animate-pulse' : 'text-amber-500'} />
              <span className="uppercase tracking-wider font-semibold hidden sm:inline">Warnings</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActivePanel(p => p === 'guide' ? 'none' : 'guide')}
            className={`flex items-center gap-1 px-2 py-1 text-[9px] font-bold rounded-md transition-all duration-200 ${
              activePanel === 'guide' 
                ? 'bg-white dark:bg-slate-900/90 shadow-sm text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-800/40' 
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-700/30'
            }`}
          >
            <InfoIcon size={10} className="flex-shrink-0" />
            <span className="uppercase tracking-wider font-semibold hidden sm:inline">{t.guideTitle}</span>
          </motion.button>
        </div>
      </div>

      {/* Warnings/Guide Panels */}
      <AnimatePresence initial={false} mode="wait">
        {/* Warnings Panel */}
        {activePanel === 'warnings' && hasWarnings && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 py-1.5">
              {isUnsafe && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="relative"
                >
                  <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 to-rose-500 rounded-full" />
                  <Card className="bg-red-50/95 dark:bg-rose-950/25 border-red-200/60 dark:border-rose-900/50 p-2.5 rounded-lg text-xs text-red-800 dark:text-rose-200 flex items-start gap-2 shadow-sm backdrop-blur-sm leading-relaxed group">
                    <AlertTriangleIcon className="text-red-500 shrink-0 mt-0.25 group-hover:scale-110 transition-transform duration-200" size={14} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-rose-800 dark:text-rose-300 tracking-wide uppercase text-[10px] break-words">
                        {t.lowCompatibility}
                      </p>
                      <div className="text-slate-700 dark:text-rose-200/85 font-medium space-y-0.5 mt-1 break-words text-[11px]">
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
                  <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 to-amber-400 rounded-full" />
                  <Card className="bg-amber-50/95 dark:bg-amber-950/25 border-amber-200/60 dark:border-amber-900/50 p-2.5 rounded-lg text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 shadow-sm backdrop-blur-sm leading-relaxed group">
                    <AlertTriangleIcon className="text-amber-500 shrink-0 mt-0.25 group-hover:scale-110 transition-transform duration-200" size={14} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="font-black uppercase tracking-wide text-amber-900 dark:text-amber-300 text-[10px] break-words">
                        {t.highDecentration}
                      </p>
                      <p className="mt-0.5 text-slate-700 dark:text-amber-200/85 font-medium font-sans break-words text-[11px]">
                        {t.decentrationWarning.replace('{decentration}', result.decentration.toFixed(1)).replace('{prism}', inducedPrism.toFixed(1))}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Guide Panel - Compact */}
        {activePanel === 'guide' && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <Card className={`grid gap-2 p-3 my-1 rounded-lg sm:grid-cols-2 ${isAdvanced ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} shadow-sm border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-br from-slate-50/60 dark:from-slate-900/40 to-slate-50/40 dark:to-slate-950/20 backdrop-blur-sm`}>
              <motion.div
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-1 bg-white dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100/50 dark:border-slate-700/30 hover:shadow-sm transition-all duration-200"
              >
                <h5 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-[8px] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                  {t.guideEtLabel}
                </h5>
                <p className="text-slate-600 dark:text-slate-400 pl-3.5 leading-tight text-[9px] font-medium">{t.guideEtDesc}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-1 bg-white dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100/50 dark:border-slate-700/30 hover:shadow-sm transition-all duration-200"
              >
                <h5 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-[8px] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
                  {t.guideCtLabel}
                </h5>
                <p className="text-slate-600 dark:text-slate-400 pl-3.5 leading-tight text-[9px] font-medium">{t.guideCtDesc}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-1 bg-white dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100/50 dark:border-slate-700/30 hover:shadow-sm transition-all duration-200"
              >
                <h5 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-[8px] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  {t.guideProtLabel}
                </h5>
                <p className="text-slate-600 dark:text-slate-400 pl-3.5 leading-tight text-[9px] font-medium">{t.guideProtDesc}</p>
              </motion.div>
              
              {isAdvanced && (
                <motion.div
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1 bg-white dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100/50 dark:border-slate-700/30 hover:shadow-sm transition-all duration-200"
                >
                  <h5 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-[8px] uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                    {t.guideWeightLabel}
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 pl-3.5 leading-tight text-[9px] font-medium">{t.guideWeightDesc}</p>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Stats Grid - 5 or 4 columns based on mode and screen */}
      <div className={`grid grid-cols-2 ${isAdvanced ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-1.5`}>
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
          icon={CheckCircle2Icon} iconColor="text-blue-500"
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
        {isAdvanced && (
          <StatItem 
            label={t.lensWeight} 
            value={result.weight} unit="g"
            status={weightStatus.label} statusColor={weightStatus.color}
            icon={ScaleIcon} iconColor="text-indigo-500"
            resultKey="weight"
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Secondary Clinical Specs - Compact Row */}
      {isAdvanced && frame && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          <Card className="group bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between gap-2 p-1.5 px-2.5 hover:shadow-sm dark:hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-slate-900/60 transition-all duration-300 shadow-sm bg-gradient-to-b from-white/98 dark:from-slate-950/98 to-white/95 dark:to-slate-950/95 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 min-w-0 group-hover:translate-x-0.5 transition-transform duration-200">
              <MoveHorizontalIcon size={12} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 shrink-0 transition-colors duration-200" aria-hidden="true" />
              <span className="font-bold text-slate-600 dark:text-slate-400 text-[8px] uppercase tracking-widest truncate">{t.framePd}</span>
            </div>
            {isLoading ? <Skeleton className="h-5 w-10 rounded" /> : (
              <span className="font-mono font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                {(frame.a + frame.dbl).toFixed(1)}
                <span className="text-[8px] font-normal text-slate-400 dark:text-slate-500 ml-0.5">mm</span>
              </span>
            )}
          </Card>

          <Card className="group bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between gap-2 p-1.5 px-2.5 hover:shadow-sm dark:hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-slate-900/60 transition-all duration-300 shadow-sm bg-gradient-to-b from-white/98 dark:from-slate-950/98 to-white/95 dark:to-slate-950/95 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 min-w-0 group-hover:translate-x-0.5 transition-transform duration-200">
              <CompassIcon size={12} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 shrink-0 transition-colors duration-200" aria-hidden="true" />
              <span className="font-bold text-slate-600 dark:text-slate-400 text-[8px] uppercase tracking-widest truncate">{t.decentration}</span>
            </div>
            {isLoading ? <Skeleton className="h-5 w-10 rounded" /> : (
              <span className="font-mono font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                {result.decentration.toFixed(2)}
                <span className="text-[8px] font-normal text-slate-400 dark:text-slate-500 ml-0.5">mm</span>
              </span>
            )}
          </Card>

          <Card className="group bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between gap-2 p-1.5 px-2.5 hover:shadow-sm dark:hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-slate-900/60 transition-all duration-300 shadow-sm bg-gradient-to-b from-white/98 dark:from-slate-950/98 to-white/95 dark:to-slate-950/95 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 min-w-0 group-hover:translate-x-0.5 transition-transform duration-200">
              <DiameterIcon size={12} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 shrink-0 transition-colors duration-200" aria-hidden="true" />
              <span className="font-bold text-slate-600 dark:text-slate-400 text-[8px] uppercase tracking-widest truncate">{t.minBlank}</span>
            </div>
            {isLoading ? <Skeleton className="h-5 w-10 rounded" /> : (
              <span className="font-mono font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                {(result.y * 2 + 2).toFixed(0)}
                <span className="text-[8px] font-normal text-slate-400 dark:text-slate-500 ml-0.5">mm</span>
              </span>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};