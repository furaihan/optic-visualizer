import * as THREE from "three";
import { DEG } from "../optic-engine/geometry";
import type { LensField, MeridianAngle } from "./field";
import { emptyPart, mergeParts, push, quad, toGeometry } from "./geo";

/**
 * The body of the lens, as geometry.
 *
 * Three surfaces make one closed body:
 *
 *   - the front, a surface of revolution about the axis;
 *   - the back, swept in every meridian, because a toric lens is not a
 *     surface of revolution — its radius changes with the meridian, and so
 *     does everything measured across it;
 *   - the rim, the bevel the frame actually holds the lens by.
 *
 * Both faces are parameterised the same way: a direction around the optical
 * centre, and a radius normalised against the rim in that direction. That is
 * what lets the body morph across a parameter change — the grid topology never
 * changes, only the z of each vertex, so the lens visibly becomes the new lens
 * instead of being replaced by one.
 */

/**
 * How finely the body is cut.
 *
 * The numbers are set by the silhouette, not by taste: a rim walked in R steps
 * around a lens of radius r is a polygon whose chord error is r (1 - cos(pi/R)).
 * At the radius this frame reaches (30 mm) and a typical board width (900 px,
 * so 17 px per millimetre), 144 steps leave a 0.12 px error — invisible at the
 * largest size the surface is ever drawn. 64 rings across the radius are enough
 * for the highlight to run smoothly over a surface this shallow.
 *
 * That pair keeps the whole body at 37k triangles: comfortably inside the
 * budget, and still smooth where the eye actually looks.
 */
export const LENS_SEGMENTS: { radial: number; axial: number } = { radial: 144, axial: 64 };

export interface LensGeometryOptions {
  segments?: { radial: number; axial: number };
  /** Walk the rim in this many steps; a toric needs enough to read as one. */
  rimSegments?: number;
  /**
   * Where along the bevel the crest sits, as a share of the frame depth: the
   * `bevelPercent` the sheet's groove caliper reads. The rim is slanted
   * because a real bevel is, and the slant is what makes the edge thickness a
   * figure a caliper reads rather than a wall it measures.
   */
  bevelPercent?: number;
}

/** A point on the lens, in its own frame: x and y in the lens plane, z along the axis. */
export interface LensPoint {
  x: number;
  y: number;
  z: number;
}

/** The radius from the optical centre to the rim in a direction. */
function rimAt(field: LensField, theta: MeridianAngle): number {
  return field.rimRadiusAt(theta);
}

/** A point of the lens plane at a direction and an absolute radius. */
function plane(field: LensField, theta: MeridianAngle, radius: number) {
  return {
    x: field.opening.ocX + radius * Math.cos(theta * DEG),
    y: field.opening.ocY + radius * Math.sin(theta * DEG),
  };
}

/** The front surface at a direction and an absolute radius, in the lens's frame. */
export function frontPoint(field: LensField, theta: MeridianAngle, radius: number): LensPoint {
  const p = plane(field, theta, radius);
  return { ...p, z: field.frontZ(theta, radius) };
}

/** The back surface at a direction and an absolute radius, in the lens's frame. */
export function backPoint(field: LensField, theta: MeridianAngle, radius: number): LensPoint {
  const p = plane(field, theta, radius);
  return { ...p, z: field.backZ(theta, radius) };
}

/**
 * How thick the material is at the rim in a direction, and where its two faces
 * sit: the three numbers the bevel is built from.
 */
export function rimEdge(field: LensField, theta: MeridianAngle) {
  const radius = rimAt(field, theta);
  const frontZ = field.frontZ(theta, radius);
  const backZ = field.backZ(theta, radius);
  return {
    /** The radius the rim sits at, from the optical centre. */
    radius,
    /** Where the front of the rim is, along the axis. */
    frontZ,
    /** Where the back of the rim is. */
    backZ,
    /** The material between them. */
    thickness: backZ - frontZ,
    /** The plane the rim's mid-point sits on, before the bevel is placed. */
    midZ: (frontZ + backZ) / 2,
  };
}

/**
 * One face of the lens.
 *
 * The pole is a single vertex fed by a triangle fan; the rings around it are
 * the grid. A ring of coincident vertices would leave the centre with zero-area
 * triangles and a normal of nothing, which shows up as a dark hole in the
 * middle of the glass.
 */
function buildFace(
  field: LensField,
  segments: { radial: number; axial: number },
  point: (field: LensField, theta: MeridianAngle, radius: number) => LensPoint,
  winding: "front" | "back",
): THREE.BufferGeometry {
  const { radial, axial } = segments;
  const part = emptyPart();

  const pole = point(field, 0, 0);
  const poleIndex = push(part, pole.x, pole.y, pole.z, 0.5, 0);

  // Ring j sits at share j / axial of the rim in each direction.
  for (let j = 1; j <= axial; j += 1) {
    const share = j / axial;
    for (let i = 0; i < radial; i += 1) {
      const theta = (360 * i) / radial;
      const radius = rimAt(field, theta) * share;
      const p = point(field, theta, radius);
      push(part, p.x, p.y, p.z, i / radial, share);
    }
  }

  const ringIndex = (j: number, i: number) => poleIndex + 1 + (j - 1) * radial + (i % radial);

  // The fan from the pole to the first ring.
  for (let i = 0; i < radial; i += 1) {
    const a = ringIndex(1, i);
    const b = ringIndex(1, i + 1);
    if (winding === "front") part.indices.push(poleIndex, a, b);
    else part.indices.push(poleIndex, b, a);
  }

  for (let j = 1; j < axial; j += 1) {
    for (let i = 0; i < radial; i += 1) {
      const a = ringIndex(j, i);
      const b = ringIndex(j, i + 1);
      const c = ringIndex(j + 1, i);
      const d = ringIndex(j + 1, i + 1);
      if (winding === "front") part.indices.push(a, c, b, b, c, d);
      else part.indices.push(a, b, c, b, d, c);
    }
  }

  return toGeometry(part);
}

/** The front face: a surface of revolution about the axis. */
export function buildFrontGeometry(
  field: LensField,
  segments = LENS_SEGMENTS,
): THREE.BufferGeometry {
  return buildFace(field, segments, frontPoint, "front");
}

/** The back face, swept in every meridian so a toric reads as a toric. */
export function buildBackGeometry(
  field: LensField,
  segments = LENS_SEGMENTS,
): THREE.BufferGeometry {
  return buildFace(field, segments, backPoint, "back");
}

/**
 * The rim: the bevel the frame holds the lens by.
 *
 * A bevel is not a wall. Its crest sits proud of the two faces and tapers to
 * each, and the frame's groove bites into it at a share of the frame's own
 * depth. So the rim is swept as a small profile — the rim of the front face,
 * the crest, the rim of the back face — and the two slanted faces it leaves are
 * the ones a caliper reads the edge thickness off.
 *
 * The crest is the frame's groove plane wherever the material can hold it.
 * Where a meridian is too thin for that, the crest is pulled inside the
 * material: a bevel standing outside the lens would be a ledge the frame
 * cannot grip, and drawing one would be a lie about the edge.
 */
export function buildRimGeometry(
  field: LensField,
  options: LensGeometryOptions = {},
): THREE.BufferGeometry {
  const rimSegments = options.rimSegments ?? 144;
  const groove = field.frameDepth * (options.bevelPercent ?? 0.33);
  /** How far the crest stays clear of each face, as a share of the rim's thickness. */
  const proud = 0.35;
  const part = emptyPart();
  const rings = 3;

  for (let ring = 0; ring < rings; ring += 1) {
    for (let i = 0; i < rimSegments; i += 1) {
      const theta = (360 * i) / rimSegments;
      const edge = rimEdge(field, theta);
      const p = plane(field, theta, edge.radius);

      let z: number;
      if (ring === 0) {
        z = edge.frontZ;
      } else if (ring === 2) {
        z = edge.backZ;
      } else {
        const low = edge.frontZ + edge.thickness * proud;
        const high = edge.backZ - edge.thickness * proud;
        z = Math.min(Math.max(groove, low), high);
      }

      push(part, p.x, p.y, z, i / rimSegments, ring / (rings - 1));
    }
  }

  for (let ring = 0; ring < rings - 1; ring += 1) {
    for (let i = 0; i < rimSegments; i += 1) {
      const next = (i + 1) % rimSegments;
      const a = ring * rimSegments + i;
      const b = ring * rimSegments + next;
      const c = (ring + 1) * rimSegments + i;
      const d = (ring + 1) * rimSegments + next;
      quad(part.indices, a, b, c, d);
    }
  }

  return toGeometry(part);
}

/**
 * The whole body: front, back and rim as one geometry.
 *
 * One mesh and one material per lens keeps the draw count down and lets the
 * refractive material behave as a single solid rather than three shells
 * refracting each other.
 */
export function buildLensGeometry(
  field: LensField,
  options: LensGeometryOptions = {},
): THREE.BufferGeometry {
  return mergeParts([
    buildFrontGeometry(field, options.segments),
    buildBackGeometry(field, options.segments),
    buildRimGeometry(field, options),
  ]);
}

/** The vertex count a body will have at these settings, for a budget check. */
export function lensVertexCount(
  segments: { radial: number; axial: number } = LENS_SEGMENTS,
  rimSegments = 144,
): number {
  const face = 1 + segments.axial * segments.radial;
  return face * 2 + rimSegments * 3;
}