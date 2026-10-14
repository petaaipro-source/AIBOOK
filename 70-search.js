/* Pencarian kolom cari utama: semua kata harus ada (tepat); bila kosong, cadangan BM25 + sinonim + toleransi salah ketik */
const rxq=w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const hiList=(t,list)=>{const ks=list.filter(x=>x&&x.length>=2);if(!ks.length)return esc(t);
  const re=new RegExp('('+ks.map(rxq).join('|')+')','gi');return t.split(re).map((s,i)=>i%2?'<mark><b>'+esc(s)+'</b></mark>':esc(s)).join('')};
window.search=function(q0){
  const ws=q0.toLowerCase().split(/\s+/).filter(Boolean);let res=[],tot=0,note='';ti.textContent='Hasil pencarian';curSec=null;
  for(const p of keys){const x=S[p],l=x.toLowerCase();if(!ws.every(k=>l.includes(k)))continue;tot++;
    if(res.length<50){const i=l.indexOf(ws[0]),a=Math.max(0,i-70);res.push([p,(a?'…':'')+hiList(x.slice(a,i+ws[0].length+110),ws)])}}
  if(!tot){ // cadangan: toleran salah ketik & sinonim
    try{build();const R=rank(q0,15);
      if(R.top.length){tot=R.top.length;const hl=[...R.W.keys()];
        res=R.top.map(([p])=>[p,hiList((bestLines(p,R.W,R.base)[0]||pageText(p).replace(/\s+/g,' ').slice(0,200)).trim(),hl)]);
        note='Tidak ada yang cocok persis. Menampilkan hasil serupa'+(typeof sug==='function'&&sug(q0)?' ('+sug(q0).replace(/\?$/,'')+')':'')+'.'}
    }catch(e){}}
  let h=(note?`<p class="pg">${esc(note)}</p>`:'')+`<p class="pg">${tot} halaman cocok${tot>50?' (50 pertama)':''}</p>`;
  for(const [p,sn2] of res){const [v,s]=secOf(p);h+=`<div class="r" tabindex="0" role="button" data-p="${p}"><b>${s?KK(s.k):''}</b>${p>=2000?'':' - hlm. '+p}${s?' &middot; '+esc(s.t.length>48?s.t.slice(0,48)+'…':s.t):''}<br>${sn2}</div>`}
  m.innerHTML=tot?h:'<p class="empty">Tidak ada yang cocok. Coba kata kunci lain, atau tanya Asisten.</p>';scrollTo(0,0);
};
