import { Dialog } from '@base-ui/react/dialog';
import {
  HotkeysProvider,
  formatForDisplay,
  useAppHotkeyList,
  useAppHotkeys,
  useHotkey,
} from '@tanstack/react-hotkeys';
import { translations } from '../lib/translations';
import type { Language } from '../types/search-params';

type HotkeysCheatSheetProps = {
  lang: Language;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * The keyboard shortcuts, as a dialog.
 *
 * It is an exclusive scope while open, so the page's keys pause and a key
 * pressed while reading the list does not run behind it. The key that opened
 * it, and Escape, close it.
 */
export function HotkeysCheatSheet({ lang, open, onOpenChange }: HotkeysCheatSheetProps) {
  return (
    <HotkeysProvider scope="cheat-sheet" exclusive enabled={open}>
      <CheatSheetBody lang={lang} open={open} onOpenChange={onOpenChange} />
    </HotkeysProvider>
  );
}

function CheatSheetBody({ lang, open, onOpenChange }: HotkeysCheatSheetProps) {
  const t = translations[lang];
  const items = useAppHotkeyList();
  const appHotkeys = useAppHotkeys();

  const close = () => onOpenChange(false);
  useHotkey('Escape', close, { enabled: open });
  useHotkey(appHotkeys['help.shortcuts'], close, { enabled: open });

  const groups = [...new Set(items.map((item) => item.appHotkey.meta?.group ?? ''))];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sheet-stage bg-sheet-panel p-5 text-sheet-ink shadow-lg">
          <Dialog.Title className="mb-4 text-[16px] font-medium">
            {t.shortcutsTitle}
          </Dialog.Title>
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <section key={group} className="flex flex-col gap-1.5">
                <h3 className="text-[12px] uppercase tracking-wide text-sheet-muted">{group}</h3>
                <ul className="flex flex-col gap-1">
                  {items
                    .filter((item) => (item.appHotkey.meta?.group ?? '') === group)
                    .map(({ appHotkey, status }) => (
                      <li
                        key={appHotkey.id}
                        data-status={status}
                        className="flex items-center justify-between gap-4 text-[14px]"
                      >
                        <span>{appHotkey.meta?.name}</span>
                        <kbd className="rounded-sm bg-sheet-ground px-1.5 py-0.5 font-mono text-[12px]">
                          {appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : t.shortcutUnbound}
                        </kbd>
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
