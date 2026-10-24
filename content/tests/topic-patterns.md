---
id: topic-patterns
title: "Topic Test: Nested Loops & Patterns"
group: topic
lesson: patterns
order: 105
duration: 30
covers: nested loops, rows and columns, triangles, pyramids, hollow shapes
summary: A short topic test on tracing nested loops, spotting pattern bugs and printing two patterns.
---

# Question: Multiplication triangle
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i, j;
    for (i = 1; i <= 3; i++) {
        for (j = 1; j <= i; j++)
            printf("%d", i * j);
        printf("\n");
    }
    return 0;
}
~~~
- [ ] 1 12 123
- [ ] 123 123 123
- [x] 1 24 369
- [ ] 1 22 333
> Row i prints i*1, i*2, ... , i*i. Row 1 gives 1, row 2 gives 2 and 4, row 3 gives 3, 6 and 9. The three lines are 1, 24 and 369.
```

# Question: Spaces then hashes
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i, j;
    for (i = 3; i >= 1; i--) {
        for (j = 1; j <= 3 - i; j++)
            printf(".");
        for (j = 1; j <= i; j++)
            printf("#");
        printf("\n");
    }
    return 0;
}
~~~
- [ ] ### ## #
- [ ] #.. ##. ###
- [x] ### .## ..#
- [ ] ..# .## ###
> For i = 3 there are 0 dots and 3 hashes; for i = 2, one dot and 2 hashes; for i = 1, two dots and 1 hash. The printed lines are ###, .## and ..#.
```

# Question: The stray semicolon in a pattern
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i, j;
    for (i = 1; i <= 3; i++) {
        for (j = 1; j <= 3; j++);
            printf("*");
        printf("\n");
    }
    return 0;
}
~~~
- [ ] *** *** ***
- [ ] * ** ***
- [x] * * *
- [ ] ***
> The semicolon makes the inner loop an empty loop. printf("*") then runs only once per outer iteration, so each of the 3 rows has exactly one star.
```

# Question: The counter that was never reset
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int i, j = 1;
    for (i = 1; i <= 3; i++) {
        while (j <= i * 2) {
            printf("*");
            j++;
        }
        printf("\n");
    }
    return 0;
}
~~~
- [ ] ** **** ******
- [x] ** ** **
- [ ] * ** ***
- [ ] ** ** ** **
> j is set to 1 only once, outside the loops. Row 1 prints for j = 1, 2 (two stars), row 2 for j = 3, 4 and row 3 for j = 5, 6. Each row has two stars because j keeps counting; it should be reset inside the outer loop.
```

# Question: Hollow square condition
marks: 2

```quiz
To print a hollow square of side n using rows i = 1..n and columns j = 1..n, when should a star be printed (otherwise a space)?
- [ ] i == j
- [ ] i == 1 && j == n
- [x] i == 1 || i == n || j == 1 || j == n
- [ ] i == 1 && i == n && j == 1 && j == n
> A cell belongs to the border when it is in the first or last row, or the first or last column. That is an OR of four tests; an AND would almost never be true.
```

# Question: How many stars in total?
marks: 2

```quiz
How many times is printf("*") executed by this code?
~~~
for (i = 1; i <= 4; i++)
    for (j = 1; j <= i; j++)
        printf("*");
~~~
- [ ] 4
- [ ] 8
- [x] 10
- [ ] 16
> The inner loop runs i times for each i, so the total is 1 + 2 + 3 + 4 = 10.
```

# Problem: Checkerboard
id: topic-patterns-checkerboard
difficulty: easy
source: Original (topic test)
marks: 6

Read an integer **N** and print an N x N checkerboard. The cell in row *i* and column *j* (both counted from 1) is `*` when i + j is even and `.` when i + j is odd. Print the characters with **no spaces** between them and no trailing spaces.

For N = 4 the output is:

```
*.*.
.*.*
*.*.
.*.*
```

**Input:** one integer N (1 ≤ N ≤ 12).
**Output:** N lines of N characters each.

```c starter
#include <stdio.h>

int main(void) {
    int n, i, j;
    scanf("%d", &n);
    for (i = 1; i <= n; i++) {
        // your code here: print one row, then a newline
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
        for (j = 1; j <= n; j++) {
            if ((i + j) % 2 == 0)
                printf("*");
            else
                printf(".");
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
4
=== output
*.*.
.*.*
*.*.
.*.*
```

```test
=== input
1
=== output
*
```

```test
=== input
3
=== output
*.*
.*.
*.*
```

```test
=== input
5
=== output
*.*.*
.*.*.
*.*.*
.*.*.
*.*.*
```

```hint
The outer loop is for rows, the inner loop is for columns. Print a newline after the inner loop.
```

```hint
Inside the inner loop test `(i + j) % 2 == 0` to choose between `*` and `.`.
```

# Problem: Hollow pyramid
id: topic-patterns-hollow-pyramid
difficulty: medium
source: Original (topic test)
marks: 8

Read an integer **N** and print a hollow pyramid of N rows made of `*`. Row *i* (1-based) starts with `N - i` spaces. Row 1 is a single star. Rows 2 to N-1 have a star, then `2i - 3` spaces, then a star. The last row (row N) is a solid line of `2N - 1` stars. There must be no trailing spaces on any line.

For N = 4 the output is:

```
   *
  * *
 *   *
*******
```

**Input:** one integer N (1 ≤ N ≤ 15).
**Output:** the pyramid, one row per line.

```c starter
#include <stdio.h>

int main(void) {
    int n, i, j;
    scanf("%d", &n);
    for (i = 1; i <= n; i++) {
        // 1) print n - i leading spaces
        // 2) print the stars (and the hollow part)
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
        if (i == 1) {
            printf("*");
        } else if (i == n) {
            for (j = 1; j <= 2 * n - 1; j++)
                printf("*");
        } else {
            printf("*");
            for (j = 1; j <= 2 * i - 3; j++)
                printf(" ");
            printf("*");
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
4
=== output
   *
  * *
 *   *
*******
```

```test
=== input
1
=== output
*
```

```test
=== input
2
=== output
 *
***
```

```test
=== input
5
=== output
    *
   * *
  *   *
 *     *
*********
```

```hint
Treat three kinds of rows separately: the first row (one star), the last row (all stars) and the middle rows (star, spaces, star).
```

```hint
In a middle row, print `*`, then a loop of `2 * i - 3` spaces, then `*`. Check row 2: 1 space; row 3: 3 spaces.
```
