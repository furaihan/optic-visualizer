import React from "react";
import { LensIndex } from "../../lib/optic-engine/types";
import { translations, Language } from "../../lib/translations";
import { ChevronDownIcon, EyeIcon } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../ui/dropdown-menu";
import { Field, FieldLabel, FieldContent } from "../ui/field";
import { LabelWithTooltip } from "./LabelWithTooltip";

interface RefractiveIndexDropdownProps {
  index: LensIndex;
  onChange: (index: LensIndex) => void;
  indices: LensIndex[];
  lang: Language;
  showLabel?: boolean;
  showIcon?: boolean;
}

export const RefractiveIndexDropdown: React.FC<RefractiveIndexDropdownProps> = ({
  index,
  onChange,
  indices,
  lang,
  showLabel = true,
  showIcon = true,
}) => {
  const t = translations[lang];

  if (!showLabel) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-between h-8 px-3 font-semibold text-xs",
          )}
          aria-label={t.refractiveIndex}
        >
          <span>{index.toFixed(2)}</span>
          <ChevronDownIcon size={14} className="opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[var(--anchor-width)] min-w-0"
          align="start"
        >
          <DropdownMenuRadioGroup
            value={index.toString()}
            onValueChange={(val) => onChange(parseFloat(val) as LensIndex)}
          >
            {indices.map((idx) => (
              <DropdownMenuRadioItem
                key={idx}
                value={idx.toString()}
                className="font-medium text-xs"
              >
                {idx.toFixed(2)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Field orientation="vertical">
      <FieldLabel className="w-auto flex-none m-0 items-center">
        <LabelWithTooltip
          label={t.refractiveIndex}
          lang={lang}
          className="select-none leading-tight dark:text-slate-300"
          icon={
            showIcon ? (
              <EyeIcon size={13} className="text-blue-500" />
            ) : undefined
          }
        />
      </FieldLabel>
      <FieldContent>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full justify-between h-9 px-3 font-semibold text-xs",
            )}
            aria-label={t.refractiveIndex}
          >
            {index.toFixed(2)}
            <ChevronDownIcon size={14} className="opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--anchor-width)] min-w-0"
            align="start"
          >
            <DropdownMenuRadioGroup
              value={index.toString()}
              onValueChange={(val) => onChange(parseFloat(val) as LensIndex)}
            >
              {indices.map((idx) => (
                <DropdownMenuRadioItem
                  key={idx}
                  value={idx.toString()}
                  className="font-medium text-xs"
                >
                  {idx.toFixed(2)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </FieldContent>
    </Field>
  );
};
