/* Runs C programs in a Web Worker (built from a Blob so it also works from file://).
   Falls back to the main thread if workers are unavailable. */
(function () {
  var CI = {};
  CI_MODULES.forEach(function (m) { m(CI); });
  window.CI = CI;

  var workerSrc = null;
  function buildWorkerSrc() {
    if (workerSrc) return workerSrc;
    workerSrc = 'var CI = {};\n' + CI_MODULES.map(function (m) { return '(' + m.toString() + ')(CI);'; }).join('\n') +
      '\nvar Judge = (' + judgeFactory.toString() + ')();\n' +
      'onmessage = function (ev) {\n' +
      '  var d = ev.data;\n' +
      '  try {\n' +
      '    if (d.type === "run") { postMessage({ id: d.id, result: CI.run(d.src, d.opts) }); }\n' +
      '    else if (d.type === "tests") {\n' +
      '      d.tests.forEach(function (t, i) {\n' +
      '        var r = CI.run(d.src, { stdin: t.input, files: t.files || {}, timeLimit: 4000 });\n' +
      '        var cmp = r.compileError || r.error ? { pass: false } : Judge.compare(r.stdout, t.output);\n' +
      '        postMessage({ id: d.id, index: i, result: { stdout: r.stdout, error: r.error, compileError: r.compileError, warnings: r.warnings, cmp: cmp } });\n' +
      '        if (r.compileError) { postMessage({ id: d.id, done: true, stoppedEarly: true }); throw "stop"; }\n' +
      '      });\n' +
      '      postMessage({ id: d.id, done: true });\n' +
      '    }\n' +
      '  } catch (e) { if (e !== "stop") postMessage({ id: d.id, crash: String(e && e.stack || e) }); }\n' +
      '};\n';
    return workerSrc;
  }
  // a copy of judge.js usable inside the worker
  function judgeFactory() {
    function norm(s) { return String(s).replace(/\r/g, '').split('\n').map(function (l) { return l.replace(/\s+$/, ''); }).join('\n').replace(/\n+$/, ''); }
    function tokens(s) { return String(s).split(/\s+/).filter(Boolean); }
    function compare(actual, expected) {
      if (norm(actual) === norm(expected)) return { pass: true, exact: true };
      var a = tokens(actual), e = tokens(expected);
      if (!e.length) return { pass: !a.length, exact: false };
      var j = 0;
      for (var i = 0; i < a.length && j < e.length; i++) {
        if (a[i] === e[j]) j++;
        else if (a[i].length > e[j].length && a[i].endsWith(e[j]) && /[:=]$/.test(a[i].slice(0, a[i].length - e[j].length))) j++;
      }
      if (j === e.length) return { pass: true, exact: false };
      var el = norm(expected).split('\n'), al = norm(actual).split('\n'), line = 0;
      while (line < el.length && line < al.length && el[line].trim().split(/\s+/).join(' ') === al[line].trim().split(/\s+/).join(' ')) line++;
      return { pass: false, exact: false, line: line + 1, expectedLine: el[line] === undefined ? '(end of output)' : el[line], actualLine: al[line] === undefined ? '(nothing)' : al[line] };
    }
    return { compare: compare };
  }

  var worker = null, workerOk = true, seq = 0, pending = {};
  function getWorker() {
    if (!workerOk) return null;
    if (worker) return worker;
    try {
      var url = URL.createObjectURL(new Blob([buildWorkerSrc()], { type: 'text/javascript' }));
      worker = new Worker(url);
      worker.onmessage = function (ev) { var p = pending[ev.data.id]; if (p) p.onMessage(ev.data); };
      worker.onerror = function (e) {
        var ids = Object.keys(pending);
        ids.forEach(function (id) { pending[id].fail('Worker error: ' + (e.message || 'unknown')); });
        kill();
      };
    } catch (e) { workerOk = false; worker = null; }
    return worker;
  }
  function kill() { if (worker) { worker.terminate(); worker = null; } pending = {}; }

  var LIMIT_MS = 12000;
  // Run one program. Returns {promise, cancel}
  function run(src, opts) {
    opts = opts || {};
    var id = ++seq;
    var cancel, promise = new Promise(function (resolve) {
      var w = getWorker();
      if (!w) { setTimeout(function () { resolve(CI.run(src, opts)); }, 10); cancel = function () {}; return; }
      var timer = setTimeout(function () {
        delete pending[id]; kill();
        resolve({ stdout: '', error: { kind: 'runtime', message: 'Time limit exceeded — the program did not finish in ' + (LIMIT_MS / 1000) + ' seconds (infinite loop?)', line: 0 }, warnings: [] });
      }, LIMIT_MS + (opts.trace ? 8000 : 0));
      pending[id] = {
        onMessage: function (d) {
          clearTimeout(timer); delete pending[id];
          if (d.crash) resolve({ stdout: '', error: { kind: 'internal', message: 'Interpreter crashed: ' + d.crash }, warnings: [] });
          else resolve(d.result);
        },
        fail: function (msg) { clearTimeout(timer); resolve({ stdout: '', error: { kind: 'internal', message: msg }, warnings: [] }); }
      };
      cancel = function () {
        if (!pending[id]) return;
        clearTimeout(timer); delete pending[id]; kill();
        resolve({ stdout: '', error: { kind: 'runtime', message: 'Stopped by you.', line: 0 }, warnings: [], stopped: true });
      };
      w.postMessage({ type: 'run', id: id, src: src, opts: opts });
    });
    return { promise: promise, cancel: function () { cancel && cancel(); } };
  }

  // Run against tests; onResult(index, result) called progressively. Resolves when done.
  function runTests(src, tests, onResult) {
    var id = ++seq;
    var cancel, promise = new Promise(function (resolve) {
      var w = getWorker();
      if (!w) {
        tests.forEach(function (t, i) {
          var r = CI.run(src, { stdin: t.input, files: t.files || {}, timeLimit: 4000 });
          r.cmp = r.compileError || r.error ? { pass: false } : Judge.compare(r.stdout, t.output);
          onResult(i, r);
        });
        resolve({ done: true }); cancel = function () {}; return;
      }
      var timer;
      function arm() {
        clearTimeout(timer);
        timer = setTimeout(function () {
          delete pending[id]; kill();
          resolve({ timeout: true });
        }, 6000);
      }
      arm();
      pending[id] = {
        onMessage: function (d) {
          if (d.crash) { clearTimeout(timer); delete pending[id]; resolve({ crash: d.crash }); return; }
          if (d.done) { clearTimeout(timer); delete pending[id]; resolve({ done: true }); return; }
          arm();
          onResult(d.index, d.result);
        },
        fail: function (msg) { clearTimeout(timer); resolve({ crash: msg }); }
      };
      cancel = function () { if (pending[id]) { clearTimeout(timer); delete pending[id]; kill(); resolve({ stopped: true }); } };
      w.postMessage({ type: 'tests', id: id, src: src, tests: tests });
    });
    return { promise: promise, cancel: function () { cancel && cancel(); } };
  }

  window.Runner = { run: run, runTests: runTests, kill: kill };
})();
