# Rotation Finance Web

Website kas organisasi Rotation untuk bendahara, dibuat dengan React (JavaScript) dan siap dihubungkan ke Firebase.

## Fitur

- Input pemasukan dan pengeluaran
- Ringkasan total pemasukan, total pengeluaran, dan saldo
- Filter serta pencarian transaksi
- Mode demo lokal saat Firebase belum dikonfigurasi
- Siap dipakai untuk deploy melalui GitHub

## Menjalankan project

```bash
npm install
npm run dev
```

## Setup Firebase

1. Buat project di Firebase Console.
2. Aktifkan Firestore Database.
3. Buat aplikasi Web di Firebase.
4. Salin `.env.example` menjadi `.env`.
5. Isi seluruh nilai `VITE_FIREBASE_*`.
6. Jalankan kembali project.

Collection yang dipakai:

- `transactions`

Field dokumen:

- `type`: `Pemasukan` atau `Pengeluaran`
- `category`: string
- `amount`: number
- `date`: string format `YYYY-MM-DD`
- `note`: string
- `createdAt`: timestamp

Variabel env yang dipakai:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Upload ke GitHub

```bash
git init
git add .
git commit -m "Initial Rotation Finance Web"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

## Deploy yang mudah

Pilihan paling cepat:

1. Vercel atau Netlify untuk hosting frontend.
2. Firebase Hosting bila ingin satu ekosistem dengan Firestore.
3. GitHub Pages untuk deploy otomatis dari repository.

Untuk build produksi:

```bash
npm run build
```

## Deploy ke Firebase Hosting

Project Firebase yang dipakai sekarang:

- `rotation-31b76`

File deploy sudah disiapkan:

- `firebase.json`
- `.firebaserc`

Perintah deploy:

```bash
npx firebase-tools deploy --only hosting
```

## Deploy ke GitHub Pages

Workflow GitHub Pages sudah disiapkan di:

- `.github/workflows/deploy-pages.yml`

Jika GitHub Pages diaktifkan pada repository, setiap push ke branch `main` akan membangun dan mem-publish website otomatis.
