---
id: loops
title: "Loops: while, do-while, for"
order: 4
summary: Repeat work with while, do-while and for; break, continue, sentinel loops, nested loops and the classic digit and number algorithms.
---

# Step: Why loops? Anatomy of a loop and while

Suppose you must print the numbers 1 to 1000. Writing 1000 `printf` statements is silly. A **loop** repeats a block of code (the **body**) as long as a condition holds. Each round is called an **iteration**.

Every loop has the same four parts:

1. **Initialise** the control variable (`i = 1`).
2. **Test** the condition (`i <= 5`).
3. Run the **body**.
4. **Update** the variable (`i++`).

A loop can be **entry-controlled** (the test comes first: `while`, `for`, so the body may run zero times) or **exit-controlled** (the test comes after the body: `do-while`, which always runs at least once).

The `while` loop is entry-controlled:

```c
while (condition) {
    body;
}
```

```c run
#include <stdio.h>

int main(void) {
    int i = 1;
    while (i <= 5) {
        printf("%d\n", i);
        i++;
    }
    return 0;
}
```
```output
1
2
3
4
5
```

Open the visualizer and watch `i` change. Another classic: the sum 1 + 2 + ... + 100, with an **accumulator** variable that starts at 0.

```c run
#include <stdio.h>

int main(void) {
    int i = 1, sum = 0;
    while (i <= 100) {
        sum = sum + i;
        i++;
    }
    printf("Sum = %d\n", sum);
    return 0;
}
```
```output
Sum = 5050
```

### Common mistakes

- Forgetting to update the control variable (`i++`). The loop never ends (an **infinite loop**).
- Forgetting to initialise the variable before the loop.
- A semicolon right after the condition: `while (i <= 5);` is an empty body.
- Using `=` instead of `==` in the condition.
- Off-by-one: `i < 5` runs 4 times from 1, `i <= 5` runs 5 times.

```quiz
What does this print?
~~~
int i = 10;
while (i <= 5) {
    printf("%d ", i);
    i++;
}
printf("done");
~~~
- [ ] 10 done
- [x] done
- [ ] nothing
- [ ] It never stops
> The condition is false at the very first test, so the body is skipped.
```

```quiz
What does this print?
~~~
int n = 3;
while (n--) printf("%d ", n);
~~~
- [ ] 3 2 1
- [x] 2 1 0
- [ ] 3 2 1 0
- [ ] 2 1
> `n--` tests the old value and then decrements: test 3 (print 2), test 2 (print 1), test 1 (print 0), test 0 stops the loop.
```

# Step: The do-while loop

`do-while` is **exit-controlled**: the body runs first and the condition is checked afterwards. So the body runs **at least once**. Note the required semicolon after `while (...)`.

```c
do {
    body;
} while (condition);
```

```c run
#include <stdio.h>

int main(void) {
    int i = 10;
    while (i <= 5) {
        printf("while body runs\n");
        i++;
    }
    do {
        printf("do-while body runs, i = %d\n", i);
        i++;
    } while (i <= 5);
    return 0;
}
```
```output
do-while body runs, i = 10
```

The condition `i <= 5` is false from the start. The `while` skips its body, but the `do-while` runs it once.

This is ideal for **input validation**: ask, then check, and ask again if the answer was bad.

```c run
#include <stdio.h>

int main(void) {
    int n;
    do {
        printf("Enter a positive number: ");
        scanf("%d", &n);
    } while (n <= 0);
    printf("You entered %d\n", n);
    return 0;
}
```
```input
-3
0
7
```
```output
Enter a positive number: Enter a positive number: Enter a positive number: You entered 7
```

### Common mistakes

- Forgetting the semicolon after `while (condition)`.
- Expecting `do-while` to skip the body when the condition starts false. It still runs once.
- Not updating the variable tested in the condition (infinite loop).

```quiz
What does this print?
~~~
int i = 1, s = 0;
do {
    s += i;
    i++;
} while (i <= 4);
printf("%d", s);
~~~
- [ ] 6
- [x] 10
- [ ] 15
- [ ] 4
> 1 + 2 + 3 + 4 = 10. After i becomes 5 the test fails.
```

```quiz
What does this print?
~~~
int n = 3;
do {
    printf("%d", n);
    n--;
} while (n > 0);
~~~
- [x] 321
- [ ] 3210
- [ ] 32
- [ ] 123
> After printing 1, n becomes 0 and `n > 0` is false.
```

# Step: The for loop

`for` packs the initialisation, the test and the update into one line. It is the natural choice when you know **how many times** to repeat.

```c
for (initialization; condition; update) {
    body;
}
```

The order of events: initialisation runs **once**. Then the condition is tested before every iteration. After each body, the update runs and we test again.

```c run
#include <stdio.h>

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        sum = sum + i;
    }
    printf("Sum = %d\n", sum);
    return 0;
}
```
```input
10
```
```output
Sum = 55
```

A multiplication table, built using only addition:

```c run
#include <stdio.h>

int main(void) {
    int n, term = 0;
    scanf("%d", &n);
    for (int i = 1; i <= 10; i++) {
        term = term + n;
        printf("%d x %d = %d\n", n, i, term);
    }
    return 0;
}
```
```input
7
```
```output
7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
7 x 6 = 42
7 x 7 = 49
7 x 8 = 56
7 x 9 = 63
7 x 10 = 70
```

The three parts are flexible. You can have several variables (separated by commas), or leave a part empty (but keep the semicolons):

```c run
#include <stdio.h>

int main(void) {
    for (int n = 1, m = 5; n < m; n++, m--) {
        printf("n=%d m=%d\n", n, m);
    }
    int k = 5;
    for (; k != 20; ) {
        k += 5;
    }
    printf("k=%d\n", k);
    return 0;
}
```
```output
n=1 m=5
n=2 m=4
k=20
```

> **Note:** A variable declared in the `for` header (like `int i`) exists only inside the loop.

### Common mistakes

- A semicolon right after the header: `for (i = 1; i <= 5; i++);` is an empty loop. The block after it runs once.
- Using commas instead of semicolons: `for (i = 0, i < 5, i++)` is an error.
- Counting down with `i--` but testing `i <= n`: it never ends.
- Changing the loop variable inside the body by accident.
- Off-by-one errors. Always check the first and the last iteration by hand.

```quiz
What does this print?
~~~
for (int i = 0; i < 10; i += 3)
    printf("%d ", i);
~~~
- [x] 0 3 6 9
- [ ] 3 6 9
- [ ] 0 3 6
- [ ] 0 3 6 9 12
> i takes the values 0, 3, 6, 9, then 12 fails `i < 10`.
```

```quiz
How many times does the body run?
~~~
for (int i = 10; i > 0; i -= 3)
    printf("x");
~~~
- [ ] 3
- [x] 4
- [ ] 5
- [ ] 10
> i = 10, 7, 4, 1. Then i = -2 fails the test.
```

```quiz
What does this print?
~~~
for (int i = 1; i <= 3; i++);
printf("x");
~~~
- [ ] xxx
- [x] x
- [ ] nothing
- [ ] 123x
> The `;` is the loop body, so the loop does nothing three times. The printf runs once after it.
```

# Step: Choosing the right loop

Any loop can be written with any of the three statements, but each fits one situation best.

| Loop | Tests | Minimum runs | Use it when |
|---|---|---|---|
| `for` | before | 0 | you know the count in advance |
| `while` | before | 0 | the count is unknown, and zero runs is fine |
| `do-while` | after | 1 | the body must run at least once (menus, validation) |

By how the repetition ends, loops are **counter-controlled** (a known, finite count) or **sentinel-controlled** (repeat until a special value, the *sentinel*, is entered, for example -1).

Here is the same job done three ways:

```c run
#include <stdio.h>

int main(void) {
    int i;
    printf("for:");
    for (i = 1; i <= 3; i++) {
        printf(" %d", i);
    }
    printf("\nwhile:");
    i = 1;
    while (i <= 3) {
        printf(" %d", i);
        i++;
    }
    printf("\ndo-while:");
    i = 1;
    do {
        printf(" %d", i);
        i++;
    } while (i <= 3);
    printf("\n");
    return 0;
}
```
```output
for: 1 2 3
while: 1 2 3
do-while: 1 2 3
```

A sentinel-controlled loop: read marks until `-1` is typed, then print the average. We do not know in advance how many marks there will be. Notice the **read-ahead** pattern: read once before the loop, and read again at the end of each iteration.

```c run
#include <stdio.h>

int main(void) {
    int grade, count = 0, total = 0;
    scanf("%d", &grade);
    while (grade != -1) {
        total += grade;
        count++;
        scanf("%d", &grade);
    }
    if (count > 0) {
        printf("Count = %d\n", count);
        printf("Average = %.2f\n", (double)total / count);
    } else {
        printf("No grades\n");
    }
    return 0;
}
```
```input
85
90
78
-1
```
```output
Count = 3
Average = 84.33
```

> **Tip:** The sentinel must be a value that can never be real data. -1 is fine for marks, but not for temperatures.

### Common mistakes

- Using `for` when the count is not known. A `while` reads more naturally.
- Adding the sentinel value to the total by mistake (test it *before* using it).
- Dividing two `int`s and losing the fraction. Cast one to `double`.

```quiz
Which kind of loop fits "read marks until the user types -1"?
- [ ] A counter-controlled for loop
- [x] A sentinel-controlled while loop
- [ ] A loop that must never run
- [ ] No loop is needed
> We do not know how many marks will be entered. The special value -1 ends the input.
```

# Step: break and continue

`break;` leaves the loop immediately. Inside nested loops it leaves only the **innermost** loop. `continue;` skips the rest of the current iteration and goes on with the next one (in a `for` loop the update still runs).

Prime check with `break`: as soon as we find a divisor we know the answer, so there is no need to keep looking.

```c run
#include <stdio.h>

int main(void) {
    int n, isPrime = 1;
    scanf("%d", &n);
    if (n < 2) {
        isPrime = 0;
    }
    for (int i = 2; i <= n / 2; i++) {
        if (n % i == 0) {
            isPrime = 0;
            break;
        }
    }
    if (isPrime) {
        printf("%d is prime\n", n);
    } else {
        printf("%d is not prime\n", n);
    }
    return 0;
}
```
```input
29
```
```output
29 is prime
```

`continue` skips the multiples of 3:

```c run
#include <stdio.h>

int main(void) {
    printf("Not multiples of 3:");
    for (int i = 1; i <= 10; i++) {
        if (i % 3 == 0) {
            continue;
        }
        printf(" %d", i);
    }
    printf("\n");
    return 0;
}
```
```output
Not multiples of 3: 1 2 4 5 7 8 10
```

### Common mistakes

- Thinking `break` in an inner loop ends the outer loop as well. It does not.
- Using `continue` in a `while` loop **before** the update. For example `while (i <= 5) { if (i == 3) continue; ... i++; }` stays at 3 forever.
- Using `break` inside a `switch` that is inside a loop and expecting it to leave the loop. It only leaves the switch.
- Overusing `break` and `continue` until the logic is hard to follow.

```quiz
What does this print?
~~~
for (int i = 1; i <= 5; i++) {
    if (i == 3) break;
    printf("%d ", i);
}
~~~
- [x] 1 2
- [ ] 1 2 3
- [ ] 1 2 4 5
- [ ] 3
> At i == 3 the loop exits before printing.
```

```quiz
What does this print?
~~~
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        if (j == 2) break;
        printf("%d%d ", i, j);
    }
}
~~~
- [x] 11 21 31
- [ ] 11 12 21 22 31 32
- [ ] 11
- [ ] 11 12 13
> `break` ends only the inner loop. The outer loop carries on, so every i prints once with j = 1.
```

# Step: Input loops and infinite loops

Often a program must keep reading until something happens. One common shape is an intentional infinite loop, `while (1)` or `for (;;)`, that is ended from inside with `break`:

```c run
#include <stdio.h>

int main(void) {
    int n, sum = 0;
    while (1) {
        scanf("%d", &n);
        if (n == 0) {
            break;
        }
        sum += n;
    }
    printf("Sum = %d\n", sum);
    return 0;
}
```
```input
4
7
-2
0
```
```output
Sum = 9
```

Another useful trick: `scanf` **returns the number of values it read successfully**. When the input runs out it returns `EOF` (-1), so `scanf("%d", &x) == 1` is a loop condition for "while there is another number".

```c run
#include <stdio.h>

int main(void) {
    int x, count = 0, sum = 0;
    while (scanf("%d", &x) == 1) {
        count++;
        sum += x;
    }
    printf("Count = %d\n", count);
    printf("Sum = %d\n", sum);
    return 0;
}
```
```input
3 4 5
```
```output
Count = 3
Sum = 12
```

Accidental infinite loops usually come from a missing update, an update in the wrong direction, or `=` instead of `==`.

### Common mistakes

- `int i = 1; while (i <= 5) { printf("%d ", i); }` never changes `i`, so it never ends.
- `while (i = 5)` assigns 5 and is always true.
- Reading input in a loop and never checking for the stopping value.
- Choosing a sentinel that can be valid data.

```quiz
What is wrong with this loop?
~~~
int i = 10;
while (i > 0) {
    printf("%d ", i);
    i++;
}
~~~
- [ ] Nothing, it prints 10 down to 1
- [x] i moves away from 0, so the condition stays true forever
- [ ] It prints nothing
- [ ] It does not compile
> The update goes in the wrong direction. It should be `i--`.
```

# Step: Nested loops

A loop inside the body of another loop is a **nested loop**. For every single iteration of the **outer** loop, the **inner** loop runs completely. If the outer loop runs m times and the inner loop n times, the innermost body runs m x n times.

```c run
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 3; i++) {
        for (int j = 1; j <= 4; j++) {
            printf("%d", i * j);
            if (j < 4) {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}
```
```output
1 2 3 4
2 4 6 8
3 6 9 12
```

The space is printed between numbers only (`j < 4`), and the newline `printf` call is **after** the inner loop, so there is one line per outer iteration.

Count the innermost executions:

```c run
#include <stdio.h>

int main(void) {
    int count = 0;
    for (int i = 1; i <= 3; i++) {
        for (int j = 1; j <= 4; j++) {
            count++;
        }
    }
    printf("count = %d\n", count);
    return 0;
}
```
```output
count = 12
```

All primes up to 20, with the prime test as the inner loop. Notice that `isPrime` is **reset** for every number:

```c run
#include <stdio.h>

int main(void) {
    printf("Primes up to 20:");
    for (int n = 2; n <= 20; n++) {
        int isPrime = 1;
        for (int i = 2; i <= n / 2; i++) {
            if (n % i == 0) {
                isPrime = 0;
                break;
            }
        }
        if (isPrime) {
            printf(" %d", n);
        }
    }
    printf("\n");
    return 0;
}
```
```output
Primes up to 20: 2 3 5 7 11 13 17 19
```

### Common mistakes

- Using the same variable (`i`) in both loops. The inner loop corrupts the outer count.
- Putting `printf("\n")` inside the inner loop instead of after it.
- Forgetting to reset a flag or accumulator at the start of each outer iteration.
- Counting wrongly: it is m x n, not m + n.

```quiz
What is printed?
~~~
int c = 0;
for (int i = 0; i < 4; i++)
    for (int j = 0; j < 5; j++)
        c++;
printf("%d", c);
~~~
- [ ] 9
- [x] 20
- [ ] 5
- [ ] 4
> 4 outer iterations times 5 inner iterations.
```

```quiz
How many `*` characters are printed?
~~~
for (int i = 0; i < 2; i++)
    for (int j = 0; j < 3; j++)
        printf("*");
~~~
- [ ] 2
- [ ] 3
- [ ] 5
- [x] 6
> 2 x 3 stars. There are no newlines, so they appear on one line.
```

# Step: Digit algorithms

Many classic problems work on the **digits** of a number. Two operators do all the work:

- `n % 10` gives the **last digit**.
- `n / 10` **removes** the last digit (integer division).

Repeat until the number becomes 0.

```c run
#include <stdio.h>

int main(void) {
    int n = 305;
    while (n > 0) {
        printf("n = %d, last digit = %d\n", n, n % 10);
        n = n / 10;
    }
    return 0;
}
```
```output
n = 305, last digit = 5
n = 30, last digit = 0
n = 3, last digit = 3
```

Now the big three in one program: reverse a number, count its digits and add them up. To build the reverse, shift what you have one place to the left (`rev * 10`) and add the new digit.

```c run
#include <stdio.h>

int main(void) {
    int n, rev = 0, sum = 0, count = 0;
    scanf("%d", &n);
    while (n != 0) {
        int d = n % 10;
        rev = rev * 10 + d;
        sum += d;
        count++;
        n /= 10;
    }
    printf("Reverse = %d\n", rev);
    printf("Digits = %d\n", count);
    printf("Sum = %d\n", sum);
    return 0;
}
```
```input
1234
```
```output
Reverse = 4321
Digits = 4
Sum = 10
```

What about 0? The `while (n != 0)` loop never runs, so it would say 0 digits. A `do-while` fixes it, because the body always runs once:

```c run
#include <stdio.h>

int main(void) {
    int n, count = 0;
    scanf("%d", &n);
    do {
        count++;
        n /= 10;
    } while (n != 0);
    printf("Digits = %d\n", count);
    return 0;
}
```
```input
0
```
```output
Digits = 1
```

### Common mistakes

- Destroying the original number while taking its digits, then needing it later. Copy it first: `int temp = n;`.
- Forgetting that reversing `1200` gives `21` (the leading zeros vanish) when the result is stored as a number.
- Using a `while` loop and getting the wrong answer for 0.
- Mixing up `n % 10` (last digit) with `n / 10` (everything but the last digit).

```quiz
What is printed?
~~~
int n = 1234;
printf("%d %d", n % 10, n / 10);
~~~
- [ ] 1 234
- [ ] 4 4
- [x] 4 123
- [ ] 123 4
> `% 10` gives the last digit 4, and `/ 10` drops it, leaving 123.
```

```quiz
The reverse algorithm is run on n = 1200. What does it print?
~~~
int rev = 0;
while (n != 0) {
    rev = rev * 10 + n % 10;
    n /= 10;
}
printf("%d", rev);
~~~
- [ ] 0021
- [x] 21
- [ ] 1200
- [ ] 2100
> The digits are taken 0, 0, 2, 1: rev goes 0, 0, 2, 21. Leading zeros do not exist in an int.
```

# Step: Factorial, Fibonacci and GCD

**Factorial**: n! = 1 x 2 x ... x n, and 0! = 1. It is a **product accumulator**, so it must start at **1**, not 0. Factorials grow quickly, so use `long long` (20! is the largest that fits).

```c run
#include <stdio.h>

int main(void) {
    int n;
    long long fact = 1;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        fact = fact * i;
    }
    printf("%d! = %lld\n", n, fact);
    return 0;
}
```
```input
5
```
```output
5! = 120
```

**Fibonacci**: each term is the sum of the two before it. The series 0, 1, 1, 2, 3, 5, 8, ... needs two variables that "slide" along. (Some books start the series at 1, 1. Always read the problem statement.)

```c run
#include <stdio.h>

int main(void) {
    int a = 0, b = 1;
    printf("Fibonacci:");
    for (int i = 1; i <= 10; i++) {
        printf(" %d", a);
        int next = a + b;
        a = b;
        b = next;
    }
    printf("\n");
    return 0;
}
```
```output
Fibonacci: 0 1 1 2 3 5 8 13 21 34
```

**GCD** (greatest common divisor) by Euclid's algorithm: replace `(a, b)` by `(b, a % b)` until `b` is 0. The answer is `a`.

```c run
#include <stdio.h>

int main(void) {
    int a = 48, b = 18;
    while (b != 0) {
        int t = b;
        b = a % b;
        a = t;
    }
    printf("GCD = %d\n", a);
    return 0;
}
```
```output
GCD = 6
```

Trace: (48, 18) becomes (18, 12), then (12, 6), then (6, 0). The answer is 6.

### Common mistakes

- Starting a factorial or a product at 0. Everything times 0 is 0.
- Using `int` for factorials above 12, which overflows.
- Overwriting `a` before saving the old value in Fibonacci or GCD. Use a temporary variable.
- Printing one term too many or too few. Check the first and the last iteration.

```quiz
Why does this always print 0?
~~~
long long f = 0;
for (int i = 1; i <= 5; i++)
    f = f * i;
printf("%lld", f);
~~~
- [ ] The loop runs zero times
- [x] The product accumulator starts at 0, and 0 times anything is 0
- [ ] long long cannot hold the result
- [ ] printf has the wrong format
> A product must start at 1.
```

```quiz
What does this print?
~~~
int a = 0, b = 1;
for (int i = 0; i < 3; i++) {
    int t = a + b;
    a = b;
    b = t;
}
printf("%d", a);
~~~
- [ ] 1
- [x] 2
- [ ] 3
- [ ] 5
> (a, b) goes (0,1), (1,1), (1,2), (2,3). After three rounds a is 2.
```

# Step: Special numbers

Loops and digit tricks let us test many famous number properties. Each is defined precisely here (all for positive integers).

| Name | Definition | Example |
|---|---|---|
| Prime | exactly two divisors: 1 and itself (0 and 1 are **not** prime) | 2, 3, 5, 7, 11 |
| Perfect | equals the sum of its **proper** divisors (divisors smaller than itself) | 6 = 1 + 2 + 3, 28 = 1 + 2 + 4 + 7 + 14 |
| Strong | equals the sum of the **factorials of its digits** | 145 = 1! + 4! + 5! = 1 + 24 + 120 |
| Armstrong | equals the sum of its digits, each raised to the power of the **number of digits** | 153 = 1^3 + 5^3 + 3^3, 9474 = 9^4 + 4^4 + 7^4 + 4^4 |
| Palindrome | reads the same forwards and backwards (reverse equals the original) | 121, 1221 |
| Spy | sum of digits equals the **product** of digits | 1124: 1+1+2+4 = 8 and 1x1x2x4 = 8 |

The pattern is always the same: a loop (over divisors, or over digits) that builds a value, then one comparison at the end.

Perfect number check:

```c run
#include <stdio.h>

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    for (int i = 1; i < n; i++) {
        if (n % i == 0) {
            sum += i;
        }
    }
    if (n > 1 && sum == n) {
        printf("%d is perfect\n", n);
    } else {
        printf("%d is not perfect\n", n);
    }
    return 0;
}
```
```input
28
```
```output
28 is perfect
```

Armstrong check. First count the digits, then add up each digit raised to that power (the power is computed with an inner loop, no `pow` needed):

```c run
#include <stdio.h>

int main(void) {
    int n, temp, digits = 0, sum = 0;
    scanf("%d", &n);
    temp = n;
    do {
        digits++;
        temp /= 10;
    } while (temp > 0);
    temp = n;
    while (temp > 0) {
        int d = temp % 10;
        int p = 1;
        for (int k = 1; k <= digits; k++) {
            p *= d;
        }
        sum += p;
        temp /= 10;
    }
    if (sum == n) {
        printf("%d is an Armstrong number\n", n);
    } else {
        printf("%d is not an Armstrong number\n", n);
    }
    return 0;
}
```
```input
153
```
```output
153 is an Armstrong number
```

> **Tip:** For the strong number, the inner loop computes the digit's factorial instead of a power. For the palindrome, build the reverse in a second variable and compare it with a saved copy of the original.

### Common mistakes

- Treating 1 (or 0) as prime. Prime numbers start at 2.
- Including the number itself when adding the divisors for a perfect number.
- Modifying `n` while taking digits, then comparing with the damaged value. Keep a copy.
- Forgetting that the Armstrong power is the **number of digits**, not always 3.
- Testing divisors up to `n` when `n / 2` or `i * i <= n` is enough.

```quiz
Which of these is an Armstrong number?
- [ ] 123
- [x] 153
- [ ] 154
- [ ] 100
> 1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153.
```

```quiz
Which of these is a strong number?
- [ ] 123
- [ ] 144
- [x] 145
- [ ] 100
> 1! + 4! + 5! = 1 + 24 + 120 = 145. For 123 the sum is 1 + 2 + 6 = 9.
```

```quiz
Is 123 a spy number?
- [x] Yes: the sum 1+2+3 and the product 1x2x3 are both 6
- [ ] No: the sum is 6 but the product is 5
- [ ] No: spy numbers must have 4 digits
- [ ] Yes: because 123 is prime
> Sum = 6 and product = 6, so it is a spy number.
```

# Problem: Print 1 to 100 with all three loops
id: loops-one-to-hundred
difficulty: easy
source: CSE103 Task Sheet - Loops #1

Print the numbers from 1 to 100 three times: first using a `for` loop, then a `while` loop, then a `do-while` loop. Each loop prints on its own line, with the numbers separated by single spaces (no space at the end of the line).

**Input:** none.
**Output:** three lines, each `1 2 3 ... 100`.

```c starter
#include <stdio.h>

int main(void) {
    int i;
    // 1) for loop
    // 2) while loop
    // 3) do-while loop
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int i;
    for (i = 1; i <= 100; i++) {
        printf("%d", i);
        if (i < 100) printf(" ");
    }
    printf("\n");
    i = 1;
    while (i <= 100) {
        printf("%d", i);
        if (i < 100) printf(" ");
        i++;
    }
    printf("\n");
    i = 1;
    do {
        printf("%d", i);
        if (i < 100) printf(" ");
        i++;
    } while (i <= 100);
    printf("\n");
    return 0;
}
```
```test
=== output
1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100
1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100
1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100
```
```hint
Re-initialise `i = 1` before the `while` and again before the `do-while`.
```
```hint
To avoid a trailing space, print the space only when `i < 100`.
```

# Problem: Sum of the first N natural numbers
id: loops-sum-n
difficulty: easy
source: CSE103 Task Sheet - Loops #2

Read a positive integer **N** and print the sum 1 + 2 + ... + N.

**Input:** one integer N (1 <= N <= 10000).
**Output:** `Sum = S`

```c starter
#include <stdio.h>

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    printf("Sum = %d\n", sum);
    return 0;
}
```
```test
=== input
5
=== output
Sum = 15
```
```test
=== input
1
=== output
Sum = 1
```
```test
=== input
10000
=== output
Sum = 50005000
```
```hint
Keep a variable `sum` that starts at 0 and add `i` to it in every iteration.
```

# Problem: Factorial
id: loops-factorial
difficulty: easy
source: CSE103 Task Sheet - Loops #3

Read an integer **n** (0 <= n <= 20) and print n! = 1 x 2 x ... x n. By definition 0! = 1.

**Input:** one integer n.
**Output:** `Factorial = F`

```c starter
#include <stdio.h>

int main(void) {
    int n;
    long long fact = 1;
    scanf("%d", &n);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    long long fact = 1;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    printf("Factorial = %lld\n", fact);
    return 0;
}
```
```test
=== input
5
=== output
Factorial = 120
```
```test
=== input
0
=== output
Factorial = 1
```
```test
=== input
1
=== output
Factorial = 1
```
```test
=== input
20
=== output
Factorial = 2432902008176640000
```
```hint
Start the product at 1. For n = 0 the loop does not run, and the answer 1 is already correct.
```
```hint
20! is too big for `int`. Use `long long` and print it with `%lld`.
```

# Problem: Reverse a number
id: loops-reverse
difficulty: easy
source: CSE103 Task Sheet - Loops #4

Read a non-negative integer and print its digits in reverse order, as a number. Leading zeros of the result disappear (the reverse of 1200 is 21).

**Input:** one integer n (0 <= n <= 1000000000).
**Output:** `Reversed = R`

```c starter
#include <stdio.h>

int main(void) {
    int n;
    long long rev = 0;
    scanf("%d", &n);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    long long rev = 0;
    scanf("%d", &n);
    while (n != 0) {
        rev = rev * 10 + n % 10;
        n /= 10;
    }
    printf("Reversed = %lld\n", rev);
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
Reversed = 21
```
```test
=== input
0
=== output
Reversed = 0
```
```test
=== input
7
=== output
Reversed = 7
```
```hint
Repeat: take the last digit with `n % 10`, then drop it with `n / 10`.
```
```hint
Each time, `rev = rev * 10 + lastDigit` shifts the digits built so far one place to the left.
```

# Problem: Count digits and sum of digits
id: loops-digits-count-sum
difficulty: easy
source: CSE103 Task Sheet - Loops #5

Read a non-negative integer. Print how many digits it has and the sum of its digits. The number 0 has one digit.

**Input:** one integer n (0 <= n <= 2000000000).
**Output:** two lines:
`Digits = D`
`Sum = S`

```c starter
#include <stdio.h>

int main(void) {
    int n, digits = 0, sum = 0;
    scanf("%d", &n);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n, digits = 0, sum = 0;
    scanf("%d", &n);
    do {
        digits++;
        sum += n % 10;
        n /= 10;
    } while (n != 0);
    printf("Digits = %d\n", digits);
    printf("Sum = %d\n", sum);
    return 0;
}
```
```test
=== input
1234
=== output
Digits = 4
Sum = 10
```
```test
=== input
0
=== output
Digits = 1
Sum = 0
```
```test
=== input
90509
=== output
Digits = 5
Sum = 23
```
```test
=== input
7
=== output
Digits = 1
Sum = 7
```
```hint
A `do-while` loop makes sure the body runs once even when n is 0.
```

# Problem: Multiplication table
id: loops-table
difficulty: easy
source: CSE103 Task Sheet - Loops #6

Read an integer **n** and print its multiplication table from 1 to 10.

**Input:** one integer n.
**Output:** ten lines, line i being `n x i = P`, for example `7 x 3 = 21`.

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
    for (int i = 1; i <= 10; i++) {
        printf("%d x %d = %d\n", n, i, n * i);
    }
    return 0;
}
```
```test
=== input
7
=== output
7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
7 x 6 = 42
7 x 7 = 49
7 x 8 = 56
7 x 9 = 63
7 x 10 = 70
```
```test
=== input
12
=== output
12 x 1 = 12
12 x 2 = 24
12 x 3 = 36
12 x 4 = 48
12 x 5 = 60
12 x 6 = 72
12 x 7 = 84
12 x 8 = 96
12 x 9 = 108
12 x 10 = 120
```
```test
=== input
-3
=== output
-3 x 1 = -3
-3 x 2 = -6
-3 x 3 = -9
-3 x 4 = -12
-3 x 5 = -15
-3 x 6 = -18
-3 x 7 = -21
-3 x 8 = -24
-3 x 9 = -27
-3 x 10 = -30
```
```hint
Loop `i` from 1 to 10 and print `n`, `i` and `n * i` with the exact format `n x i = product`.
```

# Problem: Even numbers between two limits
id: loops-even-range
difficulty: easy
source: CSE103 Task Sheet - Loops #7

Read two integers **a** and **b** (a <= b). Print all even numbers from a to b, both limits included, on one line separated by single spaces. If there is no even number in the range, print `None`.

**Input:** two integers `a b`.
**Output:** the even numbers on one line, or `None`.

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
    int a, b, count = 0;
    scanf("%d %d", &a, &b);
    for (int i = a; i <= b; i++) {
        if (i % 2 == 0) {
            if (count > 0) printf(" ");
            printf("%d", i);
            count++;
        }
    }
    if (count == 0) {
        printf("None");
    }
    printf("\n");
    return 0;
}
```
```test
=== input
1 10
=== output
2 4 6 8 10
```
```test
=== input
3 3
=== output
None
```
```test
=== input
-3 4
=== output
-2 0 2 4
```
```test
=== input
10 10
=== output
10
```
```hint
Loop from a to b and test `i % 2 == 0`. This also works for negative numbers (and for 0).
```
```hint
Count how many numbers you printed. If the count is still 0 at the end, print `None`.
```

# Problem: Prime number check
id: loops-prime
difficulty: medium
source: CSE103 Task Sheet - Loops #8

A prime number has exactly two divisors, 1 and itself. Note that 0 and 1 are **not** prime. Read an integer and decide.

**Input:** one integer n (0 <= n <= 1000000).
**Output:** `Prime` or `Not prime`.

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
    int n, isPrime = 1;
    scanf("%d", &n);
    if (n < 2) {
        isPrime = 0;
    }
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            isPrime = 0;
            break;
        }
    }
    if (isPrime) {
        printf("Prime\n");
    } else {
        printf("Not prime\n");
    }
    return 0;
}
```
```test
=== input
29
=== output
Prime
```
```test
=== input
1
=== output
Not prime
```
```test
=== input
2
=== output
Prime
```
```test
=== input
91
=== output
Not prime
```
```hint
Handle n < 2 first. Then try every divisor i from 2 upwards. One divisor is enough to prove n is not prime.
```
```hint
You only need to test divisors while `i * i <= n` (or up to `n / 2`).
```

# Problem: Perfect number check
id: loops-perfect
difficulty: medium
source: CSE103 Task Sheet - Loops #9

A **perfect number** equals the sum of its proper divisors (all positive divisors smaller than the number itself). For example 6 = 1 + 2 + 3 and 28 = 1 + 2 + 4 + 7 + 14. The number 1 is not perfect (it has no proper divisors, the sum is 0).

**Input:** one positive integer n (1 <= n <= 10000).
**Output:** `Perfect` or `Not perfect`.

```c starter
#include <stdio.h>

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    for (int i = 1; i < n; i++) {
        if (n % i == 0) {
            sum += i;
        }
    }
    if (sum == n) {
        printf("Perfect\n");
    } else {
        printf("Not perfect\n");
    }
    return 0;
}
```
```test
=== input
6
=== output
Perfect
```
```test
=== input
28
=== output
Perfect
```
```test
=== input
12
=== output
Not perfect
```
```test
=== input
1
=== output
Not perfect
```
```hint
Loop `i` from 1 to `n - 1`. When `n % i == 0`, add `i` to `sum`.
```

# Problem: Strong number check
id: loops-strong
difficulty: medium
source: CSE103 Task Sheet - Loops #10

A **strong number** equals the sum of the factorials of its digits. For example 145 is strong because 1! + 4! + 5! = 1 + 24 + 120 = 145. Also 1 and 2 are strong (1! = 1, 2! = 2), but 123 is not (1 + 2 + 6 = 9).

**Input:** one positive integer n (1 <= n <= 100000).
**Output:** `Strong` or `Not strong`.

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
    int n, temp, sum = 0;
    scanf("%d", &n);
    temp = n;
    while (temp > 0) {
        int d = temp % 10;
        int f = 1;
        for (int i = 2; i <= d; i++) {
            f *= i;
        }
        sum += f;
        temp /= 10;
    }
    if (sum == n) {
        printf("Strong\n");
    } else {
        printf("Not strong\n");
    }
    return 0;
}
```
```test
=== input
145
=== output
Strong
```
```test
=== input
123
=== output
Not strong
```
```test
=== input
1
=== output
Strong
```
```test
=== input
40585
=== output
Strong
```
```hint
Extract each digit with `% 10` and `/ 10`. Inside that loop, compute the digit's factorial with another loop.
```
```hint
Keep a copy of `n` for the final comparison, because the digit loop destroys the number it works on.
```

# Problem: Spy number check
id: loops-spy
difficulty: medium
source: CSE103 Task Sheet - Loops #11

A **spy number** is a number whose sum of digits equals the product of its digits. For example 1124 is a spy number: sum 1 + 1 + 2 + 4 = 8 and product 1 x 1 x 2 x 4 = 8. Also 123 is spy (6 and 6), but 12 is not (sum 3, product 2). Every single-digit number is a spy number.

**Input:** one positive integer n (1 <= n <= 1000000000).
**Output:** `Spy` or `Not spy`.

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
    int n, sum = 0;
    long long product = 1;
    scanf("%d", &n);
    while (n > 0) {
        int d = n % 10;
        sum += d;
        product *= d;
        n /= 10;
    }
    if (sum == product) {
        printf("Spy\n");
    } else {
        printf("Not spy\n");
    }
    return 0;
}
```
```test
=== input
1124
=== output
Spy
```
```test
=== input
12
=== output
Not spy
```
```test
=== input
123
=== output
Spy
```
```test
=== input
7
=== output
Spy
```
```hint
The sum starts at 0, but the product must start at 1.
```

# Problem: Armstrong number check
id: loops-armstrong
difficulty: medium
source: CSE103 Task Sheet - Loops #12

An **Armstrong number** with k digits equals the sum of its digits each raised to the power k. For example 153 = 1^3 + 5^3 + 3^3 (k = 3) and 9474 = 9^4 + 4^4 + 7^4 + 4^4 (k = 4). Every single-digit number is an Armstrong number (d^1 = d). Do not use `pow`; compute powers with a loop.

**Input:** one positive integer n (1 <= n <= 100000).
**Output:** `Armstrong` or `Not Armstrong`.

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
    int n, temp, digits = 0, sum = 0;
    scanf("%d", &n);
    temp = n;
    while (temp > 0) {
        digits++;
        temp /= 10;
    }
    temp = n;
    while (temp > 0) {
        int d = temp % 10;
        int p = 1;
        for (int k = 1; k <= digits; k++) {
            p *= d;
        }
        sum += p;
        temp /= 10;
    }
    if (sum == n) {
        printf("Armstrong\n");
    } else {
        printf("Not Armstrong\n");
    }
    return 0;
}
```
```test
=== input
153
=== output
Armstrong
```
```test
=== input
123
=== output
Not Armstrong
```
```test
=== input
9474
=== output
Armstrong
```
```test
=== input
5
=== output
Armstrong
```
```hint
Two passes: first count the digits k, then add up `digit^k` for every digit.
```
```hint
Compute `digit^k` with an inner `for` loop that multiplies `p *= d`, k times.
```

# Problem: Palindrome number check
id: loops-palindrome
difficulty: easy
source: CSE103 Task Sheet - Loops #13

A **palindrome number** reads the same forwards and backwards, for example 121 or 1221. A number such as 10 is not a palindrome (its reverse is 1).

**Input:** one non-negative integer n (0 <= n <= 1000000000).
**Output:** `Palindrome` or `Not palindrome`.

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
    int n, temp;
    long long rev = 0;
    scanf("%d", &n);
    temp = n;
    while (temp > 0) {
        rev = rev * 10 + temp % 10;
        temp /= 10;
    }
    if (rev == n) {
        printf("Palindrome\n");
    } else {
        printf("Not palindrome\n");
    }
    return 0;
}
```
```test
=== input
121
=== output
Palindrome
```
```test
=== input
123
=== output
Not palindrome
```
```test
=== input
10
=== output
Not palindrome
```
```test
=== input
7
=== output
Palindrome
```
```hint
Build the reverse of the number (as in the reverse problem) and compare it with the original.
```

# Problem: Series 100, 95, 90, ... 5
id: loops-countdown-series
difficulty: easy
source: Aptech Practice - Loop #1

Print the series 100, 95, 90, 85, ..., 10, 5 on one line, separated by single spaces.

**Input:** none.
**Output:** `100 95 90 ... 5` (20 numbers).

```c starter
#include <stdio.h>

int main(void) {
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    for (int i = 100; i >= 5; i -= 5) {
        printf("%d", i);
        if (i > 5) printf(" ");
    }
    printf("\n");
    return 0;
}
```
```test
=== output
100 95 90 85 80 75 70 65 60 55 50 45 40 35 30 25 20 15 10 5
```
```hint
Count down: start at 100, continue while `i >= 5`, and subtract 5 each time with `i -= 5`.
```

# Problem: Sum of odd numbers between two numbers
id: loops-odd-sum-range
difficulty: easy
source: Aptech Practice - Loop #2

Read two integers **a** and **b** (a <= b). Print the sum of all odd numbers from a to b, both included. If there is no odd number the sum is 0. Negative odd numbers count with their sign.

**Input:** two integers `a b`.
**Output:** `Sum = S`

```c starter
#include <stdio.h>

int main(void) {
    int a, b, sum = 0;
    scanf("%d %d", &a, &b);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b, sum = 0;
    scanf("%d %d", &a, &b);
    for (int i = a; i <= b; i++) {
        if (i % 2 != 0) {
            sum += i;
        }
    }
    printf("Sum = %d\n", sum);
    return 0;
}
```
```test
=== input
1 10
=== output
Sum = 25
```
```test
=== input
4 4
=== output
Sum = 0
```
```test
=== input
-5 2
=== output
Sum = -8
```
```test
=== input
3 3
=== output
Sum = 3
```
```hint
For a negative odd number `i % 2` is -1, so test `i % 2 != 0`, not `i % 2 == 1`.
```

# Problem: First N Fibonacci terms
id: loops-fibonacci-n
difficulty: easy
source: Aptech Practice - Loop #3

Generate the Fibonacci series that starts 1, 1, 2, 3, 5, 8, 13, ... Read **N** and print the first N terms on one line, separated by single spaces.

**Input:** one integer N (1 <= N <= 40).
**Output:** the first N terms.

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
    int n, a = 1, b = 1;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        printf("%d", a);
        if (i < n) printf(" ");
        int next = a + b;
        a = b;
        b = next;
    }
    printf("\n");
    return 0;
}
```
```test
=== input
7
=== output
1 1 2 3 5 8 13
```
```test
=== input
1
=== output
1
```
```test
=== input
10
=== output
1 1 2 3 5 8 13 21 34 55
```
```hint
Keep two variables `a` and `b` (both 1 at the start). Print `a`, then slide: `next = a + b; a = b; b = next;`.
```

# Problem: Fibonacci numbers below a limit
id: loops-fibonacci-limit
difficulty: medium
source: Lab Manual - Lab 5 Exercise #2

This version of the Fibonacci series starts 0, 1, 1, 2, 3, 5, 8, ... Read a limit **L** and print all Fibonacci numbers that are **strictly less than L**, on one line separated by single spaces.

**Input:** one integer L (1 <= L <= 1000000).
**Output:** the Fibonacci numbers below L. For L = 1 the output is just `0`.

```c starter
#include <stdio.h>

int main(void) {
    int limit;
    scanf("%d", &limit);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int limit, a = 0, b = 1, first = 1;
    scanf("%d", &limit);
    while (a < limit) {
        if (!first) printf(" ");
        printf("%d", a);
        first = 0;
        int next = a + b;
        a = b;
        b = next;
    }
    printf("\n");
    return 0;
}
```
```test
=== input
10
=== output
0 1 1 2 3 5 8
```
```test
=== input
1
=== output
0
```
```test
=== input
100
=== output
0 1 1 2 3 5 8 13 21 34 55 89
```
```hint
The number of terms is not known in advance, so a `while (a < limit)` loop fits better than a `for` loop.
```

# Problem: Count even and odd numbers
id: loops-count-even-odd
difficulty: easy
source: Lab Manual - Lab 5 (5.3.1)

Read a count **n**, then **n** integers. Count how many are even and how many are odd (0 is even).

**Input:** the first integer is n (1 <= n <= 100), followed by n integers.
**Output:** two lines:
`Even = E`
`Odd = O`

```c starter
#include <stdio.h>

int main(void) {
    int n, num, even = 0, odd = 0;
    scanf("%d", &n);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n, num, even = 0, odd = 0;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &num);
        if (num % 2 == 0) {
            even++;
        } else {
            odd++;
        }
    }
    printf("Even = %d\n", even);
    printf("Odd = %d\n", odd);
    return 0;
}
```
```test
=== input
3
4 7 10
=== output
Even = 2
Odd = 1
```
```test
=== input
1
-3
=== output
Even = 0
Odd = 1
```
```test
=== input
5
2 4 6 8 0
=== output
Even = 5
Odd = 0
```
```hint
Read one number inside the loop on every iteration, and update one of two counters.
```

# Problem: Sum of factorials 1! + 2! + ... + n!
id: loops-factorial-series
difficulty: medium
source: Lab Manual - Lab 5 (5.5.1)

Read **n** and print the sum 1! + 2! + 3! + ... + n!. Use a nested loop (or a running factorial).

**Input:** one integer n (1 <= n <= 15).
**Output:** `Sum = S`

```c starter
#include <stdio.h>

int main(void) {
    int n;
    long long sum = 0;
    scanf("%d", &n);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    long long sum = 0, fact;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        fact = 1;
        for (int j = 1; j <= i; j++) {
            fact *= j;
        }
        sum += fact;
    }
    printf("Sum = %lld\n", sum);
    return 0;
}
```
```test
=== input
5
=== output
Sum = 153
```
```test
=== input
1
=== output
Sum = 1
```
```test
=== input
15
=== output
Sum = 1401602636313
```
```hint
The outer loop picks i. The inner loop computes i! from scratch, so reset `fact = 1` at the start of every outer iteration.
```

# Problem: Sum until zero (break)
id: loops-sum-until-zero
difficulty: easy
source: Lab Manual - Lab 5 (5.6.1)

Read up to 10 integers and print their sum. Stop reading as soon as a `0` is entered (the 0 is not added). Use `break`.

**Input:** up to 10 integers, ending early with 0. If 10 numbers are given, no 0 is needed.
**Output:** `Sum = S`

```c starter
#include <stdio.h>

int main(void) {
    int n, sum = 0;
    // your code here
    printf("Sum = %d\n", sum);
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n, sum = 0;
    for (int i = 1; i <= 10; i++) {
        scanf("%d", &n);
        if (n == 0) {
            break;
        }
        sum += n;
    }
    printf("Sum = %d\n", sum);
    return 0;
}
```
```test
=== input
3 4 0
=== output
Sum = 7
```
```test
=== input
1 2 3 4 5 6 7 8 9 10
=== output
Sum = 55
```
```test
=== input
0
=== output
Sum = 0
```
```test
=== input
5 5 0 99 99
=== output
Sum = 10
```
```hint
Use `for (int i = 1; i <= 10; i++)`, read a number, and `break;` when it is 0.
```

# Problem: Print the alphabet
id: loops-alphabet
difficulty: easy
source: Lab Manual - Lab 4 Task #1

Print all lower-case letters from `a` to `z` on a single line with no spaces. (A `char` is just a small integer, so a loop can count from `'a'` to `'z'`.)

**Input:** none.
**Output:** `abcdefghijklmnopqrstuvwxyz`

```c starter
#include <stdio.h>

int main(void) {
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    for (char c = 'a'; c <= 'z'; c++) {
        printf("%c", c);
    }
    printf("\n");
    return 0;
}
```
```test
=== output
abcdefghijklmnopqrstuvwxyz
```
```hint
`for (char c = 'a'; c <= 'z'; c++)` works, and `%c` prints a character.
```

# Problem: Frequency of each digit
id: loops-digit-frequency
difficulty: medium
source: Lab Manual - Lab 4 Task #4

Read a non-negative integer. For every digit that appears in it, print how many times it appears. List the digits in ascending order (0 to 9) and print nothing for digits that do not appear.

**Input:** one integer n (0 <= n <= 2000000000).
**Output:** one line per digit that appears: `Digit d: c`

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
    for (int d = 0; d <= 9; d++) {
        int count = 0, temp = n;
        do {
            if (temp % 10 == d) {
                count++;
            }
            temp /= 10;
        } while (temp > 0);
        if (count > 0) {
            printf("Digit %d: %d\n", d, count);
        }
    }
    return 0;
}
```
```test
=== input
112330
=== output
Digit 0: 1
Digit 1: 2
Digit 2: 1
Digit 3: 2
```
```test
=== input
0
=== output
Digit 0: 1
```
```test
=== input
9999
=== output
Digit 9: 4
```
```hint
Nested loops: the outer loop tries each digit d from 0 to 9. The inner loop walks over the digits of a copy of n and counts matches.
```
```hint
Use a `do-while` for the inner loop so that n = 0 is handled.
```

# Problem: Sum of first and last digit
id: loops-first-last-sum
difficulty: medium
source: Lab Manual - Lab 4 Exercise #1

Read a non-negative integer and print the sum of its first digit and last digit. For a single-digit number the first and the last digit are the same digit, so it is counted twice.

**Input:** one integer n (0 <= n <= 2000000000).
**Output:** `Sum = S`

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
    int n, first, last;
    scanf("%d", &n);
    last = n % 10;
    first = n;
    while (first >= 10) {
        first /= 10;
    }
    printf("Sum = %d\n", first + last);
    return 0;
}
```
```test
=== input
1234
=== output
Sum = 5
```
```test
=== input
7
=== output
Sum = 14
```
```test
=== input
90
=== output
Sum = 9
```
```test
=== input
5005
=== output
Sum = 10
```
```hint
The last digit is `n % 10`. For the first digit, keep dividing a copy of n by 10 until only one digit is left.
```

# Problem: Swap first and last digits
id: loops-swap-first-last
difficulty: hard
source: Lab Manual - Lab 4 Exercise #2

Read a non-negative integer and swap its first and last digits. Print the result as a number, so leading zeros disappear: 1234 becomes 4231, and 1200 becomes 0201 which is printed as 201. A single-digit number stays the same.

**Input:** one integer n (0 <= n <= 2000000000).
**Output:** `Result = R`

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
    int n, first, last, p = 1, middle;
    long long result;
    scanf("%d", &n);
    if (n < 10) {
        result = n;
    } else {
        last = n % 10;
        first = n;
        while (first >= 10) {
            first /= 10;
            p *= 10;
        }
        middle = (n % p) / 10;
        result = (long long)last * p + (long long)middle * 10 + first;
    }
    printf("Result = %lld\n", result);
    return 0;
}
```
```test
=== input
1234
=== output
Result = 4231
```
```test
=== input
1200
=== output
Result = 201
```
```test
=== input
7
=== output
Result = 7
```
```test
=== input
10
=== output
Result = 1
```
```hint
Find the first digit and the power of ten `p` (1000 for a 4-digit number) while dividing. The last digit is `n % 10`.
```
```hint
Remove the first digit with `n % p`, then remove the last with `/ 10`: that is the middle part. Result = `last * p + middle * 10 + first`.
```

# Problem: Series 1 + 11 + 111 + ...
id: loops-series-ones
difficulty: medium
source: Lab Manual - Lab 4 Exercise #4

Read **n** and print the sum of the first n terms of the series 1 + 11 + 111 + 1111 + ... (the k-th term is the digit 1 written k times).

**Input:** one integer n (1 <= n <= 9).
**Output:** `Sum = S`

```c starter
#include <stdio.h>

int main(void) {
    int n;
    long long sum = 0, term = 0;
    scanf("%d", &n);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    long long sum = 0, term = 0;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        term = term * 10 + 1;
        sum += term;
    }
    printf("Sum = %lld\n", sum);
    return 0;
}
```
```test
=== input
5
=== output
Sum = 12345
```
```test
=== input
1
=== output
Sum = 1
```
```test
=== input
2
=== output
Sum = 12
```
```test
=== input
9
=== output
Sum = 123456789
```
```hint
Each term is the previous term with a 1 appended: `term = term * 10 + 1`.
```

# Problem: Average of marks until -1
id: loops-average-sentinel
difficulty: medium
source: Class Notes 04 - Loops (sentinel example)

Read non-negative integer marks one by one until the sentinel value `-1` is entered (the -1 is not a mark). Print the average of the marks with 2 decimal places. If no mark was entered, print `No grades`.

**Input:** integers (each >= 0) ending with -1.
**Output:** `Average = A` (2 decimals) or `No grades`.

```c starter
#include <stdio.h>

int main(void) {
    int grade, count = 0, total = 0;
    scanf("%d", &grade);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int grade, count = 0, total = 0;
    scanf("%d", &grade);
    while (grade != -1) {
        total += grade;
        count++;
        scanf("%d", &grade);
    }
    if (count > 0) {
        printf("Average = %.2f\n", (double)total / count);
    } else {
        printf("No grades\n");
    }
    return 0;
}
```
```test
=== input
85 90 78 -1
=== output
Average = 84.33
```
```test
=== input
-1
=== output
No grades
```
```test
=== input
100 -1
=== output
Average = 100.00
```
```hint
Read the first value before the loop. Inside the loop, use it, then read the next one at the end.
```
```hint
Cast to `double` before dividing: `(double)total / count`.
```

# Problem: Power without pow()
id: loops-power
difficulty: easy
source: Class Notes 04 - Loops (Listing 4.2)

Read an integer **base** and a non-negative integer **exponent** and compute base^exponent using a loop (no `pow`). Anything to the power 0 is 1.

**Input:** two integers `base exponent` (0 <= exponent, and the result fits in `long long`).
**Output:** `base^exponent = R`, for example `2^10 = 1024`.

```c starter
#include <stdio.h>

int main(void) {
    int base, exponent;
    long long result = 1;
    scanf("%d %d", &base, &exponent);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int base, exponent;
    long long result = 1;
    scanf("%d %d", &base, &exponent);
    for (int i = 1; i <= exponent; i++) {
        result *= base;
    }
    printf("%d^%d = %lld\n", base, exponent, result);
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
```test
=== input
3 5
=== output
3^5 = 243
```
```hint
Start `result` at 1 and multiply it by `base` exactly `exponent` times.
```

# Problem: GCD of two numbers
id: loops-gcd
difficulty: medium
source: Lecture 4 - Decision Making and Looping (homework)

Read two positive integers and print their greatest common divisor (the largest number that divides both). Use Euclid's algorithm: while `b` is not 0, replace `(a, b)` by `(b, a % b)`.

**Input:** two positive integers `a b`.
**Output:** `GCD = G`

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
    while (b != 0) {
        int t = b;
        b = a % b;
        a = t;
    }
    printf("GCD = %d\n", a);
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
12 12
=== output
GCD = 12
```
```test
=== input
100 75
=== output
GCD = 25
```
```hint
Euclid: gcd(a, b) = gcd(b, a % b), and gcd(a, 0) = a.
```
```hint
Use a temporary variable `t` so that you do not lose the old value of `b`.
```
