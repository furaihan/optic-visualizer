import { translations } from '../../lib/translations';
import type { Language, View } from '../../types/search-params';
import { SlidersIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { CopyOrderButton } from './CopyOrderButton';
import { ResetButton } from './ResetButton';

type HeaderBarProps = {
  lang: Language;
  view: View;
  activeTab?: string;
  onViewChange: (view: View) => void;
  /** The session's reset, from the page that owns the state. */
  onReset: () => void;
  /** The lab order, already written as plain text lines. */
  order: string[];
  /** The drawing switcher. The phone carries it on the drawing itself. */
  showViews?: boolean;
  /** Opens the inspector where it is a drawer rather than a column. */
  onToggleInspector?: () => void;
  inspectorOpen?: boolean;
};

/**
 * The toolbar of the workbench: which drawing you are looking at on the left,
 * the session's actions on the right. One flat surface, no chrome.
 */
export function HeaderBar({
  lang,
  view,
  onViewChange,
  onReset,
  order,
  showViews = true,
  onToggleInspector,
  inspectorOpen = false,
}: HeaderBarProps) {
  const t = translations[lang];

  return (
    <header className="flex min-h-12 shrink-0 items-center justify-between gap-2 bg-sheet-ground px-3 py-1 sm:px-4">
      {onToggleInspector && (
        <Button
          variant="ghost"
          onClick={onToggleInspector}
          className="order-1 h-9 shrink-0 rounded-sm px-2 text-[13px] font-medium text-sheet-muted hover:bg-sheet-panel hover:text-sheet-ink lg:hidden"
          aria-expanded={inspectorOpen}
          aria-label={t.inspectorLabel}
          title={t.inspectorLabel}
        >
          <SlidersIcon size={14} aria-hidden="true" />
          <span className="hidden sm:inline">{t.inspectorLabel}</span>
        </Button>
      )}

      {showViews && (
        <Tabs
          value={view}
          onValueChange={(v) => onViewChange(v as View)}
          className="order-2 min-w-0"
        >
          <TabsList className="h-9 w-auto min-w-0 gap-0 rounded-none bg-sheet-panel p-1">
            <TabsTrigger
              value="side"
              className="h-full min-w-0 rounded-none px-3 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
            >
              {t.sideProfile}
            </TabsTrigger>
            <TabsTrigger
              value="top"
              className="h-full min-w-0 rounded-none px-3 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
            >
              {t.topDown}
            </TabsTrigger>
            <TabsTrigger
              value="front"
              className="h-full min-w-0 rounded-none px-3 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
            >
              {t.frontView}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="order-3 ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <ResetButton lang={lang} onReset={onReset} />
        <CopyOrderButton lang={lang} order={order} />
      </div>
    </header>
  );
}
