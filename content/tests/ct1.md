---
id: ct1
title: Class Test 1
order: 1
duration: 40
covers: Basics, printf/scanf, data types, operators, decision making (if/else, switch, ?:)
summary: Eight short trace-and-concept questions plus three auto-judged coding problems on basics, operators and decisions.
---

# Question: Division and remainder with a negative number
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a = -7, b = 2;
    printf("%d %d", a / b, a % b);
    return 0;
}
~~~
- [ ] -4 1
- [x] -3 -1
- [ ] -3 1
- [ ] -3.5 -1
> Integer division truncates toward zero, so -7 / 2 is -3. The remainder takes the sign of the left operand, so -7 % 2 is -1 (check: -3*2 + (-1) = -7).
```

# Question: Pre and post increment
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int x = 5;
    int a = x++;
    int b = ++x;
    int c = x--;
    printf("%d %d %d %d", a, b, c, x);
    return 0;
}
~~~
- [ ] 5 6 7 6
- [ ] 6 7 7 6
- [x] 5 7 7 6
- [ ] 5 7 6 6
> a gets 5, then x becomes 6. ++x makes x 7 and b gets 7. c gets 7 and then x drops to 6.
```

# Question: Operator precedence
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a = 2, b = 3, c = 4;
    printf("%d %d %d", a + b * c % 5, (a + b) * c % 5, a + b > c && c - b);
    return 0;
}
~~~
- [ ] 0 0 1
- [ ] 4 4 1
- [x] 4 0 1
- [ ] 4 0 0
> * and % have equal precedence and go left to right: b*c = 12, 12%5 = 2, then a + 2 = 4. (a+b)*c = 20 and 20%5 = 0. a+b > c is 1 and c-b is 1, so && gives 1.
```

# Question: Character arithmetic
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    char ch = 'A';
    ch = ch + 3;
    printf("%c %d %c", ch, ch - 'A', 'a' + (ch - 'A'));
    return 0;
}
~~~
- [ ] D 68 d
- [x] D 3 d
- [ ] C 3 c
- [ ] D 3 D
> 'A' + 3 is 'D'. ch - 'A' is the plain number 3. 'a' + 3 is 'd', printed with %c.
```

# Question: Switch fall-through
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int n = 2, s = 0;
    switch (n) {
        case 1: s += 1;
        case 2: s += 2;
        case 3: s += 3; break;
        case 4: s += 4;
        default: s += 10;
    }
    printf("%d", s);
    return 0;
}
~~~
- [ ] 2
- [x] 5
- [ ] 15
- [ ] 19
> Execution jumps to case 2 and adds 2. With no break it falls into case 3 and adds 3, then break leaves the switch. Total 5.
```

# Question: The assignment-in-condition bug
marks: 2

```quiz
A student reads x and wants to print "Zero" when x is 0:
~~~
int x;
scanf("%d", &x);
if (x = 0)
    printf("Zero");
else
    printf("Non-zero");
~~~
The student types 0 and is surprised by the result. What is wrong?
- [ ] scanf cannot read into x
- [x] x = 0 assigns 0 to x and the condition is then always false, so "Non-zero" is always printed
- [ ] "Zero" is always printed because x is 0
- [ ] The program does not compile
> = is assignment, == is comparison. The expression (x = 0) has the value 0 (false) for every input, so the else branch always runs. The fix is if (x == 0).
```

# Question: Dangling else
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a = 1, b = 0;
    if (a)
        if (b)
            printf("A");
        else
            printf("B");
    printf("C");
    return 0;
}
~~~
- [ ] C
- [ ] AC
- [x] BC
- [ ] B
> An else belongs to the nearest unmatched if, here if (b). Since a is true and b is false, B is printed. printf("C") is outside both ifs and always runs.
```

# Question: Checking a range
marks: 2

```quiz
Which condition correctly tests that x lies between 10 and 20, inclusive?
- [ ] 10 <= x <= 20
- [ ] x >= 10 || x <= 20
- [x] x >= 10 && x <= 20
- [ ] x > 10 && x < 20
> C has no chained comparison: 10 <= x <= 20 is (10 <= x) <= 20, which is always true because (10 <= x) is 0 or 1. || accepts every number. The last option excludes 10 and 20.
```

# Problem: Triangle validity and type
id: ct1-triangle
difficulty: easy
marks: 6
source: Original (mock test)

Read the lengths of three sides **a**, **b** and **c** (integers). If they cannot form a triangle, print `Not a triangle`. Three sides form a triangle only if all are positive and the sum of any two sides is **greater than** the third side. Otherwise print the type:

- `Equilateral` if all three sides are equal,
- `Isosceles` if exactly two sides are equal,
- `Scalene` if all sides are different.

**Input:** three integers a b c.
**Output:** one of the four words/phrases above.

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
    if (a <= 0 || b <= 0 || c <= 0 || a + b <= c || a + c <= b || b + c <= a)
        printf("Not a triangle\n");
    else if (a == b && b == c)
        printf("Equilateral\n");
    else if (a == b || b == c || a == c)
        printf("Isosceles\n");
    else
        printf("Scalene\n");
    return 0;
}
```

```test
=== input
3 4 5
=== output
Scalene
```

```test
=== input
6 6 6
=== output
Equilateral
```

```test
=== input
5 8 5
=== output
Isosceles
```

```test
=== input
1 2 3
=== output
Not a triangle
```

```hint
Check validity first. A "degenerate" case such as 1 2 3 is not a triangle because 1 + 2 is not greater than 3.
```

```hint
Use an if / else if chain: not a triangle, then equilateral, then isosceles, and the remaining case is scalene. Test "all equal" before "any two equal".
```

# Problem: 24-hour to 12-hour clock
id: ct1-clock12
difficulty: easy
marks: 6
source: Original (mock test)

Read a time in 24-hour format: the hour **h** (0 to 23) and the minute **m** (0 to 59). Print it in 12-hour format as `HH:MM AM` or `HH:MM PM`, where both HH and MM have two digits (leading zero if needed). Midnight is `12:00 AM` and noon is `12:00 PM`.

**Input:** two integers h m.
**Output:** the time, for example `01:45 PM`.

```c starter
#include <stdio.h>

int main(void) {
    int h, m;
    scanf("%d %d", &h, &m);
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int h, m;
    scanf("%d %d", &h, &m);
    char period = (h < 12) ? 'A' : 'P';
    int h12 = h % 12;
    if (h12 == 0)
        h12 = 12;
    printf("%02d:%02d %cM\n", h12, m, period);
    return 0;
}
```

```test
=== input
9 30
=== output
09:30 AM
```

```test
=== input
13 45
=== output
01:45 PM
```

```test
=== input
0 5
=== output
12:05 AM
```

```test
=== input
12 0
=== output
12:00 PM
```

```hint
AM is for hours 0 to 11 and PM for 12 to 23. A ?: expression can choose the letter A or P.
```

```hint
h % 12 gives 0 for both 0 and 12, but the clock shows 12 in those cases. Fix that with one if. Use %02d to print two digits.
```

# Problem: Electricity bill with slabs and surcharge
id: ct1-elec-bill
difficulty: medium
marks: 8
source: Original (mock test)

An electricity company charges by slabs of units consumed:

| Units | Rate per unit |
|---|---|
| first 100 units | 4.00 |
| next 100 units (101 to 200) | 6.00 |
| every unit above 200 | 9.00 |

Each slab rate applies only to the units inside that slab. If the total computed bill is **more than 1500**, a 10% surcharge is added to it. Read the units consumed and print the final bill.

**Input:** one integer units (0 ≤ units ≤ 1000).
**Output:** `Bill = X.XX` (two decimal places).

```c starter
#include <stdio.h>

int main(void) {
    int units;
    scanf("%d", &units);
    double bill = 0;
    // your code here
    printf("Bill = %.2f\n", bill);
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int units;
    scanf("%d", &units);
    double bill;
    if (units <= 100)
        bill = units * 4.0;
    else if (units <= 200)
        bill = 100 * 4.0 + (units - 100) * 6.0;
    else
        bill = 100 * 4.0 + 100 * 6.0 + (units - 200) * 9.0;
    if (bill > 1500)
        bill = bill * 1.10;
    printf("Bill = %.2f\n", bill);
    return 0;
}
```

```test
=== input
80
=== output
Bill = 320.00
```

```test
=== input
150
=== output
Bill = 700.00
```

```test
=== input
250
=== output
Bill = 1450.00
```

```test
=== input
300
=== output
Bill = 2090.00
```

```hint
Work out the bill in three cases: up to 100 units, 101 to 200 units, and above 200. In the second case, the first 100 units cost 100 * 4 and only the remaining units cost 6 each.
```

```hint
For 300 units: 100*4 + 100*6 + 100*9 = 1900. Since 1900 > 1500, add 10% to get 2090.00. For 250 units the bill is 1450, which is not more than 1500, so there is no surcharge.
```
