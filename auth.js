/* Logika login, selfie, dan dekripsi dokumen. Data ada di js/vault.js */
(function(){
const C=window.VAULT;
const b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),$=id=>document.getElementById(id),SB=crypto.subtle,E=new TextEncoder();
const hex=a=>[...new Uint8Array(a)].map(x=>x.toString(16).padStart(2,'0')).join('');
(function(){var P=Storage.prototype,ri=P.removeItem,cl=P.clear;function out(){try{ri.call(localStorage,'sun_keep')}catch(e){}try{navigator.credentials&&navigator.credentials.preventSilentAccess()}catch(e){}}
P.removeItem=function(k){if(k==='sun_sess')out();return ri.apply(this,arguments)};
P.clear=function(){out();return cl.apply(this,arguments)}})();
const LS={g(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
async function enter(P,keep){
  const key=await SB.importKey('raw',b(P.k),'AES-GCM',false,['decrypt']);
  const pl=await SB.decrypt({name:'AES-GCM',iv:b(C.doc.iv)},key,b(C.doc.ct));
  const html=await new Response(new Blob([pl]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  try{sessionStorage.setItem('sun_sess',JSON.stringify({p:P,e:Date.now()+288e5}))}catch(e){}
  if(keep)LS.s('sun_keep',{p:P});window.__U={n:P.n,r:P.r,selfie:(LS.g('sun_selfie')||{}).img||null};document.open();document.write(html);document.close();
}
const shake=()=>{const x=$('box');x.classList.remove('shake');void x.offsetWidth;x.classList.add('shake')};
async function go(){
  const msg=$('msg'),btn=$('go'),u=$('u').value,p=$('p').value;msg.textContent='';
  if(!(window.crypto&&crypto.subtle&&window.DecompressionStream)){msg.textContent='Browser tidak mendukung. Gunakan browser terbaru lewat HTTPS.';return}
  const L=LS.g('sun_lock')||{n:0,u:0};
  if(Date.now()<L.u){msg.textContent='Terlalu banyak percobaan. Coba lagi dalam '+Math.ceil((L.u-Date.now())/1000)+' detik.';return}
  if(!u||!p){msg.textContent='Isi username dan password.';return}
  if(!SELFIE){msg.textContent='Ambil selfie dulu buat verifikasi.';$('cam').classList.remove('need');void $('cam').offsetWidth;$('cam').classList.add('need');$('sf').classList.add('need');shake();return}
  btn.disabled=true;btn.classList.add('ld');btn.textContent='Memeriksa...';
  try{
    const id=hex(await SB.digest('SHA-256',E.encode(C.idsalt+u))).slice(0,16),ent=C.users.find(x=>x.id===id);let P=null;
    if(ent){try{
      const km=await SB.importKey('raw',E.encode(u+'\u0000'+p),'PBKDF2',false,['deriveKey']);
      const kek=await SB.deriveKey({name:'PBKDF2',salt:b(ent.s),iterations:C.iter,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
      P=JSON.parse(new TextDecoder().decode(await SB.decrypt({name:'AES-GCM',iv:b(ent.iv)},kek,b(ent.w))));
    }catch(e){}}
    if(!P){L.n++;if(L.n>=5)L.u=Date.now()+Math.min(9e5,3e4*2**(L.n-5));LS.s('sun_lock',L);
      msg.textContent='Username atau password salah.'+(L.n<5?' Sisa percobaan: '+(5-L.n)+'.':' Akses dikunci sementara.');shake();return}
    LS.s('sun_lock',null);LS.s('sun_selfie',{img:SELFIE,t:Date.now()});const kp=$('keep').checked;
    if(kp){LS.s('sun_lastu',u);try{if(window.PasswordCredential)navigator.credentials.store(new PasswordCredential({id:u,password:p,name:P.n||u})).catch(()=>{})}catch(e){}}else{try{localStorage.removeItem('sun_keep')}catch(e){}}
    await enter(P,kp);
  }catch(e){msg.textContent='Terjadi kesalahan: '+e.message}
  finally{btn.disabled=false;btn.classList.remove('ld');btn.textContent='Masuk'}
}
let SELFIE=null;
(function(){const cs=$('cs'),vid=$('vid'),cv=document.createElement('canvas');let st=null;
const stop=()=>{if(st){st.getTracks().forEach(t=>t.stop());st=null}vid.srcObject=null};
const shut=()=>{stop();cs.classList.remove('open')};
function put(url){SELFIE=url;$('pv').src=url;$('pv').hidden=false;$('ph').hidden=true;const c=$('cam');c.classList.remove('need');c.classList.add('ok');$('sf').classList.remove('need');$('sT').textContent='Selfie sip!';$('sH').textContent='Ketuk foto buat ganti.';$('msg').textContent=''}
function crop(src,w,h,mir){cv.width=cv.height=320;const c=cv.getContext('2d'),m=Math.min(w,h);if(mir){c.translate(320,0);c.scale(-1,1)}c.drawImage(src,(w-m)/2,(h-m)/2,m,m,0,0,320,320);return cv.toDataURL('image/jpeg',.82)}
async function open(){if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){$('file').click();return}
  $('ce').textContent='';cs.classList.add('open');
  try{st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:720},height:{ideal:720}},audio:false});vid.srcObject=st;await vid.play()}
  catch(e){stop();$('ce').textContent='Kamera nggak bisa dibuka (izin ditolak atau tidak tersedia). Pilih dari galeri aja.'}}
$('cam').addEventListener('click',open);
$('gal').addEventListener('click',()=>$('file').click());
$('cx').addEventListener('click',shut);
addEventListener('keydown',e=>{if(e.key==='Escape')shut()});
cs.addEventListener('click',e=>{if(e.target===cs)shut()});
$('snap').addEventListener('click',()=>{if(!st||!vid.videoWidth){$('ce').textContent='Kamera belum siap. Coba lagi sebentar.';return}
  const f=$('fl');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');put(crop(vid,vid.videoWidth,vid.videoHeight,true));setTimeout(shut,260)});
$('file').addEventListener('change',e=>{const fl=e.target.files&&e.target.files[0];if(!fl)return;
  const u=URL.createObjectURL(fl),im=new Image();
  im.onload=()=>{put(crop(im,im.naturalWidth,im.naturalHeight,false));URL.revokeObjectURL(u);shut()};
  im.onerror=()=>{URL.revokeObjectURL(u);$('ce').textContent='File itu bukan gambar yang bisa dibaca.';cs.classList.add('open')};
  im.src=u;e.target.value=''});
})();
$('f').addEventListener('submit',e=>{e.preventDefault();go()});
const EYE='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',OFF='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 4.1-5M9.9 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2M1 1l22 22"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/></svg>';$('eye').addEventListener('click',()=>{const t=$('p').type==='password';$('p').type=t?'text':'password';$('eye').innerHTML=t?OFF:EYE;$('eye').setAttribute('aria-label',t?'Sembunyikan password':'Lihat password')});
(function(){const box=$('box');
try{const lu=LS.g('sun_lastu');if(lu)$('u').value=lu}catch(e){}
let S=LS.g('sun_keep'),kept=!!S;
if(!S){try{S=JSON.parse(sessionStorage.getItem('sun_sess'));if(!(S&&S.e>Date.now()))S=null}catch(e){S=null}}
if(S&&S.p){document.body.classList.add('auto');try{const sv=LS.g('sun_selfie');if(sv&&sv.img){$('sa').src=sv.img;$('sa').hidden=false}}catch(e){}enter(S.p,kept).catch(()=>{try{localStorage.removeItem('sun_keep')}catch(e){}document.body.classList.remove('auto')})}
if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){addEventListener('pointermove',e=>{const r=box.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;box.style.setProperty('--ry',(x*7).toFixed(2)+'deg');box.style.setProperty('--rx',(-y*7).toFixed(2)+'deg')})}
})();
})();
