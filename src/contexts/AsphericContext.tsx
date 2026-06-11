import React, { createContext, useContext } from 'react';
import { useAsphericState as useAsphericStateHook } from '../hooks/useAsphericState';

type AsphericState = ReturnType<typeof useAsphericStateHook>;

const AsphericContext = createContext<AsphericState | null>(null);

export const AsphericProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const state = useAsphericStateHook();
  return <AsphericContext.Provider value={state}>{children}</AsphericContext.Provider>;
};

export const useAsphericContext = () => {
  const context = useContext(AsphericContext);
  if (!context) {
    throw new Error('useAsphericContext must be used within an AsphericProvider');
  }
  return context;
};
