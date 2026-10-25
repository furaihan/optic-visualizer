import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HotkeysProvider } from '@tanstack/react-hotkeys';
import { appHotkeys } from './lib/hotkeys/app-hotkeys';
import { loadCustomHotkeys, saveCustomHotkeys } from './lib/hotkeys/custom-hotkeys';
import { RouterProvider } from '@tanstack/react-router';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ThemeProvider } from './hooks/useTheme';
import { OpticalProvider } from './contexts/OpticalContext';
import { AsphericProvider } from './contexts/AsphericContext';
import { router } from './routes/router';
import './index.css';

const savedHotkeys = loadCustomHotkeys();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <OpticalProvider>
          <AsphericProvider>
            <HotkeysProvider
              appHotkeys={appHotkeys}
              customHotkeys={savedHotkeys}
              onCustomHotkeysChange={saveCustomHotkeys}
            >
              <RouterProvider router={router} />
            </HotkeysProvider>
          </AsphericProvider>
        </OpticalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
