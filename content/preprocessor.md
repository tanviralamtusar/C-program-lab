---
id: preprocessor
title: Preprocessor & Macros
order: 15
summary: How #include and #define work, macros with arguments and their pitfalls, conditional compilation, header guards, the # and ## operators and predefined macros.
---

# Step: What is the preprocessor? #include

Before the compiler sees your program, a tool called the **preprocessor** goes through the source and handles every line that starts with `#`. It does only **text replacement and selection**: it does not know about types or variables.

```
source code  ->  preprocessor  ->  compiler  ->  executable
(your .c file)   (# lines)         (real C)
```

The directive you already know is `#include`. It pastes the content of another file at that point:

- `#include <stdio.h>`: angle brackets look in the system's standard header folders.
- `#include "mymath.h"`: quotes look first in your own project folder. Use this for your own headers.

Headers contain **declarations** (function prototypes, macros, types) so that the compiler knows how to use library functions.

```c run
#include <stdio.h>
#include <math.h>

int main(void) {
    printf("%.1f\n", sqrt(16.0));
    return 0;
}
```
```output
4.0
```

Without `#include <math.h>` the compiler would not know what `sqrt` is. On this site only single-file programs run, so the headers you can include are the built-in standard ones.

### Common mistakes

- Putting a semicolon after `#include <stdio.h>;`. Directives are not C statements and need no semicolon.
- Using `<>` for your own header, or `""` for a standard header (it works, but is not the convention).
- Writing a `#` directive in the middle of a line. Each directive must be on its own line.

```quiz
What does the preprocessor do?
- [ ] Checks the types of variables
- [x] Handles lines starting with # (include files, replace macros, select code) before compilation
- [ ] Runs the program
- [ ] Converts C code into machine code
> It performs text-level operations on the source; the compiler runs afterwards on the result.
```

# Step: Object-like macros: #define and #undef

`#define NAME replacement` creates a **macro**: wherever the token `NAME` appears afterwards, the preprocessor replaces it with the replacement text. A macro with no parameters is called **object-like**. Macros are used for constants, so a value has a name and is changed in one place only.

```c run
#include <stdio.h>

#define PI 3.14159
#define MAX_SIZE 5
#define GREETING "Hello"

int main(void) {
    int arr[MAX_SIZE];
    int sum = 0;
    double r = 2.0;

    for (int i = 0; i < MAX_SIZE; i++) {
        arr[i] = i * i;
        sum += arr[i];
    }
    printf("Area = %.2f\n", PI * r * r);
    printf("Sum = %d\n", sum);
    printf("%s, C!\n", GREETING);
    return 0;
}
```
```output
Area = 12.57
Sum = 30
Hello, C!
```

By convention macro names are written in `UPPER_CASE`. The replacement is pure text, with **no semicolon** and no type. Replacement does not happen inside string literals: `"PI"` stays the text PI.

`#undef NAME` removes a macro, so that it can be defined again with a new value:

```c run
#include <stdio.h>

#define LIMIT 10

int main(void) {
    printf("%d\n", LIMIT);
#undef LIMIT
#define LIMIT 20
    printf("%d\n", LIMIT);
    return 0;
}
```
```output
10
20
```

### Common mistakes

- Adding `=` or `;`: `#define MAX 10;` makes `int a[MAX];` expand to `int a[10;];` (error).
- Using a macro as a variable and trying to assign to it: `PI = 3;` becomes `3.14159 = 3;`.
- Expecting `#define` to create a real variable. There is no memory for it and the debugger cannot show it.

```quiz
After `#define SIZE 4`, what does `int a[SIZE * 2];` become?
- [ ] int a[8];  (the preprocessor calculates 4*2)
- [x] int a[4 * 2];
- [ ] int a[SIZE * 2];
- [ ] an error
> The preprocessor only substitutes text. The compiler later evaluates `4 * 2`.
```

# Step: Function-like macros and their pitfalls

A macro can take **parameters**, like a function:

```c
#define SQR(x) ((x) * (x))
```

`SQR(5)` is replaced by `((5) * (5))` before compilation, so there is **no function call** at run time. But because macros are text substitution, they have traps. The rule is: **put parentheses around every parameter and around the whole body**.

```c run
#include <stdio.h>

#define SQR_BAD(x) x*x
#define SQR(x) ((x) * (x))

int main(void) {
    int a = 3;
    printf("%d\n", SQR_BAD(a + 1));
    printf("%d\n", SQR(a + 1));
    printf("%d\n", 100 / SQR_BAD(5));
    printf("%d\n", 100 / SQR(5));
    return 0;
}
```
```output
7
16
100
4
```

Why 7? `SQR_BAD(a + 1)` becomes `a + 1*a + 1 = 3 + 3 + 1`. And `100 / SQR_BAD(5)` becomes `100 / 5*5`, which is `(100 / 5) * 5`.

A second trap: a parameter that appears twice in the body is **evaluated twice**, so arguments with side effects such as `i++` run more than once. A real function evaluates its argument once.

```c run
#include <stdio.h>

#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main(void) {
    int i = 5, j = 3;
    int m = MAX(i++, j);       // ((i++) > (j) ? (i++) : (j))
    printf("m=%d i=%d\n", m, i);
    return 0;
}
```
```output
m=6 i=7
```

`i++` ran twice: once in the comparison and once for the result. A function `max(i++, j)` would give `m=5 i=6`. Macros also have no type checking, but they are fast and work for `int`, `double` and anything else.

> **Tip:** If a macro argument has a side effect (`++`, a function call that prints), use a real function instead.

### Common mistakes

- Leaving out parentheses around parameters or around the whole body.
- Putting a space between the macro name and `(`: `#define SQR (x) ...` defines an object-like macro whose text is `(x) ...`.
- Passing arguments like `i++` or `getchar()` to a macro that uses its parameter twice.
- Adding a trailing semicolon in the definition, so that `if (c) MACRO(x); else ...` breaks.

```quiz
Given `#define DOUBLE(x) x + x`, what does `printf("%d", 3 * DOUBLE(2));` print?
- [ ] 12
- [x] 8
- [ ] 10
- [ ] 7
> It expands to `3 * 2 + 2`, which is 6 + 2 = 8. With `((x) + (x))` it would give 12.
```

```quiz
After this code, what is the value of i?
~~~
#define MAX(a, b) ((a) > (b) ? (a) : (b))
int i = 5, j = 3;
int m = MAX(i++, j);
~~~
- [ ] 5
- [ ] 6
- [x] 7
- [ ] 3
> The macro text contains `i++` twice, and both are evaluated (once in the comparison, once as the result). So i goes 5 to 6 to 7, and m is 6.
```

# Step: Conditional compilation

Directives can include or leave out **parts of the source** before it is compiled:

| Directive | Includes the next block if... |
|---|---|
| `#ifdef NAME` | `NAME` is defined |
| `#ifndef NAME` | `NAME` is **not** defined |
| `#if expr` | the constant expression is non-zero |
| `#elif expr` | the previous tests failed and `expr` is non-zero |
| `#else` | none of the earlier tests succeeded |
| `#endif` | closes the block (required) |

In `#if` you can use `defined(NAME)`, comparisons and `&&`, `||`, `!`. Code that is not selected is removed completely; it is not even compiled.

```c run
#include <stdio.h>

#define DEBUG
#define VERSION 2

int main(void) {
#ifdef DEBUG
    printf("[debug] starting\n");
#endif
#ifndef VERBOSE
    printf("not verbose\n");
#endif
#if VERSION == 1
    printf("Version one\n");
#elif VERSION == 2
    printf("Version two\n");
#else
    printf("Other version\n");
#endif
    return 0;
}
```
```output
[debug] starting
not verbose
Version two
```

A classic use is a **debug switch**: define a logging macro that does something in debug builds and nothing otherwise.

```c run
#include <stdio.h>

/* #define DEBUG */      // remove the comment marks to turn logging on

#ifdef DEBUG
#define LOG(msg) printf("LOG: %s\n", msg)
#else
#define LOG(msg)
#endif

int main(void) {
    int a = 3, b = 4;
    LOG("multiplying");
    printf("Result: %d\n", a * b);
    return 0;
}
```
```output
Result: 12
```

With `DEBUG` undefined, `LOG("multiplying");` turns into just `;`. Real projects also use this to select code for different operating systems, or to switch features on and off.

### Common mistakes

- Forgetting `#endif` (the compiler reports an unterminated conditional).
- Using a run-time variable in `#if`: only constants and macros exist at preprocessing time.
- Writing `#ifdef DEBUG == 1`. `#ifdef` only checks whether the name is defined; use `#if DEBUG == 1`.

```quiz
`#define MODE 0` is at the top. Is the block after `#ifdef MODE` included?
- [x] Yes, because MODE is defined (its value does not matter)
- [ ] No, because its value is 0
- [ ] Only if MODE is non-zero
- [ ] Only in debug builds
> `#ifdef` tests whether the name exists. To test the value, use `#if MODE`.
```

# Step: Header guards

A header file can be included **more than once**, perhaps indirectly (`main.c` includes `a.h` and `b.h`, and both include `common.h`). If a header defines a function or struct, the second copy would give a *redefinition error*.

A **header guard** prevents this with the conditional directives you just learned. A typical `mymath.h`:

```c
#ifndef MYMATH_H        // first time: MYMATH_H is not defined yet
#define MYMATH_H        // define it so the next inclusion is skipped

int square(int x);
int cube(int x);

#endif                  // MYMATH_H
```

The first inclusion defines `MYMATH_H` and passes the contents on. Every later inclusion finds `MYMATH_H` defined, so everything up to `#endif` is skipped. Many compilers also accept `#pragma once` as a shorter alternative, but it is not part of standard C.

This site runs one source file, so you cannot put the header in a separate file. The example below imitates it: the same "header" appears twice in one file, exactly as if it were included twice. Without the guard, the program would not compile.

```c run
#include <stdio.h>

/* ---- first "#include mymath.h" ---- */
#ifndef MYMATH_H
#define MYMATH_H
int square(int x) { return x * x; }
#endif

/* ---- second "#include mymath.h": skipped ---- */
#ifndef MYMATH_H
#define MYMATH_H
int square(int x) { return x * x; }
#endif

int main(void) {
    printf("%d\n", square(5));
    return 0;
}
```
```output
25
```

> **Note:** Put only declarations (prototypes, `struct` types, `typedef`, macros) in headers, and definitions of functions in `.c` files. Name the guard after the file: `MYMATH_H`.

### Common mistakes

- Forgetting the guard in a header that defines a `struct` or `typedef`.
- Using the same guard name in two different headers: the second header would be skipped.
- Defining the guard macro but forgetting the closing `#endif`.

```quiz
What is the purpose of a header guard?
- [ ] To hide the header from the user
- [ ] To make the header compile faster
- [x] To stop the contents of a header from being processed twice in one translation unit
- [ ] To declare global variables
> The guard macro is defined the first time, so the later `#ifndef` test fails and the duplicate content is skipped.
```

# Step: The # and ## operators

Inside a function-like macro two special operators are available:

- **`#x` (stringizing)** turns the macro argument into a string literal. `#count` becomes `"count"`.
- **`a ## b` (token pasting)** glues two tokens into one new token. `var ## 1` becomes `var1`.

A common use is a debug-print macro that shows the **expression text** next to its value:

```c run
#include <stdio.h>

#define SHOW(x) printf(#x " = %d\n", x)
#define JOIN(a, b) a##b

int main(void) {
    int count = 7;
    int JOIN(my, Var) = 5;        // declares the variable myVar

    SHOW(count);
    SHOW(count*2);
    printf("%d\n", myVar);
    return 0;
}
```
```output
count = 7
count*2 = 14
5
```

`printf(#x " = %d\n", x)` becomes `printf("count" " = %d\n", count)`. C joins neighbouring string literals into one, so the format is `"count = %d\n"`.

Token pasting can even generate whole functions:

```c run
#include <stdio.h>

#define DEFINE_ADDER(n) int add##n(int x) { return x + n; }

DEFINE_ADDER(5)
DEFINE_ADDER(10)

int main(void) {
    printf("%d %d\n", add5(1), add10(1));
    return 0;
}
```
```output
6 11
```

`DEFINE_ADDER(5)` creates a function called `add5`, and `DEFINE_ADDER(10)` creates `add10`.

### Common mistakes

- Using `#x` outside a macro (it only works on macro parameters).
- Expecting `#x` to print the **value**. It prints the **text** of the argument.
- Using `##` to produce something that is not a valid token.

```quiz
Given `#define NAME(x) #x`, what is `NAME(hello)`?
- [ ] hello (an identifier)
- [x] "hello" (a string literal)
- [ ] The value of a variable named hello
- [ ] An error
> `#x` stringizes its argument: the text becomes a string literal.
```

# Step: Predefined macros: __FILE__, __LINE__, __func__

The compiler provides some ready-made names that describe **where you are** in the source. They are very useful in error messages and logs.

| Name | Value |
|---|---|
| `__FILE__` | the name of the source file as a string (here it is always `"main.c"`) |
| `__LINE__` | the current line number, as an integer (the first line of the file is 1) |
| `__func__` | the name of the current function, as a string |

`__FILE__` and `__LINE__` are replaced by the preprocessor, and `__func__` is provided by the compiler as a variable inside each function.

```c run
#include <stdio.h>

void report(void) {
    printf("In function %s\n", __func__);
}

int main(void) {
    printf("File: %s\n", __FILE__);
    printf("Line: %d\n", __LINE__);
    report();
    printf("Now at line %d\n", __LINE__);
    return 0;
}
```
```output
File: main.c
Line: 9
In function report
Now at line 11
```

Count the lines of the program: the `printf` with `"Line: %d\n"` is on line 9, so that is what `__LINE__` gives. Combine them in a macro to get a **trace** helper. The macro is expanded at the place it is *used*, so the file, line and function belong to the caller:

```c run
#include <stdio.h>
#define TRACE(msg) printf("%s:%d (%s): %s\n", __FILE__, __LINE__, __func__, msg)

void load(void) {
    TRACE("loading");
}

int main(void) {
    TRACE("start");
    load();
    return 0;
}
```
```output
main.c:9 (main): start
main.c:5 (load): loading
```

### Common mistakes

- Using `%s` for `__LINE__` (it is a number, use `%d`).
- Forgetting `__func__` has two underscores on each side, and that it only exists **inside** a function.
- Assuming `__LINE__` stays the same when you add a line above it: it changes with every edit.

```quiz
What does this print if the printf is on line 4 of the file?
~~~
int main(void) {
    int x = 1;
    x++;
    printf("%d", __LINE__);
    return 0;
}
~~~
- [ ] 1
- [ ] 3
- [x] 4
- [ ] The value of x
> `__LINE__` is the line number of the place where it is written.
```

# Problem: Area of a circle with an object-like macro
id: pp-circle-area
difficulty: easy
source: CSE103 Task Sheet - Preprocessor and Macros #1

Define `PI` as an **object-like macro** with the value `3.14159` and use it to compute the area of a circle of radius **r**.

**Input:** a real number r.
**Output:** `Area = A` with A printed to 2 decimals.

```c starter
#include <stdio.h>

// define PI here

int main(void) {
    double r;
    scanf("%lf", &r);
    // print the area
    return 0;
}
```
```c solution
#include <stdio.h>

#define PI 3.14159

int main(void) {
    double r;
    scanf("%lf", &r);
    printf("Area = %.2f\n", PI * r * r);
    return 0;
}
```
```test
=== input
5
=== output
Area = 78.54
```
```test
=== input
1
=== output
Area = 3.14
```
```test
=== input
2.5
=== output
Area = 19.63
```
```test
=== input
10
=== output
Area = 314.16
```
```hint
Put `#define PI 3.14159` before `main`, with no `=` and no semicolon.
```
```hint
Area = `PI * r * r`. Print it with `%.2f`.
```

# Problem: MAX macro and its pitfall
id: pp-max-pitfall
difficulty: medium
source: CSE103 Task Sheet - Preprocessor and Macros #2

Use these two macros exactly as written:

```c
#define BAD_MAX(a, b) a > b ? a : b
#define MAX(a, b) ((a) > (b) ? (a) : (b))
```

Read two integers x and y. Print the value of `MAX(x, y) * 2` and the value of `BAD_MAX(x, y) * 2`. The second one gives a wrong result for some inputs because of the missing parentheses (`BAD_MAX(x, y) * 2` expands to `x > y ? x : y * 2`).

**Input:** two integers x and y.
**Output:**
```
Good: <MAX(x, y) * 2>
Bad: <BAD_MAX(x, y) * 2>
```

```c starter
#include <stdio.h>

#define BAD_MAX(a, b) a > b ? a : b
#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main(void) {
    int x, y;
    scanf("%d %d", &x, &y);
    // print the two lines
    return 0;
}
```
```c solution
#include <stdio.h>

#define BAD_MAX(a, b) a > b ? a : b
#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main(void) {
    int x, y;
    scanf("%d %d", &x, &y);
    printf("Good: %d\n", MAX(x, y) * 2);
    printf("Bad: %d\n", BAD_MAX(x, y) * 2);
    return 0;
}
```
```test
=== input
8 3
=== output
Good: 16
Bad: 8
```
```test
=== input
3 8
=== output
Good: 16
Bad: 16
```
```test
=== input
-4 -9
=== output
Good: -8
Bad: -4
```
```hint
Just call both macros in a `printf` and multiply the result by 2, as in `MAX(x, y) * 2`.
```
```hint
Expand `BAD_MAX(x, y) * 2` by hand: it is `x > y ? x : y * 2`. The `* 2` only applies to `y` in the else part.
```

# Problem: Debug prints with #ifdef DEBUG
id: pp-debug-prints
difficulty: easy
source: CSE103 Task Sheet - Preprocessor and Macros #3

Write a program that reads **n** and computes `1 + 2 + ... + n`. Put `#define DEBUG` at the top. When `DEBUG` is defined, print a debug line after every addition:

`DEBUG: i=<i> sum=<sum so far>`

After the loop print `Sum = <sum>`. The debug print must be inside `#ifdef DEBUG ... #endif`, so removing the define would remove the debug lines.

**Input:** one integer n (1 ≤ n ≤ 100).

```c starter
#include <stdio.h>

// define DEBUG here

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    // loop, debug print, final print
    return 0;
}
```
```c solution
#include <stdio.h>

#define DEBUG

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        sum += i;
#ifdef DEBUG
        printf("DEBUG: i=%d sum=%d\n", i, sum);
#endif
    }
    printf("Sum = %d\n", sum);
    return 0;
}
```
```test
=== input
3
=== output
DEBUG: i=1 sum=1
DEBUG: i=2 sum=3
DEBUG: i=3 sum=6
Sum = 6
```
```test
=== input
1
=== output
DEBUG: i=1 sum=1
Sum = 1
```
```test
=== input
4
=== output
DEBUG: i=1 sum=1
DEBUG: i=2 sum=3
DEBUG: i=3 sum=6
DEBUG: i=4 sum=10
Sum = 10
```
```hint
`#define DEBUG` needs no value. Wrap the debug `printf` in `#ifdef DEBUG` and `#endif`.
```
```hint
The debug line goes inside the loop, right after `sum += i;`.
```

# Problem: Header guards (mymath.h included twice)
id: pp-header-guards
difficulty: medium
kind: concept
source: CSE103 Task Sheet - Preprocessor and Macros #4

Explain how **header guards** let a header such as `mymath.h` be included twice without errors. Show the header and a `main.c` that includes it twice.

Because this site runs a single file, the solution below shows the content of `mymath.h` and `main.c` as two marked parts of one program.

**Explanation.** In a real project there would be two files.

`mymath.h`:
```c
#ifndef MYMATH_H
#define MYMATH_H
int square(int x);        // declarations only
#endif
```
`main.c`:
```c
#include <stdio.h>
#include "mymath.h"
#include "mymath.h"       // second include is harmless
```
The first `#include "mymath.h"` finds `MYMATH_H` undefined, defines it and keeps the contents. The second one finds `MYMATH_H` defined, so the preprocessor skips everything up to `#endif`. Without the guard, the compiler would see the declarations twice, and a `struct` or a function **definition** twice would be an error ("redefinition").

```c starter
#include <stdio.h>

// Part 1: the content of mymath.h (with a guard)

// Part 2: main.c includes it twice

int main(void) {
    return 0;
}
```
```c solution
#include <stdio.h>

/* ===== mymath.h (included the first time) ===== */
#ifndef MYMATH_H
#define MYMATH_H
int square(int x) { return x * x; }
#endif

/* ===== mymath.h (included the second time: skipped) ===== */
#ifndef MYMATH_H
#define MYMATH_H
int square(int x) { return x * x; }
#endif

/* ===== main.c ===== */
int main(void) {
    printf("%d\n", square(6));
    return 0;
}
```
```hint
The guard is three directives around the header content: `#ifndef NAME`, `#define NAME` and `#endif`.
```

# Problem: Replace a function with a macro (SQR)
id: pp-sqr-compare
difficulty: medium
source: CSE103 Task Sheet - Preprocessor and Macros #5

Compare an **inline-style function** with two macro versions:

```c
int sqr(int x) { return x * x; }
#define SQR_BAD(x) x*x
#define SQR(x) ((x) * (x))
```

Read an integer n and print the three results of squaring the expression `n + 1`.

**Input:** one integer n.
**Output:**
```
Function: <sqr(n + 1)>
Bad macro: <SQR_BAD(n + 1)>
Good macro: <SQR(n + 1)>
```

```c starter
#include <stdio.h>

int sqr(int x) { return x * x; }
#define SQR_BAD(x) x*x
#define SQR(x) ((x) * (x))

int main(void) {
    int n;
    scanf("%d", &n);
    // print three lines
    return 0;
}
```
```c solution
#include <stdio.h>

int sqr(int x) { return x * x; }
#define SQR_BAD(x) x*x
#define SQR(x) ((x) * (x))

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Function: %d\n", sqr(n + 1));
    printf("Bad macro: %d\n", SQR_BAD(n + 1));
    printf("Good macro: %d\n", SQR(n + 1));
    return 0;
}
```
```test
=== input
3
=== output
Function: 16
Bad macro: 7
Good macro: 16
```
```test
=== input
5
=== output
Function: 36
Bad macro: 11
Good macro: 36
```
```test
=== input
-1
=== output
Function: 0
Bad macro: -1
Good macro: 0
```
```hint
`SQR_BAD(n + 1)` becomes `n + 1*n + 1`: multiplication happens before addition.
```

# Problem: Stringizing and token pasting
id: pp-stringize-paste
difficulty: medium
source: CSE103 Task Sheet - Preprocessor and Macros #6

Use these macros:

```c
#define SHOW(x) printf(#x " = %d\n", x)
#define VAR(n) var##n
```

Declare two integer variables with `VAR(1)` and `VAR(2)` (they become `var1` and `var2`). Read two integers into them and use `SHOW` to print `var1`, `var2` and `var1+var2`. Write the argument of the last `SHOW` without spaces: `SHOW(var1+var2)`.

**Input:** two integers.
**Output:**
```
var1 = <first>
var2 = <second>
var1+var2 = <sum>
```

```c starter
#include <stdio.h>

#define SHOW(x) printf(#x " = %d\n", x)
#define VAR(n) var##n

int main(void) {
    // declare VAR(1) and VAR(2), read them, use SHOW
    return 0;
}
```
```c solution
#include <stdio.h>

#define SHOW(x) printf(#x " = %d\n", x)
#define VAR(n) var##n

int main(void) {
    int VAR(1), VAR(2);
    scanf("%d %d", &var1, &var2);
    SHOW(var1);
    SHOW(var2);
    SHOW(var1+var2);
    return 0;
}
```
```test
=== input
10 20
=== output
var1 = 10
var2 = 20
var1+var2 = 30
```
```test
=== input
-3 8
=== output
var1 = -3
var2 = 8
var1+var2 = 5
```
```hint
`int VAR(1), VAR(2);` expands to `int var1, var2;`. After that you can use `var1` and `var2` directly.
```
```hint
`SHOW(var1+var2)` is turned into `printf("var1+var2" " = %d\n", var1+var2)`.
```

# Problem: File, function and line with predefined macros
id: pp-predefined
difficulty: easy
source: CSE103 Task Sheet - Preprocessor and Macros #7

Write a program with a function `helper` and `main`. It must print, in this order:

```
File: main.c
Function: main
Function: helper
Line difference: 1
```

- `File:` is printed with `__FILE__` (on this site it is always `main.c`).
- `Function: main` is printed from `main` using `__func__`; `Function: helper` is printed by `helper()` using `__func__`.
- For the last line, declare `int first = __LINE__;` and, on the **very next line**, `int second = __LINE__;`, then print `second - first`.

```c starter
#include <stdio.h>

void helper(void) {
    // print the function name
}

int main(void) {
    // print file, function, call helper, line difference
    return 0;
}
```
```c solution
#include <stdio.h>

void helper(void) {
    printf("Function: %s\n", __func__);
}

int main(void) {
    printf("File: %s\n", __FILE__);
    printf("Function: %s\n", __func__);
    helper();
    int first = __LINE__;
    int second = __LINE__;
    printf("Line difference: %d\n", second - first);
    return 0;
}
```
```test
=== output
File: main.c
Function: main
Function: helper
Line difference: 1
```
```hint
`__FILE__` and `__func__` are strings, so use `%s`. `__LINE__` is an int, so use `%d`.
```
```hint
The two `__LINE__` declarations must be on consecutive lines, otherwise the difference will not be 1.
```

# Problem: Choose code with #if / #elif / #else
id: pp-version-switch
difficulty: easy
source: CSE103 Task Sheet - Preprocessor and Macros #8

Define `#define VERSION 2` and use `#if / #elif / #else` to compile **one** of three code paths. Read an integer x and print:

- version 1: `Basic: x`
- version 2: `Standard: 2x` (x doubled)
- any other version: `Advanced: 3x` (x tripled)

Keep `VERSION` equal to 2 in your submission.

**Input:** one integer x.
**Output:** for version 2, `Standard: <2 * x>`.

```c starter
#include <stdio.h>

#define VERSION 2

int main(void) {
    int x;
    scanf("%d", &x);
    // choose the code path with #if / #elif / #else
    return 0;
}
```
```c solution
#include <stdio.h>

#define VERSION 2

int main(void) {
    int x;
    scanf("%d", &x);
#if VERSION == 1
    printf("Basic: %d\n", x);
#elif VERSION == 2
    printf("Standard: %d\n", 2 * x);
#else
    printf("Advanced: %d\n", 3 * x);
#endif
    return 0;
}
```
```test
=== input
5
=== output
Standard: 10
```
```test
=== input
0
=== output
Standard: 0
```
```test
=== input
-7
=== output
Standard: -14
```
```hint
Structure: `#if VERSION == 1 ... #elif VERSION == 2 ... #else ... #endif`, each branch containing one `printf`.
```
```hint
Only the branch selected by the preprocessor is compiled. Change VERSION to 3 to try the last branch, then put it back to 2.
```

# Problem: Generic SWAP macro
id: pp-swap-macro
difficulty: medium
source: Aptech-style extra: macros with a type parameter

A function swaps only one type, but a macro can take the **type** as a parameter. Use:

```c
#define SWAP(type, a, b) do { type tmp = a; a = b; b = tmp; } while (0)
```

Read two ints x, y and two doubles p, q. Swap each pair with `SWAP` and print the results.

**Input:** `x y p q` on one line (p and q have one decimal).
**Output:**
```
x=<x> y=<y>
p=<p> q=<q>
```
with p and q printed with 1 decimal, after swapping.

```c starter
#include <stdio.h>

#define SWAP(type, a, b) do { type tmp = a; a = b; b = tmp; } while (0)

int main(void) {
    int x, y;
    double p, q;
    scanf("%d %d %lf %lf", &x, &y, &p, &q);
    // swap both pairs and print
    return 0;
}
```
```c solution
#include <stdio.h>

#define SWAP(type, a, b) do { type tmp = a; a = b; b = tmp; } while (0)

int main(void) {
    int x, y;
    double p, q;
    scanf("%d %d %lf %lf", &x, &y, &p, &q);
    SWAP(int, x, y);
    SWAP(double, p, q);
    printf("x=%d y=%d\n", x, y);
    printf("p=%.1f q=%.1f\n", p, q);
    return 0;
}
```
```test
=== input
3 8 1.5 2.5
=== output
x=8 y=3
p=2.5 q=1.5
```
```test
=== input
-1 0 0.5 9.5
=== output
x=0 y=-1
p=9.5 q=0.5
```
```hint
The first argument is the type: `SWAP(int, x, y);` and `SWAP(double, p, q);`.
```
```hint
The `do { ... } while (0)` wrapper makes the multi-statement macro behave like a single statement, so the semicolon after it works everywhere (even in `if ... else`).
```

# Problem: Array length macro
id: pp-array-len
difficulty: medium
source: Aptech-style extra: function-like macros

Define two macros:

```c
#define LEN(a) (sizeof(a) / sizeof((a)[0]))
#define MAX(a, b) ((a) > (b) ? (a) : (b))
```

Read 5 integers into an array `arr[5]`. Use `LEN(arr)` as the loop limit and `MAX` to find the largest value. Print the length and the maximum.

**Input:** 5 integers.
**Output:**
```
Length = 5
Max = <largest>
```

```c starter
#include <stdio.h>

#define LEN(a) (sizeof(a) / sizeof((a)[0]))
#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main(void) {
    int arr[5];
    // read with LEN(arr), find the max with MAX
    return 0;
}
```
```c solution
#include <stdio.h>

#define LEN(a) (sizeof(a) / sizeof((a)[0]))
#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main(void) {
    int arr[5];
    int n = (int)LEN(arr);
    int best;

    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    best = arr[0];
    for (int i = 1; i < n; i++) {
        best = MAX(best, arr[i]);
    }
    printf("Length = %d\n", n);
    printf("Max = %d\n", best);
    return 0;
}
```
```test
=== input
3 9 2 7 5
=== output
Length = 5
Max = 9
```
```test
=== input
-5 -2 -9 -1 -7
=== output
Length = 5
Max = -1
```
```hint
`LEN(arr)` is the total size of the array divided by the size of one element, so it is 5 here. Cast it to `int` for `%d`.
```
```hint
Start with `best = arr[0]` and update it with `best = MAX(best, arr[i]);`.
```
