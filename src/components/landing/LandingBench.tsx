import React from 'react';
import { translations, type Language } from '@lib/translations';

import trialFrameFitting from '@/src/assets/bench/trial-frame-fitting.jpg';
import trialLensSet from '@/src/assets/bench/trial-lens-set.jpg';
import lensometer from '@/src/assets/bench/us-navy-050129-n-6477m-012-hospital.jpg';
import laboratory from '@/src/assets/bench/glasses-for-your-birthday-150525-a-ua479.jpg';
import nearVision from '@/src/assets/bench/trial-frame-reading.jpg';

/**
 * The bench this replaces.
 *
 * Five photographs of the optician's world, found in the open collections
 * and credited in the footer. They show other people's benches; none of them
 * is this product. One is large and the four beside it are at one ratio, so
 * the section reads as a plate rather than a gallery wall.
 */
export function LandingBench({ lang }: { lang: Language }) {
  const t = translations[lang];

  const dominant = {
    src: trialFrameFitting,
    width: 1920,
    height: 1280,
    alt:
      'A trial frame being adjusted on a patient’s face; the dials on the frame carry the sphere and cylinder powers.',
    caption:
      'A trial frame carries the lenses while the patient is measured. The dials on it hold the powers.',
    drift: true,
  };

  const others = [
    {
      src: trialLensSet,
      width: 1920,
      height: 2560,
      alt:
        'An open trial lens set in a metal case: rows of trial lenses in spherical, cylindrical and prism powers, each with its value printed on the strip beside it.',
      caption: 'A trial lens set: the powers held in the hand.',
    },
    {
      src: lensometer,
      width: 1920,
      height: 2888,
      alt:
        'A hospital corpsman holds a pair of spectacles to the eyepiece of a lensometer in an optometry department.',
      caption: 'A lensometer reads a lens that already exists.',
    },
    {
      src: laboratory,
      width: 1920,
      height: 1272,
      alt:
        'An optical laboratory specialist in uniform measures a pair of spectacles at a bench with a small optical instrument.',
      caption: 'A prescription, read at the laboratory bench.',
    },
    {
      src: nearVision,
      width: 1920,
      height: 1280,
      alt:
        'An older patient wearing a trial frame reads a printed near-vision card held in front of them.',
      caption: 'A patient reads, while the prescription is still open.',
    },
  ];

  return (
    <section id="bench" className="mx-auto w-full max-w-[1200px] px-6 sm:px-10">
      <div className="reveal grid gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 className="text-[32px] font-medium leading-[1.1] tracking-[-0.025em] text-sheet-ink">
            {t.landBenchTitle}
          </h2>
          <p className="mt-4 max-w-[42ch] text-[20px] leading-[1.6] text-sheet-muted">
            {t.landBenchBody}
          </p>
        </div>
      </div>

      <figure className="reveal reveal-1 mt-12 grid gap-8 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-sm bg-sheet-stage">
            <img
              src={dominant.src}
              width={dominant.width}
              height={dominant.height}
              alt={dominant.alt}
              loading="lazy"
              decoding="async"
              className="bench-drift block aspect-[4/3] w-full object-cover"
            />
          </div>
          <figcaption className="mt-4 max-w-[52ch] text-[16px] leading-snug text-sheet-muted">
            {dominant.caption}
          </figcaption>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:col-span-5">
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
    </section>
  );
}
