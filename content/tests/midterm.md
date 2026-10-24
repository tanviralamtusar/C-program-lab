---
id: midterm
title: Midterm Exam (Mock)
order: 4
duration: 90
covers: Lectures 1-6 — intro to C, operators & expressions, decision making, loops, 1D arrays, 2D arrays
summary: A full-length mock midterm with ten short questions and four coding problems, covering everything from basics to 2D arrays.
---

# Question: Mixed int and double
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a = 7, b = 2;
    double d = a / b;
    double e = (double)a / b;
    int c = a % b * 3 + 1;
    printf("%.1f %.1f %d", d, e, c);
    return 0;
}
~~~
- [ ] 3.5 3.5 4
- [x] 3.0 3.5 4
- [ ] 3.0 3.5 10
- [ ] 3.0 3.0 4
> a / b is integer division (3), stored as 3.0. The cast makes the second division 3.5. a % b * 3 + 1 = 1 * 3 + 1 = 4.
```

# Question: continue and break together
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i, s = 0;
    for (i = 1; i <= 10; i++) {
        if (i % 3 == 0)
            continue;
        if (i > 8)
            break;
        s += i;
    }
    printf("%d %d", s, i);
    return 0;
}
~~~
- [ ] 27 9
- [ ] 37 10
- [x] 27 10
- [ ] 30 11
> Multiples of 3 are skipped. s = 1+2+4+5+7+8 = 27. At i = 9 the first if continues; at i = 10 the loop breaks, so i is 10.
```

# Question: Increment operators in an expression
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int x = 5, y = 3;
    int z = x++ + --y * 2;
    printf("%d %d %d", x, y, z);
    return 0;
}
~~~
- [ ] 5 2 9
- [x] 6 2 9
- [ ] 6 3 11
- [ ] 6 2 10
> x++ gives 5 (then x becomes 6). --y makes y = 2 first, and 2 * 2 = 4. So z = 5 + 4 = 9.
```

# Question: Running sums in an array
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a[5] = {1, 2, 3, 4, 5};
    int i;
    for (i = 1; i < 5; i++)
        a[i] += a[i - 1];
    for (i = 0; i < 5; i++)
        printf("%d ", a[i]);
    return 0;
}
~~~
- [ ] 1 2 3 4 5
- [ ] 1 3 5 7 9
- [x] 1 3 6 10 15
- [ ] 3 5 7 9 5
> Each element is replaced by itself plus the already-updated previous element, giving the running (prefix) sums.
```

# Question: Upper triangle minus diagonal
marks: 3

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int m[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    int i, j, s = 0;
    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            if (i < j)
                s += m[i][j];
            else if (i == j)
                s -= m[i][j];
        }
    }
    printf("s=%d", s);
    return 0;
}
~~~
- [ ] s=11
- [ ] s=26
- [x] s=-4
- [ ] s=-15
> Elements above the diagonal (i < j) are 2, 3, 6 = 11. The diagonal 1, 5, 9 = 15 is subtracted. 11 - 15 = -4. Elements below the diagonal are ignored.
```

# Question: One pass of swapping
marks: 3

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a[6] = {4, 1, 3, 6, 2, 5};
    int i, cnt = 0;
    for (i = 0; i < 5; i++) {
        if (a[i] > a[i + 1]) {
            int t = a[i];
            a[i] = a[i + 1];
            a[i + 1] = t;
            cnt++;
        }
    }
    printf("%d:", cnt);
    for (i = 0; i < 6; i++)
        printf(" %d", a[i]);
    return 0;
}
~~~
- [ ] 3: 1 3 2 4 5 6
- [ ] 4: 1 2 3 4 5 6
- [x] 4: 1 3 4 2 5 6
- [ ] 5: 1 3 4 2 5 6
> Swaps: (4,1), (4,3), (6,2), (6,5) = 4 swaps. 4 vs 6 needs no swap. The single pass leaves 1 3 4 2 5 6; the array is not fully sorted yet.
```

# Question: The loop that does nothing
marks: 2

```quiz
The programmer wants to print 1 2 3 4 5, but the program prints only a single number. What is the error?
~~~
int n = 5, i;
for (i = 1; i <= n; i++);
{
    printf("%d ", i);
}
~~~
- [ ] The condition i <= n should be i < n.
- [x] The semicolon after the for header makes the loop body empty; the printf block runs once after the loop (printing 6).
- [ ] The variable i must be declared inside the for statement.
- [ ] printf cannot be used inside curly braces.
> `for (...);` ends the statement, so the loop just counts i up to 6. The braced block is then an ordinary block that runs exactly once.
```

# Question: Off-by-one on an array
marks: 2

```quiz
This code is meant to fill an array with 0, 1, 2, 3, 4. Which statement about it is correct?
~~~
int a[5];
int i;
for (i = 0; i <= 5; i++)
    a[i] = i;
~~~
- [ ] It is correct; <= is always safe in a for loop.
- [ ] It fails because an array must be initialised when declared.
- [x] When i is 5 it writes a[5], which is outside the array (valid indexes are 0 to 4), so the condition should be i < 5.
- [ ] It fails because i must start from 1.
> An array of size 5 has indexes 0..4. Accessing a[5] is out of bounds, which is undefined behaviour in C.
```

# Question: Digits and evens
marks: 3

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int n = 48271, s = 0, c = 0;
    while (n > 0) {
        int d = n % 10;
        if (d % 2 == 0) {
            s += d;
            c++;
        }
        n /= 10;
    }
    printf("%d %d", s, c);
    return 0;
}
~~~
- [ ] 22 5
- [ ] 8 1
- [x] 14 3
- [ ] 14 2
> The digits are 1, 7, 2, 8, 4. The even ones are 2, 8 and 4: their sum is 14 and there are 3 of them.
```

# Question: Invalid 2D array declaration
marks: 3

```quiz
Which of these declarations is NOT valid C?
~~~
(A) int m[2][3];
(B) int m[][2] = {{1, 2}, {3, 4}};
(C) int m[2][] = {{1, 2}, {3, 4}};
(D) int m[2][2] = {{1}, {2}};
~~~
- [ ] (A)
- [ ] (B)
- [x] (C)
- [ ] (D)
> Only the first dimension may be left empty (and only when an initializer is given). The column count must always be written, so (C) is an error. (D) is valid: the missing elements become 0.
```

# Problem: Electricity bill with slabs
id: midterm-electricity-bill
difficulty: easy
marks: 8
source: Original (mock test)

An electricity company charges per unit in slabs:

- the first 100 units cost 5 Taka each,
- the next 100 units (101 to 200) cost 7 Taka each,
- every unit above 200 costs 10 Taka each.

Read the number of units consumed and print the total bill.

**Input:** one integer U (0 ≤ U ≤ 5000).
**Output:** `Bill = B` where B is the total in Taka (an integer).

```c starter
#include <stdio.h>

int main(void) {
    int units, bill;
    scanf("%d", &units);

    // your code here

    printf("Bill = %d\n", bill);
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int units, bill;
    scanf("%d", &units);

    if (units <= 100)
        bill = units * 5;
    else if (units <= 200)
        bill = 100 * 5 + (units - 100) * 7;
    else
        bill = 100 * 5 + 100 * 7 + (units - 200) * 10;

    printf("Bill = %d\n", bill);
    return 0;
}
```

```test
=== input
150
=== output
Bill = 850
```

```test
=== input
80
=== output
Bill = 400
```

```test
=== input
200
=== output
Bill = 1200
```

```test
=== input
260
=== output
Bill = 1800
```

```hint
Use an if / else if / else chain. For units above a slab limit you must charge the full amount of the earlier slabs plus the remainder at the new rate.
```

```hint
For 150 units: 100 * 5 + (150 - 100) * 7 = 500 + 350 = 850. For units above 200 the first two slabs cost 500 + 700 = 1200 in total.
```

# Problem: Primes in an array
id: midterm-primes-in-array
difficulty: medium
marks: 10
source: Original (mock test)

Read **N** integers into an array. Print all the prime numbers that appear in the array, in their original order (repeated primes are printed each time they appear), and then how many there are. Remember that 1 is not a prime number.

**Input:** the first line contains N (1 ≤ N ≤ 50). The second line contains N integers (1 ≤ value ≤ 1000).
**Output:** the first line is `Primes:` followed by the primes, each preceded by a single space; if there are none, print `Primes: none`. The second line is `Count = C`.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[50], i, j;
    int count = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);

    printf("Primes:");
    // your code here

    printf("Count = %d\n", count);
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[50], i, j;
    int count = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);

    printf("Primes:");
    for (i = 0; i < n; i++) {
        int isPrime = (a[i] >= 2);
        for (j = 2; j * j <= a[i]; j++) {
            if (a[i] % j == 0) {
                isPrime = 0;
                break;
            }
        }
        if (isPrime) {
            printf(" %d", a[i]);
            count++;
        }
    }
    if (count == 0)
        printf(" none");
    printf("\nCount = %d\n", count);
    return 0;
}
```

```test
=== input
6
10 7 1 13 15 2
=== output
Primes: 7 13 2
Count = 3
```

```test
=== input
4
4 6 8 9
=== output
Primes: none
Count = 0
```

```test
=== input
5
2 3 5 7 11
=== output
Primes: 2 3 5 7 11
Count = 5
```

```test
=== input
5
1 997 997 1000 49
=== output
Primes: 997 997
Count = 2
```

```hint
Loop over the array. For each element, test divisors j = 2, 3, ... while j * j <= value. Use a flag variable that you set to 0 when a divisor is found. Treat values below 2 as non-prime from the start.
```

```hint
Print each prime as soon as you find it using printf(" %d", a[i]), and count it. After the loop, if the count is still 0, print " none".
```

# Problem: Branch sales report
id: midterm-sales-report
difficulty: medium
marks: 12
source: Original (mock test)

A shop has 3 branches and records the sales (in thousand Taka) of each branch for 4 days. Read the 3 x 4 table (one row per branch, one column per day) and print:

- the total sales of every branch,
- the total sales of every day,
- the best day (the day with the largest total; if two days tie, report the earlier one).

**Input:** 3 lines of 4 integers each (0 ≤ value ≤ 1000).
**Output:**
```
Branch 1: T
Branch 2: T
Branch 3: T
Day 1: T
Day 2: T
Day 3: T
Day 4: T
Best day: D (T)
```

```c starter
#include <stdio.h>

int main(void) {
    int sales[3][4];
    int i, j;

    for (i = 0; i < 3; i++)
        for (j = 0; j < 4; j++)
            scanf("%d", &sales[i][j]);

    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int sales[3][4];
    int i, j;
    int colTotal[4];
    int best = 0;

    for (i = 0; i < 3; i++)
        for (j = 0; j < 4; j++)
            scanf("%d", &sales[i][j]);

    for (i = 0; i < 3; i++) {
        int rowTotal = 0;
        for (j = 0; j < 4; j++)
            rowTotal += sales[i][j];
        printf("Branch %d: %d\n", i + 1, rowTotal);
    }

    for (j = 0; j < 4; j++) {
        colTotal[j] = 0;
        for (i = 0; i < 3; i++)
            colTotal[j] += sales[i][j];
        printf("Day %d: %d\n", j + 1, colTotal[j]);
        if (colTotal[j] > colTotal[best])
            best = j;
    }

    printf("Best day: %d (%d)\n", best + 1, colTotal[best]);
    return 0;
}
```

```test
=== input
10 20 30 40
5 15 25 35
12 8 22 18
=== output
Branch 1: 100
Branch 2: 80
Branch 3: 60
Day 1: 27
Day 2: 43
Day 3: 77
Day 4: 93
Best day: 4 (93)
```

```test
=== input
1 1 1 1
1 1 1 1
1 1 1 1
=== output
Branch 1: 4
Branch 2: 4
Branch 3: 4
Day 1: 3
Day 2: 3
Day 3: 3
Day 4: 3
Best day: 1 (3)
```

```test
=== input
0 0 0 0
9 0 0 0
0 0 5 5
=== output
Branch 1: 0
Branch 2: 9
Branch 3: 10
Day 1: 9
Day 2: 0
Day 3: 5
Day 4: 5
Best day: 1 (9)
```

```hint
Use two nested loops. For the row totals, reset a sum to 0 at the start of each row (outside the inner loop). For the column totals, the outer loop goes over columns and the inner loop over rows, or keep an array colTotal[4].
```

```hint
To find the best day, remember the index of the largest column total so far. Update it only when a total is strictly greater, so that ties keep the earlier day.
```

# Problem: Seat booking grid
id: midterm-seat-booking
difficulty: hard
marks: 16
source: Original (mock test)

A small hall has **4 rows** and **5 seats per row**, numbered from 1. At first every seat is free. You are given K booking requests, each a pair `row seat`. Process the requests in order:

- if the row is not in 1..4 or the seat is not in 1..5, print `Seat R-S is invalid`,
- else if the seat is already booked, print `Seat R-S is taken`,
- else book it and print `Seat R-S booked`.

After all requests, print the seating plan (one line per row, `X` for a booked seat and `.` for a free seat, no spaces), then:

- `Free seats: F` (total number of free seats),
- `Full rows: N` (number of rows in which every seat is booked),
- `Emptiest row: R` (the row with the most free seats; on a tie, the smallest row number).

**Input:** the first line contains K (0 ≤ K ≤ 30). Each of the next K lines contains two integers R and S.
**Output:** one line per request, then the 4 plan lines, then the three summary lines.

```c starter
#include <stdio.h>

int main(void) {
    int seat[4][5] = {0};   // 0 = free, 1 = booked
    int k, q, r, s, i, j;

    scanf("%d", &k);
    for (q = 0; q < k; q++) {
        scanf("%d %d", &r, &s);
        // your code here: validate, book and print a message
    }

    // your code here: print the plan and the summary
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int seat[4][5] = {0};
    int k, q, r, s, i, j;
    int freeTotal = 0, fullRows = 0;
    int emptiest = 0, maxFree = -1;

    scanf("%d", &k);
    for (q = 0; q < k; q++) {
        scanf("%d %d", &r, &s);
        if (r < 1 || r > 4 || s < 1 || s > 5)
            printf("Seat %d-%d is invalid\n", r, s);
        else if (seat[r - 1][s - 1] == 1)
            printf("Seat %d-%d is taken\n", r, s);
        else {
            seat[r - 1][s - 1] = 1;
            printf("Seat %d-%d booked\n", r, s);
        }
    }

    for (i = 0; i < 4; i++) {
        int freeInRow = 0;
        for (j = 0; j < 5; j++) {
            if (seat[i][j] == 1)
                printf("X");
            else {
                printf(".");
                freeInRow++;
            }
        }
        printf("\n");
        freeTotal += freeInRow;
        if (freeInRow == 0)
            fullRows++;
        if (freeInRow > maxFree) {
            maxFree = freeInRow;
            emptiest = i + 1;
        }
    }

    printf("Free seats: %d\n", freeTotal);
    printf("Full rows: %d\n", fullRows);
    printf("Emptiest row: %d\n", emptiest);
    return 0;
}
```

```test
=== input
6
1 1
1 1
4 5
5 1
2 3
0 2
=== output
Seat 1-1 booked
Seat 1-1 is taken
Seat 4-5 booked
Seat 5-1 is invalid
Seat 2-3 booked
Seat 0-2 is invalid
X....
..X..
.....
....X
Free seats: 17
Full rows: 0
Emptiest row: 3
```

```test
=== input
0
=== output
.....
.....
.....
.....
Free seats: 20
Full rows: 0
Emptiest row: 1
```

```test
=== input
7
1 1
1 2
1 3
1 4
1 5
2 5
2 5
=== output
Seat 1-1 booked
Seat 1-2 booked
Seat 1-3 booked
Seat 1-4 booked
Seat 1-5 booked
Seat 2-5 booked
Seat 2-5 is taken
XXXXX
....X
.....
.....
Free seats: 14
Full rows: 1
Emptiest row: 3
```

```test
=== input
3
4 5
4 5
3 6
=== output
Seat 4-5 booked
Seat 4-5 is taken
Seat 3-6 is invalid
.....
.....
.....
....X
Free seats: 19
Full rows: 0
Emptiest row: 1
```

```hint
Use a 4 x 5 int array initialised to 0. Check the range of r and s FIRST (before touching seat[r-1][s-1]), otherwise you read outside the array. Remember the array is 0-based but the input is 1-based.
```

```hint
After the requests, one pair of nested loops can do everything: for each row count the free seats while printing X or ., then update the totals. Keep the row with the largest free count using a strict > comparison so that ties keep the smaller row number.
```
