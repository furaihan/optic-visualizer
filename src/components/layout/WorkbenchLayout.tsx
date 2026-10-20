import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Language, View } from '../../types/search-params';
import type { ValidationError } from '../../lib/optic-engine/validation';
import { HeaderBar } from './HeaderBar';
import { ValidationAlerts } from './ValidationAlerts';
import { AppFooter, type FooterFigures } from './AppFooter';
import { InspectorDrawer } from './InspectorDrawer';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { translations } from '../../lib/translations';
import { useFreeHeight } from '../../hooks/useFreeHeight';
import { useElementSize } from '../../hooks/useElementWidth';

type WorkbenchLayoutProps = {
  lang: Language;
  view: View;
  onViewChange: (view: View) => void;
  /** The title row: a noun, and the finding under it. */
  title: string;
  finding: ReactNode;
  /** The lab order. */
  ticket: ReactNode;
  /** The drawing. */
  board: ReactNode;
  /** The measurement table and the recommendation, at the two detail levels. */
  simple: ReactNode;
  advanced: ReactNode;
  /** The inspector: a column on a wide desk, a drawer on a narrow one. */
  inspector: ReactNode;
  /** The order the copy button puts on the clipboard. */
  order: string[];
  onReset: () => void;
  errors: ValidationError[];
  figures: FooterFigures;
};

/**
 * The desk.
 *
 * One frame for both workbenches, so the spherical sheet and the aspheric
 * sheet are the same document with a different drawing in it. The order is the
 * order a lab reads: the title and its finding, the order, the drawing with
 * its schedule, then the table.
 *
 * The drawing takes the height the rest of the frame leaves, so the sheet and
 * its schedule always land inside the first screen. The height is measured
 * rather than guessed: the title and the order change height when they wrap,
 * and a guess would drift off the fold.
 */
export function WorkbenchLayout({
  lang,
  view,
  onViewChange,
  title,
  finding,
  ticket,
  board,
  simple,
  advanced,
  inspector,
  order,
  onReset,
  errors,
  figures,
}: WorkbenchLayoutProps) {
  const t = translations[lang];
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columnRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const { ref: contentRef, width: contentWidth } = useElementSize<HTMLDivElement>();

  // A canvas this narrow cannot hold the order and the drawing at once: the
  // order would wrap into a tower and take the drawing's height with it. So
  // the order moves under the drawing, where it is read after the sheet.
  const narrow = contentWidth > 0 && contentWidth < 560;

  const boardHeight = useFreeHeight(
    columnRef,
    [headerRef, alertsRef, chromeRef, footerRef],
    360
  );

  // The drawer belongs to a narrow desk. A wide one has the inspector as a
  // column already, and a phone has its own composition.
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const sync = (e: MediaQueryList | MediaQueryListEvent) => {
      if (e.matches) setDrawerOpen(false);
    };
    sync(media);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden bg-sheet-ground">
      {/* The inspector as a column: a wide desk only. */}
      <div className="hidden shrink-0 bg-sheet-ground lg:block">
        <div className="h-full">{inspector}</div>
      </div>

      <div
        ref={columnRef}
        className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden"
      >
        <div ref={headerRef} className="shrink-0">
          <HeaderBar
            lang={lang}
            view={view}
            activeTab="visualizer"
            onViewChange={onViewChange}
            onReset={onReset}
            order={order}
            onToggleInspector={() => setDrawerOpen((open) => !open)}
            inspectorOpen={drawerOpen}
          />
        </div>

        <div ref={alertsRef} className="shrink-0">
          <ValidationAlerts lang={lang} errors={errors} />
        </div>

        <div className="relative min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div
              ref={contentRef}
              className={`@container flex flex-col px-3 pb-10 transition-[padding] duration-200 sm:px-4 ${
                drawerOpen ? 'md:pl-[336px] lg:pl-0' : ''
              }`}
            >
              {/* The title and the order. Their height is measured above. */}
              <div ref={chromeRef} className="flex flex-col gap-8 pb-6 pt-4">
                <div className="flex flex-col gap-1.5 lg:max-w-[72ch]">
                  <h1 className="sheet-rise text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-sheet-ink">
                    {title}
                  </h1>
                  <div className="sheet-rise delay-1 text-[16px] leading-relaxed text-sheet-ink">
                    {finding}
                  </div>
                </div>

                {!narrow && ticket}
              </div>

              <div style={{ height: boardHeight }}>{board}</div>

              {narrow && <div className="mt-8">{ticket}</div>}

              <Tabs
                value={mode}
                onValueChange={(v) => setMode(v as 'simple' | 'advanced')}
                className="mt-8"
              >
                <TabsList className="h-9 gap-0 rounded-none bg-sheet-panel p-1">
                  <TabsTrigger
                    value="simple"
                    className="h-full rounded-none px-3 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
                  >
                    {t.tabImage}
                  </TabsTrigger>
                  <TabsTrigger
                    value="advanced"
                    className="h-full rounded-none px-3 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none"
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
          </ScrollArea>

          <InspectorDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            label={t.inspectorLabel}
          >
            {inspector}
          </InspectorDrawer>
        </div>

        <div ref={footerRef} className="shrink-0">
          <AppFooter lang={lang} figures={figures} />
        </div>
      </div>
    </div>
  );
}
