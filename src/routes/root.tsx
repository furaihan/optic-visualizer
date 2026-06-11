import { createRootRoute } from '@tanstack/react-router';
import { OpticalProvider } from '../contexts/OpticalContext';
import { AsphericProvider } from '../contexts/AsphericContext';
import { RootLayout } from '../components/RootLayout';

type GlobalSearchParams = { lang?: 'id' | 'en' };

export const rootRoute = createRootRoute({
  validateSearch: (search: Record<string, unknown>): GlobalSearchParams => ({
    lang: ['id', 'en'].includes(search.lang as string)
      ? (search.lang as GlobalSearchParams['lang'])
      : 'id',
  }),
  component: () => (
    <OpticalProvider>
      <AsphericProvider>
        <RootLayout />
      </AsphericProvider>
    </OpticalProvider>
  ),
});
