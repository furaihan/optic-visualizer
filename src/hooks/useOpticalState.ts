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

export interface OpticalParametersState {
  version?: number;
  lens: LensParameters;
  frame: FrameParameters;
  patient: PatientParameters;
  bevelPercent: number;
  frameType: FrameType;
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
    depth: 4.5,
    ed: 54,
  },
  patient: {
    pd: 63,
    fittingHeight: 22,
  },
  bevelPercent: 0.33,
  frameType: "full" as FrameType
};

const STORAGE_KEY = 'amp_optical_session';

export function useOpticalState() {
  const [state, setState] = useState<OpticalParametersState>(() => {
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
  });

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
    setState(updater);
  }, []);

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

  // Reset helper
  const resetSession = useCallback(() => {
    setState(DEFAULT_STATE);
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
      1.0, 
      state.bevelPercent, 
      state.frameType
    );
  }, [state.lens, state.frame, state.patient, state.bevelPercent, state.frameType, validation.isValid]);

  const compareResult: CalculationResult | undefined = useMemo(() => {
    if (!compareMode) return undefined;
    if (!validation.isValid) return undefined;
    return calculateLens(
      { ...state.lens, index: compareIndex },
      state.frame,
      state.patient,
      1.0,
      state.bevelPercent,
      state.frameType
    );
  }, [state.lens, state.frame, state.patient, state.bevelPercent, state.frameType, compareMode, compareIndex, validation.isValid]);

  return {
    lens: state.lens,
    frame: state.frame,
    patient: state.patient,
    bevelPercent: state.bevelPercent,
    frameType: state.frameType,
    setLens,
    setFrame,
    setPatient,
    setBevelPercent,
    setFrameType,
    
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

    highlightedLimit,
    setHighlightedLimit
  };
}
