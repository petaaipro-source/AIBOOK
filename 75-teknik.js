/* TEKNIK PRO: U-Ditch, Box Culvert (semua ukuran), Pasangan Batu, DPT, Bore Pile.
   Kalkulator + gambar skema + cek otomatis + asisten bahasa alami (ketik di Asisten: "box culvert 2x2 panjang 50 m debit 4").
   Hasil = ESTIMASI AWAL perencanaan; wajib diverifikasi ahli & gambar kerja. */
(()=>{
const N=(x,d=2)=>isFinite(x)?Number(x).toLocaleString('id-ID',{maximumFractionDigits:d}):'-';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const wkg=d=>d*d*0.006165, rb=s=>{const m=String(s).match(/P?\s*(\d+)\s*-\s*(\d+)/);return m?{d:+m[1],s:+m[2]}:{d:12,s:150}};
const mann=(b,y,n,S,m=0)=>{const A=(b+m*y)*y,P=b+2*y*Math.sqrt(1+m*m),R=A/P,V=Math.pow(R,2/3)*Math.sqrt(S)/n;return{A,V,Q:A*V}};
const H_=t=>['#',t], R_=(a,b,c)=>[a,b,c||''];
const sv=(w,h,b)=>`<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:190px;color:inherit" font-family="system-ui" font-size="10" stroke="currentColor" stroke-width="1.2" fill="none">${b}</svg>`;
const FILL='fill="#8883"',SOIL='fill="#b8864a44" stroke="none"';
const tx=(x,y,t,a)=>`<text x="${x}" y="${y}" fill="currentColor" stroke="none" text-anchor="${a||'middle'}">${esc(t)}</text>`;

/* ===================== DATA ===================== */
const DS={'DS-1':{bo:400,h:[350,850],d1:'P12-150',a1:'P12-200'},'DS-2':{bo:500,h:[650,1050],d1:'P12-150',a1:'P12-200'},'DS-3':{bo:600,h:[650,1050],d1:'P12-150',a1:'P12-200'},
'DS-4':{bo:800,h:[650,1050],d1:'P12-150',a1:'P12-200'},'DS-5':{bo:1000,h:[650,1050],d1:'P12-150',a1:'P12-200'},'DS-6':{bo:1000,h:[1050,1500],d1:'P16-150',a1:'P12-200'}};
const MIX={'1:3':{pc:202,ps:.485},'1:4':{pc:163,ps:.52},'1:5':{pc:136,ps:.544},'1:6':{pc:117,ps:.56}}; // per m3 pasangan batu, batu belah 1,2 m3 (acuan SNI/AHSP)
const STDB=[[.6,.6],[.8,.8],[1,1],[1,1.5],[1.2,1.2],[1.5,1],[1.5,1.5],[2,1],[2,1.5],[2,2],[2.5,2],[2.5,2.5],[3,2],[3,2.5],[3,3],[4,2],[4,3],[4,4],[5,3],[5,4]];
const STD=[...STDB.map(s=>[...s,1]),...[2,3].flatMap(n=>[[1,1],[1.5,1.5],[2,2],[2.5,2.5],[3,3]].map(s=>[...s,n]))];
const tAuto=sp=>sp<=1?150:sp<=1.5?200:sp<=2?250:sp<=2.5?300:sp<=3?350:sp<=4?400:sp<=5?450:500;
const boxGeo=(B,H,n,tw,ts)=>{const W=n*B+(n+1)*tw,Hx=H+2*ts,A=W*Hx-n*B*H;return{W,Hx,A,w:A*2.4}};
const boxCap=(B,H,n,S,nn)=>{const f=mann(B,H,nn,S),p=mann(B,.8*H,nn,S);return{Qf:f.Q*n,Vf:f.V,Q8:p.Q*n,V8:p.V}};

/* ===================== KALKULATOR ===================== */
const TOOLS={};

/* ---- U-DITCH ---- */
TOOLS.ud={n:'U-Ditch',i:'🛣️',fields:[
 {k:'tipe',l:'Tipe saluran (Gbr 4.10.2)',v:'DS-3',o:Object.keys(DS)},
 {k:'bentuk',l:'Bentuk',v:'Terbuka simetris',o:['Terbuka simetris','Siku (satu dinding 400 mm)','Tertutup - trotoar','Tertutup - jalan masuk kendaraan']},
 {k:'ho',l:'Tinggi Ho',v:800,u:'mm'},{k:'L',l:'Panjang saluran',v:100,u:'m'},
 {k:'tw',l:'Tebal dinding',v:150,u:'mm'},{k:'tb',l:'Tebal dasar',v:150,u:'mm'},
 {k:'S',l:'Kemiringan memanjang',v:0.5,u:'%'},{k:'Q',l:'Debit rencana (opsional, 0=abaikan)',v:0,u:'m³/dt'}],
 calc(v){const T=DS[v.tipe]||DS['DS-3'],w=[],Bo=T.bo/1e3,tw=v.tw/1e3,tb=v.tb/1e3,B=Bo+2*tw,L=+v.L;let Ho=+v.ho;
  if(Ho<T.h[0]||Ho>T.h[1])w.push('! Ho '+Ho+' mm di luar rentang tabel '+v.tipe+' ('+T.h[0]+'-'+T.h[1]+' mm). Pindah tipe atau sesuaikan.');
  const siku=/Siku/.test(v.bentuk),closed=/Tertutup/.test(v.bentuk),veh=/jalan/.test(v.bentuk),h1=Ho/1e3,h2=siku?.4:h1;
  const tc=closed?(veh?(T.bo<=800?.15:.2):.1):0;
  const Aw=tw*(h1+h2)+B*tb,vol=Aw+B*tc;
  const D=rb(T.d1),A=rb(T.a1),c=.03,Lb=(h1+tb-c)+(B-2*c)+(h2+tb-c);
  const wD=Lb*(1/(D.s/1e3))*wkg(D.d)*1.1,nA=Math.ceil(Lb/(A.s/1e3))+1,wA=nA*1*wkg(A.d)*1.1,wC=tc*B*(veh?130:100);
  const bm=wD+wA+wC,bek=(h1+tb)+(h2+tb)+B+h1+h2+Bo+(closed?2*B:0);
  const Sg=Math.max(.005,v.S/100),h8=.8*h1,hy=mann(Bo,h8,.015,Sg);
  const hasQ=+v.Q>0;let rec='';
  if(hasQ){for(const k in DS){const t=DS[k];for(let h=t.h[0];h<=t.h[1];h+=50){const r=mann(t.bo/1e3,.8*h/1e3,.015,Sg);if(r.Q>=v.Q&&r.V<=4){rec=k+' dengan Ho ≥ '+h+' mm (Q '+N(r.Q)+' m³/dt, V '+N(r.V)+' m/dt)';break}}if(rec)break}
   if(!rec)w.push('! Debit melebihi kapasitas semua tipe U-Ditch. Pakai box culvert atau saluran ganda.');}
  if(hy.V<.6)w.push('! Kecepatan '+N(hy.V)+' m/dt < 0,6: risiko sedimentasi, naikkan kemiringan.');if(hy.V>3)w.push('! Kecepatan '+N(hy.V)+' m/dt > 3: risiko gerusan/abrasi.');
  if(v.S<.5)w.push('! Gambar 4.10.1 catatan 4: kemiringan minimum saluran 0,5%.');
  if(hasQ&&hy.Q<v.Q)w.push('! Kapasitas tipe terpilih '+N(hy.Q)+' < debit rencana '+N(v.Q)+' m³/dt.');else if(hasQ)w.push('✓ Kapasitas '+N(hy.Q)+' m³/dt ≥ debit rencana.');
  const nP=Math.ceil(L/2)*Math.ceil((h1+tb)/1)*(siku?1:2);
  const rows=[H_('Dimensi'),R_('Bo (lebar dalam)',N(Bo*1e3,0),'mm'),R_('B (lebar luar)',N(B*1e3,0),'mm'),R_('Tulangan',T.d1+' (D1) / '+T.a1+' (A1)'+(v.tipe==='DS-6'?'':''),'BJTP-240'),
   closed?R_('Tebal penutup',N(tc*1e3,0),'mm'):0,
   H_('Volume per meter'),R_('Beton Fc\'30',N(vol,3),'m³/m'),R_('Berat sendiri',N(vol*2.4,2),'ton/m'),R_('Tulangan (est.)',N(bm,1),'kg/m'),R_('Bekisting',N(bek,2),'m²/m'),
   H_('Total '+N(L,0)+' m'),R_('Beton Fc\'30',N(vol*L,2),'m³'),R_('Tulangan (+10% lewatan)',N(bm*L,0),'kg'),R_('Rasio tulangan',N(bm/vol,0),'kg/m³'),R_('Bekisting',N(bek*L,1),'m²'),
   R_('Lantai kerja Fc\'10 t=10 cm',N((B+.1)*.1*L,2),'m³'),R_('Galian (ruang kerja 30 cm)',N((B+.6)*(h1+tb+.1)*L,1),'m³'),R_('Pipa drainase PVC (maks 2 m horiz × 1 m vert)',nP,'titik'),
   H_('Hidrolika (Manning n=0,015; terisi 80%)'),R_('Kapasitas',N(hy.Q,3),'m³/dt'),R_('Kecepatan',N(hy.V),'m/dt'),hasQ?R_('Rekomendasi',rec||'-'):0].filter(Boolean);
  const s=Math.min(200/B,130/(h1+tb+tc)),x0=(260-B*s)/2,y0=20+tc*s,P=(x,y)=>(x0+x*s).toFixed(1)+','+(y0+y*s).toFixed(1),yr=h1-h2;
  const svg=sv(260,190,`<polygon ${FILL} points="${[[0,0],[tw,0],[tw,h1],[tw+Bo,h1],[tw+Bo,yr],[B,yr],[B,h1+tb],[0,h1+tb]].map(p=>P(...p)).join(' ')}"/>`+
   `<rect ${FILL} x="${x0-.05*s}" y="${y0+(h1+tb)*s}" width="${(B+.1)*s}" height="${.1*s}" stroke-dasharray="3 2"/>`+(closed?`<rect ${FILL} x="${x0}" y="${y0-tc*s}" width="${B*s}" height="${tc*s}"/>`:'')+
   tx(130,y0+(h1+tb)*s+24,'Bo '+N(Bo*1e3,0)+'  ·  B '+N(B*1e3,0)+'  ·  Ho '+N(Ho,0)+' mm')+tx(130,y0+(h1+tb)*s+36,'lantai kerja Fc\'10 t=10 cm'));
  return{rows,w,svg}}};

/* ---- BOX CULVERT ---- */
TOOLS.bc={n:'Box Culvert',i:'🟦',fields:[
 {k:'B',l:'Lebar dalam per sel (B)',v:2,u:'m'},{k:'H',l:'Tinggi dalam (H)',v:2,u:'m'},{k:'n',l:'Jumlah sel',v:1,o:['1','2','3','4']},
 {k:'L',l:'Panjang total',v:30,u:'m'},{k:'t',l:'Tebal dinding/slab (0 = otomatis)',v:0,u:'mm'},{k:'seg',l:'Panjang segmen precast',v:1,o:['1','1.2','1.5','2']},
 {k:'S',l:'Kemiringan',v:0.5,u:'%'},{k:'Q',l:'Debit rencana (0 = abaikan)',v:0,u:'m³/dt'},{k:'tim',l:'Tinggi timbunan di atas',v:1,u:'m'},{k:'rr',l:'Rasio tulangan',v:140,u:'kg/m³'}],
 calc(v){const B=+v.B,H=+v.H,n=+v.n,L=+v.L,w=[],auto=tAuto(Math.max(B,H)),t=(+v.t||auto)/1e3,g=boxGeo(B,H,n,t,t),Sg=Math.max(.001,v.S/100),cp=boxCap(B,H,n,Sg,.013),seg=+v.seg;
  const nseg=Math.ceil(L/seg),wseg=g.w*seg,vol=g.A*L,bek=(2*(g.W+g.Hx)+n*2*(B+H))*L;
  if(+v.t&&+v.t<auto)w.push('! Tebal '+v.t+' mm < saran awal '+auto+' mm untuk bentang ini. Perlu hitung struktur.');
  if(Math.max(B,H)>3)w.push('! Bentang > 3 m: umumnya cast in-situ / segmen berat; cek kapasitas crane ('+N(wseg,1)+' ton/segmen).');
  if(wseg>10)w.push('i Berat segmen '+N(wseg,1)+' ton: butuh crane ≥ '+N(wseg*2.5,0)+' ton (faktor radius ±2,5×).');
  if(v.tim<.6)w.push('! Timbunan < 0,6 m: cek beban roda langsung & tebal slab atas.');
  if(cp.V8>4)w.push('! V = '+N(cp.V8)+' m/dt > 4: perlu peredam energi / apron hilir.');if(cp.V8<.6)w.push('! V = '+N(cp.V8)+' m/dt < 0,6: risiko sedimen.');
  if(+v.Q>0){if(cp.Q8>=v.Q)w.push('✓ Kapasitas 80% tinggi '+N(cp.Q8)+' m³/dt ≥ debit rencana.');else w.push('! Kapasitas '+N(cp.Q8)+' m³/dt < debit '+N(v.Q)+' m³/dt. Perbesar ukuran / tambah sel.');
   const c2=STD.map(s=>{const G=boxGeo(s[0],s[1],s[2],tAuto(Math.max(s[0],s[1]))/1e3,tAuto(Math.max(s[0],s[1]))/1e3),c=boxCap(s[0],s[1],s[2],Sg,.013);return{s,G,c}}).filter(x=>x.c.Q8>=v.Q&&x.c.V8<=4&&x.c.V8>=.5).sort((a,b)=>a.G.A-b.G.A).slice(0,3);
   if(c2.length)w.push('i Alternatif termurah beton: '+c2.map(x=>(x.s[2]>1?x.s[2]+'×':'')+x.s[0]+'×'+x.s[1]+' m (Q '+N(x.c.Q8)+')').join(' | '))}
  const rows=[H_('Dimensi'),R_('Ukuran dalam',(n>1?n+' × ':'')+N(B)+' × '+N(H),'m'),R_('Tebal dinding & slab',N(t*1e3,0)+(+v.t?'':' (otomatis)'),'mm'),R_('Ukuran luar',N(g.W)+' × '+N(g.Hx),'m'),
   H_('Per meter'),R_('Beton',N(g.A,3),'m³/m'),R_('Berat',N(g.w,2),'ton/m'),R_('Tulangan (est.)',N(g.A*v.rr,0),'kg/m'),
   H_('Total '+N(L,0)+' m'),R_('Jumlah segmen',nseg+' × '+seg+' m','buah'),R_('Berat per segmen',N(wseg,2),'ton'),R_('Beton',N(vol,2),'m³'),R_('Tulangan',N(vol*v.rr,0),'kg'),R_('Bekisting',N(bek,0),'m²'),
   R_('Lantai kerja Fc\'10 t=10',N((g.W+.2)*.1*L,2),'m³'),R_('Urugan pasir t=10 cm',N((g.W+.2)*.1*L,2),'m³'),R_('Galian',N((g.W+1)*(g.Hx+.2+Math.max(0,v.tim))*L,1),'m³'),
   H_('Hidrolika (Manning n=0,013)'),R_('Q penuh',N(cp.Qf,2),'m³/dt'),R_('Q terisi 80%',N(cp.Q8,2),'m³/dt'),R_('V terisi 80%',N(cp.V8),'m/dt')];
  const s=Math.min(220/g.W,140/g.Hx),x0=(260-g.W*s)/2,y0=15;let h='';for(let i=0;i<n;i++)h+=`<rect x="${x0+(t+i*(B+t))*s}" y="${y0+t*s}" width="${B*s}" height="${H*s}" fill="#4a90d933"/>`;
  const svg=sv(260,190,`<rect ${FILL} x="${x0}" y="${y0}" width="${g.W*s}" height="${g.Hx*s}"/>`+h+tx(130,y0+g.Hx*s+16,(n>1?n+'×':'')+N(B)+'×'+N(H)+' m, t '+N(t*1e3,0)+' mm'));
  return{rows,w,svg}}};

/* ---- PASANGAN BATU ---- */
TOOLS.pb={n:'Pasangan Batu',i:'🧱',fields:[
 {k:'a',l:'Lebar atas',v:.3,u:'m'},{k:'b',l:'Lebar bawah',v:.6,u:'m'},{k:'h',l:'Tinggi',v:1.5,u:'m'},{k:'L',l:'Panjang',v:100,u:'m'},
 {k:'vol',l:'Atau volume langsung (0 = dari dimensi)',v:0,u:'m³'},{k:'mix',l:'Campuran spesi (PC:PS)',v:'1:4',o:Object.keys(MIX)},
 {k:'pl',l:'Plesteran 1:3 t=15 mm',v:'Ya, 1 sisi',o:['Tidak','Ya, 1 sisi','Ya, 2 sisi']},
 {k:'bs',l:'Lebar dasar saluran (cek hidrolika, 0=lewati)',v:0,u:'m'},{k:'ms',l:'Kemiringan talud (1 : m)',v:.25},{k:'S',l:'Kemiringan memanjang',v:.5,u:'%'}],
 calc(v){const a=+v.a,b=+v.b,h=+v.h,L=+v.L,w=[],M=MIX[v.mix],vol=+v.vol>0?+v.vol:(a+b)/2*h*L,sl=Math.hypot(h,b-a);
  const ap=v.pl==='Tidak'?0:(v.pl==='Ya, 1 sisi'?(h+a)*L:(h+sl+a)*L);
  if(b<a&&!(+v.vol))w.push('! Lebar bawah < atas: lazimnya b ≥ a (dinding menebal ke bawah).');
  if(h>3.5)w.push('! Tinggi > 3,5 m: pasangan batu kurang ekonomis; pertimbangkan DPT beton/kantilever (lihat tab DPT).');
  if(!(+v.vol)&&b<.4*h)w.push('i Aturan praktis DPT: b ≈ 0,5–0,7 H, a ≥ 0,30 m. Untuk H='+N(h)+' m → b ≈ '+N(.5*h)+'–'+N(.7*h)+' m.');
  const rows=[H_('Volume'),R_('Pasangan batu',N(vol,2),'m³'),+v.vol>0?0:R_('Luas penampang',N((a+b)/2*h,3),'m²'),
   H_('Kebutuhan bahan ('+v.mix+', acuan SNI/AHSP)'),R_('Batu belah/kali (×1,2)',N(vol*1.2,2),'m³'),R_('Semen PC',N(vol*M.pc,0),'kg  ('+N(vol*M.pc/50,1)+' zak 50 kg)'),R_('Pasir pasang',N(vol*M.ps,2),'m³'),
   R_('Air (±)',N(vol*.215,2)+' – '+N(vol*.25,2),'m³'),
   H_('Tenaga (per m³: 1,5 pekerja; 0,75 tukang; 0,075 kep. tukang; 0,075 mandor)'),R_('Pekerja',N(vol*1.5,1),'OH'),R_('Tukang batu',N(vol*.75,1),'OH'),R_('Kepala tukang + mandor',N(vol*.15,1),'OH')];
  if(ap){const m2=ap;rows.push(H_('Plesteran 1:3 t=15 mm'),R_('Luas',N(m2,1),'m²'),R_('Semen',N(m2*6.24,0),'kg'),R_('Pasir',N(m2*.024,2),'m³'))}
  if(+v.bs>0){const y=.8*h,r=mann(+v.bs,y,.025,Math.max(.001,v.S/100),+v.ms);rows.push(H_('Hidrolika saluran trapesium (n=0,025; terisi 80%)'),R_('Luas basah',N(r.A,3),'m²'),R_('Kecepatan',N(r.V),'m/dt'),R_('Kapasitas',N(r.Q,3),'m³/dt'));
   if(r.V>2)w.push('! V = '+N(r.V)+' m/dt > 2: pasangan batu rawan gerus, kecuali dilapis.');}
  const s=Math.min(150/Math.max(b,a),130/h),x0=40,y0=20,bx=Math.max(a,b)*s;
  const svg=sv(260,190,`<polygon ${FILL} points="${x0},${y0+h*s} ${x0+b*s},${y0+h*s} ${x0+b*s},${y0} ${x0+(b-a)*s},${y0}"/>`+`<rect x="${x0+b*s}" y="${y0}" width="60" height="${h*s}" ${SOIL}/>`+tx(x0+b*s/2,y0+h*s+16,'b = '+N(b)+' m')+tx(x0+b*s-a*s/2,y0-5,'a = '+N(a)+' m')+tx(x0+b*s+30,y0+h*s/2,'tanah'));
  return{rows:rows.filter(Boolean),w,svg}}};

/* ---- DPT (dinding penahan tanah gravitasi pasangan batu) ---- */
function dptCheck(p){const{H,a,B,gs,phi,q,gw,sig,Df}=p,r=Math.PI/180,Ka=Math.pow(Math.tan((45-phi/2)*r),2),Kp=1/Ka,
 Pa1=.5*Ka*gs*H*H,Pa2=Ka*q*H,Ph=Pa1+Pa2,Mo=Pa1*H/3+Pa2*H/2,W1=.5*(B-a)*H*gw,x1=2/3*(B-a),W2=a*H*gw,x2=(B-a)+a/2,SW=W1+W2,Mr=W1*x1+W2*x2,
 Pp=Df>0?.5*.5*Kp*gs*Df*Df:0,mu=Math.tan(2/3*phi*r),FSg=(Mr+(Pp?Pp*Df/3:0))/Mo,FSs=(SW*mu+Pp)/Ph,xb=(Mr-Mo)/SW,e=B/2-xb,
 smax=Math.abs(e)<=B/6?SW/B*(1+6*e/B):2*SW/(3*xb),smin=Math.abs(e)<=B/6?SW/B*(1-6*e/B):0;
 return{Ka,Pa1,Pa2,Ph,Mo,SW,Mr,FSg,FSs,xb,e,smax:Math.max(smax,smin),smin:Math.min(smax,smin),ok:FSg>=1.5&&FSs>=1.5&&Math.abs(e)<=B/6&&Math.max(smax,smin)<=sig&&Math.min(smax,smin)>=0,Pp}}
TOOLS.dp={n:'DPT',i:'🧗',fields:[
 {k:'H',l:'Tinggi dinding (dari dasar pondasi)',v:3,u:'m'},{k:'a',l:'Lebar atas',v:.4,u:'m'},{k:'B',l:'Lebar dasar (0 = otomatis dicarikan)',v:0,u:'m'},{k:'L',l:'Panjang dinding',v:50,u:'m'},
 {k:'gs',l:'Berat isi tanah timbunan γ',v:18,u:'kN/m³'},{k:'phi',l:'Sudut geser dalam φ',v:30,u:'°'},{k:'q',l:'Beban merata di atas (surcharge)',v:10,u:'kPa'},
 {k:'gw',l:'Berat isi pasangan batu',v:22,u:'kN/m³'},{k:'sig',l:'Daya dukung ijin tanah dasar',v:150,u:'kPa'},{k:'Df',l:'Kedalaman tanah di depan kaki (pasif, 0=abaikan)',v:0,u:'m'},
 {k:'mix',l:'Campuran spesi',v:'1:4',o:Object.keys(MIX)}],
 calc(v){const p={H:+v.H,a:+v.a,B:+v.B,gs:+v.gs,phi:+v.phi,q:+v.q,gw:+v.gw,sig:+v.sig,Df:+v.Df},w=[];let auto='';
  if(!p.B||p.B<=p.a){const a=Math.max(p.a,.3);for(let B=Math.max(.4*p.H,a+.1);B<=1.5*p.H+1e-9;B+=.05){p.B=Math.round(B*100)/100;if(dptCheck({...p,a}).ok){p.a=a;auto=' (otomatis)';break}}if(!auto){p.B=1.2*p.H;w.push('! Tidak ada B ≤ 1,5H yang aman. Perkecil H, pakai dinding kantilever/bore pile, atau perbaiki tanah dasar.')}}
  const c=dptCheck(p),vol=(p.a+p.B)/2*p.H,M=MIX[v.mix],L=+v.L,V=vol*L;
  const fl=(ok,t)=>w.push((ok?'✓ ':'! ')+t);
  fl(c.FSg>=1.5,'Guling FS = '+N(c.FSg)+' (min 1,5)');fl(c.FSs>=1.5,'Geser FS = '+N(c.FSs)+' (min 1,5)');fl(Math.abs(c.e)<=p.B/6,'Eksentrisitas e = '+N(c.e,3)+' m (batas B/6 = '+N(p.B/6,3)+')');fl(c.smax<=p.sig,'σ max = '+N(c.smax,1)+' kPa (ijin '+N(p.sig,0)+')');
  if(p.H>4)w.push('! H > 4 m: dinding gravitasi pasangan batu tidak lazim; pakai beton kantilever/counterfort/bore pile secant.');
  w.push('i Pastikan drainase di belakang dinding (pipa barbakan PVC maks 2 m horizontal × 1 m vertikal, filter kerikil) agar tekanan air pori tidak terjadi. Perhitungan ini mengabaikan muka air tanah, gempa, dan stabilitas lereng global.');
  const rows=[H_('Dimensi'),R_('H / a / B',N(p.H)+' / '+N(p.a)+' / '+N(p.B)+auto,'m'),R_('Luas penampang',N(vol,3),'m²'),
   H_('Gaya (per m\' panjang, Rankine)'),R_('Ka',N(c.Ka,3)),R_('Tekanan tanah Pa',N(c.Pa1,1),'kN/m'),R_('Akibat surcharge',N(c.Pa2,1),'kN/m'),R_('Berat dinding ΣW',N(c.SW,1),'kN/m'),
   H_('Stabilitas'),R_('FS guling',N(c.FSg),c.FSg>=1.5?'OK':'NOT OK'),R_('FS geser',N(c.FSs),c.FSs>=1.5?'OK':'NOT OK'),R_('σ max / σ min',N(c.smax,1)+' / '+N(c.smin,1),'kPa'),R_('Status',c.ok?'AMAN ✓':'TIDAK AMAN ✗'),
   H_('Kuantitas '+N(L,0)+' m'),R_('Pasangan batu',N(V,2),'m³'),R_('Batu belah',N(V*1.2,2),'m³'),R_('Semen PC '+v.mix,N(V*M.pc,0),'kg'),R_('Pasir',N(V*M.ps,2),'m³'),R_('Barbakan PVC',Math.ceil(L/2)*Math.ceil(p.H/1),'titik'),R_('Galian pondasi (±)',N((p.B+.6)*(p.H*.5+.3)*L,1),'m³')];
  const s=Math.min(110/p.B,130/p.H),x0=30,y0=20,bx=x0+p.B*s,Hs=p.H*s;
  const svg=sv(260,190,`<rect x="${bx}" y="${y0}" width="70" height="${Hs}" ${SOIL}/><polygon ${FILL} points="${x0},${y0+Hs} ${bx},${y0+Hs} ${bx},${y0} ${bx-p.a*s},${y0}"/>`+
   `<line x1="${bx+55}" y1="${y0+Hs*.67}" x2="${bx+2}" y2="${y0+Hs*.67}" stroke="#d33"/><polygon points="${bx+2},${y0+Hs*.67} ${bx+9},${y0+Hs*.67-3} ${bx+9},${y0+Hs*.67+3}" fill="#d33" stroke="none"/>`+tx(bx+35,y0+Hs*.67-5,'Pa='+N(c.Ph,0)+' kN/m')+tx(x0+p.B*s/2,y0+Hs+15,'B = '+N(p.B)+' m')+tx(bx+35,y0+14,'q = '+N(p.q,0)+' kPa'));
  return{rows,w,svg}}};

/* ---- BORE PILE ---- */
function pileCalc(v){const D=v.D/100,L=+v.L,At=Math.PI*D*D/4,As=Math.PI*D,
 lay=String(v.lay).split(/\n/).map(l=>l.split(/[,;\s]+/).filter(Boolean)).filter(a=>a.length>=2).map(a=>({z:+a[0],N:+a[1],t:(a[2]||'L').toUpperCase()[0]})).sort((x,y)=>x.z-y.z);
 if(!lay.length)return null;
 const at=z=>lay.find(l=>z<=l.z)||lay[lay.length-1],AB={L:{al:.85,be:.8,K:12},M:{al:.6,be:.65,K:25},P:{al:.5,be:.5,K:40}};
 let Qs=0,z0=0;const segs=[];for(const l of lay){if(z0>=L)break;const z1=Math.min(l.z,L),dz=z1-z0;if(dz>0){const c=AB[l.t]||AB.L,Nn=Math.min(50,Math.max(3,l.N)),fs=c.be*(Nn/3+1),q=fs*9.81*As*dz;Qs+=q;segs.push({z0,z1,l,fs})}z0=l.z}
 const tipl=at(L),c=AB[tipl.t]||AB.L,Nt=(Math.min(50,at(L-D).N)+Math.min(50,tipl.N)+Math.min(50,at(L+D).N))/3,qp=c.al*c.K*Nt*9.81,Qp=Math.min(qp,Number.POSITIVE_INFINITY)*At,
 Qu=Qs+Qp,Qa=Math.min(Qs/1.3+Qp/4,Qu/2.5),Pb=.25*v.fc*1000*At,Qd=Math.min(Qa,Pb);return{D,L,At,As,lay,segs,Qs,Qp,Qu,Qa,Pb,Qd,Nt}}
TOOLS.bp={n:'Bore Pile',i:'🕳️',fields:[
 {k:'D',l:'Diameter tiang',v:60,u:'cm',o:['30','40','50','60','80','100','120','150']},{k:'L',l:'Panjang / kedalaman tiang',v:15,u:'m'},{k:'fc',l:"Mutu beton f'c",v:25,u:'MPa'},
 {k:'lay',l:'Data bor: kedalaman bawah lapisan (m), N-SPT, jenis (L=lempung, M=lanau, P=pasir) — satu baris per lapisan',v:'4, 6, L\n8, 12, L\n12, 20, M\n16, 35, P\n20, 50, P',t:'ta'},
 {k:'Pu',l:'Beban rencana per kolom/abutmen (0 = abaikan)',v:1500,u:'kN'},{k:'S',l:'Jarak antar tiang (kelipatan D)',v:3,u:'×D'},{k:'rho',l:'Rasio tulangan longitudinal',v:1.5,u:'%'}],
 calc(v){const r=pileCalc(v),w=[];if(!r)return{rows:[R_('Data bor kosong','')],w:['! Isi data bor: "kedalaman, N, jenis".'],svg:''};
  if(r.L>r.lay[r.lay.length-1].z)w.push('i Panjang tiang melebihi data bor terdalam; N lapisan terakhir diperpanjang. Tambah data bor.');
  if(r.L/r.D>30)w.push('! L/D = '+N(r.L/r.D,0)+' > 30: cek kelangsingan & tekuk/lateral.');
  if(r.Qp/r.Qu>.7)w.push('i Tahanan ujung dominan (>70%): sensitif terhadap kebersihan dasar bor. Wajib pembersihan dasar lubang & uji integritas.');
  const n=+v.Pu>0?Math.max(1,Math.ceil(v.Pu/r.Qd)):0;let ef=1,grp='';
  if(n>1){const cols=Math.ceil(Math.sqrt(n)),rw=Math.ceil(n/cols),th=Math.atan(1/v.S)*180/Math.PI;ef=Math.max(.5,1-th*(((rw-1)*cols+(cols-1)*rw)/(90*rw*cols)));
   let n2=n;while(n2*r.Qd*ef<v.Pu&&n2<200){n2++;const c2=Math.ceil(Math.sqrt(n2)),r2=Math.ceil(n2/c2);ef=Math.max(.5,1-th*(((r2-1)*c2+(c2-1)*r2)/(90*r2*c2)))}grp=n2+' tiang (≈'+Math.ceil(n2/Math.ceil(Math.sqrt(n2)))+'×'+Math.ceil(Math.sqrt(n2))+', Eg='+N(ef,2)+')';w.push('i Jarak antar tiang '+N(v.S*r.D,2)+' m (min 2,5D–3D).');}
  else if(n===1)grp='1 tiang';
  const vc=r.At*r.L*1.1,wt=r.At*r.L*v.rho/100*7850;
  const rows=[H_('Kapasitas aksial (Decourt–Quaresma, faktor bored pile)'),R_('Tahanan selimut Qs',N(r.Qs,0),'kN'),R_('Tahanan ujung Qp (N ujung≈'+N(r.Nt,1)+')',N(r.Qp,0),'kN'),R_('Ultimit Qu',N(r.Qu,0),'kN'),
   R_('Ijin tanah = min(Qs/1,3+Qp/4 ; Qu/2,5)',N(r.Qa,0),'kN'),R_('Kapasitas bahan 0,25 f\'c·A',N(r.Pb,0),'kN'),R_('Kapasitas ijin menentukan',N(r.Qd,0),'kN ('+(r.Qd===r.Pb?'bahan':'tanah')+')'),
   +v.Pu>0?H_('Kelompok tiang untuk Pu = '+N(v.Pu,0)+' kN'):0,+v.Pu>0?R_('Jumlah tiang',grp):0,
   H_('Per tiang'),R_('Beton (+10% overbreak)',N(vc,2),'m³'),R_('Galian bor (spoil)',N(r.At*r.L,2),'m³'),R_('Tulangan pokok (est.; belum sengkang)',N(wt,0),'kg'),R_('Luas penampang',N(r.At*1e4,0),'cm²')].filter(Boolean);
  const pw=Math.max(18,Math.min(40,r.D*60)),Hs=150,sc=Hs/Math.max(r.L,r.lay[r.lay.length-1].z),col={L:'#8a6a4a55',M:'#a09a6a55',P:'#d9b86a66'};let b='',zp=0;
  for(const l of r.lay){const y1=Math.min(l.z,Math.max(r.L*1.15,r.L+2));b+=`<rect x="20" y="${20+zp*sc}" width="150" height="${(y1-zp)*sc}" fill="${(col[l.t]||col.L).slice(0,7)}55" stroke="none"/>`+tx(190,20+(zp+y1)/2*sc+3,'N='+l.N+' '+l.t,'start');zp=y1;if(zp>=Math.max(r.L*1.15,r.L+2))break}
  const svg=sv(260,190,b+`<rect ${FILL} x="${95-pw/2}" y="20" width="${pw}" height="${r.L*sc}"/>`+tx(95,20+r.L*sc+12,'Ø'+N(v.D,0)+' cm · L '+N(r.L)+' m'));
  return{rows,w,svg}}};

/* ---- KATALOG GAMBAR ---- */
const CAT={n:'Katalog',i:'📐',html(){
 const tb=(t,h,r)=>`<b>${t}</b><table class="tkt"><tr>${h.map(x=>'<th>'+x+'</th>').join('')}</tr>${r.map(x=>'<tr>'+x.map(y=>'<td>'+y+'</td>').join('')+'</tr>').join('')}</table>`;
 const sl=1e-2*.5;
 return tb('U-Ditch beton (Gbr 4.10.2) – dimensi mm',['Tipe','Bo','B','Ho','D1','A1'],Object.entries(DS).map(([k,t])=>[k,t.bo,t.bo+300,t.h.join('–'),t.d1,t.a1]))+
 '<small>Dinding & dasar 150 mm; Fc\'30; BJTP-240; selimut 30 mm; bevel 30×30; lantai kerja Fc\'10 t=10 cm. Varian tertutup: DS-1A…6A; tidak simetris: DS-2B…5B, 2C…5C.</small>'+
 tb('Bak kontrol (Gbr 4.10.4) – mm',['Pipa Ø','W1','W','H min'],[[400,700,1000,1050],[600,900,1200,1250],[800,1100,1400,1450]])+
 tb('Saluran Tipe V pasangan batu (Gbr 4.10.5) – mm',['Ukuran','Tipe 1','Tipe 2'],[['B1',320,450],['B2',245,367],['H1',450,600],['H2',80,100],['t',80,100],['R',110,150]])+
 tb('Box culvert – semua ukuran standar (tebal saran awal, Manning n=0,013, S=0,5%, terisi 80%)',['Ukuran dalam (m)','t mm','Beton m³/m','Berat t/m','Q80% m³/dt','V m/dt'],STD.map(s=>{const t=tAuto(Math.max(s[0],s[1])),g=boxGeo(s[0],s[1],s[2],t/1e3,t/1e3),c=boxCap(s[0],s[1],s[2],sl,.013);return[(s[2]>1?s[2]+'× ':'')+s[0]+' × '+s[1],t,N(g.A,2),N(g.w,2),N(c.Q8,2),N(c.V8,2)]}))}};

window.__TK={TOOLS,dptCheck,pileCalc,boxGeo,boxCap,tAuto,STD};

/* ===================== UI ===================== */
if(typeof mk!=='function'||typeof ai==='undefined')return;
const css=document.createElement('style');
css.textContent=`#tk{position:fixed;inset:auto 14px 70px auto;width:min(540px,calc(100% - 28px));height:min(82vh,680px);z-index:99999;background:var(--pkbg);color:var(--pkfg);border:1px solid #8886;border-radius:14px;display:none;flex-direction:column;box-shadow:0 8px 30px #0005;font:14px/1.45 system-ui,sans-serif}
#tk header{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid #8884;font-weight:600;position:static;background:none}#tk header span{flex:1}
#tk button,#tk select,#tk input,#tk textarea{font:inherit;color:inherit}#tk .x{background:none;border:0;font-size:18px;cursor:pointer}
#tk nav{display:flex;flex-wrap:wrap;gap:6px;padding:8px 14px;flex:none;overflow:visible}#tk nav button{padding:5px 11px;border-radius:999px;border:1px solid #8886;background:transparent;cursor:pointer;font-size:13px}#tk nav button.on{background:#1f6b4a;color:#fff;border-color:#1f6b4a}
#tkb{flex:1;overflow-y:auto;padding:4px 14px 16px;scrollbar-width:thin}
.tkf{display:grid;grid-template-columns:1fr 1fr;gap:8px}.tkf label{display:flex;flex-direction:column;font-size:12px;opacity:.95;gap:2px}.tkf label.w{grid-column:1/-1}
.tkf input,.tkf select,.tkf textarea{padding:6px 8px;border-radius:8px;border:1px solid #8886;background:transparent}.tkf textarea{height:92px;font:12px monospace}
.tkr{width:100%;border-collapse:collapse;margin-top:8px}.tkr td{padding:4px 6px;border-bottom:1px solid #8883;vertical-align:top}.tkr td:nth-child(2){text-align:right;font-weight:600}.tkr td:nth-child(3){opacity:.7;font-size:12px;white-space:nowrap}
.tkr th{text-align:left;padding:10px 6px 3px;font-size:12px;color:#1f9b69;text-transform:uppercase;letter-spacing:.04em}
.tkw{margin:6px 0 0;padding:6px 10px;border-radius:8px;font-size:13px;background:#8881}.tkw.b{background:#e5484d22}.tkw.g{background:#1f9b6922}
.tkt{width:100%;border-collapse:collapse;font-size:12px;margin:4px 0 8px}.tkt th,.tkt td{border:1px solid #8884;padding:2px 5px;text-align:center}#tkb b{display:block;margin-top:10px}
.tka{display:flex;gap:6px;margin-top:10px}.tka button{padding:6px 12px;border-radius:8px;border:1px solid #8886;background:transparent;cursor:pointer;font-size:12px}
@media print{#tk{display:none!important}}`;
document.head.appendChild(css);
const tk=document.createElement('div');tk.id='tk';tk.innerHTML='<header><span>🏗️ Teknik Pro</span><button class="x" aria-label="Tutup">✕</button></header><nav></nav><div id="tkb"></div>';document.body.appendChild(tk);
const nav=tk.querySelector('nav'),body=tk.querySelector('#tkb'),VAL={};let cur='ud',lastTxt='';
const tabs=[...Object.keys(TOOLS),'cat'];
const draw=()=>{nav.innerHTML='';tabs.forEach(id=>{const t=id==='cat'?CAT:TOOLS[id],b=document.createElement('button');b.textContent=t.i+' '+t.n;b.className=id===cur?'on':'';b.onclick=()=>{cur=id;draw()};nav.appendChild(b)});
 if(cur==='cat'){body.innerHTML=CAT.html();return}
 const T=TOOLS[cur],V=VAL[cur]||(VAL[cur]=Object.fromEntries(T.fields.map(f=>[f.k,f.v])));
 body.innerHTML='<div class="tkf">'+T.fields.map(f=>`<label class="${f.t||String(f.l).length>38?'w':''}">${esc(f.l)}${f.u?' ('+esc(f.u)+')':''}${f.o?'<select data-k="'+f.k+'">'+f.o.map(o=>`<option${String(V[f.k])===String(o)?' selected':''}>${esc(o)}</option>`).join('')+'</select>':f.t==='ta'?'<textarea data-k="'+f.k+'">'+esc(V[f.k])+'</textarea>':'<input data-k="'+f.k+'" type="number" step="any" value="'+esc(V[f.k])+'">'}</label>`).join('')+'</div><div id="tkres"></div>';
 const run=()=>{body.querySelectorAll('[data-k]').forEach(e=>{const f=T.fields.find(x=>x.k===e.dataset.k);V[f.k]=f.t==='ta'?e.value:f.o?(isNaN(parseFloat(f.o[0]))?e.value:+e.value):(parseFloat(e.value)||0)});
  let r;try{r=T.calc(V)}catch(e){r={rows:[],w:['! Input tidak valid: '+e.message],svg:''}}
  lastTxt=T.n+'\n'+r.rows.map(x=>x[0]==='#'?'\n['+x[1]+']':x[0]+': '+x[1]+' '+x[2]).join('\n')+'\n\n'+r.w.join('\n');
  body.querySelector('#tkres').innerHTML=r.svg+'<table class="tkr">'+r.rows.map(x=>x[0]==='#'?'<tr><th colspan="3">'+esc(x[1])+'</th></tr>':'<tr><td>'+esc(x[0])+'</td><td>'+esc(x[1])+'</td><td>'+esc(x[2])+'</td></tr>').join('')+'</table>'+
   r.w.map(x=>`<div class="tkw ${x[0]==='!'?'b':x[0]==='✓'?'g':''}">${esc(x.replace(/^[!i]\s?/,x[0]==='!'?'⚠ ':'ℹ '))}</div>`).join('')+
   '<div class="tka"><button id="tkcp">📋 Salin hasil</button><button id="tkpr">🖨 Cetak</button></div><small style="opacity:.65;display:block;margin-top:8px">Estimasi awal. Bukan pengganti perhitungan struktur/geoteknik, gambar kerja, dan AHSP yang berlaku.</small>';
  body.querySelector('#tkcp').onclick=e=>{navigator.clipboard&&navigator.clipboard.writeText(lastTxt);e.target.textContent='✓ Tersalin'};
  body.querySelector('#tkpr').onclick=()=>{const w=window.open('','_blank');if(w){w.document.write('<pre style="font:13px monospace;white-space:pre-wrap">'+esc(lastTxt)+'</pre>');w.document.close();w.print()}}};
 body.querySelectorAll('[data-k]').forEach(e=>e.oninput=e.onchange=run);run()};
const open=(id,pre)=>{if(id)cur=id;if(pre&&TOOLS[cur]){VAL[cur]=Object.assign(VAL[cur]||Object.fromEntries(TOOLS[cur].fields.map(f=>[f.k,f.v])),pre)}tk.style.display='flex';ai.style.display='none';const pk=document.getElementById('pk');if(pk)pk.style.display='none';draw()};
tk.querySelector('.x').onclick=()=>tk.style.display='none';
mk('🏗️ Teknik',()=>tk.style.display==='flex'?tk.style.display='none':open());

/* ===================== ASISTEN CERDAS (bahasa alami) ===================== */
const nm=(t,k)=>{const m=t.match(new RegExp('(?:'+k+')\\s*[:=]?\\s*(\\d+(?:[.,]\\d+)?)'));return m?parseFloat(m[1].replace(',','.')):null};
const toM=x=>x>1000?x/1000:x>10?x/100:x;
function intent(q){const t=q.toLowerCase().replace(/×/g,'x'),p={};let id=null;
 if(/\bds[\s-]?\d|u[\s-]?ditch|uditch|saluran beton tipe u/.test(t))id='ud';
 else if(/box[\s-]?culvert|gorong[\s-]?gorong (kotak|box)|\bbc\b/.test(t))id='bc';
 else if(/bore[\s-]?pile|bor[\s-]?pile|borpile|tiang bor|pondasi bor/.test(t))id='bp';
 else if(/\bdpt\b|dinding penahan|penahan tanah|retaining/.test(t))id='dp';
 else if(/pasangan batu|batu kali|batu belah|pas\.? batu/.test(t))id='pb';
 else if(/^\s*(kalkulator|teknik|hitung)\s*$/.test(t))return{id:'ud',open:1};
 if(!id)return null;
 const L=nm(t,'panjang|length|\\bl'),Q=nm(t,'debit|\\bq'),Hh=nm(t,'tinggi|\\bh|kedalaman|dalam');
 if(L)p.L=L;
 if(id==='ud'){const d=t.match(/ds[\s-]?(\d)/);if(d)p.tipe='DS-'+d[1];if(/tertutup|penutup/.test(t))p.bentuk=/kendaraan|jalan masuk/.test(t)?'Tertutup - jalan masuk kendaraan':'Tertutup - trotoar';if(/siku/.test(t))p.bentuk='Siku (satu dinding 400 mm)';if(Hh)p.ho=Hh<5?Hh*1000:Hh<200?Hh*10:Hh;if(Q)p.Q=Q;const w=nm(t,'lebar|bo');if(w&&!d){const bo=w<5?w*1000:w<200?w*10:w;p.tipe=Object.keys(DS).reduce((a,k)=>Math.abs(DS[k].bo-bo)<Math.abs(DS[a].bo-bo)?k:a,'DS-1')}}
 if(id==='bc'){const s=t.match(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)/);if(s){p.B=toM(parseFloat(s[1].replace(',','.')));p.H=toM(parseFloat(s[2].replace(',','.')))}const c=t.match(/(\d)\s*(sel|cell|lubang)/)||(/double|ganda/.test(t)?[0,2]:/triple/.test(t)?[0,3]:null);if(c)p.n=+c[1];if(Q)p.Q=Q;const sg=nm(t,'kemiringan|slope');if(sg)p.S=sg;if(/semua ukuran|daftar|tabel/.test(t))return{id:'cat',open:1}}
 if(id==='pb'){const m=t.match(/1\s*:\s*([3-6])/);if(m)p.mix='1:'+m[1];const v=nm(t,'volume|vol');if(v)p.vol=v;if(Hh)p.h=Hh;const b=nm(t,'lebar bawah|bawah'),a=nm(t,'lebar atas|atas');if(b)p.b=b;if(a)p.a=a;if(/plester/.test(t))p.pl='Ya, 1 sisi'}
 if(id==='dp'){if(Hh)p.H=Hh;const f=nm(t,'phi|φ|sudut geser'),q2=nm(t,'beban|surcharge'),b=nm(t,'lebar dasar|lebar bawah|\\bb');if(f)p.phi=f;if(q2)p.q=q2;if(b)p.B=b}
 if(id==='bp'){const d=nm(t,'diameter|dia|ø|\\bd');if(d)p.D=d<=3?d*100:d;if(Hh)p.L=Hh;if(L)p.L=L;const fc=nm(t,"f'?c|mutu");if(fc)p.fc=fc;const P=nm(t,'beban|pu');if(P)p.Pu=P}
 return{id,p}}
const form=ai.querySelector('form'),inp=ai.querySelector('#aiq');
const respond=(q,r)=>{say('u',q);
 if(r.open){open(r.id);say('b','Membuka '+(r.id==='cat'?'katalog ukuran.':'panel Teknik Pro. Pilih tab U-Ditch, Box Culvert, Pasangan Batu, DPT, atau Bore Pile.'));return}
 const T=TOOLS[r.id],V=Object.assign(Object.fromEntries(T.fields.map(f=>[f.k,f.v])),r.p);
 if(r.id==='bc'&&V.n)V.n=String(V.n);
 let res;try{res=T.calc(Object.assign({},V,r.id==='bc'?{n:+V.n,seg:+V.seg}:{}))}catch(e){say('b','Maaf, parameter belum cukup: '+e.message);return}
 const key=res.rows.filter(x=>x[0]!=='#').slice(0,9).map(x=>'• '+x[0]+': '+x[1]+(x[2]?' '+x[2]:'')).join('\n'),wr=res.w.slice(0,4).join('\n');
 const used=Object.keys(r.p).length?'Parameter terbaca: '+Object.entries(r.p).map(([k,v])=>k+'='+v).join(', ')+'. Sisanya memakai nilai standar.':'Tidak ada angka terbaca, memakai contoh standar. Sebutkan ukuran, mis. "box culvert 2x2 panjang 50 m debit 4".';
 const d=say('b',T.n+' — hasil estimasi:\n'+key+(wr?'\n\n'+wr:'')+'\n\n'+used);
 const rf=document.createElement('span');rf.className='rf';
 const b1=document.createElement('button');b1.textContent='Buka kalkulator lengkap + gambar skema';b1.onclick=()=>{VAL[r.id]=V;open(r.id)};rf.appendChild(b1);rf.appendChild(document.createElement('br'));
 const b2=document.createElement('button');b2.textContent='Cari rujukan di dokumen Spesifikasi';b2.onclick=()=>{form._by=1;inp.value=q.replace(/\d+(?:[.,]\d+)?\s*(x\s*\d+)?/g,' ');form.dispatchEvent(new Event('submit',{cancelable:true}));form._by=0};rf.appendChild(b2);d.appendChild(rf);
 if(typeof speak==='function')speak(T.n+': '+(res.rows.find(x=>x[0]!=='#')||[])[0]+' '+((res.rows.find(x=>x[0]!=='#')||[])[1]||''));
 log2()};
const log2=()=>{const l=ai.querySelector('#ail');if(l)l.scrollTop=l.scrollHeight};
form.addEventListener('submit',e=>{const q=inp.value.trim();if(!q||form._by)return;const r=intent(q);if(!r)return;e.stopImmediatePropagation();e.preventDefault();inp.value='';respond(q,r)},true);
})();
