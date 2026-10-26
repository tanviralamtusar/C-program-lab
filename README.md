# PractLab (CSE103)

A step-by-step C learning and practice site built from the CSE103 course materials.

## Open it
Run the server (Node 18+, no `npm install` needed), then open http://localhost:8765:

```
node server.js
```

You can also double-click `index.html` or serve the folder with any static server; everything works that way,
accounts included (they talk to Supabase directly).

An internet connection is needed once for fonts, the code editor (CodeMirror) and the flowchart layout (dagre).
Without them the site still works, using a plain editor.

## What's inside
- **Learn**: 15 lessons with 124 steps, runnable examples and predict-the-output quizzes.
- **Practice**: 210 problems from the task sheet, the Aptech practice set and the lab manual, with an auto-judge.
- **Mock tests**: Class Test 1–3, a Midterm and a Final, all timed and exam-style with new problems
  (`content/tests/*.md`, format in `content/tests/TESTS-FORMAT.md`). Each mixes trace-the-output and
  find-the-bug questions with coding problems that get partial marks per hidden test, then shows a review.
- **Playground**: free coding, stdin input, and virtual files for `fopen`.
- **Visualizer** (👁 button everywhere): step forwards and backwards through stack frames, arrays and 2D grids,
  structs, pointer arrows, the heap (malloc/free), output and input consumption, plus a generated **flowchart**
  that highlights the current step.

The C interpreter runs entirely in the browser (`js/c/`). It reports beginner mistakes clearly:
out-of-bounds indexes, a missing `&` in scanf, `%d` used with a double, integer division into a float,
NULL or dangling pointers, use-after-free, missing semicolons, and so on.

Progress, saved code and files are stored in the browser (localStorage). Students can also **create an account**
(email + password) so their lesson steps, quizzes, solved problems, saved code and tests sync to the cloud and
follow them to any device. When someone logs in, the progress already in that browser is merged into the account;
logging out clears it from the browser. There is a *Forgot password?* link that emails a reset link, and
*Edit profile* in the account box sets a name, student ID, section and a new password (stored in the account's
Supabase `user_metadata`; display only).

Accounts use **Supabase** (project `hbxrlyvmfrhhoreztrla`; the URL and publishable key are at the top of the
accounts section in `js/app.js`). The browser talks to Supabase directly, so this works on any host.
- Supabase Auth stores the passwords. Sign-up sends a confirmation email; the link brings the student back to the
  site already logged in. Reset links work the same way and open a *Choose a new password* box.
- Each student's progress is one row in `public.progress`, protected by row-level security.
  `public.save_progress(data, base)` refuses a save based on an outdated version, so two devices never overwrite
  each other (the browser merges and retries). The schema is in `supabase/migrations/`.

Supabase dashboard settings the emails depend on:
- **Authentication → URL Configuration**: set *Site URL* to the live site (e.g. `https://c.example.com`) and add it
  under *Redirect URLs*; otherwise email links send people to `localhost`.
- **Authentication → Emails → SMTP Settings**: Supabase's built-in mailer only delivers to your project's team
  members and a few emails per hour. Add your own SMTP (Resend, Brevo, Gmail, …) before students sign up.

## Editing content
Lessons live in `content/*.md` (format: `content/FORMAT.md`). After editing, rebuild and verify:

```
node tools/build.js
```

This regenerates `js/data/content.js` and runs every example and reference solution through the interpreter.
Problems are written to `tools/verify-report.json`.
To run a single program: `node tools/crun.js prog.c [input.txt] [--trace]`.

## Deploy
The site is static (accounts live in Supabase), so the Docker image and every static host below work the same.

- **Coolify** (or any Docker host): the repo has a `Dockerfile` that rebuilds and verifies the content, then
  runs `server.js` on port 80.
  1. In Coolify: *+ New → Public Repository* (or *Private Repository (with GitHub App)*) and enter the repo URL.
  2. Branch `main`, **Build Pack: Dockerfile**, **Ports Exposes: `80`**.
  3. Set your domain under *Domains* (e.g. `https://c.example.com`); Coolify issues the HTTPS certificate.
  4. Click *Deploy*. Turn on *Auto Deploy* (webhook) to redeploy on every push.

  To try the image locally: `docker build -t practlab . && docker run -p 8080:80 practlab`, then open http://localhost:8080.

- **GitHub Pages** (set up): in the repo go to *Settings → Pages → Source* and pick **GitHub Actions**.
  Every push to `main` runs `.github/workflows/deploy.yml`, which rebuilds and verifies the content
  (the deploy stops if any example or solution fails) and publishes `index.html`, `css/` and `js/`.
  The site appears at `https://<user>.github.io/<repo>/`.
- **Netlify / Vercel / Cloudflare Pages**: import the repo with no build command and the repo root as the
  output directory (`netlify.toml` already says this). `js/data/content.js` is committed, so no build is needed;
  remember to run `node tools/build.js` and commit after editing content.
