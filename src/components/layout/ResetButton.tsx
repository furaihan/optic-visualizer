import { RotateCcwIcon, Undo2Icon, Redo2Icon } from 'lucide-react';
import { Button } from '../ui/button';
import { translations } from '../../lib/translations';
import type { Language } from '../../types/search-params';

/**
 * The session's history: take a change back, or put it forward again, and
 * the reset that puts the sheet back to the numbers it starts from.
 *
 * The undo and redo are the same actions the keyboard shortcuts carry, so
 * what the buttons do is what Ctrl+Z does.
 */
export function SessionControls({
  lang,
  onReset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  className,
}: {
  lang: Language;
  onReset: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}) {
  const t = translations[lang];
  const buttonClass =
    className ??
    'h-9 rounded-sm px-2 text-[13px] font-medium text-sheet-muted hover:bg-sheet-panel hover:text-sheet-ink sm:px-2.5';

  return (
    <div className="flex items-center gap-1">
      {onUndo && (
        <Button
          variant="ghost"
          onClick={onUndo}
          disabled={!canUndo}
          className={buttonClass}
          title={t.undoTitle}
          aria-label={t.undo}
        >
          <Undo2Icon size={14} aria-hidden="true" />
          <span className="hidden sm:inline">{t.undo}</span>
        </Button>
      )}
      {onRedo && (
        <Button
          variant="ghost"
          onClick={onRedo}
          disabled={!canRedo}
          className={buttonClass}
          title={t.redoTitle}
          aria-label={t.redo}
        >
          <Redo2Icon size={14} aria-hidden="true" />
          <span className="hidden sm:inline">{t.redo}</span>
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={onReset}
        className={buttonClass}
        title={t.resetTitle}
        aria-label={t.resetSession}
      >
        <RotateCcwIcon size={14} aria-hidden="true" />
        <span className="hidden sm:inline">{t.reset}</span>
      </Button>
    </div>
  );
}

/** The session's reset on its own, for the places that only offer that. */
export function ResetButton({
  lang,
  onReset,
  className,
}: {
  lang: Language;
  onReset: () => void;
  className?: string;
}) {
  return (
    <SessionControls
      lang={lang}
      onReset={onReset}
      className={className}
    />
  );
}
