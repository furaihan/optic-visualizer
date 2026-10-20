import { useState } from 'react';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { translations } from '../../lib/translations';
import type { Language } from '../../types/search-params';
import { cn } from '../../lib/utils';

/**
 * The one action of the workbench: the lab order, on the clipboard, in the
 * format a lab can paste into its own sheet.
 *
 * The order comes from the page, so the aspheric sheet copies the aspheric
 * order and the spherical sheet copies the spherical one.
 */
export function CopyOrderButton({
  lang,
  order,
  className,
}: {
  lang: Language;
  order: string[];
  className?: string;
}) {
  const t = translations[lang];
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');

  const copyOrder = async () => {
    const text = order.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied('done');
    } catch {
      try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
        setCopied('done');
      } catch {
        setCopied('failed');
      }
    }
    window.setTimeout(() => setCopied('idle'), 2200);
  };

  return (
    <Button
      onClick={copyOrder}
      className={cn(
        'h-9 rounded-sm bg-sheet-accent px-2 text-[13px] font-medium text-sheet-accent-ink hover:bg-sheet-accent/90 active:translate-y-px sm:px-3',
        className
      )}
      title={t.copyOrder}
      aria-label={t.copyOrder}
    >
      {copied === 'done' ? (
        <CheckIcon size={14} aria-hidden="true" />
      ) : (
        <CopyIcon size={14} aria-hidden="true" />
      )}
      <span
        className={cn(
          'hidden whitespace-nowrap sm:inline',
          copied === 'failed' && 'text-sheet-accent-ink'
        )}
      >
        {copied === 'done' ? t.copiedOrder : copied === 'failed' ? t.copyFailed : t.copyOrder}
      </span>
    </Button>
  );
}
