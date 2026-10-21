/**
 * The sheet's proportions.
 *
 * `classic` is the sheet the landing page shows, and it stays exactly as it
 * was. `workbench` is the workbench's own: the same drawing with tighter
 * margins, so the type is bigger and the sheet and its schedule both land
 * inside the first screen.
 *
 * The bands are what is drawn in them, not rounded up: the board is
 * height-bound, so every unit of slack here is taken straight out of the type
 * size. Above the drawing is the protrusion dimension and its value; below it
 * are the groove percentage and the views' own names.
 */
export const SHEET = {
  classic: { pad: 24, dimBand: 60, labelBand: 46, foot: 18, gap: 44, frontScale: 2.6, nameY: 14 },
  workbench: { pad: 20, dimBand: 62, labelBand: 46, foot: 18, gap: 40, frontScale: 4, nameY: 9 },
} as const;

export type SheetVariant = keyof typeof SHEET;

/** Below this width the three views no longer fit side by side legibly. */
export const NARROW_SHEET = 720;

/**
 * How wide a character is in the sheet's units, at the sheet's type size.
 * Measured off the drawn labels: a label's own width has to be known before
 * it can be kept inside the sheet's edge.
 */
export const CHAR_WIDTH = 8.4;

/** The magnification the section is drawn at, in sheet units per millimetre. */
export const SECTION_SCALE = 6;

export type SheetGeometry = {
  /** The width of the viewBox. */
  width: number;
  /** The height of the viewBox. */
  height: number;
  pad: number;
  gap: number;
  dimBand: number;
  labelBand: number;
  /** The origin of the section: the left edge of the rim, the centre line. */
  originX: number;
  /** The origin of the section on the vertical axis. */
  originY: number;
  /** The left edge of the edge detail. */
  detailOriginX: number;
  /** The left edge of the front elevation. */
  frontOriginX: number;
  /** The height of the tallest drawing on the strip. */
  contentH: number;
  /** The magnification of the front elevation, or null when it does not fit. */
  frontScale: number | null;
};

/** The magnifications the front elevation may be drawn at. */
const FRONT_SCALES = [2, 3, 4, 5, 6];

type SheetInput = {
  variant: SheetVariant;
  /** The section's drawn width and height. */
  sectionW: number;
  sectionH: number;
  /** The edge detail's drawn width and height. */
  detailW: number;
  detailH: number;
  /** The front elevation's drawn width at one magnification. */
  frontW1: number;
  frontH1: number;
  /** The distance from the sheet's left edge to the rim's front face. */
  inset: number;
  /** The distance from the detail's left edge to its origin. */
  detailInset: number;
  /** The elevation's origin offset at one magnification. */
  frontInset1: number;
  compact: boolean;
  /** The canvas the sheet is drawn on, and the height the drawing may take. */
  canvasW: number;
  canvasH: number;
};

/**
 * The box the front elevation is drawn in, on its own.
 *
 * Sized to what is actually drawn: the two openings and the rim, the A
 * dimension above them, the B dimension beside them, the DBL and the effective
 * diameter below, and the view's own name. A box padded past that shrinks the
 * drawing for no reason, and the drawing is what the sheet is for.
 */
export function frontViewBox(
  frame: { a: number; b: number; dbl: number },
  scale: number,
  pad: number,
  dimBand: number
) {
  const originX = pad + (frame.a + frame.dbl) * scale;
  const originY = pad + dimBand + (frame.b * scale) / 2;
  const halfH = (frame.b * scale) / 2;

  const left = originX - (frame.a + frame.dbl) * scale - 1.25 * scale;
  const right = originX + frame.a * scale + 82;
  const top = originY - halfH - 60;
  const bottom = originY + halfH + 64;

  return {
    x: left - 6,
    y: top - 4,
    width: right - left + 12,
    height: bottom - top + 8,
  };
}

/**
 * The sheet's box.
 *
 * One calculation for both workbenches, so the spherical sheet and the
 * aspheric sheet are cut from the same pattern: the same margins, the same
 * bands, the same decision about which views fit.
 *
 * The front elevation is drawn at the largest round magnification that still
 * lets the whole sheet fill the canvas without making the drawing smaller.
 * A sheet that is magnified to fit and a sheet that is shrunk to fit read
 * differently, and only one of them is a drawing.
 */
export function sheetGeometry(input: SheetInput): SheetGeometry {
  const s = SHEET[input.variant];
  const pad = s.pad;
  const gap = input.compact ? 26 : s.gap;

  // The height the sheet's own bands take, and the height of the drawings
  // themselves: the elevation is never the tallest, so the sheet's height is
  // known before its magnification is.
  const contentH = Math.max(input.sectionH, input.detailH);
  const height = contentH + pad + s.labelBand + s.dimBand + s.foot;

  // The largest scale the drawing may take: it is bound by the height, and the
  // height is bound by the board the sheet sits in.
  const overhead = input.compact ? 171 : 98;
  const cap = input.canvasH > overhead ? (input.canvasH - overhead) / height : 1;
  const targetW = cap > 0 ? input.canvasW / cap : input.canvasW;

  const widthWith = (frontScale: number) =>
    pad + input.sectionW + gap + input.detailW + gap + input.frontW1 * frontScale + pad + 54;
  const widthWithout = pad + input.sectionW + gap + input.detailW + pad + 54;

  // The landing page's sheet is drawn at its own magnification and is left
  // exactly as it was. The workbench's sheet takes the magnification that
  // fills the canvas.
  let frontScale: number | null = null;
  if (input.compact) {
    frontScale = null;
  } else if (input.variant === 'classic') {
    frontScale = s.frontScale;
  } else {
    for (const candidate of FRONT_SCALES) {
      if (widthWith(candidate) <= targetW) frontScale = candidate;
    }
  }

  const width = frontScale ? widthWith(frontScale) : widthWithout;

  return {
    width,
    height,
    pad,
    gap,
    dimBand: s.dimBand,
    labelBand: s.labelBand,
    originX: pad + input.inset,
    originY: pad + s.dimBand + contentH / 2,
    detailOriginX: pad + input.sectionW + (input.compact ? 26 : gap) + input.detailInset,
    frontOriginX:
      pad +
      input.sectionW +
      gap +
      input.detailW +
      gap +
      input.frontInset1 * (frontScale ?? 1),
    contentH,
    frontScale,
  };
}
