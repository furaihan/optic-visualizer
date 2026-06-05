import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { CalculationResult } from '../lib/optical';
import { translations, Language } from '../lib/translations';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface RecommendationCardProps {
  result: CalculationResult;
  lensIndex: number;
  lang: Language;
  isLoading?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ result, lensIndex, lang, isLoading }) => {
  const t = translations[lang];

  // Correct volume reduction percentage calculation compared to 1.50 baseline
  // Formula: (1 - ( (1.50 - 1) / (index - 1) )) * 100
  const volumeReductionPercent = Math.max(0, Math.round((1 - 0.50 / (lensIndex - 1)) * 100));

  const text = t.volumeReduction
    .replace('{index}', lensIndex.toFixed(2))
    .replace('{percent}', volumeReductionPercent.toFixed(0));

  return (
    <Card className="bg-slate-900 border-none text-white shadow-xl relative overflow-hidden flex flex-col h-full" size="default">
      {/* AI Aesthetic Overlay/Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <CardContent className="flex flex-col flex-1 p-5 relative z-10 space-y-5">
         <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-0.5">
               <h3 className="text-[10px] font-bold text-slate-400/80 uppercase tracking-[0.2em]">{t.recomTitle}</h3>
               <p className="text-[8px] text-blue-400 font-bold uppercase tracking-wider">{t.geometricRuleBase}</p>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[8px] font-bold border border-white/5">{t.bestChoice}</div>
          </div>

          <div className="flex flex-col gap-1.5 justify-center py-1">
            {isLoading ? (
               <Skeleton className="h-8 w-32 bg-slate-800/80" />
            ) : (
              <>
                <p className="text-2xl font-black text-white italic tracking-tighter">
                  INDEX {result.recommendation?.index.toFixed(2)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                   <span className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded font-bold text-slate-300 border border-white/5">
                     {result.recommendation?.material}
                   </span>
                   <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 rounded font-bold text-emerald-400 border border-emerald-500/20">
                     -{result.recommendation?.thinness} THIN
                   </span>
                   <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 rounded font-bold text-blue-400 border border-blue-500/20">
                     ABBE {result.recommendation?.abbe}
                   </span>
                </div>
              </>
            )}
          </div>
          
          <div className="min-h-[40px]">
            {isLoading ? (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-3 w-full bg-slate-800/80" />
                <Skeleton className="h-3 w-4/5 bg-slate-800/80" />
              </div>
            ) : (
             <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic border-l-2 border-blue-500/50 pl-3 py-1 break-words whitespace-normal">
                {result.recommendation?.reason}
             </p>
            )}
          </div>
         </div>

         <div className="h-px bg-white/5 w-full my-auto flex-none" />

         <div className="space-y-3 mt-auto">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="text-[10px] font-bold text-slate-400/80 uppercase tracking-[0.2em]">{t.geometricAudit}</h3>
              <ShieldCheck size={14} className="text-emerald-500" aria-hidden="true" />
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-slate-200 break-words whitespace-normal">
               {text}
            </p>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between z-10 relative">
              <span className="text-[9px] font-bold text-slate-400/80 uppercase">{t.volumeLabel}: {result.et < 5 ? t.volumeCompact : t.volumeElevated}</span>
              <div className="flex gap-1">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className={`w-3.5 h-1 rounded-full ${i <= (result.et < 5 ? 4 : 2) ? 'bg-blue-500' : 'bg-slate-800'}`} />
                 ))}
              </div>
          </div>
         </div>
      </CardContent>
    </Card>
  );
};
