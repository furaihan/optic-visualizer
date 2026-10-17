import React from 'react';
import { HelpCircleIcon } from "lucide-react";
import { Language, getTooltipByLabel } from '../../lib/translations';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

interface LabelWithTooltipProps {
  label: string;
  lang: Language;
  className?: string;
  isUppercaseHeader?: boolean;
  icon?: React.ReactNode;
}

/**
 * A field label that carries its definition. Sentence case, body size, with a
 * quiet help mark: the definition is available, not shouted.
 */
export const LabelWithTooltip: React.FC<LabelWithTooltipProps> = ({
  label,
  lang,
  className,
  icon,
}) => {
  const tooltipText = getTooltipByLabel(label, lang);

  if (!tooltipText) {
    return (
      <span className={`flex items-center gap-1.5 text-[13px] font-medium leading-tight text-sheet-ink ${className || ''}`}>
        {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
        {label}
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium leading-tight text-sheet-ink transition-colors hover:text-sheet-accent focus-visible:underline ${className || ''}`}
            aria-label={tooltipText}
          />
        }
      >
        {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
        <span>{label}</span>
        <HelpCircleIcon size={12} className="shrink-0 text-sheet-muted" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[240px] rounded-sm bg-sheet-ink p-2.5 text-[13px] leading-snug text-sheet-ground">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};
