/* Tema "HUD Teknik": kaca, cahaya cyan, tipografi tegas. Selaras dengan halaman login. Hanya tampilan, tanpa mengubah logika. */
(()=>{
const css=document.createElement('style');
css.textContent=`
:root{--bg:#eaf2f5;--card:#ffffffd9;--ink:#0b2230;--mut:#5a7381;--acc:#0a8f94;--acc2:#1fb6a6;--line:#0a8f9426;--chip:#0a8f9414;--mk:#ffe14d;--pkbg:#fffffff2;--pkfg:#0b2230;--glow:#0a8f9433;--sh:0 10px 34px #0b223018;--mono:"JetBrains Mono",ui-monospace,Consolas,monospace}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#06161f;--card:#0a2130cc;--ink:#e8f7fb;--mut:#86a8b8;--acc:#3be6ff;--acc2:#19c8b9;--line:#3be6ff2e;--chip:#3be6ff14;--mk:#ffc247;--pkbg:#081e2cf2;--pkfg:#e8f7fb;--glow:#3be6ff40;--sh:0 14px 44px #000a}}
:root[data-theme=dark]{--bg:#06161f;--card:#0a2130cc;--ink:#e8f7fb;--mut:#86a8b8;--acc:#3be6ff;--acc2:#19c8b9;--line:#3be6ff2e;--chip:#3be6ff14;--mk:#ffc247;--pkbg:#081e2cf2;--pkfg:#e8f7fb;--glow:#3be6ff40;--sh:0 14px 44px #000a}
body{font-family:"Space Grotesk","Segoe UI",system-ui,sans-serif;background:radial-gradient(900px 520px at 85% -10%,var(--glow),transparent 60%),radial-gradient(700px 480px at -10% 110%,var(--glow),transparent 60%),var(--bg) fixed;letter-spacing:.005em}
body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(var(--line) 1px,transparent 1.2px);background-size:26px 26px;-webkit-mask-image:radial-gradient(circle at 50% 35%,#000,transparent 75%);mask-image:radial-gradient(circle at 50% 35%,#000,transparent 75%)}
main,header{position:relative;z-index:1}header{position:sticky}
header{background:color-mix(in srgb,var(--bg) 72%,transparent);-webkit-backdrop-filter:blur(18px) saturate(1.4);backdrop-filter:blur(18px) saturate(1.4);border-bottom:1px solid var(--line);padding:14px 18px 12px}
header .row{max-width:1100px;margin:0 auto 10px}
h1{font-size:19px;font-weight:700;letter-spacing:.02em;background:linear-gradient(90deg,var(--ink),var(--acc));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
button{border-radius:12px;border:1px solid var(--line);background:var(--card);transition:transform .15s,box-shadow .2s,border-color .2s,background .2s}
button:hover{border-color:var(--acc);box-shadow:0 0 0 3px var(--glow);transform:translateY(-1px)}button:active{transform:scale(.97)}
#hb,#fs,#st,#bk{width:44px;height:44px;padding:0;display:grid;place-items:center;font-weight:700}#bk{width:auto;padding:0 14px}
#q{max-width:1100px;display:block;margin:0 auto;border-radius:999px;padding:14px 20px;background:var(--card);border:1px solid var(--line);box-shadow:var(--sh);transition:box-shadow .2s,border-color .2s}
#q:focus{outline:none;border-color:var(--acc);box-shadow:0 0 0 4px var(--glow),var(--sh)}
#pb{height:3px;background:linear-gradient(90deg,var(--acc),var(--acc2));box-shadow:0 0 12px var(--acc)}
main{max-width:860px;padding:22px 16px 120px}
details{background:var(--card);border:1px solid var(--line);border-radius:18px;margin-bottom:12px;box-shadow:var(--sh);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);overflow:hidden;position:relative;transition:transform .2s,border-color .2s}
details:hover{border-color:var(--acc);transform:translateY(-2px)}
details::after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:radial-gradient(260px circle at var(--mx,50%) var(--my,0),var(--glow),transparent 70%);opacity:0;transition:opacity .25s}details:hover::after{opacity:1}
summary{padding:16px 18px;gap:14px}
.no{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--acc),var(--acc2));color:#04141c;box-shadow:0 6px 18px var(--glow);font-size:18px}
.nm{font-weight:700;font-size:16.5px}.nm small{margin-top:2px;font-family:var(--mono);font-size:11.5px;letter-spacing:.04em}
summary::after{content:"›";font-size:26px;color:var(--mut);transition:transform .25s}details[open] summary::after{transform:rotate(90deg);color:var(--acc)}
.s{padding:12px 18px;transition:background .15s,padding-left .15s}.s:hover{background:var(--chip);padding-left:22px}.k{font-family:var(--mono);font-size:13px}
.r{border-radius:16px;background:var(--card);border:1px solid var(--line);padding:14px 16px;transition:transform .15s,border-color .15s,box-shadow .15s}.r:hover{transform:translateX(4px);border-color:var(--acc);box-shadow:0 0 0 3px var(--glow)}
mark{background:var(--mk);box-shadow:0 0 10px var(--mk)}
.txt{font-size:17px;line-height:1.75}.pgh{font-family:var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--acc);border-bottom:1px dashed var(--line)}
.h{color:var(--acc)}.tb{border:1px solid var(--line)}
.sn button{border-radius:16px}.sn button:hover{background:var(--chip)}
.fg img{border-radius:12px;box-shadow:var(--sh)}
#nv{background:var(--pkbg);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);box-shadow:var(--sh)}.ov{-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
/* dok tombol bawah */
.fab{left:50%!important;right:auto!important;bottom:calc(14px + env(safe-area-inset-bottom,0px))!important;transform:translateX(-50%);width:auto!important;max-width:calc(100% - 20px)!important;flex-wrap:nowrap!important;gap:4px!important;padding:6px!important;border-radius:22px;background:var(--pkbg)!important;border:1px solid var(--line)!important;box-shadow:0 14px 44px #0007,0 0 0 1px var(--glow)!important;-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);overflow-x:auto;scrollbar-width:none}
.fab::-webkit-scrollbar{display:none}
.fab button{flex:none!important;min-width:64px;flex-direction:column!important;border:0!important;background:transparent!important;box-shadow:none!important;border-radius:16px!important;padding:7px 10px!important;font:600 11px "Space Grotesk",system-ui,sans-serif!important;color:var(--pkfg)!important}
.fab button i{font-size:19px!important;transition:transform .2s}.fab button:hover{background:var(--chip)!important;transform:none}.fab button:hover i{transform:translateY(-3px) scale(1.15)}
@media(max-width:600px){.fab{left:0!important;right:0!important;bottom:0!important;transform:none;max-width:none!important;border-radius:20px 20px 0 0;justify-content:space-around;padding-bottom:calc(6px + env(safe-area-inset-bottom,0px))!important}.fab button{flex:1!important;min-width:0}}
/* panel */
#ai,#pk,#tk,#dp,#np{background:var(--pkbg)!important;border:1px solid var(--line)!important;border-radius:22px!important;box-shadow:0 24px 70px #000a,0 0 0 1px var(--glow)!important;-webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);bottom:96px!important;overflow:hidden;animation:pin .28s cubic-bezier(.2,.9,.3,1.2)}
@keyframes pin{from{opacity:0;transform:translateY(18px) scale(.97)}}
@media(max-width:600px){#ai,#pk,#tk,#dp{bottom:calc(66px + env(safe-area-inset-bottom,0px))!important;border-radius:0!important}}
#ai header,#pk header,#tk header,#dp header{background:linear-gradient(90deg,var(--chip),transparent)!important;border-bottom:1px solid var(--line)!important;font-weight:700;letter-spacing:.03em}
#tk .x:hover,#pk .x:hover,#dp .x:hover{background:var(--chip);box-shadow:none}
#tk nav button{border:1px solid var(--line);background:var(--chip);color:var(--pkfg);transition:all .2s}
#tk nav button:hover{border-color:var(--acc)}
#tk nav button.on{background:linear-gradient(135deg,var(--acc),var(--acc2));color:#04141c;border-color:transparent;font-weight:700;box-shadow:0 6px 18px var(--glow)}
#tkb{scrollbar-color:var(--acc) transparent}
#tkb .tkf label{font-size:12px;color:var(--mut);font-weight:600;letter-spacing:.04em}
#tkb input,#tkb select,#tkb textarea,#ai input,#pk input{background:var(--chip)!important;border:1px solid var(--line)!important;border-radius:12px!important;font-family:var(--mono);transition:border-color .2s,box-shadow .2s}
#tkb input:focus,#tkb select:focus,#tkb textarea:focus,#ai input:focus,#pk input:focus{outline:none;border-color:var(--acc)!important;box-shadow:0 0 0 3px var(--glow)}
#tkb .tkr{border-collapse:separate;border-spacing:0;width:100%;margin-top:8px}
#tkb .tkr td{border:0;border-bottom:1px solid var(--line);padding:11px 8px}
#tkb .tkr td:nth-child(2){text-align:right;font:700 15px var(--mono);color:var(--acc);font-variant-numeric:tabular-nums}
#tkb .tkr td:nth-child(3){color:var(--mut);font-size:12px;width:64px}
#tkb .tkr tr:hover td{background:var(--chip)}
#tkb .tkr th{text-align:left;padding:9px 12px;margin:8px 0;font:700 11.5px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--acc);background:linear-gradient(90deg,var(--chip),transparent);border-left:3px solid var(--acc);border-radius:6px}
#tkb .tkw{border-radius:14px;padding:11px 14px;margin:8px 0;border:1px solid var(--line);background:var(--chip)}
#tkb .tkw.b{border-color:#ff6b8a66;background:#ff6b8a1a}#tkb .tkw.g{border-color:#4dffb866;background:#4dffb81a}
#tkb .tka{display:flex;gap:8px;margin-top:14px}#tkb .tka button{flex:1;padding:12px;font-weight:600}
#tkb svg{border-radius:14px;background:var(--chip);padding:8px;margin-top:6px}
#ai form button{background:linear-gradient(135deg,var(--acc),var(--acc2))!important;color:#04141c!important;font-weight:700;border-radius:12px!important}
#lb{-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
::selection{background:var(--acc);color:#04141c}
*{scrollbar-width:thin;scrollbar-color:var(--acc) transparent}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;
document.head.appendChild(css);
// cahaya mengikuti kursor pada kartu
addEventListener('pointermove',e=>{const d=e.target.closest&&e.target.closest('details');if(!d)return;const r=d.getBoundingClientRect();d.style.setProperty('--mx',(e.clientX-r.left)+'px');d.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
// ringkasan hasil Teknik: angka kunci tampil menonjol sebagai kartu di atas tabel
const tkb=document.getElementById('tkb');
if(tkb)new MutationObserver(()=>{const t=tkb.querySelector('.tkr');if(!t||tkb.querySelector('.kpi'))return;
  const rows=[...t.querySelectorAll('tr')].filter(r=>r.children.length===3).slice(0,3);if(!rows.length)return;
  const k=document.createElement('div');k.className='kpi';k.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:10px 0';
  k.innerHTML=rows.map(r=>`<div style="padding:12px;border-radius:14px;border:1px solid var(--line);background:linear-gradient(160deg,var(--chip),transparent)"><div style="font-size:11px;color:var(--mut);line-height:1.25">${r.children[0].textContent}</div><div style="font:700 20px var(--mono);color:var(--acc);margin-top:4px">${r.children[1].textContent}<small style="font-size:11px;color:var(--mut);margin-left:4px">${r.children[2].textContent}</small></div></div>`).join('');
  t.parentNode.insertBefore(k,t)}).observe(tkb,{childList:true,subtree:true});
})();
