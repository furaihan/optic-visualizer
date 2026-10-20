import type { ReactNode } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

type SimulatorShellProps = {
  /** The desk: the sheet, the inspector column and the table. */
  desk: ReactNode;
  /** The phone: the drawing full-bleed, the tab bar, and the panel the tab names. */
  phone: ReactNode;
};

/**
 * The frame the simulator lives in.
 *
 * One composition is mounted at a time. The desk and the phone are different
 * documents, not one document hidden by a media query, so the phone never
 * carries a second copy of the drawing, the table and the title behind the one
 * it shows.
 */
export function SimulatorShell({ desk, phone }: SimulatorShellProps) {
  const isDesk = useMediaQuery('(min-width: 768px)');

  return (
    <div className="flex h-full min-w-0 flex-1 overflow-hidden bg-sheet-ground">
      {isDesk ? desk : phone}
    </div>
  );
}
