import React from 'react';
import type { Language } from '@lib/translations';
import { CrossBar } from './cross/CrossBar';
import { CrossHero } from './cross/CrossHero';
import { CrossStatement, CrossHow } from './cross/CrossStory';
import {
  CrossInstruments,
  CrossStandards,
  CrossQuestions,
  CrossClose,
  CrossFooter,
} from './cross/CrossRest';
import './cross.css';

/**
 * The landing page, set on the optical cross.
 *
 * One meridian runs the whole document — the bar, the hero, every band, the
 * footer's last line — and the horizontal rules are the page's own rhythm.
 * The claim sits in the top-left cell, the live section on the plate at the
 * crossing, and everything below is measured down the same two lines.
 */
export function CrossLanding({ lang }: { lang: Language }) {
  return (
    <div className="cross min-h-full">
      <div className="cross-spine" aria-hidden="true" />
      <CrossBar lang={lang} />

      <main>
        <CrossHero lang={lang} />
        <CrossStatement lang={lang} />
        <CrossHow lang={lang} />
        <CrossInstruments lang={lang} />
        <CrossStandards lang={lang} />
        <CrossQuestions lang={lang} />
        <CrossClose lang={lang} />
      </main>

      <CrossFooter lang={lang} />
    </div>
  );
}
