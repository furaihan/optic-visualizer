import React from "react";
import { cn } from "../../lib/utils";

export type SheetGroup = "rx" | "frame" | "fit";

const INK: Record<SheetGroup, string> = {
  rx: "bg-sheet-rx",
  frame: "bg-sheet-frame",
  fit: "bg-sheet-fit",
};

/**
 * The marker that names which group an input belongs to. The same three inks
 * appear on the three blocks of the lab order and inside the drawing, so an
 * optician can follow one colour from the panel to the sheet.
 *
 * Ink only: a marker beside the label, never a background wash.
 */
export const GroupMarker: React.FC<{ group: SheetGroup; className?: string }> = ({
  group,
  className,
}) => (
  <span
    aria-hidden="true"
    className={cn("h-3.5 w-[3px] shrink-0 rounded-full", INK[group], className)}
  />
);
