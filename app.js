const APP_NAME="cygna_bch203",ADMIN_NAME="Olamide George",ADMIN_EMAIL="olamgeorg9@gmail.com";
const $=s=>document.querySelector(s),app=$('#app'),LS=(k,v)=>v===undefined?JSON.parse(localStorage.getItem(k)||'null'):localStorage.setItem(k,JSON.stringify(v));
const isAdmin=e=>!!e&&e.toLowerCase()===ADMIN_EMAIL.toLowerCase();
const sh=a=>{a=[...a];for(let j=a.length-1;j>0;j--){const k=Math.random()*(j+1)|0;[a[j],a[k]]=[a[k],a[j]]}return a};
let U=null,Q=[],A=[],i=0,mode='practice',left=0,used=0,paused=false,timer=null,seen=new Set(),st={sel:new Set(),n:20,mode:'practice'};
const TOPICS=[...new Set(QUESTIONS.map(q=>q.topic))],cnt=t=>QUESTIONS.filter(q=>q.topic===t).length;
const key=k=>k+'_'+(U?U.email:'x'),fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
/* theme */
function applyTheme(){const s=LS('theme')||{t:'light',b:'plain',f:'medium'},d=document.documentElement;d.dataset.theme=s.t;d.style.fontSize={small:'14px',medium:'16px',large:'19px'}[s.f];
document.body.style.background={plain:'',gradient:'linear-gradient(160deg,var(--bg),color-mix(in srgb,var(--pr) 35%,var(--bg)))',pattern:'repeating-linear-gradient(45deg,var(--bg) 0 14px,color-mix(in srgb,var(--pr) 10%,var(--bg)) 14px 28px)'}[s.b]||'';}
function settings(){const s=LS('theme')||{t:'light',b:'plain',f:'medium'},set=(k,v)=>{s[k]=v;LS('theme',s);applyTheme();settings()},w=window;w.setT=(k,v)=>set(k,v);
const row=(k,a)=>`<div class="sw">${a.map(x=>`<button class="btn ${s[k]===x?'':'alt'}" onclick="setT('${k}','${x}')">${x}</button>`).join('')}</div>`;
app.innerHTML=`<div class="card"><h2>Settings</h2><h3>Theme</h3>${row('t',['light','dark','green','blue','purple','pink','orange','black'])}<h3>Background</h3>${row('b',['plain','gradient','pattern'])}<h3>Font size</h3>${row('f',['small','medium','large'])}<button class="btn" onclick="home()">Back</button></div>`}
$('#gear').onclick=()=>U?settings():0;
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#inst').hidden=false});$('#inst').onclick=async()=>{if(dp){dp.prompt();dp=null;$('#inst').hidden=true}};
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js');
/* auth */
async function boot(){applyTheme();await window.cfgReady;
if(!sb){U={name:'Guest (offline demo)',email:'guest@local'};return home()}
sb.auth.onAuthStateChange(ev=>{if(ev==='PASSWORD_RECOVERY')newPass()});
const{data}=await sb.auth.getSession();data.session?enter(data.session.user):auth()}
async function enter(u){const ad=isAdmin(u.email);let{data:p}=await sb.from('profiles').select('*').eq('id',u.id).maybeSingle();
if(!p&&!ad){const n={id:u.id,full_name:u.user_metadata?.full_name||u.email,email:u.email,role:'student',app_name:APP_NAME};await sb.from('profiles').insert(n);p=n}
if(!ad&&p.app_name!==APP_NAME){await sb.auth.signOut();return auth('This account is not for BCH203')}
U={id:u.id,email:u.email,admin:ad,name:ad?ADMIN_NAME:(p?.full_name||u.email)};home()}
function auth(msg,tab='in'){const f=tab==='up';
app.innerHTML=`<div class="card"><h2>${tab==='fp'?'Forgot password':f?'Create account':'Login'}</h2><p class="err" id="m">${msg||''}</p>
${f?'<input id="n" placeholder="Full name">':''}<input id="e" type="email" placeholder="Email">${tab==='fp'?'':'<input id="p" type="password" placeholder="Password (min 6)">'}
<button class="btn" id="go">${tab==='fp'?'Send reset link':f?'Sign up':'Login'}</button><div class="row"><a href="#" id="a1">${f?'Have an account? Login':'Create account'}</a><a href="#" id="a2">${tab==='fp'?'Back to login':'Forgot password?'}</a></div></div>`;
$('#a1').onclick=e=>{e.preventDefault();auth('',f?'in':'up')};$('#a2').onclick=e=>{e.preventDefault();auth('',tab==='fp'?'in':'fp')};
$('#go').onclick=async()=>{const em=$('#e').value.trim(),pw=$('#p')?.value,nm=$('#n')?.value.trim(),m=$('#m');m.textContent='';
if(!em||(tab!=='fp'&&(!pw||pw.length<6))||(f&&!nm))return m.textContent='Fill all fields correctly.';
if(tab==='fp'){const{error}=await sb.auth.resetPasswordForEmail(em,{redirectTo:location.origin+location.pathname});return m.textContent=error?error.message:'Reset link sent. Check your email.'}
if(f){const{data,error}=await sb.auth.signUp({email:em,password:pw,options:{data:{full_name:nm,app_name:APP_NAME}}});if(error)return m.textContent=error.message;
if(data.session)return enter(data.user);return auth('Account created. Confirm your email, then login.')}
const{data,error}=await sb.auth.signInWithPassword({email:em,password:pw});if(error)return m.textContent=error.message;enter(data.user)}}
function newPass(){const p=prompt('Enter your new password (min 6 characters)');if(p&&p.length>=6)sb.auth.updateUser({password:p}).then(r=>alert(r.error?r.error.message:'Password updated.'))}
async function logout(){if(sb)await sb.auth.signOut();U=null;sb?auth():home()}
/* home */
function home(){clearInterval(timer);const tc=t=>st.sel.has(t)?'checked':'';
app.innerHTML=`<div class="card"><h2>Welcome, ${U.name}</h2><p>Cygna BCH203 Quiz<br><small>Biochemistry 203 - Biochemistry</small></p><button class="btn alt" onclick="logout()">Logout</button>${U.admin?'<a class="btn" href="admin.html">Admin Dashboard</a>':''}</div>
<div class="card"><h3>Select topics</h3><button class="btn alt" onclick="selAll(1)">Select All</button><button class="btn alt" onclick="selAll(0)">Clear All</button>
${TOPICS.map((t,k)=>`<label class="tp"><input type="checkbox" ${tc(t)} onchange="tg(${k})"><span>${t} (${cnt(t)} questions)</span></label>`).join('')}</div>
<div class="card"><h3>Mode</h3><select id="md"><option value="practice">Practice (answers shown immediately, no timer)</option><option value="exam">Exam (timed, answers at end)</option><option value="timed">Track/Timed (60s per question)</option></select>
<h3>Number of questions</h3><select id="nq">${[10,20,30,50,100,'All'].map(n=>`<option>${n}</option>`).join('')}</select><button class="btn" onclick="start()">Start Quiz</button><button class="btn alt" onclick="scores()">My Scores</button><p class="err" id="hm"></p></div>`;
$('#md').value=st.mode;$('#nq').value=st.n}
window.tg=k=>{const t=TOPICS[k];st.sel.has(t)?st.sel.delete(t):st.sel.add(t)};window.selAll=f=>{st.sel=new Set(f?TOPICS:[]);home()};
/* quiz */
function start(re){if(!re){st.mode=$('#md').value;st.n=$('#nq').value}
if(!st.sel.size)return $('#hm').textContent='Select at least one topic.';
mode=st.mode;let pool=QUESTIONS.filter(q=>st.sel.has(q.topic)),fresh=pool.filter(q=>!seen.has(q.question));if(fresh.length<(st.n==='All'?pool.length:+st.n)){pool.forEach(q=>seen.delete(q.question));fresh=pool}
fresh=sh(fresh);if(st.n!=='All')fresh=fresh.slice(0,+st.n);
Q=fresh.map(q=>{const o=sh(q.options.map((t,k)=>({t,c:k===q.correct})));return{...q,opts:o.map(x=>x.t),ans:o.findIndex(x=>x.c)}});Q.forEach(q=>seen.add(q.question));
A=Q.map(()=>null);i=0;used=0;paused=false;left=mode==='exam'?Math.max(60,Q.length*45):60;clearInterval(timer);if(mode!=='practice')timer=setInterval(tick,1000);show()}
function tick(){if(paused)return;used++;left--;if(left<=0){if(mode==='timed'){if(i<Q.length-1){i++;left=60;return show()}return finish()}return finish()}const t=$('#tm');if(t)t.textContent='⏱ '+fmt(left)}
function show(){const q=Q[i],a=A[i],lock=mode==='practice'&&a!==null,L='ABCD';
app.innerHTML=`<div class="card"><div class="row"><b>Question ${i+1}/${Q.length}</b><span id="tm">${mode==='practice'?'No timer':'⏱ '+fmt(left)}</span>${mode!=='practice'?'<button class="btn alt" onclick="pz()">'+(paused?'Resume':'Pause')+'</button>':''}</div><div class="bar"><b style="width:${(i+1)/Q.length*100}%"></b></div></div>
<div class="card"><small>${q.topic} · ${q.difficulty}</small><h3>${q.question}</h3>${paused?'<p>Paused</p>':q.opts.map((o,k)=>`<button class="opt ${lock?(k===q.ans?'ok':k===a?'bad':''):(a===k?'sel':'')}" ${lock?'disabled':''} onclick="pick(${k})">${L[k]}. ${o}</button>`).join('')}
${lock?`<p><b>${a===q.ans?'Correct!':'Wrong. Answer: '+L[q.ans]}</b><br>${q.explanation}</p>`:''}</div>
<div class="row"><button class="btn alt" onclick="nav(-1)" ${i?'':'disabled'}>Previous</button><button class="btn alt" onclick="nav(1,1)">Skip</button><button class="btn" onclick="nav(1)" ${i<Q.length-1?'':'hidden'}>Next</button><button class="btn red" onclick="finish()">Submit</button></div>`}
window.pz=()=>{paused=!paused;show()};window.pick=k=>{if(paused||(mode==='practice'&&A[i]!==null))return;A[i]=k;show()};
window.nav=(d,sk)=>{if(sk)A[i]=mode==='practice'?A[i]:A[i];i=Math.max(0,Math.min(Q.length-1,i+d));if(mode==='timed')left=60;show()};
const grade=p=>p>=70?'A':p>=60?'B':p>=50?'C':p>=45?'D':'F';
async function finish(){clearInterval(timer);const c=A.filter((a,k)=>a===Q[k].ans).length,sk=A.filter(a=>a===null).length,tot=Q.length,pc=Math.round(c/tot*100);
const tp=[...new Set(Q.map(q=>q.topic))],r={id:Date.now(),date:new Date().toISOString(),topics:tp.join(', '),mode,score:c,total_questions:tot,percentage:pc,grade:grade(pc),pass_fail:pc>=50?'Pass':'Fail',time_used:fmt(used)};
const h=LS(key('hist'))||[];h.unshift(r);LS(key('hist'),h);const ts=LS(key('ts'))||{};Q.forEach((q,k)=>{ts[q.topic]=ts[q.topic]||{c:0,t:0};ts[q.topic].t++;if(A[k]===q.ans)ts[q.topic].c++});LS(key('ts'),ts);
if(sb&&U.id)sb.from('results').insert({user_id:U.id,full_name:U.name,email:U.email,app_name:APP_NAME,topics:r.topics,mode,score:c,total_questions:tot,percentage:pc,grade:r.grade,pass_fail:r.pass_fail,time_used:r.time_used}).then(x=>x.error&&console.warn(x.error.message));
const L='ABCD';app.innerHTML=`<div class="card" style="text-align:center"><h2>Result</h2><div class="ring" style="background:conic-gradient(var(--pr) ${pc}%,var(--bd) 0)"><div>${pc}%</div></div><h3>${c} / ${tot} · Grade ${r.grade} · ${r.pass_fail}</h3><p>Correct ${c} · Wrong ${tot-c-sk} · Skipped ${sk} · Time ${r.time_used}</p>
<button class="btn" onclick="start(1)">Retake</button><button class="btn alt" onclick="home()">New Quiz</button><button class="btn alt" onclick="home()">Go Home</button></div>
${Q.map((q,k)=>`<div class="card"><b>${k+1}. ${q.question}</b><p>Your answer: ${A[k]===null?'Skipped':L[A[k]]+'. '+q.opts[A[k]]}<br>Correct: ${L[q.ans]}. ${q.opts[q.ans]}</p><small>${q.explanation} (${q.source})</small></div>`).join('')}`}
/* scores */
function scores(){const h=LS(key('hist'))||[],ts=LS(key('ts'))||{},n=h.length,avg=n?Math.round(h.reduce((s,x)=>s+x.percentage,0)/n):0;
app.innerHTML=`<div class="card"><h2>My Scores</h2><p>Quizzes: <b>${n}</b> · Average: <b>${avg}%</b> · Best: <b>${n?Math.max(...h.map(x=>x.percentage)):0}%</b> · Last: <b>${n?h[0].percentage:0}%</b></p></div>
<div class="card"><h3>Topics (weak / strong)</h3>${TOPICS.map(t=>{const s=ts[t],p=s?Math.round(s.c/s.t*100):0;return`<p>${t}: ${p}% ${s?(p>=70?'💪 strong':p<50?'⚠ weak':''):'(not attempted)'}</p><div class="bar"><b style="width:${p}%"></b></div>`}).join('')}</div>
<div class="card wrap"><h3>History</h3><table><tr><th>Date</th><th>Topics</th><th>Mode</th><th>Score</th><th>Total</th><th>Time</th></tr>${h.map(x=>`<tr><td>${new Date(x.date).toLocaleString()}</td><td>${x.topics}</td><td>${x.mode}</td><td>${x.score} (${x.percentage}%)</td><td>${x.total_questions}</td><td>${x.time_used}</td></tr>`).join('')}</table>
<button class="btn red" onclick="if(confirm('Clear history?')){LS(key('hist'),[]);LS(key('ts'),{});scores()}">Clear History</button><button class="btn alt" onclick="home()">Back</button></div>`}
window.scores=scores;window.start=start;window.finish=finish;window.home=home;window.logout=logout;window.key=key;window.LS=LS;
boot();
