import React from "react";
import { Language, translations } from "../../lib/translations";

/**
 * The workbench's own mark. Not a logo lockup: the tool's initials and what it
 * is, at a size you can read across a desk.
 */
export const SidebarHeader: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="shrink-0 px-5 pb-4 pt-5">
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
          <rect width="40" height="40" rx="2" className="fill-sheet-ink" />
          <circle cx="20" cy="20" r="11" fill="none" className="stroke-sheet-ground" strokeWidth="1.6" />
          <line x1="9" y1="20" x2="31" y2="20" className="stroke-sheet-ground" strokeWidth="1.6" />
          <circle cx="20" cy="20" r="2.4" className="fill-sheet-accent" />
        </svg>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-medium leading-tight text-sheet-ink">AKTRIYO</p>
          <p className="truncate text-[13px] leading-tight text-sheet-muted">{t.institute}</p>
        </div>
      </div>
    </div>
  );
};
