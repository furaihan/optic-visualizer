import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';
import { translations, type Language } from '@lib/translations';
import { OPTICAL_ENGINE_VERSION } from '@lib/optic-engine/optical';

/**
 * The footer as a board of tiles: what this is, where it lives, who made it,
 * and the photographs it borrowed. The name returns at full width.
 */
export function LandingFooter({ lang }: { lang: Language }) {
  const t = translations[lang];

  return (
    <footer className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-20 sm:px-10">
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="flex min-h-[200px] flex-col justify-between gap-8 rounded-sm p-6 lg:col-span-4 lg:bg-sheet-panel">
          <p className="max-w-[24ch] text-[22px] leading-[1.25] tracking-[-0.02em] text-sheet-ink">
            {t.landFooterAbout}
          </p>
          <p className="text-[13px] text-sheet-muted">{t.landFooterRights}</p>
        </div>

        <nav
          aria-label={t.landModulesTitle}
          className="flex min-h-[200px] flex-col justify-between gap-8 rounded-sm p-6 lg:col-span-3 lg:bg-sheet-panel"
        >
          <p className="text-[13px] text-sheet-muted">{t.landModulesTitle}</p>
          <ul className="flex flex-col gap-3">
            <li>
              <Link
                to="/visualizer"
                search={{ lang, activeTab: 'visualizer', view: 'side' }}
                className="text-[16px] text-sheet-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent"
              >
                {t.landModuleOne}
              </Link>
            </li>
            <li>
              <Link
                to="/aspheric"
                search={{ lang, activeTab: 'visualizer', view: 'side' }}
                className="text-[16px] text-sheet-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent"
              >
                {t.landModuleTwo}
              </Link>
            </li>
            <li>
              <Link
                to="/"
                search={{ lang }}
                className="text-[16px] text-sheet-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent"
              >
                {lang === 'id' ? 'Beranda' : 'Home'}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex min-h-[200px] flex-col justify-between gap-8 rounded-sm p-6 lg:col-span-2 lg:bg-sheet-panel">
          <p className="text-[13px] text-sheet-muted">{t.landFooterInstitute}</p>
          <p className="text-[16px] leading-snug text-sheet-ink">{t.landFooterCity}</p>
        </div>

        <div className="flex min-h-[200px] flex-col justify-between gap-6 rounded-sm p-6 lg:col-span-3 lg:bg-sheet-panel">
          <p className="text-[13px] text-sheet-muted">{t.landFooterPhotos}</p>
          <p className="text-[13px] leading-snug text-sheet-muted">{t.landPhotoCredits}</p>
        </div>

        <div className="flex min-h-[220px] items-center justify-center rounded-sm bg-sheet-ink p-6 lg:col-span-8">
          <p className="text-center text-[62px] font-medium leading-[0.92] tracking-[-0.045em] text-sheet-ground">
            AKTRIYO
          </p>
        </div>

        <Link
          to="/visualizer"
          search={{ lang, activeTab: 'visualizer', view: 'side' }}
          className="group flex min-h-[220px] flex-col justify-between rounded-sm bg-sheet-accent p-6 text-sheet-accent-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent lg:col-span-4"
        >
          <span className="text-[13px] opacity-80">{t.landHeroEngine.replace('{version}', OPTICAL_ENGINE_VERSION)}</span>
          <span className="flex items-end justify-between gap-4">
            <span className="max-w-[16ch] text-[22px] font-medium leading-[1.1] tracking-[-0.02em]">
              {t.landHeroAction}
            </span>            <ArrowRightIcon
              className="h-7 w-7 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </Link>
      </div>
    </footer>
  );
}
