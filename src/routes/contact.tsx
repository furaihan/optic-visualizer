import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import { ContactPage } from '../ContactPage';

export const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});
