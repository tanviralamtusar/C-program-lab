/* Mini-C standard library: stdio (with a virtual file system), string.h, ctype.h, math.h, stdlib.h, time.h */
var CI_MODULES = (typeof CI_MODULES !== 'undefined') ? CI_MODULES : [];
CI_MODULES.push(function (CI) {
  'use strict';
  var T = CI.T, MEM = CI.MEM, cvt = CI.cvt, typeName = CI.types.typeName, ptr = CI.types.ptr;
  var V = CI.VM.prototype;
  var EOF = -1;
  var STDIN = MEM.FILES, STDOUT = MEM.FILES + 0x10, STDERR = MEM.FILES + 0x20;

  function isWS(c) { return c === 32 || (c >= 9 && c <= 13); }

  // ---------------------------------------------------------------- number formatting (printf)
  function pad(s, width, left, zero) {
    if (s.length >= width) return s;
    if (left) return s + ' '.repeat(width - s.length);
    if (zero) {
      var m = s.match(/^([+\- ]?(0[xX])?)/), pre = m ? m[0] : '';
      return pre + '0'.repeat(width - s.length) + s.slice(pre.length);
    }
    return ' '.repeat(width - s.length) + s;
  }
  function fixed(v, prec) {
    var neg = v < 0 || Object.is(v, -0); v = Math.abs(v);
    var s;
    if (v >= 1e21) {
      s = BigInt(Math.round(v)).toString(); if (prec > 0) s += '.' + '0'.repeat(prec);
    } else {
      s = v.toFixed(Math.min(prec, 100));
      // C rounds exact ties to even; JS rounds them up
      if (prec <= 70) {
        var ext = v.toFixed(prec + 25), dot = ext.indexOf('.');
        var tail = ext.slice(dot + 1 + prec);
        if (/^50*$/.test(tail)) {
          var keep = ext.slice(0, dot + 1 + prec); if (prec === 0) keep = ext.slice(0, dot);
          var last = keep.replace('.', '').slice(-1);
          if (+last % 2 === 0) s = keep;
        }
      }
      if (prec > 100) s += '0'.repeat(prec - 100);
    }
    return (neg ? '-' : '') + s;
  }
  function expo(v, prec, upper) {
    var neg = v < 0 || Object.is(v, -0); v = Math.abs(v);
    var s = v.toExponential(Math.min(prec, 100));
    var m = s.match(/^([\d.]+)e([+-])(\d+)$/);
    var e = m[3].length < 2 ? '0' + m[3] : m[3];
    s = m[1] + 'e' + m[2] + e;
    if (upper) s = s.toUpperCase();
    return (neg ? '-' : '') + s;
  }
  function general(v, prec, alt, upper) {
    var P = prec === 0 ? 1 : prec;
    var X;
    if (v === 0) X = 0;
    else { var es = Math.abs(v).toExponential(P - 1); X = parseInt(es.split('e')[1], 10); }
    var s;
    if (P > X && X >= -4) s = fixed(v, P - 1 - X);
    else s = expo(v, P - 1, upper);
    if (!alt) {
      if (s.indexOf('e') >= 0 || s.indexOf('E') >= 0) s = s.replace(/\.?0+([eE])/, '$1');
      else if (s.indexOf('.') >= 0) s = s.replace(/\.?0+$/, '');
    }
    return s;
  }
  function special(v, upper) { var s = isNaN(v) ? 'nan' : (v < 0 ? '-inf' : 'inf'); return upper ? s.toUpperCase() : s; }

  // args: array of {v, t}
  V.format = function (fmt, args, fname) {
    var out = '', ai = 0, i = 0, self = this;
    function next(kind, spec) {
      if (ai >= args.length) { self.warn(fname + ': the format "%' + spec + '" has no matching argument (' + (ai + 1 + (fname === 'printf' ? 1 : 2)) + ') — it prints garbage'); ai++; return { v: kind === 'f' ? 0 : 0, t: kind === 'f' ? T.double : T.int, missing: true }; }
      return args[ai++];
    }
    function typeWarn(a, want, spec) {
      if (a.missing) return;
      var t = a.t, ok;
      if (want === 'int') ok = t.k === 'int';
      else if (want === 'double') ok = t.k === 'flt';
      else if (want === 'str') ok = t.k === 'ptr' && t.to.k === 'int' && t.to.size === 1;
      else if (want === 'ptr') ok = t.k === 'ptr';
      else ok = true;
      if (!ok) {
        var hint = '';
        if (want === 'int' && t.k === 'flt') hint = ' — use %f (or %lf) for float/double';
        if (want === 'double' && t.k === 'int') hint = ' — use %d for int (or cast: (double)x)';
        if (want === 'str' && t.k === 'int') hint = ' — %s needs a string (char array); use %c for a single char';
        self.warn(fname + ': %' + spec + ' expects ' + (want === 'str' ? 'a string (char*)' : want === 'ptr' ? 'a pointer' : want === 'int' ? 'an integer' : 'a double') + ' but the argument is ' + typeName(t) + hint + '. On a real compiler this prints garbage.');
      }
    }
    while (i < fmt.length) {
      var c = fmt[i];
      if (c !== '%') { out += c; i++; continue; }
      var st = i; i++;
      if (fmt[i] === '%') { out += '%'; i++; continue; }
      var left = false, plus = false, space = false, alt = false, zero = false;
      while ('-+ #0'.indexOf(fmt[i]) >= 0 && i < fmt.length) {
        var f = fmt[i++];
        if (f === '-') left = true; else if (f === '+') plus = true; else if (f === ' ') space = true; else if (f === '#') alt = true; else zero = true;
      }
      var width = 0, prec = -1;
      if (fmt[i] === '*') { i++; var wa = next('i', '*'); width = Number(wa.v); if (width < 0) { left = true; width = -width; } }
      else while (fmt[i] >= '0' && fmt[i] <= '9') width = width * 10 + (+fmt[i++]);
      if (fmt[i] === '.') {
        i++; prec = 0;
        if (fmt[i] === '*') { i++; prec = Number(next('i', '*').v); if (prec < 0) prec = -1; }
        else while (fmt[i] >= '0' && fmt[i] <= '9') prec = prec * 10 + (+fmt[i++]);
      }
      var len = '';
      while ('hlLqjzt'.indexOf(fmt[i]) >= 0 && i < fmt.length) len += fmt[i++];
      var conv = fmt[i++];
      var spec = fmt.slice(st + 1, i);
      if (conv === undefined) { out += fmt.slice(st); break; }
      var s, a, v;
      switch (conv) {
        case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': {
          a = next('i', spec); typeWarn(a, 'int', spec);
          v = a.v;
          if (a.t.k === 'flt') v = Math.trunc(v);
          if (a.t.k === 'ptr') v = BigInt(v);
          var bits = (len === 'l' || len === 'll' || len === 'z' || len === 'j' || len === 'q' || len === 't' || len === 'L') ? 64 : len === 'h' ? 16 : len === 'hh' ? 8 : 32;
          var big = typeof v === 'bigint' ? v : BigInt(Math.trunc(v));
          var signed = conv === 'd' || conv === 'i';
          big = signed ? BigInt.asIntN(bits, big) : BigInt.asUintN(bits, big);
          var neg = big < 0n; if (neg) big = -big;
          var base = conv === 'o' ? 8 : (conv === 'x' || conv === 'X') ? 16 : 10;
          var digits = big.toString(base);
          if (conv === 'X') digits = digits.toUpperCase();
          if (prec >= 0) { if (prec === 0 && big === 0n) digits = ''; while (digits.length < prec) digits = '0' + digits; }
          var pre = '';
          if (signed) pre = neg ? '-' : plus ? '+' : space ? ' ' : '';
          if (alt && conv === 'o' && digits[0] !== '0') digits = '0' + digits;
          if (alt && (conv === 'x' || conv === 'X') && big !== 0n) pre = conv === 'x' ? '0x' : '0X';
          s = pad(pre + digits, width, left, zero && prec < 0);
          break;
        }
        case 'c': {
          a = next('i', spec);
          if (a.t.k !== 'int') typeWarn(a, 'int', spec);
          var code = Number(typeof a.v === 'bigint' ? BigInt.asUintN(8, a.v) : a.v) & 255;
          s = pad(String.fromCharCode(code), width, left, false);
          break;
        }
        case 's': {
          a = next('s', spec); typeWarn(a, 'str', spec);
          if (a.t.k !== 'ptr') { s = pad('', width, left, false); break; }
          var str = a.v === 0 ? '(null)' : this.readStr(a.v, prec >= 0 ? prec : null);
          if (prec >= 0) str = str.slice(0, prec);
          s = pad(str, width, left, false);
          break;
        }
        case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': case 'a': case 'A': {
          a = next('f', spec); typeWarn(a, 'double', spec);
          v = a.t.k === 'flt' ? a.v : (a.t.k === 'int' ? 0 : 0);
          if (a.t.k === 'int' && !a.missing) v = Number(a.v);
          var p = prec < 0 ? 6 : prec;
          if (!isFinite(v)) s = special(v, conv === 'F' || conv === 'E' || conv === 'G' || conv === 'A');
          else if (conv === 'f' || conv === 'F') s = fixed(v, p);
          else if (conv === 'e' || conv === 'E' || conv === 'a' || conv === 'A') s = expo(v, p, conv === 'E' || conv === 'A');
          else s = general(v, p, alt, conv === 'G');
          if (alt && p === 0 && s.indexOf('.') < 0 && isFinite(v) && (conv === 'f' || conv === 'F')) s += '.';
          if (s[0] !== '-' && isFinite(v)) { if (plus) s = '+' + s; else if (space) s = ' ' + s; }
          s = pad(s, width, left, zero && isFinite(v));
          break;
        }
        case 'p': {
          a = next('p', spec); typeWarn(a, 'ptr', spec);
          var pv = Number(a.v);
          s = pad(pv === 0 ? '(nil)' : '0x' + pv.toString(16), width, left, false);
          break;
        }
        case 'n': {
          a = next('n', spec);
          if (a.t.k === 'ptr') this.store(a.v, T.int, out.length);
          s = '';
          break;
        }
        default:
          this.warn(fname + ': unknown conversion %' + spec);
          s = '%' + spec;
      }
      out += s;
    }
    if (ai < args.length) this.warn(fname + ': more arguments than % conversions in the format string — extra values are ignored');
    return out;
  };

  // ---------------------------------------------------------------- scanf family
  // src: { peek(): code|-1, get(): code|-1, pos }
  V.scan = function (src, fmt, args, fname) {
    var count = 0, ai = 0, i = 0, self = this, anyConv = false, consumed = 0;
    function get() { var c = src.get(); if (c !== EOF) consumed++; return c; }
    function skipWS() { while (true) { var c = src.peek(); if (c === EOF || !isWS(c)) return c; get(); } }
    function nextArg(spec) {
      if (ai >= args.length) self.err(fname + ': the format "%' + spec + '" has no matching variable — add one, e.g. ' + fname + '("%' + spec + '", &x);');
      var a = args[ai++];
      if (a.t.k !== 'ptr') {
        self.err(fname + ': argument ' + (ai + (fname === 'scanf' ? 1 : 2)) + ' for %' + spec + ' must be an address. Did you forget the & ? Write &' + (a.name || 'x') + ' instead of ' + (a.name || 'x') + '.');
      }
      if (a.v === 0) self.err(fname + ': NULL pointer passed for %' + spec);
      return a;
    }
    function want(a, t, spec) {
      var pt = a.t.to;
      if (!pt || pt.k === 'void') return;
      var ok = pt.k === t.k && (pt.size === t.size);
      if (!ok) {
        var hint = '';
        if (t === T.float && pt === T.double) hint = ' — use %lf to read a double';
        else if (t === T.int && pt.k === 'flt') hint = ' — use %f for float, %lf for double';
        else if (t.k === 'flt' && pt.k === 'int') hint = ' — use %d to read an int';
        else if (t === T.int && pt.k === 'int' && pt.size === 1) hint = ' — use %c to read a char';
        else if (t === T.int && pt.size === 8) hint = ' — use %ld / %lld for long / long long';
        self.warn(fname + ': %' + spec + ' writes a ' + typeName(t) + ' but the variable is ' + typeName(pt) + hint + '. The stored value will be wrong.');
      }
    }
    while (i < fmt.length) {
      var fc = fmt.charCodeAt(i);
      if (isWS(fc)) { skipWS(); i++; continue; }
      if (fmt[i] !== '%') {
        var c0 = src.peek();
        if (c0 === EOF) return count === 0 && !anyConv ? EOF : count;
        if (c0 !== fc) return count;
        get(); i++; continue;
      }
      var st = i; i++;
      if (fmt[i] === '%') { skipWS(); if (src.peek() !== 37) return count; get(); i++; continue; }
      var suppress = false; if (fmt[i] === '*') { suppress = true; i++; }
      var width = 0; while (fmt[i] >= '0' && fmt[i] <= '9') width = width * 10 + (+fmt[i++]);
      var len = ''; while ('hlLqjzt'.indexOf(fmt[i]) >= 0 && i < fmt.length) len += fmt[i++];
      var conv = fmt[i++];
      var spec = fmt.slice(st + 1, i);
      var set = null;
      if (conv === '[') {
        var neg = false, chars = '';
        if (fmt[i] === '^') { neg = true; i++; }
        if (fmt[i] === ']') { chars += ']'; i++; }
        while (i < fmt.length && fmt[i] !== ']') {
          if (fmt[i + 1] === '-' && fmt[i + 2] && fmt[i + 2] !== ']') { for (var cc = fmt.charCodeAt(i); cc <= fmt.charCodeAt(i + 2); cc++) chars += String.fromCharCode(cc); i += 3; }
          else chars += fmt[i++];
        }
        i++;
        set = { neg: neg, chars: chars };
        spec = fmt.slice(st + 1, i);
      }
      if (conv !== 'c' && conv !== '[' && conv !== 'n') {
        var pk = skipWS();
        if (pk === EOF) return count === 0 && !anyConv ? EOF : count;
      }
      var lim = width || Infinity, s = '', a;
      switch (conv) {
        case 'd': case 'i': case 'u': case 'x': case 'X': case 'o': {
          var base = conv === 'x' || conv === 'X' ? 16 : conv === 'o' ? 8 : 10;
          var c = src.peek();
          if ((c === 43 || c === 45) && s.length < lim) { s += String.fromCharCode(get()); }
          if (conv === 'i' && src.peek() === 48) {
            s += String.fromCharCode(get());
            var c2 = src.peek();
            if (c2 === 120 || c2 === 88) { s += String.fromCharCode(get()); base = 16; } else base = 8;
          }
          var digits = '';
          while (s.length + digits.length < lim) {
            var d = src.peek(); if (d === EOF) break;
            var ch = String.fromCharCode(d).toLowerCase();
            var dv = parseInt(ch, 36);
            if (isNaN(dv) || dv >= base) break;
            digits += ch; get();
          }
          if (!digits && !/0$/.test(s)) return count;
          anyConv = true;
          if (suppress) break;
          a = nextArg(spec);
          var sign = s[0] === '-' ? -1n : 1n;
          var big = digits ? BigInt((base === 16 ? '0x' : base === 8 ? '0o' : '') + digits) * sign : 0n;
          var tt = len === 'hh' ? (conv === 'd' || conv === 'i' ? T.schar : T.uchar) : len === 'h' ? (conv === 'd' || conv === 'i' ? T.short : T.ushort)
            : (len === 'l' || len === 'z' || len === 'j') ? (conv === 'd' || conv === 'i' ? T.long : T.ulong) : (len === 'll' || len === 'L' || len === 'q') ? (conv === 'd' || conv === 'i' ? T.llong : T.ullong)
            : (conv === 'd' || conv === 'i' ? T.int : T.uint);
          want(a, tt, spec);
          this.store(a.v, tt, cvt(big, T.llong, tt));
          count++;
          break;
        }
        case 'f': case 'e': case 'g': case 'E': case 'G': case 'a': case 'F': {
          var re = '';
          while (re.length < lim) {
            var p = src.peek(); if (p === EOF) break;
            var pc = String.fromCharCode(p), cand = re + pc;
            if (/^[+-]?(\d*\.?\d*([eE][+-]?\d*)?|i|in|inf|infi|infin|infini|infinit|infinity|n|na|nan)$/i.test(cand)) { re = cand; get(); }
            else break;
          }
          var num = parseFloat(re);
          if (/^[+-]?inf/i.test(re)) num = re[0] === '-' ? -Infinity : Infinity;
          else if (/^[+-]?nan/i.test(re)) num = NaN;
          if (!re || (isNaN(num) && !/nan/i.test(re))) return count;
          anyConv = true;
          if (suppress) break;
          a = nextArg(spec);
          var ft = len === 'l' ? T.double : len === 'L' ? T.ldouble : T.float;
          want(a, ft, spec);
          this.store(a.v, ft.size === 4 ? T.float : T.double, ft.size === 4 ? Math.fround(num) : num);
          count++;
          break;
        }
        case 'c': {
          var n = width || 1;
          if (src.peek() === EOF) return count === 0 && !anyConv ? EOF : count;
          var got = [];
          while (got.length < n && src.peek() !== EOF) got.push(get());
          anyConv = true;
          if (suppress) break;
          a = nextArg(spec);
          want(a, T.char, spec);
          this.chk(a.v, got.length, true);
          for (var k = 0; k < got.length; k++) { this.u8[a.v + k] = got[k]; }
          this.init.fill(1, a.v, a.v + got.length);
          count++;
          break;
        }
        case 's': case '[': {
          var str = '';
          while (str.length < lim) {
            var q = src.peek(); if (q === EOF) break;
            if (conv === 's') { if (isWS(q)) break; }
            else { var inSet = set.chars.indexOf(String.fromCharCode(q)) >= 0; if (inSet === set.neg) break; }
            str += String.fromCharCode(get());
          }
          if (!str) return count === 0 && !anyConv && src.peek() === EOF ? EOF : count;
          anyConv = true;
          if (suppress) break;
          a = nextArg(spec);
          if (a.t.to && !(a.t.to.k === 'int' && a.t.to.size === 1)) this.warn(fname + ': %' + spec + ' needs a char array, but the variable is ' + typeName(a.t.to));
          this.writeStr(a.v, str, true);
          count++;
          break;
        }
        case 'n': {
          if (suppress) break;
          a = nextArg(spec);
          this.store(a.v, T.int, consumed);
          break;
        }
        default:
          this.err(fname + ': unsupported conversion %' + spec);
      }
    }
    return count;
  };

  // ---------------------------------------------------------------- streams
  V.stdinSrc = function () {
    var self = this;
    return {
      peek: function () { if (self.inPos < self.stdin.length) return self.stdin.charCodeAt(self.inPos) & 255; if (self.interactive) throw { needInput: true }; self.stdinEof = true; return EOF; },
      get: function () { if (self.inPos < self.stdin.length) return self.stdin.charCodeAt(self.inPos++) & 255; if (self.interactive) throw { needInput: true }; self.stdinEof = true; return EOF; }
    };
  };
  V.handle = function (fp, fname, needRead, needWrite) {
    if (fp === 0) this.err(fname + ': the FILE pointer is NULL — fopen failed (the file does not exist?). Always check: if (fp == NULL) { ... }');
    if (fp === STDIN || fp === STDOUT || fp === STDERR) return { std: fp };
    var h = this.handles[fp];
    if (!h) this.err(fname + ': not a valid FILE pointer');
    if (h.closed) this.err(fname + ': this file was already closed with fclose()');
    if (needRead && !h.read) this.err(fname + ': file "' + h.name + '" was opened with mode "' + h.mode + '" which does not allow reading');
    if (needWrite && !h.write) this.err(fname + ': file "' + h.name + '" was opened with mode "' + h.mode + '" which does not allow writing');
    return h;
  };
  V.fileSrc = function (h) {
    var self = this;
    if (h.std === STDIN) return this.stdinSrc();
    if (h.std) this.err('Cannot read from stdout/stderr');
    return {
      peek: function () { var d = self.fs[h.name] || ''; if (h.pos < d.length) return d.charCodeAt(h.pos) & 255; h.eof = true; return EOF; },
      get: function () { var d = self.fs[h.name] || ''; if (h.pos < d.length) return d.charCodeAt(h.pos++) & 255; h.eof = true; return EOF; }
    };
  };
  V.fwriteStr = function (h, s) {
    if (h.std) { this.write(s); return; }
    var d = this.fs[h.name] || '';
    if (h.append) h.pos = d.length;
    if (h.pos > d.length) d += '\0'.repeat(h.pos - d.length);
    this.fs[h.name] = d.slice(0, h.pos) + s + d.slice(h.pos + s.length);
    h.pos += s.length;
  };
  V.memSrc = function (a) {
    var self = this, pos = a;
    return {
      peek: function () { self.chk(pos, 1, false); var c = self.u8[pos]; return c === 0 ? EOF : c; },
      get: function () { self.chk(pos, 1, false); var c = self.u8[pos]; if (c === 0) return EOF; pos++; return c; }
    };
  };

  // ---------------------------------------------------------------- heap
  V.malloc = function (size, hint, by) {
    if (size < 0 || size > 0x1000000) return 0;
    var a = Math.ceil(this.heapTop / 16) * 16;
    if (a + size > MEM.STACK_LO) return 0;
    this.heapTop = a + Math.max(size, 1);
    var b = { addr: a, size: size, freed: false, hint: hint || null, by: by };
    this.blocks.push(b);
    this.init.fill(0, a, a + size);
    return a;
  };
  V.free = function (p) {
    if (p === 0) return;
    var b = this.findBlock(p);
    if (!b || p < MEM.HEAP || p >= MEM.STACK_LO) this.err('free(): this pointer was not returned by malloc/calloc/realloc');
    if (b.addr !== p) this.err('free(): pointer points into the middle of a block — pass the exact pointer malloc returned');
    if (b.freed) this.err('free(): double free — this memory was already freed');
    b.freed = true;
  };

  // ---------------------------------------------------------------- builtins
  var MATH1 = { sqrt: Math.sqrt, fabs: Math.abs, ceil: Math.ceil, floor: Math.floor, trunc: Math.trunc, sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan, exp: Math.exp, log: Math.log, log10: Math.log10, log2: Math.log2, cbrt: Math.cbrt,
    round: function (x) { return x < 0 ? -Math.round(-x) : Math.round(x); },
    sqrtf: Math.sqrt, fabsf: Math.abs, floorf: Math.floor, ceilf: Math.ceil, roundf: function (x) { return x < 0 ? -Math.round(-x) : Math.round(x); } };
  var CTYPE = {
    isalpha: function (c) { return (c >= 65 && c <= 90) || (c >= 97 && c <= 122); },
    isdigit: function (c) { return c >= 48 && c <= 57; },
    isalnum: function (c) { return CTYPE.isalpha(c) || CTYPE.isdigit(c); },
    isspace: function (c) { return isWS(c); },
    isupper: function (c) { return c >= 65 && c <= 90; },
    islower: function (c) { return c >= 97 && c <= 122; },
    ispunct: function (c) { return c > 32 && c < 127 && !CTYPE.isalnum(c); },
    isxdigit: function (c) { return CTYPE.isdigit(c) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102); },
    isprint: function (c) { return c >= 32 && c < 127; },
    isgraph: function (c) { return c > 32 && c < 127; },
    iscntrl: function (c) { return (c >= 0 && c < 32) || c === 127; }
  };
  function argTypes(e) { return e.args.map(function (x) { return x.t; }); }
  function argName(x) {
    while (x && (x.k === 'cast' || x.k === 'decay')) x = x.e;
    return x && x.k === 'var' ? x.sym.name : null;
  }

  V.builtin = function (name, a, e) {
    var self = this, s, h, i, n, p;
    function vargs(from) {
      var r = [];
      for (var k = from; k < a.length; k++) r.push({ v: a[k], t: e.args[k].t, name: argName(e.args[k]) });
      return r;
    }
    switch (name) {
      // ---- stdio
      case 'printf': s = this.format(this.readStr(a[0]), vargs(1), 'printf'); this.write(s); return s.length;
      case 'fprintf': h = this.handle(a[0], 'fprintf', false, true); s = this.format(this.readStr(a[1]), vargs(2), 'fprintf'); this.fwriteStr(h, s); return s.length;
      case 'sprintf': s = this.format(this.readStr(a[1]), vargs(2), 'sprintf'); this.writeStr(a[0], s, true); return s.length;
      case 'snprintf': s = this.format(this.readStr(a[2]), vargs(3), 'snprintf'); n = Number(a[1]); if (n > 0) this.writeStr(a[0], s.slice(0, n - 1), true); return s.length;
      case 'scanf': return this.scan(this.stdinSrc(), this.readStr(a[0]), vargs(1), 'scanf');
      case 'fscanf': h = this.handle(a[0], 'fscanf', true, false); return this.scan(this.fileSrc(h), this.readStr(a[1]), vargs(2), 'fscanf');
      case 'sscanf': return this.scan(this.memSrc(a[0]), this.readStr(a[1]), vargs(2), 'sscanf');
      case 'getchar': return this.stdinSrc().get();
      case 'putchar': this.write(String.fromCharCode(a[0] & 255)); return a[0] & 255;
      case 'puts': this.write(this.readStr(a[0]) + '\n'); return 1;
      case 'gets': {
        var src = this.stdinSrc(); if (src.peek() === EOF) return 0;
        s = ''; var c; while ((c = src.get()) !== EOF && c !== 10) s += String.fromCharCode(c);
        if (s.endsWith('\r')) s = s.slice(0, -1);
        this.writeStr(a[0], s, true); return a[0];
      }
      case 'fgets': {
        h = this.handle(a[2], 'fgets', true, false); n = a[1];
        var fs = this.fileSrc(h);
        if (n <= 1) return n === 1 ? (this.writeStr(a[0], '', true), a[0]) : 0;
        if (fs.peek() === EOF) { fs.get(); return 0; }
        s = '';
        while (s.length < n - 1) { var ch = fs.get(); if (ch === EOF) break; s += String.fromCharCode(ch); if (ch === 10) break; }
        this.writeStr(a[0], s, true); return a[0];
      }
      case 'fputs': h = this.handle(a[1], 'fputs', false, true); this.fwriteStr(h, this.readStr(a[0])); return 1;
      case 'fgetc': case 'getc': h = this.handle(a[0], name, true, false); return this.fileSrc(h).get();
      case 'fputc': case 'putc': h = this.handle(a[1], name, false, true); this.fwriteStr(h, String.fromCharCode(a[0] & 255)); return a[0] & 255;
      case 'ungetc':
        if (a[0] === EOF) return EOF;
        h = this.handle(a[1], 'ungetc', true, false);
        if (h.std === STDIN) { if (this.inPos > 0) this.inPos--; } else if (h.pos > 0) { h.pos--; h.eof = false; }
        return a[0];
      case 'fopen': {
        var fname = this.readStr(a[0]), mode = this.readStr(a[1]);
        var m = mode.replace(/b/g, ''), exists = Object.prototype.hasOwnProperty.call(this.fs, fname);
        if (!/^[rwa]\+?$/.test(m)) this.err('fopen: invalid mode "' + mode + '" (use "r", "w", "a", "r+", "w+" or "a+")');
        if (m[0] === 'r' && !exists) return 0;
        if (m[0] === 'w') this.fs[fname] = '';
        if (m[0] === 'a' && !exists) this.fs[fname] = '';
        var addr = this.nextHandle; this.nextHandle += 16;
        if (this.nextHandle >= MEM.STATIC) this.err('Too many files opened');
        this.handles[addr] = { name: fname, mode: mode, pos: m[0] === 'a' ? this.fs[fname].length : 0, read: m[0] === 'r' || m.length > 1, write: m[0] !== 'r' || m.length > 1, append: m[0] === 'a', eof: false, closed: false };
        return addr;
      }
      case 'fclose': h = this.handle(a[0], 'fclose'); if (!h.std) h.closed = true; return 0;
      case 'feof': h = this.handle(a[0], 'feof'); return h.std === STDIN ? (this.stdinEof ? 1 : 0) : h.eof ? 1 : 0;
      case 'ferror': this.handle(a[0], 'ferror'); return 0;
      case 'fflush': if (a[0]) this.handle(a[0], 'fflush'); return 0;
      case 'rewind': h = this.handle(a[0], 'rewind'); if (!h.std) { h.pos = 0; h.eof = false; } return;
      case 'fseek': {
        h = this.handle(a[0], 'fseek'); if (h.std) return -1;
        var off = Number(a[1]), wh = a[2], dlen = (this.fs[h.name] || '').length;
        var np = wh === 0 ? off : wh === 1 ? h.pos + off : dlen + off;
        if (np < 0) return -1; h.pos = np; h.eof = false; return 0;
      }
      case 'ftell': h = this.handle(a[0], 'ftell'); return BigInt(h.std ? -1 : h.pos);
      case 'fread': {
        h = this.handle(a[3], 'fread', true, false);
        var sz = Number(a[1]), cnt = Number(a[2]), total = sz * cnt, src2 = this.fileSrc(h), got = 0;
        if (total > 0) this.chk(a[0], total, true);
        for (i = 0; i < total; i++) { var b = src2.get(); if (b === EOF) break; this.u8[a[0] + i] = b; this.init[a[0] + i] = 1; got++; }
        return BigInt(sz ? Math.floor(got / sz) : 0);
      }
      case 'fwrite': {
        h = this.handle(a[3], 'fwrite', false, true);
        var tot = Number(a[1]) * Number(a[2]);
        if (tot > 0) this.chk(a[0], tot, false);
        var str = ''; for (i = 0; i < tot; i++) str += String.fromCharCode(this.u8[a[0] + i]);
        this.fwriteStr(h, str); return a[2];
      }
      case 'remove': s = this.readStr(a[0]); if (!(s in this.fs)) return -1; delete this.fs[s]; return 0;
      case 'rename': { var o = this.readStr(a[0]), nn = this.readStr(a[1]); if (!(o in this.fs)) return -1; this.fs[nn] = this.fs[o]; delete this.fs[o]; return 0; }
      case 'perror': this.write((a[0] ? this.readStr(a[0]) + ': ' : '') + 'error\n'); return;
      case 'setbuf': return;

      // ---- string.h
      case 'strlen': return BigInt(this.readStr(a[0]).length);
      case 'strcpy': this.writeStr(a[0], this.readStr(a[1]), true); return a[0];
      case 'strncpy': {
        s = this.readStr(a[1]); n = Number(a[2]);
        var w = s.slice(0, n); while (w.length < n) w += '\0';
        this.writeStr(a[0], w, false); return a[0];
      }
      case 'strcat': s = this.readStr(a[0]); this.writeStr(a[0] + s.length, this.readStr(a[1]), true); return a[0];
      case 'strncat': s = this.readStr(a[0]); this.writeStr(a[0] + s.length, this.readStr(a[1]).slice(0, Number(a[2])), true); return a[0];
      case 'strcmp': case 'strncmp': case 'strcasecmp': case 'stricmp': {
        var x = this.readStr(a[0]), y = this.readStr(a[1]);
        if (name === 'strncmp') { n = Number(a[2]); x = x.slice(0, n); y = y.slice(0, n); }
        if (name === 'strcasecmp' || name === 'stricmp') { x = x.toLowerCase(); y = y.toLowerCase(); }
        for (i = 0; i < Math.min(x.length, y.length); i++) if (x.charCodeAt(i) !== y.charCodeAt(i)) return x.charCodeAt(i) < y.charCodeAt(i) ? -1 : 1;
        return x.length === y.length ? 0 : x.length < y.length ? -1 : 1;
      }
      case 'strchr': case 'strrchr': {
        s = this.readStr(a[0]); var cc = a[1] & 255;
        if (cc === 0) return a[0] + s.length;
        var ix = name === 'strchr' ? s.indexOf(String.fromCharCode(cc)) : s.lastIndexOf(String.fromCharCode(cc));
        return ix < 0 ? 0 : a[0] + ix;
      }
      case 'strstr': { s = this.readStr(a[0]); var ix2 = s.indexOf(this.readStr(a[1])); return ix2 < 0 ? 0 : a[0] + ix2; }
      case 'strspn': case 'strcspn': {
        s = this.readStr(a[0]); var set = this.readStr(a[1]); i = 0;
        while (i < s.length && (set.indexOf(s[i]) >= 0) === (name === 'strspn')) i++;
        return BigInt(i);
      }
      case 'strrev': s = this.readStr(a[0]); this.writeStr(a[0], s.split('').reverse().join(''), true); return a[0];
      case 'strupr': s = this.readStr(a[0]); this.writeStr(a[0], s.replace(/[a-z]/g, function (c) { return c.toUpperCase(); }), true); return a[0];
      case 'strlwr': s = this.readStr(a[0]); this.writeStr(a[0], s.replace(/[A-Z]/g, function (c) { return c.toLowerCase(); }), true); return a[0];
      case 'strdup': s = this.readStr(a[0]); p = this.malloc(s.length + 1, T.char, 'strdup'); this.writeStr(p, s, true); return p;
      case 'strtok': {
        var start = a[0] || this.strtokPtr;
        if (!start) return 0;
        var delim = this.readStr(a[1]);
        s = this.readStr(start); i = 0;
        while (i < s.length && delim.indexOf(s[i]) >= 0) i++;
        if (i >= s.length) { this.strtokPtr = 0; return 0; }
        var j = i; while (j < s.length && delim.indexOf(s[j]) < 0) j++;
        if (j < s.length) { this.u8[start + j] = 0; this.strtokPtr = start + j + 1; } else this.strtokPtr = 0;
        return start + i;
      }
      case 'memset': n = Number(a[2]); if (n) { this.chk(a[0], n, true); this.u8.fill(a[1] & 255, a[0], a[0] + n); this.init.fill(1, a[0], a[0] + n); } return a[0];
      case 'memcpy': case 'memmove': n = Number(a[2]); if (n) { this.chk(a[1], n, false); this.chk(a[0], n, true); this.u8.copyWithin(a[0], a[1], a[1] + n); this.init.copyWithin(a[0], a[1], a[1] + n); } return a[0];
      case 'memcmp': {
        n = Number(a[2]); if (n) { this.chk(a[0], n, false); this.chk(a[1], n, false); }
        for (i = 0; i < n; i++) { var d1 = this.u8[a[0] + i], d2 = this.u8[a[1] + i]; if (d1 !== d2) return d1 < d2 ? -1 : 1; }
        return 0;
      }

      // ---- ctype
      case 'toupper': return a[0] >= 97 && a[0] <= 122 ? a[0] - 32 : a[0];
      case 'tolower': return a[0] >= 65 && a[0] <= 90 ? a[0] + 32 : a[0];

      // ---- math
      case 'pow': case 'powf': {
        if (a[0] === 0 && a[1] < 0) return Infinity;
        var r = Math.pow(a[0], a[1]);
        return name === 'powf' ? Math.fround(r) : r;
      }
      case 'atan2': return Math.atan2(a[0], a[1]);
      case 'fmod': return a[1] === 0 ? NaN : a[0] % a[1];
      case 'hypot': return Math.hypot(a[0], a[1]);

      // ---- stdlib
      case 'malloc': return this.malloc(Number(a[0]), e.hint, 'malloc');
      case 'calloc': {
        n = Number(a[0]) * Number(a[1]);
        p = this.malloc(n, e.hint, 'calloc');
        if (p) { this.u8.fill(0, p, p + n); this.init.fill(1, p, p + n); }
        return p;
      }
      case 'realloc': {
        var old = a[0], ns = Number(a[1]);
        if (old === 0) return this.malloc(ns, e.hint, 'realloc');
        var ob = this.findBlock(old);
        if (!ob || ob.addr !== old) this.err('realloc(): pointer was not returned by malloc/calloc/realloc');
        if (ob.freed) this.err('realloc(): this memory was already freed');
        if (ns === 0) { this.free(old); return 0; }
        p = this.malloc(ns, e.hint || ob.hint, 'realloc');
        if (!p) return 0;
        var cn = Math.min(ns, ob.size);
        this.u8.copyWithin(p, old, old + cn); this.init.copyWithin(p, old, old + cn);
        ob.freed = true;
        return p;
      }
      case 'free': this.free(a[0]); return;
      case 'abs': return a[0] === -2147483648 ? a[0] : Math.abs(a[0]);
      case 'labs': case 'llabs': return a[0] < 0n ? -a[0] : a[0];
      case 'atoi': case 'atol': {
        var m2 = this.readStr(a[0]).match(/^\s*([+-]?\d+)/);
        var val = m2 ? BigInt(m2[1]) : 0n;
        return name === 'atoi' ? Number(BigInt.asIntN(32, val)) : BigInt.asIntN(64, val);
      }
      case 'atof': case 'strtod': {
        s = this.readStr(a[0]);
        var m3 = s.match(/^\s*([+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?)/);
        if (name === 'strtod' && a[1]) this.store(a[1], ptr(T.char), a[0] + (m3 ? m3[0].length : 0));
        return m3 ? parseFloat(m3[1]) : 0;
      }
      case 'strtol': {
        s = this.readStr(a[0]); var bs = a[2] || 10;
        var m4 = s.match(bs === 16 ? /^\s*([+-]?)(0[xX])?([0-9a-fA-F]+)/ : /^\s*([+-]?)()([0-9a-zA-Z]+)/);
        var res = 0n, used = 0;
        if (m4) {
          var dg = '';
          for (var q = 0; q < m4[3].length; q++) { var dd = parseInt(m4[3][q], 36); if (dd >= bs) break; dg += m4[3][q]; }
          if (dg) { for (q = 0; q < dg.length; q++) res = res * BigInt(bs) + BigInt(parseInt(dg[q], 36)); if (m4[1] === '-') res = -res; used = m4[0].length - (m4[3].length - dg.length); }
        }
        if (a[1]) this.store(a[1], ptr(T.char), a[0] + used);
        return BigInt.asIntN(64, res);
      }
      case 'rand': this.randSeed = (Math.imul(this.randSeed, 1103515245) + 12345) >>> 0; return (this.randSeed >>> 1) & 0x7fffffff;
      case 'srand': this.randSeed = a[0] >>> 0; return;
      case 'exit': throw { exitSignal: true, code: a[0] };
      case 'abort': this.err('abort() was called');
      case 'system': return 0;
      case 'qsort': {
        var base = a[0], cnt2 = Number(a[1]), esz = Number(a[2]), cmpFn = this.funcByAddr[a[3]];
        if (!cmpFn) this.err('qsort: invalid comparison function');
        if (cnt2 > 1) this.chk(base, cnt2 * esz, true);
        var tmp = this.malloc(esz, null, 'qsort');
        for (var ii = 1; ii < cnt2; ii++) {
          this.u8.copyWithin(tmp, base + ii * esz, base + (ii + 1) * esz);
          var lo = 0, hi = ii;
          while (lo < hi) {
            var mid = (lo + hi) >> 1;
            var cr = this.callFn(cmpFn, [tmp, base + mid * esz], this.curLine);
            if (cr < 0) hi = mid; else lo = mid + 1;
          }
          if (lo < ii) { this.u8.copyWithin(base + (lo + 1) * esz, base + lo * esz, base + ii * esz); }
          this.u8.copyWithin(base + lo * esz, tmp, tmp + esz);
        }
        this.free(tmp); this.blocks.pop();
        return;
      }
      case 'time': { var tv = BigInt(Math.floor(Date.now() / 1000)); if (a[0]) this.store(a[0], T.long, tv); return tv; }
      case 'clock': return BigInt(this.steps);
    }
    if (MATH1[name]) { var rr = MATH1[name](a[0]); return /f$/.test(name) && name !== 'fabs' ? Math.fround(rr) : rr; }
    if (CTYPE[name]) { var ch2 = a[0]; return ch2 === EOF ? 0 : (CTYPE[name](ch2 & 255) ? 1 : 0); }
    this.err('Library function ' + name + ' is not available in this environment');
  };
});
