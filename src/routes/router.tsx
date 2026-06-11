import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './root';
import { indexRoute } from './index';
import { contactRoute } from './contact';
import { visualizerRoute, visualizerIndexRoute, visualizerSimpleRoute, visualizerAdvancedRoute } from './visualizer';
import { asphericRoute, asphericIndexRoute, asphericSimpleRoute, asphericAdvancedRoute } from './aspheric';

const visualizerWithChildren = visualizerRoute.addChildren([
  visualizerIndexRoute,
  visualizerSimpleRoute,
  visualizerAdvancedRoute
]);

const asphericWithChildren = asphericRoute.addChildren([
  asphericIndexRoute,
  asphericSimpleRoute,
  asphericAdvancedRoute
]);

const routeTree = rootRoute.addChildren([indexRoute, visualizerWithChildren, asphericWithChildren, contactRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
