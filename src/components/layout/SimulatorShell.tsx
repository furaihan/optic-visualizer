import type { ReactNode } from 'react';
import type { Language, View, ActiveTab } from '../../types/search-params';
import { HeaderBar } from './HeaderBar';
import { ValidationAlerts } from './ValidationAlerts';
import { MobileTabManager } from './MobileTabManager';
import { MobileViews } from './MobileViews';
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

export function SimulatorShell({ grid, mobileExtra, lang, view, activeTab, onViewChange, onTabChange }: SimulatorShellProps) {
  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="hidden md:flex flex-1 h-full overflow-hidden">
        {grid}
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden relative md:hidden">
        <HeaderBar
          lang={lang}
          view={view}
          activeTab={activeTab}
          onViewChange={onViewChange}
        />
        <ValidationAlerts lang={lang} />
        <div className="flex-1 overflow-hidden p-3 flex flex-col gap-3">
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
