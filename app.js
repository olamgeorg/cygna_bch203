const APP_NAME="cygna_bch203",ADMIN_NAME="Olamide George",ADMIN_EMAIL="olamgeorg9@gmail.com";
const $=s=>document.querySelector(s),app=$('#app');
const LS=(k,v)=>{try{return v===undefined?JSON.parse(localStorage.getItem(k)):localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isAdmin=e=>!!e&&e.toLowerCase()===ADMIN_EMAIL.toLowerCase();
const sh=a=>{a=[...a];for(let j=a.length-1;j>0;j--){const k=Math.random()*(j+1)|0;[a[j],a[k]]=[a[k],a[j]]}return a};
const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0'),L='ABCD';
const TOPICS=[...new Set(QUESTIONS.map(q=>q.topic))],cnt=t=>QUESTIONS.filter(q=>q.topic===t).length;
let U=null,Q=[],A=[],i=0,mode='practice',left=0,used=0,paused=false,timer=null,seen=new Set(),st={sel:new Set(),n:'20',mode:'practice'};
const key=k=>k+'_'+(U?U.email:'x');
/* ---------- theme ---------- */
const BG={plain:'',gradient:'linear-gradient(160deg,var(--bg),color-mix(in srgb,var(--pr) 35%,var(--bg)))',pattern:'repeating-linear-gradient(45deg,var(--bg) 0 14px,color-mix(in srgb,var(--pr) 10%,var(--bg)) 14px 28px)',image:'radial-gradient(circle at 15% 15%,color-mix(in srgb,var(--pr) 45%,transparent),transparent 45%),radial-gradient(circle at 85% 80%,color-mix(in srgb,var(--pr) 35%,transparent),transparent 50%),var(--bg)'};
function applyTheme(){const s=LS('theme')||{t:'light',b:'plain',f:'medium'};document.documentElement.dataset.theme=s.t;document.documentElement.style.fontSize={small:'14px',medium:'16px',large:'19px'}[s.f]||'16px';document.body.style.background=BG[s.b]||'';document.body.style.backgroundAttachment='fixed'}
function settings(){const s=LS('theme')||{t:'light',b:'plain',f:'medium'},r=(k,a)=>`<div class="sw">${a.map(x=>`<button class="btn ${s[k]===x?'':'alt'}" onclick="setT('${k}','${x}')">${x}</button>`).join('')}</div>`;
app.innerHTML=`<div class="card"><h2>Settings</h2><h3>Theme</h3>${r('t',['light','dark','green','blue','purple','pink','orange','black'])}<h3>Background</h3>${r('b',['plain','gradient','pattern','image'])}<h3>Font size</h3>${r('f',['small','medium','large'])}<br>${sb&&U?'<button class="btn alt" onclick="newPass()">Change password</button>':''}<button class="btn" onclick="U?home():boot()">Back</button></div>`}
function setT(k,v){const s=LS('theme')||{t:'light',b:'plain',f:'medium'};s[k]=v;LS('theme',s);applyTheme();settings()}
$('#gear').onclick=settings;
/* ---------- install + service worker ---------- */
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#inst').hidden=false});
$('#inst').onclick=async()=>{if(dp){dp.prompt();dp=null;$('#inst').hidden=true}};
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
/* ---------- header ---------- */
function hdr(){$('#who').textContent=U?U.name:'';$('#out').hidden=!U;$('#adm').hidden=!(U&&U.admin);$('#inl').hidden=!!U}
$('#out').onclick=()=>logout();$('#adm').onclick=()=>location.href='admin.html';$('#inl').onclick=()=>auth();
/* ---------- auth ---------- */
async function boot(){applyTheme();await window.cfgReady;if(!sb)return setup();
if(!window.__ev){window.__ev=1;sb.auth.onAuthStateChange(ev=>{if(ev==='PASSWORD_RECOVERY')newPass()})}
const{data}=await sb.auth.getSession();data.session?enter(data.session.user):auth()}
function setup(){hdr();app.innerHTML=`<div class="card"><h2>Connect to Supabase</h2><p class="err">Could not load Supabase. Check your internet connection.</p><button class="btn" onclick="location.reload()">Retry</button></div>`}
async function enter(u){const ad=isAdmin(u.email);let{data:p}=await sb.from('profiles').select('*').eq('id',u.id).maybeSingle();
if(!p&&!ad){const n={id:u.id,full_name:u.user_metadata?.full_name||u.email,email:u.email,role:'student',app_name:APP_NAME};await sb.from('profiles').insert(n);p=n}
if(!ad&&p.app_name!==APP_NAME){await sb.auth.signOut();return auth('This account is not for BCH203')}
U={id:u.id,email:u.email,admin:ad,name:ad?ADMIN_NAME:(p?.full_name||u.email)};sync();home()}
function auth(msg,tab='in'){U=null;hdr();const up=tab==='up',fp=tab==='fp';
app.innerHTML=`<div class="card"><h2>${fp?'Forgot password':up?'Create account':'Login'}</h2><p class="err" id="m">${esc(msg||'')}</p>
${up?'<input id="n" placeholder="Full name" autocomplete="name">':''}<input id="e" type="email" placeholder="Email" autocomplete="email">${fp?'':'<input id="p" type="password" placeholder="Password (min 6 characters)" autocomplete="current-password">'}
<button class="btn" id="go">${fp?'Send reset link':up?'Sign up':'Login'}</button><div class="row"><a href="#" id="a1">${up?'Have an account? Login':'Create account'}</a><a href="#" id="a2">${fp?'Back to login':'Forgot password?'}</a></div></div>`;
$('#a1').onclick=e=>{e.preventDefault();auth('',up?'in':'up')};$('#a2').onclick=e=>{e.preventDefault();auth('',fp?'in':'fp')};
$('#go').onclick=async()=>{const em=$('#e').value.trim(),pw=$('#p')?.value,nm=$('#n')?.value.trim(),m=$('#m');m.className='err';m.textContent='';
if(!em||(!fp&&(!pw||pw.length<6))||(up&&!nm))return m.textContent='Please fill all fields (password min 6 characters).';
$('#go').disabled=true;try{
if(fp){const{error}=await sb.auth.resetPasswordForEmail(em,{redirectTo:location.origin+location.pathname});m.className=error?'err':'ok';m.textContent=error?error.message:'Reset link sent. Check your email.';return}
if(up){const{data,error}=await sb.auth.signUp({email:em,password:pw,options:{data:{full_name:nm,app_name:APP_NAME}}});if(error)return m.textContent=error.message;
if(data.session)return enter(data.user);return auth('Account created. Confirm your email, then login.')}
const{data,error}=await sb.auth.signInWithPassword({email:em,password:pw});if(error)return m.textContent=error.message;enter(data.user)}finally{const g=$('#go');if(g)g.disabled=false}}}
function newPass(){if(!sb)return;const p=prompt('Enter your new password (min 6 characters)');if(p&&p.length>=6)sb.auth.updateUser({password:p}).then(r=>alert(r.error?r.error.message:'Password updated.'))}
async function logout(){clearInterval(timer);if(sb)await sb.auth.signOut();U=null;auth('You have been logged out.')}
async function sync(){if(!sb||!U.id)return;const p=LS(key('pend'))||[],rest=[];for(const r of p){const{error}=await sb.from('results').insert(r);if(error)rest.push(r)}LS(key('pend'),rest)}
/* ---------- home ---------- */
function home(){clearInterval(timer);hdr();
app.innerHTML=`<div class="card"><h2>Welcome, ${esc(U.name)} 👋</h2><p>Cygna BCH203 Quiz<br><small>Biochemistry 203 - Biochemistry · ${QUESTIONS.length} questions</small></p>${U.admin?'<a class="btn" href="admin.html">Admin Dashboard</a>':''}<button class="btn alt" onclick="scores()">My Scores</button></div>
<div class="card"><h3>1. Select topics</h3><button class="btn alt" onclick="selAll(1)">Select All</button><button class="btn alt" onclick="selAll(0)">Clear All</button>
${TOPICS.map((t,k)=>`<label class="tp"><input type="checkbox" ${st.sel.has(t)?'checked':''} onchange="tg(${k})"><span>${esc(t)} (${cnt(t)} questions)</span></label>`).join('')}</div>
<div class="card"><h3>2. Mode</h3><select id="md"><option value="practice">Practice - answer + explanation at once, no timer</option><option value="exam">Exam - timer on, answers at the end</option><option value="timed">Track / Timed - 60 seconds per question</option></select>
<h3>3. Number of questions</h3><select id="nq">${['10','20','30','50','100','All'].map(n=>`<option>${n}</option>`).join('')}</select><button class="btn" onclick="start()">Start Quiz</button><p class="err" id="hm"></p></div>`;
$('#md').value=st.mode;$('#nq').value=st.n}
function tg(k){const t=TOPICS[k];st.sel.has(t)?st.sel.delete(t):st.sel.add(t)}
function selAll(f){st.sel=new Set(f?TOPICS:[]);home()}
/* ---------- quiz ---------- */
function start(re){if(!re){st.mode=$('#md').value;st.n=$('#nq').value}
if(!st.sel.size)return $('#hm').textContent='Select at least one topic.';
mode=st.mode;const want=st.n==='All'?1e9:+st.n;let pool=QUESTIONS.filter(q=>st.sel.has(q.topic)),fresh=pool.filter(q=>!seen.has(q.question));
if(fresh.length<Math.min(want,pool.length)){pool.forEach(q=>seen.delete(q.question));fresh=pool}
fresh=sh(fresh).slice(0,want);
Q=fresh.map(q=>{const o=sh(q.options.map((t,k)=>({t,c:k===q.correct})));return{...q,opts:o.map(x=>x.t),ans:o.findIndex(x=>x.c)}});Q.forEach(q=>seen.add(q.question));
A=Q.map(()=>null);i=0;used=0;paused=false;left=mode==='exam'?Math.max(60,Q.length*45):60;clearInterval(timer);if(mode!=='practice')timer=setInterval(tick,1000);show()}
function tick(){if(paused)return;used++;left--;
if(left<=0){if(mode==='timed'&&i<Q.length-1){i++;left=60;return show()}return finish()}
const t=$('#tm');if(t)t.textContent='⏱ '+fmt(left)}
function show(){const q=Q[i],a=A[i],lock=mode==='practice'&&a!==null;
app.innerHTML=`<div class="card"><div class="row"><b>Question ${i+1} / ${Q.length}</b><span id="tm">${mode==='practice'?'No timer':'⏱ '+fmt(left)}</span>${mode!=='practice'?`<button class="btn alt" onclick="pz()">${paused?'▶ Resume':'⏸ Pause'}</button>`:''}</div><div class="bar"><b style="width:${(i+1)/Q.length*100}%"></b></div><small>${esc(mode)} mode · ${esc(q.topic)} · ${esc(q.difficulty)}</small></div>
<div class="card"><h3>${esc(q.question)}</h3>${paused?'<p>Paused. Tap Resume to continue.</p>':q.opts.map((o,k)=>`<button class="opt ${lock?(k===q.ans?'ok':k===a?'bad':''):(a===k?'sel':'')}" ${lock?'disabled':''} onclick="pick(${k})"><b>${L[k]}.</b> ${esc(o)}</button>`).join('')}
${lock?`<p><b>${a===q.ans?'✅ Correct!':'❌ Wrong. Correct answer: '+L[q.ans]+'. '+esc(q.opts[q.ans])}</b><br>${esc(q.explanation)}<br><small>Source: ${esc(q.source)}</small></p>`:''}</div>
<div class="row"><button class="btn alt" onclick="nav(-1)" ${i?'':'disabled'}>◀ Previous</button><button class="btn alt" onclick="nav(1)" ${i<Q.length-1?'':'disabled'}>Skip</button><button class="btn" onclick="nav(1)" ${i<Q.length-1?'':'disabled'}>Next ▶</button><button class="btn red" onclick="if(confirm('Submit quiz now?'))finish()">Submit</button></div>
<p><button class="btn alt" onclick="if(confirm('Exit quiz? Progress will be lost.')){clearInterval(timer);home()}">Exit</button></p>`}
function pz(){paused=!paused;show()}
function pick(k){if(paused||(mode==='practice'&&A[i]!==null))return;A[i]=k;show()}
function nav(d){i=Math.max(0,Math.min(Q.length-1,i+d));if(mode==='timed')left=60;show()}
const grade=p=>p>=70?'A':p>=60?'B':p>=50?'C':p>=45?'D':'F';
async function finish(){clearInterval(timer);const tot=Q.length,c=A.filter((a,k)=>a===Q[k].ans).length,sk=A.filter(a=>a===null).length,pc=Math.round(c/tot*100);
const r={id:Date.now(),date:new Date().toISOString(),topics:[...new Set(Q.map(q=>q.topic))].join(', '),mode,score:c,total_questions:tot,percentage:pc,grade:grade(pc),pass_fail:pc>=50?'Pass':'Fail',time_used:fmt(used)};
const h=LS(key('hist'))||[];h.unshift(r);LS(key('hist'),h);
const ts=LS(key('ts'))||{};Q.forEach((q,k)=>{ts[q.topic]=ts[q.topic]||{c:0,t:0};ts[q.topic].t++;if(A[k]===q.ans)ts[q.topic].c++});LS(key('ts'),ts);
app.innerHTML=`<div class="card" style="text-align:center"><h2>Result</h2><div class="ring" style="background:conic-gradient(var(--pr) ${pc}%,var(--bd) 0)"><div>${pc}%</div></div><h3>${c} / ${tot} · Grade ${r.grade} · <span class="${pc>=50?'ok':'err'}">${r.pass_fail}</span></h3><p>✅ Correct ${c} · ❌ Wrong ${tot-c-sk} · ⏭ Skipped ${sk} · ⏱ ${r.time_used}</p><p id="sv"><small>Saving…</small></p>
<button class="btn" onclick="start(1)">Retake</button><button class="btn alt" onclick="home()">New Quiz</button><button class="btn alt" onclick="home()">Go Home</button></div><h3>Review</h3>
${Q.map((q,k)=>`<div class="card"><b>${k+1}. ${esc(q.question)}</b><p>Your answer: ${A[k]===null?'<i>Skipped</i>':`<span class="${A[k]===q.ans?'ok':'err'}">${L[A[k]]}. ${esc(q.opts[A[k]])}</span>`}<br>Correct: <span class="ok">${L[q.ans]}. ${esc(q.opts[q.ans])}</span></p><small>${esc(q.explanation)} (${esc(q.source)})</small></div>`).join('')}`;
if(sb&&U.id){const row={user_id:U.id,full_name:U.name,email:U.email,app_name:APP_NAME,topics:r.topics,mode,score:c,total_questions:tot,percentage:pc,grade:r.grade,pass_fail:r.pass_fail,time_used:r.time_used};
const{error}=await sb.from('results').insert(row);if(error){const p=LS(key('pend'))||[];p.push(row);LS(key('pend'),p)}const s=$('#sv');if(s)s.innerHTML=error?'<small class="err">Saved on this device. Will sync to Supabase later.</small>':'<small class="ok">Saved to Supabase and this device.</small>'}}
/* ---------- scores ---------- */
function scores(){hdr();const h=LS(key('hist'))||[],ts=LS(key('ts'))||{},n=h.length,avg=n?Math.round(h.reduce((s,x)=>s+x.percentage,0)/n):0;
app.innerHTML=`<div class="card"><h2>My Scores</h2><div class="stats"><div><b>${n}</b>Quizzes</div><div><b>${avg}%</b>Average</div><div><b>${n?Math.max(...h.map(x=>x.percentage)):0}%</b>Best</div><div><b>${n?h[0].percentage:0}%</b>Last</div></div></div>
<div class="card"><h3>Topic progress (weak vs strong)</h3>${TOPICS.map(t=>{const s=ts[t],p=s?Math.round(s.c/s.t*100):0;return`<div>${esc(t)}: <b>${p}%</b> ${s?(p>=70?'💪 strong':p<50?'⚠ weak':'👍 fair'):'<small>(not attempted)</small>'}</div><div class="bar"><b style="width:${p}%"></b></div>`}).join('')}</div>
<div class="card wrap"><h3>History</h3><table><tr><th>Date</th><th>Topics</th><th>Mode</th><th>Score</th><th>Total</th><th>Time</th></tr>${h.map(x=>`<tr><td>${new Date(x.date).toLocaleString()}</td><td>${esc(x.topics)}</td><td>${x.mode}</td><td>${x.score} (${x.percentage}%)</td><td>${x.total_questions}</td><td>${x.time_used}</td></tr>`).join('')||'<tr><td colspan="6">No quizzes yet.</td></tr>'}</table>
<button class="btn red" onclick="if(confirm('Clear history on this device?')){LS(key('hist'),[]);LS(key('ts'),{});scores()}">Clear History</button><button class="btn alt" onclick="home()">Back</button></div>`}
boot();
