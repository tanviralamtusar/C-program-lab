/* Tiny C syntax highlighter for read-only code (lesson examples, visualizer). */
(function () {
  var KW = /^(int|char|float|double|void|long|short|unsigned|signed|const|static|struct|union|enum|typedef|if|else|while|do|for|switch|case|default|break|continue|return|goto|sizeof|extern|auto|register|volatile|_Bool|bool|inline)$/;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var RE = /(\/\/.*$|\/\*[\s\S]*?(\*\/|$))|("(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?)|(^\s*#\s*\w+.*$)|(\b\d+\.?\d*(?:[eE][+-]?\d+)?[uUlLfF]*\b|\b0[xX][0-9a-fA-F]+\b)|([A-Za-z_]\w*)/gm;
  function c(src) {
    var out = '', last = 0, m;
    RE.lastIndex = 0;
    while ((m = RE.exec(src))) {
      out += esc(src.slice(last, m.index));
      var t = m[0], cls = null;
      if (m[1]) cls = 'tk-com';
      else if (m[3]) cls = 'tk-str';
      else if (m[4]) cls = 'tk-pre';
      else if (m[5]) cls = 'tk-num';
      else if (m[6]) cls = KW.test(t) ? 'tk-kw' : /^(printf|scanf|main|puts|gets|fgets|malloc|free|calloc|realloc|strlen|strcpy|strcmp|strcat|fopen|fclose|fprintf|fscanf)$/.test(t) ? 'tk-fn' : null;
      out += cls ? '<span class="' + cls + '">' + esc(t) + '</span>' : esc(t);
      last = m.index + t.length;
      if (!t.length) RE.lastIndex++;
    }
    return out + esc(src.slice(last));
  }
  window.Highlight = { c: c };
})();
