import { createRoute } from '@tanstack/react-router';
import { simulatorLayoutRoute } from './simulator-layout';
import { AsphericPage } from '../pages/AsphericPage';

export const asphericRoute = createRoute({
  getParentRoute: () => simulatorLayoutRoute,
  path: '/aspheric',
  component: AsphericPage,
  errorComponent: ({ error }) => (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center space-y-2">
        <h1 className="text-lg font-bold text-red-500">Something went wrong</h1>
        <p className="text-sm text-slate-400">{error.message}</p>
      </div>
    </div>
  ),
});
