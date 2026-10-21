# Optical Tools

> Professional simulator for optical lens thickness, frame protrusion, and 2D visual analysis.

A precise, full-stack reactive viewport and calculation engine that assists opticians, optometrists, and frame/lens laboratories in simulating and predicting **lens edge thickness**, **center thickness**, and **spatial protrusion** within a chosen frame.

Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **SVG**. Features real-time responsive 2D visualization, an advanced recommendation engine, multi-page routing, and full i18n support (English/Indonesian).

---

## Features

- **Multi-page routing** — Home, Visualizer (Simple/Advanced modes), Aspheric, and Contact pages
- **Three visualization views** — Side cross-section, Top-down, and Front view
- **Lens comparison mode** — Compare two material indices side-by-side
- **Dedicated Aspheric Lens route** (`/aspheric`) — Independent engine with per-surface conic K + A2/A4/A6/A8 controls, true aspheric SVG path rendering, and the measured surface departure from a sphere
- **Smart material recommendation** — Automatically selects optimal index based on SE power, frame type, and eye size
- **Validation engine** — Real-time clinical and ergonomic input validation with alerts
- **Dark/light theme** — Persistent theme toggle
- **i18n (ID/EN)** — Language switching via URL search param (`?lang=`)
- **Mobile-responsive** — Dedicated mobile layout with tab-based navigation
- **Resizable panels** — Desktop grid layout with resizable sections
- **Undo/Redo** — Session state history, on the buttons and on Ctrl+Z / Ctrl+Y

---

## Core Engine Formulas

The calculation engine lives in `src/lib/optic-engine/optical.ts`. Below are the implemented mathematical formulations:

### 1. The frame opening and the optical centre

- **Frame PD**: $F_{PD} = A + DBL$
- **Horizontal decentration**: $d_H = \frac{F_{PD} - PD}{2}$, positive when the frame is wider than the patient, so the optical centre moves towards the nose
- **Vertical offset**: $d_V = \text{Fitting Height} - \frac{B}{2}$

The lens fills the opening, which is the $A \times B$ box with its corners cut back to the circle of diameter $ED$. The distance from the optical centre to the rim therefore depends on the direction, and it is worked out per direction:

$$r(\theta) = \min\left(\text{distance to the box},\ \text{distance to the ED circle}\right)$$

### 2. Power in a meridian

A minus cylinder of axis $\alpha$ carries the sphere power along its own axis and the full power at ninety degrees to it:

$$P(\theta) = \text{SPH} + \text{CYL} \cdot \sin^2(\theta - \alpha)$$

The axis therefore changes the lens, not just the label on it.

### 3. Surface radii ($R_1$, $R_2$), signed

- **Front radius**: $R_1 = \frac{1000 \cdot (n - 1)}{BC}$ (always positive: the front of a lens is convex)
- **Back surface power in the meridian**: $P_{\text{back}}(\theta) = P(\theta) - BC$
- **Back radius**: $R_2(\theta) = \begin{cases} \infty, & P_{\text{back}}(\theta) = 0 \\ \frac{-1000 \cdot (n - 1)}{P_{\text{back}}(\theta)}, & \text{otherwise} \end{cases}$

The sign carries the shape: positive for a concave back, negative for a convex one.

### 4. Sagitta ($s_1$, $s_2$), signed

$$s(y) = \frac{y^2 / R}{1 + \sqrt{1 - \frac{y^2}{R^2}}} = R - \sqrt{R^2 - y^2} \quad (R > 0)$$

A surface of signed radius $R$ stands $s$ behind its own vertex at the semi-aperture $y$; a convex back surface ($R < 0$) stands in front of its vertex.

### 5. Center thickness ($CT$) & edge thickness ($ET$)

Minimum thickness $t_{\text{min}} = 1.0\text{mm}$. The material at the rim is the centre thickness plus the difference of the two surface offsets:

$$t(\theta) = CT + s_2(\theta) - s_1(\theta)$$

The centre thickness is whatever makes the thinnest point of the whole lens the minimum thickness:

$$CT = t_{\text{min}} + \max\left(0,\ \max_\theta \left(s_1(\theta) - s_2(\theta)\right)\right)$$

- **$ET$** is the thickest material around the rim, $\max_\theta t(\theta)$: the edge the groove has to swallow.
- **$ET_{\min}$** is the thinnest point of the rim, $\min_\theta t(\theta)$.

### 6. Frame protrusion

- **Groove position**: $x_{\text{groove}} = \text{Frame Depth} \times \text{Bevel Percent}$
- The lens sits in the groove, so the edge of the vertical meridian is centred on it, and the vertices follow:
  $x_{\text{front}} = x_{\text{groove}} - \frac{ET_{\text{top}}}{2} - s_1(\text{top})$
- **Anterior protrusion**: $\max(0,\ -x_{\text{front}})$
- **Posterior protrusion**: $\max(0,\ x_{\text{back}} + \max(0, \max_\theta s_2(\theta)) - \text{Frame Depth})$

### 7. Minimum blank size

$$MBS = ED + |F_{PD} - PD| + 2$$

The shape's own diameter, plus the total decentration, plus two millimetres of edging allowance.

### 8. Weight

The volume of the lens is the thickness integrated over the opening, and the weight is that volume times the density of the material.

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

- **Aspheric departure**: how far the aspheric surface leaves the sphere of the same radius at the edge of the frame, in millimetres. It is measured on the surface, not estimated from the conic constant.
- The engine refuses a set of coefficients that throws the surface more than 2 mm out of shape at the edge: that is not a lens anybody could wear.

---

## Smart Material Recommendation

| SE Range (D) | Recommended Index | Material Name | Abbe Value | Edge Reduction |
|:---|---:|:---|:---:|:---|
| $\le 2.00$ | **1.50** | CR-39 (Standard) | 58 | 0% |
| $> 2.00$ to $\le 3.00$ | **1.56** | Mid-Index (NK-55) | 38 | ~11% |
| $> 3.00$ to $\le 5.00$ | **1.60** | High-Index (MR-8) | 42 | ~16% |
| $> 5.00$ to $\le 8.00$ | **1.67** | Ultra High-Index (MR-10) | 32 | ~24% |
| $> 8.00$ | **1.74** | Premium Index (MR-174) | 33 | ~30% |



The reduction column is measured on a minus four in a 52□18 frame at 54 mm ED, and it is the edge thickness against CR-39. The tool measures the same figure on the lens in hand, so the sheet and this table cannot disagree.

### Frame-Type Overrides
1. **Half-Rim** — Minimum index forced to **1.56** (NK-55) for nylon string groove tensile strength
2. **Rimless** — Minimum index forced to **1.60** (MR-8) for drill-hole durability
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

[Bun](https://bun.com) **v1.2** or **later** (`bun --version`).

### Setup

```bash
# Install dependencies
bun install

# Start development server (port and host come from .env.development)
bun run dev

# Type-check with TypeScript
bun run lint

# Run unit tests (Vitest)
bun run test

# Production build
bun run build

# Preview production build (port and host come from .env.production)
bun run preview

# Remove the build output
bun run clean
```

---

## Environment

Port, host, and environment name live in env files rather than in the scripts. Vite
picks the file that matches its mode automatically — no flags required.

| File | Purpose | Values |
| --- | --- | --- |
| `.env.development` | Used by `bun run dev` | `PORT=3000`, `HOST=0.0.0.0`, `APP_ENV=development` |
| `.env.production` | Used by `bun run build` and `bun run preview` | `PORT=8080`, `HOST=0.0.0.0`, `APP_ENV=production` |
| `.env.local` | Your local secrets (gitignored) | `GEMINI_API_KEY`, `APP_URL` |
| `.env.example` | Reference for every variable | — |

```bash
# Preview on a different port (real env vars override the env files)
PORT=4120 bun run preview
```

Set `DISABLE_HMR=true` to turn off Hot Module Replacement, or `STRICT_PORT=true` to
fail instead of auto-incrementing when the port is busy.

> Bun's automatic `.env` loading is disabled in `bunfig.toml` so that Vite stays the
> single source of truth for environment files. Without it, Bun injects
> `.env.development` into `process.env` regardless of Vite's mode, and a production
> build would silently pick up the development port.

---

## Deployment

See:
- [`deploy-guide.md`](./deploy-guide.md) — Static SPA deployment
- [`deploy-guide-docker.md`](./deploy-guide-docker.md) — Docker multi-stage build deployment

---

## Version

**v0.5.0** — Engine core: `AMP_V4.2.0` / `AMP_ASPH_V1.0.0`

Designed for **Akademi Optometri Yogyakarta (Aktriyo)**.
