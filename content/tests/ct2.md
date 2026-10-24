---
id: ct2
title: Class Test 2
order: 2
duration: 45
covers: Loops (while, do-while, for), break/continue, nested loops and patterns
summary: Trace loops, spot common loop bugs, and write digit-based and pattern programs.
---

# Question: How many times does the loop run?
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i = 10, count = 0;
    while (i > 0) {
        i -= 3;
        count++;
    }
    printf("%d %d", i, count);
    return 0;
}
~~~
- [ ] 1 3
- [x] -2 4
- [ ] 0 4
- [ ] -2 3
> i takes the values 10, 7, 4, 1 inside the condition test (all > 0), so the body runs 4 times. After the last subtraction i is 1 - 3 = -2, which stops the loop.
```

# Question: do-while runs at least once
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int n = 5;
    do {
        printf("%d ", n);
        n++;
    } while (n < 5);
    printf("n=%d", n);
    return 0;
}
~~~
- [ ] n=5
- [ ] 5 n=5
- [x] 5 n=6
- [ ] 5 6 n=7
> A do-while checks its condition after the body. The body prints 5 and makes n equal to 6; then 6 < 5 is false, so the loop ends and n=6 is printed.
```

# Question: The stray semicolon
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i, sum = 0;
    for (i = 1; i <= 5; i++);
        sum += i;
    printf("sum=%d i=%d", sum, i);
    return 0;
}
~~~
- [ ] sum=15 i=5
- [ ] sum=15 i=6
- [ ] sum=5 i=5
- [x] sum=6 i=6
> The semicolon after the for(...) is an empty loop body, so the loop only counts i up to 6. The statement sum += i is then executed once, outside the loop, adding 6 to 0.
```

# Question: continue
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i;
    for (i = 1; i <= 8; i++) {
        if (i % 3 == 0)
            continue;
        printf("%d ", i);
    }
    return 0;
}
~~~
- [ ] 1 2
- [ ] 3 6
- [x] 1 2 4 5 7 8
- [ ] 1 2 3 4 5 6 7 8
> continue skips the rest of the current iteration, so the multiples of 3 (3 and 6) are not printed. The loop itself keeps going until i is 8.
```

# Question: break inside nested loops
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i, j;
    for (i = 1; i <= 3; i++) {
        for (j = 1; j <= 3; j++) {
            if (j == 2)
                break;
            printf("%d%d ", i, j);
        }
    }
    return 0;
}
~~~
- [ ] 11 12 13
- [x] 11 21 31
- [ ] 11
- [ ] 11 21 31 12 22 32
> break leaves only the inner loop. For each i, the inner loop prints j = 1 and stops when j becomes 2. The outer loop continues with the next i, giving 11 21 31.
```

# Question: Nested loop with a changing start
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i, j;
    for (i = 1; i <= 3; i++) {
        for (j = i; j <= 3; j++)
            printf("%d", j);
        printf("-");
    }
    return 0;
}
~~~
- [ ] 123-123-123-
- [ ] 1-12-123-
- [x] 123-23-3-
- [ ] 123-23-3
> The inner loop starts at j = i. For i = 1 it prints 123, for i = 2 it prints 23, for i = 3 it prints 3. A "-" is printed after each inner loop, including the last one.
```

# Question: Factorial off by one
marks: 2

```quiz
A student wants to compute n! (for n >= 1) but the program prints 24 when n is 5. What is the bug?
~~~
int n = 5, i, f = 1;
for (i = 1; i < n; i++)
    f = f * i;
printf("%d", f);
~~~
- [ ] f should be initialised to 0
- [x] the condition should be i <= n, because with i < n the loop never multiplies by n
- [ ] the loop should start from i = 0
- [ ] f = f * i should be f = f + i
> With i < n the loop multiplies 1 * 2 * 3 * 4 = 24 = 4!. Using i <= n includes the last factor and gives 120. Starting from 0 would make the product 0 forever.
```

# Question: The loop that never ends
marks: 2

```quiz
This code is meant to print the numbers 1 to 10, but it never stops. Why?
~~~
int i = 1;
while (i <= 10) {
    printf("%d\n", i);
}
~~~
- [ ] while must be replaced by do-while
- [ ] The condition should be i < 10
- [x] i is never changed inside the loop, so i <= 10 is always true; i++ is missing
- [ ] printf cannot be used inside a while loop
> The loop condition depends on i, but nothing in the body updates i. Adding i++; after the printf makes the loop terminate after printing 10.
```

# Problem: Count the even digits
id: ct2-even-digits
difficulty: easy
source: Original (mock test)
marks: 6

Read a positive integer **N** and count how many of its digits are even. Remember that 0 is an even digit.

**Input:** one integer N (1 ≤ N ≤ 1000000000).
**Output:** `Even digits = C`

```c starter
#include <stdio.h>

int main(void) {
    int n, count = 0;
    scanf("%d", &n);
    // your code here: look at one digit at a time
    printf("Even digits = %d\n", count);
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, count = 0;
    scanf("%d", &n);
    while (n > 0) {
        int digit = n % 10;
        if (digit % 2 == 0)
            count++;
        n /= 10;
    }
    printf("Even digits = %d\n", count);
    return 0;
}
```

```test
=== input
482915
=== output
Even digits = 3
```

```test
=== input
1357
=== output
Even digits = 0
```

```test
=== input
100200
=== output
Even digits = 5
```

```test
=== input
8
=== output
Even digits = 1
```

```hint
`n % 10` gives the last digit and `n / 10` removes it. Repeat while `n > 0`.
```

```hint
A digit `d` is even when `d % 2 == 0`. Increase the counter only in that case.
```

# Problem: Harshad number
id: ct2-harshad
difficulty: medium
source: Original (mock test)
marks: 8

A positive integer is a **Harshad (Niven) number** if it is divisible by the sum of its digits. For example, 18 has digit sum 1 + 8 = 9 and 18 is divisible by 9, so it is a Harshad number.

Read a positive integer **N**, then print its digit sum, its largest digit, and whether it is a Harshad number.

**Input:** one integer N (1 ≤ N ≤ 1000000000).
**Output:** three lines:
`Digit sum = S`
`Largest digit = L`
`N is a Harshad number` or `N is not a Harshad number`

```c starter
#include <stdio.h>

int main(void) {
    int n, original, sum = 0, largest = 0;
    scanf("%d", &n);
    original = n;
    // your code here: extract each digit, update sum and largest
    printf("Digit sum = %d\n", sum);
    printf("Largest digit = %d\n", largest);
    // print whether original is a Harshad number
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, original, sum = 0, largest = 0;
    scanf("%d", &n);
    original = n;
    while (n > 0) {
        int digit = n % 10;
        sum += digit;
        if (digit > largest)
            largest = digit;
        n /= 10;
    }
    printf("Digit sum = %d\n", sum);
    printf("Largest digit = %d\n", largest);
    if (original % sum == 0)
        printf("%d is a Harshad number\n", original);
    else
        printf("%d is not a Harshad number\n", original);
    return 0;
}
```

```test
=== input
18
=== output
Digit sum = 9
Largest digit = 8
18 is a Harshad number
```

```test
=== input
19
=== output
Digit sum = 10
Largest digit = 9
19 is not a Harshad number
```

```test
=== input
1729
=== output
Digit sum = 19
Largest digit = 9
1729 is a Harshad number
```

```test
=== input
1
=== output
Digit sum = 1
Largest digit = 1
1 is a Harshad number
```

```hint
The loop destroys `n` while extracting digits, so save the original value in another variable first.
```

```hint
Keep `largest` starting at 0 and update it with `if (digit > largest) largest = digit;`. After the loop, test `original % sum == 0`.
```

# Problem: Mirrored number pyramid
id: ct2-mirror-pyramid
difficulty: medium
source: Original (mock test)
marks: 8

Read an integer **N** and print a pyramid of N rows. Row *i* (1-based) has `N - i` leading spaces, then the digits `1, 2, ..., i`, then the digits `i-1, ..., 2, 1` (mirrored). There must be no trailing spaces on any line.

For N = 4 the output is:

```
   1
  121
 12321
1234321
```

**Input:** one integer N (1 ≤ N ≤ 9).
**Output:** the pyramid, one row per line.

```c starter
#include <stdio.h>

int main(void) {
    int n, i, j;
    scanf("%d", &n);
    for (i = 1; i <= n; i++) {
        // 1) print n - i spaces
        // 2) print 1 .. i
        // 3) print i-1 down to 1
        printf("\n");
    }
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, i, j;
    scanf("%d", &n);
    for (i = 1; i <= n; i++) {
        for (j = 1; j <= n - i; j++)
            printf(" ");
        for (j = 1; j <= i; j++)
            printf("%d", j);
        for (j = i - 1; j >= 1; j--)
            printf("%d", j);
        printf("\n");
    }
    return 0;
}
```

```test
=== input
4
=== output
   1
  121
 12321
1234321
```

```test
=== input
1
=== output
1
```

```test
=== input
2
=== output
 1
121
```

```test
=== input
5
=== output
    1
   121
  12321
 1234321
123454321
```

```hint
Each row needs three inner loops: one for the leading spaces, one counting up from 1 to i, and one counting down from i - 1 to 1.
```

```hint
Row 1 of N = 4 has 3 spaces, then `1`. The down-counting loop `for (j = i - 1; j >= 1; j--)` does nothing when i = 1, which is exactly right.
```
