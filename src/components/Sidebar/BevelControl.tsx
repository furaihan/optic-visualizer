import { Language, translations } from "@/src/lib/translations/";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@shadcn/input-group";
import { Field, FieldLabel } from "@shadcn/field";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Slider } from "@shadcn/slider";
import { ZapIcon } from "lucide-react";
/**
 * BevelControl - Bevel positioning slider + percentage input
 */
interface BevelControlProps {
  bevelPercent: number;
  onBevelChange: (percent: number) => void;
  lang: Language;
}


export const BevelControl: React.FC<BevelControlProps> = ({
  bevelPercent,
  onBevelChange,
  lang,
}) => {
  const t = translations[lang];

  return (
    <Field orientation="vertical" className="pt-2">
      <FieldLabel className="w-auto flex-none m-0 items-center">
        <LabelWithTooltip
          label={t.bevelPos}
          lang={lang}
          isUppercaseHeader
          className="text-[10px] text-slate-400 font-bold uppercase tracking-wider"
          icon={<ZapIcon size={11} className="text-orange-500" />}
        />
      </FieldLabel>
      <div className="flex flex-row items-center gap-2 sm:gap-3 mt-1 w-full">
        {/* Label Front */}
        <span className="text-[9px] font-bold text-slate-400 min-w-fit">
          {t.bevelFront}
        </span>

        {/* Slider */}
        <div className="flex-1 w-full min-w-0">
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[bevelPercent]}
            onValueChange={(val: readonly number[] | number) =>
              onBevelChange(Array.isArray(val) ? val[0] : (val as number))
            }
            className="w-full cursor-pointer"
            aria-label="Bevel positioning slider"
          />
        </div>

        {/* Label Back */}
        <span className="text-[9px] font-bold text-slate-400 min-w-fit">
          {t.bevelBack}
        </span>

        {/* Percentage Input */}
        <div className="w-18 min-w-[72px] shrink-0">
          <InputGroup className="h-7 w-full border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <InputGroupInput
              type="number"
              min={0}
              max={100}
              step={1}
              value={Math.round(bevelPercent * 100)}
              onChange={(e) =>
                onBevelChange(
                  Math.min(
                    100,
                    Math.max(0, parseFloat(e.target.value || "0")),
                  ) / 100,
                )
              }
              className="w-full h-7 pl-2 pr-1 text-[11px] font-mono font-bold hover:bg-slate-50 dark:hover:bg-slate-900"
              aria-label="Bevel percentage numeric input"
            />
            <InputGroupAddon
              align="inline-end"
              className="pr-2 pl-0 text-[10px] text-slate-400 pointer-events-none"
            >
              %
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </Field>
  );
};