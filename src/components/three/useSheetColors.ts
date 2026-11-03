import { useEffect, useState } from "react";

/**
 * The sheet's own inks, read from the document.
 *
 * The 3D surface is a drawing on the same board as the sheet, so it takes its
 * colours from the same tokens rather than from a palette of its own. Reading
 * them at runtime is what keeps the two themes honest: switch the theme and the
 * body, the ground and the frame follow, because they were never hard-coded.
 */
export interface SheetColors {
  ground: string;
  panel: string;
  stage: string;
  ink: string;
  muted: string;
  accent: string;
  rx: string;
  frame: string;
  fit: string;
  warning: string;
  error: string;
}

const TOKENS: Record<keyof SheetColors, string> = {
  ground: "--sheet-ground",
  panel: "--sheet-panel",
  stage: "--sheet-stage",
  ink: "--sheet-ink",
  muted: "--sheet-muted",
  accent: "--sheet-accent",
  rx: "--sheet-rx",
  frame: "--sheet-frame",
  fit: "--sheet-fit",
  warning: "--sheet-warning",
  error: "--sheet-error",
};

function read(): SheetColors {
  const style = getComputedStyle(document.documentElement);
  const value = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
  return {
    ground: value(TOKENS.ground, "#ffffff"),
    panel: value(TOKENS.panel, "#f1f8f6"),
    stage: value(TOKENS.stage, "#e6f1f4"),
    ink: value(TOKENS.ink, "#0c1418"),
    muted: value(TOKENS.muted, "#4f5b64"),
    accent: value(TOKENS.accent, "#156fb5"),
    rx: value(TOKENS.rx, "#156fb5"),
    frame: value(TOKENS.frame, "#15705c"),
    fit: value(TOKENS.fit, "#166534"),
    warning: value(TOKENS.warning, "#9a4408"),
    error: value(TOKENS.error, "#b42318"),
  };
}

export function useSheetColors(): SheetColors {
  const [colors, setColors] = useState<SheetColors>(() =>
    typeof document === "undefined"
      ? {
          ground: "#ffffff",
          panel: "#f1f8f6",
          stage: "#e6f1f4",
          ink: "#0c1418",
          muted: "#4f5b64",
          accent: "#156fb5",
          rx: "#156fb5",
          frame: "#15705c",
          fit: "#166534",
          warning: "#9a4408",
          error: "#b42318",
        }
      : read(),
  );

  useEffect(() => {
    const sync = () => setColors(read());
    sync();
    // The theme is a class on the document element, so the observer watches
    // that rather than a React state the 3D surface does not own.
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}
