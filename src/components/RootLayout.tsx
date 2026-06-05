import { Outlet, Link, useSearch } from '@tanstack/react-router';
import { useTheme } from '../hooks/useTheme';
import { TooltipProvider } from './ui/tooltip';
import { Glasses, Droplet } from 'lucide-react';
import React from 'react';

export function RootLayout() {
  const { theme } = useTheme();

  return (
    <TooltipProvider delay={50}>
      <div className={`flex flex-col md:flex-row h-screen w-full font-sans overflow-hidden transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
        <GlobalNav />
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}

function GlobalNav() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const lang = search.lang || 'id';
  
  return (
    <nav className="w-full h-14 md:h-screen md:w-16 bg-white dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 shrink-0 flex md:flex-col items-center justify-between md:justify-start px-4 md:px-0 md:py-4 gap-2 md:gap-4 z-50">
      <div className="flex md:flex-col gap-2 md:gap-4 w-full justify-center md:justify-start md:items-center">
        <NavItem 
          to="/"
          icon={<Glasses size={20} />} 
          label={lang === 'id' ? 'Lensa' : 'Lenses'} 
        />
        <NavItem 
          to="/contact"
          icon={<Droplet size={20} />} 
          label={lang === 'id' ? 'Kontak' : 'Contact'} 
        />
      </div>
    </nav>
  );
}

function NavItem({ icon, label, to }: { icon: React.ReactNode, label: string, to: string }) {
  return (
    <Link 
      to={to}
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
