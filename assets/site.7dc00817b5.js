(function(){
  /* 2026-09-30 えらぼっとは別ページ（erabot.html）にした。営業メールや見本ページの「#erabot」で本体に来たら、えらぼっとのページへ送る
     （本体の #erabot は ABOUT の中の小さな受け口。JS が無いときは、その中のリンクで行ける） */
  if(location.hash === '#erabot' && document.documentElement.getAttribute('data-page') !== 'erabot'){
    location.replace('erabot.html' + location.search);
    return;
  }
  window.addEventListener('hashchange', function(){ if(location.hash === '#erabot' && document.documentElement.getAttribute('data-page') !== 'erabot') location.href = 'erabot.html'; });
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hd = document.getElementById('hd'), hero = document.getElementById('top');
  var mcta = document.getElementById('mcta'), tab = document.getElementById('tab');

  /* ── 頭の帯：扉の上では大きな紋のロゴ、扉を過ぎたら細い白い帯。追従の札も扉を過ぎてから出す ── */
  var pastHero = false, atContact = false, atSheet = false;
  function tabShow(){
    var on = pastHero && !atContact;
    if(mcta){ mcta.classList.toggle('on', on); mcta.inert = !on; if(!on) mcta.setAttribute('aria-hidden', 'true'); else mcta.removeAttribute('aria-hidden'); }
    var tOn = on && !atSheet;
    if(tab){ tab.style.opacity = tOn ? '1' : '0'; tab.style.pointerEvents = tOn ? '' : 'none'; tab.tabIndex = tOn ? 0 : -1; }
  }
  /* 第4周：大きなロゴの帯（透明・高さ210px）は、扉の一番上にいるときだけ。少しでも巻いたら細い白い帯へ移す
     （透明のまま巻くと、大きなロゴが扉の下の章や扉の添え書きに重なるため。楽芸工房も早めに小さい帯へ移る） */
  function solidTop(){ hd.classList.toggle('is-solid', window.scrollY > 48 || !hero); }
  solidTop();
  window.addEventListener('scroll', solidTop, {passive:true});
  function solid(past){
    pastHero = past;
    tabShow();
  }
  /* お問い合わせ欄と奥付が見えているあいだは、追従の札を引っ込める（同じ行き先の札が重なるため） */
  if('IntersectionObserver' in window){
    /* 2026-10-01 第8周L：本文の黒い「お問い合わせ →」（ABOUT の要点の帯の下など）が見えている間も追従バーを引っ込める（同じ釦が1画面に縦に2つ並んでいた） */
    /* 2026-10-01 修正役V f1：見本の窓（スマホの枠）が見えているあいだも引っ込める（375×667 で枠の下端が追従バーに隠れていた） */
    var ends = [document.getElementById('contact'), document.querySelector('footer'), document.querySelector('.mado-dev')].concat([].slice.call(document.querySelectorAll('main a.box-ln[href="#contact"]'))).filter(Boolean), seen = new Set();
    var eo = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      atContact = seen.size > 0; tabShow();
    });
    ends.forEach(function(el){ eo.observe(el); });
    /* ご記入シートと「メールを書く」の枠が見えているあいだも、右下の札を引っ込める（黒い釦どうしが重なるため） */
    /* 2026-10-01 第3周：業種の札と見本の窓が見えているあいだも引っ込める（1280 付近で札が右列の札と窓の右端に掛かっていた） */
    var boxes = [].slice.call(document.querySelectorAll('.sheet,.send,.chips,.mado-stage')), seenB = new Set();
    var bo = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) seenB.add(e.target); else seenB.delete(e.target); });
      atSheet = seenB.size > 0; tabShow();
    });
    boxes.forEach(function(el){ bo.observe(el); });
  }
  /* スマホでは、下へ読み進めているあいだ頭の帯を隠し、上へ戻したら出す（上下の固定帯で画面が狭くならないように） */
  var lastY = window.scrollY, narrow = window.matchMedia('(max-width:900px)'), jumpUntil = 0;
  /* ページ内のリンクで飛んだ直後は帯を隠さない（続けて別の章へ行けるように） */
  document.addEventListener('click', function(e){ var a = e.target.closest && e.target.closest('a[href^="#"]'); if(a) jumpUntil = Date.now() + 1600; });
  window.addEventListener('scroll', function(){
    var y = window.scrollY, d = y - lastY;
    if(Math.abs(d) < 6) return;
    if(Date.now() < jumpUntil){ hd.classList.remove('is-hidden'); lastY = y; return; }
    var hide = narrow.matches && pastHero && d > 0 && y > 200 && !(mn && mn.classList.contains('open')) && !hd.contains(document.activeElement);
    hd.classList.toggle('is-hidden', hide);
    lastY = y;
  }, {passive:true});
  /* 2026-10-19 P4：えらぼっとのページは扉（#top）が無く、最初から追従バーが出て「月額 9,800円」の行を隠していた。えらぼっとの扉（.era-door）を同じ扱いにする */
  var door = hero || document.querySelector('.era-door');
  if(door && 'IntersectionObserver' in window){
    new IntersectionObserver(function(es){ solid(!es[0].isIntersecting); }, {rootMargin:'-90px 0px 0px 0px'}).observe(door);
  } else { solid(true); }

  /* ── いま読んでいる章を、頭の帯の文字に短い線で示す ── */
  var links = [].slice.call(document.querySelectorAll('.nav a'));
  /* 方針第2版（B7）：ナビに無い章は、近い章の印を付けたままにする（WHY の間は Service、FAQ・FLOW の間は Contact）。印が消える区間を作らない */
  /* 2026-09-30 再設計：ナビは ABOUT・WORKS・PRICE・FLOW・PROFILE・CONTACT。WHY の間は About、FAQ の間は Contact に印を付けたままにする */
  /* 2026-10-01：FAQ の間はどの印も付けない（まだ来ていない CONTACT に印が付いて見えたため） */
  /* 2026-10-01 第2周：FAQ の間は直前の PROFILE の印を残す（印が一度消えて見えたため） */
  var navOf = {why:'about', faq:'profile'};
  var curId = '', markNav = null;
  if('IntersectionObserver' in window){
    /* 2026-10-01 第6周 修正役L：ABOUT は画面に入ったまま IO が二度と呼ばれず、扉判定で消えた印が戻らなかった。
       最後に捉えた章を curId に覚え、スクロールが止まったとき（下の clearTop）に扉を出ていれば付け直す */
    var markNav = function(id){
      links.forEach(function(a){
        var on = !!id && a.getAttribute('href') === '#' + id;
        a.classList.toggle('cur', on);
        if(on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    };
    var io = new IntersectionObserver(function(es){
      /* 2026-10-01 第7周L：同じ時に2つの章が入ったら、上端が下にある方（あとから入った章）に印を付ける（一気に着いたとき、前の章の下端 0.09px が残って PRICE に印が付いていた） */
      var best = null;
      es.forEach(function(e){
        if(!e.isIntersecting || e.intersectionRect.height < 2) return;
        if(!best || e.boundingClientRect.top > best.boundingClientRect.top) best = e;
      });
      if(best){ curId = navOf[best.target.id] || best.target.id; markNav(curId); }
      /* 2026-10-01 修正役L 第3周：下から扉へ一気に戻る途中で ABOUT の印が付き、扉に着いたあとも一瞬残っていた。印を付けた直後にも扉かどうかを見る */
      if(typeof clearTop === 'function') clearTop();
    /* 第10周：章の上端が頭の帯の下から画面の上 1/3 に入ったときに印を付ける（扉がまだ画面の上に残っているうちに ABOUT に印が付いていた） */
    }, {rootMargin:'-72px 0px -64% 0px'});
    links.forEach(function(a){ var h = a.getAttribute('href'); if(h.charAt(0) !== '#') return; var s = document.querySelector(h); if(s) io.observe(s); });
    document.querySelectorAll('#why, #faq').forEach(function(s){ io.observe(s); });
  }
  /* 2026-10-01 第3周：扉まで戻ったら（最初の章が頭の帯の下に来ていない間は）どの印も外す。下から戻ると最後の章の印が扉の上に残っていた */
  var firstSec = document.getElementById('about');
  if(firstSec && hero){
    var clearTop = function(){
      if(window.scrollY + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hd')) || 72) < firstSec.offsetTop - 8)
        links.forEach(function(a){ if(a.getAttribute('href').charAt(0) === '#'){ a.classList.remove('cur'); a.removeAttribute('aria-current'); } });
      else if(markNav){
        /* 2026-10-01 第7周L：送りが止まったら、帯の中（頭の帯の下から画面の上 36%）にいま入っている章を測り直して印を合わせる
           （IO は境を越えたときしか呼ばれないので、一気に着いたときや、1px 未満だけ入った章を取りこぼさない） */
        var hdH0 = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hd')) || 72, zb = innerHeight * .36, now = '';
        document.querySelectorAll('#about, #why, #works, #price, #flow, #profile, #faq, #contact').forEach(function(sc){
          var r = sc.getBoundingClientRect(); if(r.top <= zb && r.bottom > hdH0 + 2) now = sc.id;
        });
        if(now){ curId = navOf[now] || now; }
        if(curId) markNav(curId);
      }
    };
    window.addEventListener('scroll', function(){ clearTimeout(clearTop.t); clearTop.t = setTimeout(clearTop, 80); }, {passive:true});
  }

  /* ── 方針第2版（B8）：メニューから飛んだときの着地を全章でそろえる。章の英字の札（.sec-h）が頭の帯の下 50px に来るよう、
     章ごとに「章の上端から札までの距離」を測って scroll-margin-top を決める（帯のある章・余白で入る章・炭の章で同じ見え方） ── */
  function landing(){
    var hdH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hd')) || 72;
    var pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    /* 2026-10-01 修正役L 第2周：章の頭の余白をどの章も同じ値にそろえたので、着地は「章の上端が頭の帯のすぐ下」に一本化する。
       前は題箋の位置でそろえていたため、帯の絵で始まる WORKS では絵を飛ばして着き（スマホで上端 -109px）、ページ内とハッシュ付きで見え方が違った */
    document.querySelectorAll('main section[id]').forEach(function(sec){
      if(sec.id === 'top') return;
      sec.style.scrollMarginTop = Math.round(hdH - pad) + 'px';
    });
  }
  landing();
  window.addEventListener('resize', function(){ clearTimeout(landing.t); landing.t = setTimeout(landing, 150); });
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(landing);
  window.addEventListener('load', function(){
    landing();
    /* 営業メール・見本ページから #price などで来たときも、そろえた位置に着く */
    if(location.hash.length > 1){
      var t = document.getElementById(location.hash.slice(1));
      /* 着いた直後は頭の帯を隠さない（スマホで、読み込みの送りを「下へ読み進めた」と取り違えて帯が消えていた） */
      if(t){ jumpUntil = Date.now() + 1600; hd.classList.remove('is-hidden'); lastY = window.scrollY; }
      if(t && t.tagName === 'SECTION'){
        t.scrollIntoView({block:'start', behavior:'instant'});
        /* 一気に着くと、途中の章（前の章の下端）に印が残ることがあるので、着いた章に印を付け直す */
        if(markNav){ curId = navOf[t.id] || t.id; markNav(curId); }
      }
    }
    /* 2026-10-01 第7周L：ハッシュ付きで開いたときは送りを滑らかにしない（約1.5秒かけて途中の章を空白のまま流して見せていた）。着地の後で滑らかな送りに戻す */
    setTimeout(function(){ document.documentElement.classList.remove('hash-ld'); }, 300);
  });

  /* ── スマホのメニュー ── */
  var mb = document.getElementById('menu-btn'), mn = document.getElementById('mnav'), mc = document.getElementById('mnav-close');
  function menu(open){
    mn.classList.toggle('open', open);
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    (open ? mc : mb).focus();
  }
  mb.addEventListener('click', function(){ menu(true); });
  mc.addEventListener('click', function(){ menu(false); });
  mn.addEventListener('click', function(e){
    var a = e.target.closest('a'); if(!a) return;
    menu(false);
    /* 2026-10-01 修正役L 第3周：章へ飛んだら、焦点をその章の見出しへ移す（読み上げ・キーボードで今いる所が伝わるように） */
    var h = a.getAttribute('href') || '';
    if(h.charAt(0) === '#' && h.length > 1){
      var sec = document.getElementById(h.slice(1)), hh = sec && sec.querySelector('h1, h2');
      if(hh) setTimeout(function(){ if(!hh.hasAttribute('tabindex')) hh.setAttribute('tabindex', '-1'); hh.classList.add('land-f'); hh.focus({preventScroll:true}); }, 60);
    }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && mn.classList.contains('open')) menu(false); });

  /* ── 扉の写真：◇の印で選べる。動きを減らす設定の人には自動で送らない ── */
  /* 2026-10-01 追加の決定2：3枚目は絵ではなく見本の画面を並べた一枚（.hero-mihon）。中の img は数えない */
  var hs = [].slice.call(document.querySelectorAll('.hero-ph>img,.hero-ph>picture>img,.hero-ph>.hero-mihon'));
  var dots = [].slice.call(document.querySelectorAll('.dots button'));
  var num = document.getElementById('hero-num'), cap = document.getElementById('hero-cap'), hk = 0, timer = null;
  /* 絵の地（紙か金か）を扉に写す。上の霞の色と、金雲の重ね方（art.js）がこれを見る */
  function tone(){
    var im = hs[hk]; if(!im || !hero) return;
    hero.setAttribute('data-tone', im.getAttribute('data-tone') || 'paper');
    /* 第8周 修正役V：何枚目の絵か（CSS が絵ごとの霞・札の置き方を選ぶ） */
    hero.setAttribute('data-slide', String(hk + 1));
    /* 絵の名は、重なりの半ば（0.9秒）で替える。先に替えると、前の絵の上に次の絵の名が出る */
    if(cap){
      var t = im.getAttribute('data-cap') ? (im.getAttribute('data-capk') || '絵') + '：' + im.getAttribute('data-cap') : '';
      clearTimeout(tone.t);
      if(!cap.textContent || reduce) cap.textContent = t; else tone.t = setTimeout(function(){ cap.textContent = t; }, 800);
    }
  }
  /* 第5周：絵の替わり方は重ね溶かし（二重写しで画面が濁る）をやめ、屏風を開くように右から左へ拭き取る（1.4秒）。
     前の絵は、次の絵が開き終わるまで下に残し、開き終わってから外す */
  /* 2026-10-19 P4：後ろの扉の絵は data-src で待たせ、1つ前の扉を出したときに読みはじめる */
  function ld(el){
    if(!el) return;
    var im = el.tagName === 'IMG' ? el : null; if(!im) return;
    var pc = im.parentElement && im.parentElement.tagName === 'PICTURE' ? im.parentElement : null;
    if(pc) [].forEach.call(pc.querySelectorAll('source[data-srcset]'), function(s){ s.setAttribute('srcset', s.getAttribute('data-srcset')); s.removeAttribute('data-srcset'); });
    if(im.getAttribute('data-src')){ im.setAttribute('src', im.getAttribute('data-src')); im.removeAttribute('data-src'); }
  }
  function show(i){
    if(!hs.length) return;
    ld(hs[(i + hs.length) % hs.length]); ld(hs[(i + 1 + hs.length) % hs.length]);
    var prev = hs[hk];
    prev.classList.remove('on'); prev.classList.add('was'); if(dots[hk]) dots[hk].setAttribute('aria-current', 'false');
    hk = (i + hs.length) % hs.length;
    hs[hk].classList.remove('was'); hs[hk].classList.add('on'); if(dots[hk]) dots[hk].setAttribute('aria-current', 'true');
    clearTimeout(show.t);
    show.t = setTimeout(function(){ hs.forEach(function(im){ if(!im.classList.contains('on')) im.classList.remove('was'); }); }, reduce ? 0 : 1650);
    if(num) num.textContent = ('0' + (hk + 1)).slice(-2);
    tone();
    try{ hero.dispatchEvent(new CustomEvent('heroslide')); }catch(e){}
  }
  tone();
  function auto(){ if(timer) clearInterval(timer); if(!reduce && hs.length > 1) timer = setInterval(function(){ show(hk + 1); }, 9500); }
  /* 2026-10-01 第3周：送りは 9.5 秒（6.5 秒では屏風を見る間が無く、落ち着かなかった）。絵の名は重なりの半ば（800ms）で替える */
  /* ◇を押したら自動送りを止める。マウスを載せている間・キーボードで扉の中にいる間も止める（WCAG 2.2.2） */
  var picked = false;
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }
  dots.forEach(function(b, i){ b.addEventListener('click', function(){ picked = true; stop(); show(i); }); });
  if(hero){
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', function(){ if(!picked) auto(); });
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', function(e){ if(!picked && !hero.contains(e.relatedTarget)) auto(); });
  }
  auto();

  /* ── 業種：選んだものを覚える。ご記入シートと「デザイン詳細」を業種に合わせる ── */
  function cur(){ return document.querySelector('input[name="pv-ind"]:checked'); }
  function dlFollow(){
    var a = document.getElementById('dl-sheet'), r = cur();
    if(a && r){
      a.setAttribute('href', 'assets/kinyu-' + r.id.replace('pi-','') + '.xlsx');
      /* 保存するときの名前も業種ごとに（2つ落としても見分けられるように） */
      var lb = document.querySelector('label[for="' + r.id + '"]');
      if(lb) a.setAttribute('download', 'ご記入シート_' + lb.textContent + '.xlsx');
      /* 第10周：釦の字にも業種名を出す（押す前に、どの業種のシートかが分かるように） */
      /* 第8周 修正役V：『ご記入シート』と『（業種）.xlsx』の2つの塊にし、塊の境目でだけ折り返す（『建築設／計』『神／社』と割れていた） */
      var dn = a.querySelector('.dl-n');
      if(dn && lb){
        var s1 = document.createElement('span'), s2 = document.createElement('span');
        s1.className = s2.className = 'nw'; s1.textContent = 'ご記入シート'; s2.textContent = '（' + lb.textContent + '）.xlsx';
        dn.textContent = ''; dn.appendChild(s1); dn.appendChild(s2);
      }
    } else if(a){
      /* 2026-10-01 修正役L f2：業種を選ぶ前も『ご記入シート』と『.xlsx』の2つの塊にする（PC で『.xlsx』だけが2行目に落ち、釦の高さが他とずれていた）。字は変えない */
      var d0 = a.querySelector('.dl-n');
      if(d0 && d0.textContent === 'ご記入シート.xlsx' && d0.querySelectorAll('.nw').length < 2){
        var t1 = document.createElement('span'), t2 = document.createElement('span');
        t1.className = t2.className = 'nw'; t1.textContent = 'ご記入シート'; t2.textContent = '（共通）.xlsx';
        d0.textContent = ''; d0.appendChild(t1); d0.appendChild(t2);
      }
    }
  }
  /* 代表の「経歴・資格」：PC では左の段に開いたまま置き、900px 以下では閉じて始める（JS が無いときは開いたまま） */
  /* 2026-10-01 修正役V（第2周）：どの幅でも閉じて始める（page.html で open を外した）。PC で左の段だけが 400px 長く残っていたため */
  var live = document.getElementById('chip-live'), chipPtr = 0;
  document.addEventListener('pointerdown', function(e){ if(e.target.closest && e.target.closest('.chip')) chipPtr = Date.now(); });
  /* 業種のラジオは見えない所（札の一覧より上）にあるので、Tab で焦点が来たら、対応する札を画面に入れる */
  document.querySelectorAll('input[name="pv-ind"]').forEach(function(r){
    r.addEventListener('focus', function(){
      var lab = document.querySelector('label[for="' + r.id + '"]');
      if(lab) setTimeout(function(){ var b = lab.getBoundingClientRect(); if(b.top < 90 || b.bottom > innerHeight - 20) lab.scrollIntoView({block: 'center', behavior: reduce ? 'auto' : 'smooth'}); }, 0);
    });
  });
  /* 2026-10-01 修正役L 第5周：札ごとに付けず、document で change を受ける（札の一覧を後から差し替えても、付け漏れが起きないように） */
  document.addEventListener('change', function(ev){
    var r = ev.target;
    if(!r || r.name !== 'pv-ind') return;
    (function(){
      try{ sessionStorage.setItem('pv-ind', r.id); }catch(e){}
      dlFollow();
      var lab = document.querySelector('label[for="' + r.id + '"]'), name = lab ? lab.textContent : '';
      if(live) live.textContent = name + 'の見本を窓に映しました ↓';
      /* 見本の窓が画面の下半分より下にあるときは、窓まで送る（2026-10-01 昼：五曲の扇を外したので、行き先は窓）。
         札を指やマウスで押したときだけ（キーボードの矢印で業種を渡り歩くあいだは、札を画面に残す） */
      var mado = document.getElementById('mado'), list = mado && mado.querySelector('.mado-stage');
      if(list && (narrow.matches || Date.now() - chipPtr < 1500)){
        var to = mado;
        /* PC では札の一覧を画面に残したまま、窓が覗くところまでだけ送る（業種を見比べるたびに上へ戻さなくてよいように） */
        var chipsEl = lab && lab.closest('.chips');
        if(!narrow.matches && chipsEl){
          /* 窓を下端まで画面に入れる。札の段の頭が頭の帯の下に残るならそこまで。両方は入らない低い画面では、選んだ札が頭の帯の下に残るところで止める */
          var hdH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hd')) || 72;
          var dyList = list.getBoundingClientRect().bottom - innerHeight + 16, dyChips = chipsEl.getBoundingClientRect().top - (hdH + 16);
          var dyLab = lab.getBoundingClientRect().top - (hdH + 12);
          var dy = dyList <= dyChips ? dyList : Math.min(dyList, dyLab);
          if(dy > 8) window.scrollBy({top: dy, behavior: reduce ? 'auto' : 'smooth'});
        } else {
          /* スマホ・タブレットは窓の札の段を画面の上端近くに着ける。下へ送るあいだ頭の帯は隠れるので、帯の高さを空けない。上へ戻るときは帯の下に着ける */
          var hdN = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hd')) || 62;
          var tt = to.getBoundingClientRect().top, goY = window.scrollY + tt - (tt < 0 ? hdN + 10 : 10);
          if(Math.abs(goY - window.scrollY) > 8) window.scrollTo({top: goY, behavior: reduce ? 'auto' : 'smooth'});
        }
      }
    })();
  });
  try{
    var saved = sessionStorage.getItem('pv-ind'), ri = saved && document.getElementById(saved);
    if(ri){
      ri.checked = true;
      var rl = document.querySelector('label[for="' + ri.id + '"]');
      if(live && rl) live.textContent = rl.textContent + 'の見本を窓に映しています';
    }
  }catch(e){}
  dlFollow();

  /* ── 章の字と絵が、画面に入るときにふわりと出る。絵は巻物を広げるように左から開く ── */
  if(!reduce && 'IntersectionObserver' in window){
    var rvs = [].slice.call(document.querySelectorAll('.sec-h, .pair, .diagram, .rs, .plan, .pr, .pr-notes, .daiko, .proc, .erabo-plan, .era-lead, .step-h, .step-p, .fl, .dz-note, .pf-r > *, .qa, .contact-in > *, .to-erabot, .works-lead'));
    /* スマホ・タブレットでは、本文の中の絵（互い違いの絵・PROFILE の絵）は巻き開かずに最初から見せる（速く送ったときに空白の面を見せない） */
    /* PROFILE の左の段（絵と名前）は画面に貼り付いて追従するので、出てくる動きを付けない（着いた瞬間に空白を見せない） */
    var scr = [].slice.call(document.querySelectorAll(narrow.matches ? '.contact-art' : '.about-art, .contact-art'));
    rvs.forEach(function(el){ el.classList.add('rv'); });
    scr.forEach(function(el){ el.classList.add('rv-scroll'); });
    /* 切り抜いた絵そのものは「見えていない」と数えられるので、見張るのは親。親が画面に入ったら中の絵を開く */
    var watch = new Map();
    /* 同じときに画面に入ったものは、文書の順に 90ms ずつ遅らせて出す（見出し → 本文 → 札） */
    function reveal(list){
      list.sort(function(a, b){ return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
      list.forEach(function(el, i){
        if(el.classList.contains('rv')) el.style.transitionDelay = Math.min(i, 4) * 60 + 'ms';
        /* 絵は読み込みが終わってから開く（読み込み中に白い囲みだけが浮かないように） */
        var im = el.classList.contains('rv-scroll') && el.querySelector('img');
        if(im && !im.complete){
          var go = function(){ el.classList.add('in'); };
          im.addEventListener('load', go, {once:true}); im.addEventListener('error', go, {once:true});
        } else el.classList.add('in');
      });
    }
    var ro = new IntersectionObserver(function(es){
      var batch = [];
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        batch = batch.concat(watch.get(e.target) || []);
        watch.delete(e.target); ro.unobserve(e.target);
      });
      if(batch.length) reveal(batch);
    }, {rootMargin: narrow.matches ? '0px 0px 30% 0px' : '0px 0px 10% 0px', threshold:0});
    /* 絵は画面に入る 600px 手前から先に読み込ませる（遅延読み込みの絵が、開く瞬間にまだ届いていないことがないように） */
    if('IntersectionObserver' in window){
      var pre = new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return; var im = e.target.querySelector('img[loading="lazy"]'); if(im) im.loading = 'eager'; pre.unobserve(e.target); }); }, {rootMargin:'0px 0px 600px 0px'});
      document.querySelectorAll('.about-art, .band, .contact-art, .pf-l .ph').forEach(function(el){ pre.observe(el); });
    }
    var first = [];
    rvs.concat(scr).forEach(function(el){
      var r = el.getBoundingClientRect();
      if(r.top < innerHeight && r.bottom > 0){ first.push(el); return; }
      var t = el.classList.contains('rv-scroll') ? el.parentElement : el;
      if(!watch.has(t)){ watch.set(t, []); ro.observe(t); }
      watch.get(t).push(el);
    });
    reveal(first);
    /* 2026-10-01 第7周L：ハッシュ付きで開いたときは、着地先の章の字を動きなしで最初から見せる */
    if(location.hash.length > 1){
      var ht = document.getElementById(location.hash.slice(1));
      if(ht) rvs.forEach(function(el){ if(!el.classList.contains('in') && ht.contains(el)){ el.style.transition = 'none'; el.style.transitionDelay = '0ms'; el.classList.add('in'); } });
    }
    /* ページ内のリンクや印刷で一気に飛んだときに、出ていないものが残らないように */
    window.addEventListener('beforeprint', function(){ rvs.concat(scr).forEach(function(el){ el.classList.add('in'); }); });
    /* 第3周 B：メニューやリンクで章へ飛んだときは、着いた先の最初の1画面半にある字を、動きを飛ばしてすぐ出す
       （飛んだ直後の 0.5 秒ほど、画面いっぱいが灰の無地になり、壊れたように見えた） */
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a[href^="#"]'); if(!a) return;
      var id = a.getAttribute('href').slice(1); var t = id && document.getElementById(id); if(!t) return;
      var top = t.getBoundingClientRect().top;
      rvs.forEach(function(el){
        if(el.classList.contains('in') || !t.contains(el)) return;
        if(el.getBoundingClientRect().top - top > innerHeight * 1.5) return;
        el.style.transition = 'none'; el.style.transitionDelay = '0ms'; el.classList.add('in');
      });
    }, true);
  }

  /* ── 奥付のプライバシーポリシー：スマホでは閉じて始める（奥付が 1,500px 近くあったため。文面はそのまま。JS が無いときと PC では開いたまま） ── */
  var pp = document.getElementById('pp');
  if(pp && window.matchMedia('(max-width:620px)').matches) pp.open = false;

  /* ── アドレスをコピー ── */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click', function(){
      var t = b.getAttribute('data-copy'), done = function(){ b.textContent = 'コピーしました'; setTimeout(function(){ b.textContent = 'アドレスをコピー'; }, 2200); };
      if(navigator.clipboard) navigator.clipboard.writeText(t).then(done, function(){});
    });
  });
  /* ── 2026-10-02 スマホ版の磨き 第2周・第3周：本文の段落の泣き別れと、屋号の割れを防ぐ（文面は1字も変えない。span で包むだけ）
     段落の最後の和文5字を .nk-end、本文中の「杜工舎」と、プロフィールの「技術職」「部門」を .nw-b で包む。折らない指定は site.css の 620px 以下だけで効く ── */
  (function(){
    var sel = '.pr-face p,#about .about-txt p,#why .ja-b p,#why .rs p:not(.n):not(.src),.works-lead,.dz-note,.daiko-lead,.df-b p,.pf-body p,.qa-a p,.pr-note,#flow .fx-p p,#flow .fx-note p,#contact p:not(.contact-lede):not(.kane),.era-door>p:first-child,.pair p,.credit p';
    function texts(el){ var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), a = [], n; while((n = w.nextNode())) a.push(n); return a; }
    function wrap(node, start, end, cls){
      var r = document.createRange(); r.setStart(node, start); r.setEnd(node, end);
      var sp = document.createElement('span'); sp.className = cls; r.surroundContents(sp); return sp;
    }
    document.querySelectorAll(sel).forEach(function(p){
      if(p.querySelector('.nk-end')) return;
      /* 屋号と、プロフィールの職名・部門名 */
      /* 第3周：値段の表記と言葉の組（（税込）・2週間ほど など）も割らない */
      ['前金なし・2週間ほど', '杜工舎', '技術職', '部門', '（税込）', '（税別）', '98,000円', '50,000円', '20,000円', '2週間ほど', '前金なし', '月額なし'].forEach(function(w){
        texts(p).forEach(function(t){
          var i; while(t && (i = t.data.indexOf(w)) >= 0){
            if(t.parentNode.closest('.nw-b')) break;
            var sp = wrap(t, i, i + w.length, 'nw-b'); t = sp.nextSibling && sp.nextSibling.nodeType === 3 ? sp.nextSibling : null;
          }
        });
      });
      /* 最後の行：段落の末尾の5字（空白は除く。<span> をまたいでもよい）を1つの塊に */
      var all = texts(p), k = 5, st = null;
      for(var j = all.length - 1; j >= 0 && k > 0; j--){
        var t = all[j];
        for(var i = t.data.length - 1; i >= 0 && k > 0; i--){ if(/\S/.test(t.data[i])){ k--; st = {n:t, o:i}; } }
      }
      if(!st || k > 3) return;
      var r = document.createRange(); r.setStart(st.n, st.o); r.setEnd(p, p.childNodes.length);
      var sp = document.createElement('span'); sp.className = 'nk-end';
      sp.appendChild(r.extractContents()); r.insertNode(sp);
    });
  })();
})();

/* 2026-10-19 ペルソナ評価 第1周（P4）：2画面以上離れたページ内の移動は、滑らかに送らず一気に送る
   （4,700px を滑らかに送ると1.5秒止まって見え、キーボードの人が「効かなかった」ともう一度押す） */
(function(){
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if(!a) return;
    var id = a.getAttribute('href').slice(1); if(!id) return;
    var el = document.getElementById(id); if(!el) return;
    if(Math.abs(el.getBoundingClientRect().top) > window.innerHeight * 2){
      var h = document.documentElement; h.style.scrollBehavior = 'auto';
      setTimeout(function(){ h.style.scrollBehavior = ''; }, 120);
    }
  }, true);
})();

/* 2026-10-19 ペルソナ評価 第4周（P5「六曲の継ぎ目の線と段の区切りが合っていない」）：段組みのある章では、
   章の頭の継ぎ目の線を、その章の段の区切り（WHY の3段・FLOW の4段・料金の2面・えらぼっとのしくみ）の位置に引き直す */
(function(){
  var rows = ['#why .reasons', '#flow .fx', '#price .pr', '.proc'];
  function draw(){
    rows.forEach(function(sel){
      var row = document.querySelector(sel); if(!row) return;
      var sec = row.closest('.sec'); var byo = sec && sec.querySelector('.byo'); if(!byo) return;
      var old = byo.querySelector(':scope > .seams'); if(old) old.remove();
      var kids = [].filter.call(row.children, function(c){ return c.offsetParent !== null; });
      if(kids.length < 2){ byo.classList.remove('has-seams'); return; }
      var b = byo.getBoundingClientRect(), r = row.getBoundingClientRect();
      var tops = kids.map(function(c){ return c.getBoundingClientRect().top; });
      if(Math.max.apply(null, tops) - Math.min.apply(null, tops) > 4){ byo.classList.remove('has-seams'); return; }   /* 縦に積んでいる幅では引かない */
      var xs = [r.left].concat(kids.slice(1).map(function(c, i){ var p = kids[i].getBoundingClientRect(), q = c.getBoundingClientRect(); return (p.right + q.left) / 2; })).concat([r.right]);   /* 段と段のあいだ（罫の位置）に引く */
      var s = document.createElement('div'); s.className = 'seams'; s.setAttribute('aria-hidden', 'true');
      xs.forEach(function(x){ var i = document.createElement('i'); i.style.left = (x - b.left) + 'px'; s.appendChild(i); });
      byo.insertBefore(s, byo.firstChild); byo.classList.add('has-seams');
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', draw); else draw();
  var t; window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(draw, 150); });
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
})();
/* ── 見本の窓（2026-10-01 みつさんの追加の決定1・2・3。昼の決定で五曲の扇を外し、窓を主役に組み直した・組み手1） ──
   窓の上の 01〜05 の札（.mado-tab）と業種の札（pv-ind）で、PC の枠とスマホの枠の中身を 業種×案 の見本ページ preview/<業種>-<n>.html に替える。
   iframe は PC とスマホの2つだけ。窓が画面に近づくまでは読まない（それまでは画面写真）。18×5 を先読みしない。見えていない枠（スマホの幅では PC の枠）は読まない。
   iframe の中の履歴は積まない（location.replace）。読めないときは画面写真のまま残す。
   札を替えると、窓の下の「デザインの想い」も一緒に替わる（JS が無いときは 01 の想いだけが見える）。hp_build.py が site.js の後ろに足す */
(function(){
  var mado = document.getElementById('mado');
  if(!mado) return;
  var stage = mado.querySelector('.mado-stage'), url = mado.querySelector('.mado-url b'),
      ja = mado.querySelector('.mado-ja'), nm = mado.querySelector('.mado-nm'), go = mado.querySelector('.mado-go'),
      live = mado.querySelector('.mado-live'),
      tabs = [].slice.call(mado.querySelectorAll('.mado-tab')),
      omoi = [].slice.call(mado.querySelectorAll('.omoi-b'));
  var SP = (mado.getAttribute('data-sp') || '').split(/\s+/);
  var MIX = {}, JA = {};
  tabs.forEach(function(t){ var n = t.getAttribute('data-n'), j = t.querySelector('.mt-ja'); MIX[n] = t.getAttribute('data-c'); JA[n] = j ? j.textContent : ''; });
  function ind(){ var r = document.querySelector('input[name="pv-ind"]:checked'); return r ? r.id.replace('pi-', '') : ''; }
  function indName(c){ var l = document.querySelector('label[for="pi-' + c + '"]'); return l ? l.textContent : ''; }
  function mk(kind){
    var sc = mado.querySelector('.mado-sc-' + kind);
    return sc ? {kind: kind, sc: sc, ph: sc.querySelector('.mado-ph'), fr: null, href: '', timer: 0} : null;
  }
  var scr = [mk('pc'), mk('sp')].filter(Boolean);
  var cur = {c: '', n: ''}, wanted = false;

  function visible(s){ return s.sc.offsetParent !== null && s.sc.clientWidth > 0; }
  /* PC は 1280px、スマホは本物のスマホの幅 390px で見本を組み、枠の幅まで縮めて映す */
  function fit(s){
    if(!s.fr) return;
    var w = s.sc.clientWidth, h = s.sc.clientHeight;
    if(!w || !h) return;
    var base = s.kind === 'sp' ? 390 : 1280, k = w / base;
    s.fr.style.width = base + 'px'; s.fr.style.height = Math.ceil(h / k) + 'px'; s.fr.style.transform = 'scale(' + k + ')';
  }
  function fail(s){ clearTimeout(s.timer); s.sc.classList.remove('has-if', 'is-ld'); }
  function onLoad(s){
    if(!s.fr || !s.fr.getAttribute('src')) return;
    clearTimeout(s.timer);
    try{
      var d = s.fr.contentDocument;
      if(!d || !d.body || !d.body.children.length) throw 0;
      /* 見本の中のリンクは、窓の中ではなくページごと移る。見本の中の目次（#…）は窓の中で送る */
      [].forEach.call(d.querySelectorAll('a[href]'), function(a){ if(a.getAttribute('href').charAt(0) !== '#') a.setAttribute('target', '_top'); });
      /* 窓の中では、見本の札（DESIGN SAMPLE）を隠す。窓の下の帯で「〇〇の見本」と示しているので重なり、見本の画面の右上をふさいでいた
         （2026-10-01 修正役V f2）。単独で開いたとき（別のタブ）の札と但し書きはそのまま残る */
      if(!d.getElementById('mado-in')){
        var st = d.createElement('style'); st.id = 'mado-in';
        st.textContent = '.smp-badge{display:none!important}html{scrollbar-width:none}html::-webkit-scrollbar{display:none}';
        d.head.appendChild(st);
      }
    }catch(e){ fail(s); return; }
    s.sc.classList.add('has-if'); s.sc.classList.remove('is-ld');
  }
  function load(s, href, t){
    if(!visible(s) || (s.fr && s.href === href)) return;
    s.href = href;
    if(!s.fr){
      var fr = document.createElement('iframe');
      fr.className = 'mado-if';
      fr.setAttribute('sandbox', 'allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation');
      fr.setAttribute('tabindex', '-1');
      fr.setAttribute('loading', 'lazy');
      fr.addEventListener('load', function(){ onLoad(s); });
      fr.addEventListener('error', function(){ fail(s); });
      fr.title = t + (s.kind === 'sp' ? '（スマートフォンの画面）' : '（パソコンの画面）');
      fr.setAttribute('src', href);
      s.fr = fr;
      s.sc.appendChild(fr);
      fit(s);
    } else {
      s.fr.title = t + (s.kind === 'sp' ? '（スマートフォンの画面）' : '（パソコンの画面）');
      try{ s.fr.contentWindow.location.replace(href); }catch(e){ s.fr.setAttribute('src', href); }
    }
    /* 読み込みのあいだは画面写真を見せる。12秒たっても読めなければ、画面写真のまま */
    s.sc.classList.remove('has-if');
    s.sc.classList.add('is-ld');
    clearTimeout(s.timer);
    s.timer = setTimeout(function(){ if(s.sc.classList.contains('is-ld')) fail(s); }, 12000);
  }
  function title(){ return JA[cur.n] + 'のデザインで作った' + indName(cur.c) + 'の見本'; }
  function href(){ return 'preview/' + cur.c + '-' + cur.n + '.html'; }
  function loadAll(){ scr.forEach(function(s){ load(s, href(), title()); }); }
  function setPh(s, t){
    if(!s.ph) return;
    var c = cur.c, n = cur.n, src = 'assets/card-' + c + '-' + n + '.jpg', card = true;
    if(s.kind === 'sp' && SP.indexOf(c + '-' + n) >= 0){ src = 'assets/site/sp-' + c + '-' + n + '.jpg'; card = false; }
    /* 2026-10-01 修正役V f1：スマホの画面写真が無い組は、横長の PC の写真をスマホの枠に縦に切って入れない（紙の白のまま、iframe を待つ） */
    if(s.kind === 'sp'){ s.ph.style.visibility = card ? 'hidden' : ''; if(card) return; }
    s.ph.setAttribute('src', src);
    if(s.kind === 'sp') s.ph.classList.toggle('is-card', card);
    s.ph.setAttribute('alt', t + (s.kind === 'sp' ? 'の、スマートフォンの画面（画面写真）' : 'の、パソコンの画面（画面写真）'));
  }
  /* 2026-10-19 P2：ご依頼の流れ 02 に「シートの希望デザインには ○案「○」と」を出す */
  function pick(){ var p = document.getElementById('fx-pick'); if(!p || !cur.n) return; var b = p.querySelector('b'); if(b) b.textContent = cur.n + '案「' + JA[cur.n] + '」'; p.hidden = false; }
  function show(n, how){
    n = String(n);
    /* 2026-10-01 修正役L f2：業種をまだ選んでいないときは、いま窓に映している業種のまま案だけを替える（初めは 01 の札の業種＝建築）。
       前は案ごとに別の業種（玄→寺院、雅→造園…）に替わり、「建築の玄」を見たつもりが寺院になる、と評価役3人が戸惑っていた */
    var c = ind() || cur.c || MIX[n];
    if(!c || !JA[n]) return;
    if(cur.c === c && cur.n === n) return;
    cur = {c: c, n: n};
    var t = title(), h = href();
    mado.setAttribute('data-c', c); mado.setAttribute('data-n', n);
    if(url) url.textContent = c + '-' + n;
    if(ja) ja.textContent = JA[n];
    if(nm) nm.textContent = indName(c) + 'の見本';
    if(go){ go.setAttribute('href', h); go.setAttribute('aria-label', t + 'を別のタブで開く'); }
    /* 2026-10-19 P2：見本の求人の節へ。料金表の業種（表が求人でない）では隠す */
    var t2 = mado.querySelector('.mado-t2');
    if(t2){ var menu = ['bar','biyo','juku','kosho','shokudo','jinja','jiin'].indexOf(c) >= 0; t2.hidden = menu; t2.setAttribute('href', h + '#t2'); t2.setAttribute('aria-label', t + 'の求人のご案内を別のタブで開く'); }
    scr.forEach(function(s){ setPh(s, t); });
    tabs.forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-n') === n ? 'true' : 'false'); });
    omoi.forEach(function(o){ o.hidden = o.getAttribute('data-n') !== n; });
    /* 2026-10-01 修正役V f1：業種をまだ選んでいないときも、窓に映している業種の札に淡い金罫を出して、札と窓の連動を見せる */
    [].forEach.call(document.querySelectorAll('.chips .chip.is-shown'), function(l){ l.classList.remove('is-shown'); });
    if(!ind()){ var sl = document.querySelector('.chips label[for="pi-' + c + '"]'); if(sl) sl.classList.add('is-shown'); }
    touchOff();
    if(how !== 'init' && live) live.textContent = t + 'を窓に映しました';
    if(wanted) loadAll();
  }

  /* 2026-10-01 修正役V f1：タッチの端末では、窓の上で指を滑らせてもページが進むように、iframe は初めは触れないようにしておく。
     画面の上の「タップして中を見る」を押すと窓の中を操作でき、窓の外を押すか「閉じる」で戻る */
  var coarse = window.matchMedia && matchMedia('(pointer:coarse)').matches;
  function touchOff(){ scr.forEach(function(s){ s.sc.classList.remove('is-touch'); }); }
  if(coarse){
    mado.classList.add('is-coarse');
    /* タッチの端末では、タップするまで窓の中はスクロールしない。案内の言い方をそれに合わせる */
    var hint = mado.querySelector('.mado-hint');
    if(hint) hint.textContent = 'タップすると、窓の中で見本を下まで見られます';
    scr.forEach(function(s){
      var on = document.createElement('button'), off = document.createElement('button');
      on.type = off.type = 'button';
      /* 幅の狭い枠（タブレットのスマホの枠など）では「タップで見る」に縮める（mado.css の @container）。2行に折れて『見る』だけの行ができていた */
      on.className = 'mado-touch'; on.innerHTML = '<span><i class="mt-l">タップして中を見る</i><i class="mt-s" aria-hidden="true">タップで見る</i></span>';
      on.setAttribute('aria-label', '窓の中の見本を操作する');
      off.className = 'mado-done'; off.textContent = '閉じる';
      on.addEventListener('click', function(){ touchOff(); s.sc.classList.add('is-touch'); });
      off.addEventListener('click', function(e){ e.stopPropagation(); touchOff(); });
      s.sc.appendChild(on); s.sc.appendChild(off);
    });
    document.addEventListener('pointerdown', function(e){ if(!(e.target.closest && e.target.closest('.mado-sc.is-touch'))) touchOff(); }, true);
  }

  tabs.forEach(function(b, i){
    b.addEventListener('click', function(){ wanted = true;
      /* 2026-10-19 P3：案を替えても窓の位置が跳ばないよう、札の位置を保つ */
      var y0 = b.getBoundingClientRect().top; show(b.getAttribute('data-n'), 'tab');
      requestAnimationFrame(function(){ var dy = b.getBoundingClientRect().top - y0; if(Math.abs(dy) > 1) window.scrollBy({top: dy, left: 0, behavior: 'instant'}); });
      pick(); });
    /* 札の並びは矢印でも渡れる（左右・上下とも） */
    b.addEventListener('keydown', function(e){
      var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
      if(!d) return;
      e.preventDefault();
      var nb = tabs[(i + d + tabs.length) % tabs.length]; nb.focus(); nb.click();
    });
  });
  /* 業種の札：選んだ案のまま、業種だけ替える */
  document.addEventListener('change', function(e){
    var r = e.target;
    if(!r || r.name !== 'pv-ind') return;
    show(cur.n || '1', 'ind');
  });

  show(mado.getAttribute('data-n') || '1', 'init');
  /* 窓が画面に近づいたら、いま選ばれている案を読む（それまでは画面写真） */
  function wake(){ if(wanted) return; wanted = true; loadAll(); }
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ io.disconnect(); wake(); } }); }, {rootMargin: '400px 0px'});
    io.observe(stage || mado);
  } else wake();
  /* 幅が変わったら縮め直す。スマホの幅から広げて PC の枠が現れたときは、そのとき初めて PC の枠を読む */
  function onSize(){ scr.forEach(function(s){ fit(s); if(wanted) load(s, href(), title()); }); }
  if('ResizeObserver' in window){ var ro = new ResizeObserver(onSize); scr.forEach(function(s){ ro.observe(s.sc); }); }
  else window.addEventListener('resize', onSize);
})();
/* ══════════════════════════════════════════════════════════════════
   杜工舎の「デジタルの技」── 伝統の文様と金を、プログラムで描く（2026-09-29 第2版）
   みつさんのコンセプト「アート、デジタル技術を活用した工房。日本の伝統美」。

   <canvas data-art="kasumi">    すやり霞の金雲。画面の端から細い帯を3段差し込み、内側の端は半円で丸く閉じる。箔足（箔の継ぎ目）を見せる。開いたとき一度だけ差し込み、切箔が舞い降りる。金地の絵には雲を置かない。
                                 金砂子と切箔は「撒いて止まっている」。瞬きと、斜めに走る光でだけ動く
   <canvas data-art="seigaiha">  墨の地に金の青海波。波ごとに金の濃さと線の太さを揺らし、画面に入ると下の段から描き起こす
   <canvas data-art="kanze">     墨の地に金の観世水。3〜4本の線の束が流れ、流れの山でそのまま対数らせんに巻き込んで渦になる
   <canvas data-art="kirihaku">  章のあいだの罫（WHY の前の1か所）。金泥の一筆（.5px、中央40%だけ1px）の上に野毛12本と砂子60粒、画面に入ったとき光が一度だけ横切る
   <canvas data-art="sunago">    絵の帯（WORKS）の上に、止まった金砂子と切箔を撒く

   動きを減らす設定の人には、1枚だけ描いて止める。画面の外にあるあいだは描かない。
   ══════════════════════════════════════════════════════════════════ */
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var GOLD = ['#B8914A', '#D6B574', '#EAD6A2', '#A9803A'];
  var LINE = '201,163,94'; // #C9A35E

  // 決まった乱数（毎回同じ位置に撒く）
  function seeded(s){ return function(){ s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  function fit(cv){
    var r = cv.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if(cv.width !== w * DPR || cv.height !== h * DPR){ cv.width = w * DPR; cv.height = h * DPR; }
    var g = cv.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { g: g, w: w, h: h };
  }
  // 斜めに走る光の帯の強さ（0〜1）。x + y*0.5 の線上を sweep が進む
  function glint(x, y, sweep, width){ var d = (x + y * .5 - sweep) / width; return Math.exp(-d * d); }

  /* 切箔（第5周）：箔の欠片は3種を混ぜる ── 正方形の切箔（s×s）、三角の欠片、野毛（幅0.6px×長さ6〜14px の細い箔）。
     同じ縦横比の長方形を並べると紙吹雪に見えるため。t：0＝正方形 1＝三角 2＝野毛 */
  // 第9周：三角の欠片は紙吹雪に見えたのでやめ、正方形の切箔と野毛だけにする
  function hakuType(R){ var u = R(); return u < .3 ? 2 : 0; }
  function drawHaku(g, x, y, s, rot, c, a, t){
    g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a; g.fillStyle = c;
    if(t === 2){ var L = 6 + s * .9; g.fillRect(-L / 2, -.3, L, .6); }
    else if(t === 1){ g.beginPath(); g.moveTo(-s * .55, s * .4); g.lineTo(s * .5, s * .45); g.lineTo(s * .05, -s * .55); g.closePath(); g.fill(); }
    else g.fillRect(-s / 2, -s / 2, s, s);
    g.restore();
  }

  /* 扉の切箔（第2周）：手で切った箔の不定形の四角。面は本物の金箔の肌（LEAF）で塗り、#C9A35E を薄く重ねて色をそろえる。
     下に 0.6px の影を置いて紙から浮かせ、縁に 0.5px の照り（#EAD6A2・α .5）。光の帯が通るときだけ明るむ（gl：0〜1） */
  function drawLeaf(g, q, x, y, rot, a, gl){
    function path(){ g.beginPath(); for(var i = 0; i < q.vs.length; i++) g[i ? 'lineTo' : 'moveTo'](q.vs[i][0], q.vs[i][1]); g.closePath(); }
    g.save(); g.translate(x, y); g.rotate(rot);
    g.globalAlpha = a * .45; g.translate(0, .6); path(); g.fillStyle = 'rgba(70,48,18,.8)'; g.fill(); g.translate(0, -.6);
    g.globalAlpha = a; path();
    if(LEAF.src){
      if(!LEAF.pat || LEAF.pat.ctx !== g){ LEAF.pat = g.createPattern(LEAF.src, 'repeat'); LEAF.pat.ctx = g; }
      if(LEAF.pat.setTransform && window.DOMMatrix) LEAF.pat.setTransform(new DOMMatrix([.5, 0, 0, .5, -q.px, -q.py]));
      g.fillStyle = LEAF.pat; g.fill();
      g.globalAlpha = a * .35; g.fillStyle = q.c; g.fill();
    } else { g.fillStyle = q.c; g.fill(); }
    // 箔の照り：1枚ごとに斜めの明暗（左上が明るく、右下が沈む）。平らな色の四角に見せない
    var sh = g.createLinearGradient(-q.s * .5, -q.s * .5, q.s * .5, q.s * .5);
    sh.addColorStop(0, 'rgba(255,242,204,.55)'); sh.addColorStop(.45, 'rgba(255,236,190,.08)'); sh.addColorStop(1, 'rgba(96,64,22,.28)');
    g.globalAlpha = a; g.fillStyle = sh; g.fill();
    if(gl > .02){ g.globalAlpha = a * .75 * gl; g.fillStyle = '#F4E2B0'; g.fill(); }
    g.globalAlpha = a * .5; g.strokeStyle = '#EAD6A2'; g.lineWidth = .5; g.lineJoin = 'round'; g.stroke();
    g.restore();
  }

  /* ── 帯の裾（第7周）：炭の帯の下端に、画面幅の 84% の 1px の金線を引き、線の上に砂子を 20 粒だけ撒く。
        帯から灰の地へ「箔で降りる」。線の両端 15% は透明へ消す ── */
  function foot(g, W, H){
    var span = W * .84, x0 = (W - span) / 2, y = H - 1.5, R = seeded(61);
    var lg = g.createLinearGradient(x0, 0, x0 + span, 0);
    lg.addColorStop(0, 'rgba(201,163,94,0)'); lg.addColorStop(.15, 'rgba(201,163,94,.75)'); lg.addColorStop(.85, 'rgba(201,163,94,.75)'); lg.addColorStop(1, 'rgba(201,163,94,0)');
    g.fillStyle = lg; g.fillRect(x0, y, span, 1);
    for(var i = 0; i < 20; i++){
      var u = .15 + Math.pow(R(), 1.3) * .7, x = x0 + span * (R() < .5 ? u : 1 - u) , yy = y - 3 - Math.pow(R(), 1.8) * 22;
      g.globalAlpha = .45 + R() * .45; g.fillStyle = GOLD[i % 4];
      g.beginPath(); g.arc(x, yy, R() < .8 ? .45 + R() * .3 : 1 + R() * .3, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
  }

  /* ── 箔の肌：鈴木松年「老松図屏風」の金地（絵の無い所）を切り出し、上下左右に鏡写しにして継ぎ目の無い模様にする ──
       金雲はこの本物の金箔の肌で塗る（グラデーションや格子で箔を真似しない） */
  var LEAF = { pat: null, wait: [] };
  (function(){
    var im = new Image();
    im.decoding = 'async';
    im.onload = function(){
      var sx = 0, sy = 0, sw = 440, sh = 360   /* 2026-10-19 P4：老松図の 760,960 から切り出した 440×360 だけを読む（2400px の原画 451KB を読まない） */, k = 1.8, pw = Math.round(sw * k), ph = Math.round(sh * k);
      var c = document.createElement('canvas'); c.width = pw * 2; c.height = ph * 2;
      var g = c.getContext('2d');
      for(var i = 0; i < 4; i++){
        var fx = i % 2, fy = i > 1 ? 1 : 0;
        g.save(); g.translate(fx ? pw * 2 : 0, fy ? ph * 2 : 0); g.scale(fx ? -1 : 1, fy ? -1 : 1);
        g.drawImage(im, sx, sy, sw, sh, 0, 0, pw, ph); g.restore();
      }
      // 金地の画像はやや沈んだ色なので、箔の明るさに少しだけ持ち上げる
      g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(238,196,112,.42)'; g.fillRect(0, 0, pw * 2, ph * 2);
      g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,232,170,.5)'; g.fillRect(0, 0, pw * 2, ph * 2);
      LEAF.src = c; LEAF.wait.forEach(function(f){ f(); }); LEAF.wait = [];
    };
    im.src = 'assets/site/art-pines-gold-leaf.jpg';
  })();

  /* ── すやり霞の金雲（第7周で描き直し）──
       同じ太さの帯を平行に積むと「角丸の棒」「部品」に見えるため、形の決まりを変えた。
       ・帯は 5〜7 本（スマホは細い1〜2本）。長さは 0.35〜1.0、高さは bh×(.35〜1.1) と大きくばらつかせる。
       ・上下の縁は正弦で揺らさず、帯ごとに 2〜3 か所だけ「段」を付ける（すやり霞の段差）。段と段の間はまっすぐ。
       ・内側の端は、帯ごとに 0.6〜1.0 倍に潰した楕円で閉じる（同じ半円を並べない）。
       ・肌は本物の金箔（老松図の金地を k=1.8 で拡げ、箔の皺が見える大きさ）。箔足は 32〜44px の不揃いな長方形で、継ぎ目は .08 まで薄く。
       ・輪郭は線で引かず、帯の外側 3px に金砂子を密に撒いて縁を作る（本物の霞の縁の描き方）。
       墨の絵の上では、雲全体を乗算・不透明度 .62 で重ね、下の霧と松が透ける「金泥の霞」にする（重ね方は kasumi の draw と CSS）。
       side: 'r' は右の端から左へ伸びる雲、'l' は左の端から右へ伸びる雲 */
  function makeCloud(R, w, bh, side, n){
    n = n || 4;
    var hs = [], lens = [], ys = [], i;
    // いちばん長い帯は上から2本目。ほかは 0.35〜0.9 の長さ、高さ .45〜.95。帯と帯は、少し重ねるか、細い隙間をあける（重なった所は1つの形になり、縁が段になる）
    var main = Math.min(1, n - 1);
    for(i = 0; i < n; i++){
      hs.push(bh * (i === main ? 1 : .45 + R() * .5));
      lens.push(i === main ? 1 : .35 + R() * .55);
    }
    ys.push(0);
    for(i = 1; i < n; i++) ys.push(ys[i - 1] + hs[i - 1] * (.58 + R() * .22));
    var h = ys[n - 1] + hs[n - 1];
    var pad = 30, CW = Math.ceil((w + pad * 2) * DPR), CH = Math.ceil((h + pad * 2) * DPR);
    function cnv(){ var c0 = document.createElement('canvas'); c0.width = CW; c0.height = CH; var g0 = c0.getContext('2d'); g0.setTransform(DPR, 0, 0, DPR, pad * DPR, pad * DPR); return [c0, g0]; }
    var bands = [];
    function smooth(u){ u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
    for(i = 0; i < n; i++) (function(i){
      var bhi = hs[i], len = w * lens[i], y0 = ys[i];
      var dir = side === 'r' ? -1 : 1, fixed = side === 'r' ? w + pad : -pad, tip = side === 'r' ? w - len : len;
      // 段：上の縁と下の縁に 1〜2 か所ずつ、帯の高さの .18〜.34。移り変わりは 5px ほど（すやり霞の段差）
      function steps(){
        var k = 1, a = [];
        for(var q = 0; q < k; q++) a.push({ at: .2 + R() * .6, d: (R() < .5 ? -1 : 1) * bhi * (.18 + R() * .16) });
        return a;
      }
      var st = steps(), sb = steps();
      function off(x, arr){
        var u = (x - tip) / (fixed - tip), v = 0;
        for(var q = 0; q < arr.length; q++) v += arr[q].d * smooth((u - arr[q].at) * len / 5 + .5);
        return v;
      }
      function edge(x, up){
        var t = y0 + off(x, st), b = y0 + bhi + off(x, sb);
        return up ? t : Math.max(t + bhi * .45, b);
      }
      var ex = .6 + R() * .4;
      var et0 = edge(tip - dir * bhi, true), eb0 = edge(tip - dir * bhi, false), ry = Math.max(2, (eb0 - et0) / 2), rx = ry * ex, xr = tip - dir * rx;
      function shape(g){
        var x;
        g.beginPath(); g.moveTo(fixed, edge(fixed, true));
        for(x = fixed; dir * (xr - x) > 0; x += dir * 2) g.lineTo(x, edge(x, true));
        var et = edge(xr, true), eb = edge(xr, false);
        g.lineTo(xr, et);
        g.ellipse(xr, (et + eb) / 2, rx, (eb - et) / 2, 0, -Math.PI / 2, Math.PI / 2, dir < 0);
        for(x = xr; dir * (x - fixed) > 0; x -= dir * 2) g.lineTo(x, edge(x, false));
        g.lineTo(fixed, edge(fixed, false)); g.closePath();
      }
      bands.push({ tip: tip, fixed: fixed, dir: dir, edge: edge, len: len, shape: shape, xr: xr, rx: rx, y0: y0, bh: bhi });
    })(i);
    // 1) 雲の形（帯を全部重ねた1つの形）。重なった所に内側の線を作らない
    var M = cnv(), mg = M[1]; mg.fillStyle = '#000';
    bands.forEach(function(b){ b.shape(mg); mg.fill(); });
    // 2) 箔の面：本物の金箔の肌 → 32〜44px の不揃いな箔足 → 照りと斜めの光。最後に雲の形で抜く
    var L = cnv(), g = L[1], xa = -pad, xb = w + pad;
    if(LEAF.src){
      var pat = g.createPattern(LEAF.src, 'repeat');
      if(pat.setTransform && window.DOMMatrix) pat.setTransform(new DOMMatrix([1, 0, 0, 1, R() * 300, R() * 240]));
      g.fillStyle = pat;
    } else g.fillStyle = '#CDAE6E';
    g.fillRect(xa, -pad, xb - xa, h + pad * 2);
    var yy = -pad - R() * 20;
    while(yy < h + pad){
      var rh = 32 + R() * 12, xx = xa - R() * 40;
      while(xx < xb){
        var tw = 32 + R() * 12, v = R();
        g.fillStyle = v < .5 ? 'rgba(255,236,190,' + (.02 + v * .1).toFixed(3) + ')' : 'rgba(110,76,28,' + ((v - .5) * .1).toFixed(3) + ')';
        g.fillRect(xx, yy, tw, rh);
        g.fillStyle = 'rgba(120,86,36,.08)'; g.fillRect(xx, yy, tw, .6); g.fillRect(xx, yy, .6, rh);
        xx += tw;
      }
      yy += rh;
    }
    var sx0 = w * (.3 + R() * .4), sg = g.createLinearGradient(sx0 - 200, -20, sx0 + 200, h + 20);
    sg.addColorStop(0, 'rgba(90,60,20,.08)'); sg.addColorStop(.46, 'rgba(255,238,190,.2)'); sg.addColorStop(.54, 'rgba(255,238,190,.2)'); sg.addColorStop(1, 'rgba(90,60,20,.08)');
    g.fillStyle = sg; g.fillRect(xa, -pad, xb - xa, h + pad * 2);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-in'; g.drawImage(M[0], 0, 0); g.restore();
    // 3) 縁の内側に、ぼかした沈み（金泥を盛った縁の厚み）。形の外側を裏返して、内へ影を落とす
    var I = cnv(), ig = I[1];
    ig.setTransform(1, 0, 0, 1, 0, 0); ig.fillStyle = '#000'; ig.fillRect(0, 0, CW, CH);
    ig.globalCompositeOperation = 'destination-out'; ig.drawImage(M[0], 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';
    g.shadowColor = 'rgba(104,70,22,.55)'; g.shadowBlur = 7 * DPR; g.shadowOffsetX = 0; g.shadowOffsetY = 1.5 * DPR;
    g.drawImage(I[0], 0, 0); g.restore();
    // 4) 縁の砂子：形の外側 3px 以内に密に撒く（輪郭線の代わり）。まれに野毛と小さな切箔。形の内側には撒かない
    g.setTransform(DPR, 0, 0, DPR, pad * DPR, pad * DPR);
    var md = mg.getImageData(0, 0, CW, CH).data;
    function inside(x, y){
      var px = Math.round((x + pad) * DPR), py = Math.round((y + pad) * DPR);
      if(px < 0 || py < 0 || px >= CW || py >= CH) return false;
      return md[(py * CW + px) * 4 + 3] > 20;
    }
    bands.forEach(function(b){
      var span = Math.max(30, b.len - 6), nd = Math.round(span / 1.8), nn = Math.round(span / 70), nk = Math.round(span / 240);
      for(var j = 0; j < nd + nn + nk; j++){
        var kind = j < nd ? 'd' : (j < nd + nn ? 'n' : 'k');
        var x = b.tip - b.dir * (Math.pow(R(), 1.1) * span), up = R() < .5, dist = kind === 'd' ? .6 + Math.pow(R(), 1.8) * 3 : 3 + R() * 9, y;
        if(b.dir * (b.xr - x) < 0){
          var th = (R() - .5) * Math.PI, ey0 = b.edge(b.xr, true), ey1 = b.edge(b.xr, false), cy = (ey0 + ey1) / 2, ry2 = (ey1 - ey0) / 2;
          x = b.xr + b.dir * Math.cos(th) * (b.rx + dist); y = cy + Math.sin(th) * (ry2 + dist);
        } else y = up ? b.edge(x, true) - dist : b.edge(x, false) + dist;
        if(inside(x, y)) continue;
        var a = kind === 'd' ? .95 - (dist - .6) / 3 * .4 : .8;
        if(kind === 'd'){ g.globalAlpha = a; g.fillStyle = j % 3 ? '#C29A52' : '#E6CC8E'; g.beginPath(); g.arc(x, y, R() < .8 ? .45 + R() * .4 : .95 + R() * .5, 0, 6.283); g.fill(); }
        else drawHaku(g, x, y, kind === 'n' ? R() * 4 : 2 + R() * 2.5, (R() - .5) * (kind === 'n' ? .4 : 1.6), GOLD[j % 4], a, kind === 'n' ? 2 : (R() < .5 ? 0 : 1));
      }
    });
    g.globalAlpha = 1;
    return { img: L[0], pad: pad, h: h };
  }

  function ease(u){ u = Math.max(0, Math.min(1, u)); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function easeOut(u){ u = Math.max(0, Math.min(1, u)); return 1 - Math.pow(1 - u, 3); }

  /* ── 扉の絵の替わり目の「霞の覆い」（2026-09-30 第8周）──
       縦の硬い線で拭き取る clip-path をやめ、すやり霞の形の覆い（白黒の mask）で次の絵を右から左へ現す。
       覆いは画面の3倍の幅（CSS の mask-size:300%）。左の 0〜1/3 は透明、右の 2/3〜は不透明、そのあいだに霞の縁がある。
       縁は5つの帯（段）で、帯ごとに差し出す長さを変え、帯の端は潰した楕円で丸く、横に 15% ほどの幅で広くぼかす。
       24行の粗い画像で描いて拡げるので、帯と帯の段差も柔らかくにじむ。動きを減らす設定では CSS の側で即座に替わる */
  function kasumiMask(){
    var MW = 600, MH = 24, R = seeded(7), tips = [], y = 0, bands = [];
    while(y < MH){ var n = 3 + Math.floor(R() * 3); bands.push({ y0: y, n: Math.min(n, MH - y), tip: 238 + R() * 56, ex: 10 + R() * 22 }); y += n; }
    bands.forEach(function(b){
      for(var k = 0; k < b.n; k++){ var v = b.n > 1 ? (k - (b.n - 1) / 2) / ((b.n + 1) / 2) : 0; tips.push(b.tip + b.ex * (1 - Math.sqrt(Math.max(0, 1 - v * v)))); }
    });
    // 隣の行と少しだけ平らにならす（段は残す）
    var sm = tips.map(function(t, i){ return (tips[Math.max(0, i - 1)] + t * 2 + tips[Math.min(MH - 1, i + 1)]) / 4; });
    var c = document.createElement('canvas'); c.width = MW; c.height = MH;
    var g = c.getContext('2d'), im = g.createImageData(MW, MH), d = im.data, F = 92;
    for(var yy = 0; yy < MH; yy++) for(var x = 0; x < MW; x++){
      var u = Math.max(0, Math.min(1, (x - sm[yy]) / F)), a = u * u * (3 - 2 * u), o = (yy * MW + x) * 4;
      d[o] = d[o + 1] = d[o + 2] = 0; d[o + 3] = Math.round(a * 255);
    }
    g.putImageData(im, 0, 0);
    return 'url(' + c.toDataURL('image/png') + ')';
  }
  (function(){ var hp = document.querySelector('.hero-ph'); if(hp) try{ hp.style.setProperty('--kmask', kasumiMask()); }catch(e){} })();

  function kasumi(cv){
    var clouds = [], dust = [], haku = [], mist = [], W = 0, H = 0, hero = cv.closest('.hero'), fadeAt = -1e9, mode = 'paper', born = null;
    var plate = hero && hero.querySelector('.hero-plate'), dotsEl = hero && hero.querySelector('.dots');
    // 方針第2版（A2）：光の帯は別の canvas に描き、加算（plus-lighter）で絵に重ねる。同じ canvas に描くと、紙の上では金と紙が同じ明るさで光が見えなかった。
    // 切箔と砂子は元の canvas（普通の重ね方）に残す（加算にすると箔が白く飛ぶ）
    var lcv = null;
    if(!reduce && cv.parentNode){ lcv = document.createElement('canvas'); lcv.className = 'art-layer art-light'; lcv.setAttribute('aria-hidden', 'true');
      lcv.style.mixBlendMode = 'plus-lighter'; cv.parentNode.insertBefore(lcv, cv); }
    /* 2026-10-19 P5：扉2枚目（見本の画面・data-tone="mihon"）にも金砂子を撒き、1枚目・3枚目と同じ空気にする */
    function curTone(){ var tn = hero && hero.getAttribute('data-tone'); return (tn === 'gold' || tn === 'mihon') ? 'gold' : 'paper'; }
    // 2026-10-01 第5周：光の帯は絵が替わるたびに1回、新しい絵の上を渡す（松林図の上でも必ず一度は横切る）
    var lightAt = null;
    if(hero) hero.addEventListener('heroslide', function(){ fadeAt = performance.now(); lightAt = fadeAt + 900; pendFit = true; if(reduce) mode = curTone(); });
    function init(){
      var f = fit(cv); W = f.w; H = f.h; mode = curTone();
      if(lcv) fit(lcv);
      var R = seeded(11), mobile = W < 700;
      clouds = [];
      // 第5周：雲は1本だけ、画面の下の端に寄せて差し込む（等伯の余白＝右上と中央を塞がない）。
      // 左下の札と重なる幅では、札の上に逃がす（1024 など）。スマホも札のすぐ上、松の枝の下
      // 第7周：スマホは右の端から札の上（y=.62）へ、細い帯（16〜22px）を長く1本。PC は右下に 6 本の帯を段に重ねる
      // 2026-09-30：金雲は描かない。評価役4人が8周続けて「後から貼った図形に見える」と減点し、描き直しても上がらなかった。
      // 等伯の余白を切らず、金砂子と切箔が静かに瞬くだけにする（名画そのものが主役）
      var rows = [];
      var bh = mobile ? Math.max(16, Math.min(22, H * .024)) : Math.max(30, H * .042);
      var hr = cv.getBoundingClientRect();
      // 札と◇（スマホでは右下の隅）に重なるときは、その上へ逃がす
      var obs = [plate, dotsEl].filter(function(el){ return el && el.getBoundingClientRect().width; }).map(function(el){ return el.getBoundingClientRect(); });
      rows.forEach(function(r){
        var w = W * r.span + 40, cl = makeCloud(R, w, bh, r.side, r.n);
        var x = r.side === 'r' ? W - w + 40 : -40, cy = H * r.y - cl.h / 2;
        for(var pass = 0; pass < 2; pass++) obs.forEach(function(pr){
          var pl = pr.left - hr.left, pt = pr.top - hr.top, pb = pt + pr.height;
          var c0 = x + (r.side === 'r' ? w * .2 : 0), c1 = x + w - (r.side === 'l' ? w * .2 : 0), hx = c0 < pl + pr.width && c1 > pl;
          if(hx && cy + cl.h > pt - 14 && cy < pb) cy = pt - cl.h - 22;
        });
        clouds.push({ x: x, y: cy, w: w, side: r.side, c: cl, ph: R() * 6.28 });
      });
      // 2026-09-30 第8周：一様に撒いた点は「ほこり」に見えたので、霞撒き（2か所に寄せて、外へ指数的にまばらにする）にした。
      // 粒は3段 ── 細かい砂子（多い・ほぼ止まって淡い）／中の砂子（ゆっくり瞬く）／大きな砂子（少ない・強く瞬く）。
      // 寄せる所は右上の端（ナビの右、◇の上）と、下の端の中ほど（札の右）。絵の中央の余白には撒かない
      // 2026-09-30 第9周：寄せ撒き（点の塊が「ほこり」に見えた）をやめ、屏風の砂子撒きと同じ「横長の帯」で撒く。
      // 帯は2本 ── 画面の下 1/4（y=.74〜.96、中心 .86）と上端（y=0〜.08）。帯の中心から上下へ指数的にまばらにする。
      // 上端の帯はナビ（右半分）とロゴ（左端）に掛けない：x=.14〜.44W だけ。粒は 9 割が半径 .3〜.9px の細かい砂子、
      // 残りが中・大の砂子（大は時々ふっと照る）。野毛（細い箔の線）30 本、切箔は正方形だけ 14 枚、傾き ±10°
      var RD = seeded(29); dust = [];
      // 2026-10-01 第5周（アートディレクター）：下の帯は左下の値段の札（.hero-deal）の裏に隠れていた。帯を下端（c .93）へ下げ、札の右から撒く
      var dealR = 0, dl0 = hero && hero.querySelector('.hero-deal');
      if(dl0 && dl0.getBoundingClientRect().width) dealR = (dl0.getBoundingClientRect().right - hr.left - 60) / W;
      // 2026-10-01 第7周：スマホの下の帯は札の裏に隠れていたので、札の上の右半分の空（金地の空・水墨の霞の中）へ上げる
      var bandsD = [mobile ? { x0: .40, x1: 1, c: .38, h: .09, w: .78 } : { x0: Math.max(.30, Math.min(.5, dealR)), x1: 1, c: .93, h: .11, w: .78 }, mobile ? { x0: .42, x1: .74, c: .02, h: .04, w: .22 } : { x0: .14, x1: .44, c: .025, h: .055, w: .22 }];
      var lastB = 0;
      function inBand(){ var b = RD() < bandsD[0].w ? bandsD[0] : bandsD[1]; lastB = b === bandsD[0] ? 0 : 1;
        var x = W * (b.x0 + (b.x1 - b.x0) * RD()), s = RD() < .5 ? -1 : 1, off = -Math.log(1 - RD() * .97) / 3.2;
        var y = H * (b.c + s * off * b.h);
        // 帯の両端は薄く（左右 10% で消す）
        var u = (x / W - b.x0) / (b.x1 - b.x0), e = Math.max(0, Math.min(1, Math.min(u, 1 - u) / .1));
        return [x, Math.max(1, Math.min(H - 1, y)), e * Math.exp(-off * 1.4)]; }
      // 第10周：820 粒の細かい砂子は画面の傷・塵に見えた。粒を 320（スマホ 140）に減らし、大粒（半径 1.4〜1.8）を 2% → 12% に上げて「撒いた」と見える粒にする
      var n = mobile ? 140 : 320;
      for(var d = 0; d < n; d++){
        var q0 = inBand(), kind = RD(), sz = kind < .76 ? 0 : (kind < .88 ? 1 : 2);
        dust.push({ x: q0[0], y: q0[1], sz: sz, r: sz === 0 ? .3 + RD() * .6 : (sz === 1 ? 1 + RD() * .3 : 1.4 + RD() * .4),
                    lo: (sz === 0 ? .3 + RD() * .35 : (sz === 1 ? .3 : .15)) * (.35 + .65 * q0[2]), amp: (sz === 0 ? .06 : (sz === 1 ? .4 : 1.2)) * (.35 + .65 * q0[2]),
                    per: sz === 0 ? 9000 : 4000 + RD() * 5000, p: RD() * 6.28, c: sz === 2 ? '#E6CC8E' : GOLD[d % 4], noge: 0, b: lastB });
      }
      // 方針第2版（A2）：野毛は 22 本（スマホ 20 本）・長さ 12〜22px・幅 .6px・傾き ±6°
      for(var ng = 0; ng < (mobile ? 20 : 22); ng++){
        var q2 = inBand();
        dust.push({ x: q2[0], y: q2[1], sz: 1, r: 0, noge: 12 + RD() * 10, rot: (RD() - .5) * .21, lo: .3 + .3 * q2[2], amp: .25,
                    per: 5000 + RD() * 5000, p: RD() * 6.28, c: GOLD[ng % 4], b: lastB });
      }
      // 方針第2版（A2）：切箔は 4 枚（スマホ 3 枚）、1辺 14〜18px の正方形を画面の右下 1/4 に寄せて撒く（屏風の切箔撒きの位置）。
      // 色は #C9A35E・α .6 前後で、光が当たらなくても「箔」と分かる。札（PC は右寄りの縦書き・スマホは左下）と◇（PC は右端・スマホは右下の隅）は避ける
      // 撒く順：右上の粒ほど早く、左下ほど遅い（0〜600ms）。少し揺らして列に見えないように
      dust.forEach(function(p){ p.lag = 600 * Math.max(0, Math.min(1, .6 * (1 - p.x / W) + .4 * (p.y / H) + (RD() - .5) * .16)); });
      // 2026-10-01 第3周（アートディレクター）：同じ大きさの箔を 4〜6 枚ほぼ均等に撒くと「シール・紙吹雪」に見えた。
      // 切箔は金地の絵（八橋・老松）の上でだけ撒く。大小（8〜28px）と野毛を混ぜ、画面の端 ── 右上（ナビの下、◇の手前）と
      // 左下（札の上）── の 1/5 に寄せる。水墨の松林図（data-tone="paper"）の上には撒かず、薄墨の霞と光の帯だけにする（draw）
      haku = []; var RH = seeded(83);
      var deal = hero && hero.querySelector('.hero-deal');
      if(deal && deal.getBoundingClientRect().width) obs.push(deal.getBoundingClientRect());
      // [x, y, 1辺] ── 大きいものほど端へ。野毛は t:2
      // 2026-10-01 第7周（アートディレクター）：空に1枚ずつ浮いた箔は紙吹雪に見えた。切箔は砂子の帯の中に 2〜3 枚ずつ寄せて置き、
      // 帯の外に出ていた分は野毛（細い箔の線）に替える。PC は下の帯（値段の札の右）に2か所、スマホは札の上の空の帯に2か所
      var slots = mobile
        ? [[.70, .365, 11], [.735, .39, 7], [.715, .41, 5], [.90, .345, 9], [.925, .37, 6]]
        : [[.60, .905, 13], [.622, .93, 8], [.607, .952, 5], [.845, .885, 14], [.872, .91, 9], [.858, .94, 6]];
      // 第8周（アートディレクター）：箔が杜若の花や松の幹の上に落ち「貼ったシール」に見えた。大きさを 5〜14px に下げ、
      // 置く所は goldFit() が元の絵の金地（明るく、彩度の低い黄）だけを選ぶ。3枚ずつの塊（gid）は塊ごと動かす
      var noge = mobile ? [[.56, .38], [.82, .40], [.97, .33], [.60, .03]] : [[.66, .925], [.54, .95], [.78, .915], [.93, .905], [.97, .95], [.30, .03]];
      for(var k = 0; k < slots.length; k++){
        var hx = W * (slots[k][0] + (RH() - .5) * .02), hy = H * (slots[k][1] + (RH() - .5) * .02);
        for(var pass = 0; pass < 2; pass++) obs.forEach(function(pr){
          var pl = pr.left - hr.left - 16, pt = pr.top - hr.top - 16, pr2 = pl + pr.width + 32, pb = pt + pr.height + 32;
          if(hx > pl && hx < pr2 && hy > pt && hy < pb) hy = Math.max(H * .22, pt - 12);
        });
        // 手で切った箔：4つの角を ±12% ずつずらし、1つの角を斜めに欠く（5つの頂点）。面は本物の金箔の肌（LEAF）
        var s0 = slots[k][2] * (.92 + RH() * .16), vs = [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]].map(function(v){ return [(v[0] + (RH() - .5) * .24) * s0, (v[1] + (RH() - .5) * .24) * s0]; });
        var ci = Math.floor(RH() * 4), cv0 = vs[ci], pv = vs[(ci + 3) % 4], nv = vs[(ci + 1) % 4], cut = .18 + RH() * .16;
        vs.splice(ci, 1, [cv0[0] + (pv[0] - cv0[0]) * cut, cv0[1] + (pv[1] - cv0[1]) * cut], [cv0[0] + (nv[0] - cv0[0]) * cut * .8, cv0[1] + (nv[1] - cv0[1]) * cut * .8]);
        var fr0 = hy - 30 - RH() * 60;
        haku.push({ x: hx, y: hy, s: s0, rot: (RH() - .5) * .6, t: 0, vs: vs, px: RH() * 400, py: RH() * 300,
                    c: '#C9A35E', from: fr0, spin: (RH() < .5 ? -1 : 1) * (.2 + RH() * .2), delay: k * 80,
                    bx: hx, by: hy, fd: hy - fr0, gid: k < 3 ? 0 : 1 });
      }
      for(var ng2 = 0; ng2 < noge.length; ng2++){
        haku.push({ x: W * noge[ng2][0], y: H * noge[ng2][1], s: 10 + RH() * 12, rot: (RH() - .5) * .5, t: 2, c: GOLD[ng2 % 4],
                    from: H * noge[ng2][1] - 40, spin: 0, delay: 200 + ng2 * 80, bx: W * noge[ng2][0], by: H * noge[ng2][1], fd: 40, gid: 10 + ng2 });
      }
      pendFit = true;
      // 薄墨の霞（水墨の絵の上だけ）：ぼかした横長の帯 3 本が、40〜60 秒かけて右から左へ流れる
      var RM = seeded(47);
      // 第6周：すやり霞は2本に絞り、濃さを上げて松の根元にかける
      mist = [{ y: .30, h: .15, a: .11, per: 52000 }, { y: .78, h: .13, a: .12, per: 44000 }]
        .map(function(m0){ m0.ph = RM(); m0.w = .55 + RM() * .25; return m0; });
    }
    // 箔の肌が読めたら、雲を塗り直す
    if(!LEAF.src) LEAF.wait.push(function(){ init(); });
    // 第8周：切箔を元の絵の金地にだけ置く。いま出ている絵を小さな canvas に写し、箔の置き場の明るさと色を読む。
    // 絵は拡大の途中（8 秒かけて縮む）なので、行き着いた先の枠を、同じ class の見えない img で測る
    var pendFit = true;
    function goldFit(){
      if(!hero || curTone() !== 'gold') return true;
      var im = hero.querySelector('.hero-ph img.on');
      if(!im || !im.complete || !im.naturalWidth) return false;
      var pr = document.createElement('img'); pr.className = im.className; pr.alt = ''; pr.setAttribute('aria-hidden', 'true');
      pr.style.cssText = 'visibility:hidden;transition:none;';
      im.parentNode.insertBefore(pr, im.nextSibling);
      var hr = cv.getBoundingClientRect(), ir = pr.getBoundingClientRect(), opS = getComputedStyle(pr).objectPosition.split(' ');
      pr.parentNode.removeChild(pr);
      var op = [opS[0], opS[1] || '50%'].map(function(v){ return /%$/.test(v) ? parseFloat(v) / 100 : .5; });
      var nw = im.naturalWidth, nh = im.naturalHeight, sc = Math.max(ir.width / nw, ir.height / nh);
      var ox = ir.left - hr.left + (ir.width - nw * sc) * op[0], oy = ir.top - hr.top + (ir.height - nh * sc) * op[1];
      var SW = 320, SH = Math.round(SW * nh / nw), sm = document.createElement('canvas'), px;
      sm.width = SW; sm.height = SH;
      try{ var sg = sm.getContext('2d', { willReadFrequently: true }); sg.drawImage(im, 0, 0, SW, SH); px = sg.getImageData(0, 0, SW, SH).data; }catch(e){ return true; }
      var f = SW / (nw * sc);
      function isGold(x, y){
        var sx = Math.round((x - ox) * f), sy = Math.round((y - oy) * f);
        if(sx < 0 || sy < 0 || sx >= SW || sy >= SH) return false;
        var i = (sy * SW + sx) * 4, r = px[i], gg = px[i + 1], b = px[i + 2], L = (Math.max(r, gg, b) + Math.min(r, gg, b)) / 510;
        return L > .5 && r >= gg && gg > b && r - b > 28 && r - b < 125;
      }
      function okArea(x, y, rad){
        var st = Math.max(3, rad / 2);
        for(var dy = -rad; dy <= rad; dy += st) for(var dx = -rad; dx <= rad; dx += st) if(!isGold(x + dx, y + dy)) return false;
        return true;
      }
      var ob = [hero.querySelector('.hero-plate'), dotsEl, hero.querySelector('.hero-deal')].filter(function(el){ return el && el.getBoundingClientRect().width; })
        .map(function(el){ var r = el.getBoundingClientRect(); return [r.left - hr.left - 14, r.top - hr.top - 14, r.right - hr.left + 14, r.bottom - hr.top + 14]; });
      function hit(x, y){ for(var i = 0; i < ob.length; i++) if(x > ob[i][0] && x < ob[i][2] && y > ob[i][1] && y < ob[i][3]) return true; return false; }
      var groups = {};
      haku.forEach(function(q){ (groups[q.gid] = groups[q.gid] || []).push(q); });
      Object.keys(groups).forEach(function(key){
        var G = groups[key], best = null;
        for(var rr = 0; rr <= 240 && !best; rr += 10){
          var n = rr === 0 ? 1 : Math.max(8, Math.round(rr / 5));
          for(var a = 0; a < n && !best; a++){
            var dx = rr * Math.cos(a / n * 6.283), dy = rr * Math.sin(a / n * 6.283) * .6;
            if(G.every(function(q){ var x = q.bx + dx, y = q.by + dy;
              return x > 10 && x < W - 10 && y > H * .2 && y < H - 8 && !hit(x, y) && okArea(x, y, q.t === 2 ? q.s * .5 : q.s * .6 + 4); })) best = [dx, dy];
          }
        }
        G.forEach(function(q){
          q.hide = !best;
          if(best){ q.x = q.bx + best[0]; q.y = q.by + best[1]; q.from = q.y - q.fd; }
        });
      });
      return true;
    }
    function draw(dt, t){
      var g = cv.getContext('2d'), now = performance.now();
      if(born === null) born = now;
      // 開いたときに一度だけ：雲が画面の端から 1.6 秒で差し込み、切箔が回りながら舞い降りて決まった位置で止まる
      var age = reduce ? 1e9 : now - born;
      g.clearRect(0, 0, W, H);
      // 絵の切り替わり（屏風を開くように 1.4 秒）の間は雲を消し、見えない間に重ね方を替える
      var since = now - fadeAt, k = since < 1600 ? Math.abs(since - 800) / 800 : 1;
      if(since >= 800) mode = curTone();
      if(pendFit && since >= 800) pendFit = !goldFit();
      // 紙の絵のときだけ乗算で重ねる（金地の絵には雲を置かず、砂子と切箔の光を普通に見せる）。切り替えは雲が消えている間に
      var bl = 'normal';
      if(cv.style.mixBlendMode !== bl) cv.style.mixBlendMode = bl;
      var par = hero ? Math.min(window.scrollY, H) * .15 : 0;
      // 金地の絵には雲を置かない（金の上に金を重ねない）。金砂子と切箔だけ
      if(mode !== 'gold'){
        for(var i = 0; i < clouds.length; i++){
          var c = clouds[i], grow = ease((age - 200 - i * 350) / 1600);
          if(grow <= 0) continue;
          var sway = reduce ? 0 : Math.sin(now / 24000 * 6.283 + c.ph) * 6;
          var iw = c.c.img.width / DPR, ih = c.c.img.height / DPR, x = c.x - c.c.pad + sway, y = c.y - c.c.pad - par;
          // 第7周：墨の絵の上では、雲を .8 で重ね、下の霧と松がうっすら透ける霞にする（乗算は箔の照りが死んで黄土色の面になったので使わない）
          g.save(); g.globalAlpha = k * .8;
          g.beginPath();
          if(c.side === 'r') g.rect(x + iw * (1 - grow), y, iw * grow, ih); else g.rect(x, y, iw * grow, ih);
          g.clip(); g.drawImage(c.c.img, x, y, iw, ih); g.restore();
        }
      }
      var fade = easeOut((age - 300) / 1400);
      // 方針第2版（A2）：扉のデジタルの層を「光」で見せる。金地でも紙（松林図）でも、斜めの光の帯が約 14 秒に1度、左上から右下へ渡る。
      // 金地は照り（幅 W*.25・α .18 の明るい光）、紙は金泥の光（幅 W*.18・α .10 の金色。白い光は紙の上で見えないため）。
      // 光が通る所の切箔は照る。動きを減らす設定では光を出さない
      // 第3周（評価役の指摘）：光は開いてから 1.2 秒後に最初の1回を通す（その前は出さない）。以後は 14 秒に1度
      // 第5周：1回の渡りは 6.5 秒（絵の送りは 9.5 秒）。絵が替わったら、その 0.9 秒後にもう一度左から。送りが止まっていれば 9.5 秒ごと
      var LP = 9500, LD = 6500, lage = (lightAt === null ? age - 1200 : now - lightAt), lph = Math.min(1, (Math.max(0, lage) % LP) / LD), lspan = W + H * .6, lcx = -W * .3 + lph * (lspan + W * .6);
      var gold = mode === 'gold', bw = gold ? W * .25 : W * .17, dlx = 2 * bw, dly = H * .5, dl = Math.hypot(dlx, dly);
      // 切箔の照り：光の帯の中心線（グラデーションの向きに直交する線）からの距離で決める
      function lit(x, y){ var dn = ((x - lcx) * dlx + (y - H * .25) * dly) / dl; return Math.exp(-Math.pow(dn / (bw * .45), 2)); }
      if(lcv && lage < 0){ lcv.getContext('2d').clearRect(0, 0, W, H); }
      else if(lcv){
        // 加算なので、金地は α .07（普通に重ねた α .18 と同じくらいの照り）、紙は金色の光 α .10
        var lg2 = lcv.getContext('2d'); lg2.clearRect(0, 0, W, H);
        var lg = lg2.createLinearGradient(lcx - bw, 0, lcx + bw, H * .5);
        // 第6周：紙（水墨）の絵では加算をやめ、金泥の色を soft-light で狭く一筋に重ねる（加算の淡い光は墨の上で見えなかった）
        var lbl = gold ? 'plus-lighter' : 'soft-light'; if(lcv.style.mixBlendMode !== lbl) lcv.style.mixBlendMode = lbl;
        var lc = gold ? '255,246,214' : '168,130,63', la = gold ? .08 : .6;
        lg.addColorStop(0, 'rgba(' + lc + ',0)'); lg.addColorStop(.5, 'rgba(' + lc + ',' + la + ')'); lg.addColorStop(1, 'rgba(' + lc + ',0)');
        lg2.globalAlpha = k; lg2.fillStyle = lg; lg2.fillRect(0, 0, W, H); lg2.globalAlpha = 1;
      }
      // 水墨の絵：薄墨の霞だけ（切箔・砂子は撒かない）。金地の絵：砂子・野毛・切箔
      var inkA = gold ? 0 : k * Math.min(1, fade * 1.2), goldA = gold ? k : 0;
      if(inkA > 0){
        for(var mi = 0; mi < mist.length; mi++){
          var ms = mist[mi], ph = reduce ? ms.ph : ((t / ms.per + ms.ph) % 1), mw = W * ms.w, mx = W + mw * .5 - ph * (W + mw), my = H * ms.y - par * .6, mh = H * ms.h;
          g.save(); g.translate(mx, my); g.scale(mw / mh, 1);
          var mg = g.createRadialGradient(0, 0, 0, 0, 0, mh * .5);
          mg.addColorStop(0, 'rgba(30,31,29,' + (ms.a * inkA) + ')'); mg.addColorStop(.55, 'rgba(30,31,29,' + (ms.a * .55 * inkA) + ')'); mg.addColorStop(1, 'rgba(30,31,29,0)');
          g.fillStyle = mg; g.beginPath(); g.arc(0, 0, mh * .5, 0, 6.283); g.fill(); g.restore();
        }
      }
      // 2026-10-01 第7周：水墨の松林図の上でも、下の帯（スマホは空の帯）にだけ金砂子を α .45 で撒き、光の帯が通るとき瞬かせる
      // （霞の上の砂子は屏風の本来の技法。等伯の余白＝中央と右上は切らない）。切箔は金地の絵の上だけ
      // 紙の地では明るい金は地に溶けて見えないので、金泥の濃い色（#9C7A3C・#B08840）で、粒を 1.5 倍に
      // 2026-10-01 修正役V f1：紙の地では光の帯も砂子もほとんど見えなかった。光の帯を 1.4 倍の幅に、砂子を α .85 に
      var paperA = gold ? 0 : .85 * k;
      for(var d = 0; (goldA > 0 || paperA > 0) && d < dust.length; d++){
        var p = dust[d], tw = .5 + .5 * Math.sin(t / p.per * 6.283 + p.p), fA = gold ? goldA : (p.b === 0 ? paperA : 0);
        if(fA <= 0) continue;
        if(!gold && !reduce) tw = Math.min(1, tw + lit(p.x, p.y) * 1.2);
        // 大きな砂子は瞬きを尖らせる（ずっと光っていない。ときどき、ふっと照る）
        if(p.sz === 2) tw = Math.pow(tw, 3);
        // 第2周：開いたとき、砂子を右上から左下へ「撒く」（粒ごとに 0〜600ms ずらし、1.2 秒で止まる）。止まったあとは瞬きだけ
        var sd = reduce ? 1 : easeOut((age - 250 - p.lag) / 1200), sx = p.x + (1 - sd) * 46, sy = p.y - par - (1 - sd) * 34;
        g.globalAlpha = Math.min(1, p.lo + p.amp * tw) * Math.min(1, sd * 1.6) * fA;
        if(g.globalAlpha <= 0) continue;
        g.fillStyle = gold ? p.c : (p.sz === 2 ? '#B08840' : '#9C7A3C');
        if(p.noge){ g.save(); g.translate(sx, sy); g.rotate(p.rot); g.fillRect(-p.noge / 2, -.3, p.noge, gold ? .6 : .8); g.restore(); }
        else { g.beginPath(); g.arc(sx, sy, gold ? p.r : p.r * 1.5, 0, 6.283); g.fill(); }
      }
      // 切箔は #C9A35E・α .6 で止まっていて、斜めの光が当たったときだけ明るく照る（動きを減らす設定では舞い降りずに止まって見える）
      for(var j = 0; goldA > 0 && j < haku.length; j++){
        var q = haku[j], u = easeOut((age - 500 - q.delay) / 1200);
        if(u <= 0 || q.hide) continue;
        if(q.t === 2){ var ny = q.from + (q.y - q.from) * u; g.save(); g.globalAlpha = .7 * goldA * Math.min(1, u * 2); g.fillStyle = q.c; g.translate(q.x, ny - par); g.rotate(q.rot); g.fillRect(-q.s / 2, -.35, q.s, .7); g.restore(); continue; }
        var qy = q.from + (q.y - q.from) * u, rot = q.rot + q.spin * (1 - u) * 1.4, gl = reduce ? 0 : lit(q.x, q.y) * u * k;
        drawLeaf(g, q, q.x + Math.sin(u * 3.1) * 14 * (1 - u), qy - par, rot, (.66 + .3 * gl) * Math.min(1, u * 2) * goldA, gl);
      }
      g.globalAlpha = 1;
    }
    return { init: init, draw: draw };
  }

  /* ── 青海波：波ごとに金の濃さ（.75〜1）と線の太さ（0.8〜1.3px）を揺らす。画面に入ると下の段から描き起こす ── */
  function seigaiha(cv){
    var W = 0, H = 0, base = null, waves = [], R0 = 44, t0 = null, done = false, drawn = false, mask = null, rim = null, layer = null;
    function init(){
      var f = fit(cv); W = f.w; H = f.h;
      // 第10周：波を細かく（44 → 26px）して、一様な壁紙に見えないようにする
      // 第2周（評価役の指摘「見出しより騒がしい」）：波の半径を 1.4 倍にして線の密度を下げる
      R0 = W < 700 ? 28 : 36;
      var R = seeded(5), dx = R0 * 2, dy = R0 * .5, row = 0;
      waves = [];
      for(var y = -R0; y < H + R0 * 2; row++, y += dy){
        var off = (row % 2) ? R0 : 0;
        for(var x = -dx + off; x < W + dx; x += dx) waves.push({ x: x, y: y, row: row, a: .75 + R() * .25, w: .6 + R() * .3, fill: R() < .34 });
      }
      // 第7周：PC では、文様を画面の右 4 割に置き、左の縁を直線のグラデーションで消さずに、すやり霞の形で抜く（片身替わりの見せ方）
      mask = null; rim = null;
      if(W >= 700){
        var RM = seeded(19), x0 = W * .8, shapes = [];
        // 霞の帯：上下に重ねて帯の高さを埋め、左へ差し出す長さを帯ごとに変える（左の縁が段々の霞の端だけになる）。端は潰した楕円
        // 第9周：帯を5→3にし、差し出す長さの差を大きく（.08／.3／.16）。縁は 40px 幅でぼかして消す（金の縁取りはやめた）
        // 方針第2版（A6）：右の 2 割を埋めていた長方形（x0 から右端まで）をやめた。帯と長方形のつなぎ目に直角の段が出ていたため。
        // 代わりに3本の帯を右端まで伸ばし、上下を 0.04〜0.08H ずつ重ねて帯の高さを埋める（上の帯は上端の外から、下の帯は下端の外まで）。
        // 帯の左端（楕円の端の外側）は、見出し「ふたつの仕事」（と英字の札・英訳）の右端から 32px 以上離す
        var minX = 0, band = cv.parentNode;
        if(band) [].forEach.call(band.querySelectorAll('.sec-h, .ja-h, .en-h'), function(el){
          var rg = document.createRange(); rg.selectNodeContents(el);
          var rr = rg.getBoundingClientRect(), cr = cv.getBoundingClientRect();
          if(rr.width) minX = Math.max(minX, rr.right - cr.left + 32);
        });
        [[.14, .42, .08], [.5, .38, .3], [.86, .42, .16]].forEach(function(b){
          var cy = H * (b[0] + (RM() - .5) * .02), hh = H * (b[1] + RM() * .04), L = W * b[2] * (.8 + RM() * .4);
          var rx = hh / 2 * (.45 + RM() * .2), x = Math.max(x0 - L, minX + rx);
          shapes.push({ x: Math.min(x, W - rx - 8), cy: cy, hh: hh, rx: rx });
        });
        function fillShapes(g2){
          shapes.forEach(function(sh){
            g2.beginPath(); g2.moveTo(W, sh.cy - sh.hh / 2); g2.lineTo(sh.x, sh.cy - sh.hh / 2);
            g2.ellipse(sh.x, sh.cy, sh.rx, sh.hh / 2, 0, -Math.PI / 2, Math.PI / 2, true);
            g2.lineTo(W, sh.cy + sh.hh / 2); g2.closePath(); g2.fill();
          });
        }
        mask = document.createElement('canvas'); mask.width = W * DPR; mask.height = H * DPR;
        var mg = mask.getContext('2d'); mg.setTransform(DPR, 0, 0, DPR, 0, 0);
        // 第2周（評価役の指摘「輪郭付きのカプセル・錠剤に見える」）：金の輪郭線をやめ、帯の端を丸く閉じずに、
        // 帯ごとに「端 → 右へ 38%」で α0→1 に溶かす（霞が切れていく）。上下の段も 12px ぼかして、直角の段や角を残さない
        mg.filter = 'blur(12px)';
        shapes.forEach(function(sh){
          var tx = sh.x - sh.rx, fx = tx + (W - tx) * .38, fg = mg.createLinearGradient(tx, 0, fx, 0);
          fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(.5, 'rgba(0,0,0,.5)'); fg.addColorStop(1, '#000');
          mg.fillStyle = fg; mg.beginPath(); mg.moveTo(W + 8, sh.cy - sh.hh / 2); mg.lineTo(tx, sh.cy - sh.hh / 2);
          mg.lineTo(tx, sh.cy + sh.hh / 2); mg.lineTo(W + 8, sh.cy + sh.hh / 2); mg.closePath(); mg.fill();
        });
        mg.filter = 'none';
        // 第2周：輪郭の金線はやめた（rim は作らない）
        if(false){
        rim = document.createElement('canvas'); rim.width = W * DPR; rim.height = H * DPR;
        var rg = rim.getContext('2d'); rg.setTransform(DPR, 0, 0, DPR, 0, 0);
        // 第8周：形ごとに線を引くと、重なった帯の内側まで金線が横切った。合わせた形を 1px ずつ4方向にずらして重ね（膨らませ）、
        // そこから元の形を抜いた「外周の帯」だけを金で塗る
        rg.fillStyle = 'rgb(201,163,94)';
        [[.5, 0], [-.5, 0], [0, .5], [0, -.5]].forEach(function(o){ rg.save(); rg.translate(o[0], o[1]); fillShapes(rg); rg.restore(); });
        rg.globalCompositeOperation = 'destination-out'; rg.fillStyle = '#000'; fillShapes(rg);
        }
      }
      layer = document.createElement('canvas'); layer.width = W * DPR; layer.height = H * DPR;
      base = document.createElement('canvas'); base.width = W * DPR; base.height = H * DPR;
      paint(base.getContext('2d'), 1e9);
      done = false; drawn = false;
    }
    function paint(g0, el){
      g0.setTransform(DPR, 0, 0, DPR, 0, 0);
      g0.fillStyle = '#1D2123'; g0.fillRect(0, 0, W, H);
      var g = g0;
      if(mask){ g = layer.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H); }
      var rows = waves.length ? waves[waves.length - 1].row : 0;
      for(var i = 0; i < waves.length; i++){
        var v = waves[i], fromBottom = rows - v.row;
        var p = Math.max(0, Math.min(1, (el - fromBottom * 40) / 900));
        g.fillStyle = '#1D2123'; g.beginPath(); g.arc(v.x, v.y + R0, R0, Math.PI, 0); g.fill();
        if(p <= 0) continue;
        var e = 1 - Math.pow(1 - p, 3), va = v.a * (.55 + .45 * v.row / Math.max(1, rows)); // 上の段ほど薄く（奥行き）
        // 第5周：波の3つに1つは、いちばん外の弧の内側を金泥で薄く塗る（箔押しの強弱。壁紙のような均一さを崩す）
        if(v.fill){ g.fillStyle = 'rgba(214,181,116,' + (.10 * e * va).toFixed(3) + ')'; g.beginPath(); g.arc(v.x, v.y + R0, R0 - .5, Math.PI, 0); g.fill(); }
        g.lineWidth = v.w;
        for(var k = 5; k >= 1; k--){
          g.strokeStyle = 'rgba(214,181,116,' + ((.3 + .06 * k) * va).toFixed(3) + ')'; // 第2周：線は α .35〜.6 の細い金
          g.beginPath(); g.arc(v.x, v.y + R0, R0 * k / 5 - .5, Math.PI, Math.PI + Math.PI * e); g.stroke();
        }
      }
      if(mask){
        g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-in'; g.drawImage(mask, 0, 0); g.globalCompositeOperation = 'source-over';
        g0.setTransform(1, 0, 0, 1, 0, 0); g0.drawImage(layer, 0, 0);
        // 切り口に 0.5px の金罫を1本（α .6）
        if(rim){ g0.globalAlpha = .6; g0.drawImage(rim, 0, 0); }
        g0.globalAlpha = 1;
        g0.setTransform(DPR, 0, 0, DPR, 0, 0);
      }
      // 第10周：帯の裾の砂子（粗い塵に見えた）は外した
    }
    function draw(dt, t){
      var g = cv.getContext('2d');
      if(reduce){ g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(base, 0, 0); return; }
      if(t0 === null) t0 = t;
      var el = t - t0;
      if(done && drawn) return;
      if(!done){
        paint(g, el);
        var rows = waves.length ? waves[waves.length - 1].row : 0;
        if(el > rows * 40 + 950) done = true;
      } else { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(base, 0, 0); g.setTransform(DPR, 0, 0, DPR, 0, 0); drawn = true; }
    }
    return { init: init, draw: draw, enter: function(t){ if(t0 === null) t0 = t; } };
  }

  /* ── 観世水（第2周で描き直し）：3〜4本の線の束が横に流れ、流れの山（谷）の頂点で、そのまま対数らせん r=a·e^(-0.18θ) に巻き込んで渦になる。
        流れの線と渦は1本の線としてつながる（巻き始めの点で、らせんの接線を流れの傾きに合わせる）。流れは渦の先で改めて始まり、細く生まれて太る。
        渦は流れの山に乗って一緒に動く。墨の円で下地を抜かない。外側の線 1.4px・内側 0.8px、渦の芯に近いほど細い ── */
  function kanze(cv){
    var W = 0, H = 0, streams = [], mobile = false, B = .18, TURNS = 2.2 * 6.283, X0 = -12;
    // 2026-10-01 第7周：data-paper は紙（胡粉）の地に金の線だけで描く（地を塗らない・罫の足を引かない）。data-vert は縦に流す（90°回して描く）
    var paper = cv.hasAttribute('data-paper'), vert = cv.hasAttribute('data-vert'), LC = paper ? '168,130,63' : LINE;
    function init(){
      // 2026-10-01 第5周：data-full（えらぼっとの結びの右の欄）は、欄が狭くても PC の型（3本の流れと渦）で欄いっぱいに流す
      var full = cv.hasAttribute('data-full') && window.innerWidth > 900;
      var f = fit(cv); W = vert ? f.h : f.w; H = vert ? f.w : f.h; mobile = W < 700 && !full;
      // 2026-10-01：data-low の観世水（えらぼっとの扉）は、見出しの下の空いた夜の地に、左から1束だけ低く流す（PC のみ。小さい渦を1つ）
      var low = !mobile && cv.hasAttribute('data-low');
      // 第5周：PC では題（左）の上をマスクで断たず、流れを題の右から細く生まれさせる（0〜80px で線の太さを0から起こす）
      X0 = mobile ? -12 : Math.max(W * .46, 420);
      // 方針第2版（A7）：流れの始まりは見出し（英字の札・題・英訳）の右端から 32px 以上あける
      var band = cv.parentNode;
      if(!mobile && band) [].forEach.call(band.querySelectorAll('.sec-h, .ja-h, .en-h'), function(el){
        var rg = document.createRange(); rg.selectNodeContents(el);
        var rr = rg.getBoundingClientRect(), cr = cv.getBoundingClientRect();
        if(rr.width) X0 = Math.max(X0, rr.right - cr.left + 32);
      });
      // 方針第2版（A7）：線の束は 5 本・間 3px
      if(low || full || paper) X0 = -12;
      var R = seeded(23), ns = 3, lines = (mobile || low) ? [5] : [5, 5, 5];
      // 第7周：スマホは流れを1本（y=.16）にし、画面の右 1/3 に渦を1つだけ大きく（半径 36px・2.6 周）見せる
      // 第10周：渦は PC で1つだけ（中の流れ・x=.78W・半径 72px・2.8 周）にして主役にし、上下の流れは渦を持たない。
      // スマホは渦の中心を帯の上から 3 割（y≈.30H）・半径 30px にして、帯の中へ収める
      TURNS = (mobile ? 2.6 : 2.8) * 6.283;
      streams = [];
      var ys = low ? [.88] : paper ? [.38, .72] : mobile ? [.2] : [.24, .52, .80];
      if(paper) lines = [5, 3];
      // 方針第2版（A7）：渦は大（半径 約70px・中の流れ・x=.74W）と小（約36px・下の流れ・x=.9W。上へ巻く）の2つ。どちらも流れの山（谷）の頂に置く。
      // スマホは帯が低いので、小さい渦（36px）を1つだけ
      var bigR = Math.max(44, Math.min(70, H * .16)), smallR = Math.max(26, Math.min(36, H * .085));
      var plan = low ? [{ x: .3, r: Math.max(24, Math.min(34, H * .06)) }] : paper ? [{ x: .62, r: Math.max(14, Math.min(24, H * .2)) }] : mobile ? [{ x: .8, r: Math.min(36, H * .1) }] : [null, { x: Math.min(W - 150, Math.max(W * .74, X0 + 160)) / W, r: bigR }, { x: Math.min(.9, (W - 120) / W), r: smallR }]; // 大きい渦は流れの始まりから 160px 以上右（見出しの側は流れだけ）
      for(var i = 0; i < ys.length; i++){
        // いちばん上の流れの渦は下へ、ほかは上へ巻く（帯の縁で切れない向き）
        var st = { i: i, y: H * ys[i], a: paper ? H * .09 : (mobile ? Math.min(H * .03, 12) : H * (.048 + R() * .01)), k: (mobile ? .0125 : .0065) + R() * .0010, ph: R() * 6.28, n: lines[i], dir: (i === 0 && !low) ? 1 : -1 };
        var pl = plan[i];
        st.whirl = !!pl;
        if(pl){ st.tx = W * pl.x; st.rw = pl.r; st.ph = (st.dir < 0 ? -Math.PI / 2 : Math.PI / 2) - st.k * st.tx; }
        streams.push(st);
      }
    }
    // 方針第2版（A7）：振れ幅は右へ行くほど大きく（見出しの側は .3 倍で静かに）
    function ramp(x){ return mobile ? 1 : .3 + .7 * Math.max(0, Math.min(1, (x - X0) / Math.max(1, W - X0))); }
    function yAt(s, x, ph){ return s.y + (Math.sin(x * s.k + s.ph + ph) * s.a + Math.sin(x * s.k * 2.1 + ph * .7) * s.a * .25) * ramp(x); }
    function slope(s, x, ph){ return (yAt(s, x + .5, ph) - yAt(s, x - .5, ph)); }
    // 流れの山（上へ巻く渦）または谷（下へ巻く渦）の x。主の波で見当を付け、細かく探して本当の頂点に合わせる
    function crests(s, ph){
      var out = [], base = s.dir < 0 ? -Math.PI / 2 : Math.PI / 2;
      if(!s.whirl) return out;
      // 渦を置くと決めた x（s.tx）にいちばん近い山（谷）を1つだけ。流れはゆっくり揺れるだけなので、渦は画面から出入りしない
      var n = Math.round((s.k * s.tx + s.ph + ph - base) / 6.283), x = (base + 6.283 * n - s.ph - ph) / s.k;
      var best = x, bv = yAt(s, x, ph) * s.dir;
      for(var dx = -30; dx <= 30; dx += 2){ var v = yAt(s, x + dx, ph) * s.dir; if(v > bv){ bv = v; best = x + dx; } }
      out.push(best);
      return out;
    }
    function draw(dt, t){
      // 流れは左右にゆっくり揺れるだけ（±0.3 rad・16 秒）。流れ続けると渦が画面の外へ出てしまうため
      var g = cv.getContext('2d'), ph = reduce || mobile ? 0 : Math.sin(t / 16000 * 6.283) * .3;
      g.setTransform(DPR, 0, 0, DPR, 0, 0);
      if(vert){ g.translate(H, 0); g.rotate(Math.PI / 2); }
      if(paper) g.clearRect(0, 0, W, H); else { g.fillStyle = '#1D2123'; g.fillRect(0, 0, W, H); }
      g.lineCap = 'round'; g.lineJoin = 'round';
      for(var i = 0; i < streams.length; i++){
        var s = streams[i], cs = crests(s, ph), sgn = s.dir, Rw = s.rw || 36;
        // 渦ごとの中心と、巻き始めの向き
        var whirls = cs.map(function(xc){
          var al = Math.atan(slope(s, xc, ph));
          var phi0 = al - Math.atan2(sgn, -B), ux = Math.cos(phi0), uy = Math.sin(phi0);
          var cx = xc - Rw * ux, cy = yAt(s, xc, ph) - Rw * uy;
          return { cx: cx, cy: cy, phi0: phi0, ux: ux, uy: uy };
        });
        // 線の束のあいだを薄く塗り、水の面を出す（流れの始まりは細く）
        var hw = (s.n - 1) / 2 * 3;
        g.fillStyle = 'rgba(' + LC + ',.05)'; g.beginPath();
        for(var fx = X0; fx <= W + 12; fx += 6){ var gw = Math.min(1, (fx - X0) / 80); g.lineTo(fx, yAt(s, fx, ph) - hw * gw); }
        for(fx = W + 12; fx >= X0; fx -= 6){ var gw2 = Math.min(1, (fx - X0) / 80); g.lineTo(fx, yAt(s, fx, ph) + hw * gw2); }
        g.closePath(); g.fill(); // 第10周：束のあいだを rgba(201,163,94,.05) で塗り、水の面を出す
        for(var l = 0; l < s.n; l++){
          var off = (l - (s.n - 1) / 2) * 3;
          // 渦の芯に近い線ほど細い。線の太さは 0.6〜1.1px の中で揺らす
          var near = s.n > 1 ? (sgn > 0 ? l / (s.n - 1) : (s.n - 1 - l) / (s.n - 1)) : 0, lw = 1.1 - .3 * near;
          var start = X0, fresh = !mobile;
          for(var j = 0; j <= whirls.length; j++){
            var w = whirls[j], endX = W + 12, r0 = 0;
            if(w){
              // この線が渦へ入る点：中心から u の向きに半径 r0 の点が、この線の上に来るように r0 を合わせる
              r0 = Rw - sgn * off;
              for(var it = 0; it < 4; it++){ var px = w.cx + r0 * w.ux; r0 = (yAt(s, px, ph) + off - w.cy) / w.uy; }
              endX = w.cx + r0 * w.ux;
            }
            // 流れ（渦の先で始まる所は、細く生まれて太る）
            if(endX > start){
              g.strokeStyle = 'rgba(' + LC + ',.5)';
              var x = start, seg = fresh ? 80 : 0;
              if(seg){
                for(var q = 0; q < 8 && x < endX; q++){
                  var nx = Math.min(endX, x + seg / 8);
                  g.lineWidth = lw * (q + .5) / 8; g.beginPath(); g.moveTo(x, yAt(s, x, ph) + off * Math.min(1, (x - X0) / 80)); g.lineTo(nx, yAt(s, nx, ph) + off * Math.min(1, (nx - X0) / 80)); g.stroke(); x = nx;
                }
              }
              // 第10周：線の太さを流れに沿って変え、筆の入りと抜きを出す（同じ太さの線はベクター素材に見えた）
              while(x < endX){
                var x2 = Math.min(endX, x + 8), xm = (x + x2) / 2;
                // 右ほど太く揺れ、見出しの側は細く静か（0.6〜1.1px）
                g.lineWidth = .6 + (lw - .6) * Math.abs(Math.sin(xm * s.k * .5 + s.ph + l * .7)) * ramp(xm);
                g.beginPath(); g.moveTo(x, yAt(s, x, ph) + off); g.lineTo(x2, yAt(s, x2, ph) + off); g.stroke(); x = x2;
              }
            }
            if(!w) break;
            // 渦：流れの終わりの点から、同じ接線のまま内へ巻き込む。芯に近づくほど細く
            var steps = 120, prevX = w.cx + r0 * w.ux, prevY = w.cy + r0 * w.uy;
            g.strokeStyle = 'rgba(' + LC + ',.6)';
            for(var c0 = 0; c0 < steps; c0 += 8){
              g.beginPath(); g.moveTo(prevX, prevY);
              var rr = r0;
              for(var q2 = c0 + 1; q2 <= Math.min(steps, c0 + 8); q2++){
                var th = q2 / steps * TURNS; rr = r0 * Math.exp(-B * th);
                var ang = w.phi0 + sgn * th; prevX = w.cx + Math.cos(ang) * rr; prevY = w.cy + Math.sin(ang) * rr;
                g.lineTo(prevX, prevY);
              }
              g.lineWidth = Math.max(.45, lw * (.4 + .6 * Math.pow(rr / r0, .5))); g.stroke();
            }
            // 流れは渦に入る点からそのまま先へ続く（渦は流れから枝分かれして巻き込む。線を途中で切らない）
            start = endX; fresh = false;
          }
        }
        // 渦の芯
        g.fillStyle = 'rgba(' + LC + ',.8)';
        // 第9周：渦の芯の点は描かない
      }
      if(!paper) foot(g, W, H);
    }
    return { init: init, draw: draw };
  }

  /* ── 切箔の罫（第5周で撒き直し）：中央に1pxの金線。撒き方は「霞撒き」── 罫の1点（data-at）に集め、左右へ指数的にまばらにする。
        切箔は正方形・三角の欠片・野毛（細い箔）を混ぜ、砂子は大小2種（小を多く）。すべて版面の中に収め、両端15%は線と一緒に消す。
        画面に入ったとき、光（切箔と砂子が少し明るむだけ）が一度だけ横切る ── */
  function kirihaku(cv){
    var W = 0, H = 0, dust = [], haku = [], t0 = null, x0 = 0, span = 0;
    function edgeFade(x){ var u = (x - x0) / span, e = Math.min(u, 1 - u) / .15; return Math.max(0, Math.min(1, e)); }
    function init(){
      var f = fit(cv); W = f.w; H = f.h;
      var R = seeded(+cv.getAttribute('data-seed') || 41), at = +cv.getAttribute('data-at') || .5, big = cv.hasAttribute('data-big');
      span = Math.min(W * .84, 1180); x0 = (W - span) / 2;
      var cx0 = x0 + span * at;
      dust = []; haku = [];
      // 2026-09-30 第3周（評価役の指摘）：大きさのそろった四角と丸の塊が「紙吹雪・クリックの残像」に見えた。
      // 四角の切箔はやめ、線の上に野毛（幅 .5px・長さ 8〜20px・傾き ±4°）を 12 本、砂子（半径 .3〜.6px）を 60 粒だけ。
      // どちらも data-at の点に寄せ、左右 15% で線と一緒に消す。線は .5px・α .7、中央の 40% だけ 1px に太る（金泥で引いた一筆）
      function spot(k, amp){
        var sg = R() < .5 ? -1 : 1, x = cx0 + sg * span * .5 * Math.pow(R(), k);
        x = Math.max(x0 + 2, Math.min(x0 + span - 2, x));
        var near = 1 - Math.min(1, Math.abs(x - cx0) / (span * .5));
        var y = H / 2 + (R() < .5 ? -1 : 1) * (1 + Math.pow(R(), 1.6) * amp * (.4 + .6 * near));
        return [x, y];
      }
      var sc = W < 700 ? .6 : 1;
      for(var i = 0; i < Math.round(60 * sc); i++){
        var p = spot(1.8, 8);
        dust.push({ x: p[0], y: p[1], r: .3 + R() * .3, a: .45 + R() * .45, c: GOLD[i % 4] });
      }
      for(var k = 0; k < Math.round(12 * sc); k++){
        var q = spot(1.6, 5);
        haku.push({ x: q[0], y: q[1], L: 8 + R() * 12, rot: (R() - .5) * .14, c: GOLD[k % 4] });
      }
    }
    function draw(dt, t){
      var g = cv.getContext('2d'), yl = Math.round(H / 2);
      g.clearRect(0, 0, W, H);
      // 金泥の一筆：.5px・α .7 の線を版面いっぱいに引き、中央 40% だけ 1px に太らせる（端は細く、両端 15% で消える）
      var lg = g.createLinearGradient(x0, 0, x0 + span, 0);
      lg.addColorStop(0, 'rgba(184,145,74,0)'); lg.addColorStop(.15, 'rgba(184,145,74,.7)'); lg.addColorStop(.85, 'rgba(184,145,74,.7)'); lg.addColorStop(1, 'rgba(184,145,74,0)');
      g.fillStyle = lg; g.fillRect(x0, yl, span, .5);
      var b0 = x0 + span * .3, b1 = x0 + span * .7;
      g.beginPath(); g.moveTo(b0, yl + .25);
      g.quadraticCurveTo((b0 + b1) / 2, yl - .5, b1, yl + .25);
      g.quadraticCurveTo((b0 + b1) / 2, yl + 1, b0, yl + .25);
      g.fillStyle = 'rgba(184,145,74,.7)'; g.fill();
      var el = t0 === null || reduce ? 1e9 : t - t0, sweep = x0 - 200 + el / 2200 * (span + 400);
      for(var i = 0; i < dust.length; i++){
        var p = dust[i], gl = glint(p.x, 0, sweep, 90);
        g.globalAlpha = Math.min(1, p.a + gl * .35) * edgeFade(p.x); g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill();
      }
      for(var k = 0; k < haku.length; k++){
        var q = haku[k], gl2 = glint(q.x, 0, sweep, 90);
        g.save(); g.translate(q.x, q.y); g.rotate(q.rot); g.globalAlpha = (.6 + .35 * gl2) * edgeFade(q.x); g.fillStyle = q.c;
        g.fillRect(-q.L / 2, -.25, q.L, .5); g.restore();
      }
      g.globalAlpha = 1;
    }
    return { init: init, draw: draw, enter: function(t){ if(t0 === null) t0 = t; } };
  }

  /* ── 絵の帯の上の金砂子：上下の縁に撒いて止め、瞬きだけ ── */
  function sunago(cv){
    var W = 0, H = 0, dust = [], haku = [], diag = false, fine = false;
    function init(){
      var f = fit(cv); W = f.w; H = f.h;
      var R = seeded(53); dust = []; haku = [];
      // data-flow="diag"：流水の右上から左下への斜めの帯（右上 78% から左下 33% へ引いた線のまわり ±80px）に沿って撒く
      diag = cv.getAttribute('data-flow') === 'diag'; var C = W * .78;
      // 方針第2版（A8）：WORKS の帯は片身替わり。砂子は絵の側（PC は右 50% より右、スマホは上 40%）だけに撒き、字の載る炭の面には撒かない
      var works = !!cv.closest('.band-works'), mob = W < 700; fine = !!cv.closest('.contact-art');
      // 2026-10-01 第7周：料金の右の段の下（.pn-sunago）は、紙の上の砂子の帯。中ほどに横長に寄せ、上下へまばらに。四角い箔は出さず野毛だけ
      var pn = !!cv.closest('.pn-sunago'); if(pn) fine = true;
      function spot0(){
        if(pn){ var off = -Math.log(1 - R() * .97) / 3.4 * (R() < .5 ? -1 : 1); return [W * (.04 + R() * .92), H * (.5 + off * .42)]; }
        if(!diag){ var top = R() < .5; return [R() * W, top ? R() * H * .22 : H * (.78 + R() * .22)]; }
        var y = R() * H, off = (R() + R() - 1) * 80; return [C - y / Math.max(H, 1) * W * .45 + off, y];
      }
      function spot(){
        var p = spot0();
        for(var q = 0; works && q < 40 && (mob ? p[1] > H * .4 : p[0] < W * .5); q++) p = spot0();
        return p;
      }
      for(var i = 0; i < (W < 700 ? 50 : 120); i++){
        var p0 = spot();
        // 第7周：絵の上で見える大きさに（半径 .7〜1.4）
        dust.push({ x: p0[0], y: p0[1], r: pn ? (R() < .85 ? .4 + R() * .5 : 1.1 + R() * .4) : fine ? .3 + R() * .6 : (diag ? .7 + R() * .7 : (R() < .8 ? .45 + R() * .35 : 1.2 + R() * .5)), per: 3000 + R() * 4000, p: R() * 6.28, c: GOLD[i % 4] });
      }
      // 第6周：結びの絵（春の流れ）の上では四角い箔を出さず、細かい砂子と野毛だけ（白い点が画素抜けに見えたため）
      for(var k = 0; k < (fine ? (mob ? 3 : 6) : (W < 700 ? 7 : (diag ? 16 : 10))); k++){ var p1 = spot(); haku.push({ x: p1[0], y: p1[1], s: fine ? 8 + R() * 8 : 3 + R() * 4, rot: (R() - .5) * .3, c: GOLD[k % 4], t: fine ? 2 : hakuType(R) }); }
    }
    function draw(dt, t){
      var g = cv.getContext('2d'); g.clearRect(0, 0, W, H);
      var sweep = ((t / 11000) % 1.4 - .2) * (W + H * .5), lo = diag ? .55 : .35, amax = fine ? (cv.closest('.pn-sunago') ? .8 : .5) : 1;
      for(var i = 0; i < dust.length; i++){
        var p = dust[i]; g.globalAlpha = amax * (lo + (1 - lo) * (.5 + .5 * Math.sin(t / p.per * 6.283 + p.p)));
        g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill();
      }
      for(var k = 0; k < haku.length; k++){ var q = haku[k], gl = glint(q.x, q.y, sweep, 140); drawHaku(g, q.x, q.y, q.s, q.rot, gl > .3 && !fine ? '#F4E2B0' : q.c, (fine ? .45 : .6 + .4 * gl), q.t); }
      g.globalAlpha = 1;
      if(diag) foot(g, W, H);
    }
    return { init: init, draw: draw };
  }


  /* 麻の葉：正三角形の格子の各三角形で、重心から3つの頂点へ線を引く。墨の地に金の細線。光がゆっくり斜めに渡る */
  function asanoha(cv){
    var W = 0, H = 0, base = null;
    function init(){
      var f = fit(cv); W = f.w; H = f.h;
      base = document.createElement('canvas'); base.width = W * DPR; base.height = H * DPR;
      var g = base.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0);
      var bg = g.createRadialGradient(W * .7, H * .3, 0, W * .7, H * .3, Math.max(W, H));
      bg.addColorStop(0, '#2A2F31'); bg.addColorStop(.6, '#1D2123'); bg.addColorStop(1, '#161A1B');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      var sz = W < 700 ? 46 : 64, hh = sz * Math.sqrt(3) / 2, R = seeded(41);
      g.lineCap = 'round';
      // 第8周：三角形ごとに外周を引くと、隣と共有する辺が二度塗りになり、横の辺が縞（帯）に見えた。
      // 格子の3方向の線（横・右上がり・右下がり）は画面を貫く1本の線として1回だけ引き、三角形ごとの濃淡は内側の3本（麻の葉の芯）だけで付ける
      g.strokeStyle = 'rgba(214,181,116,.3)'; g.lineWidth = .7; g.beginPath();
      var rows = Math.ceil(H / hh) + 2, k0, yy2;
      for(var r0 = -1; r0 <= rows; r0++){ yy2 = r0 * hh; g.moveTo(-sz, yy2); g.lineTo(W + sz, yy2); }
      var span = H + hh * 2, dxs = span / Math.sqrt(3);
      // 格子の点は、y = -hh の段では x = k·sz。そこから傾き ±√3 で下へ
      for(k0 = -Math.ceil(dxs / sz) - 2; k0 * sz < W + dxs + sz; k0++){
        var bx = k0 * sz;
        g.moveTo(bx, -hh); g.lineTo(bx + dxs, -hh + span);
        g.moveTo(bx, -hh); g.lineTo(bx - dxs, -hh + span);
      }
      g.stroke();
      for(var row = -1; row * hh < H + hh; row++){
        for(var col = -2; col * sz / 2 < W + sz; col++){
          var up = (row + col) % 2 === 0, x0 = col * sz / 2, y0 = row * hh;
          var p = up ? [[x0, y0 + hh], [x0 + sz / 2, y0], [x0 + sz, y0 + hh]] : [[x0, y0], [x0 + sz, y0], [x0 + sz / 2, y0 + hh]];
          var cx = (p[0][0] + p[1][0] + p[2][0]) / 3, cy = (p[0][1] + p[1][1] + p[2][1]) / 3;
          var a = .22 + R() * .22;
          g.strokeStyle = 'rgba(226,198,138,' + (a + .12) + ')'; g.lineWidth = .6;
          g.beginPath(); for(var k = 0; k < 3; k++){ g.moveTo(cx, cy); g.lineTo(p[k][0], p[k][1]); } g.stroke();
        }
      }
      // 端へ向かって沈める（面の縁が文様で切れて見えないように）
      var vg = g.createRadialGradient(W * .55, H * .45, Math.min(W, H) * .2, W * .55, H * .45, Math.max(W, H) * .8);
      vg.addColorStop(0, 'rgba(22,26,27,0)'); vg.addColorStop(1, 'rgba(22,26,27,.85)');
      g.fillStyle = vg; g.fillRect(0, 0, W, H);
    }
    function draw(dt, t){
      var g = cv.getContext('2d');
      g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(base, 0, 0); g.setTransform(DPR, 0, 0, DPR, 0, 0);
      var p = ((t / 12000) % 1.8) - .4, x = p * W;
      var lg = g.createLinearGradient(x - W * .3, 0, x + W * .3, H);
      lg.addColorStop(0, 'rgba(255,232,180,0)'); lg.addColorStop(.5, 'rgba(255,232,180,.13)'); lg.addColorStop(1, 'rgba(255,232,180,0)');
      g.globalCompositeOperation = 'lighter'; g.fillStyle = lg; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
    }
    return { init: init, draw: draw };
  }

  var KINDS = { kasumi: kasumi, seigaiha: seigaiha, kanze: kanze, kirihaku: kirihaku, sunago: sunago, asanoha: asanoha };
  var items = [].slice.call(document.querySelectorAll('canvas[data-art]')).map(function(cv){
    var k = KINDS[cv.getAttribute('data-art')]; if(!k) return null;
    var o = k(cv); o.cv = cv; o.on = false; o.init(); if(reduce || !o.enter) o.draw(0, 0); return o;
  }).filter(Boolean);
  if(!items.length) return;

  var t0 = performance.now(), last = t0;
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ items.forEach(function(o){
      if(o.cv !== e.target) return;
      o.on = e.isIntersecting;
      if(o.on && o.enter) o.enter(performance.now() - t0);
      if(o.on && reduce) o.draw(0, performance.now() - t0);
    }); }); });
    items.forEach(function(o){ io.observe(o.cv); });
  } else items.forEach(function(o){ o.on = true; if(o.enter) o.enter(0); });

  // 見出しの幅（書体の読み込みで変わる）から霞の左端を決めるので、書体が揃ったら青海波だけ描き直す
  // （書体の CSS は後から読み込まれるので、ready のあとにも loadingdone が来る。そのたびに描き直す）
  function refont(){ items.forEach(function(o){ if(/^(seigaiha|kanze)$/.test(o.cv.getAttribute('data-art'))){ o.init(); if(reduce) o.draw(0, 0); } }); }
  if(document.fonts){ if(document.fonts.ready) document.fonts.ready.then(refont); if(document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refont); }
  var rs; window.addEventListener('resize', function(){ clearTimeout(rs); rs = setTimeout(function(){ items.forEach(function(o){ o.init(); o.draw(0, performance.now() - t0); }); }, 200); });
  if(reduce) return;
  (function loop(now){
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if(!document.hidden) items.forEach(function(o){ if(o.on) o.draw(dt, now - t0); });
    requestAnimationFrame(loop);
  })(t0);
})();
