(()=>{const $=s=>document.querySelector(s);
const AG=[['ATLAS','总览'],['SCOUT','侦察'],['SENTINEL','风控'],['ORACLE','日历'],['PILOT','时段'],['LEDGER','账本'],['CHARTIST','图表'],['ATHENA','纪律']];
function ny(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());const o={};p.forEach(x=>o[x.type]=x.value);return{d:o.weekday,h:(+o.hour%24)+(+o.minute)/60}}
// CFD 指数/原油：纽约时间 周日18:00–周五17:00，每日17:00–18:00休市
function cfdOpen(){const{d,h}=ny();if(d==='Sat')return false;if(d==='Sun')return h>=18;if(d==='Fri')return h<17;return!(h>=17&&h<18)}
function cashOpen(){const{d,h}=ny();return!['Sat','Sun'].includes(d)&&h>=9.5&&h<16}
function journal(){try{const s=JSON.parse(localStorage.getItem('tj_v1'));const t=s&&(s.trades||[]);if(!Array.isArray(t)||!t.length)return null;let n=0,w=0;t.forEach(x=>{const v=(+x.pnl||0)-Math.abs(+x.commission||0)+(+x.swap||0);n+=v;if(v>0)w++});return{n,c:t.length,wr:w/t.length}}catch(e){return null}}
const status={};
function think(){const o=cfdOpen(),c=cashOpen(),j=journal(),{d,h}=ny(),rome=new Date().toLocaleTimeString('zh-CN',{timeZone:'Europe/Rome',hour12:false});
status.ATLAS=o?'市场运行中':'休市待机';status.SCOUT=o?'扫描 US100/USOIL':'等待开盘';
status.SENTINEL=o&&c?'现货时段·波动偏高':'低波动时段';status.ORACLE=(d==='Wed'&&h>=10&&h<11)?'EIA原油库存时段':'无关注事件';
status.PILOT=c?'美股现货开盘':(o?'CFD 盘前/盘后':'休市');status.LEDGER=j?`记录 ${j.c} 笔`:'未发现日志';
status.CHARTIST='图表实时';status.ATHENA=o?'只看不下单':'休息也是纪律';
const pool=[`<b>PILOT</b> 罗马时间 ${rome}，${status.PILOT}`,`<b>SCOUT</b> ${status.SCOUT}`,`<b>SENTINEL</b> ${status.SENTINEL}`,`<b>ORACLE</b> ${status.ORACLE}`,`<b>LEDGER</b> ${j?`净盈亏 ${j.n.toFixed(2)}，胜率 ${(j.wr*100).toFixed(0)}%`:'同源未找到交易日志数据'}`,`<b>ATHENA</b> 提醒：按计划执行，不追单`];
return pool[Math.random()*pool.length|0]}
function log(){const l=$('#log'),e=document.createElement('div');e.innerHTML=`<span style="color:#567">${new Date().toLocaleTimeString('zh-CN',{timeZone:'Europe/Rome',hour12:false})}</span> `+think()+' <small style="color:#f0a">模拟</small>';l.prepend(e);while(l.children.length>30)l.lastChild.remove()}
function gauges(){const o=cfdOpen(),j=journal(),v=[['活跃代理',o?8:3,8],['胜率',j?Math.round(j.wr*100):0,100],['日内进度',(()=>{const h=ny().h;return Math.round(h/24*100)})(),100]];
$('#gauges').innerHTML=v.map(([n,x,m])=>{const r=26,C=2*Math.PI*r,f=x/m;return`<div class="g"><svg width="70" height="70"><circle cx="35" cy="35" r="${r}" stroke="#1d2a3a" stroke-width="5" fill="none"/><circle cx="35" cy="35" r="${r}" stroke="#0ff" stroke-width="5" fill="none" stroke-dasharray="${C*f} ${C}" transform="rotate(-90 35 35)" stroke-linecap="round"/><text x="35" y="40" fill="#fff" font-size="13" text-anchor="middle">${n==='日内进度'?x+'%':x}</text></svg>${n}</div>`}).join('')}
function mkt(){const o=cfdOpen(),c=cashOpen();$('#stUS').textContent=$('#stOil').textContent=o?'开':'休';
$('#mkt').innerHTML=`<div class="mk">US100 (CFD)<span class="${o?'on':'off'}">${o?'● 交易中':'● 休市'}</span></div><div class="mk">USOIL (CFD)<span class="${o?'on':'off'}">${o?'● 交易中':'● 休市'}</span></div><div class="mk">纳斯达克现货<span class="${c?'on':'off'}">${c?'● 开盘':'● 收盘'}</span></div>`}
function cal(){const n=new Date(new Date().toLocaleString('en-US',{timeZone:'Europe/Rome'})),y=n.getFullYear(),m=n.getMonth(),f=(new Date(y,m,1).getDay()+6)%7,L=new Date(y,m+1,0).getDate();let h=`<div style="color:#8ab;margin-bottom:4px">${y}年${m+1}月</div><table><tr>${'一二三四五六日'.split('').map(x=>`<td>${x}</td>`).join('')}</tr><tr>`;for(let i=0;i<f;i++)h+='<td></td>';for(let d=1;d<=L;d++){h+=`<td class="${d===n.getDate()?'t':''}">${d}</td>`;if((d+f)%7===0)h+='</tr><tr>'}$('#cal').innerHTML=h+'</tr></table>'}
function bars(){const o=cfdOpen();$('#bars').innerHTML=AG.map(([n])=>`<div class="bar"><span>${n}</span><i style="width:${(o?40:8)+Math.random()*(o?55:20)|0}%"></i></div>`).join('')}
function num(){const s=$('#numSel').value,j=journal();if(s==='pnl'){$('#numLabel').textContent=j?'交易日志 · 净盈亏':'交易日志 · 无数据';$('#num').textContent=j?(j.n>=0?'+':'')+j.n.toFixed(2):'—'}else{$('#numLabel').textContent=(s==='us'?'US100':'USOIL')+' · 当前状态';$('#num').textContent=cfdOpen()?'交易中':'休市'}}
$('#numSel').onchange=num;if(!journal())$('#numSel').value='us';
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
const c=o.n==='SENTINEL'?'#f0a':'#0ff';x.shadowColor=c;x.shadowBlur=14;x.fillStyle=c;x.beginPath();x.arc(o.X,o.Y,5*sc,0,7);x.fill();x.shadowBlur=0;
x.globalAlpha=.4+.6*o.d;x.fillStyle='#fff';x.font=`600 ${11*sc+1}px system-ui`;x.textAlign='center';x.fillText(o.n,o.X,o.Y-10*sc);x.fillStyle='#8ab';x.font=`${10*sc}px system-ui`;x.fillText(status[o.n]||'',o.X,o.Y+16*sc);x.globalAlpha=1});
requestAnimationFrame(draw)}
// TradingView 免费嵌入
document.querySelectorAll('.tv').forEach(el=>{const w=document.createElement('div');w.className='tradingview-widget-container__widget';w.style.height='100%';el.className+=' tradingview-widget-container';el.appendChild(w);const s=document.createElement('script');s.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';s.async=true;s.textContent=JSON.stringify({autosize:true,symbol:el.dataset.sym,interval:'15',timezone:'Europe/Rome',theme:'dark',style:'1',locale:'zh_CN',backgroundColor:'#0a0f1a',hide_side_toolbar:true,allow_symbol_change:false,save_image:false,support_host:'https://www.tradingview.com'});el.appendChild(s)});
think();clock();mkt();cal();gauges();bars();num();for(let i=0;i<5;i++)log();requestAnimationFrame(draw);
setInterval(clock,1000);setInterval(()=>{log();bars()},3500);setInterval(()=>{mkt();gauges();num()},30000)})();
