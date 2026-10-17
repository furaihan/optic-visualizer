import { createRootRoute } from '@tanstack/react-router';
import { RootLayout } from '../components/RootLayout';
import { validateLang } from '../types/search-params';

type GlobalSearchParams = { lang: 'id' | 'en' };

export const rootRoute = createRootRoute({
  validateSearch: (search: Record<string, unknown>): GlobalSearchParams => ({
    lang: validateLang(search.lang),
  }),
  component: RootLayout,
  notFoundComponent: () => (
    <div className="flex h-full items-center justify-center p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-[24px] font-medium text-sheet-ink">404</h1>
        <p className="text-[16px] text-sheet-muted">Page not found</p>
      </div>
    </div>
  ),
});
