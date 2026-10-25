import type { CustomHotkeys } from '@tanstack/react-hotkeys';
import type { appHotkeys } from './app-hotkeys';

const STORAGE_KEY = 'hotkeys';

export function loadCustomHotkeys(): CustomHotkeys<typeof appHotkeys> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveCustomHotkeys(custom: CustomHotkeys<typeof appHotkeys>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  } catch {}
}
