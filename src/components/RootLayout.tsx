import { Outlet, Link, useSearch, useNavigate, useRouterState } from '@tanstack/react-router';
import { TooltipProvider } from './ui/tooltip';
import { GlassesIcon, DropletIcon, HomeIcon, MenuIcon, ChevronLeftIcon, MoonIcon, SunIcon, SparklesIcon } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { Toggle } from './ui/toggle';
import { useTheme } from '../hooks/useTheme';

export function RootLayout() {
  return (
    <TooltipProvider delay={50}>
      <div className="flex flex-col-reverse md:flex-row h-dvh w-full font-sans overflow-hidden transition-colors duration-200 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <GlobalNav />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}

function GlobalNav() {
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
    { to: '/', icon: <HomeIcon size={20} />, label: lang === 'id' ? 'Beranda' : 'HomeIcon', exact: true },
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
          className="hidden md:flex flex-col fixed top-4 left-4 z-50 w-10 h-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-colors"
          title={lang === 'id' ? 'Buka MenuIcon' : 'Open MenuIcon'}
        >
          <MenuIcon size={20} />
        </Button>
      )}

      <nav className={`w-full bg-white dark:bg-slate-950 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-800 shrink-0 flex md:flex-col items-center justify-between px-4 md:px-0 md:py-4 gap-2 md:gap-4 z-40 relative transition-all duration-300 h-16 ${isExpanded ? 'md:h-dvh md:w-16 md:flex' : 'md:hidden'}`}>
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
                className="w-10 h-10 md:w-12 md:h-12 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-center font-bold text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
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
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 data-[state=on]:bg-slate-200 dark:data-[state=on]:bg-slate-800 transition-colors"
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
              className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors md:mt-2"
              title={lang === 'id' ? 'Tutup MenuIcon' : 'Close MenuIcon'}
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
        className: 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold'
      }}
      inactiveProps={{
        className: 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-300'
      }}
      className="flex flex-col items-center justify-center w-12 h-12 md:w-12 md:h-12 rounded-xl transition-all duration-200 group relative"
      aria-label={label}
      title={label}
    >
      {icon}
      {/* Tooltip emulation for desktop only, visible on hover */}
      <span className="absolute left-14 hidden group-hover:md:block px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded shadow-xl whitespace-nowrap z-50 capitalize">
        {label}
      </span>
    </Link>
  );
}
