import { useSearch, useNavigate } from '@tanstack/react-router';
import { Sidebar } from '../Sidebar';
import { Visualizer } from '../Visualizer';
import { JobTicket } from '../sheet/JobTicket';
import { MeasurementSheet } from '../sheet/MeasurementSheet';
import { RecommendationRow } from '../sheet/RecommendationRow';
import { useOpticalContext } from '../../contexts/OpticalContext';
import ErrorBoundary from '../ErrorBoundary';
import type { SimulatorSearchParams } from '../../types/search-params';
import { translations } from '../../lib/translations';
import { WorkbenchLayout } from './WorkbenchLayout';
import { labOrderLines } from '../../lib/labOrder';
import { findingSentence } from '../../lib/verdict';

/**
 * The workbench, desktop.
 *
 * The sheet, the order and the table, in the order a lab reads them. The
 * drawing takes the height the rest of the frame leaves, so the sheet and its
 * schedule land inside the first screen.
 */
export function DesktopGrid() {
  const search = useSearch({ strict: false }) as unknown as SimulatorSearchParams;
  const lang = search.lang;
  const view = search.view;
  const navigate = useNavigate();
  const t = translations[lang];

  const {
    lens,
    frame,
    patient,
    bevelPercent,
    frameType,
    compareMode,
    compareIndex,
    result,
    compareResult,
    validation,
    resetSession,
  } = useOpticalContext();

  const compareLens = compareMode ? { ...lens, index: compareIndex } : undefined;

  const board = (
    <ErrorBoundary
      fallback={
        <div className="flex h-full items-center justify-center bg-sheet-panel p-6 text-[16px] text-sheet-ink">
          {t.simError}
        </div>
      }
    >
      <Visualizer
        lens={lens}
        frame={frame}
        patient={patient}
        result={result}
        compareResult={compareResult}
        compareLens={compareLens}
        lang={lang}
        view={view}
        frameType={frameType}
        highlightedLimit={null}
        bevelPercent={bevelPercent}
        variant="workbench"
      />
    </ErrorBoundary>
  );

  const ticket = (
    <JobTicket
      lens={lens}
      frame={frame}
      patient={patient}
      result={result}
      frameType={frameType}
      bevelPercent={bevelPercent}
      lang={lang}
      compareIndex={compareMode ? compareIndex : undefined}
      compareResult={compareResult}
      variant="compact"
    />
  );

  const table = (isAdvanced: boolean) => (
    <>
      <MeasurementSheet
        result={result}
        compareResult={compareResult}
        lang={lang}
        frame={frame}
        lens={lens}
        isAdvanced={isAdvanced}
      />
      <RecommendationRow result={result} lensIndex={lens.index} lang={lang} />
    </>
  );

  return (
    <WorkbenchLayout
      lang={lang}
      view={view}
      onViewChange={(v) => navigate({ search: { ...search, view: v } } as any)}
      title={t.workbenchTitle}
      finding={result.error ? t.workbenchLead : findingSentence(result, lens, t)}
      ticket={ticket}
      board={board}
      simple={table(false)}
      advanced={table(true)}
      inspector={<Sidebar lang={lang} />}
      order={labOrderLines(lens, frame, patient, result, frameType, bevelPercent, t)}
      onReset={resetSession}
      errors={validation.errors}
      figures={{
        framePd: frame.a + frame.dbl,
        decentration: result.decentration,
        minBlank: result.y * 2 + 2,
      }}
    />
  );
}
