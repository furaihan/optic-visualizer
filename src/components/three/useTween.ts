import { useCallback, useEffect, useRef } from "react";

/**
 * The one place motion is allowed to run.
 *
 * Every tween on the surface goes through here, for one reason: the optician
 * must be able to stop it. A camera easing into a preset while a patient is
 * looking at the screen is not a flourish, it is a thing that will not hold
 * still. So this hook owns a single freeze switch, it is bound to
 * `prefers-reduced-motion`, and it exposes the switch so the surface can put
 * it in the optician's hand.
 */
export interface TweenState {
  /** True while motion is stopped, whether by the system or by the optician. */
  frozen: boolean;
  setFrozen: (frozen: boolean) => void;
  /** The system's own preference, which the optician's switch cannot override. */
  reduced: boolean;
  /** True when motion may run. */
  active: () => boolean;
}

let globalFrozen = false;
const listeners = new Set<(frozen: boolean) => void>();

/** Stops or resumes every tween on the surface at once. */
export function setMotionFrozen(frozen: boolean): void {
  globalFrozen = frozen;
  for (const listener of listeners) listener(frozen);
}

export function useTweenState(): TweenState {
  const reducedRef = useRef(false);
  const frozenRef = useRef(globalFrozen);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = query.matches;
    const sync = () => {
      reducedRef.current = query.matches;
    };
    query.addEventListener("change", sync);
    const listener = (frozen: boolean) => {
      frozenRef.current = frozen;
    };
    listeners.add(listener);
    return () => {
      query.removeEventListener("change", sync);
      listeners.delete(listener);
    };
  }, []);

  const setFrozen = useCallback((frozen: boolean) => {
    setMotionFrozen(frozen);
  }, []);

  const active = useCallback(() => !frozenRef.current && !reducedRef.current, []);

  return {
    frozen: frozenRef.current,
    setFrozen,
    reduced: reducedRef.current,
    active,
  };
}
