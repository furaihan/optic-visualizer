import { describe, it, expect } from "vitest";
import { LensParameters, FrameParameters, PatientParameters } from "./types";
import { calculateLens } from "./optical";
import { validateOpticalParams, clampAndSnapInput } from "./validation";

describe("Optical Calculations - calculateLens", () => {
  const standardLens: LensParameters = {
    sph: -4.0,
    cyl: -1.0,
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

  it("calculates correct thicknesses under standard conditions", () => {
    const res = calculateLens(
      standardLens,
      standardFrame,
      standardPatient,
      1.0,
      0.33,
      "full",
    );

    expect(res.ct).toBeGreaterThanOrEqual(1.0);
    expect(res.et).toBeGreaterThanOrEqual(1.0);
    expect(res.decentration).toBeGreaterThanOrEqual(0);
    expect(res.weight).toBeGreaterThan(0);
    expect(res.anteriorProtrusion).toBeGreaterThanOrEqual(0);
    expect(res.posteriorProtrusion).toBeGreaterThanOrEqual(0);
  });

  it("safely handles extreme powers and returns finite numbers without NaN", () => {
    const extremeLens: LensParameters = {
      sph: -25.0,
      cyl: -6.0,
      axis: 90,
      index: 1.74,
      baseCurve: 2.0,
    };

    const res = calculateLens(
      extremeLens,
      standardFrame,
      standardPatient,
      1.0,
      0.33,
      "full",
    );

    expect(Number.isFinite(res.ct)).toBe(true);
    expect(Number.isFinite(res.et)).toBe(true);
    expect(isNaN(res.ct)).toBe(false);
    expect(isNaN(res.et)).toBe(false);
  });

  it("generates index recommendation details matching guidelines", () => {
    // Low power should suggest standard/clarity
    const mildLens = { ...standardLens, sph: -1.5 };
    const mildRes = calculateLens(
      mildLens,
      standardFrame,
      standardPatient,
      1.0,
      0.33,
      "full",
    );
    expect(mildRes.recommendation).toBeDefined();
    expect(mildRes.recommendation?.index).toBeLessThanOrEqual(1.56);

    // Extreme power should recommend 1.74
    const heavyLens = { ...standardLens, sph: -9.5 };
    const heavyRes = calculateLens(
      heavyLens,
      standardFrame,
      standardPatient,
      1.0,
      0.33,
      "full",
    );
    expect(heavyRes.recommendation?.index).toBe(1.74);
  });

  it("calculates higher weight for lower index materials due to volume differences", () => {
    const baseRes15 = calculateLens(
      { ...standardLens, index: 1.5 },
      standardFrame,
      standardPatient,
      1.0,
      0.33,
      "full",
    );
    const baseRes174 = calculateLens(
      { ...standardLens, index: 1.74 },
      standardFrame,
      standardPatient,
      1.0,
      0.33,
      "full",
    );

    // 1.74 should be thinner than 1.50
    expect(baseRes174.et).toBeLessThan(baseRes15.et);
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

