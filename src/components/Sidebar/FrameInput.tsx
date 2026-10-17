import React, { useState, useEffect } from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';

interface FrameInputProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  isExceeding: boolean;
}

/**
 * A frame dimension in millimetres. Out of range is said with the warning tone
 * and a caption, not with a pulsing icon.
 */
export const FrameInput: React.FC<FrameInputProps> = ({
  value,
  min,
  max,
  onChange,
  isExceeding,
}) => {
  const [typed, setTyped] = useState(value.toString());

  useEffect(() => {
    setTyped(value.toString());
  }, [value]);

  const commit = () => {
    const parsed = parseFloat(typed);
    if (!isNaN(parsed) && isFinite(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
      setTyped(clamped.toString());
    } else {
      setTyped(value.toString());
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <InputGroup
        className={`h-9 rounded-sm bg-sheet-ground ${
          isExceeding ? 'border-sheet-warning' : 'border-sheet-ground'
        }`}
      >
        <InputGroupInput
          type="text"
          inputMode="decimal"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          aria-invalid={isExceeding}
          className="h-9 w-full px-2 text-center text-[16px] font-medium text-sheet-ink tnum"
        />
        <InputGroupAddon
          align="inline-end"
          className="pointer-events-none pr-2 text-[13px] text-sheet-muted"
        >
          mm
        </InputGroupAddon>
      </InputGroup>
      {isExceeding && (
        <span className="text-[13px] text-sheet-warning">
          {min}–{max} mm
        </span>
      )}
    </div>
  );
};
