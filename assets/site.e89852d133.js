(function(){
  /* 2026-10-22：掲載サービスはホームページ制作のみ。旧ハッシュは ABOUT の受け口で受け、別サービスへ転送しない。 */
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
      b.setAttribute('aria-live', 'polite');
      var failed = function(){ b.textContent = 'コピーできません。アドレスを選択してください'; };
      if(navigator.clipboard) navigator.clipboard.writeText(t).then(done, failed);
      else failed();
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
/* Small, progressive enhancements. Content remains visible without this file. */
(function(){
  'use strict';
  var root=document.documentElement;
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  var observer=null;
  var items=[];
  function showAll(){
    items.forEach(function(el){el.classList.remove('ed-pending');});
    root.classList.remove('ed-motion');
    if(observer)observer.disconnect();
  }
  function start(){
    if(reduced.matches||manuallyPaused||!('IntersectionObserver' in window))return;
    if(observer)observer.disconnect();
    var selector='.sec .dai,.sec .about-txt,.sec .about-mihon,.sec .keys,.sec .lede,.sec .rs,.sec .step-h,.sec .chips,.sec .mado-stage,.sec .omoi,.sec .pr-face,.sec .fx-i,.sec .pf-l,.sec .pf-r>.info,.sec .pf-r>.pf-body,.sec .qa>details,.sec .pair,.sec .proc>li,.sec .erabo-plan';
    items=Array.prototype.slice.call(document.querySelectorAll(selector));
    observer=new IntersectionObserver(function(entries){
      entries.filter(function(entry){return entry.isIntersecting;}).forEach(function(entry,i){
        entry.target.style.setProperty('--ed-delay',Math.min(i,3)*65+'ms');
        entry.target.classList.remove('ed-pending');
        observer.unobserve(entry.target);
      });
    },{rootMargin:'0px 0px 64px 0px',threshold:0});
    root.classList.add('ed-motion');
    items.forEach(function(el){
      el.classList.add('ed-reveal');
      var box=el.getBoundingClientRect();
      if(box.top>=window.innerHeight+40){el.classList.add('ed-pending');observer.observe(el);}
    });
  }
  var pauseButton=document.querySelector('[data-motion-toggle]');
  var manuallyPaused=false;
  function motionState(){
    var paused=manuallyPaused||reduced.matches;
    root.classList.toggle('ed-motion-paused',paused);
    if(paused)showAll();
    else if(items.length)start();
    if(pauseButton){
      pauseButton.setAttribute('aria-pressed',paused?'true':'false');
      pauseButton.disabled=reduced.matches;
      pauseButton.textContent=reduced.matches?'動きを抑える設定です':(paused?'動きを再開':'動きを止める');
    }
  }
  if(pauseButton)pauseButton.addEventListener('click',function(){manuallyPaused=!manuallyPaused;motionState();});
  motionState();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  if(reduced.addEventListener)reduced.addEventListener('change',motionState);
  window.addEventListener('beforeprint',showAll);
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');
    if(!a)return;
    var target=document.getElementById(a.getAttribute('href').slice(1));
    if(!target)return;
    target.querySelectorAll('.ed-pending').forEach(function(el){el.classList.remove('ed-pending');if(observer)observer.unobserve(el);});
  },true);

  /* Existing site.js controls opening and closing. Keep keyboard focus in its menu. */
  var menu=document.getElementById('mnav');
  if(!menu)return;
  var previous=[];
  var open=false;
  function sync(){
    var next=menu.classList.contains('open');
    if(next===open)return;
    open=next;
    if(open){
      menu.setAttribute('role','dialog');
      menu.setAttribute('aria-modal','true');
      if(!menu.hasAttribute('aria-label'))menu.setAttribute('aria-label','サイトメニュー');
      var branch=menu;
      while(branch&&branch.parentElement&&branch.parentElement!==document.documentElement){
        Array.prototype.forEach.call(branch.parentElement.children,function(el){
          if(el!==branch&&!el.inert){previous.push(el);el.inert=true;}
        });
        branch=branch.parentElement;
      }
    }else{
      previous.forEach(function(el){el.inert=false;});
      previous=[];
      menu.removeAttribute('aria-modal');
      /* site.js requests focus while the background is still inert; restore it now. */
      var trigger=document.getElementById('menu-btn');
      if(trigger)trigger.focus({preventScroll:true});
    }
  }
  new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',function(e){
    if(e.key!=='Tab'||!menu.classList.contains('open'))return;
    var controls=Array.prototype.filter.call(menu.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'),function(el){return el.getClientRects().length&&!el.inert;});
    if(!controls.length){e.preventDefault();return;}
    var first=controls[0],last=controls[controls.length-1];
    if(e.shiftKey&&(document.activeElement===first||!menu.contains(document.activeElement))){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&(document.activeElement===last||!menu.contains(document.activeElement))){e.preventDefault();first.focus();}
  });
  sync();
})();
