import { translations } from '../../lib/translations';
import type { Language, ActiveTab } from '../../types/search-params';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import type { ReactNode } from 'react';

type MobileTabManagerProps = {
  lang: Language;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  /** The session's actions, carried on the same row as the places. */
  children?: ReactNode;
};

/**
 * The phone's three places, as one bar of pressed states, with the session's
 * two actions on the same row. Each target is at least 44px tall, so a thumb
 * finds it.
 */
export function MobileTabManager({
  lang,
  activeTab,
  onTabChange,
  children,
}: MobileTabManagerProps) {
  const t = translations[lang];

  return (
    <div className="flex min-w-0 items-center gap-2 md:hidden">
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as ActiveTab)}
        className="min-w-0 flex-1"
      >
        <TabsList className="grid h-11 w-full min-w-0 grid-cols-3 gap-0 rounded-none bg-sheet-panel p-1">
          <TabsTrigger
            value="visualizer"
            className="h-full min-w-0 rounded-none text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
          >
            {t.tabVisualizer}
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="h-full min-w-0 rounded-none text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
          >
            {t.tabSummary}
          </TabsTrigger>
          <TabsTrigger
            value="parameters"
            className="h-full min-w-0 rounded-none text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
          >
            {t.tabParameters}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {children}
    </div>
  );
}
