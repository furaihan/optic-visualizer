import { cn } from "../lib/utils";

/**
 * The one piece of pure brand colour in the tool: the logo's three inks as
 * three flat segments. No gradient — the sheet is flat, and this is the only
 * place the whole palette appears at once.
 *
 * Used exactly three times: the top of the inspector, the active navigation
 * item, and the rule under the home page heading.
 */
export function BrandRule({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const segments = ["bg-sheet-rx", "bg-sheet-frame", "bg-sheet-fit"];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex overflow-hidden",
        orientation === "horizontal" ? "h-[3px] w-full flex-row" : "h-full w-[3px] flex-col",
        className,
      )}
    >
      {segments.map((tone) => (
        <span key={tone} className={cn("flex-1", tone)} />
      ))}
    </span>
  );
}
