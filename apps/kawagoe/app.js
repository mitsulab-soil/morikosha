(function(){
'use strict';
var GSI='https://cyberjapandata.gsi.go.jp/xyz/';
var ATTR='<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a>';
var SP=window.SPOTS||{},RT=window.ROUTES||{},MN=window.MINS||{};

// 説明は一般に確かな事実だけ。営業時間・料金は書かない。vo＝宿のひとこと（宿ごとに差し替え）
var S={
  inn:{n:'川越 見本の宿',t:'見本のための架空の宿です（位置も仮）。ここから歩き出します。',q:'玄関を出たら、通りの先に蔵の黒い屋根が見えるか確かめてください。'},
  kura:{n:'蔵造りの町並み（一番街）',t:'明治26年（1893年）の川越大火のあと、燃えにくい蔵造りの店が多く建てられました。国の重要伝統的建造物群保存地区に選ばれています。',q:'屋根の上の大きな棟（箱棟）と、厚い観音開きの扉を見てください。火に備えた形です。',vo:'朝8時ごろの一番街は人が少なく、蔵の屋根の並びがよく見えます。'},
  kane:{n:'時の鐘',t:'江戸時代から町に時を知らせてきた鐘楼です。いまの塔は川越大火の翌年に建て直されたものです。',q:'塔の高さと、まわりの屋根の高さを比べてください。町のどこからでも音が届くように建っています。'},
  kashi:{n:'菓子屋横丁',t:'明治の初めごろから菓子づくりの店が集まり、昭和の初めには数十軒が並んだといわれる横丁です。',q:'石畳の細い道の幅を見てください。表通りとは違う、路地の幅です。',vo:'夕方は店じまいが早めです。お土産は行きに見ておくのがおすすめです。'},
  hikawa:{n:'川越氷川神社',t:'古くから川越の総鎮守としてまつられてきた神社です。本殿の彫刻は埼玉県の指定文化財です。',q:'境内の大きな木と、社の裏手へ続く道を見てください。すぐ先に川があります。'},
  shingashi:{n:'新河岸川（氷川神社の裏）',t:'江戸時代から明治にかけて、川越と江戸を舟で結んだ川です。川越の産物がこの川を下りました。',q:'水の流れる向きと、岸の高さを見てください。舟が行き来した川の幅です。',vo:'春は川沿いの桜がきれいです。宿のスタッフもよく歩く道です。'},
  honmaru:{n:'川越城本丸御殿',t:'嘉永元年（1848年）に建てられた川越城の本丸御殿の一部で、玄関と大広間が残ります。本丸御殿が残る城は全国でも数少ない例です。',q:'玄関の大きな唐破風（からはふ）の屋根の曲線を見てください。'},
  kitain:{n:'喜多院',t:'天海僧正ゆかりの天台宗の寺です。江戸城から移されたと伝わる建物があり、徳川家光誕生の間として知られます。',q:'山門から本堂までの、まっすぐな参道の長さを見てください。'}
};
var C={
  c30:{t:'30分の散歩',m:'COURSE 01',l:'蔵の通りを抜けて、時の鐘の音のする路地まで。夕方の短い時間でも回れます。',vo:'チェックイン後、夕食前の30分ならこの道がいちばんです。',s:['inn','kura','kane','kashi','inn']},
  c60:{t:'夕食までの1時間',m:'COURSE 02',l:'菓子屋横丁から社の森を抜けて、舟の通った川べりへ。',vo:'18時のご夕食に間に合うよう、17時ごろの出発をおすすめしています。',s:['inn','kura','kane','kashi','hikawa','shingashi','inn']},
  rain:{t:'雨の日',m:'COURSE 03',l:'雨の日は外を歩く距離を短めにし、建物の中を見られる本丸御殿を目当てにしました。道は屋根がありません。傘をお持ちください。',vo:'フロントで傘をお貸しします（見本の文です）。',s:['inn','kura','kane','honmaru','inn']},
  hist:{t:'土地の歴史を歩く',m:'COURSE 04',l:'寺・城・社・川・町。川越が城下町として形づくられたあとを、ゆっくり歩きます。',vo:'半日ゆっくり歩く方に。途中で休める場所はフロントでご案内します。',s:['inn','kitain','honmaru','hikawa','shingashi','kane','kura','inn']}
};
var Q=[
  {k:'shingashi',z:16,n:'新河岸川の流れ',d:'1960年代の写真といまの写真で、川筋の曲がり方と、川沿いの土地の使われ方を比べてください。',a:'川筋の曲がり方は大きくは変わらず、川沿いの田畑が建物や道に変わっているように見えます（推定）。',e:1},
  {ll:[35.9150,139.4930],z:16,n:'喜多院の南東の田畑と住宅地',d:'1960年代の写真で、寺の外側に何が広がっているかを見てください。',a:'田畑のような区画が広がり、いまは住宅地になっているように見えます（推定）。',e:1},
  {k:'kura',z:17,n:'一番街の道の形',d:'蔵の並ぶ通りの道筋と幅を、昔の写真といまで比べてください。',a:'道筋はほぼ同じ線で、通りに面して建物が並ぶ形も続いています。'},
  {k:'honmaru',z:17,n:'本丸御殿のまわり',d:'御殿のまわりに、どんな大きさの敷地が並んでいるかを見てください。',a:'学校などの大きな敷地が並びます。城の区画が、後の時代に大きな敷地として使われたと考えられます（推定）。',e:1},
  {ll:[35.9075,139.4830],z:15,n:'駅のまわりの広がり',d:'川越駅・本川越駅のあたりで、建物の密度を比べてください。',a:'1960年代には駅の周りにも空き地や畑が見え、いまは建物で埋まっています。町が駅の方へ広がったと読めます（推定）。',e:1}
];
Q.forEach(function(q){if(q.k)q.ll=SP[q.k];});

var map=L.map('map',{minZoom:12,maxZoom:18}).setView(SP.inn,15);
map.attributionControl.setPrefix(false);
function gsi(id,ext,mn,mx,label){return L.tileLayer(GSI+id+'/{z}/{x}/{y}.'+ext,{minZoom:12,maxZoom:18,minNativeZoom:mn,maxNativeZoom:mx,attribution:ATTR+' '+label});}
var L_pale=gsi('pale','png',5,18,'淡色地図');
var LEFT={std:gsi('std','png',5,18,'標準地図'),photo:gsi('seamlessphoto','jpg',14,18,'全国最新写真')};
var ERA={old:gsi('ort_old10','png',10,17,'空中写真（1961〜1969年）'),photo:gsi('seamlessphoto','jpg',14,18,'全国最新写真'),usa:gsi('ort_USA10','png',10,17,'空中写真（1945〜1950年）')};
var NAME={std:'いまの地図',photo:'いまの空中写真',old:'1961〜69年',usa:'1945〜50年'};
L_pale.addTo(map);

var walkLayer=L.layerGroup().addTo(map),qLayer=L.layerGroup();
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pinIcon(lbl,cls){return L.divIcon({className:'',html:'<div class="pin '+(cls||'')+'"><span>'+lbl+'</span></div>',iconSize:[30,30],iconAnchor:[15,32],popupAnchor:[0,-30]});}
var markers=[];

function showCourse(key,noFit){
  var c=C[key];walkLayer.clearLayers();markers=[];
  document.querySelectorAll('[data-course]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.course===key);});
  var mins=MN[key]||[],tot=mins.reduce(function(a,b){return a+b;},0);
  document.getElementById('c-title').textContent=c.t;
  document.getElementById('c-meta').textContent=c.m+' / 歩く時間 約'+tot+'分';
  document.getElementById('c-lead').textContent=c.l;
  document.getElementById('c-voice').textContent=c.vo;
  var pts=RT[key]&&RT[key].length?RT[key]:c.s.map(function(k){return SP[k];});
  L.polyline(pts,{color:'#f4f1e9',weight:9,opacity:.95}).addTo(walkLayer);
  L.polyline(pts,{color:'#8a6828',weight:5,dashArray:'1 9',lineCap:'round'}).addTo(walkLayer);
  var ol=document.getElementById('stops');ol.innerHTML='';var n=0;
  c.s.forEach(function(k,i){
    var s=S[k],inn=k==='inn',last=i===c.s.length-1,lbl=inn?'宿':String(++n);
    if(!(inn&&last)){
      var m=L.marker(SP[k],{icon:pinIcon(lbl,inn?'inn':''),title:(inn?'':lbl+' ')+s.n,alt:s.n,keyboard:true}).addTo(walkLayer).bindPopup('<b>'+esc(s.n)+'</b><br>'+esc(s.q));
      markers.push({m:m,k:k});
    }
    var li=document.createElement('li');
    var walk=i===0?'出発':'歩いて約'+mins[i-1]+'分';
    li.innerHTML='<button class="hd" type="button"><span class="num'+(inn?' inn':'')+'" aria-hidden="true">'+lbl+'</span><strong>'+esc(inn&&last?'宿へ戻る':s.n)+'</strong><span class="walk">'+walk+'</span></button>'+
      (inn&&last?'':'<div class="body"><p>'+esc(s.t)+'</p><div class="look">'+esc(s.q)+'</div>'+(s.vo?'<div class="vo">'+esc(s.vo)+'</div>':'')+'</div>');
    li.querySelector('.hd').onclick=function(){focusStop(k,li);};
    ol.appendChild(li);
  });
  if(!noFit)map.fitBounds(L.latLngBounds(pts),{padding:[40,40]});
}
function focusStop(k,li){
  document.querySelectorAll('.stops li').forEach(function(x){x.classList.remove('on');});li.classList.add('on');
  markers.forEach(function(o){if(o.k===k){map.flyTo(o.m.getLatLng(),17,{duration:.6});o.m.openPopup();}});
}
document.querySelectorAll('[data-course]').forEach(function(b){b.onclick=function(){showCourse(b.dataset.course);if(innerWidth<=820)document.getElementById('course').scrollIntoView({behavior:'smooth'});};});

// 宿へ戻る・現在地（押したときだけ許可を求める）
document.getElementById('go-inn').onclick=function(){map.flyTo(SP.inn,17,{duration:.6});};
var here=null;
document.getElementById('go-here').onclick=function(){
  if(!navigator.geolocation){alert('この端末では現在地を使えません。');return;}
  navigator.geolocation.getCurrentPosition(function(p){
    var ll=[p.coords.latitude,p.coords.longitude];
    if(here)map.removeLayer(here);
    here=L.circleMarker(ll,{radius:8,color:'#fff',weight:3,fillColor:'#2a6db0',fillOpacity:1}).addTo(map).bindPopup('いまいる場所');
    map.flyTo(ll,16);
  },function(){alert('現在地を取得できませんでした。');},{timeout:10000});
};

// ---- 時間を読む ----
var left='std',era='old',cmp='swipe',curL=null,curR=null,divider=null,tag1=null,tag2=null;
var slider=document.getElementById('slider');
function clip(){
  if(!curR)return;var el=curR.getContainer();if(!el)return;
  if(cmp==='fade'){el.style.clip='';curR.setOpacity(slider.value/100);if(divider)divider.style.display='none';return;}
  curR.setOpacity(1);
  var sz=map.getSize(),x=sz.x*slider.value/100;
  var nw=map.containerPointToLayerPoint([0,0]),se=map.containerPointToLayerPoint(sz);
  el.style.clip='rect('+[nw.y,se.x,se.y,nw.x+x].join('px,')+'px)';
  if(divider){divider.style.display='block';divider.style.left=(x-1)+'px';}
}
function labels(){
  document.getElementById('sl-l').textContent='← '+NAME[left];
  document.getElementById('sl-r').textContent=NAME[era]+' →';
  if(tag1){tag1.textContent=NAME[left];tag2.textContent=NAME[era];var h=cmp==='fade';tag1.style.display=tag2.style.display=h?'none':'block';}
}
function press(attr,v){document.querySelectorAll('['+attr+']').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute(attr)===v);});}
function setLeft(v){left=v;if(curL)map.removeLayer(curL);curL=LEFT[v];curL.addTo(map);curL.bringToBack();press('data-left',v);labels();}
function setEra(e){
  era=e;if(curR){curR.getContainer()&&(curR.getContainer().style.clip='');map.removeLayer(curR);}
  curR=ERA[e];curR.addTo(map);curR.bringToFront();curR.on('load tileload',clip);
  press('data-era',e);labels();clip();
}
function setCmp(m){cmp=m;press('data-cmp',m);if(curR)curR.getContainer().style.clip='';labels();clip();}
document.querySelectorAll('[data-left]').forEach(function(b){b.onclick=function(){setLeft(b.dataset.left);};});
document.querySelectorAll('[data-era]').forEach(function(b){b.onclick=function(){setEra(b.dataset.era);};});
document.querySelectorAll('[data-cmp]').forEach(function(b){b.onclick=function(){setCmp(b.dataset.cmp);};});
slider.oninput=clip;map.on('move zoom resize zoomend moveend',clip);
// スライダーに触れている間は地図を動かさない
['pointerdown','touchstart'].forEach(function(ev){slider.addEventListener(ev,function(){map.dragging.disable();},{passive:true});});
['pointerup','pointercancel','touchend','change','blur'].forEach(function(ev){slider.addEventListener(ev,function(){map.dragging.enable();});});

var ql=document.getElementById('qs');
Q.forEach(function(q,i){
  var m=L.marker(q.ll,{icon:L.divIcon({className:'',html:'<div class="qpin">'+(i+1)+'</div>',iconSize:[28,28],iconAnchor:[14,14]}),title:'問い'+(i+1)+' '+q.n,alt:q.n,keyboard:true}).addTo(qLayer).bindPopup('<b>'+esc(q.n)+'</b><br>'+esc(q.d));
  var li=document.createElement('li');
  li.innerHTML='<button class="qb" type="button"><b>'+(i+1)+'. '+esc(q.n)+(q.e?'<span class="tag">推定</span>':'')+'</b>'+esc(q.d)+'</button><details><summary>答えの一言を見る</summary><p>'+esc(q.a)+'</p></details>';
  li.querySelector('.qb').onclick=function(){map.flyTo(q.ll,q.z,{duration:.6});m.openPopup();};
  ql.appendChild(li);
});
function mkTag(side){var d=document.createElement('div');d.className='eratag';d.style[side]='10px';map.getContainer().appendChild(d);return d;}

var tabs=[].slice.call(document.querySelectorAll('[role=tab]'));
function mode(m,focus){
  tabs.forEach(function(b){var on=b.dataset.mode===m;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;if(on&&focus)b.focus();});
  document.getElementById('walk-view').hidden=m!=='walk';document.getElementById('time-view').hidden=m!=='time';
  document.getElementById('maphint').textContent=m==='time'?'左右の境目はスライダーで動かせます。':'線は道なりの目安です（OpenStreetMap の道から計算）。';
  if(m==='time'){
    map.removeLayer(L_pale);map.removeLayer(walkLayer);qLayer.addTo(map);
    if(!divider){divider=document.createElement('div');divider.className='divider';map.getContainer().appendChild(divider);tag1=mkTag('left');tag2=mkTag('right');}
    setLeft(left);setEra(era);
    var fq=function(){map.invalidateSize();map.fitBounds(L.latLngBounds(Q.map(function(q){return q.ll;})),{padding:[40,40],animate:false});clip();};setTimeout(fq,60);setTimeout(fq,400);
  }else{
    if(curR){curR.getContainer().style.clip='';map.removeLayer(curR);}if(curL)map.removeLayer(curL);map.removeLayer(qLayer);
    L_pale.addTo(map);walkLayer.addTo(map);
    if(divider)divider.style.display=tag1.style.display=tag2.style.display='none';
    setTimeout(function(){map.invalidateSize();},60);
  }
}
tabs.forEach(function(b,i){
  b.onclick=function(){mode(b.dataset.mode);};
  b.onkeydown=function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var t=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];mode(t.dataset.mode,true);}};
});
var p=new URLSearchParams(location.search);
showCourse(C[p.get('course')]?p.get('course'):'c30');
if(p.get('mode')==='time')mode('time');
})();
