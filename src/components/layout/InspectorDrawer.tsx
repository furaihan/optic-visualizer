import { useEffect, type ReactNode } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '../ui/button';

type InspectorDrawerProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
};

/**
 * The inspector as a drawer.
 *
 * On a tablet the inspector is too wide to sit beside the sheet and too
 * useful to hide, so it slides in over the sheet's left edge and pushes the
 * sheet aside rather than covering it: the drawing stays visible while a value
 * is changed, which is the whole point of a workbench.
 *
 * Escape closes it, and the button that opened it says whether it is open.
 */
export function InspectorDrawer({ open, onClose, label, children }: InspectorDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <aside
      aria-label={label}
      aria-hidden={!open}
      inert={!open}
      className={`absolute inset-y-0 left-0 z-30 flex w-[320px] flex-col border-r border-sheet-stage bg-sheet-panel transition-transform duration-200 ease-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-sheet-stage px-4 py-2">
        <span className="text-[13px] font-medium text-sheet-ink">{label}</span>
        <Button
          variant="ghost"
          onClick={onClose}
          className="h-8 w-8 rounded-sm p-0 text-sheet-muted hover:bg-sheet-ground hover:text-sheet-ink"
          aria-label={label}
        >
          <XIcon size={15} aria-hidden="true" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </aside>
  );
}
