import { useSearch, useNavigate } from '@tanstack/react-router';
import { useOpticalContext } from '../../contexts/OpticalContext';
import { translations } from '../../lib/translations';
import { RotateCcwIcon } from "lucide-react";
import type { SimulatorSearchParams } from '../../routes/index';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../../lib/utils';

export function HeaderBar() {
  const search = useSearch({ strict: false }) as SimulatorSearchParams;
  const navigate = useNavigate({ from: '/visualizer' });
  const lang = search.lang || 'id';
  const t = translations[lang];

  const view = search.view || 'side';
  const setView = (newView: "side" | "top" | "front") => 
    navigate({ search: (prev) => ({ ...prev, view: newView }) });
  
  const activeTab = search.activeTab || 'visualizer';
  
  const {
    resetSession,
  } = useOpticalContext();

  return (
    <header className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-20 shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className={cn(activeTab !== "visualizer" ? "hidden md:flex" : "flex")}>
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-[220px] md:w-[320px]">
            <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/50 dark:border-slate-800/80">
              <TabsTrigger value="side" className="text-[11px] md:text-xs font-semibold tracking-wide">
                {t.sideProfile}
              </TabsTrigger>
              <TabsTrigger value="top" className="text-[11px] md:text-xs font-semibold tracking-wide">
                {t.topDown}
              </TabsTrigger>
              <TabsTrigger value="front" className="text-[11px] md:text-xs font-semibold tracking-wide">
                {t.frontView}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0 font-sans">
        <Button
          variant="outline"
          onClick={resetSession}
          className="px-3 md:px-2.5 h-11 md:h-8 rounded-lg text-[10px] md:text-[9px] font-bold transition-all flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-800/85"
          title={t.resetTitle}
          aria-label={t.resetSession}
        >
          <RotateCcwIcon size={14} className="md:w-3 md:h-3" aria-hidden="true" />
          <span className="hidden sm:inline">{t.reset}</span>
        </Button>
      </div>
    </header>
  );
}
