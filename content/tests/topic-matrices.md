---
id: topic-matrices
title: "Topic Test: 2D Arrays & Matrices"
group: topic
lesson: matrices
order: 107
duration: 30
covers: 2D array declaration and initialization, nested-loop traversal, row and column sums, transpose, matrix multiplication
summary: Trace 2D array programs and spot classic matrix bugs, then write two short matrix programs.
---

# Question: Rows and columns from sizeof
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int rows = (int)(sizeof(m) / sizeof(m[0]));
    int cols = (int)(sizeof(m[0]) / sizeof(m[0][0]));
    printf("%d %d %d", rows, cols, m[1][0]);
    return 0;
}
~~~
- [ ] 3 2 4
- [ ] 6 3 4
- [x] 2 3 4
- [ ] 2 3 2
> sizeof(m) is 24 bytes and one row m[0] is 12 bytes, so there are 2 rows. A row holds 12 / 4 = 3 ints. m[1][0] is the first element of the second row, 4.
```

# Question: Partial 2D initialization
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int m[2][3] = {{1}, {2, 3}};
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 3; j++) {
            printf("%d ", m[i][j]);
        }
    }
    return 0;
}
~~~
- [ ] 1 2 3 0 0 0
- [x] 1 0 0 2 3 0
- [ ] 1 2 3 garbage garbage garbage
- [ ] 1 1 1 2 3 3
> Each inner brace list fills its own row from the start, and the missing elements of that row become 0. Row 0 is 1 0 0 and row 1 is 2 3 0.
```

# Question: Swapping the whole matrix
marks: 2

```quiz run
A student tries to transpose a 3 x 3 matrix in place by swapping m[i][j] with m[j][i] for every i and j. What is the output?
~~~
#include <stdio.h>
int main(void) {
    int m[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            int t = m[i][j];
            m[i][j] = m[j][i];
            m[j][i] = t;
        }
    }
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            printf("%d ", m[i][j]);
        }
    }
    return 0;
}
~~~
- [ ] 1 4 7 2 5 8 3 6 9
- [ ] 9 8 7 6 5 4 3 2 1
- [ ] 1 2 3 4 0 6 7 8 9
- [x] 1 2 3 4 5 6 7 8 9
> Every pair above and below the diagonal is visited twice (once as (i, j) and once as (j, i)), so each pair is swapped and then swapped back. The matrix ends unchanged. Swap only when j > i.
```

# Question: The sum that is never reset
marks: 2

```quiz run
The program should print the sum of each row. What is its actual output?
~~~
#include <stdio.h>
int main(void) {
    int m[2][2] = {{1, 2}, {3, 4}};
    int s = 0;
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 2; j++) {
            s += m[i][j];
        }
        printf("%d ", s);
    }
    return 0;
}
~~~
- [ ] 3 7
- [ ] 3 4
- [ ] 10 10
- [x] 3 10
> s is declared outside the outer loop, so it is not set back to 0 for the second row. It keeps 3 and then adds 3 + 4, giving 10. Declare or reset s = 0 inside the outer loop.
```

# Question: Invalid declaration
marks: 2

```quiz
Which of these declarations is NOT valid C?
~~~
int a[2][3];
int b[][3] = {{1, 2, 3}, {4, 5, 6}};
int c[3][];
int d[2][2] = {{1, 2}, {3, 4}};
~~~
- [ ] int a[2][3];
- [ ] int b[][3] = {{1, 2, 3}, {4, 5, 6}};
- [x] int c[3][];
- [ ] int d[2][2] = {{1, 2}, {3, 4}};
> Only the first dimension may be left empty (when an initializer is given). The column count must always be written, so int c[3][]; is an error.
```

# Question: Matrix multiplication bug
marks: 2

```quiz
This code multiplies A (2 x 2) and B (2 x 2) into C, but C holds wrong values even though A and B are correct. What is the bug?
~~~
int C[2][2];
for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 2; j++) {
        for (int k = 0; k < 2; k++) {
            C[i][j] += A[i][k] * B[k][j];
        }
    }
}
~~~
- [ ] The formula should be A[i][k] * B[i][k]
- [ ] k must run from 1 to 2
- [x] C[i][j] is never set to 0 before the += accumulation, so it starts with a garbage value; set C[i][j] = 0 just before the k loop
- [ ] C must be declared with size 3 x 3
> += adds to whatever is already stored. A local array is not zeroed automatically, so every C[i][j] must be initialized to 0 before summing its products.
```

# Problem: Row with the largest sum
id: topic-matrices-best-row
difficulty: easy
source: Original (topic test)
marks: 6

Read an r x c matrix of integers. Find the row whose elements add up to the **largest sum** and print its row number (counting from 1) together with the sum. If several rows share the largest sum, report the **first** one.

**Input:** the first line has r and c (1 ≤ r, c ≤ 10). The next r lines each have c integers.
**Output:** `Row R has the largest sum: S`

```c starter
#include <stdio.h>

int main(void) {
    int r, c;
    int a[10][10];
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int r, c;
    int a[10][10];
    int bestRow = 0, bestSum = 0;
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    for (int i = 0; i < r; i++) {
        int sum = 0;
        for (int j = 0; j < c; j++) {
            sum += a[i][j];
        }
        if (i == 0 || sum > bestSum) {
            bestSum = sum;
            bestRow = i;
        }
    }
    printf("Row %d has the largest sum: %d\n", bestRow + 1, bestSum);
    return 0;
}
```

```test
=== input
2 3
1 2 3
4 5 6
=== output
Row 2 has the largest sum: 15
```

```test
=== input
3 2
5 5
4 6
-1 0
=== output
Row 1 has the largest sum: 10
```

```test
=== input
1 1
-7
=== output
Row 1 has the largest sum: -7
```

```test
=== input
2 2
-1 -2
-3 -4
=== output
Row 1 has the largest sum: -3
```

```hint
Compute the sum of each row with an inner loop, resetting the sum to 0 at the start of every row.
```

```hint
Do not start the best sum at 0, because all sums may be negative. Take row 0 as the first best, and replace it only when a later sum is strictly greater so ties keep the first row.
```

# Problem: Rotate a matrix clockwise
id: topic-matrices-rotate
difficulty: medium
source: Original (topic test)
marks: 8

Read an r x c matrix and print it **rotated 90 degrees clockwise**. The rotated matrix has c rows and r columns. For example, the matrix with rows `1 2 3` and `4 5 6` becomes the matrix with rows `4 1` and `5 2` and `6 3`. The matrix need not be square.

**Input:** the first line has r and c (1 ≤ r, c ≤ 10). The next r lines each have c integers.
**Output:** c lines, each with r integers separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int r, c;
    int a[10][10];
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int r, c;
    int a[10][10];
    scanf("%d %d", &r, &c);
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    for (int i = 0; i < c; i++) {
        for (int j = 0; j < r; j++) {
            if (j > 0) printf(" ");
            printf("%d", a[r - 1 - j][i]);
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
4 1
5 2
6 3
```

```test
=== input
1 4
7 8 9 10
=== output
7
8
9
10
```

```test
=== input
3 3
1 2 3
4 5 6
7 8 9
=== output
7 4 1
8 5 2
9 6 3
```

```test
=== input
1 1
-5
=== output
-5
```

```hint
Look at the first output row of the example: 4 1 is the first column of the input read from the bottom up. In general, output row i is input column i read from the last row to the first.
```

```hint
Loop i from 0 to c - 1 for the output rows and j from 0 to r - 1 for the output columns, and print a[r - 1 - j][i]. Print a newline after each output row.
```
