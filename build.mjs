// Bangun vault.js: inline aplikasi (html+css+js) -> gzip -> enkripsi AES-GCM, kunci dibungkus per user.
// Pakai:
//   node build.mjs            bangun (users.json bila ada; bila tidak ada, pengguna di vault.js lama dipakai ulang)
//   node build.mjs --check    hanya verifikasi: kunci cocok, dokumen & PDF bisa dibuka, sintaks JS valid
import { webcrypto as W, randomBytes, createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = dirname(fileURLToPath(import.meta.url)), S = W.subtle, ITER = 600000;
const CHECK = process.argv.includes('--check');
const b64 = u => Buffer.from(u).toString('base64'), hex = u => Buffer.from(u).toString('hex');
const enc = new TextEncoder();
const sha = (x, n = 10) => createHash('sha256').update(x).digest('hex').slice(0, n);
const fail = m => { console.error('GAGAL: ' + m); process.exit(1); };

// ---------- 1. Gabungkan aplikasi (susunan datar: semua berkas ada di folder yang sama) ----------
let html = readFileSync(join(root, 'app-source.html'), 'utf8');
const rd = f => readFileSync(join(root, f.split('/').pop()), 'utf8');
const ATTR = a => a.replace(/\s*\b(src|data-iife)(=["'][^"']*["'])?/g, '');
const body = f => rd(f).replace(/<\/script/gi, '<\\/script');
html = html
  .replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["'](?!https?:)([^"']+)["'][^>]*>/g, (_, f) => `<style>${rd(f)}</style>`)
  // <script data-iife src=...> berurutan digabung dalam SATU IIFE (berbagi scope)
  .replace(/(?:<script\s+data-iife\s+src=["'][^"']+["']><\/script>\s*)+/g, g => `<script>(function(){\n${[...g.matchAll(/src=["']([^"']+)["']/g)].map(m => body(m[1])).join('\n')}\n})();</script>\n`)
  .replace(/<script([^>]*)\bsrc=["'](?!https?:)([^"']+)["']([^>]*)><\/script>/g, (_, a1, f, a2) => `<script${ATTR(a1 + a2)}>${body(f)}</script>`);

// ---------- 1b. Cek sintaks setiap <script> hasil gabungan sebelum dienkripsi ----------
{
  let n = 0;
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/type=["']application\/json["']/i.test(m[1])) { try { JSON.parse(m[2]); } catch (e) { fail('images.json tidak valid: ' + e.message); } continue; }
    try { new vm.Script(m[2], { filename: 'bundle-script-' + (++n) + '.js' }); }
    catch (e) { fail('kesalahan sintaks di skrip #' + n + ': ' + e.message); }
  }
  console.log(`Sintaks OK (${n} skrip), dokumen ${(html.length / 1024).toFixed(0)} KB`);
}

// ---------- 2. Kunci dokumen ----------
// Urutan: env DOCKEY -> dockey.txt -> buat baru (disimpan ke dockey.txt; JANGAN di-commit).
const keyFile = join(root, 'dockey.txt'), vaultFile = join(root, 'vault.js'), usersFile = join(root, 'users.json');
const keyB64 = (process.env.DOCKEY || (existsSync(keyFile) ? readFileSync(keyFile, 'utf8') : '')).trim();
const rawKey = keyB64 ? Buffer.from(keyB64, 'base64') : randomBytes(32), k = b64(rawKey);
if (rawKey.length !== 32) fail('DOCKEY harus 32 byte (base64)');
const docKey = await S.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt', 'decrypt']);

const readVault = () => JSON.parse(readFileSync(vaultFile, 'utf8').replace(/^[\s\S]*?window\.VAULT=/, '').replace(/;\s*$/, ''));

// ---------- Mode --check ----------
if (CHECK) {
  if (!keyB64) fail('tidak ada kunci dokumen (dockey.txt / DOCKEY)');
  const V = readVault();
  try {
    const pl = await S.decrypt({ name: 'AES-GCM', iv: Buffer.from(V.doc.iv, 'base64') }, docKey, Buffer.from(V.doc.ct, 'base64'));
    const cur = gunzipSync(Buffer.from(pl)).toString('utf8');
    console.log(`vault.js: dokumen terbuka dengan kunci ini, ${V.users.length} pengguna. ${cur === html ? 'Sudah sinkron dengan source.' : 'BERBEDA dari source (perlu build).'}`);
  } catch { fail('kunci dokumen TIDAK cocok dengan vault.js'); }
  const dir = join(root, 'pdf'); let ok = 0, bad = 0;
  if (existsSync(dir)) for (const f of readdirSync(dir).filter(x => x.endsWith('.bin'))) {
    const buf = readFileSync(join(dir, f));
    try { await S.decrypt({ name: 'AES-GCM', iv: buf.subarray(0, 12) }, docKey, buf.subarray(12)); ok++; } catch { bad++; console.log('  PDF tidak cocok kunci: ' + f); }
  }
  console.log(`PDF .bin: ${ok} OK, ${bad} bermasalah`);
  process.exit(bad ? 1 : 0);
}

// ---------- 3. Daftar pengguna ----------
// users.json ada -> dibungkus ulang (butuh password). Tidak ada -> pakai ulang pembungkus di vault.js lama
// (kunci dokumen harus sama, jadi password lama tetap berlaku tanpa perlu diketahui).
let out, reused = false;
const iv0 = randomBytes(12);
const docCt = async () => b64(await S.encrypt({ name: 'AES-GCM', iv: iv0 }, docKey, gzipSync(Buffer.from(html))));
if (existsSync(usersFile)) {
  if (!keyB64) writeFileSync(keyFile, k + '\n');
  const users = JSON.parse(readFileSync(usersFile, 'utf8'));
  const idsalt = hex(randomBytes(8));
  out = { iter: ITER, idsalt, doc: { iv: b64(iv0), ct: await docCt() }, users: [] };
  for (const u of users) {
    const id = hex(await S.digest('SHA-256', enc.encode(idsalt + u.username))).slice(0, 16);
    const salt = randomBytes(16), iv = randomBytes(12);
    const km = await S.importKey('raw', enc.encode(u.username + '\u0000' + u.password), 'PBKDF2', false, ['deriveKey']);
    const kek = await S.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    const w = await S.encrypt({ name: 'AES-GCM', iv }, kek, enc.encode(JSON.stringify({ k, n: u.name || u.username, r: u.role || 'user', d: (u.role === 'admin' || u.download === true) ? 1 : 0 })));
    out.users.push({ id, s: b64(salt), iv: b64(iv), w: b64(w) });
  }
} else {
  if (!keyB64) fail('users.json tidak ada dan tidak ada kunci dokumen. Buat users.json (lihat users.example.json) atau sediakan dockey.txt.');
  if (!existsSync(vaultFile)) fail('users.json dan vault.js lama sama-sama tidak ada.');
  const old = readVault();
  // pastikan kunci benar-benar yang membuka vault lama, supaya pengguna lama tidak terkunci
  try { await S.decrypt({ name: 'AES-GCM', iv: Buffer.from(old.doc.iv, 'base64') }, docKey, Buffer.from(old.doc.ct, 'base64')); }
  catch { fail('kunci dokumen tidak cocok dengan vault.js lama; pengguna lama akan terkunci. Batalkan.'); }
  out = { iter: old.iter, idsalt: old.idsalt, doc: { iv: b64(iv0), ct: await docCt() }, users: old.users };
  reused = true;
}

// ---------- 4. Enkripsi PDF per bab (pdf-src/NAMA.pdf -> pdf/NAMA.bin: iv 12 byte + AES-GCM, kunci sama) ----------
const pdfSrc = join(root, 'pdf-src'), pdfOut = join(root, 'pdf');
let nPdf = 0, nSkip = 0;
if (existsSync(pdfSrc)) {
  mkdirSync(pdfOut, { recursive: true });
  for (const f of readdirSync(pdfSrc).filter(x => /\.pdf$/i.test(x))) {
    const src = readFileSync(join(pdfSrc, f)), dst = join(pdfOut, f.replace(/\.pdf$/i, '.bin'));
    // lewati bila .bin lama sudah berisi PDF yang sama dengan kunci ini (hindari perubahan biner tak perlu di Git)
    if (existsSync(dst)) {
      const old = readFileSync(dst);
      try { const pl = Buffer.from(await S.decrypt({ name: 'AES-GCM', iv: old.subarray(0, 12) }, docKey, old.subarray(12))); if (pl.equals(src)) { nSkip++; continue; } } catch {}
    }
    const iv = randomBytes(12);
    const c = Buffer.from(await S.encrypt({ name: 'AES-GCM', iv }, docKey, src));
    writeFileSync(dst, Buffer.concat([iv, c]));
    nPdf++;
  }
}

writeFileSync(vaultFile, '/* DATA TERENKRIPSI - dihasilkan otomatis oleh build.mjs. Jangan diedit manual. */\nwindow.VAULT=' + JSON.stringify(out) + ';\n');

// ---------- 5. Stempel versi (anti-cache basi) ke index.html dan sw.js ----------
const ver = sha(readFileSync(vaultFile));
const stamp = (file, fn) => { const p = join(root, file); if (!existsSync(p)) return; const a = readFileSync(p, 'utf8'), b = fn(a); if (a !== b) writeFileSync(p, b); };
stamp('index.html', s => s
  .replace(/vault\.js(\?v=[\w-]*)?/g, 'vault.js?v=' + ver)
  .replace(/login\.css(\?v=[\w-]*)?/g, 'login.css?v=' + sha(readFileSync(join(root, 'login.css'))))
  .replace(/auth\.js(\?v=[\w-]*)?/g, 'auth.js?v=' + sha(readFileSync(join(root, 'auth.js'))))
  .replace(/pwa\.js(\?v=[\w-]*)?/g, 'pwa.js?v=' + sha(readFileSync(join(root, 'pwa.js')))));
stamp('sw.js', s => s.replace(/const VER='[^']*'/, `const VER='${ver}'`).replace(/vault\.js\?v=[\w-]*/g, 'vault.js?v=' + ver));

console.log(`OK: ${out.users.length} pengguna${reused ? ' (dipakai ulang dari vault.js lama)' : ''}, ${nPdf} PDF dienkripsi (${nSkip} tidak berubah, dilewati), versi ${ver} -> vault.js`);
if (!nPdf && !nSkip) console.log('Catatan: tidak ada pdf-src/, file .bin lama dibiarkan (tetap valid selama kunci dokumen sama).');
