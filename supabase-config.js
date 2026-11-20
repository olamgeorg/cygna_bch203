/* Publishable (public) Supabase key: safe in GitHub. Vercel env vars (via /api/config) override these if set. */
const SUPABASE_URL_DEFAULT="https://otldatnfyvonnfizmxce.supabase.co";
const SUPABASE_KEY_DEFAULT="sb_publishable_2APp_m8dzG_D3jByrIZsiA_JJxYQX2F";
window.sb=null;
window.cfgReady=(async()=>{let c={};
try{const r=await fetch('/api/config');if(r.ok)c=await r.json()}catch(e){}
c.url=c.url||localStorage.getItem('sb_url')||SUPABASE_URL_DEFAULT;c.key=c.key||localStorage.getItem('sb_key')||SUPABASE_KEY_DEFAULT;
if(c.url&&c.key&&window.supabase)window.sb=window.supabase.createClient(c.url,c.key)})();
