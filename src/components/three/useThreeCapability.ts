import { useEffect, useState } from "react";

/**
 * Whether this device can carry the 3D view.
 *
 * The 3D surface is gated by capability, not by width: a phone at a dispensing
 * table is the device this tool was written for, and it must never be shown a
 * half-built viewport. So three things are asked before a scene is created:
 *
 *   - is the pointer coarse, or the viewport narrow, both of which mean the
 *     screen is too small to read a body on;
 *   - is there a WebGL context at all;
 *   - and can one actually be created right now.
 *
 * A device that fails any of them gets the notice and the way back, never a
 * black rectangle.
 */
export type Capability = "pending" | "ready" | "unsupported";

/**
 * The narrowest viewport the surface is offered on.
 *
 * Deliberately above the simulator's own desk breakpoint: the surface spends a
 * rail on figures and the rest on the body, and below this the body is a
 * thumbnail with a price tag beside it.
 */
const MIN_WIDTH = 1024;

function probe(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ??
      canvas.getContext("webgl");
    if (!context) return false;
    // Release the probe context rather than leaving it to the collector: a
    // browser allows few live contexts, and the real scene needs one.
    const lose = (context as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function useThreeCapability(): Capability {
  const [capability, setCapability] = useState<Capability>("pending");

  useEffect(() => {
    const coarse =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(pointer: coarse)").matches
        : false;
    const narrow = window.innerWidth < MIN_WIDTH;

    if (coarse || narrow) {
      setCapability("unsupported");
      return;
    }
    if (!probe()) {
      setCapability("unsupported");
      return;
    }
    setCapability("ready");
  }, []);

  return capability;
}
