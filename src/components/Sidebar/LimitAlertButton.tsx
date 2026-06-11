import { cn } from "@/src/lib/utils";
import {Button} from "@shadcn/button";
import { AlertCircleIcon } from "lucide-react";

/**
 * LimitAlertButton - Single source of truth untuk frame param alerts
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
  <Button
    variant="ghost"
    size="icon"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
    className={cn(
      "w-5 h-5 rounded-full transition-all shrink-0 hover:bg-transparent",
      "hover:scale-110 active:scale-95",
      isExceeding
        ? "text-amber-500 hover:text-amber-600 animate-pulse-soft bg-amber-500/10"
        : "text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500",
    )}
    title={title}
    aria-label={`Toggle ${fieldName} limit warning highlight`}
    aria-pressed={isHighlighted}
  >
    <AlertCircleIcon size={11} />
  </Button>
);