/* Proteksi salin/cetak (non-admin), blur saat tab disembunyikan, auto-logout */
// proteksi
if(!A){
  ['contextmenu','copy','cut','dragstart'].forEach(e=>document.addEventListener(e,ev=>{if(!(ev.target.matches&&ev.target.matches('input,textarea')))ev.preventDefault()}));
  addEventListener('keydown',e=>{const k=e.key.toLowerCase(),f=e.target.matches&&e.target.matches('input,textarea');
    if((e.ctrlKey||e.metaKey)&&(['p','s','u'].includes(k)||(!f&&['c','a','x'].includes(k))))e.preventDefault()});
}
document.addEventListener('visibilitychange',()=>{document.body.style.filter=document.hidden?'blur(14px)':''});
// keluar + auto-logout
function out(){try{sessionStorage.removeItem('sun_sess')}catch(e){}location.reload()}
let idle;const rs=()=>{clearTimeout(idle);idle=setTimeout(out,10*60*1000)};
['pointerdown','keydown','scroll','touchstart'].forEach(e=>addEventListener(e,rs,{passive:true}));rs();
