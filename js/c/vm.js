/* Mini-C runtime: memory model, evaluator, statement execution, C standard library,
   virtual file system and step-by-step snapshots for the visualizer. */
var CI_MODULES = (typeof CI_MODULES !== 'undefined') ? CI_MODULES : [];
CI_MODULES.push(function (CI) {
  'use strict';
  var CError = CI.CError, T = CI.T, MEM = CI.MEM, ty = CI.types;
  var typeName = ty.typeName, ptr = ty.ptr;
  var NORMAL = 0, BREAK = 1, CONTINUE = 2, RETURN = 3, GOTO = 4;
  var EOF = -1;

  // ---------------------------------------------------------------- prelude (headers)
  var HEADERS = {
    'stdio.h': 'printf scanf sprintf snprintf sscanf fprintf fscanf getchar putchar puts gets fgets fputs fgetc getc fputc putc ungetc fopen fclose feof ferror fflush rewind fseek ftell fread fwrite remove rename perror setbuf',
    'string.h': 'strlen strcpy strncpy strcat strncat strcmp strncmp strcasecmp stricmp strchr strrchr strstr strspn strcspn strrev strupr strlwr memset memcpy memmove memcmp strtok strdup',
    'ctype.h': 'isalpha isdigit isalnum isspace isupper islower ispunct isxdigit isprint iscntrl isgraph toupper tolower',
    'math.h': 'sqrt pow fabs ceil floor round trunc sin cos tan asin acos atan atan2 exp log log10 log2 fmod hypot cbrt sqrtf powf fabsf floorf ceilf roundf',
    'stdlib.h': 'malloc calloc realloc free abs labs llabs atoi atol atof strtol strtod rand srand exit abort qsort system',
    'time.h': 'time clock'
  };
  var FN_HEADER = {};
  Object.keys(HEADERS).forEach(function (h) { HEADERS[h].split(' ').forEach(function (f) { FN_HEADER[f] = h; }); });
  FN_HEADER.abs = 'stdlib.h';

  var PRELUDE = [
    'typedef unsigned long size_t; typedef long ptrdiff_t; typedef long time_t; typedef long clock_t; typedef long intptr_t;',
    'typedef signed char int8_t; typedef short int16_t; typedef int int32_t; typedef long int64_t;',
    'typedef unsigned char uint8_t; typedef unsigned short uint16_t; typedef unsigned int uint32_t; typedef unsigned long uint64_t;',
    'typedef struct _IO_FILE FILE;',
    'FILE *stdin, *stdout, *stderr;',
    'int printf(const char*, ...); int scanf(const char*, ...); int sprintf(char*, const char*, ...); int snprintf(char*, size_t, const char*, ...);',
    'int sscanf(const char*, const char*, ...); int fprintf(FILE*, const char*, ...); int fscanf(FILE*, const char*, ...);',
    'int getchar(void); int putchar(int); int puts(const char*); char *gets(char*); char *fgets(char*, int, FILE*); int fputs(const char*, FILE*);',
    'int fgetc(FILE*); int getc(FILE*); int fputc(int, FILE*); int putc(int, FILE*); int ungetc(int, FILE*);',
    'FILE *fopen(const char*, const char*); int fclose(FILE*); int feof(FILE*); int ferror(FILE*); int fflush(FILE*); void rewind(FILE*);',
    'int fseek(FILE*, long, int); long ftell(FILE*); size_t fread(void*, size_t, size_t, FILE*); size_t fwrite(const void*, size_t, size_t, FILE*);',
    'int remove(const char*); int rename(const char*, const char*); void perror(const char*); void setbuf(FILE*, char*);',
    'size_t strlen(const char*); char *strcpy(char*, const char*); char *strncpy(char*, const char*, size_t); char *strcat(char*, const char*);',
    'char *strncat(char*, const char*, size_t); int strcmp(const char*, const char*); int strncmp(const char*, const char*, size_t);',
    'int strcasecmp(const char*, const char*); int stricmp(const char*, const char*);',
    'size_t strspn(const char*, const char*); size_t strcspn(const char*, const char*); char *strchr(const char*, int); char *strrchr(const char*, int); char *strstr(const char*, const char*);',
    'char *strrev(char*); char *strupr(char*); char *strlwr(char*); char *strtok(char*, const char*); char *strdup(const char*);',
    'void *memset(void*, int, size_t); void *memcpy(void*, const void*, size_t); void *memmove(void*, const void*, size_t); int memcmp(const void*, const void*, size_t);',
    'int isalpha(int); int isdigit(int); int isalnum(int); int isspace(int); int isupper(int); int islower(int); int ispunct(int);',
    'int isxdigit(int); int isprint(int); int iscntrl(int); int isgraph(int); int toupper(int); int tolower(int);',
    'double sqrt(double); double pow(double, double); double fabs(double); double ceil(double); double floor(double); double round(double);',
    'double trunc(double); double sin(double); double cos(double); double tan(double); double asin(double); double acos(double);',
    'double atan(double); double atan2(double, double); double exp(double); double log(double); double log10(double); double log2(double);',
    'double fmod(double, double); double hypot(double, double); double cbrt(double);',
    'float sqrtf(float); float powf(float, float); float fabsf(float); float floorf(float); float ceilf(float); float roundf(float);',
    'void *malloc(size_t); void *calloc(size_t, size_t); void *realloc(void*, size_t); void free(void*);',
    'int abs(int); long labs(long); long long llabs(long long); int atoi(const char*); long atol(const char*); double atof(const char*);',
    'long strtol(const char*, char**, int); double strtod(const char*, char**); int rand(void); void srand(unsigned int);',
    'void exit(int); void abort(void); void qsort(void*, size_t, size_t, int (*)(const void*, const void*)); int system(const char*);',
    'time_t time(time_t*); clock_t clock(void);'
  ].join('\n');
  var PREDEF_SRC = [
    '#define NULL ((void*)0)', '#define EOF (-1)', '#define true 1', '#define false 0', '#define bool _Bool',
    '#define INT_MAX 2147483647', '#define INT_MIN (-2147483647-1)', '#define UINT_MAX 4294967295U',
    '#define LONG_MAX 9223372036854775807L', '#define LONG_MIN (-9223372036854775807L-1)', '#define ULONG_MAX 18446744073709551615UL',
    '#define LLONG_MAX 9223372036854775807LL', '#define LLONG_MIN (-9223372036854775807LL-1)', '#define ULLONG_MAX 18446744073709551615ULL',
    '#define SHRT_MAX 32767', '#define SHRT_MIN (-32768)', '#define USHRT_MAX 65535', '#define CHAR_MAX 127', '#define CHAR_MIN (-128)',
    '#define SCHAR_MAX 127', '#define SCHAR_MIN (-128)', '#define UCHAR_MAX 255', '#define CHAR_BIT 8',
    '#define FLT_MAX 3.402823466e+38F', '#define FLT_MIN 1.175494351e-38F', '#define DBL_MAX 1.7976931348623157e+308', '#define DBL_MIN 2.2250738585072014e-308',
    '#define FLT_EPSILON 1.192092896e-07F', '#define DBL_EPSILON 2.2204460492503131e-016',
    '#define RAND_MAX 2147483647', '#define EXIT_SUCCESS 0', '#define EXIT_FAILURE 1', '#define CLOCKS_PER_SEC 1000000L',
    '#define SEEK_SET 0', '#define SEEK_CUR 1', '#define SEEK_END 2', '#define BUFSIZ 8192', '#define FILENAME_MAX 4096',
    '#define M_PI 3.14159265358979323846', '#define M_E 2.7182818284590452354', '#define INFINITY (1.0/0.0)', '#define NAN (0.0/0.0)',
    '#define __STDC__ 1', '#define __STDC_VERSION__ 199901L'
  ].join('\n');

  var preludeCache = null;
  function getPrelude() {
    if (!preludeCache) {
      var pm = CI.preprocess(PREDEF_SRC, null);
      var pt = CI.lex(PRELUDE); pt.forEach(function (t) { t.line = 0; });
      preludeCache = { macros: pm.macros, toks: pt };
    }
    return preludeCache;
  }

  // ---------------------------------------------------------------- compile
  function newParser(toks, opts) {
    var pre = getPrelude();
    var p = new CI.Parser(pre.toks, opts);
    p.inPrelude = true;
    p.translationUnit();
    p.funcs.forEach(function (f) { f.builtin = true; });
    p.inPrelude = false;
    p.toks = toks; p.p = 0;
    return p;
  }
  function compile(src) {
    var pre = getPrelude();
    var pp = CI.preprocess(src, pre.macros);
    var known = new Map();
    try {
      var p1 = newParser(pp.toks, { skipBodies: true });
      p1.translationUnit();
      p1.funcs.forEach(function (f) { if (!f.builtin && f.def) { f.pass1 = true; known.set(f.name, f); } });
    } catch (e) { if (!(e instanceof CError)) throw e; }
    var warnings = [];
    var used = {};
    var p = newParser(pp.toks, { knownFuncs: known, onBuiltinUse: function (name, tok) { if (!used[name]) used[name] = tok; } });
    var items = p.translationUnit();
    var main = p.global.vars.get('main');
    if (!main || main.kind !== 'func' || !main.def) throw new CError('compile', 'Your program has no main() function. Every C program starts running from int main(void) { ... }', 1);
    // header warnings
    var inc = {}; pp.includes.forEach(function (h) { inc[h] = 1; });
    Object.keys(used).forEach(function (fn) {
      var h = FN_HEADER[fn];
      if (h && !inc[h]) warnings.push({ line: used[fn].line, msg: "'" + fn + "' is declared in <" + h + '> — add #include <' + h + '> at the top' });
      if (fn === 'gets') warnings.push({ line: used[fn].line, msg: 'gets() is unsafe (it cannot limit the input length) and was removed in C11. Prefer fgets(str, size, stdin).' });
    });
    warnings = warnings.concat(p.warnings);
    var seen = {};
    warnings = warnings.filter(function (w) { var k = w.line + '|' + w.msg; if (seen[k]) return false; seen[k] = 1; return true; });
    warnings.sort(function (a, b) { return a.line - b.line; });
    return {
      main: main, funcs: p.funcs, globals: p.globals.filter(function (g) { return g.line > 0 || g.line === undefined ? g.name !== 'stdin' && g.name !== 'stdout' && g.name !== 'stderr' : false; }),
      allGlobals: p.globals, items: items, staticDecls: p.staticDecls, staticInit: p.staticInit, staticTop: p.staticTop,
      warnings: warnings, includes: pp.includes
    };
  }
  CI.compile = compile;

  // ---------------------------------------------------------------- helpers
  function truthy(v) { return typeof v === 'bigint' ? v !== 0n : v !== 0; }
  function wrap(v, t) {
    switch (t.size) {
      case 4: return t.uns ? v >>> 0 : v | 0;
      case 1: return t.bool ? (v ? 1 : 0) : t.uns ? v & 255 : (v << 24) >> 24;
      case 2: return t.uns ? v & 65535 : (v << 16) >> 16;
    }
    return v;
  }
  function cvt(v, from, to) {
    switch (to.k) {
      case 'int':
        if (to.bool) return truthy(v) ? 1 : 0;
        if (to.size === 8) {
          var b;
          if (typeof v === 'bigint') b = v;
          else { if (!isFinite(v)) v = 0; b = BigInt(Math.trunc(v)); }
          return to.uns ? BigInt.asUintN(64, b) : BigInt.asIntN(64, b);
        }
        if (typeof v === 'bigint') v = Number(BigInt.asUintN(32, v));
        else if (from && from.k === 'flt') { if (!isFinite(v)) v = to.uns ? 0 : -2147483648; else { v = Math.trunc(v); if (Math.abs(v) > 4294967295) v = Number(BigInt.asUintN(32, BigInt(v))); } }
        return wrap(v, to);
      case 'flt':
        var n = typeof v === 'bigint' ? Number(v) : v;
        return to.size === 4 ? Math.fround(n) : n;
      case 'ptr':
        return typeof v === 'bigint' ? Number(BigInt.asUintN(64, v)) : (v < 0 ? v + 18446744073709551616 : v);
      case 'void': return undefined;
    }
    return v;
  }
  CI.cvt = cvt;
  function bytesToStr(arr) { var s = ''; for (var i = 0; i < arr.length; i += 4096) s += String.fromCharCode.apply(null, Array.prototype.slice.call(arr, i, i + 4096)); return s; }
  function decodeUtf8(latin) {
    try {
      var u = new Uint8Array(latin.length); for (var i = 0; i < latin.length; i++) u[i] = latin.charCodeAt(i) & 255;
      return new TextDecoder('utf-8').decode(u);
    } catch (e) { return latin; }
  }
  CI.decodeUtf8 = decodeUtf8;
  function encodeUtf8(s) { return bytesToStr(CI.utf8Bytes(s)); }
  CI.encodeUtf8 = encodeUtf8;

  // ---------------------------------------------------------------- VM
  function VM(prog, opts) {
    opts = opts || {};
    this.prog = prog;
    this.buf = new ArrayBuffer(MEM.TOP);
    this.dv = new DataView(this.buf);
    this.u8 = new Uint8Array(this.buf);
    this.init = new Uint8Array(MEM.TOP); // 0 = uninitialised, 1 = initialised, 2 = read-only literal
    this.sp = MEM.TOP;
    this.heapTop = MEM.HEAP;
    this.blocks = [];
    this.staticTop = prog.staticTop;
    this.scratch = Math.ceil(prog.staticTop / 16) * 16; this.staticTop = this.scratch + 4096;
    this.stdin = encodeUtf8(opts.stdin || '');
    this.interactive = !!opts.interactive && !opts.stdinClosed; // stop with needInput instead of hitting EOF
    this.inPos = 0;
    this.out = []; this.outLen = 0;
    this.frames = []; this.frame = null;
    this.steps = 0; this.maxSteps = opts.maxSteps || 50000000;
    this.deadline = Date.now() + (opts.timeLimit || 10000);
    this.trace = opts.trace ? [] : null; this.maxTrace = opts.maxTrace || 3000; this.truncated = false;
    this.warnings = []; this.warnSeen = {};
    this.curLine = 0;
    this.fs = {}; var fsIn = opts.files || {};
    for (var k in fsIn) this.fs[k] = encodeUtf8(fsIn[k]);
    this.handles = {}; this.nextHandle = MEM.FILES + 0x30;
    this.randSeed = 1;
    this.strtokPtr = 0;
    this.exitCode = null;
    this.funcByAddr = {};
    var self = this;
    prog.funcs.forEach(function (f) { self.funcByAddr[MEM.FN + f.id * 16] = f; });
    for (var i = 0; i < prog.staticInit.length; i++) {
      var si = prog.staticInit[i];
      this.u8.set(si.bytes, si.addr);
      this.init.fill(si.ro ? 2 : 1, si.addr, si.addr + si.bytes.length);
    }
    // globals are zero-initialised
    prog.allGlobals.forEach(function (g) { if (g.addr) self.init.fill(1, g.addr, g.addr + Math.max(g.type.size, 1)); });
    prog.staticDecls.forEach(function (d) { if (d.sym.addr) self.init.fill(1, d.sym.addr, d.sym.addr + d.sym.type.size); });
    prog.funcs.forEach(function (f) { if (f.def) f.def.statics.forEach(function (s) { self.init.fill(1, s.addr, s.addr + s.type.size); }); });
  }
  CI.VM = VM;
  var V = VM.prototype;

  V.err = function (msg, line) { throw new CError('runtime', msg, line || this.curLine); };
  V.warn = function (msg, line) {
    line = line || this.curLine;
    var key = line + msg; if (this.warnSeen[key]) return; this.warnSeen[key] = 1;
    this.warnings.push({ line: line, msg: msg });
  };
  V.write = function (s) { this.out.push(s); this.outLen += s.length; if (this.outLen > 2000000) this.err('Too much output (over 2 MB) — is there an infinite loop printing?'); };

  // ---- memory checks
  V.findBlock = function (a) {
    var bl = this.blocks, lo = 0, hi = bl.length - 1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1, b = bl[mid];
      if (a < b.addr) hi = mid - 1; else if (a >= b.addr + Math.max(b.size, 1)) lo = mid + 1; else return b;
    }
    return null;
  };
  V.chk = function (a, size, write) {
    if (a >= MEM.STACK_LO) {
      if (a + size > MEM.TOP) this.err('Invalid memory access (address 0x' + a.toString(16) + ' is outside the program memory)');
      if (a < this.sp) this.err('Accessing memory of a function that has already returned (dangling pointer). Never return the address of a local variable.');
      return;
    }
    if (a >= MEM.HEAP) {
      var b = this.findBlock(a);
      if (!b) this.err('Invalid heap access at 0x' + a.toString(16) + ' — outside any malloc\'d block (buffer overflow?)');
      if (b.freed) this.err('Use after free: this memory was already released with free()');
      if (a + size > b.addr + b.size) this.err('Heap buffer overflow: reading/writing past the end of a ' + b.size + '-byte block from malloc');
      return;
    }
    if (a < MEM.STATIC) {
      if (a === 0) this.err('Segmentation fault: dereferencing a NULL pointer');
      if (a >= MEM.FN && a < MEM.FILES) this.err('Cannot read or write through a function pointer');
      this.err('Segmentation fault: invalid pointer 0x' + a.toString(16) + ' (uninitialised pointer?)');
    }
    if (a + size > this.staticTop) this.err('Invalid memory access at 0x' + a.toString(16));
    if (write && this.init[a] === 2) this.err('Cannot modify a string literal — it is read-only. Copy it into a char array first, e.g. char s[] = "...";');
  };
  V.load = function (a, t) {
    var dv = this.dv;
    switch (t.k) {
      case 'int':
        this.chk(a, t.size, false);
        switch (t.size) {
          case 1: return t.uns ? this.u8[a] : dv.getInt8(a);
          case 2: return t.uns ? dv.getUint16(a, true) : dv.getInt16(a, true);
          case 4: return t.uns ? dv.getUint32(a, true) : dv.getInt32(a, true);
          case 8: return t.uns ? dv.getBigUint64(a, true) : dv.getBigInt64(a, true);
        }
        break;
      case 'flt': this.chk(a, t.size, false); return t.size === 4 ? dv.getFloat32(a, true) : dv.getFloat64(a, true);
      case 'ptr': this.chk(a, 8, false); return dv.getUint32(a, true) + dv.getUint32(a + 4, true) * 4294967296;
      case 'struct': case 'union': this.chk(a, t.size, false); return this.u8.slice(a, a + t.size);
      case 'arr': return a;
    }
    this.err('Cannot load a value of type ' + typeName(t));
  };
  V.store = function (a, t, v) {
    var dv = this.dv;
    var sz = t.k === 'ptr' ? 8 : t.size;
    this.chk(a, sz, true);
    switch (t.k) {
      case 'int':
        switch (t.size) {
          case 1: this.u8[a] = v; break;
          case 2: dv.setUint16(a, v & 65535, true); break;
          case 4: dv.setUint32(a, v >>> 0, true); break;
          case 8: dv.setBigUint64(a, BigInt.asUintN(64, typeof v === 'bigint' ? v : BigInt(v)), true); break;
        }
        break;
      case 'flt': if (t.size === 4) dv.setFloat32(a, v, true); else dv.setFloat64(a, v, true); break;
      case 'ptr': dv.setUint32(a, v % 4294967296, true); dv.setUint32(a + 4, Math.floor(v / 4294967296), true); break;
      case 'struct': case 'union': this.u8.set(v, a); break;
      default: this.err('Cannot store a value of type ' + typeName(t));
    }
    this.init.fill(1, a, a + sz);
  };
  V.readStr = function (a, max) {
    if (a === 0) this.err('Segmentation fault: NULL pointer used as a string');
    var s = '', lim = max == null ? 1e7 : max;
    for (var i = 0; i < lim; i++) {
      this.chk(a + i, 1, false);
      var c = this.u8[a + i];
      if (c === 0) break;
      s += String.fromCharCode(c);
    }
    return s;
  };
  V.writeStr = function (a, s, nul) {
    if (s.length) { this.chk(a, s.length + (nul ? 1 : 0), true); }
    for (var i = 0; i < s.length; i++) this.u8[a + i] = s.charCodeAt(i) & 255;
    if (nul !== false) { this.chk(a + s.length, 1, true); this.u8[a + s.length] = 0; }
    this.init.fill(1, a, a + s.length + (nul !== false ? 1 : 0));
  };

  // ---- runtime sizes (VLAs)
  V.rsize = function (t) {
    if (t.k === 'arr') {
      if (t.vla) { var info = this.vlaInfo(t); return info.size; }
      if (hasVla(t.of)) return t.len * this.rsize(t.of);
      return t.size;
    }
    return t.size;
  };
  function hasVla(t) { if (t._hv === undefined) t._hv = t.k === 'arr' ? (!!t.vla || hasVla(t.of)) : false; return t._hv; }
  V.vlaInfo = function (t) {
    for (var i = this.frames.length - 1; i >= 0; i--) { var m = this.frames[i].vla; if (m && m.has(t)) return m.get(t); }
    this.err('Variable-length array used outside its function');
  };
  V.scaleOf = function (s) { return typeof s === 'number' ? s : this.rsize(s.vla); };

  // ---- expressions
  V.addrOf = function (e, forAddr) {
    switch (e.k) {
      case 'var': {
        var s = e.sym;
        if (s.storage === 'local') {
          var a = this.frame.base + s.offset;
          if (s.vla) return this.load(a, T.ulong) === 0n ? this.err('Using a variable-length array before it is created') : Number(this.dv.getBigUint64(a, true));
          return a;
        }
        return s.addr;
      }
      case 'str': return e.addr;
      case 'deref': {
        var p = this.ev(e.e);
        if (p === 0) this.err('Segmentation fault: dereferencing a NULL pointer', e.line);
        return p;
      }
      case 'index': {
        var b = this.ev(e.b), i = Number(this.ev(e.i));
        if (e.bound != null && (i < 0 || i >= e.bound) && !(forAddr && i === e.bound))
          this.err('Array index out of bounds: ' + e.name.replace(/\[\]$/, '') + '[' + i + '] but the array has ' + e.bound + ' element' + (e.bound === 1 ? '' : 's') + ' (valid indexes 0..' + (e.bound - 1) + ')', e.line);
        return b + i * this.scaleOf(e.scale);
      }
      case 'member': {
        if (e.e.lv) return this.addrOf(e.e, forAddr) + e.off;
        var bytes = this.ev(e.e);
        this.u8.set(bytes, this.scratch); this.init.fill(1, this.scratch, this.scratch + bytes.length);
        return this.scratch + e.off;
      }
    }
    this.err('Internal: not an lvalue (' + e.k + ')');
  };

  V.ev = function (e) {
    switch (e.k) {
      case 'num': return e.v;
      case 'var': case 'index': case 'deref': case 'member':
        if (e.t.k === 'arr') return this.addrOf(e);
        return this.load(this.addrOf(e), e.t);
      case 'str': return e.addr;
      case 'decay': return this.addrOf(e.e);
      case 'fnaddr': { var fe = e.e; while (fe.k === 'deref' || fe.k === 'fnaddr') fe = fe.e; if (fe.k === 'var') return MEM.FN + fe.sym.id * 16; return this.ev(fe); }
      case 'addr': return this.addrOf(e.e, true);
      case 'cast': return cvt(this.ev(e.e), e.from, e.t);
      case 'un': {
        var u = this.ev(e.e), t = e.t;
        if (e.op === '+') return u;
        if (t.k === 'flt') return e.op === '-' ? (t.size === 4 ? Math.fround(-u) : -u) : u;
        if (t.size === 8) return t.uns ? BigInt.asUintN(64, e.op === '-' ? -u : ~u) : BigInt.asIntN(64, e.op === '-' ? -u : ~u);
        return wrap(e.op === '-' ? -u : ~u, t);
      }
      case 'not': return truthy(this.ev(e.e)) ? 0 : 1;
      case 'bin': return this.binop(e.op, this.ev(e.l), this.ev(e.r), e.ct, e);
      case 'cmp': {
        var l = this.ev(e.l), r = this.ev(e.r);
        switch (e.op) {
          case '<': return l < r ? 1 : 0; case '>': return l > r ? 1 : 0; case '<=': return l <= r ? 1 : 0;
          case '>=': return l >= r ? 1 : 0; case '==': return l === r ? 1 : 0; case '!=': return l !== r ? 1 : 0;
        }
        break;
      }
      case 'and': return truthy(this.ev(e.l)) && truthy(this.ev(e.r)) ? 1 : 0;
      case 'or': return truthy(this.ev(e.l)) || truthy(this.ev(e.r)) ? 1 : 0;
      case 'cond': return truthy(this.ev(e.c)) ? this.ev(e.a) : this.ev(e.b);
      case 'comma': this.ev(e.l); return this.ev(e.r);
      case 'padd': {
        var p = this.ev(e.p), i = Number(this.ev(e.i)), sc = this.scaleOf(e.scale);
        return p + (e.neg ? -i : i) * sc;
      }
      case 'pdiff': return BigInt(Math.trunc((this.ev(e.l) - this.ev(e.r)) / this.scaleOf(e.scale)));
      case 'assign': {
        var a = this.addrOf(e.l), v = this.ev(e.r);
        this.store(a, e.t, v);
        return v;
      }
      case 'opassign': {
        var a2 = this.addrOf(e.l), old = this.load(a2, e.t), nv;
        if (e.ptr) { var d = Number(this.ev(e.r)) * this.scaleOf(e.scale); nv = old + (e.op === '-' ? -d : d); }
        else nv = cvt(this.binop(e.op, cvt(old, e.t, e.ct), this.ev(e.r), e.ct, e), e.ct, e.t);
        this.store(a2, e.t, nv);
        return nv;
      }
      case 'incdec': {
        var a3 = this.addrOf(e.e), o = this.load(a3, e.t), n, t3 = e.t;
        if (t3.k === 'ptr') n = o + e.d * this.scaleOf(e.scale);
        else if (t3.k === 'flt') n = t3.size === 4 ? Math.fround(o + e.d) : o + e.d;
        else if (t3.size === 8) n = t3.uns ? BigInt.asUintN(64, o + BigInt(e.d)) : BigInt.asIntN(64, o + BigInt(e.d));
        else n = wrap(o + e.d, t3);
        this.store(a3, t3, n);
        return e.pre ? n : o;
      }
      case 'call': return this.call(e);
      case 'sizeofvla': return BigInt(this.rsize(e.vt));
    }
    this.err('Internal: cannot evaluate ' + e.k);
  };

  V.binop = function (op, a, b, ct, e) {
    if (ct.k === 'flt') {
      var r;
      switch (op) { case '+': r = a + b; break; case '-': r = a - b; break; case '*': r = a * b; break; case '/': r = a / b; break; default: this.err('Bad float operator ' + op); }
      return ct.size === 4 ? Math.fround(r) : r;
    }
    if (ct.size === 8) {
      if (typeof b !== 'bigint') b = BigInt(b);
      var big;
      switch (op) {
        case '+': big = a + b; break; case '-': big = a - b; break; case '*': big = a * b; break;
        case '/': if (b === 0n) this.err('Division by zero', e && e.line); big = a / b; break;
        case '%': if (b === 0n) this.err('Modulo by zero (x % 0)', e && e.line); big = a % b; break;
        case '&': big = a & b; break; case '|': big = a | b; break; case '^': big = a ^ b; break;
        case '<<': big = a << (b & 63n); break;
        case '>>': big = a >> (b & 63n); break;
      }
      return ct.uns ? BigInt.asUintN(64, big) : BigInt.asIntN(64, big);
    }
    if (typeof b === 'bigint') b = Number(BigInt.asIntN(32, b));
    var uns = ct.uns;
    switch (op) {
      case '+': return uns ? (a + b) >>> 0 : (a + b) | 0;
      case '-': return uns ? (a - b) >>> 0 : (a - b) | 0;
      case '*': return uns ? Math.imul(a, b) >>> 0 : Math.imul(a, b);
      case '/': if (b === 0) this.err('Division by zero', e && e.line); return uns ? Math.trunc(a / b) >>> 0 : Math.trunc(a / b) | 0;
      case '%': if (b === 0) this.err('Modulo by zero (x % 0)', e && e.line); return uns ? (a % b) >>> 0 : (a % b) | 0;
      case '&': return uns ? (a & b) >>> 0 : a & b;
      case '|': return uns ? (a | b) >>> 0 : a | b;
      case '^': return uns ? (a ^ b) >>> 0 : a ^ b;
      case '<<': return uns ? (a << b) >>> 0 : a << b;
      case '>>': return uns ? a >>> b : a >> b;
    }
    this.err('Bad operator ' + op);
  };

  // ---- calls
  V.call = function (e) {
    var sym = e.sym;
    if (!sym) {
      var fp = this.ev(e.f);
      sym = this.funcByAddr[fp];
      if (!sym) this.err(fp === 0 ? 'Calling a NULL function pointer' : 'Calling an invalid function pointer', e.line);
    }
    var args = new Array(e.args.length);
    for (var i = 0; i < args.length; i++) args[i] = this.ev(e.args[i]);
    this.curLine = e.line;
    if (sym.builtin) return this.builtin(sym.name, args, e);
    return this.callFn(sym, args, e.line);
  };
  V.callFn = function (sym, args, line) {
    var def = sym.def;
    if (!def) this.err("Function '" + sym.name + "' is declared but never defined (no body)", line);
    if (this.frames.length >= 2500) this.err('Stack overflow: too many nested function calls (' + this.frames.length + '). Is your recursion missing a base case?', line);
    var base = (this.sp - def.frameSize) & ~15;
    if (base < MEM.STACK_LO) this.err('Stack overflow: local variables are too big (use smaller arrays, global arrays, or malloc)', line);
    var fr = { fn: def, sym: sym, base: base, savedSp: this.sp, vars: def.params.slice(), vla: null, line: def.line, callLine: line, ret: undefined, retSet: false };
    if (this.frame) this.frame.line = line;
    this.sp = base;
    this.init.fill(0, base, base + def.frameSize);
    this.frames.push(fr); this.frame = fr;
    for (var i = 0; i < def.params.length; i++) this.store(base + def.params[i].offset, def.params[i].type, args[i]);
    this.step(def.line, 'call');
    var r = this.execList(def.body.body, 0);
    if (r === GOTO) this.err("goto '" + this.gotoLabel + "': jumping into a nested block is not supported");
    var rt = sym.type.ret, ret;
    if (r === RETURN) ret = this.retVal;
    else if (rt.k !== 'void') {
      ret = sym.name === 'main' ? 0 : (rt.k === 'int' ? (rt.size === 8 ? 0n : 0) : rt.k === 'flt' ? 0 : rt.k === 'ptr' ? 0 : new Uint8Array(rt.size));
      if (sym.name !== 'main') this.warn("Function '" + sym.name + "' ended without a return statement — its result is garbage", def.endLine);
    }
    fr.ret = ret; fr.retSet = rt.k !== 'void';
    this.step(def.endLine, 'return');
    this.frames.pop();
    this.frame = this.frames[this.frames.length - 1] || null;
    this.sp = fr.savedSp;
    this.retVal = undefined;
    return ret;
  };

  // ---- statements
  V.step = function (line, kind) {
    this.curLine = line;
    if (this.frame) this.frame.line = line;
    if (++this.steps > this.maxSteps) this.err('Time limit exceeded: the program ran ' + this.maxSteps.toLocaleString() + ' steps. Is there an infinite loop?');
    if ((this.steps & 0xffff) === 0 && Date.now() > this.deadline) this.err('Time limit exceeded — is there an infinite loop? (or waiting for more input that never comes)');
    if (this.trace) {
      if (this.trace.length < this.maxTrace) this.trace.push(this.snap(line, kind));
      else this.truncated = true;
    }
  };
  V.execList = function (list, start) {
    for (var i = start; i < list.length; i++) {
      var r = this.exec(list[i]);
      if (r !== NORMAL) {
        if (r === GOTO) {
          var lbl = this.gotoLabel, j = -1;
          for (var k = 0; k < list.length; k++) if (list[k].k === 'label' && list[k].name === lbl) { j = k; break; }
          if (j >= 0) { i = j - 1; continue; }
        }
        return r;
      }
    }
    return NORMAL;
  };
  V.execBlock = function (b) {
    var fr = this.frame, mark = fr.vars.length, spMark = this.sp;
    var r = this.execList(b.body, 0);
    fr.vars.length = mark;
    this.sp = spMark;
    return r;
  };
  V.exec = function (s) {
    switch (s.k) {
      case 'expr': this.step(s.line, 'stmt'); this.ev(s.e); return NORMAL;
      case 'decl': return this.execDecl(s);
      case 'declgroup': for (var i = 0; i < s.decls.length; i++) this.execDecl(s.decls[i]); return NORMAL;
      case 'block': return this.execBlock(s);
      case 'if':
        this.step(s.line, 'cond');
        if (truthy(this.ev(s.cond))) return this.exec(s.then);
        if (s.els) return this.exec(s.els);
        return NORMAL;
      case 'while':
        while (true) {
          this.step(s.line, 'cond');
          if (!truthy(this.ev(s.cond))) break;
          var r = this.exec(s.body);
          if (r === BREAK) break;
          if (r === CONTINUE || r === NORMAL) continue;
          return r;
        }
        return NORMAL;
      case 'do':
        while (true) {
          var r2 = this.exec(s.body);
          if (r2 === BREAK) break;
          if (r2 !== NORMAL && r2 !== CONTINUE) return r2;
          this.step(s.condLine, 'cond');
          if (!truthy(this.ev(s.cond))) break;
        }
        return NORMAL;
      case 'for': {
        var fr = this.frame, mark = fr.vars.length;
        if (s.init) { if (s.init.k === 'expr') { this.step(s.line, 'stmt'); this.ev(s.init.e); } else this.exec(s.init); }
        var res = NORMAL;
        while (true) {
          if (s.cond) { this.step(s.line, 'cond'); if (!truthy(this.ev(s.cond))) break; }
          else this.step(s.line, 'cond');
          var r3 = this.exec(s.body);
          if (r3 === BREAK) break;
          if (r3 !== NORMAL && r3 !== CONTINUE) { res = r3; break; }
          if (s.update) { this.step(s.line, 'update'); this.ev(s.update); }
        }
        fr.vars.length = mark;
        return res;
      }
      case 'switch': {
        this.step(s.line, 'cond');
        var v = this.ev(s.e), body = s.body.k === 'block' ? s.body.body : [s.body];
        var idx = -1, def = -1;
        for (var k = 0; k < body.length; k++) {
          if (body[k].k === 'case') { if (body[k].def) def = k; else if (body[k].v == v) { idx = k; break; } }
        }
        if (idx < 0) idx = def;
        if (idx < 0) return NORMAL;
        var fr2 = this.frame, mark2 = fr2.vars.length;
        var r4 = this.execList(body, idx);
        fr2.vars.length = mark2;
        return r4 === BREAK ? NORMAL : r4;
      }
      case 'case': case 'label': case 'empty': return NORMAL;
      case 'break': this.step(s.line, 'jump'); return BREAK;
      case 'continue': this.step(s.line, 'jump'); return CONTINUE;
      case 'return':
        this.step(s.line, 'stmt');
        this.retVal = s.e ? this.ev(s.e) : undefined;
        if (s.voidRet) this.retVal = undefined;
        return RETURN;
      case 'goto': this.step(s.line, 'jump'); this.gotoLabel = s.label; return GOTO;
    }
    this.err('Internal: unknown statement ' + s.k);
  };
  V.execDecl = function (d) {
    var sym = d.sym, fr = this.frame;
    this.step(d.line, 'decl');
    if (d.isStatic) { fr.vars.push(sym); return NORMAL; }
    var t = sym.type, base;
    if (sym.vla) {
      // compute runtime sizes
      if (!fr.vla) fr.vla = new Map();
      var self = this;
      var sizeOf = function (tt) {
        if (tt.k !== 'arr') return tt.size;
        var n = tt.vla ? Number(self.ev(tt.vla)) : tt.len;
        if (tt.vla && n <= 0) self.err('Variable-length array size must be positive, got ' + n + ' (did you read the size with scanf before declaring the array?)');
        var es = sizeOf(tt.of), sz = n * es;
        if (tt.vla) fr.vla.set(tt, { len: n, size: sz });
        return sz;
      };
      var size = sizeOf(t);
      var nb = (this.sp - size) & ~15;
      if (nb < MEM.STACK_LO) this.err('Stack overflow: the array is too big for the stack (' + size + ' bytes)');
      this.sp = nb;
      this.init.fill(0, nb, nb + size);
      var slot = fr.base + sym.offset;
      this.dv.setBigUint64(slot, BigInt(nb), true); this.init.fill(1, slot, slot + 8);
      sym.vlaLen = true;
      fr.vars.push(sym);
      return NORMAL;
    }
    base = fr.base + sym.offset;
    if (d.hasInit) {
      if (t.k === 'arr' || t.k === 'struct' || t.k === 'union') { this.u8.fill(0, base, base + t.size); this.init.fill(1, base, base + t.size); }
      this.doStores(base, d.stores);
    } else this.init.fill(0, base, base + t.size);
    fr.vars.push(sym);
    return NORMAL;
  };
  V.doStores = function (base, stores) {
    for (var i = 0; i < stores.length; i++) {
      var s = stores[i];
      if (s.str) {
        var n = s.t.len != null ? s.t.len : s.str.length;
        for (var j = 0; j < n; j++) this.u8[base + s.off + j] = j < s.str.length ? s.str[j] : 0;
        this.init.fill(1, base + s.off, base + s.off + n);
      } else this.store(base + s.off, s.t, this.ev(s.e));
    }
  };

  // ---- run
  V.run = function () {
    var prog = this.prog, self = this;
    try {
      this.store(this.findGlobal('stdin'), ptr(T.void), MEM.FILES);
      this.store(this.findGlobal('stdout'), ptr(T.void), MEM.FILES + 0x10);
      this.store(this.findGlobal('stderr'), ptr(T.void), MEM.FILES + 0x20);
      prog.items.forEach(function (d) { if (d.k === 'decl' && d.stores.length) { self.curLine = d.line; self.doStores(d.sym.addr, d.stores); } });
      prog.staticDecls.forEach(function (d) { self.curLine = d.line; self.doStores(d.sym.addr, d.stores); });
      var mt = prog.main.type, args = [];
      if (mt.params.length >= 1) args.push(1);
      if (mt.params.length >= 2) args.push(0);
      var r = this.callFn(prog.main, args, prog.main.line);
      this.exitCode = r === undefined ? 0 : Number(r);
    } catch (ex) {
      if (ex && ex.needInput) { this.needInput = true; }
      else if (ex && ex.exitSignal) { this.exitCode = ex.code; }
      else if (ex instanceof CError) { this.error = ex; }
      else if (ex instanceof RangeError) { this.error = new CError('runtime', 'Stack overflow: recursion is too deep (' + this.frames.length + ' calls). Check your base case.', this.curLine); }
      else throw ex;
      if (this.trace && this.trace.length < this.maxTrace + 1) {
        var s = this.snap(this.curLine, this.error ? 'error' : 'exit');
        if (this.error) s.error = this.error.message;
        this.trace.push(s);
      }
    }
    var outStr = this.out.join('');
    var files = {}; for (var k in this.fs) files[k] = decodeUtf8(this.fs[k]);
    return {
      stdout: decodeUtf8(outStr), stdoutRaw: outStr, exitCode: this.exitCode, error: this.error ? { kind: this.error.kind, message: this.error.message, line: this.error.line } : null,
      warnings: this.warnings, steps: this.steps, trace: this.trace, truncated: this.truncated, files: files, stdinUsed: this.inPos, stdinLen: this.stdin.length, needInput: !!this.needInput
    };
  };
  V.findGlobal = function (n) {
    var g = this.prog.allGlobals; for (var i = 0; i < g.length; i++) if (g[i].name === n) return g[i].addr;
    return 0;
  };

  // ---------------------------------------------------------------- snapshots
  function fmtNum(v, t) {
    if (t.k === 'flt') {
      if (!isFinite(v)) return isNaN(v) ? 'nan' : (v < 0 ? '-inf' : 'inf');
      var s = t.size === 4 ? String(Number(v.toPrecision(7))) : String(Number(v.toPrecision(15)));
      if (s.indexOf('e') < 0 && s.indexOf('.') < 0) s += '.0';
      return s;
    }
    return String(v);
  }
  function charLabel(c) {
    var map = { 0: '\\0', 10: '\\n', 9: '\\t', 13: '\\r', 32: "' '" };
    if (map[c & 255] !== undefined && (c === 0 || c === 10 || c === 9 || c === 13)) return map[c & 255];
    if (c >= 32 && c < 127) return c === 32 ? '␣' : String.fromCharCode(c);
    return '';
  }
  V.isInit = function (a, n) { for (var i = 0; i < n; i++) if (!this.init[a + i]) return false; return true; };
  V.validAddr = function (a, size) {
    if (a < MEM.STATIC) return false;
    if (a >= MEM.STACK_LO) return a >= this.sp && a + size <= MEM.TOP;
    if (a >= MEM.HEAP) { var b = this.findBlock(a); return !!b && a + size <= b.addr + b.size; }
    return a + size <= this.staticTop;
  };
  V.view = function (a, t, depth, fr) {
    var v = { a: a, t: typeName(t) };
    switch (t.k) {
      case 'int': case 'flt': {
        v.k = 'v'; v.s = t.size;
        if (!this.isInit(a, t.size)) { v.v = '?'; return v; }
        var x = this.load(a, t);
        v.v = fmtNum(x, t);
        if (t.k === 'int' && t.size === 1 && !t.bool) v.c = charLabel(x);
        return v;
      }
      case 'ptr': {
        v.k = 'p'; v.s = 8;
        if (!this.isInit(a, 8)) { v.v = '?'; return v; }
        var p = this.load(a, t);
        v.to = p;
        if (p === 0) v.v = 'NULL';
        else if (this.funcByAddr[p]) { v.v = this.funcByAddr[p].name + '()'; v.fn = true; v.to = 0; }
        else if (p >= MEM.FILES && p < MEM.STATIC) { var h = this.handles[p]; v.v = p === MEM.FILES ? 'stdin' : p === MEM.FILES + 0x10 ? 'stdout' : p === MEM.FILES + 0x20 ? 'stderr' : 'FILE "' + (h ? h.name : '?') + '"' + (h && h.closed ? ' (closed)' : ''); v.file = true; v.to = 0; }
        else {
          v.v = '0x' + p.toString(16);
          if (!this.validAddr(p, 1)) v.bad = this.danglingWhy(p);
          else if (t.to.k === 'int' && t.to.size === 1) {
            var s = ''; for (var i = 0; i < 40 && this.validAddr(p + i, 1); i++) { var c = this.u8[p + i]; if (!c || !this.init[p + i]) break; s += String.fromCharCode(c); }
            v.str = decodeUtf8(s);
          }
        }
        return v;
      }
      case 'arr': {
        var len = t.vla ? (this.vlaLenFor(t, fr)) : t.len, et = t.of;
        var es = (et.k === 'arr' || et.vla) ? this.rsize(et) : et.size;
        if (t.vla || hasVla(t)) { try { es = this.rsizeIn(et, fr); } catch (e) { es = et.size; } }
        v.k = 'a'; v.len = len; v.s = len * es;
        var lim = Math.min(len, depth > 0 ? 50 : 120);
        v.items = [];
        for (var j = 0; j < lim; j++) v.items.push(this.view(a + j * es, et, depth + 1, fr));
        if (et.k === 'int' && et.size === 1) {
          var s2 = '', term = false;
          for (var q = 0; q < len; q++) { if (!this.init[a + q]) break; var cc = this.u8[a + q]; if (cc === 0) { term = true; break; } s2 += String.fromCharCode(cc); }
          v.str = decodeUtf8(s2); v.term = term;
        }
        return v;
      }
      case 'struct': case 'union': {
        v.k = 's'; v.s = t.size; v.fields = [];
        for (var f = 0; f < t.fields.length; f++) { var fv = this.view(a + t.fields[f].offset, t.fields[f].type, depth + 1, fr); fv.n = t.fields[f].name; v.fields.push(fv); }
        if (t.k === 'union') v.union = true;
        return v;
      }
    }
    v.k = 'v'; v.v = '?'; return v;
  };
  V.danglingWhy = function (p) {
    if (p >= MEM.STACK_LO) return 'dangling (function returned)';
    if (p >= MEM.HEAP) { var b = this.findBlock(p); return b && b.freed ? 'dangling (freed)' : 'out of bounds'; }
    return 'invalid';
  };
  V.vlaLenFor = function (t, fr) { var m = fr && fr.vla; if (m && m.has(t)) return m.get(t).len; return 0; };
  V.rsizeIn = function (t, fr) {
    if (t.k !== 'arr') return t.size;
    var n = t.vla ? this.vlaLenFor(t, fr) : t.len;
    return n * this.rsizeIn(t.of, fr);
  };
  V.symAddr = function (s, fr) {
    if (s.storage === 'local') {
      var a = fr.base + s.offset;
      if (s.vla) return Number(this.dv.getBigUint64(a, true));
      return a;
    }
    return s.addr;
  };
  V.snap = function (line, kind) {
    var self = this;
    var frames = this.frames.map(function (fr, fi) {
      var seen = {};
      var vars = [];
      for (var i = fr.vars.length - 1; i >= 0; i--) {
        var s = fr.vars[i];
        var v = self.view(self.symAddr(s, fr), s.type, 0, fr);
        v.n = s.name; if (seen[s.name]) v.shadowed = true; seen[s.name] = 1;
        if (s.storage === 'static') v.isStatic = true;
        if (s.param) v.param = true;
        vars.push(v);
      }
      vars.reverse();
      var f = { name: fr.sym.name, line: fr.line, vars: vars };
      if (fi === self.frames.length - 1 && kind === 'return' && fr.retSet) {
        var rt = fr.sym.type.ret;
        f.ret = rt.k === 'struct' || rt.k === 'union' ? '{...}' : rt.k === 'ptr' ? (fr.ret === 0 ? 'NULL' : '0x' + fr.ret.toString(16)) : fmtNum(fr.ret, rt);
      }
      return f;
    });
    var globals = this.prog.globals.map(function (g) { var v = self.view(g.addr, g.type, 0, null); v.n = g.name; return v; });
    var heap = this.blocks.map(function (b) {
      var h = { a: b.addr, s: b.size, freed: b.freed, by: b.by };
      if (!b.freed) {
        var et = b.hint && b.hint.size > 0 && b.hint.k !== 'void' && b.hint.k !== 'func' ? b.hint : T.uchar;
        var n = Math.floor(b.size / et.size);
        if (n >= 1) { var at = { k: 'arr', of: et, len: n, size: n * et.size }; h.v = self.view(b.addr, at, 0, null); h.v.t = typeName(et) + '[' + n + ']'; }
      }
      return h;
    });
    return { line: line, kind: kind, frames: frames, globals: globals, heap: heap, out: this.outLen, inPos: this.inPos, step: this.steps };
  };

  CI.VM.prototype.NORMAL = NORMAL;
  CI.run = function (src, opts) {
    var prog;
    try { prog = compile(src); }
    catch (e) {
      if (e instanceof CError) return { compileError: { message: e.message, line: e.line, col: e.col }, stdout: '', warnings: [] };
      throw e;
    }
    var vm = new VM(prog, opts);
    var res = vm.run();
    res.warnings = prog.warnings.concat(res.warnings);
    return res;
  };
});
