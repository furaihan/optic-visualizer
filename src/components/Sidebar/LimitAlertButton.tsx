import { cn } from "@/src/lib/utils";
import { AlertCircleIcon } from "lucide-react";

/**
 * The mark next to a frame dimension that is outside its ergonomic range.
 * It highlights the matching dimension on the drawing while hovered or pressed.
 * It does not pulse: a warning that blinks is a warning that gets ignored.
 */
interface LimitAlertButtonProps {
  fieldName: "a" | "b" | "dbl" | "ed";
  isExceeding: boolean;
  title: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isHighlighted: boolean;
  onClick: () => void;
}

export const LimitAlertButton: React.FC<LimitAlertButtonProps> = ({
  fieldName,
  isExceeding,
  title,
  onMouseEnter,
  onMouseLeave,
  isHighlighted,
  onClick,
}) => (
  <button
    type="button"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
    className={cn(
      "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm transition-colors duration-150",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent",
      isExceeding
        ? "text-sheet-warning hover:bg-sheet-warning/10"
        : "text-sheet-muted hover:text-sheet-ink",
      isHighlighted && "bg-sheet-warning/15",
    )}
    title={title}
    aria-label={`${fieldName}: ${title}`}
    aria-pressed={isHighlighted}
  >
    <AlertCircleIcon size={13} aria-hidden="true" />
  </button>
);
