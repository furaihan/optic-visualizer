import { useRef, useState, type ReactNode } from 'react';
import type { ActiveTab, Language } from '../../types/search-params';
import type { ValidationError } from '../../lib/optic-engine/validation';
import { ValidationAlerts } from './ValidationAlerts';
import { AppFooter, type FooterFigures } from './AppFooter';
import { MobileTabManager } from './MobileTabManager';
import { CopyOrderButton } from './CopyOrderButton';
import { SessionControls } from './ResetButton';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { translations } from '../../lib/translations';
import { useFreeHeight } from '../../hooks/useFreeHeight';

type MobileWorkbenchProps = {
  lang: Language;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  /** The title row: a noun, and the finding under it. */
  title: string;
  finding: ReactNode;
  /** The drawing. */
  board: ReactNode;
  /** The lab order. */
  ticket: ReactNode;
  /** The measurement table and the recommendation, at the two detail levels. */
  simple: ReactNode;
  advanced: ReactNode;
  /** The inspector. */
  parameters: ReactNode;
  order: string[];
  onReset: () => void;
  /** The session's history: take a change back, or put it forward again. */
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  errors: ValidationError[];
  figures: FooterFigures;
};

/**
 * The phone, which is its own document rather than the desk squeezed.
 *
 * Three places on one bar: the drawing full-bleed with its own schedule, the
 * order under it, and the table on the second tab. The drawing takes the
 * height the rest of the screen leaves, so it is never a sliver.
 */
export function MobileWorkbench({
  lang,
  activeTab,
  onTabChange,
  title,
  finding,
  board,
  ticket,
  simple,
  advanced,
  parameters,
  order,
  onReset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  errors,
  figures,
}: MobileWorkbenchProps) {
  const t = translations[lang];
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // The drawing takes the height the scroll area has left after the title.
  const boardHeight = useFreeHeight(scrollRef, [titleRef], 320, [activeTab], 24);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-sheet-ground">
      <div className="shrink-0">
        <ValidationAlerts lang={lang} errors={errors} />
      </div>

      <div
        ref={contentRef}
        className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4"
      >
        <div ref={tabsRef} className="shrink-0">
          <MobileTabManager
            lang={lang}
            activeTab={activeTab}
            onTabChange={onTabChange}
          >
            <SessionControls
              lang={lang}
              onReset={onReset}
              onUndo={onUndo}
              onRedo={onRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
            <CopyOrderButton lang={lang} order={order} />
          </MobileTabManager>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1">
          <ScrollArea className="h-full">
          {activeTab === 'visualizer' && (
            <div className="sheet-fade flex flex-col gap-4 pb-8">
              <div ref={titleRef} className="flex flex-col gap-1.5">
                <h1 className="text-[22px] font-medium leading-[1.2] tracking-[-0.02em] text-sheet-ink">
                  {title}
                </h1>
                <p className="text-[15px] leading-relaxed text-sheet-ink">{finding}</p>
              </div>

              <div style={{ height: boardHeight }}>{board}</div>

              {ticket}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="sheet-fade flex flex-col gap-6 pb-8">
              <Tabs
                value={mode}
                onValueChange={(v) => setMode(v as 'simple' | 'advanced')}
              >
                <TabsList className="grid h-9 w-full grid-cols-2 gap-0 rounded-none bg-sheet-panel p-1">
                  <TabsTrigger
                    value="simple"
                    className="h-full rounded-none text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
                  >
                    {t.tabImage}
                  </TabsTrigger>
                  <TabsTrigger
                    value="advanced"
                    className="h-full rounded-none text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
                  >
                    {t.tabStatistics}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="simple" className="mt-6 flex flex-col gap-8 focus-visible:outline-none">
                  {simple}
                </TabsContent>
                <TabsContent value="advanced" className="mt-6 flex flex-col gap-8 focus-visible:outline-none">
                  {advanced}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === 'parameters' && (
            <div className="sheet-fade pb-8">{parameters}</div>
          )}
          </ScrollArea>
        </div>
      </div>

      <div className="shrink-0">
        <AppFooter lang={lang} figures={figures} />
      </div>
    </div>
  );
}
