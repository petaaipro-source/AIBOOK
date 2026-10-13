# Spesifikasi Umum 2025 (aibook.my.id)

Berkas aplikasi ada di folder utama; PDF terenkripsi (`*.bin`) ada di folder `pdf/`.

```
index.html, login.css, auth.js, pwa.js     halaman login HUD (edit langsung, tanpa build)
vault.js                                   DATA TERENKRIPSI hasil build (jangan diedit)
pdf/*.bin                                  PDF per bab, terenkripsi (diunduh lewat tombol "Unduh")
manifest.webmanifest, icon-*.png           PWA

app-source.html, app.css, reader.js        SUMBER aplikasi (dienkripsi ke vault.js saat build)
doc.js, images.json                        isi dokumen dan gambar
00-core ... 70-search.js                   modul tambahan (urutan = urutan di app-source.html)
48-download.js                             unduh PDF (tombol melayang, kartu divisi, halaman baca)
build.mjs                                  sumber -> vault.js (+ enkripsi pdf-src/*.pdf -> *.bin)
users.json  (buat dari users.example.json; tidak di-commit)
dockey.txt  (dibuat otomatis oleh build; tidak di-commit)
```

## Build
1. Salin `users.example.json` menjadi `users.json`, isi username/password.
   Pengguna dengan `"role":"admin"` atau `"download":true` mendapat tombol unduh PDF.
2. `node build.mjs` lalu commit/push `vault.js` (dan `*.bin` bila ikut berubah).

## Kunci dokumen (penting untuk PDF)
PDF `.bin` dienkripsi dengan kunci dokumen yang sama dengan `vault.js`. Build memakai ulang kunci dari
`dockey.txt` (atau env `DOCKEY`) supaya `.bin` lama tetap terbuka.
- Punya PDF asli? Taruh di `pdf-src/` (nama sama dengan `.bin`), build akan mengenkripsi ulang semuanya.
- Tidak punya PDF asli? Login sebagai admin di situs lama, buka Console browser, jalankan `__U.k`,
  salin hasilnya ke `dockey.txt` (satu baris), lalu build.

## Tanpa Node: bangun lewat GitHub Actions
1. Repo > Settings > Secrets and variables > Actions > New repository secret:
   - `DOCKEY`: isi file `dockey.txt` (satu baris).
   - `USERS_JSON`: isi `users.json` (format sama dengan `users.example.json`).
2. Tab Actions > "Build vault.js" > Run workflow. Hasilnya `vault.js` baru otomatis ter-commit.
Urutan benar: unggah folder `pdf/` dan workflow dulu, jalankan build, baru buka situs.
