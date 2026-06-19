import { translations } from '../../lib/translations';
import type { Language, ActiveTab } from '../../types/search-params';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

type MobileTabManagerProps = {
  lang: Language;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
};

export function MobileTabManager({ lang, activeTab, onTabChange }: MobileTabManagerProps) {
  const t = translations[lang];

  return (
    <div className="md:hidden flex">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as ActiveTab)} className="w-full flex-col">
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
