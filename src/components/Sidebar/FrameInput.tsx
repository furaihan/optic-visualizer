import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';

interface FrameInputProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  isExceeding: boolean;
}

export const FrameInput: React.FC<FrameInputProps> = ({ 
  value, 
  min, 
  max, 
  onChange, 
  isExceeding 
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
    <Input
      type="text"
      value={typed}
      onChange={(e) => setTyped(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
      className={`w-full text-center text-xs font-mono font-bold bg-white dark:bg-slate-950 border h-8 ${
        isExceeding 
          ? 'border-amber-500 text-amber-600 dark:text-amber-400 focus:ring-amber-500 focus:border-amber-500' 
          : 'border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 focus:border-blue-500'
      }`}
    />
  );
};
