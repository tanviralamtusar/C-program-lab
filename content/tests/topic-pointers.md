---
id: topic-pointers
title: "Topic Test: Pointers"
group: topic
lesson: pointers
order: 111
duration: 30
covers: Address and dereference operators, call by reference, pointer arithmetic, *p++, pointers and strings, dangling and uninitialised pointers
summary: A short 30-minute test on pointers with four trace-the-output questions, two find-the-bug questions and two coding problems.
---

# Question: Reassigning a pointer
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

int main(void) {
    int a = 5, b = 10;
    int *p = &a, *q = &b;
    *p = *q + 1;
    q = p;
    *q += 2;
    printf("%d %d %d", a, b, *q);
    return 0;
}
~~~
- [ ] 11 10 10
- [ ] 13 12 13
- [x] 13 10 13
- [ ] 11 10 13
> `*p = *q + 1` makes a = 11. `q = p` makes q point at a (b is untouched), so `*q += 2` makes a = 13. So a = 13, b = 10, *q = 13.
```

# Question: Swap by value and by address
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

void swapV(int x, int y) {
    int t = x;
    x = y;
    y = t;
}

void swapP(int *x, int *y) {
    int t = *x;
    *x = *y;
    *y = t;
}

int main(void) {
    int a = 1, b = 2;
    swapV(a, b);
    printf("%d %d ", a, b);
    swapP(&a, &b);
    printf("%d %d", a, b);
    return 0;
}
~~~
- [ ] 2 1 1 2
- [ ] 2 1 2 1
- [x] 1 2 2 1
- [ ] 1 2 1 2
> swapV swaps copies, so a and b are unchanged. swapP swaps the values stored at the addresses, so a and b really exchange.
```

# Question: *p++ versus (*p)++
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

int main(void) {
    int a[] = {3, 6, 9, 12};
    int *p = a;
    printf("%d ", *p++);
    printf("%d ", *p);
    printf("%d ", (*p)++);
    printf("%d ", *p);
    printf("%d", a[1]);
    return 0;
}
~~~
- [ ] 3 6 7 7 7
- [ ] 3 3 6 7 7
- [x] 3 6 6 7 7
- [ ] 3 6 6 6 7
> `*p++` yields 3 and then moves p to a[1]. `(*p)++` yields 6 and then increments the element itself, so a[1] becomes 7 and p still points at it.
```

# Question: Pointer into a string
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

int main(void) {
    char s[] = "pointer";
    char *p = s + 2;
    printf("%c %s %d", *p, p + 3, (int)(p - s));
    return 0;
}
~~~
- [ ] o ter 2
- [ ] i ter 2
- [x] i er 2
- [ ] i er 4
> s + 2 points at 'i' (index 2). p + 3 is s + 5, so %s prints the rest of the string from there: "er". Subtracting two pointers gives the number of elements between them: 2.
```

# Question: Uninitialised pointer
marks: 2

```quiz
What is wrong with this code?
~~~
int *p;
*p = 10;
~~~
- [ ] Nothing, p is automatically set to NULL
- [ ] `10` cannot be stored through a pointer
- [x] p holds no valid address, so writing through it is undefined behaviour
- [ ] The first line must be `int p*;`
> A local pointer is not initialised. Make it point at real storage first, for example `int x; int *p = &x;`, before dereferencing.
```

# Question: Returning a local address
marks: 2

```quiz
What is the problem with this function?
~~~
int *makeValue(void) {
    int v = 42;
    return &v;
}
~~~
- [ ] A function cannot return a pointer
- [ ] `&v` must be written `*v`
- [x] v is destroyed when the function returns, so the returned pointer dangles
- [ ] v must be declared `const`
> The local variable v lives only during the call. Using the returned pointer afterwards is undefined behaviour. Return a value, or use a static variable or heap memory instead.
```

# Problem: Rotate three values
id: topic-pointers-rotate3
difficulty: easy
marks: 6
source: Original (topic test)

Write a function `void rotate(int *a, int *b, int *c)` that rotates the three values to the left: after the call, **a** holds the old value of **b**, **b** holds the old value of **c**, and **c** holds the old value of **a**. Read three integers, call the function with their addresses and print the result.

**Input:** three integers.
**Output:** the three values after rotation, separated by single spaces.

```c starter
#include <stdio.h>

void rotate(int *a, int *b, int *c) {
    // your code here
}

int main(void) {
    int x, y, z;
    scanf("%d %d %d", &x, &y, &z);
    rotate(&x, &y, &z);
    printf("%d %d %d\n", x, y, z);
    return 0;
}
```

```c solution
#include <stdio.h>

void rotate(int *a, int *b, int *c) {
    int t = *a;
    *a = *b;
    *b = *c;
    *c = t;
}

int main(void) {
    int x, y, z;
    scanf("%d %d %d", &x, &y, &z);
    rotate(&x, &y, &z);
    printf("%d %d %d\n", x, y, z);
    return 0;
}
```

```test
=== input
1 2 3
=== output
2 3 1
```

```test
=== input
5 5 9
=== output
5 9 5
```

```test
=== input
-1 0 7
=== output
0 7 -1
```

```hint
Save the old value of `*a` in a temporary variable before overwriting it.
```

```hint
Order: `t = *a; *a = *b; *b = *c; *c = t;`
```

# Problem: Array statistics through pointers
id: topic-pointers-array-stats
difficulty: medium
marks: 8
source: Original (topic test)

Write a function `void stats(int *arr, int n, int *sum, int *maxIdx, int *evens)` that computes, in one pass, the sum of the **n** elements, the index of the (first) largest element and the number of even elements, and returns them through the three output pointers. Inside `stats` walk the array with a pointer (`*(arr + i)` or `*p++`); do not use `arr[i]`.

**Input:** n (1 ≤ n ≤ 50), then n integers.
**Output:** three lines:

```
Sum = <sum>
Max = <largest value> at index <index>
Evens = <count of even numbers>
```

```c starter
#include <stdio.h>

void stats(int *arr, int n, int *sum, int *maxIdx, int *evens) {
    // your code here
}

int main(void) {
    int a[50], n, i, sum, maxIdx, evens;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);
    stats(a, n, &sum, &maxIdx, &evens);
    printf("Sum = %d\n", sum);
    printf("Max = %d at index %d\n", a[maxIdx], maxIdx);
    printf("Evens = %d\n", evens);
    return 0;
}
```

```c solution
#include <stdio.h>

void stats(int *arr, int n, int *sum, int *maxIdx, int *evens) {
    int i;
    *sum = 0;
    *maxIdx = 0;
    *evens = 0;
    for (i = 0; i < n; i++) {
        *sum += *(arr + i);
        if (*(arr + i) > *(arr + *maxIdx))
            *maxIdx = i;
        if (*(arr + i) % 2 == 0)
            (*evens)++;
    }
}

int main(void) {
    int a[50], n, i, sum, maxIdx, evens;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);
    stats(a, n, &sum, &maxIdx, &evens);
    printf("Sum = %d\n", sum);
    printf("Max = %d at index %d\n", a[maxIdx], maxIdx);
    printf("Evens = %d\n", evens);
    return 0;
}
```

```test
=== input
5
3 8 2 8 5
=== output
Sum = 26
Max = 8 at index 1
Evens = 3
```

```test
=== input
1
-4
=== output
Sum = -4
Max = -4 at index 0
Evens = 1
```

```test
=== input
4
-3 -1 -7 -1
=== output
Sum = -12
Max = -1 at index 1
Evens = 0
```

```test
=== input
6
2 4 6 8 10 12
=== output
Sum = 42
Max = 12 at index 5
Evens = 6
```

```hint
Set `*sum`, `*maxIdx` and `*evens` to starting values (0) first, then update them inside the loop with `*sum += ...`.
```

```hint
Because `*evens++` would move the pointer instead of counting, write `(*evens)++` or `*evens += 1`. Remember `-4 % 2` is 0 in C, so negative evens count too.
```
