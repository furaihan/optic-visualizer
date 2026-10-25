import { describe, it, expect } from 'vitest';
import { appHotkeys } from './app-hotkeys';

const bindings = Object.values(appHotkeys).map((declaration) => declaration.hotkey);

describe('app hotkeys', () => {
  it('gives every binding a distinct key', () => {
    expect(new Set(bindings).size).toBe(bindings.length);
  });

  it('names every binding for the cheat sheet', () => {
    for (const declaration of Object.values(appHotkeys)) {
      expect(declaration.meta?.name).toBeTruthy();
      expect(declaration.meta?.group).toBeTruthy();
    }
  });
});
