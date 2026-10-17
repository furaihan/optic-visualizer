import { useOpticalContext } from '../../contexts/OpticalContext';
import { translations } from '../../lib/translations';
import type { Language } from '../../types/search-params';
import { OPTICAL_ENGINE_VERSION } from '../../lib/optic-engine/optical';

/**
 * The status band under the sheet: the three numbers that follow the optician
 * from the order to the lab, and the engine that produced them. Read at 13px,
 * not at 7px.
 *
 * On a phone the band wraps to two rows rather than clipping: the numbers are
 * the point, so they never truncate. The engine version is the first thing to
 * go when there is no room.
 */
export function AppFooter({ lang }: { lang: Language }) {
  const t = translations[lang];
  const { frame, result } = useOpticalContext();

  return (
    <footer className="flex min-h-9 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-sheet-ground px-3 py-1.5 text-[13px] text-sheet-muted sm:py-0">
      <dl className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 tnum">
        <div className="flex shrink-0 items-baseline gap-1.5">
          <dt className="whitespace-nowrap">{t.framePd}</dt>
          <dd className="font-medium text-sheet-ink">{(frame.a + frame.dbl).toFixed(0)} mm</dd>
        </div>
        <div className="flex shrink-0 items-baseline gap-1.5">
          <dt className="whitespace-nowrap">{t.decentration}</dt>
          <dd className="font-medium text-sheet-ink">{result.decentration.toFixed(2)} mm</dd>
        </div>
        <div className="flex shrink-0 items-baseline gap-1.5">
          <dt className="whitespace-nowrap">{t.minBlank}</dt>
          <dd className="font-medium text-sheet-ink">{(result.y * 2 + 2).toFixed(0)} mm</dd>
        </div>
      </dl>
      <p className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-0.5">
        <span className="hidden tnum sm:inline">
          {t.engine} {OPTICAL_ENGINE_VERSION}
        </span>
        <span className="whitespace-nowrap">© 2026 {t.labs}</span>
      </p>
    </footer>
  );
}
