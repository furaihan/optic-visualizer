import { useEffect } from 'react';
import type { NavigateOptions } from '@tanstack/react-router';

export function useResponsiveViewport(activeTab: string, navigate: (opts: NavigateOptions) => void) {
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && activeTab !== 'visualizer') {
        navigate({ search: { activeTab: 'visualizer' } as any });
      }
    };
    handleResize(mql);
    mql.addEventListener('change', handleResize);
    return () => mql.removeEventListener('change', handleResize);
  }, [navigate, activeTab]);
}
