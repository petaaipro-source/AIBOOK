/* Mesin pencarian asisten: BM25 + sinonim + toleransi typo + frasa + judul seksi + niat (seksi/halaman) + konteks lanjutan */
const SW=new Set('yang dan di ke dari untuk apa adalah berapa bagaimana dengan pada dalam itu ini atau saya bisa apakah ada akan oleh sebagai jika maka agar dapat harus tentang mengapa kenapa dimana kapan siapa tolong jelaskan sebutkan carikan cari tampilkan kalau mana saja sih dong'.split(' '));
const stem=w=>{if(w.length>5)w=w.replace(/(kan|an|i|nya|lah|kah)$/,'');if(w.length>5)w=w.replace(/^(me|di|ber|ter|pe|se)/,'');return w};
const tk=(s,q)=>(s.toLowerCase().match(/[a-z0-9]+/g)||[]).filter(w=>!q||!SW.has(w)).map(stem);
const lab=p=>{const [v,s]=secOf(p);return s?KK(s.k)+' - '+s.t:'Halaman'};
const SYN=new Map();for(const g of SYN_GROUPS){const st=g.map(x=>stem(x.toLowerCase()));for(const a of st){const s=SYN.get(a)||new Set();st.forEach(b=>b!==a&&s.add(b));SYN.set(a,s)}}
const PT={},pageText=p=>PT[p]||(PT[p]=P[p].filter(b=>b[0]!=='i').map(b=>b[b.length-1]).join('\n'));
const IX={};
function build(){if(IX.d)return;const d={},len={},df={},ph={};let tot=0;
  for(const p of keys){const ws=tk(pageText(p)),tf={};len[p]=ws.length;tot+=ws.length;ph[p]=' '+ws.join(' ')+' ';for(const w of ws)tf[w]=(tf[w]||0)+1;d[p]=tf;for(const w in tf)df[w]=(df[w]||0)+1}
  const st=[];for(const v of D)for(const s of v.secs)st.push({p:s.p,e:s.e,ts:new Set(tk(s.t))});
  Object.assign(IX,{d,len,df,ph,st,avg:tot/keys.length||1,N:keys.length,voc:Object.keys(df).filter(w=>df[w]>=2&&w.length>=4&&!/\d/.test(w))})}
const idf=w=>Math.log(1+(IX.N-IX.df[w]+.5)/(IX.df[w]+.5));
function lev(a,b,mx){const n=a.length,m=b.length;if(Math.abs(n-m)>mx)return mx+1;let pv=Array.from({length:m+1},(_,j)=>j);
  for(let i=1;i<=n;i++){const cu=[i];let mn=i;for(let j=1;j<=m;j++){const v=Math.min(pv[j]+1,cu[j-1]+1,pv[j-1]+(a[i-1]===b[j-1]?0:1));cu[j]=v;if(v<mn)mn=v}if(mn>mx)return mx+1;pv=cu}return pv[m]}
function fuzzy(w){const mx=w.length>=8?2:1,r=[];for(const x of IX.voc){if(x[0]!==w[0])continue;const l=lev(w,x,mx);if(l<=mx)r.push([x,l])}
  return r.sort((a,b)=>a[1]-b[1]||IX.df[b[0]]-IX.df[a[0]]).slice(0,3).map(x=>x[0])}
// istilah kueri: Map(stem -> bobot); sinonim bobot .6, koreksi typo bobot .7
function qterms(q){build();const base=[...new Set(tk(q,true))],W=new Map(),typo=[],alt={};
  for(const w of base){if(IX.df[w])W.set(w,1);else if(w.length>=4&&!/\d/.test(w)){const f=fuzzy(w);typo.push([w,f[0]]);alt[w]=f;f.forEach(x=>W.set(x,.7))}}
  for(const w of base)for(const x of SYN.get(w)||[])if(IX.df[x]&&!W.has(x))W.set(x,.6);
  return{base,W,alt,typo:typo.filter(t=>t[1])}}
function intent(q){let m=q.match(/\b(?:seksi|pasal|bagian)\s+(\d+(?:\.\d+)+)/i);if(m){const p=resolve(m[1]);if(p)return{type:'sec',ref:m[1],p}}
  m=q.match(/\b(?:hlm\.?|halaman)\s*(\d{1,4})\b/i);if(m&&P[+m[1]])return{type:'pg',p:+m[1]};return null}
function rank(q){const{base,W,alt,typo}=qterms(q),sc=[];if(!W.size)return{base,W,typo,top:[]};
  const pairs=[];for(let i=0;i<base.length-1;i++)pairs.push(' '+base[i]+' '+base[i+1]+' ');const full=base.length>1?' '+base.join(' ')+' ':null;
  for(const p of keys){const tf=IX.d[p];let s=0;
    for(const[w,wt]of W){const f=tf[w];if(f)s+=idf(w)*wt*f*2.5/(f+1.5*(.25+.75*IX.len[p]/IX.avg))}
    if(s<=0)continue;
    let hit=0;for(const w of base)if(tf[w]||[...(SYN.get(w)||[]),...(alt[w]||[])].some(x=>tf[x]))hit++;
    const cov=base.length?hit/base.length:1;s*=(.35+.65*cov)*(cov===1?1.25:1);
    if(pairs.length){let n=0;for(const a of pairs)if(IX.ph[p].includes(a))n++;s*=1+.35*n/pairs.length;if(full&&IX.ph[p].includes(full))s*=1.4}
    const sec=IX.st.find(x=>p>=x.p&&p<=x.e);if(sec){let th=0;for(const w of base)if(sec.ts.has(w))th++;if(th)s*=1+.5*(th/base.length)*(p===sec.p?1:.4)}
    sc.push([p,s,cov])}
  sc.sort((a,b)=>b[1]-a[1]);const top=[],per={};
  for(const r of sc){const sec=IX.st.find(x=>r[0]>=x.p&&r[0]<=x.e),k=sec?sec.p:0;per[k]=(per[k]||0)+1;if(per[k]<=3)top.push(r);if(top.length>=6)break}
  return{base,W,typo,top,low:!top.length||top[0][2]<.5}}
function lscore(l,W){let s=0;for(const w of new Set(tk(l)))if(W.has(w))s+=idf(w)*W.get(w);return s}
function bestLines(p,W,base){const pr=base&&base.length>1?base.slice(0,-1).map((a,i)=>a+' '+base[i+1]):[],re=W.size?new RegExp('('+[...W.keys()].join('|')+')','i'):null;
  return pageText(p).split('\n').filter(l=>l.trim().length>25).map(l=>{let s=lscore(l,W);if(pr.length&&pr.some(x=>(' '+tk(l).join(' ')+' ').includes(' '+x+' ')))s*=1.5;return[l,s]})
   .filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([l])=>{if(l.length<=300||!re)return l.slice(0,300);const i=Math.max(0,l.search(re)-80);return(i?'…':'')+l.slice(i,i+300)})}
// kutipan konteks untuk mode Claude: baris paling relevan + tetangganya
function ctxFor(p,W,lim){const ls=pageText(p).split('\n'),keep=new Set();
  ls.map((l,i)=>[lscore(l,W),i]).sort((a,b)=>b[0]-a[0]).slice(0,8).forEach(([s,i])=>{if(s>0){keep.add(i);if(i>0)keep.add(i-1);if(i<ls.length-1)keep.add(i+1)}});
  let o='',last=-2;for(const i of[...keep].sort((a,b)=>a-b)){o+=(i>last+1?'\n...\n':'\n')+ls[i];last=i;if(o.length>lim)break}
  return(o.trim()||ls.join('\n')).slice(0,lim)}
