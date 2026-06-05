import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import App from '../App';
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
  component: App,
});
