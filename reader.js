/* Pembaca dokumen: muat data, menu, navigasi, pencarian kata, penanda */
const $=id=>document.getElementById(id);
const m=$('m'),q=$('q'),bk=$('bk'),ti=$('ti'),hb=$('hb'),st=$('st'),dr=$('dr'),nv=$('nv');
let IM=JSON.parse(document.getElementById('im').textContent),D,P,S,keys,fz=16,HL='',cur={k:'home'},stack=[],curSec=null,PM={},SM={};
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const bms=()=>LS.get('sun_bm',[]);
async function load(){
  const b=Uint8Array.from(atob(Z),c=>c.charCodeAt(0));
  const s=new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate'));
  const j=JSON.parse(await new Response(s).text());D=j.D;P=j.P;keys=Object.keys(P).map(Number).sort((a,b)=>a-b);S={};
  for(const p of keys){S[p]=P[p].map(b=>b[b.length-1]).join('\n');for(const b of P[p])if(b[0]==='h'){const mm=b[1].match(/^(\d+(?:\.\d+)+)\s/);if(mm&&!(mm[1] in PM))PM[mm[1]]=p}}
  for(const v of D)for(const s of v.secs)SM[s.k]=s.p;
  setFz(LS.get('sun_fz',16));buildMenu();setTheme(LS.get('sun_theme','auto'));render(cur);
}
function resolve(ref){if(PM[ref])return PM[ref];if(SM[ref])return SM[ref];const a=ref.split('.');while(a.length>2){a.pop();const r=a.join('.');if(PM[r])return PM[r];if(SM[r])return SM[r]}return SM[a.join('.')]||null}
function lk(h){h=h.replace(/§(\d{1,4})§/g,(a,n)=>P[n]?`<a href="#" class="x" data-pg="${n}">${n}</a>`:n);return h.replace(/\b((?:[Ss]eksi|[Pp]asal)\s+)(\d{1,2}(?:\.\d{1,2})+)/g,(a,pre,ref)=>resolve(ref)?`${pre}<a href="#" class="x" data-ref="${ref}">${ref}</a>`:a)}
function hx(t){if(!HL)return lk(esc(t));const re=new RegExp('('+HL.split(/\s+/).map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\\s+')+')','gi');return t.split(re).map((s,i)=>i%2?'<mark><b>'+esc(s)+'</b></mark>':lk(esc(s))).join('')}
function fig(id){const f=IM[id];if(!f)return'';return `<figure class="fg"><img data-fig="${id}" loading="lazy" decoding="async" width="${f[1]}" height="${f[2]}" alt="${esc(f[3]||'Gambar')}" src="${f[0]}"><figcaption>${esc(f[3]||'')} &middot; ketuk untuk memperbesar</figcaption></figure>`}
function rb(a){return a.map(b=>b[0]==='i'?fig(b[1]):b[0]==='h'?`<div class="h">${hx(b[1])}</div>`:b[0]==='t'?`<pre class="tb">${hx(b[1])}</pre>`:`<div class="b" style="padding-left:${b[1]*14}px">${hx(b[2])}</div>`).join('')}
function secOf(p){for(const v of D)for(const s of v.secs)if(p>=s.p&&p<=s.e)return[v,s];return[null,null]}
const KK=k=>k==='Lamp.'?'Lampiran':k==='L.Pel'?'Lampiran Pelengkap':/^L\.\d/.test(k)?'Lampiran '+k.slice(2):k==='Pbk'?'Pembuka':/^R\.\d/.test(k)?'Indeks '+k:'Seksi '+k;
const label=(v,s)=>KK(s.k)+' - '+s.t;
function go(s){cur.y=scrollY;stack.push(cur);cur=s;render(s)}
function back(){const s=stack.pop();if(!s){cur={k:'home'};render(cur);return}cur=s;render(s);if(s.y!=null)setTimeout(()=>scrollTo(0,s.y),0)}
function render(s){
  bk.hidden=s.k==='home';st.hidden=s.k!=='read';
  if(s.k==='home'){HL='';q.value='';home()}
  else if(s.k==='search'){q.value=s.q;search(s.q)}
  else{HL=s.hl||'';q.value=s.qv||'';open_(s.p,s.t)}
}
function home(){
  ti.textContent='Spesifikasi Umum 2025';curSec=null;let h='';
  const l=LS.get('sun_last',null);
  if(l&&P[l.p]){const [v,s]=secOf(l.p);if(s)h+=`<div class="r" data-p="${l.p}"><b>Lanjutkan membaca</b><br>${esc(label(v,s))}${l.p>=2000?'':' - hlm. '+l.p}</div>`}
  const b=bms().filter(x=>P[x.p]);
  if(b.length){h+='<p class="pg">Penanda</p>';for(const x of b)h+=`<div class="r" data-p="${x.p}">&#9733; ${esc(KK(x.k))} - ${esc(x.t)}</div>`}
  if(h)h+='<p class="pg">Semua divisi</p>';
  for(const v of D){
    h+=`<details><summary><span class="no">${v.n}</span><span class="nm">${esc(v.name)}<small>${v.secs.length} ${v.n==='L'?'lampiran':'seksi'}${v.n==='R'?' - tambahan':' - hlm. '+v.a+'-'+v.b}</small></span></summary>`;
    for(const s of v.secs)h+=`<div class="s" data-p="${s.p}"><span class="k${v.n==='L'?' kl':''}">${s.k}</span><span class="t">${esc(s.t)}<span class="pg">${v.n==='R'?'indeks tambahan':'hlm. '+s.p+'-'+s.e}</span></span></div>`;
    h+='</details>';
  }
  m.innerHTML=h;scrollTo(0,0);
}
function updStar(){const on=!!curSec&&bms().some(b=>b.p===curSec.p);st.textContent=on?'\u2605':'\u2606';st.setAttribute('aria-pressed',on);st.setAttribute('aria-label',on?'Hapus penanda':'Tandai seksi ini')}
function renderBm(){const b=bms().filter(x=>P&&P[x.p]);$('bml').innerHTML=b.length?b.map(x=>`<button class="mi" data-m="${x.p}">&#9733; ${esc(KK(x.k))} - ${esc(x.t)}</button>`).join(''):'<p class="pg">Belum ada penanda. Ketuk &#9734; di atas saat membaca.</p>'}
st.onclick=()=>{if(!curSec)return;const b=bms(),i=b.findIndex(x=>x.p===curSec.p);i>=0?b.splice(i,1):b.push({p:curSec.p,k:curSec.k,t:curSec.t});LS.set('sun_bm',b);updStar();renderBm()};
function open_(p,target){
  const [v,s]=secOf(p);if(!s){home();return}curSec=s;
  ti.textContent=(v.n==='P'?'':v.n==='L'?KK(s.k)+' - ':v.n==='R'?'Indeks '+s.k+' - ':'Seksi '+s.k+' - ')+s.t;
  let h='';for(let i=s.p;i<=s.e;i++)if(P[i])h+=`<div class="pgh" id="p${i}">${i>=2000?'Indeks - bagian '+(i-2000):'Halaman '+i}</div><div class="txt">${rb(P[i])}</div>`;
  m.innerHTML=h;m.querySelectorAll('.txt').forEach(e=>e.style.fontSize=fz+'px');updStar();
  const t=target||p;LS.set('sun_last',{p:t});
  const el=$('p'+t),mk=el&&el.nextElementSibling&&el.nextElementSibling.querySelector('mark');
  if(mk)mk.scrollIntoView({block:'center'});else if(el)el.scrollIntoView();else scrollTo(0,0);
}
function search(t){
  const w=t.toLowerCase();let res=[],tot=0;ti.textContent='Hasil pencarian';curSec=null;
  for(const p of keys){const x=S[p],i=x.toLowerCase().indexOf(w);if(i<0)continue;tot++;
    if(res.length<50){const a=Math.max(0,i-70),sn=x.slice(a,i+w.length+110);res.push([p,esc(sn.slice(0,i-a))+'<mark><b>'+esc(sn.slice(i-a,i-a+w.length))+'</b></mark>'+esc(sn.slice(i-a+w.length))])}}
  let h=`<p class="pg">${tot} halaman cocok${tot>50?' (50 pertama)':''}</p>`;
  for(const [p,sn] of res){const [v,s]=secOf(p);h+=`<div class="r" data-p="${p}"><b>${s?KK(s.k):''}</b>${p>=2000?'':' - hlm. '+p}<br>${sn}</div>`}
  m.innerHTML=tot?h:'<p class="empty">Tidak ada yang cocok. Coba kata kunci lain.</p>';scrollTo(0,0);
}
function menu(o){dr.hidden=!o;hb.setAttribute('aria-expanded',o)}
function setFz(n){fz=Math.max(14,Math.min(26,n));LS.set('sun_fz',fz);document.querySelectorAll('.txt').forEach(e=>e.style.fontSize=fz+'px');const f=$('fzv');if(f)f.textContent=fz}
function setTheme(t){const r=document.documentElement;t==='auto'?r.removeAttribute('data-theme'):r.setAttribute('data-theme',t);LS.set('sun_theme',t);nv.querySelectorAll('[data-th]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.th===t))}
function buildMenu(){
  let h='<h2>Navigasi</h2><button class="mi" id="mh">Beranda (semua divisi)</button><h2>Penanda</h2><div id="bml"></div><h2>Ukuran huruf</h2><div class="seg"><button id="fm" aria-label="Kecilkan">A-</button><button disabled id="fzv">'+fz+'</button><button id="fp" aria-label="Besarkan">A+</button></div><h2>Tema</h2><div class="seg"><button data-th="auto">Otomatis</button><button data-th="light">Terang</button><button data-th="dark">Gelap</button></div><h2>Lompat ke seksi</h2>';
  for(const v of D){h+=`<details><summary><span class="no">${v.n}</span><span class="nm">${esc(v.name)}</span></summary>`;
    for(const s of v.secs)h+=`<div class="s" data-m="${s.p}"><span class="k${v.n==='L'?' kl':''}">${s.k}</span><span class="t">${esc(s.t)}</span></div>`;h+='</details>'}
  nv.innerHTML=h;renderBm();
  $('mh').onclick=()=>{menu(false);stack=[];cur={k:'home'};render(cur)};
  $('fm').onclick=()=>setFz(fz-2);$('fp').onclick=()=>setFz(fz+2);
  nv.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>setTheme(b.dataset.th));
  nv.addEventListener('click',e=>{const t=e.target.closest('[data-m]');if(t){menu(false);const p=+t.dataset.m;go({k:'read',p,t:p})}});
}
m.addEventListener('click',e=>{
  const a=e.target.closest('a.x');
  if(a){e.preventDefault();const p=a.dataset.pg?+a.dataset.pg:resolve(a.dataset.ref);if(p)go({k:'read',p,t:p});return}
  const t=e.target.closest('[data-p]');if(!t)return;const p=+t.dataset.p;
  const fromS=cur.k==='search'&&t.classList.contains('r');
  go({k:'read',p,t:p,hl:fromS?q.value.trim().replace(/\s+/g,' '):'',qv:fromS?q.value:''});
});
bk.onclick=back;hb.onclick=()=>menu(dr.hidden);$('ov').onclick=()=>menu(false);
addEventListener('keydown',e=>{if(e.key==='Escape')menu(false)});
$('fs').onclick=()=>setFz(fz>=26?14:fz+2);
let tm;q.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(()=>{const t=q.value.trim();
  if(t.length>=3){if(cur.k==='search'){cur={k:'search',q:t};search(t)}else go({k:'search',q:t})}
  else if(t.length===0&&cur.k==='search'){stack=[];cur={k:'home'};render(cur)}},250)});
let stt;addEventListener('scroll',()=>{if(cur.k!=='read')return;clearTimeout(stt);stt=setTimeout(()=>{let pg=null;for(const e of m.querySelectorAll('.pgh')){if(e.getBoundingClientRect().top<=140)pg=+e.id.slice(1);else break}if(pg)LS.set('sun_last',{p:pg})},400)},{passive:true});
const lb=$('lb'),lbi=$('lbi');
function lbOpen(src){lbi.src=src;lb.hidden=false;lb.scrollTop=0;lb.scrollLeft=0}
function lbClose(){lb.hidden=true;lbi.removeAttribute('src')}
m.addEventListener('click',e=>{const im=e.target.closest('img[data-fig]');if(im)lbOpen(im.src)});
$('lbx').onclick=lbClose;lb.addEventListener('click',e=>{if(e.target===lb)lbClose()});
addEventListener('keydown',e=>{if(e.key==='Escape')lbClose()});
load().catch(()=>{m.innerHTML='<p class="empty">Browser ini tidak mendukung dekompresi. Perbarui browser Anda.</p>'});
