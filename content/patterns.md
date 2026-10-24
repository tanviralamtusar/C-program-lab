---
id: patterns
title: "Nested Loops & Patterns"
order: 5
summary: Think in rows and columns to print triangles, pyramids, number patterns, Floyd's and Pascal's triangles, hollow shapes and diamonds.
---

# Step: Rows and columns thinking

A **nested loop** is a loop inside another loop. Think of printing on a grid:

- the **outer loop** picks the **row** (line number),
- the **inner loop** walks across the **columns** of that row,
- after the inner loop finishes, `printf("\n")` moves to the next line.

For every single turn of the outer loop, the inner loop runs **completely**. If the outer loop runs 3 times and the inner loop 5 times, the inner body runs 3 x 5 = 15 times.

```c run
#include <stdio.h>

int main(void) {
    int rows = 3, cols = 5;
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= cols; j++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}
```
```output
*****
*****
*****
```

In the visualizer you can watch `i` stay fixed while `j` runs from 1 to 5, then `i` goes up by one and `j` starts again from 1.

Here is the same idea printing the (row, column) of every cell, so you can see exactly what `i` and `j` are at each step:

```c run
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 2; i++) {
        for (int j = 1; j <= 3; j++) {
            if (j > 1) printf(" ");
            printf("(%d,%d)", i, j);
        }
        printf("\n");
    }
    return 0;
}
```
```output
(1,1) (1,2) (1,3)
(2,1) (2,2) (2,3)
```

> **Tip:** To solve any pattern, draw it on paper and for each row write down: how many spaces? how many stars (or numbers)? Then express those counts using the row number `i`.

### Common mistakes

- Forgetting `printf("\n")` after the inner loop, so everything lands on one line.
- Putting `printf("\n")` **inside** the inner loop, so every star gets its own line.
- Using the same variable (`i`) for both loops. The inner loop would disturb the outer one.

```quiz
How many times does `printf("#")` run?
~~~
for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 6; j++) {
        printf("#");
    }
}
~~~
- [ ] 10
- [x] 24
- [ ] 6
- [ ] 4
> The inner loop runs 6 times for each of the 4 outer turns: 4 x 6 = 24.
```

# Step: Triangles (right-angled and inverted)

For a right-angled triangle of stars the number of stars grows with the row number: row `i` has `i` stars. So the inner loop runs from `1` to `i` (not up to a fixed number!).

For the **inverted** triangle the opposite happens: row `i` has `n - i + 1` stars, so the first row is the longest.

| Row i (n = 4) | Triangle stars | Inverted stars |
|---|---|---|
| 1 | 1 | 4 |
| 2 | 2 | 3 |
| 3 | 3 | 2 |
| 4 | 4 | 1 |

```c run
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            printf("*");
        }
        printf("\n");
    }
    printf("----\n");
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n - i + 1; j++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}
```
```input
4
```
```output
*
**
***
****
----
****
***
**
*
```

Another way to get the inverted shape is to count the outer loop **down**: `for (int i = n; i >= 1; i--)` and keep the inner loop `j <= i`.

### Common mistakes

- Writing the inner condition as `j <= n` for every row. That gives a rectangle, not a triangle.
- Off-by-one: starting `i` at 0 but still using `j <= i` makes the first row empty.

```quiz
What does this print for n = 3?
~~~
for (int i = 1; i <= n; i++) {
    for (int j = i; j <= n; j++) {
        printf("*");
    }
    printf("\n");
}
~~~
- [ ] a triangle that grows: *, **, ***
- [x] an inverted triangle: ***, **, *
- [ ] a 3 x 3 square
- [ ] nothing
> Row 1 runs j from 1 to 3 (3 stars), row 2 from 2 to 3 (2 stars), row 3 from 3 to 3 (1 star).
```

# Step: Pyramids (spaces first, then stars)

A pyramid is centred, so each row needs **two blocks**: some spaces, then some stars. Use two inner loops, one after the other.

For `n` rows, row `i` has:

- `n - i` spaces (fewer and fewer as we go down),
- `2*i - 1` stars (1, 3, 5, 7, ...).

```c run
#include <stdio.h>

int main(void) {
    int n = 4;
    for (int i = 1; i <= n; i++) {
        for (int s = 1; s <= n - i; s++) {
            printf(" ");
        }
        for (int k = 1; k <= 2 * i - 1; k++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}
```
```output
   *
  ***
 *****
*******
```

An **inverted pyramid** reverses both blocks: row `i` has `i - 1` spaces and `2*(n - i) + 1` stars.

> **Note:** In this course we print single `*` characters with no space between them, which keeps the counts easy: 1, 3, 5, 7 stars. Every problem statement says exactly how stars are separated.

### Common mistakes

- Giving the two inner loops the same counter name is fine because they run one after the other, but never reuse the **outer** variable `i`.
- Forgetting that the star count is odd: `2*i - 1`, not `2*i`.

```quiz
In a pyramid with n = 5 rows, how many spaces and stars does row 2 have?
- [ ] 2 spaces, 2 stars
- [ ] 3 spaces, 2 stars
- [x] 3 spaces, 3 stars
- [ ] 2 spaces, 3 stars
> Spaces = n - i = 5 - 2 = 3. Stars = 2*i - 1 = 3.
```

# Step: Number patterns

Instead of printing `*` you can print the **column number** `j`, the **row number** `i`, or a running counter. The shape logic is the same; only `printf` changes.

- `j` in each cell gives `1`, `12`, `123`, ...
- `i` in each cell gives rows of repeated digits.
- Count the digit **down** by printing `n - i + 1`.

```c run
#include <stdio.h>

int main(void) {
    int n = 4;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            printf("%d", j);
        }
        printf("\n");
    }
    printf("----\n");
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n - i + 1; j++) {
            printf("%d", j);
        }
        printf("\n");
    }
    return 0;
}
```
```output
1
12
123
1234
----
1234
123
12
1
```

Now a pattern where the **digit changes with the row** and repeats `i` times:

```c run
#include <stdio.h>

int main(void) {
    int n = 5;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            printf("%d", n - i + 1);
        }
        printf("\n");
    }
    return 0;
}
```
```output
5
44
333
2222
11111
```

### Common mistakes

- Printing `i` when you wanted `j` (or the other way round). Ask yourself: "does the number change along the row, or only from row to row?"
- Numbers with two digits (10, 11, ...) make the pattern wider. Print a separator such as a space when the numbers can exceed 9.

```quiz
What is the 3rd line printed?
~~~
for (int i = 1; i <= 4; i++) {
    for (int j = 1; j <= i; j++) {
        printf("%d", i);
    }
    printf("\n");
}
~~~
- [ ] 123
- [x] 333
- [ ] 3
- [ ] 111
> The value printed is the row number i, repeated i times. On row 3 that is 333.
```

# Step: Floyd's triangle

**Floyd's triangle** fills a right triangle with consecutive numbers 1, 2, 3, ... Row `i` has `i` numbers. The trick is a **counter** `k` declared *outside* both loops, which keeps counting across rows.

```
1
2 3
4 5 6
7 8 9 10
```

Numbers can have different widths, so separate them with a single space. To avoid a trailing space, print a space **before** every number except the first one in the row (`if (j > 1) printf(" ");`).

```c run
#include <stdio.h>

int main(void) {
    int n = 4, k = 1;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            if (j > 1) printf(" ");
            printf("%d", k);
            k++;
        }
        printf("\n");
    }
    return 0;
}
```
```output
1
2 3
4 5 6
7 8 9 10
```

> **Tip:** The last number printed is always `n*(n+1)/2`, the number of cells in the triangle.

### Common mistakes

- Declaring `k = 1` **inside** the outer loop: every row would start again from 1.
- Forgetting `k++`, so the same number repeats.

```quiz
What is the first number of row 5 in Floyd's triangle?
- [ ] 10
- [x] 11
- [ ] 15
- [ ] 5
> Rows 1 to 4 contain 1 + 2 + 3 + 4 = 10 numbers, so row 5 starts at 11.
```

# Step: Pascal's triangle

In **Pascal's triangle** every row starts and ends with 1, and every other number is the sum of the two numbers above it.

```
1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
```

Row `i` (counting from 0) contains the binomial coefficients C(i, 0), C(i, 1), ..., C(i, i). Without using arrays, you can build each number from the previous one in the same row:

`next = current * (i - j) / (j + 1)`

Start each row with `c = 1`. After printing column `j`, update `c`. The division is always exact, so integer arithmetic is safe.

```c run
#include <stdio.h>

int main(void) {
    int n = 5;
    for (int i = 0; i < n; i++) {
        int c = 1;
        for (int j = 0; j <= i; j++) {
            if (j > 0) printf(" ");
            printf("%d", c);
            c = c * (i - j) / (j + 1);
        }
        printf("\n");
    }
    return 0;
}
```
```output
1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
```

Trace row `i = 3`: c = 1 (print 1), then c = 1*3/1 = 3 (print 3), then c = 3*2/2 = 3 (print 3), then c = 3*1/3 = 1 (print 1). That gives `1 3 3 1`.

> **Warning:** Keep the multiplication before the division (`c * (i - j) / (j + 1)`). Dividing first would throw away the fraction and give wrong numbers.

### Common mistakes

- Declaring `c` outside the outer loop, so it is not reset to 1 at the start of each row.
- Large `n` makes the numbers overflow `int`; keep n small (up to about 12 here).

```quiz
Using the formula, what is the new value of c?
~~~
int i = 4, j = 1, c = 4;
c = c * (i - j) / (j + 1);
printf("%d", c);
~~~
- [ ] 3
- [ ] 4
- [x] 6
- [ ] 8
> 4 * (4 - 1) / (1 + 1) = 12 / 2 = 6, the middle number of the row `1 4 6 4 1`.
```

# Step: Hollow shapes

For a **hollow** shape you still use two nested loops over *every* cell, but inside you decide with an `if`: is this cell on the **border**? If yes print `*`, else print a space.

For an `n x n` square (rows and columns numbered 1 to n), a cell is on the border when:

`i == 1 || i == n || j == 1 || j == n`

```c run
#include <stdio.h>

int main(void) {
    int n = 5;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (i == 1 || i == n || j == 1 || j == n) {
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}
```
```output
*****
*   *
*   *
*   *
*****
```

The same idea works for other shapes. For example a hollow right triangle prints a star when `j == 1 || j == i || i == n`.

### Common mistakes

- Using `&&` instead of `||` in the border test. A cell only has to satisfy **one** of the four conditions.
- Forgetting that the `else` branch must still print a space, otherwise the right wall moves left.

```quiz
In a hollow 6 x 6 square, how many stars are printed?
- [ ] 24
- [x] 20
- [ ] 16
- [ ] 36
> 6 + 6 stars for the top and bottom rows, plus 2 stars in each of the 4 middle rows (8): 12 + 8 = 20.
```

# Step: Diamond

A **diamond** is a pyramid on top of an inverted pyramid. The widest row is shared, so the lower half starts one row **below** the widest row.

For `n = 3` (the widest row has 5 stars):

```
  *
 ***
*****
 ***
  *
```

- Upper half: rows `i = 1..n`, with `n - i` spaces and `2*i - 1` stars.
- Lower half: rows `i = n-1` down to `1`, with the same two formulas.

```c run
#include <stdio.h>

int main(void) {
    int n = 3;
    for (int i = 1; i <= n; i++) {
        for (int s = 1; s <= n - i; s++) printf(" ");
        for (int k = 1; k <= 2 * i - 1; k++) printf("*");
        printf("\n");
    }
    for (int i = n - 1; i >= 1; i--) {
        for (int s = 1; s <= n - i; s++) printf(" ");
        for (int k = 1; k <= 2 * i - 1; k++) printf("*");
        printf("\n");
    }
    return 0;
}
```
```output
  *
 ***
*****
 ***
  *
```

> **Tip:** Solve big patterns in pieces. Draw the top half, make it work, then copy the code and reverse the outer loop for the bottom half.

### Common mistakes

- Starting the lower loop at `i = n` repeats the widest row, so the diamond looks too fat in the middle.
- Using different formulas for the bottom half. Both halves use the same `n - i` and `2*i - 1`; only the order of `i` changes.

```quiz
A diamond is printed with n = 4. How many lines are printed in total?
- [ ] 4
- [ ] 8
- [x] 7
- [ ] 9
> The upper half has 4 rows and the lower half has n - 1 = 3 rows: 4 + 3 = 7 (that is 2n - 1).
```

# Problem: Right-angled Triangle of Stars
id: patterns-right-triangle
difficulty: easy
source: CSE103 Task Sheet - Patterns #1

Read the number of rows **n** and print a right-angled triangle of stars: row *i* has *i* stars (no spaces between stars). Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 20).
**Output:** the pattern (the first test below is the sample, n = 4).

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
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
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
**
***
****
```

```test
=== input
1
=== output
*
```

```test
=== input
6
=== output
*
**
***
****
*****
******
```

```hint
Outer loop = rows (`i` from 1 to n). Inner loop = stars in that row.
```

```hint
The inner loop should run `j` from 1 to `i`. Print a newline after the inner loop.
```

# Problem: Pyramid of Stars
id: patterns-pyramid
difficulty: medium
source: CSE103 Task Sheet - Patterns #2

Read **n** and print a centred pyramid of stars with n rows. Row *i* has *n - i* leading spaces followed by *2i - 1* stars (no spaces between stars). Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 20).
**Output:** the pattern (the first test below is the sample, n = 3).

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
    for (int i = 1; i <= n; i++) {
        for (int s = 1; s <= n - i; s++) {
            printf(" ");
        }
        for (int k = 1; k <= 2 * i - 1; k++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
3
=== output
  *
 ***
*****
```

```test
=== input
1
=== output
*
```

```test
=== input
5
=== output
    *
   ***
  *****
 *******
*********
```

```hint
Each row has two blocks: spaces, then stars. Use two inner loops one after the other.
```

```hint
Spaces: `n - i`. Stars: `2 * i - 1`.
```

# Problem: Inverted Right-angled Triangle
id: patterns-inverted-triangle
difficulty: easy
source: CSE103 Task Sheet - Patterns #3; Aptech Loop #5

Read **n** and print an inverted right-angled triangle of stars: the first row has n stars and every following row has one star fewer (no spaces between stars). Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 20).
**Output:** the pattern (the first test below is the sample, n = 4).

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
    for (int i = n; i >= 1; i--) {
        for (int j = 1; j <= i; j++) {
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
****
***
**
*
```

```test
=== input
1
=== output
*
```

```test
=== input
7
=== output
*******
******
*****
****
***
**
*
```

```hint
Count the outer loop downwards from n to 1.
```

```hint
The row with counter `i` prints `i` stars.
```

# Problem: Floyd's Triangle
id: patterns-floyd
difficulty: medium
source: CSE103 Task Sheet - Patterns #4

Print Floyd's triangle with **n** rows: consecutive integers 1, 2, 3, ... fill the triangle and row *i* has *i* numbers. Numbers in a row are separated by a single space. Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 15).
**Output:** the pattern (the first test below is the sample, n = 4).

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
    int k = 1;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            if (j > 1) printf(" ");
            printf("%d", k);
            k++;
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
1
2 3
4 5 6
7 8 9 10
```

```test
=== input
1
=== output
1
```

```test
=== input
5
=== output
1
2 3
4 5 6
7 8 9 10
11 12 13 14 15
```

```hint
Use a counter `k` that starts at 1 *outside* the loops.
```

```hint
Print `k` and then do `k++` inside the inner loop.
```

# Problem: Pascal's Triangle
id: patterns-pascal
difficulty: hard
source: CSE103 Task Sheet - Patterns #5; Lab Manual Lab 5 Exercise 3

Print Pascal's triangle with **n** rows. Each row starts and ends with 1 and every other number is the sum of the two numbers above it. Numbers in a row are separated by one space and the rows are left-aligned. Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 10).
**Output:** the pattern (the first test below is the sample, n = 5).

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
    for (int i = 0; i < n; i++) {
        int c = 1;
        for (int j = 0; j <= i; j++) {
            if (j > 0) printf(" ");
            printf("%d", c);
            c = c * (i - j) / (j + 1);
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
5
=== output
1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
```

```test
=== input
1
=== output
1
```

```test
=== input
7
=== output
1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
1 5 10 10 5 1
1 6 15 20 15 6 1
```

```test
=== input
10
=== output
1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
1 5 10 10 5 1
1 6 15 20 15 6 1
1 7 21 35 35 21 7 1
1 8 28 56 70 56 28 8 1
1 9 36 84 126 126 84 36 9 1
```

```hint
Row i (counting from 0) has i + 1 numbers: C(i,0), C(i,1), ... C(i,i).
```

```hint
Start each row with `c = 1`. After printing column j, update `c = c * (i - j) / (j + 1);`.
```

# Problem: Hollow Square
id: patterns-hollow-square
difficulty: medium
source: CSE103 Task Sheet - Patterns #6

Read **n** and print a hollow square of stars: the border of an n x n square is made of `*` and the inside is filled with spaces. Stars and spaces are printed without separators. Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 20).
**Output:** the pattern (the first test below is the sample, n = 5).

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
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (i == 1 || i == n || j == 1 || j == n) {
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
5
=== output
*****
*   *
*   *
*   *
*****
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
**
**
```

```test
=== input
4
=== output
****
*  *
*  *
****
```

```hint
Loop over every cell (n rows, n columns) and decide what to print.
```

```hint
A cell is on the border if `i == 1 || i == n || j == 1 || j == n`.
```

# Problem: Diamond of Stars
id: patterns-diamond
difficulty: hard
source: CSE103 Task Sheet - Patterns #7

Read **n** and print a diamond of stars. The upper half is a pyramid with n rows; the lower half is an inverted pyramid with n - 1 rows (so the widest row appears once). No spaces between stars. The diamond has 2n - 1 lines. Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 15).
**Output:** the pattern (the first test below is the sample, n = 3).

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
    for (int i = 1; i <= n; i++) {
        for (int s = 1; s <= n - i; s++) printf(" ");
        for (int k = 1; k <= 2 * i - 1; k++) printf("*");
        printf("\n");
    }
    for (int i = n - 1; i >= 1; i--) {
        for (int s = 1; s <= n - i; s++) printf(" ");
        for (int k = 1; k <= 2 * i - 1; k++) printf("*");
        printf("\n");
    }
    return 0;
}
```

```test
=== input
3
=== output
  *
 ***
*****
 ***
  *
```

```test
=== input
1
=== output
*
```

```test
=== input
4
=== output
   *
  ***
 *****
*******
 *****
  ***
   *
```

```hint
Print the upper half as a pyramid first.
```

```hint
Then a second loop with `i` from n - 1 down to 1 prints the lower half with the same formulas (n - i spaces, 2i - 1 stars).
```

# Problem: Number Triangle
id: patterns-number-triangle
difficulty: easy
source: Aptech Loop #4(a), Loop (Lab) #2

Read **n** and print a number triangle: row *i* contains the numbers 1, 2, ..., i written next to each other without spaces. Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 9).
**Output:** the pattern (the first test below is the sample, n = 4).

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
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            printf("%d", j);
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
1
12
123
1234
```

```test
=== input
1
=== output
1
```

```test
=== input
9
=== output
1
12
123
1234
12345
123456
1234567
12345678
123456789
```

```hint
It is the star triangle again, but print the column number `j` instead of `*`.
```

# Problem: Inverted Number Triangle
id: patterns-inverted-number-triangle
difficulty: easy
source: Aptech Loop #4(b)

Read **n** and print an inverted number triangle: row 1 is `12...n` and every following row is one number shorter. Numbers are written next to each other without spaces. Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 9).
**Output:** the pattern (the first test below is the sample, n = 5).

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
    for (int i = n; i >= 1; i--) {
        for (int j = 1; j <= i; j++) {
            printf("%d", j);
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
5
=== output
12345
1234
123
12
1
```

```test
=== input
1
=== output
1
```

```test
=== input
9
=== output
123456789
12345678
1234567
123456
12345
1234
123
12
1
```

```hint
Count the outer loop down from n to 1. The inner loop prints 1..i.
```

# Problem: Descending Digit Triangle
id: patterns-digit-triangle
difficulty: medium
source: Lab Manual - Lab 5 Lab Task 2

Read **n** and print a triangle where row *i* contains the digit *n - i + 1* repeated *i* times, with no spaces. Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 9).
**Output:** the pattern (the first test below is the sample, n = 5).

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
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            printf("%d", n - i + 1);
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
5
=== output
5
44
333
2222
11111
```

```test
=== input
1
=== output
1
```

```test
=== input
3
=== output
3
22
111
```

```test
=== input
9
=== output
9
88
777
6666
55555
444444
3333333
22222222
111111111
```

```hint
The number of digits in row `i` is `i`. The digit itself is `n - i + 1`.
```

# Problem: Right-aligned Triangle
id: patterns-right-aligned-triangle
difficulty: medium
source: Class Notes - Pattern tasks (hill, reverse hill)

Read **n** and print a right-aligned triangle: row *i* has *n - i* leading spaces and then *i* stars (no spaces between stars). Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 20).
**Output:** the pattern (the first test below is the sample, n = 4).

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
    for (int i = 1; i <= n; i++) {
        for (int s = 1; s <= n - i; s++) printf(" ");
        for (int k = 1; k <= i; k++) printf("*");
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
  **
 ***
****
```

```test
=== input
1
=== output
*
```

```test
=== input
6
=== output
     *
    **
   ***
  ****
 *****
******
```

```hint
Two blocks per row: spaces first, then stars.
```

# Problem: Inverted Pyramid
id: patterns-inverted-pyramid
difficulty: medium
source: Class Notes - Pattern tasks (reverse hill)

Read **n** and print an inverted pyramid: row *i* has *i - 1* leading spaces followed by *2(n - i) + 1* stars (no spaces between stars). Print only the pattern, with no extra spaces at the end of a line.

**Input:** one integer n (1 ≤ n ≤ 20).
**Output:** the pattern (the first test below is the sample, n = 3).

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
    for (int i = 1; i <= n; i++) {
        for (int s = 1; s <= i - 1; s++) printf(" ");
        for (int k = 1; k <= 2 * (n - i) + 1; k++) printf("*");
        printf("\n");
    }
    return 0;
}
```

```test
=== input
3
=== output
*****
 ***
  *
```

```test
=== input
1
=== output
*
```

```test
=== input
5
=== output
*********
 *******
  *****
   ***
    *
```

```hint
The first row is the widest: it has 2n - 1 stars and no spaces.
```

```hint
Each next row adds one space and removes two stars.
```
