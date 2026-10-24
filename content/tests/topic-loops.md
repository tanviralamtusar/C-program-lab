---
id: topic-loops
title: "Topic Test: Loops"
group: topic
lesson: loops
order: 104
duration: 30
covers: while, do-while, for, break/continue, loop bugs
summary: A short topic test on tracing loops, spotting classic loop bugs and writing two loop programs.
---

# Question: Doubling until the limit
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i = 1, c = 0;
    while (i < 50) {
        i *= 2;
        c++;
    }
    printf("%d %d", i, c);
    return 0;
}
~~~
- [ ] 32 5
- [x] 64 6
- [ ] 50 6
- [ ] 64 7
> i goes 1, 2, 4, 8, 16, 32 (all < 50, so the body runs again) and then 64. The body ran 6 times and the loop stops because 64 < 50 is false.
```

# Question: Value of the counter after a for loop
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i;
    for (i = 0; i < 10; i += 3)
        printf("%d ", i);
    printf("| %d", i);
    return 0;
}
~~~
- [ ] 0 3 6 9 | 9
- [x] 0 3 6 9 | 12
- [ ] 3 6 9 | 12
- [ ] 0 3 6 | 9
> i takes 0, 3, 6, 9 inside the loop. Then i becomes 12, the test 12 < 10 fails, and the loop ends with i still equal to 12.
```

# Question: break stops the whole loop
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i, sum = 0;
    for (i = 1; i <= 10; i++) {
        sum += i;
        if (sum > 10)
            break;
    }
    printf("%d %d", i, sum);
    return 0;
}
~~~
- [ ] 10 55
- [ ] 4 10
- [x] 5 15
- [ ] 6 15
> The running sum is 1, 3, 6, 10, 15. At i = 5 the sum becomes 15 which is greater than 10, so break leaves the loop immediately with i = 5.
```

# Question: A loop inside a loop
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i, j;
    for (i = 0; i < 3; i++) {
        for (j = 0; j < i; j++)
            printf("*");
        printf("%d ", i);
    }
    return 0;
}
~~~
- [ ] 0 1 2
- [ ] *0 **1 ***2
- [x] 0 *1 **2
- [ ] 0 *1 **2 ***3
> The inner loop prints i stars before the number i is printed. For i = 0 no star, for i = 1 one star, for i = 2 two stars.
```

# Question: Assignment instead of comparison
marks: 2

```quiz
This loop is supposed to stop when x reaches 5, but it never stops. What is the bug?
~~~
int x = 0;
while (x = 5) {
    x--;
}
~~~
- [ ] x-- should be x++
- [x] x = 5 assigns 5 to x each time, and the value 5 is true, so the condition never fails; it should be x != 5 or x < 5
- [ ] while cannot be used with an int variable
- [ ] x must be declared as unsigned
> The single = is an assignment. The condition (x = 5) has the value 5 which is non-zero (true), so the loop repeats forever. Comparison needs ==, != or <.
```

# Question: Off-by-one in loop limits
marks: 2

```quiz
Which loop prints exactly the numbers 1 2 3 4 5 (and nothing else)?
- [ ] for (i = 1; i < 5; i++) printf("%d ", i);
- [ ] for (i = 0; i <= 5; i++) printf("%d ", i);
- [x] for (i = 1; i <= 5; i++) printf("%d ", i);
- [ ] for (i = 1; i <= 6; i++) printf("%d ", i);
> i < 5 stops at 4, starting from 0 prints an extra 0, and i <= 6 prints an extra 6. Start at 1 and use i <= 5 to print 1 to 5.
```

# Problem: Multiples of 3 or 5
id: topic-loops-multiples
difficulty: easy
source: Original (topic test)
marks: 6

Read a positive integer **N** and print the sum of all numbers from 1 to N (inclusive) that are divisible by 3 or by 5. A number such as 15 that is divisible by both must be added only once.

**Input:** one integer N (1 ≤ N ≤ 10000).
**Output:** `Sum = S`

```c starter
#include <stdio.h>

int main(void) {
    int n, i, sum = 0;
    scanf("%d", &n);
    // your code here: loop from 1 to n
    printf("Sum = %d\n", sum);
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, i, sum = 0;
    scanf("%d", &n);
    for (i = 1; i <= n; i++) {
        if (i % 3 == 0 || i % 5 == 0)
            sum += i;
    }
    printf("Sum = %d\n", sum);
    return 0;
}
```

```test
=== input
10
=== output
Sum = 33
```

```test
=== input
1
=== output
Sum = 0
```

```test
=== input
20
=== output
Sum = 98
```

```test
=== input
100
=== output
Sum = 2418
```

```hint
Use one `for` loop from 1 to N and an `if` inside it.
```

```hint
Use `||` (or), not two separate `if` statements, so that 15 is counted only once.
```

# Problem: Collatz steps
id: topic-loops-collatz
difficulty: medium
source: Original (topic test)
marks: 8

Start with a positive integer **N**. Repeat until the number becomes 1: if the number is even, divide it by 2; if it is odd, replace it by 3 * number + 1. Count how many steps this takes and remember the largest value that appears (including the starting number).

For N = 6 the sequence is 6, 3, 10, 5, 16, 8, 4, 2, 1: there are 8 steps and the maximum is 16.

**Input:** one integer N (1 ≤ N ≤ 10000).
**Output:** two lines:
`Steps = S`
`Maximum = M`

```c starter
#include <stdio.h>

int main(void) {
    int n, steps = 0, max;
    scanf("%d", &n);
    max = n;
    // your code here: repeat while n is not 1
    printf("Steps = %d\n", steps);
    printf("Maximum = %d\n", max);
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, steps = 0, max;
    scanf("%d", &n);
    max = n;
    while (n != 1) {
        if (n % 2 == 0)
            n = n / 2;
        else
            n = 3 * n + 1;
        steps++;
        if (n > max)
            max = n;
    }
    printf("Steps = %d\n", steps);
    printf("Maximum = %d\n", max);
    return 0;
}
```

```test
=== input
6
=== output
Steps = 8
Maximum = 16
```

```test
=== input
1
=== output
Steps = 0
Maximum = 1
```

```test
=== input
7
=== output
Steps = 16
Maximum = 52
```

```test
=== input
27
=== output
Steps = 111
Maximum = 9232
```

```hint
You do not know in advance how many steps are needed, so use `while (n != 1)`.
```

```hint
Inside the loop: change n (even or odd rule), add 1 to `steps`, then update `max` if the new n is larger.
```
