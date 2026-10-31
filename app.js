(()=>{const $=s=>document.querySelector(s);
let LIVE=null;const Q={};// Q[ticker]={p,c,src,t} 只存真实报价
const NK='tc_nodes',CK2='tc_center',NDEF=['BITSTAMP:BTCUSD','OANDA:NAS100USD','TVC:USOIL','OANDA:XAUUSD'];
let NODES;try{NODES=JSON.parse(localStorage.getItem(NK))}catch(e){}const okSym=v=>typeof v==='string'&&/^[A-Z0-9_.!\-]+:[A-Z0-9_.!\-]+$/i.test(v);
NODES=Array.isArray(NODES)?NODES.filter(okSym).slice(0,8):null;if(!NODES||!NODES.length)NODES=NDEF.slice();
let CENTER=localStorage.getItem(CK2);if(CENTER!=='pnl'&&!okSym(CENTER))CENTER='BITSTAMP:BTCUSD';
const saveN=()=>{localStorage.setItem(NK,JSON.stringify(NODES));localStorage.setItem(CK2,CENTER)};
const tk=s=>String(s).split(':').pop().toUpperCase();
const CRYPTO=/^(BTC|ETH|SOL|XRP|DOGE|ADA|BNB|LTC|AVAX|LINK|DOT|SHIB|TRX|TON|PEPE|SUI)(USD|USDT|USDC)$/;
function quote(sym){const t=tk(sym),P=LIVE&&LIVE.prices||{};
if(Q[t]&&Date.now()-Q[t].t<15*60e3)return Q[t];
if((t==='NAS100USD'||t==='US100')&&P.US100)return{p:P.US100,src:'监控'};if(t==='USOIL'&&P.USOIL)return{p:P.USOIL,src:'监控'};return null}
const fp=p=>(+p).toLocaleString('en-US',{maximumFractionDigits:p>=1000?0:p>=10?2:4});
const qtxt=q=>q?fp(q.p)+(q.c!=null?` ${q.c>=0?'+':''}${(+q.c).toFixed(2)}%`:''):'点击看图';
async function loadCrypto(){const want=new Set([...NODES,CENTER].map(tk).filter(t=>CRYPTO.test(t)));for(const t of want){const b=t.match(CRYPTO)[1];
try{const r=await (await fetch(`https://api.exchange.coinbase.com/products/${b}-USD/stats`)).json();if(!r.last)throw 0;Q[t]={p:+r.last,c:(r.last-r.open)/r.open*100,src:'Coinbase',t:Date.now()}}
catch(e){try{const r=await (await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${b}USDT`)).json();if(r.lastPrice)Q[t]={p:+r.lastPrice,c:+r.priceChangePercent,src:'Binance',t:Date.now()}}catch(e2){}}}num()}
// TradingView 图表发出的 quoteUpdate 也是真实报价，顺手缓存
addEventListener('message',e=>{let m=e.data;try{if(typeof m==='string')m=JSON.parse(m)}catch(x){return}if(m&&m.name==='quoteUpdate'&&m.data&&m.data.last_price!=null)Q[tk(m.data.original_name)]={p:m.data.last_price,c:m.data.change_percent,src:'TradingView',t:Date.now()}});
const fmtT=t=>new Date(t*1000).toLocaleString('zh-CN',{timeZone:'Europe/Rome',hour12:false,month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
const age=t=>t?Math.round((Date.now()/1000-t)/60):null;
const ago=m=>m==null?'—':m<60?m+' 分钟前':m<1440?Math.round(m/60)+' 小时前':Math.round(m/1440)+' 天前';
function ny(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());const o={};p.forEach(x=>o[x.type]=x.value);return{d:o.weekday,h:(+o.hour%24)+(+o.minute)/60}}
// CFD 指数/原油：纽约时间 周日18:00–周五17:00，每日17:00–18:00休市
function cfdOpen(){const{d,h}=ny();if(d==='Sat')return false;if(d==='Sun')return h>=18;if(d==='Fri')return h<17;return!(h>=17&&h<18)}
function cashOpen(){const{d,h}=ny();return!['Sat','Sun'].includes(d)&&h>=9.5&&h<16}
function journal(){try{const s=JSON.parse(localStorage.getItem('tj_v1'));const t=s&&(s.trades||[]);if(!Array.isArray(t)||!t.length)return null;let n=0,w=0;t.forEach(x=>{const v=(+x.pnl||0)-Math.abs(+x.commission||0)+(+x.swap||0);n+=v;if(v>0)w++});return{n,c:t.length,wr:w/t.length}}catch(e){return null}}
const status={};
function stale(){return !LIVE||age(LIVE.generated)>15}
function think(){const L=LIVE,j=journal();status.SENTINEL=!L?'无数据':stale()?'数据过期':(L.watcher.alive?'运行中 · 心跳 '+ago(age(L.watcher.heartbeat)):'监控离线');status.LEDGER=j?`净 ${j.n.toFixed(2)} · ${j.c} 笔`:'本浏览器无日志数据'}
function log(){const l=$('#log');if(!LIVE){l.innerHTML='<div>等待监控数据…</div>';return}
l.innerHTML=(stale()?'<div style="color:#f55">⚠ 数据过期（'+ago(age(LIVE.generated))+'更新）</div>':'')+LIVE.alerts.slice().reverse().map(a=>`<div><span style="color:#567">${fmtT(a.t)}</span> <b>${a.symbol}</b> 触及 ${a.type}</div>`).join('')||'<div>暂无提醒</div>'}
function gauges(){const j=journal(),L=LIVE,n24=L?L.alerts.filter(a=>age(a.t)<1440).length:0,hb=L?age(L.watcher.heartbeat):null,v=[['心跳(分)',hb??'—',Math.max(30,hb||0),hb!=null&&hb<=15?'#0ff':'#f55'],['24h提醒',n24,Math.max(10,n24),'#0ff'],['胜率',j?Math.round(j.wr*100):'—',100,'#0ff']];
$('#gauges').innerHTML=v.map(([n,x,m,col])=>{const r=26,C=2*Math.PI*r,f=(+x||0)/m;return`<div class="g"><svg width="70" height="70"><circle cx="35" cy="35" r="${r}" stroke="#1d2a3a" stroke-width="5" fill="none"/><circle cx="35" cy="35" r="${r}" stroke="${col}" stroke-width="5" fill="none" stroke-dasharray="${C*f} ${C}" transform="rotate(-90 35 35)" stroke-linecap="round"/><text x="35" y="40" fill="#fff" font-size="13" text-anchor="middle">${x}</text></svg>${n}</div>`}).join('')}
function mkt(){const o=cfdOpen(),c=cashOpen();$('#stUS').textContent=$('#stOil').textContent=o?'开':'休';
$('#mkt').innerHTML=`<div class="mk">US100 (CFD)<span class="${o?'on':'off'}">${o?'● 交易中':'● 休市'}</span></div><div class="mk">USOIL (CFD)<span class="${o?'on':'off'}">${o?'● 交易中':'● 休市'}</span></div><div class="mk">纳斯达克现货<span class="${c?'on':'off'}">${c?'● 开盘':'● 收盘'}</span></div>`}
function cal(){const n=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Rome'})),y=n.getFullYear(),m=n.getMonth(),f=(new Date(y,m,1).getDay()+6)%7,L=new Date(y,m+1,0).getDate();let h=`<div style="color:#8ab;margin-bottom:4px">${y}年${m+1}月</div><table><tr>${'一二三四五六日'.split('').map(x=>`<td>${x}</td>`).join('')}</tr><tr>`;for(let i=0;i<f;i++)h+='<td></td>';for(let d=1;d<=L;d++){h+=`<td class="${d===n.getDate()?'t':''}">${d}</td>`;if((d+f)%7===0)h+='</tr><tr>'}$('#cal').innerHTML=h+'</tr></table>'}
function bars(){const al=LIVE?LIVE.alerts:[],cnt=s=>al.filter(a=>a.symbol===s).length,m=Math.max(1,cnt('US100'),cnt('USOIL'));
$('#bars').innerHTML=['US100','USOIL'].map(s=>`<div class="bar"><span>${s}</span><i style="width:${cnt(s)/m*80+2}%"></i><b style="font-weight:400;color:#8ab">${cnt(s)}</b></div>`).join('')+`<div style="color:#567;font-size:10px">${LIVE?'更新于 '+ago(age(LIVE.generated)):'无数据'}</div>`}
function num(){let l,v;if(CENTER==='pnl'){const j=journal();l=j?'交易日志 · 净盈亏':'交易日志 · 无数据';v=j?(j.n>=0?'+':'')+j.n.toFixed(2):'—'}
else{const q=quote(CENTER);l=CENTER+(q?' · '+q.src+(q.c!=null?` · ${q.c>=0?'+':''}${(+q.c).toFixed(2)}%`:''):' · 暂无免费实时报价');v=q?fp(q.p):tk(CENTER)}
$('#numLabel').textContent=l;$('#num').textContent=v;$('#nAg').textContent=NODES.length+2}
async function loadLive(){try{LIVE=await (await fetch('data/live.json?'+Date.now(),{cache:'no-store'})).json()}catch(e){}refresh()}
function refresh(){[think,mkt,gauges,bars,log,num].forEach(f=>{try{f()}catch(e){console.error(f.name,e)}})}

function clock(){$('#clock').textContent='罗马 '+new Date().toLocaleTimeString('zh-CN',{timeZone:'Europe/Rome',hour12:false})}
// orb
let HIT=[];const cv=$('#orb'),x=cv.getContext('2d');let W,H;function rs(){const r=devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*r;cv.height=H*r;x.setTransform(r,0,0,r,0,0)}addEventListener('resize',rs);rs();
const pts=Array.from({length:500},()=>({a:Math.random()*6.28,b:Math.acos(2*Math.random()-1),s:.2+Math.random()*.6}));
function draw(t){t/=1000;x.clearRect(0,0,W,H);const cx=W/2,cy=H*.44,R=Math.min(W,H)*.13*(1+.04*Math.sin(t*2)),OR=Math.min(W*.42,H*.36);
const g=x.createRadialGradient(cx,cy,0,cx,cy,R*2.6);g.addColorStop(0,'#fff');g.addColorStop(.25,'#ffe7b0');g.addColorStop(.5,'#f5c76b55');g.addColorStop(1,'transparent');x.fillStyle=g;x.beginPath();x.arc(cx,cy,R*2.6,0,7);x.fill();
x.fillStyle='#fff8';pts.forEach(p=>{const a=p.a+t*p.s*.3,r=R*1.1,X=Math.sin(p.b)*Math.cos(a),Z=Math.sin(p.b)*Math.sin(a);x.globalAlpha=.3+.5*(Z+1)/2;x.fillRect(cx+X*r,cy+Math.cos(p.b)*r,1.4,1.4)});x.globalAlpha=1;
x.strokeStyle='#0ff3';x.beginPath();x.ellipse(cx,cy,OR,OR*.32,0,0,7);x.stroke();
const all=[...NODES.map(sy=>({n:tk(sy),sy,sub:qtxt(quote(sy)),sys:0})),{n:'SENTINEL',sub:status.SENTINEL||'',sys:1},{n:'LEDGER',sub:status.LEDGER||'',sys:1}];HIT=[];
const nodes=all.map((o,i)=>{const a=t*.15+i/all.length*6.283;return{...o,X:cx+Math.cos(a)*OR,Y:cy+Math.sin(a)*OR*.32,d:(Math.sin(a)+1)/2}}).sort((p,q)=>p.d-q.d);
nodes.forEach(o=>{const sc=.6+.5*o.d;x.strokeStyle=`rgba(0,255,255,${.08+.2*o.d})`;x.beginPath();x.moveTo(cx,cy);x.lineTo(o.X,o.Y);x.stroke();
const c=o.sys?(o.n==='SENTINEL'&&(stale()||!LIVE.watcher.alive)?'#f55':'#f0a'):'#0ff';x.shadowColor=c;x.shadowBlur=14;x.fillStyle=c;x.beginPath();x.arc(o.X,o.Y,5*sc,0,7);x.fill();x.shadowBlur=0;
x.globalAlpha=.4+.6*o.d;x.fillStyle='#fff';x.font=`600 ${11*sc+1}px system-ui`;x.textAlign='center';x.fillText(o.n,o.X,o.Y-10*sc);x.fillStyle=o.sub==='点击看图'?'#567':'#9bd';x.font=`${10*sc}px system-ui`;x.fillText(o.sub,o.X,o.Y+16*sc);x.globalAlpha=1;if(o.sy)HIT.push(o)});
requestAnimationFrame(draw)}
// TradingView 免费嵌入：可自选标的，存 localStorage
const DEF=['OANDA:NAS100USD','TVC:USOIL','BITSTAMP:BTCUSD'],CK='tc_charts';
let CH;try{CH=JSON.parse(localStorage.getItem(CK))}catch(e){}CH=Array.isArray(CH)?CH.filter(okSym).slice(0,4):null;if(!CH||!CH.length)CH=DEF.slice();
const saveCH=()=>localStorage.setItem(CK,JSON.stringify(CH));
function search(q){q=q.trim().toLowerCase();if(!q)return[];const r=[];for(const[s,d,k]of SYMS){const t=(s+' '+d+' '+k).toLowerCase(),tk=s.split(':')[1].toLowerCase();let sc=tk===q?0:k.split(' ').includes(q)?1:tk.startsWith(q)?2:t.includes(q)?3:-1;if(sc>=0)r.push([sc,s,d])}
r.sort((a,b)=>a[0]-b[0]);const o=r.slice(0,8).map(x=>({s:x[1],d:x[2]}));if(/^[A-Z0-9_!.]+:[A-Z0-9_!.]+$/i.test(q.trim()))o.unshift({s:q.trim().toUpperCase(),d:'直接使用此代码'});return o}
function picker(inp,onPick){if(!inp)return;const dd=document.createElement('div');dd.className='dd';inp.parentNode.style.position='relative';inp.after(dd);let items=[],sel=0;
const show=()=>{items=search(inp.value);sel=0;dd.innerHTML=items.length?items.map((x,i)=>`<div data-i="${i}" class="${i?'':'on'}"><b>${x.s.split(':')[1]}</b> <span>${x.d}</span> <em>${x.s.split(':')[0]}</em></div>`).join(''):(inp.value.trim()?'<div class="none">本地库没有，点图表左上角的标的名可搜索 TradingView 全库</div>':'');dd.style.display=dd.innerHTML?'block':'none'};
const pick=i=>{const x=items[i];if(x){dd.style.display='none';onPick(x.s)}};
inp.addEventListener('input',show);inp.addEventListener('focus',()=>{inp.select();show()});inp.addEventListener('blur',()=>setTimeout(()=>dd.style.display='none',150));
dd.addEventListener('mousedown',e=>{const d=e.target.closest('[data-i]');if(d){e.preventDefault();pick(+d.dataset.i)}});
inp.addEventListener('keydown',e=>{const n=dd.children.length;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!items.length)return;sel=(sel+(e.key==='ArrowDown'?1:n-1))%items.length;[...dd.children].forEach((c,i)=>c.classList.toggle('on',i===sel))}else if(e.key==='Enter'){e.preventDefault();pick(sel)}else if(e.key==='Escape')dd.style.display='none'})}
// 图表内置搜索切换后，widget 会 postMessage quoteUpdate（含 original_name），据此记住选择
addEventListener('message',e=>{let m=e.data;try{if(typeof m==='string')m=JSON.parse(m)}catch(x){return}if(!m||m.name!=='quoteUpdate'||!m.data||!m.data.original_name)return;
const ifr=[...document.querySelectorAll('#charts iframe')],i=ifr.findIndex(f=>f.contentWindow===e.source);if(i<0)return;const box=ifr[i].closest('.chart'),idx=[...$('#charts').children].indexOf(box),nm=m.data.original_name.replace('_DLY:',':');
if(idx<0||String(CH[idx]).split(':').pop()===nm.split(':').pop())return;
if(idx>=0&&CH[idx]!==nm){CH[idx]=nm;saveCH();box.querySelector('.ct').textContent=nm}});
function tv(el,sym){el.innerHTML='';const w=document.createElement('div');w.className='tradingview-widget-container__widget';w.style.height='100%';el.appendChild(w);const s=document.createElement('script');s.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';s.async=true;s.textContent=JSON.stringify({autosize:true,symbol:sym,interval:'15',timezone:'Europe/Rome',theme:'dark',style:'1',locale:'zh_CN',backgroundColor:'#0a0f1a',hide_side_toolbar:true,allow_symbol_change:true,save_image:false,support_host:'https://www.tradingview.com'});el.appendChild(s)}
function charts(){const box=$('#charts');box.innerHTML='';box.style.gridTemplateColumns=innerWidth<900?'1fr':`repeat(${Math.min(CH.length,2+(CH.length===3))},1fr)`;
CH.forEach((sym,i)=>{const c=document.createElement('div');c.className='chart';c.innerHTML=`<div class="ct">${sym}</div><div class="tv tradingview-widget-container"></div>`;box.appendChild(c);
tv(c.querySelector('.tv'),sym)});
}
try{charts()}catch(e){console.error(e)}
cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top,h=HIT.find(o=>Math.hypot(o.X-px,o.Y-py)<26);if(h){CH[0]=h.sy;saveCH();charts();$('#charts').scrollIntoView({behavior:'smooth'})}});
cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();cv.style.cursor=HIT.some(o=>Math.hypot(o.X-e.clientX+r.left,o.Y-e.clientY+r.top)<26)?'pointer':''});
// ===== 标的设置（单一弹窗，全部为真实 <button>）=====
let D=null,TGT=null;const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nameOf=s=>{if(s==='pnl')return'交易日志净盈亏';const f=SYMS.find(x=>x[0]===s);return f?f[1]:''};
function openSet(){D={center:CENTER,nodes:NODES.slice(),charts:CH.slice()};TGT=null;$('#modal').hidden=false;document.body.style.overflow='hidden';renderSet()}
function closeSet(){$('#modal').hidden=true;document.body.style.overflow='';D=null}
function row(sec,i,s){return`<div class="srow"><div class="sname"><b>${esc(s==='pnl'?'盈亏':tk(s))}</b><small>${esc(s==='pnl'?'交易日志':s)} ${esc(nameOf(s))}</small></div><button class="mbtn" data-a="chg" data-s="${sec}" data-i="${i}">更换</button>${sec==='center'?'':`<button class="mbtn red" data-a="del" data-s="${sec}" data-i="${i}">删除</button>`}</div>`}
function renderSet(){const B=$('#mBody');
if(TGT){B.innerHTML=`<div class="shead">${TGT.s==='center'?'中心光球':TGT.s==='nodes'?'轨道节点':'图表'} · ${TGT.i==null?'添加':'更换'}</div><input id="sq" type="search" placeholder="输入：黄金 / eth / nvda / 德指 / NASDAQ:AAPL" autocomplete="off" autocapitalize="off"><div id="sres"></div><div class="mfoot"><button class="mbtn" data-a="raw">使用输入</button>${TGT.s==='center'?'<button class="mbtn" data-a="pnl">改为交易日志盈亏</button>':''}<button class="mbtn" data-a="back">返回</button></div>`;
const q=$('#sq'),res=()=>{const r=search(q.value);$('#sres').innerHTML=r.map(x=>`<button class="res" data-a="pick" data-v="${esc(x.s)}"><b>${esc(tk(x.s))}</b><span>${esc(x.d)}</span><em>${esc(x.s.split(':')[0])}</em></button>`).join('')||(q.value.trim()?'<div class="hint">本地库没有。可输入完整代码如 NASDAQ:AAPL 再点「使用输入」，或在图表左上角用 TradingView 全库搜索。</div>':'')};
q.addEventListener('input',res);q.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const r=search(q.value);setSlot(r[0]?r[0].s:q.value.trim().toUpperCase())}});setTimeout(()=>q.focus(),50);return}
B.innerHTML=`<div class="shead">中心光球</div>${row('center',0,D.center)}
<div class="shead">轨道节点 <small>${D.nodes.length}/8</small></div>${D.nodes.map((s,i)=>row('nodes',i,s)).join('')}${D.nodes.length<8?'<button class="mbtn add" data-a="add" data-s="nodes">＋ 添加节点</button>':''}
<div class="shead">图表 <small>${D.charts.length}/4</small></div>${D.charts.map((s,i)=>row('charts',i,s)).join('')}${D.charts.length<4?'<button class="mbtn add" data-a="add" data-s="charts">＋ 添加图表</button>':''}
<div class="mfoot"><button class="mbtn primary" data-a="save">保存</button><button class="mbtn" data-a="reset">恢复默认</button></div>`}
function setSlot(v){if(!v)return;const{s,i}=TGT;if(s==='center')D.center=v;else if(i==null)D[s].push(v);else D[s][i]=v;TGT=null;renderSet()}
$('#mBody').addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const a=b.dataset.a,s=b.dataset.s,i=b.dataset.i==null?null:+b.dataset.i;
if(a==='chg')TGT={s,i};else if(a==='add')TGT={s,i:null};else if(a==='del'){if(s==='charts'&&D.charts.length<=1)return;D[s].splice(i,1)}
else if(a==='pick')return setSlot(b.dataset.v);else if(a==='raw'){const v=$('#sq').value.trim();if(!v)return;const r=search(v);return setSlot(/:/.test(v)?v.toUpperCase():(r[0]?r[0].s:v.toUpperCase()))}
else if(a==='pnl')return setSlot('pnl');else if(a==='back')TGT=null;
else if(a==='reset'){D={center:'BITSTAMP:BTCUSD',nodes:NDEF.slice(),charts:DEF.slice()}}
else if(a==='save'){CENTER=D.center;NODES=D.nodes;CH=D.charts;saveN();saveCH();charts();loadCrypto();num();closeSet();return}
renderSet()});
const on=(id,f)=>{const e=$(id);if(e)e.addEventListener('click',f)};on('#setBtn',openSet);on('#mClose',closeSet);on('#modal',e=>{if(e.target.id==='modal')closeSet()});
const safe=f=>{try{f()}catch(e){console.error('init',e)}};[clock,cal,refresh,loadLive,loadCrypto].forEach(safe);requestAnimationFrame(draw);
setInterval(clock,1000);setInterval(loadLive,60000);setInterval(loadCrypto,30000);setInterval(num,5000);setInterval(()=>{mkt();think()},30000)})();
