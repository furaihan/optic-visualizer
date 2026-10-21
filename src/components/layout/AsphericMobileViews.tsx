import { useSearch, useNavigate } from '@tanstack/react-router';
import { AsphericSidebar } from '../AsphericSidebar';
import { AsphericVisualizer } from '../AsphericVisualizer';
import { JobTicket } from '../sheet/JobTicket';
import { MeasurementSheet } from '../sheet/MeasurementSheet';
import { RecommendationRow } from '../sheet/RecommendationRow';
import { useAsphericContext } from '../../contexts/AsphericContext';
import type { CalculationResult } from '../../lib/optic-engine/types';
import ErrorBoundary from '../ErrorBoundary';
import type { SimulatorSearchParams } from '../../types/search-params';
import { translations } from '../../lib/translations';
import { MobileWorkbench } from './MobileWorkbench';
import { labOrderLines } from '../../lib/labOrder';
import { findingSentence } from '../../lib/verdict';

/**
 * The aspheric workbench on a phone: its own drawing, its own inspector and
 * its own copy of the order. The spherical phone sheet is a different
 * document.
 */
export function AsphericMobileViews() {
  const search = useSearch({ strict: false }) as unknown as SimulatorSearchParams;
  const lang = search.lang;
  const view = search.view;
  const activeTab = search.activeTab;
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
    undo,
    redo,
    canUndo,
    canRedo,
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
        onViewChange={(v) => navigate({ search: { ...search, view: v } } as any)}
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
    <MobileWorkbench
      lang={lang}
      activeTab={activeTab}
      onTabChange={(tab) => navigate({ search: { ...search, activeTab: tab } } as any)}
      title={t.asphericWorkbenchTitle}
      finding={
        result.error ? t.asphericWorkbenchLead : findingSentence(result as any, lensForSheet, t)
      }
      board={board}
      ticket={ticket}
      simple={table(false)}
      advanced={table(true)}
      parameters={<AsphericSidebar lang={lang} isMobile />}
      order={labOrderLines(lensForSheet, frame, patient, result as any, frameType, bevelPercent, t)}
      onReset={resetSession}
      onUndo={undo}
      onRedo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
      errors={validation.errors}
      figures={{
        framePd: frame.a + frame.dbl,
        decentration: result.decentration,
        minBlank: (result.minBlank ?? result.y * 2 + 2),
      }}
    />
  );
}
