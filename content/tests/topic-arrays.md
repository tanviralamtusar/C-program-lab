---
id: topic-arrays
title: "Topic Test: Arrays (1D)"
group: topic
lesson: arrays
order: 106
duration: 30
covers: declaring and indexing, initialisation, sizeof, sum/max/min, array bugs
summary: A short topic test on tracing 1D array code, spotting array bugs and writing two array programs.
---

# Question: Partial initialisation
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a[5] = {1, 2, 3};
    int i, sum = 0;
    for (i = 0; i < 5; i++)
        sum += a[i];
    printf("%d %d", sum, a[4]);
    return 0;
}
~~~
- [ ] 6 3
- [x] 6 0
- [ ] 15 5
- [ ] 6 garbage
> When fewer initialisers than elements are given, the remaining elements are set to 0. So a is {1, 2, 3, 0, 0}, the sum is 6 and a[4] is 0.
```

# Question: Reversing twice
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a[4] = {1, 2, 3, 4};
    int i, t, n = 4;
    for (i = 0; i < n; i++) {
        t = a[i];
        a[i] = a[n - 1 - i];
        a[n - 1 - i] = t;
    }
    for (i = 0; i < n; i++)
        printf("%d ", a[i]);
    return 0;
}
~~~
- [ ] 4 3 2 1
- [x] 1 2 3 4
- [ ] 4 2 3 1
- [ ] 1 3 2 4
> The loop runs over all n positions, so each pair is swapped twice (once from each end) and ends up back where it started. A correct reverse loops only while i < n / 2.
```

# Question: Number of elements with sizeof
marks: 2

```quiz run
What is the output of this program? (int is 4 bytes)
~~~
#include <stdio.h>
int main(void) {
    int a[] = {4, 8, 15, 16, 23, 42};
    printf("%d %d", (int)(sizeof(a) / sizeof(a[0])), (int)sizeof(a));
    return 0;
}
~~~
- [ ] 6 6
- [ ] 24 6
- [x] 6 24
- [ ] 6 4
> The compiler counts 6 initialisers, so a has 6 elements of 4 bytes each: sizeof(a) is 24 and 24 / 4 gives 6 elements.
```

# Question: Maximum that starts at zero
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a[3] = {-5, -2, -9};
    int i, max = 0, min = a[0];
    for (i = 0; i < 3; i++) {
        if (a[i] > max) max = a[i];
        if (a[i] < min) min = a[i];
    }
    printf("max=%d min=%d", max, min);
    return 0;
}
~~~
- [ ] max=-2 min=-9
- [x] max=0 min=-9
- [ ] max=0 min=0
- [ ] max=-5 min=-9
> max starts at 0, and no element is greater than 0, so it stays 0 even though 0 is not in the array. Initialise max (and min) with a[0] instead.
```

# Question: The off-by-one input loop
marks: 2

```quiz
What is wrong with this code?
~~~
int a[5], i;
for (i = 1; i <= 5; i++)
    scanf("%d", &a[i]);
~~~
- [ ] scanf cannot read into an array element
- [ ] a must be initialised before it is read
- [x] the valid indexes are 0 to 4, so a[5] is outside the array (and a[0] is skipped)
- [ ] the loop should use i < 5 but still start at 1
> An array of 5 elements has indexes 0..4. The loop reads a[1] to a[5]; a[5] is out of bounds, which is undefined behaviour. Use for (i = 0; i < 5; i++).
```

# Question: Copying an array
marks: 2

```quiz
Arrays a and b are both declared as int[5]. How do you copy the contents of a into b?
- [ ] b = a;
- [ ] b[] = a[];
- [x] for (i = 0; i < 5; i++) b[i] = a[i];
- [ ] b[5] = a[5];
> An array name cannot be assigned to another array in C. Copy it element by element with a loop (or memcpy). b[5] = a[5] only touches an index outside the array.
```

# Problem: Elements above the average
id: topic-arrays-above-average
difficulty: easy
source: Original (topic test)
marks: 6

Read an integer **N**, then **N** integers. Print their average with 2 decimal places, and how many of the numbers are strictly greater than the average.

**Input:** first line N (1 ≤ N ≤ 100), then N integers (each between -1000 and 1000).
**Output:** two lines:
`Average = A`
`Above average = C`

```c starter
#include <stdio.h>

int main(void) {
    int n, i, count = 0, sum = 0;
    int a[100];
    double avg;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);
    // your code here: find the sum and the average, then count
    printf("Average = %.2f\n", avg);
    printf("Above average = %d\n", count);
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, i, count = 0, sum = 0;
    int a[100];
    double avg;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);
    for (i = 0; i < n; i++)
        sum += a[i];
    avg = (double)sum / n;
    for (i = 0; i < n; i++) {
        if (a[i] > avg)
            count++;
    }
    printf("Average = %.2f\n", avg);
    printf("Above average = %d\n", count);
    return 0;
}
```

```test
=== input
5
2 4 6 8 10
=== output
Average = 6.00
Above average = 2
```

```test
=== input
4
5 5 5 5
=== output
Average = 5.00
Above average = 0
```

```test
=== input
3
-4 0 1
=== output
Average = -1.00
Above average = 2
```

```test
=== input
1
7
=== output
Average = 7.00
Above average = 0
```

```hint
You need two passes: one pass to find the sum (so you know the average) and a second pass to count the elements above it.
```

```hint
Use `(double)sum / n` so the average is not truncated, and compare `a[i] > avg`.
```

# Problem: Longest increasing run
id: topic-arrays-longest-run
difficulty: medium
source: Original (topic test)
marks: 8

A **run** is a block of consecutive elements where every element is strictly greater than the one before it. Read an integer **N** and **N** integers, then find the longest run. If two runs have the same length, report the one that starts first. A single element counts as a run of length 1.

For `1 2 2 3 4 5 1` the runs are `1 2`, `2 3 4 5` and `1`, so the longest run has length 4 and starts at index 2 (indexes count from 0).

**Input:** first line N (1 ≤ N ≤ 100), then N integers.
**Output:** two lines:
`Longest run = L`
`Starts at index = S`

```c starter
#include <stdio.h>

int main(void) {
    int n, i;
    int a[100];
    int best = 1, bestStart = 0, len = 1, start = 0;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);
    // your code here: scan from index 1 and track the current run
    printf("Longest run = %d\n", best);
    printf("Starts at index = %d\n", bestStart);
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, i;
    int a[100];
    int best = 1, bestStart = 0, len = 1, start = 0;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);
    for (i = 1; i < n; i++) {
        if (a[i] > a[i - 1]) {
            len++;
        } else {
            len = 1;
            start = i;
        }
        if (len > best) {
            best = len;
            bestStart = start;
        }
    }
    printf("Longest run = %d\n", best);
    printf("Starts at index = %d\n", bestStart);
    return 0;
}
```

```test
=== input
7
1 2 2 3 4 5 1
=== output
Longest run = 4
Starts at index = 2
```

```test
=== input
1
9
=== output
Longest run = 1
Starts at index = 0
```

```test
=== input
3
3 3 3
=== output
Longest run = 1
Starts at index = 0
```

```test
=== input
6
5 1 2 1 2 3
=== output
Longest run = 3
Starts at index = 3
```

```hint
Walk through the array from index 1 and compare each element with the previous one `a[i - 1]`. Keep the length of the current run in a variable.
```

```hint
If `a[i] > a[i - 1]` the run grows; otherwise a new run starts at index i with length 1. After each step, update `best` and `bestStart` only when the current run is strictly longer.
```
