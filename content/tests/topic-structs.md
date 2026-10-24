---
id: topic-structs
title: "Topic Test: Structures & Unions"
group: topic
lesson: structs
order: 112
duration: 30
covers: Structure members, copying and passing structures, arrays of structures, dot and arrow operators, unions
summary: A short 30-minute test on structures and unions with four trace-the-output questions, two find-the-bug questions and two coding problems.
---

# Question: Struct by value versus by pointer
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

struct S {
    int v;
};

void bumpV(struct S s) {
    s.v++;
}

void bumpP(struct S *s) {
    s->v += 10;
}

int main(void) {
    struct S a = {1};
    bumpV(a);
    printf("%d ", a.v);
    bumpP(&a);
    printf("%d", a.v);
    return 0;
}
~~~
- [ ] 2 12
- [ ] 2 11
- [x] 1 11
- [ ] 1 1
> A struct is passed by value like an int, so bumpV changes only its own copy. bumpP receives the address, so `s->v += 10` changes the original: 1 + 10 = 11.
```

# Question: Array member is copied too
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

struct A {
    int v[3];
};

int main(void) {
    struct A a = {{1, 2, 3}};
    struct A b = a;
    b.v[0] = 99;
    printf("%d %d", a.v[0], b.v[0]);
    return 0;
}
~~~
- [ ] 99 99
- [x] 1 99
- [ ] 99 1
- [ ] 1 1
> Assigning a structure copies all its members, including an array member, element by element. So b has its own array and a is not affected.
```

# Question: Size and members of a union
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

union Data {
    char c;
    int i;
    double d;
};

int main(void) {
    union Data u;
    u.i = 1000;
    u.c = 'Z';
    printf("%d %c", (int)sizeof(u), u.c);
    return 0;
}
~~~
- [ ] 13 Z
- [ ] 4 Z
- [x] 8 Z
- [ ] 8 1000
> All members of a union share the same memory, so its size is the size of the largest member (double = 8). The last member written (c) holds a valid value: Z.
```

# Question: Array of structures and a pointer
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

struct P {
    int x, y;
};

int main(void) {
    struct P pts[3] = {{1, 2}, {3, 4}, {5, 6}};
    struct P *p = pts;
    p++;
    p->x += 10;
    (p + 1)->y *= 2;
    printf("%d %d %d", pts[1].x, p->y, pts[2].y);
    return 0;
}
~~~
- [ ] 11 4 12
- [x] 13 4 12
- [ ] 13 2 12
- [ ] 13 4 6
> After p++ it points at pts[1]. `p->x += 10` makes pts[1].x = 13. `(p + 1)` is pts[2], so its y becomes 12. p->y is still 4.
```

# Question: Comparing structures
marks: 2

```quiz
What is wrong with this code?
~~~
struct Point { int x, y; };
struct Point a = {1, 2}, b = {1, 2};
if (a == b)
    printf("same");
~~~
- [ ] Nothing, it prints "same"
- [ ] The braces cannot initialise a struct
- [x] Structures cannot be compared with ==; compare the members one by one
- [ ] `a == b` is only allowed when both are pointers
> C has no built-in == for structures. Write `a.x == b.x && a.y == b.y` (or a helper function).
```

# Question: Dot or arrow
marks: 2

```quiz
Given `struct Student s; struct Student *p = &s;`, which expression is **not** a valid way to read the age member?
- [ ] `s.age`
- [ ] `p->age`
- [ ] `(*p).age`
- [x] `p.age`
> `.` works on a structure variable, `->` works on a pointer to a structure, and `(*p).age` is the long form of `p->age`. `p.age` is an error because p is a pointer.
```

# Problem: Closest point to the origin
id: topic-structs-closest-point
difficulty: easy
marks: 6
source: Original (topic test)

Define `struct Point { int x, y; }`. Read **n** points into an array of structures and print the point that is closest to the origin (0, 0), i.e. with the smallest value of `x*x + y*y`. If several points tie, print the one that appears first.

**Input:** n (1 ≤ n ≤ 10), then n lines each with two integers x y (absolute values up to 1000).
**Output:** `(x, y)`

```c starter
#include <stdio.h>

struct Point {
    int x, y;
};

int main(void) {
    struct Point p[10];
    int n, i;
    scanf("%d", &n);
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

struct Point {
    int x, y;
};

int main(void) {
    struct Point p[10];
    int n, i, best = 0;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d %d", &p[i].x, &p[i].y);
    for (i = 1; i < n; i++) {
        if (p[i].x * p[i].x + p[i].y * p[i].y <
            p[best].x * p[best].x + p[best].y * p[best].y)
            best = i;
    }
    printf("(%d, %d)\n", p[best].x, p[best].y);
    return 0;
}
```

```test
=== input
3
3 4
-1 2
5 0
=== output
(-1, 2)
```

```test
=== input
1
0 0
=== output
(0, 0)
```

```test
=== input
2
2 1
-1 2
=== output
(2, 1)
```

```test
=== input
4
10 10
-3 -3
3 3
0 4
=== output
(0, 4)
```

```hint
Read each point with `scanf("%d %d", &p[i].x, &p[i].y);`. Keep the index of the best point so far.
```

```hint
Compare squared distances (no need for sqrt). Use `<`, not `<=`, so that on a tie the earlier point stays.
```

# Problem: Fraction calculator
id: topic-structs-fractions
difficulty: medium
marks: 8
source: Original (topic test)

Define `struct Frac { int num, den; }` and write these functions:

- `struct Frac reduce(struct Frac f)` divides both parts by their greatest common divisor,
- `struct Frac add(struct Frac a, struct Frac b)` returns the reduced sum,
- `struct Frac mul(struct Frac a, struct Frac b)` returns the reduced product.

Read two fractions and print their sum and product in lowest terms. All numerators and denominators are positive.

**Input:** four integers `n1 d1 n2 d2` (each between 1 and 100).
**Output:** two lines:

```
Sum = n/d
Product = n/d
```

```c starter
#include <stdio.h>

struct Frac {
    int num, den;
};

struct Frac reduce(struct Frac f) {
    // your code here
}

struct Frac add(struct Frac a, struct Frac b) {
    // your code here
}

struct Frac mul(struct Frac a, struct Frac b) {
    // your code here
}

int main(void) {
    struct Frac a, b, s, p;
    scanf("%d %d %d %d", &a.num, &a.den, &b.num, &b.den);
    s = add(a, b);
    p = mul(a, b);
    printf("Sum = %d/%d\n", s.num, s.den);
    printf("Product = %d/%d\n", p.num, p.den);
    return 0;
}
```

```c solution
#include <stdio.h>

struct Frac {
    int num, den;
};

int gcd(int a, int b) {
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    return a;
}

struct Frac reduce(struct Frac f) {
    int g = gcd(f.num, f.den);
    f.num /= g;
    f.den /= g;
    return f;
}

struct Frac add(struct Frac a, struct Frac b) {
    struct Frac r;
    r.num = a.num * b.den + b.num * a.den;
    r.den = a.den * b.den;
    return reduce(r);
}

struct Frac mul(struct Frac a, struct Frac b) {
    struct Frac r;
    r.num = a.num * b.num;
    r.den = a.den * b.den;
    return reduce(r);
}

int main(void) {
    struct Frac a, b, s, p;
    scanf("%d %d %d %d", &a.num, &a.den, &b.num, &b.den);
    s = add(a, b);
    p = mul(a, b);
    printf("Sum = %d/%d\n", s.num, s.den);
    printf("Product = %d/%d\n", p.num, p.den);
    return 0;
}
```

```test
=== input
1 2 1 3
=== output
Sum = 5/6
Product = 1/6
```

```test
=== input
1 2 1 2
=== output
Sum = 1/1
Product = 1/4
```

```test
=== input
3 4 5 6
=== output
Sum = 19/12
Product = 5/8
```

```test
=== input
2 4 2 6
=== output
Sum = 5/6
Product = 1/6
```

```hint
Sum: `num = a.num*b.den + b.num*a.den`, `den = a.den*b.den`. Product: multiply numerators and denominators. Then call `reduce`.
```

```hint
`reduce` needs a gcd (Euclid's loop). A structure parameter is a copy, so you may change `f.num` and `f.den` and return `f`.
```
