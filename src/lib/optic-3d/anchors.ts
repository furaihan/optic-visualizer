import { DEG } from "../optic-engine/geometry";
import type { LensField } from "./field";

/**
 * Where each figure on the rail is actually measured on the body.
 *
 * The rail states six numbers. A table under a drawing can only say what they
 * are; a rail beside a body can say where they are, and for an optician
 * checking a fit against a frame that is the whole difference — "anterior
 * protrusion 0.16 mm" is a number, and a leader to the front vertex, standing
 * clear of the rim's front face, is a thing they can point at.
 *
 * Every anchor is computed from the same field the body is built from, so a
 * marker can never drift off the surface it is meant to be measuring.
 */
export type AnchorKey = "ct" | "et" | "anterior" | "posterior" | "groove" | "blank";

export interface Anchor {
  /** Where the marker sits, in the lens's own frame. */
  at: { x: number; y: number; z: number };
  /** Where the leader runs to, which is the surface or plane being measured. */
  to: { x: number; y: number; z: number };
  /** The line the caliper spans, when the figure is a distance rather than a point. */
  span?: { from: { x: number; y: number; z: number }; to: { x: number; y: number; z: number } };
}

/** The point on the rim in a direction, on the front and back faces. */
function rimFaces(field: LensField, theta: number) {
  const radius = field.rimRadiusAt(theta);
  const x = field.opening.ocX + radius * Math.cos(theta * DEG);
  const y = field.opening.ocY + radius * Math.sin(theta * DEG);
  return {
    radius,
    x,
    y,
    front: { x, y, z: field.frontZ(theta, radius) },
    back: { x, y, z: field.backZ(theta, radius) },
  };
}

/**
 * The anchors for the figures the rail shows.
 *
 * \u0060theta\u0060 is the governing meridian — the one carrying the thickest edge —
 * because that is the edge the schedule quotes and the one the frame has to
 * swallow.
 */
export function figureAnchors(
  field: LensField,
  theta: number,
  /** The blank diameter the engine reported, in millimetres. */
  blankDiameter = 0,
): Record<AnchorKey, Anchor> {
  const centre = { x: field.opening.ocX, y: field.opening.ocY, z: (field.frontZ(0, 0) + field.backZ(0, 0)) / 2 };
  const rim = rimFaces(field, theta);
  const groove = field.groove;
  const blankRadius = blankDiameter / 2;

  return {
    // Centre thickness: across the two vertices at the optical centre.
    ct: {
      at: centre,
      to: centre,
      span: {
        from: { x: centre.x, y: centre.y, z: field.frontZ(0, 0) },
        to: { x: centre.x, y: centre.y, z: field.backZ(0, 0) },
      },
    },
    // Edge thickness: across the rim in the governing meridian.
    et: {
      at: { x: rim.x, y: rim.y, z: (rim.front.z + rim.back.z) / 2 },
      to: { x: rim.x, y: rim.y, z: rim.back.z },
      span: { from: rim.front, to: rim.back },
    },
    // Anterior protrusion: from the front face of the rim out to the front
    // vertex, measured along the axis.
    anterior: {
      at: { x: centre.x, y: centre.y, z: field.frontZ(0, 0) },
      to: { x: centre.x, y: centre.y, z: 0 },
      span: {
        from: { x: centre.x, y: centre.y, z: field.frontZ(0, 0) },
        to: { x: centre.x, y: centre.y, z: 0 },
      },
    },
    // Posterior protrusion: from the back face of the rim to the deepest point
    // of the back surface in the section.
    posterior: {
      at: { x: centre.x, y: centre.y, z: field.backZ(theta, rim.radius) },
      to: { x: centre.x, y: centre.y, z: field.frameDepth },
      span: {
        from: { x: centre.x, y: centre.y, z: field.frameDepth },
        to: { x: centre.x, y: centre.y, z: field.backZ(theta, rim.radius) },
      },
    },
    // Groove: the plane the frame bites into the bevel.
    groove: {
      at: { x: rim.x, y: rim.y, z: groove },
      to: { x: rim.x, y: rim.y, z: groove },
    },
    // The blank: the disc the lens was cut from.
    blank: {
      at: { x: centre.x, y: centre.y, z: groove },
      to: { x: centre.x + blankRadius, y: centre.y, z: groove },
    },
  };
}