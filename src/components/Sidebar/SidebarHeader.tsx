import React from "react";
import { Language, translations } from "../../lib/translations";

interface SidebarHeaderProps {
  lang: Language;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="p-5 border-b border-slate-100 dark:border-slate-850">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            aria-hidden="true"
          >
            <rect
              x="42"
              y="10"
              width="16"
              height="35"
              fill="#1e73be"
              rx="2"
              transform="rotate(-45 50 50)"
            />
            <rect
              x="42"
              y="55"
              width="16"
              height="35"
              fill="#2d9e4b"
              rx="2"
              transform="rotate(-45 50 50)"
            />
            <rect
              x="42"
              y="10"
              width="16"
              height="35"
              fill="#31a8dd"
              rx="2"
              transform="rotate(45 50 50)"
            />
            <rect
              x="42"
              y="55"
              width="16"
              height="35"
              fill="#84cc16"
              rx="2"
              transform="rotate(45 50 50)"
            />
            <circle cx="50" cy="50" r="4" fill="#1e73be" />
          </svg>
        </div>
        <div>
          <h1 className="text-slate-900 dark:text-slate-100 font-extrabold text-sm tracking-tight leading-none mb-1">
            AKTRIYO
          </h1>
          <h2 className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-none m-0">
            {t.institute}
          </h2>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[8px] font-black uppercase bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded tracking-wider">
          Measuring Project
        </span>
        <span className="text-[8px] bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-mono border border-slate-200/60 dark:border-slate-800/80 uppercase tracking-tight">
          {t.title}
        </span>
      </div>
    </div>
  );
};
