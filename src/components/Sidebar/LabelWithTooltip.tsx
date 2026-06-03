import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Language, getTooltipByLabel } from '../../lib/i18n';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

interface LabelWithTooltipProps {
  label: string;
  lang: Language;
  className?: string;
  isUppercaseHeader?: boolean;
  icon?: React.ReactNode;
}

export const LabelWithTooltip: React.FC<LabelWithTooltipProps> = ({ 
  label, 
  lang, 
  className, 
  isUppercaseHeader = false, 
  icon 
}) => {
  const tooltipText = getTooltipByLabel(label, lang);
  if (!tooltipText) {
    return (
      <span className={className}>
        {icon && <span className="mr-1.5">{icon}</span>}
        {label}
      </span>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger render={
        <span className={`inline-flex items-center gap-1 cursor-help hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${className || ''}`} />
      }>
        <div className="flex items-center gap-1">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className={isUppercaseHeader ? "font-bold uppercase tracking-wider text-[10px] text-slate-500" : "font-semibold text-slate-700"}>
            {label}
          </span>
        </div>
        <HelpCircle size={10} className="text-slate-400 shrink-0" />
      </TooltipTrigger>
      <TooltipContent className="p-2.5 max-w-[220px] text-[10.5px] font-sans font-medium leading-normal bg-slate-900 border border-slate-800 text-slate-100 rounded-lg shadow-xl shrink-0 z-50">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};
