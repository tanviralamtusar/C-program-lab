---
id: recursion
title: Recursion
order: 10
summary: Functions that call themselves - base case, recursive case, the call stack, and classic problems like factorial, Fibonacci, GCD, binary search, Tower of Hanoi and subsets.
---

# Step: What is recursion?

A **recursive function** is a function that calls **itself**. It solves a big problem by solving a slightly smaller copy of the same problem, again and again, until the problem becomes so small that the answer is obvious.

Every correct recursive function has two parts:

1. **Base case** - the smallest problem, answered directly, with *no* further recursive call. It is the stopping rule.
2. **Recursive case** - the function calls itself with a **smaller** input that moves closer to the base case.

Think of a countdown: to count down from 3, print 3, then "count down from 2". The countdown from 0 is the base case: just say "Liftoff!".

```c run
#include <stdio.h>

void countdown(int n) {
    if (n == 0) {              /* base case */
        printf("Liftoff!\n");
        return;
    }
    printf("%d\n", n);
    countdown(n - 1);          /* recursive case: smaller input */
}

int main(void) {
    countdown(3);
    return 0;
}
```
```output
3
2
1
Liftoff!
```

> **Tip:** Press **Visualize** and step through. Each call to `countdown` adds a new **frame** to the stack, with its own copy of `n`. Watch four frames pile up (n = 3, 2, 1, 0).

### Common mistakes

- **No base case** (or a base case that is never reached): the function calls itself forever until the program crashes with a *stack overflow*.
- **Not making the problem smaller**: calling `countdown(n)` instead of `countdown(n - 1)` never reaches the base case.

```quiz
Which part of a recursive function stops the chain of calls?
- [ ] The recursive case
- [x] The base case
- [ ] The return type
- [ ] The main function
> The base case returns an answer directly without calling the function again, so the calls stop there.
```

```quiz
What happens if a recursive function has no reachable base case?
- [ ] It prints nothing and returns 0
- [ ] The compiler refuses to compile it
- [x] It keeps calling itself until the stack runs out (stack overflow)
- [ ] It runs exactly once
> Each call needs a stack frame. Without a stopping rule, frames pile up until memory for the stack is exhausted.
```

# Step: The call stack and factorial

The factorial of n is `n! = n * (n-1) * ... * 1`, and `0! = 1`. Notice that `n! = n * (n-1)!`. That is already a recursive definition:

- base case: `0! = 1`
- recursive case: `n! = n * (n-1)!`

```c run
#include <stdio.h>

int fact(int n) {
    if (n == 0)
        return 1;              /* base case */
    return n * fact(n - 1);    /* recursive case */
}

int main(void) {
    printf("0! = %d\n", fact(0));
    printf("5! = %d\n", fact(5));
    return 0;
}
```
```output
0! = 1
5! = 120
```

How does `fact(3)` really run? The computer keeps a **call stack**. Each call gets a frame holding its own `n`. A call *waits* for the call it made, then multiplies.

```
fact(3)  ->  3 * fact(2)
                  fact(2)  ->  2 * fact(1)
                                   fact(1)  ->  1 * fact(0)
                                                    fact(0) -> 1   (base case)
                                   fact(1) = 1 * 1 = 1
                  fact(2) = 2 * 1 = 2
fact(3) = 3 * 2 = 6
```

The calls go **down** to the base case, then the answers flow **back up** as each frame returns.

> **Tip:** In the visualizer, step into `fact(5)` and watch six frames stack up; then watch them vanish one by one as each `return` hands its value to the frame below.

### Common mistakes

- Writing `return fact(n - 1);` and forgetting the `n *` part - the answer would always be 1.
- Using `int` for large factorials: `13!` already overflows `int`. Use `long long` for bigger values.

```quiz
How many calls to `fact` happen (including the first) when we run `fact(3)` with the code above?
- [ ] 3
- [x] 4
- [ ] 6
- [ ] 1
> fact(3), fact(2), fact(1) and fact(0): four calls. The last one hits the base case.
```

```quiz
What does `fact(4)` return?
- [ ] 10
- [ ] 16
- [x] 24
- [ ] 120
> 4 * 3 * 2 * 1 = 24.
```

# Step: Sum, power and digits

The same recipe - *base case + smaller problem* - solves many tasks. Ask: "if I already had the answer for the smaller problem, how would I finish?"

| Task | Base case | Recursive case |
|---|---|---|
| sum 1..n | `n == 0` gives 0 | `n + sumTo(n-1)` |
| power a^b | `b == 0` gives 1 | `a * power(a, b-1)` |
| digit sum | `n == 0` gives 0 | `n % 10 + digitSum(n / 10)` |

`n % 10` is the last digit and `n / 10` is the number without its last digit - so removing digits makes the problem smaller.

```c run
#include <stdio.h>

int sumTo(int n) {
    if (n == 0) return 0;
    return n + sumTo(n - 1);
}

int power(int a, int b) {
    if (b == 0) return 1;
    return a * power(a, b - 1);
}

int digitSum(int n) {
    if (n == 0) return 0;
    return n % 10 + digitSum(n / 10);
}

int main(void) {
    printf("sumTo(10) = %d\n", sumTo(10));
    printf("power(2, 10) = %d\n", power(2, 10));
    printf("digitSum(1234) = %d\n", digitSum(1234));
    return 0;
}
```
```output
sumTo(10) = 55
power(2, 10) = 1024
digitSum(1234) = 10
```

> **Tip:** Trace `digitSum(1234)` in the visualizer: n becomes 1234, 123, 12, 1, 0 in successive frames.

### Common mistakes

- Using `n / 10` but forgetting the base case `n == 0` - the number reaches 0 and the calls would continue forever with `0 / 10`.
- For `power`, handling only `b > 0`. Always put the `b == 0` base case first.

```quiz
Which line is the base case of `digitSum`?
~~~
int digitSum(int n) {
    if (n == 0) return 0;
    return n % 10 + digitSum(n / 10);
}
~~~
- [ ] `return n % 10 + digitSum(n / 10);`
- [x] `if (n == 0) return 0;`
- [ ] `int digitSum(int n)`
- [ ] `n / 10`
> When n reaches 0 there are no digits left, so the sum is 0 and no further call is made.
```

```quiz
What does `power(3, 2)` return with the code above?
- [ ] 6
- [x] 9
- [ ] 5
- [ ] 8
> power(3,2) = 3 * power(3,1) = 3 * 3 * power(3,0) = 3 * 3 * 1 = 9.
```

# Step: Fibonacci and GCD

**Fibonacci**: each number is the sum of the two before it: 0, 1, 1, 2, 3, 5, 8, ... Here there are **two** base cases: `fib(0) = 0` and `fib(1) = 1`, and `fib(n) = fib(n-1) + fib(n-2)`.

**GCD** (greatest common divisor) by Euclid's rule: `gcd(a, b) = gcd(b, a % b)`, and when `b == 0` the answer is `a`.

```c run
#include <stdio.h>

int fib(int n) {
    if (n == 0) return 0;
    if (n == 1) return 1;
    return fib(n - 1) + fib(n - 2);
}

int gcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}

int main(void) {
    int i;
    printf("Fibonacci: ");
    for (i = 0; i < 10; i++) {
        if (i > 0) printf(", ");
        printf("%d", fib(i));
    }
    printf("\n");
    printf("gcd(48, 18) = %d\n", gcd(48, 18));
    return 0;
}
```
```output
Fibonacci: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
gcd(48, 18) = 6
```

`gcd(48, 18)` becomes `gcd(18, 12)`, then `gcd(12, 6)`, then `gcd(6, 0)` which returns 6.

> **Tip:** Visualize `fib(4)`. The function calls itself **twice**, so the frames form a tree-like pattern - some values (like `fib(2)`) are computed more than once.

### Common mistakes

- Only one base case for Fibonacci. `fib(1)` would call `fib(0)` and `fib(-1)`, and `fib(-1)` never ends.
- Forgetting that `gcd(a, 0)` must return `a`. Without that base case, `a % 0` is a division by zero.

```quiz
What is `fib(6)` (sequence 0, 1, 1, 2, 3, 5, 8, ...)?
- [ ] 5
- [ ] 6
- [x] 8
- [ ] 13
> fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, fib(4)=3, fib(5)=5, fib(6)=8.
```

```quiz
What does `gcd(12, 8)` return?
- [ ] 2
- [x] 4
- [ ] 8
- [ ] 12
> gcd(12,8) -> gcd(8,4) -> gcd(4,0) = 4.
```

# Step: Before and after the recursive call

Where you put a `printf` relative to the recursive call changes the output completely.

- Code **before** the call runs on the way **down**.
- Code **after** the call runs on the way **back up**, in reverse order.

```c run
#include <stdio.h>

void down(int n) {
    if (n == 0) return;
    printf("in %d\n", n);     /* before: going down */
    down(n - 1);
    printf("out %d\n", n);    /* after: coming back */
}

int main(void) {
    down(3);
    return 0;
}
```
```output
in 3
in 2
in 1
out 1
out 2
out 3
```

This is exactly how you **print a number in reverse**: print the last digit first, then recurse on the rest. And to print digits in the *normal* order you would recurse first and print afterwards.

```c run
#include <stdio.h>

void printReverse(int n) {
    if (n < 10) {
        printf("%d", n);
        return;
    }
    printf("%d", n % 10);
    printReverse(n / 10);
}

int main(void) {
    printReverse(1234);
    printf("\n");
    return 0;
}
```
```output
4321
```

> **Tip:** Open the first example in **Visualize** and watch: the "out" lines appear only as frames are removed from the stack, from the newest frame to the oldest.

### Common mistakes

- Expecting the lines after the recursive call to run in the same order as the calls. They run in **reverse**, because the last call returns first.
- Using `n == 0` as base case in `printReverse`, which prints nothing for the number 0 itself. Using `n < 10` handles it.

```quiz
What does this print for `f(3)`?
~~~
void f(int n) {
    if (n == 0) return;
    f(n - 1);
    printf("%d ", n);
}
~~~
- [ ] 3 2 1
- [x] 1 2 3
- [ ] 1 2 3 0
- [ ] 3
> The print happens after the recursive call, so the deepest call (n = 1) prints first: 1 2 3.
```

# Step: Recursion on arrays and binary search

An array can be processed recursively by passing the array and a smaller range (an index). Example: the sum of `a[0..n-1]` is `a[n-1]` plus the sum of the first `n-1` elements.

**Binary search** is a perfect recursive algorithm. On a **sorted** array, look at the middle element:

- equal to the key: found;
- key is smaller: search the left half;
- key is bigger: search the right half;
- empty range (`low > high`): not found (base case).

```c run
#include <stdio.h>

int sumArr(int a[], int n) {
    if (n == 0) return 0;
    return a[n - 1] + sumArr(a, n - 1);
}

int binSearch(int a[], int low, int high, int key) {
    if (low > high) return -1;              /* base case: not found */
    int mid = (low + high) / 2;
    if (a[mid] == key) return mid;          /* base case: found */
    if (key < a[mid])
        return binSearch(a, low, mid - 1, key);
    return binSearch(a, mid + 1, high, key);
}

int main(void) {
    int b[5] = {1, 2, 3, 4, 5};
    int a[10] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    printf("Sum = %d\n", sumArr(b, 5));
    printf("Index of 23 = %d\n", binSearch(a, 0, 9, 23));
    printf("Index of 7 = %d\n", binSearch(a, 0, 9, 7));
    return 0;
}
```
```output
Sum = 15
Index of 23 = 5
Index of 7 = -1
```

Searching for 23: mid = 4 (16, too small) -> low = 5; mid = 7 (56, too big) -> high = 6; mid = 5 (23, found).

> **Tip:** In the visualizer, notice that the array `a` is **not copied** - every frame's `a` is an arrow to the same array. Only `low`, `high` and `mid` differ per frame.

### Common mistakes

- Using binary search on an **unsorted** array. The answer will be wrong.
- Recursing with `mid` instead of `mid - 1` / `mid + 1`: the range might never shrink and the calls never end.

```quiz
For `low = 0` and `high = 9`, what is `mid = (low + high) / 2`?
- [ ] 5
- [x] 4
- [ ] 4.5
- [ ] 9
> (0 + 9) / 2 = 9 / 2 = 4 with integer division.
```

# Step: Tower of Hanoi

You have 3 pegs and n disks stacked small-on-big on peg A. Move all disks to peg C, moving **one disk at a time**, never putting a bigger disk on a smaller one. Peg B is spare.

The recursive idea:

1. Move the top `n-1` disks from A to B (using C as spare).
2. Move disk `n` from A to C.
3. Move the `n-1` disks from B to C (using A as spare).

The base case is `n == 0`: nothing to move.

```c run
#include <stdio.h>

void hanoi(int n, char from, char to, char via) {
    if (n == 0) return;
    hanoi(n - 1, from, via, to);
    printf("Move disk %d from %c to %c\n", n, from, to);
    hanoi(n - 1, via, to, from);
}

int main(void) {
    hanoi(3, 'A', 'C', 'B');
    return 0;
}
```
```output
Move disk 1 from A to C
Move disk 2 from A to B
Move disk 1 from C to B
Move disk 3 from A to C
Move disk 1 from B to A
Move disk 2 from B to C
Move disk 1 from A to C
```

For n disks the number of moves is `2^n - 1` (7 for n = 3).

> **Tip:** Visualize `hanoi(2, 'A', 'C', 'B')` first. Watch how the roles of `from`, `to` and `via` rotate between frames.

### Common mistakes

- Mixing up the order of the last three parameters in the recursive calls. Say it aloud: "from-via-to" for the first half, "via-to-from" for the second half.
- Trying to trace n = 10 by hand; trust the recursion: it is 1023 moves!

```quiz
How many moves are needed to solve Tower of Hanoi with 4 disks?
- [ ] 8
- [ ] 12
- [x] 15
- [ ] 16
> 2^4 - 1 = 15.
```

# Step: Subsets

To print all subsets of `{1..n}`, go through the numbers one by one. For each number you have two choices: **skip it** or **take it**. After deciding all n numbers, print the chosen ones. That is recursion with two recursive calls.

```c run
#include <stdio.h>

void subsets(int i, int n, int chosen[], int k) {
    int j;
    if (i > n) {                         /* base case: all numbers decided */
        printf("{");
        for (j = 0; j < k; j++) {
            if (j > 0) printf(",");
            printf("%d", chosen[j]);
        }
        printf("}\n");
        return;
    }
    subsets(i + 1, n, chosen, k);        /* skip i */
    chosen[k] = i;                       /* take i */
    subsets(i + 1, n, chosen, k + 1);
}

int main(void) {
    int chosen[10];
    subsets(1, 3, chosen, 0);
    return 0;
}
```
```output
{}
{3}
{2}
{2,3}
{1}
{1,3}
{1,2}
{1,2,3}
```

A set with n elements has `2^n` subsets (8 for n = 3).

> **Tip:** The array `chosen` is shared by every frame; `k` says how many entries are currently valid. Watch `k` grow when we take a number and stay the same when we skip.

### Common mistakes

- Forgetting to pass `k + 1` when taking an element - the next element would overwrite the previous one.
- Printing `chosen[0..k]` instead of `chosen[0..k-1]`.

```quiz
How many subsets does `{1, 2, 3, 4}` have (including the empty set)?
- [ ] 8
- [ ] 12
- [x] 16
- [ ] 24
> Each of the 4 elements is either in or out: 2 * 2 * 2 * 2 = 16.
```

# Step: Recursion vs iteration

Anything you can do with recursion you can do with a loop (**iteration**) and vice versa. Which is better?

| | Recursion | Iteration |
|---|---|---|
| Memory | one stack frame per call | a few variables |
| Speed | function-call overhead | usually faster |
| Code | short and natural for trees, divide-and-conquer, Hanoi, subsets | natural for simple counting |
| Danger | stack overflow if too deep | infinite loop |

Naive recursion can also be **wasteful**. Below we count how many times `fib` is called. Computing `fib(10)` needs 177 calls, while a loop needs only about 10 steps.

```c run
#include <stdio.h>

int calls = 0;

int fib(int n) {
    calls++;
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

int fibLoop(int n) {
    int a = 0, b = 1, i, t;
    for (i = 0; i < n; i++) {
        t = a + b;
        a = b;
        b = t;
    }
    return a;
}

int main(void) {
    printf("fib(10) = %d using %d calls\n", fib(10), calls);
    printf("fibLoop(10) = %d\n", fibLoop(10));
    return 0;
}
```
```output
fib(10) = 55 using 177 calls
fibLoop(10) = 55
```

**Rule of thumb:** use recursion when the problem is naturally made of smaller copies of itself (Hanoi, subsets, binary search, trees). Use a loop for simple repetition like factorial or sum.

### Common mistakes

- Using recursion for a very deep problem (like summing 1..100000) - it can overflow the stack. A loop is safe.
- Believing recursion is always slower: for binary search or divide-and-conquer it is just as fast and clearer.

```quiz
Why is the naive recursive `fib(40)` very slow?
- [ ] Because recursion cannot use int
- [x] Because it recomputes the same values again and again (exponentially many calls)
- [ ] Because the base case is missing
- [ ] Because printf is slow
> fib(n) calls fib(n-1) and fib(n-2), which share most of their work but compute it twice. The number of calls roughly doubles each time n grows by 1.
```

```quiz
Which is the safest way to add the numbers 1 to 1,000,000?
- [ ] A recursive function sumTo(n)
- [x] A for loop
- [ ] Both are equally safe
- [ ] Recursion with two base cases
> A million recursive calls would need a million stack frames and likely overflow. A loop uses constant memory.
```

# Problem: Power using recursion
id: rec-power
difficulty: easy
source: CSE103 Task Sheet - Recursion #1

Read an integer **a** and a non-negative integer **b**, and compute `a^b` using a recursive function (handle `b == 0` and `b > 0`).

**Input:** two integers `a` and `b` (|a| ≤ 10, 0 ≤ b ≤ 15).
**Output:** `a^b = R` where R is the result.

```c starter
#include <stdio.h>

long long power(int a, int b) {
    // your code here
}

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d^%d = %lld\n", a, b, power(a, b));
    return 0;
}
```
```c solution
#include <stdio.h>

long long power(int a, int b) {
    if (b == 0) return 1;
    return a * power(a, b - 1);
}

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d^%d = %lld\n", a, b, power(a, b));
    return 0;
}
```
```test
=== input
2 10
=== output
2^10 = 1024
```
```test
=== input
5 0
=== output
5^0 = 1
```
```test
=== input
-2 3
=== output
-2^3 = -8
```
```hint
What is a^0? That is your base case. For b > 0, a^b = a * a^(b-1).
```

# Problem: Factorial using recursion
id: rec-factorial
difficulty: easy
source: CSE103 Task Sheet - Recursion #2

Read a non-negative integer **n** and print `n!` using a recursive function.

**Input:** one integer n (0 ≤ n ≤ 20).
**Output:** `n! = R`

```c starter
#include <stdio.h>

long long fact(int n) {
    // your code here
}

int main(void) {
    int n;
    scanf("%d", &n);
    printf("%d! = %lld\n", n, fact(n));
    return 0;
}
```
```c solution
#include <stdio.h>

long long fact(int n) {
    if (n == 0) return 1;
    return n * fact(n - 1);
}

int main(void) {
    int n;
    scanf("%d", &n);
    printf("%d! = %lld\n", n, fact(n));
    return 0;
}
```
```test
=== input
5
=== output
5! = 120
```
```test
=== input
0
=== output
0! = 1
```
```test
=== input
20
=== output
20! = 2432902008176640000
```
```hint
Base case: 0! = 1. Recursive case: n! = n * (n-1)!. Use long long so 20! fits.
```

# Problem: Fibonacci series using recursion
id: rec-fibonacci
difficulty: easy
source: CSE103 Task Sheet - Recursion #3

Print the first **n** terms of the Fibonacci series (starting 0, 1, 1, 2, ...) using a recursive function `fib(i)` that returns the i-th term (`fib(0) = 0`, `fib(1) = 1`).

**Input:** one integer n (1 ≤ n ≤ 30).
**Output:** the n terms on one line separated by single spaces.

```c starter
#include <stdio.h>

int fib(int i) {
    // your code here
}

int main(void) {
    int n, i;
    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        // print fib(i)
    }
    printf("\n");
    return 0;
}
```
```c solution
#include <stdio.h>

int fib(int i) {
    if (i == 0) return 0;
    if (i == 1) return 1;
    return fib(i - 1) + fib(i - 2);
}

int main(void) {
    int n, i;
    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", fib(i));
    }
    printf("\n");
    return 0;
}
```
```test
=== input
10
=== output
0 1 1 2 3 5 8 13 21 34
```
```test
=== input
1
=== output
0
```
```test
=== input
2
=== output
0 1
```
```hint
Two base cases: fib(0) = 0 and fib(1) = 1. Otherwise fib(i) = fib(i-1) + fib(i-2). Call it inside a loop for i = 0 .. n-1.
```

# Problem: GCD using recursion
id: rec-gcd
difficulty: easy
source: CSE103 Task Sheet - Recursion #4

Find the greatest common divisor of two non-negative integers using Euclid's recursive rule `gcd(a, b) = gcd(b, a % b)`, with `gcd(a, 0) = a`.

**Input:** two integers a and b (0 ≤ a, b ≤ 100000, not both 0).
**Output:** `GCD = G`

```c starter
#include <stdio.h>

int gcd(int a, int b) {
    // your code here
}

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("GCD = %d\n", gcd(a, b));
    return 0;
}
```
```c solution
#include <stdio.h>

int gcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("GCD = %d\n", gcd(a, b));
    return 0;
}
```
```test
=== input
48 18
=== output
GCD = 6
```
```test
=== input
17 5
=== output
GCD = 1
```
```test
=== input
0 9
=== output
GCD = 9
```
```test
=== input
100 75
=== output
GCD = 25
```
```hint
Base case: when b is 0, the answer is a. Otherwise call gcd with (b, a % b).
```

# Problem: Sum of digits using recursion
id: rec-digit-sum
difficulty: easy
source: CSE103 Task Sheet - Recursion #5

Read a non-negative integer and print the sum of its digits using recursion.

**Input:** one integer n (0 ≤ n ≤ 2000000000).
**Output:** `Sum of digits = S`

```c starter
#include <stdio.h>

int digitSum(int n) {
    // your code here
}

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Sum of digits = %d\n", digitSum(n));
    return 0;
}
```
```c solution
#include <stdio.h>

int digitSum(int n) {
    if (n == 0) return 0;
    return n % 10 + digitSum(n / 10);
}

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Sum of digits = %d\n", digitSum(n));
    return 0;
}
```
```test
=== input
1234
=== output
Sum of digits = 10
```
```test
=== input
0
=== output
Sum of digits = 0
```
```test
=== input
9999
=== output
Sum of digits = 36
```
```hint
The last digit is n % 10; the remaining number is n / 10. Base case: n == 0.
```

# Problem: Print a number in reverse using recursion
id: rec-reverse-number
difficulty: medium
source: CSE103 Task Sheet - Recursion #6

Read a non-negative integer and print its digits in reverse order using recursion. Trailing zeros of the input become leading zeros of the output (for example 1200 prints `0021`).

**Input:** one integer n (0 ≤ n ≤ 2000000000).
**Output:** `Reversed = D` where D is the reversed digit string.

```c starter
#include <stdio.h>

void printReverse(int n) {
    // your code here: print digits only, no newline
}

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Reversed = ");
    printReverse(n);
    printf("\n");
    return 0;
}
```
```c solution
#include <stdio.h>

void printReverse(int n) {
    if (n < 10) {
        printf("%d", n);
        return;
    }
    printf("%d", n % 10);
    printReverse(n / 10);
}

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Reversed = ");
    printReverse(n);
    printf("\n");
    return 0;
}
```
```test
=== input
1234
=== output
Reversed = 4321
```
```test
=== input
1200
=== output
Reversed = 0021
```
```test
=== input
0
=== output
Reversed = 0
```
```hint
Print the last digit first (n % 10), then recurse on n / 10.
```
```hint
Base case: a single digit (n < 10) is just printed. That also handles n = 0.
```

# Problem: Recursive binary search
id: rec-binary-search
difficulty: medium
source: CSE103 Task Sheet - Recursion #7

Given a sorted array of distinct integers, search for a key using **recursive** binary search.

**Input:** first line n (1 ≤ n ≤ 100); second line n integers in increasing order; third line the key.
**Output:** `Found at index I` (0-based) or `Not found`.

```c starter
#include <stdio.h>

int binSearch(int a[], int low, int high, int key) {
    // your code here: return index or -1
}

int main(void) {
    int n, i, key, r;
    int a[100];
    scanf("%d", &n);
    for (i = 0; i < n; i++) scanf("%d", &a[i]);
    scanf("%d", &key);
    r = binSearch(a, 0, n - 1, key);
    if (r == -1) printf("Not found\n");
    else printf("Found at index %d\n", r);
    return 0;
}
```
```c solution
#include <stdio.h>

int binSearch(int a[], int low, int high, int key) {
    int mid;
    if (low > high) return -1;
    mid = (low + high) / 2;
    if (a[mid] == key) return mid;
    if (key < a[mid]) return binSearch(a, low, mid - 1, key);
    return binSearch(a, mid + 1, high, key);
}

int main(void) {
    int n, i, key, r;
    int a[100];
    scanf("%d", &n);
    for (i = 0; i < n; i++) scanf("%d", &a[i]);
    scanf("%d", &key);
    r = binSearch(a, 0, n - 1, key);
    if (r == -1) printf("Not found\n");
    else printf("Found at index %d\n", r);
    return 0;
}
```
```test
=== input
7
2 4 6 8 10 12 14
10
=== output
Found at index 4
```
```test
=== input
7
2 4 6 8 10 12 14
5
=== output
Not found
```
```test
=== input
1
5
5
=== output
Found at index 0
```
```test
=== input
7
2 4 6 8 10 12 14
14
=== output
Found at index 6
```
```hint
Base case 1: low > high means the range is empty - return -1. Base case 2: a[mid] == key - return mid.
```
```hint
If key < a[mid] search (low, mid-1), otherwise search (mid+1, high).
```

# Problem: Tower of Hanoi
id: rec-hanoi
difficulty: medium
source: CSE103 Task Sheet - Recursion #8

Solve Tower of Hanoi for **n** disks, moving them from peg A to peg C using peg B. Print every move, then the total number of moves. Use the standard recursion (move n-1 disks to the spare peg, move disk n, move n-1 disks onto it).

**Input:** one integer n (1 ≤ n ≤ 10).
**Output:** one line `Move disk X from P to Q` per move, then `Total moves = M`.

```c starter
#include <stdio.h>

void hanoi(int n, char from, char to, char via) {
    // your code here
}

int main(void) {
    int n;
    scanf("%d", &n);
    hanoi(n, 'A', 'C', 'B');
    printf("Total moves = %d\n", (1 << n) - 1);
    return 0;
}
```
```c solution
#include <stdio.h>

void hanoi(int n, char from, char to, char via) {
    if (n == 0) return;
    hanoi(n - 1, from, via, to);
    printf("Move disk %d from %c to %c\n", n, from, to);
    hanoi(n - 1, via, to, from);
}

int main(void) {
    int n;
    scanf("%d", &n);
    hanoi(n, 'A', 'C', 'B');
    printf("Total moves = %d\n", (1 << n) - 1);
    return 0;
}
```
```test
=== input
1
=== output
Move disk 1 from A to C
Total moves = 1
```
```test
=== input
2
=== output
Move disk 1 from A to B
Move disk 2 from A to C
Move disk 1 from B to C
Total moves = 3
```
```test
=== input
3
=== output
Move disk 1 from A to C
Move disk 2 from A to B
Move disk 1 from C to B
Move disk 3 from A to C
Move disk 1 from B to A
Move disk 2 from B to C
Move disk 1 from A to C
Total moves = 7
```
```hint
Base case: n == 0, do nothing.
```
```hint
hanoi(n-1, from, via, to); print the move of disk n from `from` to `to`; hanoi(n-1, via, to, from).
```

# Problem: Print all subsets
id: rec-subsets
difficulty: hard
source: CSE103 Task Sheet - Recursion #9

Print all subsets of the set `{1, 2, ..., n}` using recursion. To get a unique order, for each number from 1 to n **first skip it, then take it** (skip-branch before take-branch). Print each subset on its own line like `{1,3}` (numbers in increasing order, separated by commas, no spaces); the empty set prints as `{}`.

**Input:** one integer n (1 ≤ n ≤ 10).
**Output:** all 2^n subsets, one per line, in the order described.

```c starter
#include <stdio.h>

void subsets(int i, int n, int chosen[], int k) {
    // your code here
}

int main(void) {
    int n;
    int chosen[10];
    scanf("%d", &n);
    subsets(1, n, chosen, 0);
    return 0;
}
```
```c solution
#include <stdio.h>

void subsets(int i, int n, int chosen[], int k) {
    int j;
    if (i > n) {
        printf("{");
        for (j = 0; j < k; j++) {
            if (j > 0) printf(",");
            printf("%d", chosen[j]);
        }
        printf("}\n");
        return;
    }
    subsets(i + 1, n, chosen, k);
    chosen[k] = i;
    subsets(i + 1, n, chosen, k + 1);
}

int main(void) {
    int n;
    int chosen[10];
    scanf("%d", &n);
    subsets(1, n, chosen, 0);
    return 0;
}
```
```test
=== input
1
=== output
{}
{1}
```
```test
=== input
2
=== output
{}
{2}
{1}
{1,2}
```
```test
=== input
3
=== output
{}
{3}
{2}
{2,3}
{1}
{1,3}
{1,2}
{1,2,3}
```
```hint
Base case: i > n means every number has been decided - print the chosen ones.
```
```hint
Skip i: subsets(i+1, n, chosen, k). Take i: chosen[k] = i; subsets(i+1, n, chosen, k+1).
```

# Problem: Sum of first N natural numbers (recursive)
id: rec-sum-n
difficulty: easy
source: Lab manual - recursion exercise

Compute `1 + 2 + ... + N` with a recursive function.

**Input:** one integer N (1 ≤ N ≤ 5000).
**Output:** `Sum = S`

```c starter
#include <stdio.h>

int sumTo(int n) {
    // your code here
}

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Sum = %d\n", sumTo(n));
    return 0;
}
```
```c solution
#include <stdio.h>

int sumTo(int n) {
    if (n == 0) return 0;
    return n + sumTo(n - 1);
}

int main(void) {
    int n;
    scanf("%d", &n);
    printf("Sum = %d\n", sumTo(n));
    return 0;
}
```
```test
=== input
10
=== output
Sum = 55
```
```test
=== input
1
=== output
Sum = 1
```
```test
=== input
100
=== output
Sum = 5050
```
```hint
sumTo(0) = 0 is the base case; sumTo(n) = n + sumTo(n-1).
```

# Problem: Palindrome check using recursion
id: rec-palindrome
difficulty: medium
source: Aptech Practice Problems - Strings #1 (recursive version)

Read a word (no spaces) and decide if it is a palindrome using a recursive function that compares the first and last characters and then checks the inside.

**Input:** one word of at most 100 lowercase letters.
**Output:** `Palindrome` or `Not palindrome`.

```c starter
#include <stdio.h>
#include <string.h>

int isPal(char s[], int left, int right) {
    // your code here: return 1 or 0
}

int main(void) {
    char s[101];
    scanf("%s", s);
    if (isPal(s, 0, (int)strlen(s) - 1)) printf("Palindrome\n");
    else printf("Not palindrome\n");
    return 0;
}
```
```c solution
#include <stdio.h>
#include <string.h>

int isPal(char s[], int left, int right) {
    if (left >= right) return 1;
    if (s[left] != s[right]) return 0;
    return isPal(s, left + 1, right - 1);
}

int main(void) {
    char s[101];
    scanf("%s", s);
    if (isPal(s, 0, (int)strlen(s) - 1)) printf("Palindrome\n");
    else printf("Not palindrome\n");
    return 0;
}
```
```test
=== input
madam
=== output
Palindrome
```
```test
=== input
hello
=== output
Not palindrome
```
```test
=== input
a
=== output
Palindrome
```
```test
=== input
abba
=== output
Palindrome
```
```hint
Base case: if left >= right, the middle was reached - it is a palindrome. If s[left] != s[right], it is not.
```
