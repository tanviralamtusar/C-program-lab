---
id: topic-preprocessor
title: "Topic Test: Preprocessor & Macros"
group: topic
lesson: preprocessor
order: 115
duration: 25
covers: #define and #undef, function-like macros and parentheses, side effects, conditional compilation, # and ##, header guards
summary: A short test on the preprocessor with six trace-and-debug questions and two coding problems that use function-like macros.
---

# Question: Missing parentheses
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

#define SQ(x) x * x

int main(void) {
    printf("%d %d", SQ(2 + 3), 100 / SQ(5));
    return 0;
}
~~~
- [ ] 25 4
- [ ] 25 100
- [ ] 11 4
- [x] 11 100
> The preprocessor only replaces text. SQ(2 + 3) becomes 2 + 3 * 2 + 3 = 11, and 100 / SQ(5) becomes 100 / 5 * 5 = 100. Writing `((x) * (x))` would give 25 and 4.
```

# Question: Side effects in a macro argument
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main(void) {
    int i = 5, j = 3;
    int m = MAX(i++, j);
    printf("%d %d", m, i);
    return 0;
}
~~~
- [ ] 5 6
- [ ] 6 6
- [x] 6 7
- [ ] 5 7
> The macro pastes the argument text twice: ((i++) > (j) ? (i++) : (j)). The test i++ > j is true and makes i 6, then the true branch i++ gives 6 and makes i 7. A real function would evaluate the argument only once.
```

# Question: Conditional compilation and #undef
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

#define LEVEL 2

int main(void) {
#if LEVEL >= 3
    printf("high ");
#elif LEVEL == 2
    printf("mid ");
#else
    printf("low ");
#endif
#ifdef FAST
    printf("fast");
#else
    printf("slow");
#endif
#undef LEVEL
#ifndef LEVEL
    printf(" none");
#endif
    return 0;
}
~~~
- [ ] high slow none
- [ ] mid fast none
- [x] mid slow none
- [ ] mid slow
> LEVEL is 2, so only the #elif branch stays. FAST was never defined, so the #else branch ("slow") is kept. After #undef LEVEL the name is no longer defined, so #ifndef LEVEL is true and " none" is printed. The discarded branches are not even compiled.
```

# Question: The # and ## operators
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

#define SHOW(x) printf(#x " = %d\n", x)
#define VAR(n) v##n

int main(void) {
    int a = 2, b = 3;
    int v1 = 10, v2 = 20;
    SHOW(a+b);
    printf("%d\n", VAR(2));
    return 0;
}
~~~
- [ ] 5 = 5 20
- [ ] a+b = 5 v2
- [x] a+b = 5 20
- [ ] a+b = 5 10
> `#x` turns the argument text into the string "a+b", so the first line is `a+b = 5`. `v##n` glues the tokens v and 2 into the single name v2, which is the variable holding 20.
```

# Question: Find the bug: semicolon in a macro
marks: 2

```quiz
Why does this code fail to compile?
~~~
#define SIZE 10;

int main(void) {
    int a[SIZE];
    return 0;
}
~~~
- [ ] A macro name must be written in lowercase.
- [ ] #define must be placed inside main.
- [x] The replacement text includes the semicolon, so the line becomes int a[10;]; which is a syntax error.
- [ ] Arrays cannot have a size that comes from a macro.
> A macro replaces its name with everything after it on the line, including a trailing `;` (and an `=` if you wrote one). Write `#define SIZE 10` with nothing extra.
```

# Question: Header guards
marks: 2

```quiz
A header file point.h contains only `struct Point { int x, y; };` with no header guard. A program includes it twice, directly and again through another header. What happens?
~~~
#include "point.h"
#include "shapes.h"   /* shapes.h also contains #include "point.h" */
~~~
- [ ] Nothing, the compiler ignores the second copy automatically.
- [ ] The program runs, but the structure uses double the memory.
- [x] The compiler reports a redefinition of struct Point, because the same declaration is pasted in twice.
- [ ] The linker removes one copy before the program is built.
> #include copies the file text. Two copies of the struct declaration conflict. Wrap the header in `#ifndef POINT_H`, `#define POINT_H`, ..., `#endif` so the second inclusion is skipped.
```

# Problem: Range and cube macros
id: topic-preprocessor-range-cube
difficulty: easy
marks: 6
source: Original (topic test)

Define these three function-like macros (use enough parentheses so they work for any expression):

- `ABS(x)` is the absolute value of x,
- `IN_RANGE(x, lo, hi)` is true when `lo <= x <= hi`,
- `CUBE(x)` is x * x * x.

Read **n** integers. Using the macros, count the numbers whose **absolute value** lies between 10 and 50 (inclusive) and add up the **cubes** of those numbers.

**Input:** n (1 ≤ n ≤ 20), then n integers (each between -100 and 100).
**Output:** two lines: `Count = C` and `Sum of cubes = S`.

```c starter
#include <stdio.h>

// define ABS, IN_RANGE and CUBE here

int main(void) {
    int n, i, v, count = 0, sum = 0;
    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &v);
        // use the macros
    }
    printf("Count = %d\n", count);
    printf("Sum of cubes = %d\n", sum);
    return 0;
}
```

```c solution
#include <stdio.h>

#define ABS(x) ((x) < 0 ? -(x) : (x))
#define IN_RANGE(x, lo, hi) ((x) >= (lo) && (x) <= (hi))
#define CUBE(x) ((x) * (x) * (x))

int main(void) {
    int n, i, v, count = 0, sum = 0;
    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &v);
        if (IN_RANGE(ABS(v), 10, 50)) {
            count++;
            sum += CUBE(v);
        }
    }
    printf("Count = %d\n", count);
    printf("Sum of cubes = %d\n", sum);
    return 0;
}
```

```test
=== input
6
5 -12 30 60 -50 10
=== output
Count = 4
Sum of cubes = -98728
```

```test
=== input
3
1 2 3
=== output
Count = 0
Sum of cubes = 0
```

```test
=== input
1
-10
=== output
Count = 1
Sum of cubes = -1000
```

```test
=== input
5
50 -51 51 49 -9
=== output
Count = 2
Sum of cubes = 242649
```

```hint
Wrap every use of a parameter in parentheses: `#define CUBE(x) ((x) * (x) * (x))`, and put parentheses around the whole replacement text too.
```

```hint
Macros can be nested: `IN_RANGE(ABS(v), 10, 50)` works because `ABS(v)` is replaced first and the extra parentheses keep it in one piece. No semicolon after a macro definition.
```

# Problem: Sort three with a macro
id: topic-preprocessor-sort-three
difficulty: medium
marks: 8
source: Original (topic test)

Read three integers into variables named `a`, `b` and `c`, and a flag `d`. Sort them with the help of macros: ascending if `d` is 0, descending otherwise.

Define:

- `SORT2(x, y)` swaps x and y when `x > y` (use a temporary variable inside). It must be written as a **statement macro** with `do { ... } while (0)` so that it can be the only statement of an `if` branch followed by `else`.
- `PRINT_VAR(v)` prints a variable as `name = value`, using the stringizing operator `#`, so `PRINT_VAR(a)` prints `a = 3`.
- `ABS(x)` is the absolute value of x.

Sort with three steps for ascending order: `SORT2(a, b); SORT2(b, c); SORT2(a, b);`. For descending order use the same steps with the arguments swapped (`SORT2(b, a); SORT2(c, b); SORT2(b, a);`). Choose between the two with `if (d == 0) SORT2(...); else SORT2(...);`.

Print the three variables with `PRINT_VAR`, then `Range = R` where R is `ABS(a - c)`.

**Input:** four integers: a b c d.
**Output:** four lines: `a = ...`, `b = ...`, `c = ...`, `Range = R`.

```c starter
#include <stdio.h>

// define SORT2, PRINT_VAR and ABS here

int main(void) {
    int a, b, c, d;
    scanf("%d %d %d %d", &a, &b, &c, &d);
    // sort with the macros, print with PRINT_VAR
    return 0;
}
```

```c solution
#include <stdio.h>

#define SORT2(x, y) do { if ((x) > (y)) { int t = (x); (x) = (y); (y) = t; } } while (0)
#define PRINT_VAR(v) printf(#v " = %d\n", v)
#define ABS(x) ((x) < 0 ? -(x) : (x))

int main(void) {
    int a, b, c, d;
    scanf("%d %d %d %d", &a, &b, &c, &d);

    if (d == 0) SORT2(a, b); else SORT2(b, a);
    if (d == 0) SORT2(b, c); else SORT2(c, b);
    if (d == 0) SORT2(a, b); else SORT2(b, a);

    PRINT_VAR(a);
    PRINT_VAR(b);
    PRINT_VAR(c);
    printf("Range = %d\n", ABS(a - c));
    return 0;
}
```

```test
=== input
5 -2 9 0
=== output
a = -2
b = 5
c = 9
Range = 11
```

```test
=== input
5 -2 9 1
=== output
a = 9
b = 5
c = -2
Range = 11
```

```test
=== input
4 4 4 0
=== output
a = 4
b = 4
c = 4
Range = 0
```

```test
=== input
-7 -3 -10 1
=== output
a = -3
b = -7
c = -10
Range = 7
```

```hint
`#define SORT2(x, y) do { if ((x) > (y)) { int t = (x); (x) = (y); (y) = t; } } while (0)`. The do-while(0) turns the block into one statement, so a semicolon after it and a following `else` are legal.
```

```hint
`#define PRINT_VAR(v) printf(#v " = %d\n", v)`: the `#v` becomes the string "a", which the compiler joins with the next string literal. Descending order is the same sort with the arguments swapped.
```
