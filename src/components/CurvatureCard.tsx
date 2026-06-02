import React from 'react';
import { CalculationResult } from '../lib/optical';
import { translations, Language } from '../lib/i18n';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface CurvatureCardProps {
  result: CalculationResult;
  lang: Language;
}

export const CurvatureCard: React.FC<CurvatureCardProps> = ({ result, lang }) => {
  const t = translations[lang];

  return (
    <Card className="bg-white border border-slate-200/90 shadow-sm" size="default">
      <CardHeader className="pb-0 pt-5 px-5">
        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          {t.curvatureSpecs}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1 tracking-wider">{t.r1Front}</p>
            <p className="text-base font-mono font-bold text-slate-800 leading-none">
              {result.r1.toFixed(1)}
              <span className="text-[10px] ml-0.5 opacity-50 font-normal"> mm</span>
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1 tracking-wider">{t.r2Back}</p>
            <p className="text-base font-mono font-bold text-slate-800 leading-none">
              {result.r2 === Infinity ? 'PLANO' : result.r2.toFixed(1)}
              <span className="text-[10px] ml-0.5 opacity-50 font-normal">{result.r2 !== Infinity && ' mm'}</span>
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1 tracking-wider">{t.s1Sag}</p>
            <p className="text-base font-mono font-bold text-slate-800 leading-none">
              {result.s1.toFixed(2)}
              <span className="text-[10px] ml-0.5 opacity-50 font-normal"> mm</span>
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1 tracking-wider">{t.s2Sag}</p>
            <p className="text-base font-mono font-bold text-slate-800 leading-none">
              {result.s2.toFixed(2)}
              <span className="text-[10px] ml-0.5 opacity-50 font-normal"> mm</span>
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1 tracking-wider">{t.anteriorProt}</p>
            <p className="text-base font-mono font-bold text-blue-600 leading-none">
              {result.anteriorProtrusion.toFixed(2)}
              <span className="text-[10px] ml-0.5 opacity-50 font-normal"> mm</span>
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mb-1 tracking-wider">{t.posteriorProt}</p>
            <p className="text-base font-mono font-bold text-emerald-600 leading-none">
              {result.posteriorProtrusion.toFixed(2)}
              <span className="text-[10px] ml-0.5 opacity-50 font-normal"> mm</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
