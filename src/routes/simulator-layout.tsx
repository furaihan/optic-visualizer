import { createRoute, Outlet, Link, useSearch } from '@tanstack/react-router';
import { rootRoute } from './root';
import { validateActiveTab, validateView } from '../types/search-params';
import { BrandRule } from '../components/BrandRule';

export const simulatorLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'simulator',
  validateSearch: (search: Record<string, unknown>) => ({
    activeTab: validateActiveTab(search.activeTab),
    view: validateView(search.view),
  }),
  component: SimulatorLayout,
});

const tabItems = [
  { to: '/visualizer', label: 'Lenses' },
  { to: '/aspheric', label: 'Aspheric' },
];

function SimulatorLayout() {
  const rootSearch = useSearch({ from: rootRoute.id });
  const search = useSearch({ from: simulatorLayoutRoute.id });

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex items-center gap-1 bg-sheet-panel px-4">
        {tabItems.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            search={{ lang: rootSearch.lang, activeTab: search.activeTab, view: search.view }}
            activeOptions={{ exact: true }}
            className="group"
            activeProps={{
              className: 'relative inline-flex items-center justify-center px-3 py-2 text-[13px] font-medium transition-colors text-sheet-ink',
            }}
            inactiveProps={{
              className: 'relative inline-flex items-center justify-center px-3 py-2 text-[13px] font-medium transition-colors text-sheet-muted hover:text-sheet-ink',
            }}
          >
            {/* The active module carries the brand rule under its label. */}
            <span className="absolute inset-x-2 bottom-0 hidden group-data-[status=active]:block">
              <BrandRule />
            </span>
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
