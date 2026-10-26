/* C Practice Lab — single-page app: home, lessons, practice problems, playground. */
(function () {
  'use strict';
  var COURSE = window.COURSE || { lessons: [] };
  var LESSONS = COURSE.lessons;
  var PROBLEMS = [];
  LESSONS.forEach(function (L) { L.problems.forEach(function (p) { p.lessonTitle = L.title; PROBLEMS.push(p); }); });
  var PROB = {}; PROBLEMS.forEach(function (p) { PROB[p.id] = p; });
  var LES = {}; LESSONS.forEach(function (L) { LES[L.id] = L; });
  var TESTS = COURSE.tests || [], TST = {};
  TESTS.forEach(function (T) { TST[T.id] = T; T.problems.forEach(function (p) { p.lessonTitle = T.title; p.testId = T.id; PROB[p.id] = p; }); });

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // ---------------------------------------------------------------- storage
  var Store = {
    key: 'clab.v1',
    data: null,
    load: function () {
      try { this.data = JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { this.data = {}; }
      var d = this.data;
      d.steps = d.steps || {}; d.quiz = d.quiz || {}; d.solved = d.solved || {}; d.tried = d.tried || {}; d.code = d.code || {};
      d.files = d.files || { 'data.txt': 'Hello file!\nThis is line 2.\n10 20 30\n' };
      d.playground = d.playground || null;
      d.tests = d.tests || {};
      return d;
    },
    save: function () { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { } }
  };
  var S = Store.load();
  function stepDone(lid, i) { return (S.steps[lid] || []).indexOf(i) >= 0; }
  function markStep(lid, i) { var a = S.steps[lid] || (S.steps[lid] = []); if (a.indexOf(i) < 0) { a.push(i); Store.save(); } }
  function lessonStats(L) {
    var sd = (S.steps[L.id] || []).filter(function (i) { return i < L.steps.length; }).length;
    var ps = L.problems.filter(function (p) { return S.solved[p.id]; }).length;
    return { steps: sd, problems: ps, pct: Math.round(100 * (sd + ps) / Math.max(1, L.steps.length + L.problems.length)) };
  }

  // ---------------------------------------------------------------- theme
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
  }
  try { applyTheme(localStorage.getItem('clab.theme')); } catch (e) { }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('clab.theme', next); } catch (e) { }
    $$('.CodeMirror').forEach(function (c) { if (c.CodeMirror) c.CodeMirror.refresh(); });
  }

  // ---------------------------------------------------------------- editor
  function makeEditor(parent, value, opts) {
    opts = opts || {};
    var api = { cm: null, ta: null, marks: [] };
    if (window.CodeMirror) {
      var cm = CodeMirror(parent, {
        value: value, mode: 'text/x-csrc', lineNumbers: true, indentUnit: 4, tabSize: 4, indentWithTabs: false,
        matchBrackets: true, autoCloseBrackets: true, styleActiveLine: true, readOnly: !!opts.readOnly, viewportMargin: opts.auto ? Infinity : 10,
        gutters: ['cm-errgutter', 'CodeMirror-linenumbers'],
        extraKeys: {
          'Ctrl-Enter': function () { opts.onRun && opts.onRun(); }, 'Cmd-Enter': function () { opts.onRun && opts.onRun(); },
          'Tab': function (c) { if (c.somethingSelected()) c.indentSelection('add'); else c.replaceSelection('    ', 'end'); },
          'Shift-Tab': function (c) { c.indentSelection('subtract'); }
        }
      });
      cm.on('change', function () { api.clearMarks(); opts.onChange && opts.onChange(cm.getValue()); });
      api.cm = cm;
      api.get = function () { return cm.getValue(); };
      api.set = function (v) { cm.setValue(v); };
      api.refresh = function () { cm.refresh(); };
      api.mark = function (line, kind, msg) {
        if (!line) return;
        var l = line - 1;
        cm.addLineClass(l, 'background', kind === 'warn' ? 'cm-warnline' : 'cm-errline');
        var m = document.createElement('span'); m.className = 'cm-gmark ' + kind; m.textContent = kind === 'warn' ? '!' : '✕'; m.title = msg || '';
        cm.setGutterMarker(l, 'cm-errgutter', m);
        api.marks.push(l);
      };
      api.clearMarks = function () {
        api.marks.forEach(function (l) { cm.removeLineClass(l, 'background', 'cm-errline'); cm.removeLineClass(l, 'background', 'cm-warnline'); });
        cm.clearGutter('cm-errgutter'); api.marks = [];
      };
      api.goto = function (line) { cm.focus(); cm.setCursor({ line: line - 1, ch: 0 }); cm.scrollIntoView({ line: line - 1, ch: 0 }, 80); };
    } else {
      var ta = document.createElement('textarea'); ta.className = 'plain-editor'; ta.value = value; ta.spellcheck = false;
      if (opts.readOnly) ta.readOnly = true;
      parent.appendChild(ta);
      ta.addEventListener('input', function () { opts.onChange && opts.onChange(ta.value); });
      ta.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') { e.preventDefault(); var s = ta.selectionStart; ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 4; }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); opts.onRun && opts.onRun(); }
      });
      api.ta = ta;
      api.get = function () { return ta.value; }; api.set = function (v) { ta.value = v; };
      api.refresh = function () { }; api.mark = function () { }; api.clearMarks = function () { };
      api.goto = function (line) { var lines = ta.value.split('\n'), pos = 0; for (var i = 0; i < line - 1; i++) pos += lines[i].length + 1; ta.focus(); ta.setSelectionRange(pos, pos + (lines[line - 1] || '').length); };
    }
    return api;
  }

  // ---------------------------------------------------------------- run result rendering
  // console-style output (OnlineGDB-like): plain program text on black, status lines in green
  function termBox(hint) {
    return '<div class="term"><div class="term-bar"><span class="term-title">console</span></div>' +
      '<div class="io-out term-body">' + termIdle(hint) + '</div></div>';
  }
  function termIdle(hint) { return '<div class="term-dim">' + esc(hint) + '</div>'; }
  function termRunning(withStop) {
    return '<div class="term-dim">Running…' + (withStop ? ' <button class="term-stop stop">Stop</button>' : '') + '</div>';
  }
  function termAt(line) { return line ? '<a href="#" data-line="' + line + '">main.c:' + line + '</a>: ' : 'main.c: '; }
  // compile messages shown above the program output
  function termCompileMsgs(res, editor) {
    var html = '';
    if (res.warnings && res.warnings.length) {
      html += res.warnings.slice(0, 12).map(function (w) { if (editor) editor.mark(w.line, 'warn', w.msg); return '<div class="term-warn">' + termAt(w.line) + '<b>warning:</b> ' + esc(w.msg) + '</div>'; }).join('') + '<div class="term-gap"></div>';
    }
    if (res.compileError) {
      html += '<div class="term-err">' + termAt(res.compileError.line) + '<b>error:</b> ' + esc(res.compileError.message) + '</div>' +
        '<div class="term-gap"></div><div class="term-ok">Compilation failed due to the error above.</div>';
      if (editor) editor.mark(res.compileError.line, 'err', res.compileError.message);
    }
    return html;
  }
  // runtime error or exit line shown below the program output
  function termEnd(res, editor) {
    if (res.error) {
      if (editor && res.error.line) editor.mark(res.error.line, 'err', res.error.message);
      return '<div class="term-err">' + (res.error.kind === 'internal' ? 'Interpreter problem' : 'Runtime error') + (res.error.line ? ' at ' + termAt(res.error.line).replace(/: $/, '') : '') + ': ' + esc(res.error.message) + '</div>';
    }
    return '<div class="term-ok' + (res.exitCode ? ' term-bad' : '') + '">...Program finished with exit code ' + (res.exitCode || 0) + '</div>';
  }
  function termLinks(box, editor) {
    $$('[data-line]', box).forEach(function (a) { a.onclick = function (e) { e.preventDefault(); editor && editor.goto(+a.getAttribute('data-line')); }; });
  }
  function renderTerminal(box, res, editor, opts) {
    var html = termCompileMsgs(res, editor);
    if (!res.compileError) {
      if (res.stdout) html += '<pre class="term-out">' + esc(res.stdout.replace(/\n$/, '')) + '</pre><div class="term-gap"></div>';
      html += termEnd(res, editor);
      if (res.stdinLen != null && res.stdinUsed != null && res.stdinUsed < res.stdinLen && opts.input && /\S/.test(opts.input.slice(res.stdinUsed))) html += '<div class="term-dim">Note: part of the input was never read by the program.</div>';
    }
    box.innerHTML = html;
    termLinks(box, editor);
    box.scrollTop = box.scrollHeight;
  }

  // Interactive console: the program stops with needInput whenever it reads past the typed input;
  // the typed line is appended and the program re-runs from the start (runs are deterministic).
  var TOUCH = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  function makeConsole(host, cfg) {
    var body = $('.term-body', host), stdin = '', typed = [], closed = false, job = null, last = null, state = 'idle', files0 = {};
    function setState(s) { state = s; host.setAttribute('data-state', s); $('.con-stop', host).hidden = !(s === 'running' || s === 'waiting'); $('.con-eof', host).hidden = s !== 'waiting'; }
    function transcript(out) {
      // interleave program output with what was typed, at the output position where each line was asked for
      var html = '', pos = 0;
      typed.forEach(function (t) { var at = Math.min(t.at, out.length); html += esc(out.slice(pos, at)) + '<span class="con-typed">' + esc(t.text) + '</span>\n'; pos = Math.max(pos, at); });
      return html + esc(out.slice(pos));
    }
    function draw(res, slow) {
      var html = termCompileMsgs(res, null), out = res.stdout || '';
      if (!res.compileError) {
        html += '<pre class="term-out">' + transcript(state === 'done' ? out.replace(/\n$/, '') : out);
        if (state === 'waiting') html += '<input class="con-in" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" enterkeyhint="send" aria-label="Program input">';
        html += '</pre>';
        if (slow) html += '<div class="term-dim">Running…</div>';
        if (state === 'done') {
          html += '<div class="term-gap"></div>' + termEnd(res, null);
          if (res.stdinLen != null && res.stdinUsed < res.stdinLen && /\S/.test(stdin.slice(res.stdinUsed))) html += '<div class="term-dim">Note: part of the input was never read by the program.</div>';
          html += '<div class="term-ok">' + (TOUCH ? 'Tap Clear to exit console.' : 'Press ENTER to exit console.') + '</div>';
        }
      }
      body.innerHTML = html;
      termLinks(body, cfg.editor);
      var inp = $('.con-in', body);
      if (inp) {
        inp.onkeydown = function (e) {
          if (e.key === 'Enter') { e.preventDefault(); send(inp.value); }
          else if ((e.key === 'd' || e.key === 'z') && e.ctrlKey) { e.preventDefault(); eof(); }
          else if (e.key === 'c' && e.ctrlKey && !inp.value) { e.preventDefault(); stop(); }
        };
        inp.focus({ preventScroll: true });
      }
      body.scrollTop = body.scrollHeight;
    }
    function eof() { var inp = $('.con-in', body); if (inp && inp.value) send(inp.value, true); else { closed = true; exec(); } }
    function send(line, thenClose) {
      typed.push({ at: (last.stdout || '').length, text: line });
      stdin += line + '\n';
      if (thenClose) closed = true;
      exec();
    }
    function exec() {
      if (job) job.cancel();
      setState('running');
      var slowTimer = setTimeout(function () { if (state === 'running' && last) draw(last, true); else if (state === 'running') body.innerHTML = termRunning(false); }, 350);
      var me = job = Runner.run(cfg.getCode(), { stdin: stdin, files: files0, interactive: true, stdinClosed: closed });
      me.promise.then(function (r) {
        clearTimeout(slowTimer);
        if (job !== me) return;
        job = null; last = r;
        if (cfg.editor) cfg.editor.clearMarks();
        termCompileMsgs(r, cfg.editor);
        if (r.needInput) { setState('waiting'); draw(r); return; }
        setState('done');
        if (r.error && cfg.editor && r.error.line) cfg.editor.mark(r.error.line, 'err', r.error.message);
        draw(r);
        if (cfg.onDone) cfg.onDone(r, stdin);
      });
    }
    function start() {
      stdin = ''; typed = []; closed = false; last = null; files0 = JSON.parse(JSON.stringify(cfg.getFiles ? cfg.getFiles() : {}));
      if (host.getBoundingClientRect().top > window.innerHeight * .6) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
      exec();
    }
    function stop() {
      if (job) { job.cancel(); job = null; }
      if (state !== 'running' && state !== 'waiting') return;
      setState('done');
      body.insertAdjacentHTML('beforeend', '<div class="term-err">^C</div><div class="term-ok">...Program stopped.</div>');
      var inp = $('.con-in', body); if (inp) inp.remove();
    }
    function clear() { setState('idle'); body.innerHTML = termIdle(cfg.hint); }
    // click anywhere in the console to type; Enter after the program finished clears it
    body.addEventListener('mousedown', function (e) { var inp = $('.con-in', body); if (inp && e.target === body) { e.preventDefault(); inp.focus(); } });
    host.addEventListener('keydown', function (e) { if (state === 'done' && e.key === 'Enter' && e.target === host) { e.preventDefault(); clear(); } });
    body.addEventListener('mouseup', function () { if (state === 'done' && !String(window.getSelection())) host.focus({ preventScroll: true }); });
    $('.con-stop', host).onclick = stop;
    $('.con-eof', host).onclick = eof;
    $('.con-clear', host).onclick = function () { if (state === 'running' || state === 'waiting') stop(); clear(); };
    clear();
    return { start: start, stop: stop, focus: function () { host.focus(); } };
  }

  function renderResult(box, res, editor, opts) {
    opts = opts || {};
    var html = '';
    if (editor) editor.clearMarks();
    if (box.classList.contains('term-body')) return renderTerminal(box, res, editor, opts);
    if (res.compileError) {
      html += '<div class="res-err"><div class="res-err-title">Compile error' + (res.compileError.line ? ' on <a href="#" data-line="' + res.compileError.line + '">line ' + res.compileError.line + '</a>' : '') + '</div>' + esc(res.compileError.message) + '</div>';
      if (editor) editor.mark(res.compileError.line, 'err', res.compileError.message);
    } else {
      var out = res.stdout || '';
      html += '<pre class="res-out' + (out ? '' : ' empty') + '">' + (out ? esc(out) : '(no output)') + '</pre>';
      if (res.error) {
        html += '<div class="res-err"><div class="res-err-title">' + (res.error.kind === 'internal' ? 'Problem in the interpreter' : 'Runtime error') + (res.error.line ? ' on <a href="#" data-line="' + res.error.line + '">line ' + res.error.line + '</a>' : '') + '</div>' + esc(res.error.message) + '</div>';
        if (editor && res.error.line) editor.mark(res.error.line, 'err', res.error.message);
      } else if (res.exitCode) html += '<div class="res-note">Program exited with code ' + res.exitCode + '</div>';
      if (res.stdinLen != null && res.stdinUsed != null && res.stdinUsed < res.stdinLen && /\S/.test(opts.input ? opts.input.slice(res.stdinUsed) : 'x') && opts.input) html += '<div class="res-note">Note: part of the input was never read by the program.</div>';
    }
    if (res.warnings && res.warnings.length) {
      html += '<div class="res-warns"><div class="res-warn-title">' + res.warnings.length + ' warning' + (res.warnings.length > 1 ? 's' : '') + '</div><ul>' +
        res.warnings.slice(0, 12).map(function (w) { if (editor) editor.mark(w.line, 'warn', w.msg); return '<li>' + (w.line ? '<a href="#" data-line="' + w.line + '">line ' + w.line + '</a>: ' : '') + esc(w.msg) + '</li>'; }).join('') + '</ul></div>';
    }
    box.innerHTML = html;
    $$('[data-line]', box).forEach(function (a) { a.onclick = function (e) { e.preventDefault(); editor && editor.goto(+a.getAttribute('data-line')); }; });
  }

  // ---------------------------------------------------------------- layout helpers
  var main;
  function setActiveNav(name) {
    $$('.nav a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === name); });
    centerActiveNav();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(centerActiveNav);
  }
  // on phones the nav scrolls sideways; keep the active tab visible
  function centerActiveNav() {
    var nav = $('.nav'), a = nav && $('a.active', nav);
    if (a && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = Math.max(0, a.offsetLeft - nav.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2);
  }
  function diffBadge(d) { return '<span class="badge diff-' + esc(d) + '">' + esc(d) + '</span>'; }
  function progressBar(p) { return '<div class="pbar"><div style="width:' + p + '%"></div></div>'; }
  function codeBlock(code) { return '<pre class="code-block hl"><code>' + Highlight.c(code.replace(/\n$/, '')) + '</code></pre>'; }

  // ---------------------------------------------------------------- pages
  function pageHome() {
    setActiveNav('home');
    var totalSteps = 0, doneSteps = 0;
    LESSONS.forEach(function (L) { totalSteps += L.steps.length; doneSteps += lessonStats(L).steps; });
    var solved = PROBLEMS.filter(function (p) { return S.solved[p.id]; }).length;
    var cont = S.last || '#/learn/' + (LESSONS[0] ? LESSONS[0].id : '') + '/1';
    var html = '<section class="hero"><div class="hero-text">' +
      '<div class="eyebrow">CSE103 · Structured Programming in C</div>' +
      '<h1>Learn C one step at a time — then <em>see</em> it run.</h1>' +
      '<p class="lead">' + LESSONS.length + ' lessons built from your course slides, class notes and lab manual, ' + PROBLEMS.length + ' practice problems from the task sheets with an instant judge, and a visualizer that shows every variable, array, pointer and function call as your program runs.</p>' +
      '<div class="hero-cta"><a class="btn primary lg" href="' + esc(cont) + '">' + (S.last ? 'Continue learning →' : 'Start lesson 1 →') + '</a><a class="btn lg" href="#/practice">Practice problems</a><a class="btn ghost lg" href="#/playground">Open playground</a></div>' +
      '<div class="hero-stats"><div><b>' + doneSteps + '</b>/' + totalSteps + ' steps</div><div><b>' + solved + '</b>/' + PROBLEMS.length + ' problems solved</div></div>' +
      '</div><div class="hero-demo" aria-hidden="true">' + heroDemo() + '</div></section>';
    html += '<section class="how"><div class="how-item"><span class="how-n">1</span><div><b>Read a step</b><p>Short explanations with examples from your course.</p></div></div>' +
      '<div class="how-item"><span class="how-n">2</span><div><b>Run &amp; visualize</b><p>Press Visualize to step through memory or a flowchart.</p></div></div>' +
      '<div class="how-item"><span class="how-n">3</span><div><b>Check yourself</b><p>Predict-the-output quizzes after each step.</p></div></div>' +
      '<div class="how-item"><span class="how-n">4</span><div><b>Practice</b><p>Solve task-sheet problems; the judge checks your output.</p></div></div></section>';
    html += '<h2 class="section-title">Course roadmap</h2><div class="roadmap">';
    LESSONS.forEach(function (L, i) {
      var st = lessonStats(L);
      html += '<article class="topic-card' + (st.pct === 100 ? ' done' : '') + '"><div class="topic-num">' + (i + 1) + '</div><div class="topic-body">' +
        '<h3><a href="#/learn/' + L.id + '/1">' + esc(L.title) + '</a></h3><p>' + esc(L.summary || '') + '</p>' +
        '<div class="topic-meta"><span>' + st.steps + '/' + L.steps.length + ' steps</span><span>' + st.problems + '/' + L.problems.length + ' problems</span></div>' + progressBar(st.pct) +
        '<div class="topic-actions"><a class="btn sm" href="#/learn/' + L.id + '/' + firstUndone(L) + '">' + (st.steps ? 'Continue' : 'Learn') + '</a><a class="btn sm ghost" href="#/practice/' + L.id + '">Practice (' + L.problems.length + ')</a>' + (topicTest(L.id) ? '<a class="btn sm ghost" href="#/test/' + topicTest(L.id).id + '">Test</a>' : '') + '</div>' +
        '</div></article>';
    });
    html += '</div>';
    main.innerHTML = '<div class="page">' + html + '</div>';
    var demo = $('.hero-demo [data-demo]');
    if (demo) demo.onclick = function () { Viz.open({ code: DEMO, input: '', title: 'Demo: swap with pointers' }); };
  }
  function firstUndone(L) { for (var i = 0; i < L.steps.length; i++) if (!stepDone(L.id, i)) return i + 1; return 1; }
  var DEMO = '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}\n\nint main(void) {\n    int x = 3, y = 7;\n    swap(&x, &y);\n    printf("x = %d, y = %d\\n", x, y);\n    return 0;\n}\n';
  function heroDemo() {
    return '<div class="demo-card"><div class="demo-head"><span class="dots"><i></i><i></i><i></i></span>swap.c</div>' + codeBlock(DEMO) +
      '<div class="demo-mem"><div class="frame mini active"><div class="frame-head">swap()</div><div class="var"><span class="vname">a</span><span class="cell ptr"><span class="dot"></span></span></div><div class="var"><span class="vname">b</span><span class="cell ptr"><span class="dot"></span></span></div></div>' +
      '<div class="frame mini"><div class="frame-head">main()</div><div class="var"><span class="vname">x</span><span class="cell scalar">3</span></div><div class="var"><span class="vname">y</span><span class="cell scalar">7</span></div></div></div>' +
      '<button class="btn primary demo-btn" data-demo>▶ Visualize this program</button></div>';
  }

  // ---- lesson
  function pageLesson(lid, n) {
    setActiveNav('learn');
    var L = LES[lid];
    if (!L) return notFound();
    var idx = Math.max(0, Math.min(L.steps.length - 1, (parseInt(n, 10) || 1) - 1));
    var step = L.steps[idx];
    S.last = '#/learn/' + lid + '/' + (idx + 1); Store.save();
    var li = LESSONS.indexOf(L);
    var side = '<aside class="side"><div class="side-head"><a href="#/" class="muted">← All lessons</a><div class="side-title">' + (li + 1) + '. ' + esc(L.title) + '</div>' + progressBar(lessonStats(L).pct) + '</div><ol class="step-list">';
    L.steps.forEach(function (s, i) {
      side += '<li class="' + (i === idx ? 'active ' : '') + (stepDone(lid, i) ? 'done' : '') + '"><a href="#/learn/' + lid + '/' + (i + 1) + '"><span class="sl-check">' + (stepDone(lid, i) ? '✓' : i + 1) + '</span>' + esc(s.title) + '</a></li>';
    });
    side += '</ol><a class="side-practice" href="#/practice/' + lid + '">✎ Practice problems <span class="count">' + L.problems.length + '</span></a>';
    var TT = topicTest(lid);
    if (TT) side += '<a class="side-practice side-test" href="#/test/' + TT.id + '">⏱ Topic test <span class="count">' + TT.duration + ' min</span></a>';
    var other = '<div class="side-other"><div class="muted small">Other lessons</div><select class="lesson-jump">' + LESSONS.map(function (x, i) { return '<option value="' + x.id + '"' + (x === L ? ' selected' : '') + '>' + (i + 1) + '. ' + esc(x.title) + '</option>'; }).join('') + '</select></div>';
    side += other + '</aside>';

    var body = '<article class="lesson"><div class="crumbs"><a href="#/">Lessons</a> / <a href="#/learn/' + lid + '/1">' + esc(L.title) + '</a> / Step ' + (idx + 1) + ' of ' + L.steps.length + '</div>' +
      '<h1 class="step-title"><span class="step-no">' + (idx + 1) + '</span>' + esc(step.title) + '</h1>';
    step.blocks.forEach(function (b, bi) {
      if (b.type === 'html') body += '<div class="prose">' + b.html + '</div>';
      else if (b.type === 'example') body += exampleBlock(b, lid + '-' + idx + '-' + bi);
      else if (b.type === 'quiz') body += quizBlock(b, lid + ':' + idx + ':' + bi);
    });
    var prevLink = idx > 0 ? '#/learn/' + lid + '/' + idx : (li > 0 ? '#/learn/' + LESSONS[li - 1].id + '/' + LESSONS[li - 1].steps.length : null);
    var nextLink, nextLabel;
    if (idx < L.steps.length - 1) { nextLink = '#/learn/' + lid + '/' + (idx + 2); nextLabel = 'Next: ' + L.steps[idx + 1].title; }
    else { nextLink = '#/practice/' + lid; nextLabel = 'Finish — practice ' + L.problems.length + ' problems'; }
    var lastTest = idx === L.steps.length - 1 && topicTest(lid);
    body += '<div class="step-nav">' + (prevLink ? '<a class="btn" href="' + prevLink + '">← Back</a>' : '<span></span>') +
      '<span class="step-next-wrap">' + (lastTest ? '<a class="btn" href="#/test/' + lastTest.id + '">⏱ Take the topic test</a>' : '') + '<a class="btn primary step-next" href="' + nextLink + '">' + esc(nextLabel) + ' →</a></span></div></article>';
    main.innerHTML = '<div class="lesson-layout">' + side + body + '</div>';
    $('.step-next').addEventListener('click', function () { markStep(lid, idx); });
    $('.lesson-jump').onchange = function () { location.hash = '#/learn/' + this.value + '/1'; };
    wireExamples(main);
    wireQuizzes(main);
    window.scrollTo(0, 0);
  }
  var EXAMPLES = {};
  function exampleBlock(b, key) {
    EXAMPLES[key] = b;
    return '<div class="example" data-ex="' + key + '"><div class="ex-bar"><span class="ex-label">Example</span><div class="ex-actions">' +
      '<button class="btn sm primary" data-x="run">▶ Run</button><button class="btn sm" data-x="viz">👁 Visualize</button><button class="btn sm ghost" data-x="edit">Edit in playground</button></div></div>' +
      codeBlock(b.code) +
      (b.input ? '<div class="ex-io"><div class="ex-io-label">Input</div><pre>' + esc(b.input) + '</pre></div>' : '') +
      '<div class="ex-io ex-result" hidden><div class="ex-io-label">Output</div><div class="ex-out"></div></div></div>';
  }
  function wireExamples(root) {
    $$('.example', root).forEach(function (ex) {
      var b = EXAMPLES[ex.getAttribute('data-ex')];
      ex.querySelector('[data-x="run"]').onclick = function () {
        var box = ex.querySelector('.ex-result'), out = ex.querySelector('.ex-out');
        box.hidden = false; out.innerHTML = '<div class="muted">Running…</div>';
        Runner.run(b.code, { stdin: b.input, files: {} }).promise.then(function (r) {
          renderResult(out, r, null, { input: b.input });
          if (b.addressDependent) out.insertAdjacentHTML('beforeend', '<div class="res-note">Addresses (0x…) differ between computers and runs.</div>');
        });
      };
      ex.querySelector('[data-x="viz"]').onclick = function () { Viz.open({ code: b.code, input: b.input, title: 'Lesson example' }); };
      ex.querySelector('[data-x="edit"]').onclick = function () { S.playground = { code: b.code, input: b.input || '' }; Store.save(); location.hash = '#/playground'; };
    });
  }
  function quizBlock(q, key) {
    var chosen = S.quiz[key];
    var html = '<div class="quiz' + (chosen != null ? ' answered' : '') + '" data-q="' + esc(key) + '" data-ans="' + q.answer + '"><div class="quiz-label">Quick check</div><div class="quiz-q">' + q.q + '</div>' +
      (q.code ? codeBlock(q.code) : '') + '<div class="quiz-opts">';
    q.options.forEach(function (o, i) {
      var cls = chosen != null ? (i === q.answer ? ' correct' : i === chosen ? ' wrong' : '') : '';
      html += '<button class="quiz-opt' + cls + '" data-i="' + i + '"' + (chosen != null ? ' disabled' : '') + '><span class="qo-letter">' + 'ABCDEFG'[i] + '</span><span>' + o + '</span></button>';
    });
    html += '</div><div class="quiz-explain"' + (chosen != null ? '' : ' hidden') + '>' + (chosen != null ? verdict(chosen === q.answer) : '') + q.explain + '</div>' +
      (chosen != null ? '<button class="btn sm ghost quiz-retry">Try again</button>' : '') + '</div>';
    return html;
  }
  function verdict(ok) { return ok ? '<strong class="ok">Correct!</strong> ' : '<strong class="bad">Not quite.</strong> '; }
  function wireQuizzes(root) {
    $$('.quiz', root).forEach(function (qz) {
      var key = qz.getAttribute('data-q'), ans = +qz.getAttribute('data-ans');
      $$('.quiz-opt', qz).forEach(function (b) {
        b.onclick = function () {
          var i = +b.getAttribute('data-i');
          S.quiz[key] = i; Store.save();
          $$('.quiz-opt', qz).forEach(function (o) { var j = +o.getAttribute('data-i'); o.disabled = true; if (j === ans) o.classList.add('correct'); else if (j === i) o.classList.add('wrong'); });
          var ex = qz.querySelector('.quiz-explain'); ex.hidden = false; ex.innerHTML = verdict(i === ans) + ex.innerHTML.replace(/^<strong[^>]*>.*?<\/strong> /, '');
          qz.classList.add('answered');
          if (!qz.querySelector('.quiz-retry')) { qz.insertAdjacentHTML('beforeend', '<button class="btn sm ghost quiz-retry">Try again</button>'); wireRetry(qz, key); }
        };
      });
      wireRetry(qz, key);
    });
  }
  function wireRetry(qz, key) {
    var r = qz.querySelector('.quiz-retry');
    if (!r) return;
    r.onclick = function () {
      delete S.quiz[key]; Store.save();
      $$('.quiz-opt', qz).forEach(function (o) { o.disabled = false; o.classList.remove('correct', 'wrong'); });
      var ex = qz.querySelector('.quiz-explain'); ex.hidden = true; ex.innerHTML = ex.innerHTML.replace(/^<strong[^>]*>.*?<\/strong> /, '');
      qz.classList.remove('answered'); r.remove();
    };
  }

  // ---- practice list
  var filters = { q: '', diff: '', status: '' };
  function pagePractice(lid) {
    setActiveNav('practice');
    var html = '<div class="page"><div class="page-head"><div><h1>Practice problems</h1><p class="muted">' + PROBLEMS.length + ' problems from the CSE103 task sheet, practice sets and lab manual. Your output is judged automatically.</p></div></div>' +
      '<div class="filters"><div class="chips">' + '<a class="chip' + (!lid ? ' active' : '') + '" href="#/practice">All topics</a>' +
      LESSONS.map(function (L) { var st = lessonStats(L); return '<a class="chip' + (lid === L.id ? ' active' : '') + '" href="#/practice/' + L.id + '">' + esc(L.title.split(':')[0]) + ' <span class="count">' + st.problems + '/' + L.problems.length + '</span></a>'; }).join('') +
      '</div><div class="filter-row"><input class="search" type="search" placeholder="Search problems…" value="' + esc(filters.q) + '">' +
      '<select class="f-diff"><option value="">Any difficulty</option><option>easy</option><option>medium</option><option>hard</option></select>' +
      '<select class="f-status"><option value="">Any status</option><option value="todo">Not solved</option><option value="solved">Solved</option></select></div></div>' +
      '<div class="plist"></div></div>';
    main.innerHTML = html;
    $('.f-diff').value = filters.diff; $('.f-status').value = filters.status;
    function draw() {
      var list = PROBLEMS.filter(function (p) {
        if (lid && p.lesson !== lid) return false;
        if (filters.diff && p.difficulty !== filters.diff) return false;
        if (filters.status === 'solved' && !S.solved[p.id]) return false;
        if (filters.status === 'todo' && S.solved[p.id]) return false;
        if (filters.q && (p.title + ' ' + (p.source || '')).toLowerCase().indexOf(filters.q.toLowerCase()) < 0) return false;
        return true;
      });
      var out = '', cur = null;
      list.forEach(function (p) {
        if (p.lesson !== cur) { cur = p.lesson; out += '<div class="plist-group">' + esc(LES[cur].title) + '</div>'; }
        var st = S.solved[p.id] ? 'solved' : S.tried[p.id] ? 'tried' : 'todo';
        out += '<a class="prow ' + st + '" href="#/problem/' + p.id + '"><span class="pstat" title="' + st + '">' + (st === 'solved' ? '✓' : st === 'tried' ? '•' : '') + '</span><span class="ptitle">' + esc(p.title) + (p.kind === 'concept' ? ' <span class="badge">concept</span>' : '') + '</span><span class="psrc">' + esc(p.source || '') + '</span>' + diffBadge(p.difficulty) + '</a>';
      });
      $('.plist').innerHTML = out || '<div class="empty-state">No problems match these filters.</div>';
    }
    $('.search').oninput = function () { filters.q = this.value; draw(); };
    $('.f-diff').onchange = function () { filters.diff = this.value; draw(); };
    $('.f-status').onchange = function () { filters.status = this.value; draw(); };
    draw();
  }

  // ---- problem
  var current = null;
  function pageProblem(pid) {
    setActiveNav('practice');
    var p = PROB[pid];
    if (!p) return notFound();
    var list = p.testId ? TST[p.testId].problems : PROBLEMS.filter(function (x) { return x.lesson === p.lesson; });
    var pi = list.indexOf(p);
    var sample = p.tests[0];
    var html = '<div class="prob-layout"><section class="prob-left">' +
      '<div class="crumbs"><a href="' + (p.testId ? '#/test/' + p.testId : '#/practice/' + p.lesson) + '">' + esc(p.lessonTitle) + '</a> / Problem ' + (pi + 1) + ' of ' + list.length + '</div>' +
      '<h1 class="prob-title">' + esc(p.title) + ' ' + (S.solved[p.id] ? '<span class="solved-tag">✓ Solved</span>' : '') + '</h1>' +
      '<div class="prob-meta">' + diffBadge(p.difficulty) + (p.source ? '<span class="muted small">' + esc(p.source) + '</span>' : '') + '</div>' +
      '<div class="tabs"><button class="tab active" data-pt="desc">Problem</button><button class="tab" data-pt="hints">Hints (' + p.hints.length + ')</button><button class="tab" data-pt="sol">Solution</button></div>' +
      '<div class="ptab" data-pt="desc"><div class="prose">' + p.statement + '</div>' +
      (sample ? '<div class="sample"><div class="sample-col"><div class="sample-label">Sample input</div><pre>' + (sample.input ? esc(sample.input) : '<span class="muted">(none)</span>') + '</pre></div><div class="sample-col"><div class="sample-label">Sample output</div><pre>' + esc(sample.output) + '</pre></div></div>' : '') +
      (sample && Object.keys(sample.files || {}).length ? '<div class="sample-files">' + Object.keys(sample.files).map(function (f) { return '<div class="sample-label">File “' + esc(f) + '” (exists before the program runs)</div><pre>' + esc(sample.files[f]) + '</pre>'; }).join('') + '</div>' : '') +
      '<p class="muted small">The judge ignores extra spaces and prompts like "Enter a number:", but the numbers and words must match.</p></div>' +
      '<div class="ptab" data-pt="hints" hidden>' + (p.hints.length ? p.hints.map(function (hh, i) { return '<details class="hint"' + (i === 0 ? '' : '') + '><summary>Hint ' + (i + 1) + '</summary><div class="prose">' + hh + '</div></details>'; }).join('') : '<p class="muted">No hints for this one.</p>') + '</div>' +
      '<div class="ptab" data-pt="sol" hidden><div class="sol-gate"><p>Try for a while before looking — struggling a bit is how you learn. Use the hints first!</p><button class="btn reveal-sol">Show the reference solution</button></div><div class="sol-body" hidden>' + codeBlock(p.solution) +
      '<div class="sol-actions"><button class="btn sm" data-s="viz">👁 Visualize solution</button><button class="btn sm ghost" data-s="load">Load into editor</button></div></div></div>' +
      '<div class="prob-nav">' + (pi > 0 ? '<a class="btn sm" href="#/problem/' + list[pi - 1].id + '">← Previous</a>' : '<span></span>') + (pi < list.length - 1 ? '<a class="btn sm" href="#/problem/' + list[pi + 1].id + '">Next problem →</a>' : '<a class="btn sm" href="#/practice">All problems</a>') + '</div>' +
      '</section><section class="prob-right">' +
      '<div class="ed-bar"><span class="ed-file">main.c</span><div class="ed-actions"><button class="btn sm" data-a="reset" title="Reset to starter code">Reset</button><button class="btn sm" data-a="viz">👁 Visualize</button><button class="btn sm" data-a="run" title="Ctrl+Enter">▶ Run</button>' + (p.kind === 'concept' ? '' : '<button class="btn sm primary" data-a="submit">✓ Submit</button>') + '</div></div>' +
      '<div class="ed-host"></div>' +
      '<div class="bottom-panel"><div class="tabs small"><button class="tab active" data-bt="io">Input / Output</button>' + (p.kind === 'concept' ? '' : '<button class="tab" data-bt="tests">Test results</button>') + '</div>' +
      '<div class="bt" data-bt="io"><div class="io-grid"><div><div class="io-label">Input (stdin)</div><textarea class="io-in" spellcheck="false" placeholder="Type the input your program reads with scanf…">' + esc(sample ? sample.input : '') + '</textarea></div><div><div class="io-label">Output</div>' + termBox('Press ▶ Run (Ctrl+Enter) to run with this input, or ✓ Submit to check all tests.') + '</div></div></div>' +
      '<div class="bt" data-bt="tests" hidden><div class="test-results"><div class="muted">Press ✓ Submit to run your code against ' + p.tests.length + ' tests.</div></div></div>' +
      '</div></section></div>';
    main.innerHTML = html;
    var saved = S.code[p.id];
    var ed = makeEditor($('.ed-host'), saved != null ? saved : p.starter, {
      onChange: function (v) { S.code[p.id] = v; saveSoon(); },
      onRun: function () { doRun(); }
    });
    current = { p: p, ed: ed };
    // tabs
    $$('.prob-left .tab').forEach(function (t) {
      t.onclick = function () { $$('.prob-left .tab').forEach(function (x) { x.classList.toggle('active', x === t); }); $$('.ptab').forEach(function (x) { x.hidden = x.getAttribute('data-pt') !== t.getAttribute('data-pt'); }); };
    });
    function showBottom(name) { $$('.bottom-panel .tab').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-bt') === name); }); $$('.bt').forEach(function (x) { x.hidden = x.getAttribute('data-bt') !== name; }); }
    $$('.bottom-panel .tab').forEach(function (t) { t.onclick = function () { showBottom(t.getAttribute('data-bt')); }; });
    $('.reveal-sol').onclick = function () { $('.sol-gate').hidden = true; $('.sol-body').hidden = false; };
    $('[data-s="viz"]').onclick = function () { Viz.open({ code: p.solution, input: $('.io-in').value, files: sample ? sample.files : {}, title: p.title + ' — solution' }); };
    $('[data-s="load"]').onclick = function () { if (confirmReplace()) { ed.set(p.solution); } };
    $('[data-a="reset"]').onclick = function () { if (confirmReplace()) { ed.set(p.starter); delete S.code[p.id]; Store.save(); } };
    $('[data-a="viz"]').onclick = function () { Viz.open({ code: ed.get(), input: $('.io-in').value, files: sample ? sample.files : {}, title: p.title }); };
    $('[data-a="run"]').onclick = doRun;
    var sb = $('[data-a="submit"]'); if (sb) sb.onclick = doSubmit;
    var running = null;
    function doRun() {
      showBottom('io');
      var out = $('.io-out');
      if (running) running.cancel();
      out.innerHTML = termRunning(true);
      var inp = $('.io-in').value;
      running = Runner.run(ed.get(), { stdin: inp, files: sample ? sample.files : {} });
      $('.stop', out).onclick = function () { running.cancel(); };
      running.promise.then(function (r) { running = null; renderResult(out, r, ed, { input: inp }); });
    }
    function doSubmit() {
      showBottom('tests');
      var box = $('.test-results');
      S.tried[p.id] = true; Store.save();
      box.innerHTML = '<div class="test-summary muted">Running ' + p.tests.length + ' tests…</div>' + p.tests.map(function (t, i) { return '<div class="test-row pending" data-t="' + i + '"><span class="t-icon">…</span>Test ' + (i + 1) + (i === 0 ? ' (sample)' : '') + '</div>'; }).join('');
      var results = [];
      var job = Runner.runTests(ed.get(), p.tests, function (i, r) {
        results[i] = r;
        var row = $('[data-t="' + i + '"]', box), t = p.tests[i];
        if (!row) return;
        var pass = r.cmp && r.cmp.pass;
        row.className = 'test-row ' + (pass ? 'pass' : 'fail');
        var detail = '';
        if (r.compileError) { detail = '<div class="res-err">Compile error on line ' + r.compileError.line + ': ' + esc(r.compileError.message) + '</div>'; ed.clearMarks(); ed.mark(r.compileError.line, 'err', r.compileError.message); }
        else if (!pass) {
          detail = '<div class="t-detail">' + (t.input ? '<div><div class="io-label">Input</div><pre>' + esc(t.input) + '</pre></div>' : '') +
            '<div><div class="io-label">Expected output</div><pre>' + esc(t.output) + '</pre></div><div><div class="io-label">Your output</div><pre>' + esc(r.stdout || '') + '</pre></div></div>' +
            (r.error ? '<div class="res-err">' + esc(r.error.message) + (r.error.line ? ' (line ' + r.error.line + ')' : '') + '</div>' : '') +
            (r.cmp && r.cmp.line ? '<div class="res-note">First difference at output line ' + r.cmp.line + ': expected <code>' + esc(r.cmp.expectedLine) + '</code> but got <code>' + esc(r.cmp.actualLine) + '</code></div>' : '');
        }
        row.innerHTML = '<div class="t-head"><span class="t-icon">' + (pass ? '✓' : '✕') + '</span>Test ' + (i + 1) + (i === 0 ? ' (sample)' : '') + '<span class="t-verdict">' + (pass ? (r.cmp.exact ? 'Passed' : 'Passed (extra text ignored)') : r.compileError ? 'Compile error' : r.error ? 'Runtime error' : 'Wrong answer') + '</span></div>' + detail;
      });
      job.promise.then(function (st) {
        var passed = results.filter(function (r) { return r && r.cmp && r.cmp.pass; }).length;
        var all = passed === p.tests.length;
        if (st.timeout) $$('.test-row.pending', box).forEach(function (row) { row.className = 'test-row fail'; row.innerHTML = '<div class="t-head"><span class="t-icon">✕</span>' + row.textContent.replace('…', '') + '<span class="t-verdict">Time limit exceeded</span></div>'; });
        if (results[0] && results[0].compileError) $$('.test-row.pending', box).forEach(function (row) { row.remove(); });
        var sum = $('.test-summary', box);
        sum.className = 'test-summary ' + (all ? 'all-pass' : 'some-fail');
        sum.innerHTML = all ? '🎉 All ' + p.tests.length + ' tests passed — problem solved!' + (pi < list.length - 1 ? ' <a href="#/problem/' + list[pi + 1].id + '">Next problem →</a>' : '') : passed + ' of ' + p.tests.length + ' tests passed. ' + (results[0] && results[0].compileError ? 'Fix the compile error first.' : 'Open a failing test to compare outputs, or press 👁 Visualize to step through.');
        if (all && !S.solved[p.id]) { S.solved[p.id] = Date.now(); Store.save(); var tt = $('.prob-title'); if (tt && !$('.solved-tag', tt)) tt.insertAdjacentHTML('beforeend', ' <span class="solved-tag">✓ Solved</span>'); }
      });
    }
    window.scrollTo(0, 0);
    setTimeout(function () { ed.refresh(); }, 30);
  }
  function confirmReplace() { return window.confirm('Replace the code in the editor? Your current code will be lost.'); }
  var saveTimer;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(function () { Store.save(); }, 400); }

  // ---- playground
  var PG_DEFAULT = '#include <stdio.h>\n\nint main(void) {\n    int n, i;\n    long long fact = 1;\n    scanf("%d", &n);\n    for (i = 1; i <= n; i++) {\n        fact = fact * i;\n    }\n    printf("%d! = %lld\\n", n, fact);\n    return 0;\n}\n';
  function pagePlayground() {
    setActiveNav('playground');
    var pg = S.playground || { code: PG_DEFAULT, input: '5\n' };
    var exOpts = '<option value="">Load an example…</option>';
    LESSONS.forEach(function (L) {
      exOpts += '<optgroup label="' + esc(L.title) + '">';
      L.steps.forEach(function (s, si) { s.blocks.forEach(function (b, bi) { if (b.type === 'example') exOpts += '<option value="' + L.id + '|' + si + '|' + bi + '">' + esc(s.title) + '</option>'; }); });
      exOpts += '</optgroup>';
    });
    main.innerHTML = '<div class="pg-layout"><section class="pg-main"><div class="ed-bar"><span class="ed-file">main.c</span><select class="pg-examples">' + exOpts + '</select><div class="ed-actions"><button class="btn sm" data-a="new">New</button><button class="btn sm" data-a="viz">👁 Visualize</button><button class="btn sm primary" data-a="run" title="Ctrl+Enter">▶ Run</button></div></div><div class="ed-host"></div></section>' +
      '<section class="pg-side"><div class="term con" tabindex="-1"><div class="term-bar"><span class="term-title">console</span><span class="term-hint">type input here · Ctrl+D = end of input</span><button class="term-stop con-eof" hidden title="End of input (Ctrl+D)">EOF</button><button class="term-stop con-stop" hidden>■ Stop</button><button class="term-stop con-clear">Clear</button></div><div class="io-out term-body"></div></div>' +
      '<details class="files-panel"' + '><summary>Virtual files <span class="muted small">(for fopen)</span></summary><div class="files-list"></div><div class="file-new"><input class="file-name" placeholder="new-file.txt"><button class="btn sm" data-a="addfile">Add file</button></div></details></section></div>';
    var lastInput = pg.input || '';
    function savePg() { S.playground = { code: ed.get(), input: lastInput }; saveSoon(); }
    var ed = makeEditor($('.ed-host'), pg.code, {
      onChange: savePg,
      onRun: function () { run(); }
    });
    var con = makeConsole($('.con'), {
      editor: ed, hint: (TOUCH ? 'Tap ▶ Run' : 'Press ▶ Run (Ctrl+Enter)') + ', then type the program\'s input right here.',
      getCode: function () { return ed.get(); },
      getFiles: function () { return S.files; },
      onDone: function (r, stdin) {
        lastInput = stdin; savePg();
        if (r.files && !r.compileError) { S.files = r.files; Store.save(); drawFiles(); }
      }
    });
    $('.pg-examples').onchange = function () {
      if (!this.value) return;
      var parts = this.value.split('|'), b = LES[parts[0]].steps[+parts[1]].blocks[+parts[2]];
      ed.set(b.code); lastInput = b.input || ''; S.playground = { code: b.code, input: lastInput }; Store.save();
      this.value = '';
    };
    $('[data-a="new"]').onclick = function () { if (confirmReplace()) { ed.set('#include <stdio.h>\n\nint main(void) {\n    \n    return 0;\n}\n'); lastInput = ''; } };
    $('[data-a="viz"]').onclick = function () { Viz.open({ code: ed.get(), input: lastInput, files: S.files, title: 'Playground' }); };
    $('[data-a="run"]').onclick = run;
    function run() { con.start(); }
    function drawFiles() {
      var names = Object.keys(S.files);
      $('.files-list').innerHTML = names.length ? names.map(function (n) {
        return '<div class="file-item"><div class="file-head"><span>📄 ' + esc(n) + '</span><button class="btn xs ghost" data-del="' + esc(n) + '">Delete</button></div><textarea data-file="' + esc(n) + '" spellcheck="false">' + esc(S.files[n]) + '</textarea></div>';
      }).join('') : '<div class="muted small">No files yet. Files your program creates with fopen(..., "w") appear here.</div>';
      $$('[data-file]').forEach(function (t) { t.oninput = function () { S.files[t.getAttribute('data-file')] = t.value; saveSoon(); }; });
      $$('[data-del]').forEach(function (b) { b.onclick = function () { delete S.files[b.getAttribute('data-del')]; Store.save(); drawFiles(); }; });
    }
    $('[data-a="addfile"]').onclick = function () { var n = $('.file-name').value.trim(); if (!n) return; if (!(n in S.files)) S.files[n] = ''; $('.file-name').value = ''; Store.save(); drawFiles(); };
    drawFiles();
    setTimeout(function () { ed.refresh(); }, 30);
  }

  // ---------------------------------------------------------------- mock tests
  var testTimer = null;
  function topicTest(lid) { for (var i = 0; i < TESTS.length; i++) if (TESTS[i].lessonRef === lid) return TESTS[i]; return null; }
  function testMarks(T) { return T.items.reduce(function (a, it) { return a + (it.marks || 0); }, 0); }
  function fmtTime(ms) {
    ms = Math.max(0, ms);
    var sec = Math.floor(ms / 1000), m = Math.floor(sec / 60);
    return (m >= 60 ? Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0') : m) + ':' + String(sec % 60).padStart(2, '0');
  }
  function itemLabel(T, i) {
    var q = 0, pn = 0;
    for (var k = 0; k <= i; k++) { if (T.items[k].type === 'question') q++; else pn++; }
    return T.items[i].type === 'question' ? 'Q' + q : 'P' + pn;
  }
  function pageTests() {
    setActiveNav('tests');
    var html = '<div class="page"><div class="page-head"><div><h1>Mock tests</h1><p class="muted">Timed sets with new problems you have not seen in the lessons. Questions are graded when you finish; coding problems earn partial marks for every hidden test they pass.</p></div></div>' +
      '<div class="test-tabs chips"><a class="chip" href="#exam-mocks">Exam mocks</a><a class="chip" href="#topic-tests">Topic tests</a></div>' +
      '<h2 class="section-title" id="exam-mocks">Exam mocks <span class="muted small">— like the CSE103 class tests, midterm and final</span></h2><div class="test-grid">';
    var groups = { exam: [], topic: [] };
    TESTS.forEach(function (T) { (groups[T.group] || groups.exam).push(T); });
    groups.exam.forEach(card);
    html += '</div><h2 class="section-title" id="topic-tests">Topic tests <span class="muted small">— one short test per lesson; take it after finishing the lesson</span></h2><div class="test-grid topic">';
    groups.topic.forEach(card);
    main.innerHTML = html + '</div></div>';
    $$('.test-tabs a').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); document.getElementById(a.getAttribute('href').slice(1)).scrollIntoView({ behavior: 'smooth' }); }; });
    function card(T) {
      var st = S.tests[T.id] || {}, hist = st.history || [];
      var best = hist.length ? Math.max.apply(null, hist.map(function (x) { return x.score; })) : null;
      var nq = T.items.filter(function (i) { return i.type === 'question'; }).length;
      var running = st.start && !st.done;
      var L = T.lessonRef && LES[T.lessonRef];
      html += '<article class="test-card">' + (L ? '<div class="test-lesson">Lesson ' + (LESSONS.indexOf(L) + 1) + '</div>' : '') + '<div class="test-card-top"><h3>' + esc(T.title.replace(/^Topic Test:\s*/, '')) + '</h3><span class="badge">' + T.duration + ' min</span></div>' +
        '<p class="muted small">' + esc(T.covers || '') + '</p>' +
        '<div class="test-facts"><span><b>' + nq + '</b> questions</span><span><b>' + T.problems.length + '</b> coding problems</span><span><b>' + testMarks(T) + '</b> marks</span></div>' +
        (best != null ? '<div class="test-best">Best score: <b>' + best + '</b> / ' + testMarks(T) + ' · ' + hist.length + ' attempt' + (hist.length > 1 ? 's' : '') + '</div>' : '') +
        '<a class="btn ' + (running ? 'primary' : '') + '" href="#/test/' + T.id + '">' + (running ? 'Resume test →' : st.done ? 'View result / retake' : 'Open test →') + '</a></article>';
    }
  }
  function pageTest(id) {
    setActiveNav('tests');
    var T = TST[id];
    if (!T) return notFound();
    var st = S.tests[id] || (S.tests[id] = {});
    if (st.start && !st.done) return runTest(T, st);
    if (st.done && st.result && st.view !== 'intro') return testResult(T, st);
    var nq = T.items.filter(function (i) { return i.type === 'question'; }).length;
    main.innerHTML = '<div class="page narrow"><div class="crumbs"><a href="#/tests">Mock tests</a> / ' + esc(T.title) + '</div><h1>' + esc(T.title) + '</h1><p class="lead">' + esc(T.summary || '') + '</p>' +
      '<div class="test-facts big"><span><b>' + T.duration + '</b> minutes</span><span><b>' + nq + '</b> questions</span><span><b>' + T.problems.length + '</b> coding problems</span><span><b>' + testMarks(T) + '</b> marks</span></div>' +
      '<div class="callout"><strong>Covers:</strong> ' + esc(T.covers || '') + '</div>' +
      '<h3>Rules</h3><ul class="rules"><li>The timer starts when you press <b>Start</b> and keeps running even if you leave the page — come back to resume.</li>' +
      '<li>Questions: pick one answer; you can change it until you finish. No feedback until the end.</li>' +
      '<li>Coding problems: write the program and use <b>Run</b> with your own input. Your code is judged when you finish — each hidden test it passes earns part of the marks.</li>' +
      '<li>The visualizer, hints and solutions are locked during the test, like a closed-book exam.</li>' +
      '<li>When the time runs out the test is submitted automatically.</li></ul>' +
      '<div class="hero-cta"><button class="btn primary lg start-test">Start test</button>' + (st.result ? '<button class="btn lg view-last">View last result</button>' : '') + '<a class="btn ghost lg" href="#/tests">Back</a></div></div>';
    $('.start-test').onclick = function () {
      S.tests[id] = { start: Date.now(), answers: {}, code: {}, cur: 0, history: st.history || [] };
      Store.save();
      runTest(T, S.tests[id]);
    };
    var vl = $('.view-last');
    if (vl) vl.onclick = function () { st.view = 'result'; testResult(T, st); };
  }
  function runTest(T, st) {
    var end = st.start + T.duration * 60000;
    main.innerHTML = '<div class="test-layout"><aside class="test-side"><div class="test-timer"><div class="muted small">Time left</div><div class="tt-clock"></div></div>' +
      '<div class="test-items"></div><button class="btn primary finish-test">Finish &amp; submit</button><p class="muted small">Filled items are answered. Jump between items freely.</p></aside><section class="test-main"></section></div>';
    function tick() {
      var left = end - Date.now(), c = $('.tt-clock');
      if (!c) { clearInterval(testTimer); return; }
      c.textContent = fmtTime(left);
      c.classList.toggle('low', left < 5 * 60000);
      if (left <= 0) { clearInterval(testTimer); finishTest(T, st, true); }
    }
    clearInterval(testTimer);
    testTimer = setInterval(tick, 1000);
    tick();
    if (Date.now() >= end) return;
    $('.finish-test').onclick = function () {
      var open = T.items.filter(function (it, i) { return it.type === 'question' ? st.answers[i] == null : !touched(it.id); }).length;
      if (window.confirm('Finish the test now?' + (open ? ' ' + open + ' item(s) are still unanswered.' : ''))) finishTest(T, st, false);
    };
    function touched(pid) { return !!(st.code[pid] && st.code[pid] !== PROB[pid].starter); }
    function drawNav() {
      $('.test-items').innerHTML = T.items.map(function (it, i) {
        var done = it.type === 'question' ? st.answers[i] != null : touched(it.id);
        return '<button class="ti' + (i === st.cur ? ' active' : '') + (done ? ' done' : '') + '" data-i="' + i + '"><span class="ti-l">' + itemLabel(T, i) + '</span><span class="ti-m">' + (it.marks || 0) + ' marks</span></button>';
      }).join('');
      $$('.ti').forEach(function (b) { b.onclick = function () { st.cur = +b.getAttribute('data-i'); Store.save(); drawItem(); drawNav(); }; });
    }
    var navTimer = null;
    function drawItem() {
      var it = T.items[st.cur], box = $('.test-main');
      var nav = '<div class="ti-nav">' + (st.cur > 0 ? '<button class="btn sm prev-i">← Previous</button>' : '<span></span>') +
        (st.cur < T.items.length - 1 ? '<button class="btn sm primary next-i">Next →</button>' : '<span></span>') + '</div>';
      if (it.type === 'question') {
        var q = it.quiz;
        box.innerHTML = '<div class="tq"><div class="tq-head"><span class="tq-label">' + itemLabel(T, st.cur) + ' · ' + esc(it.title) + '</span><span class="badge">' + it.marks + ' marks</span></div>' + (it.intro || '') +
          '<div class="quiz-q">' + q.q + '</div>' + (q.code ? codeBlock(q.code) : '') + '<div class="quiz-opts">' +
          q.options.map(function (o, i) { return '<button class="quiz-opt' + (st.answers[st.cur] === i ? ' selected' : '') + '" data-i="' + i + '"><span class="qo-letter">' + 'ABCDEFG'[i] + '</span><span>' + o + '</span></button>'; }).join('') + '</div>' +
          (st.answers[st.cur] != null ? '<button class="btn sm ghost clear-ans">Clear answer</button>' : '') + nav + '</div>';
        $$('.quiz-opt', box).forEach(function (b) { b.onclick = function () { st.answers[st.cur] = +b.getAttribute('data-i'); Store.save(); drawItem(); drawNav(); }; });
        var ca = $('.clear-ans', box);
        if (ca) ca.onclick = function () { delete st.answers[st.cur]; Store.save(); drawItem(); drawNav(); };
      } else {
        var p = PROB[it.id], sample = p.tests[0];
        box.innerHTML = '<div class="tp"><div class="tp-left"><div class="tq-head"><span class="tq-label">' + itemLabel(T, st.cur) + ' · ' + esc(p.title) + '</span><span class="badge">' + it.marks + ' marks</span></div><div class="prose">' + p.statement + '</div>' +
          (sample ? '<div class="sample"><div class="sample-col"><div class="sample-label">Sample input</div><pre>' + (sample.input ? esc(sample.input) : '<span class="muted">(none)</span>') + '</pre></div><div class="sample-col"><div class="sample-label">Sample output</div><pre>' + esc(sample.output) + '</pre></div></div>' : '') + nav + '</div>' +
          '<div class="tp-right"><div class="ed-bar"><span class="ed-file">main.c</span><div class="ed-actions"><button class="btn sm primary" data-a="run" title="Ctrl+Enter">▶ Run</button></div></div><div class="ed-host"></div>' +
          '<div class="tp-io"><div><div class="io-label">Input</div><textarea class="io-in" spellcheck="false">' + esc(sample ? sample.input : '') + '</textarea></div><div><div class="io-label">Output</div>' + termBox('Run your code with your own input to check it.') + '</div></div></div></div>';
        var ed = makeEditor($('.ed-host', box), st.code[p.id] != null ? st.code[p.id] : p.starter, {
          onChange: function (v) { st.code[p.id] = v; saveSoon(); clearTimeout(navTimer); navTimer = setTimeout(drawNav, 700); },
          onRun: function () { runIt(); }
        });
        var job = null;
        var runIt = function () {
          var out = $('.io-out', box), inp = $('.io-in', box).value;
          if (job) job.cancel();
          out.innerHTML = termRunning(false);
          job = Runner.run(ed.get(), { stdin: inp, files: sample ? sample.files : {} });
          job.promise.then(function (r) { job = null; renderResult(out, r, ed, { input: inp }); });
        };
        $('[data-a="run"]', box).onclick = runIt;
        setTimeout(function () { ed.refresh(); }, 20);
      }
      var pv = $('.prev-i', box), nx = $('.next-i', box);
      if (pv) pv.onclick = function () { st.cur--; Store.save(); drawItem(); drawNav(); };
      if (nx) nx.onclick = function () { st.cur++; Store.save(); drawItem(); drawNav(); };
      box.scrollTop = 0;
    }
    drawNav();
    drawItem();
  }
  function finishTest(T, st, timeUp) {
    clearInterval(testTimer);
    st.finishedAt = Math.min(Date.now(), st.start + T.duration * 60000);
    main.innerHTML = '<div class="page narrow"><h1>' + (timeUp ? 'Time is up!' : 'Grading…') + '</h1><p class="muted">Checking your answers and running your programs against the hidden tests…</p><div class="pbar"><div class="grade-bar" style="width:0%"></div></div></div>';
    var res = { items: [], score: 0 }, probs = [];
    T.items.forEach(function (it, i) {
      if (it.type === 'question') {
        var ok = st.answers[i] === it.quiz.answer;
        res.items.push({ i: i, ok: ok, got: ok ? it.marks : 0 });
      } else {
        res.items.push({ i: i, got: 0, passed: 0, total: PROB[it.id].tests.length });
        probs.push(i);
      }
    });
    var k = 0;
    function next() {
      var bar = $('.grade-bar');
      if (bar) bar.style.width = Math.round(100 * k / Math.max(1, probs.length)) + '%';
      if (k >= probs.length) {
        res.score = Math.round(res.items.reduce(function (a, r) { return a + r.got; }, 0) * 10) / 10;
        st.done = true; st.result = res; st.view = 'result';
        st.history = (st.history || []).concat([{ date: Date.now(), score: res.score }]);
        Store.save();
        testResult(T, st);
        return;
      }
      var i = probs[k++], it = T.items[i], p = PROB[it.id], code = st.code[p.id];
      var r = res.items.filter(function (x) { return x.i === i; })[0];
      if (!code || code === p.starter) { r.note = 'Not attempted'; next(); return; }
      var passed = 0;
      Runner.runTests(code, p.tests, function (ti, out) {
        if (out.cmp && out.cmp.pass) passed++;
        if (out.compileError) r.note = 'Compile error on line ' + out.compileError.line + ': ' + out.compileError.message;
      }).promise.then(function (done) {
        if (done.timeout && !r.note) r.note = 'Time limit exceeded on a test (infinite loop?)';
        r.passed = passed;
        r.got = Math.round(it.marks * passed / p.tests.length * 10) / 10;
        next();
      });
    }
    next();
  }
  function testResult(T, st) {
    var res = st.result, total = testMarks(T), pct = Math.round(100 * res.score / total);
    var used = st.finishedAt ? fmtTime(st.finishedAt - st.start) : '—';
    var grade = pct >= 80 ? 'A+' : pct >= 75 ? 'A' : pct >= 70 ? 'A-' : pct >= 65 ? 'B+' : pct >= 60 ? 'B' : pct >= 55 ? 'B-' : pct >= 50 ? 'C+' : pct >= 45 ? 'C' : pct >= 40 ? 'D' : 'F';
    var html = '<div class="page narrow"><div class="crumbs"><a href="#/tests">Mock tests</a> / ' + esc(T.title) + '</div><h1>Result — ' + esc(T.title) + '</h1>' +
      '<div class="result-hero"><div class="score-ring" style="--p:' + pct + '"><div><b>' + res.score + '</b><span>/ ' + total + '</span></div></div>' +
      '<div><div class="res-grade">' + pct + '% · grade ' + grade + '</div><div class="muted">Time used ' + used + ' of ' + T.duration + ':00</div>' +
      '<div class="hero-cta"><button class="btn primary retake">Retake test</button><a class="btn" href="#/tests">All tests</a></div></div></div>' +
      '<h2 class="section-title">Review your answers</h2><div class="review">';
    T.items.forEach(function (it, i) {
      var r = res.items.filter(function (x) { return x.i === i; })[0] || { got: 0 };
      if (it.type === 'question') {
        var q = it.quiz, a = st.answers[i];
        html += '<details class="rv ' + (r.ok ? 'ok' : 'bad') + '"><summary><span class="rv-l">' + itemLabel(T, i) + '</span>' + esc(it.title) + '<span class="rv-m">' + r.got + ' / ' + it.marks + '</span></summary>' +
          '<div class="rv-body"><div class="quiz-q">' + q.q + '</div>' + (q.code ? codeBlock(q.code) : '') + '<div class="quiz-opts">' +
          q.options.map(function (o, j) { return '<div class="quiz-opt' + (j === q.answer ? ' correct' : j === a ? ' wrong' : '') + '"><span class="qo-letter">' + 'ABCDEFG'[j] + '</span><span>' + o + '</span></div>'; }).join('') + '</div>' +
          '<div class="quiz-explain">' + (a == null ? '<strong class="bad">Not answered.</strong> ' : '') + q.explain + '</div>' +
          (q.run ? '<button class="btn sm rv-viz" data-i="' + i + '">👁 Visualize this program</button>' : '') + '</div></details>';
      } else {
        var p = PROB[it.id];
        html += '<details class="rv ' + (r.got >= it.marks ? 'ok' : r.got > 0 ? 'part' : 'bad') + '"><summary><span class="rv-l">' + itemLabel(T, i) + '</span>' + esc(p.title) + '<span class="rv-m">' + r.got + ' / ' + it.marks + '</span></summary>' +
          '<div class="rv-body"><p>' + esc(r.note || (r.passed + ' of ' + r.total + ' hidden tests passed')) + '.</p>' +
          (st.code[p.id] ? '<div class="sample-label">Your code</div>' + codeBlock(st.code[p.id]) : '') +
          '<div class="sol-actions"><a class="btn sm" href="#/problem/' + p.id + '">Practice this problem (hints, solution, visualizer)</a></div></div></details>';
      }
    });
    main.innerHTML = html + '</div></div>';
    $('.retake').onclick = function () { st.view = 'intro'; st.start = null; st.done = false; Store.save(); pageTest(T.id); };
    $$('.rv-viz').forEach(function (b) { b.onclick = function () { var it = T.items[+b.getAttribute('data-i')]; Viz.open({ code: it.quiz.code, input: '', title: it.title }); }; });
  }

  function notFound() { main.innerHTML = '<div class="page"><h1>Not found</h1><p><a href="#/">Go home</a></p></div>'; }

  // ---------------------------------------------------------------- router
  function route() {
    if (window.Viz) Viz.close();
    clearInterval(testTimer);
    var h = location.hash.replace(/^#\/?/, '').split('/');
    switch (h[0]) {
      case '': case 'home': pageHome(); break;
      case 'learn': pageLesson(h[1], h[2]); break;
      case 'practice': pagePractice(h[1]); break;
      case 'problem': pageProblem(h[1]); break;
      case 'playground': pagePlayground(); break;
      case 'tests': pageTests(); break;
      case 'test': pageTest(h[1]); break;
      default: notFound();
    }
    document.title = (h[0] === 'learn' && LES[h[1]] ? LES[h[1]].title + ' · ' : h[0] === 'problem' && PROB[h[1]] ? PROB[h[1]].title + ' · ' : '') + 'C Practice Lab';
  }
  document.addEventListener('DOMContentLoaded', function () {
    main = $('#main');
    $('.theme-toggle').onclick = toggleTheme;
    window.addEventListener('hashchange', route);
    route();
  });
})();
