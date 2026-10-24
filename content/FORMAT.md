# Lesson file format (content/<topic>.md)

Each topic is ONE markdown file. A build script (`tools/build.js`) parses it into the site's data and
**runs every example and every reference solution through the site's C interpreter**, comparing outputs
with what you wrote. So outputs must be exact.

## 1. Front matter (required, at the very top)

```
---
id: loops
title: Loops
order: 4
summary: Repeat work with while, do-while and for; nested loops; break and continue.
---
```

## 2. Lesson steps

Each step starts with a level-1 heading `# Step: <title>`. Inside a step you may use:

* Normal markdown: paragraphs, **bold**, *italic*, `inline code`, bullet lists (`- `), numbered lists (`1. `),
  tables (`| a | b |` with a `|---|---|` separator row), and `##`/`###` sub-headings.
* Callouts: a paragraph starting with `> **Tip:**`, `> **Warning:**`, or `> **Note:**`.
* **Runnable example** (0-3 per step): a ```` ```c run ```` fence holding a COMPLETE program, optionally followed
  immediately by an ```` ```input ```` fence (stdin) and then an ```` ```output ```` fence (exact expected stdout).
  The `output` fence is required for every `c run` block. Students can open each example in the editor and in the visualizer.
* Plain code that is not a full program (syntax fragments): ```` ```c ```` fence (no `run`). It is not executed.
* **Common mistakes**: a `### Common mistakes` sub-heading followed by a bullet list.
* **Quiz** (1-3 per step): a ```` ```quiz ```` fence:

```quiz
What does this print?
~~~
int a = 7, b = 2;
printf("%d", a / b);
~~~
- [ ] 3.5
- [x] 3
- [ ] 4
- [ ] 3.500000
> Both operands are int, so / does integer division and drops the .5.
```

  First line(s) = question. Optional code between `~~~` lines (a fragment is fine; it is not executed).
  Options are `- [ ]` / `- [x]` (exactly one `[x]`). The `>` line is the explanation.
  Quiz code must be free of undefined behaviour and must not depend on addresses.

## 3. Practice problems

Each problem starts with `# Problem: <title>`, then key: value lines, a blank line, then the statement:

```
# Problem: Sum of first N natural numbers
id: loops-sum-n
difficulty: easy
source: CSE103 Task Sheet - Loops #2

Read a positive integer **N** and print the sum 1 + 2 + ... + N.

**Input:** one integer N (1 ≤ N ≤ 10000).
**Output:** `Sum = S`
```

Then these fences, in this order:

* ```` ```c starter ```` — starter code the student begins from (includes, main, maybe comments `// your code here`).
* ```` ```c solution ```` — a correct, complete, clean reference solution. **No input prompts** (do not print
  "Enter a number:"). Print exactly the specified output format.
* ```` ```test ```` — 2-4 test fences per problem. Format:

```test
=== input
5
=== output
Sum = 15
```

  For problems without input, omit the `=== input` section. The first test is shown to the student as the
  sample. For file-handling problems you may pre-create files: add a `=== file data.txt` section (its content
  follows) before `=== input`.
* ```` ```hint ```` — 1-3 hint fences, from gentle to specific (markdown inside).

Optional key `kind: concept` (for problems that cannot be auto-judged, e.g. "explain"); such problems have
no tests and only a `solution` + explanation in the statement.

## The judge

The student's stdout is compared with the expected output **leniently**: whitespace differences are ignored and
extra text (such as prompts "Enter n:") is allowed, as long as the expected tokens appear in order. Still write
the expected output exactly as the reference solution prints it.

## What the in-browser C interpreter supports (write within this!)

* C99-style C: int/char/short/long/long long (signed/unsigned), float, double, _Bool/bool (stdbool.h),
  arrays (1D, 2D, 3D, variable-length arrays), pointers (incl. pointer to pointer, pointer arithmetic,
  function pointers), structs, unions, enums, typedef, static locals, globals, recursion, goto, switch,
  all operators, casts, sizeof (int=4, long=8, pointer=8, char=1, float=4, double=8).
* Preprocessor: #include (headers are built in), #define (object-like and function-like, # and ##),
  #undef, #ifdef/#ifndef/#if/#elif/#else/#endif, __FILE__ (= "main.c"), __LINE__, __func__.
* Library: stdio (printf, scanf, getchar, putchar, puts, gets, fgets, sprintf, sscanf, fopen/fclose/fprintf/
  fscanf/fgetc/fputc/fgets/fputs/feof/fread/fwrite/fseek/ftell/rewind/remove/rename on a virtual file system),
  string.h (strlen strcpy strncpy strcat strncat strcmp strncmp strchr strrchr strstr memset memcpy memmove
  memcmp, plus strrev strupr strlwr), ctype.h, math.h, stdlib.h (malloc calloc realloc free abs atoi atof
  rand srand exit qsort), time(NULL), limits.h constants.
* NOT supported: multiple source files / custom headers, conio.h (getch, clrscr), designated initializers,
  compound literals, user-defined variadic functions, threads, signals, graphics.h.
* Out-of-bounds array indexing, NULL dereference, use-after-free and division by zero are reported as
  runtime errors (good for teaching) — reference solutions must never do these.
* stdin is given up front; when it runs out, scanf returns EOF (-1) as usual.
* Programs should use `int main(void)` and `return 0;`.
