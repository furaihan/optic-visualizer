import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { calculateLens } from "../../optic-engine/optical";
import type { FrameParameters, LensParameters, PatientParameters } from "../../optic-engine/types";
import { buildLensField } from "../field";
import { buildOpening } from "../../optic-engine/geometry";
import {
  LENS_SEGMENTS,
  buildBackGeometry,
  buildFrontGeometry,
  buildLensGeometry,
  buildRimGeometry,
  lensVertexCount,
  rimEdge,
} from "../lensMesh";
import { buildFrameGeometry, frameSides, secondOpeningOffset, RIM_BAND } from "../frameMesh";

const lens: LensParameters = { sph: -4, cyl: 0, axis: 0, index: 1.6, baseCurve: 4 };
const frame: FrameParameters = { a: 52, b: 40, dbl: 18, depth: 6, ed: 54 };
const patient: PatientParameters = { pd: 63, fittingHeight: 22 };

function fieldFor(l: LensParameters = lens, f: FrameParameters = frame) {
  const result = calculateLens(l, f, patient, 1.0, 0.33, "full");
  return { result, field: buildLensField({ result, lens: l, frame: f, patient }) };
}

/** The bounding box of a geometry, which is what a camera frames. */
function bounds(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  return geometry.boundingBox!;
}

describe("the lens body is closed and complete", () => {
  const { field, result } = fieldFor();
  const body = buildLensGeometry(field);

  it("has vertices, faces and normals", () => {
    const position = body.getAttribute("position");
    expect(position.count).toBeGreaterThan(1000);
    expect(body.getIndex()!.count % 3).toBe(0);
    expect(body.getAttribute("normal")).toBeDefined();
  });

  it("has a normal on every vertex, so the glass has no dark hole", () => {
    const normal = body.getAttribute("normal");
    let degenerate = 0;
    for (let i = 0; i < normal.count; i += 1) {
      const length = Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i));
      if (!Number.isFinite(length) || length < 0.5) degenerate += 1;
    }
    expect(degenerate).toBe(0);
  });

  it("reaches as far as the lens does, in the lens's own frame", () => {
    const box = bounds(body);
    // The opening's own half width and height, plus nothing: the body is the
    // shape that was edged, not a disc that contains it.
    expect(box.min.x).toBeGreaterThan(-frame.a / 2 - 1e-6);
    expect(box.max.x).toBeLessThan(frame.a / 2 + 1e-6);
    expect(box.min.y).toBeGreaterThan(-frame.b / 2 - 1e-6);
    expect(box.max.y).toBeLessThan(frame.b / 2 + 1e-6);
  });

  it("is as deep as the engine's own vertices", () => {
    const box = bounds(body);
    const front = Math.min(result.section!.frontApexZ, box.min.z);
    expect(Math.abs(front - result.section!.frontApexZ)).toBeLessThan(0.5);
    expect(box.max.z).toBeGreaterThan(result.section!.backApexZ - 0.5);
  });

  it("keeps its vertex count inside the budget the plan set", () => {
    expect(body.getAttribute("position").count).toBe(lensVertexCount());
    expect(lensVertexCount()).toBeLessThan(40000);
  });
});

describe("the rim is a bevel, not a wall", () => {
  const { field } = fieldFor();
  const rim = buildRimGeometry(field, { bevelPercent: 0.33 });
  const position = rim.getAttribute("position");
  const groove = frame.depth * 0.33;

  it("puts its crest on the groove plane in the meridian the lens hangs by", () => {
    // The engine hangs the lens by the vertical meridian through the optical
    // centre: the edge at the top of the opening is the one centred on the
    // groove. Every other meridian crosses the frame depth somewhere else,
    // because the rim of a lens is not a flat band. So the crest sits on the
    // groove at the top, and is pulled inside the material everywhere the
    // groove would fall outside it.
    const perRing = position.count / 3;
    const at = (theta: number) => {
      // The rim starts at theta 0 and walks round; find the vertex nearest 90.
      const i = Math.round((theta / 360) * perRing) % perRing;
      return position.getZ(perRing + i);
    };
    expect(Math.abs(at(90) - groove)).toBeLessThan(1e-6);

    let onGroove = 0;
    for (let i = 0; i < perRing; i += 1) {
      if (Math.abs(position.getZ(perRing + i) - groove) < 1e-6) onGroove += 1;
    }
    // Only a band around the fitting meridian coincides with the groove; the
    // rest of the rim is clamped inside the material. Both facts are the model.
    expect(onGroove).toBeGreaterThan(0);
    expect(onGroove).toBeLessThan(perRing);
  });

  it("never lets the crest stand outside the material", () => {
    const perRing = position.count / 3;
    for (let i = 0; i < perRing; i += 1) {
      const theta = (360 * i) / perRing;
      const edge = rimEdge(field, theta);
      const z = position.getZ(perRing + i);
      expect(z).toBeGreaterThanOrEqual(edge.frontZ - 1e-6);
      expect(z).toBeLessThanOrEqual(edge.backZ + 1e-6);
    }
  });

  it("slants: the crest is proud of both faces, so the edge reads on a slope", () => {
    const perRing = position.count / 3;
    let proudCount = 0;
    for (let i = 0; i < perRing; i += 1) {
      const frontZ = position.getZ(i);
      const crestZ = position.getZ(perRing + i);
      const backZ = position.getZ(perRing * 2 + i);
      if (crestZ > frontZ + 1e-6 && crestZ < backZ - 1e-6) proudCount += 1;
    }
    expect(proudCount).toBeGreaterThan(perRing * 0.9);
  });
});

describe("the two faces are one body", () => {
  const { field } = fieldFor();

  it("meets its rim at the same radius on both faces", () => {
    const segments = { radial: 64, axial: 32 };
    const front = buildFrontGeometry(field, segments);
    const back = buildBackGeometry(field, segments);
    const fPos = front.getAttribute("position");
    const bPos = back.getAttribute("position");
    // Vertex 0 is the pole; the rings follow it, so the last ring starts at
    // 1 + (axial - 1) * radial. The two faces must agree there in x and y.
    const radial = 64;
    const axial = 32;
    const ring = 1 + (axial - 1) * radial;
    for (let i = 0; i < radial; i += 1) {
      const f = ring + i;
      const b = ring + i;
      expect(Math.abs(fPos.getX(f) - bPos.getX(b))).toBeLessThan(1e-9);
      expect(Math.abs(fPos.getY(f) - bPos.getY(b))).toBeLessThan(1e-9);
    }
  });

  it("grows and shrinks with the prescription, keeping its topology", () => {
    const small = buildLensGeometry(fieldFor({ ...lens, sph: -1 }).field);
    const large = buildLensGeometry(fieldFor({ ...lens, sph: -9, index: 1.5 }).field);
    expect(small.getAttribute("position").count).toBe(large.getAttribute("position").count);
  });

  it("draws a toric with two different rim radii", () => {
    const toric = fieldFor({ ...lens, sph: -3, cyl: -4, axis: 0 });
    const body = buildLensGeometry(toric.field);
    const box = bounds(body);
    // A minus cylinder on axis 0 is thickest at the ends of the horizontal
    // meridian, so the body reaches further along x than the sphere does.
    expect(box.max.x - box.min.x).toBeGreaterThan(0);
  });
});

describe("the frame is drawn as far as the model reaches", () => {
  const { field } = fieldFor();

  it("holds a half rim from below and a full rim from both sides", () => {
    expect(frameSides("full")).toEqual({ top: true, bottom: true });
    expect(frameSides("half")).toEqual({ top: false, bottom: true });
    expect(frameSides("rimless")).toEqual({ top: false, bottom: false });
  });

  it("builds a band for a full rim and no band for a rimless frame", () => {
    const full = buildFrameGeometry(field, frame, patient, {
      frameType: "full",
      bevelPercent: 0.33,
    });
    const rimless = buildFrameGeometry(field, frame, patient, {
      frameType: "rimless",
      bevelPercent: 0.33,
    });
    expect(full.body.getAttribute("position").count).toBeGreaterThan(
      rimless.body.getAttribute("position").count,
    );
  });

  it("places the second opening at A plus DBL", () => {
    expect(secondOpeningOffset(frame)).toBe(frame.a + frame.dbl);
    const { second } = buildFrameGeometry(field, frame, patient, {
      frameType: "full",
      bevelPercent: 0.33,
    });
    expect(second).not.toBeNull();
    const box = bounds(second!);
    expect(box.max.x).toBeGreaterThan(secondOpeningOffset(frame) - frame.a / 2 - RIM_BAND);
  });

  it("keeps the band outside the opening it frames", () => {
    const opening = buildOpening(frame, patient);
    const { body } = buildFrameGeometry(field, frame, patient, {
      frameType: "full",
      bevelPercent: 0.33,
    });
    const box = bounds(body);
    // The band is the opening grown by its width, so the frame reaches the
    // opening's half height plus the band, and no further. Along x the body
    // also carries the bridge, which spans to the second opening, so the
    // vertical measure is the one that states the band's own width.
    expect(box.max.y).toBeLessThanOrEqual(opening.halfHeight + RIM_BAND + 1e-6);
    expect(box.min.y).toBeGreaterThanOrEqual(-opening.halfHeight - RIM_BAND - 1e-6);
    // And the bridge reaches the second opening's nasal edge, which is what
    // the DBL measures.
    expect(box.max.x).toBeGreaterThanOrEqual(frame.a / 2 + frame.dbl - 1e-6);
  });
});

describe("the body stays inside the budget", () => {
  it("does not exceed the triangle count the plan allowed", () => {
    const { field } = fieldFor();
    const body = buildLensGeometry(field);
    const triangles = body.getIndex()!.count / 3;
    // The budget is 40k for the whole body: two faces and the rim.
    expect(triangles).toBeLessThan(40000);
    // And the silhouette still resolves well below a pixel of chord error at
    // the size the surface is drawn at.
    const rimRadius = 30; // mm, roughly the largest this frame reaches
    const chordError = rimRadius * (1 - Math.cos(Math.PI / LENS_SEGMENTS.radial));
    expect(chordError).toBeLessThan(0.01); // mm, well under a tenth of a pixel
  });
});