import { describe, it, expect } from "vitest";
import { calculateLens } from "../../optic-engine/optical";
import type {
  CalculationResult,
  FrameParameters,
  LensParameters,
  PatientParameters,
} from "../../optic-engine/types";
import { buildLensField, findThickestMeridian, thicknessAtPoint } from "../field";

/**
 * The exactness suite.
 *
 * The 3D surface is only allowed to exist if it is the same measurement as the
 * sheet. Every case below asks the field for the figure the engine already
 * printed, and fails if they differ by more than a ten-thousandth of a
 * millimetre — which is far below anything the tool displays, and far above
 * floating-point noise.
 *
 * The figures are not typed in here: the expected value is the engine's own
 * output on the same call. What this suite proves is that the continuous field
 * and the sampled section are one measurement, not two.
 */

const EPS = 1e-4;

const lens: LensParameters = { sph: -4.0, cyl: 0, axis: 0, index: 1.6, baseCurve: 4.0 };
const frame: FrameParameters = { a: 52, b: 40, dbl: 18, depth: 6.0, ed: 54 };
const patient: PatientParameters = { pd: 63, fittingHeight: 22 };

function solve(
  l: LensParameters,
  f: FrameParameters = frame,
  p: PatientParameters = patient,
): CalculationResult {
  return calculateLens(l, f, p, 1.0, 0.33, "full");
}

/** The four cardinal meridians the section reports. */
const CARDINALS = [
  { name: "right", theta: 0, expected: (r: CalculationResult) => r.section!.edgeRight },
  { name: "top", theta: 90, expected: (r: CalculationResult) => r.section!.edgeTop },
  { name: "left", theta: 180, expected: (r: CalculationResult) => r.section!.edgeLeft },
  { name: "bottom", theta: 270, expected: (r: CalculationResult) => r.section!.edgeBottom },
] as const;

describe("the lens field is the engine's own measurement", () => {
  const result = solve(lens);
  const field = buildLensField({ result, lens, frame, patient });

  it("reproduces the centre thickness at the optical centre", () => {
    const t = field.thicknessAt(0, 0);
    expect(Math.abs(t - result.ct)).toBeLessThan(EPS);
  });

  it("reproduces the back vertex offset, so the two vertices are the engine's", () => {
    expect(Math.abs(field.frontApexZ - result.section!.frontApexZ)).toBeLessThan(1e-12);
    expect(Math.abs(field.backApexZ - result.section!.backApexZ)).toBeLessThan(1e-12);
  });

  for (const cardinal of CARDINALS) {
    it(`reproduces the ${cardinal.name} rim edge thickness`, () => {
      const rim = field.rimRadiusAt(cardinal.theta);
      const t = field.thicknessAt(cardinal.theta, rim);
      const expected = cardinal.expected(result);
      expect(Math.abs(t - expected)).toBeLessThan(EPS);
    });
  }

  it("places the top rim's mid-plane exactly on the bevel groove", () => {
    // The engine hangs the lens in the groove by the vertical meridian through
    // the optical centre, so that is the one meridian whose rim mid-plane is
    // the groove. Every other one differs, and that is the model, not a bug.
    const rim = field.rimRadiusAt(90);
    const mid = (field.frontZ(90, rim) + field.backZ(90, rim)) / 2;
    expect(Math.abs(mid - field.groove)).toBeLessThan(EPS);
    expect(Math.abs(mid - result.section!.groove)).toBeLessThan(1e-12);
  });

  it("reports no negative material anywhere on the body", () => {
    for (let i = 0; i < 720; i += 1) {
      const theta = i / 2;
      const rim = field.rimRadiusAt(theta);
      if (!Number.isFinite(rim)) continue;
      for (let j = 0; j <= 32; j += 1) {
        const t = field.thicknessAt(theta, (rim * j) / 32);
        expect(Number.isFinite(t)).toBe(true);
        expect(t).toBeGreaterThan(-EPS);
      }
    }
  });
});

describe("the field follows the lens through every shape the tool offers", () => {
  const cases: { name: string; lens: LensParameters; frame?: FrameParameters }[] = [
    { name: "the opening prescription, minus four", lens },
    { name: "a plus two", lens: { ...lens, sph: 2, baseCurve: 6 } },
    {
      name: "a minus eight in the thinnest index",
      lens: { sph: -8, cyl: 0, axis: 0, index: 1.74, baseCurve: 3 },
    },
    {
      name: "a toric on a ninety degree axis",
      lens: { sph: -3, cyl: -2, axis: 90, index: 1.6, baseCurve: 4 },
    },
    {
      name: "a toric off the axes",
      lens: { sph: -2.5, cyl: 1.5, axis: 35, index: 1.56, baseCurve: 5 },
    },
    {
      name: "a lens decentred across a narrow frame",
      lens: { sph: -5, cyl: 0, axis: 0, index: 1.67, baseCurve: 3.5 },
      frame: { a: 46, b: 34, dbl: 14, depth: 5, ed: 48 },
    },
    {
      name: "a tall, shallow rim",
      lens: { sph: -2, cyl: 0, axis: 0, index: 1.5, baseCurve: 6 },
      frame: { a: 58, b: 52, dbl: 20, depth: 7, ed: 44 },
    },
  ];

  for (const testCase of cases) {
    it(`holds for ${testCase.name}`, () => {
      const result = solve(testCase.lens, testCase.frame);
      if (result.error) {
        // A prescription the engine refuses has no body; the field must refuse
        // it in the same way rather than draw something the sheet would not.
        expect(() =>
          buildLensField({
            result,
            lens: testCase.lens,
            frame: testCase.frame ?? frame,
            patient,
          }),
        ).toThrow();
        return;
      }

      const field = buildLensField({
        result,
        lens: testCase.lens,
        frame: testCase.frame ?? frame,
        patient,
      });

      expect(Math.abs(field.thicknessAt(0, 0) - result.ct)).toBeLessThan(EPS);

      for (const cardinal of CARDINALS) {
        const rim = field.rimRadiusAt(cardinal.theta);
        expect(Number.isFinite(rim)).toBe(true);
        const t = field.thicknessAt(cardinal.theta, rim);
        expect(Math.abs(t - cardinal.expected(result))).toBeLessThan(EPS);
      }

      // The thickest edge the field finds is the thickest edge the engine
      // reported. This is the figure the whole surface is built to show.
      const thickest = findThickestMeridian(field);
      expect(Math.abs(thickest.thickness - result.et)).toBeLessThan(1e-3);
    });
  }
});

describe("the thickest point is where the sheet cannot show it", () => {
  it("sits off the cardinal meridians of a decentred minus lens", () => {
    const result = solve(lens);
    const field = buildLensField({ result, lens, frame, patient });
    const thickest = findThickestMeridian(field);

    // The opening lens is edged around a pupil that sits nasal and high, so
    // the far rim is the temporal corner below it — not the side the side
    // elevation is drawn through.
    expect(thickest.theta).toBeGreaterThan(300);
    expect(thickest.theta).toBeLessThan(350);
    expect(thickest.thickness).toBeGreaterThan(result.et - 1e-3);
  });

  it("agrees with the engine on which meridian governs", () => {
    const result = solve(lens);
    const field = buildLensField({ result, lens, frame, patient });
    const thickest = findThickestMeridian(field, 720);
    // The engine's edge thickness is the maximum over its meridians, so the
    // field's maximum over the whole rim cannot exceed it by any margin.
    expect(thickest.thickness).toBeLessThanOrEqual(result.et + 1e-3);
  });
});

describe("a lens the engine refuses has no body", () => {
  it("throws rather than drawing a shape the sheet would not measure", () => {
    const impossible = solve({ sph: -20, cyl: 0, axis: 0, index: 1.5, baseCurve: 2 });
    const hasError = impossible.error === true;
    const attempt = () =>
      buildLensField({ result: impossible, lens, frame, patient });
    if (hasError) {
      expect(attempt).toThrow();
    } else {
      // If this prescription is surfaceable after all, the field must still be
      // finite wherever the engine produced a section.
      expect(() => attempt()).not.toThrow();
    }
  });
});

describe("the field answers in the lens's own plane", () => {
  it("finds the same thickness from a point as from a direction", () => {
    const result = solve(lens);
    const field = buildLensField({ result, lens, frame, patient });
    const theta = 32;
    const radius = field.rimRadiusAt(theta) * 0.6;
    const x = field.opening.ocX + radius * Math.cos((theta * Math.PI) / 180);
    const y = field.opening.ocY + radius * Math.sin((theta * Math.PI) / 180);
    const fromPoint = thicknessAtPoint(field, { x, y });
    const fromDirection = field.thicknessAt(theta, radius);
    expect(Math.abs(fromPoint - fromDirection)).toBeLessThan(1e-9);
  });

  it("gives every direction the same centre thickness at the optical centre", () => {
    const result = solve(lens);
    const field = buildLensField({ result, lens, frame, patient });
    const values = [0, 45, 90, 180, 271].map((theta) => field.thicknessAt(theta, 0));
    for (const value of values) {
      expect(Math.abs(value - result.ct)).toBeLessThan(1e-9);
    }
  });
});
