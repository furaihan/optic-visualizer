import React, { createContext, useContext } from 'react';
import { useOpticalState as useOpticalStateHook } from '../hooks/useOpticalState';

type OpticalState = ReturnType<typeof useOpticalStateHook>;

const OpticalContext = createContext<OpticalState | null>(null);

export const OpticalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const state = useOpticalStateHook();
  return <OpticalContext.Provider value={state}>{children}</OpticalContext.Provider>;
};

export const useOpticalContext = () => {
  const context = useContext(OpticalContext);
  if (!context) {
    throw new Error('useOpticalContext must be used within an OpticalProvider');
  }
  return context;
};
