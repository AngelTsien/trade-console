(()=>{const $=s=>document.querySelector(s);
const AG=[['ATLAS','BTC'],['SENTINEL','监控健康'],['SCOUT','US100 提醒'],['ORACLE','USOIL 提醒'],['CHARTIST','最新价'],['PILOT','时段'],['LEDGER','交易日志']];
let LIVE=null,BTC=null;
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
function think(){const o=cfdOpen(),c=cashOpen(),j=journal(),L=LIVE,al=L?L.alerts:[],last=s=>al.filter(x=>x.symbol===s).slice(-1)[0];
status.ATLAS=BTC?`$${BTC.p.toLocaleString('en-US',{maximumFractionDigits:0})} ${BTC.c>=0?'+':''}${BTC.c.toFixed(2)}%`:'BTC 获取中';
status.SENTINEL=!L?'无数据':stale()?'数据过期':(L.watcher.alive?'运行中 · 心跳 '+ago(age(L.watcher.heartbeat)):'监控离线');
const u=last('US100'),q=last('USOIL');status.SCOUT=u?u.type+' · '+ago(age(u.t)):'暂无提醒';status.ORACLE=q?q.type+' · '+ago(age(q.t)):'暂无提醒';
const P=L&&L.prices||{};status.CHARTIST=P.US100?`US100 ${P.US100} · USOIL ${P.USOIL??'—'}`:'休市中，暂无报价';
status.PILOT=c?'美股现货开盘':(o?'CFD 交易中':'CFD 休市');status.LEDGER=j?`净 ${j.n.toFixed(2)} · ${j.c} 笔`:'本浏览器无日志数据'}
function log(){const l=$('#log');if(!LIVE){l.innerHTML='<div>等待监控数据…</div>';return}
l.innerHTML=(stale()?'<div style="color:#f55">⚠ 数据过期（'+ago(age(LIVE.generated))+'更新）</div>':'')+LIVE.alerts.slice().reverse().map(a=>`<div><span style="color:#567">${fmtT(a.t)}</span> <b>${a.symbol}</b> 触及 ${a.type}</div>`).join('')||'<div>暂无提醒</div>'}
function gauges(){const j=journal(),L=LIVE,n24=L?L.alerts.filter(a=>age(a.t)<1440).length:0,hb=L?age(L.watcher.heartbeat):null,v=[['心跳(分)',hb??'—',Math.max(30,hb||0),hb!=null&&hb<=15?'#0ff':'#f55'],['24h提醒',n24,Math.max(10,n24),'#0ff'],['胜率',j?Math.round(j.wr*100):'—',100,'#0ff']];
$('#gauges').innerHTML=v.map(([n,x,m,col])=>{const r=26,C=2*Math.PI*r,f=(+x||0)/m;return`<div class="g"><svg width="70" height="70"><circle cx="35" cy="35" r="${r}" stroke="#1d2a3a" stroke-width="5" fill="none"/><circle cx="35" cy="35" r="${r}" stroke="${col}" stroke-width="5" fill="none" stroke-dasharray="${C*f} ${C}" transform="rotate(-90 35 35)" stroke-linecap="round"/><text x="35" y="40" fill="#fff" font-size="13" text-anchor="middle">${x}</text></svg>${n}</div>`}).join('')}
function mkt(){const o=cfdOpen(),c=cashOpen();$('#stUS').textContent=$('#stOil').textContent=o?'开':'休';
$('#mkt').innerHTML=`<div class="mk">US100 (CFD)<span class="${o?'on':'off'}">${o?'● 交易中':'● 休市'}</span></div><div class="mk">USOIL (CFD)<span class="${o?'on':'off'}">${o?'● 交易中':'● 休市'}</span></div><div class="mk">纳斯达克现货<span class="${c?'on':'off'}">${c?'● 开盘':'● 收盘'}</span></div>`}
function cal(){const n=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Rome'})),y=n.getFullYear(),m=n.getMonth(),f=(new Date(y,m,1).getDay()+6)%7,L=new Date(y,m+1,0).getDate();let h=`<div style="color:#8ab;margin-bottom:4px">${y}年${m+1}月</div><table><tr>${'一二三四五六日'.split('').map(x=>`<td>${x}</td>`).join('')}</tr><tr>`;for(let i=0;i<f;i++)h+='<td></td>';for(let d=1;d<=L;d++){h+=`<td class="${d===n.getDate()?'t':''}">${d}</td>`;if((d+f)%7===0)h+='</tr><tr>'}$('#cal').innerHTML=h+'</tr></table>'}
function bars(){const al=LIVE?LIVE.alerts:[],cnt=s=>al.filter(a=>a.symbol===s).length,m=Math.max(1,cnt('US100'),cnt('USOIL'));
$('#bars').innerHTML=['US100','USOIL'].map(s=>`<div class="bar"><span>${s}</span><i style="width:${cnt(s)/m*80+2}%"></i><b style="font-weight:400;color:#8ab">${cnt(s)}</b></div>`).join('')+`<div style="color:#567;font-size:10px">${LIVE?'更新于 '+ago(age(LIVE.generated)):'无数据'}</div>`}
function num(){const s=$('#numSel').value,j=journal(),P=LIVE&&LIVE.prices||{};let l,v;
if(s==='pnl'){l=j?'交易日志 · 净盈亏':'交易日志 · 无数据';v=j?(j.n>=0?'+':'')+j.n.toFixed(2):'—'}
else if(s==='btc'){l='BTC/USD · Coinbase';v=BTC?BTC.p.toLocaleString('en-US',{maximumFractionDigits:0}):'—'}
else{const k=s==='us'?'US100':'USOIL';l=k+(P[k]?' · 监控报价 '+(LIVE.prices_t?ago(age(LIVE.prices_t)):''):' · '+(cfdOpen()?'等待报价':'休市'));v=P[k]??(cfdOpen()?'—':'休市')}
$('#numLabel').textContent=l;$('#num').textContent=v}
async function loadLive(){try{LIVE=await (await fetch('data/live.json?'+Date.now(),{cache:'no-store'})).json()}catch(e){}refresh()}
async function loadBTC(){try{const r=await (await fetch('https://api.exchange.coinbase.com/products/BTC-USD/stats')).json();BTC={p:+r.last,c:(r.last-r.open)/r.open*100}}catch(e){try{const r=await (await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')).json();BTC={p:+r.lastPrice,c:+r.priceChangePercent}}catch(e2){}}think();num()}
function refresh(){think();mkt();gauges();bars();log();num()}
$('#numSel').onchange=num;if(!journal())$('#numSel').value='btc';
function clock(){$('#clock').textContent='罗马 '+new Date().toLocaleTimeString('zh-CN',{timeZone:'Europe/Rome',hour12:false})}
// orb
const cv=$('#orb'),x=cv.getContext('2d');let W,H;function rs(){const r=devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*r;cv.height=H*r;x.setTransform(r,0,0,r,0,0)}addEventListener('resize',rs);rs();
const pts=Array.from({length:500},()=>({a:Math.random()*6.28,b:Math.acos(2*Math.random()-1),s:.2+Math.random()*.6}));
function draw(t){t/=1000;x.clearRect(0,0,W,H);const cx=W/2,cy=H*.44,R=Math.min(W,H)*.13*(1+.04*Math.sin(t*2)),OR=Math.min(W*.42,H*.36);
const g=x.createRadialGradient(cx,cy,0,cx,cy,R*2.6);g.addColorStop(0,'#fff');g.addColorStop(.25,'#ffe7b0');g.addColorStop(.5,'#f5c76b55');g.addColorStop(1,'transparent');x.fillStyle=g;x.beginPath();x.arc(cx,cy,R*2.6,0,7);x.fill();
x.fillStyle='#fff8';pts.forEach(p=>{const a=p.a+t*p.s*.3,r=R*1.1,X=Math.sin(p.b)*Math.cos(a),Z=Math.sin(p.b)*Math.sin(a);x.globalAlpha=.3+.5*(Z+1)/2;x.fillRect(cx+X*r,cy+Math.cos(p.b)*r,1.4,1.4)});x.globalAlpha=1;
x.strokeStyle='#0ff3';x.beginPath();x.ellipse(cx,cy,OR,OR*.32,0,0,7);x.stroke();
const nodes=AG.map(([n,z],i)=>{const a=t*.15+i/AG.length*6.283;return{n,z,X:cx+Math.cos(a)*OR,Y:cy+Math.sin(a)*OR*.32,d:(Math.sin(a)+1)/2}}).sort((p,q)=>p.d-q.d);
nodes.forEach(o=>{const sc=.6+.5*o.d;x.strokeStyle=`rgba(0,255,255,${.08+.2*o.d})`;x.beginPath();x.moveTo(cx,cy);x.lineTo(o.X,o.Y);x.stroke();
const c=o.n==='SENTINEL'&&(stale()||!LIVE.watcher.alive)?'#f55':o.n==='ATLAS'?'#f7931a':'#0ff';x.shadowColor=c;x.shadowBlur=14;x.fillStyle=c;x.beginPath();x.arc(o.X,o.Y,5*sc,0,7);x.fill();x.shadowBlur=0;
x.globalAlpha=.4+.6*o.d;x.fillStyle='#fff';x.font=`600 ${11*sc+1}px system-ui`;x.textAlign='center';x.fillText(o.n,o.X,o.Y-10*sc);x.fillStyle='#8ab';x.font=`${10*sc}px system-ui`;x.fillText(status[o.n]||'',o.X,o.Y+16*sc);x.globalAlpha=1});
requestAnimationFrame(draw)}
// TradingView 免费嵌入：可自选标的，存 localStorage
const PICKS={'NAS100':'OANDA:NAS100USD','USOIL':'TVC:USOIL','BTC':'BITSTAMP:BTCUSD','ETH':'BITSTAMP:ETHUSD','GOLD':'OANDA:XAUUSD','SPX':'SP:SPX','EURUSD':'FX:EURUSD','AAPL':'NASDAQ:AAPL','NVDA':'NASDAQ:NVDA','TSLA':'NASDAQ:TSLA'};
const DEF=['OANDA:NAS100USD','TVC:USOIL','BITSTAMP:BTCUSD'],CK='tc_charts';
let CH;try{CH=JSON.parse(localStorage.getItem(CK))}catch(e){}if(!Array.isArray(CH)||!CH.length)CH=DEF.slice();
const saveCH=()=>localStorage.setItem(CK,JSON.stringify(CH));
const norm=v=>{v=v.trim().toUpperCase();return PICKS[v]||v};
$('#symList').innerHTML=Object.entries(PICKS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
function tv(el,sym){el.innerHTML='';const w=document.createElement('div');w.className='tradingview-widget-container__widget';w.style.height='100%';el.appendChild(w);const s=document.createElement('script');s.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';s.async=true;s.textContent=JSON.stringify({autosize:true,symbol:sym,interval:'15',timezone:'Europe/Rome',theme:'dark',style:'1',locale:'zh_CN',backgroundColor:'#0a0f1a',hide_side_toolbar:true,allow_symbol_change:true,save_image:false,support_host:'https://www.tradingview.com'});el.appendChild(s)}
function charts(){const box=$('#charts');box.innerHTML='';box.style.gridTemplateColumns=innerWidth<900?'1fr':`repeat(${Math.min(CH.length,2+(CH.length===3))},1fr)`;
CH.forEach((sym,i)=>{const c=document.createElement('div');c.className='chart';c.innerHTML=`<div class="ct"><input class="sym" list="symList" value="${sym}" title="回车切换标的"><button class="x" title="移除">✕</button></div><div class="tv tradingview-widget-container"></div>`;box.appendChild(c);
const inp=c.querySelector('.sym');inp.onchange=()=>{const v=norm(inp.value);if(v){CH[i]=v;saveCH();charts()}};c.querySelector('.x').onclick=()=>{if(CH.length>1){CH.splice(i,1);saveCH();charts()}};tv(c.querySelector('.tv'),sym)});
$('#symAdd').disabled=CH.length>=4}
$('#symAdd').onclick=()=>{const v=norm($('#symIn').value);if(v&&CH.length<4){CH.push(v);$('#symIn').value='';saveCH();charts()}};
$('#symIn').onkeydown=e=>{if(e.key==='Enter')$('#symAdd').onclick()};
$('#symReset').onclick=()=>{CH=DEF.slice();saveCH();charts()};charts();
clock();cal();refresh();loadLive();loadBTC();requestAnimationFrame(draw);
setInterval(clock,1000);setInterval(loadLive,60000);setInterval(loadBTC,30000);setInterval(()=>{mkt();think()},30000)})();
