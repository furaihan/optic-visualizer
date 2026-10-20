# Graph Report - optic-tools  (2026-10-20)

## Corpus Check
- 129 files · ~155,129 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .lock 1, .toml 1)

## Summary
- 609 nodes · 1799 edges · 26 communities (23 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.85)
- Token cost: 3,910 input · 2,680 output

## Community Hubs (Navigation)
- Sidebar Controls & UI Primitives
- Aspheric Engine & Visualizer
- App Shell & Layout
- Landing Page & Home
- UI Primitives (Alert/Item/Popover)
- README Domain Concepts
- Routing & Route Tree
- TypeScript Path Aliases
- shadcn components.json Config
- package.json Manifest
- Navigation & Theme Menus
- Cards, Buttons & Contact
- Runtime Dependencies
- Contexts & Providers
- Trial Lens Set (bench photo)
- Select Component Family
- Dev Dependencies
- Trial Frame Fitting (bench photo)
- Vite Build Config
- npm Scripts
- Field Clinic Bench Photo
- Navy Eye Exam Bench Photo
- Near-Vision Reading (bench photo)
- Intent Skills Sync Script
- Resizable Panel Components
- Global CSS Type Shim

## God Nodes (most connected - your core abstractions)
1. `react` - 66 edges
2. `Language` - 56 edges
3. `translations` - 40 edges
4. `cn` - 36 edges
5. `FrameParameters` - 28 edges
6. `CalculationResult` - 23 edges
7. `@tanstack/react-router` - 22 edges
8. `PatientParameters` - 22 edges
9. `lucide-react` - 20 edges
10. `@base-ui/react` - 18 edges

## Surprising Connections (you probably didn't know these)
- `HTML Entry Point (index.html)` --conceptually_related_to--> `Optical Tools`  [INFERRED]
  index.html → README.md
- `Optical Tools (Indonesian README)` --semantically_similar_to--> `Optical Tools`  [INFERRED] [semantically similar]
  README-id.md → README.md
- `Rumus Mesin Inti` --semantically_similar_to--> `Core Engine Formulas`  [INFERRED] [semantically similar]
  README-id.md → README.md
- `Rekomendasi Material Pintar` --semantically_similar_to--> `Smart Material Recommendation Engine`  [INFERRED] [semantically similar]
  README-id.md → README.md
- `Aturan Khusus Jenis Bingkai` --semantically_similar_to--> `Frame-Type Recommendation Overrides`  [INFERRED] [semantically similar]
  README-id.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Spherical Lens Thickness & Protrusion Calculation Pipeline** — readme_combined_decentration, readme_effective_radius, readme_surface_radii, readme_sagitta_formula, readme_center_edge_thickness, readme_frame_protrusion [EXTRACTED 1.00]
- **Aspheric Engine Calculation Pipeline** — readme_aspheric_engine, readme_aspheric_sagitta_formula, readme_per_surface_control, readme_aberration_metrics [EXTRACTED 1.00]
- **AGENTS.md Agent Workflow Policies** — agents_intent_skill_loading, agents_graphify_knowledge_graph, agents_graphify_query_first_rule [INFERRED 0.85]

## Communities (26 total, 3 thin omitted)

### Community 0 - "Sidebar Controls & UI Primitives"
Cohesion: 0.07
Nodes (63): cn, lucide-react, AsphericSidebar(), AsphericSidebarProps, AsphericSurfacePanel(), BevelControl(), BevelControlProps, Control() (+55 more)

### Community 1 - "Aspheric Engine & Visualizer"
Cohesion: 0.08
Nodes (59): asphericPath(), AsphericVisualizer, AsphericVisualizerProps, LensPosition, sphericalArc(), Cell, JobTicketProps, MeasurementSheetProps (+51 more)

### Community 2 - "App Shell & Layout"
Cohesion: 0.13
Nodes (35): AsphericDesktopGrid(), ErrorBoundary, AppFooter(), DesktopGrid(), HeaderBar(), HeaderBarProps, MobileTabManager(), MobileTabManagerProps (+27 more)

### Community 3 - "Landing Page & Home"
Cohesion: 0.12
Nodes (31): react, LandingBench(), LandingClosing(), LandingFaq(), LandingFeatures(), LandingFooter(), LandingHero(), LandingHowItWorks() (+23 more)

### Community 4 - "UI Primitives (Alert/Item/Popover)"
Cohesion: 0.06
Nodes (17): @base-ui/react, class-variance-authority, Alert(), alertVariants, FieldSeparator(), Item(), ItemGroup(), ItemMedia() (+9 more)

### Community 5 - "README Domain Concepts"
Cohesion: 0.08
Nodes (31): graphify-out Knowledge Graph, AMP - Aktriyo Measuring Project (page title), HTML Entry Point (index.html), Aberration Metrics (SA0, Coma X), Akademi Optometri Yogyakarta (Aktriyo), AMP_ASPH_V1.0.0 Aspheric Engine Core, AMP_V4.2.0 Engine Core, Project Architecture Layout (+23 more)

### Community 6 - "Routing & Route Tree"
Cohesion: 0.16
Nodes (18): @tanstack/react-router, BrandRule(), asphericRoute, contactRoute, indexRoute, GlobalSearchParams, rootRoute, Register (+10 more)

### Community 7 - "TypeScript Path Aliases"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+15 more)

### Community 8 - "shadcn components.json Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "package.json Manifest"
Cohesion: 0.09
Nodes (21): engines, bun, intent, skills, name, packageManager, private, type (+13 more)

### Community 10 - "Navigation & Theme Menus"
Cohesion: 0.16
Nodes (11): LandingNav(), GlobalNav(), NavItem(), RootLayout(), DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuSubContent() (+3 more)

### Community 11 - "Cards, Buttons & Contact"
Cohesion: 0.18
Nodes (9): Props, State, Badge(), badgeVariants, Button(), buttonVariants, Card(), CardContent() (+1 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @base-ui/react, class-variance-authority, cn, @fontsource-variable/geist, lucide-react, react, react-dom (+7 more)

### Community 13 - "Contexts & Providers"
Cohesion: 0.15
Nodes (12): AsphericContext, AsphericProvider(), AsphericState, OpticalProvider(), initialState, Theme, ThemeContext, ThemeProvider() (+4 more)

### Community 14 - "Trial Lens Set (bench photo)"
Cohesion: 0.31
Nodes (11): trial-lens-set.jpg (open trial lens set case), Accessories Compartment (occluders and marking pen), Concave Cylinder Lens Row, Concave Sphere Lens Row, Convex Cylinder Lens Row, Convex Sphere Lens Row, Diopter Power Labels on Lens Rows, Metal Carrying Case with Lens Compartments (+3 more)

### Community 15 - "Select Component Family"
Cohesion: 0.24
Nodes (3): SelectContent(), SelectScrollDownButton(), SelectScrollUpButton()

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

## Ambiguous Edges - Review These
- `Trial Lens Set` → `Accessories Compartment (occluders and marking pen)`  [AMBIGUOUS]
  src/assets/bench/trial-lens-set.jpg · relation: shares_data_with
- `Trial Frame Reading Photograph` → `Presbyopia and Near-Vision Correction`  [AMBIGUOUS]
  src/assets/bench/trial-frame-reading.jpg · relation: semantically_similar_to

## Knowledge Gaps
- **22 isolated node(s):** `@fontsource-variable/geist`, `shadcn`, `tw-animate-css`, `@types/node`, `@types/react` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 196 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Landing Page & Home` to `Sidebar Controls & UI Primitives`, `Aspheric Engine & Visualizer`, `App Shell & Layout`, `UI Primitives (Alert/Item/Popover)`, `package.json Manifest`, `Navigation & Theme Menus`, `Cards, Buttons & Contact`, `Contexts & Providers`, `Select Component Family`?**
  _High betweenness centrality (0.291) - this node is a cross-community bridge._
- **What connects `@fontsource-variable/geist`, `shadcn`, `tw-animate-css` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Sidebar Controls & UI Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.0743127147766323 - nodes in this community are weakly interconnected._
- **Why does `cn` connect `Sidebar Controls & UI Primitives` to `App Shell & Layout`, `UI Primitives (Alert/Item/Popover)`, `Routing & Route Tree`, `package.json Manifest`, `Navigation & Theme Menus`, `Cards, Buttons & Contact`, `Select Component Family`, `Resizable Panel Components`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `Aspheric Engine & Visualizer` be split into smaller, more focused modules?**
  _Cohesion score 0.08364197530864198 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Trial Lens Set` and `Accessories Compartment (occluders and marking pen)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `Trial Frame Reading Photograph` and `Presbyopia and Near-Vision Correction`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._