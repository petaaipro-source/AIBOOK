// Bangun js/vault.js: inline src/app (html+css+js terpisah) -> gzip -> enkripsi AES-GCM, kunci dibungkus per user.
// Pakai: node tools/build.mjs   (butuh tools/users.json, lihat users.example.json)
import { webcrypto as W, randomBytes } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..'), S = W.subtle, ITER = 600000;
const b64 = u => Buffer.from(u).toString('base64'), hex = u => Buffer.from(u).toString('hex');
const enc = new TextEncoder();

// 1. Gabungkan aplikasi: <link rel=stylesheet href> dan <script src> lokal di-inline
const appDir = join(root, 'src/app');
let html = readFileSync(join(appDir, 'index.html'), 'utf8');
const rd = f => readFileSync(join(appDir, f), 'utf8');
const ATTR = a => a.replace(/\s*\b(src|data-iife)(=["'][^"']*["'])?/g, '');
const body = f => rd(f).replace(/<\/script/gi, '<\\/script');
html = html
  .replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["'](?!https?:)([^"']+)["'][^>]*>/g, (_, f) => `<style>${rd(f)}</style>`)
  // <script data-iife src=...> berurutan digabung dalam SATU IIFE (berbagi scope)
  .replace(/(?:<script\s+data-iife\s+src=["'][^"']+["']><\/script>\s*)+/g, g => `<script>(function(){\n${[...g.matchAll(/src=["']([^"']+)["']/g)].map(m => body(m[1])).join('\n')}\n})();</script>\n`)
  .replace(/<script([^>]*)\bsrc=["'](?!https?:)([^"']+)["']([^>]*)><\/script>/g, (_, a1, f, a2) => `<script${ATTR(a1 + a2)}>${body(f)}</script>`);

// 2. Enkripsi dokumen dengan kunci acak
const users = JSON.parse(readFileSync(join(root, 'tools/users.json'), 'utf8'));
const rawKey = randomBytes(32), k = b64(rawKey);
const docKey = await S.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
const docIv = randomBytes(12);
const ct = await S.encrypt({ name: 'AES-GCM', iv: docIv }, docKey, gzipSync(Buffer.from(html)));

// 3. Bungkus kunci untuk tiap user (PBKDF2 dari "username\0password")
const idsalt = hex(randomBytes(8));
const out = { iter: ITER, idsalt, doc: { iv: b64(docIv), ct: b64(ct) }, users: [] };
for (const u of users) {
  const id = hex(await S.digest('SHA-256', enc.encode(idsalt + u.username))).slice(0, 16);
  const salt = randomBytes(16), iv = randomBytes(12);
  const km = await S.importKey('raw', enc.encode(u.username + '\u0000' + u.password), 'PBKDF2', false, ['deriveKey']);
  const kek = await S.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const w = await S.encrypt({ name: 'AES-GCM', iv }, kek, enc.encode(JSON.stringify({ k, n: u.name || u.username, r: u.role || 'user' })));
  out.users.push({ id, s: b64(salt), iv: b64(iv), w: b64(w) });
}
writeFileSync(join(root, 'js/vault.js'), '/* DATA TERENKRIPSI - dihasilkan otomatis oleh tools/build.mjs. Jangan diedit manual. */\nwindow.VAULT=' + JSON.stringify(out) + ';\n');
console.log(`OK: ${users.length} user, dokumen ${(html.length / 1024).toFixed(0)} KB -> js/vault.js`);
