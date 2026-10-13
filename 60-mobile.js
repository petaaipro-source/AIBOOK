/* Gaya mobile + tombol Keluar */
const mst=document.createElement('style');
mst.textContent=`.fab button{display:flex;align-items:center;gap:6px}.fab button i{font-style:normal}
@media(max-width:560px){
.fab{left:0;right:0;bottom:0;width:100%;max-width:none;gap:0;justify-content:space-around;flex-wrap:nowrap;background:var(--pkbg);color:var(--pkfg);border-top:1px solid #8884;padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px))}
.fab button{flex:1;min-width:0;flex-direction:column;gap:2px;border:0;box-shadow:none;background:none;border-radius:10px;padding:4px 2px;font-size:11px;font-weight:600}
.fab button i{font-size:20px;line-height:1.1}.fab button span{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
body{padding-bottom:calc(66px + env(safe-area-inset-bottom,0px))}
#ai,#np,#pk{left:8px;right:8px;width:auto;bottom:calc(68px + env(safe-area-inset-bottom,0px))}
#ai,#pk{height:min(74vh,600px)}
#rp{left:8px;right:8px;max-width:none;justify-content:space-between;bottom:calc(74px + env(safe-area-inset-bottom,0px));border-radius:14px}#rp span{flex:1;max-width:none}}`;
document.head.appendChild(mst);
mk('⎋ Keluar',out);document.body.appendChild(fab);
