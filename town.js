const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
const spots={hotel:['01 / START','宿から、まちへ。','朝食前の散歩も、夕方の寄り道も。この宿を起点に、まちの楽しみ方を届けます。'],garden:['02 / NATURE','庭園で、立ち止まる。','木の影、水の流れ、季節の変化。目の前の風景に気づく、小さな問いをひらきます。'],bridge:['03 / HISTORY','橋から、土地の記憶へ。','「土地の記憶」を選ぶと、かつての水路を模式的に重ねます。実際の制作では、典拠を確認して過去と現在を結びます。'],atelier:['04 / PEOPLE','まちを支える、仕事に出会う。','工房の仕事や作り手の思いを紹介。お店のホームページへつながる入口をつくります。']};
document.querySelectorAll('[data-spot]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-spot]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const v=spots[b.dataset.spot];['spot-num','spot-title','spot-copy'].forEach((id,i)=>document.getElementById(id).textContent=v[i]);}));
document.querySelectorAll('button[data-era]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('.map').dataset.era=b.dataset.era;document.querySelectorAll('button[data-era]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.getElementById('era-copy').textContent=b.dataset.era==='past'?'かつての水路を重ねた模式図です。架空の場所を使った操作見本で、実在の歴史を再現したものではありません。':'現在のまちの模式図です。地点を押して紹介を切り替えられます。';}));
document.querySelector('.copy')?.addEventListener('click',async()=>{const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText('info@morikosha.com');status.textContent='コピーしました。';}catch{status.textContent='コピーできませんでした。上のメールアドレスを選択してコピーしてください。';}});
if(location.hash==='#legal'||location.hash==='#pp'){document.querySelector('.legal')?.setAttribute('open','');requestAnimationFrame(()=>document.querySelector(location.hash)?.scrollIntoView());}
window.addEventListener('hashchange',()=>{if(['#legal','#pp'].includes(location.hash)){document.querySelector('.legal')?.setAttribute('open','');document.querySelector(location.hash)?.scrollIntoView();}});

// Preserve historic links from sales materials and existing samples.
const historic={"#works":"website.html","#price":"price.html","#erabot":"hikaku.html","#contact":"contact.html"};
if((location.pathname.endsWith('/')||location.pathname.endsWith('/index.html'))&&historic[location.hash])location.replace(historic[location.hash]);
