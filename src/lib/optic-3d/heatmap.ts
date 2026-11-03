import * as THREE from "three";
import { DEG } from "../optic-engine/geometry";
import type { LensField } from "./field";

/**
 * The thickness map.
 *
 * The sheet states one edge figure — the thickest point on the rim — and draws
 * the section that carries it. Neither says where the material actually is. It
 * is not evenly spread: a decentred minus lens is thickest at the rim opposite
 * the pupil, and the ramp below is the only way to see that at a glance.
 *
 * The colour is computed from the geometry's own vertices, so the map can never
 * drift from the body it is painted on: each vertex's thickness is measured
 * from where that vertex actually sits, in the lens's own plane.
 */

/** The stops of the ramp, thin to thick, in the sheet's own prescription ink. */
const RAMP: [number, THREE.Color][] = [
  [0.0, new THREE.Color("#dcecf7")],
  [0.35, new THREE.Color("#9ecbe8")],
  [0.7, new THREE.Color("#4a9ed4")],
  [1.0, new THREE.Color("#156fb5")],
];

/** The colour of a thickness, given the range the lens spans. */
export function thicknessColor(value: number, min: number, max: number, target = new THREE.Color()): THREE.Color {
  const span = Math.max(max - min, 1e-9);
  const t = Math.min(1, Math.max(0, (value - min) / span));
  for (let i = 0; i < RAMP.length - 1; i += 1) {
    const [stopA, colorA] = RAMP[i];
    const [stopB, colorB] = RAMP[i + 1];
    if (t <= stopB) {
      const local = (t - stopA) / Math.max(stopB - stopA, 1e-9);
      return target.copy(colorA).lerp(colorB, Math.min(1, Math.max(0, local)));
    }
  }
  return target.copy(RAMP[RAMP.length - 1][1]);
}

/**
 * Paints a body with its own thickness.
 *
 * The range is the lens's own, not a fixed scale: a reader looking at a
 * plus lens and a minus lens should be reading blue-where-it-is-thick, not
 * comparing one prescription's millimetres against another's.
 */
export function paintThickness(
  geometry: THREE.BufferGeometry,
  field: LensField,
): { min: number; max: number } {
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const count = position.count;
  const colors = new Float32Array(count * 3);

  let min = Infinity;
  let max = -Infinity;
  const values = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const dx = x - field.opening.ocX;
    const dy = y - field.opening.ocY;
    const radius = Math.hypot(dx, dy);
    const theta = radius < 1e-12 ? 0 : (Math.atan2(dy, dx) / DEG + 360) % 360;
    const thickness = field.thicknessAt(theta, radius);
    const value = Number.isFinite(thickness) ? thickness : 0;
    values[i] = value;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  const color = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    thicknessColor(values[i], min, max, color);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return { min, max };
}
/**
 * The two figures the map spans, as the rail states them.
 *
 * The engine already reports both ends: the centre thickness and the thickest
 * rim point, and the thinnest rim point when it has one. Using its numbers
 * rather than the body's sampled extremes keeps the legend and the schedule
 * saying the same thing.
 */
export function thicknessRange(result: {
  ct: number;
  et: number;
  etMin?: number;
}): { min: number; max: number } {
  return {
    min: Math.min(result.ct, result.etMin ?? result.ct),
    max: result.et,
  };
}
