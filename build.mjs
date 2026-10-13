// Bangun vault.js: inline src/app (html+css+js terpisah) -> gzip -> enkripsi AES-GCM, kunci dibungkus per user.
// Pakai: node tools/build.mjs   (butuh tools/users.json, lihat users.example.json)
import { webcrypto as W, randomBytes } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url)), S = W.subtle, ITER = 600000;
const b64 = u => Buffer.from(u).toString('base64'), hex = u => Buffer.from(u).toString('hex');
const enc = new TextEncoder();

// 1. Gabungkan aplikasi: <link rel=stylesheet href> dan <script src> lokal di-inline
const appDir = root; // susunan datar: semua berkas aplikasi ada di folder yang sama
let html = readFileSync(join(appDir, 'app-source.html'), 'utf8');
const rd = f => readFileSync(join(appDir, f.split('/').pop()), 'utf8');
const ATTR = a => a.replace(/\s*\b(src|data-iife)(=["'][^"']*["'])?/g, '');
const body = f => rd(f).replace(/<\/script/gi, '<\\/script');
html = html
  .replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["'](?!https?:)([^"']+)["'][^>]*>/g, (_, f) => `<style>${rd(f)}</style>`)
  // <script data-iife src=...> berurutan digabung dalam SATU IIFE (berbagi scope)
  .replace(/(?:<script\s+data-iife\s+src=["'][^"']+["']><\/script>\s*)+/g, g => `<script>(function(){\n${[...g.matchAll(/src=["']([^"']+)["']/g)].map(m => body(m[1])).join('\n')}\n})();</script>\n`)
  .replace(/<script([^>]*)\bsrc=["'](?!https?:)([^"']+)["']([^>]*)><\/script>/g, (_, a1, f, a2) => `<script${ATTR(a1 + a2)}>${body(f)}</script>`);

// 2. Enkripsi dokumen dengan kunci acak
const users = JSON.parse(readFileSync(join(root, 'users.json'), 'utf8'));
// Kunci dokumen dipakai ulang agar PDF .bin yang sudah ada tetap bisa dibuka.
// Urutan: env DOCKEY -> dockey.txt -> buat baru (lalu disimpan ke dockey.txt, jangan di-commit).
const keyFile = join(root, 'dockey.txt');
const keyB64 = (process.env.DOCKEY || (existsSync(keyFile) ? readFileSync(keyFile, 'utf8') : '')).trim();
const rawKey = keyB64 ? Buffer.from(keyB64, 'base64') : randomBytes(32), k = b64(rawKey);
if (rawKey.length !== 32) throw new Error('DOCKEY harus 32 byte (base64)');
if (!keyB64) writeFileSync(keyFile, k + '\n');
const docKey = await S.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
const docIv = randomBytes(12);
const ct = await S.encrypt({ name: 'AES-GCM', iv: docIv }, docKey, gzipSync(Buffer.from(html)));

// 2b. Enkripsi PDF per bab (folder pdf-src/NAMA.pdf -> pdf/NAMA.bin, format: iv(12 byte) + ciphertext AES-GCM, kunci sama dengan dokumen)
const pdfSrc = join(root, 'pdf-src'), pdfOut = join(root, 'pdf');
let nPdf = 0;
if (existsSync(pdfSrc)) {
  mkdirSync(pdfOut, { recursive: true });
  for (const f of readdirSync(pdfSrc).filter(x => /\.pdf$/i.test(x))) {
    const iv = randomBytes(12);
    const c = Buffer.from(await S.encrypt({ name: 'AES-GCM', iv }, docKey, readFileSync(join(pdfSrc, f))));
    writeFileSync(join(pdfOut, f.replace(/\.pdf$/i, '.bin')), Buffer.concat([iv, c]));
    nPdf++;
  }
}

// 3. Bungkus kunci untuk tiap user (PBKDF2 dari "username\0password")
const idsalt = hex(randomBytes(8));
const out = { iter: ITER, idsalt, doc: { iv: b64(docIv), ct: b64(ct) }, users: [] };
for (const u of users) {
  const id = hex(await S.digest('SHA-256', enc.encode(idsalt + u.username))).slice(0, 16);
  const salt = randomBytes(16), iv = randomBytes(12);
  const km = await S.importKey('raw', enc.encode(u.username + '\u0000' + u.password), 'PBKDF2', false, ['deriveKey']);
  const kek = await S.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const w = await S.encrypt({ name: 'AES-GCM', iv }, kek, enc.encode(JSON.stringify({ k, n: u.name || u.username, r: u.role || 'user', d: (u.role === 'admin' || u.download === true) ? 1 : 0 })));
  out.users.push({ id, s: b64(salt), iv: b64(iv), w: b64(w) });
}
writeFileSync(join(root, 'vault.js'), '/* DATA TERENKRIPSI - dihasilkan otomatis oleh tools/build.mjs. Jangan diedit manual. */\nwindow.VAULT=' + JSON.stringify(out) + ';\n');
if (!nPdf) console.log('Catatan: tidak ada pdf-src/, file .bin lama dibiarkan (tetap valid selama kunci dokumen sama).');
console.log(`OK: ${users.length} user, ${nPdf} PDF terenkripsi, dokumen ${(html.length / 1024).toFixed(0)} KB -> vault.js`);
