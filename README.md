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
