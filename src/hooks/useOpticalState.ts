import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  LensParameters, 
  FrameParameters, 
  PatientParameters, 
  FrameType,  
  CalculationResult,
  LensIndex
} from '../lib/optic-engine/types';
import { calculateLens } from '../lib/optic-engine/optical';
import { validateOpticalParams, ValidationResult } from '../lib/optic-engine/validation';
import { MIN_THICKNESS_MM } from '../lib/optic-engine/geometry';

export interface OpticalParametersState {
  version?: number;
  lens: LensParameters;
  frame: FrameParameters;
  patient: PatientParameters;
  bevelPercent: number;
  frameType: FrameType;
  /** The thinnest the lens is allowed to be anywhere, in millimetres. */
  minThickness: number;
}

const CURRENT_SCHEMA_VERSION = 1;

const DEFAULT_STATE: OpticalParametersState = {
  version: CURRENT_SCHEMA_VERSION,
  lens: {
    sph: -4.0,
    cyl: 0.0,
    axis: 0,
    index: 1.6,
    baseCurve: 4.0,
  },
  frame: {
    a: 52,
    b: 40,
    dbl: 18,
    // A modern rim is around six millimetres deep. A shallower one cannot
    // take the back of a minus lens, and the tool would rightly say so — but
    // the case the tool opens with should be a lens that fits.
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

const STORAGE_KEY = 'amp_optical_session';

/**
 * The session the tool opens with: what was left on the last visit, or the
 * defaults when there is nothing to recover.
 */
function loadStoredState(): OpticalParametersState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && parsed.lens && parsed.frame) {
        if (parsed.version !== CURRENT_SCHEMA_VERSION) {
          console.log(`Schema version mismatch (found ${parsed.version}, expected ${CURRENT_SCHEMA_VERSION}). Migrating or dropping old data.`);
          return DEFAULT_STATE;
        }
        return { ...DEFAULT_STATE, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Failed to recover stored optic session. Using defaults.', e);
  }
  return DEFAULT_STATE;
}

export function useOpticalState() {
  // The session carries its own history: the states the optician has been
  // through, so a value typed in by mistake can be taken back.
  const [session, setSession] = useState<{
    present: OpticalParametersState;
    past: OpticalParametersState[];
    future: OpticalParametersState[];
  }>(() => ({
    present: loadStoredState(),
    past: [],
    future: [],
  }));

  const state = session.present;

  // Compare mode states (does not need undo/redo tracking)
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareIndex, setCompareIndex] = useState<LensIndex>(1.74);
  const [highlightedLimit, setHighlightedLimit] = useState<'a' | 'b' | 'dbl' | 'ed' | null>(null);

  // Persist current state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist optical session state.', e);
    }
  }, [state]);

  const updateState = useCallback((updater: (prev: OpticalParametersState) => OpticalParametersState) => {
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

  // Action methods to change specific parameter groups
  const setLens = useCallback((updatedLens: LensParameters | ((p: LensParameters) => LensParameters)) => {
    updateState(prev => ({
      ...prev,
      lens: typeof updatedLens === 'function' ? updatedLens(prev.lens) : updatedLens
    }));
  }, [updateState]);

  const setFrame = useCallback((updatedFrame: FrameParameters | ((p: FrameParameters) => FrameParameters)) => {
    updateState(prev => ({
      ...prev,
      frame: typeof updatedFrame === 'function' ? updatedFrame(prev.frame) : updatedFrame
    }));
  }, [updateState]);

  const setPatient = useCallback((updatedPatient: PatientParameters | ((p: PatientParameters) => PatientParameters)) => {
    updateState(prev => ({
      ...prev,
      patient: typeof updatedPatient === 'function' ? updatedPatient(prev.patient) : updatedPatient
    }));
  }, [updateState]);

  const setBevelPercent = useCallback((val: number | ((p: number) => number)) => {
    updateState(prev => ({
      ...prev,
      bevelPercent: typeof val === 'function' ? val(prev.bevelPercent) : val
    }));
  }, [updateState]);

  const setFrameType = useCallback((val: FrameType | ((p: FrameType) => FrameType)) => {
    updateState(prev => ({
      ...prev,
      frameType: typeof val === 'function' ? val(prev.frameType) : val
    }));
  }, [updateState]);

  const setMinThickness = useCallback((val: number | ((p: number) => number)) => {
    updateState(prev => ({
      ...prev,
      minThickness: typeof val === 'function' ? val(prev.minThickness) : val
    }));
  }, [updateState]);

  // Reset helper
  const resetSession = useCallback(() => {
    setSession((s) => ({
      present: DEFAULT_STATE,
      past: [...s.past.slice(-49), s.present],
      future: [],
    }));
    setCompareMode(false);
    setCompareIndex(1.74);
  }, []);

  // 2. Perform validations BEFORE running calculations to catch silent/NaN failures
  const validation: ValidationResult = useMemo(() => {
    return validateOpticalParams(state.lens, state.frame, state.patient);
  }, [state.lens, state.frame, state.patient]);

  // 3. Calculation Engine (Pure calculations)
  const result: CalculationResult = useMemo(() => {
    if (!validation.isValid) {
      console.warn('Invalid optical parameters, returning fallback:', validation.errors);
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
        recommendation: {
          index: 1.5,
          material: "CR-39",
          reason: "simErrorDesc",
          thinness: "Standard",
          abbe: 58
        }
      };
    }
    // If invalid parameters, calculateLens will fall back gracefully or cap values internally
    return calculateLens(
      state.lens,
      state.frame,
      state.patient,
      state.minThickness,
      state.bevelPercent,
      state.frameType
    );
  }, [state.lens, state.frame, state.patient, state.minThickness, state.bevelPercent, state.frameType, validation.isValid]);

  const compareResult: CalculationResult | undefined = useMemo(() => {
    if (!compareMode) return undefined;
    if (!validation.isValid) return undefined;
    return calculateLens(
      { ...state.lens, index: compareIndex },
      state.frame,
      state.patient,
      state.minThickness,
      state.bevelPercent,
      state.frameType
    );
  }, [state.lens, state.frame, state.patient, state.minThickness, state.bevelPercent, state.frameType, compareMode, compareIndex, validation.isValid]);

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
    
    // Compare Mode
    compareMode,
    setCompareMode,
    compareIndex,
    setCompareIndex,

    // Calculations & Validation results
    result,
    compareResult,
    validation,

    // Session Control
    resetSession,
    undo,
    redo,
    canUndo: session.past.length > 0,
    canRedo: session.future.length > 0,

    highlightedLimit,
    setHighlightedLimit
  };
}
