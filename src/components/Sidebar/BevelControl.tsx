import { Language, translations } from "@/src/lib/translations/";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@shadcn/input-group";
import { Field, FieldLabel } from "@shadcn/field";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Slider } from "@shadcn/slider";

/**
 * Bevel position: where the rim grips the edge, from the front surface to the
 * back, as a share of the frame depth. The slider and the percentage are the
 * same value; the drawing walks the groove as it moves.
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
    <Field orientation="vertical" className="gap-2 pt-1">
      <FieldLabel className="m-0 w-auto flex-none items-center">
        <LabelWithTooltip label={t.bevelPos} lang={lang} />
      </FieldLabel>

      <div className="flex w-full items-center gap-3">
        <span className="text-[13px] text-sheet-muted">{t.bevelFront}</span>
        <div className="min-w-0 flex-1">
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[bevelPercent]}
            onValueChange={(val: readonly number[] | number) =>
              onBevelChange(Array.isArray(val) ? val[0] : (val as number))
            }
            className="w-full cursor-pointer"
            aria-label={t.bevelPos}
          />
        </div>
        <span className="text-[13px] text-sheet-muted">{t.bevelBack}</span>

        <div className="w-[68px] shrink-0">
          <InputGroup className="h-9 rounded-sm border-sheet-ground bg-sheet-ground">
            <InputGroupInput
              type="number"
              min={0}
              max={100}
              step={1}
              value={Math.round(bevelPercent * 100)}
              onChange={(e) =>
                onBevelChange(
                  Math.min(100, Math.max(0, parseFloat(e.target.value || "0"))) / 100,
                )
              }
              className="h-9 w-full pl-2 pr-1 text-[16px] font-medium text-sheet-ink tnum"
              aria-label={t.bevelPos}
            />
            <InputGroupAddon
              align="inline-end"
              className="pointer-events-none pl-0 pr-2 text-[13px] text-sheet-muted"
            >
              %
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </Field>
  );
};
