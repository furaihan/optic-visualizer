import { useOpticalContext } from '../../contexts/OpticalContext';
import { translations } from '../../lib/translations';
import type { Language, View } from '../../types/search-params';
import { RotateCcwIcon, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../../lib/utils';
import { useState } from 'react';

type HeaderBarProps = {
  lang: Language;
  view: View;
  activeTab?: string;
  onViewChange: (view: View) => void;
};

/**
 * The toolbar of the workbench: which drawing you are looking at on the left,
 * the two session actions on the right. One flat surface, no chrome.
 */
export function HeaderBar({ lang, view, onViewChange }: HeaderBarProps) {
  const t = translations[lang];
  const { resetSession, lens, frame, patient, result, frameType, bevelPercent } = useOpticalContext();
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');

  /**
   * The lab order as plain text, the format a lab can paste into its own sheet.
   * Clipboard API first; a hidden textarea fallback for non-secure contexts.
   */
  const copyOrder = async () => {
    const signed = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)}`;
    const lines = [
      `${t.labOrder}`,
      `${t.rxLine}: SPH ${signed(lens.sph)}  CYL ${signed(lens.cyl)}  AXIS ${lens.axis}°  n ${lens.index.toFixed(2)}  BC ${lens.baseCurve.toFixed(2)}`,
      `${t.frameLine}: A ${frame.a}  B ${frame.b}  DBL ${frame.dbl}  ED ${frame.ed}  ${t.frameDepth} ${frame.depth.toFixed(1)} mm`,
      `${t.fittingLine}: PD ${patient.pd}  ${t.fittingHeight} ${patient.fittingHeight}  ${t.bevelPos} ${Math.round(bevelPercent * 100)}%`,
      `${t.edgeThick} ${result.et.toFixed(2)} mm  |  ${t.center} ${result.ct.toFixed(2)} mm`,
      `${t.anteriorProt} ${result.anteriorProtrusion.toFixed(2)} mm  |  ${t.posteriorProt} ${result.posteriorProtrusion.toFixed(2)} mm`,
      `${t.lensWeight} ${result.weight.toFixed(1)} g  |  ${t.minBlank} ${(result.y * 2 + 2).toFixed(0)} mm`,
      `${t.frameType}: ${frameType}`,
    ];
    const text = lines.join('\n');
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
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 bg-sheet-ground px-2 sm:gap-3 sm:px-4">
      <Tabs value={view} onValueChange={(v) => onViewChange(v as View)}>
        <TabsList className="h-9 gap-0 rounded-none bg-sheet-panel p-1">
          <TabsTrigger
            value="side"
            className="h-full rounded-none px-2 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none sm:px-3"
          >
            {t.sideProfile}
          </TabsTrigger>
          <TabsTrigger
            value="top"
            className="h-full rounded-none px-2 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none sm:px-3"
          >
            {t.topDown}
          </TabsTrigger>
          <TabsTrigger
            value="front"
            className="h-full rounded-none px-2 text-[13px] font-medium text-sheet-muted data-active:bg-sheet-ground data-active:text-sheet-ink group-data-[variant=default]/tabs-list:data-active:shadow-none sm:px-3"
          >
            {t.frontView}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          onClick={resetSession}
          className="h-9 rounded-sm px-2 text-[13px] font-medium text-sheet-muted hover:bg-sheet-panel hover:text-sheet-ink sm:px-2.5"
          title={t.resetTitle}
          aria-label={t.resetSession}
        >
          <RotateCcwIcon size={14} aria-hidden="true" />
          <span className="hidden sm:inline">{t.reset}</span>
        </Button>

        <Button
          onClick={copyOrder}
          className="h-9 rounded-sm bg-sheet-accent px-2 text-[13px] font-medium text-white hover:bg-sheet-accent/90 active:translate-y-px sm:px-3"
          title={t.copyOrder}
          aria-label={t.copyOrder}
        >
          {copied === 'done' ? (
            <CheckIcon size={14} aria-hidden="true" />
          ) : (
            <CopyIcon size={14} aria-hidden="true" />
          )}
          <span className={cn('hidden whitespace-nowrap sm:inline', copied === 'failed' && 'text-white')}>
            {copied === 'done' ? t.copiedOrder : copied === 'failed' ? t.copyFailed : t.copyOrder}
          </span>
        </Button>
      </div>
    </header>
  );
}
