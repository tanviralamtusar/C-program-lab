---
id: topic-dynamic-memory
title: "Topic Test: Dynamic Memory"
group: topic
lesson: dynamic-memory
order: 113
duration: 30
covers: malloc, calloc, realloc, free, memory leaks, sizeof with pointers, dynamic 2D arrays, strings on the heap
summary: A short test on heap allocation with six trace-and-debug questions and two coding problems that use calloc, malloc and free.
---

# Question: realloc keeps the old data
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = (int *)malloc(3 * sizeof(int));
    int *q;
    int i, sum = 0;
    if (p == NULL)
        return 1;
    for (i = 0; i < 3; i++)
        p[i] = i + 1;
    q = (int *)realloc(p, 5 * sizeof(int));
    if (q == NULL) {
        free(p);
        return 1;
    }
    p = q;
    p[3] = 40;
    p[4] = 50;
    for (i = 0; i < 5; i++)
        sum += p[i];
    printf("%d %d", p[2], sum);
    free(p);
    return 0;
}
~~~
- [ ] 3 6
- [x] 3 96
- [ ] 0 90
- [ ] 50 96
> realloc copies the old three values (1 2 3) into the bigger block, so p[2] is still 3. The sum is 1 + 2 + 3 + 40 + 50 = 96.
```

# Question: Two pointers, one block
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *a = (int *)malloc(sizeof(int));
    int *b;
    if (a == NULL)
        return 1;
    b = a;
    *b = 7;
    *a = *a + 1;
    printf("%d %d", *a, *b);
    free(a);
    return 0;
}
~~~
- [ ] 7 8
- [ ] 8 7
- [x] 8 8
- [ ] 7 7
> `b = a` copies the address, not the block. Both pointers name the same single int, so the change made through `a` is also seen through `b`. Only one free is needed (and a second one would be an error).
```

# Question: sizeof and a pointer
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int arr[5];
    int *p = (int *)malloc(5 * sizeof(int));
    if (p == NULL)
        return 1;
    printf("%d %d %d", (int)sizeof(p), (int)sizeof(*p), (int)sizeof(arr));
    free(p);
    return 0;
}
~~~
- [ ] 20 4 20
- [ ] 4 4 20
- [ ] 8 20 20
- [x] 8 4 20
> sizeof(p) is the size of the pointer itself (8 bytes), sizeof(*p) is one int (4 bytes), and sizeof(arr) is the whole array (5 * 4 = 20). A pointer to heap memory does not remember how many elements were allocated.
```

# Question: calloc zeroes the memory
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int **m = (int **)malloc(3 * sizeof(int *));
    int i, j, total = 0;
    if (m == NULL)
        return 1;
    for (i = 0; i < 3; i++) {
        m[i] = (int *)calloc(3, sizeof(int));
        if (m[i] == NULL)
            return 1;
        m[i][i] = i + 1;
    }
    for (i = 0; i < 3; i++)
        for (j = 0; j < 3; j++)
            total += m[i][j];
    printf("%d %d %d", m[0][2], m[2][2], total);
    for (i = 0; i < 3; i++)
        free(m[i]);
    free(m);
    return 0;
}
~~~
- [ ] 0 3 3
- [ ] 2 3 6
- [x] 0 3 6
- [ ] 3 3 9
> Each row is created by calloc, so every element starts at 0 and only the diagonal gets 1, 2, 3. m[0][2] is 0, m[2][2] is 3 and the total is 1 + 2 + 3 = 6. Every row is freed before the array of row pointers.
```

# Question: Find the leak
marks: 2

```quiz
This code has a memory leak. Where does it happen?
~~~
int *p = (int *)malloc(10 * sizeof(int));
if (p == NULL)
    return 1;
p = (int *)malloc(20 * sizeof(int));
if (p == NULL)
    return 1;
free(p);
~~~
- [ ] The first malloc asks for too little memory.
- [ ] free(p) must be written twice, once for each malloc.
- [x] The address of the first block is overwritten by the second malloc, so that block can never be freed.
- [ ] A pointer may only be assigned once in a program.
> After `p = malloc(...)` the second time, nothing points to the first block any more. It stays allocated until the program ends. Free the first block (or realloc it) before reusing p.
```

# Question: Find the bug: copying a string to the heap
marks: 2

```quiz
This code copies the string t to the heap. What is wrong with it?
~~~
char t[] = "hello";
char *s = (char *)malloc(strlen(t));
if (s == NULL)
    return 1;
strcpy(s, t);
~~~
- [ ] strcpy cannot copy into memory from malloc.
- [ ] The cast before malloc is not allowed.
- [x] The block has 5 bytes but "hello" needs 6, because the terminating '\0' must fit too: use strlen(t) + 1.
- [ ] malloc must be called with sizeof(char *).
> strlen does not count the '\0'. strcpy writes it anyway, one byte past the end of the block, which is a buffer overflow.
```

# Problem: Prefix sums with calloc
id: topic-dynamic-memory-prefix
difficulty: easy
marks: 6
source: Original (topic test)

Read **n** integers and answer several range-sum questions quickly. Allocate an array `prefix` of **n + 1** integers with `calloc`, where `prefix[i]` is the sum of the first i numbers (so `prefix[0]` is 0). While reading, build it with `prefix[i] = prefix[i-1] + x`. Then every query `l r` (1-based, inclusive) is answered with `prefix[r] - prefix[l-1]`.

Check that `calloc` succeeded and free the array at the end.

**Input:** n (1 ≤ n ≤ 1000), then n integers, then q (1 ≤ q ≤ 100), then q lines each with `l r` (1 ≤ l ≤ r ≤ n).
**Output:** one line per query: `Sum(l..r) = S`.

```c starter
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, q, i, x;
    int *prefix;
    scanf("%d", &n);
    // allocate prefix with calloc (n + 1 ints), then read and fill it
    // answer the queries, then free
    return 0;
}
```

```c solution
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, q, i, x, l, r;
    int *prefix;
    scanf("%d", &n);
    prefix = (int *)calloc(n + 1, sizeof(int));
    if (prefix == NULL)
        return 1;
    for (i = 1; i <= n; i++) {
        scanf("%d", &x);
        prefix[i] = prefix[i - 1] + x;
    }
    scanf("%d", &q);
    for (i = 0; i < q; i++) {
        scanf("%d %d", &l, &r);
        printf("Sum(%d..%d) = %d\n", l, r, prefix[r] - prefix[l - 1]);
    }
    free(prefix);
    return 0;
}
```

```test
=== input
5
3 -1 4 1 5
3
1 5
2 4
3 3
=== output
Sum(1..5) = 12
Sum(2..4) = 4
Sum(3..3) = 4
```

```test
=== input
1
7
1
1 1
=== output
Sum(1..1) = 7
```

```test
=== input
4
-2 -3 -4 -5
2
1 2
2 4
=== output
Sum(1..2) = -5
Sum(2..4) = -12
```

```test
=== input
6
10 0 0 0 0 20
2
1 6
2 5
=== output
Sum(1..6) = 30
Sum(2..5) = 0
```

```hint
`prefix = (int *)calloc(n + 1, sizeof(int));` gives n + 1 zeroed ints, so `prefix[0]` is already 0. Fill positions 1 to n while reading the numbers.
```

```hint
The sum of elements l..r is everything up to r minus everything before l: `prefix[r] - prefix[l - 1]`.
```

# Problem: Word pool on the heap
id: topic-dynamic-memory-word-pool
difficulty: medium
marks: 8
source: Original (topic test)

Read **n** words. Store each word in its own heap block of **exactly** the right size (`strlen(word) + 1` bytes, allocated with `malloc` and filled with `strcpy`), and keep the n pointers in an array `char *w[20]`.

Then sort the pointers by word length, shortest first. Words of the same length must stay in their **input order**. Print the sorted words, the total number of letters and the number of heap bytes the words occupy (each word needs one extra byte for the `'\0'`). Free every block.

**Input:** n (1 ≤ n ≤ 20), then n words (each at most 30 characters).
**Output:** one line per word in the form `word (length)`, then `Total letters = T` and `Heap bytes = B`.

```c starter
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    char *w[20];
    char buf[31];
    int n, i;
    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%s", buf);
        // allocate exactly strlen(buf) + 1 bytes and copy buf into it
    }
    // sort the pointers by length (keep input order for equal lengths), print, free
    return 0;
}
```

```c solution
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    char *w[20];
    char buf[31];
    char *key;
    int n, i, j, letters = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%s", buf);
        w[i] = (char *)malloc(strlen(buf) + 1);
        if (w[i] == NULL) {
            while (i > 0)
                free(w[--i]);
            return 1;
        }
        strcpy(w[i], buf);
    }

    for (i = 1; i < n; i++) {
        key = w[i];
        j = i - 1;
        while (j >= 0 && strlen(w[j]) > strlen(key)) {
            w[j + 1] = w[j];
            j--;
        }
        w[j + 1] = key;
    }

    for (i = 0; i < n; i++) {
        printf("%s (%d)\n", w[i], (int)strlen(w[i]));
        letters += (int)strlen(w[i]);
    }
    printf("Total letters = %d\n", letters);
    printf("Heap bytes = %d\n", letters + n);

    for (i = 0; i < n; i++)
        free(w[i]);
    return 0;
}
```

```test
=== input
4
pear fig banana kiwi
=== output
fig (3)
pear (4)
kiwi (4)
banana (6)
Total letters = 17
Heap bytes = 21
```

```test
=== input
1
a
=== output
a (1)
Total letters = 1
Heap bytes = 2
```

```test
=== input
3
cat dog ant
=== output
cat (3)
dog (3)
ant (3)
Total letters = 9
Heap bytes = 12
```

```test
=== input
5
programming is fun and easy
=== output
is (2)
fun (3)
and (3)
easy (4)
programming (11)
Total letters = 23
Heap bytes = 28
```

```hint
For each word: `w[i] = (char *)malloc(strlen(buf) + 1);` then `strcpy(w[i], buf);`. Always check for NULL.
```

```hint
Sorting only moves pointers, not the characters. Use insertion sort and shift a word right only while its length is strictly greater than the key's length, so equal lengths never swap (the sort is stable).
```
