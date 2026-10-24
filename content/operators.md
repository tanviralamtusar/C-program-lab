---
id: operators
title: "Operators & Expressions"
order: 2
summary: Arithmetic, assignment, increment/decrement, relational, logical, bitwise and conditional operators, precedence, and type conversion.
---

# Step: Arithmetic operators and integer division

An **operator** is a symbol that does an operation; the values it works on are called **operands**. The arithmetic operators are:

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `+` | Addition | `10 + 24` | 34 |
| `-` | Subtraction | `10 - 24` | -14 |
| `*` | Multiplication | `10 * 24` | 240 |
| `/` | Division | `24 / 12` | 2 |
| `%` | Remainder (modulus) | `24 % 20` | 4 |

```c run
#include <stdio.h>

int main(void) {
    int a = 9, b = 4, c;

    c = a + b;
    printf("a+b = %d\n", c);
    c = a - b;
    printf("a-b = %d\n", c);
    c = a * b;
    printf("a*b = %d\n", c);
    c = a / b;
    printf("a/b = %d\n", c);
    c = a % b;
    printf("a%%b = %d\n", c);
    return 0;
}
```
```output
a+b = 13
a-b = 5
a*b = 36
a/b = 2
a%b = 1
```

Notice `9 / 4` is `2`, not `2.25`. **When both operands of `/` are integers, the result is an integer and the fractional part is thrown away** (truncated, not rounded). `%` gives the remainder and works only on integers. To get a decimal result, make at least one operand a decimal: `9 / 4.0` is `2.25`.

Assigning to a `float` does not save you, because the division happens first:

```c run
#include <stdio.h>

int main(void) {
    int i = 2, j = 3, k, l;
    float a, b;

    k = i / j * j;   /* 2/3 = 0, then 0*3 = 0 */
    l = j / i * i;   /* 3/2 = 1, then 1*2 = 2 */
    a = i / j * j;   /* still integer maths: 0 */
    b = j / i * i;   /* 1*2 = 2 */

    printf("%d %d %f %f\n", k, l, a, b);
    return 0;
}
```
```output
0 2 0.000000 2.000000
```

The pair `%` and `/` is the key tool for taking a number apart: `n % 10` is the last digit and `n / 10` removes it. With negative numbers C truncates toward zero, so `-7 / 2` is `-3` and `-7 % 2` is `-1`.

### Operators by number of operands

- **Unary** (1 operand): `-x`, `++a`, `!x`, `~a`, `sizeof(int)`.
- **Binary** (2 operands): `a - b`, `x * y`, `a & b`.
- **Ternary** (3 operands): only one exists, `? :` (see later).

An **expression** is any combination of values, variables and operators, such as `a * b + 2`.

### Common mistakes

- Expecting `7 / 2` to be 3.5 (it is 3) or `1 / 2` to be 0.5 (it is 0).
- Using `%` on a `float` or `double` (a compile error).
- Dividing by zero: an integer division by zero crashes the program.
- Mixing up unary minus (`-x`) and binary minus (`a - b`).

```quiz
What does this print?
~~~
printf("%d %d", 17 / 5, 17 % 5);
~~~
- [x] 3 2
- [ ] 3.4 2
- [ ] 4 2
- [ ] 2 3
> 17 = 3 * 5 + 2, so the quotient is 3 and the remainder is 2.
```

```quiz
What does `printf("%.1f", 9 / 2 * 1.0);` print?
- [ ] 4.5
- [x] 4.0
- [ ] 5.0
- [ ] 4
> 9 / 2 is integer division (4). Only then is it multiplied by 1.0, giving 4.0.
```

```quiz
What does `printf("%d", -7 / 2);` print?
- [ ] -4
- [x] -3
- [ ] -3.5
- [ ] 3
> Integer division truncates toward zero.
```

# Step: Assignment and compound assignment

`=` stores the value of the right side in the variable on the left: `variable = expression;`. The whole right side is calculated first. **Compound assignment** is a shorthand for "operate, then store back":

| Shorthand | Same as |
|---|---|
| `x += y` | `x = x + y` |
| `x -= y` | `x = x - y` |
| `x *= y` | `x = x * y` |
| `x /= y` | `x = x / y` |
| `x %= y` | `x = x % y` |

```c run
#include <stdio.h>

int main(void) {
    int c = 9;

    c += 7;   /* 16 */
    printf("After c += 7: %d\n", c);

    c -= 15;  /* 1 */
    printf("After c -= 15: %d\n", c);

    c *= 90;  /* 90 */
    printf("After c *= 90: %d\n", c);

    c /= 90;  /* 1 */
    printf("After c /= 90: %d\n", c);

    c += 9;   /* 10 */
    c %= 6;   /* 4 */
    printf("After c %%= 6: %d\n", c);
    return 0;
}
```
```output
After c += 7: 16
After c -= 15: 1
After c *= 90: 90
After c /= 90: 1
After c %= 6: 4
```

Because the right side is evaluated first, `y *= x + 10;` means `y = y * (x + 10);`:

```c run
#include <stdio.h>

int main(void) {
    int x = 5, y = 2;
    y *= x + 10;
    printf("%d\n", y);
    return 0;
}
```
```output
30
```

> **Tip:** Remember `=` assigns, while `==` compares.

### Common mistakes

- Writing `x =+ 5` (that is `x = +5`) instead of `x += 5`.
- Reading `y *= x + 10` as `(y * x) + 10`.
- Using `=` instead of `==` in a comparison.
- Using `/=` on an `int` and expecting decimals.

```quiz
What is x after this code?
~~~
int x = 10;
x -= 3;
x *= 2;
x /= 4;
~~~
- [x] 3
- [ ] 3.5
- [ ] 7
- [ ] 5
> 10 becomes 7, then 14, then 14 / 4 = 3 (integer division).
```

```quiz
What is a after this code?
~~~
int a = 2, b = 3;
a *= b + 1;
~~~
- [ ] 7
- [x] 8
- [ ] 6
- [ ] 9
> a = 2 * (3 + 1) = 8.
```

# Step: Increment and decrement

`++` adds 1 and `--` subtracts 1. Each has two forms:

| Form | Operator | Meaning |
|---|---|---|
| Pre-increment | `++a` | change first, then use the new value |
| Post-increment | `a++` | use the current value first, then change |
| Pre-decrement | `--a` | decrement first, then use |
| Post-decrement | `a--` | use first, then decrement |

On their own (`a++;` and `++a;`) they do the same thing. Inside a larger expression they differ.

```c run
#include <stdio.h>

int main(void) {
    int x = 2;
    printf("%d\n", x);
    printf("%d\n", ++x);
    printf("%d\n", x);
    printf("%d\n", --x);
    printf("%d\n", x);

    x = 2;
    printf("--\n");
    printf("%d\n", x);
    printf("%d\n", x++);
    printf("%d\n", x);
    printf("%d\n", x--);
    printf("%d\n", x);
    return 0;
}
```
```output
2
3
3
2
2
--
2
2
3
3
2
```

Here `y = x++;` gives `y` the **old** value, while `y = ++x;` gives the **new** value:

```c run
#include <stdio.h>

int main(void) {
    int x, y;
    x = 2;

    y = x++;
    printf("x and y: %d & %d\n", x, y);

    y = ++x;
    printf("x and y: %d & %d\n", x, y);

    y = x--;
    printf("x and y: %d & %d\n", x, y);

    y = --x;
    printf("x and y: %d & %d\n", x, y);
    return 0;
}
```
```output
x and y: 3 & 2
x and y: 4 & 4
x and y: 3 & 4
x and y: 2 & 2
```

Used inside a bigger expression, the old value is used first and the variable changes afterwards:

```c run
#include <stdio.h>

int main(void) {
    int i = 5, j;
    j = i++ + 2;
    printf("%d %d\n", i, j);
    j = ++i + 2;
    printf("%d %d\n", i, j);
    return 0;
}
```
```output
6 7
7 9
```

> **Warning:** Never change the same variable more than once in one expression. Things like `a++ + ++a`, `i = i++` or `printf("%d %d", i, i++)` are **undefined behaviour**: the C standard allows any result, so different compilers print different answers. Keep each increment in its own statement.

### Common mistakes

- Using `y = x++` and expecting the new value (you get the old one).
- Writing `x-` instead of `x--`.
- Writing expressions that modify one variable twice.
- Using `++x` versus `x++` as if it only changes the order of printing.

```quiz
What does this print?
~~~
int a = 5;
int b = a++;
printf("%d %d", a, b);
~~~
- [ ] 5 5
- [ ] 6 6
- [x] 6 5
- [ ] 5 6
> b gets the old value 5, then a becomes 6.
```

```quiz
What does this print?
~~~
int a = 5;
int b = ++a * 2;
printf("%d %d", a, b);
~~~
- [x] 6 12
- [ ] 5 10
- [ ] 6 10
- [ ] 5 12
> ++a makes a equal to 6 first, then 6 * 2 = 12.
```

```quiz
What does this print?
~~~
int i = 3;
i++;
printf("%d ", i++);
printf("%d", i);
~~~
- [ ] 3 4
- [ ] 4 4
- [x] 4 5
- [ ] 5 5
> After i++, i is 4. The first printf prints 4 and then i becomes 5, so the last printf prints 5.
```

# Step: Relational and logical operators

**Relational** operators compare two values. The result is `1` (true) or `0` (false).

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `<` | less than | `5 < 3` | 0 |
| `>` | greater than | `5 > 3` | 1 |
| `<=` | less than or equal | `5 <= 2` | 0 |
| `>=` | greater than or equal | `5 >= 2` | 1 |
| `==` | equal to | `5 == 2` | 0 |
| `!=` | not equal to | `5 != 2` | 1 |

**Logical** operators combine conditions: `&&` (AND: true only if both are true), `||` (OR: true if at least one is true) and `!` (NOT: flips true and false). In C, `0` is false and **any non-zero value is true**.

`&&` and `||` use **short-circuit evaluation**: if the left side already decides the answer, the right side is not evaluated at all.

```c run
#include <stdio.h>

int main(void) {
    int a = 5, b = 3;
    int c = 0;
    int r;

    printf("%d\n", a > b);
    printf("%d\n", a == b);
    printf("%d\n", a != b);
    printf("%d\n", a > b && b > 10);
    printf("%d\n", a > b || b > 10);
    printf("%d\n", !(a > b));

    r = (a < b) && (++c);   /* a < b is 0, so ++c never runs */
    printf("%d %d\n", r, c);
    return 0;
}
```
```output
1
0
1
0
1
0
0 0
```

A very common use is checking a range:

```c run
#include <stdio.h>

int main(void) {
    int x = 15;
    printf("%d\n", x >= 10 && x <= 20);
    printf("%d\n", x < 10 || x > 20);
    return 0;
}
```
```output
1
0
```

### Common mistakes

- Writing `a = b` (assignment) when you meant `a == b`.
- Writing `1 < x < 10` for "x between 1 and 10". Write `x > 1 && x < 10`. (`3 > 2 > 1` is `(3 > 2) > 1`, which is `1 > 1`, false.)
- Using `&` or `|` (bitwise) instead of `&&` or `||`.
- Comparing decimal numbers with `==`: tiny rounding errors can make it false.

```quiz
What does `printf("%d", 5 > 3 && 2 > 4);` print?
- [ ] 1
- [x] 0
- [ ] true
- [ ] 2
> The second condition is false, so AND gives 0.
```

```quiz
What does `printf("%d", !0 + !5);` print?
- [ ] 0
- [x] 1
- [ ] 2
- [ ] 5
> !0 is 1 and !5 is 0, and 1 + 0 = 1.
```

```quiz
What does `printf("%d", 3 > 2 > 1);` print?
- [ ] 1
- [x] 0
- [ ] 3
- [ ] A compile error
> (3 > 2) is 1, and then 1 > 1 is 0.
```

# Step: Bitwise operators

Bitwise operators work on the individual bits of integers (they do not work on `float` or `double`). Take `a = 12` (binary `1100`) and `b = 10` (binary `1010`):

| Operator | Name | Rule per bit |
|---|---|---|
| `&` | AND | 1 only if both bits are 1 |
| `\|` | OR | 1 if at least one bit is 1 |
| `^` | XOR | 1 if the bits are different |
| `~` | NOT | flips every bit |
| `<<` | left shift | `x << n` is `x * 2^n` |
| `>>` | right shift | `x >> n` is `x / 2^n` (for positive x) |

```c run
#include <stdio.h>

int main(void) {
    int a = 12, b = 10;
    printf("a & b  = %d\n", a & b);
    printf("a | b  = %d\n", a | b);
    printf("a ^ b  = %d\n", a ^ b);
    printf("~a     = %d\n", ~a);
    printf("a << 1 = %d\n", a << 1);
    printf("a >> 1 = %d\n", a >> 1);
    return 0;
}
```
```output
a & b  = 8
a | b  = 14
a ^ b  = 6
~a     = -13
a << 1 = 24
a >> 1 = 6
```

Trace: `1100 & 1010 = 1000` (8), `1100 | 1010 = 1110` (14), `1100 ^ 1010 = 0110` (6). And `~a` is `-(a + 1)`, so `~12` is `-13`.

Useful tricks: `n & 1` is 1 for odd numbers, and `n & 8` tells whether the bit with value 8 is on.

```c run
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    if (n & 8) printf("SET\n");
    else printf("NOT SET\n");
    return 0;
}
```
```input
12
```
```output
SET
```

XOR can even swap two numbers without a temporary variable (`x ^ x` is 0, and `x ^ 0` is `x`):

```c run
#include <stdio.h>

int main(void) {
    int a = 3, b = 7;
    a = a ^ b;
    b = a ^ b;
    a = a ^ b;
    printf("a = %d, b = %d\n", a, b);
    return 0;
}
```
```output
a = 7, b = 3
```

### Common mistakes

- Using `&` or `|` where `&&` or `||` is meant: `1 & 2` is 0 but `1 && 2` is 1.
- Applying bitwise operators to `float` or `double`.
- Forgetting that `~` flips all bits, including the sign bit.
- Right-shifting negative numbers (the result depends on the compiler).

```quiz
What does `printf("%d", 6 & 3);` print?
- [x] 2
- [ ] 7
- [ ] 5
- [ ] 9
> 110 & 011 = 010, which is 2.
```

```quiz
What does `printf("%d", 6 ^ 3);` print?
- [ ] 2
- [ ] 7
- [x] 5
- [ ] 3
> 110 ^ 011 = 101, which is 5.
```

```quiz
What is the value of `int a = 4 ^ 4;`?
- [x] 0
- [ ] 8
- [ ] 16
- [ ] 44
> In C, ^ is bitwise XOR, not "power". Equal bits give 0, so 4 ^ 4 is 0.
```

# Step: The conditional (ternary) operator

`condition ? value_if_true : value_if_false` is the only operator with three operands. It checks the condition and gives one of the two values. It is a short form of a simple `if-else`.

```c run
#include <stdio.h>

int main(void) {
    int a = 10, b = 20;
    int max;
    max = (a > b) ? a : b;
    printf("Maximum is: %d\n", max);
    return 0;
}
```
```output
Maximum is: 20
```

It also works inside `printf`:

```c run
#include <stdio.h>

int main(void) {
    int n = 7;
    printf("%d is %s\n", n, (n % 2 == 0) ? "even" : "odd");
    return 0;
}
```
```output
7 is odd
```

> **Tip:** Use `? :` for short one-line choices. For anything longer, a normal `if-else` is easier to read.

### Common mistakes

- Forgetting the `:` part: both branches are required.
- Writing long, nested ternaries nobody can read.
- Using `=` instead of `==` in the condition.
- Choosing branches of unrelated types (such as a string and an int).

```quiz
What does this print?
~~~
int a = 4, b = 9;
printf("%d", a > b ? a : b);
~~~
- [ ] 4
- [x] 9
- [ ] 1
- [ ] 0
> a > b is false, so the second choice b (9) is used.
```

```quiz
What does this print?
~~~
int x = 5;
printf("%d", x > 3 ? (x > 4 ? 1 : 2) : 3);
~~~
- [x] 1
- [ ] 2
- [ ] 3
- [ ] 5
> x > 3 is true, then x > 4 is true, giving 1.
```

# Step: Precedence and associativity

**Precedence** decides which operator is applied first (just like multiplication before addition in maths). **Associativity** decides the order when operators of the same precedence meet. Parentheses always win.

| Level | Operators | Associativity |
|---|---|---|
| 1 | `()` `[]` | left to right |
| 2 | `!` `~` `++` `--` unary `+` `-` `sizeof` `(type)` | right to left |
| 3 | `*` `/` `%` | left to right |
| 4 | `+` `-` | left to right |
| 5 | `<<` `>>` | left to right |
| 6 | `<` `<=` `>` `>=` | left to right |
| 7 | `==` `!=` | left to right |
| 8 | `&` | left to right |
| 9 | `^` | left to right |
| 10 | `\|` | left to right |
| 11 | `&&` | left to right |
| 12 | `\|\|` | left to right |
| 13 | `? :` | right to left |
| 14 | `=` `+=` `-=` `*=` `/=` `%=` | right to left |

Work through a mixed expression: first `* / %` from left to right, then `+ -` from left to right.

```c run
#include <stdio.h>

int main(void) {
    int i = 2 * 3 / 4 + 4 / 4 + 8 - 2 + 5 / 8;
    printf("%d\n", i);
    return 0;
}
```
```output
8
```

Step by step: `2*3/4` is `6/4 = 1`, `4/4 = 1`, `5/8 = 0`. Then `1 + 1 + 8 - 2 + 0 = 8`.

```c run
#include <stdio.h>

int main(void) {
    int a, b;
    printf("%d\n", 2 + 3 * 4);
    printf("%d\n", (2 + 3) * 4);
    printf("%d\n", 10 - 4 - 3);
    printf("%d\n", 100 / 10 / 5);
    a = b = 5;
    printf("%d %d\n", a, b);
    printf("%d\n", 1 + 2 > 2 && 4 % 3 == 1);
    return 0;
}
```
```output
14
20
3
2
5 5
1
```

`a = b = 5` goes right to left: `b` gets 5, then `a` gets the value of `b`. In the last line, `1 + 2 > 2` is `3 > 2` (true) and `4 % 3 == 1` is `1 == 1` (true), so `&&` gives 1.

> **Tip:** When in doubt, add parentheses. They make your intention clear to the reader.

### Common mistakes

- Forgetting that integer division goes left to right: `2*3/4` is 1 but `2*(3/4)` is 0.
- Writing `a + b / 2` to find an average: it means `a + (b/2)`. Write `(a + b) / 2`.
- Writing `!x == 0` and expecting `!(x == 0)`: `!` binds tighter, so it is `(!x) == 0`.
- Relying on the order of `++` side effects inside one expression.

```quiz
What does this print?
~~~
printf("%d", 10 - 2 * 3 + 8 / 4);
~~~
- [x] 6
- [ ] 8
- [ ] 4
- [ ] 2
> 10 - 6 + 2 = 6.
```

```quiz
Given `int a = 10, b = 8, c = 6, d = 5;` what is the value of `a + b / c * d`?
- [ ] 10
- [x] 15
- [ ] 16
- [ ] 22
> b / c = 1 (integer division), then 1 * d = 5, then a + 5 = 15.
```

```quiz
What does this print?
~~~
int x = 5;
printf("%d", !x == 0);
~~~
- [ ] 0
- [x] 1
- [ ] 5
- [ ] A compile error
> ! binds tighter than ==, so it is (!5) == 0, which is 0 == 0, which is 1.
```

# Step: Type conversion and casting

When you mix types in one expression, C **automatically converts** the smaller type to the bigger one: roughly `char`/`short` to `int` to `long` to `float` to `double`. So `3 * 1.5` becomes `4.5`, because 3 is converted to `double` first.

You can also force a conversion yourself with a **cast**: `(new_type) expression`.

- Cast an **operand** to get real division: `(float)total / count`.
- Casting a decimal to `int` **truncates** (does not round): `(int)3.75` is `3`.
- A cast changes only that one value; it does not change the variable.
- Cast **before** the division, not after.

```c run
#include <stdio.h>

int main(void) {
    int total = 300, count = 80;
    float average = (float)total / count;
    float t = 3.75;
    int whole = (int)t;
    float bad = (float)(7 / 3);
    float good = (float)7 / 3;

    printf("%.2f\n", average);
    printf("%d\n", whole);
    printf("%f\n", bad);
    printf("%f\n", good);
    return 0;
}
```
```output
3.75
3
2.000000
2.333333
```

`(float)(7 / 3)` is too late: the integer division already produced `2`. `(float)7 / 3` converts the 7 first, so the division is real.

Characters are small integers, so arithmetic on them works too. Storing a decimal in an `int` silently drops the fraction:

```c run
#include <stdio.h>

int main(void) {
    char c = 'a';
    int n = c + 1;
    printf("%d %c\n", n, n);
    int x = 3.99;
    printf("%d\n", x);
    printf("%.1f\n", 5 / 2.0);
    return 0;
}
```
```output
98 b
3
2.5
```

### Common mistakes

- Casting too late: `(float)(a / b)` does not fix integer division.
- Expecting `(int)3.99` to be 4 (it is 3).
- Assigning a `double` to an `int` and not noticing the lost fraction.
- Thinking `(float)x` changes `x` permanently.

```quiz
What does `printf("%.1f", (float)7 / 2);` print?
- [ ] 3.0
- [x] 3.5
- [ ] 4.0
- [ ] 3
> 7 is converted to float first, so the division is real.
```

```quiz
What does `printf("%.1f", (float)(7 / 2));` print?
- [ ] 3.5
- [x] 3.0
- [ ] 4.0
- [ ] 3.3
> 7 / 2 is already 3 before the cast.
```

```quiz
What does this print?
~~~
int n = 5, m = 3;
float y = n / m;
printf("%.1f", y);
~~~
- [ ] 1.7
- [x] 1.0
- [ ] 2.0
- [ ] 1.5
> n / m is integer division and gives 1; only then it is stored in the float.
```

# Step: Putting it together

Many class problems are solved by combining `/`, `%`, casts and `printf` formats. Here are two typical patterns.

**Peeling digits.** For a 3-digit number, `% 10` gives the last digit and `/ 10` removes it:

```c run
#include <stdio.h>

int main(void) {
    int num, n1, n2, n3, temp;

    scanf("%d", &num);

    n3 = num % 10;     /* 123 % 10 = 3 */
    temp = num / 10;   /* 123 / 10 = 12 */

    n2 = temp % 10;    /* 12 % 10 = 2 */
    n1 = temp / 10;    /* 12 / 10 = 1 */

    printf("Sum is: %d\n", n1 + n2 + n3);
    return 0;
}
```
```input
123
```
```output
Sum is: 6
```

**Splitting a quantity into units.** To turn seconds into hours, minutes and seconds, use `/` for the big unit and `%` for what is left:

```c run
#include <stdio.h>

int main(void) {
    int total, h, m, s;
    scanf("%d", &total);
    h = total / 3600;
    m = total % 3600 / 60;
    s = total % 60;
    printf("%d hour(s) %d minute(s) %d second(s)\n", h, m, s);
    return 0;
}
```
```input
3725
```
```output
1 hour(s) 2 minute(s) 5 second(s)
```

Trace: `3725 / 3600 = 1`; `3725 % 3600 = 125`, and `125 / 60 = 2`; `3725 % 60 = 5`. The same idea gives the minimum number of bank notes (`n / 100`, then `n %= 100`, and so on).

### Common mistakes

- Forgetting that `%` and `/` here work on integers, so use `int` variables.
- Using `4/3` for a fraction instead of `4.0/3.0`.
- Mixing up which of `/` or `%` gives the quotient and which gives the remainder.
- Writing `total % 3600 / 60` and not noticing it is `(total % 3600) / 60`.

```quiz
Using % and / to add the digits of 905, what is the digit sum?
- [x] 14
- [ ] 905
- [ ] 9
- [ ] 5
> 905 % 10 = 5, 905 / 10 = 90, 90 % 10 = 0, 90 / 10 = 9. And 9 + 0 + 5 = 14.
```

```quiz
What does this print?
~~~
int n = 125;
printf("%d %d", n / 60, n % 60);
~~~
- [ ] 2 2
- [x] 2 5
- [ ] 5 2
- [ ] 2.08 5
> 125 = 2 * 60 + 5.
```

# Problem: Even or odd using modulo and bitwise operators
id: operators-even-odd
difficulty: easy
source: CSE103 Task Sheet - Operators #1

Read an integer and decide whether it is even or odd **twice**: once using the modulo operator `%` and once using the bitwise AND operator `&`.

**Input:** one integer `n` (it can be negative or zero).
**Output:** two lines:
```
Modulo: Even
Bitwise: Even
```
Each line says `Even` or `Odd`.

```c starter
#include <stdio.h>

int main(void) {
    int n;
    // read n, then print the two lines
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Modulo: %s\n", (n % 2 == 0) ? "Even" : "Odd");
    printf("Bitwise: %s\n", ((n & 1) == 0) ? "Even" : "Odd");
    return 0;
}
```
```test
=== input
7
=== output
Modulo: Odd
Bitwise: Odd
```
```test
=== input
10
=== output
Modulo: Even
Bitwise: Even
```
```test
=== input
0
=== output
Modulo: Even
Bitwise: Even
```
```test
=== input
-3
=== output
Modulo: Odd
Bitwise: Odd
```
```hint
`n % 2 == 0` means even. For negative numbers the remainder can be -1, so compare with 0 rather than with 1.
```
```hint
The last bit of an odd number is 1. Try `n & 1`.
```

# Problem: Maximum of three numbers
id: operators-max3
difficulty: easy
source: CSE103 Task Sheet - Operators #2

Read three integers and print the largest one using logical operators (`&&`) in your conditions.

**Input:** three integers `a b c` separated by spaces.
**Output:** `Maximum = X`

```c starter
#include <stdio.h>

int main(void) {
    int a, b, c, max;
    // read the numbers and find the maximum
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b, c, max;
    scanf("%d %d %d", &a, &b, &c);
    if (a >= b && a >= c)
        max = a;
    else if (b >= a && b >= c)
        max = b;
    else
        max = c;
    printf("Maximum = %d\n", max);
    return 0;
}
```
```test
=== input
4 9 2
=== output
Maximum = 9
```
```test
=== input
5 5 5
=== output
Maximum = 5
```
```test
=== input
-1 -5 -3
=== output
Maximum = -1
```
```test
=== input
7 7 3
=== output
Maximum = 7
```
```hint
`a` is the maximum when `a >= b && a >= c`.
```
```hint
Use `else if` for `b`, and make `c` the final `else`. Using `>=` handles ties.
```

# Problem: Days to years, weeks and days
id: operators-days
difficulty: easy
source: CSE103 Task Sheet - Operators #3 / Class Notes 01 - Exercise B

Read a number of days. Assume 1 year = 365 days and 1 week = 7 days. Print the number of full years, then the number of full weeks in the remaining days, then the leftover days.

**Input:** one non-negative integer `days`.
**Output:** `Y year(s) W week(s) D day(s)`

```c starter
#include <stdio.h>

int main(void) {
    int days, years, weeks;
    // use / and % to split the days
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int days, years, weeks;
    scanf("%d", &days);
    years = days / 365;
    days = days % 365;
    weeks = days / 7;
    days = days % 7;
    printf("%d year(s) %d week(s) %d day(s)\n", years, weeks, days);
    return 0;
}
```
```test
=== input
400
=== output
1 year(s) 5 week(s) 0 day(s)
```
```test
=== input
1000
=== output
2 year(s) 38 week(s) 4 day(s)
```
```test
=== input
364
=== output
0 year(s) 52 week(s) 0 day(s)
```
```test
=== input
0
=== output
0 year(s) 0 week(s) 0 day(s)
```
```hint
Years = `days / 365`. The remaining days are `days % 365`.
```
```hint
Do the same with 7 on the remaining days to get weeks and leftover days.
```

# Problem: Minimum of two numbers using ?:
id: operators-min2
difficulty: easy
source: CSE103 Task Sheet - Operators #4

Read two integers and print the smaller one using the conditional (ternary) operator.

**Input:** two integers `a b`.
**Output:** `Minimum = X`

```c starter
#include <stdio.h>

int main(void) {
    int a, b, min;
    // use the ? : operator
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b, min;
    scanf("%d %d", &a, &b);
    min = (a < b) ? a : b;
    printf("Minimum = %d\n", min);
    return 0;
}
```
```test
=== input
5 9
=== output
Minimum = 5
```
```test
=== input
-3 -8
=== output
Minimum = -8
```
```test
=== input
4 4
=== output
Minimum = 4
```
```hint
The pattern is `condition ? value_if_true : value_if_false`.
```

# Problem: Pre-increment and post-increment demo
id: operators-incr-demo
difficulty: easy
source: CSE103 Task Sheet - Operators #5

Read an integer `n`. Show how post-increment and pre-increment behave by printing the following four lines, in this order, using one statement for each:

1. `Post-increment: ` followed by `n++` (the value is used first)
2. `After post-increment: ` followed by `n`
3. `Pre-increment: ` followed by `++n` (the value is increased first)
4. `After pre-increment: ` followed by `n`

**Input:** one integer `n`.
**Output:** four lines, as above. For `n = 5`:
```
Post-increment: 5
After post-increment: 6
Pre-increment: 7
After pre-increment: 7
```

```c starter
#include <stdio.h>

int main(void) {
    int n;
    // read n, then use n++ and ++n in separate printf calls
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Post-increment: %d\n", n++);
    printf("After post-increment: %d\n", n);
    printf("Pre-increment: %d\n", ++n);
    printf("After pre-increment: %d\n", n);
    return 0;
}
```
```test
=== input
5
=== output
Post-increment: 5
After post-increment: 6
Pre-increment: 7
After pre-increment: 7
```
```test
=== input
0
=== output
Post-increment: 0
After post-increment: 1
Pre-increment: 2
After pre-increment: 2
```
```test
=== input
-1
=== output
Post-increment: -1
After post-increment: 0
Pre-increment: 1
After pre-increment: 1
```
```hint
`n++` hands over the current value and then adds 1. `++n` adds 1 and then hands over the new value.
```

# Problem: All arithmetic operations
id: operators-all-ops
difficulty: easy
source: Lab Manual - Lab 2 Task #1

Read two integers and print the result of all five arithmetic operations.

**Input:** two integers `a b` (`b` is not 0).
**Output:** five lines:
```
a+b = ...
a-b = ...
a*b = ...
a/b = ...
a%b = ...
```
Use integer arithmetic (`/` truncates toward zero, `%` is the remainder).

```c starter
#include <stdio.h>

int main(void) {
    int a, b;
    // read a and b, print the five results
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("a+b = %d\n", a + b);
    printf("a-b = %d\n", a - b);
    printf("a*b = %d\n", a * b);
    printf("a/b = %d\n", a / b);
    printf("a%%b = %d\n", a % b);
    return 0;
}
```
```test
=== input
9 4
=== output
a+b = 13
a-b = 5
a*b = 36
a/b = 2
a%b = 1
```
```test
=== input
20 6
=== output
a+b = 26
a-b = 14
a*b = 120
a/b = 3
a%b = 2
```
```test
=== input
-7 2
=== output
a+b = -5
a-b = -9
a*b = -14
a/b = -3
a%b = -1
```
```hint
To print a percent sign with `printf`, write `%%`.
```

# Problem: Evaluate an expression
id: operators-expression-z
difficulty: easy
source: Aptech Practice - Operators and Expressions

Evaluate `z = a*b + (c/d) - e*f` for the given values. Treat all six values as real numbers (`double`). (The original exercise uses a=10, b=7, c=15.75, d=4, e=2, f=5.6.)

**Input:** six real numbers `a b c d e f` (`d` is not 0).
**Output:** `z = x` with 2 decimals.

```c starter
#include <stdio.h>

int main(void) {
    double a, b, c, d, e, f, z;
    // read the six values, compute z, print it
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double a, b, c, d, e, f, z;
    scanf("%lf %lf %lf %lf %lf %lf", &a, &b, &c, &d, &e, &f);
    z = a * b + (c / d) - e * f;
    printf("z = %.2f\n", z);
    return 0;
}
```
```test
=== input
10 7 15.75 4 2 5.6
=== output
z = 62.74
```
```test
=== input
2 3 8 2 1 1.5
=== output
z = 8.50
```
```test
=== input
1 1 1 1 1 1
=== output
z = 1.00
```
```hint
Type the formula exactly as given. `*` and `/` happen before `+` and `-`.
```

# Problem: Net salary of an employee
id: operators-net-salary
difficulty: medium
source: Aptech Practice - Operators and Expressions

Compute the net salary: Net = Basic + DA + HRA + TA + Others - (PF + IT), where DA = 12% of basic, HRA = 150, TA = 120, Others = 450, PF = 14% of basic and IT = 15% of basic.

**Input:** one real number, the basic salary.
**Output:** `Net Salary = x` with 2 decimals.

```c starter
#include <stdio.h>

int main(void) {
    double basic, da, pf, it, net;
    // read basic, compute net, print it
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double basic, da, pf, it, net;
    scanf("%lf", &basic);
    da = basic * 12 / 100;
    pf = basic * 14 / 100;
    it = basic * 15 / 100;
    net = basic + da + 150 + 120 + 450 - (pf + it);
    printf("Net Salary = %.2f\n", net);
    return 0;
}
```
```test
=== input
12000
=== output
Net Salary = 10680.00
```
```test
=== input
20000
=== output
Net Salary = 17320.00
```
```test
=== input
10000
=== output
Net Salary = 9020.00
```
```hint
For 12000: DA = 1440, PF = 1680, IT = 1800, so Net = 12000 + 1440 + 150 + 120 + 450 - 3480.
```

# Problem: Centimetres to feet and inches
id: operators-cm-feet-inch
difficulty: medium
source: Aptech Practice - Operators and Expressions (Lab) #2

Read a length in centimetres. Print the equivalent in feet and in inches, each with one decimal. Assume 2.54 cm per inch and 12 inches per foot.

**Input:** one real number `cm`.
**Output:** two lines:
```
<cm> centimeters is <feet> feet
<cm> centimeters is <inches> inches
```
All three numbers use `%.1f`. For input `333.3` the output is:
```
333.3 centimeters is 10.9 feet
333.3 centimeters is 131.2 inches
```

```c starter
#include <stdio.h>

int main(void) {
    double cm, inches, feet;
    // read cm, convert, print the two lines
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double cm, inches, feet;
    scanf("%lf", &cm);
    inches = cm / 2.54;
    feet = inches / 12;
    printf("%.1f centimeters is %.1f feet\n", cm, feet);
    printf("%.1f centimeters is %.1f inches\n", cm, inches);
    return 0;
}
```
```test
=== input
333.3
=== output
333.3 centimeters is 10.9 feet
333.3 centimeters is 131.2 inches
```
```test
=== input
254
=== output
254.0 centimeters is 8.3 feet
254.0 centimeters is 100.0 inches
```
```test
=== input
0
=== output
0.0 centimeters is 0.0 feet
0.0 centimeters is 0.0 inches
```
```hint
inches = cm / 2.54, then feet = inches / 12.
```

# Problem: Centimetres to metres and kilometres
id: operators-cm-m-km
difficulty: easy
source: Lab Manual - Lab 2 Task #3

Read a length in centimetres and convert it to metres and kilometres (100 cm = 1 m, 1000 m = 1 km).

**Input:** one real number `cm`.
**Output:** two lines:
```
Meters = x
Kilometers = y
```
`x` is printed with 2 decimals and `y` with 4 decimals.

```c starter
#include <stdio.h>

int main(void) {
    double cm, m, km;
    // read cm, convert, print
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double cm, m, km;
    scanf("%lf", &cm);
    m = cm / 100;
    km = m / 1000;
    printf("Meters = %.2f\n", m);
    printf("Kilometers = %.4f\n", km);
    return 0;
}
```
```test
=== input
250
=== output
Meters = 2.50
Kilometers = 0.0025
```
```test
=== input
12340
=== output
Meters = 123.40
Kilometers = 0.1234
```
```test
=== input
100000
=== output
Meters = 1000.00
Kilometers = 1.0000
```
```hint
Use `100.0` (or declare the variables as `double`) so the division keeps its decimals.
```

# Problem: Sum of digits of a 3-digit number
id: operators-digit-sum
difficulty: easy
source: Class Notes 01 - Listing 1.2

Read a 3-digit positive integer and print the sum of its digits. Use `%` and `/` (no loops needed).

**Input:** one integer `num` (100 ≤ num ≤ 999).
**Output:** `Sum of digits = S`

```c starter
#include <stdio.h>

int main(void) {
    int num;
    // peel off the digits with % and /
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int num, last, middle, first;
    scanf("%d", &num);
    last = num % 10;
    middle = num / 10 % 10;
    first = num / 100;
    printf("Sum of digits = %d\n", first + middle + last);
    return 0;
}
```
```test
=== input
123
=== output
Sum of digits = 6
```
```test
=== input
905
=== output
Sum of digits = 14
```
```test
=== input
999
=== output
Sum of digits = 27
```
```test
=== input
100
=== output
Sum of digits = 1
```
```hint
`num % 10` is the last digit; `num / 100` is the first digit of a 3-digit number.
```
```hint
The middle digit is `(num / 10) % 10`.
```

# Problem: Travel time
id: operators-travel-time
difficulty: medium
source: Class Notes 02 - Exercise 3

A car travels `distance` km at `speed` km/h. Print the travel time as whole hours and minutes (minutes are rounded down). To avoid decimal rounding problems, compute the total minutes with integers: `distance * 60 / speed`.

**Input:** two positive integers `distance speed`.
**Output:** `H hours and M minutes`

```c starter
#include <stdio.h>

int main(void) {
    int distance, speed, total;
    // total minutes = distance * 60 / speed
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int distance, speed, total;
    scanf("%d %d", &distance, &speed);
    total = distance * 60 / speed;
    printf("%d hours and %d minutes\n", total / 60, total % 60);
    return 0;
}
```
```test
=== input
300 80
=== output
3 hours and 45 minutes
```
```test
=== input
150 100
=== output
1 hours and 30 minutes
```
```test
=== input
50 80
=== output
0 hours and 37 minutes
```
```hint
Total minutes = `distance * 60 / speed`. Then hours = total / 60 and minutes = total % 60.
```

# Problem: Seconds to hours, minutes and seconds
id: operators-seconds
difficulty: easy
source: Class Notes 02 - Practice 5

Read a number of seconds and convert it to hours, minutes and seconds.

**Input:** one non-negative integer `seconds`.
**Output:** `H hour(s) M minute(s) S second(s)`

```c starter
#include <stdio.h>

int main(void) {
    int total;
    // use /, % and the numbers 3600 and 60
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int total, h, m, s;
    scanf("%d", &total);
    h = total / 3600;
    m = total % 3600 / 60;
    s = total % 60;
    printf("%d hour(s) %d minute(s) %d second(s)\n", h, m, s);
    return 0;
}
```
```test
=== input
3725
=== output
1 hour(s) 2 minute(s) 5 second(s)
```
```test
=== input
59
=== output
0 hour(s) 0 minute(s) 59 second(s)
```
```test
=== input
86399
=== output
23 hour(s) 59 minute(s) 59 second(s)
```
```test
=== input
3600
=== output
1 hour(s) 0 minute(s) 0 second(s)
```
```hint
hours = total / 3600. The seconds left after the hours are total % 3600.
```

# Problem: Minimum number of bank notes
id: operators-bank-notes
difficulty: medium
source: Class Notes 01 - Exercise E

Read an integer amount of money. Print the smallest number of notes needed, using notes of 100, 50, 20, 10, 5, 2 and 1.

**Input:** one non-negative integer `amount`.
**Output:** seven lines, from the largest note to the smallest:
```
N note(s) of 100
N note(s) of 50
N note(s) of 20
N note(s) of 10
N note(s) of 5
N note(s) of 2
N note(s) of 1
```

```c starter
#include <stdio.h>

int main(void) {
    int n;
    // for each note: count = n / note, then n = n % note
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    printf("%d note(s) of 100\n", n / 100);
    n %= 100;
    printf("%d note(s) of 50\n", n / 50);
    n %= 50;
    printf("%d note(s) of 20\n", n / 20);
    n %= 20;
    printf("%d note(s) of 10\n", n / 10);
    n %= 10;
    printf("%d note(s) of 5\n", n / 5);
    n %= 5;
    printf("%d note(s) of 2\n", n / 2);
    n %= 2;
    printf("%d note(s) of 1\n", n);
    return 0;
}
```
```test
=== input
576
=== output
5 note(s) of 100
1 note(s) of 50
1 note(s) of 20
0 note(s) of 10
1 note(s) of 5
0 note(s) of 2
1 note(s) of 1
```
```test
=== input
1999
=== output
19 note(s) of 100
1 note(s) of 50
2 note(s) of 20
0 note(s) of 10
1 note(s) of 5
2 note(s) of 2
0 note(s) of 1
```
```test
=== input
1
=== output
0 note(s) of 100
0 note(s) of 50
0 note(s) of 20
0 note(s) of 10
0 note(s) of 5
0 note(s) of 2
1 note(s) of 1
```
```hint
Start with the biggest note: `n / 100` is how many you need, and `n % 100` is what is still left.
```

# Problem: Volume of a cylinder
id: operators-cylinder
difficulty: easy
source: Aptech Practice - Operators and Expressions / Lab Manual - Lab 2

Read the radius `r` and height `h` of a cylinder. Print its volume V = π r² h. Use π = 3.141592653589793 (`#define PI 3.141592653589793`).

**Input:** two real numbers `r h`.
**Output:** `Volume = x` with 2 decimals.

```c starter
#include <stdio.h>
#define PI 3.141592653589793

int main(void) {
    double r, h;
    // read r and h, print the volume
    return 0;
}
```
```c solution
#include <stdio.h>
#define PI 3.141592653589793

int main(void) {
    double r, h;
    scanf("%lf %lf", &r, &h);
    printf("Volume = %.2f\n", PI * r * r * h);
    return 0;
}
```
```test
=== input
7 7
=== output
Volume = 1077.57
```
```test
=== input
1 1
=== output
Volume = 3.14
```
```test
=== input
2 5
=== output
Volume = 62.83
```
```hint
Volume = `PI * r * r * h`.
```

# Problem: Volume of a sphere
id: operators-sphere
difficulty: medium
source: Class Notes 02 - Exercise 3 (formulas)

Read the radius `r` of a sphere and print its volume V = (4/3) π r³. Use π = 3.141592653589793. Beware: `4/3` in C is integer division and equals 1.

**Input:** one real number `r`.
**Output:** `Volume = x` with 2 decimals.

```c starter
#include <stdio.h>
#define PI 3.141592653589793

int main(void) {
    double r;
    // read r and print the volume
    return 0;
}
```
```c solution
#include <stdio.h>
#define PI 3.141592653589793

int main(void) {
    double r;
    scanf("%lf", &r);
    printf("Volume = %.2f\n", (4.0 / 3.0) * PI * r * r * r);
    return 0;
}
```
```test
=== input
5
=== output
Volume = 523.60
```
```test
=== input
1
=== output
Volume = 4.19
```
```test
=== input
2.5
=== output
Volume = 65.45
```
```hint
Write `4.0 / 3.0` instead of `4 / 3`.
```

# Problem: Sum, difference, product and quotient
id: operators-four-ops
difficulty: easy
source: Class Notes 02 - Practice 6

Read two real numbers and print their sum, difference, product and quotient, each with 3 decimals.

**Input:** two real numbers `a b` (`b` is not 0).
**Output:** four lines:
```
Sum = ...
Difference = ...
Product = ...
Quotient = ...
```

```c starter
#include <stdio.h>

int main(void) {
    double a, b;
    // read a and b, print the four results with %.3f
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double a, b;
    scanf("%lf %lf", &a, &b);
    printf("Sum = %.3f\n", a + b);
    printf("Difference = %.3f\n", a - b);
    printf("Product = %.3f\n", a * b);
    printf("Quotient = %.3f\n", a / b);
    return 0;
}
```
```test
=== input
7.5 2.5
=== output
Sum = 10.000
Difference = 5.000
Product = 18.750
Quotient = 3.000
```
```test
=== input
10 4
=== output
Sum = 14.000
Difference = 6.000
Product = 40.000
Quotient = 2.500
```
```test
=== input
1 3
=== output
Sum = 4.000
Difference = -2.000
Product = 3.000
Quotient = 0.333
```
```hint
Because the variables are `double`, `/` gives a real quotient.
```

# Problem: Is the 4th bit set?
id: operators-bit-check
difficulty: medium
source: Class Notes 02 - Practice 4

Read a non-negative integer and check whether the bit with value 8 (the 4th bit from the right) is set to 1. Use the bitwise AND operator.

**Input:** one non-negative integer `n`.
**Output:** `SET` if that bit is 1, otherwise `NOT SET`.

```c starter
#include <stdio.h>

int main(void) {
    int n;
    // check n & 8
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    if (n & 8)
        printf("SET\n");
    else
        printf("NOT SET\n");
    return 0;
}
```
```test
=== input
12
=== output
SET
```
```test
=== input
5
=== output
NOT SET
```
```test
=== input
8
=== output
SET
```
```test
=== input
0
=== output
NOT SET
```
```test
=== input
24
=== output
SET
```
```hint
`n & 8` is non-zero exactly when the bit with value 8 is on.
```
