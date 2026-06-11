import { useEffect } from "react";
import { HeaderBar } from "@components/layout/HeaderBar";
import { MobileTabManager } from "@components/layout/MobileTabManager";
import { ValidationAlerts } from "@components/layout/ValidationAlerts";
import { AsphericDesktopGrid } from "../components/AsphericDesktopGrid";
import { AppFooter } from "@components/layout/AppFooter";
import { useSearch, useNavigate } from '@tanstack/react-router';
import type { SimulatorSearchParams } from '@/src/routes/index';

export function AsphericPage() {
  const search = useSearch({ strict: false }) as SimulatorSearchParams;
  const navigate = useNavigate({ from: '/aspheric' });

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

  // Wrap children with aspheric-specific providers/context
  const content = (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="hidden md:flex flex-1 h-full overflow-hidden">
        <AsphericDesktopGrid Header={<HeaderBar />} Footer={<AppFooter />} Alerts={<ValidationAlerts />} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative md:hidden">
        <HeaderBar />
        <ValidationAlerts />
        <div className="flex-1 overflow-hidden p-3 flex flex-col gap-3">
          <MobileTabManager />
        </div>
        <AppFooter />
      </div>
    </div>
  );

  return content;
}
