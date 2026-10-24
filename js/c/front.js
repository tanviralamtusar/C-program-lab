/* Mini-C front end: lexer, preprocessor, type system, parser (with static typing).
   Loaded as a classic script so the site works from file:// as well as a server.
   Every module registers a factory in CI_MODULES so the runner can rebuild them inside a Web Worker. */
var CI_MODULES = (typeof CI_MODULES !== 'undefined') ? CI_MODULES : [];
CI_MODULES.push(function (CI) {
  'use strict';

  // ---------------------------------------------------------------- errors
  function CError(kind, msg, line, col) {
    this.kind = kind; this.message = msg; this.line = line || 0; this.col = col || 0;
  }
  CError.prototype.toString = function () {
    return (this.kind === 'compile' ? 'Compile error' : 'Runtime error') + (this.line ? ' (line ' + this.line + ')' : '') + ': ' + this.message;
  };
  CI.CError = CError;
  function cerr(msg, tok) { throw new CError('compile', msg, tok ? tok.line : 0, tok ? tok.col : 0); }

  // ---------------------------------------------------------------- lexer
  var PUNCT = ['...', '<<=', '>>=', '->', '++', '--', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||', '*=', '/=', '%=', '+=', '-=', '&=', '^=', '|=', '##',
    '[', ']', '(', ')', '{', '}', '.', '&', '*', '+', '-', '~', '!', '/', '%', '<', '>', '^', '|', '?', ':', ';', '=', ',', '#'];

  function utf8Bytes(s) {
    var out = [];
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c >= 0xd800 && c < 0xdc00 && i + 1 < s.length) {
        var c2 = s.charCodeAt(++i), cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }
  CI.utf8Bytes = utf8Bytes;

  function lex(src) {
    var toks = [], i = 0, line = 1, col = 1, n = src.length, nl = true, sp = false;
    function adv(k) { for (var j = 0; j < k; j++) { if (src[i] === '\n') { line++; col = 1; } else col++; i++; } }
    while (i < n) {
      var c = src[i];
      if (c === '\\' && (src[i + 1] === '\n' || (src[i + 1] === '\r' && src[i + 2] === '\n'))) { adv(src[i + 1] === '\r' ? 3 : 2); continue; }
      if (c === '\n') { adv(1); nl = true; sp = false; continue; }
      if (c === ' ' || c === '\t' || c === '\r' || c === '\f' || c === '\v') { adv(1); sp = true; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') adv(1); continue; }
      if (c === '/' && src[i + 1] === '*') {
        var sl = line, sc = col; adv(2);
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) adv(1);
        if (i >= n) throw new CError('compile', 'Unterminated /* comment', sl, sc);
        adv(2); sp = true; continue;
      }
      var tok = { k: '', v: null, raw: '', line: line, col: col, nl: nl, sp: sp };
      nl = false; sp = false;
      var start = i;
      if (/[A-Za-z_$]/.test(c)) {
        while (i < n && /[A-Za-z0-9_$]/.test(src[i])) adv(1);
        tok.k = 'id'; tok.v = src.slice(start, i);
      } else if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        while (i < n && (/[0-9A-Za-z_.]/.test(src[i]) || ((src[i] === '+' || src[i] === '-') && /[eEpP]/.test(src[i - 1]) && !/^0[xX]/.test(src.slice(start, i)) ))) adv(1);
        tok.k = 'num'; tok.v = src.slice(start, i);
      } else if (c === '"' || c === '\'' || ((c === 'L' || c === 'u' || c === 'U') && (src[i + 1] === '"' || src[i + 1] === '\''))) {
        if (c !== '"' && c !== '\'') adv(1);
        var q = src[i]; adv(1);
        var bytes = [];
        while (i < n && src[i] !== q) {
          if (src[i] === '\n') throw new CError('compile', 'Missing closing ' + q + ' on this line', tok.line, tok.col);
          if (src[i] === '\\') {
            adv(1);
            var e = src[i];
            var map = { n: 10, t: 9, r: 13, '0': 0, a: 7, b: 8, f: 12, v: 11, '\\': 92, '\'': 39, '"': 34, '?': 63, e: 27 };
            if (/[0-7]/.test(e)) {
              var o = ''; while (o.length < 3 && /[0-7]/.test(src[i])) { o += src[i]; adv(1); }
              bytes.push(parseInt(o, 8) & 255); continue;
            } else if (e === 'x') {
              adv(1); var h = ''; while (/[0-9a-fA-F]/.test(src[i] || '')) { h += src[i]; adv(1); }
              bytes.push(parseInt(h || '0', 16) & 255); continue;
            } else if (e in map) { bytes.push(map[e]); adv(1); continue; }
            else if (e === '\n') { adv(1); continue; }
            else { bytes.push(e.charCodeAt(0) & 255); adv(1); continue; }
          }
          var ch = src[i]; adv(1);
          var cc = ch.charCodeAt(0);
          if (cc < 128) bytes.push(cc);
          else {
            if (cc >= 0xd800 && cc < 0xdc00 && i < n) { ch += src[i]; adv(1); }
            Array.prototype.push.apply(bytes, utf8Bytes(ch));
          }
        }
        if (i >= n) throw new CError('compile', 'Missing closing ' + q, tok.line, tok.col);
        adv(1);
        if (q === '"') { tok.k = 'str'; tok.v = bytes; }
        else {
          if (bytes.length === 0) throw new CError('compile', "Empty character constant ''", tok.line, tok.col);
          tok.k = 'chr';
          var cv = 0; for (var b = 0; b < bytes.length; b++) cv = (cv << 8) | bytes[b];
          tok.v = bytes.length === 1 ? (bytes[0] << 24 >> 24) : cv;
        }
      } else {
        var p = null;
        for (var k = 0; k < PUNCT.length; k++) if (src.startsWith(PUNCT[k], i)) { p = PUNCT[k]; break; }
        if (!p) throw new CError('compile', 'Unexpected character \'' + c + '\'', line, col);
        adv(p.length); tok.k = 'p'; tok.v = p;
      }
      tok.raw = src.slice(start, i);
      toks.push(tok);
    }
    toks.push({ k: 'eof', v: null, raw: '', line: line, col: col, nl: true });
    return toks;
  }
  CI.lex = lex;

  // ---------------------------------------------------------------- preprocessor
  function preprocess(src, predef) {
    var toks = lex(src);
    var macros = Object.create(null);
    var includes = [];
    if (predef) for (var k in predef) macros[k] = predef[k];
    var out = [];
    var cond = []; // stack of {active, taken, parentActive}
    function active() { return cond.length === 0 || cond[cond.length - 1].active; }
    var i = 0, pending = [];
    function flush() { if (pending.length) { Array.prototype.push.apply(out, expandList(pending, [])); pending = []; } }

    function cloneTok(t, line, col) { var c = {}; for (var k in t) c[k] = t[k]; if (line) { c.line = line; c.col = col; } return c; }
    function tokText(t) { return t.raw || (t.k === 'num' ? String(t.v) : t.v); }
    function relex(text, line, col) {
      var r = lex(text); r.pop();
      r.forEach(function (t) { t.line = line; t.col = col; t.nl = false; });
      return r;
    }

    function expandList(toks, hide) {
      var res = [];
      for (var i = 0; i < toks.length; i++) {
        var t = toks[i];
        if (t.k === 'id' && !t.noexp) {
          if (t.v === '__LINE__') { res.push({ k: 'num', v: String(t.line), raw: String(t.line), line: t.line, col: t.col }); continue; }
          if (t.v === '__FILE__') { res.push({ k: 'str', v: utf8Bytes('main.c'), raw: '"main.c"', line: t.line, col: t.col }); continue; }
          if (t.v === '__DATE__' || t.v === '__TIME__') {
            var d = new Date(), s = t.v === '__DATE__' ? d.toDateString().slice(4) : d.toTimeString().slice(0, 8);
            res.push({ k: 'str', v: utf8Bytes(s), raw: JSON.stringify(s), line: t.line, col: t.col }); continue;
          }
          var m = macros[t.v];
          if (m && hide.indexOf(t.v) >= 0) { var nt = cloneTok(t); nt.noexp = true; res.push(nt); continue; }
          if (m && !m.fn) {
            var body = m.body.map(function (b) { return cloneTok(b, t.line, t.col); });
            Array.prototype.push.apply(res, expandList(body, hide.concat([t.v])));
            continue;
          }
          if (m && m.fn && toks[i + 1] && toks[i + 1].k === 'p' && toks[i + 1].v === '(') {
            // collect arguments
            var j = i + 2, depth = 0, args = [[]];
            for (; j < toks.length; j++) {
              var a = toks[j];
              if (a.k === 'p' && (a.v === '(' || a.v === '[' || a.v === '{')) depth++;
              else if (a.k === 'p' && (a.v === ')' || a.v === ']' || a.v === '}')) { if (depth === 0 && a.v === ')') break; depth--; }
              else if (a.k === 'p' && a.v === ',' && depth === 0 && !(m.variadic && args.length > m.params.length)) { args.push([]); continue; }
              args[args.length - 1].push(a);
            }
            if (j >= toks.length) cerr('Unterminated call to macro ' + t.v, t);
            if (args.length === 1 && args[0].length === 0 && m.params.length === 0) args = [];
            if (m.variadic) { while (args.length < m.params.length + 1) args.push([]); }
            else if (args.length !== m.params.length) cerr('Macro ' + t.v + ' expects ' + m.params.length + ' argument(s) but got ' + args.length, t);
            var sub = substitute(m, args, t, hide);
            Array.prototype.push.apply(res, expandList(sub, hide.concat([t.v])));
            i = j;
            continue;
          }
        }
        res.push(t);
      }
      return res;
    }

    function substitute(m, args, at, hide) {
      var names = m.params.slice(); if (m.variadic) names.push('__VA_ARGS__');
      function argIdx(t) { return t && t.k === 'id' ? names.indexOf(t.v) : -1; }
      var res = [], body = m.body;
      for (var k = 0; k < body.length; k++) {
        var b = body[k];
        if (b.k === 'p' && b.v === '#' && argIdx(body[k + 1]) >= 0) {
          var a = args[argIdx(body[k + 1])], s = '';
          a.forEach(function (x, ix) { if (ix && x.sp) s += ' '; s += tokText(x); });
          res.push({ k: 'str', v: utf8Bytes(s), raw: JSON.stringify(s), line: at.line, col: at.col });
          k++; continue;
        }
        if (b.k === 'p' && b.v === '##' && res.length) {
          var left = res.pop(), nxt = body[k + 1], right;
          if (argIdx(nxt) >= 0) right = args[argIdx(nxt)].map(function (x) { return cloneTok(x, at.line, at.col); });
          else right = nxt ? [cloneTok(nxt, at.line, at.col)] : [];
          var pasted = relex(tokText(left) + (right.length ? tokText(right[0]) : ''), at.line, at.col);
          Array.prototype.push.apply(res, pasted);
          Array.prototype.push.apply(res, right.slice(1));
          k++; continue;
        }
        var ai = argIdx(b);
        if (ai >= 0) {
          var raw = args[ai].map(function (x) { return cloneTok(x, at.line, at.col); });
          if (body[k + 1] && body[k + 1].k === 'p' && body[k + 1].v === '##') Array.prototype.push.apply(res, raw);
          else Array.prototype.push.apply(res, expandList(raw, hide));
          continue;
        }
        res.push(cloneTok(b, at.line, at.col));
      }
      return res;
    }

    function evalIf(dt, at) {
      // replace defined(X)
      var t2 = [];
      for (var k = 0; k < dt.length; k++) {
        var t = dt[k];
        if (t.k === 'id' && t.v === 'defined') {
          var nm;
          if (dt[k + 1] && dt[k + 1].v === '(') { nm = dt[k + 2]; k += 3; } else { nm = dt[k + 1]; k += 1; }
          t2.push({ k: 'num', v: nm && macros[nm.v] ? '1' : '0', line: t.line });
        } else t2.push(t);
      }
      var ex = expandList(t2, []).map(function (t) { return t.k === 'id' ? { k: 'num', v: (t.v === 'true' ? '1' : '0'), line: t.line } : t; });
      var p = 0;
      function peek() { return ex[p]; }
      function num(t) {
        if (t.k === 'chr') return t.v;
        var s = t.v.replace(/[uUlL]+$/, '');
        return /^0[xX]/.test(s) ? parseInt(s, 16) : /^0[0-7]/.test(s) ? parseInt(s, 8) : parseFloat(s);
      }
      var BIN = [['||'], ['&&'], ['|'], ['^'], ['&'], ['==', '!='], ['<', '>', '<=', '>='], ['<<', '>>'], ['+', '-'], ['*', '/', '%']];
      function prim() {
        var t = ex[p++];
        if (!t) cerr('Bad #if expression', at);
        if (t.k === 'num' || t.k === 'chr') return num(t);
        if (t.v === '(') { var v = cond_(); p++; return v; }
        if (t.v === '!') return prim() ? 0 : 1;
        if (t.v === '-') return -prim();
        if (t.v === '+') return prim();
        if (t.v === '~') return ~prim();
        cerr('Bad token in #if: ' + t.v, at);
      }
      function bin(lv) {
        if (lv >= BIN.length) return prim();
        var l = bin(lv + 1);
        while (peek() && peek().k === 'p' && BIN[lv].indexOf(peek().v) >= 0) {
          var op = ex[p++].v, r = bin(lv + 1);
          switch (op) {
            case '||': l = (l || r) ? 1 : 0; break; case '&&': l = (l && r) ? 1 : 0; break;
            case '|': l = l | r; break; case '^': l = l ^ r; break; case '&': l = l & r; break;
            case '==': l = +(l === r); break; case '!=': l = +(l !== r); break;
            case '<': l = +(l < r); break; case '>': l = +(l > r); break; case '<=': l = +(l <= r); break; case '>=': l = +(l >= r); break;
            case '<<': l = l << r; break; case '>>': l = l >> r; break;
            case '+': l = l + r; break; case '-': l = l - r; break; case '*': l = l * r; break;
            case '/': l = r ? Math.trunc(l / r) : 0; break; case '%': l = r ? l % r : 0; break;
          }
        }
        return l;
      }
      function cond_() {
        var c = bin(0);
        if (peek() && peek().v === '?') { p++; var a = cond_(); p++; var b = cond_(); return c ? a : b; }
        return c;
      }
      return cond_();
    }

    while (true) {
      var t = toks[i];
      if (t.k === 'eof') break;
      if (t.k === 'p' && t.v === '#' && t.nl) {
        flush();
        var dl = [], j = i + 1;
        while (!toks[j].nl && toks[j].k !== 'eof') dl.push(toks[j++]);
        i = j;
        var d = dl[0], name = d ? d.v : '';
        if (!d) continue; // null directive
        if (name === 'ifdef' || name === 'ifndef') {
          var def = dl[1] && !!macros[dl[1].v];
          var on = active() && (name === 'ifdef' ? def : !def);
          cond.push({ active: on, taken: on, parent: active() });
          continue;
        }
        if (name === 'if') { var pa = active(); var on2 = pa && !!evalIf(dl.slice(1), d); cond.push({ active: on2, taken: on2, parent: pa }); continue; }
        if (name === 'elif') {
          var top = cond[cond.length - 1]; if (!top) cerr('#elif without #if', d);
          if (top.taken || !top.parent) top.active = false; else { top.active = !!evalIf(dl.slice(1), d); top.taken = top.active; }
          continue;
        }
        if (name === 'else') { var tp = cond[cond.length - 1]; if (!tp) cerr('#else without #if', d); tp.active = tp.parent && !tp.taken; tp.taken = true; continue; }
        if (name === 'endif') { if (!cond.length) cerr('#endif without #if', d); cond.pop(); continue; }
        if (!active()) continue;
        if (name === 'define') {
          var nm = dl[1]; if (!nm || nm.k !== 'id') cerr('#define needs a name', d);
          var m = { name: nm.v, fn: false, params: [], body: [], variadic: false };
          var bi = 2;
          if (dl[2] && dl[2].v === '(' && !dl[2].sp) {
            m.fn = true; bi = 3;
            while (dl[bi] && dl[bi].v !== ')') {
              if (dl[bi].v === '...') m.variadic = true;
              else if (dl[bi].k === 'id') m.params.push(dl[bi].v);
              bi++;
            }
            bi++;
          }
          m.body = dl.slice(bi);
          macros[nm.v] = m;
          continue;
        }
        if (name === 'undef') { if (dl[1]) delete macros[dl[1].v]; continue; }
        if (name === 'include') {
          var hdr = dl.slice(1).map(tokText).join('');
          includes.push(hdr.replace(/^[<"]|[>"]$/g, ''));
          continue;
        }
        if (name === 'error') cerr('#error ' + dl.slice(1).map(tokText).join(' '), d);
        if (name === 'pragma' || name === 'warning' || name === 'line') continue;
        cerr('Unknown preprocessor directive #' + name, d);
      }
      if (active()) pending.push(t);
      i++;
    }
    flush();
    if (cond.length) cerr('Missing #endif', toks[toks.length - 1]);
    out.push(toks[toks.length - 1]);
    return { toks: out, includes: includes, macros: macros };
  }
  CI.preprocess = preprocess;

  // ---------------------------------------------------------------- types
  function IT(name, size, uns) { return { k: 'int', name: name, size: size, uns: !!uns }; }
  var T = {
    void: { k: 'void', name: 'void', size: 1 },
    bool: { k: 'int', name: '_Bool', size: 1, uns: true, bool: true },
    char: IT('char', 1), schar: IT('signed char', 1), uchar: IT('unsigned char', 1, 1),
    short: IT('short', 2), ushort: IT('unsigned short', 2, 1),
    int: IT('int', 4), uint: IT('unsigned int', 4, 1),
    long: IT('long', 8), ulong: IT('unsigned long', 8, 1),
    llong: IT('long long', 8), ullong: IT('unsigned long long', 8, 1),
    float: { k: 'flt', name: 'float', size: 4 }, double: { k: 'flt', name: 'double', size: 8 },
    ldouble: { k: 'flt', name: 'long double', size: 16 }
  };
  CI.T = T;
  function ptr(t) { if (!t._ptr) t._ptr = { k: 'ptr', to: t, size: 8 }; return t._ptr; }
  function arr(t, n) { return { k: 'arr', of: t, len: n, size: n == null ? 0 : n * t.size }; }
  function isInt(t) { return t.k === 'int'; }
  function isFlt(t) { return t.k === 'flt'; }
  function isArith(t) { return t.k === 'int' || t.k === 'flt'; }
  function isPtr(t) { return t.k === 'ptr'; }
  function isScalar(t) { return isArith(t) || isPtr(t); }
  function isAgg(t) { return t.k === 'struct' || t.k === 'union'; }
  function is64(t) { return t.k === 'int' && t.size === 8; }
  function alignOf(t) {
    if (t.k === 'arr') return alignOf(t.of);
    if (isAgg(t)) return t.align || 1;
    if (t.k === 'func' || t.k === 'void') return 1;
    return Math.min(t.size, 16);
  }
  function typeName(t, inner) {
    inner = inner || '';
    switch (t.k) {
      case 'int': case 'flt': case 'void': return t.name + (inner ? ' ' + inner : '');
      case 'struct': case 'union': return (t.alias || (t.k + ' ' + (t.tag || '{...}'))) + (inner ? ' ' + inner : '');
      case 'ptr':
        if (t.to.k === 'arr' || t.to.k === 'func') return typeName(t.to, '(*' + inner + ')');
        return typeName(t.to, '*' + inner);
      case 'arr': return typeName(t.of, inner + '[' + (t.len == null ? '' : t.len) + ']');
      case 'func': return typeName(t.ret, inner + '(' + t.params.map(function (p) { return typeName(p); }).join(', ') + (t.variadic ? ', ...' : '') + ')');
    }
    return '?';
  }
  function sameType(a, b) {
    if (a === b) return true;
    if (a.k !== b.k) return false;
    switch (a.k) {
      case 'int': case 'flt': return a.name === b.name || (a.size === b.size && a.uns === b.uns && a.k === 'int' && a.name !== 'char' && b.name !== 'char');
      case 'void': return true;
      case 'ptr': return sameType(a.to, b.to);
      case 'arr': return sameType(a.of, b.of) && (a.len == null || b.len == null || a.len === b.len);
      case 'struct': case 'union': return a === b;
      case 'func': return sameType(a.ret, b.ret);
    }
    return false;
  }
  function promote(t) {
    if (t.k === 'int' && t.size < 4) return T.int;
    if (t.k === 'enum') return T.int;
    return t;
  }
  function rank(t) { return t.size === 8 ? (t.name.indexOf('long long') >= 0 ? 4 : 3) : t.size === 4 ? 2 : 1; }
  function arithConv(a, b) {
    if (a.k === 'flt' || b.k === 'flt') {
      if (a.size === 16 || b.size === 16) return T.ldouble;
      if (a === T.double || b === T.double || (a.k === 'int') || (b.k === 'int')) {
        if (a.k === 'flt' && b.k === 'flt') return a.size >= b.size ? a : b;
        return a.k === 'flt' ? a : b;
      }
      return T.float;
    }
    a = promote(a); b = promote(b);
    if (a === b) return a;
    if (a.uns === b.uns) return rank(a) >= rank(b) ? a : b;
    var u = a.uns ? a : b, s = a.uns ? b : a;
    if (rank(u) >= rank(s)) return u;
    if (s.size > u.size) return s;
    return s.size === 8 ? (s === T.llong ? T.ullong : T.ulong) : T.uint;
  }
  CI.types = { ptr: ptr, arr: arr, typeName: typeName, isInt: isInt, isFlt: isFlt, isPtr: isPtr, isAgg: isAgg, is64: is64, alignOf: alignOf };

  // ---------------------------------------------------------------- parser
  var TYPE_KW = { void: 1, char: 1, short: 1, int: 1, long: 1, float: 1, double: 1, signed: 1, unsigned: 1, _Bool: 1, struct: 1, union: 1, enum: 1,
    const: 1, volatile: 1, static: 1, extern: 1, auto: 1, register: 1, typedef: 1, inline: 1, restrict: 1, __inline: 1, _Noreturn: 1 };
  var KEYWORDS = { if: 1, else: 1, while: 1, do: 1, for: 1, switch: 1, case: 1, default: 1, break: 1, continue: 1, return: 1, goto: 1, sizeof: 1 };

  function Scope(parent, kind) { this.parent = parent; this.vars = new Map(); this.tags = new Map(); this.kind = kind; }
  Scope.prototype.find = function (n) { for (var s = this; s; s = s.parent) { var v = s.vars.get(n); if (v) return v; } return null; };
  Scope.prototype.findTag = function (n) { for (var s = this; s; s = s.parent) { var v = s.tags.get(n); if (v) return v; } return null; };

  // Memory layout constants shared with the VM
  var MEM = { STATIC: 0x1000, HEAP: 0x800000, STACK_LO: 0x1800000, TOP: 0x1c00000, FN: 0x100, FILES: 0x900 };
  CI.MEM = MEM;

  function Parser(toks, opts) {
    this.toks = toks; this.p = 0; this.opts = opts || {};
    this.global = new Scope(null, 'global');
    this.scope = this.global;
    this.warnings = [];
    this.staticTop = MEM.STATIC;  // allocation pointer for globals/statics/literals
    this.staticInit = [];         // {addr, bytes}
    this.globals = [];            // global variable syms in order (for visualizer and init)
    this.funcs = [];              // function syms (index = id)
    this.fn = null;               // current function being parsed
    this.strCache = new Map();
    this.knownFuncs = opts.knownFuncs || null; // pass-1 signatures
    this.staticDecls = [];
  }
  var P = Parser.prototype;
  P.peek = function (o) { return this.toks[this.p + (o || 0)]; };
  P.next = function () { return this.toks[this.p++]; };
  P.is = function (v, o) { var t = this.toks[this.p + (o || 0)]; return t && t.k === 'p' && t.v === v; };
  P.isId = function (v) { var t = this.peek(); return t.k === 'id' && t.v === v; };
  P.accept = function (v) { if (this.is(v)) { this.p++; return true; } return false; };
  P.expect = function (v, what) {
    if (this.is(v)) return this.next();
    var t = this.peek(), prev = this.toks[this.p - 1];
    if (v === ';' && prev) cerr("Expected ';' " + (what ? what.replace(/^(?!after|in)/, 'after ') : 'after ' + ('\'' + (prev.raw || prev.v) + '\'')) + ' — did you forget a semicolon?', { line: prev.line, col: prev.col + (prev.raw || '').length });
    cerr("Expected '" + v + "'" + (what ? ' ' + what : '') + " but found " + (t.k === 'eof' ? 'end of file' : "'" + (t.raw || t.v) + "'"), t);
  };
  P.warn = function (msg, tok) { this.warnings.push({ msg: msg, line: tok ? tok.line : 0 }); };

  P.allocStatic = function (size, align) {
    align = align || 1;
    this.staticTop = Math.ceil(this.staticTop / align) * align;
    var a = this.staticTop; this.staticTop += Math.max(size, 1);
    if (this.staticTop > MEM.HEAP) cerr('Program uses too much global memory');
    return a;
  };
  P.strLit = function (bytes) {
    var key = bytes.join(',');
    if (this.strCache.has(key)) return this.strCache.get(key);
    var a = this.allocStatic(bytes.length + 1, 1);
    this.staticInit.push({ addr: a, bytes: bytes.concat([0]), ro: true });
    this.strCache.set(key, a);
    return a;
  };

  P.isTypeStart = function (o) {
    var t = this.peek(o);
    if (t.k !== 'id') return false;
    if (TYPE_KW[t.v]) return true;
    var s = this.scope.find(t.v);
    return !!(s && s.kind === 'typedef');
  };

  // ---- declaration specifiers
  P.declSpec = function () {
    var st = { storage: null, base: null, cnt: {}, isConst: false, inline: false };
    var start = this.peek(), sawType = false;
    while (true) {
      var t = this.peek();
      if (t.k !== 'id') break;
      var v = t.v;
      if (v === 'typedef' || v === 'static' || v === 'extern' || v === 'auto' || v === 'register') { st.storage = st.storage === 'typedef' ? 'typedef' : v; this.p++; continue; }
      if (v === 'const') { st.isConst = true; this.p++; continue; }
      if (v === 'volatile' || v === 'restrict' || v === 'inline' || v === '__inline' || v === '_Noreturn') { this.p++; continue; }
      if (v === 'struct' || v === 'union') { this.p++; st.base = this.structSpec(v, t); sawType = true; continue; }
      if (v === 'enum') { this.p++; st.base = this.enumSpec(t); sawType = true; continue; }
      if (v === 'void' || v === 'char' || v === 'short' || v === 'int' || v === 'long' || v === 'float' || v === 'double' || v === 'signed' || v === 'unsigned' || v === '_Bool') {
        st.cnt[v] = (st.cnt[v] || 0) + 1; sawType = true; this.p++; continue;
      }
      if (!sawType) {
        var s = this.scope.find(v);
        if (s && s.kind === 'typedef') { st.base = s.type; sawType = true; this.p++; continue; }
      }
      break;
    }
    if (!st.base) {
      var c = st.cnt;
      if (c.void) st.base = T.void;
      else if (c._Bool) st.base = T.bool;
      else if (c.float) st.base = T.float;
      else if (c.double) st.base = c.long ? T.ldouble : T.double;
      else if (c.char) st.base = c.unsigned ? T.uchar : c.signed ? T.schar : T.char;
      else if (c.short) st.base = c.unsigned ? T.ushort : T.short;
      else if (c.long >= 2) st.base = c.unsigned ? T.ullong : T.llong;
      else if (c.long) st.base = c.unsigned ? T.ulong : T.long;
      else if (c.int || c.signed || c.unsigned) st.base = c.unsigned ? T.uint : T.int;
      else if (st.storage || st.isConst) st.base = T.int;
      else return null;
    }
    st.tok = start;
    return st;
  };

  P.structSpec = function (kw, kwTok) {
    var tag = null;
    if (this.peek().k === 'id') tag = this.next().v;
    var st;
    if (this.is('{')) {
      if (tag) {
        st = this.scope.tags.get(tag);
        if (!st || st.k !== kw || st.complete) { st = { k: kw, tag: tag, fields: [], size: 0, align: 1, complete: false }; this.scope.tags.set(tag, st); }
      } else st = { k: kw, tag: null, fields: [], size: 0, align: 1, complete: false };
      this.next();
      var off = 0, size = 0, al = 1;
      while (!this.is('}')) {
        var ds = this.declSpec();
        if (!ds) cerr('Expected a member type inside ' + kw + (tag ? ' ' + tag : ''), this.peek());
        if (this.is(';')) { // anonymous struct/union member
          this.next();
          if (isAgg(ds.base) && !ds.base.tag) {
            var inner = ds.base, a0 = alignOf(inner);
            var base = kw === 'union' ? 0 : Math.ceil(off / a0) * a0;
            inner.fields.forEach(function (f) { st.fields.push({ name: f.name, type: f.type, offset: base + f.offset }); });
            if (kw === 'struct') off = base + inner.size; size = Math.max(size, base + inner.size); al = Math.max(al, a0);
          }
          continue;
        }
        do {
          var d = this.declarator(false);
          var ft = d.apply(ds.base);
          if (this.accept(':')) { this.constExpr(); } // bit-fields: treat as normal member
          if (ft.k === 'arr' && ft.len == null) cerr('Array member ' + d.name + ' needs a size', this.peek());
          var fa = alignOf(ft);
          if (kw === 'struct') { off = Math.ceil(off / fa) * fa; st.fields.push({ name: d.name, type: ft, offset: off }); off += ft.size; size = off; }
          else { st.fields.push({ name: d.name, type: ft, offset: 0 }); size = Math.max(size, ft.size); }
          al = Math.max(al, fa);
        } while (this.accept(','));
        this.expect(';', 'after struct member');
      }
      this.next();
      st.align = al; st.size = Math.ceil(size / al) * al || 0; st.complete = true;
      return st;
    }
    if (!tag) cerr('Expected a name or { after ' + kw, kwTok);
    st = this.scope.findTag(tag);
    if (!st) { st = { k: kw, tag: tag, fields: [], size: 0, align: 1, complete: false }; this.scope.tags.set(tag, st); }
    return st;
  };

  P.enumSpec = function (kwTok) {
    var tag = null;
    if (this.peek().k === 'id') tag = this.next().v;
    if (this.accept('{')) {
      var val = 0;
      while (!this.is('}')) {
        var nt = this.next();
        if (nt.k !== 'id') cerr('Expected enum constant name', nt);
        if (this.accept('=')) val = this.constExpr();
        this.scope.vars.set(nt.v, { kind: 'enumconst', name: nt.v, value: val, type: T.int });
        val++;
        if (!this.accept(',')) break;
      }
      this.expect('}');
      if (tag) this.scope.tags.set(tag, { k: 'enum', tag: tag });
    }
    return T.int;
  };

  // returns {name, tok, apply(base) -> type, params (for function declarators)}
  P.declarator = function (abstract) {
    var ptrs = 0;
    while (this.is('*')) { this.next(); ptrs++; while (this.isId('const') || this.isId('volatile') || this.isId('restrict')) this.next(); }
    var inner = null, name = null, tok = this.peek();
    if (this.is('(') && !(this.is(')', 1) || this.isTypeStart(1))) {
      this.next(); inner = this.declarator(abstract); this.expect(')');
    } else if (this.peek().k === 'id' && !TYPE_KW[this.peek().v]) {
      if (KEYWORDS[this.peek().v]) cerr("'" + this.peek().v + "' is a keyword and cannot be used as a name", this.peek());
      name = this.next().v;
    } else if (!abstract) {
      cerr('Expected a variable name but found ' + (tok.k === 'eof' ? 'end of file' : "'" + (tok.raw || tok.v) + "'"), tok);
    }
    var suffixes = [], params = null;
    while (true) {
      if (this.is('[')) {
        this.next();
        while (this.isId('static') || this.isId('const')) this.next();
        if (this.is(']')) { this.next(); suffixes.push({ arr: true, len: null }); continue; }
        if (this.is('*') && this.is(']', 1)) { this.p += 2; suffixes.push({ arr: true, len: null }); continue; }
        var e = this.assignExpr();
        this.expect(']');
        var cv = this.tryConst(e);
        if (cv == null) {
          if (!this.fn) cerr('Array size must be a constant here', tok);
          suffixes.push({ arr: true, vla: this.rval(e) });
        } else {
          if (cv < 0) cerr('Array size cannot be negative', tok);
          suffixes.push({ arr: true, len: Number(cv) });
        }
        continue;
      }
      if (this.is('(')) {
        this.next();
        var pr = this.paramList();
        suffixes.push({ fn: true, params: pr });
        if (!params) params = pr;
        continue;
      }
      break;
    }
    var self = this;
    return {
      name: inner ? inner.name : name, tok: inner ? inner.tok : tok,
      params: inner ? inner.params || params : params,
      isFuncDecl: !inner && suffixes.length && suffixes[0].fn && ptrs >= 0 ? true : (inner ? inner.isFuncDecl : false),
      apply: function (base) {
        var t = base;
        for (var k = 0; k < ptrs; k++) t = ptr(t);
        for (var j = suffixes.length - 1; j >= 0; j--) {
          var s = suffixes[j];
          if (s.arr) {
            if (t.k === 'void') cerr('Cannot make an array of void', tok);
            if (s.vla) { t = { k: 'arr', of: t, len: null, vla: s.vla, size: 0 }; }
            else t = arr(t, s.len);
          } else t = { k: 'func', ret: t, params: s.params.types, names: s.params.names, variadic: s.params.variadic, oldStyle: s.params.oldStyle, size: 1 };
        }
        return inner ? inner.apply(t) : t;
      }
    };
  };

  P.paramList = function () {
    var res = { types: [], names: [], toks: [], variadic: false, oldStyle: false };
    if (this.accept(')')) { res.oldStyle = true; return res; }
    if (this.isId('void') && this.is(')', 1)) { this.p += 2; return res; }
    var saved = this.scope;
    this.scope = new Scope(this.scope, 'proto');
    do {
      if (this.accept('...')) { res.variadic = true; break; }
      var ds = this.declSpec();
      if (!ds) {
        var t = this.peek();
        if (t.k === 'id') cerr("Unknown type '" + t.v + "' in parameter list", t);
        cerr('Expected a parameter type', t);
      }
      var d = this.declarator(true);
      var pt = d.apply(ds.base);
      if (pt.k === 'arr') pt = ptr(pt.of);
      else if (pt.k === 'func') pt = ptr(pt);
      if (pt.k === 'void') cerr('Parameter cannot have type void', d.tok);
      res.types.push(pt); res.names.push(d.name); res.toks.push(d.tok);
      if (d.name) this.scope.vars.set(d.name, { kind: 'var', name: d.name, type: pt, storage: 'param' });
    } while (this.accept(','));
    this.scope = saved;
    this.expect(')', 'to close the parameter list');
    return res;
  };

  P.typeName = function () {
    var ds = this.declSpec();
    if (!ds) return null;
    var d = this.declarator(true);
    return d.apply(ds.base);
  };

  // ---- constant evaluation (parse time)
  P.tryConst = function (e) {
    try { return this.cval(e); } catch (x) { if (x === NOT_CONST) return null; throw x; }
  };
  var NOT_CONST = {};
  P.cval = function (e) {
    switch (e.k) {
      case 'num': return e.v;
      case 'cast': {
        var v = this.cval(e.e);
        if (isInt(e.t)) { v = Number(v); v = Math.trunc(v); if (e.t.size === 4) v = e.t.uns ? v >>> 0 : v | 0; else if (e.t.size === 1) v = e.t.uns ? v & 255 : (v << 24 >> 24); else if (e.t.size === 2) v = e.t.uns ? v & 65535 : (v << 16 >> 16); return v; }
        if (isFlt(e.t)) return Number(v);
        throw NOT_CONST;
      }
      case 'sizeof': return e.v;
      case 'un': {
        var u = this.cval(e.e);
        if (e.op === '-') return -u; if (e.op === '+') return u; if (e.op === '~') return ~u; if (e.op === '!') return u ? 0 : 1;
        throw NOT_CONST;
      }
      case 'bin': case 'cmp': {
        var a = Number(this.cval(e.l)), b = Number(this.cval(e.r)), fl = e.ct && isFlt(e.ct);
        switch (e.op) {
          case '+': return a + b; case '-': return a - b; case '*': return a * b;
          case '/': if (b === 0) throw NOT_CONST; return fl ? a / b : Math.trunc(a / b);
          case '%': if (b === 0) throw NOT_CONST; return a % b;
          case '<<': return a << b; case '>>': return a >> b; case '&': return a & b; case '|': return a | b; case '^': return a ^ b;
          case '<': return +(a < b); case '>': return +(a > b); case '<=': return +(a <= b); case '>=': return +(a >= b); case '==': return +(a === b); case '!=': return +(a !== b);
        }
        throw NOT_CONST;
      }
      case 'and': return (this.cval(e.l) && this.cval(e.r)) ? 1 : 0;
      case 'or': return (this.cval(e.l) || this.cval(e.r)) ? 1 : 0;
      case 'cond': return this.cval(e.c) ? this.cval(e.a) : this.cval(e.b);
    }
    throw NOT_CONST;
  };
  P.constExpr = function () {
    var t = this.peek(), e = this.condExpr(), v = this.tryConst(e);
    if (v == null) cerr('Expected a constant expression', t);
    return Number(v);
  };

  // ---- expression helpers (typing)
  function N(k, t, tok, props) { var n = props || {}; n.k = k; n.t = t; n.line = tok ? tok.line : 0; return n; }
  P.rval = function (e) {
    if (e.t.k === 'arr') { return { k: 'decay', e: e, t: ptr(e.t.of), line: e.line, hasCall: e.hasCall }; }
    if (e.t.k === 'func') { return { k: 'fnaddr', e: e, t: ptr(e.t), line: e.line, hasCall: false }; }
    return e;
  };
  P.conv = function (e, t, tok, ctx) {
    e = this.rval(e);
    if (sameType(e.t, t) && e.t.k === t.k) return e;
    if (t.k === 'void') return { k: 'cast', e: e, t: t, from: e.t, line: e.line, hasCall: e.hasCall };
    if (isAgg(t) || isAgg(e.t)) {
      if (e.t === t) return e;
      cerr('Cannot convert ' + typeName(e.t) + ' to ' + typeName(t) + (ctx ? ' ' + ctx : ''), tok);
    }
    if (e.t.k === 'void') cerr('A void value cannot be used ' + (ctx || 'here'), tok);
    if (isPtr(t) && isFlt(e.t)) cerr('Cannot convert ' + typeName(e.t) + ' to a pointer', tok);
    if (isFlt(t) && isPtr(e.t)) cerr('Cannot convert a pointer to ' + typeName(t), tok);
    if (isPtr(t) && isInt(e.t) && !(e.k === 'num' && e.v === 0) && ctx !== 'cast') this.warn('Making a pointer from an integer without a cast' + (ctx ? ' ' + ctx : ''), tok);
    if (isInt(t) && isPtr(e.t) && ctx !== 'cast' && !t.bool) this.warn('Making an integer from a pointer without a cast' + (ctx ? ' ' + ctx : ''), tok);
    if (isPtr(t) && isPtr(e.t) && ctx !== 'cast' && t.to.k !== 'void' && e.t.to.k !== 'void' && !sameType(t.to, e.t.to)) {
      this.warn('Incompatible pointer types: ' + typeName(e.t) + ' assigned to ' + typeName(t) + (ctx ? ' ' + ctx : ''), tok);
    }
    if (isPtr(t) && e.k === 'call' && (e.fname === 'malloc' || e.fname === 'calloc' || e.fname === 'realloc')) e.hint = t.to;
    if (isFlt(t) && e.k === 'bin' && e.op === '/' && isInt(e.t) && ctx !== 'cast') {
      this.warn('Integer division: both sides of / are integers, so the decimal part is thrown away before converting to ' + t.name + '. Write e.g. 5.0/2 or (float)a/b.', tok);
    }
    return { k: 'cast', e: e, t: t, from: e.t, line: e.line, hasCall: e.hasCall };
  };
  P.condValue = function (e, tok) {
    e = this.rval(e);
    if (!isScalar(e.t)) cerr('A ' + typeName(e.t) + ' cannot be used as a condition', tok);
    return e;
  };
  function hc() { for (var i = 0; i < arguments.length; i++) if (arguments[i] && arguments[i].hasCall) return true; return false; }

  P.binary = function (op, l, r, tok) {
    l = this.rval(l); r = this.rval(r);
    var lt = l.t, rt = r.t, n;
    if (op === '+' || op === '-') {
      if (isPtr(lt) && isInt(rt)) return N('padd', lt, tok, { p: l, i: this.conv(r, T.long, tok), neg: op === '-', scale: this.elemSize(lt, tok), hasCall: hc(l, r) });
      if (op === '+' && isInt(lt) && isPtr(rt)) return N('padd', rt, tok, { p: r, i: this.conv(l, T.long, tok), neg: false, scale: this.elemSize(rt, tok), hasCall: hc(l, r) });
      if (op === '-' && isPtr(lt) && isPtr(rt)) return N('pdiff', T.long, tok, { l: l, r: r, scale: this.elemSize(lt, tok), hasCall: hc(l, r) });
    }
    if (op === '==' || op === '!=' || op === '<' || op === '>' || op === '<=' || op === '>=') {
      if (isPtr(lt) || isPtr(rt)) {
        if (isPtr(lt) && isPtr(rt) && (op === '==' || op === '!=') && lt.to.k === 'int' && lt.to.size === 1 && rt.to.k === 'int' && rt.to.size === 1 && (l.k === 'decay' || r.k === 'decay'))
          this.warn('Comparing strings with ' + op + ' compares their addresses, not their text. Use strcmp(a, b) == 0 instead.', tok);
        return N('cmp', T.int, tok, { op: op, l: this.conv(l, T.ulong, tok, 'cast'), r: this.conv(r, T.ulong, tok, 'cast'), ct: T.ulong, hasCall: hc(l, r) });
      }
      if (!isArith(lt) || !isArith(rt)) cerr('Cannot compare ' + typeName(lt) + ' with ' + typeName(rt), tok);
      var ct = arithConv(lt, rt);
      if (isInt(ct) && ct.uns && ((isInt(lt) && !lt.uns && lt.size >= 4 && l.k !== 'num') || (isInt(rt) && !rt.uns && rt.size >= 4 && r.k !== 'num')))
        this.warn('Comparing signed and unsigned values: a negative number becomes a huge unsigned number here', tok);
      return N('cmp', T.int, tok, { op: op, l: this.conv(l, ct, tok), r: this.conv(r, ct, tok), ct: ct, hasCall: hc(l, r) });
    }
    if (!isArith(lt) || !isArith(rt)) cerr("Operator '" + op + "' cannot be used with " + typeName(lt) + ' and ' + typeName(rt), tok);
    if ((op === '%' || op === '<<' || op === '>>' || op === '&' || op === '|' || op === '^') && (!isInt(lt) || !isInt(rt)))
      cerr("Operator '" + op + "' needs integer operands, but got " + typeName(lt) + ' and ' + typeName(rt) + (op === '%' ? ' (use fmod() from math.h for decimals)' : ''), tok);
    var ct2 = (op === '<<' || op === '>>') ? promote(lt) : arithConv(lt, rt);
    n = N('bin', ct2, tok, { op: op, l: this.conv(l, ct2, tok), r: this.conv(r, op === '<<' || op === '>>' ? promote(rt) : ct2, tok), ct: ct2, hasCall: hc(l, r) });
    if (op === '/' && r.k === 'num' && r.v === 0 && isInt(ct2)) this.warn('Division by zero', tok);
    return n;
  };
  P.elemSize = function (pt, tok) {
    var to = pt.to;
    if (to.k === 'void') return 1;
    if (to.k === 'func') cerr('Cannot do arithmetic on a function pointer', tok);
    if (to.vla) return { vla: to };
    if (isAgg(to) && !to.complete) cerr('Cannot use incomplete type ' + typeName(to), tok);
    return to.size;
  };
  P.checkLvalue = function (e, tok, what) {
    if (!e.lv) cerr('The left side of ' + what + ' must be a variable (an lvalue)', tok);
    if (e.t.k === 'arr') cerr('Cannot assign to a whole array' + (e.t.of.size === 1 ? ' — use strcpy() to copy strings' : ' — copy it element by element with a loop'), tok);
    if (e.t.k === 'func') cerr('Cannot assign to a function', tok);
    if (e.isConst) cerr('Cannot modify a const variable', tok);
  };

  // ---- expressions
  P.expr = function () {
    var tok = this.peek(), e = this.assignExpr();
    while (this.is(',')) {
      var t = this.next(), r = this.assignExpr();
      e = N('comma', this.rval(r).t, t, { l: this.rval(e), r: this.rval(r), hasCall: hc(e, r) });
    }
    return e;
  };
  var ASSIGN_OPS = { '=': 1, '+=': 1, '-=': 1, '*=': 1, '/=': 1, '%=': 1, '<<=': 1, '>>=': 1, '&=': 1, '^=': 1, '|=': 1 };
  P.assignExpr = function () {
    var l = this.condExpr();
    var t = this.peek();
    if (t.k === 'p' && ASSIGN_OPS[t.v]) {
      this.next();
      var r = this.assignExpr();
      this.checkLvalue(l, t, "'" + t.v + "'");
      if (t.v === '=') {
        var rv = this.conv(r, l.t, t, 'in assignment');
        return N('assign', l.t, t, { l: l, r: rv, hasCall: hc(l, r) });
      }
      var op = t.v.slice(0, -1);
      var lt = l.t, rr = this.rval(r);
      if (isPtr(lt) && (op === '+' || op === '-')) {
        if (!isInt(rr.t)) cerr('Can only add an integer to a pointer', t);
        return N('opassign', lt, t, { op: op, l: l, r: this.conv(rr, T.long, t), ptr: true, scale: this.elemSize(lt, t), hasCall: hc(l, r) });
      }
      if (!isArith(lt) || !isArith(rr.t)) cerr("Operator '" + t.v + "' cannot be used with " + typeName(lt), t);
      if ((op === '%' || op === '<<' || op === '>>' || op === '&' || op === '|' || op === '^') && (!isInt(lt) || !isInt(rr.t))) cerr("Operator '" + t.v + "' needs integer operands", t);
      var ct = (op === '<<' || op === '>>') ? promote(lt) : arithConv(lt, rr.t);
      return N('opassign', lt, t, { op: op, l: l, r: this.conv(rr, (op === '<<' || op === '>>') ? promote(rr.t) : ct, t), ct: ct, hasCall: hc(l, r) });
    }
    return l;
  };
  P.condExpr = function () {
    var c = this.binExpr(0);
    if (this.is('?')) {
      var t = this.next();
      var a = this.rval(this.expr());
      this.expect(':', "in the ?: operator");
      var b = this.rval(this.condExpr());
      c = this.condValue(c, t);
      var rt;
      if (isArith(a.t) && isArith(b.t)) rt = arithConv(a.t, b.t);
      else if (isPtr(a.t) && isPtr(b.t)) rt = a.t.to.k === 'void' ? b.t : a.t;
      else if (isPtr(a.t) && isInt(b.t)) rt = a.t;
      else if (isInt(a.t) && isPtr(b.t)) rt = b.t;
      else if (a.t === b.t) rt = a.t;
      else cerr('The two sides of ?: have incompatible types (' + typeName(a.t) + ' and ' + typeName(b.t) + ')', t);
      return N('cond', rt, t, { c: c, a: rt.k === 'void' ? a : this.conv(a, rt, t, 'cast'), b: rt.k === 'void' ? b : this.conv(b, rt, t, 'cast'), hasCall: hc(c, a, b) });
    }
    return c;
  };
  var LEVELS = [['||'], ['&&'], ['|'], ['^'], ['&'], ['==', '!='], ['<', '>', '<=', '>='], ['<<', '>>'], ['+', '-'], ['*', '/', '%']];
  P.binExpr = function (lv) {
    if (lv >= LEVELS.length) return this.castExpr();
    var l = this.binExpr(lv + 1);
    while (true) {
      var t = this.peek();
      if (t.k !== 'p' || LEVELS[lv].indexOf(t.v) < 0) break;
      this.next();
      var r = this.binExpr(lv + 1);
      if (t.v === '&&' || t.v === '||') {
        l = N(t.v === '&&' ? 'and' : 'or', T.int, t, { l: this.condValue(l, t), r: this.condValue(r, t), hasCall: hc(l, r) });
      } else {
        if ((t.v === '<' || t.v === '>' || t.v === '<=' || t.v === '>=') && l.k === 'cmp' && !l.paren)
          this.warn('a < b < c does not work like in math: it compares (a < b), which is 0 or 1, with c. Use a < b && b < c.', t);
        l = this.binary(t.v, l, r, t);
      }
    }
    return l;
  };
  P.castExpr = function () {
    if (this.is('(') && this.isTypeStart(1)) {
      var save = this.p, t = this.next();
      var ty = this.typeName();
      this.expect(')');
      if (this.is('{')) cerr('Compound literals are not supported', t);
      var e = this.castExpr();
      if (ty.k !== 'void' && !isScalar(ty)) cerr('Cannot cast to ' + typeName(ty), t);
      var r = this.rval(e);
      if (ty.k !== 'void' && !isScalar(r.t)) cerr('Cannot cast a ' + typeName(r.t) + ' to ' + typeName(ty), t);
      var c = this.conv(r, ty, t, 'cast');
      if (c === r) c = { k: 'cast', e: r, t: ty, from: r.t, line: t.line, hasCall: r.hasCall };
      c.explicit = true;
      return c;
    }
    return this.unaryExpr();
  };
  P.unaryExpr = function () {
    var t = this.peek();
    if (t.k === 'p') {
      switch (t.v) {
        case '++': case '--': {
          this.next(); var e = this.unaryExpr();
          this.checkLvalue(e, t, "'" + t.v + "'");
          if (!isScalar(e.t)) cerr("Cannot use '" + t.v + "' on " + typeName(e.t), t);
          return N('incdec', e.t, t, { e: e, pre: true, d: t.v === '++' ? 1 : -1, scale: isPtr(e.t) ? this.elemSize(e.t, t) : 1, hasCall: e.hasCall });
        }
        case '&': {
          this.next(); var a = this.castExpr();
          if (a.t.k === 'func') return N('fnaddr', ptr(a.t), t, { e: a });
          if (!a.lv) cerr("Cannot take the address (&) of something that is not a variable", t);
          if (a.isReg) cerr('Cannot take the address of a register variable', t);
          return N('addr', ptr(a.t), t, { e: a, hasCall: a.hasCall });
        }
        case '*': {
          this.next(); var d = this.rval(this.castExpr());
          if (!isPtr(d.t)) cerr('Cannot dereference (*) a ' + typeName(d.t) + ' — it is not a pointer', t);
          if (d.t.to.k === 'void') cerr('Cannot dereference a void* pointer — cast it to a real pointer type first', t);
          if (d.t.to.k === 'func') return d;
          return N('deref', d.t.to, t, { e: d, lv: true, hasCall: d.hasCall });
        }
        case '+': case '-': case '~': case '!': {
          this.next(); var u = this.rval(this.castExpr());
          if (t.v === '!') return N('not', T.int, t, { e: this.condValue(u, t), hasCall: u.hasCall });
          if (!isArith(u.t) || (t.v === '~' && !isInt(u.t))) cerr("Operator '" + t.v + "' cannot be used on " + typeName(u.t), t);
          var pt = promote(u.t);
          if (u.k === 'num' && t.v === '-') return N('num', u.t, t, { v: typeof u.v === 'bigint' ? -u.v : -u.v });
          return N('un', pt, t, { op: t.v, e: this.conv(u, pt, t), hasCall: u.hasCall });
        }
      }
    }
    if (t.k === 'id' && t.v === 'sizeof') {
      this.next();
      var st;
      if (this.is('(') && this.isTypeStart(1)) { this.next(); st = this.typeName(); this.expect(')'); }
      else { var se = this.unaryExpr(); st = se.t; if (st.vla) return N('sizeofvla', T.ulong, t, { vt: st }); }
      if (st.vla) return N('sizeofvla', T.ulong, t, { vt: st });
      if (st.k === 'func') cerr('Cannot take sizeof a function', t);
      if (isAgg(st) && !st.complete) cerr('sizeof incomplete type ' + typeName(st), t);
      return N('num', T.ulong, t, { v: BigInt(st.size), isSizeof: true });
    }
    return this.postfixExpr();
  };
  P.postfixExpr = function () {
    var e = this.primary();
    while (true) {
      var t = this.peek();
      if (t.k !== 'p') break;
      if (t.v === '[') {
        this.next();
        var idx = this.expr();
        this.expect(']', 'to close the array index');
        var base = this.rval(e), ir = this.rval(idx);
        if (isInt(base.t) && isPtr(ir.t)) { var tmp = base; base = ir; ir = tmp; }
        if (!isPtr(base.t)) cerr('Cannot index [] into ' + typeName(e.t) + ' — it is not an array or pointer', t);
        if (!isInt(ir.t)) cerr('Array index must be an integer, not ' + typeName(ir.t), t);
        if (base.t.to.k === 'void') cerr('Cannot index a void* pointer', t);
        var bound = (e.t.k === 'arr' && e.t.len != null) ? e.t.len : null;
        e = N('index', base.t.to, t, { b: base, i: this.conv(ir, T.long, t), scale: this.elemSize(base.t, t), lv: true, bound: bound, name: exprName(e), hasCall: hc(base, ir) });
        continue;
      }
      if (t.v === '(') {
        this.next();
        e = this.call(e, t);
        continue;
      }
      if (t.v === '.' || t.v === '->') {
        this.next();
        var nm = this.next();
        if (nm.k !== 'id') cerr('Expected a member name after ' + t.v, nm);
        var st, obj = e;
        if (t.v === '->') {
          var pe = this.rval(e);
          if (!isPtr(pe.t) || !isAgg(pe.t.to)) {
            if (isAgg(e.t)) cerr("'" + exprName(e) + "' is a struct, not a pointer — use '.' instead of '->'", t);
            cerr("'->' needs a pointer to a struct, but this is " + typeName(pe.t), t);
          }
          st = pe.t.to; obj = N('deref', st, t, { e: pe, lv: true, hasCall: pe.hasCall });
        } else {
          if (!isAgg(e.t)) {
            if (isPtr(e.t) && isAgg(e.t.to)) cerr("'" + exprName(e) + "' is a pointer to a struct — use '->' instead of '.'", t);
            cerr("'.' can only be used on a struct or union, but this is " + typeName(e.t), t);
          }
          st = e.t;
        }
        if (!st.complete) cerr('Incomplete type ' + typeName(st), t);
        var f = null; for (var k = 0; k < st.fields.length; k++) if (st.fields[k].name === nm.v) f = st.fields[k];
        if (!f) cerr(typeName(st) + " has no member named '" + nm.v + "'", nm);
        e = N('member', f.type, t, { e: obj, off: f.offset, field: f.name, lv: obj.lv, hasCall: obj.hasCall });
        continue;
      }
      if (t.v === '++' || t.v === '--') {
        this.next();
        this.checkLvalue(e, t, "'" + t.v + "'");
        if (!isScalar(e.t)) cerr("Cannot use '" + t.v + "' on " + typeName(e.t), t);
        e = N('incdec', e.t, t, { e: e, pre: false, d: t.v === '++' ? 1 : -1, scale: isPtr(e.t) ? this.elemSize(e.t, t) : 1, hasCall: e.hasCall });
        continue;
      }
      break;
    }
    return e;
  };
  function exprName(e) {
    if (e.k === 'var') return e.sym.name;
    if (e.k === 'member') return exprName(e.e) + '.' + e.field;
    if (e.k === 'index') return e.name + '[]';
    if (e.k === 'deref') return '*' + exprName(e.e);
    if (e.k === 'decay') return exprName(e.e);
    return 'expression';
  }
  P.call = function (fe, t) {
    var args = [], argToks = [];
    if (!this.is(')')) {
      do { argToks.push(this.peek()); args.push(this.assignExpr()); } while (this.accept(','));
    }
    this.expect(')', 'to close the function call');
    var ft, fname = null, direct = null;
    if (fe.t.k === 'func') { ft = fe.t; if (fe.k === 'var') { direct = fe.sym; fname = fe.sym.name; } }
    else { var pe = this.rval(fe); if (isPtr(pe.t) && pe.t.to.k === 'func') { ft = pe.t.to; fe = pe; } }
    if (!ft) cerr("'" + exprName(fe) + "' is not a function", t);
    var np = ft.params.length;
    if (!ft.oldStyle) {
      if (args.length < np) cerr('Too few arguments to ' + (fname || 'function') + ': expected ' + np + ', got ' + args.length, t);
      if (args.length > np && !ft.variadic) cerr('Too many arguments to ' + (fname || 'function') + ': expected ' + np + ', got ' + args.length, t);
    }
    var self = this, any = !!(direct ? !direct.builtin : true);
    var cargs = args.map(function (a, i) {
      if (i < np && !ft.oldStyle) {
        var ce = self.conv(a, ft.params[i], argToks[i], 'for argument ' + (i + 1) + (fname ? ' of ' + fname : ''));
        if (ce.k === 'cast' && isFlt(ce.t) && (direct && (fname === 'abs')) ) {}
        return ce;
      }
      var r = self.rval(a);
      if (r.t.k === 'void') cerr('Cannot pass a void value', argToks[i]);
      if (isFlt(r.t) && r.t.size === 4) return self.conv(r, T.double, argToks[i]);
      if (isInt(r.t) && r.t.size < 4) return self.conv(r, T.int, argToks[i]);
      return r;
    });
    if (fname === 'abs' && args[0] && isFlt(this.rval(args[0]).t)) this.warn('abs() works on integers; use fabs() from math.h for decimals', t);
    if (direct && direct.builtin && this.opts.onBuiltinUse) this.opts.onBuiltinUse(fname, t);
    var n = N('call', ft.ret, t, { f: direct ? null : this.rval(fe), sym: direct, fname: fname, args: cargs, ft: ft, hasCall: true });
    if (fname === 'printf' || fname === 'scanf' || fname === 'fprintf' || fname === 'fscanf' || fname === 'sprintf' || fname === 'sscanf') n.fmtArg = (fname === 'printf' || fname === 'scanf') ? 0 : 1;
    if (isAgg(ft.ret)) n.tmp = this.fn ? this.localSlot(ft.ret) : this.allocStatic(ft.ret.size, alignOf(ft.ret));
    return n;
  };
  P.localSlot = function (t) {
    var a = alignOf(t);
    this.fn.frameSize = Math.ceil(this.fn.frameSize / a) * a;
    var off = this.fn.frameSize; this.fn.frameSize += t.size;
    return { local: off };
  };
  P.primary = function () {
    var t = this.next();
    if (t.k === 'num') return this.numLit(t);
    if (t.k === 'chr') return N('num', T.int, t, { v: t.v, chr: true });
    if (t.k === 'str') {
      var bytes = t.v.slice();
      while (this.peek().k === 'str') bytes = bytes.concat(this.next().v);
      var a = this.strLit(bytes);
      return N('str', arr(T.char, bytes.length + 1), t, { addr: a, lv: true, bytes: bytes });
    }
    if (t.k === 'id') {
      if (t.v === '__func__' || t.v === '__FUNCTION__') {
        var nm = CI.utf8Bytes(this.fn ? this.fn.name : '');
        return N('str', arr(T.char, nm.length + 1), t, { addr: this.strLit(nm), lv: true });
      }
      var s = this.scope.find(t.v);
      if (!s && this.knownFuncs && this.knownFuncs.has(t.v) && this.is('(')) {
        s = this.knownFuncs.get(t.v);
        this.warn("Function '" + t.v + "' is used before it is declared. Add a prototype above main, e.g. " + typeName(s.type.ret) + ' ' + t.v + '(...);', t);
        this.global.vars.set(t.v, s);
      }
      if (!s) {
        if (this.is('(')) cerr("Function '" + t.v + "' is not defined" + suggestHeader(t.v), t);
        cerr("'" + t.v + "' is not declared. Declare it first, e.g. int " + t.v + ';', t);
      }
      if (s.kind === 'enumconst') return N('num', T.int, t, { v: s.value });
      if (s.kind === 'typedef') cerr("'" + t.v + "' is a type name, not a value", t);
      if (s.kind === 'func') return N('var', s.type, t, { sym: s });
      return N('var', s.type, t, { sym: s, lv: true, isConst: s.isConst && false, isReg: s.isReg });
    }
    if (t.k === 'p' && t.v === '(') {
      var e = this.expr();
      this.expect(')', 'to close (');
      if (e.k === 'cmp' || e.k === 'assign') e.paren = true;
      return e;
    }
    if (t.k === 'eof') cerr('Unexpected end of file — is a } or ; missing?', t);
    cerr("Unexpected '" + (t.raw || t.v) + "' — expected a value or expression", t);
  };
  function suggestHeader(n) {
    var h = { getch: ' (getch is from conio.h which is not standard C; use getchar())', clrscr: ' (clrscr is from conio.h which is not standard C — remove it)', getche: ' (conio.h is not standard C; use getchar())' };
    return h[n] || '';
  }
  P.numLit = function (t) {
    var s = t.v, m;
    var isFloat = /[.]/.test(s) || (/[eE]/.test(s) && !/^0[xX]/.test(s)) || /^0[xX].*[pP]/.test(s);
    if (isFloat) {
      var suf = (s.match(/[fFlL]$/) || [''])[0];
      var v = parseFloat(s.replace(/[fFlL]$/, ''));
      if (isNaN(v)) cerr('Invalid number ' + s, t);
      var ft = /[fF]/.test(suf) ? T.float : /[lL]/.test(suf) ? T.ldouble : T.double;
      return N('num', ft, t, { v: ft === T.float ? Math.fround(v) : v });
    }
    m = s.match(/^(0[xX][0-9a-fA-F]+|0[bB][01]+|0[0-7]*|[1-9][0-9]*)([uUlL]*)$/);
    if (!m) cerr('Invalid number ' + s, t);
    var body = m[1], sf = m[2].toLowerCase();
    var big = /^0[xX]/.test(body) ? BigInt(body) : /^0[bB]/.test(body) ? BigInt(body) : (body.length > 1 && body[0] === '0') ? BigInt('0o' + body.slice(1)) : BigInt(body);
    var dec = !/^0/.test(body) || body === '0';
    var uns = sf.indexOf('u') >= 0, longs = (sf.match(/l/g) || []).length;
    var ty;
    if (!uns && longs === 0 && big <= 2147483647n) ty = T.int;
    else if (uns && longs === 0 && big <= 4294967295n) ty = T.uint;
    else if (!uns && longs === 0 && !dec && big <= 4294967295n) ty = T.uint;
    else if (!uns && big <= 9223372036854775807n) ty = longs === 2 ? T.llong : T.long;
    else ty = longs === 2 ? T.ullong : T.ulong;
    return N('num', ty, t, { v: is64(ty) ? BigInt.asIntN(64, big) * 1n : Number(big) });
  };

  // ---- initializers
  P.initializer = function () {
    if (this.is('{')) {
      var t = this.next(), items = [];
      while (!this.is('}')) {
        if (this.is('[') || this.is('.')) cerr('Designated initializers ([i] = or .field =) are not supported here', this.peek());
        items.push(this.initializer());
        if (!this.accept(',')) break;
      }
      this.expect('}', 'to close the initializer list');
      return { list: items, tok: t };
    }
    var tk = this.peek();
    return { e: this.assignExpr(), tok: tk };
  };
  // flatten initializer into store list; returns possibly-completed type
  P.flattenInit = function (type, init, out) {
    var self = this;
    function isCharArr(t) { return t.k === 'arr' && t.of.k === 'int' && t.of.size === 1; }
    function strOf(it) { var e = it.e; while (e && e.paren) e = e; return e && e.k === 'str' ? e : null; }
    function storeScalar(t, off, it) {
      while (it.list) { if (!it.list.length) return; it = it.list[0]; }
      var tk = it.tok;
      if (isAgg(t)) { var ce = self.conv(it.e, t, tk, 'in initialization'); out.push({ off: off, t: t, e: ce }); return; }
      out.push({ off: off, t: t, e: self.conv(it.e, t, tk, 'in initialization') });
    }
    function fill(t, off, cur) { // cur: {items, i}
      if (t.k === 'arr') {
        var n = 0;
        while (cur.i < cur.items.length && (t.len == null || n < t.len)) {
          var it = cur.items[cur.i], eoff = off + n * t.of.size;
          if (it.list) { cur.i++; braced(t.of, eoff, it); }
          else if (isCharArr(t.of) && strOf(it)) { cur.i++; strStore(t.of, eoff, strOf(it)); }
          else if (isScalar(t.of) || (isAgg(t.of) && it.e && self.rval(it.e).t === t.of)) { cur.i++; storeScalar(t.of, eoff, it); }
          else fill(t.of, eoff, cur);
          n++;
        }
        return n;
      }
      if (isAgg(t)) {
        var fields = t.k === 'union' ? t.fields.slice(0, 1) : t.fields;
        for (var f = 0; f < fields.length && cur.i < cur.items.length; f++) {
          var ft = fields[f].type, it2 = cur.items[cur.i], fo = off + fields[f].offset;
          if (it2.list) { cur.i++; braced(ft, fo, it2); }
          else if (isCharArr(ft) && strOf(it2)) { cur.i++; strStore(ft, fo, strOf(it2)); }
          else if (isScalar(ft) || (isAgg(ft) && it2.e && self.rval(it2.e).t === ft)) { cur.i++; storeScalar(ft, fo, it2); }
          else fill(ft, fo, cur);
        }
        return 0;
      }
      storeScalar(t, off, cur.items[cur.i++]);
      return 1;
    }
    function strStore(t, off, se) {
      var bytes = se.bytes.concat([0]);
      if (t.len != null && bytes.length - 1 > t.len) self.warn('String "' + String.fromCharCode.apply(null, se.bytes.slice(0, 20)) + '" is too long for char[' + t.len + ']', { line: se.line });
      out.push({ off: off, str: t.len == null ? bytes : bytes.slice(0, t.len), t: t });
      return bytes.length;
    }
    function braced(t, off, it) {
      if (isScalar(t)) { storeScalar(t, off, it); return; }
      if (isCharArr(t) && it.list.length === 1 && strOf(it.list[0])) { strStore(t, off, strOf(it.list[0])); return; }
      var cur = { items: it.list, i: 0 };
      var n = fill(t, off, cur);
      if (cur.i < cur.items.length) self.warn('Too many values in initializer list (extra ones are ignored)', it.tok);
      return n;
    }
    if (init.list) {
      if (type.k === 'arr' && type.len == null) {
        if (isCharArr(type) && init.list.length === 1 && strOf(init.list[0])) { var nb = strOf(init.list[0]).bytes.length + 1; type = arr(type.of, nb); strStore(type, 0, strOf(init.list[0])); return type; }
        var cur = { items: init.list, i: 0 };
        var cnt = fill({ k: 'arr', of: type.of, len: null }, 0, cur);
        return arr(type.of, cnt);
      }
      braced(type, 0, init);
      return type;
    }
    if (type.k === 'arr') {
      var s = strOf(init);
      if (isCharArr(type) && s) {
        if (type.len == null) type = arr(type.of, s.bytes.length + 1);
        strStore(type, 0, s); return type;
      }
      cerr('An array must be initialized with { ... }' + (isCharArr(type) ? ' or a "string"' : ''), init.tok);
    }
    storeScalar(type, 0, init);
    return type;
  };

  // ---- declarations
  P.declaration = function (ds, isGlobal) {
    var decls = [];
    if (this.is(';')) { this.next(); return decls; } // struct definition only
    do {
      var d = this.declarator(false);
      var ty = d.apply(ds.base);
      if (ds.storage === 'typedef') {
        if (isAgg(ty) && !ty.alias && !ty.tag) ty.alias = d.name;
        else if (isAgg(ty) && !ty.alias) ty.alias = d.name;
        this.scope.vars.set(d.name, { kind: 'typedef', name: d.name, type: ty });
        continue;
      }
      if (ty.k === 'func') {
        var ex = this.scope.find(d.name);
        if (ex && ex.kind === 'func' && ex.builtin && !this.inPrelude) ex = null;
        if (ex && ex.kind === 'func') { if (!ex.type.params.length && ty.params.length) ex.type = ty; this.scope.vars.set(d.name, ex); continue; }
        var fs = this.funcSym(d.name, ty, d.tok);
        this.scope.vars.set(d.name, fs);
        continue;
      }
      if (ty.k === 'void') cerr("Variable '" + d.name + "' cannot have type void", d.tok);
      var prev = this.scope.vars.get(d.name);
      if (prev && !(isGlobal && (ds.storage === 'extern' || prev.isExtern))) cerr("'" + d.name + "' is already declared in this scope", d.tok);
      var sym = { kind: 'var', name: d.name, type: ty, isConst: ds.isConst, line: d.tok.line, isReg: ds.storage === 'register' };
      var init = null;
      if (this.accept('=')) init = this.initializer();
      if (prev && isGlobal) { sym = prev; if (init) sym.type = ty; }
      var stores = [];
      if (init) { ty = this.flattenInit(ty, init, stores); sym.type = ty; }
      if (ty.k === 'arr' && ty.len == null && !ty.vla && ds.storage !== 'extern') cerr("Array '" + d.name + "' needs a size, e.g. int " + d.name + '[10];', d.tok);
      if (isAgg(ty) && !ty.complete) cerr("Variable '" + d.name + "' has incomplete type " + typeName(ty), d.tok);
      if (isGlobal || ds.storage === 'static') {
        if (ds.storage === 'extern' && !init) { sym.isExtern = true; if (!prev) { sym.storage = 'global'; sym.addr = this.allocStatic(Math.max(ty.size, 8), alignOf(ty)); this.globals.push(sym); } this.scope.vars.set(d.name, sym); continue; }
        if (!prev || prev.addr == null) { sym.storage = isGlobal ? 'global' : 'static'; sym.addr = this.allocStatic(ty.size, alignOf(ty)); }
        sym.isExtern = false;
        if (ty.vla) cerr('Global/static arrays need a constant size', d.tok);
        this.scope.vars.set(d.name, sym);
        if (!prev) (isGlobal ? this.globals : this.fn.statics).push(sym);
        if (stores.length) {
          var self = this;
          stores.forEach(function (s) { if (s.e && self.tryConst(s.e) == null && !isAddrConst(s.e)) cerr('Initializer for global/static variable ' + d.name + ' must be a constant', d.tok); });
          var sd = { k: 'decl', sym: sym, stores: stores, line: d.tok.line, isStatic: true };
          if (isGlobal) decls.push(sd); else { this.staticDecls.push(sd); decls.push({ k: 'decl', sym: sym, stores: [], line: d.tok.line, isStatic: true }); }
          continue;
        }
        if (!isGlobal) { decls.push({ k: 'decl', sym: sym, stores: [], line: d.tok.line, isStatic: true }); }
        continue;
      }
      // local
      sym.storage = 'local';
      if (ty.vla) {
        sym.vla = true;
        var slot = this.localSlot(T.ulong); sym.offset = slot.local;
        if (init) cerr('Variable-length arrays cannot be initialized', d.tok);
      } else {
        var a = alignOf(ty);
        this.fn.frameSize = Math.ceil(this.fn.frameSize / a) * a;
        sym.offset = this.fn.frameSize; this.fn.frameSize += ty.size;
      }
      this.scope.vars.set(d.name, sym);
      decls.push({ k: 'decl', sym: sym, stores: stores, line: d.tok.line, hasInit: !!init, hasCall: stores.some(function (s) { return s.e && s.e.hasCall; }) || !!sym.vla });
    } while (this.accept(','));
    this.expect(';', 'after the declaration');
    return decls;
  };
  function isAddrConst(e) {
    if (e.k === 'cast') return isAddrConst(e.e);
    return e.k === 'decay' || e.k === 'addr' || e.k === 'fnaddr' || e.k === 'str' || (e.k === 'padd' && isAddrConst(e.p));
  }

  P.funcSym = function (name, ty, tok) {
    var s = { kind: 'func', name: name, type: ty, id: this.funcs.length, def: null, line: tok ? tok.line : 0 };
    if (this.opts.builtins && this.opts.builtins[name] && this.opts.prelude) s.builtin = true;
    this.funcs.push(s);
    return s;
  };

  P.translationUnit = function () {
    var items = [];
    while (this.peek().k !== 'eof') {
      if (this.accept(';')) continue;
      var startTok = this.peek();
      var ds = this.declSpec();
      if (!ds) {
        // implicit int function like `main() {`
        if (startTok.k === 'id' && this.is('(', 1)) { ds = { base: T.int, storage: null, tok: startTok }; this.warn('Missing return type: assuming int ' + startTok.v + '()', startTok); }
        else if (startTok.k === 'id') cerr("Unknown type name '" + startTok.v + "'" + (startTok.v === 'string' ? ' — C has no string type, use char name[50]' : startTok.v === 'boolean' ? ' — use int or bool (#include <stdbool.h>)' : ''), startTok);
        else cerr("Unexpected '" + (startTok.raw || startTok.v) + "' at the top level", startTok);
      }
      if (this.is(';')) { this.next(); continue; }
      var save = this.p;
      var d = this.declarator(false);
      var ty = d.apply(ds.base);
      if (ty.k === 'func' && this.is('{')) {
        this.funcDef(d, ty, ds);
        continue;
      }
      if (ty.k === 'func' && ds.storage !== 'typedef' && !this.is(';') && !this.is(',') && !this.is('=') && this.peek().k === 'id' && this.isTypeStart(0) ) {
        cerr('Old-style parameter declarations are not supported', this.peek());
      }
      this.p = save;
      var decls = this.declaration(ds, true);
      Array.prototype.push.apply(items, decls);
    }
    return items;
  };

  P.funcDef = function (d, ty, ds) {
    var name = d.name;
    var sym = this.global.vars.get(name);
    if (sym && sym.kind === 'func' && (sym.builtin || sym.pass1)) { sym = this.funcSym(name, ty, d.tok); this.global.vars.set(name, sym); }
    if (sym && sym.kind === 'func') {
      if (sym.def) cerr("Function '" + name + "' is defined twice", d.tok);
      if (!sameType(sym.type.ret, ty.ret)) cerr("Function '" + name + "' was declared returning " + typeName(sym.type.ret) + ' but defined returning ' + typeName(ty.ret), d.tok);
      if (!sym.type.oldStyle && sym.type.params.length !== ty.params.length) cerr("Function '" + name + "' was declared with " + sym.type.params.length + ' parameter(s) but defined with ' + ty.params.length, d.tok);
      sym.type = ty;
    } else if (sym) cerr("'" + name + "' is already declared as a variable", d.tok);
    else { sym = this.funcSym(name, ty, d.tok); this.global.vars.set(name, sym); }
    sym.builtin = false;
    var fn = { name: name, sym: sym, frameSize: 0, params: [], statics: [], line: d.tok.line, labels: {} };
    this.fn = fn;
    var outer = this.scope;
    this.scope = new Scope(this.global, 'func');
    var pr = d.params || { types: [], names: [], toks: [] };
    for (var i = 0; i < ty.params.length; i++) {
      var pn = pr.names[i];
      if (!pn) cerr('Parameter ' + (i + 1) + ' of ' + name + ' needs a name', d.tok);
      var pt = ty.params[i], a = alignOf(pt);
      fn.frameSize = Math.ceil(fn.frameSize / a) * a;
      var ps = { kind: 'var', name: pn, type: pt, storage: 'local', offset: fn.frameSize, line: pr.toks[i].line, param: true };
      fn.frameSize += pt.size;
      if (this.scope.vars.has(pn)) cerr("Two parameters are named '" + pn + "'", pr.toks[i]);
      this.scope.vars.set(pn, ps); fn.params.push(ps);
    }
    var bodyTok = this.peek();
    if (this.opts.skipBodies) {
      var depth = 0;
      do { var bt = this.next(); if (bt.k === 'eof') cerr('Missing }', bt); if (bt.v === '{' && bt.k === 'p') depth++; else if (bt.v === '}' && bt.k === 'p') depth--; } while (depth > 0);
      this.scope = outer; this.fn = null; sym.def = fn; return;
    }
    fn.body = this.compound(true);
    fn.endLine = this.toks[this.p - 1].line;
    this.scope = outer;
    this.fn = null;
    sym.def = fn;
    if (ty.ret.k !== 'void' && name !== 'main' && !endsWithReturn(fn.body)) this.warn("Function '" + name + "' may reach the end without returning a value", { line: fn.endLine });
    if (name === 'main' && ty.ret.k === 'void') this.warn('main should return int: use int main(void) { ... return 0; }', d.tok);
    for (var lb in fn.labels) if (!fn.labels[lb].defined) cerr("Label '" + lb + "' used in goto but never defined", fn.labels[lb].tok);
  };
  function endsWithReturn(b) {
    var last = b.body[b.body.length - 1];
    if (!last) return false;
    if (last.k === 'return') return true;
    if (last.k === 'if') return last.els && endsWithReturn({ body: [last.then] }) && endsWithReturn({ body: [last.els] });
    if (last.k === 'block') return endsWithReturn(last);
    if (last.k === 'while' && last.cond.k === 'num' && last.cond.v) return true;
    if (last.k === 'for' && !last.cond) return true;
    if (last.k === 'switch' || last.k === 'goto' || last.k === 'label') return true;
    if (last.k === 'expr' && last.e.k === 'call' && (last.e.fname === 'exit' || last.e.fname === 'abort')) return true;
    return false;
  }

  // ---- statements
  P.compound = function (isFnBody) {
    var open = this.expect('{');
    if (!isFnBody) this.scope = new Scope(this.scope, 'block');
    var body = [];
    while (!this.is('}')) {
      if (this.peek().k === 'eof') cerr("Missing '}' — the block that starts on line " + open.line + ' is never closed', this.peek());
      this.blockItem(body);
    }
    var close = this.next();
    var syms = [];
    this.scope.vars.forEach(function (s) { if (s.kind === 'var' && s.storage === 'local' && !s.param) syms.push(s); });
    if (!isFnBody) this.scope = this.scope.parent;
    return { k: 'block', body: body, line: open.line, endLine: close.line, syms: syms };
  };
  P.blockItem = function (body) {
    if (this.isTypeStart() && !(this.peek().k === 'id' && this.is(':', 1))) {
      var ds = this.declSpec();
      var ds2 = ds;
      var decls = this.declaration(ds2, false);
      Array.prototype.push.apply(body, decls);
      return;
    }
    body.push(this.statement());
  };
  P.statement = function () {
    var t = this.peek();
    if (t.k === 'p' && t.v === '{') return this.compound(false);
    if (t.k === 'p' && t.v === ';') { this.next(); return { k: 'empty', line: t.line }; }
    if (t.k === 'id') {
      switch (t.v) {
        case 'if': {
          this.next(); this.expect('(', "after 'if'");
          var c = this.expr();
          if (c.k === 'assign' && !c.paren) this.warn("Assignment '=' used as a condition. Did you mean '==' ?", t);
          this.expect(')', 'to close the if condition');
          if (this.is(';')) this.warn("Semicolon right after if(...) — the if controls an empty statement", this.peek());
          var th = this.subStatement();
          var el = null;
          if (this.isId('else')) { this.next(); el = this.subStatement(); }
          return { k: 'if', cond: this.condValue(c, t), then: th, els: el, line: t.line };
        }
        case 'while': {
          this.next(); this.expect('(', "after 'while'");
          var wc = this.expr();
          if (wc.k === 'assign' && !wc.paren) this.warn("Assignment '=' used as a condition. Did you mean '==' ?", t);
          this.expect(')', 'to close the while condition');
          if (this.is(';')) this.warn('Semicolon right after while(...) — the loop body is empty, which often causes an infinite loop', this.peek());
          return { k: 'while', cond: this.condValue(wc, t), body: this.subStatement(), line: t.line };
        }
        case 'do': {
          this.next();
          var body = this.subStatement();
          var wt = this.peek();
          if (!this.isId('while')) cerr("Expected 'while' after the do { ... } body", wt);
          this.next(); this.expect('(');
          var dc = this.expr();
          this.expect(')');
          this.expect(';', 'after do-while');
          return { k: 'do', cond: this.condValue(dc, wt), body: body, line: t.line, condLine: wt.line };
        }
        case 'for': {
          this.next(); this.expect('(', "after 'for'");
          this.scope = new Scope(this.scope, 'block');
          var init = null;
          if (this.isTypeStart()) { var ds = this.declSpec(); init = { k: 'declgroup', decls: this.declaration(ds, false), line: t.line }; }
          else if (!this.accept(';')) { init = { k: 'expr', e: this.expr(), line: t.line }; this.expect(';', 'in the for(...) header'); }
          var fc = null;
          if (!this.is(';')) fc = this.condValue(this.expr(), t);
          this.expect(';', 'in the for(...) header — for needs (init; condition; update)');
          var up = null;
          if (!this.is(')')) up = this.expr();
          this.expect(')', 'to close the for(...) header');
          if (this.is(';')) this.warn('Semicolon right after for(...) — the loop body is empty', this.peek());
          var fb = this.subStatement();
          var syms = []; this.scope.vars.forEach(function (s) { if (s.kind === 'var' && s.storage === 'local') syms.push(s); });
          this.scope = this.scope.parent;
          return { k: 'for', init: init, cond: fc, update: up, body: fb, line: t.line, syms: syms };
        }
        case 'switch': {
          this.next(); this.expect('(');
          var se = this.rval(this.expr());
          if (!isInt(se.t)) cerr('switch needs an integer or char value, not ' + typeName(se.t), t);
          this.expect(')');
          var saveSw = this.sw; this.sw = { cases: [], def: null };
          var sb = this.subStatement();
          var info = this.sw; this.sw = saveSw;
          return { k: 'switch', e: this.conv(se, promote(se.t), t), body: sb, cases: info.cases, line: t.line };
        }
        case 'case': {
          this.next();
          if (!this.sw) cerr("'case' outside of a switch", t);
          var cv = this.constExpr();
          this.expect(':', 'after case value');
          var cs = { k: 'case', v: cv, line: t.line };
          if (this.sw.cases.some(function (x) { return x.v === cv; })) cerr('Duplicate case value ' + cv, t);
          this.sw.cases.push(cs);
          return cs;
        }
        case 'default': {
          this.next(); this.expect(':', "after 'default'");
          if (!this.sw) cerr("'default' outside of a switch", t);
          var dc2 = { k: 'case', def: true, line: t.line };
          this.sw.cases.push(dc2);
          return dc2;
        }
        case 'break': this.next(); this.expect(';', "after 'break'"); return { k: 'break', line: t.line };
        case 'continue': this.next(); this.expect(';', "after 'continue'"); return { k: 'continue', line: t.line };
        case 'return': {
          this.next();
          var rt = this.fn.sym.type.ret, re = null;
          if (!this.is(';')) {
            var ex = this.expr();
            if (rt.k === 'void') { if (this.rval(ex).t.k !== 'void') this.warn("Returning a value from a void function '" + this.fn.name + "'", t); re = this.rval(ex); }
            else re = this.conv(ex, rt, t, 'in return');
          } else if (rt.k !== 'void' && this.fn.name !== 'main') this.warn("return with no value in function '" + this.fn.name + "' that returns " + typeName(rt), t);
          this.expect(';', 'after return');
          return { k: 'return', e: re, line: t.line, voidRet: rt.k === 'void' };
        }
        case 'goto': {
          this.next(); var lt = this.next();
          if (lt.k !== 'id') cerr('Expected a label name after goto', lt);
          this.expect(';', 'after goto');
          if (!this.fn.labels[lt.v]) this.fn.labels[lt.v] = { tok: lt };
          return { k: 'goto', label: lt.v, line: t.line };
        }
      }
      if (this.is(':', 1) && !KEYWORDS[t.v]) {
        this.next(); this.next();
        var L = this.fn.labels[t.v] || (this.fn.labels[t.v] = { tok: t });
        if (L.defined) cerr("Label '" + t.v + "' defined twice", t);
        L.defined = true;
        return { k: 'label', name: t.v, line: t.line };
      }
      if (t.v === 'else') cerr("'else' without a matching 'if' (check for a stray ';' after the if)", t);
    }
    var e = this.expr();
    this.expect(';', null);
    if ((e.k === 'cmp' || (e.k === 'bin' && !e.hasCall)) && !e.paren) this.warn('This statement computes a value but does nothing with it' + (e.k === 'cmp' && e.op === '==' ? " (did you mean '=' ?)" : ''), t);
    return { k: 'expr', e: e, line: t.line };
  };
  P.subStatement = function () {
    // a sub-statement that is a declaration is not allowed in C, but give a clear message
    if (this.isTypeStart() && !this.is(':', 1)) cerr('A declaration cannot be the body of if/while/for directly — wrap it in { }', this.peek());
    return this.statement();
  };

  CI.Parser = Parser;
  CI.sameType = sameType;
  CI.promote = promote;
  CI.arithConv = arithConv;
});
