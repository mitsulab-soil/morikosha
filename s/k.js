/* 杜工舎：見本ページが開かれた回数を数える（2026-10-01）
   送るのは見本の番号（URL の /s/<8桁>/）だけ。閲覧した人の情報は送らない。
   同じ端末・同じ見本は1日1回だけ数える。数える先が空のあいだは何もしない。
   数える先は、送信スクリプトのウェブアプリ（clasp deploy で出た /exec の URL）。 */
(function () {
  // 郵送DMの案内ページ（/dm/…）は URL に符号が無いので、<script data-c="8桁"> で符号を渡す（2026-10-07）
  var me = document.currentScript;
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxZeVriDkzYL8Dbl5GKGdU1QBpDAWtEsqmEaz8fanSwPmLkJ9Qtq8pIaD0swHhju8Tv4A/exec';
  try {
    if (!ENDPOINT) return;
    var m = location.pathname.match(/\/s\/([0-9a-f]{8})\//);
    var dc = me && me.getAttribute('data-c');
    if (!m && dc && /^[0-9a-f]{8}$/.test(dc)) m = [0, dc];
    if (!m) return;
    var key = 'mk-v-' + m[1], today = new Date().toISOString().slice(0, 10);
    try { if (localStorage.getItem(key) === today) return; localStorage.setItem(key, today); } catch (e) {}
    new Image().src = ENDPOINT + '?c=' + m[1] + '&t=' + Date.now();
  } catch (e) {}
})();
