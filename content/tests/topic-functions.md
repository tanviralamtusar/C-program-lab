---
id: topic-functions
title: "Topic Test: Functions"
group: topic
lesson: functions
order: 109
duration: 30
covers: call by value, static and global variables, scope and shadowing, passing arrays, prototypes, return values
summary: Trace function programs, spot classic function mistakes, then write two short programs built from functions.
---

# Question: Swap that does not swap
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
void swap(int a, int b) {
    int t = a;
    a = b;
    b = t;
}
int main(void) {
    int x = 3, y = 5;
    swap(x, y);
    printf("%d %d", x, y);
    return 0;
}
~~~
- [ ] 5 3
- [x] 3 5
- [ ] 3 3
- [ ] 5 5
> Arguments are passed by value, so swap works on copies of x and y. The originals in main are not changed.
```

# Question: Static versus local
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int f(void) {
    static int s = 0;
    int l = 0;
    s += 2;
    l += 2;
    return s + l;
}
int main(void) {
    int a = f();
    int b = f();
    int c = f();
    printf("%d %d %d", a, b, c);
    return 0;
}
~~~
- [ ] 4 4 4
- [ ] 2 4 6
- [x] 4 6 8
- [ ] 4 8 12
> The static s keeps its value between calls (2, 4, 6) while the ordinary local l is created afresh each time (always 2). The results are 2+2, 4+2 and 6+2.
```

# Question: Arrays are shared with the function
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
void doubleAll(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        arr[i] *= 2;
    }
    n = 99;
}
int main(void) {
    int a[3] = {1, 2, 3};
    int n = 3;
    doubleAll(a, n);
    printf("%d %d %d %d", a[0], a[1], a[2], n);
    return 0;
}
~~~
- [ ] 1 2 3 3
- [ ] 2 4 6 99
- [ ] 1 2 3 99
- [x] 2 4 6 3
> An array parameter refers to the caller's own array, so the doubling changes a. The int n is a plain value, so assigning 99 to the copy does not affect n in main.
```

# Question: Global, local and block scope
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int x = 10;
void show(void) {
    printf("%d ", x);
}
int main(void) {
    int x = 20;
    show();
    printf("%d ", x);
    {
        int x = 30;
        printf("%d", x);
    }
    return 0;
}
~~~
- [ ] 20 20 30
- [ ] 10 10 30
- [x] 10 20 30
- [ ] 10 20 20
> show sees the global x (10). Inside main the local x (20) hides the global one, and the inner block's x (30) hides the local one only inside the braces.
```

# Question: Missing prototype
marks: 2

```quiz
A student writes the program below and the compiler complains about the call to square in main. What is the best fix?
~~~
#include <stdio.h>
int main(void) {
    printf("%d", square(4));
    return 0;
}
int square(int n) {
    return n * n;
}
~~~
- [ ] Remove the return type of square
- [x] Add the prototype int square(int n); before main (or move the function above main)
- [ ] Call it as int square(4) in main
- [ ] Declare n as a global variable
> The compiler must know a function's name, parameters and return type before the call. A prototype before main, or defining the function first, provides that.
```

# Question: sizeof an array parameter
marks: 2

```quiz
This function is meant to return the average of the array, but it gives wrong results. What is the bug?
~~~
float average(int a[]) {
    int sum = 0;
    int n = sizeof(a) / sizeof(a[0]);
    for (int i = 0; i < n; i++) {
        sum += a[i];
    }
    return (float)sum / n;
}
~~~
- [ ] An array cannot be a parameter
- [ ] The function must return int
- [ ] sum must be declared float
- [x] Inside the function a is only a pointer, so sizeof(a) is the size of a pointer, not of the array; the length must be passed as an extra parameter
> An array parameter does not remember its size. Compute the length in the caller and pass it, for example float average(int a[], int n).
```

# Problem: Triangular numbers
id: topic-functions-triangular
difficulty: easy
source: Original (topic test)
marks: 6

A number is **triangular** if it equals 1 + 2 + ... + k for some k ≥ 1. The first triangular numbers are 1, 3, 6, 10, 15, ... Write a function `int isTriangular(int x)` that returns 1 if x is triangular and 0 otherwise, and use it in `main` to print every triangular number from 1 to **n**.

**Input:** one integer n (1 ≤ n ≤ 1000).
**Output:** the triangular numbers up to n on one line, separated by single spaces.

```c starter
#include <stdio.h>

int isTriangular(int x) {
    // your code here
}

int main(void) {
    int n;
    // read n and print the triangular numbers
    return 0;
}
```

```c solution
#include <stdio.h>

int isTriangular(int x) {
    int total = 0;
    int k = 1;
    while (total < x) {
        total += k;
        k++;
    }
    return total == x;
}

int main(void) {
    int n;
    int first = 1;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        if (isTriangular(i)) {
            if (!first) printf(" ");
            printf("%d", i);
            first = 0;
        }
    }
    printf("\n");
    return 0;
}
```

```test
=== input
20
=== output
1 3 6 10 15
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
```

```test
=== input
100
=== output
1 3 6 10 15 21 28 36 45 55 66 78 91
```

```hint
Keep adding 1, 2, 3, ... to a running total. If the total hits x exactly, x is triangular; if it jumps past x, it is not.
```

```hint
In isTriangular use a while loop: while (total < x) { total += k; k++; } and then return total == x. In main, call it for every i from 1 to n.
```

# Problem: Day of the year
id: topic-functions-day-of-year
difficulty: medium
source: Original (topic test)
marks: 8

Read a valid date given as day, month and year. Print which day of the year it is (1 January is day 1) and how many days are left in that year after this date. Use these functions:

* `int isLeap(int year)` returns 1 for a leap year (divisible by 4 and not by 100, or divisible by 400), else 0.
* `int daysInMonth(int month, int year)` returns the number of days in that month, using `isLeap` for February.
* `int dayOfYear(int d, int m, int y)` returns the day number in the year.

**Input:** three integers d m y (1 ≤ m ≤ 12, a valid day for that month, 1900 ≤ y ≤ 2400).
**Output:** `Day N of the year, R days left`

```c starter
#include <stdio.h>

int isLeap(int year) {
    // your code here
}

int daysInMonth(int month, int year) {
    // your code here
}

int dayOfYear(int d, int m, int y) {
    // your code here
}

int main(void) {
    int d, m, y;
    // read the date and print the result
    return 0;
}
```

```c solution
#include <stdio.h>

int isLeap(int year) {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}

int daysInMonth(int month, int year) {
    int days[12] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    if (month == 2 && isLeap(year)) {
        return 29;
    }
    return days[month - 1];
}

int dayOfYear(int d, int m, int y) {
    int total = d;
    for (int i = 1; i < m; i++) {
        total += daysInMonth(i, y);
    }
    return total;
}

int main(void) {
    int d, m, y;
    scanf("%d %d %d", &d, &m, &y);
    int n = dayOfYear(d, m, y);
    int yearLength = isLeap(y) ? 366 : 365;
    printf("Day %d of the year, %d days left\n", n, yearLength - n);
    return 0;
}
```

```test
=== input
1 1 2023
=== output
Day 1 of the year, 364 days left
```

```test
=== input
1 3 2024
=== output
Day 61 of the year, 305 days left
```

```test
=== input
31 12 2023
=== output
Day 365 of the year, 0 days left
```

```test
=== input
1 3 2100
=== output
Day 60 of the year, 305 days left
```

```hint
The day number is d plus the lengths of all the months before month m. Write daysInMonth so dayOfYear can simply loop over the earlier months.
```

```hint
Years divisible by 100 are leap years only if they are also divisible by 400, so 2100 is not leap but 2400 is. The year has 366 days if isLeap(y) is true, otherwise 365; the days left are that length minus the day number.
```
