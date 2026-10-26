# C Practice Lab (CSE103)

A step-by-step C learning and practice site built from the CSE103 course materials.

## Open it
Run the server (Node 18+, no `npm install` needed), then open http://localhost:8765:

```
node server.js
```

You can also double-click `index.html` or serve the folder with any static server. Everything works that way
except accounts: the **Log in** button only appears when `server.js` is running.

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
(username + password) so their lesson steps, quizzes, solved problems, saved code and tests sync to the server and
follow them to any device. When someone logs in, the progress already in that browser is merged into the account;
logging out clears it from the browser.

Accounts are handled by `server.js` with no dependencies: passwords are hashed with scrypt, sessions are signed
HttpOnly cookies, and data is kept as JSON files in `DATA_DIR` (default `./data`; `users.json`, `progress/<id>.json`,
and a generated `secret` that signs sessions). Back up that folder to keep accounts.

## Editing content
Lessons live in `content/*.md` (format: `content/FORMAT.md`). After editing, rebuild and verify:

```
node tools/build.js
```

This regenerates `js/data/content.js` and runs every example and reference solution through the interpreter.
Problems are written to `tools/verify-report.json`.
To run a single program: `node tools/crun.js prog.c [input.txt] [--trace]`.

## Deploy
Use the Docker image (Coolify) to get accounts. The site itself is static, so any static host also works, just without the Log in button.

- **Coolify** (or any Docker host): the repo has a `Dockerfile` that rebuilds and verifies the content, then
  runs `server.js` on port 80 (site + account API).
  1. In Coolify: *+ New → Public Repository* (or *Private Repository (with GitHub App)*) and enter the repo URL.
  2. Branch `main`, **Build Pack: Dockerfile**, **Ports Exposes: `80`**.
  3. Under *Persistent Storage* add a volume with **destination path `/data`**. Without it, accounts and progress
     are lost on every redeploy.
  4. Set your domain under *Domains* (e.g. `https://c.example.com`); Coolify issues the HTTPS certificate.
  5. Click *Deploy*. Turn on *Auto Deploy* (webhook) to redeploy on every push.

  To try the image locally: `docker build -t c-lab . && docker run -p 8080:80 -v clab-data:/data c-lab`, then open http://localhost:8080.

- **GitHub Pages** (set up): in the repo go to *Settings → Pages → Source* and pick **GitHub Actions**.
  Every push to `main` runs `.github/workflows/deploy.yml`, which rebuilds and verifies the content
  (the deploy stops if any example or solution fails) and publishes `index.html`, `css/` and `js/`.
  The site appears at `https://<user>.github.io/<repo>/`.
- **Netlify / Vercel / Cloudflare Pages**: import the repo with no build command and the repo root as the
  output directory (`netlify.toml` already says this). `js/data/content.js` is committed, so no build is needed;
  remember to run `node tools/build.js` and commit after editing content.
