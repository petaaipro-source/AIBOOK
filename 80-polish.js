/* Penyempurnaan lintas-panel: Escape menutup panel, peran/label aksesibilitas, indikator offline */
(function(){
const PANELS=[['ai','Asisten Dokumen'],['pk','Video & Pedoman'],['dp','Unduh PDF'],['np','Catatan']];
const lbl=()=>PANELS.forEach(([id,n])=>{const e=document.getElementById(id);if(e&&!e.getAttribute('role')){e.setAttribute('role','dialog');e.setAttribute('aria-label',n)}});
lbl();new MutationObserver(lbl).observe(document.body,{childList:true});
const open=e=>e&&e.isConnected&&getComputedStyle(e).display!=='none';
addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  for(const [id] of PANELS){const el=document.getElementById(id);if(!open(el))continue;
    if(id==='np'){const b=[...document.querySelectorAll('.fab button')].find(x=>/Catatan/.test(x.textContent));if(b)b.click()}
    else{const x=el.querySelector('#aix,.x');if(x)x.click()}
    e.stopPropagation();return}
});
// tombol melayang: label aksesibel (ikon emoji dibaca sebagai teks oleh pembaca layar)
document.querySelectorAll('.fab button').forEach(b=>{if(!b.getAttribute('aria-label')){const s=b.querySelector('span');if(s)b.setAttribute('aria-label',s.textContent.trim())}});
// indikator offline
let tn=null;const toast=(t,ms)=>{if(!tn){tn=document.createElement('div');tn.setAttribute('role','status');tn.setAttribute('aria-live','polite');
  tn.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:calc(70px + env(safe-area-inset-top,0px));z-index:100001;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:8px 14px;font:13px system-ui,sans-serif;box-shadow:0 4px 18px #0004;max-width:calc(100% - 28px);text-align:center';document.body.appendChild(tn)}
  tn.textContent=t;tn.hidden=!t;if(ms)setTimeout(()=>{if(tn.textContent===t)tn.hidden=true},ms)};
addEventListener('offline',()=>toast('Anda sedang offline. Dokumen tetap bisa dibaca; unduh PDF dan video butuh internet.',6000));
addEventListener('online',()=>toast('Kembali online.',2500));
})();
