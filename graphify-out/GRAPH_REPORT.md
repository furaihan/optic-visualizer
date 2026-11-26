# Graph Report - optic-tools  (2026-11-04)

## Corpus Check
- 174 files · ~211,773 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .css 2, .lock 1)

## Summary
- 947 nodes · 2956 edges · 31 communities (27 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8d2b32d4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AsphericSidebar.tsx
- optical.ts
- Trial Frame Fitting (bench image)
- Landing Page & Home
- Design
- README Domain Concepts
- main.tsx
- TypeScript Path Aliases
- shadcn components.json Config
- package.json Manifest
- RootLayout.tsx
- AsphericDesktopGrid.tsx
- Runtime Dependencies
- index.css (global stylesheet)
- Trial Lens Set
- ContactPage.tsx
- Dev Dependencies
- Product
- Vite Build Config
- npm Scripts
- US Army Soldiers
- US Navy Hospital Eye Examination Photograph (050129-N-6477M-012)
- Trial Frame Reading Photograph
- Intent Skills Sync Script
- translations
- Global CSS Type Shim
- select.tsx
- playwright
- frameMesh.ts
- ThreeSurface.tsx
- resizable.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 85 edges
2. `Language` - 63 edges
3. `translations` - 52 edges
4. `FrameParameters` - 44 edges
5. `CalculationResult` - 39 edges
6. `PatientParameters` - 36 edges
7. `calculateLens()` - 29 edges
8. `FrameType` - 29 edges
9. `@tanstack/react-router` - 28 edges
10. `cn` - 26 edges

## Surprising Connections (you probably didn't know these)
- `The rule the page holds itself to` --references--> `limitLabel()`  [INFERRED]
  DESIGN.md → src/data/limits.ts
- `Signature interaction` --references--> `CrossSection()`  [INFERRED]
  DESIGN.md → src/components/landing/cross/CrossSection.tsx
- `Motion` --references--> `useReveal()`  [INFERRED]
  DESIGN.md → src/components/landing/useReveal.ts
- `AsphericSidebarProps` --references--> `Language`  [EXTRACTED]
  src/components/AsphericSidebar.tsx → src/lib/translations/types.ts
- `SimulatorLayout()` --calls--> `BrandRule()`  [EXTRACTED]
  src/routes/simulator-layout.tsx → src/components/BrandRule.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Aspheric Engine Calculation Pipeline** — readme_aspheric_engine, readme_aspheric_sagitta_formula, readme_per_surface_control, readme_aberration_metrics [EXTRACTED 1.00]
- **Spherical Lens Thickness & Protrusion Calculation Pipeline** — readme_combined_decentration, readme_effective_radius, readme_surface_radii, readme_sagitta_formula, readme_center_edge_thickness, readme_frame_protrusion [EXTRACTED 1.00]
- **AGENTS.md Agent Workflow Policies** — agents_intent_skill_loading, agents_graphify_knowledge_graph, agents_graphify_query_first_rule [INFERRED 0.85]

## Communities (31 total, 4 thin omitted)

### Community 0 - "AsphericSidebar.tsx"
Cohesion: 0.06
Nodes (70): cn, lucide-react, AsphericSidebar(), AsphericSidebarProps, AsphericSurfacePanel(), COEFFICIENT_STEP, BrandRule(), LandingFeatures() (+62 more)

### Community 1 - "optical.ts"
Cohesion: 0.05
Nodes (104): vitest, AsphericVisualizerProps, ASPHERIC_EXAMPLE, LandingModules(), REFERENCE_FRAME, REFERENCE_PATIENT, JobTicketProps, MeasurementSheetProps (+96 more)

### Community 2 - "Trial Frame Fitting (bench image)"
Cohesion: 0.44
Nodes (9): Trial Frame Fitting (bench image), Trial Frame Axis Scale, Diopter Lens Power, Eye Examination, Optometrist / Eye Care Practitioner, Patient Undergoing Eye Exam, Subjective Refraction, Trial Frame (+1 more)

### Community 3 - "Landing Page & Home"
Cohesion: 0.07
Nodes (60): react, CrossBar(), CrossHero(), ASPHERIC_EXAMPLE, CrossClose(), CrossFooter(), CrossInstruments(), CrossQuestions() (+52 more)

### Community 4 - "Design"
Cohesion: 0.12
Nodes (15): Accessibility, Design, Layout, Motion, Palette — dark (`.dark .cross`), Palette — light, Prohibited here, Signature interaction (+7 more)

### Community 5 - "README Domain Concepts"
Cohesion: 0.08
Nodes (31): graphify-out Knowledge Graph, AMP - Aktriyo Measuring Project (page title), HTML Entry Point (index.html), Aberration Metrics (SA0, Coma X), Akademi Optometri Yogyakarta (Aktriyo), AMP_ASPH_V1.0.0 Aspheric Engine Core, AMP_V4.2.0 Engine Core, Project Architecture Layout (+23 more)

### Community 6 - "main.tsx"
Cohesion: 0.09
Nodes (23): react-dom, AsphericContext, AsphericProvider(), AsphericState, OpticalContext, OpticalProvider(), OpticalState, loadStoredState() (+15 more)

### Community 7 - "TypeScript Path Aliases"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+15 more)

### Community 8 - "shadcn components.json Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "package.json Manifest"
Cohesion: 0.09
Nodes (21): engines, bun, intent, skills, name, packageManager, private, type (+13 more)

### Community 10 - "RootLayout.tsx"
Cohesion: 0.06
Nodes (25): @base-ui/react, class-variance-authority, CheatSheetBody(), HotkeysCheatSheet(), HotkeysCheatSheetProps, LandingNav(), GlobalNav(), NavItem() (+17 more)

### Community 11 - "AsphericDesktopGrid.tsx"
Cohesion: 0.08
Nodes (45): @tanstack/react-router, AsphericDesktopGrid(), ErrorBoundary, Props, State, AsphericMobileViews(), DesktopGrid(), MobileViews() (+37 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.11
Nodes (19): dependencies, @base-ui/react, class-variance-authority, cn, @fontsource-variable/geist, lucide-react, react, react-dom (+11 more)

### Community 14 - "Trial Lens Set"
Cohesion: 0.31
Nodes (11): trial-lens-set.jpg (open trial lens set case), Accessories Compartment (occluders and marking pen), Concave Cylinder Lens Row, Concave Sphere Lens Row, Convex Cylinder Lens Row, Convex Sphere Lens Row, Diopter Power Labels on Lens Rows, Metal Carrying Case with Lens Compartments (+3 more)

### Community 15 - "ContactPage.tsx"
Cohesion: 0.22
Nodes (5): Badge(), badgeVariants, Card(), CardContent(), ContactPage()

### Community 16 - "Dev Dependencies"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, tailwindcss, tsx, @types/node, @types/react, @types/react-dom, @types/three (+2 more)

### Community 17 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 18 - "Vite Build Config"
Cohesion: 0.29
Nodes (4): @tailwindcss/vite, vite, @vitejs/plugin-react, root

### Community 19 - "npm Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, clean, dev, lint, preview, test

### Community 20 - "US Army Soldiers"
Cohesion: 0.48
Nodes (7): Bench Photo: Soldiers Adjusting an Optical Instrument in a Field Clinic, Mobile Field Optical Clinic Interior, Optical Bench Instrument (Lensometer / Vertexometer Style Device), Optical Instrument Adjustment and Calibration, OWLES Name Tape, UCP Digital Camouflage Army Combat Uniform, US Army Soldiers

### Community 21 - "US Navy Hospital Eye Examination Photograph (050129-N-6477M-012)"
Cohesion: 0.52
Nodes (7): US Navy Hospital Eye Examination Photograph (050129-N-6477M-012), Clinician-Patient Eye Contact at the Eyepiece, Corrective Eyewear (Spectacles), Green Fixation Target Light, U.S. Navy Hospital Optometry Clinic, Ophthalmic Examination, Slit Lamp Biomicroscope

### Community 22 - "Trial Frame Reading Photograph"
Cohesion: 0.67
Nodes (6): Trial Frame Reading Photograph, Presbyopia and Near-Vision Correction, Near-Vision Reading Card, Subjective Refraction Examination, Ophthalmic Trial Frame, Community Vision Screening Setting

### Community 24 - "translations"
Cohesion: 0.08
Nodes (65): @tanstack/react-hotkeys, asphericPath(), asphericSag(), AsphericVisualizer, LensPosition, AppFooter(), FooterFigures, CopyOrderButton() (+57 more)

### Community 26 - "select.tsx"
Cohesion: 0.24
Nodes (3): SelectContent(), SelectScrollDownButton(), SelectScrollUpButton()

### Community 27 - "playwright"
Cohesion: 0.29
Nodes (6): mcp, servers, command, type, $schema, playwright

### Community 29 - "frameMesh.ts"
Cohesion: 0.06
Nodes (64): @react-three/fiber, three, Caliper(), CaliperProps, FrameBody(), eased(), LensBody(), LensBodyProps (+56 more)

### Community 30 - "ThreeSurface.tsx"
Cohesion: 0.10
Nodes (28): HeatLegend(), dioptre(), Figure(), PrescriptionBar(), RailFigures(), RailFiguresProps, RailKey, railRows() (+20 more)

## Ambiguous Edges - Review These
- `Presbyopia and Near-Vision Correction` → `Trial Frame Reading Photograph`  [AMBIGUOUS]
  src/assets/bench/trial-frame-reading.jpg · relation: semantically_similar_to
- `Accessories Compartment (occluders and marking pen)` → `Trial Lens Set`  [AMBIGUOUS]
  src/assets/bench/trial-lens-set.jpg · relation: shares_data_with

## Knowledge Gaps
- **23 isolated node(s):** `@fontsource-variable/geist`, `shadcn`, `tw-animate-css`, `@types/node`, `@types/react` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 295 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Landing Page & Home` to `AsphericSidebar.tsx`, `optical.ts`, `Design`, `main.tsx`, `package.json Manifest`, `RootLayout.tsx`, `AsphericDesktopGrid.tsx`, `ContactPage.tsx`, `translations`, `select.tsx`, `frameMesh.ts`, `ThreeSurface.tsx`?**
  _High betweenness centrality (0.284) - this node is a cross-community bridge._
- **What connects `@fontsource-variable/geist`, `shadcn`, `tw-animate-css` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AsphericSidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05667485667485667 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `AsphericDesktopGrid.tsx` to `optical.ts`, `Landing Page & Home`, `main.tsx`, `package.json Manifest`, `RootLayout.tsx`, `ThreeSurface.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `optical.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05428796223446106 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Presbyopia and Near-Vision Correction` and `Trial Frame Reading Photograph`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Accessories Compartment (occluders and marking pen)` and `Trial Lens Set`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._