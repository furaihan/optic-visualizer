import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FrameParameters,
  PatientParameters,
  AsphericLensParameters,
  AsphericSurfaceConfig,
  AsphericCalculationResult,
  LensIndex,
  FrameType,
  CalculationResult,
} from '../lib/optic-engine/types';
import { calculateAsphericLens } from '../lib/optic-engine/aspheric';
import { validateOpticalParams, ValidationResult } from '../lib/optic-engine/validation';
import { MIN_THICKNESS_MM } from '../lib/optic-engine/geometry';

export interface AsphericParametersState {
  version?: number;
  lens: AsphericLensParameters;
  frame: FrameParameters;
  patient: PatientParameters;
  bevelPercent: number;
  frameType: FrameType;
  /** The thinnest the lens is allowed to be anywhere, in millimetres. */
  minThickness: number;
}

const CURRENT_SCHEMA_VERSION = 1;

const DEFAULT_ASPHERIC_SURFACE: AsphericSurfaceConfig = {
  conic: 0,
  A2: 0,
  A4: 0,
  A6: 0,
  A8: 0,
  isActive: false,
};

const DEFAULT_STATE: AsphericParametersState = {
  version: CURRENT_SCHEMA_VERSION,
  lens: {
    sph: -4.0,
    cyl: 0.0,
    axis: 0,
    index: 1.6,
    baseCurve: 4.0,
    asphericFront: { ...DEFAULT_ASPHERIC_SURFACE },
    asphericBack: { ...DEFAULT_ASPHERIC_SURFACE },
  },
  frame: {
    a: 52,
    b: 40,
    dbl: 18,
    depth: 6.0,
    ed: 54,
  },
  patient: {
    pd: 63,
    fittingHeight: 22,
  },
  bevelPercent: 0.33,
  frameType: "full" as FrameType,
  // A lens that is thinner than a millimetre anywhere has no strength left
  // in it, so that is the floor the engine works to.
  minThickness: MIN_THICKNESS_MM,
};

const STORAGE_KEY = 'amp_aspheric_session';

/**
 * The session the aspheric tool opens with: what was left on the last visit,
 * or the defaults when there is nothing to recover.
 */
function loadStoredState(): AsphericParametersState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && parsed.lens && parsed.frame) {
        if (parsed.version !== CURRENT_SCHEMA_VERSION) {
          return DEFAULT_STATE;
        }
        return { ...DEFAULT_STATE, ...parsed, lens: { ...DEFAULT_STATE.lens, ...parsed.lens } };
      }
    }
  } catch (e) {
    console.warn('Failed to recover stored aspheric session. Using defaults.', e);
  }
  return DEFAULT_STATE;
}

export function useAsphericState() {
  // The session carries its own history, so a coefficient typed in by mistake
  // can be taken back.
  const [session, setSession] = useState<{
    present: AsphericParametersState;
    past: AsphericParametersState[];
    future: AsphericParametersState[];
  }>(() => ({
    present: loadStoredState(),
    past: [],
    future: [],
  }));

  const state = session.present;

  const [highlightedLimit, setHighlightedLimit] = useState<'a' | 'b' | 'dbl' | 'ed' | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist aspheric session state.', e);
    }
  }, [state]);

  const updateState = useCallback((updater: (prev: AsphericParametersState) => AsphericParametersState) => {
    setSession((s) => ({
      present: updater(s.present),
      past: [...s.past.slice(-49), s.present],
      future: [],
    }));
  }, []);

  /** Steps back through the history. */
  const undo = useCallback(() => {
    setSession((s) => {
      if (s.past.length === 0) return s;
      return {
        present: s.past[s.past.length - 1],
        past: s.past.slice(0, -1),
        future: [s.present, ...s.future],
      };
    });
  }, []);

  /** Steps forward again. */
  const redo = useCallback(() => {
    setSession((s) => {
      if (s.future.length === 0) return s;
      return {
        present: s.future[0],
        past: [...s.past, s.present],
        future: s.future.slice(1),
      };
    });
  }, []);

  // The keyboard shortcuts the tool offers: Ctrl+Z and Ctrl+Y.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const setLens = useCallback((updated: AsphericLensParameters | ((p: AsphericLensParameters) => AsphericLensParameters)) => {
    updateState(prev => ({
      ...prev,
      lens: typeof updated === 'function' ? updated(prev.lens) : updated,
    }));
  }, [updateState]);

  const setFrame = useCallback((updated: FrameParameters | ((p: FrameParameters) => FrameParameters)) => {
    updateState(prev => ({
      ...prev,
      frame: typeof updated === 'function' ? updated(prev.frame) : updated,
    }));
  }, [updateState]);

  const setPatient = useCallback((updated: PatientParameters | ((p: PatientParameters) => PatientParameters)) => {
    updateState(prev => ({
      ...prev,
      patient: typeof updated === 'function' ? updated(prev.patient) : updated,
    }));
  }, [updateState]);

  const setBevelPercent = useCallback((val: number | ((p: number) => number)) => {
    updateState(prev => ({
      ...prev,
      bevelPercent: typeof val === 'function' ? val(prev.bevelPercent) : val,
    }));
  }, [updateState]);

  const setFrameType = useCallback((val: FrameType | ((p: FrameType) => FrameType)) => {
    updateState(prev => ({
      ...prev,
      frameType: typeof val === 'function' ? val(prev.frameType) : val,
    }));
  }, [updateState]);

  const setMinThickness = useCallback((val: number | ((p: number) => number)) => {
    updateState(prev => ({
      ...prev,
      minThickness: typeof val === 'function' ? val(prev.minThickness) : val,
    }));
  }, [updateState]);

  const setAsphericFront = useCallback((config: AsphericSurfaceConfig | ((p: AsphericSurfaceConfig) => AsphericSurfaceConfig)) => {
    updateState(prev => ({
      ...prev,
      lens: {
        ...prev.lens,
        asphericFront: typeof config === 'function' ? config(prev.lens.asphericFront) : config,
      },
    }));
  }, [updateState]);

  const setAsphericBack = useCallback((config: AsphericSurfaceConfig | ((p: AsphericSurfaceConfig) => AsphericSurfaceConfig)) => {
    updateState(prev => ({
      ...prev,
      lens: {
        ...prev.lens,
        asphericBack: typeof config === 'function' ? config(prev.lens.asphericBack) : config,
      },
    }));
  }, [updateState]);

  const resetSession = useCallback(() => {
    setSession((s) => ({
      present: DEFAULT_STATE,
      past: [...s.past.slice(-49), s.present],
      future: [],
    }));
  }, []);

  const validation: ValidationResult = useMemo(() => {
    return validateOpticalParams(
      {
        sph: state.lens.sph,
        cyl: state.lens.cyl,
        axis: state.lens.axis,
        index: state.lens.index,
        baseCurve: state.lens.baseCurve,
      },
      state.frame,
      state.patient,
    );
  }, [state.lens.sph, state.lens.cyl, state.lens.axis, state.lens.index, state.lens.baseCurve, state.frame, state.patient]);

  const result: AsphericCalculationResult = useMemo(() => {
    if (!validation.isValid) {
      console.warn('Invalid aspheric parameters, returning fallback:', validation.errors);
      return {
        error: true,
        errorMessage: validation.errors[0]?.messageEn || 'Invalid parameters',
        ct: 2.0,
        et: 2.0,
        anteriorProtrusion: 0,
        posteriorProtrusion: 0,
        r1: 0,
        r2: 0,
        backPower: 0,
        s1: 0,
        s2: 0,
        decentration: 0,
        y: 0,
        weight: 0,
        density: 1.32,
        departure: 0,
        recommendation: {
          index: 1.5,
          material: "CR-39",
          reason: "simErrorDesc",
          thinness: "Standard",
          abbe: 58,
        },
      };
    }
    return calculateAsphericLens(
      state.lens,
      state.frame,
      state.patient,
      state.minThickness,
      state.bevelPercent,
      state.frameType,
    );
  }, [state.lens, state.frame, state.patient, state.minThickness, state.bevelPercent, state.frameType, validation.isValid]);

  return {
    lens: state.lens,
    frame: state.frame,
    patient: state.patient,
    bevelPercent: state.bevelPercent,
    frameType: state.frameType,
    minThickness: state.minThickness,
    setLens,
    setFrame,
    setPatient,
    setBevelPercent,
    setFrameType,
    setMinThickness,
    setAsphericFront,
    setAsphericBack,

    result,
    validation,

    resetSession,
    undo,
    redo,
    canUndo: session.past.length > 0,
    canRedo: session.future.length > 0,
    highlightedLimit,
    setHighlightedLimit,
  };
}
