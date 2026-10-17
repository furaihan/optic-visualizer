import { translations } from '../../lib/translations';
import type { Language, ActiveTab } from '../../types/search-params';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

type MobileTabManagerProps = {
  lang: Language;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
};

/**
 * The phone's three places, as one bar of pressed states.
 * Each target is at least 44px tall, so a thumb finds it.
 */
export function MobileTabManager({ lang, activeTab, onTabChange }: MobileTabManagerProps) {
  const t = translations[lang];

  return (
    <div className="flex md:hidden">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as ActiveTab)} className="w-full">
        <TabsList className="grid h-11 w-full grid-cols-3 gap-0 rounded-none bg-sheet-panel p-1">
          <TabsTrigger
            value="visualizer"
            className="h-full rounded-none text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
          >
            {t.tabVisualizer}
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="h-full rounded-none text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
          >
            {t.tabSummary}
          </TabsTrigger>
          <TabsTrigger
            value="parameters"
            className="h-full rounded-none text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
          >
            {t.tabParameters}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
