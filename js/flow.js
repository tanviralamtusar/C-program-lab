/* Flowchart view: builds a control-flow graph from the parsed C program (one chart per function),
   lays it out with dagre and draws classic flowchart shapes in SVG.
   Shapes: oval = start/end, rectangle = process, parallelogram = input/output,
   diamond = decision, double-bar rectangle = call to your own function. */
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var IO_FUNCS = { printf: 1, scanf: 1, puts: 1, gets: 1, putchar: 1, getchar: 1, fgets: 1, fputs: 1, fprintf: 1, fscanf: 1, fgetc: 1, fputc: 1 };

  function headerParts(line, kw) {
    var m = new RegExp('\\b' + kw + '\\b').exec(line);
    if (!m) return null;
    var i = line.indexOf('(', m.index);
    if (i < 0) return null;
    var depth = 0, j = i, parts = [], cur = '';
    for (; j < line.length; j++) {
      var c = line[j];
      if (c === '(') { depth++; if (depth === 1) continue; }
      if (c === ')') { depth--; if (depth === 0) break; }
      if (c === ';' && depth === 1) { parts.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    parts.push(cur.trim());
    return parts;
  }
  function clip(s, n) { s = s.replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  function buildCFG(fn, lines) {
    var nodes = [], edges = [];
    var labels = {};
    function txt(n) { return (lines[n - 1] || '').replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '').trim(); }
    function node(kind, label, lns) { var id = 'n' + nodes.length; nodes.push({ id: id, kind: kind, label: label, lines: lns || [] }); return id; }
    function link(preds, to) { preds.forEach(function (p) { edges.push({ from: p.n, to: to, label: p.l || '' }); }); }
    var start = node('term', 'Start: ' + fn.name + '()', [fn.line]);
    var end = node('term', fn.name === 'main' ? 'End' : 'Return to caller', [fn.endLine]);
    var loops = [];

    function stmtLabel(s) {
      var t = txt(s.line).replace(/\{\s*$/, '').replace(/^\}\s*/, '');
      return t;
    }
    function isIO(s) { return s.k === 'expr' && s.e.k === 'call' && IO_FUNCS[s.e.fname]; }
    function isUserCall(s) {
      if (s.k !== 'expr') return false;
      var e = s.e; if (e.k === 'assign') e = e.r; while (e && e.k === 'cast') e = e.e;
      return e && e.k === 'call' && e.sym && !e.sym.builtin;
    }
    function simple(s) { return s.k === 'expr' || s.k === 'decl' || s.k === 'declgroup'; }

    function seq(list, preds) {
      var buf = [];
      function flush() {
        if (!buf.length) return;
        var seenLines = {}, labs = [], lns = [];
        buf.forEach(function (s) { if (!seenLines[s.line]) { seenLines[s.line] = 1; labs.push(stmtLabel(s)); lns.push(s.line); } });
        var id = node('proc', labs.join('\n'), lns);
        link(preds, id); preds = [{ n: id }];
        buf = [];
      }
      for (var i = 0; i < list.length; i++) {
        var s = list[i];
        if (s.k === 'decl' && !s.hasInit && !s.sym.vla) continue; // plain declarations are not actions
        if (s.k === 'decl' && s.isStatic) continue;
        if (simple(s) && !isIO(s) && !isUserCall(s)) {
          if (buf.length && buf[buf.length - 1].line !== s.line && buf.length >= 3) flush();
          buf.push(s); continue;
        }
        flush();
        preds = one(s, preds);
      }
      flush();
      return preds;
    }
    function one(s, preds) {
      var id, r;
      switch (s.k) {
        case 'block': return seq(s.body, preds);
        case 'expr': case 'decl': case 'declgroup':
          id = node(isIO(s) ? 'io' : isUserCall(s) ? 'call' : 'proc', stmtLabel(s), [s.line]);
          link(preds, id); return [{ n: id }];
        case 'if': {
          var hp = headerParts(txt(s.line), 'if');
          id = node('dec', (hp ? hp[0] : 'condition') + ' ?', [s.line]);
          link(preds, id);
          var t = one(s.then, [{ n: id, l: 'Yes' }]);
          var e = s.els ? one(s.els, [{ n: id, l: 'No' }]) : [{ n: id, l: 'No' }];
          return t.concat(e);
        }
        case 'while': {
          var wp = headerParts(txt(s.line), 'while');
          id = node('dec', (wp ? wp[0] : 'condition') + ' ?', [s.line]);
          link(preds, id);
          loops.push({ br: [], ct: [] });
          var b = one(s.body, [{ n: id, l: 'Yes' }]);
          var L = loops.pop();
          link(b.concat(L.ct), id);
          return [{ n: id, l: 'No' }].concat(L.br);
        }
        case 'do': {
          var j = node('join', '', []);
          link(preds, j);
          loops.push({ br: [], ct: [] });
          var db = one(s.body, [{ n: j }]);
          var dl = loops.pop();
          var dp = headerParts(txt(s.condLine), 'while');
          id = node('dec', (dp ? dp[0] : 'condition') + ' ?', [s.condLine]);
          link(db.concat(dl.ct), id);
          edges.push({ from: id, to: j, label: 'Yes' });
          return [{ n: id, l: 'No' }].concat(dl.br);
        }
        case 'for': {
          var fp = headerParts(txt(s.line), 'for') || ['', '', ''];
          if (s.init) { var ii = node('proc', fp[0] || 'init', [s.line]); link(preds, ii); preds = [{ n: ii }]; }
          id = node('dec', (s.cond ? (fp[1] || 'condition') : 'forever') + ' ?', [s.line]);
          link(preds, id);
          loops.push({ br: [], ct: [] });
          var fb = one(s.body, [{ n: id, l: 'Yes' }]);
          var fl = loops.pop();
          var back = fb.concat(fl.ct);
          if (s.update) { var u = node('proc', fp[2] || 'update', [s.line]); link(back, u); back = [{ n: u }]; }
          link(back, id);
          return (s.cond ? [{ n: id, l: 'No' }] : []).concat(fl.br);
        }
        case 'switch': {
          var sp = headerParts(txt(s.line), 'switch');
          id = node('dec', 'switch (' + (sp ? sp[0] : '…') + ')', [s.line]);
          link(preds, id);
          var body = s.body.k === 'block' ? s.body.body : [s.body];
          loops.push({ br: [], ct: null, sw: true });
          var cur = [], hasDef = false, segs = [];
          body.forEach(function (st) { if (st.k === 'case') segs.push({ c: st, items: [] }); else if (segs.length) segs[segs.length - 1].items.push(st); });
          segs.forEach(function (sg) {
            var lab = sg.c.def ? 'default' : 'case ' + caseText(sg.c);
            if (sg.c.def) hasDef = true;
            cur = seq(sg.items, cur.concat([{ n: id, l: lab }]));
          });
          var sl = loops.pop();
          var outs = cur.concat(sl.br);
          if (!hasDef) outs.push({ n: id, l: 'no match' });
          return outs;
        }
        case 'break': {
          for (var k = loops.length - 1; k >= 0; k--) { loops[k].br = loops[k].br.concat(preds); break; }
          return [];
        }
        case 'continue': {
          for (var k2 = loops.length - 1; k2 >= 0; k2--) if (loops[k2].ct) { loops[k2].ct = loops[k2].ct.concat(preds); break; }
          return [];
        }
        case 'return': {
          id = node('proc', txt(s.line).replace(/\}\s*$/, '').trim(), [s.line]);
          nodes[nodes.length - 1].ret = true;
          link(preds, id);
          edges.push({ from: id, to: end, label: '' });
          return [];
        }
        case 'goto': {
          var tgt = labels[s.label] || (labels[s.label] = node('join', s.label + ':', []));
          id = node('proc', 'goto ' + s.label, [s.line]);
          link(preds, id);
          edges.push({ from: id, to: tgt, label: '' });
          return [];
        }
        case 'label': {
          var lj = labels[s.name] || (labels[s.name] = node('join', s.name + ':', []));
          nodes.forEach(function (n) { if (n.id === lj) n.lines = [s.line]; });
          link(preds, lj);
          return [{ n: lj }];
        }
        case 'case': case 'empty': return preds;
      }
      return preds;
    }
    function caseText(c) {
      var m = /case\s+(.+?)\s*:/.exec(txt(c.line));
      return m ? m[1] : String(c.v);
    }
    var exits = seq(fn.body.body, [{ n: start }]);
    link(exits, end);
    // drop nodes nobody reaches (e.g. after return)
    return { nodes: nodes, edges: edges, start: start, end: end };
  }

  var CW = 7.4, LH = 16;
  function size(n) {
    var lines = (n.label || '').split('\n').map(function (l) { return clip(l, 38); });
    n.text = lines;
    var w = Math.max.apply(null, lines.map(function (l) { return l.length; })) * CW;
    var hgt = lines.length * LH;
    switch (n.kind) {
      case 'dec': return { width: Math.max(110, w * 1.25 + 40), height: Math.max(56, hgt * 1.6 + 26) };
      case 'term': return { width: w + 44, height: 36 };
      case 'io': return { width: w + 50, height: hgt + 18 };
      case 'call': return { width: w + 44, height: hgt + 18 };
      case 'join': return n.label ? { width: n.label.length * CW + 18, height: 24 } : { width: 12, height: 12 };
    }
    return { width: w + 26, height: hgt + 18 };
  }
  function shape(n, x, y, w, hh) {
    var l = x - w / 2, t = y - hh / 2;
    switch (n.kind) {
      case 'term': return '<rect class="fs term" x="' + l + '" y="' + t + '" width="' + w + '" height="' + hh + '" rx="' + hh / 2 + '"/>';
      case 'dec': return '<polygon class="fs dec" points="' + x + ',' + t + ' ' + (l + w) + ',' + y + ' ' + x + ',' + (t + hh) + ' ' + l + ',' + y + '"/>';
      case 'io': var k = 12; return '<polygon class="fs io" points="' + (l + k) + ',' + t + ' ' + (l + w) + ',' + t + ' ' + (l + w - k) + ',' + (t + hh) + ' ' + l + ',' + (t + hh) + '"/>';
      case 'call': return '<rect class="fs call" x="' + l + '" y="' + t + '" width="' + w + '" height="' + hh + '"/><line class="fs-bar" x1="' + (l + 8) + '" y1="' + t + '" x2="' + (l + 8) + '" y2="' + (t + hh) + '"/><line class="fs-bar" x1="' + (l + w - 8) + '" y1="' + t + '" x2="' + (l + w - 8) + '" y2="' + (t + hh) + '"/>';
      case 'join': return n.label ? '<rect class="fs join lbl" x="' + l + '" y="' + t + '" width="' + w + '" height="' + hh + '" rx="6"/>' : '<circle class="fs join" cx="' + x + '" cy="' + y + '" r="5"/>';
    }
    return '<rect class="fs proc' + (n.ret ? ' retn' : '') + '" x="' + l + '" y="' + t + '" width="' + w + '" height="' + hh + '" rx="4"/>';
  }

  function render(box, prog, code, fname, onPick) {
    var lines = code.replace(/\r/g, '').split('\n');
    var fns = prog.funcs.filter(function (f) { return f.def && !f.builtin && f.def.body; });
    var fsym = fns.filter(function (f) { return f.name === fname; })[0] || fns.filter(function (f) { return f.name === 'main'; })[0];
    var bar = '<div class="flow-bar"><span class="muted">Function:</span> ' + fns.map(function (f) { return '<button class="chip' + (f === fsym ? ' active' : '') + '" data-fn="' + esc(f.name) + '">' + esc(f.name) + '()</button>'; }).join('') +
      '<span class="flow-legend"><i class="flg term"></i>start/end <i class="flg proc"></i>process <i class="flg io"></i>input/output <i class="flg dec"></i>decision <i class="flg call"></i>function call</span></div>';
    if (typeof dagre === 'undefined') { box.innerHTML = bar + '<div class="viz-error-big">The flowchart library (dagre) could not be loaded — check your internet connection.</div>'; return; }
    var cfg = buildCFG(fsym.def, lines);
    var g = new dagre.graphlib.Graph({ multigraph: true });
    g.setGraph({ rankdir: 'TB', nodesep: 28, ranksep: 34, edgesep: 14, marginx: 20, marginy: 20 });
    g.setDefaultEdgeLabel(function () { return {}; });
    cfg.nodes.forEach(function (n) { var s = size(n); g.setNode(n.id, { width: s.width, height: s.height, n: n }); });
    cfg.edges.forEach(function (e, i) { g.setEdge(e.from, e.to, { label: e.label, width: e.label ? e.label.length * 6.5 + 6 : 0, height: e.label ? 14 : 0, labelpos: 'c' }, 'e' + i); });
    dagre.layout(g);
    var gr = g.graph();
    var svg = '<svg class="flow-svg" width="' + Math.ceil(gr.width) + '" height="' + Math.ceil(gr.height) + '" viewBox="0 0 ' + Math.ceil(gr.width) + ' ' + Math.ceil(gr.height) + '">' +
      '<defs><marker id="fl-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker></defs>';
    g.edges().forEach(function (ed) {
      var e = g.edge(ed), pts = e.points;
      var d = 'M' + pts[0].x + ',' + pts[0].y;
      for (var i = 1; i < pts.length; i++) {
        if (i < pts.length - 1) { var mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2; d += ' Q' + pts[i].x + ',' + pts[i].y + ' ' + mx + ',' + my; }
        else d += ' L' + pts[i].x + ',' + pts[i].y;
      }
      var back = pts[pts.length - 1].y < pts[0].y;
      svg += '<path class="fe' + (back ? ' back' : '') + '" d="' + d + '" marker-end="url(#fl-ah)"/>';
      if (e.label) svg += '<text class="fe-label ' + (e.label === 'Yes' ? 'yes' : e.label === 'No' ? 'no' : '') + '" x="' + e.x + '" y="' + (e.y + 4) + '" text-anchor="middle">' + esc(e.label) + '</text>';
    });
    g.nodes().forEach(function (id) {
      var nd = g.node(id), n = nd.n;
      svg += '<g class="fn-node k-' + n.kind + '" data-lines="' + n.lines.join(',') + '" data-id="' + id + '"' + (n.lines.length ? ' data-line-title="line ' + n.lines.join(', ') + '"' : '') + '>' + shape(n, nd.x, nd.y, nd.width, nd.height);
      if (n.kind !== 'join' || n.label) {
        var tl = n.kind === 'join' ? [n.label] : n.text;
        var y0 = nd.y - (tl.length - 1) * LH / 2 + 4;
        tl.forEach(function (l, i) { svg += '<text x="' + nd.x + '" y="' + (y0 + i * LH) + '" text-anchor="middle">' + esc(l) + '</text>'; });
      }
      if (n.lines.length) svg += '<title>line ' + n.lines.join(', ') + '</title>';
      svg += '</g>';
    });
    svg += '</svg>';
    box.innerHTML = bar + '<div class="flow-canvas">' + svg + '</div>';
    box.querySelectorAll('.flow-bar .chip').forEach(function (c) { c.onclick = function () { onPick && onPick(c.getAttribute('data-fn')); }; });
    box._cfg = { start: cfg.start, end: cfg.end, fn: fsym.def };
  }
  function highlight(box, line, kind) {
    box.querySelectorAll('.fn-node.cur').forEach(function (e) { e.classList.remove('cur'); });
    if (line < 0 || !box._cfg) return;
    var target = null;
    if (kind === 'call') target = box.querySelector('[data-id="' + box._cfg.start + '"]');
    else if (kind === 'return' && line === box._cfg.fn.endLine) target = box.querySelector('[data-id="' + box._cfg.end + '"]');
    else {
      var cands = Array.prototype.filter.call(box.querySelectorAll('.fn-node'), function (e) { return (',' + e.getAttribute('data-lines') + ',').indexOf(',' + line + ',') >= 0; });
      // for loops: init, condition and update share the line; pick by step kind
      if (cands.length > 1) {
        var pick = cands.filter(function (e) { return kind === 'cond' ? e.classList.contains('k-dec') : kind === 'update' ? !e.classList.contains('k-dec') : true; });
        if (kind === 'update') target = pick[pick.length - 1];
        else if (kind === 'cond') target = pick[0];
        else target = cands.filter(function (e) { return !e.classList.contains('k-dec'); })[0] || cands[0];
      } else target = cands[0];
    }
    if (target) {
      target.classList.add('cur');
      var canvas = box.querySelector('.flow-canvas');
      var r = target.getBoundingClientRect(), cr = canvas.getBoundingClientRect();
      if (r.top < cr.top + 30 || r.bottom > cr.bottom - 30) canvas.scrollTop += (r.top - cr.top) - cr.height / 3;
      if (r.left < cr.left || r.right > cr.right) canvas.scrollLeft += (r.left - cr.left) - cr.width / 3;
    }
  }
  window.Flow = { render: render, highlight: highlight, buildCFG: buildCFG };
})();
