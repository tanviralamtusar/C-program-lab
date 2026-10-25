// Builds js/data/content.js from content/*.md and verifies every example and reference solution
// with the site's own C interpreter.
//   node tools/build.js            build + verify
//   node tools/build.js --only=loops
const fs = require('fs'), path = require('path');
const CI = require('./ci-node.js');
const judge = require('../js/judge.js');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const only = (args.find(a => a.startsWith('--only=')) || '').slice(7);
const noVerify = args.includes('--no-verify');

// ---------------------------------------------------------------- markdown -> html
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
       .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
       .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  s = s.replace(/\u0000(\d+)\u0000/g, (m, i) => '<code>' + esc(codes[+i]) + '</code>');
  return s;
}
function splitRow(line) {
  line = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = []; let cur = '', inCode = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '\\' && line[i + 1] === '|') { cur += '|'; i++; continue; }
    if (c === '`') inCode = !inCode;
    if (c === '|' && !inCode) { cells.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  cells.push(cur.trim());
  return cells;
}
function mdToHtml(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  let html = '', i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^```(\w*)/))) {
      const lang = m[1]; const buf = []; i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++;
      html += `<pre class="code-block"><code class="lang-${lang || 'text'}">${esc(buf.join('\n'))}</code></pre>\n`;
      continue;
    }
    if ((m = l.match(/^(#{2,4})\s+(.*)/))) { const lv = m[1].length + 1; html += `<h${lv}>${inline(m[2])}</h${lv}>\n`; i++; continue; }
    if (/^\s*\|/.test(l) && lines[i + 1] && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const head = splitRow(l); i += 2;
      let t = '<div class="table-wrap"><table><thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      while (i < lines.length && /^\s*\|/.test(lines[i])) { t += '<tr>' + splitRow(lines[i]).map(c => `<td>${inline(c)}</td>`).join('') + '</tr>'; i++; }
      html += t + '</tbody></table></div>\n'; continue;
    }
    if (/^>\s?/.test(l)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      const text = buf.join(' ');
      const kind = /^\*\*(Tip|Warning|Note|Remember|Important)/i.exec(text);
      html += `<div class="callout callout-${kind ? kind[1].toLowerCase() : 'note'}">${inline(text)}</div>\n`;
      continue;
    }
    if (/^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l)) {
      const ordered = /^\s*\d+\./.test(l);
      const items = [];
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        const li = lines[i];
        if (/^\s*([-*]|\d+\.)\s+/.test(li) && !(/^\s{2,}/.test(li) && items.length && false)) items.push(li.replace(/^\s*([-*]|\d+\.)\s+/, ''));
        else items[items.length - 1] += ' ' + li.trim();
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      html += `<${tag}>` + items.map(x => `<li>${inline(x)}</li>`).join('') + `</${tag}>\n`;
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{2,4}\s|>|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i]) && !(/^\s*\|/.test(lines[i]) && lines[i + 1] && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1]))) buf.push(lines[i++]);
    if (!buf.length) { html += `<p>${inline(lines[i++])}</p>\n`; continue; }
    html += `<p>${buf.map(inline).join('<br>\n')}</p>\n`;
  }
  return html;
}

// ---------------------------------------------------------------- lesson parser
function parseFences(lines) {
  // returns list of segments: {kind:'md', text} | {kind:'fence', info, body}
  const segs = []; let md = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^```(\S*)\s*(\S*)\s*$/);
    if (m && (m[1] || m[2])) {
      const info = (m[1] + ' ' + m[2]).trim();
      const body = []; i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      if (i >= lines.length) throw new Error('Unclosed fence ```' + info);
      if (/^(c run|c starter|c solution|input|output|test|quiz|quiz run|hint)$/.test(info)) {
        if (md.length) segs.push({ kind: 'md', text: md.join('\n') }); md = [];
        segs.push({ kind: 'fence', info, body: body.join('\n') });
      } else {
        md.push('```' + info.split(' ')[0]); md.push(...body); md.push('```');
      }
      continue;
    }
    md.push(lines[i]);
  }
  if (md.length) segs.push({ kind: 'md', text: md.join('\n') });
  return segs;
}
function parseQuiz(body, where) {
  const lines = body.split('\n');
  let q = [], code = null, opts = [], rawOpts = [], answer = -1, explain = '';
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^~~~/.test(l)) { const c = []; i++; while (i < lines.length && !/^~~~/.test(lines[i])) c.push(lines[i++]); code = c.join('\n'); continue; }
    let m;
    if ((m = l.match(/^\s*-\s*\[( |x|X)\]\s?(.*)$/))) { if (m[1] !== ' ') answer = opts.length; opts.push(m[2]); rawOpts.push(m[2]); continue; }
    if ((m = l.match(/^>\s?(.*)/))) { explain += (explain ? ' ' : '') + m[1]; continue; }
    if (!opts.length) q.push(l);
  }
  if (answer < 0 || opts.length < 2) throw new Error('Bad quiz in ' + where + ': ' + body.slice(0, 80));
  return { type: 'quiz', q: inline(q.join(' ').trim()), code, options: opts.map(inline), answer, explain: inline(explain), rawAnswer: rawOpts[answer] };
}
function parseTest(body) {
  const t = { input: '', output: '', files: {} };
  let cur = null, buf = [];
  const flush = () => {
    if (!cur) return;
    const text = buf.join('\n');
    if (cur === 'input') t.input = text + (text ? '\n' : '');
    else if (cur === 'output') t.output = text;
    else t.files[cur.slice(5)] = text + (text ? '\n' : '');
    buf = [];
  };
  for (const l of body.split('\n')) {
    const m = l.match(/^===\s*(input|output|file\s+\S+)\s*$/);
    if (m) { flush(); cur = m[1].replace(/\s+/g, ' '); continue; }
    buf.push(l);
  }
  flush();
  return t;
}
function parseLesson(file) {
  const src = fs.readFileSync(file, 'utf8').replace(/\r/g, '');
  const fm = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) throw new Error(file + ': missing front matter');
  const meta = {};
  fm[1].split('\n').forEach(l => { const m = l.match(/^(\w+):\s*(.*)$/); if (m) meta[m[1]] = m[2].replace(/^"(.*)"$/, '$1'); });
  const body = src.slice(fm[0].length).split('\n');
  const sections = []; let cur = null;
  let inFence = false;
  for (const l of body) {
    if (/^```/.test(l)) inFence = !inFence && !/^```\s*$/.test(l) ? true : (inFence ? false : !/^```\s*$/.test(l));
    const m = !inFence && l.match(/^# (Step|Problem|Question):\s*(.*)$/);
    if (m) { cur = { kind: m[1], title: m[2].trim(), lines: [] }; sections.push(cur); continue; }
    if (cur) cur.lines.push(l);
  }
  const lesson = { id: meta.id, title: meta.title, order: +meta.order, summary: meta.summary, steps: [], problems: [] };
  if (meta.duration) { lesson.duration = +meta.duration; lesson.covers = meta.covers; lesson.items = []; lesson.group = meta.group || 'exam'; if (meta.lesson) lesson.lessonRef = meta.lesson; }
  for (const s of sections) {
    if (s.kind === 'Step') lesson.steps.push(parseStep(s, meta.id));
    else if (s.kind === 'Question') { const q = parseQuestion(s, meta.id); lesson.items.push(q); }
    else { const p = parseProblem(s, meta.id); lesson.problems.push(p); if (lesson.items) lesson.items.push({ type: 'problem', id: p.id, marks: p.marks }); }
  }
  return lesson;
}
function parseStep(s, lid) {
  const segs = parseFences(s.lines);
  const blocks = [];
  for (let i = 0; i < segs.length; i++) {
    const g = segs[i];
    if (g.kind === 'md') { const h = mdToHtml(g.text); if (h.trim()) blocks.push({ type: 'html', html: h }); continue; }
    if (g.info === 'c run') {
      const ex = { type: 'example', code: g.body + '\n', input: '', output: null };
      while (segs[i + 1] && segs[i + 1].kind === 'fence' && (segs[i + 1].info === 'input' || segs[i + 1].info === 'output')) {
        const n = segs[++i];
        if (n.info === 'input') ex.input = n.body + (n.body ? '\n' : ''); else ex.output = n.body;
      }
      blocks.push(ex);
      continue;
    }
    if (g.info === 'quiz') { blocks.push(parseQuiz(g.body, lid + ' / ' + s.title)); continue; }
    if (g.info === 'input' || g.info === 'output') { blocks.push({ type: 'html', html: `<pre class="code-block io"><code>${esc(g.body)}</code></pre>` }); continue; }
    throw new Error(`${lid}/${s.title}: unexpected fence ${g.info} in a step`);
  }
  return { title: s.title, blocks };
}
function parseQuestion(s, lid) {
  let marks = 1; const rest = [];
  for (const l of s.lines) { const m = l.match(/^marks:\s*(\d+)/); if (m && !rest.some(x => x.trim())) { marks = +m[1]; continue; } rest.push(l); }
  const segs = parseFences(rest);
  const qf = segs.find(g => g.kind === 'fence' && /^quiz/.test(g.info));
  if (!qf) throw new Error(lid + ': question "' + s.title + '" has no quiz fence');
  const q = parseQuiz(qf.body, lid + ' / ' + s.title);
  q.run = qf.info === 'quiz run';
  const pre = segs.filter(g => g.kind === 'md').map(g => g.text).join('\n');
  return { type: 'question', title: s.title, marks, intro: pre.trim() ? mdToHtml(pre) : '', quiz: q };
}
function parseProblem(s, lid) {
  const p = { title: s.title, lesson: lid, tests: [], hints: [] };
  let i = 0;
  while (i < s.lines.length && !s.lines[i].trim()) i++;
  while (i < s.lines.length) {
    const m = s.lines[i].match(/^(id|difficulty|source|kind|marks):\s*(.*)$/);
    if (!m) break;
    p[m[1]] = m[2].trim(); i++;
  }
  const segs = parseFences(s.lines.slice(i));
  let statement = '';
  for (const g of segs) {
    if (g.kind === 'md') { statement += g.text + '\n'; continue; }
    switch (g.info) {
      case 'c starter': p.starter = g.body + '\n'; break;
      case 'c solution': p.solution = g.body + '\n'; break;
      case 'test': p.tests.push(parseTest(g.body)); break;
      case 'hint': p.hints.push(mdToHtml(g.body)); break;
      case 'c run': statement += '```c\n' + g.body + '\n```\n'; break;
      default: statement += '```\n' + g.body + '\n```\n';
    }
  }
  p.statement = mdToHtml(statement);
  if (!p.id) throw new Error(`${lid}: problem "${s.title}" has no id`);
  if (!p.solution) throw new Error(`${p.id}: no solution`);
  if (!p.starter) p.starter = '#include <stdio.h>\n\nint main(void) {\n    // your code here\n\n    return 0;\n}\n';
  if (!p.tests.length && p.kind !== 'concept') throw new Error(`${p.id}: no tests`);
  p.difficulty = p.difficulty || 'easy';
  if (p.marks) p.marks = +p.marks;
  return p;
}

// ---------------------------------------------------------------- verify
function norm(s) { return s.replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, ''); }
const report = [];
function verifyLesson(L) {
  let ok = 0, bad = 0;
  L.steps.forEach((st, si) => st.blocks.forEach((b, bi) => {
    if (b.type !== 'example') return;
    const r = CI.run(b.code, { stdin: b.input, files: {} });
    const where = `${L.id} step ${si + 1} "${st.title}" example ${bi}`;
    const actual = r.compileError ? 'COMPILE ERROR line ' + r.compileError.line + ': ' + r.compileError.message : r.stdout + (r.error ? '\n[RUNTIME ERROR line ' + r.error.line + ': ' + r.error.message + ']' : '');
    b.warnings = (r.warnings || []).map(w => w.line + ': ' + w.msg);
    if (b.output == null) { report.push({ where, problem: 'no output fence', actual }); bad++; return; }
    if (b.output.trim() === 'ADDRESS-DEPENDENT') { b.addressDependent = true; b.output = r.compileError || r.error ? b.output : r.stdout.replace(/\n$/, ''); if (r.compileError || r.error) { report.push({ where, problem: 'error', actual }); bad++; } else ok++; return; }
    if (r.compileError || r.error || norm(r.stdout) !== norm(b.output)) {
      report.push({ where, problem: 'mismatch', expected: b.output, actual, code: b.code, input: b.input });
      bad++;
    } else ok++;
  }));
  (L.items || []).forEach((it, qi) => {
    if (it.type !== 'question' || !it.quiz.run) return;
    const r = CI.run(it.quiz.code, {});
    const where = `${L.id} question ${qi + 1} "${it.title}"`;
    const flatten = x => String(x).replace(/`/g, '').replace(/\n/g, ' ').split(/\s+/).filter(Boolean).join(' ');
    if (r.compileError || r.error || flatten(r.stdout) !== flatten(it.quiz.rawAnswer)) {
      report.push({ where, problem: 'quiz answer does not match program output', expected: it.quiz.rawAnswer, actual: r.compileError ? 'COMPILE ERROR ' + r.compileError.message : r.stdout + (r.error ? ' [RUNTIME ' + r.error.message + ']' : ''), code: it.quiz.code });
      bad++;
    } else ok++;
  });
  L.problems.forEach(p => {
    p.tests.forEach((t, ti) => {
      const r = CI.run(p.solution, { stdin: t.input, files: t.files });
      const where = `${L.id} problem ${p.id} test ${ti + 1}`;
      const actual = r.compileError ? 'COMPILE ERROR line ' + r.compileError.line + ': ' + r.compileError.message : r.stdout + (r.error ? '\n[RUNTIME ERROR line ' + r.error.line + ': ' + r.error.message + ']' : '');
      if (r.compileError || r.error || !judge.compare(r.stdout, t.output).pass) {
        report.push({ where, problem: 'solution fails test', expected: t.output, actual, input: t.input });
        bad++;
      } else {
        if (norm(r.stdout) !== norm(t.output)) report.push({ where, problem: 'lenient-only pass', expected: t.output, actual, input: t.input, minor: true });
        ok++;
      }
      if (r.warnings && r.warnings.length) report.push({ where, problem: 'solution warnings', actual: r.warnings.map(w => w.line + ': ' + w.msg).join('\n'), minor: true });
    });
    if (p.starter) {
      const r = CI.run(p.starter, { stdin: p.tests[0] ? p.tests[0].input : '' });
      if (r.compileError) report.push({ where: `${L.id} problem ${p.id} starter`, problem: 'starter does not compile', actual: r.compileError.message + ' line ' + r.compileError.line, minor: true });
    }
  });
  return { ok, bad };
}

// ---------------------------------------------------------------- main
const files = fs.readdirSync(path.join(ROOT, 'content')).filter(f => f.endsWith('.md') && f !== 'FORMAT.md');
const lessons = [];
let totOk = 0, totBad = 0;
for (const f of files) {
  let L;
  try { L = parseLesson(path.join(ROOT, 'content', f)); }
  catch (e) { console.error('PARSE ERROR', f, e.message); process.exitCode = 1; continue; }
  if (!noVerify && (!only || only === L.id)) {
    const t0 = Date.now();
    const { ok, bad } = verifyLesson(L);
    totOk += ok; totBad += bad;
    console.log(`${L.id.padEnd(16)} steps ${String(L.steps.length).padStart(2)}  problems ${String(L.problems.length).padStart(2)}  checks ok ${ok} bad ${bad}  (${Date.now() - t0} ms)`);
  }
  lessons.push(L);
}
lessons.sort((a, b) => a.order - b.order);
const tests = [];
const tdir = path.join(ROOT, 'content', 'tests');
if (fs.existsSync(tdir)) for (const f of fs.readdirSync(tdir).filter(f => f.endsWith('.md') && !/^[A-Z]/.test(f))) {
  let T;
  try { T = parseLesson(path.join(tdir, f)); }
  catch (e) { console.error('PARSE ERROR tests/' + f, e.message); process.exitCode = 1; continue; }
  if (!T.items) { console.error('tests/' + f + ': missing duration in front matter'); continue; }
  if (!noVerify && (!only || only === T.id)) {
    const t0 = Date.now(); const { ok, bad } = verifyLesson(T); totOk += ok; totBad += bad;
    const marks = T.items.reduce((a, it) => a + (it.marks || 0), 0);
    console.log(`test ${T.id.padEnd(11)} questions ${String(T.items.filter(i => i.type === 'question').length).padStart(2)}  problems ${String(T.problems.length).padStart(2)}  marks ${marks}  checks ok ${ok} bad ${bad}  (${Date.now() - t0} ms)`);
  }
  tests.push(T);
}
tests.sort((a, b) => a.order - b.order);
const ids = new Set();
lessons.concat(tests).forEach(L => L.problems.forEach(p => { if (ids.has(p.id)) console.error('DUPLICATE problem id', p.id); ids.add(p.id); }));
const outDir = path.join(ROOT, 'js', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'content.js'), '/* Generated by tools/build.js from content/*.md — do not edit by hand. */\nwindow.COURSE = ' + JSON.stringify({ lessons, tests }) + ';\n');
if (!noVerify) {
  fs.writeFileSync(path.join(__dirname, 'verify-report.json'), JSON.stringify(report, null, 1));
  const serious = report.filter(r => !r.minor);
  if (serious.length) process.exitCode = 1;
  console.log(`\nTotal ok ${totOk}, failing ${totBad}. Serious issues: ${serious.length}, minor: ${report.length - serious.length}. Details: tools/verify-report.json`);
}
