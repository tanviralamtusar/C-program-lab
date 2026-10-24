---
id: arrays
title: "Arrays (1D)"
order: 6
summary: Store many values under one name; read, print, search and sort them with loops.
---

# Step: Why arrays? Declaring and indexing

Suppose you must store the marks of 5 students. With plain variables you would write `m1, m2, m3, m4, m5`, and for 500 students that becomes impossible. An **array** is a row of boxes of the **same type**, stored side by side in memory, all under **one name**.

```c
int marks[5];   // 5 boxes, each holds one int
```

The number in the brackets is the **size** (how many boxes). Each box has an **index**, its position number, and **indexing starts from 0**:

| Index | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Box | `marks[0]` | `marks[1]` | `marks[2]` | `marks[3]` | `marks[4]` |

So an array of size `n` has valid indexes `0` to `n - 1`. The first box is `marks[0]` and the last box is `marks[4]` (not `marks[5]`).

```c run
#include <stdio.h>

int main(void) {
    int marks[5];
    marks[0] = 70;
    marks[1] = 85;
    marks[2] = 90;
    marks[3] = 60;
    marks[4] = 75;
    printf("First: %d\n", marks[0]);
    printf("Last: %d\n", marks[4]);
    marks[2] = 95;
    printf("Third now: %d\n", marks[2]);
    return 0;
}
```
```output
First: 70
Last: 75
Third now: 95
```

Open it in the visualizer: the array is drawn as 5 boxes, and you can watch each assignment fill one box. An index can be any integer expression, such as `marks[i + 1]`, which is what makes loops over arrays possible.

> **Warning:** C does **not** stop you from using a bad index in a real compiler. `marks[5]` or `marks[-1]` is **out of bounds** and is undefined behaviour. Our interpreter reports it as a runtime error so you can find the bug.

### Common mistakes

- Thinking `marks[5]` is the last element of a size-5 array. The last is `marks[4]`.
- Using a variable as the size without a value (`int a[n];` before `n` is read).
- Writing `marks = 70;` to fill the whole array. You must assign element by element.

```quiz
For `int a[8];` which index is the LAST valid element?
- [ ] a[8]
- [x] a[7]
- [ ] a[9]
- [ ] a[1]
> Indexes run from 0 to size - 1, so 0 to 7.
```

# Step: Initializing arrays

You can fill an array when you declare it, with values in braces:

```c
int a[5] = {10, 20, 30, 40, 50};
```

Useful rules:

- If you give **fewer** values than the size, the rest become **0**: `int b[5] = {1, 2};` is `1 2 0 0 0`.
- `int d[4] = {0};` sets **every** box to 0.
- You may leave the size out and let the compiler count: `int c[] = {7, 8, 9};` has size 3.
- Giving **more** values than the size is an error.
- An array with **no** initializer (`int x[5];` inside `main`) holds **garbage** until you assign it. Never read it before writing.

```c run
#include <stdio.h>

int main(void) {
    int a[5] = {10, 20, 30, 40, 50};
    int b[5] = {1, 2};
    int c[] = {7, 8, 9};
    int d[4] = {0};

    printf("%d %d\n", a[0], a[4]);
    printf("%d %d %d\n", b[0], b[1], b[2]);
    printf("%d\n", (int)(sizeof(c) / sizeof(c[0])));
    for (int i = 0; i < 4; i++) {
        if (i > 0) printf(" ");
        printf("%d", d[i]);
    }
    printf("\n");
    return 0;
}
```
```output
10 50
1 2 0
3
0 0 0 0
```

### Common mistakes

- Reading an uninitialized array and expecting zeros.
- Writing `int a[3] = {1, 2, 3, 4};` (too many values).

```quiz
What is b[3] after this declaration?
~~~
int b[5] = {4, 8};
~~~
- [ ] 8
- [ ] garbage
- [x] 0
- [ ] 4
> Values not listed in the braces are set to 0, so b is 4 8 0 0 0.
```

# Step: Reading and printing arrays with loops

An array and a `for` loop are a perfect pair: the loop counter `i` is the **index**. To read `n` numbers:

```c
for (int i = 0; i < n; i++) {
    scanf("%d", &a[i]);
}
```

Note the `&` before `a[i]`: `scanf` needs the **address of the box** to fill. The loop condition is `i < n`, never `i <= n` (that would touch box `n`, which is one past the end).

Choose an array size big enough for the worst case, for example `int a[100];`, and read how many you really use into `n`. You then use only `a[0]` to `a[n-1]`.

```c run
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    printf("Elements:");
    for (int i = 0; i < n; i++) {
        printf(" %d", a[i]);
    }
    printf("\n");
    return 0;
}
```
```input
5
10 20 30 40 50
```
```output
Elements: 10 20 30 40 50
```

To print with the index (useful for debugging) show both `i` and `a[i]`:

```c run
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    for (int i = 0; i < n; i++) {
        printf("a[%d] = %d\n", i, a[i]);
    }
    return 0;
}
```
```input
3
4 5 6
```
```output
a[0] = 4
a[1] = 5
a[2] = 6
```

### Common mistakes

- Forgetting `&` in `scanf("%d", &a[i]);`.
- Using `i <= n`, which accesses `a[n]` (out of bounds when n is the size).
- Using `n` before it has been read, or declaring `a[n]` with an unknown `n`.

```quiz
Which loop reads exactly n numbers into a?
- [ ] `for (i = 1; i <= n; i++) scanf("%d", &a[i]);`
- [ ] `for (i = 0; i <= n; i++) scanf("%d", &a[i]);`
- [x] `for (i = 0; i < n; i++) scanf("%d", &a[i]);`
- [ ] `for (i = 0; i < n; i++) scanf("%d", a[i]);`
> Indexes 0..n-1 need `i < n`, and scanf needs `&a[i]`. The first option skips a[0] and goes up to a[n], which can be out of bounds.
```

# Step: Memory layout and sizeof

The boxes of an array sit **next to each other** in memory, with no gaps. If an `int` takes 4 bytes, then `int a[5]` takes 5 x 4 = 20 bytes, and box `i` starts `i * 4` bytes after box 0:

| Index | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Byte offset | 0 | 4 | 8 | 12 | 16 |

This is why indexing is so fast: the computer finds `a[i]` with one multiplication and one addition, and why we start counting at 0 (the first box is at offset 0).

`sizeof(a)` gives the size of the whole array in bytes, and `sizeof(a[0])` the size of one element. So the number of elements is:

```c
int count = sizeof(a) / sizeof(a[0]);
```

```c run
#include <stdio.h>

int main(void) {
    int a[5];
    double d[3];
    char c[10];
    printf("%d %d %d\n", (int)sizeof(a), (int)sizeof(d), (int)sizeof(c));
    printf("%d\n", (int)(sizeof(a) / sizeof(a[0])));
    return 0;
}
```
```output
20 24 10
5
```

> **Note:** Sizes depend on the type: `int` is 4 bytes, `double` is 8, `char` is 1. We cast to `int` so `%d` is correct.

### Common mistakes

- Using `sizeof(a)` as the *number of elements*. It is the number of **bytes**.
- Expecting arrays to be copied with `b = a;`. You must copy element by element with a loop.

```quiz
What does this print?
~~~
double d[4];
printf("%d", (int)sizeof(d));
~~~
- [ ] 4
- [ ] 8
- [x] 32
- [ ] 16
> A double is 8 bytes and there are 4 of them: 4 x 8 = 32.
```

# Step: Sum, average, maximum and minimum

Most array tasks follow one pattern: **walk through every element and update a running value**.

- **Sum**: start `sum = 0`, then `sum += a[i]`.
- **Average**: `sum / n`. Both are `int`, so convert first: `(double)sum / n`.
- **Maximum**: start with `max = a[0]` (an element that really exists!), then if `a[i] > max`, set `max = a[i]`. For the minimum use `<`.

```c run
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int sum = 0, max = a[0], min = a[0];
    for (int i = 0; i < n; i++) {
        sum += a[i];
        if (a[i] > max) max = a[i];
        if (a[i] < min) min = a[i];
    }
    printf("Sum = %d\n", sum);
    printf("Average = %.2f\n", (double)sum / n);
    printf("Max = %d\n", max);
    printf("Min = %d\n", min);
    return 0;
}
```
```input
5
4 9 -2 7 5
```
```output
Sum = 23
Average = 4.60
Max = 9
Min = -2
```

> **Tip:** Starting `max` and `min` from `a[0]` works even when every number is negative. Starting `max = 0` would be wrong for an array like `-5 -2 -9`.

### Common mistakes

- `sum / n` with two ints throws away the decimal part. Use `(double)sum / n`.
- Initializing `max = 0` (or `min = 0`), which breaks for all-negative (or all-positive) data.
- Forgetting to set `sum = 0` before the loop.

```quiz
The array is {-5, -2, -9} and the code starts with `int max = 0;`. What does the usual max-loop print?
- [ ] -2
- [x] 0
- [ ] -5
- [ ] -9
> No element is bigger than 0, so max stays 0, which is not even in the array. Start from a[0] instead.
```

# Step: Counting and reversing

**Counting** is like summing, but you add 1 only when a condition is true. Keep one counter per category:

```c
if (a[i] > 0) pos++;
else if (a[i] < 0) neg++;
else zero++;
```

Use a separate `if` for even and odd. Test odd with `a[i] % 2 != 0` and not `== 1`, because in C `-3 % 2` is `-1`.

```c run
#include <stdio.h>

int main(void) {
    int n, a[100];
    int pos = 0, neg = 0, zero = 0, even = 0, odd = 0;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    for (int i = 0; i < n; i++) {
        if (a[i] > 0) pos++;
        else if (a[i] < 0) neg++;
        else zero++;
        if (a[i] % 2 == 0) even++;
        else odd++;
    }
    printf("Positive: %d\n", pos);
    printf("Negative: %d\n", neg);
    printf("Zero: %d\n", zero);
    printf("Even: %d\n", even);
    printf("Odd: %d\n", odd);
    return 0;
}
```
```input
7
5 -3 0 8 -1 0 4
```
```output
Positive: 3
Negative: 2
Zero: 2
Even: 4
Odd: 3
```

**Reversing in place**: swap the first box with the last, the second with the second-last, and so on, only until you reach the middle. The partner of index `i` is `n - 1 - i`. Swapping needs a temporary variable. If you loop to `n` instead of `n / 2` you swap every pair twice and end up with the original array!

```c run
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    for (int i = 0; i < n / 2; i++) {
        int tmp = a[i];
        a[i] = a[n - 1 - i];
        a[n - 1 - i] = tmp;
    }
    for (int i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
    return 0;
}
```
```input
5
1 2 3 4 5
```
```output
5 4 3 2 1
```

With 5 elements `n / 2` is 2, so the swaps are (0,4) and (1,3); the middle element `a[2]` stays where it is.

### Common mistakes

- Looping the reverse up to `n` instead of `n / 2`.
- Swapping without a temporary: `a[i] = a[j]; a[j] = a[i];` loses a value.
- Treating zero as positive or negative. Zero needs its own branch.

```quiz
How many swaps does the in-place reversal make for n = 6?
- [ ] 6
- [ ] 2
- [x] 3
- [ ] 5
> n / 2 = 3 swaps: (0,5), (1,4) and (2,3).
```

# Step: Searching (linear and binary)

**Linear search** checks the boxes one by one from the start until it finds the key. It works on any array. Use a flag (or remember the index) and `break` when found.

```c run
#include <stdio.h>

int main(void) {
    int n, a[100], key;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    scanf("%d", &key);
    int found = -1;
    for (int i = 0; i < n; i++) {
        if (a[i] == key) {
            found = i;
            break;
        }
    }
    if (found >= 0) printf("Found at index %d\n", found);
    else printf("Not found\n");
    return 0;
}
```
```input
6
4 8 15 16 23 42
16
```
```output
Found at index 3
```

**Binary search** is much faster but needs a **sorted** array. Keep a range `low..high`. Look at the middle box:

- equal to key: done,
- middle smaller than key: the key can only be on the right, so `low = mid + 1`,
- middle larger: the key can only be on the left, so `high = mid - 1`.

Every step halves the range, so 1000 elements need only about 10 steps.

```c run
#include <stdio.h>

int main(void) {
    int n, a[100], key;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    scanf("%d", &key);
    int low = 0, high = n - 1, found = -1;
    while (low <= high) {
        int mid = (low + high) / 2;
        printf("mid=%d value=%d\n", mid, a[mid]);
        if (a[mid] == key) {
            found = mid;
            break;
        } else if (a[mid] < key) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    if (found >= 0) printf("Found at index %d\n", found);
    else printf("Not found\n");
    return 0;
}
```
```input
6
4 8 15 16 23 42
23
```
```output
mid=2 value=15
mid=4 value=23
Found at index 4
```

Trace: the range is 0..5, `mid = 2` holds 15, which is less than 23, so `low = 3`. Now 3..5, `mid = 4` holds 23, found.

### Common mistakes

- Running binary search on an unsorted array. The answer is meaningless.
- Writing `low = mid` or `high = mid` (without +1 / -1), which can loop forever.
- Using `while (low < high)` and missing the last remaining element.

```quiz
Binary search for 8 in {2, 4, 6, 8, 10, 12, 14}. What is the first mid index checked?
- [ ] 2
- [x] 3
- [ ] 4
- [ ] 0
> low = 0, high = 6, so mid = (0 + 6) / 2 = 3, and a[3] is 8. Found on the first try.
```

# Step: Sorting (bubble and selection)

**Bubble sort** repeatedly compares **neighbouring** pairs and swaps them if they are in the wrong order. After pass 1 the biggest value has "bubbled" to the last box, after pass 2 the second biggest sits in the second-last box, and so on. Each pass can stop one box earlier.

```c run
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    for (int pass = 1; pass < n; pass++) {
        for (int j = 0; j < n - pass; j++) {
            if (a[j] > a[j + 1]) {
                int tmp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = tmp;
            }
        }
        printf("Pass %d:", pass);
        for (int i = 0; i < n; i++) printf(" %d", a[i]);
        printf("\n");
    }
    return 0;
}
```
```input
5
5 1 4 2 8
```
```output
Pass 1: 1 4 2 5 8
Pass 2: 1 2 4 5 8
Pass 3: 1 2 4 5 8
Pass 4: 1 2 4 5 8
```

**Selection sort** works differently: in pass `i` find the **smallest** value in `a[i..n-1]` and swap it into position `i`. Positions `0..i` are then final. It makes at most one swap per pass.

```c run
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (a[j] < a[minIdx]) minIdx = j;
        }
        int tmp = a[i];
        a[i] = a[minIdx];
        a[minIdx] = tmp;
        printf("Pass %d:", i + 1);
        for (int k = 0; k < n; k++) printf(" %d", a[k]);
        printf("\n");
    }
    return 0;
}
```
```input
5
64 25 12 22 11
```
```output
Pass 1: 11 25 12 22 64
Pass 2: 11 12 25 22 64
Pass 3: 11 12 22 25 64
Pass 4: 11 12 22 25 64
```

> **Tip:** To sort in **descending** order, flip the comparison (`<` instead of `>` in bubble sort, or search for the largest in selection sort).

### Common mistakes

- Comparing `a[j]` with `a[j + 1]` while `j` goes up to `n - 1`: `a[n]` is out of bounds. The inner loop must stop at `n - 1 - pass` (or `j + 1 < n`).
- Swapping with `a[j] = a[j + 1]; a[j + 1] = a[j];`. Use a temporary variable.
- In selection sort, swapping inside the inner loop instead of after it.

```quiz
After ONE pass of bubble sort on {3, 2, 1}, what is the array?
- [ ] 1 2 3
- [x] 2 1 3
- [ ] 3 2 1
- [ ] 2 3 1
> Pass 1 compares (3,2) and swaps: 2 3 1; then compares (3,1) and swaps: 2 1 3. Only the largest value (3) is guaranteed to be in place after one pass.
```

# Problem: Read and Print an Array
id: arrays-read-print
difficulty: easy
source: CSE103 Task Sheet - Arrays #1

Read n and then n integers into an array, and print the elements on one line separated by single spaces.

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers.
**Output:** the n integers in the same order, separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    for (int i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
    return 0;
}
```

```test
=== input
5
10 20 30 40 50
=== output
10 20 30 40 50
```

```test
=== input
1
-7
=== output
-7
```

```test
=== input
4
3 -2 0 99
=== output
3 -2 0 99
```

```hint
Read with a loop `for (i = 0; i < n; i++) scanf("%d", &a[i]);`.
```

```hint
Print with a second loop. Print a space before every element except the first.
```

# Problem: Maximum and Minimum
id: arrays-max-min
difficulty: easy
source: CSE103 Task Sheet - Arrays #2; Aptech Arrays (Lab) #1; Lab Manual Lab 6

Read n integers and print the largest and the smallest value.

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers.
**Output:** two lines: `Max = X` and `Min = Y`.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int max = a[0], min = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > max) max = a[i];
        if (a[i] < min) min = a[i];
    }
    printf("Max = %d\n", max);
    printf("Min = %d\n", min);
    return 0;
}
```

```test
=== input
5
3 9 2 7 5
=== output
Max = 9
Min = 2
```

```test
=== input
1
42
=== output
Max = 42
Min = 42
```

```test
=== input
4
-5 -1 -9 -3
=== output
Max = -1
Min = -9
```

```test
=== input
3
4 4 4
=== output
Max = 4
Min = 4
```

```hint
Start both `max` and `min` from `a[0]`, not from 0.
```

```hint
Loop from index 1 and update when you find a bigger (or smaller) value.
```

# Problem: Sum and Average
id: arrays-sum-average
difficulty: easy
source: CSE103 Task Sheet - Arrays #3; Class Notes Ex 5.2; Lab Manual Lab 6

Read n integers and print their sum and their average with 2 digits after the decimal point.

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers.
**Output:** `Sum = S` on the first line and `Average = A` on the second line (A printed with `%.2f`).

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += a[i];
    }
    printf("Sum = %d\n", sum);
    printf("Average = %.2f\n", (double)sum / n);
    return 0;
}
```

```test
=== input
5
10 20 30 40 50
=== output
Sum = 150
Average = 30.00
```

```test
=== input
1
-3
=== output
Sum = -3
Average = -3.00
```

```test
=== input
4
1 2 3 4
=== output
Sum = 10
Average = 2.50
```

```test
=== input
3
1 2 2
=== output
Sum = 5
Average = 1.67
```

```hint
Keep a running `sum`, starting from 0.
```

```hint
Convert before dividing: `(double)sum / n`, otherwise integer division drops the decimals.
```

# Problem: Reverse an Array
id: arrays-reverse
difficulty: easy
source: CSE103 Task Sheet - Arrays #4; Aptech Arrays #3; Class Notes Ex 5.3

Read n integers and print them in reverse order.

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers.
**Output:** the n integers in reverse order, separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    for (int i = 0; i < n / 2; i++) {
        int tmp = a[i];
        a[i] = a[n - 1 - i];
        a[n - 1 - i] = tmp;
    }
    for (int i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
    return 0;
}
```

```test
=== input
5
34 45 56 67 89
=== output
89 67 56 45 34
```

```test
=== input
1
8
=== output
8
```

```test
=== input
4
-1 0 -5 6
=== output
6 -5 0 -1
```

```test
=== input
6
1 2 3 4 5 6
=== output
6 5 4 3 2 1
```

```hint
Swap `a[i]` with `a[n - 1 - i]`, only for `i < n / 2`.
```

```hint
You can also just print the array from the last index down to 0.
```

# Problem: Count Positive, Negative, Zero, Even and Odd
id: arrays-count-types
difficulty: easy
source: CSE103 Task Sheet - Arrays #5

Read n integers and count how many are positive, negative, zero, even and odd. Zero counts as even.

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers.
**Output:** five lines in this order: `Positive: p`, `Negative: q`, `Zero: z`, `Even: e`, `Odd: o`.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int pos = 0, neg = 0, zero = 0, even = 0, odd = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] > 0) pos++;
        else if (a[i] < 0) neg++;
        else zero++;
        if (a[i] % 2 == 0) even++;
        else odd++;
    }
    printf("Positive: %d\n", pos);
    printf("Negative: %d\n", neg);
    printf("Zero: %d\n", zero);
    printf("Even: %d\n", even);
    printf("Odd: %d\n", odd);
    return 0;
}
```

```test
=== input
7
5 -3 0 8 -1 0 4
=== output
Positive: 3
Negative: 2
Zero: 2
Even: 4
Odd: 3
```

```test
=== input
1
0
=== output
Positive: 0
Negative: 0
Zero: 1
Even: 1
Odd: 0
```

```test
=== input
4
-2 -4 -6 -7
=== output
Positive: 0
Negative: 4
Zero: 0
Even: 3
Odd: 1
```

```hint
Use one counter per category and increase the right one inside the loop.
```

```hint
Odd test: a negative odd number such as -3 gives `-3 % 2 == -1`, so use `% 2 == 0` for even and `else` for odd.
```

# Problem: Linear Search
id: arrays-linear-search
difficulty: easy
source: CSE103 Task Sheet - Arrays #6 (linear search); Class Notes Ex 5.4

Read n integers and then a key. Search the array from the beginning and report the **position** (counting from 1) of the **first** element equal to the key.

**Input:** line 1: n (1 ≤ n ≤ 100); line 2: n integers; line 3: the key.
**Output:** `Found at position P` or `Not found`.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100], key;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    scanf("%d", &key);
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100], key;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    scanf("%d", &key);
    int pos = -1;
    for (int i = 0; i < n; i++) {
        if (a[i] == key) {
            pos = i + 1;
            break;
        }
    }
    if (pos > 0) printf("Found at position %d\n", pos);
    else printf("Not found\n");
    return 0;
}
```

```test
=== input
6
4 8 15 16 23 42
16
=== output
Found at position 4
```

```test
=== input
6
4 8 15 16 23 42
99
=== output
Not found
```

```test
=== input
3
5 3 5
5
=== output
Found at position 1
```

```test
=== input
1
7
7
=== output
Found at position 1
```

```hint
Compare every `a[i]` with `key`. Stop at the first match with `break`.
```

```hint
Position = index + 1, because indexes start from 0.
```

# Problem: Binary Search
id: arrays-binary-search
difficulty: medium
source: CSE103 Task Sheet - Arrays #6 (binary search)

Read n integers that are already sorted in **ascending** order (all different), then a key. Use **binary search** and report the **index** (counting from 0) of the key.

**Input:** line 1: n (1 ≤ n ≤ 100); line 2: n sorted integers; line 3: the key.
**Output:** `Found at index I` or `Not found`.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100], key;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    scanf("%d", &key);
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100], key;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    scanf("%d", &key);
    int low = 0, high = n - 1, pos = -1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (a[mid] == key) {
            pos = mid;
            break;
        } else if (a[mid] < key) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    if (pos >= 0) printf("Found at index %d\n", pos);
    else printf("Not found\n");
    return 0;
}
```

```test
=== input
6
4 8 15 16 23 42
23
=== output
Found at index 4
```

```test
=== input
6
4 8 15 16 23 42
4
=== output
Found at index 0
```

```test
=== input
6
4 8 15 16 23 42
42
=== output
Found at index 5
```

```test
=== input
6
4 8 15 16 23 42
10
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

```hint
Keep `low` and `high`. Look at `mid = (low + high) / 2`.
```

```hint
If `a[mid] < key` move `low = mid + 1`; if it is bigger move `high = mid - 1`; stop when `low > high`.
```

# Problem: Bubble Sort
id: arrays-bubble-sort
difficulty: medium
source: CSE103 Task Sheet - Arrays #7 (bubble sort); Lecture 5 sorting problem

Read n integers and print them in **ascending** order, using bubble sort.

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers.
**Output:** the sorted integers separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    for (int pass = 1; pass < n; pass++) {
        for (int k = 0; k < n - pass; k++) {
            if (a[k] > a[k + 1]) {
                int tmp = a[k];
                a[k] = a[k + 1];
                a[k + 1] = tmp;
            }
        }
    }
    for (int i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
    return 0;
}
```

```test
=== input
5
5 1 4 2 8
=== output
1 2 4 5 8
```

```test
=== input
1
9
=== output
9
```

```test
=== input
5
3 -1 3 0 -5
=== output
-5 -1 0 3 3
```

```test
=== input
8
25 14 78 5 90 67 32 85
=== output
5 14 25 32 67 78 85 90
```

```hint
Compare neighbours `a[k]` and `a[k+1]` and swap them if they are in the wrong order.
```

```hint
Repeat for n - 1 passes; the inner loop can stop at `n - 1 - pass` because the end is already sorted.
```

# Problem: Selection Sort (Descending)
id: arrays-selection-sort
difficulty: medium
source: CSE103 Task Sheet - Arrays #7 (selection sort)

Read n integers and print them in **descending** (largest first) order, using selection sort: in each pass pick the largest remaining value and swap it into place.

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers.
**Output:** the sorted integers separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    for (int i = 0; i < n - 1; i++) {
        int maxIdx = i;
        for (int k = i + 1; k < n; k++) {
            if (a[k] > a[maxIdx]) maxIdx = k;
        }
        int tmp = a[i];
        a[i] = a[maxIdx];
        a[maxIdx] = tmp;
    }
    for (int i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
    return 0;
}
```

```test
=== input
5
64 25 12 22 11
=== output
64 25 22 12 11
```

```test
=== input
1
6
=== output
6
```

```test
=== input
4
2 7 7 1
=== output
7 7 2 1
```

```test
=== input
4
-3 -8 0 -1
=== output
0 -1 -3 -8
```

```hint
In pass i look for the position of the largest value in `a[i..n-1]`.
```

```hint
After the inner loop, swap `a[i]` with `a[maxIdx]`.
```

# Problem: Second Largest Value
id: arrays-second-largest
difficulty: medium
source: Class Notes - Arrays (second maximum)

Read n integers and print the **second largest distinct** value (the largest value that is smaller than the maximum). The input always contains at least two different values.

**Input:** line 1: n (2 ≤ n ≤ 100); line 2: n integers.
**Output:** one integer.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int max = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > max) max = a[i];
    }
    int second = 0, have = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] < max && (!have || a[i] > second)) {
            second = a[i];
            have = 1;
        }
    }
    printf("%d\n", second);
    return 0;
}
```

```test
=== input
6
12 35 1 10 34 1
=== output
34
```

```test
=== input
4
5 5 5 3
=== output
3
```

```test
=== input
2
-1 -5
=== output
-5
```

```test
=== input
5
9 9 8 8 9
=== output
8
```

```hint
First find the maximum.
```

```hint
Then scan again for the largest value that is strictly smaller than the maximum. A flag tells you whether you have found one yet (do not start from 0, values can be negative).
```

# Problem: Remove Duplicate Elements
id: arrays-remove-duplicates
difficulty: medium
source: Class Notes Ex 5.5

Read n integers and print the array after removing duplicates, keeping only the **first** occurrence of each value (the order of the remaining elements is unchanged).

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers.
**Output:** the remaining integers separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int b[100], m = 0;
    for (int i = 0; i < n; i++) {
        int seen = 0;
        for (int k = 0; k < m; k++) {
            if (b[k] == a[i]) {
                seen = 1;
                break;
            }
        }
        if (!seen) {
            b[m] = a[i];
            m++;
        }
    }
    for (int i = 0; i < m; i++) {
        if (i > 0) printf(" ");
        printf("%d", b[i]);
    }
    printf("\n");
    return 0;
}
```

```test
=== input
8
5 3 5 9 3 1 9 7
=== output
5 3 9 1 7
```

```test
=== input
1
4
=== output
4
```

```test
=== input
3
2 2 2
=== output
2
```

```test
=== input
4
-1 1 -1 1
=== output
-1 1
```

```hint
Build a second array `b` that holds the unique values found so far (`m` of them).
```

```hint
For every `a[i]`, search `b[0..m-1]`; append it only if it is not there.
```

# Problem: Merge Two Sorted Arrays
id: arrays-merge-sorted
difficulty: hard
source: Class Notes Ex 5.6

Two arrays are each sorted in ascending order. Merge them into one sorted array **without sorting** the result: walk through both arrays with two indexes and always take the smaller front element.

**Input:** line 1: n1 (1 ≤ n1 ≤ 50); line 2: n1 integers (ascending); line 3: n2 (1 ≤ n2 ≤ 50); line 4: n2 integers (ascending).
**Output:** the n1 + n2 merged integers in ascending order, separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int n1, n2, a[50], b[50];
    scanf("%d", &n1);
    for (int i = 0; i < n1; i++) scanf("%d", &a[i]);
    scanf("%d", &n2);
    for (int i = 0; i < n2; i++) scanf("%d", &b[i]);
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n1, n2, a[50], b[50], c[100];
    scanf("%d", &n1);
    for (int i = 0; i < n1; i++) scanf("%d", &a[i]);
    scanf("%d", &n2);
    for (int i = 0; i < n2; i++) scanf("%d", &b[i]);
    int i = 0, k = 0, m = 0;
    while (i < n1 && k < n2) {
        if (a[i] <= b[k]) {
            c[m++] = a[i++];
        } else {
            c[m++] = b[k++];
        }
    }
    while (i < n1) c[m++] = a[i++];
    while (k < n2) c[m++] = b[k++];
    for (int t = 0; t < m; t++) {
        if (t > 0) printf(" ");
        printf("%d", c[t]);
    }
    printf("\n");
    return 0;
}
```

```test
=== input
4
1 3 5 7
3
2 4 6
=== output
1 2 3 4 5 6 7
```

```test
=== input
2
1 1
2
1 2
=== output
1 1 1 2
```

```test
=== input
1
5
1
3
=== output
3 5
```

```test
=== input
3
-4 0 9
2
-5 -4
=== output
-5 -4 -4 0 9
```

```hint
Use index `i` for the first array, `k` for the second, and `m` for the merged array.
```

```hint
While both have elements left, copy the smaller one. Afterwards copy whatever remains of the other array.
```

# Problem: Student Result Analysis
id: arrays-student-results
difficulty: medium
source: Class Notes Ex 5.7

Read the marks of n students. A student passes with marks **≥ 40**. Print the number of students who passed and failed, the class average (2 decimal places), and the highest and lowest marks.

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers. (each mark is between 0 and 100)
**Output:** five lines: `Passed: p`, `Failed: f`, `Average = A`, `Highest = H`, `Lowest = L`.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int passed = 0, sum = 0, hi = a[0], lo = a[0];
    for (int i = 0; i < n; i++) {
        if (a[i] >= 40) passed++;
        sum += a[i];
        if (a[i] > hi) hi = a[i];
        if (a[i] < lo) lo = a[i];
    }
    printf("Passed: %d\n", passed);
    printf("Failed: %d\n", n - passed);
    printf("Average = %.2f\n", (double)sum / n);
    printf("Highest = %d\n", hi);
    printf("Lowest = %d\n", lo);
    return 0;
}
```

```test
=== input
6
55 32 78 21 40 65
=== output
Passed: 4
Failed: 2
Average = 48.50
Highest = 78
Lowest = 21
```

```test
=== input
1
39
=== output
Passed: 0
Failed: 1
Average = 39.00
Highest = 39
Lowest = 39
```

```test
=== input
3
100 0 50
=== output
Passed: 2
Failed: 1
Average = 50.00
Highest = 100
Lowest = 0
```

```hint
One loop can update the pass counter, the sum, the highest and the lowest together.
```

```hint
Failed = n - passed.
```

# Problem: Separate Odd and Even Numbers
id: arrays-odd-even-separate
difficulty: medium
source: Lab Manual - Lab 6 Lab Task 4

Read n integers and copy the even numbers into one array and the odd numbers into another, keeping the original order. Then print both arrays. The input contains at least one even and at least one odd number.

**Input:** line 1: n (2 ≤ n ≤ 100); line 2: n integers.
**Output:** two lines: `Even:` followed by the even numbers, and `Odd:` followed by the odd numbers (each number preceded by one space).

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int ev[100], od[100], ne = 0, no = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] % 2 == 0) {
            ev[ne] = a[i];
            ne++;
        } else {
            od[no] = a[i];
            no++;
        }
    }
    printf("Even:");
    for (int i = 0; i < ne; i++) printf(" %d", ev[i]);
    printf("\n");
    printf("Odd:");
    for (int i = 0; i < no; i++) printf(" %d", od[i]);
    printf("\n");
    return 0;
}
```

```test
=== input
7
1 2 3 4 5 6 7
=== output
Even: 2 4 6
Odd: 1 3 5 7
```

```test
=== input
4
-3 8 -2 5
=== output
Even: 8 -2
Odd: -3 5
```

```test
=== input
2
9 4
=== output
Even: 4
Odd: 9
```

```hint
Keep two counters, one for each new array, and increase only the one you used.
```

```hint
A number is even when `x % 2 == 0`.
```

# Problem: Frequency of Each Element
id: arrays-frequency
difficulty: hard
source: Lab Manual - Lab 6 Lab Exercise 3

Read n integers and print how many times each **distinct** value occurs. List the values in the order of their first appearance.

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers.
**Output:** one line per distinct value: `V occurs K times` (always written with the word `times`).

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int counted[100] = {0};
    for (int i = 0; i < n; i++) {
        if (counted[i]) continue;
        int cnt = 1;
        for (int k = i + 1; k < n; k++) {
            if (a[k] == a[i]) {
                cnt++;
                counted[k] = 1;
            }
        }
        printf("%d occurs %d times\n", a[i], cnt);
    }
    return 0;
}
```

```test
=== input
5
2 3 2 2 3
=== output
2 occurs 3 times
3 occurs 2 times
```

```test
=== input
1
8
=== output
8 occurs 1 times
```

```test
=== input
4
1 -1 1 4
=== output
1 occurs 2 times
-1 occurs 1 times
4 occurs 1 times
```

```hint
Use a second array `counted[]` of flags: if `counted[i]` is 1, you already reported that value.
```

```hint
For each new value count its copies in the rest of the array and mark them as counted.
```

# Problem: Palindrome Array
id: arrays-palindrome
difficulty: medium
source: Class Notes - Arrays (reverse and palindrome check)

An array is a **palindrome** if it reads the same from left to right and from right to left. Read n integers and decide.

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers.
**Output:** `Palindrome` or `Not palindrome`.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int ok = 1;
    for (int i = 0; i < n / 2; i++) {
        if (a[i] != a[n - 1 - i]) {
            ok = 0;
            break;
        }
    }
    if (ok) printf("Palindrome\n");
    else printf("Not palindrome\n");
    return 0;
}
```

```test
=== input
5
1 2 3 2 1
=== output
Palindrome
```

```test
=== input
4
1 2 3 4
=== output
Not palindrome
```

```test
=== input
1
5
=== output
Palindrome
```

```test
=== input
2
1 1
=== output
Palindrome
```

```hint
Compare `a[i]` with its mirror partner `a[n - 1 - i]`.
```

```hint
You only need to check the first half of the array. One mismatch is enough to answer `Not palindrome`.
```

# Problem: Sum at Even and Odd Indexes
id: arrays-index-sums
difficulty: easy
source: Class Notes - Arrays (even/odd positions)

Read n integers. Print the sum of the elements at **even indexes** (0, 2, 4, ...) and the sum of the elements at **odd indexes** (1, 3, 5, ...).

**Input:** the first line has n (1 ≤ n ≤ 100), the second line has n integers.
**Output:** two lines: `Sum at even indexes = X` and `Sum at odd indexes = Y`.

```c starter
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, a[100];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    int even = 0, odd = 0;
    for (int i = 0; i < n; i++) {
        if (i % 2 == 0) even += a[i];
        else odd += a[i];
    }
    printf("Sum at even indexes = %d\n", even);
    printf("Sum at odd indexes = %d\n", odd);
    return 0;
}
```

```test
=== input
5
1 2 3 4 5
=== output
Sum at even indexes = 9
Sum at odd indexes = 6
```

```test
=== input
1
8
=== output
Sum at even indexes = 8
Sum at odd indexes = 0
```

```test
=== input
4
-1 5 -2 6
=== output
Sum at even indexes = -3
Sum at odd indexes = 11
```

```hint
Test the **index** `i`, not the value `a[i]`.
```

```hint
Remember that indexes start at 0, so the first element is at an even index.
```
