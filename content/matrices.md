---
id: matrices
title: "2D Arrays & Matrices"
order: 7
summary: Tables of numbers with rows and columns; nested-loop input and output, row/column sums, addition, transpose and multiplication.
---

# Step: Two-dimensional arrays

A 1D array is a **row** of boxes. A **2D array** is a **table** (grid) of boxes with **rows** and **columns**. In maths it is called a **matrix**.

```c
int m[2][3];   // 2 rows, 3 columns = 6 boxes
```

The first number is the number of **rows**, the second the number of **columns**. Each box is named by two indexes, **row first, then column**, and both start from 0:

| | col 0 | col 1 | col 2 |
|---|---|---|---|
| **row 0** | `m[0][0]` | `m[0][1]` | `m[0][2]` |
| **row 1** | `m[1][0]` | `m[1][1]` | `m[1][2]` |

You can fill a 2D array when you declare it, one braces group per row:

```c
int m[2][3] = {{1, 2, 3},
               {4, 5, 6}};
```

In memory the rows are stored one after another (row 0 first, then row 1), but you should think of the grid. The visualizer draws it as a grid of boxes.

```c run
#include <stdio.h>

int main(void) {
    int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int rows = sizeof(m) / sizeof(m[0]);
    int cols = sizeof(m[0]) / sizeof(m[0][0]);
    printf("%d %d\n", m[0][0], m[1][2]);
    printf("%d\n", m[1][0]);
    printf("%d %d\n", rows, cols);
    return 0;
}
```
```output
1 6
4
2 3
```

Here `sizeof(m)` is the whole table (24 bytes), `sizeof(m[0])` is one row (12 bytes) and `sizeof(m[0][0])` is one box (4 bytes). So rows = 24 / 12 = 2 and columns = 12 / 4 = 3.

> **Warning:** Valid indexes are `0` to `rows - 1` and `0` to `cols - 1`. `m[2][0]` in a 2 x 3 array is out of bounds.

### Common mistakes

- Swapping the indexes: the **row** comes first, `m[row][col]`.
- Writing `int m[2, 3]` or `m[2][3]` to mean "row 2, column 3" when declaring. In a declaration the numbers are sizes, not indexes.
- Forgetting the second size: `int m[][];` is an error. Only the first size may be left out when you initialize.

```quiz
In `int m[3][4];` which is the LAST box?
- [ ] m[3][4]
- [ ] m[4][3]
- [x] m[2][3]
- [ ] m[3][2]
> There are 3 rows (0 to 2) and 4 columns (0 to 3), so the last box is m[2][3].
```

# Step: Reading and printing with nested loops

To visit **every** box of a table use two nested loops: the outer loop walks the **rows** (`i`), the inner loop walks the **columns** (`j`), exactly like the pattern programs. The same loops are used for reading and for printing.

```c
for (int i = 0; i < r; i++) {
    for (int j = 0; j < c; j++) {
        scanf("%d", &a[i][j]);
    }
}
```

When printing, print a newline after each **row** (after the inner loop), and a space between numbers on the same row.

We declare a table big enough for the worst case (here 10 x 10) and read the real number of rows `r` and columns `c`; only `a[0..r-1][0..c-1]` is used.

```c run
#include <stdio.h>

int main(void) {
    int r, c, a[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            if (j > 0) printf(" ");
            printf("%d", a[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```
```input
2 3
1 2 3
4 5 6
```
```output
1 2 3
4 5 6
```

Numbers are read row by row: first `a[0][0]`, `a[0][1]`, `a[0][2]`, then `a[1][0]` and so on. Watch the visualizer fill the grid in that order.

### Common mistakes

- Putting `printf("\n")` inside the inner loop (every number on its own line) or forgetting it (everything on one line).
- Using `r` where you need `c` (or the other way round) in the inner loop. For a non-square matrix this reads or prints the wrong boxes or goes out of bounds.
- Forgetting the `&` in `scanf("%d", &a[i][j]);`.

```quiz
For a 3 x 2 matrix (r = 3, c = 2), how many times does the inner body run?
- [ ] 5
- [x] 6
- [ ] 2
- [ ] 3
> The outer loop runs 3 times and the inner loop 2 times per outer turn: 3 x 2 = 6 boxes.
```

# Step: Row sums and column sums

Because we visit boxes in a chosen order, we can answer questions about rows or columns.

- **Row sum**: for each row `i`, set `s = 0`, add `a[i][0..c-1]`, then print or store `s`. Outer loop over rows, inner loop over columns.
- **Column sum**: swap the loops. Outer loop over columns `j`, inner loop over rows `i`, adding `a[i][j]`.

The important point is **where `s = 0` goes**: right before the inner loop, so every row (or column) starts fresh.

```c run
#include <stdio.h>

int main(void) {
    int r, c, a[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    for (int i = 0; i < r; i++) {
        int s = 0;
        for (int j = 0; j < c; j++) {
            s += a[i][j];
        }
        printf("Row %d sum = %d\n", i + 1, s);
    }
    for (int j = 0; j < c; j++) {
        int s = 0;
        for (int i = 0; i < r; i++) {
            s += a[i][j];
        }
        printf("Col %d sum = %d\n", j + 1, s);
    }
    return 0;
}
```
```input
2 3
1 2 3
4 5 6
```
```output
Row 1 sum = 6
Row 2 sum = 15
Col 1 sum = 5
Col 2 sum = 7
Col 3 sum = 9
```

> **Tip:** Adding all row sums (or all column sums) gives the total of the whole matrix: 6 + 15 = 21 = 5 + 7 + 9.

### Common mistakes

- Declaring `s = 0` once outside the loops, so the sums keep growing from the previous row.
- For column sums, keeping the outer loop on rows. You then add the wrong boxes.

```quiz
In the column-sum code, which loop is the OUTER loop?
- [ ] the loop over rows (i)
- [x] the loop over columns (j)
- [ ] it does not matter
- [ ] there is no outer loop
> For each column j we run through all rows i, so j must be the outer loop and i the inner one.
```

# Step: Matrix addition (and subtraction)

Two matrices can be added only if they have the **same order** (the same number of rows and the same number of columns). The sum matrix is made box by box:

`sum[i][j] = a[i][j] + b[i][j]`

Subtraction works the same way with `-`. You read two matrices, then use **one** pair of nested loops for the calculation.

```c run
#include <stdio.h>

int main(void) {
    int r, c, a[10][10], b[10][10], s[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++)
            scanf("%d", &a[i][j]);
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++)
            scanf("%d", &b[i][j]);
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++)
            s[i][j] = a[i][j] + b[i][j];
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            if (j > 0) printf(" ");
            printf("%d", s[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```
```input
2 2
1 2
3 4
5 6
7 8
```
```output
6 8
10 12
```

When a loop body is a single statement, braces are optional; here the inner `for` is the single statement of the outer `for`.

### Common mistakes

- Trying `s = a + b;` on whole arrays. C cannot add arrays; you must add box by box.
- Reading both matrices in one loop with the wrong order of input. Read all of A first, then all of B (as the input is given).

```quiz
Which pair of matrices CANNOT be added?
- [ ] 2 x 3 and 2 x 3
- [ ] 1 x 1 and 1 x 1
- [x] 2 x 3 and 3 x 2
- [ ] 4 x 4 and 4 x 4
> Matrices must have the same number of rows and columns. 2 x 3 and 3 x 2 differ.
```

# Step: Transpose

The **transpose** of a matrix flips it over its diagonal: **rows become columns**. If `A` is `r x c`, its transpose `T` is `c x r` and

`T[j][i] = A[i][j]`

```c run
#include <stdio.h>

int main(void) {
    int r, c, a[10][10], t[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++)
            scanf("%d", &a[i][j]);
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++)
            t[j][i] = a[i][j];
    for (int i = 0; i < c; i++) {
        for (int j = 0; j < r; j++) {
            if (j > 0) printf(" ");
            printf("%d", t[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```
```input
2 3
1 2 3
4 5 6
```
```output
1 4
2 5
3 6
```

Notice the **printing loops use swapped limits**: the transpose has `c` rows and `r` columns.

### Common mistakes

- Printing the transpose with `i < r` and `j < c`. The result has `c` rows and `r` columns.
- Writing `t[i][j] = a[j][i]` with the original sizes. For a non-square matrix this can go out of bounds. Use `t[j][i] = a[i][j]` while looping over the **original** `i < r`, `j < c`.

```quiz
A matrix has 3 rows and 5 columns. What is the size of its transpose?
- [ ] 3 x 5
- [x] 5 x 3
- [ ] 5 x 5
- [ ] 3 x 3
> Rows and columns swap, so the transpose has 5 rows and 3 columns.
```

# Step: Matrix multiplication

To multiply `A` (`m x n`) by `B` (`n x p`) the number of **columns of A must equal the number of rows of B**. The product `C` has size `m x p`, and each box is a sum of products:

`C[i][j] = A[i][0]*B[0][j] + A[i][1]*B[1][j] + ... + A[i][n-1]*B[n-1][j]`

That is "row `i` of A times column `j` of B". Code it with **three** nested loops: `i` over rows of A, `j` over columns of B, `k` over the shared dimension. Reset the sum to 0 before the `k` loop.

```c run
#include <stdio.h>

int main(void) {
    int m, n, p, a[10][10], b[10][10], c[10][10];
    scanf("%d %d %d", &m, &n, &p);
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            scanf("%d", &a[i][j]);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < p; j++)
            scanf("%d", &b[i][j]);
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < p; j++) {
            c[i][j] = 0;
            for (int k = 0; k < n; k++) {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < p; j++) {
            if (j > 0) printf(" ");
            printf("%d", c[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```
```input
2 2 2
1 2
3 4
5 6
7 8
```
```output
19 22
43 50
```

Check one box by hand: `C[0][0] = 1*5 + 2*7 = 19` and `C[1][1] = 3*6 + 4*8 = 50`. The matrices do not have to be square. A 2 x 3 matrix times a 3 x 2 matrix gives a 2 x 2 matrix:

```c run
#include <stdio.h>

int main(void) {
    int a[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int b[3][2] = {{7, 8}, {9, 10}, {11, 12}};
    int c[2][2];
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 2; j++) {
            c[i][j] = 0;
            for (int k = 0; k < 3; k++) {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    for (int i = 0; i < 2; i++) {
        printf("%d %d\n", c[i][0], c[i][1]);
    }
    return 0;
}
```
```output
58 64
139 154
```

### Common mistakes

- Forgetting `c[i][j] = 0;` before the `k` loop. The old value (or garbage) would be added to.
- Multiplying box by box (`a[i][j] * b[i][j]`). That is not matrix multiplication.
- Using one size for all three loops when the matrices are not square.
- Multiplying when the columns of A differ from the rows of B. Always check first.

```quiz
A is 3 x 2 and B is 2 x 4. What is the size of A x B?
- [ ] 2 x 2
- [ ] 3 x 2
- [x] 3 x 4
- [ ] 2 x 4
> The inner sizes (2 and 2) match and disappear; the result has the rows of A and the columns of B: 3 x 4.
```

# Step: Diagonals and special matrices

For a **square** matrix (`n x n`) two diagonals matter:

- **Main diagonal**: top-left to bottom-right, the boxes where `i == j`.
- **Anti-diagonal**: top-right to bottom-left, the boxes where `i + j == n - 1`.

You do not need nested loops for a diagonal: one loop over `i` is enough, using `a[i][i]` and `a[i][n - 1 - i]`.

```c run
#include <stdio.h>

int main(void) {
    int n, a[10][10];
    scanf("%d", &n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            scanf("%d", &a[i][j]);
    int main_d = 0, anti = 0;
    for (int i = 0; i < n; i++) {
        main_d += a[i][i];
        anti += a[i][n - 1 - i];
    }
    printf("Main diagonal = %d\n", main_d);
    printf("Anti-diagonal = %d\n", anti);
    return 0;
}
```
```input
3
1 2 3
4 5 6
7 8 9
```
```output
Main diagonal = 15
Anti-diagonal = 15
```

The main diagonal is 1 + 5 + 9 and the anti-diagonal is 3 + 5 + 7. The middle box (5) belongs to both.

A matrix is **symmetric** when it equals its own transpose, that is `a[i][j] == a[j][i]` for every `i` and `j`. To test it, compare every pair; if any pair differs the matrix is not symmetric.

> **Tip:** For a "does the whole matrix satisfy a rule?" question, assume yes (`ok = 1`), loop through every box, and set `ok = 0` as soon as you find a counter-example.

### Common mistakes

- Using `i == j` on a non-square matrix and expecting a "diagonal" that reaches the corner.
- Writing the anti-diagonal as `a[i][n - i]`. That is one box too far (out of bounds for `i = 0`). It is `n - 1 - i`.

```quiz
In a 4 x 4 matrix, which box is on the anti-diagonal in row 1 (counting rows from 0)?
- [ ] a[1][1]
- [ ] a[1][3]
- [x] a[1][2]
- [ ] a[1][4]
> Anti-diagonal boxes satisfy i + j = n - 1 = 3. For i = 1 we need j = 2.
```

# Problem: Add Two Matrices
id: matrices-add
difficulty: easy
source: CSE103 Task Sheet - Arrays #8; Lab Manual Lab 6 (6.2.2); Class Notes Ex 5.9

Read two matrices A and B of the same order and print their sum.

**Input:** the first line has r and c (1 ≤ r, c ≤ 10); then r lines with c integers each for matrix A, followed by r lines with c integers for matrix B.
**Output:** r lines with c integers each (the sum matrix), numbers separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int r, c, a[10][10], b[10][10];
    scanf("%d %d", &r, &c);
    // read matrix A, then matrix B
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int r, c, a[10][10], b[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &b[i][j]);
        }
    }
    int s[10][10];
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            s[i][j] = a[i][j] + b[i][j];
        }
    }
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            if (j > 0) printf(" ");
            printf("%d", s[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
2 2
1 2
3 4
5 6
7 8
=== output
6 8
10 12
```

```test
=== input
1 1
-1
1
=== output
0
```

```test
=== input
2 3
1 2 3
4 5 6
0 -2 10
7 7 -6
=== output
1 0 13
11 12 0
```

```hint
Read A completely, then B. Both have r rows and c columns.
```

```hint
`s[i][j] = a[i][j] + b[i][j]` inside two nested loops. Print a newline after each row.
```

# Problem: Subtract Two Matrices
id: matrices-subtract
difficulty: easy
source: Lecture 6 (2D Array) homework

Read two matrices A and B of the same order and print A - B.

**Input:** the first line has r and c (1 ≤ r, c ≤ 10); then r lines with c integers each for matrix A, followed by r lines with c integers for matrix B.
**Output:** r lines with c integers each (A - B), numbers separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int r, c, a[10][10], b[10][10];
    scanf("%d %d", &r, &c);
    // read matrix A, then matrix B
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int r, c, a[10][10], b[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &b[i][j]);
        }
    }
    int d[10][10];
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            d[i][j] = a[i][j] - b[i][j];
        }
    }
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            if (j > 0) printf(" ");
            printf("%d", d[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
2 2
5 6
7 8
1 2
3 4
=== output
4 4
4 4
```

```test
=== input
1 1
-1
1
=== output
-2
```

```test
=== input
2 3
1 2 3
4 5 6
0 -2 10
7 7 -6
=== output
1 4 -7
-3 -2 12
```

```hint
It is the same as addition, but with `-`.
```

# Problem: Transpose of a Matrix
id: matrices-transpose
difficulty: easy
source: CSE103 Task Sheet - Arrays #9; Lab Manual Lab 6 Exercise 4; Class Notes Ex 5.10

Read an r x c matrix and print its transpose (a c x r matrix whose rows are the columns of the original).

**Input:** the first line has r and c (1 ≤ r, c ≤ 10); then r lines with c integers each.
**Output:** c lines with r integers each, numbers separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int r, c, a[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int r, c, a[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    int t[10][10];
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            t[j][i] = a[i][j];
        }
    }
    for (int i = 0; i < c; i++) {
        for (int j = 0; j < r; j++) {
            if (j > 0) printf(" ");
            printf("%d", t[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
2 3
1 2 3
4 5 6
=== output
1 4
2 5
3 6
```

```test
=== input
1 1
7
=== output
7
```

```test
=== input
3 1
1
2
3
=== output
1 2 3
```

```test
=== input
3 2
1 2
3 4
5 6
=== output
1 3 5
2 4 6
```

```hint
The element at row i, column j of the original goes to row j, column i: `t[j][i] = a[i][j]`.
```

```hint
The transpose has c rows and r columns, so print it with those limits.
```

# Problem: Multiply Two Matrices
id: matrices-multiply
difficulty: hard
source: CSE103 Task Sheet - Arrays #10; Class Notes Ex 5.11

Read matrix A of size m x n and matrix B of size n x p and print the product A x B (an m x p matrix).

**Input:** the first line has m, n and p (1 ≤ m, n, p ≤ 10); then m lines with n integers (matrix A); then n lines with p integers (matrix B).
**Output:** m lines with p integers each, separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int m, n, p, a[10][10], b[10][10], c[10][10];
    scanf("%d %d %d", &m, &n, &p);
    // read A (m x n), then B (n x p)
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int m, n, p, a[10][10], b[10][10], c[10][10];
    scanf("%d %d %d", &m, &n, &p);
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < p; j++) {
            scanf("%d", &b[i][j]);
        }
    }
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < p; j++) {
            c[i][j] = 0;
            for (int k = 0; k < n; k++) {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < p; j++) {
            if (j > 0) printf(" ");
            printf("%d", c[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
2 2 2
1 2
3 4
5 6
7 8
=== output
19 22
43 50
```

```test
=== input
2 3 2
1 2 3
4 5 6
7 8
9 10
11 12
=== output
58 64
139 154
```

```test
=== input
2 2 3
2 -1
3 4
3 -9 2
5 7 -6
=== output
1 -25 10
29 1 -18
```

```test
=== input
1 1 1
3
-4
=== output
-12
```

```hint
`c[i][j]` is row i of A times column j of B: a sum of products.
```

```hint
Use three loops: i over m, j over p, k over n. Set `c[i][j] = 0` before the k loop and add `a[i][k] * b[k][j]` inside it.
```

# Problem: Multiply with Dimension Check
id: matrices-multiply-check
difficulty: hard
source: Lecture 6 (2D Array) - multiplication program

Read matrix A (ra x ca) and matrix B (rb x cb). If the matrices cannot be multiplied (ca is not equal to rb) print `Invalid matrix dimensions`; otherwise print the product A x B.

**Input:** a line with ra and ca (1 ≤ ra, ca ≤ 10), then ra lines with ca integers; then a line with rb and cb (1 ≤ rb, cb ≤ 10), then rb lines with cb integers.
**Output:** `Invalid matrix dimensions`, or the ra x cb product matrix with numbers separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int ra, ca, rb, cb, a[10][10], b[10][10];
    scanf("%d %d", &ra, &ca);
    // read A
    scanf("%d %d", &rb, &cb);
    // read B
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int ra, ca, rb, cb, a[10][10], b[10][10], c[10][10];
    scanf("%d %d", &ra, &ca);
    for (int i = 0; i < ra; i++) {
        for (int j = 0; j < ca; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    scanf("%d %d", &rb, &cb);
    for (int i = 0; i < rb; i++) {
        for (int j = 0; j < cb; j++) {
            scanf("%d", &b[i][j]);
        }
    }
    if (ca != rb) {
        printf("Invalid matrix dimensions\n");
        return 0;
    }
    for (int i = 0; i < ra; i++) {
        for (int j = 0; j < cb; j++) {
            c[i][j] = 0;
            for (int k = 0; k < ca; k++) {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    for (int i = 0; i < ra; i++) {
        for (int j = 0; j < cb; j++) {
            if (j > 0) printf(" ");
            printf("%d", c[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```

```test
=== input
2 2
2 -1
3 4
2 3
3 -9 2
5 7 -6
=== output
1 -25 10
29 1 -18
```

```test
=== input
1 3
1 2 3
1 3
1 2 3
=== output
Invalid matrix dimensions
```

```test
=== input
1 3
1 2 3
3 1
4
5
6
=== output
32
```

```hint
Read both matrices first, then compare `ca` with `rb`.
```

```hint
If they differ, print the message and stop (`return 0;`). Otherwise use the three-loop multiplication.
```

# Problem: Row and Column Sums
id: matrices-row-col-sums
difficulty: medium
source: Class Notes - 2D arrays (row/column sums); Lecture 6

Read an r x c matrix and print the sum of every row and the sum of every column.

**Input:** the first line has r and c (1 ≤ r, c ≤ 10); then r lines with c integers each.
**Output:** two lines: `Row sums:` followed by the r row sums, and `Column sums:` followed by the c column sums (each number preceded by one space).

```c starter
#include <stdio.h>

int main(void) {
    int r, c, a[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int r, c, a[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    printf("Row sums:");
    for (int i = 0; i < r; i++) {
        int s = 0;
        for (int j = 0; j < c; j++) {
            s += a[i][j];
        }
        printf(" %d", s);
    }
    printf("\n");
    printf("Column sums:");
    for (int j = 0; j < c; j++) {
        int s = 0;
        for (int i = 0; i < r; i++) {
            s += a[i][j];
        }
        printf(" %d", s);
    }
    printf("\n");
    return 0;
}
```

```test
=== input
2 3
1 2 3
4 5 6
=== output
Row sums: 6 15
Column sums: 5 7 9
```

```test
=== input
1 1
5
=== output
Row sums: 5
Column sums: 5
```

```test
=== input
3 2
-1 2
3 -4
0 9
=== output
Row sums: 1 -1 9
Column sums: 2 7
```

```hint
For row sums the outer loop is over rows. Reset the sum to 0 before each row.
```

```hint
For column sums swap the loops: outer over columns, inner over rows.
```

# Problem: Sum of All Elements
id: matrices-sum-all
difficulty: easy
source: Class Notes Problem 5.12

Read an r x c matrix and print the sum of all its elements.

**Input:** the first line has r and c (1 ≤ r, c ≤ 10); then r lines with c integers each.
**Output:** `Sum = S`.

```c starter
#include <stdio.h>

int main(void) {
    int r, c, a[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int r, c, a[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    int sum = 0;
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            sum += a[i][j];
        }
    }
    printf("Sum = %d\n", sum);
    return 0;
}
```

```test
=== input
2 2
1 2
3 4
=== output
Sum = 10
```

```test
=== input
1 1
-5
=== output
Sum = -5
```

```test
=== input
3 2
-1 2
3 -4
0 9
=== output
Sum = 9
```

```hint
Visit every box with two nested loops and add it to `sum`.
```

# Problem: Largest Element and Its Position
id: matrices-max-position
difficulty: medium
source: Lab Manual Lab 6 (largest element) - extended to 2D

Read an r x c matrix and print its largest element together with its position. Rows and columns are numbered from **1**. If the largest value occurs several times, report the first one when scanning row by row from the top-left.

**Input:** the first line has r and c (1 ≤ r, c ≤ 10); then r lines with c integers each.
**Output:** `Max = V at row R, column C`.

```c starter
#include <stdio.h>

int main(void) {
    int r, c, a[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int r, c, a[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    int max = a[0][0], mr = 0, mc = 0;
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            if (a[i][j] > max) {
                max = a[i][j];
                mr = i;
                mc = j;
            }
        }
    }
    printf("Max = %d at row %d, column %d\n", max, mr + 1, mc + 1);
    return 0;
}
```

```test
=== input
2 3
3 9 2
7 9 1
=== output
Max = 9 at row 1, column 2
```

```test
=== input
1 1
-4
=== output
Max = -4 at row 1, column 1
```

```test
=== input
3 2
-8 -3
-3 -9
-7 -6
=== output
Max = -3 at row 1, column 2
```

```hint
Start from `a[0][0]` and remember its row and column.
```

```hint
Update the maximum only when you find a **strictly bigger** value; then the first occurrence is kept. Print row/column as index + 1.
```

# Problem: Sum of the Diagonals
id: matrices-diagonals
difficulty: medium
source: Class Notes - 2D arrays (diagonals)

Read a square n x n matrix and print the sum of the main diagonal (top-left to bottom-right) and the sum of the anti-diagonal (top-right to bottom-left).

**Input:** the first line has n (1 ≤ n ≤ 10); then n lines with n integers each.
**Output:** two lines: `Main diagonal = X` and `Anti-diagonal = Y`.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[10][10];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[10][10];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    int d1 = 0, d2 = 0;
    for (int i = 0; i < n; i++) {
        d1 += a[i][i];
        d2 += a[i][n - 1 - i];
    }
    printf("Main diagonal = %d\n", d1);
    printf("Anti-diagonal = %d\n", d2);
    return 0;
}
```

```test
=== input
3
1 2 3
4 5 6
7 8 9
=== output
Main diagonal = 15
Anti-diagonal = 15
```

```test
=== input
1
5
=== output
Main diagonal = 5
Anti-diagonal = 5
```

```test
=== input
2
1 -2
3 4
=== output
Main diagonal = 5
Anti-diagonal = 1
```

```test
=== input
4
2 0 0 7
0 3 6 0
0 4 5 0
8 0 0 1
=== output
Main diagonal = 11
Anti-diagonal = 25
```

```hint
The main diagonal is `a[i][i]`; the anti-diagonal is `a[i][n - 1 - i]`.
```

```hint
One loop over `i` is enough.
```

# Problem: Symmetric Matrix
id: matrices-symmetric
difficulty: medium
source: Class Notes - transpose (symmetric matrices)

A square matrix is **symmetric** if it is equal to its transpose, that is `a[i][j] == a[j][i]` for all i and j. Read an n x n matrix and decide.

**Input:** the first line has n (1 ≤ n ≤ 10); then n lines with n integers each.
**Output:** `Symmetric` or `Not symmetric`.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[10][10];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[10][10];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    int ok = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (a[i][j] != a[j][i]) {
                ok = 0;
            }
        }
    }
    if (ok) printf("Symmetric\n");
    else printf("Not symmetric\n");
    return 0;
}
```

```test
=== input
3
1 2 3
2 4 5
3 5 6
=== output
Symmetric
```

```test
=== input
2
1 2
3 4
=== output
Not symmetric
```

```test
=== input
1
9
=== output
Symmetric
```

```hint
Assume the answer is yes (`ok = 1`). Compare `a[i][j]` with `a[j][i]` for every pair.
```

```hint
As soon as one pair differs set `ok = 0`.
```
