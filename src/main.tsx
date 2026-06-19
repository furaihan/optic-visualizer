import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ThemeProvider } from './hooks/useTheme';
import { OpticalProvider } from './contexts/OpticalContext';
import { AsphericProvider } from './contexts/AsphericContext';
import { router } from './routes/router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <OpticalProvider>
          <AsphericProvider>
            <RouterProvider router={router} />
          </AsphericProvider>
        </OpticalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
