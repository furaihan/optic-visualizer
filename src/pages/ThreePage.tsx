import { ThreeSurface } from "../components/three/ThreeSurface";

/**
 * The 3D view of the lens.
 *
 * It sits beside /visualizer and /aspheric under the same simulator layout, so
 * it shares the session, the inspector and the history. What differs is the
 * board: this route draws the body, and the sheet draws the section.
 */
export default function ThreePage() {
  return <ThreeSurface />;
}
