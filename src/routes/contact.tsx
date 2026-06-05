import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import { ContactPage } from '../ContactPage';
import { type GlobalSearchParams } from './index';

export const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  validateSearch: (search: Record<string, unknown>): GlobalSearchParams => ({
    lang: ['id', 'en'].includes(search.lang as string)
      ? (search.lang as GlobalSearchParams['lang'])
      : 'id',
  }),
  component: ContactPage,
});
