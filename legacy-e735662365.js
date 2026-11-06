document.documentElement.classList.add('js');if(location.hash.length>1)document.documentElement.classList.add('hash-ld');
;
(function(){var s=document.getElementById('an-ind');if(!s)return;s.addEventListener('change',function(){var t=s.options[s.selectedIndex].text;document.querySelectorAll('#annai .an-cv').forEach(function(i){i.src='assets/annai/'+s.value+'-'+i.dataset.n+'.jpg';i.parentNode.href=i.src;i.alt=i.alt.replace(/・[^）]+）$/,' · '+t+'）');});});})();
;
(function(){var g=document.querySelector('#annai .an-g'),d=document.querySelectorAll('#annai .an-d i'),c=document.querySelector('#annai .an-c');if(!g||!c)return;function u(){var w=g.firstElementChild.getBoundingClientRect().width+16,n=Math.min(4,Math.round(g.scrollLeft/w));d.forEach(function(e,i){e.classList.toggle('on',i===n);});c.textContent=(n+1)+' / 5';}g.addEventListener('scroll',u,{passive:true});u();})();
;
(function(){var g=document.querySelector('#annai .an-g');document.querySelectorAll('#annai .an-nav button').forEach(function(b){b.addEventListener('click',function(){var li=g.children[+b.dataset.i];if(g.scrollWidth>g.clientWidth+4){g.scrollTo({left:li.offsetLeft-g.offsetLeft,behavior:'smooth'});}else{li.scrollIntoView({behavior:'smooth',block:'center'});}});});})();
;
(function(){var g=document.querySelector('#annai .an-g');function go(d){var w=g.firstElementChild.getBoundingClientRect().width+16;g.scrollBy({left:d*w,behavior:'smooth'});}var p=document.querySelector('#annai .an-prev'),n=document.querySelector('#annai .an-next');p&&p.addEventListener('click',function(){go(-1)});n&&n.addEventListener('click',function(){go(1)});})();
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