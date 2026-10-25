import { defineAppHotkeys } from '@tanstack/react-hotkeys';

export const appHotkeys = defineAppHotkeys({
  'doc.undo': {
    hotkey: 'Mod+Z',
    meta: { name: 'Undo', group: 'Edit' },
    options: { ignoreInputs: true },
  },
  'doc.redo': {
    hotkey: 'Mod+Shift+Z',
    meta: { name: 'Redo', group: 'Edit' },
    options: { ignoreInputs: true },
  },
  'view.side': { hotkey: 'Alt+1', meta: { name: 'Side profile', group: 'View' } },
  'view.top': { hotkey: 'Alt+2', meta: { name: 'Top view', group: 'View' } },
  'view.front': { hotkey: 'Alt+3', meta: { name: 'Front view', group: 'View' } },
  'panel.inspector': { hotkey: 'Backspace', meta: { name: 'Toggle inspector', group: 'View' } },
  'theme.toggle': { hotkey: 'Mod+\\', meta: { name: 'Toggle theme', group: 'View' } },
  'nav.home': { hotkey: 'Shift+H', meta: { name: 'Home', group: 'Navigate' } },
  'nav.lenses': { hotkey: 'Shift+L', meta: { name: 'Lenses', group: 'Navigate' } },
  'nav.aspheric': { hotkey: 'Shift+A', meta: { name: 'Aspheric', group: 'Navigate' } },
  'nav.contact': { hotkey: 'Shift+C', meta: { name: 'Contact', group: 'Navigate' } },
  'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts', group: 'Help' } },
});

declare module '@tanstack/react-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys;
  }
}
