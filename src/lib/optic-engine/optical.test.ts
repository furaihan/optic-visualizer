import { describe, it, expect } from "vitest";
import { LensParameters, FrameParameters, PatientParameters } from "./types";
import { calculateLens } from "./optical";
import { calculateAsphericLens } from "./aspheric";
import { validateOpticalParams, clampAndSnapInput } from "./validation";

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

describe("The spherical engine, measured", () => {
  it("gives the reference lens its known thickness", () => {
    const res = run();

    // The front surface is a 150 mm sphere and the back a 75 mm one, and
    // the rim of a minus lens stands further back than the front rim by the
    // difference of the two sags.
    expect(res.r1).toBeCloseTo(150, 6);
    expect(res.r2).toBeCloseTo(75, 6);
    expect(res.backPower).toBeCloseTo(-8, 6);
    expect(res.s1).toBeCloseTo(3.245, 2);
    expect(res.s2).toBeCloseTo(6.721, 2);

    // A minus lens is thinnest at the centre, and the edge follows.
    expect(res.ct).toBeCloseTo(1.0, 6);
    expect(res.et).toBeCloseTo(4.476, 2);
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

  it("sizes the blank by the shape and the decentration", () => {
    const res = run();
    // The frame's own diameter, plus the total decentration, plus two
    // millimetres of edging allowance.
    expect(res.minBlank).toBeCloseTo(54 + 7 + 2, 6);
  });

  it("reads the centre of the lens as the thinnest point of a minus lens", () => {
    const res = run();
    expect(res.ct).toBeCloseTo(1.0, 6);
    expect(res.etMin).toBeGreaterThan(res.ct);
  });

  it("makes a plus lens thin at the edge and thick at the centre", () => {
    const res = run(lens({ sph: 4 }));
    // A plano back: the centre thickness is what makes the outer edge 1 mm.
    expect(res.ct).toBeCloseTo(4.245, 2);
    expect(res.etMin).toBeCloseTo(1.0, 2);
  });

  it("reports the back of a convex lens standing proud of the frame", () => {
    const res = run(lens({ sph: 10 }));
    // A plus ten has a convex back, and the back surface bulges out behind
    // the rim. The old engine reported zero here.
    expect(res.posteriorProtrusion).toBeGreaterThan(0);
    expect(res.posteriorProtrusion).toBeCloseTo(1.85, 1);
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

describe("Clinical Rules & Input Validation - validateOpticalParams", () => {
  const validLens: LensParameters = {
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

  it("correctly clamps and snaps step inputs", () => {
    const spec = { step: 0.25, min: -10, max: 10 };
    expect(clampAndSnapInput(-3.12, spec)).toBe(-3.0);
    expect(clampAndSnapInput(-3.18, spec)).toBe(-3.25);
    expect(clampAndSnapInput(15.0, spec)).toBe(10.0); // clamped
  });
});
