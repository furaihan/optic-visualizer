/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  LensParameters, 
  FrameParameters, 
  PatientParameters, 
  FrameType, 
  calculateLens, 
  CalculationResult 
} from '../lib/optical';
import { validateOpticalParams, ValidationResult } from '../lib/validation';

export interface OpticalParametersState {
  lens: LensParameters;
  frame: FrameParameters;
  patient: PatientParameters;
  bevelPercent: number;
  frameType: FrameType;
}

const DEFAULT_STATE: OpticalParametersState = {
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
  // 1. Core State History Stack
  const [history, setHistory] = useState<OpticalParametersState[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.lens && parsed.frame) {
          return [parsed];
        }
      }
    } catch (e) {
      console.warn('Failed to recover stored optic session. Using defaults.', e);
    }
    return [DEFAULT_STATE];
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Compare mode states (does not need undo/redo tracking)
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareIndex, setCompareIndex] = useState<number>(1.74);

  // Active current state
  const state = useMemo(() => {
    return history[currentIndex] || DEFAULT_STATE;
  }, [history, currentIndex]);

  // Persist current state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist optical session state.', e);
    }
  }, [state]);

  // Push new state to history
  const updateState = useCallback((updater: (prev: OpticalParametersState) => OpticalParametersState) => {
    setHistory(prev => {
      const nextState = updater(state);
      // Avoid pushing identical duplicates
      if (JSON.stringify(nextState) === JSON.stringify(state)) {
        return prev;
      }
      const trimmedHistory = prev.slice(0, currentIndex + 1);
      const newHistory = [...trimmedHistory, nextState];
      // Limit history to 50 items to keep RAM clear
      if (newHistory.length > 50) {
        const sliced = newHistory.slice(newHistory.length - 50);
        setCurrentIndex(sliced.length - 1);
        return sliced;
      }
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [state, currentIndex]);

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

  // Undo / Redo controls
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Reset helper
  const resetSession = useCallback(() => {
    setHistory([DEFAULT_STATE]);
    setCurrentIndex(0);
    setCompareMode(false);
    setCompareIndex(1.74);
  }, []);

  // 2. Perform validations BEFORE running calculations to catch silent/NaN failures
  const validation: ValidationResult = useMemo(() => {
    return validateOpticalParams(state.lens, state.frame, state.patient);
  }, [state.lens, state.frame, state.patient]);

  // 3. Calculation Engine (Pure calculations)
  const result: CalculationResult = useMemo(() => {
    // If invalid parameters, calculateLens will fall back gracefully or cap values internally
    return calculateLens(
      state.lens, 
      state.frame, 
      state.patient, 
      1.0, 
      state.bevelPercent, 
      state.frameType
    );
  }, [state.lens, state.frame, state.patient, state.bevelPercent, state.frameType]);

  const compareResult: CalculationResult | undefined = useMemo(() => {
    if (!compareMode) return undefined;
    return calculateLens(
      { ...state.lens, index: compareIndex },
      state.frame,
      state.patient,
      1.0,
      state.bevelPercent,
      state.frameType
    );
  }, [state.lens, state.frame, state.patient, state.bevelPercent, state.frameType, compareMode, compareIndex]);

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

    // History Control
    undo,
    redo,
    canUndo,
    canRedo,
    resetSession,
    historyDepth: history.length,
    currentHistoryIndex: currentIndex
  };
}
