/* Logika login (tanpa foto/selfie), HUD, dan dekripsi dokumen. Data enkripsi ada di vault.js */
(function(){
const C=window.VAULT;
const b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),$=id=>document.getElementById(id),SB=crypto.subtle,E=new TextEncoder();
const hex=a=>[...new Uint8Array(a)].map(x=>x.toString(16).padStart(2,'0')).join('');
(function(){var P=Storage.prototype,ri=P.removeItem,cl=P.clear;function out(){try{ri.call(localStorage,'sun_keep')}catch(e){}try{navigator.credentials&&navigator.credentials.preventSilentAccess()}catch(e){}}
P.removeItem=function(k){if(k==='sun_sess')out();return ri.apply(this,arguments)};
P.clear=function(){out();return cl.apply(this,arguments)}})();
try{localStorage.removeItem('sun_selfie')}catch(e){}
const LS={g(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
async function enter(P,keep){
  const key=await SB.importKey('raw',b(P.k),'AES-GCM',false,['decrypt']);
  const pl=await SB.decrypt({name:'AES-GCM',iv:b(C.doc.iv)},key,b(C.doc.ct));
  const html=await new Response(new Blob([pl]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  try{sessionStorage.setItem('sun_sess',JSON.stringify({p:P,e:Date.now()+288e5}))}catch(e){}
  if(keep)LS.s('sun_keep',{p:P});window.__U={n:P.n,r:P.r,d:P.d,k:P.k};document.open();document.write(html);document.close();
}
const shake=()=>{const x=$('box');x.classList.remove('shake');void x.offsetWidth;x.classList.add('shake')};
async function go(){
  const msg=$('msg'),btn=$('go'),u=$('u').value.trim(),p=$('p').value;msg.className='';msg.textContent='';
  if(!(window.crypto&&crypto.subtle&&window.DecompressionStream)){msg.textContent='Browser tidak mendukung. Gunakan browser terbaru lewat HTTPS.';return}
  const L=LS.g('sun_lock')||{n:0,u:0};
  if(Date.now()<L.u){msg.textContent='Terlalu banyak percobaan. Coba lagi dalam '+Math.ceil((L.u-Date.now())/1000)+' detik.';return}
  if(!u||!p){msg.textContent='Isi username dan password.';return}
  btn.disabled=true;btn.classList.add('ld');btn.firstElementChild.textContent='Memverifikasi...';msg.className='ok';msg.textContent='> menurunkan kunci (PBKDF2)...';
  try{
    const id=hex(await SB.digest('SHA-256',E.encode(C.idsalt+u))).slice(0,16),ent=C.users.find(x=>x.id===id);let P=null;
    if(ent){try{
      const km=await SB.importKey('raw',E.encode(u+'\u0000'+p),'PBKDF2',false,['deriveKey']);
      const kek=await SB.deriveKey({name:'PBKDF2',salt:b(ent.s),iterations:C.iter,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
      P=JSON.parse(new TextDecoder().decode(await SB.decrypt({name:'AES-GCM',iv:b(ent.iv)},kek,b(ent.w))));
    }catch(e){}}
    if(!P){L.n++;if(L.n>=5)L.u=Date.now()+Math.min(9e5,3e4*2**(L.n-5));LS.s('sun_lock',L);
      msg.className='';msg.textContent='! Username atau password salah.'+(L.n<5?' Sisa percobaan: '+(5-L.n)+'.':' Akses dikunci sementara.');shake();return}
    LS.s('sun_lock',null);const kp=$('keep').checked;
    if(kp){LS.s('sun_lastu',u);try{if(window.PasswordCredential)navigator.credentials.store(new PasswordCredential({id:u,password:p,name:P.n||u})).catch(()=>{})}catch(e){}}else{try{localStorage.removeItem('sun_keep')}catch(e){}}
    msg.textContent='> akses diberikan, mendekripsi dokumen...';$('box').classList.add('granted');await enter(P,kp);
  }catch(e){msg.textContent='Terjadi kesalahan: '+e.message}
  finally{btn.disabled=false;btn.classList.remove('ld');btn.firstElementChild.textContent='Masuk'}
}
$('f').addEventListener('submit',e=>{e.preventDefault();go()});
const EYE='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',OFF='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 4.1-5M9.9 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2M1 1l22 22"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/></svg>';$('eye').addEventListener('click',()=>{const t=$('p').type==='password';$('p').type=t?'text':'password';$('eye').innerHTML=t?OFF:EYE;$('eye').setAttribute('aria-label',t?'Sembunyikan password':'Lihat password')});
(function(){const box=$('box');
try{const lu=LS.g('sun_lastu');if(lu)$('u').value=lu}catch(e){}
let S=LS.g('sun_keep'),kept=!!S;
if(!S){try{S=JSON.parse(sessionStorage.getItem('sun_sess'));if(!(S&&S.e>Date.now()))S=null}catch(e){S=null}}
if(S&&S.p){document.body.classList.add('auto');enter(S.p,kept).catch(()=>{try{localStorage.removeItem('sun_keep')}catch(e){}document.body.classList.remove('auto')})}
if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){addEventListener('pointermove',e=>{const r=box.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;box.style.setProperty('--ry',(x*4).toFixed(2)+'deg');box.style.setProperty('--rx',(-y*4).toFixed(2)+'deg')})}
})();
(function(){
const clk=$('clk'),boot=$('boot'),rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const pad=n=>String(n).padStart(2,'0');
const tick=()=>{if(!clk)return;const d=new Date();clk.textContent=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds())};tick();setInterval(tick,1000);
$('p').addEventListener('keyup',e=>{const c=$('caps');if(c&&e.getModifierState)c.hidden=!e.getModifierState('CapsLock')});
if(boot){const L=['inisialisasi modul keamanan','kanal terenkripsi AES-256-GCM aktif','menunggu kredensial'];
  if(rm){boot.textContent=L.map(x=>'> '+x).join('\n')}
  else{let i=0,c=0;const t=setInterval(()=>{if(i>=L.length){clearInterval(t);return}c++;boot.textContent=L.slice(0,i).map(x=>'> '+x+' [OK]').join('\n')+(i?'\n':'')+'> '+L[i].slice(0,c)+'_';if(c>=L[i].length){i++;c=0}if(i>=L.length)boot.textContent=L.map((x,k)=>'> '+x+(k<L.length-1?' [OK]':'')).join('\n')},28)}}
})();
(function(){const cv=$('cv');if(!cv||!cv.getContext)return;
const x=cv.getContext('2d'),rm=matchMedia('(prefers-reduced-motion:reduce)').matches;let W=0,H=0,R=[],raf=0,seed=7;
const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
function build(){seed=7;R=[];const n=W<700?6:10;
  for(let i=0;i<n;i++){const seg=5+Math.floor(rnd()*4),pts=[];let cy=H*(.08+.84*rnd());const vert=rnd()<.3;
    for(let k=0;k<=seg;k++){const t=k/seg;pts.push(vert?[W*(.05+.9*rnd()*.2+i/n*.8),-40+(H+80)*t]:[-40+(W+80)*t,cy]);if(!vert){cy+=(rnd()-.5)*H*.3;cy=Math.max(24,Math.min(H-24,cy))}}
    let L=0;const cum=[0];for(let k=1;k<pts.length;k++){L+=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]);cum.push(L)}
    R.push({pts,cum,L,sp:40+rnd()*50,off:rnd()*L,sta:Math.floor(rnd()*pts.length)})}}
function at(r,d){d=((d%r.L)+r.L)%r.L;let k=1;while(k<r.cum.length-1&&r.cum[k]<d)k++;const a=r.pts[k-1],b=r.pts[k],t=(d-r.cum[k-1])/((r.cum[k]-r.cum[k-1])||1);return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]}
function size(){const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;x.setTransform(d,0,0,d,0,0);build();draw(0)}
function draw(t){x.clearRect(0,0,W,H);x.lineJoin='round';x.lineCap='round';
  for(const r of R){x.beginPath();r.pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.strokeStyle='#3be6ff22';x.lineWidth=2;x.stroke();x.strokeStyle='#3be6ff14';x.lineWidth=7;x.stroke();
    r.pts.forEach((p,i)=>{if(i&&i<r.pts.length-1){x.fillStyle='#3be6ff55';x.fillRect(p[0]-2,p[1]-2,4,4)}});
    const sp=r.pts[r.sta];x.font='500 10px "JetBrains Mono",monospace';x.fillStyle='#7fa3b355';x.fillText('STA '+(r.sta*3+Math.floor(r.L/100)%9)+'+'+String(Math.floor(r.L)%1000).padStart(3,'0'),sp[0]+8,sp[1]-8);
    if(!rm){const d=r.off+t*r.sp/1000;for(let j=0;j<16;j++){const p=at(r,d-j*5);x.fillStyle='rgba(59,230,255,'+(.8*(1-j/16)).toFixed(3)+')';x.beginPath();x.arc(p[0],p[1],2.6-j*.12,0,6.3);x.fill()}
      const h=at(r,d);x.fillStyle='#fff';x.shadowColor='#3be6ff';x.shadowBlur=14;x.beginPath();x.arc(h[0],h[1],2.6,0,6.3);x.fill();x.shadowBlur=0}}}
function loop(t){draw(t);raf=requestAnimationFrame(loop)}
addEventListener('resize',()=>{size()});size();
if(!rm){raf=requestAnimationFrame(loop);document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);if(!document.hidden)raf=requestAnimationFrame(loop)})}
})();
})();
