import { useSearch, useNavigate } from '@tanstack/react-router';
import type { SimulatorSearchParams } from '../types/search-params';
import { DesktopGrid } from "@components/layout/DesktopGrid";
import { MobileViews } from "@components/layout/MobileViews";
import { SimulatorShell } from "@components/layout/SimulatorShell";
import { useResponsiveViewport } from "../hooks/useResponsiveViewport";

export default function VisualizerPage() {
  const search = useSearch({ strict: false }) as unknown as SimulatorSearchParams;
  const navigate = useNavigate();
  useResponsiveViewport(search.activeTab, navigate);

  return (
    <SimulatorShell
      desk={<DesktopGrid />}
      phone={<MobileViews />}
    />
  );
}
