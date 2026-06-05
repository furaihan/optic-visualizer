import { createRootRoute } from '@tanstack/react-router';
import { OpticalProvider } from '../contexts/OpticalContext';
import { RootLayout } from '../components/RootLayout';

export const rootRoute = createRootRoute({
  component: () => (
    <OpticalProvider>
      <RootLayout />
    </OpticalProvider>
  ),
});
