# Optical Tools

> Professional simulator for optical lens thickness, frame protrusion, and 2D visual analysis.

A precise, full-stack reactive viewport and calculation engine that assists opticians, optometrists, and frame/lens laboratories in simulating and predicting **lens edge thickness**, **center thickness**, and **spatial protrusion** within a chosen frame.

Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **SVG**. Features real-time responsive 2D visualization, an advanced recommendation engine, multi-page routing, and full i18n support (English/Indonesian).

---

## Features

- **Multi-page routing** — Home, Visualizer (Simple/Advanced modes), Aspheric, and Contact pages
- **Three visualization views** — Side cross-section, Top-down, and Front view
- **Lens comparison mode** — Compare two material indices side-by-side
- **Dedicated Aspheric Lens route** (`/aspheric`) — Independent engine with per-surface conic K + A2/A4/A6/A8 controls, true aspheric SVG path rendering, and aberration metrics (SA₀, Coma X)
- **Smart material recommendation** — Automatically selects optimal index based on SE power, frame type, and eye size
- **Validation engine** — Real-time clinical and ergonomic input validation with alerts
- **Dark/light theme** — Persistent theme toggle
- **i18n (ID/EN)** — Language switching via URL search param (`?lang=`)
- **Mobile-responsive** — Dedicated mobile layout with tab-based navigation
- **Resizable panels** — Desktop grid layout with resizable sections
- **Undo/Redo** — Session state history management

---

## Core Engine Formulas

The calculation engine lives in `src/lib/optic-engine/optical.ts`. Below are the implemented mathematical formulations:

### 1. Combined Decentration ($d_{\text{combined}}$)

- **Frame PD**: $F_{PD} = A + DBL$
- **Horizontal Decentration**: $d_H = \frac{|F_{PD} - PD|}{2}$
- **Vertical Decentration**: $d_V = |\text{Fitting Height} - \frac{B}{2}|$
- **Combined**: $d_{\text{combined}} = \sqrt{d_H^2 + d_V^2}$

### 2. Effective Radius ($y$)

$$y = \frac{ED}{2} + d_{\text{combined}}$$

### 3. Surface Radii ($R_1$, $R_2$)

- **Front radius**: $R_1 = \frac{1000 \cdot (n - 1)}{BC}$
- **Back surface power**: $P_{\text{back}} = P_{\text{calc}} - BC$
- **Back radius**: $R_2 = \begin{cases} \infty, & \text{if } P_{\text{back}} = 0 \\ \frac{1000 \cdot (n - 1)}{|P_{\text{back}}|}, & \text{if } P_{\text{back}} \neq 0 \end{cases}$

### 4. Sagitta Formula ($s_1$, $s_2$)

$$s = R - \sqrt{R^2 - y^2}$$

(If $R = \infty$, $s = 0$)

### 5. Center Thickness ($CT$) & Edge Thickness ($ET$)

Minimum thickness $t_{\text{min}} = 1.0\text{mm}$:

- **Plus lenses** ($P_{\text{calc}} \ge 0$): $ET = t_{\text{min}}$, then $CT = t_{\text{min}} + s_1 \pm s_2$
- **Minus lenses** ($P_{\text{calc}} < 0$): $CT = t_{\text{min}}$, then $ET = t_{\text{min}} + s_2 \pm s_1$

(Sign depends on $P_{\text{back}}$)

### 6. Frame Protrusion

- **Groove position**: $x_{\text{groove}} = \text{Frame Depth} \times \text{Bevel Percent}$
- **Anterior Protrusion**: $\max(0,\; x_{\text{groove}} - \frac{ET}{2} - s_1)$
- **Posterior Protrusion**: $\max(0,\; x_{\text{groove}} + \frac{ET}{2} - \text{Frame Depth})$

---

## Aspheric Engine

The aspheric calculation engine lives in `src/lib/optic-engine/aspheric.ts` and powers the `/aspheric` route independently from the spherical engine.

### Aspheric Sagitta Formula

$$z(y) = \frac{y^2}{R} \bigg/ \left(1 + \sqrt{1 - (1 + K)\frac{y^2}{R^2}}\right) + A_2 y^2 + A_4 y^4 + A_6 y^6 + A_8 y^8$$

Where:
- $R$ = base radius of curvature
- $K$ = conic constant ($K = 0$ sphere, $K \lt -1$ hyperbola, $K = -1$ parabola)
- $A_2, A_4, A_6, A_8$ = even aspheric polynomial coefficients

### Per-Surface Control

Each surface (front/back) has an independent `isActive` toggle, allowing:
- Spherical front + Aspheric back
- Aspheric front + Spherical back
- Both aspheric
- Both spherical (degenerates to standard spherical calculation)

### Aberration Metrics

- **Spherical Aberration (SA₀)**: $\text{SA}_0 = |K \times 0.05|$ (simplified)
- **Coma (Coma X)**: Reserved for future higher-order implementation

---

## Smart Material Recommendation

| SE Range (D) | Recommended Index | Material Name | Abbe Value | Thickness Reduction |
|:---|---:|:---|:---:|:---|
| $\le 2.00$ | **1.50** | CR-39 (Standard) | 58 | 0% |
| $> 2.00$ to $\le 3.00$ | **1.56** | Mid-Index (NK-55) | 38 | ~15% |
| $> 3.00$ to $\le 5.00$ | **1.61** | High-Index (MR-8) | 42 | ~25% |
| $> 5.00$ to $\le 8.00$ | **1.67** | Ultra High-Index (MR-10) | 32 | ~35% |
| $> 8.00$ | **1.74** | Premium Index (MR-174) | 33 | ~45% |

### Frame-Type Overrides
1. **Half-Rim** — Minimum index forced to **1.56** (NK-55) for nylon string groove tensile strength
2. **Rimless** — Minimum index forced to **1.61** (MR-8) for drill-hole durability
3. **Large Eye Size ($A \ge 54$mm)** — Index automatically bumped one level higher for minus lenses

---

## Architecture

```
src/
├── components/
│   ├── cards/               # CurvatureCard, RecommendationCard, SummaryCard
│   ├── layout/              # AppFooter, DesktopGrid, HeaderBar, MobileTabManager,
│   │                        # MobileViews, ValidationAlerts
│   ├── Sidebar/             # BevelControl, Control, FittingSpecsSection,
│   │                        # FrameGeometrySection, FrameInput, FrameParamField,
│   │                        # FrameTypeSelector, LabelWithTooltip,
│   │                        # LensParametersSection, LimitAlertButton,
│   │                        # RefractiveIndexDropdown, SidebarHeader
│   ├── ui/                  # 25 shadcn/ui primitives (button, card, select, slider, etc.)
│   ├── Visualizer/          # FrameProfile, FrontView, LensProfile, TopDownView,
│   │                        # index.tsx, types.ts
│   ├── AsphericSidebar.tsx  # Aspheric surface controls (conic, coefficients)
│   ├── AsphericVisualizer.tsx # SVG visualizer with true aspheric path rendering
│   ├── AsphericDesktopGrid.tsx # Aspheric-specific desktop layout
│   ├── ErrorBoundary.tsx
│   ├── RootLayout.tsx
│   └── Sidebar.tsx
├── contexts/
│   ├── OpticalContext.tsx    # React Context for spherical optical state management
│   └── AsphericContext.tsx   # React Context for aspheric optical state management
├── data/
│   └── materials.ts         # Centralized material database & ergonomic limits
├── hooks/
│   ├── useMediaQuery.ts     # Responsive breakpoint detection
│   ├── useOpticalState.ts   # Core spherical state management, calculation dispatch, undo/redo
│   ├── useAsphericState.ts  # Dedicated aspheric state management, calculation dispatch
│   └── useTheme.tsx         # Dark/light theme toggle
├── lib/
│   ├── optic-engine/        # optical.ts, aspheric.ts, types.ts, validation.ts, optical.test.ts
│   ├── translations/        # en.ts, id.ts, index.ts, types.ts
│   └── utils.ts             # Tailwind class merging utility
├── pages/
│   ├── HomePage.tsx         # Landing page with module selection
│   ├── VisualizerPage.tsx   # Spherical simulator page (simple + advanced tabs)
│   ├── AsphericPage.tsx     # Aspheric simulator page (simple + advanced tabs)
│   └── ContactPage.tsx      # Contact information page
├── routes/
│   ├── root.tsx             # Root route with OpticalProvider + AsphericProvider
│   ├── index.tsx            # Home route (/) configuration
│   ├── contact.tsx          # Contact route configuration
│   ├── visualizer.tsx       # Spherical visualizer routes (/visualizer/simple, /visualizer/advanced)
│   ├── aspheric.tsx         # Aspheric visualizer routes (/aspheric/simple, /aspheric/advanced)
│   └── router.tsx           # TanStack Router instantiation with route tree
├── index.css                # Tailwind CSS v4 styles & global fonts
├── main.tsx                 # Application entry point
└── types.d.ts               # Global type declarations (Vite client types)
```

---

## Installation & Development

### Prerequisites

Node.js **v18** or **v20+**.

### Setup

```bash
# Install dependencies
npm install

# Start development server (port 3000 with HMR)
npm run dev

# Type-check with TypeScript
npm run lint

# Run unit tests (Vitest)
npm run test

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Deployment

See:
- [`deploy-guide.md`](./deploy-guide.md) — Static SPA deployment
- [`deploy-guide-docker.md`](./deploy-guide-docker.md) — Docker multi-stage build deployment

---

## Version

**v0.5.0** — Engine core: `AMP_V4.2.0` / `AMP_ASPH_V1.0.0`

Designed for **Akademi Optometri Yogyakarta (Aktriyo)**.
