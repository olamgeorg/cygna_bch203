const APP_NAME="cygna_bch203",ADMIN_NAME="Olamide George",ADMIN_EMAIL="olamgeorg9@gmail.com";
const app=document.getElementById('app'),$=s=>document.querySelector(s);let P=[],R=[];
(async()=>{await window.cfgReady;if(!sb)return location.replace('index.html');
const{data}=await sb.auth.getSession(),u=data.session?.user;if(!u||u.email.toLowerCase()!==ADMIN_EMAIL.toLowerCase())return location.replace('index.html');load()})();
async function load(){const a=await sb.from('profiles').select('*').eq('app_name',APP_NAME),b=await sb.from('results').select('*').eq('app_name',APP_NAME).order('created_at',{ascending:false});P=a.data||[];R=b.data||[];draw()}
const T=[...new Set(QUESTIONS.map(q=>q.topic))];
function draw(){app.innerHTML=`<div class="card"><h2>Welcome, ${ADMIN_NAME}</h2><p>Students: <b>${P.filter(p=>p.role!=='admin').length}</b> · Quizzes taken: <b>${R.length}</b></p></div>
<div class="card"><input id="s" placeholder="Search name / email"><select id="ft"><option value="">All topics</option>${T.map(t=>`<option>${t}</option>`).join('')}</select><select id="fm"><option value="">All modes</option><option>practice</option><option>exam</option><option>timed</option></select><input id="fd" type="date"><button class="btn" onclick="csv()">Export CSV</button></div>
<div class="card wrap"><h3>Students</h3><table id="st"></table></div><div class="card wrap"><h3>Scores</h3><table id="sc"></table></div><div class="card" id="wk"></div>`;
['s','ft','fm','fd'].forEach(x=>$('#'+x).oninput=rows);rows()}
function fl(){const s=$('#s').value.toLowerCase(),t=$('#ft').value,m=$('#fm').value,d=$('#fd').value;return R.filter(r=>(!s||(r.full_name+r.email).toLowerCase().includes(s))&&(!t||r.topics.includes(t))&&(!m||r.mode===m)&&(!d||r.created_at.startsWith(d)))}
function rows(){const s=$('#s').value.toLowerCase(),f=fl();
$('#st').innerHTML='<tr><th>Name</th><th>Email</th><th>Joined</th><th></th></tr>'+P.filter(p=>!s||(p.full_name+p.email).toLowerCase().includes(s)).map(p=>`<tr><td>${p.full_name}</td><td>${p.email}</td><td>${new Date(p.created_at).toLocaleDateString()}</td><td><button class="btn red" onclick="dS('${p.id}')">Delete</button></td></tr>`).join('');
$('#sc').innerHTML='<tr><th>Name</th><th>Email</th><th>Topics</th><th>Mode</th><th>Score</th><th>%</th><th>Grade</th><th>Date</th><th>Time</th><th></th></tr>'+f.map(r=>`<tr><td>${r.full_name}</td><td>${r.email}</td><td>${r.topics}</td><td>${r.mode}</td><td>${r.score}/${r.total_questions}</td><td>${r.percentage}</td><td>${r.grade}</td><td>${new Date(r.created_at).toLocaleString()}</td><td>${r.time_used}</td><td><button class="btn red" onclick="dR('${r.id}')">X</button></td></tr>`).join('');
const m={};f.forEach(r=>r.topics.split(', ').forEach(t=>(m[t]=m[t]||[]).push(r.percentage)));
$('#wk').innerHTML='<h3>Weak vs strong topics (average % of shown results)</h3>'+Object.entries(m).map(([t,a])=>{const p=Math.round(a.reduce((x,y)=>x+y,0)/a.length);return`<p>${t}: ${p}% ${p>=70?'💪 strong':p<50?'⚠ weak':''}</p><div class="bar"><b style="width:${p}%"></b></div>`}).join('')}
window.dR=async id=>{if(confirm('Delete score?')){await sb.from('results').delete().eq('id',id).eq('app_name',APP_NAME);load()}};
window.dS=async id=>{if(confirm('Delete student and their scores?')){await sb.from('results').delete().eq('user_id',id).eq('app_name',APP_NAME);await sb.from('profiles').delete().eq('id',id).eq('app_name',APP_NAME);load()}};
window.csv=()=>{const f=fl(),h=['full_name','email','topics','mode','score','total_questions','percentage','grade','pass_fail','time_used','created_at'],q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const b=new Blob([[h.join(','),...f.map(r=>h.map(k=>q(r[k])).join(','))].join('\n')],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='cygna_bch203_scores.csv';a.click()};
