# Graph Report - optic-tools  (2026-11-26)

## Corpus Check
- 174 files · ~95,359 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .css 2, .lock 1)

## Summary
- 952 nodes · 2994 edges · 39 communities (31 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.85)
- Token cost: 3,910 input · 2,680 output

## Graph Freshness
- Built from commit: `380a778b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AsphericSidebar.tsx
- optical.ts
- Trial Frame Fitting (bench image)
- Landing Page & Home
- Design
- README Domain Concepts
- RootLayout.tsx
- TypeScript Path Aliases
- shadcn components.json Config
- package.json Manifest
- RefractiveIndexDropdown.tsx
- AsphericDesktopGrid.tsx
- Runtime Dependencies
- index.css (global stylesheet)
- Trial Lens Set
- react
- Control.tsx
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
- cn
- frameMesh.ts
- ThreeSurface.tsx
- resizable.tsx
- field.tsx
- item.tsx
- LabelWithTooltip.tsx
- alert.tsx
- engines
- intent

## God Nodes (most connected - your core abstractions)
1. `react` - 86 edges
2. `Language` - 63 edges
3. `translations` - 52 edges
4. `FrameParameters` - 44 edges
5. `CalculationResult` - 39 edges
6. `PatientParameters` - 36 edges
7. `@tanstack/react-router` - 29 edges
8. `calculateLens()` - 29 edges
9. `FrameType` - 29 edges
10. `cn` - 27 edges

## Surprising Connections (you probably didn't know these)
- `The rule the page holds itself to` --references--> `limitLabel()`  [INFERRED]
  DESIGN.md → src/data/limits.ts
- `Motion` --references--> `useReveal()`  [INFERRED]
  DESIGN.md → src/components/landing/useReveal.ts
- `AsphericSidebarProps` --references--> `Language`  [EXTRACTED]
  src/components/AsphericSidebar.tsx → src/lib/translations/types.ts
- `SidebarProps` --references--> `Language`  [EXTRACTED]
  src/components/Sidebar.tsx → src/lib/translations/types.ts
- `BevelControlProps` --references--> `Language`  [EXTRACTED]
  src/components/Sidebar/BevelControl.tsx → src/lib/translations/types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Aspheric Engine Calculation Pipeline** — readme_aspheric_engine, readme_aspheric_sagitta_formula, readme_per_surface_control, readme_aberration_metrics [EXTRACTED 1.00]
- **Spherical Lens Thickness & Protrusion Calculation Pipeline** — readme_combined_decentration, readme_effective_radius, readme_surface_radii, readme_sagitta_formula, readme_center_edge_thickness, readme_frame_protrusion [EXTRACTED 1.00]
- **AGENTS.md Agent Workflow Policies** — agents_intent_skill_loading, agents_graphify_knowledge_graph, agents_graphify_query_first_rule [INFERRED 0.85]

## Communities (39 total, 8 thin omitted)

### Community 0 - "AsphericSidebar.tsx"
Cohesion: 0.24
Nodes (20): lucide-react, AsphericSidebar(), AsphericSidebarProps, AsphericSurfacePanel(), COEFFICIENT_STEP, LandingFeatures(), FittingSpecsSection(), FrameGeometrySection() (+12 more)

### Community 1 - "optical.ts"
Cohesion: 0.06
Nodes (73): ASPHERIC_EXAMPLE, LandingModules(), REFERENCE_FRAME, REFERENCE_PATIENT, LandingProof(), ERGONOMIC_LIMITS, FRAME_TYPE_OVERRIDES, OpticalMaterial (+65 more)

### Community 2 - "Trial Frame Fitting (bench image)"
Cohesion: 0.44
Nodes (9): Trial Frame Fitting (bench image), Trial Frame Axis Scale, Diopter Lens Power, Eye Examination, Optometrist / Eye Care Practitioner, Patient Undergoing Eye Exam, Subjective Refraction, Trial Frame (+1 more)

### Community 3 - "Landing Page & Home"
Cohesion: 0.10
Nodes (45): CrossBar(), CrossHero(), ASPHERIC_EXAMPLE, CrossClose(), CrossFooter(), CrossInstruments(), CrossQuestions(), CrossStandards() (+37 more)

### Community 4 - "Design"
Cohesion: 0.12
Nodes (15): Accessibility, Design, Layout, Motion, Palette — dark (`.dark .cross`), Palette — light, Prohibited here, Signature interaction (+7 more)

### Community 5 - "README Domain Concepts"
Cohesion: 0.08
Nodes (31): graphify-out Knowledge Graph, AMP - Aktriyo Measuring Project (page title), HTML Entry Point (index.html), Aberration Metrics (SA0, Coma X), Akademi Optometri Yogyakarta (Aktriyo), AMP_ASPH_V1.0.0 Aspheric Engine Core, AMP_V4.2.0 Engine Core, Project Architecture Layout (+23 more)

### Community 6 - "RootLayout.tsx"
Cohesion: 0.06
Nodes (47): @tanstack/react-hotkeys, BrandRule(), CheatSheetBody(), HotkeysCheatSheet(), HotkeysCheatSheetProps, LandingNav(), GlobalNav(), NavItem() (+39 more)

### Community 7 - "TypeScript Path Aliases"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+15 more)

### Community 8 - "shadcn components.json Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "package.json Manifest"
Cohesion: 0.11
Nodes (24): devDependencies, autoprefixer@^10.7.0, tailwindcss@^4.3.5, tsx@^4.23.15, @types/node@^26.6.11, @types/react@^19.3.3, @types/react-dom@^19.3.0, @types/three@^0.187.0 (+16 more)

### Community 10 - "RefractiveIndexDropdown.tsx"
Cohesion: 0.17
Nodes (9): MATERIAL_FOR, RefractiveIndexDropdown(), RefractiveIndexDropdownProps, DropdownMenu(), DropdownMenuContent(), DropdownMenuRadioGroup(), DropdownMenuRadioItem(), DropdownMenuSubContent() (+1 more)

### Community 11 - "AsphericDesktopGrid.tsx"
Cohesion: 0.09
Nodes (39): @tanstack/react-router, AsphericDesktopGrid(), ErrorBoundary, Props, State, AsphericMobileViews(), DesktopGrid(), MobileViews() (+31 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, cn@^0.5.2, @fontsource-variable/geist@^5.3.0, lucide-react@^1.81.0, react@^19.3.1, react-dom@^19.3.1 (+13 more)

### Community 14 - "Trial Lens Set"
Cohesion: 0.31
Nodes (11): trial-lens-set.jpg (open trial lens set case), Accessories Compartment (occluders and marking pen), Concave Cylinder Lens Row, Concave Sphere Lens Row, Convex Cylinder Lens Row, Convex Sphere Lens Row, Diopter Power Labels on Lens Rows, Metal Carrying Case with Lens Compartments (+3 more)

### Community 15 - "react"
Cohesion: 0.08
Nodes (53): react, AsphericVisualizerProps, REFERENCE_FRAME, REFERENCE_LENS, REFERENCE_PATIENT, Cell, JobTicketProps, MeasurementSheetProps (+45 more)

### Community 16 - "Control.tsx"
Cohesion: 0.19
Nodes (18): BevelControl(), BevelControlProps, Control(), ControlProps, FrameInput(), FrameInputProps, FieldDescription(), FieldLabel() (+10 more)

### Community 17 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 18 - "Vite Build Config"
Cohesion: 0.20
Nodes (7): @tailwindcss/vite@^4.3.5, vite@^8.3.8, @vitejs/plugin-react@^6.3.0, @tailwindcss/vite, vite, @vitejs/plugin-react, root

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
Cohesion: 0.06
Nodes (67): asphericPath(), asphericSag(), AsphericVisualizer, LensPosition, AppFooter(), FooterFigures, CopyOrderButton(), HeaderBar() (+59 more)

### Community 26 - "select.tsx"
Cohesion: 0.24
Nodes (3): SelectContent(), SelectScrollDownButton(), SelectScrollUpButton()

### Community 27 - "playwright"
Cohesion: 0.29
Nodes (6): mcp, servers, command, type, $schema, playwright

### Community 28 - "cn"
Cohesion: 0.17
Nodes (7): @base-ui/react, class-variance-authority, cn, ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 29 - "frameMesh.ts"
Cohesion: 0.07
Nodes (63): three, Caliper(), CaliperProps, FrameBody(), eased(), LensBody(), LensBodyProps, axialDepth() (+55 more)

### Community 30 - "ThreeSurface.tsx"
Cohesion: 0.12
Nodes (24): HeatLegend(), dioptre(), Figure(), PrescriptionBar(), RailFigures(), RailKey, railRows(), Row (+16 more)

### Community 32 - "field.tsx"
Cohesion: 0.18
Nodes (9): FrameParamField(), FrameParamFieldProps, FrameTypeSelector(), LimitAlertButton(), LimitAlertButtonProps, Field(), FieldContent(), fieldVariants (+1 more)

### Community 33 - "item.tsx"
Cohesion: 0.16
Nodes (9): FieldSeparator(), Item(), ItemGroup(), ItemMedia(), itemMediaVariants, ItemSeparator(), ItemTitle(), itemVariants (+1 more)

### Community 34 - "LabelWithTooltip.tsx"
Cohesion: 0.50
Nodes (6): LabelWithTooltip(), LabelWithTooltipProps, Tooltip(), TooltipContent(), TooltipTrigger(), getTooltipByLabel()

## Ambiguous Edges - Review These
- `Accessories Compartment (occluders and marking pen)` → `Trial Lens Set`  [AMBIGUOUS]
  src/assets/bench/trial-lens-set.jpg · relation: shares_data_with
- `Presbyopia and Near-Vision Correction` → `Trial Frame Reading Photograph`  [AMBIGUOUS]
  src/assets/bench/trial-frame-reading.jpg · relation: semantically_similar_to

## Knowledge Gaps
- **12 isolated node(s):** `index.css (global stylesheet)`, `Accessories Compartment (occluders and marking pen)`, `Metal Carrying Case with Lens Compartments`, `OWLES Name Tape`, `UCP Digital Camouflage Army Combat Uniform` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 258 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `AsphericSidebar.tsx`, `optical.ts`, `Landing Page & Home`, `Design`, `RootLayout.tsx`, `package.json Manifest`, `RefractiveIndexDropdown.tsx`, `AsphericDesktopGrid.tsx`, `Runtime Dependencies`, `Control.tsx`, `translations`, `select.tsx`, `cn`, `frameMesh.ts`, `ThreeSurface.tsx`, `field.tsx`, `item.tsx`, `LabelWithTooltip.tsx`, `popover.tsx`, `alert.tsx`?**
  _High betweenness centrality (0.282) - this node is a cross-community bridge._
- **What connects `index.css (global stylesheet)`, `Accessories Compartment (occluders and marking pen)`, `Metal Carrying Case with Lens Compartments` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `optical.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06210670314637483 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `AsphericDesktopGrid.tsx` to `optical.ts`, `Landing Page & Home`, `RootLayout.tsx`, `package.json Manifest`, `Runtime Dependencies`, `react`, `ThreeSurface.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `Landing Page & Home` be split into smaller, more focused modules?**
  _Cohesion score 0.09994155464640561 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Accessories Compartment (occluders and marking pen)` and `Trial Lens Set`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `Presbyopia and Near-Vision Correction` and `Trial Frame Reading Photograph`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._