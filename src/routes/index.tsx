import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import { HomePage } from '../pages/HomePage';

export type GlobalSearchParams = { lang?: 'id' | 'en' };

export type SimulatorSearchParams = GlobalSearchParams & {
  activeTab?: 'visualizer' | 'summary' | 'parameters';
  view?: 'side' | 'top' | 'front';
};

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>): GlobalSearchParams => ({
    lang: ['id', 'en'].includes(search.lang as string)
      ? (search.lang as GlobalSearchParams['lang'])
      : 'id',
  }),
  component: HomePage,
});
