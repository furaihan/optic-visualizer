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
 */
export function MiniMark({ kind }: { kind: 'rx' | 'frame' | 'drawing' }) {
  const common = {
    width: '1.35em',
    height: '1.02em',
    viewBox: '0 0 46 34',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
    focusable: false,
    style: { verticalAlign: '-0.12em' } as React.CSSProperties,
  } as const;

  // On a phone the sentence reads without them; a mark at that size only
  // breaks the line.
  const mark = 'hidden md:inline-block';

  if (kind === 'rx') {
    // The prescription block: three measured fields on a panel.
    return (
      <svg {...common} className={mark}>
        <rect width="46" height="34" rx="2" className="fill-sheet-panel" />
        <rect x="4" y="6" width="3" height="22" rx="1.5" className="fill-sheet-rx" />
        <rect x="11" y="8" width="24" height="4" rx="2" className="fill-sheet-rx" />
        <rect x="11" y="15" width="16" height="4" rx="2" className="fill-sheet-rx" />
        <rect x="11" y="22" width="30" height="4" rx="2" className="fill-sheet-rx" />
      </svg>
    );
  }

  if (kind === 'frame') {
    // The rim in section: two bands and the groove between them.
    return (
      <svg {...common} className={mark}>
        <rect width="46" height="34" rx="2" className="fill-sheet-stage" />
        <rect x="10" y="2" width="20" height="7" className="fill-sheet-frame" fillOpacity={0.35} />
        <rect x="10" y="25" width="20" height="7" className="fill-sheet-frame" fillOpacity={0.35} />
        <line x1="21" y1="2" x2="21" y2="32" className="stroke-sheet-frame" strokeWidth="1.4" strokeDasharray="4 3" />
      </svg>
    );
  }

  // The drawing: the lens in section, curved at the front.
  return (
    <svg {...common} className={mark}>
      <rect width="46" height="34" rx="2" className="fill-sheet-stage" />
      <path
        d="M18 4 Q12 17 18 30 L26 30 Q21 17 26 4 Z"
        className="fill-sheet-rx"
        fillOpacity={0.26}
        strokeWidth="1.6"
      />
    </svg>
  );
}
