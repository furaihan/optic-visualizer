import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

export type SimulatorSearchParams = {
  activeTab?: 'visualizer' | 'summary' | 'parameters';
  view?: 'side' | 'top' | 'front';
  lang?: 'id' | 'en';
};

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
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

const routeTree = rootRoute.addChildren([indexRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);
