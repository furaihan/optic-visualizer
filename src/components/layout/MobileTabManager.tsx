import { useSearch, useNavigate } from '@tanstack/react-router';
import { translations } from '../../lib/translations';
import type { SimulatorSearchParams } from '../../routes/index';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../../lib/utils';

export function MobileTabManager() {
  const search = useSearch({ strict: false }) as SimulatorSearchParams;
  const navigate = useNavigate({ from: '/visualizer' });
  const lang = search.lang || 'id';
  const t = translations[lang];

  const activeTab = search.activeTab || 'visualizer';
  const handleTabChange = (tab: "visualizer" | "summary" | "parameters") => 
    navigate({ search: (prev) => ({ ...prev, activeTab: tab }) });

  return (
    <div className="md:hidden flex">
      <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as any)} className="w-full flex-col">
        <TabsList className="grid w-full grid-cols-3 min-h-[44px] p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
          <TabsTrigger value="visualizer" className="text-[10px] font-bold">
            {t.tabVisualizer}
          </TabsTrigger>
          <TabsTrigger value="summary" className="text-[10px] font-bold">
            {t.tabSummary}
          </TabsTrigger>
          <TabsTrigger value="parameters" className="text-[10px] font-bold">
            {t.tabParameters}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
