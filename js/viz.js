/* Step-by-step visualizer: code with current line, stack frames, heap, pointer arrows,
   output/input consumption, an explanation of every step, and a flowchart tab. */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var V = {};
  var state = null; // {code, lines, res, trace, idx, playing, timer, el, tab}

  V.open = function (opts) {
    V.close();
    var ov = h('div', 'viz-overlay');
    ov.innerHTML =
      '<div class="viz" role="dialog" aria-label="Code visualizer">' +
      ' <header class="viz-head">' +
      '  <div class="viz-title"><span class="viz-badge">Visualizer</span> <span class="viz-name"></span></div>' +
      '  <div class="viz-tabs" role="tablist">' +
      '    <button class="tab active" data-tab="memory" role="tab">Memory</button>' +
      '    <button class="tab" data-tab="flow" role="tab">Flowchart</button>' +
      '    <button class="tab" data-tab="both" role="tab">Both</button>' +
      '  </div>' +
      '  <button class="btn ghost viz-close" title="Close (Esc)">✕ Close</button>' +
      ' </header>' +
      ' <div class="viz-body">' +
      '  <section class="viz-left">' +
      '    <div class="viz-code" tabindex="0"></div>' +
      '    <div class="viz-controls">' +
      '      <button class="btn icon" data-act="first" title="First step (Home)">⏮</button>' +
      '      <button class="btn icon" data-act="prev" title="Back (←)">◀</button>' +
      '      <button class="btn primary viz-play" data-act="play" title="Play / pause (Space)">▶ Play</button>' +
      '      <button class="btn icon" data-act="next" title="Forward (→)">▶</button>' +
      '      <button class="btn icon" data-act="last" title="Last step (End)">⏭</button>' +
      '      <select class="viz-speed" title="Playback speed"><option value="1200">Slow</option><option value="600" selected>Normal</option><option value="250">Fast</option><option value="60">Very fast</option></select>' +
      '    </div>' +
      '    <div class="viz-slider-row"><input type="range" class="viz-slider" min="0" max="0" value="0" aria-label="Step"><span class="viz-stepno"></span></div>' +
      '    <div class="viz-explain"></div>' +
      '    <div class="viz-io">' +
      '      <div class="viz-io-box"><div class="viz-io-label">Output (stdout)</div><pre class="viz-out"></pre></div>' +
      '      <div class="viz-io-box viz-in-box"><div class="viz-io-label">Input (stdin) <span class="muted">— grey part is already read</span></div><pre class="viz-in"></pre></div>' +
      '    </div>' +
      '  </section>' +
      '  <section class="viz-right">' +
      '    <div class="viz-mem-wrap"><div class="viz-mem"></div><svg class="viz-arrows" aria-hidden="true"></svg></div>' +
      '    <div class="viz-flow-wrap" hidden></div>' +
      '  </section>' +
      ' </div>' +
      '</div>';
    document.body.appendChild(ov);
    document.body.classList.add('no-scroll');
    var el = ov.querySelector('.viz');
    state = { code: opts.code, lines: opts.code.replace(/\r/g, '').split('\n'), el: el, ov: ov, idx: 0, trace: [], tab: 'memory', playing: false };
    el.querySelector('.viz-name').textContent = opts.title || '';
    el.querySelector('.viz-mem').innerHTML = '<div class="viz-loading"><div class="spinner"></div>Running your program and recording every step…</div>';
    renderCode();
    wire(el);
    var job = Runner.run(opts.code, { stdin: opts.input || '', files: opts.files || {}, trace: true, maxTrace: 3000 });
    state.job = job;
    job.promise.then(function (res) {
      if (!state || state.job !== job) return;
      state.res = res;
      if (res.compileError) {
        el.querySelector('.viz-mem').innerHTML = '<div class="viz-error-big"><strong>Compile error on line ' + res.compileError.line + '</strong><br>' + esc(res.compileError.message) + '<p class="muted">Fix the error in the editor, then press Visualize again.</p></div>';
        markLine(res.compileError.line, 'err');
        return;
      }
      state.trace = res.trace || [];
      if (!state.trace.length) {
        el.querySelector('.viz-mem').innerHTML = '<div class="viz-error-big">' + esc(res.error ? res.error.message : 'Nothing to show') + '</div>';
        return;
      }
      state.ast = null;
      try { state.prog = CI.compile(opts.code); } catch (e) { state.prog = null; }
      var sl = el.querySelector('.viz-slider'); sl.max = state.trace.length - 1;
      if (opts.onDone) opts.onDone(res);
      go(0);
    });
  };

  V.close = function () {
    if (!state) return;
    stop();
    if (state.job) state.job.cancel();
    state.ov.remove();
    document.body.classList.remove('no-scroll');
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    state = null;
  };

  function wire(el) {
    el.querySelector('.viz-close').onclick = V.close;
    state.ov.addEventListener('mousedown', function (e) { if (e.target === state.ov) V.close(); });
    el.querySelectorAll('[data-act]').forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute('data-act');
        if (a === 'play') { state.playing ? stop() : play(); return; }
        stop();
        if (a === 'first') go(0); else if (a === 'last') go(state.trace.length - 1);
        else if (a === 'prev') go(state.idx - 1); else if (a === 'next') go(state.idx + 1);
      };
    });
    el.querySelector('.viz-slider').oninput = function () { stop(); go(+this.value); };
    el.querySelectorAll('.viz-tabs .tab').forEach(function (t) {
      t.onclick = function () {
        el.querySelectorAll('.viz-tabs .tab').forEach(function (x) { x.classList.toggle('active', x === t); });
        state.tab = t.getAttribute('data-tab');
        el.classList.toggle('both', state.tab === 'both');
        el.querySelector('.viz-mem-wrap').hidden = state.tab === 'flow';
        el.querySelector('.viz-flow-wrap').hidden = state.tab === 'memory';
        state.flowFn = null;
        if (state.trace.length) render();
      };
    });
    el.querySelector('.viz-mem-wrap').addEventListener('scroll', drawArrows);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
  }
  function onKey(e) {
    if (!state) return;
    var t = e.target && e.target.tagName;
    if (t === 'INPUT' && e.target.type !== 'range' || t === 'TEXTAREA' || t === 'SELECT') return;
    if (e.key === 'Escape') { V.close(); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { stop(); go(state.idx + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { stop(); go(state.idx - 1); e.preventDefault(); }
    else if (e.key === 'Home') { stop(); go(0); e.preventDefault(); }
    else if (e.key === 'End') { stop(); go(state.trace.length - 1); e.preventDefault(); }
    else if (e.key === ' ') { state.playing ? stop() : play(); e.preventDefault(); }
  }
  var rT;
  function onResize() { clearTimeout(rT); rT = setTimeout(drawArrows, 60); }
  function play() {
    if (!state.trace.length) return;
    if (state.idx >= state.trace.length - 1) go(0);
    state.playing = true;
    var b = state.el.querySelector('.viz-play'); b.textContent = '❚❚ Pause';
    var tick = function () {
      if (!state || !state.playing) return;
      if (state.idx >= state.trace.length - 1) { stop(); return; }
      go(state.idx + 1);
      state.timer = setTimeout(tick, +state.el.querySelector('.viz-speed').value);
    };
    state.timer = setTimeout(tick, 150);
  }
  function stop() {
    if (!state) return;
    state.playing = false; clearTimeout(state.timer);
    var b = state.el.querySelector('.viz-play'); if (b) b.textContent = '▶ Play';
  }
  function go(i) {
    if (!state || !state.trace.length) return;
    i = Math.max(0, Math.min(state.trace.length - 1, i));
    state.idx = i;
    render();
  }

  // ---------------------------------------------------------------- code panel
  function renderCode() {
    var c = state.el.querySelector('.viz-code');
    var html = '';
    state.lines.forEach(function (l, i) {
      html += '<div class="vl" data-line="' + (i + 1) + '"><span class="vl-mark"></span><span class="vl-no">' + (i + 1) + '</span><span class="vl-src">' + (window.Highlight ? Highlight.c(l) : esc(l)) + '</span></div>';
    });
    c.innerHTML = html;
  }
  function markLine(n, cls) {
    var c = state.el.querySelector('.viz-code');
    c.querySelectorAll('.vl.' + cls).forEach(function (e) { e.classList.remove(cls); });
    var e = c.querySelector('.vl[data-line="' + n + '"]');
    if (e) e.classList.add(cls);
    return e;
  }

  // ---------------------------------------------------------------- render a step
  function render() {
    var s = state.trace[state.idx], prev = state.trace[state.idx - 1] || null, el = state.el;
    el.querySelector('.viz-slider').value = state.idx;
    el.querySelector('.viz-stepno').textContent = 'Step ' + (state.idx + 1) + ' of ' + state.trace.length + (state.res && state.res.truncated ? '+' : '');
    // code markers
    var cur = markLine(s.line, 'cur');
    markLine(prev ? prev.line : -1, 'prev');
    var codeBox = el.querySelector('.viz-code');
    codeBox.querySelectorAll('.vl.err').forEach(function (e) { e.classList.remove('err'); });
    if (s.kind === 'error') markLine(s.line, 'err');
    if (cur) {
      var top = cur.offsetTop, hgt = codeBox.clientHeight;
      if (top < codeBox.scrollTop + 20 || top > codeBox.scrollTop + hgt - 40) codeBox.scrollTop = top - hgt / 3;
    }
    // io
    var raw = state.res.stdoutRaw || '';
    el.querySelector('.viz-out').textContent = CI.decodeUtf8(raw.slice(0, s.out));
    var outBox = el.querySelector('.viz-out'); outBox.scrollTop = outBox.scrollHeight;
    renderInput(s);
    // explanation
    el.querySelector('.viz-explain').innerHTML = explain(prev, s);
    // memory / flow
    if (state.tab !== 'flow') renderMemory(s, prev);
    if (state.tab !== 'memory') renderFlow(s);
  }
  function renderInput(s) {
    var box = state.el.querySelector('.viz-in');
    var all = state.inputText != null ? state.inputText : null;
    if (all == null) {
      // reconstruct from the encoded stdin length is not possible — the caller passes it
      all = state.res.__input || '';
    }
    var enc = CI.encodeUtf8(all);
    var used = CI.decodeUtf8(enc.slice(0, s.inPos)), rest = CI.decodeUtf8(enc.slice(s.inPos));
    box.innerHTML = all ? '<span class="used">' + esc(used) + '</span><span class="caret"></span>' + esc(rest) : '<span class="muted">(no input)</span>';
    state.el.querySelector('.viz-in-box').classList.toggle('empty', !all);
  }

  // ---------------------------------------------------------------- explanation
  function flat(snap) {
    var m = {};
    function walk(v, key) {
      if (!v) return;
      if (v.k === 'a') { (v.items || []).forEach(function (it, i) { walk(it, key + '[' + i + ']'); }); return; }
      if (v.k === 's') { v.fields.forEach(function (f) { walk(f, key + '.' + f.n); }); return; }
      m[key] = v.k === 'p' && v.str != null && v.v !== 'NULL' ? v.v : (v.c ? v.v + "'" + v.c : v.v);
    }
    snap.globals.forEach(function (g) { walk(g, 'G:' + g.n); });
    snap.frames.forEach(function (f, fi) { f.vars.forEach(function (v) { walk(v, fi + ':' + f.name + ':' + v.n); }); });
    snap.heap.forEach(function (b) { if (b.v) walk(b.v, 'H:' + b.a); });
    return m;
  }
  function displayKey(k) {
    if (k.indexOf('H:') === 0) { var p = k.slice(2), m = p.match(/^(\d+)(.*)$/); return 'heap block 0x' + (+m[1]).toString(16) + m[2]; }
    var parts = k.split(':');
    return parts[parts.length - 1];
  }
  function pretty(v) { if (v == null) return '—'; var i = String(v).indexOf("'"); return i > 0 ? String(v).slice(0, i) + " ('" + String(v).slice(i + 1) + "')" : String(v); }
  function explain(prev, s) {
    var out = [];
    var top = s.frames[s.frames.length - 1];
    if (s.kind === 'error') out.push('<div class="ex-err"><strong>Runtime error:</strong> ' + esc(s.error || '') + '</div>');
    if (s.kind === 'exit') out.push('<div class="ex-ok">The program ended.</div>');
    if (s.kind === 'call' && top) {
      var args = top.vars.filter(function (v) { return v.param; }).map(function (v) { return '<code>' + esc(v.n) + ' = ' + esc(pretty(v.v)) + '</code>'; });
      out.push('<div><span class="ex-tag call">call</span> Entering <strong>' + esc(top.name) + '()</strong>' + (args.length ? ' with ' + args.join(', ') : '') + (s.frames.length > 1 ? ' — a new frame is pushed on the stack' : '') + '.</div>');
    } else if (s.kind === 'return' && top) {
      out.push('<div><span class="ex-tag ret">return</span> <strong>' + esc(top.name) + '()</strong> is finishing' + (top.ret != null ? ' and returns <code>' + esc(top.ret) + '</code>' : '') + '. Its frame (and local variables) will be removed.</div>');
    } else if (s.kind !== 'error' && s.kind !== 'exit') {
      var lineSrc = (state.lines[s.line - 1] || '').trim();
      var what = s.kind === 'cond' ? 'checks the condition on' : s.kind === 'update' ? 'runs the update part of the for loop on' : s.kind === 'decl' ? 'declares variables on' : s.kind === 'jump' ? 'jumps from' : 'runs';
      out.push('<div><span class="ex-tag next">next</span> The highlighted line ' + s.line + ' is about to run — it ' + what + ' <code>' + esc(lineSrc.length > 70 ? lineSrc.slice(0, 67) + '…' : lineSrc) + '</code></div>');
    }
    if (prev) {
      var a = flat(prev), b = flat(s), changes = [], created = [];
      Object.keys(b).forEach(function (k) {
        if (!(k in a)) { if (k.indexOf('[') < 0 && k.indexOf('.') < 0 && k.indexOf('H:') !== 0) created.push(displayKey(k) + (b[k] !== '?' ? ' = ' + pretty(b[k]) : ' (uninitialised)')); }
        else if (a[k] !== b[k]) changes.push('<code>' + esc(displayKey(k)) + '</code>: ' + esc(pretty(a[k])) + ' → <strong>' + esc(pretty(b[k])) + '</strong>');
      });
      var printed = s.out > prev.out ? CI.decodeUtf8((state.res.stdoutRaw || '').slice(prev.out, s.out)) : '';
      var read = s.inPos > prev.inPos;
      var bits = [];
      if (created.length && s.kind !== 'call') bits.push('created ' + created.slice(0, 6).map(function (c) { return '<code>' + esc(c) + '</code>'; }).join(', '));
      if (changes.length) bits.push('changed ' + changes.slice(0, 6).join('; ') + (changes.length > 6 ? ' …' : ''));
      if (printed) bits.push('printed <code class="printed">' + esc(JSON.stringify(printed).slice(1, -1)) + '</code>');
      if (read) bits.push('read input <code>' + esc(JSON.stringify(CI.decodeUtf8(CI.encodeUtf8(state.inputText || '').slice(prev.inPos, s.inPos))).slice(1, -1)) + '</code>');
      var heapNew = s.heap.length > prev.heap.length ? s.heap.slice(prev.heap.length) : [];
      heapNew.forEach(function (b2) { bits.push('allocated ' + b2.s + ' bytes on the heap with ' + (b2.by || 'malloc')); });
      s.heap.forEach(function (b2, i) { if (b2.freed && prev.heap[i] && !prev.heap[i].freed) bits.push('freed the heap block at 0x' + b2.a.toString(16)); });
      if (bits.length) out.push('<div><span class="ex-tag done">line ' + prev.line + '</span> ' + bits.join('; ') + '.</div>');
      else if (prev.kind === 'cond') out.push('<div><span class="ex-tag done">line ' + prev.line + '</span> the condition was checked (' + (s.line > prev.line || s.frames.length !== prev.frames.length ? 'execution continues on line ' + s.line : 'jumped to line ' + s.line) + ').</div>');
    }
    return out.join('');
  }

  // ---------------------------------------------------------------- memory rendering
  function renderMemory(s, prev) {
    var mem = state.el.querySelector('.viz-mem');
    var pm = prev ? flat(prev) : {};
    var html = '<div class="mem-cols"><div class="mem-col"><div class="mem-col-title">Stack <span class="muted">(frames)</span></div>';
    if (s.globals.length) {
      html += '<div class="frame global"><div class="frame-head">Global variables</div>' + s.globals.map(function (v) { return varRow(v, 'G:' + v.n, pm); }).join('') + '</div>';
    }
    s.frames.forEach(function (f, fi) {
      var active = fi === s.frames.length - 1;
      html += '<div class="frame' + (active ? ' active' : '') + '"><div class="frame-head"><span>' + esc(f.name) + '()</span><span class="frame-line">line ' + f.line + '</span></div>';
      if (!f.vars.length) html += '<div class="frame-empty">no variables yet</div>';
      html += f.vars.map(function (v) { return varRow(v, fi + ':' + f.name + ':' + v.n, pm); }).join('');
      if (f.ret != null) html += '<div class="frame-ret">Return value <span class="cell scalar ret">' + esc(f.ret) + '</span></div>';
      html += '</div>';
    });
    if (!s.frames.length) html += '<div class="frame-empty">The program has finished.</div>';
    html += '</div>';
    if (s.heap.length) {
      html += '<div class="mem-col heap-col"><div class="mem-col-title">Heap <span class="muted">(malloc / calloc)</span></div>';
      s.heap.forEach(function (b) {
        html += '<div class="heap-block' + (b.freed ? ' freed' : '') + '"><div class="frame-head"><span>' + (b.v ? esc(b.v.t) : b.s + ' bytes') + '</span><span class="frame-line">' + (b.freed ? 'freed' : b.s + ' bytes · ' + esc(b.by || '')) + '</span></div>' +
          (b.freed ? '<div class="cell freed-cell" data-addr="' + b.a + '" data-size="' + Math.max(b.s, 1) + '">memory released — do not use</div>' : b.v ? '<div class="var heapv">' + val(b.v, 'H:' + b.a, pm) + '</div>' : '') + '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    mem.innerHTML = html;
    var act = mem.querySelector('.frame.active'), wrap = state.el.querySelector('.viz-mem-wrap');
    if (act && wrap) {
      var ar = act.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
      if (ar.bottom > wr.bottom || ar.top < wr.top) wrap.scrollTop += ar.top - wr.top - 40;
    }
    requestAnimationFrame(drawArrows);
  }
  function varRow(v, key, pm) {
    var tags = (v.param ? '<span class="vtag">param</span>' : '') + (v.isStatic ? '<span class="vtag">static</span>' : '') + (v.shadowed ? '<span class="vtag">shadowed</span>' : '');
    return '<div class="var' + (v.shadowed ? ' shadowed' : '') + '"><div class="vhead"><span class="vname">' + esc(v.n) + '</span><span class="vtype">' + esc(v.t) + '</span>' + tags + '</div><div class="vval">' + val(v, key, pm) + '</div></div>';
  }
  function changed(key, v, pm) {
    if (!(key in pm)) return false;
    var now = v.k === 'p' && v.str != null && v.v !== 'NULL' ? v.v : (v.c ? v.v + "'" + v.c : v.v);
    return pm[key] !== now;
  }
  function val(v, key, pm) {
    var da = ' data-addr="' + v.a + '" data-size="' + Math.max(v.s || 1, 1) + '"';
    if (v.k === 'v') {
      var ch = changed(key, v, pm) ? ' changed' : '';
      if (v.v === '?') return '<span class="cell scalar uninit' + ch + '"' + da + ' title="Uninitialised — holds garbage">?</span>';
      if (v.c !== undefined) return '<span class="cell scalar chr' + ch + '"' + da + ' title="char value ' + esc(v.v) + '">' + (v.c ? "'" + esc(v.c) + "'" : esc(v.v)) + '<small>' + esc(v.v) + '</small></span>';
      return '<span class="cell scalar' + ch + '"' + da + '>' + esc(v.v) + '</span>';
    }
    if (v.k === 'p') {
      var ch2 = changed(key, v, pm) ? ' changed' : '';
      if (v.v === '?') return '<span class="cell ptr uninit' + ch2 + '"' + da + ' title="Uninitialised pointer — points to garbage">?</span>';
      if (v.v === 'NULL') return '<span class="cell ptr null' + ch2 + '"' + da + '>NULL</span>';
      if (v.fn || v.file) return '<span class="cell ptr fn' + ch2 + '"' + da + '>' + esc(v.v) + '</span>';
      if (v.bad) return '<span class="cell ptr bad' + ch2 + '"' + da + ' title="' + esc(v.v) + '">⚠ ' + esc(v.bad) + '</span>';
      return '<span class="cell ptr' + ch2 + '"' + da + ' data-to="' + v.to + '" title="' + esc(v.v) + '"><span class="paddr">' + esc(v.v) + '</span><span class="dot"></span></span>' + (v.str != null ? '<span class="pstr">"' + esc(v.str) + '"</span>' : '');
    }
    if (v.k === 'a') {
      var items = v.items || [];
      var isGrid = items.length && items[0].k === 'a';
      var more = v.len > items.length ? '<span class="arr-more">… ' + (v.len - items.length) + ' more</span>' : '';
      if (isGrid) {
        var cols = items[0].items ? items[0].items.length : 0;
        var g = '<div class="grid"' + da + '><table><tr><th></th>';
        for (var c = 0; c < cols; c++) g += '<th>' + c + '</th>';
        g += '</tr>';
        items.forEach(function (row, r) {
          g += '<tr><th>' + r + '</th>';
          (row.items || []).forEach(function (it, c2) { g += '<td>' + val(it, key + '[' + r + '][' + c2 + ']', pm) + '</td>'; });
          g += '</tr>';
        });
        return g + '</table>' + more + (items[0].str != null ? '<div class="grid-strs">' + items.map(function (r, i) { return '<span>[' + i + '] "' + esc(r.str) + '"</span>'; }).join('') + '</div>' : '') + '</div>';
      }
      var a = '<div class="arr"' + da + '>';
      if (v.str != null) a += '<div class="arr-str">"' + esc(v.str) + '"' + (v.term ? '' : ' <span class="warn-txt" title="No \\0 inside the array">no \\0!</span>') + '</div>';
      a += '<div class="arr-cells">';
      items.forEach(function (it, i) {
        a += '<div class="arr-cell"><div class="arr-v">' + val(it, key + '[' + i + ']', pm) + '</div><div class="arr-i">' + i + '</div></div>';
      });
      return a + more + '</div></div>';
    }
    if (v.k === 's') {
      var st = '<div class="struct' + (v.union ? ' union' : '') + '"' + da + '>';
      v.fields.forEach(function (f) { st += '<div class="sfield"><span class="sname">.' + esc(f.n) + '</span>' + val(f, key + '.' + f.n, pm) + '</div>'; });
      return st + '</div>';
    }
    return '<span class="cell">?</span>';
  }

  // ---------------------------------------------------------------- arrows
  function drawArrows() {
    if (!state) return;
    var wrap = state.el.querySelector('.viz-mem-wrap'), svg = state.el.querySelector('.viz-arrows');
    if (!wrap || wrap.hidden) return;
    var mem = state.el.querySelector('.viz-mem');
    svg.setAttribute('width', mem.clientWidth); svg.setAttribute('height', mem.scrollHeight);
    svg.style.width = mem.clientWidth + 'px'; svg.style.height = mem.scrollHeight + 'px';
    var base = mem.getBoundingClientRect();
    var targets = Array.prototype.slice.call(mem.querySelectorAll('[data-addr]')).map(function (e) { return { e: e, a: +e.getAttribute('data-addr'), s: +e.getAttribute('data-size') }; });
    var paths = '<defs><marker id="vz-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker></defs>';
    var loops = [];
    mem.querySelectorAll('[data-to]').forEach(function (p) {
      var to = +p.getAttribute('data-to'), best = null, edge = false;
      targets.forEach(function (t) {
        if (t.e === p) return;
        if (to >= t.a && to < t.a + t.s && (!best || t.s < best.s)) best = t;
      });
      if (!best) targets.forEach(function (t) { if (to === t.a + t.s && t.e.classList.contains('arr') && (!best || t.s < best.s)) { best = t; edge = true; } });
      if (!best) { p.classList.add('dangling'); return; }
      // arrows leave from the dot on the right edge of the pointer box
      var dot = p.querySelector('.dot') || p;
      var r1 = dot.getBoundingClientRect(), r2 = best.e.getBoundingClientRect(), rc = p.getBoundingClientRect();
      var x1 = r1.left + r1.width / 2 - base.left, y1 = r1.top + r1.height / 2 - base.top;
      var x2, y2 = r2.top + Math.min(r2.height / 2, 15) - base.top, d;
      if (!edge && r2.left > rc.right + 16) {
        // target is further right (e.g. on the heap): enter its left edge
        x2 = r2.left - base.left - 3;
        var dx = Math.max(30, (x2 - x1) * 0.5);
        d = 'M' + x1 + ',' + y1 + ' C' + (x1 + dx) + ',' + y1 + ' ' + (x2 - dx) + ',' + y2 + ' ' + x2 + ',' + y2;
      } else {
        // target is above/below/left: loop out to the right, then come back into its right edge.
        // Each arrow gets its own lane so they never sit on top of each other.
        x2 = r2.right - base.left + 3;
        if (edge) y2 = r2.top + r2.height / 2 - base.top;
        var box1 = (p.closest('.frame, .heap-block') || p).getBoundingClientRect(), box2 = (best.e.closest('.frame, .heap-block') || best.e).getBoundingClientRect();
        loops.push({ x1: x1, y1: y1, x2: x2, y2: y2, edge: Math.max(box1.right, box2.right) - base.left, hot: p.classList.contains('changed') });
        return;
      }
      paths += '<path d="' + d + '" class="arrow' + (p.classList.contains('changed') ? ' hot' : '') + '" marker-end="url(#vz-ah)"/>';
    });
    // Same-column arrows: out to the right, along a vertical lane, back into the target's right edge.
    // Short arrows get the inner lanes, long ones the outer lanes, so nested arrows never cross.
    loops.sort(function (a, b) { return Math.abs(a.y2 - a.y1) - Math.abs(b.y2 - b.y1); });
    var right = 0; loops.forEach(function (l) { right = Math.max(right, l.x1, l.x2, l.edge); });
    loops.forEach(function (l, i) {
      var lane = right + 14 + 14 * i, r = Math.min(8, Math.abs(l.y2 - l.y1) / 2), dir = l.y2 < l.y1 ? -1 : 1;
      var d = 'M' + l.x1 + ',' + l.y1 + ' H' + (lane - r) + ' Q' + lane + ',' + l.y1 + ' ' + lane + ',' + (l.y1 + dir * r) +
        ' V' + (l.y2 - dir * r) + ' Q' + lane + ',' + l.y2 + ' ' + (lane - r) + ',' + l.y2 + ' H' + l.x2;
      paths += '<path d="' + d + '" class="arrow' + (l.hot ? ' hot' : '') + '" marker-end="url(#vz-ah)"/>';
    });
    svg.innerHTML = paths;
  }

  // ---------------------------------------------------------------- flowchart tab
  function renderFlow(s) {
    var box = state.el.querySelector('.viz-flow-wrap');
    if (!state.prog || !window.Flow) { box.innerHTML = '<div class="viz-error-big">Flowchart not available.</div>'; return; }
    var top = s.frames[s.frames.length - 1];
    var fname = state.flowPinned || (top ? top.name : 'main');
    if (state.flowFn !== fname) {
      state.flowFn = fname;
      Flow.render(box, state.prog, state.code, fname, function (n) { state.flowPinned = n; state.flowFn = null; render(); });
    }
    Flow.highlight(box, top && top.name === fname ? s.line : -1, s.kind);
  }

  V.setInput = function (t) { if (state) state.inputText = t; };
  window.Viz = {
    open: function (opts) { V.open(opts); if (state) { state.inputText = opts.input || ''; } },
    close: V.close
  };
})();
