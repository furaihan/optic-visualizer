import * as THREE from "three";
import type { FrameType } from "../optic-engine/types";
import type { FrameParameters, PatientParameters } from "../optic-engine/types";
import { buildOpening, DEG, type OpeningGeometry } from "../optic-engine/geometry";
import { emptyPart, grownOpeningRadius, mergeParts, push, quad, toGeometry } from "./geo";
import type { LensField } from "./field";

/**
 * The frame, as far as the model actually reaches.
 *
 * What this file draws
 * --------------------
 * The frame the engine knows: a rim band around an opening, and the second
 * opening beside it across the bridge. The band has a front face, an outer
 * face, and a back face, and its inner edge is the bevel groove the lens sits
 * in — so the band is a section of the frame, not a picture of one.
 *
 * What this file refuses to draw
 * ------------------------------
 * Wrap, a front base curve, pantoscopic tilt, and an acetate nose pad: the
 * model is a flat plane and says so, and none of those are calculated. The
 * silhouette the surface shows is the rim band and the bridge, quiet and
 * unreactive, so the lens stays the only object that refracts.
 *
 * A half rim has material below the lens and a cord above it; a rimless frame
 * has no band at all, only the drill points. Both are drawn as the frame type
 * says, because drawing a full rim on a rimless frame would be the exact lie
 * the tool exists to avoid.
 */

/** How wide the rim band is around the opening, in millimetres. */
export const RIM_BAND = 2.5;

/** How many points the band is walked in. */
const BAND_SEGMENTS = 180;

export interface FrameGeometryOptions {
  frameType: FrameType;
  /** Where along the depth the groove sits, as a share of the frame's depth. */
  bevelPercent: number;
  /** Whether to build the second opening across the bridge. */
  secondOpening?: boolean;
}

export interface FrameSides {
  top: boolean;
  bottom: boolean;
}

/** Which sides of the opening the frame type actually holds the lens by. */
export function frameSides(frameType: FrameType): FrameSides {
  return {
    top: frameType === "full",
    bottom: frameType === "full" || frameType === "half",
  };
}

/**
 * The point on the grown rim band at a direction, at a given depth.
 *
 * A band is the opening grown outward by its width: the same A x B box cut
 * back by the same ED circle, both grown by the band. Growing one constraint
 * and not the other would make the band wander off the frame.
 */
function bandPoint(
  opening: OpeningGeometry,
  theta: number,
  expand: number,
  z: number,
): { x: number; y: number; z: number } {
  const radius = grownOpeningRadius(opening, theta, expand);
  return {
    x: radius * Math.cos(theta * DEG),
    y: radius * Math.sin(theta * DEG),
    z,
  };
}

/** The point on the opening itself at a direction — where the groove bites. */
function openingPoint(
  opening: OpeningGeometry,
  theta: number,
  z: number,
): { x: number; y: number; z: number } {
  const radius = grownOpeningRadius(opening, theta, 0);
  return {
    x: radius * Math.cos(theta * DEG),
    y: radius * Math.sin(theta * DEG),
    z,
  };
}

/** Is this direction on a side of the opening the frame type holds? */
function sideHeld(sides: FrameSides, theta: number): boolean {
  const normalized = ((theta % 360) + 360) % 360;
  // The band is held where the frame has material: above for a full rim,
  // below for a full or half rim, and nothing at all for a rimless frame.
  const vertical = Math.sin(normalized * DEG);
  if (vertical > 0.5) return sides.top;
  if (vertical < -0.5) return sides.bottom;
  // The sides are held by the rim wherever either side of it is: a half rim's
  // cord still runs round the sides, and a full rim's band does too.
  return sides.top || sides.bottom;
}

/**
 * The rim band, as a solid section: front face, outer face, back face.
 *
 * The order of the three faces matters for the bevel: the front face runs from
 * the opening outward, the outer face from the front to the back, and the back
 * face from the outer edge back to the opening. Together they close the band
 * without a cap at the ends, which is what makes the band read as a section of
 * a longer frame rather than a floating ring.
 */
function buildBand(
  opening: OpeningGeometry,
  depth: number,
  zFront: number,
  sides: FrameSides,
  width = RIM_BAND,
): THREE.BufferGeometry {
  const part = emptyPart();
  const zBack = zFront + depth;
  const rings = [
    { expand: 0, z: zFront, v: 0 },
    { expand: width, z: zFront, v: 0.25 },
    { expand: width, z: zBack, v: 0.5 },
    { expand: 0, z: zBack, v: 0.75 },
    { expand: 0, z: zFront, v: 1 },
  ];

  for (let r = 0; r < rings.length; r += 1) {
    const ring = rings[r];
    for (let i = 0; i < BAND_SEGMENTS; i += 1) {
      const theta = (360 * i) / BAND_SEGMENTS;
      if (!sideHeld(sides, theta)) {
        // A direction the frame does not hold gets a collapsed ring, so the
        // band still has the same topology everywhere and the gap is a gap
        // rather than a hole in the buffer.
        push(part, 0, 0, ring.z, i / BAND_SEGMENTS, ring.v);
        continue;
      }
      const point =
        ring.expand === 0
          ? openingPoint(opening, theta, ring.z)
          : bandPoint(opening, theta, ring.expand, ring.z);
      push(part, point.x, point.y, point.z, i / BAND_SEGMENTS, ring.v);
    }
  }

  for (let r = 0; r < rings.length - 1; r += 1) {
    for (let i = 0; i < BAND_SEGMENTS; i += 1) {
      const next = (i + 1) % BAND_SEGMENTS;
      const theta = (360 * i) / BAND_SEGMENTS;
      const nextTheta = (360 * next) / BAND_SEGMENTS;
      if (!sideHeld(sides, theta) || !sideHeld(sides, nextTheta)) continue;
      const a = r * BAND_SEGMENTS + i;
      const b = r * BAND_SEGMENTS + next;
      const c = (r + 1) * BAND_SEGMENTS + i;
      const d = (r + 1) * BAND_SEGMENTS + next;
      quad(part.indices, a, b, c, d);
    }
  }

  return toGeometry(part);
}

/**
 * The groove: the slot the bevel sits in, drawn as a thin ring on the frame's
 * own inner face at the depth the sheet dimensions.
 */
function buildGroove(
  opening: OpeningGeometry,
  depth: number,
  bevelPercent: number,
  sides: FrameSides,
): THREE.BufferGeometry {
  const part = emptyPart();
  const z = depth * bevelPercent;
  const width = 0.35;

  for (let i = 0; i < BAND_SEGMENTS; i += 1) {
    const theta = (360 * i) / BAND_SEGMENTS;
    const inner = openingPoint(opening, theta, z);
    const outer = bandPoint(opening, theta, width, z);
    push(part, inner.x, inner.y, inner.z, i / BAND_SEGMENTS, 0);
    push(part, outer.x, outer.y, outer.z, i / BAND_SEGMENTS, 1);
  }

  for (let i = 0; i < BAND_SEGMENTS; i += 1) {
    const next = (i + 1) % BAND_SEGMENTS;
    const theta = (360 * i) / BAND_SEGMENTS;
    const nextTheta = (360 * next) / BAND_SEGMENTS;
    if (!sideHeld(sides, theta) || !sideHeld(sides, nextTheta)) continue;
    const a = i * 2;
    const b = next * 2;
    quad(part.indices, a, b, a + 1, b + 1);
  }

  return toGeometry(part);
}

/**
 * The bridge: the span the DBL measures.
 *
 * The one distance the model does know about the space between the openings is
 * the DBL, so the bridge is drawn as exactly that span — from the nasal edge of
 * the opening the order is for, across the gap, to the nasal edge of the
 * second. Its shape is a quiet saddle, because the model says nothing about a
 * bridge's shape and inventing a dramatic one would be inventing product.
 *
 * It hangs at the vertical centre of the openings, which is where the sheet
 * dimensions the DBL between. Putting it anywhere else would make the drawing
 * say the bridge sits somewhere the model never placed it.
 */
function buildBridge(
  depth: number,
  zFront: number,
  innerX: number,
  outerX: number,
  halfHeight: number,
): THREE.BufferGeometry {
  const part = emptyPart();
  const zBack = zFront + depth;
  const segments = 32;
  // A shallow saddle: the bridge rises a little in the middle, the way a real
  // one clears the nose, and no more than a little.
  const rise = Math.min(2.5, halfHeight * 0.18);
  const bar = Math.min(5, halfHeight * 0.3);

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const x = innerX + t * (outerX - innerX);
    // The ends meet the rims, so the arc is zero at both ends.
    const y = Math.sin(Math.PI * t) * rise;
    push(part, x, y + bar / 2, zFront, t, 0);
    push(part, x, y + bar / 2, zBack, t, 1);
    push(part, x, y - bar / 2, zFront, t, 2);
    push(part, x, y - bar / 2, zBack, t, 3);
  }

  for (let i = 0; i < segments; i += 1) {
    const a = i * 4;
    const b = (i + 1) * 4;
    // Front face, back face, and the two edges of the bar.
    quad(part.indices, a, b, a + 1, b + 1);
    quad(part.indices, a + 2, b + 2, a + 3, b + 3);
    quad(part.indices, a, b, a + 2, b + 2);
    quad(part.indices, a + 1, b + 1, a + 3, b + 3);
  }

  return toGeometry(part);
}

/** Where a second opening's boxing centre sits, measured from the first. */
export function secondOpeningOffset(frame: FrameParameters): number {
  return frame.a + frame.dbl;
}

/**
 * The frame body, in the lens's own coordinates.
 *
 * The origin is the boxing centre of the opening the order is for, and the
 * second opening sits at plus A plus DBL along x — so the two lenses are the
 * two lenses of a pair, and the PD they were fitted to is the distance between
 * their optical centres.
 */
export function buildFrameGeometry(
  field: LensField,
  frame: FrameParameters,
  patient: PatientParameters,
  options: FrameGeometryOptions,
): { body: THREE.BufferGeometry; second: THREE.BufferGeometry | null } {
  const opening = buildOpening(frame, patient);
  const sides = frameSides(options.frameType);
  const depth = frame.depth;

  // The frame is flush with the front of the lens at its front face; the lens
  // sits in the groove, which is a share of the depth back from it.
  const zFront = field.frontApexZ - Math.max(0, -field.frontApexZ);

  const offset = secondOpeningOffset(frame);
  const parts: THREE.BufferGeometry[] = [];

  if (options.frameType !== "rimless") {
    parts.push(buildBand(opening, depth, zFront, sides));
    parts.push(buildGroove(opening, depth, options.bevelPercent, sides));
  }

  // The bridge spans from this opening's nasal edge to the second's, which is
  // the distance the DBL names. It belongs to the pair: a single-lens view that
  // kept it would show a bar reaching out of the frame into nothing.
  if (options.secondOpening !== false) {
    parts.push(
      buildBridge(
        depth,
        zFront,
        opening.halfWidth,
        offset - opening.halfWidth,
        opening.halfHeight,
      ),
    );
  }

  const body = mergeParts(parts);

  let second: THREE.BufferGeometry | null = null;
  if (options.secondOpening !== false) {
    const secondParts = [buildBand(opening, depth, zFront, sides)];
    if (options.frameType !== "rimless") {
      secondParts.push(buildGroove(opening, depth, options.bevelPercent, sides));
    }
    second = mergeParts(secondParts);
    second.translate(offset, 0, 0);
  }

  return { body, second };
}