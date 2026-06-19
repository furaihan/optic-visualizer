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
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-600 dark:text-slate-400">404</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">Page not found</p>
      </div>
    </div>
  ),
});
