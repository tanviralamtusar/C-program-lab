# C Practice Lab (CSE103)

A step-by-step C learning and practice site built from the CSE103 course materials.

## Open it
Double-click `index.html` (works from disk), or serve the folder:

```
python -m http.server 8765    # then open http://127.0.0.1:8765
```

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

Progress, saved code and files are stored in the browser (localStorage).

## Editing content
Lessons live in `content/*.md` (format: `content/FORMAT.md`). After editing, rebuild and verify:

```
node tools/build.js
```

This regenerates `js/data/content.js` and runs every example and reference solution through the interpreter.
Problems are written to `tools/verify-report.json`.
To run a single program: `node tools/crun.js prog.c [input.txt] [--trace]`.

## Deploy
The site is fully static (no server needed), so any static host works.

- **Coolify** (or any Docker host): the repo has a `Dockerfile` that rebuilds and verifies the content, then
  serves the site with nginx on port 80.
  1. In Coolify: *+ New → Public Repository* (or *Private Repository (with GitHub App)*) and enter the repo URL.
  2. Branch `main`, **Build Pack: Dockerfile**, **Ports Exposes: `80`**.
  3. Set your domain under *Domains* (e.g. `https://c.example.com`); Coolify issues the HTTPS certificate.
  4. Click *Deploy*. Turn on *Auto Deploy* (webhook) to redeploy on every push.

  To try the image locally: `docker build -t c-lab . && docker run -p 8080:80 c-lab`, then open http://localhost:8080.

- **GitHub Pages** (set up): in the repo go to *Settings → Pages → Source* and pick **GitHub Actions**.
  Every push to `main` runs `.github/workflows/deploy.yml`, which rebuilds and verifies the content
  (the deploy stops if any example or solution fails) and publishes `index.html`, `css/` and `js/`.
  The site appears at `https://<user>.github.io/<repo>/`.
- **Netlify / Vercel / Cloudflare Pages**: import the repo with no build command and the repo root as the
  output directory (`netlify.toml` already says this). `js/data/content.js` is committed, so no build is needed;
  remember to run `node tools/build.js` and commit after editing content.
