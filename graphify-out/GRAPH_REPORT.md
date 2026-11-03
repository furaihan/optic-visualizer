# Graph Report - optic-tools  (2026-11-04)

## Corpus Check
- 171 files · ~208,452 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .css 2, .lock 1)

## Summary
- 932 nodes · 2897 edges · 37 communities (30 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `00d83cdd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AsphericSidebar.tsx
- optical.ts
- Language
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
- LandingBench.tsx
- ContactPage.tsx
- Dev Dependencies
- Product
- Vite Build Config
- npm Scripts
- item.tsx
- @base-ui/react
- Intent Skills Sync Script
- translations
- Global CSS Type Shim
- select.tsx
- playwright
- dropdown-menu.tsx
- frameMesh.ts
- ThreeSurface.tsx
- resizable.tsx
- router.tsx
- cn
- alert.tsx
- simulator-layout.tsx
- three.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 84 edges
2. `Language` - 63 edges
3. `translations` - 52 edges
4. `FrameParameters` - 42 edges
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
- `SidebarProps` --references--> `Language`  [EXTRACTED]
  src/components/Sidebar.tsx → src/lib/translations/types.ts
- `LandingProof()` --calls--> `calculateLens()`  [EXTRACTED]
  src/components/landing/LandingProof.tsx → src/lib/optic-engine/optical.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Aspheric Engine Calculation Pipeline** — readme_aspheric_engine, readme_aspheric_sagitta_formula, readme_per_surface_control, readme_aberration_metrics [EXTRACTED 1.00]
- **Spherical Lens Thickness & Protrusion Calculation Pipeline** — readme_combined_decentration, readme_effective_radius, readme_surface_radii, readme_sagitta_formula, readme_center_edge_thickness, readme_frame_protrusion [EXTRACTED 1.00]
- **AGENTS.md Agent Workflow Policies** — agents_intent_skill_loading, agents_graphify_knowledge_graph, agents_graphify_query_first_rule [INFERRED 0.85]

## Communities (37 total, 7 thin omitted)

### Community 0 - "AsphericSidebar.tsx"
Cohesion: 0.08
Nodes (55): lucide-react, react, AsphericSidebar(), AsphericSurfacePanel(), COEFFICIENT_STEP, LandingFeatures(), BevelControl(), Control() (+47 more)

### Community 1 - "optical.ts"
Cohesion: 0.07
Nodes (71): ASPHERIC_EXAMPLE, LandingModules(), REFERENCE_FRAME, REFERENCE_PATIENT, OpticalContext, OpticalProvider(), OpticalState, ERGONOMIC_LIMITS (+63 more)

### Community 2 - "Language"
Cohesion: 0.10
Nodes (48): AsphericSidebarProps, AsphericVisualizerProps, Cell, JobTicketProps, MeasurementSheetProps, RecommendationRowProps, BevelControlProps, ControlProps (+40 more)

### Community 3 - "Landing Page & Home"
Cohesion: 0.08
Nodes (53): CrossBar(), CrossHero(), ASPHERIC_EXAMPLE, CrossClose(), CrossFooter(), CrossInstruments(), CrossQuestions(), CrossStandards() (+45 more)

### Community 4 - "Design"
Cohesion: 0.12
Nodes (15): Accessibility, Design, Layout, Motion, Palette — dark (`.dark .cross`), Palette — light, Prohibited here, Signature interaction (+7 more)

### Community 5 - "README Domain Concepts"
Cohesion: 0.08
Nodes (31): graphify-out Knowledge Graph, AMP - Aktriyo Measuring Project (page title), HTML Entry Point (index.html), Aberration Metrics (SA0, Coma X), Akademi Optometri Yogyakarta (Aktriyo), AMP_ASPH_V1.0.0 Aspheric Engine Core, AMP_V4.2.0 Engine Core, Project Architecture Layout (+23 more)

### Community 6 - "main.tsx"
Cohesion: 0.12
Nodes (16): react-dom, vitest, initialState, Theme, ThemeContext, ThemeProvider(), ThemeProviderProps, ThemeProviderState (+8 more)

### Community 7 - "TypeScript Path Aliases"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+15 more)

### Community 8 - "shadcn components.json Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "package.json Manifest"
Cohesion: 0.10
Nodes (20): engines, bun, intent, skills, name, packageManager, private, type (+12 more)

### Community 10 - "RootLayout.tsx"
Cohesion: 0.25
Nodes (13): CheatSheetBody(), HotkeysCheatSheet(), HotkeysCheatSheetProps, LandingNav(), GlobalNav(), NavItem(), RootLayout(), DropdownMenu() (+5 more)

### Community 11 - "AsphericDesktopGrid.tsx"
Cohesion: 0.13
Nodes (31): @tanstack/react-router, AsphericDesktopGrid(), ErrorBoundary, Props, State, AsphericMobileViews(), DesktopGrid(), MobileViews() (+23 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.11
Nodes (19): dependencies, @base-ui/react, class-variance-authority, cn, @fontsource-variable/geist, lucide-react, react, react-dom (+11 more)

### Community 14 - "LandingBench.tsx"
Cohesion: 0.08
Nodes (40): Bench Photo: Soldiers Adjusting an Optical Instrument in a Field Clinic, Mobile Field Optical Clinic Interior, Optical Bench Instrument (Lensometer / Vertexometer Style Device), Optical Instrument Adjustment and Calibration, OWLES Name Tape, UCP Digital Camouflage Army Combat Uniform, US Army Soldiers, Trial Frame Fitting (bench image) (+32 more)

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

### Community 21 - "item.tsx"
Cohesion: 0.16
Nodes (9): FieldSeparator(), Item(), ItemGroup(), ItemMedia(), itemMediaVariants, ItemSeparator(), ItemTitle(), itemVariants (+1 more)

### Community 22 - "@base-ui/react"
Cohesion: 0.43
Nodes (4): class-variance-authority, ToggleGroupContext, ToggleGroupItem(), toggleVariants

### Community 24 - "translations"
Cohesion: 0.08
Nodes (61): @tanstack/react-hotkeys, asphericPath(), asphericSag(), AsphericVisualizer, LensPosition, AppFooter(), FooterFigures, CopyOrderButton() (+53 more)

### Community 26 - "select.tsx"
Cohesion: 0.24
Nodes (3): SelectContent(), SelectScrollDownButton(), SelectScrollUpButton()

### Community 27 - "playwright"
Cohesion: 0.29
Nodes (6): mcp, servers, command, type, $schema, playwright

### Community 29 - "frameMesh.ts"
Cohesion: 0.08
Nodes (50): @react-three/fiber, three, eased(), LensBody(), LensBodyProps, LensField, MeridianAngle, meridianProfile() (+42 more)

### Community 30 - "ThreeSurface.tsx"
Cohesion: 0.09
Nodes (34): @react-three/drei, FrameBody(), HeatLegend(), cameraFor(), Extent, fitDistance(), isSection(), LensScene() (+26 more)

### Community 32 - "router.tsx"
Cohesion: 0.19
Nodes (12): asphericRoute, contactRoute, indexRoute, GlobalSearchParams, rootRoute, Register, routeTree, simulatorWithChildren (+4 more)

### Community 33 - "cn"
Cohesion: 0.23
Nodes (3): @base-ui/react, cn, ScrollBar()

### Community 35 - "simulator-layout.tsx"
Cohesion: 0.38
Nodes (6): BrandRule(), simulatorSearch(), SimulatorLayout(), tabItems, validateActiveTab(), validateView()

### Community 36 - "three.tsx"
Cohesion: 0.60
Nodes (3): ThreePage(), ThreePage, threeRoute

## Ambiguous Edges - Review These
- `Accessories Compartment (occluders and marking pen)` → `Trial Lens Set`  [AMBIGUOUS]
  src/assets/bench/trial-lens-set.jpg · relation: shares_data_with
- `Presbyopia and Near-Vision Correction` → `Trial Frame Reading Photograph`  [AMBIGUOUS]
  src/assets/bench/trial-frame-reading.jpg · relation: semantically_similar_to

## Knowledge Gaps
- **23 isolated node(s):** `@fontsource-variable/geist`, `shadcn`, `tw-animate-css`, `@types/node`, `@types/react` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 294 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `AsphericSidebar.tsx` to `optical.ts`, `Language`, `Landing Page & Home`, `Design`, `main.tsx`, `package.json Manifest`, `RootLayout.tsx`, `AsphericDesktopGrid.tsx`, `LandingBench.tsx`, `ContactPage.tsx`, `popover.tsx`, `item.tsx`, `@base-ui/react`, `translations`, `select.tsx`, `dropdown-menu.tsx`, `frameMesh.ts`, `ThreeSurface.tsx`, `cn`, `alert.tsx`, `three.tsx`?**
  _High betweenness centrality (0.282) - this node is a cross-community bridge._
- **What connects `@fontsource-variable/geist`, `shadcn`, `tw-animate-css` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AsphericSidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0793859649122807 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `AsphericDesktopGrid.tsx` to `AsphericSidebar.tsx`, `optical.ts`, `router.tsx`, `Landing Page & Home`, `simulator-layout.tsx`, `three.tsx`, `main.tsx`, `package.json Manifest`, `RootLayout.tsx`, `ThreeSurface.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `optical.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06569133677567413 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Accessories Compartment (occluders and marking pen)` and `Trial Lens Set`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `Presbyopia and Near-Vision Correction` and `Trial Frame Reading Photograph`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._