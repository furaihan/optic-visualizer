import { createRoute } from '@tanstack/react-router';
import { simulatorLayoutRoute } from './simulator-layout';
import VisualizerPage from '../pages/VisualizerPage';

export const visualizerRoute = createRoute({
  getParentRoute: () => simulatorLayoutRoute,
  path: '/visualizer',
  component: VisualizerPage,
  errorComponent: ({ error }) => (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center space-y-2">
        <h1 className="text-lg font-bold text-red-500">Something went wrong</h1>
        <p className="text-sm text-slate-400">{error.message}</p>
      </div>
    </div>
  ),
});

