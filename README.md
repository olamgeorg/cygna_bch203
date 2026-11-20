# cygna_bch203 - Cygna BCH203 Quiz
© cygna.co - cygna.consult · 201 questions from the lecturer notes · HTML + CSS + JS only (no npm, no build).

## Files (upload ALL, delete any old ones first)
index.html, style.css, app.js, questions.js, supabase-config.js, admin.html, admin.js, manifest.json, sw.js, supabase.sql, README.md and the folder `api/` (config.js).

## 1. Supabase
1. supabase.com > New project (wait until ready).
2. SQL Editor > New query > open `supabase.sql`, paste everything > Run.
3. Project Settings > API: copy **Project URL** and **anon / publishable key**.
4. Authentication > URL Configuration: set Site URL to your Vercel link (needed for Forgot password).
5. Authentication > Providers > Email: for quick testing you may turn off "Confirm email".

## 2. GitHub
1. github.com > New repository > name `cygna_bch203` > Create.
2. Delete old files if the repo already has some (open file > trash icon > commit).
3. Add file > Upload files > drag all files AND the `api` folder > Commit.

## 3. Vercel
1. vercel.com > Add New > Project > import the repo > Framework Preset: Other > Deploy.
2. Environment variables are OPTIONAL: your Supabase URL and publishable key are already built into `supabase-config.js` (the publishable key is public by design). Never put a secret/service_role key in GitHub.
3. Deployments > latest > Redeploy. Open the link: the app is live and installable (Install App button).

## 4. Admin
Sign up with Name `Olamide George`, Email `olamgeorg9@gmail.com`, any password, then Login. An **Admin** button appears in the top bar. Only this email can open admin.html (students are sent back to index.html). Login/Logout are always in the top bar.

## Notes
- Students must sign up and login (Name, Email, Password). Forgot password sends a reset email.
- Results save to Supabase and localStorage. Admin sees only `app_name = cygna_bch203`.
- Delete student removes profile and scores (the login record itself must be removed in Supabase > Authentication > Users).
- If keys are missing, the app shows a "Connect to Supabase" screen.
