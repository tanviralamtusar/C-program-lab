---
id: final
title: Final Exam (Mock)
order: 5
duration: 120
covers: Everything, with focus on functions, recursion, pointers, structures, dynamic memory, file handling and strings
summary: A full-length mock final with 12 trace-and-debug questions and 5 coding problems on functions, recursion, pointers, structs, dynamic memory, files and strings.
---

# Question: Value versus pointer
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

void f(int a, int *b) {
    a += 10;
    *b += 10;
}

int main(void) {
    int x = 1, y = 2;
    f(x, &y);
    printf("%d %d", x, y);
    return 0;
}
~~~
- [ ] 11 12
- [x] 1 12
- [ ] 1 2
- [ ] 11 2
> `a` is a copy of `x`, so `x` stays 1. `b` holds the address of `y`, so `*b += 10` changes `y` to 12.
```

# Question: Print before and after the call
marks: 3

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

void show(int n) {
    if (n == 0)
        return;
    printf("%d ", n);
    show(n - 1);
    printf("%d ", n);
}

int main(void) {
    show(3);
    return 0;
}
~~~
- [ ] 3 2 1
- [ ] 1 2 3
- [x] 3 2 1 1 2 3
- [ ] 3 2 1 0 1 2 3
> The first printf runs on the way down (3 2 1). When show(0) returns, each pending call runs its second printf on the way back up (1 2 3).
```

# Question: Static versus ordinary local
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

int counter(void) {
    static int c = 0;
    c += 2;
    return c;
}

int plain(void) {
    int c = 0;
    c += 2;
    return c;
}

int main(void) {
    int i;
    for (i = 0; i < 3; i++) {
        printf("%d ", counter());
        printf("%d ", plain());
    }
    return 0;
}
~~~
- [ ] 2 2 2 2 2 2
- [ ] 2 4 6 2 4 6
- [x] 2 2 4 2 6 2
- [ ] 2 2 2 4 2 6
> A static local keeps its value between calls (2, 4, 6). An ordinary local is created afresh every call, so plain() always returns 2.
```

# Question: Pointer arithmetic on an array
marks: 3

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

int main(void) {
    int a[] = {10, 20, 30, 40, 50};
    int *p = a + 1;
    printf("%d ", *p);
    p += 2;
    printf("%d ", *p);
    printf("%d ", *(p - 1));
    printf("%d ", p[1]);
    printf("%d", (int)(p - a));
    return 0;
}
~~~
- [ ] 10 30 20 40 2
- [ ] 20 30 20 40 2
- [x] 20 40 30 50 3
- [ ] 20 40 30 50 2
> p starts at a[1] (20). After p += 2 it points to a[3] (40); p-1 is a[2] (30), p[1] is a[4] (50), and p - a is the index 3.
```

# Question: Struct copy versus pointer
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

struct P {
    int x, y;
};

int main(void) {
    struct P a = {1, 2};
    struct P b = a;
    struct P *c = &a;
    b.x = 10;
    c->y = 20;
    printf("%d %d %d %d", a.x, a.y, b.x, b.y);
    return 0;
}
~~~
- [ ] 10 20 10 20
- [ ] 1 2 10 20
- [x] 1 20 10 2
- [ ] 10 2 10 2
> `b = a` copies the whole struct, so changing b.x does not touch a. `c` points to a, so `c->y = 20` changes a.y.
```

# Question: String functions
marks: 3

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <string.h>

int main(void) {
    char s[20] = "hello";
    char t[20] = "world";
    strcat(s, t);
    printf("%d %s\n", (int)strlen(s), s);
    s[3] = '\0';
    printf("%s %d %s\n", s, (int)strlen(s), strchr(t, 'r'));
    return 0;
}
~~~
- [ ] 10 helloworld hello 5 rld
- [x] 10 helloworld hel 3 rld
- [ ] 10 helloworld hel 3 r
- [ ] 5 helloworld hel 3 rld
> strcat gives "helloworld" (length 10). Writing '\0' at index 3 cuts s to "hel" (length 3). strchr returns a pointer to the first 'r' in t, so printing it shows the rest of the string: "rld".
```

# Question: Recursive return values
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

int f(int n) {
    if (n <= 1)
        return 1;
    return n * f(n - 2);
}

int main(void) {
    printf("%d %d", f(6), f(5));
    return 0;
}
~~~
- [ ] 720 120
- [ ] 12 15
- [x] 48 15
- [ ] 48 5
> f(6) = 6 * f(4) = 6 * 4 * f(2) = 6 * 4 * 2 * f(0) = 48. f(5) = 5 * f(3) = 5 * 3 * f(1) = 15.
```

# Question: Passing the middle of an array
marks: 3

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

void rotate(int *p, int n) {
    int first = *p;
    int i;
    for (i = 0; i < n - 1; i++)
        p[i] = p[i + 1];
    p[n - 1] = first;
}

int main(void) {
    int a[4] = {1, 2, 3, 4};
    int i;
    rotate(a, 4);
    for (i = 0; i < 4; i++)
        printf("%d ", a[i]);
    rotate(a + 1, 3);
    for (i = 0; i < 4; i++)
        printf("%d ", a[i]);
    return 0;
}
~~~
- [ ] 2 3 4 1 3 4 1 2
- [x] 2 3 4 1 2 4 1 3
- [ ] 2 3 4 1 2 3 4 1
- [ ] 1 2 3 4 1 3 4 2
> The first call rotates the whole array left: 2 3 4 1. The second call receives &a[1] and rotates only the last three elements (3 4 1 becomes 4 1 3), so a is 2 4 1 3.
```

# Question: Heap array
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = (int *)malloc(4 * sizeof(int));
    int *q;
    int i, sum = 0;
    if (p == NULL)
        return 1;
    for (i = 0; i < 4; i++)
        p[i] = i * i;
    q = p + 2;
    *q = *q + p[3];
    for (i = 0; i < 4; i++)
        sum += p[i];
    printf("%d %d", p[2], sum);
    free(p);
    return 0;
}
~~~
- [ ] 4 14
- [ ] 13 14
- [x] 13 23
- [ ] 9 23
> p holds 0 1 4 9. q points to p[2], so *q = 4 + 9 = 13 changes p[2]. The sum is 0 + 1 + 13 + 9 = 23.
```

# Question: Find the error: the vanishing array
marks: 3

```quiz
What is the error in this function?
~~~
int *makeArray(void) {
    int a[3] = {1, 2, 3};
    return a;
}
~~~
- [ ] An array cannot be initialised with braces inside a function.
- [x] It returns the address of a local array, which no longer exists after the function returns (dangling pointer).
- [ ] The return type should be int, not int *.
- [ ] The array needs the keyword const to be returned.
> `a` lives on the function's stack frame and is destroyed on return. The caller would get a pointer to dead memory. Fix: use malloc (and free later), use a static array, or let the caller pass in its own array.
```

# Question: Find the error: after free
marks: 2

```quiz
What is wrong with this code?
~~~
int *p = (int *)malloc(sizeof(int));
*p = 5;
free(p);
printf("%d\n", *p);
~~~
- [ ] malloc must be called with sizeof(int) * 2.
- [ ] `*p = 5;` is illegal because p is a pointer.
- [x] `*p` is read after the memory was freed (use after free).
- [ ] free(p) should be called twice to release the memory completely.
> After free(p) the block belongs to the system again; p still holds the old address but must not be dereferenced. Set p = NULL after free to avoid the mistake.
```

# Question: Find the error: missing base case
marks: 3

```quiz
This function should return 1 + 2 + ... + n. Why does it crash for sum(3)?
~~~
int sum(int n) {
    return n + sum(n - 1);
}
~~~
- [ ] The parameter n is not allowed to be changed.
- [ ] A recursive function must have no return value.
- [x] There is no base case, so it keeps calling itself (sum(0), sum(-1), ...) until the stack overflows.
- [ ] The call sum(n - 1) should be sum(n + 1).
> Every recursive function needs a condition that stops the recursion, e.g. `if (n == 0) return 0;`, and each call must move toward it.
```

# Problem: Recursive array tools
id: final-rec-array
difficulty: medium
marks: 8
source: Original (mock test)

Write three **recursive** functions (no loops inside them) on an array of **n** integers:

- `int sumArr(int a[], int n)` returns the sum of the elements,
- `int countArr(int a[], int n, int x)` returns how many elements equal **x**,
- `int isSorted(int a[], int n)` returns 1 if the array is in non-decreasing order (equal neighbours are allowed), otherwise 0.

Read the array and the value x, call the functions from `main` and print the results.

**Input:** n (1 ≤ n ≤ 50), then n integers, then the integer x.
**Output:** three lines: `Sum = S`, `Count = C`, `Sorted = Yes` (or `Sorted = No`).

```c starter
#include <stdio.h>

int sumArr(int a[], int n) {
    // your code here (use recursion)
}

int countArr(int a[], int n, int x) {
    // your code here (use recursion)
}

int isSorted(int a[], int n) {
    // your code here (use recursion)
}

int main(void) {
    int a[50], n, x, i;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);
    scanf("%d", &x);
    // call the functions and print the results
    return 0;
}
```

```c solution
#include <stdio.h>

int sumArr(int a[], int n) {
    if (n == 0)
        return 0;
    return a[n - 1] + sumArr(a, n - 1);
}

int countArr(int a[], int n, int x) {
    if (n == 0)
        return 0;
    return (a[n - 1] == x) + countArr(a, n - 1, x);
}

int isSorted(int a[], int n) {
    if (n <= 1)
        return 1;
    if (a[n - 2] > a[n - 1])
        return 0;
    return isSorted(a, n - 1);
}

int main(void) {
    int a[50], n, x, i;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);
    scanf("%d", &x);
    printf("Sum = %d\n", sumArr(a, n));
    printf("Count = %d\n", countArr(a, n, x));
    printf("Sorted = %s\n", isSorted(a, n) ? "Yes" : "No");
    return 0;
}
```

```test
=== input
5
2 4 4 7 9
4
=== output
Sum = 26
Count = 2
Sorted = Yes
```

```test
=== input
6
3 1 4 1 5 9
1
=== output
Sum = 23
Count = 2
Sorted = No
```

```test
=== input
1
7
3
=== output
Sum = 7
Count = 0
Sorted = Yes
```

```test
=== input
4
-10 20 30 25
25
=== output
Sum = 65
Count = 1
Sorted = No
```

```hint
Think of the array as "the last element" plus "the first n-1 elements". The base case is n == 0 (for sum and count) or n <= 1 (for sorted).
```

```hint
For countArr: the answer is (a[n-1] == x ? 1 : 0) plus countArr(a, n-1, x). For isSorted: if a[n-2] > a[n-1] return 0, otherwise answer for the first n-1 elements.
```

# Problem: Run-length compression
id: final-rle
difficulty: medium
marks: 10
source: Original (mock test)

Run-length encoding replaces every run of equal consecutive characters by the character followed by the length of the run. For example `aaabb` becomes `a3b2` and `abc` becomes `a1b1c1`.

Read one word (no spaces, at most 100 characters), build the compressed string and print the report below. A run may be longer than 9, so the count can have several digits (12 `z` characters become `z12`).

**Input:** one word.
**Output:** four lines:

```
Compressed: <compressed word>
Original length: <n>
Compressed length: <m>
Shorter: Yes
```

The last line is `Yes` only if the compressed string is strictly shorter than the original, otherwise `No`.

```c starter
#include <stdio.h>
#include <string.h>

int main(void) {
    char word[101];
    char out[301];
    scanf("%s", word);
    // build out, then print the four lines
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void) {
    char word[101];
    char out[301];
    int i = 0, len, pos = 0;
    scanf("%s", word);
    len = (int)strlen(word);
    while (i < len) {
        int j = i;
        while (j < len && word[j] == word[i])
            j++;
        pos += sprintf(out + pos, "%c%d", word[i], j - i);
        i = j;
    }
    out[pos] = '\0';
    printf("Compressed: %s\n", out);
    printf("Original length: %d\n", len);
    printf("Compressed length: %d\n", (int)strlen(out));
    printf("Shorter: %s\n", (int)strlen(out) < len ? "Yes" : "No");
    return 0;
}
```

```test
=== input
aaabb
=== output
Compressed: a3b2
Original length: 5
Compressed length: 4
Shorter: Yes
```

```test
=== input
abc
=== output
Compressed: a1b1c1
Original length: 3
Compressed length: 6
Shorter: No
```

```test
=== input
zzzzzzzzzzzz
=== output
Compressed: z12
Original length: 12
Compressed length: 3
Shorter: Yes
```

```test
=== input
aabcccd
=== output
Compressed: a2b1c3d1
Original length: 7
Compressed length: 8
Shorter: No
```

```hint
Use an index i at the start of a run and a second index j that moves forward while word[j] == word[i]. The run length is j - i. Then continue from i = j.
```

```hint
sprintf(out + pos, "%c%d", ch, count) appends to the output string and returns how many characters it wrote, so you can add that to pos. Do not forget the final '\0'.
```

# Problem: Stock report
id: final-stock-report
difficulty: medium
marks: 12
source: Original (mock test)

A shop keeps its stock in an array of structures. Define

```c
struct Product { char name[20]; int qty; double price; };
```

Read **n** products, sort them by **price from highest to lowest**, and print one line per product in the form `name qty price total` where total = qty × price (both money values with 2 decimals). Then print the total value of all stock and the name of the product whose total value is the largest. All prices in the input are different and all totals are different.

**Input:** n (1 ≤ n ≤ 20), then n lines each with `name qty price` (name is a single word).
**Output:** the n sorted lines, then `Total stock value = V` and `Most valuable: NAME`.

```c starter
#include <stdio.h>

struct Product {
    char name[20];
    int qty;
    double price;
};

int main(void) {
    struct Product p[20];
    int n, i;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%s %d %lf", p[i].name, &p[i].qty, &p[i].price);
    // sort by price (highest first), then print the report
    return 0;
}
```

```c solution
#include <stdio.h>

struct Product {
    char name[20];
    int qty;
    double price;
};

int main(void) {
    struct Product p[20], tmp;
    int n, i, j, best = 0;
    double total = 0.0;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%s %d %lf", p[i].name, &p[i].qty, &p[i].price);

    for (i = 0; i < n - 1; i++) {
        for (j = 0; j < n - 1 - i; j++) {
            if (p[j].price < p[j + 1].price) {
                tmp = p[j];
                p[j] = p[j + 1];
                p[j + 1] = tmp;
            }
        }
    }

    for (i = 0; i < n; i++) {
        double line = p[i].qty * p[i].price;
        printf("%s %d %.2f %.2f\n", p[i].name, p[i].qty, p[i].price, line);
        total += line;
        if (line > p[best].qty * p[best].price)
            best = i;
    }
    printf("Total stock value = %.2f\n", total);
    printf("Most valuable: %s\n", p[best].name);
    return 0;
}
```

```test
=== input
4
Pen 10 2.50
Notebook 5 12.00
Bag 2 45.25
Ruler 8 1.75
=== output
Bag 2 45.25 90.50
Notebook 5 12.00 60.00
Pen 10 2.50 25.00
Ruler 8 1.75 14.00
Total stock value = 189.50
Most valuable: Bag
```

```test
=== input
1
Stapler 3 6.50
=== output
Stapler 3 6.50 19.50
Total stock value = 19.50
Most valuable: Stapler
```

```test
=== input
3
Cable 4 7.50
Mouse 3 15.25
Hub 1 22.00
=== output
Hub 1 22.00 22.00
Mouse 3 15.25 45.75
Cable 4 7.50 30.00
Total stock value = 97.75
Most valuable: Mouse
```

```test
=== input
5
A 0 9.00
B 6 4.50
C 2 30.00
D 10 0.50
E 3 9.25
=== output
C 2 30.00 60.00
E 3 9.25 27.75
A 0 9.00 0.00
B 6 4.50 27.00
D 10 0.50 5.00
Total stock value = 119.75
Most valuable: C
```

```hint
Structures can be assigned as a whole: `tmp = p[j]; p[j] = p[j + 1]; p[j + 1] = tmp;` swaps two products in a bubble sort. Compare `p[j].price < p[j + 1].price` to get highest-first order.
```

```hint
After sorting, loop once more: compute `qty * price` for each product, add it to a running total, and remember the index of the largest line value.
```

# Problem: Mean and standard deviation on the heap
id: final-heap-stats
difficulty: hard
marks: 15
source: Original (mock test)

Read **n** and then **n** real numbers into an array allocated with `malloc`. Compute

- the mean,
- the **population standard deviation** σ = sqrt( Σ (x − mean)² / n ) (use `sqrt` from `math.h`),
- then copy every value that lies within one standard deviation of the mean (mean − σ ≤ x ≤ mean + σ) into a **second** `malloc`ed array, and shrink that array to exactly the needed size with `realloc`.

Print the results with 2 decimals, then free both arrays. At least one value is always kept.

**Input:** n (1 ≤ n ≤ 100), then n real numbers.
**Output:**

```
Mean = M
StdDev = S
Kept K: v1 v2 ... vK
```

The kept values are printed in their original order, each with 2 decimals, separated by single spaces. (The test data never places a value exactly on the border mean ± σ, except when σ = 0.)

```c starter
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int main(void) {
    int n, i;
    double *a;
    scanf("%d", &n);
    a = (double *)malloc(n * sizeof(double));
    if (a == NULL)
        return 1;
    for (i = 0; i < n; i++)
        scanf("%lf", &a[i]);
    // mean, standard deviation, second array, realloc, report
    free(a);
    return 0;
}
```

```c solution
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int main(void) {
    int n, i, k = 0;
    double *a, *kept, *shrunk;
    double sum = 0.0, mean, var = 0.0, sd;

    scanf("%d", &n);
    a = (double *)malloc(n * sizeof(double));
    if (a == NULL)
        return 1;
    for (i = 0; i < n; i++) {
        scanf("%lf", &a[i]);
        sum += a[i];
    }
    mean = sum / n;
    for (i = 0; i < n; i++)
        var += (a[i] - mean) * (a[i] - mean);
    sd = sqrt(var / n);

    kept = (double *)malloc(n * sizeof(double));
    if (kept == NULL) {
        free(a);
        return 1;
    }
    for (i = 0; i < n; i++) {
        if (a[i] >= mean - sd && a[i] <= mean + sd)
            kept[k++] = a[i];
    }
    shrunk = (double *)realloc(kept, k * sizeof(double));
    if (shrunk != NULL)
        kept = shrunk;

    printf("Mean = %.2f\n", mean);
    printf("StdDev = %.2f\n", sd);
    printf("Kept %d:", k);
    for (i = 0; i < k; i++)
        printf(" %.2f", kept[i]);
    printf("\n");

    free(kept);
    free(a);
    return 0;
}
```

```test
=== input
5
1 2 3 4 10
=== output
Mean = 4.00
StdDev = 3.16
Kept 4: 1.00 2.00 3.00 4.00
```

```test
=== input
6
10 20 30 40 50 60
=== output
Mean = 35.00
StdDev = 17.08
Kept 4: 20.00 30.00 40.00 50.00
```

```test
=== input
1
7.5
=== output
Mean = 7.50
StdDev = 0.00
Kept 1: 7.50
```

```test
=== input
7
5 5 5 5 5 5 50
=== output
Mean = 11.43
StdDev = 15.75
Kept 6: 5.00 5.00 5.00 5.00 5.00 5.00
```

```hint
Do it in passes: one loop to read and add up the values (mean = sum / n), a second loop to add up (x - mean) * (x - mean), and only then take sqrt(variance / n). Remember to divide by n, not n - 1.
```

```hint
Allocate the second array with room for n values, fill it while counting k, then `kept = realloc(kept, k * sizeof(double))`. Store the realloc result in a temporary pointer first so you do not lose the block if it fails. Free both arrays at the end.
```

# Problem: Number file summary
id: final-file-summary
difficulty: hard
marks: 15
source: Original (mock test)

The file `numbers.txt` already exists and contains integers separated by spaces and/or newlines (at least 1, at most 1000 numbers). Write a program that:

1. counts how many numbers the file holds (first pass), rewinds the file, allocates an `int` array of exactly that size with `malloc`, and reads the numbers into it (second pass);
2. sorts the array in ascending order;
3. writes a summary file `summary.txt` with exactly these five lines: `Count: C`, `Min: A`, `Max: B`, `Median: M` (one decimal), `Mean: X` (two decimals);
4. closes it, opens `summary.txt` again for reading and prints its contents to the screen.

The median is the middle element for an odd count, and the average of the two middle elements for an even count. Check that every `fopen` succeeded and free the array.

**Input:** none (the data is in `numbers.txt`).
**Output:** the five lines of `summary.txt`.

```c starter
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    FILE *fp;
    int *a;
    int n = 0, x;

    fp = fopen("numbers.txt", "r");
    if (fp == NULL) {
        printf("Cannot open numbers.txt\n");
        return 1;
    }
    // pass 1: count; rewind; allocate; pass 2: read
    // sort, compute, write summary.txt, read it back and print it
    fclose(fp);
    return 0;
}
```

```c solution
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    FILE *fp, *out;
    int *a;
    int n = 0, x, i, j, tmp;
    double sum = 0.0, median;
    char line[100];

    fp = fopen("numbers.txt", "r");
    if (fp == NULL) {
        printf("Cannot open numbers.txt\n");
        return 1;
    }
    while (fscanf(fp, "%d", &x) == 1)
        n++;
    rewind(fp);

    a = (int *)malloc(n * sizeof(int));
    if (a == NULL) {
        fclose(fp);
        return 1;
    }
    for (i = 0; i < n; i++) {
        fscanf(fp, "%d", &a[i]);
        sum += a[i];
    }
    fclose(fp);

    for (i = 0; i < n - 1; i++) {
        for (j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                tmp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = tmp;
            }
        }
    }
    if (n % 2 == 1)
        median = a[n / 2];
    else
        median = (a[n / 2 - 1] + a[n / 2]) / 2.0;

    out = fopen("summary.txt", "w");
    if (out == NULL) {
        free(a);
        return 1;
    }
    fprintf(out, "Count: %d\n", n);
    fprintf(out, "Min: %d\n", a[0]);
    fprintf(out, "Max: %d\n", a[n - 1]);
    fprintf(out, "Median: %.1f\n", median);
    fprintf(out, "Mean: %.2f\n", sum / n);
    fclose(out);
    free(a);

    out = fopen("summary.txt", "r");
    if (out == NULL)
        return 1;
    while (fgets(line, sizeof(line), out) != NULL)
        printf("%s", line);
    fclose(out);
    return 0;
}
```

```test
=== file numbers.txt
12 7 3 25
18 9 14
=== output
Count: 7
Min: 3
Max: 25
Median: 12.0
Mean: 12.57
```

```test
=== file numbers.txt
40
10 30
20
=== output
Count: 4
Min: 10
Max: 40
Median: 25.0
Mean: 25.00
```

```test
=== file numbers.txt
-5
=== output
Count: 1
Min: -5
Max: -5
Median: -5.0
Mean: -5.00
```

```test
=== file numbers.txt
5 -3 8 -3
0 10
=== output
Count: 6
Min: -3
Max: 10
Median: 2.5
Mean: 2.83
```

```hint
Use `while (fscanf(fp, "%d", &x) == 1) n++;` to count the numbers, then `rewind(fp);` to go back to the start of the file before reading them again.
```

```hint
Sort first, then Min is a[0] and Max is a[n-1]. For the median use `a[n/2]` when n is odd and `(a[n/2 - 1] + a[n/2]) / 2.0` when n is even. Write the five lines with fprintf, fclose the file, reopen it with "r" and print each line read with fgets.
```
