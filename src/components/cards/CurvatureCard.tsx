import React from 'react';
import {
  Circle,
  Radius,
  Waves,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

import { CalculationResult } from '../../lib/optical';
import { translations, Language } from '../../lib/translations';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface CurvatureCardProps {
  result: CalculationResult;
  lang: Language;
}

export const CurvatureCard: React.FC<CurvatureCardProps> = ({ result, lang }) => {
  const t = translations[lang];

  const specs = [
    {
      label: t.r1Front,
      value: result.r1.toFixed(1),
      unit: 'mm',
      icon: Radius,
      color:
        'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    },
    {
      label: t.r2Back,
      value: result.r2 === Infinity ? 'PLANO' : result.r2.toFixed(1),
      unit: result.r2 === Infinity ? '' : 'mm',
      icon: Circle,
      color:
        'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    },
    {
      label: t.s1Sag,
      value: result.s1.toFixed(2),
      unit: 'mm',
      icon: Waves,
      color:
        'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    },
    {
      label: t.s2Sag,
      value: result.s2.toFixed(2),
      unit: 'mm',
      icon: Waves,
      color:
        'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    },
    {
      label: t.anteriorProt,
      value: result.anteriorProtrusion.toFixed(2),
      unit: 'mm',
      icon: ArrowUpRight,
      color:
        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    {
      label: t.posteriorProt,
      value: result.posteriorProtrusion.toFixed(2),
      unit: 'mm',
      icon: ArrowDownRight,
      color:
        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
  ];

  return (
    <Card
      className="
        overflow-hidden
        border-slate-200/80 dark:border-slate-800
        bg-white/90 dark:bg-slate-950/90
        backdrop-blur-sm
        shadow-sm
      "
    >
      <CardHeader
        className="
          pb-4
          border-b
          border-slate-100 dark:border-slate-800
          bg-gradient-to-r
          from-slate-50
          to-white
          dark:from-slate-900
          dark:to-slate-950
        "
      >
        <CardTitle
          className="
            flex items-center gap-2
            text-xs
            font-bold
            uppercase
            tracking-[0.25em]
            text-slate-500
          "
        >
          <Radius className="h-4 w-4" />
          {t.curvatureSpecs}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {specs.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="
                  group
                  rounded-xl
                  border
                  border-slate-200/70
                  dark:border-slate-800
                  bg-slate-50/70
                  dark:bg-slate-900/50
                  p-3
                  transition-all
                  hover:shadow-md
                  hover:-translate-y-0.5
                "
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      {item.label}
                    </p>
                  </div>

                  <div
                    className={`
                      flex h-8 w-8 items-center justify-center
                      rounded-lg border
                      ${item.color}
                    `}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-end gap-1">
                  <span
                    className="
                      text-lg
                      font-bold
                      font-mono
                      text-slate-900
                      dark:text-slate-100
                    "
                  >
                    {item.value}
                  </span>

                  {item.unit && (
                    <span
                      className="
                        text-[11px]
                        text-slate-500
                        mb-0.5
                      "
                    >
                      {item.unit}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};