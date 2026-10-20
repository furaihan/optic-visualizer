import { useSearch, useNavigate } from '@tanstack/react-router';
import type { SimulatorSearchParams } from '../types/search-params';
import { AsphericDesktopGrid } from "../components/AsphericDesktopGrid";
import { AsphericMobileViews } from "@components/layout/AsphericMobileViews";
import { SimulatorShell } from "@components/layout/SimulatorShell";
import { useResponsiveViewport } from "../hooks/useResponsiveViewport";

export function AsphericPage() {
  const search = useSearch({ strict: false }) as unknown as SimulatorSearchParams;
  const navigate = useNavigate();
  useResponsiveViewport(search.activeTab, navigate);

  return (
    <SimulatorShell
      desk={<AsphericDesktopGrid />}
      phone={<AsphericMobileViews />}
    />
  );
}
