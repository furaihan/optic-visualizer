import React from 'react';
import {
  ShieldCheckIcon,
  SparklesIcon,
  TrendingDownIcon,
  CircleGaugeIcon,
} from 'lucide-react';

import { CalculationResult } from '../../lib/optic-engine/types';
import { translations, Language } from '../../lib/translations';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

interface RecommendationCardProps {
  result: CalculationResult;
  lensIndex: number;
  lang: Language;
  isLoading?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  result,
  lensIndex,
  lang,
  isLoading,
}) => {
  const t = translations[lang];

  const volumeReductionPercent = Math.max(
    0,
    Math.round((1 - 0.5 / (lensIndex - 1)) * 100)
  );

  const text = t.volumeReduction
    .replace('{index}', lensIndex.toFixed(2))
    .replace('{percent}', volumeReductionPercent.toFixed(0));

  return (
    <Card
      className="
        relative
        overflow-hidden
        border-slate-200/80 dark:border-slate-800
        bg-white/90 dark:bg-slate-950/90
        backdrop-blur-sm
        shadow-sm
        h-full
      "
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-[90px] dark:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[80px] dark:blur-[100px] pointer-events-none" />

      <CardContent className="relative z-10 p-5 sm:p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="
                h-10 w-10
                rounded-xl
                bg-emerald-100 dark:bg-emerald-500/15
                border
                border-emerald-200 dark:border-emerald-500/20
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <ShieldCheckIcon
                size={18}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                {t.recomTitle}
              </p>

              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {t.bestChoice}
              </p>
            </div>
          </div>

          <Badge
            className="
              bg-slate-100 dark:bg-white/5
              border-slate-200 dark:border-white/10
              text-slate-600 dark:text-slate-300
              hover:bg-slate-200 dark:hover:bg-white/10
              text-[10px] text-center
            "
            variant="outline"
          >
            {t.geometricRuleBase}
          </Badge>
        </div>

        {/* Hero Index */}
        <div className="mt-5 sm:mt-6">
          {isLoading ? (
            <Skeleton className="h-16 w-48 bg-slate-200 dark:bg-slate-800" />
          ) : (
            <>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-slate-500 mb-1">
                Lens Index
              </div>

              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-4xl sm:text-5xl font-black tracking-tighter leading-none text-slate-900 dark:text-white">
                  {result.recommendation?.index.toFixed(2)}
                </span>

                <span className="text-sm sm:text-base text-blue-600 dark:text-blue-400 font-medium">
                  Recommended
                </span>
              </div>
            </>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-4 sm:mt-5 flex flex-wrap gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-24 bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-7 w-24 bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-7 w-24 bg-slate-200 dark:bg-slate-800" />
            </>
          ) : (
            <>
              <div
                className="
                  px-3 py-1.5
                  rounded-full
                  bg-slate-100 dark:bg-white/5
                  border border-slate-200 dark:border-white/10
                  text-xs
                  font-semibold
                  text-slate-700 dark:text-slate-300
                "
              >
                {result.recommendation?.material}
              </div>

              <div
                className="
                  px-3 py-1.5
                  rounded-full
                  bg-emerald-50 dark:bg-emerald-500/10
                  border border-emerald-200 dark:border-emerald-500/20
                  text-xs
                  font-semibold
                  text-emerald-700 dark:text-emerald-400
                  flex items-center gap-1
                "
              >
                <TrendingDownIcon size={12} />
                {result.recommendation?.thinness}% thinner
              </div>

              <div
                className="
                  px-3 py-1.5
                  rounded-full
                  bg-blue-50 dark:bg-blue-500/10
                  border border-blue-200 dark:border-blue-500/20
                  text-xs
                  font-semibold
                  text-blue-700 dark:text-blue-400
                  flex items-center gap-1
                "
              >
                <CircleGaugeIcon size={12} />
                Abbe {result.recommendation?.abbe}
              </div>
            </>
          )}
        </div>

        {/* Recommendation Reason */}
        <div className="mt-4 sm:mt-5">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : (
            <div
              className="
                rounded-2xl
                bg-slate-50 dark:bg-white/5
                border
                border-slate-200/60 dark:border-white/5
                p-3 sm:p-4
                backdrop-blur-sm
              "
            >
              <div className="flex gap-2">
                <SparklesIcon
                  size={14}
                  className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5"
                />

                <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {result.recommendation?.reason === 'simErrorDesc'
                    ? t.simErrorDesc
                    : result.recommendation?.reason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Volume Reduction Metric */}
        <div
          className="
            mt-5 sm:mt-6
            rounded-2xl
            border
            border-blue-200 dark:border-blue-500/20
            bg-blue-50/50 dark:bg-blue-500/10
            p-4 sm:p-5
          "
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-blue-700 dark:text-blue-300">
              Volume Reduction
            </span>

            <ShieldCheckIcon
              size={14}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>

          {isLoading ? (
            <Skeleton className="mt-3 h-10 w-24 bg-slate-200 dark:bg-slate-800" />
          ) : (
            <>
              <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {volumeReductionPercent}%
                </span>

                <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">
                  vs Index 1.50
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {text}
              </p>

              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>{t.volumeLabel}</span>
                  <span>{volumeReductionPercent}%</span>
                </div>

                <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-blue-500
                      via-cyan-400
                      to-cyan-300
                    "
                    style={{
                      width: `${Math.min(volumeReductionPercent, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 sm:pt-5">
          <div className="border-t border-slate-200 dark:border-white/10 pt-4 flex items-center justify-between flex-wrap gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">
              {t.geometricAudit}
            </span>

            <Badge
              variant="outline"
              className={`
                text-[10px] sm:text-xs
                ${
                  result.et < 5
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                }
              `}
            >
              {result.et < 5
                ? t.volumeCompact
                : t.volumeElevated}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};