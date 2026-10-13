/* Asisten dokumen: UI, suara, jawaban lokal + mode Claude (admin). Mesin cari: 26-search-engine.js */
const ast=document.createElement('style');
ast.textContent=`#ai{position:fixed;right:14px;bottom:70px;width:min(430px,calc(100% - 28px));height:min(72vh,540px);z-index:99999;background:var(--pkbg);color:var(--pkfg);border:1px solid #8886;border-radius:14px;display:none;flex-direction:column;box-shadow:0 8px 30px #0005;font:14px/1.5 system-ui,sans-serif}
#ai header{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #8884;font-weight:600;position:static;background:none}
#ai header span{flex:1}#ai header button{background:none;border:0;color:inherit;font-size:16px;cursor:pointer}
#ail{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
.am{padding:9px 12px;border-radius:12px;max-width:92%;white-space:pre-wrap;word-break:break-word}
.am.u{align-self:flex-end;background:#1f6b4a;color:#fff}.am.b{align-self:flex-start;background:#8882}
.am .rf{display:block;margin-top:8px;padding-top:6px;border-top:1px solid #8883}
.am .rf button{font:inherit;font-size:12px;margin-top:3px;padding:3px 9px;border-radius:8px;border:1px solid #8886;background:transparent;color:inherit;cursor:pointer}
#ai form{display:flex;gap:6px;padding:10px;border-top:1px solid #8884}
#ai input{flex:1;font:inherit;padding:9px 11px;border-radius:10px;border:1px solid #8886;background:transparent;color:inherit}
#ai form button{font:inherit;padding:0 14px;border-radius:10px;border:0;background:#1f6b4a;color:#fff;cursor:pointer}`;
document.head.appendChild(ast);
const ai=document.createElement('div');ai.id='ai';
ai.innerHTML='<header><span>🤖 Asisten Dokumen</span><button id="aiv" title="Suara asisten">🔊</button>'+(A?'<button id="aik" title="Aktifkan mode AI (kunci API)">⚙</button>':'')+'<button id="aix">✕</button></header><div id="ail"></div><form><input id="aiq" placeholder="Tanya isi dokumen..." autocomplete="off"><button>Kirim</button></form>';
document.body.appendChild(ai);
const log=ai.querySelector('#ail');
const say=(cls,t)=>{const d=document.createElement('div');d.className='am '+cls;d.textContent=t;log.appendChild(d);log.scrollTop=log.scrollHeight;return d};
const KEY='sun_ai_key',gk=()=>{try{return sessionStorage.getItem(KEY)}catch(e){return null}};
const TTS=window.speechSynthesis;let vOn=true,greeted=0,VC=null;
try{vOn=localStorage.getItem('sun_voice')!=='0'}catch(e){}
function pick(){if(!TTS)return null;const id=TTS.getVoices().filter(v=>/^id([-_]|$)/i.test(v.lang)||/indones/i.test(v.name)),bad=/ardi|andika|\bmale\b|pria|laki/i,good=/gadis|damayanti|female|wanita|perempuan|google|siti|ayu|indah/i;
  return id.find(v=>good.test(v.name)&&!bad.test(v.name))||id.find(v=>!bad.test(v.name))||id[0]||null}
function speak(t){if(!TTS||!vOn||!t||(typeof RD!=='undefined'&&RD.run))return;TTS.cancel();if(!VC)VC=pick();
  const c=t.replace(/[•“”*_#`]/g,'').replace(/\s+/g,' ').trim().slice(0,900),parts=c.match(/[^.!?;:]+[.!?;:]?/g)||[c],q=[];let buf='';
  for(const x of parts){if((buf+x).length>170){if(buf)q.push(buf);buf=x}else buf+=x}if(buf)q.push(buf);
  for(const x of q){const u=new SpeechSynthesisUtterance(x.trim());u.lang='id-ID';if(VC)u.voice=VC;u.pitch=1.15;u.rate=1;TTS.speak(u)}}
if(TTS)TTS.onvoiceschanged=()=>{VC=pick()};
const av=ai.querySelector('#aiv');av.textContent=vOn?'🔊':'🔇';if(!TTS)av.style.display='none';
av.onclick=()=>{vOn=!vOn;av.textContent=vOn?'🔊':'🔇';try{localStorage.setItem('sun_voice',vOn?'1':'0')}catch(e){}if(!vOn)TTS.cancel();else speak('Suara asisten aktif.')};
say('b','Halo! Tanyakan apa saja tentang dokumen ini, misalnya "kuat tekan beton untuk perkerasan". Saya paham sinonim dan salah ketik, bisa lompat langsung (mis. \"seksi 6.3\" atau \"hlm. 120\"), dan mengingat pertanyaan sebelumnya untuk tanya lanjutan.'+(A?' Ketuk ⚙ untuk mengaktifkan jawaban AI (Claude).':''));
function refs(d,top){const r=document.createElement('span');r.className='rf';
  for(const [p] of top){const b=document.createElement('button');b.textContent='Buka hlm. '+p+' · '+lab(p).slice(0,40);b.onclick=()=>{go({k:'read',p,t:p});ai.style.display='none'};r.appendChild(b);r.appendChild(document.createElement('br'))}
  d.appendChild(r)}
const HIST=[];
const FU=/^\s*(lalu|terus|kalau|bagaimana dengan|bagaimana kalau|dan|serta|juga|itu|tadi)\b/i;
function sug(q){const{typo}=qterms(q);return typo.length?'Maksud Anda: '+typo.map(t=>t[1]).join(', ')+'?':''}
async function ask(q){
  if(/^\s*(tolong\s+)?(baca|bacakan|putar)\b/i.test(q)){say('u',q);say('b','Baik, saya mulai membacakan dokumen. Bagian yang sedang dibaca akan disorot.');startRead();return}
  if(/^\s*(stop|berhenti|diam)\b/i.test(q)){say('u',q);stopRead();say('b','Pembacaan dihentikan.');return}
  say('u',q);build();
  const it=intent(q);
  if(it){const d=say('b',it.type==='sec'?'Seksi '+it.ref+' ada di '+lab(it.p)+' (hlm. '+it.p+').':'Halaman '+it.p+' - '+lab(it.p)+':\n\n“'+pageText(it.p).replace(/\s+/g,' ').slice(0,260)+'…”');
    refs(d,[[it.p]]);log.scrollTop=log.scrollHeight;speak(d.textContent.split('\n')[0]);return}
  const prev=HIST.length?HIST[HIST.length-1].q:'',fol=prev&&(FU.test(q)||tk(q,true).length<=1);
  const qq=fol?prev+' '+q.replace(FU,''):q,R=rank(qq);
  if(!R.top.length){const m='Tidak ditemukan bagian yang cocok. '+(sug(qq)||'Coba pakai kata kunci lain.');say('b',m);speak(m);return}
  const d=say('b','Mencari...'),k=A?gk():null;
  const ctxl=R.top.map(([p])=>[p,ctxFor(p,R.W,k?2200:0)]);
  if(k){try{
    const ctx=ctxl.map(([p,c])=>'[hlm. '+p+' | '+lab(p)+']\n'+c).join('\n\n');
    const hist=HIST.slice(-3).flatMap(h=>[{role:'user',content:h.q},{role:'assistant',content:h.a}]);
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':k,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-5-5',max_tokens:1200,system:'Kamu asisten dokumen Spesifikasi Umum 2025 (Bina Marga). Jawab dalam bahasa Indonesia, ringkas, tepat, dan HANYA berdasarkan kutipan dokumen yang diberikan di pesan terakhir. Cantumkan nilai, satuan, dan nomor seksi persis seperti di kutipan, serta rujukan (hlm. N) di tiap poin. Jika kutipan saling bertentangan, sebutkan keduanya. Jika jawaban tidak ada di kutipan, katakan terus terang dan sarankan kata kunci lain. Jika pertanyaan ambigu, tanyakan satu hal untuk memperjelas.',messages:[...hist,{role:'user',content:'Kutipan dokumen:\n\n'+ctx+'\n\nPertanyaan: '+qq}]})});
    const j=await r.json();if(!r.ok)throw new Error((j.error&&j.error.message)||r.status);
    d.textContent=j.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');HIST.push({q:qq,a:d.textContent});refs(d,R.top);log.scrollTop=log.scrollHeight;speak(d.textContent);return
  }catch(e){d.textContent='Mode AI gagal ('+e.message+'). Menampilkan hasil pencarian lokal.\n\n'}}
  else d.textContent='';
  let t=(fol?'(Melanjutkan topik: '+prev+')\n':'')+(R.low?'Kecocokan kata kunci rendah, hasil mungkin kurang tepat. Coba istilah yang lebih spesifik.\n':'')+(sug(qq)?sug(qq)+'\n':'')+'\nBagian paling relevan:\n';
  for(const [p] of R.top.slice(0,3)){t+='\n• '+lab(p)+' (hlm. '+p+')\n';for(const l of bestLines(p,R.W,R.base))t+='   “'+l.trim()+'”\n'}
  d.textContent+=t;HIST.push({q:qq,a:t});refs(d,R.top);log.scrollTop=log.scrollHeight;
  speak('Saya menemukan '+R.top.length+' bagian yang relevan. Paling relevan: '+lab(R.top[0][0])+', halaman '+R.top[0][0]+'. '+(bestLines(R.top[0][0],R.W,R.base)[0]||''))}
ai.querySelector('form').onsubmit=e=>{e.preventDefault();const i=ai.querySelector('#aiq'),q=i.value.trim();if(q){i.value='';ask(q)}};
ai.querySelector('#aix').onclick=()=>{ai.style.display='none';if(TTS)TTS.cancel()};
if(A)ai.querySelector('#aik').onclick=()=>{const k=prompt('Tempel kunci API Anthropic Anda (disimpan hanya selama tab terbuka). Kosongkan untuk mematikan mode AI.\nCatatan: bagian dokumen yang relevan akan dikirim ke Anthropic.',gk()||'');
  if(k===null)return;try{k.trim()?sessionStorage.setItem(KEY,k.trim()):sessionStorage.removeItem(KEY)}catch(e){}say('b',k.trim()?'Mode AI aktif.':'Mode AI dimatikan. Memakai pencarian lokal.')};
