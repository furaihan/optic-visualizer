import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './root';
import { indexRoute } from './index';
import { contactRoute } from './contact';
import { visualizerRoute } from './visualizer';

const routeTree = rootRoute.addChildren([indexRoute, visualizerRoute, contactRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
