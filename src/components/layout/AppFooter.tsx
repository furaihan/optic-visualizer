import { useOpticalContext } from '../../contexts/OpticalContext';
import { translations } from '../../lib/translations';
import type { Language } from '../../types/search-params';
import { OPTICAL_ENGINE_VERSION } from '../../lib/optic-engine/optical';

/**
 * The status band under the sheet: the three numbers that follow the optician
 * from the order to the lab, and the engine that produced them. Read at 13px,
 * not at 7px.
 */
export function AppFooter({ lang }: { lang: Language }) {
  const t = translations[lang];
  const { frame, result } = useOpticalContext();

  return (
    <footer className="flex h-9 shrink-0 items-center justify-between gap-4 bg-sheet-ground px-3 text-[13px] text-sheet-muted sm:px-4">
      <dl className="flex min-w-0 items-center gap-4 overflow-hidden tnum">
        <div className="flex shrink-0 items-baseline gap-1.5">
          <dt className="whitespace-nowrap">{t.framePd}</dt>
          <dd className="font-medium text-sheet-ink">{(frame.a + frame.dbl).toFixed(0)} mm</dd>
        </div>
        <div className="flex shrink-0 items-baseline gap-1.5">
          <dt className="whitespace-nowrap">{t.decentration}</dt>
          <dd className="font-medium text-sheet-ink">{result.decentration.toFixed(2)} mm</dd>
        </div>
        <div className="hidden shrink-0 items-baseline gap-1.5 sm:flex">
          <dt className="whitespace-nowrap">{t.minBlank}</dt>
          <dd className="font-medium text-sheet-ink">{(result.y * 2 + 2).toFixed(0)} mm</dd>
        </div>
      </dl>
      <p className="flex shrink-0 items-center gap-3">
        <span className="hidden tnum sm:inline">
          {t.engine} {OPTICAL_ENGINE_VERSION}
        </span>
        <span className="whitespace-nowrap">© 2026 {t.labs}</span>
      </p>
    </footer>
  );
}
