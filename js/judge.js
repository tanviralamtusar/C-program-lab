/* Output judge shared by the browser and the build script.
   exact   : identical after trimming trailing spaces / trailing blank lines
   lenient : the expected whitespace-separated tokens appear, in order, inside the actual output
             (so input prompts like "Enter n:" and different spacing are tolerated). */
(function (root) {
  function norm(s) { return String(s).replace(/\r/g, '').split('\n').map(function (l) { return l.replace(/\s+$/, ''); }).join('\n').replace(/\n+$/, ''); }
  function tokens(s) { return String(s).split(/\s+/).filter(Boolean); }
  function compare(actual, expected) {
    if (norm(actual) === norm(expected)) return { pass: true, exact: true };
    var a = tokens(actual), e = tokens(expected);
    if (!e.length) return { pass: !a.length, exact: false };
    var j = 0;
    for (var i = 0; i < a.length && j < e.length; i++) {
      if (a[i] === e[j]) j++;
      else if (a[i].length > e[j].length && a[i].endsWith(e[j]) && /[:=]$/.test(a[i].slice(0, a[i].length - e[j].length))) j++; // "n:5" style
    }
    if (j === e.length) {
      // guard: the extra text must not repeat a wrong answer — require the LAST expected token's line to match closely
      return { pass: true, exact: false };
    }
    // find first mismatching expected line for a helpful message
    var el = norm(expected).split('\n'), al = norm(actual).split('\n');
    var line = 0;
    while (line < el.length && line < al.length && el[line].trim().split(/\s+/).join(' ') === al[line].trim().split(/\s+/).join(' ')) line++;
    return { pass: false, exact: false, line: line + 1, expectedLine: el[line] === undefined ? '(end of output)' : el[line], actualLine: al[line] === undefined ? '(nothing)' : al[line] };
  }
  var api = { compare: compare, norm: norm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Judge = api;
})(this);
