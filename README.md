# Aktriyo Measuring Project (AMP)
> Professional simulator for optical lens thickness, frame protrusion, and 3D visual analysis developed for Aktriyo.

AMP is a highly precise, full-stack reactive viewport and calculation engine that assists opticians, optometrists, and frame/lens laboratories in simulating and predicting **lens edge thickness**, **center thickness**, and **spatial protrusion** within a chosen frame.

Built with **React**, **Three.js (React Three Fiber)**, and **Tailwind CSS**, it features a real-time responsive 3D visualization and an advanced recommendation engine that takes into account Rx prescriptions, frame dimensions, and patient characteristics.

---

## 📖 Ringkasan / Overview
Di dalam optometri profesional, salah satu masalah estetika dan kenyamanan terbesar adalah tebal lensa di pinggir (untuk penderita lensa minus tinggi) atau tebal di tengah (untuk lensa plus tinggi), serta seberapa jauh ujung lensa menonjol keluar dari bingkai kacamata (Frame Protrusion).

Aplikasi ini menyimulasikan:
1. **Ketebalan Tepi & Pusat Lensa ($CT$ & $ET$)** berdasarkan resep bola (*Sphere*), silinder (*Cylinder*), dan sumbu (*Axis*).
2. **Desentrasi Horizontal & Vertikal** berdasarkan kecocokan Pupil Distance ($PD$) dan Fitting Height pasien dengan ukuran frame kacamata ($A, B, DBL$).
3. **Penonjolan Depan-Belakang (Anterior & Posterior Protrusion)** berdasarkan penempatan letak alur/bevel kacamata (*groove/bevel percent*).
4. **Mesin Rekomendasi Material Pintar** yang menentukan material paling ideal (CR-39, MR-8, dll) sesuai kekuatan resep serta ketahanan mekanik tipe frame (Rimless, Half-Frame, Full-Frame).

---

## 📐 Rumus Fisika & Mekanisme Optik (Core Engine)
Mesin perhitungan kami berada pada modul berkas `/src/lib/optical.ts`. Berikut merupakan rangkaian perumusan matematis yang diimplementasikan secara presisi:

### 1. Desentrasi Kombinasi ($d_{\text{combined}}$)
Desentrasi terjadi akibat ketidakselarasan antara pusat optik lensa (yang sejajar pupil mata pasien) dengan pusat geometris kotak lensa pada frame. Hal ini secara signifikan memindahkan area tebal lensa ke sisi temporal atau nasal.

*   **Pusat Bingkai Horisontal (Frame PD):**
    $$F_{PD} = \text{A-Size} (a) + \text{Bridge} (dbl)$$
*   **Desentrasi Horisontal ($d_H$):**
    $$d_H = \frac{|F_{PD} - PD|}{2}$$
*   **Desentrasi Vertikal ($d_V$):**
    $$d_V = |\text{Fitting Height} - \frac{b}{2}|$$
*   **Desentrasi Kombinasi ($d_{\text{combined}}$):**
    $$d_{\text{combined}} = \sqrt{d_H^2 + d_V^2}$$

### 2. Radius Efektif Batas Lensa ($y$)
Lensa dipotong sesuai diameter efektif terbesar ($ED$) bingkai ditambah akumulasi nilai desentrasi:
$$y = \frac{ED}{2} + d_{\text{combined}}$$

### 3. Jari-jari Kelengkungan Permukaan Depan & Belakang ($R_1$ dan $R_2$)
Kelengkungan permukaan lensa dikalkulasikan menggunakan indeks bias material ($n$) dan nilai kekuatan kelengkungan basis (*Base Curve* / $BC$):
*   **Radius Permukaan Depan ($R_1$, dalam mm):**
    $$R_1 = \frac{1000 \cdot (n - 1)}{BC}$$
*   **Kekuatan Permukaan Belakang ($P_{\text{back}}$):**
    $$P_{\text{back}} = P_{\text{calc}} - BC$$
    *(Di mana $P_{\text{calc}}$ adalah kekuatan lensa pada meridian terkuat untuk memprediksi ketebalan terburuk/worst-case)*
*   **Radius Permukaan Belakang ($R_2$, dalam mm):**
    $$R_2 = \begin{cases} \infty, & \text{jika } P_{\text{back}} = 0 \\ \frac{1000 \cdot (n - 1)}{|P_{\text{back}}|}, & \text{jika } P_{\text{back}} \neq 0 \end{cases}$$

### 4. Formula Sagitta ($s_1$ dan $s_2$)
Formula sagitta digunakan untuk menghitung kedalaman lengkung dari masing-masing permukaan anterior ($s_1$) dan posterior ($s_2$):
$$s = R - \sqrt{R^2 - y^2}$$
*Jika lensa datar ($R = \infty$), maka nilai sagitta $s = 0$.*

### 5. Ketebalan Pusat ($CT$) & Ketebalan Samping ($ET$)
Sistem menetapkan batasan kelayakan mekanis dengan ketebalan minimum ($t_{\text{min}}$) sebesar `1.0 mm` (bisa bervariasi bergantung setelan):
*   **Untuk Lensa Plus ($P_{\text{calc}} \ge 0$):**
    Ketebalan tepi ($ET$) diposisikan pada batas minimum $t_{\text{min}}$. Ketebalan pusat ($CT$) dihitung sebagai:
    $$CT = t_{\text{min}} + s_1 - s_2 \quad (\text{untuk } P_{\text{back}} \le 0)$$
    $$CT = t_{\text{min}} + s_1 + s_2 \quad (\text{untuk } P_{\text{back}} > 0)$$
*   **Untuk Lensa Minus ($P_{\text{calc}} < 0$):**
    Ketebalan pusat ($CT$) diposisikan pada batas minimum $t_{\text{min}}$. Ketebalan tepi ($ET$) dihitung sebagai:
    $$ET = t_{\text{min}} + s_2 - s_1 \quad (\text{untuk } P_{\text{back}} \le 0)$$
    $$ET = t_{\text{min}} + s_1 + s_2 \quad (\text{untuk } P_{\text{back}} > 0)$$

### 6. Projeksi Penonjolan Lensa pada Frame (Protrusion)
Lensa diletakkan pada bingkai menggunakan persentase alur bezel (*Groove/Bevel Percent*). Nilai ini menentukan seberapa besar sisa lensa menonjol keluar bingkai ke bagian depan (*Anterior*) maupun ke bagian belakang (*Posterior*):
*   **Posisi Bevel ($x_{\text{groove}}$):**
    $$x_{\text{groove}} = \text{Frame Depth} \times \text{Bevel Percent}$$
*   **Penonjolan Depan ($Anterior$):**
    $$Front_{X} = \left(x_{\text{groove}} - \frac{ET}{2}\right) - s_1$$
    $$\text{Anterior Protrusion} = \max(0, -Front_{X})$$
*   **Penonjolan Belakang ($Posterior$):**
    $$Back_{X} = x_{\text{groove}} + \frac{ET}{2}$$
    $$\text{Posterior Protrusion} = \max(0, Back_{X} - \text{Frame Depth})$$

---

## 🛠️ Rekomendasi Material Pintar (Recommendation Engine)
AMP memiliki algoritma canggih yang secara otomatis menganalisis parameter fisik resep dan bingkai Anda untuk menyarankan jenis material indeks bias optimal:

| Rentang S.E (Sph Equivalent) | Rekomendasi Indeks | Nama Umum Material | Klasifikasi & Nilai Abbe ($V_d$) | Alasan Utama & Keunggulan |
| :--- | :---: | :---: | :---: | :--- |
| **$\le 2.00$ D** | **1.50** | CR-39 | Abbe 58 (Highest Clarity) | Daya jernih maksimal, minim aberasi kromatik. |
| **$> 2.00$ s/d $\le 3.00$ D** | **1.56** | Mid-Index (NK-55) | Abbe 38 (Standard Mid) | Keseimbangan biaya ekonomis dengan reduksi ketebalan ~15%. |
| **$> 3.00$ s/d $\le 5.00$ D** | **1.61** | High-Index (MR-8) | Abbe 42 (Tough Poly) | Sangat tahan benturan, reduksi tebal ~25% dengan nilai Abbe baik. |
| **$> 5.00$ s/d $\le 8.00$ D** | **1.67** | Ultra High-Index (MR-10) | Abbe 32 | Reduksi ketebalan signifikan hingga ~35% untuk power tinggi. |
| **$> 8.00$ D** | **1.74** | Premium (MR-174) | Abbe 33 (Thinnest Option) | Hasil estetika paling tipis (~45% reduksi tebal), sangat disarankan. |

### Aturan Override Khusus (Mekanika Frame):
1.  **Half-Rim Frame Override:** Jika terdeteksi tipe bingkai gantung (*half-rim*), indeks minimum dipaksa ke **1.56** (NK-55) guna memastikan kekuatan tarik tinggi untuk alur senar nilon agar lensa tidak mudah gupil (*chipping*).
2.  **Rimless Frame Override:** Jika terdeteksi tipe bingkai bor (*rimless*), indeks minimum dipaksa ke **1.61** (MR-8) sebab material MR-8 memiliki elastisitas tinggi dan tidak akan pecah saat dibor (*stress-fracture resistant*).
3.  **Large Eye Size Penalty:** Jika ukuran horizontal mata lensa ($A$) melebihi **54mm** pada lensa minus, mesin akan otomatis meningkatkan rekomendasi indeks bias 1 tingkat lebih tinggi dari aturan standar karena ukuran kacamata lebar akan melipatgandakan ketebalan tepi luar secara drastis.

---

## 📦 Struktur Komponen Utama (Architecture)

```bash
/src
├── App.tsx                    # Layout Utama, State global, pembagian Grid Desktop & Mobile
├── index.css                  # Load Google Fonts & Tailwind CSS configuration core
├── main.tsx                   # Bootloader VirtualDOM React 19
├── components/
│   ├── Sidebar.tsx            # Input kontrol numerik parameter lensa, frame, & pasien
│   ├── CurvatureCard.tsx      # Panel perbandingan lengkung depan (anterior) & belakang (posterior)
│   ├── Visualizer.tsx         # Panel Visualisasi 3D Interaktif (WebGL via Three.js)
│   ├── SummaryCard.tsx        # Panel ringkasan metrik instan (CT, ET, Penonjolan, Berat estimasi)
│   └── RecommendationCard.tsx # Panel saran material cerdas terintegrasi
└── lib/
    ├── i18n.ts                # Layanan multibahasa (Bahasa Indonesia & English)
    ├── optical.ts             # Algoritma dan kalkulasi optis fundamental
    └── utils.ts               # utilitas styling dinamis (clsx, tailwind-merge)
```

---

## 💎 Precise Optometric Control System
Menanggapi kebutuhan alat optik profesional yang menuntut tingkat akurasi tinggi, kontrol angka pada `Sidebar.tsx` telah dimodifikasi secara khusus dari slider reguler menjadi komponen **Discrete Numeric Input** dengan perlindungan khusus:

*   **Floating-Point Protection:** Menggunakan `.toFixed(10)` dan `parseFloat` ketika melakukan operasi matematika inkremental/dekremental untuk menghilangkan bug desimal bawaan Javascript (misalnya `0.1 + 0.2 = 0.30000000000000004`).
*   **Step-Snapping on Blur:** Nilai SPH atau CYL akan disesuaikan otomatis mengikuti step standar optometri (`0.25 D`) ketika tombol ditekan atau pengguna mengetik angka manual lalu meninggalkan fokus masukan (`onBlur`) atau menekan tombol `Enter`.
*   **Axis Boundaries & Width Optimization:** Input untuk Axis memiliki rasio lebar yang dipadatkan khusus (`w-12`), sedangkan SPH dan CYL memiliki ruang lebar lebih panjang (`w-16`) guna melayani karakter digit minus yang tinggi.

---

## 🚀 Panduan Instalasi & Pengembangan

### Prasyarat
Sistem membutuhkan runtime Node.js (versi v18 atau yang lebih baru direkomendasikan) serta NPM.

### Langkah-Langkah

1.  **Clone / Ekstrak Berkas:**
    Pastikan semua berkas project berada pada root direktori kerja Anda.

2.  **Instalasi Dependensi:**
    Jalankan perintah berikut untuk menginstal semua library pendukung (React 19, Three.js, Tailwind v4, Lucide React, Framer Motion, dll):
    ```bash
    npm install
    ```

3.  **Jalankan Server Lokal (Development):**
    Aktifkan server lokal Vite pada port 3000:
    ```bash
    npm run dev
    ```
    Buka `http://localhost:3000` pada peramban web/browser Anda.

4.  **Memproses Kode Linter & Tipe Data:**
    Untuk melakukan validasi tipe TypeScript tanpa melakukan kompilasi bundel:
    ```bash
    npm run lint
    ```

5.  **Kompilasi Produksi (Production Build):**
    Membuat bundel statis berkas produksi yang dioptimalkan dalam folder `/dist`:
    ```bash
    npm run build
    ```

---

## 💡 Versi Rilis
Mesin AMP berjalan pada versi core **`AMP_V4.1.2`**.
Visualisasi 3D dioptimalkan untuk performa tinggi di perangkat seluler maupun komputer meja dengan mereduksi kalkulasi geometri mesh internal secara dinamis.

Didesain secara presisi, ergonomis, dan fungsional untuk Aktriyo.
