document.documentElement.classList.add('js');if(location.hash.length>1)document.documentElement.classList.add('hash-ld');
;
(function(){var m=document.querySelector('.hero-mz');if(!m||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var t=[].slice.call(m.querySelectorAll('.mz')),i=0;t.forEach(function(d){d._p=d.dataset.p.split(',');d._i=0;});
setInterval(function(){if(document.hidden)return;var d=t[i++%t.length];if(d.offsetParent===null)return;d._i=(d._i+1)%d._p.length;
var o=d.querySelector('img.on'),n=new Image();n.alt='';n.onload=function(){d.appendChild(n);requestAnimationFrame(function(){n.className='on';if(o){o.className='';setTimeout(function(){o.remove()},1500);}});};
n.src='assets/'+d._p[d._i]+'.jpg';},2200);})();
;
(function(){
  function href(el){var f=el.closest('figure');var a=f&&f.querySelector('.dv-go,.mado-go');if(a)return a.href;var l=el.closest('a[href]');return l?l.href:null;}
  document.addEventListener('click',function(e){var d=e.target.closest('.about-mihon .dv,.mado-sc');if(!d||e.target.closest('a'))return;var h=href(d);if(h){e.preventDefault();window.open(h,'_blank','noopener');}});
  function hook(fr){if(fr._mk)return;fr._mk=1;fr.addEventListener('load',function(){try{var doc=fr.contentDocument,x=0,y=0;
    doc.addEventListener('pointerdown',function(ev){x=ev.clientX;y=ev.clientY;},true);
    doc.addEventListener('click',function(ev){if(Math.abs(ev.clientX-x)+Math.abs(ev.clientY-y)>6)return;ev.preventDefault();ev.stopPropagation();var h=href(fr);if(h)window.open(h,'_blank','noopener');},true);}catch(_){}});}
  new MutationObserver(function(){document.querySelectorAll('.mado-sc iframe').forEach(hook);}).observe(document.documentElement,{childList:true,subtree:true});
})();
;
(function(){var hd=document.getElementById("hd");if(!hd)return;function s(){if(!hd.classList.contains("is-solid"))hd.classList.add("is-solid");}s();new MutationObserver(s).observe(hd,{attributes:true,attributeFilter:["class"]});})();