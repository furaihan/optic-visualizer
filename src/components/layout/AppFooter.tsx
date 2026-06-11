import { useOpticalContext } from '../../contexts/OpticalContext';
import { useSearch } from '@tanstack/react-router';
import { translations } from '../../lib/translations';
import { OPTICAL_ENGINE_VERSION } from '../../lib/optic-engine/optical';
import type { SimulatorSearchParams } from '../../routes/index';

export function AppFooter() {
  const search = useSearch({ strict: false }) as SimulatorSearchParams;
  const lang = search.lang || 'id';
  const t = translations[lang];

  const { frame, result } = useOpticalContext();

  return (
    <footer className="h-7 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-500 px-4 md:px-6 flex items-center justify-between text-[8px] font-mono shrink-0 z-20 overflow-hidden shadow-sm">
      <div className="flex gap-4 md:gap-6 uppercase tracking-widest truncate mr-2">
        <span className="flex gap-1 md:gap-1.5">
          <span className="text-slate-300 dark:text-slate-600">{t.framePd}:</span>{" "}
          {(frame.a + frame.dbl).toFixed(1)}mm
        </span>
        <span className="flex gap-1 md:gap-1.5">
          <span className="text-slate-300 dark:text-slate-600">{t.decentration}:</span>{" "}
          {result.decentration.toFixed(2)}mm
        </span>
        <span className="flex gap-1 md:gap-1.5">
          <span className="text-slate-300 dark:text-slate-600">{t.minBlank}:</span>{" "}
          {(result.y * 2 + 2).toFixed(0)}mm
        </span>
      </div>
      <div className="flex items-center gap-2 md:gap-4 text-[7px] text-slate-300 dark:text-slate-600 shrink-0">
        <span className="hidden sm:inline">
          {t.engine}: {OPTICAL_ENGINE_VERSION}
        </span>
        <span className="uppercase">© 2026 {t.labs}</span>
      </div>
    </footer>
  );
}
