import { useEffect } from "react";
import { HeaderBar } from "@components/layout/HeaderBar";
import { MobileTabManager } from "@components/layout/MobileTabManager";
import { ValidationAlerts } from "@components/layout/ValidationAlerts";
import { DesktopGrid } from "@components/layout/DesktopGrid";
import { MobileViews } from "@components/layout/MobileViews";
import { AppFooter } from "@components/layout/AppFooter";
import { useSearch, useNavigate } from '@tanstack/react-router';
import type { SimulatorSearchParams } from '@/src/routes/index';

export default function VisualizerPage() {
  const search = useSearch({ strict: false }) as SimulatorSearchParams;
  const navigate = useNavigate({ from: '/visualizer' });

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches && search.activeTab !== "visualizer") {
        navigate({ search: (prev) => ({ ...prev, activeTab: "visualizer" }) });
      }
    };
    handleResize(mql);
    mql.addEventListener("change", handleResize);
    return () => mql.removeEventListener("change", handleResize);
  }, [navigate, search.activeTab]);

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Desktop Layout -> delegated to DesktopGrid which contains Sidebar + Scrollable Content */}
      <div className="hidden md:flex flex-1 h-full overflow-hidden">
        <DesktopGrid Header={<HeaderBar />} Footer={<AppFooter />} Alerts={<ValidationAlerts />} />
      </div>

      {/* Mobile Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative md:hidden">
        <HeaderBar />
        <ValidationAlerts />
        <div className="flex-1 overflow-hidden p-3 flex flex-col gap-3">
          <MobileTabManager />
          <MobileViews />
        </div>
        <AppFooter />
      </div>
    </div>
  );
}
