/* Baca keras + sorot kata */
// ===== Baca semua + sorot =====
const RD={run:0,tok:0,rate:1,els:[],ei:0,ch:[],ci:0,nodes:[],full:'',el:null};
const rst=document.createElement('style');
rst.textContent=`.rd{background:rgba(255,196,0,.32)!important;border-radius:6px;box-shadow:-5px 0 0 #ff9f1c,0 0 0 4px rgba(255,196,0,.32)!important}
::highlight(rds){background-color:#ffe066;color:#000}::highlight(rdw){background-color:#ff7a00;color:#fff}
#rp{position:fixed;left:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:99999;display:none;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:var(--pkbg);color:var(--pkfg);border:1px solid #8886;box-shadow:0 2px 12px #0004;font:13px system-ui,sans-serif;max-width:calc(100% - 28px)}
#rp button,#rp select{font:inherit;border:1px solid #8886;border-radius:8px;background:transparent;color:inherit;padding:4px 9px;cursor:pointer}
#rp span{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;
document.head.appendChild(rst);
const rp=document.createElement('div');rp.id='rp';
rp.innerHTML='<button id="rpp">⏸</button><button id="rps">⏹</button><select id="rpr"><option value="0.85">0.85x</option><option value="1" selected>1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option></select><span id="rpl"></span>';
document.body.appendChild(rp);
const HLok=!!(window.Highlight&&window.CSS&&CSS.highlights);
function clearHL(){if(HLok){CSS.highlights.delete('rds');CSS.highlights.delete('rdw')}document.querySelectorAll('.rd').forEach(e=>e.classList.remove('rd'))}
function locate(g){for(const n of RD.nodes)if(g>=n.s&&g<=n.s+n.n)return[n.node,Math.min(g-n.s,n.n)];return null}
function setHL(name,a,b){if(!HLok)return;const x=locate(a),y=locate(b);if(!x||!y){CSS.highlights.delete(name);return}
  const r=new Range();try{r.setStart(x[0],x[1]);r.setEnd(y[0],y[1])}catch(e){return}CSS.highlights.set(name,new Highlight(r))}
function collect(){const o=[];m.querySelectorAll('.txt').forEach(t=>{const c=[...t.children];(c.length?c:[t]).forEach(e=>{if(!e.matches('figure,img,.fg')&&!e.querySelector('img')&&(e.textContent||'').trim())o.push(e)})});return o}
function prep(el){RD.nodes=[];let f='';const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){const d=n.data;RD.nodes.push({node:n,s:f.length,n:d.length});f+=d;if(/^(TD|TH|LI|DT|DD)$/.test(n.parentElement.tagName)&&!/\s$/.test(d))f+=' '}
  RD.full=f;const ps=f.match(/[^.!?;:\n]+[.!?;:]*\s*/g)||[f],ch=[];let a=0,pos=0,cur='';
  for(const x of ps){if(cur&&(cur+x).length>200){ch.push({a,b:pos});a=pos;cur=''}cur+=x;pos+=x.length;if(cur.length>=110){ch.push({a,b:pos});a=pos;cur=''}}
  if(pos>a)ch.push({a,b:pos});RD.ch=ch.filter(c=>RD.full.slice(c.a,c.b).trim())}
function nextEl(){if(!RD.run)return;if(RD.ei>=RD.els.length)return advSec();
  clearHL();RD.el=RD.els[RD.ei];prep(RD.el);RD.ci=0;RD.el.classList.add('rd');RD.el.scrollIntoView({block:'center',behavior:'smooth'});speakCur()}
function speakCur(){if(!RD.run)return;const c=RD.ch[RD.ci];if(!c){RD.ei++;return nextEl()}
  const u=new SpeechSynthesisUtterance(RD.full.slice(c.a,c.b)),tok=++RD.tok;if(!VC)VC=pick();u.lang='id-ID';if(VC)u.voice=VC;u.pitch=1.15;u.rate=RD.rate;
  setHL('rds',c.a,c.b);if(HLok)CSS.highlights.delete('rdw');
  u.onboundary=e=>{if(tok!==RD.tok||(e.name&&e.name!=='word'))return;const g=c.a+e.charIndex,len=e.charLength||Math.max(1,RD.full.slice(g).search(/[\s.,;:]/));setHL('rdw',g,g+(len>0?len:4))};
  const nx=()=>{if(tok!==RD.tok||!RD.run)return;RD.ci++;speakCur()};u.onend=nx;u.onerror=e=>{if(e.error==='canceled'||e.error==='interrupted')return;nx()};TTS.speak(u)}
function advSec(){const all=D.flatMap(v=>v.secs),i=all.findIndex(s=>curSec&&s.p===curSec.p),n=all[i+1];
  if(i<0||!n){stopRead(true);return}go({k:'read',p:n.p,t:n.p});RD.els=collect();RD.ei=0;$('#rpl').textContent=lab(n.p);nextEl()}
function startRead(){if(!TTS){say('b','Browser ini tidak mendukung suara.');return}
  TTS.cancel();ai.style.display='none';if(cur_().k!=='read'){const last=LS.get('sun_last',null);const p=(curSec&&curSec.p)||(last&&P[last.p]&&last.p)||keys[0];go({k:'read',p,t:p})}
  RD.els=collect();let st=RD.els.findIndex(e=>e.getBoundingClientRect().bottom>130);if(st<0)st=0;RD.ei=st;RD.run=1;RD.tok++;
  rp.style.display='flex';$('#rpp').textContent='⏸';$('#rpl').textContent=curSec?lab(curSec.p):'';nextEl()}
function stopRead(done){RD.run=0;RD.tok++;if(TTS)TTS.cancel();clearHL();rp.style.display='none';if(done){ai.style.display='flex';say('b','Selesai. Seluruh dokumen sudah dibacakan.')}}
const cur_=()=>cur;
$('#rps').onclick=()=>stopRead();$('#rpr').onchange=e=>{RD.rate=+e.target.value};
$('#rpp').onclick=()=>{if(!RD.run)return;if(RD.paused){RD.paused=0;$('#rpp').textContent='⏸';RD.tok++;speakCur()}else{RD.paused=1;$('#rpp').textContent='▶';RD.tok++;TTS.cancel()}};
mk('📖 Baca',startRead);
mk('🤖 Asisten',()=>{ai.style.display=ai.style.display==='flex'?'none':'flex';if(ai.style.display==='flex'){ai.querySelector('#aiq').focus();if(!greeted){greeted=1;speak('Halo, saya asisten dokumen. Silakan tanyakan apa saja tentang isi dokumen ini.')}}else if(TTS)TTS.cancel()});
