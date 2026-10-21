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

Minimum thickness $t_{\text{min}}$: the thinnest the lens is allowed to be anywhere, an input on the sheet, 1.0 mm by default. The material at the rim is the centre thickness plus the difference of the two surface offsets:

$$t(\theta) = CT + s_2(\theta) - s_1(\theta)$$

The centre thickness is whatever makes the thinnest point of the whole lens the minimum thickness:

$$CT = t_{\text{min}} + \max\left(0,\ \max_\theta \left(s_1(\theta) - s_2(\theta)\right)\right)$$

- **$ET$** is the thickest material around the rim, $\max_\theta t(\theta)$: the edge the groove has to swallow.
- **$ET_{\min}$** is the thinnest point of the rim, $\min_\theta t(\theta)$.

### 6. Vertex power

A lens is not thin, so the power the patient wears is not the sum of the two surface powers. The back vertex power of a lens of centre thickness $t$ and index $n$ is

$$F_v = \frac{F_1}{1 - \frac{t}{n} F_1 \cdot 10^{-3}} + F_2$$

with $F_1$ the front surface power in dioptres and $t$ in millimetres. The engine solves the thickness, computes $F_v$, and **re-solves the back power** so that $F_v$ is the power on the prescription — at most five times, and it reports the vertex power and how far it still is from the prescription. The correction is the same in every meridian, so a cylinder stays a cylinder.

### 7. Frame protrusion

The lens is placed in the bevel groove by the **vertical meridian** through the optical centre: the edge at the top of the opening is the one centred on the groove, and the two vertices follow from there.

- **Groove position**: $x_{\text{groove}} = \text{Frame Depth} \times \text{Bevel Percent}$
- The vertices follow from the edge at the top of the opening:
  $x_{\text{front}} = x_{\text{groove}} - \frac{ET_{\text{top}}}{2} - s_1(\text{top})$, $x_{\text{back}} = x_{\text{front}} + CT$
- **Anterior protrusion**: $\max(0,\ -x_{\text{front}})$
- **Posterior protrusion**: $\max(0,\ x_{\text{back}} + \max(0, \max(s_2(\text{top}), s_2(\text{bottom}))) - \text{Frame Depth})$

Both are measured in that same vertical meridian, because that is the meridian the lens is held in. Measuring the posterior protrusion at the deepest point of the back surface somewhere else around the rim would report a lens standing out of a frame it is not standing out of.

> **The frame is a flat plane.** The model gives the frame no base curve of its own, so the rim that holds the lens is a straight band rather than a curve that follows the lens. The numbers say what they measure: the lens is placed by the vertical meridian, and the protrusion is measured in that plane. A frame with a base curve of its own would report a different figure here.

### 8. Minimum blank size

The blank has to hold the shape *around the optical centre*, and the optical centre does not sit at the boxing centre — the horizontal decentration and the vertical fitting offset both move it. So the blank is twice the farthest the rim reaches from the pupil, plus the edging allowance:

$$MBS = 2 \cdot d_{\text{far}} + 2$$

where $d_{\text{far}}$ is the exact farthest point of the shape (the $A \times B$ box cut by the circle of diameter $ED$) from the optical centre. It is the greatest of the box's corners that survive the circle, the points where the circle crosses the box, and the point of the circle opposite the optical centre.

### 9. Weight

The volume of the lens is the thickness integrated over the opening, and the weight is that volume times the density of the material. The integration is centred on the optical centre, so the outer ring reaches as far as the shape does from the pupil.

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

## Clinical Limits

The thresholds the engine's output is judged against live in one file, [`src/data/limits.ts`](./src/data/limits.ts), and every one of them carries where it comes from.

| Measurement | Limit | Rule | Source |
|---|:---|:---|:---|
| Edge thickness (ET) | ≤ 6.00 mm | max | guideline |
| Centre thickness (CT) | ≥ 1.00 mm | min | guideline |
| Anterior protrusion | ≤ 1.50 mm | max | guideline |
| Posterior protrusion | ≤ 2.00 mm | max | guideline |
| Lens weight | ≤ 15.0 g | max | guideline |
| Prism if not decentred | ≤ 1.00 Δ | reference | guideline |
| Minimum blank | ≤ 85 mm | max | guideline |

`guideline` means the number is the tool's own working rule, not a figure taken from a published standard. A limit that does come from a standard names it (`standard:ANSI Z80.1`), so the sheet can say where its numbers come from.

The **prism row is a reference, not a limit**. The optical centre is placed on the pupil, so the prism at the pupil is zero by construction; the row reports the prism the lens would carry at the centre of the frame if it were not decentred onto the pupil — Prentice's rule, per principal meridian, so the cylinder, the axis and the vertical offset are in the number. It is never counted as a fault.

---

## Smart Material Recommendation

| SE Range (D) | Recommended Index | Material Name | Abbe Value | Edge Reduction |
|:---|---:|:---|:---:|:---|
| $\le 2.00$ | **1.50** | CR-39 (Standard) | 58 | 0% |
| $> 2.00$ to $\le 3.00$ | **1.56** | Mid-Index (NK-55) | 38 | ~11% |
| $> 3.00$ to $\le 5.00$ | **1.60** | High-Index (MR-8) | 41 | ~16% |
| $> 5.00$ to $\le 8.00$ | **1.67** | Ultra High-Index (MR-10) | 31 | ~24% |
| $> 8.00$ | **1.74** | Premium Index (MR-174) | 32 | ~30% |



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
