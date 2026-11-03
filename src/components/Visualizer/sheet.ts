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

/**
 * The plan view's own proportions.
 *
 * It is the one view whose magnification cannot be declared in advance: two
 * openings and a bridge make it wide and short by nature, so a fixed scale
 * either clips the temples on a narrow board or prints the values at six
 * pixels on a wide one. Its scale is chosen from the board it is given, and
 * the sheet states the scale it landed on.
 */
export const TOP_VIEW = {
  /** How far a temple arm runs back from the hinge, in millimetres. */
  templeBack: 26,
  /** How far its end sits outboard of the opening, so the pair splays the way
      a pair of temples does rather than reading as two parallel bars. */
  templeOut: 6,
  /** The frame-depth dimension sits this far under the openings. */
  dimGap: 26,
  /** The PD dimension sits at the foot of the drawing, clear of the temples:
      it is the overall width, and a plan view dimensions overall widths last. */
  pdGap: 18,
  /** Half the height of a value set on its own line. */
  textRoom: 9,
  /** Below this magnification the PD dimension carries its initials, not its
      full name: the long name would take the whole width it is measuring. */
  pdAbbrevBelowMm: 2.5,
  /** Space inside the sheet's edge. */
  edge: 14,
} as const;

/** The magnifications the plan view may be drawn at. */
const TOP_SCALES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];

export type TopViewGeometry = {
  width: number;
  height: number;
  /** Where the bridge's centre sits, horizontally. */
  centerX: number;
  /** The centre line of the openings. */
  centerY: number;
  /** The magnification the sheet is drawn at, in sheet units per millimetre. */
  scale: number;
};

/**
 * The plan view's box, and the magnification that fills the board.
 *
 * The type on the sheet is set in sheet units, so the magnification and the
 * type size are the same decision: halve the scale and every value doubles.
 * The largest magnification whose box still fits the canvas is therefore the
 * one that keeps the values legible at that width — which is why this is
 * chosen rather than declared.
 */
export function topViewGeometry(
  frame: { a: number; b: number; dbl: number; depth: number },
  patient: { pd: number },
  pdLabels: { long: string; short: string },
  canvasW: number,
  canvasH: number
): TopViewGeometry & { pdLabel: string } {
  const at = (scale: number): TopViewGeometry & { pdLabel: string } => {
    // The label the sheet will actually print at this magnification: the box
    // is measured against what is drawn, never against a longer string the
    // drawing will not show.
    const pdLabel = scale < TOP_VIEW.pdAbbrevBelowMm ? pdLabels.short : pdLabels.long;
    const openingW = frame.a * scale;
    const halfGap = (frame.dbl / 2) * scale;
    const depthPx = frame.depth * scale;

    // The PD dimension belongs to the patient, not the frame, and its value is
    // set across the middle of the line: half of it is the reach the sheet has
    // to hold on each side, whatever the frame is doing.
    const half =
      Math.max(
        halfGap + openingW + TOP_VIEW.templeOut * scale,
        (patient.pd / 2) * scale + (pdLabel.length * CHAR_WIDTH) / 2
      ) + TOP_VIEW.edge;

    // The bridge's crown above the openings, the openings themselves, and the
    // two dimension rows under them. The temples run back inside that same
    // foot, which is what keeps this box close to the board's own proportions
    // instead of a strip with empty air above and below it.
    const crown = depthPx * 0.6 + TOP_VIEW.edge;
    const foot =
      depthPx +
      Math.max(
        TOP_VIEW.templeBack * scale,
        TOP_VIEW.dimGap + TOP_VIEW.textRoom
      ) +
      TOP_VIEW.pdGap +
      TOP_VIEW.textRoom +
      TOP_VIEW.edge;

    return {
      width: half * 2,
      height: crown + depthPx + foot,
      centerX: half,
      centerY: crown,
      scale,
      pdLabel,
    };
  };

  let chosen = at(TOP_SCALES[0]);
  for (const scale of TOP_SCALES) {
    const candidate = at(scale);
    if (candidate.width <= canvasW && candidate.height <= canvasH) chosen = candidate;
  }
  return chosen;
}

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
 * The elevation drawn on its own, and the magnification that fills the board.
 *
 * Alone on a phone the elevation has the whole board to itself, so it takes
 * the largest magnification whose box still fits instead of the scale the
 * three-view strip uses — the scale it is drawn at is the size its values
 * print at, and at the strip's magnification they print at seven pixels.
 */
export function frontViewFit(
  frame: { a: number; b: number; dbl: number },
  canvasW: number,
  canvasH: number,
  scales: number[] = [2, 3, 4, 5, 6]
) {
  let chosen = scales[0];
  for (const scale of scales) {
    const box = frontViewBox(frame, scale, SHEET.workbench.pad, SHEET.workbench.dimBand);
    if (box.width <= canvasW && box.height <= canvasH) chosen = scale;
  }
  return chosen;
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
