import React, { useState } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { MenuIcon, XIcon, MoonIcon, SunIcon } from 'lucide-react';
import { translations, type Language } from '@lib/translations';
import { useTheme } from '../../hooks/useTheme';

/**
 * The landing page's own bar.
 *
 * The workbench keeps its icon rail; the front door does not. A rail down the
 * left edge pushes every line of the page 64px off centre, and it puts the
 * tool's own chrome on a page whose job is to introduce the tool. So the
 * landing page gets a plain bar instead: the name, five links, one action.
 *
 * The bar is a surface one step off the ground, not a panel with a rule under
 * it, and it carries no glass and no floating pill.
 */
export function LandingNav({ lang }: { lang: Language }) {
  const t = translations[lang];
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentSearch = useRouterState({
    select: (s) => s.location.search as Record<string, unknown>,
  });

  // The four sections a reader is most likely to want, in the order they
  // appear on the page. "Contact" is a route of its own.
  const sections = [
    { href: '#how', label: t.landNavHow },
    { href: '#instruments', label: t.landNavInstruments },
    { href: '#standards', label: t.landNavStandards },
    { href: '#questions', label: t.landNavQuestions },
  ];

  const linkClass =
    'text-[16px] leading-none text-sheet-muted transition-colors duration-150 hover:text-sheet-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent';

  const closeMenu = () => setMenuOpen(false);

  const switchLanguage = (code: Language) => {
    navigate({
      to: '/',
      search: { ...currentSearch, lang: code },
      replace: true,
    });
  };

  const languageControl = (
    <div
      className="flex items-center rounded-sm bg-sheet-ground p-0.5"
      role="group"
      aria-label={t.landNavLanguage}
    >
      {(['en', 'id'] as Language[]).map((code) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchLanguage(code)}
            aria-pressed={active}
            className={`h-7 rounded-sm px-2 text-[13px] font-medium leading-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent ${
              active
                ? 'bg-sheet-ink text-sheet-ground'
                : 'text-sheet-muted hover:text-sheet-ink'
            }`}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-sheet-panel">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-6 px-6 sm:px-10">
        <Link
          to="/"
          search={{ lang }}
          className="shrink-0 text-[20px] font-medium leading-none tracking-[-0.03em] text-sheet-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent"
        >
          AKTRIYO
        </Link>

        <nav aria-label={t.landNavLabel} className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {sections.map((section) => (
              <li key={section.href}>
                <a href={section.href} className={linkClass} onClick={closeMenu}>
                  {section.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/contact"
                search={{ ...currentSearch, lang }}
                className={linkClass}
              >
                {t.landNavContact}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">{languageControl}</div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.toggleLight : t.toggleDark}
            title={theme === 'dark' ? t.toggleLight : t.toggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-sm bg-sheet-ground text-sheet-muted transition-colors duration-150 hover:text-sheet-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent"
          >
            {theme === 'dark' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
          </button>

          <Link
            to="/visualizer"
            search={{ lang, activeTab: 'visualizer', view: 'side' }}
            className="hidden h-10 items-center rounded-sm bg-sheet-accent px-4 text-[16px] font-medium text-sheet-accent-ink transition-colors duration-150 hover:bg-sheet-accent/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent sm:inline-flex"
          >
            {t.landHeroAction}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-label={t.landNavMenu}
            className="flex h-9 w-9 items-center justify-center rounded-sm bg-sheet-ground text-sheet-ink transition-colors duration-150 hover:bg-sheet-stage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent lg:hidden"
          >
            {menuOpen ? <XIcon size={16} /> : <MenuIcon size={16} />}
          </button>
        </div>
      </div>

      {/* The phone menu: a plain list on the ground tone below the bar, not a
          floating panel and not a rule under the bar. */}
      {menuOpen && (
        <nav
          aria-label={t.landNavLabel}
          className="bg-sheet-ground lg:hidden"
        >
          <ul className="mx-auto flex w-full max-w-[1200px] flex-col px-6 py-2 sm:px-10">
            {sections.map((section) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  onClick={closeMenu}
                  className="block py-3 text-[16px] text-sheet-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent"
                >
                  {section.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/contact"
                search={{ ...currentSearch, lang }}
                onClick={closeMenu}
                className="block py-3 text-[16px] text-sheet-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent"
              >
                {t.landNavContact}
              </Link>
            </li>
            <li className="flex items-center gap-3 pb-3 pt-2">
              <span className="text-[13px] text-sheet-muted">
                {t.landNavLanguage}
              </span>
              {languageControl}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
