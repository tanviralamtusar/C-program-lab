---
id: dynamic-memory
title: Dynamic Memory Allocation
order: 13
summary: Stack versus heap, malloc, free, calloc, realloc, dynamic 1D and 2D arrays, strings on the heap, memory leaks and dangling pointers.
---

# Step: Stack vs heap - why dynamic memory?

So far every variable and array had a **fixed size decided when you wrote the program** (`int a[100];`). What if you do not know how many numbers the user will enter? A big fixed array wastes memory, and a small one overflows.

**Dynamic memory allocation** lets the program ask for memory **while it runs**, in exactly the size it needs, and give it back when it is done.

A running program mainly uses two areas of memory:

| | Stack | Heap |
|---|---|---|
| Holds | local variables, function parameters | blocks you request with `malloc`/`calloc`/`realloc` |
| Created | automatically when a function is called | when *you* call `malloc` |
| Destroyed | automatically when the function returns | only when *you* call `free` |
| Size | decided at compile time | decided at run time |

The functions live in `<stdlib.h>`: `malloc`, `calloc`, `realloc`, `free`.

```c run
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int a = 10;                                   /* stack variable */
    int *h = (int *)malloc(sizeof(int));          /* one int on the heap */
    if (h == NULL) return 1;

    *h = 20;
    printf("stack a = %d\n", a);
    printf("heap *h = %d\n", *h);

    free(h);                                      /* give the heap block back */
    return 0;
}
```
```output
stack a = 10
heap *h = 20
```

> **Tip:** Press **Visualize**. The visualizer draws the stack frames on one side and a separate **Heap** area on the other. `a` is inside `main`'s frame, while `h` (a stack variable) has an **arrow** to a box in the Heap. After `free(h)` the heap box disappears.

Notice: a heap block has **no name**. The only way to reach it is through a pointer. Lose the pointer and you lose the block.

```quiz
Where does memory obtained from `malloc` live, and when is it released?
- [ ] On the stack, when the function returns
- [x] On the heap, when you call `free` (or the program ends)
- [ ] On the stack, when you call `free`
- [ ] On the heap, when the function returns
> Heap memory is not tied to function calls. It stays until you free it.
```

# Step: malloc - allocating memory

`malloc(size)` asks for `size` **bytes** on the heap and returns a pointer to the first byte, or `NULL` if there is not enough memory. The memory is **not initialized** - it holds garbage until you write to it.

To allocate an array of `n` ints: `malloc(n * sizeof(int))`. Always:

1. multiply by `sizeof(type)`;
2. check for `NULL`;
3. use the pointer like an array (`p[i]`);
4. `free` it when finished.

```c run
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i, sum = 0;
    int *a;

    scanf("%d", &n);
    a = (int *)malloc(n * sizeof(int));
    if (a == NULL) {
        printf("Out of memory\n");
        return 1;
    }

    for (i = 0; i < n; i++) {
        scanf("%d", &a[i]);
        sum += a[i];
    }
    printf("Sum = %d\n", sum);
    printf("Average = %.2f\n", (double)sum / n);

    free(a);
    return 0;
}
```
```input
5
10 20 30 40 50
```
```output
Sum = 150
Average = 30.00
```

This is a **dynamic array**: its size `n` was decided by the user *at run time*.

> **Tip:** Visualize with this input. The pointer `a` on the stack has an arrow to a 5-cell block in the Heap. Watch the cells fill in as `scanf` runs.

### Common mistakes

- `malloc(n)` instead of `malloc(n * sizeof(int))` - allocates only `n` **bytes**, not `n` ints. Writing past the end is an error.
- Not checking for `NULL`.
- Reading `a[i]` before writing it: malloc'd memory is uninitialized garbage.

```quiz
How many bytes does `malloc(5 * sizeof(int))` request (int is 4 bytes)?
- [ ] 5
- [ ] 9
- [x] 20
- [ ] 4
> 5 ints x 4 bytes = 20 bytes.
```

```quiz
What does `malloc` return when it cannot allocate the memory?
- [ ] 0 bytes of memory
- [ ] -1
- [x] NULL
- [ ] It crashes the program
> That is why you must check `if (p == NULL)` before using the pointer.
```

# Step: free, memory leaks and dangling pointers

Every `malloc` needs a matching `free`. When you are done with a block, call `free(p)`. Two classic bugs:

**Memory leak** - you lose the last pointer to a heap block (or forget to free it), so the memory can never be reclaimed.

```c
int *p = (int *)malloc(100 * sizeof(int));
p = (int *)malloc(50 * sizeof(int));   /* LEAK: address of the first block is lost */
```

**Dangling pointer** - after `free(p)` the pointer `p` still holds the old address, but the memory is no longer yours. Using it is **undefined behavior** (the interpreter reports a runtime error). Good habit: set `p = NULL;` right after `free(p)`.

```c run
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int round;
    int *q;

    for (round = 1; round <= 3; round++) {
        int *p = (int *)malloc(100 * sizeof(int));
        if (p == NULL) return 1;
        p[0] = round;
        printf("round %d: p[0] = %d\n", round, p[0]);
        free(p);                  /* without this line, each round would leak 400 bytes */
    }

    q = (int *)malloc(sizeof(int));
    if (q == NULL) return 1;
    *q = 7;
    free(q);
    q = NULL;                     /* no more dangling pointer */
    if (q == NULL)
        printf("q is NULL, safe\n");
    return 0;
}
```
```output
round 1: p[0] = 1
round 2: p[0] = 2
round 3: p[0] = 3
q is NULL, safe
```

> **Tip:** Try deleting the `free(p);` line and Visualize again. After each round the old block stays in the Heap with **no arrow** pointing to it - that is a leak you can *see*.

### Common mistakes

- **Double free**: calling `free(p)` twice on the same block. Setting `p = NULL` after the first `free` makes the second one harmless (`free(NULL)` does nothing).
- **Use after free**: reading or writing `*p` after `free(p)`.
- Freeing memory that did not come from `malloc` (like `free(&x)` or an array name).

```quiz
What is the bug?
~~~
int *p = (int *)malloc(sizeof(int));
*p = 5;
free(p);
printf("%d", *p);
~~~
- [ ] Memory leak
- [ ] Double free
- [x] Use after free (dangling pointer)
- [ ] There is no bug
> After `free(p)`, p points to memory that is no longer valid. Reading `*p` is undefined behavior.
```

```quiz
What happens here?
~~~
int *p = (int *)malloc(10 * sizeof(int));
p = (int *)malloc(20 * sizeof(int));
free(p);
~~~
- [ ] Nothing, it is fine
- [x] The first block of 10 ints is leaked
- [ ] The second block is leaked
- [ ] Double free
> The address of the first block was overwritten before being freed, so it can never be freed.
```

# Step: calloc vs malloc

`calloc(count, size)` allocates `count * size` bytes **and sets all of them to zero**.

| | `malloc(n * sizeof(int))` | `calloc(n, sizeof(int))` |
|---|---|---|
| Arguments | total bytes | number of elements, size of one element |
| Initial contents | **garbage** (never read before writing!) | all **0** |
| Speed | slightly faster | slightly slower (it clears memory) |

```c run
#include <stdio.h>
#include <stdlib.h>

void printArr(const char *label, int *a, int n) {
    int i;
    printf("%s", label);
    for (i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
}

int main(void) {
    int n = 5, i;
    int *c = (int *)calloc(n, sizeof(int));
    int *m = (int *)malloc(n * sizeof(int));
    if (c == NULL || m == NULL) return 1;

    printArr("calloc: ", c, n);          /* guaranteed zeros */

    for (i = 0; i < n; i++)              /* malloc'd memory must be filled first */
        m[i] = i * i;
    printArr("malloc (after filling): ", m, n);

    free(c);
    free(m);
    return 0;
}
```
```output
calloc: 0 0 0 0 0
malloc (after filling): 0 1 4 9 16
```

> **Warning:** We never print the malloc'd values *before* filling them - they are uninitialized and could be anything.

### Common mistakes

- Assuming `malloc` gives zeros. It does not - use `calloc` if you need zeros, or fill the memory yourself.
- Mixing up the arguments: `calloc(sizeof(int), n)` works but is confusing; write `calloc(n, sizeof(int))`.

```quiz
Which call gives an array of 4 ints that are all zero?
- [ ] `malloc(4 * sizeof(int))`
- [x] `calloc(4, sizeof(int))`
- [ ] `malloc(4)`
- [ ] `calloc(sizeof(int))`
> calloc clears the memory it allocates. malloc leaves it uninitialized.
```

# Step: realloc - growing and shrinking

`realloc(ptr, newSize)` changes the size of an existing heap block to `newSize` **bytes**:

- The old contents are **kept** (up to the smaller of the two sizes).
- The block may be **moved** to a new place, so always use the **returned** pointer.
- On failure it returns `NULL` and the old block is still valid.

So never write `a = realloc(a, ...)` directly - if it fails you lose `a` (a leak). Use a **temporary pointer**:

```c run
#include <stdio.h>
#include <stdlib.h>

void show(int *a, int n) {
    int i;
    printf("size %d:", n);
    for (i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
}

int main(void) {
    int i;
    int *a = (int *)malloc(3 * sizeof(int));
    int *tmp;
    if (a == NULL) return 1;
    for (i = 0; i < 3; i++) a[i] = i + 1;
    show(a, 3);

    tmp = (int *)realloc(a, 6 * sizeof(int));      /* grow */
    if (tmp == NULL) { free(a); return 1; }
    a = tmp;
    for (i = 3; i < 6; i++) a[i] = i + 1;
    show(a, 6);

    tmp = (int *)realloc(a, 2 * sizeof(int));      /* shrink */
    if (tmp == NULL) { free(a); return 1; }
    a = tmp;
    show(a, 2);

    free(a);
    return 0;
}
```
```output
size 3: 1 2 3
size 6: 1 2 3 4 5 6
size 2: 1 2
```

> **Tip:** In the visualizer the heap block changes its number of cells, and the first values stay. After shrinking, the cells beyond index 1 are gone - do not use `a[2]` any more.

### Common mistakes

- `a = realloc(a, n);` without a temporary - leaks if realloc fails.
- Using the **old** pointer after `realloc` (the block may have moved). Always continue with the new pointer.
- Forgetting `* sizeof(int)` in the new size.
- Expecting the **new** cells to be zero. They are uninitialized.

```quiz
Why do we write `tmp = realloc(a, ...)` instead of `a = realloc(a, ...)`?
- [ ] realloc cannot return into its own argument
- [x] If realloc fails it returns NULL; assigning to `a` directly would lose the only pointer to the old block
- [ ] It makes the program faster
- [ ] tmp is required by the C standard
> On failure realloc leaves the old block intact. With a temporary pointer we can still free it.
```

# Step: A growing array (read until -1)

Combine `realloc` with a **capacity** and a **count**. Start small; when the array is full, double the capacity. This is how dynamic lists such as C++'s `vector` or Python's `list` work.

```c run
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int cap = 2, count = 0, x, i, sum = 0;
    int *a = (int *)malloc(cap * sizeof(int));
    if (a == NULL) return 1;

    while (scanf("%d", &x) == 1 && x != -1) {
        if (count == cap) {                       /* full: grow */
            int *tmp;
            cap = cap * 2;
            tmp = (int *)realloc(a, cap * sizeof(int));
            if (tmp == NULL) { free(a); return 1; }
            a = tmp;
        }
        a[count] = x;
        count++;
    }

    for (i = 0; i < count; i++) sum += a[i];
    printf("Count = %d\n", count);
    printf("Capacity = %d\n", cap);
    printf("Sum = %d\n", sum);

    free(a);
    return 0;
}
```
```input
4 8 15 16 23 42 -1
```
```output
Count = 6
Capacity = 8
Sum = 108
```

The capacity went 2 -> 4 (when the 3rd number arrived) -> 8 (when the 5th number arrived).

> **Tip:** Visualize and watch the Heap block double in size twice. Doubling means growth happens only a few times, not on every number.

### Common mistakes

- Growing by 1 each time: correct but slow (a `realloc` per number).
- Forgetting to keep `count` and `cap` separate: `cap` is how much room there is, `count` is how much is used.

```quiz
Capacity starts at 2 and doubles whenever the array is full. After reading 6 numbers, what is the capacity?
- [ ] 6
- [ ] 4
- [x] 8
- [ ] 12
> 2 -> 4 -> 8. Six numbers do not fit in 4, so it grows to 8.
```

# Step: Dynamic 2D arrays

A matrix whose size is known only at run time can be built as an **array of pointers**: one `int **` that points to `rows` pointers, each of which points to a row of `cols` ints.

1. Allocate the array of row pointers: `m = malloc(rows * sizeof(int *))`.
2. For each row allocate `cols` ints: `m[i] = malloc(cols * sizeof(int))`.
3. Use it as `m[i][j]`.
4. Free **every row first**, then free `m`.

```c run
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int rows = 2, cols = 3, i, j;
    int **m = (int **)malloc(rows * sizeof(int *));
    if (m == NULL) return 1;

    for (i = 0; i < rows; i++) {
        m[i] = (int *)malloc(cols * sizeof(int));
        if (m[i] == NULL) return 1;
        for (j = 0; j < cols; j++)
            m[i][j] = i * cols + j + 1;
    }

    for (i = 0; i < rows; i++) {
        for (j = 0; j < cols; j++) {
            if (j > 0) printf(" ");
            printf("%d", m[i][j]);
        }
        printf("\n");
    }

    for (i = 0; i < rows; i++)
        free(m[i]);                /* free each row ... */
    free(m);                       /* ... then the array of pointers */
    return 0;
}
```
```output
1 2 3
4 5 6
```

> **Tip:** Visualize this one slowly. You will see `m` pointing to a Heap block of 2 pointers, and each of those arrows leads to its own block of 3 ints. Free the rows first, otherwise you lose the arrows needed to reach them.

### Common mistakes

- Freeing `m` **before** the rows: the row pointers are gone and the rows leak.
- Allocating only `m` and forgetting the rows (then `m[i][j]` uses uninitialized pointers).
- Using `sizeof(int)` instead of `sizeof(int *)` for the array of row pointers.

```quiz
For a matrix with `r` rows built as an array of pointers, how many `malloc` calls are needed (and how many `free` calls)?
- [ ] 1 and 1
- [ ] r and r
- [x] r + 1 and r + 1
- [ ] 2 and 2
> One malloc for the array of row pointers plus one for each of the r rows. Each needs its own free.
```

# Step: Strings on the heap and a checklist

A heap block can also hold characters. To copy or build a string you need `length + 1` bytes - the extra byte is for `'\0'`.

```c run
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    char *a = "Hello";
    char *b = "World";
    char *s = (char *)malloc(strlen(a) + strlen(b) + 1);   /* +1 for '\0' */
    if (s == NULL) return 1;

    strcpy(s, a);
    strcat(s, b);
    printf("%s (length %d)\n", s, (int)strlen(s));

    free(s);
    return 0;
}
```
```output
HelloWorld (length 10)
```

**Checklist for safe dynamic memory:**

1. `malloc`/`calloc` with `n * sizeof(type)`.
2. Check the result for `NULL`.
3. Use only indices `0 .. n-1`.
4. `realloc` through a temporary pointer.
5. `free` exactly once for every allocation.
6. Set the pointer to `NULL` after `free`.

> **Tip:** A quick sanity check in the visualizer: when the program ends, the Heap area should be **empty**. Any box left over is a leak.

### Common mistakes

- Allocating `strlen(s)` bytes and forgetting the `'\0'`: `strcpy` would write one byte too far.
- Using `sizeof(s)` on a pointer to get the string length - it gives the pointer size (8), not the length.

```quiz
How many bytes must you `malloc` to store a copy of the string "hi"?
- [ ] 2
- [x] 3
- [ ] 4
- [ ] 8
> Two characters plus the terminating '\0' = 3 bytes.
```

```quiz
After this code, what is `*p`?
~~~
int *p = (int *)calloc(3, sizeof(int));
printf("%d", p[1]);
free(p);
~~~
- [ ] Garbage
- [x] 0
- [ ] 1
- [ ] The program crashes
> calloc zeroes the memory, so p[1] prints 0.
```

# Problem: Dynamic array sum and average
id: dyn-sum-avg
difficulty: easy
source: CSE103 Task Sheet - Dynamic Memory Allocation #1

Read n, allocate an integer array of size n with `malloc`, read the n values, then print their sum and average (2 decimals). Free the memory at the end.

**Input:** first line n (1 ≤ n ≤ 1000); second line n integers.
**Output:**
`Sum = S`
`Average = A` (2 decimal places)

```c starter
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i, sum = 0;
    int *a;
    scanf("%d", &n);
    // allocate, read, compute, print, free
    return 0;
}
```
```c solution
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i, sum = 0;
    int *a;
    scanf("%d", &n);
    a = (int *)malloc(n * sizeof(int));
    if (a == NULL) return 1;
    for (i = 0; i < n; i++) {
        scanf("%d", &a[i]);
        sum += a[i];
    }
    printf("Sum = %d\n", sum);
    printf("Average = %.2f\n", (double)sum / n);
    free(a);
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
3
1 2 2
=== output
Sum = 5
Average = 1.67
```
```test
=== input
1
-4
=== output
Sum = -4
Average = -4.00
```
```hint
`a = (int *)malloc(n * sizeof(int));` then use `a[i]` like a normal array. Divide as `(double)sum / n`.
```

# Problem: Growing array with realloc
id: dyn-realloc-grow
difficulty: medium
source: CSE103 Task Sheet - Dynamic Memory Allocation #2

Keep reading integers until the value **-1** (the -1 is not stored). Store them in a dynamic array that starts with room for 2 numbers and **doubles** its capacity with `realloc` when full. At the end print how many numbers were stored and their sum.

**Input:** integers separated by spaces/newlines, ending with -1 (there may be extra data after it; ignore it).
**Output:**
`Count = C`
`Sum = S`

```c starter
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int cap = 2, count = 0, x, i, sum = 0;
    int *a = (int *)malloc(cap * sizeof(int));
    // read until -1, growing with realloc
    printf("Count = %d\n", count);
    printf("Sum = %d\n", sum);
    free(a);
    return 0;
}
```
```c solution
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int cap = 2, count = 0, x, i, sum = 0;
    int *a = (int *)malloc(cap * sizeof(int));
    if (a == NULL) return 1;
    while (scanf("%d", &x) == 1 && x != -1) {
        if (count == cap) {
            int *tmp;
            cap = cap * 2;
            tmp = (int *)realloc(a, cap * sizeof(int));
            if (tmp == NULL) { free(a); return 1; }
            a = tmp;
        }
        a[count++] = x;
    }
    for (i = 0; i < count; i++) sum += a[i];
    printf("Count = %d\n", count);
    printf("Sum = %d\n", sum);
    free(a);
    return 0;
}
```
```test
=== input
4 8 15 16 23 42 -1
=== output
Count = 6
Sum = 108
```
```test
=== input
-1
=== output
Count = 0
Sum = 0
```
```test
=== input
5 -1
=== output
Count = 1
Sum = 5
```
```test
=== input
3 -1 9
=== output
Count = 1
Sum = 3
```
```hint
Before storing a number, check `if (count == cap)`; if so, double `cap` and `realloc`.
```
```hint
Use a temporary pointer for realloc, then assign it back to `a`.
```

# Problem: Transpose of a dynamic matrix
id: dyn-transpose
difficulty: medium
source: CSE103 Task Sheet - Dynamic Memory Allocation #3

Read the dimensions `r` and `c` and an `r x c` matrix. Store it as a dynamic 2D array (array of pointers built with `malloc`), then print its **transpose** (a `c x r` matrix). Free all memory.

**Input:** first line `r c` (1 ≤ r, c ≤ 10); then r lines with c integers each.
**Output:** c lines, each with r integers separated by single spaces.

```c starter
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int r, c, i, j;
    int **m;
    scanf("%d %d", &r, &c);
    // allocate m, read, print the transpose, free
    return 0;
}
```
```c solution
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int r, c, i, j;
    int **m;
    scanf("%d %d", &r, &c);
    m = (int **)malloc(r * sizeof(int *));
    if (m == NULL) return 1;
    for (i = 0; i < r; i++) {
        m[i] = (int *)malloc(c * sizeof(int));
        if (m[i] == NULL) return 1;
        for (j = 0; j < c; j++) scanf("%d", &m[i][j]);
    }
    for (j = 0; j < c; j++) {
        for (i = 0; i < r; i++) {
            if (i > 0) printf(" ");
            printf("%d", m[i][j]);
        }
        printf("\n");
    }
    for (i = 0; i < r; i++) free(m[i]);
    free(m);
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
9
=== output
9
```
```test
=== input
3 1
7
8
9
=== output
7 8 9
```
```hint
Allocate `m = malloc(r * sizeof(int *))`, then `m[i] = malloc(c * sizeof(int))` for each row.
```
```hint
To transpose, loop `j` over columns in the outer loop and `i` over rows in the inner loop, printing `m[i][j]`.
```

# Problem: Read a line of any length
id: dyn-read-line
difficulty: hard
source: CSE103 Task Sheet - Dynamic Memory Allocation #4

Read one line of text of **unknown length** using `getchar()`. Start with a buffer of 4 characters and double it with `realloc` whenever there is no room for the next character plus the terminating `'\0'`. Stop at newline or end of input. Print the length and the line.

**Input:** one line of text (it may contain spaces).
**Output:**
`Length = N`
`Line: TEXT`

```c starter
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int cap = 4, len = 0, ch;
    char *buf = (char *)malloc(cap);
    // read characters, grow the buffer when needed
    buf[len] = '\0';
    printf("Length = %d\n", len);
    printf("Line: %s\n", buf);
    free(buf);
    return 0;
}
```
```c solution
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int cap = 4, len = 0, ch;
    char *buf = (char *)malloc(cap);
    if (buf == NULL) return 1;
    while ((ch = getchar()) != EOF && ch != '\n') {
        if (len + 1 >= cap) {
            char *tmp;
            cap = cap * 2;
            tmp = (char *)realloc(buf, cap);
            if (tmp == NULL) { free(buf); return 1; }
            buf = tmp;
        }
        buf[len++] = (char)ch;
    }
    buf[len] = '\0';
    printf("Length = %d\n", len);
    printf("Line: %s\n", buf);
    free(buf);
    return 0;
}
```
```test
=== input
hello world
=== output
Length = 11
Line: hello world
```
```test
=== input
The quick brown fox jumps
=== output
Length = 25
Line: The quick brown fox jumps
```
```test
=== input
a
=== output
Length = 1
Line: a
```
```hint
Loop with `while ((ch = getchar()) != EOF && ch != '\n')`.
```
```hint
Before storing a character at `buf[len]`, make sure `len + 1 < cap` (one spare byte for '\0'); otherwise double `cap` and realloc.
```

# Problem: Remove duplicates and shrink
id: dyn-remove-duplicates
difficulty: medium
source: CSE103 Task Sheet - Dynamic Memory Allocation #5

Read n integers into a dynamic array. Remove duplicates, keeping the **first occurrence** of each value and preserving order. Then shrink the array to its new size with `realloc` and print the new size and the elements.

**Input:** first line n (1 ≤ n ≤ 100); second line n integers.
**Output:**
`New size = K`
the K remaining elements on one line separated by single spaces.

```c starter
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i, j, k = 0;
    int *a;
    scanf("%d", &n);
    // read, remove duplicates in place, shrink with realloc, print
    return 0;
}
```
```c solution
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i, j, k = 0;
    int *a, *tmp;
    scanf("%d", &n);
    a = (int *)malloc(n * sizeof(int));
    if (a == NULL) return 1;
    for (i = 0; i < n; i++) scanf("%d", &a[i]);

    for (i = 0; i < n; i++) {
        int dup = 0;
        for (j = 0; j < k; j++) {
            if (a[j] == a[i]) {
                dup = 1;
                break;
            }
        }
        if (!dup) {
            a[k] = a[i];
            k++;
        }
    }

    tmp = (int *)realloc(a, k * sizeof(int));
    if (tmp == NULL) { free(a); return 1; }
    a = tmp;

    printf("New size = %d\n", k);
    for (i = 0; i < k; i++) {
        if (i > 0) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
    free(a);
    return 0;
}
```
```test
=== input
7
1 2 2 3 1 4 4
=== output
New size = 4
1 2 3 4
```
```test
=== input
3
5 5 5
=== output
New size = 1
5
```
```test
=== input
3
3 1 2
=== output
New size = 3
3 1 2
```
```hint
Keep a count `k` of unique values found so far in `a[0..k-1]`. For each `a[i]`, search `a[0..k-1]`; if not found, copy it to `a[k]` and increase `k`.
```
```hint
Finally `realloc(a, k * sizeof(int))` to shrink.
```

# Problem: Dynamic student records
id: dyn-students
difficulty: hard
source: CSE103 Task Sheet - Dynamic Memory Allocation #6

Read n student records (name, roll, CGPA) into a **dynamically allocated array of structs**, then read a roll number and search for it.

**Input:** first line n (1 ≤ n ≤ 50); then n lines `name roll cgpa` (name is a single word of at most 40 characters); then one line with the roll number to search.
**Output:** if found `Name: NAME, Roll: ROLL, CGPA: C` (CGPA with 2 decimals), otherwise `Not found`.

```c starter
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    char name[50];
    int roll;
    double cgpa;
} Student;

int main(void) {
    int n, i, key;
    Student *s;
    scanf("%d", &n);
    // allocate n students, read them, search for key, free
    return 0;
}
```
```c solution
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    char name[50];
    int roll;
    double cgpa;
} Student;

int main(void) {
    int n, i, key, found = -1;
    Student *s;
    scanf("%d", &n);
    s = (Student *)malloc(n * sizeof(Student));
    if (s == NULL) return 1;
    for (i = 0; i < n; i++)
        scanf("%s %d %lf", s[i].name, &s[i].roll, &s[i].cgpa);
    scanf("%d", &key);
    for (i = 0; i < n; i++) {
        if (s[i].roll == key) {
            found = i;
            break;
        }
    }
    if (found == -1)
        printf("Not found\n");
    else
        printf("Name: %s, Roll: %d, CGPA: %.2f\n", s[found].name, s[found].roll, s[found].cgpa);
    free(s);
    return 0;
}
```
```test
=== input
3
Rahim 101 3.50
Karim 102 3.75
Salma 103 3.20
102
=== output
Name: Karim, Roll: 102, CGPA: 3.75
```
```test
=== input
3
Rahim 101 3.50
Karim 102 3.75
Salma 103 3.20
999
=== output
Not found
```
```test
=== input
3
Rahim 101 3.50
Karim 102 3.75
Salma 103 3.20
101
=== output
Name: Rahim, Roll: 101, CGPA: 3.50
```
```hint
`s = (Student *)malloc(n * sizeof(Student));` then `s[i].name`, `s[i].roll`, `s[i].cgpa` work like a normal array of structs.
```
```hint
Read the CGPA into a `double` with `%lf`. The name is an array, so no `&` before `s[i].name`.
```

# Problem: Memory leaks - before and after
id: dyn-leak-fix
difficulty: medium
source: CSE103 Task Sheet - Dynamic Memory Allocation #7

A leaky program allocates a block in every round of a loop and never frees it (try it in the visualizer: the Heap fills with unreachable boxes). Write the **fixed** version.

Read n. For each round `i` from 1 to n: allocate an array of `i` ints with `malloc`, fill it with `1, 2, ..., i`, print the sum of the array, and **free the array before the next round**. After the loop print a final line.

**Input:** one integer n (1 ≤ n ≤ 20).
**Output:** n lines `Round i: sum = S`, then `All memory freed`.

```c starter
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i, j, sum;
    int *p;
    scanf("%d", &n);
    for (i = 1; i <= n; i++) {
        // allocate i ints, fill 1..i, sum, print, then free
    }
    printf("All memory freed\n");
    return 0;
}
```
```c solution
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i, j, sum;
    int *p;
    scanf("%d", &n);
    for (i = 1; i <= n; i++) {
        p = (int *)malloc(i * sizeof(int));
        if (p == NULL) return 1;
        sum = 0;
        for (j = 0; j < i; j++) {
            p[j] = j + 1;
            sum += p[j];
        }
        printf("Round %d: sum = %d\n", i, sum);
        free(p);
        p = NULL;
    }
    printf("All memory freed\n");
    return 0;
}
```
```test
=== input
3
=== output
Round 1: sum = 1
Round 2: sum = 3
Round 3: sum = 6
All memory freed
```
```test
=== input
1
=== output
Round 1: sum = 1
All memory freed
```
```test
=== input
5
=== output
Round 1: sum = 1
Round 2: sum = 3
Round 3: sum = 6
Round 4: sum = 10
Round 5: sum = 15
All memory freed
```
```hint
Put `free(p);` at the end of the loop body so that every round releases its own block.
```
```hint
Run it in the visualizer: when the program finishes, the Heap area should be empty.
```

# Problem: malloc vs calloc
id: dyn-malloc-vs-calloc
difficulty: easy
source: CSE103 Task Sheet - Dynamic Memory Allocation #8

Read n. Allocate one array of n ints with `calloc` and print its elements (they are all zero). Then allocate another array of n ints with `malloc`, **fill it first** with the squares of the indices (`i * i`), and print it. Never print malloc'd memory before it is filled. Free both arrays.

**Input:** one integer n (1 ≤ n ≤ 50).
**Output:**
`calloc: ` followed by n values separated by spaces
`malloc (after filling): ` followed by n values separated by spaces

```c starter
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i;
    int *c, *m;
    scanf("%d", &n);
    // calloc c, malloc m, fill m with i*i, print both, free both
    return 0;
}
```
```c solution
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, i;
    int *c, *m;
    scanf("%d", &n);
    c = (int *)calloc(n, sizeof(int));
    m = (int *)malloc(n * sizeof(int));
    if (c == NULL || m == NULL) return 1;

    printf("calloc: ");
    for (i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", c[i]);
    }
    printf("\n");

    for (i = 0; i < n; i++) m[i] = i * i;
    printf("malloc (after filling): ");
    for (i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", m[i]);
    }
    printf("\n");

    free(c);
    free(m);
    return 0;
}
```
```test
=== input
5
=== output
calloc: 0 0 0 0 0
malloc (after filling): 0 1 4 9 16
```
```test
=== input
1
=== output
calloc: 0
malloc (after filling): 0
```
```test
=== input
3
=== output
calloc: 0 0 0
malloc (after filling): 0 1 4
```
```hint
`calloc(n, sizeof(int))` clears the memory to zero. `malloc(n * sizeof(int))` does not - assign every element before printing.
```

# Problem: Join two words on the heap
id: dyn-join-strings
difficulty: medium
source: Lab manual - dynamic memory (strings)

Read two words. Allocate **exactly** enough heap memory to hold both joined together (plus the terminating `'\0'`), build the combined string and print it with its length.

**Input:** two words separated by a space (each at most 50 characters).
**Output:**
`Combined = WORD1WORD2`
`Length = N`

```c starter
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    char a[51], b[51];
    char *s;
    scanf("%s %s", a, b);
    // allocate strlen(a) + strlen(b) + 1 bytes, copy, concatenate, print, free
    return 0;
}
```
```c solution
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    char a[51], b[51];
    char *s;
    scanf("%s %s", a, b);
    s = (char *)malloc(strlen(a) + strlen(b) + 1);
    if (s == NULL) return 1;
    strcpy(s, a);
    strcat(s, b);
    printf("Combined = %s\n", s);
    printf("Length = %d\n", (int)strlen(s));
    free(s);
    return 0;
}
```
```test
=== input
Hello World
=== output
Combined = HelloWorld
Length = 10
```
```test
=== input
a b
=== output
Combined = ab
Length = 2
```
```test
=== input
data structure
=== output
Combined = datastructure
Length = 13
```
```hint
Do not forget the `+ 1` for the terminating '\0'.
```
```hint
`strcpy(s, a);` copies the first word, `strcat(s, b);` appends the second.
```
