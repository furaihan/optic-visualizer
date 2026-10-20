import React from 'react';
import { translations, type Language } from '@lib/translations';

import trialLensSet from '@/src/assets/bench/trial-lens-set.jpg';
import lensometer from '@/src/assets/bench/us-navy-050129-n-6477m-012-hospital.jpg';
import laboratory from '@/src/assets/bench/glasses-for-your-birthday-150525-a-ua479.jpg';
import trialFrame from '@/src/assets/bench/optical-trial-lens-frame.jpg';
import spectacles from '@/src/assets/bench/eyeglasses.jpg';

/**
 * The bench this replaces.
 *
 * Five photographs of the optician's world, found in the open collections
 * and credited in the footer. They show other people's benches; none of them
 * is this product.
 */
export function LandingBench({ lang }: { lang: Language }) {
  const t = translations[lang];

  const dominant = {
    src: trialLensSet,
    width: 1920,
    height: 2560,
    alt:
      'An open trial lens set in a metal case: rows of trial lenses in spherical, cylindrical and prism powers, each with its value printed on the strip beside it.',
    caption:
      'A trial lens set — the powers an optician holds in the hand while a patient is measured.',
    drift: true,
  };

  const others = [
    {
      src: laboratory,
      width: 1920,
      height: 1272,
      alt:
        'An optical laboratory specialist in uniform measures a pair of spectacles at a bench with a small optical instrument.',
      caption: 'A prescription, read at the bench of an optical laboratory.',
    },
    {
      src: lensometer,
      width: 1920,
      height: 2888,
      alt:
        'A hospital corpsman holds a pair of spectacles to the eyepiece of a lensometer in an optometry department.',
      caption: 'A lensometer reads the power of a lens that already exists.',
    },
    {
      src: trialFrame,
      width: 1500,
      height: 852,
      alt:
        'An optical trial lens frame with black rims, hinged at the bridge, standing open on a table.',
      caption: 'A trial frame carries the lenses while the patient is measured.',
    },
    {
      src: spectacles,
      width: 1920,
      height: 1280,
      alt:
        'A pair of round gold-rimmed spectacles with tortoiseshell arms, photographed against a white background.',
      caption: 'The object every number on this page is about.',
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 sm:px-10">
      <div className="reveal grid gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 className="text-[32px] font-medium leading-[1.1] tracking-[-0.025em] text-sheet-ink">
            {t.landBenchTitle}
          </h2>
          <p className="mt-4 max-w-[42ch] text-[18px] leading-[1.6] text-sheet-muted">
            {t.landBenchBody}
          </p>
        </div>
      </div>

      <figure className="reveal reveal-1 mt-14 grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-sm bg-sheet-stage">
            <img
              src={dominant.src}
              width={dominant.width}
              height={dominant.height}
              alt={dominant.alt}
              loading="lazy"
              decoding="async"
              className="bench-drift block aspect-square w-full object-cover object-bottom"
            />
          </div>
          <figcaption className="mt-4 max-w-[38ch] text-[16px] leading-snug text-sheet-muted">
            {dominant.caption}
          </figcaption>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
          {others.map((photo) => (
            <figure key={photo.src}>
              <div className="overflow-hidden rounded-sm bg-sheet-stage">
                <img
                  src={photo.src}
                  width={photo.width}
                  height={photo.height}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="block aspect-[4/3] w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[16px] leading-snug text-sheet-muted">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </figure>

      <p className="reveal mt-10 max-w-[70ch] text-[13px] leading-snug text-sheet-muted">
        {t.landBenchNote}
      </p>
    </section>
  );
}
