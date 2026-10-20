import React from 'react';
import { translations, type Language } from '@lib/translations';
import { GroupMarker, type SheetGroup } from '@components/Sidebar/GroupMarker';

/**
 * The three small pieces the landing page reuses from the workbench's
 * vocabulary: a call (what you put in), a row of the sheet (what comes
 * back), and the tiny inline marks that sit inside the statement.
 */

/** A call: the literal thing that goes into the instrument. */
export function CallPanel({
  group,
  title,
  pairs,
  lang,
}: {
  group: SheetGroup;
  title: string;
  pairs: { key: string; value: string }[];
  lang: Language;
}) {
  const t = translations[lang];
  return (
    <div data-ui className="rounded-sm bg-sheet-panel p-5">
      <p className="flex items-center gap-2 text-[13px] font-medium text-sheet-ink">
        <GroupMarker group={group} />
        <span>{title}</span>
      </p>
      <dl className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3">
        {pairs.map((pair) => (
          <div key={pair.key} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-[13px] leading-tight text-sheet-muted">{pair.key}</dt>
            <dd className="text-[22px] font-medium leading-tight text-sheet-ink tnum">
              {pair.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[13px] text-sheet-muted">{t.scaleNote}</p>
    </div>
  );
}

/** One row of the measurement sheet, in one of its three states. */
export function SheetRow({
  label,
  value,
  limit,
  ok,
  detail,
  open = false,
  lang,
}: {
  label: string;
  value: string;
  limit: string;
  ok: boolean;
  detail?: string;
  open?: boolean;
  lang: Language;
}) {
  const t = translations[lang];
  return (
    <div>
      <div
        className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 ${
          ok ? (open ? 'bg-sheet-info' : 'bg-sheet-panel') : 'bg-sheet-alert'
        }`}
      >
        <span className="text-[16px] text-sheet-ink">{label}</span>
        <span className="text-[22px] font-medium leading-none text-sheet-ink tnum">{value}</span>
        <span className="text-[13px] text-sheet-muted tnum">{limit}</span>
        <span
          className={`inline-block whitespace-nowrap px-2 py-1 text-[13px] leading-none ${
            ok ? 'bg-sheet-stage text-sheet-ink' : 'bg-sheet-warning text-sheet-warning-ink'
          }`}
        >
          {ok ? t.withinLimit : t.overLimit}
        </span>
      </div>
      {open && detail && (
        <p className="max-w-[68ch] bg-sheet-panel px-4 pb-4 pt-3 text-[16px] leading-relaxed text-sheet-ink">
          {detail}
        </p>
      )}
    </div>
  );
}

/**
 * The inline marks inside the statement: tight crops of the drawing, each
 * the thing the word beside it names. Drawn in the inks of the drawing.
 *
 * They are set at cap height and a little wider than tall, with no frame of
 * their own, so they read as an object dropped into the sentence rather than
 * as a small icon.
 */
export function MiniMark({ kind }: { kind: 'rx' | 'frame' | 'drawing' }) {
  const common = {
    width: '2em',
    height: '1.06em',
    viewBox: '0 0 80 42',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
    focusable: false,
    style: { verticalAlign: '-0.16em' } as React.CSSProperties,
  } as const;

  // On a phone the sentence reads without them; a mark at that size only
  // breaks the line.
  const mark = 'hidden md:inline-block mx-[0.16em]';

  if (kind === 'rx') {
    // The prescription block: a measure bar and two value bars.
    return (
      <svg {...common} className={mark}>
        <rect x="0" y="3" width="80" height="36" rx="2" className="fill-sheet-panel" />
        <rect x="8" y="10" width="5" height="22" rx="2.5" className="fill-sheet-rx" />
        <rect x="20" y="11" width="26" height="7" rx="1" className="fill-sheet-rx" />
        <rect x="20" y="24" width="16" height="7" rx="1" className="fill-sheet-rx" />
        <rect x="52" y="11" width="20" height="7" rx="1" className="fill-sheet-ink" fillOpacity="0.45" />
        <rect x="52" y="24" width="12" height="7" rx="1" className="fill-sheet-ink" fillOpacity="0.45" />
      </svg>
    );
  }

  if (kind === 'frame') {
    // The rim in section: the band above and below, the lens edge between.
    return (
      <svg {...common} className={mark}>
        <rect x="0" y="3" width="80" height="36" rx="2" className="fill-sheet-stage" />
        <rect x="22" y="5" width="36" height="9" className="fill-sheet-frame" fillOpacity="0.45" />
        <rect x="22" y="28" width="36" height="9" className="fill-sheet-frame" fillOpacity="0.45" />
        <rect x="28" y="14" width="24" height="14" className="fill-sheet-rx" fillOpacity="0.28" />
        <line x1="40" y1="5" x2="40" y2="37" className="stroke-sheet-muted" strokeWidth="1.4" strokeDasharray="4 3" />
      </svg>
    );
  }

  // The drawing: the lens in section, curved at the front.
  return (
    <svg {...common} className={mark}>
      <rect x="0" y="3" width="80" height="36" rx="2" className="fill-sheet-stage" />
      <path
        d="M34 5 Q22 21 34 37 L48 37 Q38 21 48 5 Z"
        className="fill-sheet-rx stroke-sheet-rx"
        fillOpacity="0.34"
        strokeWidth="2"
      />
    </svg>
  );
}
