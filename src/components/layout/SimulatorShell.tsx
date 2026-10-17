import type { ReactNode } from 'react';
import type { Language, View, ActiveTab } from '../../types/search-params';
import { HeaderBar } from './HeaderBar';
import { ValidationAlerts } from './ValidationAlerts';
import { MobileTabManager } from './MobileTabManager';
import { AppFooter } from './AppFooter';

type SimulatorShellProps = {
  grid: ReactNode;
  mobileExtra?: ReactNode;
  lang: Language;
  view: View;
  activeTab: ActiveTab;
  onViewChange: (view: View) => void;
  onTabChange: (tab: ActiveTab) => void;
};

/**
 * The frame the simulator lives in. Desktop gets the workbench; the phone gets
 * the drawing, the tab bar, and the panel the tab names.
 */
export function SimulatorShell({ grid, mobileExtra, lang, view, activeTab, onViewChange, onTabChange }: SimulatorShellProps) {
  return (
    <div className="flex h-full min-w-0 flex-1 overflow-hidden bg-sheet-ground">
      <div className="hidden h-full flex-1 overflow-hidden md:flex">
        {grid}
      </div>
      <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden md:hidden">
        <HeaderBar
          lang={lang}
          view={view}
          activeTab={activeTab}
          onViewChange={onViewChange}
        />
        <ValidationAlerts lang={lang} />
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden p-3">
          <MobileTabManager
            lang={lang}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
          {mobileExtra}
        </div>
        <AppFooter lang={lang} />
      </div>
    </div>
  );
}
