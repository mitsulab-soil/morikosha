/* 杜工舎：見本ページが開かれた回数を数える（2026-10-01）
   送るのは見本の番号（URL の /s/<8桁>/）だけ。閲覧した人の情報は送らない。
   同じ端末・同じ見本は1日1回だけ数える。数える先が空のあいだは何もしない。
   数える先は、送信スクリプトのウェブアプリ（clasp deploy で出た /exec の URL）。 */
(function () {
  var ENDPOINT = '';
  try {
    if (!ENDPOINT) return;
    var m = location.pathname.match(/\/s\/([0-9a-f]{8})\//);
    if (!m) return;
    var key = 'mk-v-' + m[1], today = new Date().toISOString().slice(0, 10);
    try { if (localStorage.getItem(key) === today) return; localStorage.setItem(key, today); } catch (e) {}
    new Image().src = ENDPOINT + '?c=' + m[1] + '&t=' + Date.now();
  } catch (e) {}
})();
