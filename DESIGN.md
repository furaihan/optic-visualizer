# Design

<!-- impeccable:design-schema 1 -->

The landing page for AKTRIYO, recorded from the built surface.

## Surface

- **Route:** `/` (`src/routes/index.tsx` → `src/pages/HomePage.tsx` → `src/components/landing/CrossLanding.tsx`)
- **Mode:** Persuade. The visitor is an optician mid-job; the page's one job is to get them into the simulator.
- **Scope:** the landing page only. `/visualizer`, `/aspheric` and `/contact` keep their own sheet language and are not described here.
- **Build path:** code-led. No comp exists; the approved first-viewport artifact is the HTML sketch at `.impeccable/sketches/assigned.html`.

## World: The Optical Cross

A lens is two meridians crossing. The page is built on that cross: one vertical meridian runs the entire document — the bar, the hero, every band, the footer's last line — and hairline rules close each band across the full measure. Nothing floats, nothing is rounded, nothing casts a shadow.

The claim sits in the top-left cell the meridian creates. The frame's own values hang at the arm ends above the hero rule. The live section takes the pine plate at the crossing, bleeding past the content edge. Everything below is measured down the same two lines.

## Tokens

Declared in `src/components/landing/cross.css`, scoped to `.cross`, so the workbench keeps its sheet roles untouched.

### Palette — light

| Token | Value | Job |
| --- | --- | --- |
| `--cross-paper` | `#e9e9e4` | the ground: chalk paper, the whole page |
| `--cross-paper-2` | `#e0e0da` | the ticket's frame, one step off the ground |
| `--cross-ink` | `#101211` | notation ink: type, rules, the primary action |
| `--cross-ink-soft` | `#4a504c` | prose and secondary labels |
| `--cross-pine` | `#0f3b33` | **the plate** — the one surface that is not paper; also the range thumb and a hover |
| `--cross-pine-ink` | `#e9e9e4` | everything printed on the plate |
| `--cross-check` | `#b0271d` | **the checking colour** — a measurement past its limit, and nothing else |

### Palette — dark (`.dark .cross`)

Same names, re-pointed: ground `#0c0f0e`, paper-2 `#171d1b`, ink `#e8e9e4`, ink-soft `#a4ada7`, plate `#16594c`, checking red lifted to `#f08a7c`. Meaning never changes; only the values. The plate keeps an inset hairline in dark so it stays a surface and never dissolves into the ground.

### The one non-negotiable rule

**The checking red appears only where a measurement is past its limit.** It is not a brand accent and not a highlight. The hero's within-limit readout is ink; the same readout turns red the moment the sphere power pushes edge thickness past 6 mm.

## Type

Self-hosted through Fontsource; no hosted stylesheet.

| Face | Role |
| --- | --- |
| **Archivo Variable** (`--font` of the world) | everything. Expanded (`font-stretch` 108–120%) and uppercase for display and headings; 100% for prose |
| **Kode Mono Variable** | every figure, every label, every dimension on the drawing. Its fixed advance is the point — values line up down a column |

Scale: display `clamp(1.9rem, 3.55vw, 3.15rem)` / section head `clamp(1.35rem, 1.9vw, 1.75rem)` / sub-head `clamp(1.05rem, 1.25vw, 1.2rem)` / body `1.0625rem` / label `0.75rem` tracked +0.13em / hero figure `clamp(1.5rem, 2.4vw, 2.15rem)`. Tracking stops at −0.032em.

## Layout

Two lines define the page. The meridian sits at `37.2%` of the content measure. The hero's rule closes row one of the hero grid, which lands at roughly a third of the viewport at 1440×900 (measured 34.2%) rather than the sketch's 27.8%: the claim at its real size needs the taller first cell, and the plate takes what is left. The move is recorded here rather than left as drift. `--track-w`, `--edge`, `--content-w` and `--meridian` are computed once on `.cross` so the spine, the bar and the hero split all read the same number.

| Region | Where |
| --- | --- |
| bar | 68px, name left of the meridian, everything else right of it |
| hero head (the claim) | left cell, row 1 |
| arm labels (SPH/BC · edge thickness + verdict) | right cell, row 1, pinned to the arm ends |
| hero rule | across the full measure, row 2 |
| hero arm (lead, action, controls) | left cell, row 3 |
| the plate (section + elevation) | right cell, row 3, overhanging the content edge |

Below the fold every block is a band with a hairline at its top: a heading and its note, then rows or a drawing. No equal-size card grid, no icon tiles, no nested cards.

## Signature interaction

The drawing is not an image. `CrossSection` computes its path from the engine's own `result.section`: the front and back radii, the two rim offsets, the apexes. Move the sphere slider or pick a material and the outline, the two dimension figures, the elevation's pupil offset and the check line all change together, because they are the same measurement.

The section redraws with `cross-redraw` (320ms, exponential ease-out, transform + opacity only). `prefers-reduced-motion` disables it.

## The rule the page holds itself to

**Every figure is computed at entry.** No number is typed by hand: the section, the elevations, the ladder's edge thicknesses and reductions, the limit rows and the blank all come from `src/lib/optic-engine` reading `src/data/limits.ts`. The limit rows print `limitLabel()`, so a threshold can never differ between the table and the verdict.

Corollary: a limit either names a published standard or says it is the tool's own working rule. `LIMITS` marks every rule `guideline`, and the page prints the flat-frame note verbatim rather than implying a certification.

## Motion

One authored moment: the section redraws when a figure changes. The hero's three blocks arrive once with `cross-arrive` (620ms, 90ms stagger). There is no reveal-on-scroll hiding: content is visible by default, which is why the old `useReveal` script is not used here. `prefers-reduced-motion` disables all of it.

## Accessibility

- Both themes are first-class; the theme control names the resolved state (`useTheme().resolved`, so a `system` preference on a dark machine reads `LIGHT`), and every surface is themed from the palette.
- Body text meets 4.5:1 against its actual ground in both themes; labels on the plate are mixed at 82% of the plate ink to clear it.
- Language is reachable from the bar at every width, and `id` is verified as a real locale, not a translation afterthought.
- Every control is a real button, input or link with a visible focus ring (`.cross :focus-visible`), and the range carries a label.
- The drawings carry `role="img"` and an `aria-label` stating the values they measure.
- `aria-live="polite"` on the verdict, so a limit crossing is announced.

## Prohibited here

- Any figure typed by hand instead of computed.
- The checking red used decoratively, or for a value that is within its limit.
- Cards, rounded corners, gradients, glass, and shadows: the page is rules and one flat plate.
- A kicker or eyebrow above a heading.
- A second plate: the pine surface belongs to the section, and the close reuses a paper frame around the ticket instead.
- Hiding content behind an entrance animation.
