import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './root';
import { indexRoute } from './index';
import { contactRoute } from './contact';
import { visualizerRoute, visualizerIndexRoute, visualizerSimpleRoute, visualizerAdvancedRoute } from './visualizer';

const visualizerWithChildren = visualizerRoute.addChildren([
  visualizerIndexRoute,
  visualizerSimpleRoute,
  visualizerAdvancedRoute
]);

const routeTree = rootRoute.addChildren([indexRoute, visualizerWithChildren, contactRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
