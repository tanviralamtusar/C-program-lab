---
id: decisions
title: "Decision Making: if, else, switch"
order: 3
summary: Make your programs choose - if, if-else, else-if ladders, nested if, logical conditions, switch, the conditional operator and goto.
---

# Step: The if statement

So far every program ran line by line, from top to bottom. Real problems need **choices**: "if it is cloudy, cancel the match". C gives us decision-making statements: `if`, `switch`, the conditional operator `?:` and `goto`.

An `if` statement evaluates a **test expression**. If the value is **true** (any non-zero number) the block runs; if it is **false** (zero) the block is skipped and the program continues with the next statement.

```c
if (test_expression) {
    statement_block;
}
statement_x;   /* always runs */
```

In the flowchart view you will see a diamond (the test). The TRUE arrow goes through the block; the FALSE arrow goes straight to the next statement.

```c run
#include <stdio.h>

int main(void) {
    int age;
    printf("Enter your age: ");
    scanf("%d", &age);
    if (age >= 18) {
        printf("You can vote.\n");
    }
    printf("Done.\n");
    return 0;
}
```
```input
20
```
```output
Enter your age: You can vote.
Done.
```

> **Note:** The typed input is not echoed in the output, so the prompt and the next message appear on the same line. Try input `15` yourself: only `Done.` is printed after the prompt.

In C there is no separate boolean for conditions: **zero is false, every non-zero value is true** (even a negative one).

```c run
#include <stdio.h>

int main(void) {
    int x = 5;
    if (x) {
        printf("5 is true\n");
    }
    x = 0;
    if (x) {
        printf("never printed\n");
    }
    if (-3) {
        printf("-3 is true\n");
    }
    if (!x) {
        printf("!0 is true\n");
    }
    return 0;
}
```
```output
5 is true
-3 is true
!0 is true
```

### Common mistakes

- Writing `If` with a capital letter. C is case-sensitive, it must be `if`.
- Forgetting the parentheses (`if x >= 10`) or writing `then` (C has no `then`).
- Writing `=` instead of `==`: `if (x = 10)` **assigns** 10 to `x`, so the condition is always true.
- A semicolon right after the condition: `if (x == y);` gives an empty body, and the next statement always runs.
- Forgetting braces when the body has more than one statement. Only the first statement belongs to the `if`.

```quiz
What does this print?
~~~
int x = -7;
if (x) printf("yes");
printf("!");
~~~
- [ ] !
- [x] yes!
- [ ] yes
- [ ] nothing
> -7 is non-zero, so it counts as true and `yes` prints. The `!` is a separate statement that always prints.
```

```quiz
What does this print?
~~~
int x = 10, y = 20;
if (x == y);
printf("%d %d", x, y);
~~~
- [ ] nothing
- [x] 10 20
- [ ] 10 10
- [ ] It does not compile
> The stray `;` is the whole body of the `if`. The printf is an ordinary statement and always runs.
```

# Step: if-else (two-way branch)

`else` gives the block that runs when the condition is **false**. Exactly one of the two blocks runs.

```c
if (condition) {
    /* runs when condition is true */
} else {
    /* runs when condition is false */
}
```

```c run
#include <stdio.h>

int main(void) {
    int grade;
    printf("Enter your grade: ");
    scanf("%d", &grade);
    if (grade >= 60) {
        printf("Congratulations, You have passed!!\n");
    } else {
        printf("You have failed.\n");
    }
    return 0;
}
```
```input
75
```
```output
Enter your grade: Congratulations, You have passed!!
```

A classic use is even or odd. A number is even when the remainder of dividing by 2 is 0.

```c run
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    if (n % 2 == 0) {
        printf("%d is even\n", n);
    } else {
        printf("%d is odd\n", n);
    }
    return 0;
}
```
```input
7
```
```output
7 is odd
```

### Common mistakes

- `else` has no condition. `else (x > 5)` is wrong, you want `else if`.
- Using `=` instead of `==` in the condition.
- Mismatched braces, so the `else` pairs with the wrong `if`.
- Treating zero as positive. `num >= 0` is true for zero, which is neither positive nor negative.

```quiz
What does this print?
~~~
int x = 5;
if (x = 0) printf("zero");
else printf("nonzero");
printf(" %d", x);
~~~
- [ ] zero 5
- [ ] nonzero 5
- [x] nonzero 0
- [ ] zero 0
> `x = 0` assigns 0 and the value of the expression is 0 (false), so `else` runs. And `x` is now 0.
```

```quiz
What does this print?
~~~
int a = 5, b = 5;
if (a > b) printf("a");
else printf("b");
~~~
- [ ] a
- [x] b
- [ ] ab
- [ ] nothing
> 5 > 5 is false, so the else branch runs.
```

# Step: Relational and logical operators

Conditions are built from **relational operators** (compare two values) and **logical operators** (combine conditions). A relational expression produces `1` (true) or `0` (false), and that is an ordinary `int`.

- `<` `<=` `>` `>=`: less, less or equal, greater, greater or equal
- `==` `!=`: equal, not equal
- `&&`: AND, both sides must be true
- `||`: OR, at least one side must be true
- `!`: NOT, flips true and false

Precedence: `!` first, then relational operators, then `&&`, then `||`. Use parentheses when in doubt.

```c run
#include <stdio.h>

int main(void) {
    int a = 7, b = 3;
    printf("%d\n", a > b);
    printf("%d\n", a == b);
    printf("%d\n", a != b);
    printf("%d\n", a <= b);
    printf("%d\n", a > 0 && b > 0);
    printf("%d\n", a < 0 || b > 0);
    printf("%d\n", !(a > 0));
    return 0;
}
```
```output
1
0
1
0
1
1
0
```

A year is a leap year if it is divisible by 4, except century years, which must be divisible by 400.

```c run
#include <stdio.h>

int main(void) {
    int year;
    scanf("%d", &year);
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        printf("%d is a leap year\n", year);
    } else {
        printf("%d is not a leap year\n", year);
    }
    return 0;
}
```
```input
1900
```
```output
1900 is not a leap year
```

C uses **short-circuit evaluation**: in `A && B`, if `A` is false then `B` is never evaluated. In `A || B`, if `A` is true then `B` is skipped.

```c run
#include <stdio.h>

int main(void) {
    int a = 0, b = 0;
    if (a != 0 && ++b > 0) {
        printf("inside\n");
    }
    printf("b=%d\n", b);
    if (a == 0 || ++b > 0) {
        printf("or-true\n");
    }
    printf("b=%d\n", b);
    return 0;
}
```
```output
b=0
or-true
b=0
```

### Common mistakes

- `0 < x < 10` does **not** check a range. It means `(0 < x) < 10`, which is always true. Write `x > 0 && x < 10`.
- Using `&` or `|` (bitwise) instead of `&&` or `||`.
- Comparing floating-point numbers with `==` (for example `0.1 + 0.2 == 0.3` is false). Compare with a small tolerance instead.
- Putting side effects such as `++b` in the second half of `&&` or `||`. It may never run.

```quiz
What does this print?
~~~
printf("%d", 10 > 5 > 3);
~~~
- [ ] 1
- [x] 0
- [ ] 5
- [ ] It does not compile
> `10 > 5` is 1, and then `1 > 3` is 0.
```

```quiz
What is the value of z?
~~~
int x = 3, y, z;
y = x = 10;
z = x < 10;
~~~
- [ ] 1
- [x] 0
- [ ] 3
- [ ] 10
> `x` becomes 10 (and `y` too). `10 < 10` is false, so `z` is 0.
```

# Step: The else-if ladder (multi-way decision)

When there are more than two outcomes, chain `if`, `else if`, ..., `else`. The conditions are tested **from top to bottom**. The first true one runs its block and the rest of the ladder is skipped. The last `else` is the catch-all.

```c
if (condition1) {
    /* ... */
} else if (condition2) {
    /* ... */
} else {
    /* none of the above */
}
```

```c run
#include <stdio.h>

int main(void) {
    int marks;
    scanf("%d", &marks);
    if (marks >= 90) {
        printf("Grade: A\n");
    } else if (marks >= 80) {
        printf("Grade: B\n");
    } else if (marks >= 70) {
        printf("Grade: C\n");
    } else if (marks >= 60) {
        printf("Grade: D\n");
    } else {
        printf("Grade: F\n");
    }
    return 0;
}
```
```input
85
```
```output
Grade: B
```

Because the first true condition wins, **order matters**: each later test is only reached when all earlier ones failed. A ladder also works for values that are not numeric ranges, such as a colour code:

```c run
#include <stdio.h>

int main(void) {
    int code;
    const char *colour;
    scanf("%d", &code);
    if (code == 1)
        colour = "Red";
    else if (code == 2)
        colour = "White";
    else if (code == 3)
        colour = "Blue";
    else
        colour = "Green";
    printf("Colour: %s\n", colour);
    return 0;
}
```
```input
4
```
```output
Colour: Green
```

### Common mistakes

- Wrong order. Testing `marks >= 60` before `marks >= 90` makes every passing mark a "D".
- Using several separate `if` statements instead of a ladder, so more than one block can run.
- A semicolon after `else`.
- Forgetting the final `else`, leaving unexpected input unhandled.

```quiz
What does this print?
~~~
int g = 95;
if (g >= 60) printf("P");
else if (g >= 90) printf("A");
~~~
- [ ] A
- [ ] PA
- [x] P
- [ ] nothing
> The first condition is already true, so the `else if` is never tested.
```

```quiz
What does this print?
~~~
int m = 75;
if (m >= 90) printf("A");
else if (m >= 80) printf("B");
else if (m >= 70) printf("C");
else printf("F");
~~~
- [ ] B
- [x] C
- [ ] CF
- [ ] F
> 75 fails the first two tests and passes `>= 70`. The rest of the ladder is skipped.
```

# Step: Nested if-else

An `if` or `else` block may itself contain another `if`. This is called **nesting**. Use it when the second question only makes sense after the first answer. Remember: an `else` always belongs to the **nearest unmatched `if`**, whatever the indentation says.

```c run
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    if (n >= 0) {
        if (n % 2 == 0) {
            printf("%d is even\n", n);
        } else {
            printf("%d is odd\n", n);
        }
    } else {
        printf("The number %d is negative.\n", n);
    }
    return 0;
}
```
```input
8
```
```output
8 is even
```

Largest of three numbers with nesting:

```c run
#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    if (a > b) {
        if (a > c) {
            printf("Max: %d\n", a);
        } else {
            printf("Max: %d\n", c);
        }
    } else {
        if (b > c) {
            printf("Max: %d\n", b);
        } else {
            printf("Max: %d\n", c);
        }
    }
    return 0;
}
```
```input
3 8 5
```
```output
Max: 8
```

> **Tip:** The same problem can be written as a flat ladder using logical operators: `if (a >= b && a >= c) ... else if (b >= a && b >= c) ... else ...`. It is shorter and easier to read. Open the flowchart view for both versions and compare.

### Common mistakes

- **Dangling else**: in `if (a) if (b) X; else Y;` the `else` belongs to `if (b)`. Use braces to make your intention clear.
- Messy indentation that hides which block you are in.
- Deep nesting where a ladder with `&&` would be clearer.
- Using `>` and forgetting the equal case when comparing three numbers (use `>=`).

```quiz
What does this print?
~~~
int x = 1, y = 0;
if (x)
    if (y) printf("A");
    else printf("B");
~~~
- [ ] A
- [x] B
- [ ] AB
- [ ] nothing
> The `else` pairs with the nearest `if (y)`. `x` is true, `y` is false, so `B` prints.
```

```quiz
What does this print?
~~~
int n = -4;
if (n >= 0) {
    if (n % 2 == 0) printf("even");
    else printf("odd");
} else printf("neg");
~~~
- [ ] even
- [ ] odd
- [x] neg
- [ ] negeven
> `n >= 0` is false, so only the outer `else` runs.
```

# Step: The switch statement

A long else-if ladder that compares **one variable with fixed values** is better written as a `switch`. The expression must be an integer or a character. Each `case` label must be a **constant** and unique. `default` is optional and runs when no case matches. `break` leaves the switch.

```c
switch (expression) {
    case value1:
        block1;
        break;
    case value2:
        block2;
        break;
    default:
        block3;
}
```

```c run
#include <stdio.h>

int main(void) {
    char ch;
    scanf(" %c", &ch);
    switch (ch) {
    case 'A':
        printf("Your grade range is 90-100\n");
        break;
    case 'B':
        printf("Your grade range is 80-89\n");
        break;
    case 'C':
        printf("Your grade range is 70-79\n");
        break;
    default:
        printf("Wrong Input!\n");
    }
    return 0;
}
```
```input
B
```
```output
Your grade range is 80-89
```

The space in `" %c"` makes `scanf` skip leading whitespace before reading the character.

Without `break`, execution **falls through** into the next case. Sometimes this is useful: several labels can share one block.

```c run
#include <stdio.h>

int main(void) {
    char ch;
    scanf(" %c", &ch);
    switch (ch) {
    case 'a':
    case 'e':
    case 'i':
    case 'o':
    case 'u':
        printf("vowel\n");
        break;
    default:
        printf("consonant\n");
    }
    return 0;
}
```
```input
e
```
```output
vowel
```

Here is what an accidental missing `break` does:

```c run
#include <stdio.h>

int main(void) {
    int d = 2;
    switch (d) {
    case 1:
        printf("one\n");
    case 2:
        printf("two\n");
    case 3:
        printf("three\n");
        break;
    default:
        printf("other\n");
    }
    return 0;
}
```
```output
two
three
```

### Common mistakes

- Missing `break`, so the following cases run too.
- Using a variable or a range as a case label (`case x:` and `case 1..5:` are not valid).
- Duplicate case values.
- Switching on a `float`, `double` or string. Only integers and characters are allowed.
- Forgetting `default` for unexpected input.
- Characters need single quotes: `case 'A':`. Case labels are case-sensitive, `'a'` is not `'A'`.

```quiz
What does this print?
~~~
switch (3) {
    case 1: printf("a"); break;
    default: printf("d");
    case 2: printf("b"); break;
}
~~~
- [ ] d
- [ ] b
- [x] db
- [ ] a
> No case matches 3, so `default` runs. It has no `break`, so execution falls through into `case 2`.
```

```quiz
What does this print?
~~~
char c = 'b';
switch (c) {
    case 'a': printf("1"); break;
    case 'B': printf("2"); break;
    default: printf("3");
}
~~~
- [ ] 1
- [ ] 2
- [x] 3
- [ ] 23
> Case labels are case-sensitive. `'b'` matches neither `'a'` nor `'B'`, so `default` runs.
```

# Step: The conditional operator ?:

`?:` is C's only **ternary** (three-operand) operator:

```c
condition ? value_if_true : value_if_false
```

It is an *expression*, so its result can be stored in a variable or passed straight to `printf`. It is a compact replacement for a simple if-else that **chooses a value**.

```c run
#include <stdio.h>

int main(void) {
    int a = 12, b = 9;
    int max = (a > b) ? a : b;
    printf("Max = %d\n", max);
    printf("%d is %s\n", a, (a % 2 == 0) ? "even" : "odd");
    return 0;
}
```
```output
Max = 12
12 is even
```

It can be nested, but keep it readable:

```c run
#include <stdio.h>

int main(void) {
    int n = -4;
    printf("%d is %s\n", n, (n > 0) ? "positive" : (n < 0) ? "negative" : "zero");
    return 0;
}
```
```output
-4 is negative
```

### Common mistakes

- Forgetting the `:` part. Both alternatives are required.
- Using `?:` for long branches or branches with many statements. Use if-else instead.
- Deeply nesting `?:` until nobody can read it.

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
> `a > b` is false, so the value after the `:` (which is `b`) is used.
```

```quiz
What does this print?
~~~
int x = 5;
x = x > 3 ? x * 2 : x + 1;
printf("%d", x);
~~~
- [ ] 5
- [ ] 6
- [x] 10
- [ ] 1
> `x > 3` is true, so `x` becomes `5 * 2`.
```

# Step: The goto statement

`goto` jumps **unconditionally** to a **label**: a name followed by a colon, placed before a statement. It is the lowest-level way to build a decision or a loop. Modern C avoids it because jumping around makes programs hard to follow, and `while` and `for` are preferred. But you should know it exists, and the flowchart view shows exactly what it does.

```c run
#include <stdio.h>

int main(void) {
    int age = -5;
    if (age < 0)
        goto invalid;
    printf("Age ok\n");
    goto end;
invalid:
    printf("Invalid age\n");
end:
    printf("Bye\n");
    return 0;
}
```
```output
Invalid age
Bye
```

A backward jump makes a loop built by hand:

```c run
#include <stdio.h>

int main(void) {
    int i = 1;
loop:
    printf("%d ", i);
    i++;
    if (i <= 3)
        goto loop;
    printf("\n");
    return 0;
}
```
```output
1 2 3 
```

### Common mistakes

- Forgetting the colon after the label, or using the same label name twice.
- Putting a declaration directly after a label. Put a statement there.
- Creating "spaghetti code" with many jumps. Prefer loops.

```quiz
What does this print?
~~~
printf("A");
goto end;
printf("B");
end:
printf("C");
~~~
- [ ] ABC
- [x] AC
- [ ] AB
- [ ] C
> The jump skips `printf("B")`.
```

# Problem: Positive, negative or neutral
id: decisions-sign
difficulty: easy
source: CSE103 Task Sheet - Decision Making #1

Read an integer and tell whether it is positive, negative or neutral (zero).

**Input:** one integer.
**Output:** exactly one word: `Positive`, `Negative` or `Neutral`.

```c starter
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    if (n > 0) {
        printf("Positive\n");
    } else if (n < 0) {
        printf("Negative\n");
    } else {
        printf("Neutral\n");
    }
    return 0;
}
```
```test
=== input
15
=== output
Positive
```
```test
=== input
-8
=== output
Negative
```
```test
=== input
0
=== output
Neutral
```
```hint
Zero is neither positive nor negative, so you need three outcomes. Which statement handles three or more outcomes?
```
```hint
Use an else-if ladder: test `n > 0`, then `n < 0`, and let the final `else` handle zero.
```

# Problem: Leap year
id: decisions-leap-year
difficulty: easy
source: CSE103 Task Sheet - Decision Making #2

A year is a leap year if it is divisible by 4, except that century years (divisible by 100) must also be divisible by 400. For example 2024 and 2000 are leap years, but 1900 and 2023 are not.

**Input:** one positive integer, the year.
**Output:** `Leap year` or `Not a leap year`.

```c starter
#include <stdio.h>

int main(void) {
    int year;
    scanf("%d", &year);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int year;
    scanf("%d", &year);
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        printf("Leap year\n");
    } else {
        printf("Not a leap year\n");
    }
    return 0;
}
```
```test
=== input
2024
=== output
Leap year
```
```test
=== input
1900
=== output
Not a leap year
```
```test
=== input
2000
=== output
Leap year
```
```test
=== input
2023
=== output
Not a leap year
```
```hint
Write the rule as one condition: (divisible by 4 and NOT by 100) OR (divisible by 400).
```
```hint
`(year % 4 == 0 && year % 100 != 0) || year % 400 == 0`
```

# Problem: Grade from marks
id: decisions-grade
difficulty: easy
source: CSE103 Task Sheet - Decision Making #3

Read the marks (an integer from 0 to 100) and print the grade using this table.

| Marks | Grade |
|---|---|
| 90 - 100 | A |
| 80 - 89 | B |
| 70 - 79 | C |
| 60 - 69 | D |
| below 60 | F |

**Input:** one integer, the marks.
**Output:** `Grade: X` where X is the letter.

```c starter
#include <stdio.h>

int main(void) {
    int marks;
    scanf("%d", &marks);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int marks;
    scanf("%d", &marks);
    if (marks >= 90) {
        printf("Grade: A\n");
    } else if (marks >= 80) {
        printf("Grade: B\n");
    } else if (marks >= 70) {
        printf("Grade: C\n");
    } else if (marks >= 60) {
        printf("Grade: D\n");
    } else {
        printf("Grade: F\n");
    }
    return 0;
}
```
```test
=== input
85
=== output
Grade: B
```
```test
=== input
90
=== output
Grade: A
```
```test
=== input
60
=== output
Grade: D
```
```test
=== input
59
=== output
Grade: F
```
```hint
Test from the highest grade down, so that each test only needs one comparison.
```

# Problem: Vowel, consonant, digit or special symbol
id: decisions-char-kind
difficulty: medium
source: CSE103 Task Sheet - Decision Making #4

Read one character and classify it. The vowels are `a e i o u` in lower or upper case. Any other English letter is a consonant. `0`-`9` are digits. Everything else is a special symbol.

**Input:** one character (not a space).
**Output:** one of `Vowel`, `Consonant`, `Digit`, `Special symbol`.

```c starter
#include <stdio.h>

int main(void) {
    char ch;
    scanf(" %c", &ch);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    char ch;
    scanf(" %c", &ch);
    if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u' ||
        ch == 'A' || ch == 'E' || ch == 'I' || ch == 'O' || ch == 'U') {
        printf("Vowel\n");
    } else if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
        printf("Consonant\n");
    } else if (ch >= '0' && ch <= '9') {
        printf("Digit\n");
    } else {
        printf("Special symbol\n");
    }
    return 0;
}
```
```test
=== input
e
=== output
Vowel
```
```test
=== input
Z
=== output
Consonant
```
```test
=== input
7
=== output
Digit
```
```test
=== input
@
=== output
Special symbol
```
```hint
Characters are small integers, so `ch >= 'a' && ch <= 'z'` checks for a lower-case letter.
```
```hint
Check vowels first. After that, any remaining letter must be a consonant.
```

# Problem: Simple calculator with switch
id: decisions-calculator
difficulty: medium
source: CSE103 Task Sheet - Decision Making #5

Build a calculator with a `switch` statement. Read two numbers and an operator (`+`, `-`, `*` or `/`).

**Input:** one line `a op b` where `a` and `b` are real numbers and `op` is a single character.
**Output:**
- `Result = R` with R printed with 2 decimal places (for example `Result = 17.00`),
- `Error: division by zero` if the operator is `/` and `b` is 0,
- `Invalid operator` for any other operator.

```c starter
#include <stdio.h>

int main(void) {
    double a, b;
    char op;
    scanf("%lf %c %lf", &a, &op, &b);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double a, b;
    char op;
    scanf("%lf %c %lf", &a, &op, &b);
    switch (op) {
    case '+':
        printf("Result = %.2f\n", a + b);
        break;
    case '-':
        printf("Result = %.2f\n", a - b);
        break;
    case '*':
        printf("Result = %.2f\n", a * b);
        break;
    case '/':
        if (b == 0) {
            printf("Error: division by zero\n");
        } else {
            printf("Result = %.2f\n", a / b);
        }
        break;
    default:
        printf("Invalid operator\n");
    }
    return 0;
}
```
```test
=== input
12 + 5
=== output
Result = 17.00
```
```test
=== input
7 / 2
=== output
Result = 3.50
```
```test
=== input
5 / 0
=== output
Error: division by zero
```
```test
=== input
3 ^ 4
=== output
Invalid operator
```
```hint
`switch (op)` works on a `char`. Each case label is a character in single quotes, like `case '+':`.
```
```hint
Do not forget `break` after each case, and check for division by zero inside the `'/'` case.
```

# Problem: Greatest of three numbers
id: decisions-max3
difficulty: easy
source: CSE103 Task Sheet - Decision Making #6

Read three integers and print the greatest one using if-else statements.

**Input:** three integers separated by spaces.
**Output:** `Greatest = X`

```c starter
#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    if (a >= b && a >= c) {
        printf("Greatest = %d\n", a);
    } else if (b >= a && b >= c) {
        printf("Greatest = %d\n", b);
    } else {
        printf("Greatest = %d\n", c);
    }
    return 0;
}
```
```test
=== input
3 8 5
=== output
Greatest = 8
```
```test
=== input
10 10 4
=== output
Greatest = 10
```
```test
=== input
-5 -2 -9
=== output
Greatest = -2
```
```test
=== input
7 7 7
=== output
Greatest = 7
```
```hint
Use `>=` so that ties are handled correctly.
```

# Problem: Repeat input with goto
id: decisions-goto-sum
difficulty: medium
source: CSE103 Task Sheet - Decision Making #7

Use `goto` to keep taking input from the user until `0` is entered. Print the sum of all the numbers entered before the 0.

**Input:** integers, one or more per line, ending with `0`.
**Output:** `Sum = S`

```c starter
#include <stdio.h>

int main(void) {
    int n, sum = 0;
again:
    // read n here, then decide whether to jump back to "again"

    printf("Sum = %d\n", sum);
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n, sum = 0;
again:
    scanf("%d", &n);
    if (n != 0) {
        sum += n;
        goto again;
    }
    printf("Sum = %d\n", sum);
    return 0;
}
```
```test
=== input
5
10
-3
0
=== output
Sum = 12
```
```test
=== input
0
=== output
Sum = 0
```
```test
=== input
100 200 300 0
=== output
Sum = 600
```
```hint
Put the label before the `scanf`. After reading, if the number is not 0, add it to the sum and `goto` the label.
```

# Problem: Is a divisible by b?
id: decisions-divisible
difficulty: easy
source: Aptech Practice - Condition #1

Read two integers `a` and `b` (b is not 0) and check whether `a` is divisible by `b`.

**Input:** two integers `a b`.
**Output:** `Divisible` or `Not divisible`.

```c starter
#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    if (a % b == 0) {
        printf("Divisible\n");
    } else {
        printf("Not divisible\n");
    }
    return 0;
}
```
```test
=== input
20 5
=== output
Divisible
```
```test
=== input
17 5
=== output
Not divisible
```
```test
=== input
0 7
=== output
Divisible
```
```hint
`a` is divisible by `b` when the remainder `a % b` is 0.
```

# Problem: Product compared with 1000
id: decisions-product-1000
difficulty: easy
source: Aptech Practice - Condition #2

Read two integers (each between -10000 and 10000) and compare their product with 1000.

**Input:** two integers.
**Output:** `Greater than 1000`, `Equal to 1000` or `Less than 1000`.

```c starter
#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b, p;
    scanf("%d %d", &a, &b);
    p = a * b;
    if (p > 1000) {
        printf("Greater than 1000\n");
    } else if (p == 1000) {
        printf("Equal to 1000\n");
    } else {
        printf("Less than 1000\n");
    }
    return 0;
}
```
```test
=== input
25 40
=== output
Equal to 1000
```
```test
=== input
50 30
=== output
Greater than 1000
```
```test
=== input
12 9
=== output
Less than 1000
```
```test
=== input
-40 -30
=== output
Greater than 1000
```
```hint
Store the product in a variable first, then compare that variable.
```

# Problem: Is the difference one of the values?
id: decisions-difference
difficulty: medium
source: Aptech Practice - Condition #3

Read two integers `a` and `b`. Let the difference be `d = a - b`.
- If `d` equals `a`, print `Difference is equal to value a` (with the number).
- Otherwise, if `d` equals `b`, print `Difference is equal to value b` (with the number).
- If it equals neither, print `Difference is not equal to any of the values entered`.

**Input:** two integers `a b`.
**Output:** one of the messages above. For example, for `10 5` the difference is 5, which equals `b`, so print `Difference is equal to value 5`.

```c starter
#include <stdio.h>

int main(void) {
    int a, b, d;
    scanf("%d %d", &a, &b);
    d = a - b;
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b, d;
    scanf("%d %d", &a, &b);
    d = a - b;
    if (d == a) {
        printf("Difference is equal to value %d\n", a);
    } else if (d == b) {
        printf("Difference is equal to value %d\n", b);
    } else {
        printf("Difference is not equal to any of the values entered\n");
    }
    return 0;
}
```
```test
=== input
10 5
=== output
Difference is equal to value 5
```
```test
=== input
8 3
=== output
Difference is not equal to any of the values entered
```
```test
=== input
4 0
=== output
Difference is equal to value 4
```
```test
=== input
0 0
=== output
Difference is equal to value 0
```
```hint
Compute `d = a - b` once, then compare `d` with `a` and with `b` in an else-if ladder.
```

# Problem: Employee allowance
id: decisions-allowance
difficulty: easy
source: Aptech Practice - Condition #4

The Montek company gives allowances by grade: grade `A` gets 300, grade `B` gets 250, any other grade gets 100. Read the salary and the grade and print the total salary (salary + allowance).

**Input:** an integer salary and a grade letter (upper case), separated by a space.
**Output:** `Total salary = T`

```c starter
#include <stdio.h>

int main(void) {
    int salary;
    char grade;
    scanf("%d %c", &salary, &grade);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int salary, allowance;
    char grade;
    scanf("%d %c", &salary, &grade);
    if (grade == 'A') {
        allowance = 300;
    } else if (grade == 'B') {
        allowance = 250;
    } else {
        allowance = 100;
    }
    printf("Total salary = %d\n", salary + allowance);
    return 0;
}
```
```test
=== input
5000 A
=== output
Total salary = 5300
```
```test
=== input
4000 B
=== output
Total salary = 4250
```
```test
=== input
3000 C
=== output
Total salary = 3100
```
```test
=== input
2500 Z
=== output
Total salary = 2600
```
```hint
Choose the allowance first (an else-if ladder), then print `salary + allowance` once at the end.
```

# Problem: Print x and y only if allowed
id: decisions-print-xy
difficulty: medium
source: Aptech Practice - Condition (Lab) #1

Read two integers `x` and `y`.
- Print `x = X` only if `x` is less than 2000 or greater than 3000.
- Print `y = Y` only if `y` is between 100 and 500 (both included).
- If neither line is printed, print `Nothing to print`.

If both lines are printed, the `x` line comes first.

**Input:** two integers `x y`.
**Output:** the lines described above.

```c starter
#include <stdio.h>

int main(void) {
    int x, y;
    scanf("%d %d", &x, &y);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int x, y, printed = 0;
    scanf("%d %d", &x, &y);
    if (x < 2000 || x > 3000) {
        printf("x = %d\n", x);
        printed = 1;
    }
    if (y >= 100 && y <= 500) {
        printf("y = %d\n", y);
        printed = 1;
    }
    if (!printed) {
        printf("Nothing to print\n");
    }
    return 0;
}
```
```test
=== input
1500 300
=== output
x = 1500
y = 300
```
```test
=== input
2500 50
=== output
Nothing to print
```
```test
=== input
3500 600
=== output
x = 3500
```
```test
=== input
2000 500
=== output
y = 500
```
```hint
Use two separate `if` statements (not an else-if), because both lines may be printed.
```
```hint
Use a flag variable such as `printed` to remember whether anything was printed.
```

# Problem: Languages by letter
id: decisions-language-switch
difficulty: medium
source: Aptech Practice - Condition (Lab) #2

The user types a letter and the program displays the matching language or package, using a `switch` statement. Upper and lower case letters mean the same.

| Letter | Output |
|---|---|
| A or a | `Ada` |
| B or b | `Basic` |
| C or c | `Cobol` |
| D or d | `dBase III` |
| F or f | `Fortran` |
| P or p | `Pascal` |
| V or v | `Visual C++` |

Any other letter prints `Not available`.

**Input:** one character.
**Output:** the text from the table.

```c starter
#include <stdio.h>

int main(void) {
    char ch;
    scanf(" %c", &ch);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    char ch;
    scanf(" %c", &ch);
    switch (ch) {
    case 'A':
    case 'a':
        printf("Ada\n");
        break;
    case 'B':
    case 'b':
        printf("Basic\n");
        break;
    case 'C':
    case 'c':
        printf("Cobol\n");
        break;
    case 'D':
    case 'd':
        printf("dBase III\n");
        break;
    case 'F':
    case 'f':
        printf("Fortran\n");
        break;
    case 'P':
    case 'p':
        printf("Pascal\n");
        break;
    case 'V':
    case 'v':
        printf("Visual C++\n");
        break;
    default:
        printf("Not available\n");
    }
    return 0;
}
```
```test
=== input
a
=== output
Ada
```
```test
=== input
D
=== output
dBase III
```
```test
=== input
v
=== output
Visual C++
```
```test
=== input
E
=== output
Not available
```
```hint
Stack two case labels, `case 'A': case 'a':`, so that both share one block (deliberate fall-through).
```

# Problem: Divisible by 5 and 11
id: decisions-div-5-11
difficulty: easy
source: Lab Manual - Lab 3 Exercise #1

Read an integer and check whether it is divisible by both 5 and 11.

**Input:** one integer.
**Output:** `Yes` if it is divisible by both, otherwise `No`.

```c starter
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    if (n % 5 == 0 && n % 11 == 0) {
        printf("Yes\n");
    } else {
        printf("No\n");
    }
    return 0;
}
```
```test
=== input
55
=== output
Yes
```
```test
=== input
25
=== output
No
```
```test
=== input
0
=== output
Yes
```
```test
=== input
-110
=== output
Yes
```
```hint
Both conditions must be true, so combine `n % 5 == 0` and `n % 11 == 0` with `&&`.
```

# Problem: Even or odd
id: decisions-even-odd
difficulty: easy
source: Lab Manual - Lab 3 Task #3

Read an integer and print whether it is even or odd. Negative numbers count too.

**Input:** one integer.
**Output:** `Even` or `Odd`.

```c starter
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    if (n % 2 == 0) {
        printf("Even\n");
    } else {
        printf("Odd\n");
    }
    return 0;
}
```
```test
=== input
7
=== output
Odd
```
```test
=== input
10
=== output
Even
```
```test
=== input
0
=== output
Even
```
```test
=== input
-3
=== output
Odd
```
```hint
For a negative odd number `n % 2` is -1, not 1. So test for `== 0` and treat everything else as odd.
```

# Problem: Larger of two numbers with ?:
id: decisions-max2-ternary
difficulty: easy
source: Lab Manual - Lab 3 Task #1

Read two integers and print the larger one. Use the conditional operator `?:` instead of if-else.

**Input:** two integers.
**Output:** `Maximum = X`

```c starter
#include <stdio.h>

int main(void) {
    int a, b, max;
    scanf("%d %d", &a, &b);
    // your code here: max = condition ? ... : ... ;
    printf("Maximum = %d\n", max);
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b, max;
    scanf("%d %d", &a, &b);
    max = (a > b) ? a : b;
    printf("Maximum = %d\n", max);
    return 0;
}
```
```test
=== input
5 9
=== output
Maximum = 9
```
```test
=== input
9 5
=== output
Maximum = 9
```
```test
=== input
-3 -8
=== output
Maximum = -3
```
```test
=== input
4 4
=== output
Maximum = 4
```
```hint
`condition ? value_if_true : value_if_false`. Here the condition is `a > b`.
```

# Problem: Quadrant of a point
id: decisions-quadrant
difficulty: medium
source: Class Notes 03 - Conditions (exercise)

Read the coordinates `x` and `y` of a point and say where it lies.

- Both positive: `Quadrant 1`
- x negative, y positive: `Quadrant 2`
- both negative: `Quadrant 3`
- x positive, y negative: `Quadrant 4`
- both zero: `Origin`
- y is 0 (and x is not): `X-axis`
- x is 0 (and y is not): `Y-axis`

**Input:** two integers `x y`.
**Output:** one of the words above.

```c starter
#include <stdio.h>

int main(void) {
    int x, y;
    scanf("%d %d", &x, &y);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int x, y;
    scanf("%d %d", &x, &y);
    if (x == 0 && y == 0) {
        printf("Origin\n");
    } else if (y == 0) {
        printf("X-axis\n");
    } else if (x == 0) {
        printf("Y-axis\n");
    } else if (x > 0 && y > 0) {
        printf("Quadrant 1\n");
    } else if (x < 0 && y > 0) {
        printf("Quadrant 2\n");
    } else if (x < 0 && y < 0) {
        printf("Quadrant 3\n");
    } else {
        printf("Quadrant 4\n");
    }
    return 0;
}
```
```test
=== input
10 15
=== output
Quadrant 1
```
```test
=== input
-3 -5
=== output
Quadrant 3
```
```test
=== input
2 -5
=== output
Quadrant 4
```
```test
=== input
0 7
=== output
Y-axis
```
```hint
Handle the axes and the origin first. After that, only the signs of x and y matter.
```
