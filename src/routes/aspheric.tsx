import { createRoute } from '@tanstack/react-router';
import { simulatorLayoutRoute } from './simulator-layout';
import { AsphericPage } from '../pages/AsphericPage';

export const asphericRoute = createRoute({
  getParentRoute: () => simulatorLayoutRoute,
  path: '/aspheric',
  component: AsphericPage,
  errorComponent: ({ error }) => (
    <div className="flex h-full items-center justify-center p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-[18px] font-medium text-sheet-error">Something went wrong</h1>
        <p className="text-[16px] text-sheet-muted">{error instanceof Error ? error.message : String(error)}</p>
      </div>
    </div>
  ),
});
