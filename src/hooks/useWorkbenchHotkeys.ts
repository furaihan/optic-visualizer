import { useAppHotkeys, useHotkeys } from '@tanstack/react-hotkeys';
import type { View } from '../types/search-params';

type WorkbenchHotkeysOptions = {
  onViewChange: (view: View) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

/**
 * The keys the workbench shares between its desk and its phone: undo, redo
 * and the three drawings. They run the same handlers the buttons do.
 */
export function useWorkbenchHotkeys({
  onViewChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: WorkbenchHotkeysOptions) {
  const appHotkeys = useAppHotkeys();

  useHotkeys([
    {
      hotkey: appHotkeys['doc.undo'],
      callback: () => onUndo?.(),
      options: { enabled: canUndo && onUndo !== undefined },
    },
    {
      hotkey: appHotkeys['doc.redo'],
      callback: () => onRedo?.(),
      options: { enabled: canRedo && onRedo !== undefined },
    },
    { hotkey: appHotkeys['view.side'], callback: () => onViewChange('side') },
    { hotkey: appHotkeys['view.top'], callback: () => onViewChange('top') },
    { hotkey: appHotkeys['view.front'], callback: () => onViewChange('front') },
  ]);
}
