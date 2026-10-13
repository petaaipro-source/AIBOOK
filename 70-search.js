/* Pencarian multi-kata untuk kolom cari utama */
// pencarian multi-kata (semua kata harus ada)
window.search=function(q0){
  const ws=q0.toLowerCase().split(/\s+/).filter(Boolean);let res=[],tot=0;ti.textContent='Hasil pencarian';curSec=null;
  for(const p of keys){const x=S[p],l=x.toLowerCase();if(!ws.every(k=>l.includes(k)))continue;tot++;
    if(res.length<50){const i=l.indexOf(ws[0]),a=Math.max(0,i-70),n=ws[0].length;
      res.push([p,esc(x.slice(a,i))+'<mark><b>'+esc(x.slice(i,i+n))+'</b></mark>'+esc(x.slice(i+n,i+n+110))])}}
  let h=`<p class="pg">${tot} halaman cocok${tot>50?' (50 pertama)':''}</p>`;
  for(const [p,sn2] of res){const [v,s]=secOf(p);h+=`<div class="r" data-p="${p}"><b>${s?KK(s.k):''}</b>${p>=2000?'':' - hlm. '+p}<br>${sn2}</div>`}
  m.innerHTML=tot?h:'<p class="empty">Tidak ada yang cocok. Coba kata kunci lain.</p>';scrollTo(0,0);
};
