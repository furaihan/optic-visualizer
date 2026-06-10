import { createRoute, redirect, Outlet } from '@tanstack/react-router';
import { rootRoute } from './root';
import VisualizerPage from '../pages/VisualizerPage';
import { type SimulatorSearchParams } from './index';

export const visualizerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/visualizer',
  validateSearch: (search: Record<string, unknown>): SimulatorSearchParams => ({
    activeTab: ['visualizer', 'summary', 'parameters'].includes(search.activeTab as string) 
      ? (search.activeTab as SimulatorSearchParams['activeTab']) 
      : 'visualizer',
    view: ['side', 'top', 'front'].includes(search.view as string)
      ? (search.view as SimulatorSearchParams['view'])
      : 'side',
    lang: ['id', 'en'].includes(search.lang as string)
      ? (search.lang as SimulatorSearchParams['lang'])
      : 'id',
  }),
  component: VisualizerPage,
});

export const visualizerIndexRoute = createRoute({
  getParentRoute: () => visualizerRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/visualizer/simple', search: (prev: any) => prev });
  }
});

export const visualizerSimpleRoute = createRoute({
  getParentRoute: () => visualizerRoute,
  path: '/simple',
});

export const visualizerAdvancedRoute = createRoute({
  getParentRoute: () => visualizerRoute,
  path: '/advanced',
});

