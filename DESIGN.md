# Design

<!-- impeccable:design-schema 1 -->

The landing page for Optical Tools (AKTRIYO). Recorded from the built surface.

## Surface

- **Route:** `/` (`src/pages/HomePage.tsx`)
- **Mode:** Persuade. The visitor is an optician at a dispensing bench, mid-job, and the page's one job is to get them into the simulator.
- **Scope:** the landing page only. `/visualizer`, `/aspheric` and `/contact` keep their own sheet language and are not described here.

## World

**Cyclorama Dawn.** One curved lighting wall, lit from below: a full-height gradient from day white through dusk rose into cobalt, ending on a hard horizon, with the bench in black beneath it. The lens is drawn across that line, half in ink on daylight and half in light on the dark.

The world's premise: on a lit stage you read what is lit. The page opens in dawn and closes in day, and the product's own geometry is what raises the lights — not a decorative theme.

## Tokens

All declared in `src/components/landing/cyclorama.css`, scoped to `.cyc`, so the workbench keeps its sheet roles untouched.

### Palette — light (the exposed print)

| Token | Value | Job |
| --- | --- | --- |
| `--cyc-sky-1` | `#fffef9` | day white: the top of the wall, the CTA's ink-inverse, the light half of the drawing |
| `--cyc-sky-2` | `#f7ecdf` | warm cream, 40% down the wall |
| `--cyc-sky-3` | `#e9c9c0` | dusk rose, 66% |
| `--cyc-sky-4` | `#8d6a8e` | mauve, 84% |
| `--cyc-sky-5` | `#2c3a72` | cobalt at the horizon |
| `--cyc-ground` | `#0a0b12` | the bench |
| `--cyc-ground-2` | `#10131c` | a raised panel on the bench |
| `--cyc-ink` | `#141821` | text and drawing ink on the lit half |
| `--cyc-ink-soft` | `#46536a` | secondary prose on the lit half |
| `--cyc-ink-faint` | `#4f5c72` | tertiary meta on the lit half |
| `--cyc-accent` | `#7d3a58` | cue marks on the lit half |
| `--cyc-mark` | `#a8331c` | **the checking colour** — only for a measurement past its limit, and the one edge under inspection |
| `--cyc-rail-ink` | `#e8eaef` | text on the bench |
| `--cyc-rail-soft` | `#a7b2c2` | secondary prose on the bench |
| `--cyc-rail-dim` | `#94a1b3` | labels and limits on the bench |
| `--cyc-on` | `#ffd9a8` | **lit** — the active cue label, on the bench only |

### Palette — dark (the same wall at night)

`html.dark .cyc` re-points the same names: the wall loses its height into deep blues (`#10131f` → `#465f9e`), the bench goes to `#05060a`, and the cue marks lift to warm cream so they still read as light. Nothing else changes meaning.

### The one non-negotiable token

`--cyc-draw-bench` — the ink the drawing uses once it crosses onto the bench. It is the sky's own light in daylight and stays light at night, because *a drawing that disappears when the page goes dark is a broken drawing*.

## Type

Self-hosted through Fontsource, no hosted stylesheet.

| Face | Role |
| --- | --- |
| **Kode Mono Variable** (`--font-mono`) | The measuring voice: every figure, dimension, cue name, sheet label, and the display headings. Its fixed advance is the point — values line up down a column. |
| **Geist Variable** (`--font-sans`) | Reading: body prose, section headings below the fold, UI labels. |
| **Archivo Variable** (`--font-archivo`) | Available; currently unused. Remove it from `index.css` if nothing claims it. |

Scale on the landing page: display 49px (hero) / 36px (section) / 20px (values) / 15px (lead) / 13.5px (body) / 11px (labels). Tracking stops at −0.035em. Figures always carry `font-variant-numeric: tabular-nums` (the `.tnum` utility).

## Structure

The first viewport is a single lighting state, measured to a 1440 × 900 frame and bound to absolute positions at `lg`:

| Region | Box (of 1440 × 900) |
| --- | --- |
| header rule | 0–66px |
| claim, cue label, lead, CTA | left 3.33%, top 11.78%, width 31% |
| the plate (section + opening) | right 3.6%, top 19.4%, width 47.5%, height 470px |
| cue rail (five states) | bottom, height 21.56% |

The horizon sits at 57.8% of the hero. The plate's internal horizon is 73.5% of its own box, computed so the two lines coincide.

Below the fold each block is a ruled section rather than a card: a top hairline, a heading, then either a set of rows or a table. No equal-size card grid, no icon tiles.

## Signature interaction

The drawing is not an image. `HeroFigure` computes the section path from the engine's own `result.section` — the front radius, the back radius, the two rim offsets — and draws the frame opening from A, B, ED and the optical centre from PD and fitting height. Change the prescription and the geometry changes, because it is the same lens the sheet measures.

The plate is drawn **twice from one path set**, clipped at the horizon: ink above, light below. The two halves cannot drift apart because they are the same paths.

## The rule the page holds itself to

**Every figure is computed at entry, against a named limit.** The checks table reads `measureRows()` from `src/lib/limits.ts`; the limits read `src/data/limits.ts`; the over-limit panel recomputes the same frame with `OVERSIZED_RX` and prints what the engine returns (ET 7.90, anterior 0.85). Nothing on the page is a typed number.

Corollary: a limit either names a published standard or says it is the tool's own working rule. The page says the latter.

## Motion

One authored moment: the cue comes up. `cyc-raise` (12px rise) staggers the claim, then the plate arrives with `cyc-rise`. Reveals fire once per section via `IntersectionObserver`, with an arithmetic sweep as backup. Everything is visible by default; the hiding class is added by script and only below the fold. `prefers-reduced-motion` disables all of it.

## Accessibility

- Both themes are first-class; `color-scheme` follows the theme, so native scrollbars and form controls match.
- Text meets 4.5:1 against its actual ground in both themes, including the mono annotations.
- `document.documentElement.lang` follows the `lang` search param.
- The theme control reflects the **resolved** theme, not the stored preference.
- All interactive elements carry visible focus rings; the plate carries a full text `aria-label` with its measured values.
- On widths below 640px the plate's annotations are suppressed (they would render under 9px) and the same figures are read from a labelled list beneath the drawing.

## Prohibited here

- Any figure typed by hand instead of computed.
- The checking colour used decoratively.
- A second horizon: the page has exactly one, at 57.8% of the hero.
- Cards. Sections are ruled, not boxed.
- A decorative cue label above a heading (removed from all below-fold sections; it survives only on the hero, where it names the actual lighting state).
