import { createRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { simulatorLayoutRoute } from './simulator-layout';

/**
 * The 3D surface is loaded only when the route is opened.
 *
 * three.js and the renderer are around a megabyte before a single lens is
 * drawn, and every other route on the tool would pay for them: the landing
 * page, the sheet, the aspheric designer. Splitting the surface here is what
 * keeps the 3D a screen you open rather than a weight the whole tool carries —
 * and it is also what makes the capability gate cheap, because a device that
 * cannot draw the body never downloads the code that draws it.
 */
const ThreePage = lazy(() => import('../pages/ThreePage'));

export const threeRoute = createRoute({
  getParentRoute: () => simulatorLayoutRoute,
  path: '/three',
  component: ThreeRoute,
  errorComponent: ({ error }) => (
    <div className="flex h-full items-center justify-center p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-[18px] font-medium text-sheet-error">Something went wrong</h1>
        <p className="text-[16px] text-sheet-muted">
          {error instanceof Error ? error.message : String(error)}
        </p>
      </div>
    </div>
  ),
});

function ThreeRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center bg-sheet-ground">
          <p className="text-[14px] text-sheet-muted">Building the lens body</p>
        </div>
      }
    >
      <ThreePage />
    </Suspense>
  );
}
