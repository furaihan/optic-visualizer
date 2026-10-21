# Graph Report - optic-tools  (2026-10-21)

## Corpus Check
- 140 files · ~176,792 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .lock 1, .toml 1)

## Summary
- 729 nodes · 2246 edges · 32 communities (26 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fbcf100b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AsphericSidebar.tsx
- optical.ts
- Language
- Landing Page & Home
- item.tsx
- README Domain Concepts
- RootLayout.tsx
- TypeScript Path Aliases
- shadcn components.json Config
- package.json Manifest
- @base-ui/react
- translations
- Runtime Dependencies
- index.css (global stylesheet)
- Trial Lens Set (bench photo)
- cn
- Dev Dependencies
- Trial Frame Fitting (bench photo)
- Vite Build Config
- npm Scripts
- Field Clinic Bench Photo
- Navy Eye Exam Bench Photo
- Near-Vision Reading (bench photo)
- Intent Skills Sync Script
- ContactPage.tsx
- Global CSS Type Shim
- select.tsx
- playwright
- lib/limits.ts
- alert.tsx
- resizable.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 70 edges
2. `Language` - 58 edges
3. `translations` - 46 edges
4. `FrameParameters` - 32 edges
5. `CalculationResult` - 32 edges
6. `cn` - 26 edges
7. `PatientParameters` - 26 edges
8. `@tanstack/react-router` - 23 edges
9. `lucide-react` - 23 edges
10. `FrameType` - 23 edges

## Surprising Connections (you probably didn't know these)
- `AsphericSidebarProps` --references--> `Language`  [EXTRACTED]
  src/components/AsphericSidebar.tsx → src/lib/translations/types.ts
- `SidebarProps` --references--> `Language`  [EXTRACTED]
  src/components/Sidebar.tsx → src/lib/translations/types.ts
- `BevelControlProps` --references--> `Language`  [EXTRACTED]
  src/components/Sidebar/BevelControl.tsx → src/lib/translations/types.ts
- `ControlProps` --references--> `Language`  [EXTRACTED]
  src/components/Sidebar/Control.tsx → src/lib/translations/types.ts
- `FrameParamFieldProps` --references--> `Language`  [EXTRACTED]
  src/components/Sidebar/FrameParamField.tsx → src/lib/translations/types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Aspheric Engine Calculation Pipeline** — readme_aspheric_engine, readme_aspheric_sagitta_formula, readme_per_surface_control, readme_aberration_metrics [EXTRACTED 1.00]
- **Spherical Lens Thickness & Protrusion Calculation Pipeline** — readme_combined_decentration, readme_effective_radius, readme_surface_radii, readme_sagitta_formula, readme_center_edge_thickness, readme_frame_protrusion [EXTRACTED 1.00]
- **AGENTS.md Agent Workflow Policies** — agents_intent_skill_loading, agents_graphify_knowledge_graph, agents_graphify_query_first_rule [INFERRED 0.85]

## Communities (32 total, 6 thin omitted)

### Community 0 - "AsphericSidebar.tsx"
Cohesion: 0.08
Nodes (52): lucide-react, AsphericSidebarProps, AsphericSurfacePanel(), COEFFICIENT_STEP, BevelControl(), BevelControlProps, Control(), ControlProps (+44 more)

### Community 1 - "optical.ts"
Cohesion: 0.06
Nodes (72): ASPHERIC_EXAMPLE, LandingModules(), REFERENCE_FRAME, REFERENCE_PATIENT, AsphericContext, AsphericProvider(), AsphericState, ERGONOMIC_LIMITS (+64 more)

### Community 2 - "Language"
Cohesion: 0.09
Nodes (59): asphericPath(), asphericSag(), AsphericVisualizer, AsphericVisualizerProps, LensPosition, Cell, JobTicketProps, MeasurementSheetProps (+51 more)

### Community 3 - "Landing Page & Home"
Cohesion: 0.09
Nodes (37): react, LandingBench(), LandingClosing(), LandingFaq(), LandingFeatures(), LandingFooter(), LandingHero(), LandingHowItWorks() (+29 more)

### Community 4 - "item.tsx"
Cohesion: 0.16
Nodes (9): FieldSeparator(), Item(), ItemGroup(), ItemMedia(), itemMediaVariants, ItemSeparator(), ItemTitle(), itemVariants (+1 more)

### Community 5 - "README Domain Concepts"
Cohesion: 0.08
Nodes (31): graphify-out Knowledge Graph, AMP - Aktriyo Measuring Project (page title), HTML Entry Point (index.html), Aberration Metrics (SA0, Coma X), Akademi Optometri Yogyakarta (Aktriyo), AMP_ASPH_V1.0.0 Aspheric Engine Core, AMP_V4.2.0 Engine Core, Project Architecture Layout (+23 more)

### Community 6 - "RootLayout.tsx"
Cohesion: 0.08
Nodes (35): react-dom, BrandRule(), LandingNav(), GlobalNav(), NavItem(), RootLayout(), SidebarHeader(), DropdownMenuItem() (+27 more)

### Community 7 - "TypeScript Path Aliases"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+15 more)

### Community 8 - "shadcn components.json Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "package.json Manifest"
Cohesion: 0.10
Nodes (20): engines, bun, intent, skills, name, packageManager, private, type (+12 more)

### Community 10 - "@base-ui/react"
Cohesion: 0.23
Nodes (5): @base-ui/react, class-variance-authority, ToggleGroupContext, ToggleGroupItem(), toggleVariants

### Community 11 - "translations"
Cohesion: 0.08
Nodes (59): @tanstack/react-router, AsphericDesktopGrid(), AsphericSidebar(), ErrorBoundary, Props, State, AppFooter(), FooterFigures (+51 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @base-ui/react, class-variance-authority, cn, @fontsource-variable/geist, lucide-react, react, react-dom (+7 more)

### Community 14 - "Trial Lens Set (bench photo)"
Cohesion: 0.31
Nodes (11): trial-lens-set.jpg (open trial lens set case), Accessories Compartment (occluders and marking pen), Concave Cylinder Lens Row, Concave Sphere Lens Row, Convex Cylinder Lens Row, Convex Sphere Lens Row, Diopter Power Labels on Lens Rows, Metal Carrying Case with Lens Compartments (+3 more)

### Community 15 - "cn"
Cohesion: 0.23
Nodes (7): cn, inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupTextarea(), Input(), Textarea()

### Community 16 - "Dev Dependencies"
Cohesion: 0.22
Nodes (9): devDependencies, autoprefixer, tailwindcss, tsx, @types/node, @types/react, @types/react-dom, typescript (+1 more)

### Community 17 - "Trial Frame Fitting (bench photo)"
Cohesion: 0.44
Nodes (9): Trial Frame Fitting (bench image), Trial Frame Axis Scale, Diopter Lens Power, Eye Examination, Optometrist / Eye Care Practitioner, Patient Undergoing Eye Exam, Subjective Refraction, Trial Frame (+1 more)

### Community 18 - "Vite Build Config"
Cohesion: 0.25
Nodes (4): @tailwindcss/vite, vite, @vitejs/plugin-react, root

### Community 19 - "npm Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, clean, dev, lint, preview, test

### Community 20 - "Field Clinic Bench Photo"
Cohesion: 0.48
Nodes (7): Bench Photo: Soldiers Adjusting an Optical Instrument in a Field Clinic, Mobile Field Optical Clinic Interior, Optical Bench Instrument (Lensometer / Vertexometer Style Device), Optical Instrument Adjustment and Calibration, OWLES Name Tape, UCP Digital Camouflage Army Combat Uniform, US Army Soldiers

### Community 21 - "Navy Eye Exam Bench Photo"
Cohesion: 0.52
Nodes (7): US Navy Hospital Eye Examination Photograph (050129-N-6477M-012), Clinician-Patient Eye Contact at the Eyepiece, Corrective Eyewear (Spectacles), Green Fixation Target Light, U.S. Navy Hospital Optometry Clinic, Ophthalmic Examination, Slit Lamp Biomicroscope

### Community 22 - "Near-Vision Reading (bench photo)"
Cohesion: 0.67
Nodes (6): Trial Frame Reading Photograph, Presbyopia and Near-Vision Correction, Near-Vision Reading Card, Subjective Refraction Examination, Ophthalmic Trial Frame, Community Vision Screening Setting

### Community 24 - "ContactPage.tsx"
Cohesion: 0.22
Nodes (5): Badge(), badgeVariants, Card(), CardContent(), ContactPage()

### Community 26 - "select.tsx"
Cohesion: 0.24
Nodes (3): SelectContent(), SelectScrollDownButton(), SelectScrollUpButton()

### Community 27 - "playwright"
Cohesion: 0.29
Nodes (6): mcp, servers, command, type, $schema, playwright

### Community 28 - "lib/limits.ts"
Cohesion: 0.24
Nodes (8): LimitKey, LimitRule, LIMITS, LimitSource, flaggedCount(), LimitId, MeasuredRow, PRIORITY

## Ambiguous Edges - Review These
- `Accessories Compartment (occluders and marking pen)` → `Trial Lens Set`  [AMBIGUOUS]
  src/assets/bench/trial-lens-set.jpg · relation: shares_data_with
- `Presbyopia and Near-Vision Correction` → `Trial Frame Reading Photograph`  [AMBIGUOUS]
  src/assets/bench/trial-frame-reading.jpg · relation: semantically_similar_to

## Knowledge Gaps
- **22 isolated node(s):** `@fontsource-variable/geist`, `shadcn`, `tw-animate-css`, `@types/node`, `@types/react` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 233 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Landing Page & Home` to `AsphericSidebar.tsx`, `optical.ts`, `Language`, `item.tsx`, `RootLayout.tsx`, `package.json Manifest`, `@base-ui/react`, `translations`, `cn`, `ContactPage.tsx`, `select.tsx`, `popover.tsx`, `alert.tsx`?**
  _High betweenness centrality (0.275) - this node is a cross-community bridge._
- **What connects `@fontsource-variable/geist`, `shadcn`, `tw-animate-css` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AsphericSidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07507002801120448 - nodes in this community are weakly interconnected._
- **Why does `@tanstack/react-router` connect `translations` to `package.json Manifest`, `Landing Page & Home`, `optical.ts`, `RootLayout.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `optical.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06414565826330532 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Accessories Compartment (occluders and marking pen)` and `Trial Lens Set`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `Presbyopia and Near-Vision Correction` and `Trial Frame Reading Photograph`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._