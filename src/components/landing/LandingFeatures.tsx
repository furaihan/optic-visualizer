import React, { useState } from 'react';
import { translations, type Language } from '@lib/translations';
import { GroupMarker, type SheetGroup } from '@components/Sidebar/GroupMarker';

/**
 * The panel, whole, with notes in the margins.
 *
 * Every control the instrument reads is named here, in the position the
 * workbench puts it. Point at a note and its control is picked out.
 *
 * The rows are set 76px apart so a note in the margin has room to breathe:
 * at 64px the six notes nearly touched each other and the margin read as a
 * wall of small type.
 */
export function LandingFeatures({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [active, setActive] = useState<string | null>(null);

  const rows: { id: string; group: SheetGroup; label: string; value: string; unit: string }[] = [
    { id: 'sph', group: 'rx', label: t.sphere, value: '−4.00', unit: 'D' },
    { id: 'cyl', group: 'rx', label: t.cylinder, value: '0.00', unit: 'D' },
    { id: 'axis', group: 'rx', label: t.axis, value: '0', unit: '°' },
    { id: 'index', group: 'rx', label: t.refractiveIndex, value: '1.60', unit: 'MR-8' },
    { id: 'bc', group: 'rx', label: t.baseCurve, value: '4.00', unit: 'D' },
    { id: 'eye', group: 'frame', label: `${t.aSize} / ${t.bSize}`, value: '52 / 40', unit: 'mm' },
    { id: 'bridge', group: 'frame', label: `${t.dbl} / ${t.ed}`, value: '18 / 54', unit: 'mm' },
    { id: 'depth', group: 'frame', label: t.frameDepth, value: '4.5', unit: 'mm' },
    { id: 'pd', group: 'fit', label: `${t.pd} / ${t.fittingHeight}`, value: '63 / 22', unit: 'mm' },
    { id: 'bevel', group: 'fit', label: t.bevelPos, value: '33', unit: '%' },
  ];

  const notes = [
    { id: 'sph', title: t.sphere, body: t.tipSphere, side: 'left' as const },
    { id: 'index', title: t.refractiveIndex, body: t.tipRefractiveIndex, side: 'right' as const },
    { id: 'bc', title: t.baseCurve, body: t.tipBaseCurve, side: 'left' as const },
    { id: 'eye', title: t.aSize, body: t.tipASize, side: 'right' as const },
    { id: 'pd', title: t.pd, body: t.tipPd, side: 'left' as const },
    { id: 'bevel', title: t.bevelPos, body: t.tipBevelPos, side: 'right' as const },
  ];

  // The row pitch, and the offset of a note from the top of its row.
  const ROW = 76;
  const rowTop = (id: string) => rows.findIndex((row) => row.id === id) * ROW + 16;

  const noteClass =
    'absolute w-[25ch] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent';

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 sm:px-10">
      <div className="reveal grid gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 className="text-[32px] font-medium leading-[1.1] tracking-[-0.025em] text-sheet-ink">
            {t.landFeaturesTitle}
          </h2>
          <p className="mt-4 max-w-[44ch] text-[20px] leading-[1.6] text-sheet-muted">
            {t.landFeaturesBody}
          </p>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="relative hidden lg:col-span-4 lg:block">
          {notes
            .filter((note) => note.side === 'left')
            .map((note) => (
              <button
                key={note.id}
                type="button"
                onMouseEnter={() => setActive(note.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(note.id)}
                onBlur={() => setActive(null)}
                className={`${noteClass} right-0 text-right`}
                style={{ top: rowTop(note.id) }}
              >
                <span className="block text-[20px] font-medium leading-tight text-sheet-ink">
                  {note.title}
                </span>
                <span className="mt-1 block text-[16px] leading-snug text-sheet-muted">
                  {note.body}
                </span>
              </button>
            ))}
        </div>

        <div data-ui className="overflow-hidden rounded-sm lg:col-span-4">
          <div className="bg-sheet-panel">
            {rows.map((row) => {
              const picked = active === row.id;
              return (
                <div
                  key={row.id}
                  className={`flex items-center justify-between gap-4 px-4 transition-colors duration-150 ${
                    picked ? 'bg-sheet-info' : 'bg-sheet-panel'
                  }`}
                  style={{ height: ROW }}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <GroupMarker group={row.group} />
                    <span
                      className={`truncate text-[16px] ${
                        picked ? 'font-medium text-sheet-accent' : 'text-sheet-ink'
                      }`}
                    >
                      {row.label}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-2">
                    <span className="text-[22px] font-medium leading-none text-sheet-ink tnum">
                      {row.value}
                    </span>
                    <span className="text-[13px] text-sheet-muted">{row.unit}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative hidden lg:col-span-4 lg:block">
          {notes
            .filter((note) => note.side === 'right')
            .map((note) => (
              <button
                key={note.id}
                type="button"
                onMouseEnter={() => setActive(note.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(note.id)}
                onBlur={() => setActive(null)}
                className={`${noteClass} left-0`}
                style={{ top: rowTop(note.id) }}
              >
                <span className="block text-[20px] font-medium leading-tight text-sheet-ink">
                  {note.title}
                </span>
                <span className="mt-1 block text-[16px] leading-snug text-sheet-muted">
                  {note.body}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* On a phone the notes sit under the panel, in two columns, so the
          section reads as one thing instead of a list twice over. */}
      <dl className="mt-10 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:hidden">
        {notes.map((note) => (
          <div key={note.id}>
            <dt className="text-[20px] font-medium text-sheet-ink">{note.title}</dt>
            <dd className="mt-1 text-[16px] leading-snug text-sheet-muted">{note.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
