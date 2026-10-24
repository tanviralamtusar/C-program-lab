---
id: topic-operators
title: "Topic Test: Operators & Expressions"
group: topic
lesson: operators
order: 102
duration: 25
covers: integer division and %, compound assignment, ++/--, short-circuit && and ||, casting, bitwise operators
summary: Six short questions and two coding problems on arithmetic, increment, logical and bitwise operators.
---

# Question: Division, remainder and the identity
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a = 17, b = 5;
    printf("%d %d %d", a / b, a % b, a / b * b + a % b);
    return 0;
}
~~~
- [ ] 3.4 2 17
- [x] 3 2 17
- [ ] 3 2 15
- [ ] 4 2 22
> 17 / 5 is 3 and 17 % 5 is 2. The identity (a / b) * b + a % b always gives back a, here 3*5 + 2 = 17.
```

# Question: Compound assignment
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int x = 10;
    x += 5;
    x *= 2;
    x /= 4;
    printf("%d ", x);
    x %= 4;
    printf("%d", x);
    return 0;
}
~~~
- [ ] 7.5 3
- [ ] 8 0
- [x] 7 3
- [ ] 7 1
> x: 10, then 15, then 30, then 30 / 4 = 7 (integer division). Then 7 % 4 = 3.
```

# Question: Increment and decrement
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int x = 2, y = 3;
    x++;
    ++y;
    int z = x * y--;
    printf("%d %d %d", x, y, z);
    return 0;
}
~~~
- [ ] 3 4 9
- [ ] 3 3 9
- [x] 3 3 12
- [ ] 2 3 12
> After x++ and ++y we have x = 3 and y = 4. In x * y-- the old value of y (4) is used, so z = 12, and only afterwards y becomes 3.
```

# Question: Short-circuit evaluation
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a = 0, b = 5;
    int r1 = a && b++;
    int r2 = a || b++;
    printf("%d %d %d", r1, r2, b);
    return 0;
}
~~~
- [ ] 0 1 7
- [ ] 0 0 6
- [x] 0 1 6
- [ ] 1 1 7
> Since a is 0, a && ... is false without evaluating b++, so r1 = 0 and b stays 5. In a || b++ the right side must be evaluated: b++ yields 5 (true) so r2 = 1, and b becomes 6.
```

# Question: Casting position matters
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a = 7, b = 2;
    printf("%.2f %.2f", (double)(a / b), (double)a / b);
    return 0;
}
~~~
- [ ] 3.50 3.50
- [ ] 3.00 3.00
- [x] 3.00 3.50
- [ ] 3.50 3.00
> In the first case the integer division 7 / 2 = 3 happens before the cast. In the second, a is converted to 7.0 first, so the division is real.
```

# Question: Testing for odd numbers
marks: 2

```quiz
Which condition is true for every odd integer n, including negative ones such as -3?
- [ ] n % 2 == 1
- [x] n % 2 != 0
- [ ] n / 2 == 1
- [ ] n % 2 == -1
> In C the remainder takes the sign of the left operand, so -3 % 2 is -1 and n % 2 == 1 fails for negative odd numbers. n % 2 != 0 works for all of them.
```

# Problem: Round to the nearest ten
id: topic-operators-round-ten
difficulty: easy
marks: 6
source: Original (topic test)

Read a non-negative integer **n** and round it to the nearest multiple of 10. A number ending in 5 is rounded **up**. Use only integer operators (no `if`, no math library).

**Input:** one integer n (0 ≤ n ≤ 100000).
**Output:** `Rounded = R`

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
    int r = (n + 5) / 10 * 10;
    printf("Rounded = %d\n", r);
    return 0;
}
```

```test
=== input
14
=== output
Rounded = 10
```

```test
=== input
15
=== output
Rounded = 20
```

```test
=== input
7
=== output
Rounded = 10
```

```test
=== input
100
=== output
Rounded = 100
```

```hint
Adding 5 and then dropping the last digit does the rounding: 14 + 5 = 19, 15 + 5 = 20.
```

```hint
Integer division by 10 drops the last digit, and multiplying by 10 puts a zero back: (n + 5) / 10 * 10.
```

# Problem: Set, clear and toggle a bit
id: topic-operators-bit-ops
difficulty: medium
marks: 8
source: Original (topic test)

Read an integer **n** and a bit position **k** (bit 0 is the least significant bit). Print three results:

- `Set` : n with bit k turned on,
- `Clear` : n with bit k turned off,
- `Toggle` : n with bit k flipped.

Use the bitwise operators `|`, `&`, `~`, `^` and the shift `<<` (no `if`).

**Input:** two integers n k (0 ≤ n ≤ 1000, 0 ≤ k ≤ 9).
**Output:** three lines:
```
Set: ...
Clear: ...
Toggle: ...
```

```c starter
#include <stdio.h>

int main(void) {
    int n, k;
    scanf("%d %d", &n, &k);
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, k;
    scanf("%d %d", &n, &k);
    int mask = 1 << k;
    printf("Set: %d\n", n | mask);
    printf("Clear: %d\n", n & ~mask);
    printf("Toggle: %d\n", n ^ mask);
    return 0;
}
```

```test
=== input
10 0
=== output
Set: 11
Clear: 10
Toggle: 11
```

```test
=== input
10 1
=== output
Set: 10
Clear: 8
Toggle: 8
```

```test
=== input
5 3
=== output
Set: 13
Clear: 5
Toggle: 13
```

```test
=== input
0 4
=== output
Set: 16
Clear: 0
Toggle: 16
```

```hint
Build a mask with only bit k on: 1 << k. For k = 3 the mask is 8 (binary 1000).
```

```hint
Set uses n | mask, clear uses n & ~mask (the inverted mask has every bit on except bit k), toggle uses n ^ mask.
```
