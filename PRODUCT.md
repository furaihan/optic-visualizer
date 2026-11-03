# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** practising opticians and optical laboratory staff who are about to cut or edge a lens, and who need to know whether a given prescription will physically fit a given frame before committing a blank to it. They are at a dispensing table or a lab bench, working quickly, with the job in hand.

**Secondary:** optometry students at Akademi Optometri Yogyakarta using the tool in coursework to understand how lens geometry follows from a prescription and a frame. They benefit from the same clarity the professionals need, but they are not the audience the page is written for.

## Product Purpose

Estimate, before fabrication, the geometry of an uncut lens inside a chosen frame — edge and centre thickness, surface curvature, protrusion, minimum blank diameter, weight, reference prism — from a prescription, frame dimensions, and fitting measurements. Success is a professional trusting the figure enough to act on it.

## Positioning

The tool shows **why the number is what it is**. Every figure is calculated live by the engine at render time, and the geometry that produces it is drawn alongside it. A neighbouring calculator can print the same millimetres; it cannot show the section, the sagitta, and the bevel that generate them, all moving together as an input changes. Explanation is the feature, not the documentation.

## Operating Context

- Used at a dispensing table or optical laboratory bench, typically mid-job, with the frame and prescription already in hand.
- The vocabulary is the trade's own: SPH, CYL, axis, base curve, A/B/DBL/ED, PD, fitting height, bevel position, decentration, minimum blank.
- Frame depth, bevel percentage, and rim type are physical facts about the frame being worked on, not abstract settings.
- The model assumes a flat frame plane; wrap and frame base curve are not modelled, and the tool says so rather than implying otherwise.
- Limits are the tool's own working rules unless a published standard is named. They are checks, not authority.
- Verification of a finished lens is a separate physical act performed with a lensometer. The simulator plans; it does not certify.

## Capabilities and Constraints

- Spherical lens and frame simulation with side-section, top-down, and front views, comparison mode, and a recommendation engine.
- A separate aspheric surface designer (per-surface conic constant plus A2/A4/A6/A8 coefficients, with measured surface departure).
- Real-time validation against working limits, with an undo/redo history.
- Full i18n (English / Indonesian) via a `lang` URL search param, and a light/dark theme toggle. Both must remain reachable from the landing page.
- All calculation and drawing runs in the browser; inputs are not sent to an external server.
- Existing routes (`/visualizer`, `/aspheric`, `/contact`) keep their current interface. This work is the landing page.

## Brand Commitments

- The name **AKTRIYO** (Aktriyo Measuring Project) and its association with Akademi Optometri Yogyakarta.
- The engine's own identity strings (`AMP_V5.0.0`, `AMP_ASPH_V1.0.0`) are real and may be shown as provenance.
- Both languages carry equal weight; neither is a translation afterthought.

## Evidence on Hand

- **No usage figures, no named customers, no testimonials, no case studies, no benchmarks, no press.** None may be invented.
- The only evidence the page may use is the engine itself: live computed output, the drawn geometry, and the documented working limits with their sources.
- Five public-domain archival photographs live in `src/assets/bench/`. They show other people's benches and are not this product. **Cut from the landing page** — decided, not an omission.
- Engine version strings and the limit/source table in `README.md` and `src/data/limits.ts` are real.

## Product Principles

1. **Show the cause.** A figure that cannot be traced to a drawn dimension is not finished.
2. **Name the source.** A limit either cites a standard or says it is the tool's own working rule.
3. **Never overclaim.** Estimate, planning, and reference are the honest words; certification and replacement are not.
4. **The drawing is the interface.** Controls change geometry, not just values.
5. **Both languages, both themes, always.** They are part of the product, not settings.

## Accessibility & Inclusion

- All existing interactive elements carry visible focus rings and real labels; this must hold.
- Motion must respect `prefers-reduced-motion`, and no content may be hidden by an entrance animation that fails to fire.
- Text must meet WCAG AA against whatever ground the design commits to, including the light and dark variants.
