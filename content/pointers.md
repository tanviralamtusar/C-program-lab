---
id: pointers
title: Pointers
order: 11
summary: Addresses, pointer variables, NULL, call by reference, pointers with arrays and strings, pointer arithmetic, pointer to pointer and returning results through pointers.
---

# Step: Memory addresses and the & operator

Every variable lives somewhere in the computer's memory. Memory is like a long street of numbered boxes (bytes). A variable occupies one or more boxes, and the number of its first box is its **address**.

The **address-of operator `&`** gives the address of a variable. To print an address use `%p` and cast to `void *`.

```c run
#include <stdio.h>

int main(void) {
    int x = 42;
    printf("Value of x   : %d\n", x);
    printf("Address of x : %p\n", (void *)&x);
    return 0;
}
```
```output
ADDRESS-DEPENDENT
```

The address (something like `0x7ffc...`) will be different on every computer and every run - only the *value* 42 is predictable. That is why we usually do not care about the actual number; we care about **which variable it points to**.

You have already used `&` before: in `scanf("%d", &x)` we pass the *address* of `x` so that `scanf` knows where to store the number.

The sizes are fixed in this course's interpreter: an `int` takes 4 bytes and an address (pointer) takes 8 bytes.

```c run
#include <stdio.h>

int main(void) {
    int x = 42;
    printf("sizeof(int)   = %d\n", (int)sizeof(x));
    printf("sizeof(int *) = %d\n", (int)sizeof(&x));
    return 0;
}
```
```output
sizeof(int)   = 4
sizeof(int *) = 8
```

> **Tip:** Press **Visualize** on any pointer program. Instead of numbers, the visualizer draws an **arrow** from the pointer to the variable it refers to. That arrow is the whole idea of a pointer.

### Common mistakes

- Printing an address with `%d`. Use `%p` and cast: `(void *)&x`.
- Forgetting the `&` in `scanf`: `scanf("%d", x)` passes the *value* of `x` instead of its address.

```quiz
Which operator gives the address of a variable `x`?
- [ ] `*x`
- [x] `&x`
- [ ] `x&`
- [ ] `#x`
> `&x` is the address-of operator.
```

# Step: Pointer variables and the * operator

A **pointer** is a variable that stores an address. Declare it with `*`:

```c
int x = 10;
int *p = &x;    /* p holds the address of x: "p points to x" */
```

Two different uses of `*` - do not mix them up:

- In a **declaration** (`int *p`), `*` means "p is a pointer to int".
- In an **expression** (`*p`), `*` is the **dereference** operator: "the variable p points to". You can read it and also **write** to it.

```c run
#include <stdio.h>

int main(void) {
    int x = 10;
    int *p = &x;

    printf("x = %d\n", x);
    printf("*p = %d\n", *p);
    printf("p == &x ? %d\n", p == &x);

    *p = 25;                 /* changes x through the pointer */
    printf("x = %d\n", x);

    (*p)++;                  /* x becomes 26 */
    printf("x = %d\n", x);
    return 0;
}
```
```output
x = 10
*p = 10
p == &x ? 1
x = 25
x = 26
```

> **Tip:** Visualize this. After `int *p = &x;` you will see an arrow from `p` to the box `x`. When `*p = 25` runs, the value inside `x`'s box changes even though we never wrote `x = ...`.

### Common mistakes

- `int *p = 10;` - you cannot assign a plain number to a pointer. Assign an address: `p = &x;`.
- Declaring `int *a, b;` expecting two pointers: only `a` is a pointer, `b` is a plain `int`.
- Using a pointer before giving it an address (an **uninitialized pointer** points to garbage). Always initialize: to `&something` or to `NULL`.

```quiz
What is printed?
~~~
int x = 5;
int *p = &x;
*p = *p + 3;
printf("%d", x);
~~~
- [ ] 5
- [x] 8
- [ ] 3
- [ ] The address of x
> `*p` is x itself, so `*p = *p + 3` makes x equal to 8.
```

```quiz
In `int *p = &x;`, what does the `*` mean?
- [ ] Multiply
- [ ] Dereference: the value at p
- [x] p is a pointer to int
- [ ] Address of p
> In a declaration `*` just says "p is a pointer". In expressions like `*p` it dereferences.
```

# Step: NULL pointers

Sometimes a pointer has nothing to point at yet. We give it the special value **`NULL`** ("points to nothing"). Dereferencing `NULL` is an error - the program crashes (the interpreter reports a runtime error). So **check before you dereference**.

```c run
#include <stdio.h>

int main(void) {
    int x = 5;
    int *p = NULL;

    if (p == NULL)
        printf("p points to nothing\n");

    p = &x;
    if (p != NULL)
        printf("now *p = %d\n", *p);

    return 0;
}
```
```output
p points to nothing
now *p = 5
```

`NULL` counts as false in a condition, so `if (p)` means "if p points to something" and `if (!p)` means "if p is NULL".

> **Warning:** Never write `*p` while `p` is `NULL` or uninitialized. In the visualizer a NULL pointer is shown with no arrow.

### Common mistakes

- Leaving a pointer uninitialized: `int *p; *p = 5;` writes to a random place.
- Writing `if (p = NULL)` (assignment) instead of `if (p == NULL)`.

```quiz
Which code is safe?
- [ ] `int *p = NULL; printf("%d", *p);`
- [ ] `int *p; *p = 3;`
- [x] `int x = 3; int *p = &x; if (p != NULL) printf("%d", *p);`
- [ ] `int *p = 0; *p = 3;`
> Only the third option points to a real variable and also checks the pointer first. The others dereference NULL (`0` as a pointer is also NULL) or an uninitialized pointer.
```

# Step: Call by value, call by reference and swap

C passes arguments **by value**: the function receives a *copy*. Changing the copy does not change the caller's variable.

To let a function modify the caller's variable, pass its **address** and dereference inside the function. This is **call by reference** (done with pointers).

```c run
#include <stdio.h>

void addTenValue(int n) {
    n = n + 10;                 /* changes only the copy */
}

void addTenRef(int *n) {
    *n = *n + 10;               /* changes the caller's variable */
}

int main(void) {
    int a = 5;
    addTenValue(a);
    printf("after value call: a = %d\n", a);
    addTenRef(&a);
    printf("after reference call: a = %d\n", a);
    return 0;
}
```
```output
after value call: a = 5
after reference call: a = 15
```

The classic example is **swap**:

```c run
#include <stdio.h>

void swap(int *x, int *y) {
    int temp = *x;
    *x = *y;
    *y = temp;
}

int main(void) {
    int a = 3, b = 7;
    printf("before: a = %d, b = %d\n", a, b);
    swap(&a, &b);
    printf("after:  a = %d, b = %d\n", a, b);
    return 0;
}
```
```output
before: a = 3, b = 7
after:  a = 7, b = 3
```

> **Tip:** Visualize the swap. Inside `swap`, the frame has two arrows, `x` -> `a` and `y` -> `b`, pointing back into `main`'s frame. Stepping through `*x = *y;` changes boxes in `main`.

### Common mistakes

- A swap written as `void swap(int x, int y)` swaps only copies - nothing changes in `main`.
- Writing `swap(a, b)` instead of `swap(&a, &b)`.
- Writing `x = y` inside `swap` (that moves the arrow, not the values). Use `*x = *y`.

```quiz
What does this print?
~~~
void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }
int main(void) {
    int a = 1, b = 2;
    swap(&a, &b);
    printf("%d %d", a, b);
    return 0;
}
~~~
- [ ] 1 2
- [x] 2 1
- [ ] 2 2
- [ ] 1 1
> The function writes through the addresses of a and b, exchanging their values.
```

```quiz
Why does `void f(int n) { n = 99; }` not change the caller's variable?
- [ ] Because n is a global variable
- [x] Because the function works on a copy of the argument
- [ ] Because 99 is too large
- [ ] Because void functions cannot assign
> Arguments are passed by value, so n is a separate copy that disappears when the function returns.
```

# Step: Pointers and arrays

The name of an array, used in an expression, becomes a **pointer to its first element**: `a` is the same as `&a[0]`. And indexing is really pointer arithmetic: `a[i]` means `*(a + i)`.

```c run
#include <stdio.h>

int main(void) {
    int a[5] = {10, 20, 30, 40, 50};
    int *p = a;                       /* same as &a[0] */

    printf("*p = %d\n", *p);
    printf("*(p + 2) = %d\n", *(p + 2));
    printf("p[3] = %d\n", p[3]);

    p++;                              /* move to the next int */
    printf("after p++, *p = %d\n", *p);
    printf("a + 4 is %d elements after a\n", (int)((a + 4) - a));
    return 0;
}
```
```output
*p = 10
*(p + 2) = 30
p[3] = 40
after p++, *p = 20
a + 4 is 4 elements after a
```

Walking through an array with a pointer:

```c run
#include <stdio.h>

int main(void) {
    int a[5] = {10, 20, 30, 40, 50};
    int *p;
    int sum = 0;

    for (p = a; p < a + 5; p++)
        sum += *p;

    printf("sum = %d\n", sum);
    printf("sizeof(a) = %d\n", (int)sizeof(a));
    printf("sizeof(p) = %d\n", (int)sizeof(p));
    return 0;
}
```
```output
sum = 150
sizeof(a) = 20
sizeof(p) = 8
```

`sizeof(a)` is the size of the *whole array* (5 x 4 = 20 bytes) but `sizeof(p)` is just the size of a pointer. That is also why an array passed to a function (`void f(int a[])`) really arrives as a pointer: the function cannot know its length, so pass `n` separately.

> **Tip:** Visualize the loop. The arrow `p` slides along the cells of the array from `a[0]` to `a[4]`.

### Common mistakes

- Treating `a` and `p` as identical in every way: you can write `p++` but not `a++` (an array name is not a variable you can move).
- Using `sizeof(arr)` inside a function that received the array - it gives the pointer size, not the array size.

```quiz
What is printed?
~~~
int a[] = {5, 6, 7, 8};
int *p = a + 1;
printf("%d", *p + *(p + 2));
~~~
- [ ] 13
- [x] 14
- [ ] 12
- [ ] 21
> p points to a[1] = 6. p + 2 points to a[3] = 8. 6 + 8 = 14.
```

```quiz
`a[i]` is exactly the same as:
- [ ] `*a + i`
- [x] `*(a + i)`
- [ ] `&a + i`
- [ ] `a * i`
> Indexing is defined as dereferencing the pointer a moved forward by i elements.
```

# Step: Pointer arithmetic

You can add or subtract an integer to a pointer, and subtract two pointers of the same array:

- `p + 1` points to the **next element** (the address moves forward by `sizeof` of the element type - 4 bytes for `int`, 1 for `char`, 8 for `double`).
- `p - 1` points to the previous element.
- `q - p` gives the **number of elements** between two pointers.
- Pointers can be compared with `<`, `>`, `==`.

You cannot add two pointers, or multiply/divide a pointer.

A nice use: reverse an array with two pointers moving towards each other.

```c run
#include <stdio.h>

int main(void) {
    int a[6] = {1, 2, 3, 4, 5, 6};
    int *first = a;
    int *last = a + 5;
    int i;

    printf("distance = %d\n", (int)(last - first));

    while (first < last) {
        int t = *first;
        *first = *last;
        *last = t;
        first++;
        last--;
    }

    for (i = 0; i < 6; i++) {
        if (i > 0) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");
    return 0;
}
```
```output
distance = 5
6 5 4 3 2 1
```

> **Tip:** Visualize and watch the two arrows `first` and `last` move toward each other until they meet in the middle.

### Common mistakes

- Moving a pointer outside the array (before the first or after one-past-the-last element) and then dereferencing it. That is undefined behavior; the interpreter will report an out-of-bounds error.
- Forgetting the pointer arithmetic is in **elements**, not bytes: `p + 1` for an `int *` is not "+1 byte".

```quiz
Given `int a[10]; int *p = a + 2; int *q = a + 7;`, what is `q - p`?
- [ ] 20
- [x] 5
- [ ] 9
- [ ] 2
> Pointer subtraction counts elements: 7 - 2 = 5.
```

# Step: Pointers and strings

A string is a `char` array ending with `'\0'`. A `char *` pointer is a natural way to walk through it until the `'\0'` is reached.

```c run
#include <stdio.h>

int main(void) {
    char s[] = "hello";
    char *p = s;
    char *start, *end;
    int len;

    while (*p != '\0')
        p++;
    len = (int)(p - s);
    printf("Length = %d\n", len);

    start = s;
    end = s + len - 1;
    while (start < end) {
        char t = *start;
        *start = *end;
        *end = t;
        start++;
        end--;
    }
    printf("Reversed = %s\n", s);
    return 0;
}
```
```output
Length = 5
Reversed = olleh
```

A pointer can also point into the **middle** of a string: `s + 1` is the string without its first character.

```c run
#include <stdio.h>

int main(void) {
    char *animals[3] = {"cat", "dog", "bird"};
    int i;
    for (i = 0; i < 3; i++)
        printf("%s: first=%c rest=%s\n", animals[i], *animals[i], animals[i] + 1);
    return 0;
}
```
```output
cat: first=c rest=at
dog: first=d rest=og
bird: first=b rest=ird
```

`char *animals[3]` is an **array of pointers**, each pointing to a string literal.

> **Warning:** A string written as `char *msg = "hello";` is a literal that you must **not modify** (`msg[0] = 'H';` is undefined behavior). If you want to change the characters, use an array: `char msg[] = "hello";`.

### Common mistakes

- Walking past the `'\0'` and reading garbage.
- Comparing strings with `==` (it compares addresses). Use `strcmp`.
- Modifying a string literal through a `char *`.

```quiz
What is printed?
~~~
char s[] = "cat";
char *p = s;
p++;
printf("%s", p);
~~~
- [ ] cat
- [ ] c
- [x] at
- [ ] a
> After `p++`, p points to 'a' and `%s` prints from there up to the '\0': "at".
```

# Step: Pointer to pointer

A pointer is itself a variable, so it has an address too. A **pointer to pointer** (`int **pp`) stores the address of a pointer.

```c run
#include <stdio.h>

int main(void) {
    int x = 5;
    int *p = &x;
    int **pp = &p;

    printf("x = %d, *p = %d, **pp = %d\n", x, *p, **pp);

    **pp = 9;                      /* changes x */
    printf("x = %d\n", x);
    return 0;
}
```
```output
x = 5, *p = 5, **pp = 5
x = 9
```

Read the chain: `pp` -> `p` -> `x`. One `*` takes you one arrow forward: `*pp` is `p`, and `**pp` is `x`.

Why is this useful? A function can change *where a pointer points* if you give it the **address of the pointer**:

```c run
#include <stdio.h>

void setPtr(int **pp, int *target) {
    *pp = target;
}

int main(void) {
    int a = 1, b = 2;
    int *p = &a;
    setPtr(&p, &b);
    printf("*p = %d\n", *p);
    return 0;
}
```
```output
*p = 2
```

> **Tip:** In the visualizer you will see two arrows in a row. After `setPtr`, the arrow from `p` jumps from `a` to `b`.

### Common mistakes

- Using the wrong number of `*`: `*pp` is an `int *`, not an `int`.
- Passing `&p` to a function that expects `int *` (should expect `int **`).

```quiz
What does this print?
~~~
int x = 1;
int *p = &x;
int **pp = &p;
**pp = 7;
printf("%d", x);
~~~
- [ ] 1
- [x] 7
- [ ] The address of x
- [ ] The address of p
> `**pp` follows two arrows and reaches x, which is set to 7.
```

# Step: Returning results through pointers

A function can `return` only one value. To give back **several** results, pass the addresses of variables and let the function fill them in. These are called **output parameters**.

```c run
#include <stdio.h>

void minMax(int a[], int n, int *min, int *max) {
    int i;
    *min = a[0];
    *max = a[0];
    for (i = 1; i < n; i++) {
        if (a[i] < *min) *min = a[i];
        if (a[i] > *max) *max = a[i];
    }
}

void divMod(int a, int b, int *q, int *r) {
    *q = a / b;
    *r = a % b;
}

int main(void) {
    int arr[5] = {4, 9, 1, 7, 3};
    int lo, hi, q, r;

    minMax(arr, 5, &lo, &hi);
    printf("min = %d, max = %d\n", lo, hi);

    divMod(17, 5, &q, &r);
    printf("17 / 5 = %d remainder %d\n", q, r);
    return 0;
}
```
```output
min = 1, max = 9
17 / 5 = 3 remainder 2
```

> **Warning:** Never return the address of a *local* variable from a function (`return &x;` where x is local). The local variable disappears when the function returns - the pointer would be **dangling**.

### Common mistakes

- Writing `min = a[0];` instead of `*min = a[0];` (that changes the local pointer, not the caller's variable).
- Forgetting the `&` when calling: `minMax(arr, 5, lo, hi)`.

```quiz
Why does `divMod` take `int *q, int *r` instead of returning them?
- [ ] Because C cannot divide integers
- [x] Because a function can return only one value, so extra results are written through pointers
- [ ] Because pointers are faster than int
- [ ] Because main cannot print q and r otherwise
> Output parameters let one function hand back several values.
```

# Problem: Address and value through a pointer
id: ptr-address-value
difficulty: easy
source: CSE103 Task Sheet - Pointers #1

Read an integer, store it in a variable, and create a pointer to it. Print the value of the variable, the value obtained **through the pointer**, and finally the address of the variable.

**Input:** one integer.
**Output (3 lines):**
`Value = V`
`Value via pointer = V`
`Address = ...` (the address will differ on every run, so the judge checks only the first two lines; print it last with `%p`).

```c starter
#include <stdio.h>

int main(void) {
    int num;
    int *ptr;
    scanf("%d", &num);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int num;
    int *ptr;
    scanf("%d", &num);
    ptr = &num;
    printf("Value = %d\n", num);
    printf("Value via pointer = %d\n", *ptr);
    printf("Address = %p\n", (void *)ptr);
    return 0;
}
```
```test
=== input
42
=== output
Value = 42
Value via pointer = 42
```
```test
=== input
-7
=== output
Value = -7
Value via pointer = -7
```
```hint
Set `ptr = &num;`. Use `*ptr` to read the value. Print the address with `%p` and cast it: `(void *)ptr`.
```

# Problem: Call by value vs call by reference
id: ptr-value-vs-ref
difficulty: easy
source: CSE103 Task Sheet - Pointers #2

Write two functions: `byValue(int n)` that adds 10 to its parameter, and `byReference(int *n)` that adds 10 through the pointer. Read an integer, call `byValue` first and print the number, then call `byReference` and print the number again.

**Input:** one integer n.
**Output:**
`By value: X` (unchanged n)
`By reference: Y` (n + 10)

```c starter
#include <stdio.h>

void byValue(int n) {
    // add 10
}

void byReference(int *n) {
    // add 10 through the pointer
}

int main(void) {
    int n;
    scanf("%d", &n);
    byValue(n);
    printf("By value: %d\n", n);
    byReference(&n);
    printf("By reference: %d\n", n);
    return 0;
}
```
```c solution
#include <stdio.h>

void byValue(int n) {
    n = n + 10;
}

void byReference(int *n) {
    *n = *n + 10;
}

int main(void) {
    int n;
    scanf("%d", &n);
    byValue(n);
    printf("By value: %d\n", n);
    byReference(&n);
    printf("By reference: %d\n", n);
    return 0;
}
```
```test
=== input
5
=== output
By value: 5
By reference: 15
```
```test
=== input
-10
=== output
By value: -10
By reference: 0
```
```test
=== input
0
=== output
By value: 0
By reference: 10
```
```hint
`byValue` changes only its own copy. `byReference` must write `*n = *n + 10;`.
```

# Problem: Swap two numbers using pointers
id: ptr-swap
difficulty: easy
source: CSE103 Task Sheet - Pointers #3

Read two integers and swap them with a function `swap(int *a, int *b)`. Print them before and after the swap.

**Input:** two integers a and b.
**Output:**
`Before: a = A, b = B`
`After: a = B, b = A`

```c starter
#include <stdio.h>

void swap(int *x, int *y) {
    // your code here
}

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Before: a = %d, b = %d\n", a, b);
    swap(&a, &b);
    printf("After: a = %d, b = %d\n", a, b);
    return 0;
}
```
```c solution
#include <stdio.h>

void swap(int *x, int *y) {
    int temp = *x;
    *x = *y;
    *y = temp;
}

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Before: a = %d, b = %d\n", a, b);
    swap(&a, &b);
    printf("After: a = %d, b = %d\n", a, b);
    return 0;
}
```
```test
=== input
3 7
=== output
Before: a = 3, b = 7
After: a = 7, b = 3
```
```test
=== input
-1 100
=== output
Before: a = -1, b = 100
After: a = 100, b = -1
```
```test
=== input
5 5
=== output
Before: a = 5, b = 5
After: a = 5, b = 5
```
```hint
Use a temporary variable: `int temp = *x; *x = *y; *y = temp;`.
```

# Problem: Add two numbers using pointers
id: ptr-add
difficulty: easy
source: CSE103 Task Sheet - Pointers #4

Read two integers, make pointers to them and compute the sum using only the pointers (dereference them).

**Input:** two integers.
**Output:** `Sum = S`

```c starter
#include <stdio.h>

int main(void) {
    int a, b, sum;
    int *p, *q;
    scanf("%d %d", &a, &b);
    // your code here
    printf("Sum = %d\n", sum);
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b, sum;
    int *p, *q;
    scanf("%d %d", &a, &b);
    p = &a;
    q = &b;
    sum = *p + *q;
    printf("Sum = %d\n", sum);
    return 0;
}
```
```test
=== input
12 30
=== output
Sum = 42
```
```test
=== input
-5 5
=== output
Sum = 0
```
```test
=== input
-8 -2
=== output
Sum = -10
```
```hint
After `p = &a; q = &b;`, the value of a is `*p` and the value of b is `*q`.
```

# Problem: Length of a string using pointers
id: ptr-strlen
difficulty: easy
source: CSE103 Task Sheet - Pointers #5

Read a word (no spaces) and find its length by moving a `char *` pointer until `'\0'`. Do not use `strlen`.

**Input:** one word of at most 100 characters.
**Output:** `Length = N`

```c starter
#include <stdio.h>

int main(void) {
    char s[101];
    char *p;
    scanf("%s", s);
    p = s;
    // move p to the end, then count
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    char s[101];
    char *p;
    scanf("%s", s);
    p = s;
    while (*p != '\0')
        p++;
    printf("Length = %d\n", (int)(p - s));
    return 0;
}
```
```test
=== input
hello
=== output
Length = 5
```
```test
=== input
a
=== output
Length = 1
```
```test
=== input
programming
=== output
Length = 11
```
```hint
`while (*p != '\0') p++;` stops at the terminating character. The length is `p - s`.
```

# Problem: Reverse a string using pointers
id: ptr-reverse-string
difficulty: medium
source: CSE103 Task Sheet - Pointers #6

Read a word (no spaces) and reverse it **in place** using two pointers, one at the start and one at the end, swapping and moving inwards.

**Input:** one word of at most 100 characters.
**Output:** `Reversed = R`

```c starter
#include <stdio.h>
#include <string.h>

int main(void) {
    char s[101];
    char *start, *end;
    scanf("%s", s);
    start = s;
    end = s + strlen(s) - 1;
    // swap while start < end
    printf("Reversed = %s\n", s);
    return 0;
}
```
```c solution
#include <stdio.h>
#include <string.h>

int main(void) {
    char s[101];
    char *start, *end;
    scanf("%s", s);
    start = s;
    end = s + strlen(s) - 1;
    while (start < end) {
        char t = *start;
        *start = *end;
        *end = t;
        start++;
        end--;
    }
    printf("Reversed = %s\n", s);
    return 0;
}
```
```test
=== input
hello
=== output
Reversed = olleh
```
```test
=== input
a
=== output
Reversed = a
```
```test
=== input
abcd
=== output
Reversed = dcba
```
```hint
Loop `while (start < end)`: swap `*start` and `*end`, then `start++` and `end--`.
```

# Problem: Display array elements using pointers
id: ptr-array-display
difficulty: easy
source: CSE103 Task Sheet - Pointers #7

Read n integers into an array and print them by accessing every element **through a pointer** (no `a[i]` for printing).

**Input:** first line n (1 ≤ n ≤ 50); second line n integers.
**Output:** the elements on one line separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int a[50], n, i;
    int *p;
    scanf("%d", &n);
    for (i = 0; i < n; i++) scanf("%d", &a[i]);
    p = a;
    // print using p
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a[50], n, i;
    int *p;
    scanf("%d", &n);
    for (i = 0; i < n; i++) scanf("%d", &a[i]);
    p = a;
    for (i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", *(p + i));
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
-3
=== output
-3
```
```test
=== input
4
7 7 1 0
=== output
7 7 1 0
```
```hint
`*(p + i)` is the i-th element. Or move the pointer: `*p` then `p++`.
```

# Problem: Pointer to pointer
id: ptr-pointer-to-pointer
difficulty: medium
source: CSE103 Task Sheet - Pointers #8

Read an integer `x`. Create `p` pointing to `x` and `pp` pointing to `p`. Print `x`, `*p` and `**pp`. Then add 1 to `x` using only `**pp` and print the new value of `x`.

**Input:** one integer.
**Output:**
`x = X`
`*p = X`
`**pp = X`
`x after = X+1`

```c starter
#include <stdio.h>

int main(void) {
    int x;
    int *p;
    int **pp;
    scanf("%d", &x);
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int x;
    int *p;
    int **pp;
    scanf("%d", &x);
    p = &x;
    pp = &p;
    printf("x = %d\n", x);
    printf("*p = %d\n", *p);
    printf("**pp = %d\n", **pp);
    **pp = **pp + 1;
    printf("x after = %d\n", x);
    return 0;
}
```
```test
=== input
10
=== output
x = 10
*p = 10
**pp = 10
x after = 11
```
```test
=== input
-1
=== output
x = -1
*p = -1
**pp = -1
x after = 0
```
```hint
`p = &x;` and `pp = &p;`. `*pp` is p, and `**pp` is x itself.
```

# Problem: Minimum and maximum of an array
id: ptr-min-max
difficulty: medium
source: Aptech Practice Problems - Pointers (Lab) #1

Read an array and find its minimum and maximum using a function `void minMax(int *a, int n, int *min, int *max)` that returns both through pointers.

**Input:** first line n (1 ≤ n ≤ 100); second line n integers.
**Output:**
`Min = M`
`Max = X`

```c starter
#include <stdio.h>

void minMax(int *a, int n, int *min, int *max) {
    // your code here
}

int main(void) {
    int a[100], n, i, lo, hi;
    scanf("%d", &n);
    for (i = 0; i < n; i++) scanf("%d", &a[i]);
    minMax(a, n, &lo, &hi);
    printf("Min = %d\n", lo);
    printf("Max = %d\n", hi);
    return 0;
}
```
```c solution
#include <stdio.h>

void minMax(int *a, int n, int *min, int *max) {
    int i;
    *min = a[0];
    *max = a[0];
    for (i = 1; i < n; i++) {
        if (a[i] < *min) *min = a[i];
        if (a[i] > *max) *max = a[i];
    }
}

int main(void) {
    int a[100], n, i, lo, hi;
    scanf("%d", &n);
    for (i = 0; i < n; i++) scanf("%d", &a[i]);
    minMax(a, n, &lo, &hi);
    printf("Min = %d\n", lo);
    printf("Max = %d\n", hi);
    return 0;
}
```
```test
=== input
5
4 9 1 7 3
=== output
Min = 1
Max = 9
```
```test
=== input
1
-5
=== output
Min = -5
Max = -5
```
```test
=== input
6
-3 -8 0 12 12 -8
=== output
Min = -8
Max = 12
```
```hint
Start both `*min` and `*max` at `a[0]`, then compare with every other element.
```

# Problem: Count vowels and consonants using a pointer
id: ptr-vowels
difficulty: medium
source: Aptech Practice Problems - Pointers (Lab) #2

Read a word made of letters only and count its vowels (a, e, i, o, u, in either case) and consonants by walking a pointer over it.

**Input:** one word of at most 100 letters.
**Output:** `Vowels = V, Consonants = C`

```c starter
#include <stdio.h>
#include <ctype.h>

int main(void) {
    char s[101];
    char *p;
    int v = 0, c = 0;
    scanf("%s", s);
    // walk p over s
    printf("Vowels = %d, Consonants = %d\n", v, c);
    return 0;
}
```
```c solution
#include <stdio.h>
#include <ctype.h>

int main(void) {
    char s[101];
    char *p;
    int v = 0, c = 0;
    scanf("%s", s);
    for (p = s; *p != '\0'; p++) {
        char ch = (char)tolower((unsigned char)*p);
        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u')
            v++;
        else
            c++;
    }
    printf("Vowels = %d, Consonants = %d\n", v, c);
    return 0;
}
```
```test
=== input
hello
=== output
Vowels = 2, Consonants = 3
```
```test
=== input
AEIOU
=== output
Vowels = 5, Consonants = 0
```
```test
=== input
rhythm
=== output
Vowels = 0, Consonants = 6
```
```hint
Convert each character to lower case with `tolower`, then compare it with the five vowels.
```

# Problem: Palindrome check using two pointers
id: ptr-palindrome
difficulty: medium
source: Aptech Practice Problems - Pointers #1

Read a word (no spaces) and decide whether it is a palindrome using two pointers that move toward each other.

**Input:** one word of at most 100 lowercase letters.
**Output:** `Palindrome` or `Not palindrome`.

```c starter
#include <stdio.h>
#include <string.h>

int main(void) {
    char s[101];
    char *left, *right;
    int ok = 1;
    scanf("%s", s);
    left = s;
    right = s + strlen(s) - 1;
    // compare while left < right
    if (ok) printf("Palindrome\n");
    else printf("Not palindrome\n");
    return 0;
}
```
```c solution
#include <stdio.h>
#include <string.h>

int main(void) {
    char s[101];
    char *left, *right;
    int ok = 1;
    scanf("%s", s);
    left = s;
    right = s + strlen(s) - 1;
    while (left < right) {
        if (*left != *right) {
            ok = 0;
            break;
        }
        left++;
        right--;
    }
    if (ok) printf("Palindrome\n");
    else printf("Not palindrome\n");
    return 0;
}
```
```test
=== input
level
=== output
Palindrome
```
```test
=== input
pointer
=== output
Not palindrome
```
```test
=== input
x
=== output
Palindrome
```
```test
=== input
abca
=== output
Not palindrome
```
```hint
Compare `*left` and `*right`; if they differ it is not a palindrome. Otherwise move both inwards.
```
