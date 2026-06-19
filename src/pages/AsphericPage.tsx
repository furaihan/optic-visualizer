import { useSearch, useNavigate } from '@tanstack/react-router';
import type { SimulatorSearchParams } from '../types/search-params';
import { AsphericDesktopGrid } from "../components/AsphericDesktopGrid";
import { MobileViews } from "@components/layout/MobileViews";
import { SimulatorShell } from "@components/layout/SimulatorShell";
import { useResponsiveViewport } from "../hooks/useResponsiveViewport";

export function AsphericPage() {
  const search = useSearch({ strict: false }) as unknown as SimulatorSearchParams;
  const navigate = useNavigate();
  useResponsiveViewport(search.activeTab, navigate);

  return (
    <SimulatorShell
      lang={search.lang}
      view={search.view}
      activeTab={search.activeTab}
      onViewChange={(view) => navigate({ search: { ...search, view } } as any)}
      onTabChange={(tab) => navigate({ search: { ...search, activeTab: tab } } as any)}
      grid={<AsphericDesktopGrid />}
      mobileExtra={<MobileViews />}
    />
  );
}
