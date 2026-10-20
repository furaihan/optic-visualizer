import { Outlet, Link, useSearch, useNavigate, useRouterState } from '@tanstack/react-router';
import { TooltipProvider } from './ui/tooltip';
import { GlassesIcon, DropletIcon, HomeIcon, MenuIcon, ChevronLeftIcon, MoonIcon, SunIcon, SparklesIcon } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { Toggle } from './ui/toggle';
import { useTheme } from '../hooks/useTheme';
import { BrandRule } from './BrandRule';

export function RootLayout() {
  // The landing page is a page that scrolls: the workbench keeps its own
  // viewport, the front door does not, so the rail sticks and the page runs.
  const isLanding = useRouterState({ select: (s) => s.location.pathname === '/' });

  // The body carries overflow: hidden, which the viewport inherits — the
  // wheel would do nothing on a route that scrolls the document. The class
  // lifts it, and only for the route that needs it.
  useEffect(() => {
    document.documentElement.classList.toggle('page-scroll', isLanding);
    return () => document.documentElement.classList.remove('page-scroll');
  }, [isLanding]);

  return (
    <TooltipProvider delay={50}>
      <div
        className={`flex w-full font-sans transition-colors duration-200 bg-sheet-ground text-sheet-ink ${
          isLanding
            ? 'flex-col min-h-dvh md:flex-row md:items-start'
            : 'flex-col-reverse h-dvh overflow-hidden md:flex-row'
        }`}
      >
        <GlobalNav isLanding={isLanding} />
        <main
          className={`flex-1 flex flex-col relative ${
            isLanding ? 'min-h-dvh' : 'min-h-0 overflow-hidden'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}

function GlobalNav({ isLanding = false }: { isLanding?: boolean }) {
  const search = useSearch({ from: '__root__' });
  const currentSearch = useRouterState({ select: (s) => s.location.search as Record<string, unknown> });
  const navigate = useNavigate();
  const lang = search.lang;
  const { theme, toggleTheme } = useTheme();

  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      return localStorage.getItem('sidebarExpanded') !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebarExpanded', isExpanded.toString());
    } catch {}
  }, [isExpanded]);

  const navItems = [
    { to: '/', icon: <HomeIcon size={20} />, label: lang === 'id' ? 'Beranda' : 'Home', exact: true },
    { to: '/visualizer', icon: <GlassesIcon size={20} />, label: lang === 'id' ? 'Lensa' : 'Lenses' },
    { to: '/aspheric', icon: <SparklesIcon size={20} />, label: lang === 'id' ? 'Aspheric' : 'Aspheric' },
    { to: '/contact', icon: <DropletIcon size={20} />, label: lang === 'id' ? 'Kontak' : 'Contact' },
  ];

  return (
    <>
      {!isExpanded && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExpanded(true)}
          aria-expanded={isExpanded}
          className="hidden md:flex flex-col fixed top-4 left-4 z-50 w-10 h-10 items-center justify-center rounded-xl bg-sheet-ground border-sheet-stage text-sheet-muted hover:text-sheet-accent transition-colors"
          title={lang === 'id' ? 'Buka menu' : 'Open menu'}
        >
          <MenuIcon size={20} />
        </Button>
      )}

      <nav className={`w-full bg-sheet-panel md:bg-sheet-panel shrink-0 flex md:flex-col items-center justify-between px-4 md:px-0 md:py-4 gap-2 md:gap-4 z-40 transition-[width,background-color] duration-300 h-16 ${isLanding ? 'relative md:sticky md:top-0 md:self-start' : 'relative'} ${isExpanded ? 'md:h-dvh md:w-16 md:flex' : 'md:hidden'}`}>
        <div className="flex md:flex-col gap-2 md:gap-4 w-full h-full md:h-auto items-center justify-between md:justify-center">
          <div className="flex md:flex-col gap-2 md:gap-4 justify-center md:items-center">
            {navItems.map((item) => (
              <NavItem 
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                exact={item.exact}
                currentSearch={currentSearch}
              />
            ))}
          </div>

          <div className="flex flex-row md:flex-col items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="w-10 h-10 md:w-12 md:h-12 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-center font-bold text-xs rounded-xl bg-sheet-ground border border-sheet-stage text-sheet-muted hover:text-sheet-accent transition-colors"
                title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              >
                <span className="text-lg leading-none">{lang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" alignOffset={10}>
                <DropdownMenuItem onClick={() => navigate({ to: '.', search: { ...currentSearch, lang: 'id' } })}>
                  <span className="mr-2 text-lg">🇮🇩</span> Indonesia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '.', search: { ...currentSearch, lang: 'en' } })}>
                  <span className="mr-2 text-lg">🇬🇧</span> English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Toggle 
              pressed={theme === 'dark'}
              onPressedChange={toggleTheme}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-sheet-ground border border-sheet-stage text-sheet-muted hover:text-sheet-accent data-[state=on]:bg-sheet-stage transition-colors"
              title={lang === 'id' ? 'Ganti Tema Terang/Gelap' : 'Toggle Dark/Light Theme'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            </Toggle>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsExpanded(false)}
              aria-expanded={isExpanded}
              className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-sheet-ground border-sheet-stage text-sheet-muted hover:text-sheet-ink transition-colors md:mt-2"
              title={lang === 'id' ? 'Tutup menu' : 'Close menu'}
            >
              <ChevronLeftIcon size={16} />
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
}

function NavItem({ icon, label, to, exact, currentSearch }: { icon: React.ReactNode, label: string, to: string, exact?: boolean, currentSearch: Record<string, unknown> }) {
  const search = useSearch({ from: '__root__' });
  const lang = search.lang;

  return (
    <Link 
      to={to}
      search={{ ...currentSearch, lang }}
      activeOptions={{ exact }}
      activeProps={{
        className: 'text-sheet-accent font-bold'
      }}
      inactiveProps={{
        className: 'text-sheet-muted hover:bg-sheet-ground hover:text-sheet-ink'
      }}
      className="group relative flex flex-col items-center justify-center w-12 h-12 md:w-12 md:h-12 rounded-xl transition-colors duration-200"
      aria-label={label}
      title={label}
    >
      {/* The active item is marked by the brand rule, not by a coloured wash:
          along the top edge on the phone, down the left edge on the desk rail. */}
      <span className="pointer-events-none absolute inset-x-2 top-0 hidden group-data-[status=active]:block md:group-data-[status=active]:hidden">
        <BrandRule />
      </span>
      <span className="pointer-events-none absolute inset-y-2 left-0 hidden md:group-data-[status=active]:flex">
        <BrandRule orientation="vertical" />
      </span>
      {icon}
      {/* Tooltip emulation for desktop only, visible on hover */}
      <span className="absolute left-14 hidden group-hover:md:block px-2 py-1 bg-sheet-ink text-sheet-ground text-[10px] font-bold rounded whitespace-nowrap z-50 capitalize">
        {label}
      </span>
    </Link>
  );
}
