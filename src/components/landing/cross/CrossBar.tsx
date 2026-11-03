import React, { useState } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { MenuIcon, XIcon } from 'lucide-react';
import { translations, type Language } from '@lib/translations';
import { useTheme } from '@hooks/useTheme';

/**
 * The bar.
 *
 * The landing page's own header, not the workbench's: the name at the left,
 * the four sections a reader wants, the two controls the product owes every
 * page (language, theme), and the one action. It carries no glass and no
 * floating pill — it is a hairline over the paper, and the meridian runs
 * straight through it.
 */
export function CrossBar({ lang }: { lang: Language }) {
  const t = translations[lang];
  const { resolved, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentSearch = useRouterState({
    select: (s) => s.location.search as Record<string, unknown>,
  });

  const sections = [
    { href: '#how', label: t.landNavHow },
    { href: '#instruments', label: t.landNavInstruments },
    { href: '#standards', label: t.landNavStandards },
    { href: '#questions', label: t.landNavQuestions },
  ];

  const switchLanguage = (code: Language) => {
    navigate({ to: '/', search: { ...currentSearch, lang: code }, replace: true });
  };

  const isDark = resolved === 'dark';

  const languageControl = (
    <div className="flex items-center gap-1" role="group" aria-label={t.landNavLanguage}>
      {(['en', 'id'] as Language[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchLanguage(code)}
          aria-pressed={code === lang}
          className="cross-toggle"
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <header className="cross-bar">
      <div className="cross-track cross-bar__inner">
        <Link
          to="/"
          search={{ lang }}
          className="cross-fig shrink-0 text-[1.0625rem] tracking-[0.14em]"
          style={{ fontWeight: 700 }}
        >
          AKTRIYO
        </Link>

        <div className="cross-bar__right">
        <nav aria-label={t.landNavLabel} className="cross-bar__nav">
          <ul className="flex items-center gap-7">
            {sections.map((section) => (
              <li key={section.href}>
                <a href={section.href} className="cross-navlink">
                  {section.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/contact" search={{ ...currentSearch, lang }} className="cross-navlink">
                {t.landNavContact}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="cross-lang">{languageControl}</div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? t.toggleLight : t.toggleDark}
            title={isDark ? t.toggleLight : t.toggleDark}
            className="cross-toggle"
          >
            {isDark ? 'LIGHT' : 'DARK'}
          </button>

          <Link
            to="/visualizer"
            search={{ lang, activeTab: 'visualizer', view: 'side' }}
            className="cross-btn cross-btn--bar"
          >
            {t.landHeroAction}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={t.landNavMenu}
            className="cross-toggle cross-bar__menu"
          >
            {menuOpen ? <XIcon size={15} /> : <MenuIcon size={15} />}
          </button>
        </div>
        </div>
      </div>

      {menuOpen && (
        <nav aria-label={t.landNavLabel} className="cross-bar__menu-panel border-t border-current/15">
          <ul className="cross-track flex flex-col py-2">
            {sections.map((section) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-current/10 py-3.5 text-[1rem]"
                >
                  {section.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/contact"
                search={{ ...currentSearch, lang }}
                onClick={() => setMenuOpen(false)}
                className="block border-b border-current/10 py-3.5 text-[1rem]"
              >
                {t.landNavContact}
              </Link>
            </li>
            <li className="flex items-center justify-between gap-4 py-4">
              <span className="cross-label">{t.landNavLanguage}</span>
              {languageControl}
            </li>
            <li className="pb-4">
              <Link
                to="/visualizer"
                search={{ lang, activeTab: 'visualizer', view: 'side' }}
                onClick={() => setMenuOpen(false)}
                className="cross-btn w-full"
              >
                {t.landHeroAction}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
