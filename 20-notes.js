/* Catatan pribadi per bagian */
const NK='sun_'+U.n+'_notes',gn=()=>{try{return JSON.parse(localStorage.getItem(NK))||{}}catch(e){return{}}},sn=o=>{try{localStorage.setItem(NK,JSON.stringify(o))}catch(e){}};
let np=null;
mk('📝 Catatan',()=>{
  if(np){np.remove();np=null;return}
  np=document.createElement('div');np.id='np';
  np.innerHTML='<small></small><textarea placeholder="Tulis catatan untuk bagian ini..."></textarea><button style="margin-top:6px">Ekspor semua catatan</button>';
  const ta=np.querySelector('textarea'),sm=np.querySelector('small');sm.textContent=cur();ta.value=gn()[cur()]||'';
  ta.oninput=()=>{const o=gn();ta.value?o[cur()]=ta.value:delete o[cur()];sn(o)};
  np.querySelector('button').onclick=()=>{const o=gn(),s=Object.entries(o).map(([k,v])=>k+'\n'+v).join('\n\n----\n\n')||'(kosong)';
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/plain'}));a.download='catatan.txt';a.click()};
  document.body.appendChild(np);
});
if(A)mk('🖨 Cetak',()=>print());
