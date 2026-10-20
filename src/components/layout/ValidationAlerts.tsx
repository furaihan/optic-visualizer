import { translations } from '../../lib/translations';
import type { Language } from '../../types/search-params';
import type { ValidationError } from '../../lib/optic-engine/validation';

/**
 * Validation, stated in one band above the work: what is wrong, in sentences.
 * No alert card, no icon, no amber wash. The band only exists when there is
 * something to say.
 *
 * The errors come from the page, not from a global state, so the aspheric
 * sheet reports the aspheric inputs.
 */
export function ValidationAlerts({
  lang,
  errors,
}: {
  lang: Language;
  errors: ValidationError[];
}) {
  const t = translations[lang];

  if (errors.length === 0) return null;

  return (
    <section
      aria-live="polite"
      className="sheet-fade shrink-0 bg-sheet-alert px-3 py-2 sm:px-4"
    >
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-medium text-sheet-ink">{t.clinicalVerification}</p>
        <ul className="flex flex-col gap-1">
          {errors.map((err, i) => (
            <li
              key={i}
              className="flex gap-2 text-[13px] leading-snug text-sheet-ink sm:text-[16px]"
            >
              <span
                aria-hidden="true"
                className="mt-[7px] block h-1.5 w-1.5 shrink-0 rounded-full bg-sheet-warning"
              />
              {lang === 'id' ? err.messageId : err.messageEn}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
