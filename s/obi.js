/* 杜工舎：見本ページの「このまま頼む」帯（2026-10-06、みつさんの指示「売上を上げる順番」の1）
   見本を開いた社長が、次に何をすればよいかを1か所で示す。
   ・値段（98,000円（税込））・前金なし・お支払いは完成品をご覧になってから。値引きの言葉は使わない。
   ・釦は2つ。どちらもメールが開き、件名に見本の番号が入る（誰からの返事か、こちらで分かる）。
   ・見本の中身と紛れないよう「杜工舎からのご案内」と名乗る。閉じると小さな札になる（その日は閉じたまま）。
   ・スマホでは、見本そのものの電話・メールの帯（.telbar）の上に出す。
   文言を直すときは、このファイル（09_Auto/サイト/s_obi.js）だけを直し、publish_mihon.py で写す。 */
(function () {
  try {
    var m = location.pathname.match(/\/s\/([0-9a-f]{8})\//);
    var code = m ? m[1] : '';
    var MAIL = 'info@morikosha.com';
    var PRICE_URL = 'https://morikosha.com/#price';
    var url = 'https://morikosha.com/s/' + code + '/';
    var nameEl = document.querySelector('.foot .ja');
    var co = nameEl ? nameEl.textContent.trim() : '';

    function mailto(subject, body) {
      return 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
    var hrefOrder = mailto(
      'この見本のまま頼みたい（' + (co || '見本') + '・' + code + '）',
      '杜工舎 上原様\n\n次の見本を、このまま当社のホームページにしたいと考えています。\n　' + url +
      '\n\n会社名：' + co + '\nお名前：\nご連絡先（お電話がよければ番号とご都合のよい曜日）：\n\nご記入シートを送ってください。\n');
    var hrefAsk = mailto(
      '見本について質問（' + (co || '見本') + '・' + code + '）',
      '杜工舎 上原様\n\n次の見本について、質問があります。\n　' + url +
      '\n\n会社名：' + co + '\nお名前：\nご質問：\n\n');

    var css =
      '.mk-obi{position:fixed;left:0;right:0;bottom:0;z-index:210;box-sizing:border-box;' +
      'background:#FBF9F4;color:#1E1F1C;border-top:2px solid #6E5A3A;box-shadow:0 -6px 24px rgba(0,0,0,.18);' +
      'font-family:"Noto Sans JP","Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif;line-height:1.5;' +
      'padding:12px 20px calc(12px + env(safe-area-inset-bottom));transition:transform .35s ease;}' +
      '.mk-obi[hidden]{display:none;}' +
      '.mk-obi-in{max-width:1120px;margin:0 auto;display:flex;align-items:center;gap:20px;}' +
      '.mk-obi-tx{flex:1;min-width:0;}' +
      '.mk-obi-lb{display:block;font-size:11px;letter-spacing:.16em;color:#6E5A3A;font-weight:600;}' +
      '.mk-obi-h{display:block;font-size:16px;font-weight:700;letter-spacing:.02em;}' +
      '.mk-obi-s{display:block;font-size:13px;color:#4A4A44;}' +
      '.mk-obi-s a{color:#6E5A3A;text-decoration:underline;text-underline-offset:2px;}' +
      '.mk-obi-bt{display:flex;gap:10px;flex-shrink:0;}' +
      '.mk-obi-bt a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;' +
      'border-radius:4px;font-size:14px;font-weight:700;text-decoration:none;white-space:nowrap;}' +
      '.mk-obi-go{background:#6E5A3A;color:#fff;border:1px solid #6E5A3A;}' +
      '.mk-obi-go:hover{background:#5A4930;}' +
      '.mk-obi-q{background:#fff;color:#1E1F1C;border:1px solid #B9B2A3;}' +
      '.mk-obi-x{position:absolute;top:4px;right:6px;width:32px;height:32px;border:0;background:none;' +
      'font-size:20px;line-height:1;color:#8A857A;cursor:pointer;}' +
      '.mk-obi-pill{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:210;' +
      'background:#6E5A3A;color:#fff;border:0;border-radius:999px;padding:10px 16px;font-size:13px;font-weight:700;' +
      'font-family:"Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer;}' +
      '.mk-obi-pill[hidden]{display:none;}' +
      '@media (max-width:760px){' +
      '.mk-obi{padding:9px 14px 10px;}' +
      '.mk-obi-in{display:block;}' +
      '.mk-obi-lb,.mk-obi-pc{display:none;}' +
      '.mk-obi-h{font-size:15px;padding-right:26px;}' +
      '.mk-obi-s{font-size:12px;margin-top:1px;}' +
      '.mk-obi-bt{margin-top:7px;gap:8px;}' +
      '.mk-obi-bt a{flex:1;padding:0 8px;font-size:13px;}' +
      '.mk-obi-x{top:2px;right:2px;}' +
      '}' +
      '@media (min-width:761px){.mk-obi-sp{display:none;}}' +
      '}';

    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var obi = document.createElement('aside');
    obi.className = 'mk-obi';
    obi.setAttribute('aria-label', '杜工舎からのご案内');
    obi.innerHTML =
      '<button class="mk-obi-x" type="button" aria-label="閉じる">×</button>' +
      '<div class="mk-obi-in"><div class="mk-obi-tx">' +
      '<span class="mk-obi-lb">杜工舎からのご案内</span>' +
      '<span class="mk-obi-h"><span class="mk-obi-pc">この見本を、そのまま御社のホームページにできます。</span>' +
      '<span class="mk-obi-sp">この見本のまま、ホームページにできます。</span></span>' +
      '<span class="mk-obi-s"><span class="mk-obi-pc">1ページ 98,000円（税込）・前金なし・お支払いは完成品をご覧になってから。' +
      '<a href="' + PRICE_URL + '" target="_blank" rel="noopener">料金と流れ</a></span>' +
      '<span class="mk-obi-sp">98,000円（税込）・前金なし・完成品を見てお支払い</span></span>' +
      '</div><div class="mk-obi-bt">' +
      '<a class="mk-obi-go" href="' + hrefOrder + '">このまま頼みたい</a>' +
      '<a class="mk-obi-q" href="' + hrefAsk + '">質問だけしたい</a>' +
      '</div></div>';

    var pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'mk-obi-pill';
    pill.textContent = 'この見本のまま頼む';
    pill.hidden = true;

    document.body.appendChild(obi);
    document.body.appendChild(pill);

    var KEY = 'mk-obi-closed', today = new Date().toISOString().slice(0, 10);
    function closedToday() { try { return localStorage.getItem(KEY) === today; } catch (e) { return false; } }

    // スマホでは、見本の電話・メールの帯（.telbar）の上に載せる。本文の最後が隠れないよう下に余白を足す
    var basePad = parseFloat(getComputedStyle(document.body).paddingBottom) || 0;
    function place() {
      var tb = document.querySelector('.telbar');
      var off = 0;
      if (tb) {
        var cs = getComputedStyle(tb);
        if (cs.display !== 'none' && cs.position === 'fixed') off = tb.getBoundingClientRect().height;
      }
      obi.style.bottom = off + 'px';
      pill.style.bottom = 'calc(' + (off + 12) + 'px + env(safe-area-inset-bottom))';
      if (off) obi.style.paddingBottom = '12px';
      else obi.style.paddingBottom = '';
      var h = obi.hidden ? 0 : obi.getBoundingClientRect().height;
      document.body.style.paddingBottom = (basePad + h) + 'px';
      document.documentElement.style.setProperty('--obi-h', (h + off) + 'px');
    }
    function show(open) {
      obi.hidden = !open;
      pill.hidden = open;
      place();
    }
    obi.querySelector('.mk-obi-x').addEventListener('click', function () {
      try { localStorage.setItem(KEY, today); } catch (e) {}
      show(false);
    });
    pill.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      show(true);
    });
    window.addEventListener('resize', place);
    show(!closedToday());
  } catch (e) {}
})();

/* smp-fix-2026-10-19 */
/* 見本の札（DESIGN SAMPLE）の振る舞い（2026-10-19 ペルソナ評価 第1・2周）。中身は 09_Auto/サイト/smp_fix.html と同じ。
   ここ（営業メールの見本）では、下の帯が「料金・頼み方」を担うので、スマホでは札を出さない。PC の小札は帯の上に置く */
(function () {
  try {
    var st = document.createElement('style');
    st.textContent = '.smp-badge b,.smp-badge .l1{font-size:11px!important;} .smp-badge small{font-size:11px!important;line-height:1.6;} .smp-badge .l2{font-size:13px!important;} .smp-badge .smp-go a{font-size:12px!important;white-space:nowrap;} .smp-badge.is-mini{min-width:212px;} [id]{scroll-margin-top:84px;} .smp-badge:focus-visible{outline:2px solid #fff;outline-offset:2px;} .smp-badge.is-mini{top:auto!important;bottom:20px!important;right:16px!important;left:auto!important;padding:8px 12px 6px!important;} .smp-badge.is-mini b,.smp-badge.is-mini .l1,.smp-badge.is-mini small{display:none!important;} .smp-badge.is-mini .smp-go{margin-top:6px;padding-top:6px;} .smp-badge.is-mini .smp-go a{min-height:36px;} @media (max-width:1100px){ .smp-badge{top:auto!important;bottom:calc(var(--telbar-h,88px) + 10px + env(safe-area-inset-bottom))!important;right:auto!important;left:8px!important;max-width:78vw!important;padding:6px 10px!important;cursor:pointer!important;} .smp-badge b,.smp-badge .l1,.smp-badge small,.smp-badge .smp-go{display:none!important;} .smp-badge.is-mini{bottom:calc(var(--telbar-h,88px) + 10px + env(safe-area-inset-bottom))!important;left:8px!important;right:auto!important;padding:6px 10px!important;} .smp-badge .l2{font-size:12px!important;margin:0!important;white-space:nowrap;} .smp-badge .l2::after{content:" 見本・料金 ▴";opacity:.8;} .smp-badge.is-open small{display:block!important;} .smp-badge.is-open .smp-go{display:flex!important;} .smp-badge.is-open .l2::after{content:" 閉じる ▾";} } .cap,.pic-note{font-size:11px!important;} h1,h2,h3{text-wrap:balance;word-break:auto-phrase;} .smp-badge.is-mini{bottom:calc(var(--obi-h,0px) + 16px)!important;} @media (min-width:761px) and (max-width:1100px){ .smp-badge,.smp-badge.is-mini{bottom:calc(var(--obi-h,0px) + 10px)!important;} } @media (max-width:760px){ .smp-badge{display:none!important;} }';
    document.head.appendChild(st);
    (function(){var b=document.querySelector(".smp-badge");if(!b)return;
/* 見本帳の枠（iframe）の中では札を出さない（3周目 P4：枠の中で見出しに重なる。枠の外に「見本」の説明がある） */
if(window.self!==window.top){b.style.display="none";return;}
/* 札を押して開くのはスマホ・タブレットだけ。PC では札をボタンにしない（中のリンクと二重になる。3周目 P4） */
if(window.innerWidth<=1100){b.setAttribute("tabindex","0");b.setAttribute("role","button");b.setAttribute("aria-expanded","false");}
b.setAttribute("aria-label","見本の札。押すと、見本についての説明と、杜工舎・料金へのリンクを開きます");
function f(){b.classList.toggle("is-mini",window.scrollY>window.innerHeight*0.6&&!b.classList.contains("is-open"));}
function t(){if(window.innerWidth<=1100){b.classList.toggle("is-open");b.setAttribute("aria-expanded",b.classList.contains("is-open")?"true":"false");f();}}
/* 下の電話・メールの帯の高さを測り、札をその上に置く */
var tb=document.querySelector(".telbar");function th(){if(tb){var r=tb.getBoundingClientRect();document.documentElement.style.setProperty("--telbar-h",(getComputedStyle(tb).display==="none"?0:r.height)+"px");}}th();window.addEventListener("resize",th);
window.addEventListener("scroll",f,{passive:true});f();
b.addEventListener("click",function(e){if(e.target.closest("a"))return;t();});
b.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&!e.target.closest("a")){e.preventDefault();t();}});})();
  } catch (e) {}
})();
