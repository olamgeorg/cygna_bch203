# cygna_bch203 - Cygna BCH203 Quiz (© cygna.co - cygna.consult)
Static PWA: HTML + CSS + Vanilla JS. No npm, no build. `api/config.js` is a tiny Vercel function that hands your env vars to the app (a static site cannot read env vars otherwise).

## 1. Supabase
1. supabase.com > New project. 2. SQL Editor > New query > paste `supabase.sql` > Run.
3. Project Settings > API: copy **Project URL** and the **anon / publishable key**.
4. Authentication > URL Configuration: set Site URL to your Vercel link (needed for password reset).

## 2. GitHub
New repository `cygna_bch203` > Add file > Upload files > drag ALL files and the `api` folder > Commit. Never put keys in files.

## 3. Vercel
Add New > Project > import the repo > Framework: Other > Deploy. Then Settings > Environment Variables add:
`SUPABASE_URL` = Project URL, `SUPABASE_ANON_KEY` = anon/publishable key. Deployments > Redeploy.

## 4. Admin
Sign up with Name `Olamide George`, Email `olamgeorg9@gmail.com`, then login and tap "Admin Dashboard" (admin.html). Only that email can open it; the SQL policies also enforce this.

## Local test
Opening index.html from disk asks for the URL/key once (stored only in your browser) or runs an offline demo if left empty.
Add more questions by adding rows to `questions.js`.
