/* Unduh PDF per bab (Pembuka, Divisi 1-10, Lampiran).
   PDF terenkripsi (pdf/<nama>.bin; folder utama juga dicoba), didekripsi di browser dengan kunci dokumen.
   Hanya aktif untuk admin atau user dengan "download": true di users.json.
   Tombol ada di 3 tempat: tombol melayang "Unduh" (panel daftar), kartu divisi, dan atas halaman baca. */
const DLK=U.d&&U.k?U:null,
PDFN={P:'00_Pembuka_dan_Daftar_Isi',1:'Divisi_01_Umum_dan_Penerapan_SMKK',2:'Divisi_02_Drainase',3:'Divisi_03_Pekerjaan_Tanah_dan_Geosintetik',4:'Divisi_04_Pekerjaan_Preventif',5:'Divisi_05_Perkerasan_Berbutir_dan_Beton_Semen',6:'Divisi_06_Perkerasan_Aspal',7:'Divisi_07_Struktur',8:'Divisi_08_Rehabilitasi_Jembatan',9:'Divisi_09_Pekerjaan_Harian_dan_Lain-lain',10:'Divisi_10_Pekerjaan_Pemeliharaan',L:'Lampiran'},
PDFO=['P',1,2,3,4,5,6,7,8,9,10,'L'];
if(DLK){
const dst=document.createElement('style');
dst.textContent=`.dl{flex:none;font:600 12px system-ui,sans-serif;padding:6px 10px;border-radius:999px;border:1px solid var(--acc);background:transparent;color:var(--acc);cursor:pointer;white-space:nowrap}.dl:disabled{opacity:.6;cursor:wait}.dl:hover:not(:disabled){background:var(--chip)}
summary .dl{margin-left:auto}#dlb{display:flex;margin:0 0 10px}#dlb .dl{width:100%;padding:9px}
.dls{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:100000;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:9px 14px;font:13px system-ui,sans-serif;box-shadow:0 4px 18px #0004;max-width:calc(100% - 28px);text-align:center}
#dp{position:fixed;right:14px;bottom:70px;width:min(420px,calc(100% - 28px));max-height:min(74vh,560px);z-index:99999;background:var(--pkbg);color:var(--pkfg);border:1px solid #8886;border-radius:14px;display:none;flex-direction:column;box-shadow:0 8px 30px #0005;font:14px/1.4 system-ui,sans-serif}
#dp header{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid #8884;font-weight:600;position:static;background:none}#dp header span{flex:1}
#dp .x{background:none;border:0;color:inherit;font-size:18px;line-height:1;padding:3px 6px;border-radius:8px;cursor:pointer}#dp .x:hover{background:#8882}
#dp .ls{overflow-y:auto;padding:6px 10px 12px 14px;scrollbar-width:thin}#dp .it{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px dashed #8883}#dp .it:last-child{border-bottom:0}
#dp .it b{flex:none;width:30px;height:30px;border-radius:8px;background:var(--chip);color:var(--acc);display:grid;place-items:center;font-size:13px}#dp .it span{flex:1;min-width:0;overflow-wrap:anywhere}
#dp .nt{padding:0 14px 10px;font-size:12px;opacity:.65}
@media(max-width:560px){#dp{left:8px;right:8px;width:auto;bottom:calc(68px + env(safe-area-inset-bottom,0px))}}
@media print{#dp,.dls{display:none!important}}`;
document.head.appendChild(dst);
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),
nice=n=>PDFN[n].replace(/^Divisi_\d+_/,'').replace(/^00_/,'').replace(/_/g,' '),
title=n=>n==='P'?'Pembuka & Daftar Isi':n==='L'?'Lampiran':'Divisi '+n+' - '+nice(n),
mb=x=>(x/1048576).toFixed(1).replace('.',',')+' MB';
let dk=null,toast=null,busy=false;
const dsay=(t,ms)=>{if(!toast){toast=document.createElement('div');toast.className='dls';toast.setAttribute('role','status');document.body.appendChild(toast)}toast.textContent=t;toast.hidden=!t;if(ms)setTimeout(()=>{if(toast.textContent===t)toast.hidden=true},ms)};
async function getPdf(n){
  if(location.protocol==='file:')throw new Error('buka lewat alamat web (https), bukan langsung dari file');
  let r=null,url='';
  for(const dir of ['pdf/','']){url=dir+PDFN[n]+'.bin';
    try{r=await fetch(url,{cache:'no-cache'})}catch(e){throw new Error('tidak bisa terhubung ke server')}
    if(r.ok)break}
  if(!r.ok)throw new Error('berkas '+PDFN[n]+'.bin tidak ditemukan di server (HTTP '+r.status+'). Unggah ke folder pdf/ di repo')
  const tot=+r.headers.get('content-length')||0;let buf;
  if(r.body&&r.body.getReader){const rd=r.body.getReader(),parts=[];let got=0;
    for(;;){const {done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;dsay('Mengunduh '+mb(got)+(tot?' / '+mb(tot):'')+'...')}
    buf=new Uint8Array(got);let o=0;for(const p of parts){buf.set(p,o);o+=p.length}}
  else buf=new Uint8Array(await r.arrayBuffer());
  if(buf.length<29)throw new Error('berkas rusak atau kosong');
  dsay('Membuka kunci PDF...');
  dk=dk||await crypto.subtle.importKey('raw',b64(U.k),'AES-GCM',false,['decrypt']);
  let pl;try{pl=await crypto.subtle.decrypt({name:'AES-GCM',iv:buf.slice(0,12)},dk,buf.slice(12))}
  catch(e){throw new Error('PDF tidak cocok dengan kunci dokumen. Jalankan build ulang dengan kunci yang sama (lihat README)')}
  if(String.fromCharCode(...new Uint8Array(pl,0,5))!=='%PDF-')throw new Error('hasil dekripsi bukan PDF yang valid');
  return new Blob([pl],{type:'application/pdf'});
}
async function dl(n,btn){
  if(!PDFN[n]||busy)return;busy=true;
  const all=document.querySelectorAll('.dl'),old=btn.textContent;all.forEach(x=>x.disabled=true);btn.textContent='Menyiapkan...';dsay('Menyiapkan '+PDFN[n]+'.pdf...');
  try{const bl=await getPdf(n),u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=PDFN[n]+'.pdf';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),120000);dsay('Selesai: '+PDFN[n]+'.pdf ('+mb(bl.size)+')',4000)}
  catch(e){dsay('Gagal mengunduh: '+e.message,8000)}
  finally{busy=false;all.forEach(x=>x.disabled=false);btn.textContent=old}
}
const mkb=n=>{const b=document.createElement('button');b.type='button';b.className='dl';b.dataset.dl=n;b.textContent='⬇ PDF';b.title='Unduh PDF '+title(n);b.setAttribute('aria-label','Unduh PDF '+title(n));return b};
/* 1) tombol di tiap kartu divisi (beranda & menu samping) */
function decorate(root){if(!root)return;root.querySelectorAll('details > summary').forEach(s=>{if(s.querySelector('.dl'))return;const n=s.querySelector('.no');if(n&&PDFN[n.textContent.trim()])s.appendChild(mkb(n.textContent.trim()))})}
/* 2) tombol di halaman baca: unduh bab dari seksi yang sedang dibuka */
function readerBtn(){const old=document.getElementById('dlb');if(old)old.remove();if(!curSec)return;const [v]=secOf(curSec.p);if(!v||!PDFN[v.n])return;
  const w=document.createElement('div');w.id='dlb';const b=mkb(v.n);b.textContent='⬇ Unduh PDF '+(v.n==='P'?'Pembuka':v.n==='L'?'Lampiran':'Divisi '+v.n);w.appendChild(b);m.prepend(w)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.dl');if(!b)return;e.preventDefault();e.stopPropagation();const n=b.dataset.dl;dl(isNaN(n)?n:+n,b)},true);
const refresh=()=>{try{decorate(m);decorate(nv);if(!m.querySelector('#dlb'))readerBtn()}catch(e){}};
new MutationObserver(refresh).observe(m,{childList:true});
new MutationObserver(()=>{try{decorate(nv)}catch(e){}}).observe(nv,{childList:true});
refresh();
/* 3) tombol melayang + panel daftar semua PDF (selalu tersedia, tidak bergantung susunan halaman) */
const dp=document.createElement('div');dp.id='dp';dp.setAttribute('role','dialog');dp.setAttribute('aria-label','Unduh PDF');
dp.innerHTML='<header><span>⬇ Unduh PDF per bab</span><button class="x" aria-label="Tutup">✕</button></header><div class="ls"></div><div class="nt">PDF dibuka kuncinya di perangkat ini, lalu disimpan ke folder unduhan.</div>';
const ls=dp.querySelector('.ls');
PDFO.forEach(n=>{const r=document.createElement('div');r.className='it';const i=document.createElement('b');i.textContent=n;const s=document.createElement('span');s.textContent=title(n);r.append(i,s,mkb(n));ls.appendChild(r)});
document.body.appendChild(dp);
const closeDp=()=>{dp.style.display='none'};
dp.querySelector('.x').onclick=closeDp;
mk('⬇ Unduh',()=>{if(dp.style.display==='flex'){closeDp();return}
  for(const id of ['ai','pk','np']){const x=document.getElementById(id);if(x)x.style.display=id==='np'?'none':'none'}
  dp.style.display='flex'});
}
