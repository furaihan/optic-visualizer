import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './root';
import { indexRoute } from './index';
import { contactRoute } from './contact';
import { simulatorLayoutRoute } from './simulator-layout';
import { visualizerRoute } from './visualizer';
import { asphericRoute } from './aspheric';

const simulatorWithChildren = simulatorLayoutRoute.addChildren([
  visualizerRoute,
  asphericRoute,
]);

const routeTree = rootRoute.addChildren([indexRoute, simulatorWithChildren, contactRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
