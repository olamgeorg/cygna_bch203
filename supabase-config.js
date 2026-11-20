/* No keys here. Keys come from Vercel Environment Variables through /api/config. */
window.sb=null;
window.cfgReady=(async()=>{let c={};
try{const r=await fetch('/api/config');if(r.ok)c=await r.json()}catch(e){}
c.url=c.url||localStorage.getItem('sb_url');c.key=c.key||localStorage.getItem('sb_key');
if(!c.url||!c.key){if(location.protocol==='file:'||location.hostname==='localhost'){c.url=prompt('Supabase URL (leave empty for offline demo)');c.key=c.url&&prompt('Supabase anon/publishable key');if(c.url&&c.key){localStorage.setItem('sb_url',c.url);localStorage.setItem('sb_key',c.key)}}}
if(c.url&&c.key&&window.supabase)window.sb=window.supabase.createClient(c.url,c.key)})();
