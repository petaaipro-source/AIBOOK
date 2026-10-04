# Spesifikasi Umum 2025 (aibook.my.id)

```
index.html, css/login.css, js/auth.js, js/pwa.js   halaman login (edit langsung, tanpa build)
vault.js                                         DATA TERENKRIPSI (hasil build, jangan diedit)
manifest.webmanifest, icons/                        PWA
src/app/                                            SUMBER dokumen/aplikasi (dienkripsi saat build)
  app-source.html, css/app.css
  js/reader.js                                      pembaca: menu, navigasi, cari, penanda
  js/data/doc.js, js/data/images.json               isi dokumen (terkompresi) dan gambar
  js/ext/00-core … 10-protect … 20-notes            dasar, proteksi, catatan
  js/ext/24-synonyms.js                             SINONIM asisten (tambah kata di sini)
  js/ext/26-search-engine.js                        mesin cari pintar asisten
  js/ext/30-assistant.js                            UI asisten, suara, mode Claude (admin)
  js/ext/45-reader.js                               baca keras + sorot
  js/ext/50-library-data.js, 52-library.js          data & panel Pustaka (pedoman, video)
  js/ext/60-mobile.js, 70-search.js                 gaya mobile, pencarian multi-kata
tools/build.mjs                                     src/app -> vault.js
tools/users.json                                    daftar user (buat dari users.example.json; tidak di-commit)
```

Berkas `js/ext/*.js` yang bertanda `data-iife` di `src/app/app-source.html` digabung dalam satu scope saat build,
jadi urutan di index.html = urutan eksekusi.

Update: edit file di `src/app/` -> `node tools/build.mjs` -> commit/push `vault.js`.
Tambah/ubah user: edit `tools/users.json` -> build ulang.
