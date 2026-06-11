import { createRoute, redirect } from '@tanstack/react-router';
import { rootRoute } from './root';
import { AsphericPage } from '../pages/AsphericPage';

type AsphericSearchParams = {
  activeTab?: 'visualizer' | 'summary' | 'parameters';
  view?: 'side' | 'top' | 'front';
  lang?: 'id' | 'en';
};

export const asphericRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aspheric',
  validateSearch: (search: Record<string, unknown>): AsphericSearchParams => ({
    activeTab: ['visualizer', 'summary', 'parameters'].includes(search.activeTab as string)
      ? (search.activeTab as AsphericSearchParams['activeTab'])
      : 'visualizer',
    view: ['side', 'top', 'front'].includes(search.view as string)
      ? (search.view as AsphericSearchParams['view'])
      : 'side',
    lang: ['id', 'en'].includes(search.lang as string)
      ? (search.lang as AsphericSearchParams['lang'])
      : 'id',
  }),
  component: AsphericPage,
});

export const asphericIndexRoute = createRoute({
  getParentRoute: () => asphericRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/aspheric/simple', search: (prev: any) => prev });
  },
});

export const asphericSimpleRoute = createRoute({
  getParentRoute: () => asphericRoute,
  path: '/simple',
});

export const asphericAdvancedRoute = createRoute({
  getParentRoute: () => asphericRoute,
  path: '/advanced',
});
