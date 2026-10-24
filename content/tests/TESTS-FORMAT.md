# Mock test file format (content/tests/<id>.md)

A mock test is a timed exam-style set: short **questions** (trace the output, find the bug, concept checks)
plus **coding problems** that are auto-judged. Read `content/FORMAT.md` first. Everything there about
problems (`# Problem:`, keys, `c starter` / `c solution` / `test` / `hint` fences, the judge, the supported
C subset) applies here unchanged.

## Front matter

```
---
id: ct1
title: Class Test 1
order: 1
duration: 40
covers: Basics, operators, decision making
summary: One sentence describing the test.
---
```

`duration` is in minutes.

## Questions

```
# Question: Integer division trap
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a = 7, b = 2;
    printf("%d %d", a / b, a % b);
    return 0;
}
~~~
- [ ] 3.5 1
- [x] 3 1
- [ ] 3 0
- [ ] 4 1
> 7/2 is integer division (3) and 7%2 is the remainder (1).
```
```

* Use ```` ```quiz run ```` when the code between `~~~` is a **complete program** and the correct option is
  **exactly its output** (whitespace is compared loosely, so a multi-line output is written on one line
  with single spaces). The build runs the program and checks that the `[x]` option matches the output.
  Use plain ```` ```quiz ```` for find-the-bug, concept and fragment questions; these are not executed.
* Every question has `marks:` (usually 1-3).

## Problems

These are the same as in FORMAT.md, plus a `marks:` key (usually 5-15), placed after `difficulty:`/`source:`.
Use `source: Original (mock test)`. Every problem must be **new**: check `content/tests/EXISTING-PROBLEMS.md`
and do not repeat any of those tasks, even reworded. Give 3-4 tests with edge cases.
