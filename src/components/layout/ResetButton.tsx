import { RotateCcwIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { translations } from '../../lib/translations';
import type { Language } from '../../types/search-params';

/** The session's reset: back to the numbers the sheet starts from. */
export function ResetButton({
  lang,
  onReset,
  className,
}: {
  lang: Language;
  onReset: () => void;
  className?: string;
}) {
  const t = translations[lang];

  return (
    <Button
      variant="ghost"
      onClick={onReset}
      className={
        className ??
        'h-9 rounded-sm px-2 text-[13px] font-medium text-sheet-muted hover:bg-sheet-panel hover:text-sheet-ink sm:px-2.5'
      }
      title={t.resetTitle}
      aria-label={t.resetSession}
    >
      <RotateCcwIcon size={14} aria-hidden="true" />
      <span className="hidden sm:inline">{t.reset}</span>
    </Button>
  );
}
