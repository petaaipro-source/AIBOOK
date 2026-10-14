# Spesifikasi Umum 2025 (aibook.my.id)

PWA pembaca dokumen Spesifikasi Umum (jalan & jembatan). Isi dokumen dienkripsi (AES-256-GCM) dan hanya terbuka setelah login.

## Susunan berkas
```
index.html, login.css, auth.js, pwa.js     halaman login (edit langsung; versinya dicap otomatis saat build)
sw.js                                      service worker: aplikasi bisa dibuka offline (VER diisi build)
vault.js                                   DATA TERENKRIPSI hasil build (jangan diedit)
pdf/*.bin                                  PDF per bab, terenkripsi (diunduh lewat tombol "Unduh")
manifest.webmanifest, icon-*.png           PWA

app-source.html, app.css, reader.js        SUMBER aplikasi (dienkripsi ke vault.js saat build)
doc.js, images.json                        isi dokumen dan gambar
00-core ... 80-polish.js                   modul tambahan (urutan = urutan di app-source.html)
build.mjs                                  sumber -> vault.js (+ enkripsi pdf-src/*.pdf -> pdf/*.bin)

users.json  (dari users.example.json)      RAHASIA, tidak di-commit
dockey.txt  (dibuat otomatis oleh build)   RAHASIA, tidak di-commit
pdf-src/    (PDF asli)                     RAHASIA, tidak di-commit
```
`.gitignore` sudah menjaga tiga berkas rahasia di atas agar tidak ikut ter-commit.

## Build
```
node build.mjs           # bangun vault.js
node build.mjs --check   # verifikasi: kunci cocok, dokumen & semua PDF terbuka, sudah sinkron dengan source
```
- Ada `users.json` -> semua akun dibungkus ulang (password dipakai saat ini). Pengguna dengan `"role":"admin"` atau `"download":true` mendapat tombol unduh PDF.
- Tidak ada `users.json` -> akun di `vault.js` lama dipakai ulang apa adanya, password lama tetap berlaku. Cukup untuk update tampilan/fitur tanpa tahu password siapa pun.
- Build memeriksa sintaks seluruh JavaScript sebelum mengenkripsi, dan hanya menulis ulang `pdf/*.bin` yang isinya benar-benar berubah.
- `index.html` dan `sw.js` otomatis dicap versi baru (`?v=...`) supaya browser tidak memakai cache lama. Commit `vault.js`, `index.html`, `sw.js` (dan `*.bin` bila berubah).

## Kunci dokumen
PDF `.bin` dan `vault.js` memakai satu kunci dokumen yang sama. Build memakai ulang kunci dari `dockey.txt` (atau env `DOCKEY`).
- Punya PDF asli? Taruh di `pdf-src/` (nama sama dengan `.bin`).
- Tidak punya? Login sebagai admin di situs lama, buka Console, jalankan `__U.k`, salin hasilnya ke `dockey.txt` (satu baris).
- **Rotasi kunci** (bila `dockey.txt`/PDF asli pernah ter-commit atau bocor): hapus `dockey.txt`, siapkan `users.json` lengkap beserta password, dan `pdf-src/`, lalu `node build.mjs`. Semua `.bin` terenkripsi ulang dengan kunci baru. Perbarui secret `DOCKEY` di GitHub. Berkas bocor di riwayat Git harus dibersihkan terpisah (mis. `git filter-repo`) atau repo dibuat ulang.

## Bangun lewat GitHub Actions (tanpa Node lokal)
1. Repo > Settings > Secrets and variables > Actions:
   - `DOCKEY` (wajib): isi `dockey.txt`, satu baris.
   - `USERS_JSON` (opsional): isi `users.json`. Kosong = akun yang ada dipertahankan.
2. Workflow "Build vault.js" jalan otomatis saat file sumber di-push, atau manual lewat tab Actions > Run workflow.

## Fitur pembaca
- Pencarian: semua kata harus cocok; bila kosong, otomatis dicari ulang dengan toleransi salah ketik dan sinonim. Tekan `/` untuk fokus ke kolom cari.
- Tombol Back (Android/browser) bergerak antar halaman di dalam aplikasi, tidak keluar. Tautan `#hlm-N` membuka halaman N langsung.
- Navigasi seksi sebelumnya/berikutnya, bilah progres baca, penanda, catatan pribadi, ukuran huruf, tema.
- Asisten dokumen (BM25 + sinonim + salah ketik), baca-keras dengan sorotan, Pustaka video & pedoman, Teknik Pro.
- Offline: halaman login dan dokumen tersimpan lewat service worker (PDF dan video tetap butuh internet).
- Keyboard: kartu hasil/seksi bisa difokus dan dibuka dengan Enter/Spasi, Escape menutup panel.

## Modul Teknik Pro (75-teknik.js)
Tombol Teknik: U-Ditch (DS-1..6), Box Culvert + rekomendasi dari debit, Pasangan Batu, DPT (guling/geser/daya dukung), Bore Pile (Decourt-Quaresma). Asisten paham bahasa alami, mis. `box culvert 2x2 panjang 50 m debit 4`. Semua hasil = ESTIMASI AWAL; wajib diverifikasi ahli dan gambar kerja.
