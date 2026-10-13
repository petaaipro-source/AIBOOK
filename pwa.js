/* Tombol instal PWA (manifest statis: manifest.webmanifest) */
(function(){
var g=function(i){return document.getElementById(i)},btn=g('inst'),ios=g('ios'),dp=null;
var standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
if(standalone)return;
addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e;btn.style.display='flex'});
addEventListener('appinstalled',function(){dp=null;btn.style.display='none';ios.style.display='none'});
btn.addEventListener('click',function(){if(!dp)return;dp.prompt();dp.userChoice.finally(function(){dp=null;btn.style.display='none'})});
var ua=navigator.userAgent,isIOS=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(isIOS){ios.innerHTML='Untuk memasang di iPhone/iPad: ketuk tombol <b>Bagikan</b> (kotak dengan panah), lalu pilih <b>Tambah ke Layar Utama</b>.';ios.style.display='block'}
else if(!/^https:|^http:\/\/localhost/.test(location.href.slice(0,17))&&location.protocol!=='https:'){/* instal butuh HTTPS */}
})();
