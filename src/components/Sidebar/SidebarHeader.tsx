import React from "react";
import { Language, translations } from "../../lib/translations";
import { BrandRule } from "../BrandRule";

/**
 * The workbench's own mark: the Aktriyo lens in the brand's blue, its ring in
 * white, the coating dot in the green of the logo. Set beside the initials and
 * what the tool is, at a size you can read across a desk.
 */
export const SidebarHeader: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="shrink-0">
      <BrandRule />
      <div className="flex items-center gap-3 px-5 pb-4 pt-5">
        <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
          <rect width="40" height="40" rx="2" className="fill-sheet-rx" />
          <circle
            cx="20"
            cy="20"
            r="11"
            fill="none"
            className="stroke-sheet-ground"
            strokeWidth="1.6"
          />
          <line
            x1="9"
            y1="20"
            x2="31"
            y2="20"
            className="stroke-sheet-ground"
            strokeWidth="1.6"
          />
          {/* The coating dot: the one place the light green is allowed, as a
              fill at a size where contrast does not apply. */}
          <circle cx="20" cy="20" r="2.4" fill="var(--color-brand-green-light)" />
        </svg>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-medium leading-tight text-sheet-ink">AKTRIYO</p>
          <p className="truncate text-[13px] leading-tight text-sheet-muted">{t.institute}</p>
        </div>
      </div>
    </div>
  );
};
