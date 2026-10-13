/* Konfigurasi, gaya dasar, tombol melayang (fab) */
const U=window.__U||{n:'?',r:'viewer'},A=U.r==='admin',$=s=>document.querySelector(s);
const st=document.createElement('style');
st.textContent=`:root{--pkbg:#fff;--pkfg:#15261d}@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--pkbg:#17241d;--pkfg:#e6eee9}}:root[data-theme=dark]{--pkbg:#17241d;--pkfg:#e6eee9}
body{animation:fi .5s}@keyframes fi{from{opacity:0}}
.fab{flex-wrap:wrap;justify-content:flex-end;max-width:calc(100% - 28px);position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:99999;display:flex;gap:8px}
.fab button{font:600 13px system-ui,sans-serif;padding:9px 12px;border-radius:999px;border:1px solid #8886;background:var(--pkbg);color:var(--pkfg);cursor:pointer;box-shadow:0 2px 8px #0003}
#np{position:fixed;right:14px;bottom:70px;width:min(340px,calc(100% - 28px));z-index:99999;background:var(--pkbg);color:var(--pkfg);border:1px solid #8886;border-radius:12px;padding:10px;box-shadow:0 6px 24px #0004}
#np textarea{width:100%;height:150px;font:inherit;background:transparent;color:inherit;border:1px solid #8886;border-radius:8px;padding:8px}
#np small{display:block;margin-bottom:6px;opacity:.7}
${A?'':'#m,#m *{user-select:none;-webkit-user-select:none}@media print{body{display:none!important}}'}
@media print{.fab,#np{display:none!important}}`;
document.head.appendChild(st);
const cur=()=>((document.getElementById('ti')||{}).textContent||'Beranda').trim();
const fab=document.createElement('div');fab.className='fab';
const mk=(l,f)=>{const b=document.createElement('button');{const p=l.split(' ');b.innerHTML='<i>'+p[0]+'</i><span>'+p.slice(1).join(' ')+'</span>'}b.onclick=f;fab.appendChild(b);return b};
