---
id: topic-recursion
title: "Topic Test: Recursion"
group: topic
lesson: recursion
order: 110
duration: 30
covers: Base case and recursive case, call order, return values, call counts, recursion on strings and digits
summary: A short 30-minute test on recursion with four trace-the-output questions, two concept questions and two coding problems.
---

# Question: Counting the calls
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

int calls = 0;

int fib(int n) {
    calls++;
    if (n < 2)
        return n;
    return fib(n - 1) + fib(n - 2);
}

int main(void) {
    int r = fib(5);
    printf("%d %d", r, calls);
    return 0;
}
~~~
- [ ] 5 5
- [ ] 5 9
- [x] 5 15
- [ ] 8 15
> fib(5) is 5. Every call (including the ones that hit the base case) adds 1 to `calls`; the call tree for n = 5 has 15 nodes.
```

# Question: Work before and between the calls
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

void p(int n) {
    if (n > 0) {
        p(n - 1);
        printf("%d ", n);
        p(n - 2);
    }
}

int main(void) {
    p(3);
    return 0;
}
~~~
- [ ] 3 2 1
- [ ] 1 2 3
- [x] 1 2 3 1
- [ ] 1 2 1 3 1
> p(3) first runs p(2), then prints 3, then runs p(1). p(2) prints "1 2" (via p(1) then print 2, then p(0) does nothing) and the final p(1) prints "1". Result: 1 2 3 1.
```

# Question: Doubling recurrence
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

int f(int n) {
    if (n == 0)
        return 1;
    return 2 * f(n - 1) + 1;
}

int main(void) {
    printf("%d", f(3));
    return 0;
}
~~~
- [ ] 8
- [ ] 7
- [x] 15
- [ ] 9
> f(0)=1, f(1)=2*1+1=3, f(2)=2*3+1=7, f(3)=2*7+1=15.
```

# Question: Recursion on a string
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

void rev(const char *s) {
    if (*s == '\0')
        return;
    rev(s + 1);
    putchar(*s);
}

int main(void) {
    rev("stack");
    return 0;
}
~~~
- [ ] stack
- [x] kcats
- [ ] skcat
- [ ] ctats
> The putchar happens after the recursive call returns, so the characters are printed in the reverse order of the calls: k c a t s.
```

# Question: Missing base case
marks: 2

```quiz
Why does this function crash for every input?
~~~
int fact(int n) {
    return n * fact(n - 1);
}
~~~
- [ ] `fact` has the wrong return type
- [x] There is no base case, so the calls never stop and the stack overflows
- [ ] A function cannot call itself with n - 1
- [ ] `n * fact(n - 1)` is not allowed for int
> A recursive function needs a base case that returns without another recursive call, e.g. `if (n <= 1) return 1;`. Without it the calls pile up until the stack is exhausted.
```

# Question: Local variables in recursion
marks: 2

```quiz
Which statement about local variables in a recursive function is true?
- [ ] All the active calls share one copy of each local variable
- [x] Each active call has its own copy of the parameters and local variables
- [ ] Local variables are kept only for the first call
- [ ] Local variables are automatically static in recursive functions
> Every call gets its own stack frame with its own parameters and locals. Only static or global variables are shared between calls.
```

# Problem: Count a digit
id: topic-recursion-count-digit
difficulty: easy
marks: 6
source: Original (topic test)

Write a **recursive** function `int countDigit(int n, int d)` that returns how many times the digit **d** appears in the non-negative integer **n** (no loops inside the function). Remember that `0` has one digit.

**Input:** two integers `n d` (0 ≤ n ≤ 1000000000, 0 ≤ d ≤ 9).
**Output:** `Count = C`

```c starter
#include <stdio.h>

int countDigit(int n, int d) {
    // your code here
}

int main(void) {
    int n, d;
    scanf("%d %d", &n, &d);
    printf("Count = %d\n", countDigit(n, d));
    return 0;
}
```

```c solution
#include <stdio.h>

int countDigit(int n, int d) {
    if (n < 10)
        return n == d;
    return (n % 10 == d) + countDigit(n / 10, d);
}

int main(void) {
    int n, d;
    scanf("%d %d", &n, &d);
    printf("Count = %d\n", countDigit(n, d));
    return 0;
}
```

```test
=== input
1223 2
=== output
Count = 2
```

```test
=== input
0 0
=== output
Count = 1
```

```test
=== input
5050 0
=== output
Count = 2
```

```test
=== input
777 3
=== output
Count = 0
```

```hint
Base case: when `n < 10` it is a single digit, so the answer is 1 if `n == d` and 0 otherwise. That also handles `n = 0`.
```

```hint
Recursive case: look at the last digit `n % 10`, add 1 if it equals `d`, and add the count for the remaining digits `n / 10`.
```

# Problem: Binary and staircase
id: topic-recursion-binary-stairs
difficulty: medium
marks: 8
source: Original (topic test)

Write two **recursive** functions:

- `void printBinary(int n)` prints the binary form of **n** (no newline, no leading zeros; `0` prints as `0`),
- `int ways(int n)` returns the number of ways to climb **n** stairs when each move is 1 or 2 stairs. Use `ways(0) = 1` and `ways(1) = 1`; for larger n, `ways(n) = ways(n-1) + ways(n-2)`.

Read **n** and print both results.

**Input:** one integer n (0 ≤ n ≤ 15).
**Output:** two lines:

```
Binary = <binary form of n>
Ways = <number of ways>
```

```c starter
#include <stdio.h>

void printBinary(int n) {
    // your code here
}

int ways(int n) {
    // your code here
}

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Binary = ");
    printBinary(n);
    printf("\nWays = %d\n", ways(n));
    return 0;
}
```

```c solution
#include <stdio.h>

void printBinary(int n) {
    if (n > 1)
        printBinary(n / 2);
    printf("%d", n % 2);
}

int ways(int n) {
    if (n <= 1)
        return 1;
    return ways(n - 1) + ways(n - 2);
}

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Binary = ");
    printBinary(n);
    printf("\nWays = %d\n", ways(n));
    return 0;
}
```

```test
=== input
10
=== output
Binary = 1010
Ways = 89
```

```test
=== input
0
=== output
Binary = 0
Ways = 1
```

```test
=== input
1
=== output
Binary = 1
Ways = 1
```

```test
=== input
15
=== output
Binary = 1111
Ways = 987
```

```hint
For the binary form, the last bit `n % 2` must be printed **after** the bits of `n / 2`. So recurse first, then print.
```

```hint
Base case of printBinary: when `n` is 0 or 1 just print it. For `ways`, `n <= 1` returns 1; otherwise add the two smaller cases.
```
