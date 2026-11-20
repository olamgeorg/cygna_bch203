const APP_NAME="cygna_bch203",ADMIN_NAME="Olamide George",ADMIN_EMAIL="olamgeorg9@gmail.com";
const app=document.getElementById('app'),$=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const T=[...new Set(QUESTIONS.map(q=>q.topic))];let P=[],R=[];
(async()=>{try{const t=JSON.parse(localStorage.getItem('theme')||'{}');document.documentElement.dataset.theme=t.t||'light'}catch(e){}
await window.cfgReady;if(!sb)return location.replace('index.html');
const{data}=await sb.auth.getSession(),u=data.session&&data.session.user;
if(!u||u.email.toLowerCase()!==ADMIN_EMAIL.toLowerCase())return location.replace('index.html');load()})();
async function load(){const a=await sb.from('profiles').select('*').eq('app_name',APP_NAME),b=await sb.from('results').select('*').eq('app_name',APP_NAME).order('created_at',{ascending:false});
if(a.error||b.error)app.innerHTML='<div class="card err">Could not load data: '+esc((a.error||b.error).message)+'. Did you run supabase.sql?</div>';P=a.data||[];R=b.data||[];draw()}
async function lo(){await sb.auth.signOut();location.replace('index.html')}
function draw(){const stu=P.filter(p=>p.role!=='admin'&&p.email.toLowerCase()!==ADMIN_EMAIL.toLowerCase());
app.innerHTML=`<div class="card"><h2>Welcome, ${ADMIN_NAME}</h2><div class="stats"><div><b>${stu.length}</b>Students registered</div><div><b>${R.length}</b>Quizzes taken</div></div></div>
<div class="card"><input id="s" placeholder="Search name / email"><select id="sf"><option value="">All students</option>${stu.map(p=>`<option value="${esc(p.email)}">${esc(p.full_name)} (${esc(p.email)})</option>`).join('')}</select><select id="ft"><option value="">All topics</option>${T.map(t=>`<option>${esc(t)}</option>`).join('')}</select><select id="fm"><option value="">All modes</option><option>practice</option><option>exam</option><option>timed</option></select><input id="fd" type="date"><button class="btn" onclick="csv()">Export CSV</button></div>
<div class="card" id="wk"></div><div class="card wrap"><h3>Students</h3><table id="st"></table></div><div class="card wrap"><h3>All scores</h3><table id="sc"></table></div>`;
['s','sf','ft','fm','fd'].forEach(x=>{$('#'+x).oninput=rows;$('#'+x).onchange=rows});rows()}
function fl(){const s=$('#s').value.toLowerCase(),e=$('#sf').value,t=$('#ft').value,m=$('#fm').value,d=$('#fd').value;
return R.filter(r=>(!s||((r.full_name||'')+(r.email||'')).toLowerCase().includes(s))&&(!e||r.email===e)&&(!t||(r.topics||'').includes(t))&&(!m||r.mode===m)&&(!d||(r.created_at||'').startsWith(d)))}
function rows(){const s=$('#s').value.toLowerCase(),f=fl();
$('#st').innerHTML='<tr><th>Name</th><th>Email</th><th>Date joined</th><th></th></tr>'+P.filter(p=>!s||((p.full_name||'')+p.email).toLowerCase().includes(s)).map(p=>`<tr><td>${esc(p.full_name)}</td><td>${esc(p.email)}</td><td>${new Date(p.created_at).toLocaleDateString()}</td><td><button class="btn red" onclick="dS('${p.id}')">Delete</button></td></tr>`).join('');
$('#sc').innerHTML='<tr><th>Name</th><th>Email</th><th>Topics</th><th>Mode</th><th>Score</th><th>%</th><th>Grade</th><th>Date</th><th>Time</th><th></th></tr>'+f.map(r=>`<tr><td>${esc(r.full_name)}</td><td>${esc(r.email)}</td><td>${esc(r.topics)}</td><td>${esc(r.mode)}</td><td>${r.score}/${r.total_questions}</td><td>${r.percentage}</td><td>${esc(r.grade)}</td><td>${new Date(r.created_at).toLocaleString()}</td><td>${esc(r.time_used)}</td><td><button class="btn red" onclick="dR('${r.id}')">X</button></td></tr>`).join('');
const m={};f.forEach(r=>(r.topics||'').split(', ').forEach(t=>{if(t)(m[t]=m[t]||[]).push(r.percentage)}));
const who=$('#sf').value||'all students';$('#wk').innerHTML=`<h3>Weak vs strong topics (${esc(who)})</h3>`+(Object.entries(m).map(([t,a])=>{const p=Math.round(a.reduce((x,y)=>x+y,0)/a.length);return`<div>${esc(t)}: <b>${p}%</b> ${p>=70?'💪 strong':p<50?'⚠ weak':'👍 fair'}</div><div class="bar"><b style="width:${p}%"></b></div>`}).join('')||'No data.')}
async function dR(id){if(confirm('Delete this score?')){await sb.from('results').delete().eq('id',id).eq('app_name',APP_NAME);load()}}
async function dS(id){if(confirm('Delete this student and all their scores?')){await sb.from('results').delete().eq('user_id',id).eq('app_name',APP_NAME);await sb.from('profiles').delete().eq('id',id).eq('app_name',APP_NAME);load()}}
function csv(){const f=fl(),h=['full_name','email','topics','mode','score','total_questions','percentage','grade','pass_fail','time_used','created_at'],q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const b=new Blob([[h.join(','),...f.map(r=>h.map(k=>q(r[k])).join(','))].join('\n')],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='cygna_bch203_scores.csv';a.click()}
