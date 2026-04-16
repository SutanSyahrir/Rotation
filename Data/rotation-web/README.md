# Rotation Organization Dashboard

Dashboard web untuk membaca file Excel hasil Google Forms pendaftaran lomba Rotation. Proyek ini dibuat agar panitia dan organisasi bisa melihat data pendaftar dengan cepat, rapi, dan siap dipakai untuk rapat atau presentasi.

## Ringkasan

- Proses data 100% di browser, tanpa backend
- Upload file Excel atau buka sample data bawaan
- Statistik otomatis untuk peserta, sekolah, kategori, dan lomba
- Filter cepat berdasarkan nama, kategori, lomba, dan sekolah
- Export CSV dari hasil filter aktif
- Mode cetak/PDF untuk kebutuhan rapat organisasi
- Siap deploy ke GitHub Pages lewat GitHub Actions

## Stack

- React 19
- Vite
- SheetJS (`xlsx`)
- Recharts
- Lucide React

## Struktur data Excel yang didukung

Dashboard membaca sheet pertama dan mencari header berdasarkan nama kolom. Format yang didukung mengikuti file Google Forms seperti:

1. `Timestamp`
2. `Nama Peserta/Team`
3. `Asal Sekolah`
4. `Kategori Lomba`
5. `No WA Aktif`
6. `Pilih Lomba`
7. `Pilih Lomba 2`
8. `Pilih Lomba 3`

Parser juga menormalkan sebagian variasi penulisan sekolah dan nama lomba agar statistik tidak pecah.

## Menjalankan proyek

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

## Deploy ke GitHub Pages

Workflow deploy sudah tersedia di `.github/workflows/deploy.yml`.

Langkah yang disarankan:

1. Buat repository GitHub untuk proyek ini.
2. Push branch utama ke `main` atau `master`.
3. Di GitHub, buka `Settings > Pages`.
4. Pastikan source menggunakan `GitHub Actions`.
5. Setiap push ke branch utama akan otomatis build dan deploy.

Catatan:
- File contoh disimpan di `public/sample.xlsx`.
- File `public/.nojekyll` sudah ditambahkan agar static asset aman di GitHub Pages.
- Konfigurasi Vite menggunakan `base: './'` agar aman untuk deploy di subpath repository.

## Catatan data asli

Berdasarkan file Excel yang dianalisis:

- Total 39 pendaftar
- 3 kategori aktif
- 24 variasi nama sekolah sebelum normalisasi
- Ada variasi kapitalisasi dan penulisan sekolah yang sudah dirapikan parser
- Ada variasi nama lomba seperti `E-Sport Mobile Legend` dan `E-Sport: Mobile Legend`

## Cocok untuk organisasi

Proyek ini cocok dipakai untuk:

- Rapat evaluasi panitia
- Presentasi perkembangan pendaftaran
- Rekap cepat peserta per sekolah dan kategori
- Ekspor hasil filter untuk dokumentasi atau tindak lanjut
