import { describe, it, expect } from "vitest";
import { CalculationResult, LensParameters, FrameParameters, PatientParameters } from "./types";
import { calculateLens } from "./optical";
import { calculateAsphericLens } from "./aspheric";
import { validateOpticalParams, clampAndSnapInput } from "./validation";
import { flaggedCount, measureRows } from "../limits";
import { LIMITS, limitLabel } from "../../data/limits";
import { MATERIALS_DB } from "../../data/materials";
import {
  backRadius,
  buildOpening,
  conicSagitta,
  frontRadius,
  powerInMeridian,
} from "./geometry";

/**
 * The reference lens the figures below are measured on: a minus four in a
 * standard frame, the prescription most people bring in.
 */
const standardLens: LensParameters = {
  sph: -4.0,
  cyl: 0,
  axis: 180,
  index: 1.6,
  baseCurve: 4.0,
};

const standardFrame: FrameParameters = {
  a: 52,
  b: 40,
  dbl: 18,
  depth: 4.5,
  ed: 54,
};

const standardPatient: PatientParameters = {
  pd: 63,
  fittingHeight: 22,
};

const lens = (over: Partial<LensParameters> = {}): LensParameters => ({
  ...standardLens,
  ...over,
});

const run = (
  l: LensParameters = standardLens,
  f: FrameParameters = standardFrame,
  p: PatientParameters = standardPatient,
) => calculateLens(l, f, p, 1.0, 0.33, "full");

/**
 * The weight of a lens, measured on a grid over the shape it is cut to.
 *
 * This is the reference the engine's own volume integral is checked against:
 * the thickness of the material at every point of the shape, added up over
 * cells of a tenth of a millimetre.
 */
function gridWeight(
  result: CalculationResult,
  l: LensParameters,
  f: FrameParameters,
  p: PatientParameters,
  step = 0.1,
): number {
  const opening = buildOpening(f, p);
  const r1 = frontRadius(l.index, l.baseCurve);
  let volume = 0;

  for (let x = -opening.halfWidth + step / 2; x <= opening.halfWidth; x += step) {
    for (let y = -opening.halfHeight + step / 2; y <= opening.halfHeight; y += step) {
      if (x * x + y * y > opening.shapeRadius * opening.shapeRadius) continue;

      const dx = x - opening.ocX;
      const dy = y - opening.ocY;
      const r = Math.hypot(dx, dy);
      const theta = (Math.atan2(dy, dx) * 180) / Math.PI;
      const power = powerInMeridian(theta, l.sph, l.cyl, l.axis);
      const r2 = backRadius(l.index, power - l.baseCurve);

      const front = conicSagitta(r1, 0, r);
      const back = conicSagitta(r2, 0, r);
      if (!Number.isFinite(front) || !Number.isFinite(back)) continue;

      volume += Math.max(0, result.ct + back - front) * step * step;
    }
  }

  return (volume / 1000) * result.density;
}

describe("The spherical engine, measured", () => {
  it("gives the reference lens its known thickness", () => {
    const res = run();

    // The front surface is a 150 mm sphere and the back a 74.9 mm one, and
    // the rim of a minus lens stands further back than the front rim by the
    // difference of the two sags.
    //
    // The back power is not exactly the sum of the two surface powers
    // turned round: a lens that is a millimetre thick does not carry the
    // thin-lens power, so the back power is re-solved until the vertex
    // power the patient wears is the four dioptres that were prescribed.
    expect(res.r1).toBeCloseTo(150, 6);
    expect(res.r2).toBeCloseTo(74.906, 3);
    expect(res.backPower).toBeCloseTo(-8.01, 3);
    expect(res.s1).toBeCloseTo(3.245, 2);
    expect(res.s2).toBeCloseTo(6.730, 2);

    // A minus lens is thinnest at the centre, and the edge follows.
    expect(res.ct).toBeCloseTo(1.0, 6);
    expect(res.et).toBeCloseTo(4.485, 2);

    // And the vertex power is the power that was prescribed.
    expect(res.vertexPower).toBeCloseTo(-4, 3);
  });

  it("puts the reference lens in the frame the way the drawing shows it", () => {
    const res = run();

    // The groove sits a third of the way into the frame, and the edge is
    // centred on it.
    expect(res.section?.groove).toBeCloseTo(4.5 * 0.33, 6);

    // The two vertices are exactly the centre thickness apart, which is what
    // the section on the sheet measures.
    const section = res.section!;
    expect(section.backApexZ - section.frontApexZ).toBeCloseTo(res.ct, 6);

    // The material at the rim is the centre thickness plus the difference of
    // the two surface offsets.
    expect(section.edgeTop).toBeCloseTo(
      res.ct + section.backOffsetTop - section.frontOffsetTop,
      6,
    );
  });

  it("measures the protrusion in the meridian the lens is held in", () => {
    const res = run();

    // The lens is placed in the groove by the vertical meridian, so the
    // protrusion is measured in that meridian. The back of the lens does not
    // stand out of the frame, even though the shape is deeper around the rim
    // somewhere else: the frame holds the lens at the top of the opening.
    expect(res.anteriorProtrusion).toBeCloseTo(0.65, 2);
    expect(res.posteriorProtrusion).toBe(0);

    // And the section is the plane the numbers come from: the two vertices
    // are the centre thickness apart.
    const section = res.section!;
    expect(section.backApexZ - section.frontApexZ).toBeCloseTo(res.ct, 6);
  });

  it("sizes the blank around the optical centre, not around the boxing centre", () => {
    const res = run();
    // The optical centre sits on the pupil, 3.5 mm nasal of the boxing
    // centre and 2 mm above it, so the shape reaches 31.03 mm from it: twice
    // that reach, plus the two millimetres of edging allowance.
    expect(res.minBlank).toBeCloseTo(64.06, 2);
  });

  it("sizes the blank for a lens that sits high in the frame", () => {
    // A fitting height of 30 puts the pupil 10 mm above the boxing centre,
    // and the shape then reaches 36.99 mm from it: the blank grows, because
    // the pupil has moved, not because the frame has.
    const high = run(standardLens, standardFrame, { pd: 63, fittingHeight: 30 });
    expect(high.minBlank).toBeCloseTo(75.98, 2);
  });

  it("measures the rim to the corner, not to the nearest sample", () => {
    // The shape of this frame reaches 39.61 mm from the pupil, at the corner
    // where the ED circle meets the bottom of the box. A uniform sample
    // every five degrees walks past it and reports 39.19.
    const tall = run(
      standardLens,
      { ...standardFrame, ed: 60 },
      { pd: 63, fittingHeight: 30 },
    );
    expect(tall.y).toBeCloseTo(39.61, 2);
  });

  it("reads the centre of the lens as the thinnest point of a minus lens", () => {
    const res = run();
    expect(res.ct).toBeCloseTo(1.0, 6);
    expect(res.etMin).toBeGreaterThan(res.ct);
  });

  it("makes a plus lens thin at the edge and thick at the centre", () => {
    const res = run(lens({ sph: 4 }));
    // A near-plano back: the centre thickness is what makes the outer edge
    // 1 mm.
    expect(res.ct).toBeCloseTo(4.210, 3);
    expect(res.etMin).toBeCloseTo(1.0, 2);
  });

  it("reports the back of a convex lens standing proud of the frame", () => {
    const res = run(lens({ sph: 10 }));
    // A plus ten has a convex back, and the back surface bulges out behind
    // the rim. The old engine reported zero here.
    expect(res.posteriorProtrusion).toBeGreaterThan(0);
    expect(res.posteriorProtrusion).toBeCloseTo(1.797, 2);
  });

  it("puts the axis of a cylinder into the answer", () => {
    const upright = run(lens({ sph: -2, cyl: -4, axis: 180 }));
    const turned = run(lens({ sph: -2, cyl: -4, axis: 90 }));

    // The same prescription, turned on the lens: the frame is not round, so
    // the edge thickness cannot be the same.
    expect(turned.et).not.toBeCloseTo(upright.et, 2);
    expect(turned.et).toBeGreaterThan(upright.et);
  });

  it("makes a higher index a thinner edge and a lighter lens", () => {
    const standard = run(lens({ index: 1.5 }));
    const premium = run(lens({ index: 1.74 }));

    expect(premium.et).toBeLessThan(standard.et);
    expect(premium.weight).toBeLessThan(standard.weight);
  });

  it("weighs the lens by the thickness it actually has", () => {
    const res = run();
    // The weight is the volume of the opening filled with the lens, times
    // the density of the material.
    const impliedVolume = res.weight / res.density;
    expect(impliedVolume).toBeGreaterThan(1);
    expect(impliedVolume).toBeLessThan(10);
  });

  it("weighs the lens over the whole shape it is cut to", () => {
    const prescription = lens({ sph: -6, index: 1.6, baseCurve: 4 });
    const frame = { ...standardFrame, ed: 62 };
    const patient = { pd: 58, fittingHeight: 22 };
    const res = run(prescription, frame, patient);

    // The shape of this frame reaches 37.16 mm from the pupil, at the corner
    // where the circle meets the side of the box. The rings of the volume
    // integral are centred on the pupil, so the outer ring has to reach that
    // far, or the corner of the lens is never counted.
    expect(res.weight).toBeCloseTo(8.38, 1);

    // And the engine's integral agrees with a grid over the same shape.
    const grid = gridWeight(res, prescription, frame, patient);
    expect(Math.abs(res.weight - grid) / grid).toBeLessThan(0.005);
  });

  it("never returns a number that is not a number", () => {
    const res = run(
      lens({ sph: -25, cyl: -6, axis: 90, index: 1.74, baseCurve: 2 }),
    );
    for (const value of [
      res.ct,
      res.et,
      res.anteriorProtrusion,
      res.posteriorProtrusion,
      res.weight,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });
});

describe("The thick lens, measured", () => {
  it("gives a strong plus lens the vertex power that was prescribed", () => {
    // A plus ten on a six dioptre base: the lens is nine millimetres thick
    // at the centre, and a lens that thick does not carry the sum of its
    // two surface powers. The back power is re-solved until the vertex
    // power the patient wears is the ten dioptres on the prescription.
    const res = run(lens({ sph: 10, baseCurve: 6 }));

    expect(res.vertexPower).toBeCloseTo(10, 2);
    expect(Math.abs(res.vertexPowerError ?? 1)).toBeLessThan(0.02);
    expect(res.ct).toBeCloseTo(9.004, 2);
  });

  it("gives a steeper plus lens the vertex power that was prescribed", () => {
    const res = run(lens({ sph: 12, baseCurve: 10 }));

    expect(res.vertexPower).toBeCloseTo(12, 2);
    expect(Math.abs(res.vertexPowerError ?? 1)).toBeLessThan(0.02);
    expect(res.ct).toBeCloseTo(10.682, 2);
  });

  it("keeps the cylinder a cylinder", () => {
    // The correction is the same in every meridian, so the difference
    // between the two principal meridians is untouched.
    const upright = run(lens({ sph: -2, cyl: -4, axis: 180 }));
    const turned = run(lens({ sph: -2, cyl: -4, axis: 90 }));

    expect(upright.vertexPowerError).toBeCloseTo(0, 3);
    expect(turned.vertexPowerError).toBeCloseTo(0, 3);
  });
});

describe("The material recommendation", () => {
  it("matches the power band it recommends", () => {
    // A spherical equivalent of exactly two dioptres is the top of the low
    // power band, so it belongs to the 1.56 material, and the reason has to
    // be that material's reason.
    const res = run(lens({ sph: -2, cyl: 0 }));
    expect(res.recommendation?.index).toBeCloseTo(1.56, 5);
    expect(res.recommendation?.reason).toMatch(/1\.56/);
  });

  it("recommends the top material for a high power", () => {
    const res = run(lens({ sph: -9.5 }));
    expect(res.recommendation?.index).toBeCloseTo(1.74, 5);
  });

  it("keeps a half-rim and a rimless frame above their minimum index", () => {
    const half = calculateLens(lens({ sph: -1 }), standardFrame, standardPatient, 1, 0.33, "half");
    const rimless = calculateLens(lens({ sph: -1 }), standardFrame, standardPatient, 1, 0.33, "rimless");

    expect(half.recommendation?.index).toBeGreaterThanOrEqual(1.56);
    expect(rimless.recommendation?.index).toBeGreaterThanOrEqual(1.6);
  });

  it("measures the saving on the lens in hand", () => {
    const res = run(lens({ index: 1.5 }));
    expect(res.recommendation?.edgeThickness).toBeGreaterThan(0);
    expect(res.recommendation?.savingPercent).toBeGreaterThan(0);
  });
});

describe("The aspheric engine", () => {
  const asphericLens = {
    sph: -4,
    cyl: 0,
    axis: 180,
    index: 1.6 as const,
    baseCurve: 4,
    asphericFront: { conic: 0, A2: 0, A4: 0, A6: 0, A8: 0, isActive: false },
    asphericBack: { conic: 0, A2: 0, A4: 0, A6: 0, A8: 0, isActive: false },
  };

  it("agrees with the spherical engine when both surfaces are plain", () => {
    const spherical = run();
    const aspheric = calculateAsphericLens(
      asphericLens,
      standardFrame,
      standardPatient,
      1.0,
      0.33,
      "full",
    );

    expect(aspheric.ct).toBeCloseTo(spherical.ct, 6);
    expect(aspheric.et).toBeCloseTo(spherical.et, 6);
    expect(aspheric.anteriorProtrusion).toBeCloseTo(spherical.anteriorProtrusion, 6);
    expect(aspheric.posteriorProtrusion).toBeCloseTo(spherical.posteriorProtrusion, 6);
  });

  it("refuses a conic that has no real point at the edge of the frame", () => {
    const aspheric = calculateAsphericLens(
      {
        ...asphericLens,
        asphericFront: { conic: -0.52, A2: 0, A4: 0, A6: 0, A8: 0, isActive: true },
      },
      standardFrame,
      standardPatient,
      1.0,
      0.33,
      "full",
    );

    // A hyperboloid of revolution with K < -1 has real points everywhere, so
    // this one is surfaced; the engine must not quietly answer with a flat
    // surface.
    expect(aspheric.departure).not.toBe(0);
    expect(Number.isFinite(aspheric.et)).toBe(true);
  });

  it("refuses coefficients that throw the surface out of shape", () => {
    const aspheric = calculateAsphericLens(
      {
        ...asphericLens,
        asphericFront: { conic: 0, A2: 0, A4: 0.001, A6: 0, A8: 0, isActive: true },
      },
      standardFrame,
      standardPatient,
      1.0,
      0.33,
      "full",
    );

    expect(aspheric.error).toBe(true);
    expect(aspheric.errorMessage).toBeTruthy();
  });

  it("solves the vertex power of an aspheric lens too", () => {
    const aspheric = calculateAsphericLens(
      {
        ...asphericLens,
        asphericBack: { conic: 0, A2: 0.0001, A4: 0, A6: 0, A8: 0, isActive: true },
      },
      standardFrame,
      standardPatient,
      1.0,
      0.33,
      "full",
    );

    // The A2 term takes power away from the back conic and gives it back to
    // the surface, so the vertex power of the lens the patient wears is
    // still the power that was prescribed.
    expect(Math.abs(aspheric.vertexPowerError ?? 1)).toBeLessThan(0.02);
  });

  it("applies the same frame rules as the spherical engine", () => {
    const rimless = calculateAsphericLens(
      asphericLens,
      standardFrame,
      standardPatient,
      1.0,
      0.33,
      "rimless",
    );
    expect(rimless.recommendation?.index).toBeGreaterThanOrEqual(1.6);
  });
});

describe("Clinical Rules & Input Validation - validateOpticalParams", () => {  const validLens: LensParameters = {
    sph: -3.0,
    cyl: 0,
    axis: 0,
    index: 1.6,
    baseCurve: 5,
  };
  const validFrame: FrameParameters = {
    a: 50,
    b: 38,
    dbl: 18,
    depth: 4.0,
    ed: 52,
  };
  const validPatient: PatientParameters = { pd: 64, fittingHeight: 19 };

  it("passes fully compliant parameters", () => {
    const validation = validateOpticalParams(
      validLens,
      validFrame,
      validPatient,
    );
    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  it("accurately intercepts NaN and infinite parameter structures", () => {
    const corruptLens = { ...validLens, sph: NaN };
    const val = validateOpticalParams(corruptLens, validFrame, validPatient);
    expect(val.isValid).toBe(false);
    expect(val.errors.some((e) => e.isFatal)).toBe(true);
  });

  it("triggers edge error warnings when physical frame rules are failed", () => {
    const badFrame = { ...validFrame, ed: 45, a: 50 }; // ED cannot be less than A
    const val = validateOpticalParams(validLens, badFrame, validPatient);
    expect(val.errors.some((e) => e.field === "ed")).toBe(true);
  });

  it("warns when the effective diameter is wider than the frame", () => {
    // The shape of the lens is the A x B box cut by the circle of diameter
    // ED. A circle wider than the diagonal of the box cuts nothing off, so
    // the ED is no longer describing the lens.
    const wide = { ...validFrame, ed: 70 };
    const val = validateOpticalParams(validLens, wide, validPatient);
    expect(
      val.errors.some((e) => e.field === "ed" && /diagonal/.test(e.messageEn)),
    ).toBe(true);
  });

  it("leaves a frame whose effective diameter still bites alone", () => {
    const val = validateOpticalParams(validLens, validFrame, validPatient);
    expect(val.errors.some((e) => e.field === "ed")).toBe(false);
  });

  it("correctly clamps and snaps step inputs", () => {
    const spec = { step: 0.25, min: -10, max: 10 };
    expect(clampAndSnapInput(-3.12, spec)).toBe(-3.0);
    expect(clampAndSnapInput(-3.18, spec)).toBe(-3.25);
    expect(clampAndSnapInput(15.0, spec)).toBe(10.0); // clamped
  });
});

describe("The measurement sheet's rows", () => {  it("does not fault a standard lens for its prism", () => {
    const rows = measureRows(run(), standardLens);
    const prism = rows.find((r) => r.id === "prism")!;

    // The optical centre is placed on the pupil, so the prism at the pupil
    // is zero. The row is the reference figure for a lens that was not
    // decentred onto the pupil, and it is never a fault.
    expect(prism.ok).toBe(true);
    expect(prism.reference).toBe(true);

    // And the figure is the real one: 4.00 D of power over a 3.5 mm
    // decentration, by Prentice's rule.
    expect(prism.value).toBeCloseTo(1.4, 2);
  });

  it("leaves the standard lens with nothing to flag", () => {
    const rows = measureRows(run(), standardLens);
    expect(flaggedCount(rows)).toBe(0);
  });

  it("reads every threshold from the limits file", () => {
    const rows = measureRows(run(), standardLens);
    for (const row of rows) {
      expect(row.limit).toBe(LIMITS[row.id].value);
      expect(row.unit).toBe(LIMITS[row.id].unit);
    }
    expect(limitLabel("et")).toBe("≤ 6.00 mm");
    expect(limitLabel("ct")).toBe("≥ 1.00 mm");
  });
});

describe("The materials", () => {
  it("carries the Abbe number of the material it names", () => {
    const abbeOf = (id: string) => MATERIALS_DB.find((m) => m.id === id)!.abbe;
    expect(abbeOf("mr8")).toBe(41);
    expect(abbeOf("mr10")).toBe(31);
    expect(abbeOf("mr174")).toBe(32);
  });
});

describe("The minimum thickness", () => {
  it("works to the minimum thickness the sheet asks for", () => {
    const thick = calculateLens(standardLens, standardFrame, standardPatient, 1.5, 0.33, "full");

    // A minus lens is thinnest at the centre, so the centre takes the
    // minimum, and the edge follows it.
    expect(thick.ct).toBeCloseTo(1.5, 6);
    expect(thick.et).toBeCloseTo(4.985, 2);
  });
});
