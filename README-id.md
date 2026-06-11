# Optical Tools

> Simulator profesional untuk ketebalan lensa optik, penonjolan bingkai, dan analisis visual 2D.

Aplikasi viewport reaktif dan mesin kalkulasi presisi tinggi yang membantu optician, optometris, serta laboratorium lensa/bingkai dalam mensimulasikan dan memprediksi **ketebalan tepi lensa**, **ketebalan pusat**, dan **penonjolan spasial** di dalam bingkai kacamata.

Dibangun dengan **React 19**, **TypeScript**, **Tailwind CSS v4**, dan **SVG**. Menyediakan visualisasi 2D responsif real-time, mesin rekomendasi cerdas, routing multi-halaman, dan dukungan i18n (Inggris/Indonesia).

---

## Fitur

- **Routing multi-halaman** — Beranda, Visualizer (mode Sederhana/Lanjutan), dan Kontak
- **Tiga tampilan visualisasi** — Potongan melintang samping, Tampak atas, dan Tampak depan
- **Mode perbandingan lensa** — Membandingkan dua material indeks secara berdampingan
- **Kalkulasi lensa asferis** — Pemodelan permukaan asferis konik dan polinomial
- **Rekomendasi material pintar** — Memilih indeks optimal secara otomatis berdasarkan SE power, jenis bingkai, dan ukuran mata
- **Mesin validasi** — Validasi input klinis dan ergonomis real-time dengan peringatan
- **Tema gelap/terang** — Toggle tema persisten
- **i18n (ID/EN)** — Penggantian bahasa via parameter URL (`?lang=`)
- **Responsif seluler** — Tata letak khusus perangkat seluler dengan navigasi tab
- **Panel resizable** — Tata letak grid desktop dengan panel yang dapat diubah ukurannya
- **Undo/Redo** — Riwayat status sesi

---

## Rumus Mesin Inti

Mesin kalkulasi berada di `src/lib/optic-engine/optical.ts`. Berikut formulasi matematis yang diimplementasikan:

### 1. Desentrasi Kombinasi ($d_{\text{combined}}$)

- **PD Bingkai**: $F_{PD} = A + DBL$
- **Desentrasi Horizontal**: $d_H = \frac{|F_{PD} - PD|}{2}$
- **Desentrasi Vertikal**: $d_V = |\text{Fitting Height} - \frac{B}{2}|$
- **Kombinasi**: $d_{\text{combined}} = \sqrt{d_H^2 + d_V^2}$

### 2. Radius Efektif ($y$)

$$y = \frac{ED}{2} + d_{\text{combined}}$$

### 3. Jari-jari Permukaan ($R_1$, $R_2$)

- **Radius depan**: $R_1 = \frac{1000 \cdot (n - 1)}{BC}$
- **Kekuatan permukaan belakang**: $P_{\text{back}} = P_{\text{calc}} - BC$
- **Radius belakang**: $R_2 = \begin{cases} \infty, & \text{jika } P_{\text{back}} = 0 \\ \frac{1000 \cdot (n - 1)}{|P_{\text{back}}|}, & \text{jika } P_{\text{back}} \neq 0 \end{cases}$

### 4. Formula Sagitta ($s_1$, $s_2$)

$$s = R - \sqrt{R^2 - y^2}$$

(Jika $R = \infty$, maka $s = 0$)

### 5. Ketebalan Pusat ($CT$) & Ketebalan Tepi ($ET$)

Ketebalan minimum $t_{\text{min}} = 1.0\text{mm}$:

- **Lensa Plus** ($P_{\text{calc}} \ge 0$): $ET = t_{\text{min}}$, lalu $CT = t_{\text{min}} + s_1 \pm s_2$
- **Lensa Minus** ($P_{\text{calc}} < 0$): $CT = t_{\text{min}}$, lalu $ET = t_{\text{min}} + s_2 \pm s_1$

(Tanda tergantung $P_{\text{back}}$)

### 6. Penonjolan Bingkai (Protrusion)

- **Posisi alur**: $x_{\text{groove}} = \text{Kedalaman Bingkai} \times \text{Persentase Bevel}$
- **Penonjolan Depan**: $\max(0,\; x_{\text{groove}} - \frac{ET}{2} - s_1)$
- **Penonjolan Belakang**: $\max(0,\; x_{\text{groove}} + \frac{ET}{2} - \text{Kedalaman Bingkai})$

---

## Rekomendasi Material Pintar

| Rentang SE (D) | Indeks Rekomendasi | Nama Material | Nilai Abbe | Reduksi Ketebalan |
|:---|---:|:---|:---:|:---|
| $\le 2.00$ | **1.50** | CR-39 (Standard) | 58 | 0% |
| $> 2.00$ s/d $\le 3.00$ | **1.56** | Mid-Index (NK-55) | 38 | ~15% |
| $> 3.00$ s/d $\le 5.00$ | **1.61** | High-Index (MR-8) | 42 | ~25% |
| $> 5.00$ s/d $\le 8.00$ | **1.67** | Ultra High-Index (MR-10) | 32 | ~35% |
| $> 8.00$ | **1.74** | Premium Index (MR-174) | 33 | ~45% |

### Aturan Khusus Jenis Bingkai
1. **Half-Rim** — Indeks minimum dipaksa ke **1.56** (NK-55) untuk kekuatan tarik alur senar nilon
2. **Rimless** — Indeks minimum dipaksa ke **1.61** (MR-8) untuk ketahanan lubang bor
3. **Ukuran Mata Besar ($A \ge 54$mm)** — Indeks otomatis dinaikkan satu tingkat untuk lensa minus

---

## Struktur Proyek

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
│   ├── ui/                  # 25 primitif shadcn/ui (button, card, select, slider, dll.)
│   ├── Visualizer/          # FrameProfile, FrontView, LensProfile, TopDownView,
│   │                        # index.tsx, types.ts
│   ├── ErrorBoundary.tsx
│   ├── RootLayout.tsx
│   └── Sidebar.tsx
├── contexts/
│   └── OpticalContext.tsx    # React Context untuk manajemen status optik
├── data/
│   └── materials.ts         # Database material terpusat & batas ergonomis
├── hooks/
│   ├── useMediaQuery.ts     # Deteksi breakpoint responsif
│   ├── useOpticalState.ts   # Manajemen status inti, dispatch kalkulasi, undo/redo
│   └── useTheme.tsx         # Toggle tema gelap/terang
├── lib/
│   ├── optic-engine/        # optical.ts, aspheric.ts, types.ts, validation.ts, optical.test.ts
│   ├── translations/        # en.ts, id.ts, index.ts, types.ts
│   └── utils.ts             # Utilitas penggabungan kelas Tailwind
├── pages/
│   ├── HomePage.tsx         # Halaman muka dengan pemilihan modul
│   ├── VisualizerPage.tsx   # Halaman simulator utama (tab sederhana + lanjutan)
│   └── ContactPage.tsx      # Halaman informasi kontak
├── routes/
│   ├── root.tsx             # Route root dengan OpticalProvider
│   ├── index.tsx            # Konfigurasi route beranda (/)
│   ├── contact.tsx          # Konfigurasi route kontak
│   ├── visualizer.tsx       # Konfigurasi route visualizer (/visualizer/simple, /visualizer/advanced)
│   └── router.tsx           # Inisialisasi TanStack Router dengan pohon route
├── index.css                # Style Tailwind CSS v4 & font global
├── main.tsx                 # Entry point aplikasi
└── types.d.ts               # Deklarasi tipe global (Vite client types)
```

---

## Instalasi & Pengembangan

### Prasyarat

Node.js **v18** atau **v20+**.

### Langkah-langkah

```bash
# Instal dependensi
npm install

# Jalankan server development (port 3000 dengan HMR)
npm run dev

# Type-check dengan TypeScript
npm run lint

# Jalankan unit test (Vitest)
npm run test

# Build produksi
npm run build

# Pratinjau build produksi
npm run preview
```

---

## Deployment

Lihat:
- [`deploy-guide.md`](./deploy-guide.md) — Deployment SPA statis
- [`deploy-guide-docker.md`](./deploy-guide-docker.md) — Deployment Docker multi-stage build

---

## Versi

**v0.5.0** — Inti mesin: `AMP_V4.2.0`

Didesain untuk **Akademi Optometri Yogyakarta (Aktriyo)**.
