import { useSearch, Link } from "@tanstack/react-router";
import { GlassesIcon, ArrowRightIcon } from "lucide-react";

import { translations } from "@/src/lib/translations";

import { buttonVariants } from "@components/ui/button";
import { BrandRule } from "@components/BrandRule";

/**
 * The front door: the tool's claim, one sentence, one action, and the modules
 * below it. No hero card, no gradient, no icon stack — the workbench behind
 * this page is a lab sheet, so the page that opens it is set the same way.
 */
export function HomePage() {
  const search = useSearch({ from: '/' });
  const lang = search.lang;
  const t = translations[lang];

  return (
    <div className="h-full overflow-y-auto bg-sheet-ground">
      <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <section className="max-w-[46ch]">
          <h1 className="max-w-[24ch] text-[40px] font-medium leading-[1.05] tracking-[-0.03em] text-sheet-ink sm:text-[56px]">
            {t.homeTitle}
          </h1>

          <div className="mt-8 max-w-[34ch]">
            <BrandRule />
          </div>

          <p className="mt-8 max-w-[52ch] text-[18px] leading-relaxed text-sheet-ink sm:text-[20px]">
            {t.homeSubtitle}
          </p>

          <div className="mt-10">
            <Link
              to="/visualizer"
              search={{ lang, activeTab: 'visualizer', view: 'side' }}
              className={buttonVariants({
                size: "lg",
                className:
                  "group h-12 gap-3 rounded-sm bg-sheet-accent px-6 text-[16px] font-medium text-sheet-accent-ink hover:bg-sheet-accent/90",
              })}
            >
              <GlassesIcon className="h-5 w-5" aria-hidden="true" />
              {t.homeLensVisualizer}
              <ArrowRightIcon
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>

        {/* The modules, as a list of what the tool does — not cards. Both are
            real routes; nothing is listed here that cannot be opened. */}
        <section className="mt-20 sm:mt-24">
          <ul className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
            <li className="flex flex-col gap-2">
              <p className="text-[16px] font-medium text-sheet-ink">{t.homeLensVisualizer}</p>
              <p className="max-w-[46ch] text-[16px] leading-relaxed text-sheet-muted">
                {t.homeLensVisualizerDesc}
              </p>
            </li>
            <li className="flex flex-col gap-2">
              <p className="text-[16px] font-medium text-sheet-ink">{t.asphericNav}</p>
              <p className="max-w-[46ch] text-[16px] leading-relaxed text-sheet-muted">
                {t.homeAsphericDesc}
              </p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
