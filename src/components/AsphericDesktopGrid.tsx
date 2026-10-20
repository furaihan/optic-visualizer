import { useSearch, useNavigate } from '@tanstack/react-router';
import { AsphericSidebar } from './AsphericSidebar';
import { AsphericVisualizer } from './AsphericVisualizer';
import { JobTicket } from './sheet/JobTicket';
import { MeasurementSheet } from './sheet/MeasurementSheet';
import { RecommendationRow } from './sheet/RecommendationRow';
import { useAsphericContext } from '../contexts/AsphericContext';
import type { CalculationResult } from '../lib/optic-engine/types';
import ErrorBoundary from './ErrorBoundary';
import type { SimulatorSearchParams } from '../types/search-params';
import { translations } from '../lib/translations';
import { WorkbenchLayout } from './layout/WorkbenchLayout';
import { labOrderLines } from '../lib/labOrder';
import { findingSentence } from '../lib/verdict';

/**
 * The aspheric workbench. The same desk as the spherical one, with the
 * aspheric surface in the drawing and the aspheric parameters in the
 * inspector.
 */
export function AsphericDesktopGrid() {
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
    result,
    validation,
    resetSession,
  } = useAsphericContext();

  const lensForSheet = {
    sph: lens.sph,
    cyl: lens.cyl,
    axis: lens.axis,
    index: lens.index,
    baseCurve: lens.baseCurve,
  };

  // The conic of the surface that is switched on is the engine's own figure,
  // so it travels with the result into the table.
  const resultForSheet = {
    ...result,
    conic: lens.asphericFront.isActive ? lens.asphericFront.conic : lens.asphericBack.conic,
  } as CalculationResult;

  const board = (
    <ErrorBoundary
      fallback={
        <div className="flex h-full items-center justify-center bg-sheet-panel p-6 text-[16px] text-sheet-ink">
          {t.simError}
        </div>
      }
    >
      <AsphericVisualizer
        lens={lens}
        frame={frame}
        patient={patient}
        result={result}
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
      lens={lensForSheet}
      frame={frame}
      patient={patient}
      result={result as any}
      frameType={frameType}
      bevelPercent={bevelPercent}
      lang={lang}
      variant="compact"
    />
  );

  const table = (isAdvanced: boolean) => (
    <>
      <MeasurementSheet
        result={resultForSheet}
        lang={lang}
        frame={frame}
        lens={lensForSheet}
        isAdvanced={isAdvanced}
      />
      <RecommendationRow result={result as any} lensIndex={lens.index} lang={lang} />
    </>
  );

  return (
    <WorkbenchLayout
      lang={lang}
      view={view}
      onViewChange={(v) => navigate({ search: { ...search, view: v } } as any)}
      title={t.asphericWorkbenchTitle}
      finding={
        result.error ? t.asphericWorkbenchLead : findingSentence(result as any, lensForSheet, t)
      }
      ticket={ticket}
      board={board}
      simple={table(false)}
      advanced={table(true)}
      inspector={<AsphericSidebar lang={lang} />}
      order={labOrderLines(lensForSheet, frame, patient, result as any, frameType, bevelPercent, t)}
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
