/* 杜工舎：見本ページの「このまま頼む」帯（2026-10-06、みつさんの指示「売上を上げる順番」の1）
   見本を開いた社長が、次に何をすればよいかを1か所で示す。
   ・値段（98,000円（税込））・前金なし・お支払いは完成品をご覧になってから。値引きの言葉は使わない。
   ・釦は2つ。どちらもメールが開き、件名に見本の番号が入る（誰からの返事か、こちらで分かる）。
   ・見本の中身と紛れないよう「杜工舎からのご案内」と名乗る。閉じると小さな札になる（その日は閉じたまま）。
   ・スマホでは、見本そのものの電話・メールの帯（.telbar）の上に出す。
   文言を直すときは、このファイル（9_おまかせ/サイト/s_obi.js）だけを直し、publish_mihon.py で写す。 */
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
