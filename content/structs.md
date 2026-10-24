---
id: structs
title: Structures & Unions
order: 12
summary: Group related data with struct, use typedef, arrays and nesting, pass structs to functions, use -> with pointers, sort records, and compare struct with union.
---

# Step: Why structures? Defining and declaring

An array holds many values of the **same** type. But real things are described by values of **different** types: a student has a *name* (text), a *roll* (int) and a *CGPA* (float). Keeping three separate variables for every student gets messy fast.

A **structure** (`struct`) bundles related variables, called **members** (or fields), into one new type.

```c
struct student {
    char  name[20];
    int   roll;
    float cgpa;
};
```

- `struct student` is now a **type**, like `int`. Writing the definition creates no variable and uses no memory yet.
- Declare variables of that type: `struct student s1, s2;`
- The definition ends with a **semicolon** after the closing brace.

Each variable has its own copy of every member. The visualizer draws a struct as a box with one labelled slot per member.

```c run
#include <stdio.h>
#include <string.h>

struct student {
    char  name[20];
    int   roll;
    float cgpa;
};

int main(void) {
    struct student s1;
    strcpy(s1.name, "Rahim");
    s1.roll = 101;
    s1.cgpa = 3.75f;

    printf("Name: %s\n", s1.name);
    printf("Roll: %d\n", s1.roll);
    printf("CGPA: %.2f\n", s1.cgpa);
    return 0;
}
```
```output
Name: Rahim
Roll: 101
CGPA: 3.75
```

The **dot operator** `.` selects a member: `s1.roll` means "the `roll` member of `s1`". A string member cannot be assigned with `=`, so use `strcpy`.

### Common mistakes

- Forgetting the `;` after the closing `}` of the struct definition.
- Writing `student s1;` instead of `struct student s1;` (unless you used `typedef`, see later).
- Writing `s1.name = "Rahim";` for a `char` array. Use `strcpy(s1.name, "Rahim");`.
- Putting initial values inside the definition (`int roll = 5;` is not allowed inside a struct).

```quiz
What does a struct definition such as `struct student { int roll; float cgpa; };` do by itself?
- [ ] Creates one variable named student
- [x] Creates a new type; no variable (and no data) exists until you declare one
- [ ] Creates an array of two elements
- [ ] Sets roll and cgpa to 0
> The definition only describes the layout. Memory is used when you declare `struct student s1;`.
```

# Step: Accessing members, initialization and copying

Use `variable.member` to read or write a member. You can also initialize a struct when you declare it, with braces listing the values **in member order**:

```c
struct point { int x; int y; };
struct point a = {3, 4};      // x = 3, y = 4
```

If you give fewer values than members, the rest become 0. A whole struct can be copied with `=`: every member is copied (even an array inside it).

```c run
#include <stdio.h>

struct point {
    int x;
    int y;
};

int main(void) {
    struct point a = {3, 4};
    struct point b = a;      // copy all members
    b.x = 10;                // changes only b

    printf("a = (%d, %d)\n", a.x, a.y);
    printf("b = (%d, %d)\n", b.x, b.y);
    return 0;
}
```
```output
a = (3, 4)
b = (10, 4)
```

Members are normal variables, so they can be read with `scanf` (use `&` for numbers, no `&` for a char array):

```c run
#include <stdio.h>

struct book {
    char   title[30];
    int    pages;
    double price;
};

int main(void) {
    struct book b;
    scanf("%s %d %lf", b.title, &b.pages, &b.price);
    printf("%s has %d pages and costs %.2f\n", b.title, b.pages, b.price);
    return 0;
}
```
```input
C_Primer 300 450.5
```
```output
C_Primer has 300 pages and costs 450.50
```

### Common mistakes

- Comparing two structs with `==`. It is not allowed; compare member by member.
- Forgetting `&` before a numeric member in `scanf` (`&b.pages`).
- Putting `&` before a char-array member in `scanf("%s", ...)`. The array name already is an address.

```quiz
After `struct point a = {3, 4}; struct point b = a; b.x = 10;` what is `a.x`?
- [x] 3
- [ ] 10
- [ ] 4
- [ ] It does not compile
> `b = a` copies the values. `a` and `b` are independent boxes afterwards.
```

# Step: typedef: a shorter name for your struct

Writing `struct student` everywhere is tedious. `typedef` gives a type a new name (an alias):

```c
typedef struct {
    int h;
    int m;
} Time;          // now "Time" is the type name

Time t = {9, 5};
```

`typedef` can alias any type, for example `typedef int Score;`. It creates **no new variable and no new type**, only another name. This is the style we use for the rest of the lesson.

```c run
#include <stdio.h>

typedef int Score;

typedef struct {
    int h;
    int m;
} Time;

int main(void) {
    Time start = {9, 5};
    Score best = 95;

    printf("Start: %02d:%02d\n", start.h, start.m);
    printf("Score: %d\n", best);
    return 0;
}
```
```output
Start: 09:05
Score: 95
```

### Common mistakes

- Writing `struct Time t;` when `Time` is an alias of an anonymous struct. Just write `Time t;`.
- Forgetting the semicolon at the end of the `typedef`.

```quiz
After `typedef struct { int h; int m; } Time;` which declaration is valid?
- [ ] struct Time t;
- [x] Time t;
- [ ] typedef Time t;
- [ ] Time = t;
> `Time` is now the name of the type, so `Time t;` declares a variable of that type.
```

# Step: Arrays of structures

One struct holds one record. An **array of structs** holds many records, such as a class of students or items in a shop. Use the index first, then the dot: `items[i].qty`.

```c run
#include <stdio.h>

typedef struct {
    char   name[10];
    int    qty;
    double rate;
} Item;

int main(void) {
    Item items[3] = {
        {"Pen",  10,   5.5},
        {"Book",  2, 120.0},
        {"Bag",   1, 850.0}
    };
    double grand = 0;

    for (int i = 0; i < 3; i++) {
        double total = items[i].qty * items[i].rate;
        printf("%s: %.2f\n", items[i].name, total);
        grand += total;
    }
    printf("Grand total: %.2f\n", grand);
    return 0;
}
```
```output
Pen: 55.00
Book: 240.00
Bag: 850.00
Grand total: 1145.00
```

Reading records works the same way in a loop: `scanf("%s %d %lf", items[i].name, &items[i].qty, &items[i].rate);`

### Common mistakes

- Writing `items.qty` instead of `items[i].qty`.
- Looping to `i <= n` and going out of bounds (the interpreter reports this as a runtime error).

```quiz
Which expression is the quantity of the third item in `Item items[3];`?
- [ ] items.qty[2]
- [ ] items[3].qty
- [x] items[2].qty
- [ ] qty.items[2]
> Index first (counting from 0), then `.member`.
```

# Step: Nested structures

A member of a struct can itself be a struct. This models "has-a" relations: a person *has a* birth date.

```c run
#include <stdio.h>

struct date {
    int day, month, year;
};

struct person {
    char        name[20];
    struct date dob;        // a struct inside a struct
};

int main(void) {
    struct person p = {"Nila", {14, 2, 2003}};

    printf("%s was born on %d/%d/%d\n", p.name, p.dob.day, p.dob.month, p.dob.year);

    p.dob.year = 2004;      // chain the dots to reach inner members
    printf("Corrected year: %d\n", p.dob.year);
    return 0;
}
```
```output
Nila was born on 14/2/2003
Corrected year: 2004
```

Chain the dot operators from outside in: `p.dob.year`. The inner struct type must be defined **before** the struct that uses it.

### Common mistakes

- Defining `struct person` before `struct date` (the compiler does not know `struct date` yet).
- Writing `p.year` instead of `p.dob.year`.

```quiz
Given `struct person p;` with a nested `struct date dob;` member, how do you access the month?
- [ ] p.month
- [ ] dob.month
- [x] p.dob.month
- [ ] p->dob->month
> Go through each level with a dot: person, then dob, then month.
```

# Step: Structures and functions

A struct can be passed to a function and returned from it, just like an `int`. By default it is **passed by value**: the function receives a *copy*, so changing it does not affect the caller's variable.

```c run
#include <stdio.h>

typedef struct {
    int x;
    int y;
} Point;

Point make(int x, int y) {
    Point p = {x, y};
    return p;                 // returns a copy of the whole struct
}

Point addPoints(Point a, Point b) {
    Point c = {a.x + b.x, a.y + b.y};
    return c;
}

void shiftByValue(Point p) {
    p.x += 100;               // changes only the copy
}

void show(Point p) {
    printf("(%d, %d)\n", p.x, p.y);
}

int main(void) {
    Point a = make(1, 2);
    Point b = make(10, 20);
    show(addPoints(a, b));

    shiftByValue(a);
    show(a);                  // unchanged
    return 0;
}
```
```output
(11, 22)
(1, 2)
```

Copying a big struct on every call is wasteful, and a by-value function cannot modify the original. The next step fixes both with pointers.

### Common mistakes

- Expecting a function that takes a struct by value to change the caller's struct.
- Forgetting `return` in a function declared to return a struct.

```quiz
`void shiftByValue(Point p) { p.x += 100; }` is called as `shiftByValue(a);`. What happens to `a.x`?
- [ ] It increases by 100
- [x] It is unchanged
- [ ] It becomes 100
- [ ] Compile error
> The function works on a copy of `a`; the original stays the same.
```

# Step: Pointers to structures and the arrow operator

Pass the **address** of a struct and the function can change the original and avoids copying. For a pointer `p` to a struct, the member is `(*p).x`, and C gives a nicer shortcut: **`p->x`**.

| You have | Use |
|---|---|
| a struct variable `a` | `a.x` |
| a pointer `p` to a struct | `p->x` (same as `(*p).x`) |

```c run
#include <stdio.h>

typedef struct {
    int x;
    int y;
} Point;

void moveBy(Point *p, int dx) {
    p->x += dx;               // changes the caller's struct
}

int main(void) {
    Point a = {1, 2};
    Point *p = &a;

    (*p).x = 5;
    p->y = 7;
    printf("(%d, %d)\n", a.x, a.y);

    moveBy(&a, 10);
    printf("(%d, %d)\n", a.x, a.y);
    return 0;
}
```
```output
(5, 7)
(15, 7)
```

A pointer can also walk an array of structs:

```c run
#include <stdio.h>

typedef struct {
    char name[10];
    int  marks;
} Student;

int main(void) {
    Student cls[2] = {{"Ana", 80}, {"Bob", 65}};
    Student *p;

    for (p = cls; p < cls + 2; p++) {
        printf("%s: %d\n", p->name, p->marks);
    }
    return 0;
}
```
```output
Ana: 80
Bob: 65
```

### Common mistakes

- Using `.` on a pointer (`p.x`) or `->` on a plain struct (`a->x`).
- Writing `*p.x`: `.` binds tighter than `*`, so this means `*(p.x)`. Use `p->x` or `(*p).x`.
- Passing `a` instead of `&a` to a function that expects a pointer.

```quiz
`Point *p = &a;` Which line sets a's x to 9?
- [ ] p.x = 9;
- [x] p->x = 9;
- [ ] *p.x = 9;
- [ ] &p->x = 9;
> `p->x` is shorthand for `(*p).x`.
```

# Step: Sorting an array of structures

To sort records, compare one **key** member (for example the score) but move the **whole struct**. In bubble sort, swap complete structs through a temporary struct variable.

```c run
#include <stdio.h>

typedef struct {
    char name[10];
    int  score;
} Student;

int main(void) {
    Student s[5] = {{"Ana", 72}, {"Ben", 90}, {"Cia", 65}, {"Dev", 88}, {"Eli", 90}};
    int n = 5;

    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (s[j].score < s[j + 1].score) {   // descending by score
                Student tmp = s[j];
                s[j] = s[j + 1];
                s[j + 1] = tmp;
            }
        }
    }

    for (int i = 0; i < n; i++) {
        printf("%s %d\n", s[i].name, s[i].score);
    }
    return 0;
}
```
```output
Ben 90
Eli 90
Dev 88
Ana 72
Cia 65
```

The library function `qsort` does the sorting for you if you supply a **comparison function**. It receives pointers to two elements and returns negative, zero or positive:

```c run
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    char name[10];
    int  score;
} Student;

int byScore(const void *a, const void *b) {
    const Student *x = a;
    const Student *y = b;
    return x->score - y->score;       // ascending
}

int main(void) {
    Student s[3] = {{"Ana", 72}, {"Ben", 90}, {"Cia", 65}};

    qsort(s, 3, sizeof(Student), byScore);

    for (int i = 0; i < 3; i++) {
        printf("%s %d\n", s[i].name, s[i].score);
    }
    return 0;
}
```
```output
Cia 65
Ana 72
Ben 90
```

### Common mistakes

- Swapping only the key member (scores move but names stay): swap the whole struct.
- Wrong comparison direction: `<` gives descending order in the bubble sort above, `>` gives ascending.

```quiz
In a bubble sort of `Student s[]` by score, how do you swap s[j] and s[j+1]?
- [ ] Swap only s[j].score and s[j+1].score
- [x] Student tmp = s[j]; s[j] = s[j+1]; s[j+1] = tmp;
- [ ] s[j] = s[j+1]; s[j+1] = s[j];
- [ ] You cannot assign structs
> Whole structs can be assigned, so use a temporary struct to swap complete records.
```

# Step: Unions versus structures

A **union** looks like a struct, but all its members share the **same memory**. The union is as big as its largest member (rounded up for alignment), and only one member holds a valid value at a time. Writing one member overwrites the others.

```c
union data { int i; float f; char c; };
```

| | struct | union |
|---|---|---|
| Members | each has its own memory | all share one memory |
| Size | at least the sum of members (plus padding) | the largest member (plus padding) |
| Valid values | all members at once | only the member written last |

```c run
#include <stdio.h>

struct sdata { int i; float f; char c; };
union  udata { int i; float f; char c; };

struct A { char c; int n; };          // 3 bytes of padding after c
union  U { char name[10]; int n; };   // rounded up to a multiple of 4
struct B { double d; char c; };       // 7 bytes of padding at the end

int main(void) {
    printf("struct sdata: %d\n", (int)sizeof(struct sdata));
    printf("union udata: %d\n", (int)sizeof(union udata));
    printf("struct A: %d\n", (int)sizeof(struct A));
    printf("union U: %d\n", (int)sizeof(union U));
    printf("struct B: %d\n", (int)sizeof(struct B));
    return 0;
}
```
```output
struct sdata: 12
union udata: 4
struct A: 8
union U: 12
struct B: 16
```

The struct `sdata` has members of 4 + 4 + 1 bytes, padded to 12 so every `int` stays aligned. The union only needs room for its biggest member, 4 bytes.

Sharing memory in action:

```c run
#include <stdio.h>

union value {
    int   i;
    float f;
};

int main(void) {
    union value v;

    v.i = 42;
    printf("i = %d\n", v.i);

    v.f = 3.5f;                 // overwrites the same memory
    printf("f = %.1f\n", v.f);  // only f is meaningful now
    return 0;
}
```
```output
i = 42
f = 3.5
```

After `v.f = 3.5f;` reading `v.i` would give meaningless bits. Unions are used to save memory or to look at the same data in different ways.

### Common mistakes

- Using several union members at the same time and expecting each to keep its own value.
- Reading a union member other than the one last written.

```quiz
What are `sizeof(union {int a; double b;})` and `sizeof(struct {int a; double b;})` on a typical 64-bit system?
- [ ] 12 and 12
- [ ] 4 and 8
- [x] 8 and 16
- [ ] 8 and 12
> The union is as big as its largest member (double, 8). The struct needs 4 + 4 padding + 8 = 16 so the double stays aligned.
```

```quiz
After `union value v; v.i = 42; v.f = 3.5f;` which member holds a meaningful value?
- [ ] both i and f
- [ ] only i
- [x] only f
- [ ] neither
> All members share one memory block; the last write (f) replaced the bits of i.
```

# Problem: Student details with a structure
id: structs-student-display
difficulty: easy
source: CSE103 Task Sheet - Structures and Unions #1

Create a structure `student` with the members **name** (a word with no spaces, up to 19 characters), **roll** (int) and **CGPA** (float). Read one student and display the details.

**Input:** `name roll cgpa` on one line.
**Output:** three lines:
```
Name: <name>
Roll: <roll>
CGPA: <cgpa with 2 decimals>
```

```c starter
#include <stdio.h>

struct student {
    // members here
};

int main(void) {
    // read and print one student
    return 0;
}
```
```c solution
#include <stdio.h>

struct student {
    char  name[20];
    int   roll;
    float cgpa;
};

int main(void) {
    struct student s;
    scanf("%s %d %f", s.name, &s.roll, &s.cgpa);
    printf("Name: %s\n", s.name);
    printf("Roll: %d\n", s.roll);
    printf("CGPA: %.2f\n", s.cgpa);
    return 0;
}
```
```test
=== input
Rahim 101 3.75
=== output
Name: Rahim
Roll: 101
CGPA: 3.75
```
```test
=== input
Salma 7 4.00
=== output
Name: Salma
Roll: 7
CGPA: 4.00
```
```test
=== input
Tuhin 2210 2.5
=== output
Name: Tuhin
Roll: 2210
CGPA: 2.50
```
```hint
Declare `struct student s;` and read with `scanf("%s %d %f", s.name, &s.roll, &s.cgpa);`. The char array name needs no `&`.
```
```hint
Print with `%.2f` for the CGPA so it always shows two decimals.
```

# Problem: Highest CGPA among 5 students
id: structs-highest-cgpa
difficulty: easy
source: CSE103 Task Sheet - Structures and Unions #2

Read the details of **5** students into an array of structures and print the student with the highest CGPA. All CGPA values are different.

**Input:** 5 lines, each `name roll cgpa` (name has no spaces).
**Output:** `Highest CGPA: <name> <roll> <cgpa with 2 decimals>`

```c starter
#include <stdio.h>

typedef struct {
    char  name[20];
    int   roll;
    float cgpa;
} Student;

int main(void) {
    Student s[5];
    // read 5 students, find the best one
    return 0;
}
```
```c solution
#include <stdio.h>

typedef struct {
    char  name[20];
    int   roll;
    float cgpa;
} Student;

int main(void) {
    Student s[5];
    int best = 0;

    for (int i = 0; i < 5; i++) {
        scanf("%s %d %f", s[i].name, &s[i].roll, &s[i].cgpa);
        if (s[i].cgpa > s[best].cgpa) {
            best = i;
        }
    }
    printf("Highest CGPA: %s %d %.2f\n", s[best].name, s[best].roll, s[best].cgpa);
    return 0;
}
```
```test
=== input
Rahim 101 3.50
Karim 102 3.20
Salma 103 3.90
Nila 104 3.85
Omar 105 3.10
=== output
Highest CGPA: Salma 103 3.90
```
```test
=== input
Ann 1 3.99
Bob 2 3.01
Cy 3 2.50
Di 4 3.75
Ed 5 3.98
=== output
Highest CGPA: Ann 1 3.99
```
```test
=== input
Fay 11 2.00
Gus 12 2.10
Hal 13 2.20
Ivy 14 2.30
Jon 15 3.40
=== output
Highest CGPA: Jon 15 3.40
```
```hint
Keep the **index** of the best student so far (`best = 0` at the start). Whenever `s[i].cgpa > s[best].cgpa`, update `best`.
```
```hint
You can compare while reading, in the same loop, because s[0] is read before any comparison with it.
```

# Problem: Add two complex numbers
id: structs-complex-add
difficulty: easy
source: CSE103 Task Sheet - Structures and Unions #3

A complex number has a real part and an imaginary part. Use a structure `Complex` with two `int` members and write a function `Complex add(Complex a, Complex b)` that returns their sum.

**Input:** four integers `r1 i1 r2 i2` (the real and imaginary parts of the first and second number).
**Output:** `Sum = R + Ii` where R and I are the parts of the sum. Always print the `+`, even if I is negative (for example `3 + -1i`).

```c starter
#include <stdio.h>

typedef struct {
    int real;
    int imag;
} Complex;

Complex add(Complex a, Complex b) {
    // your code here
}

int main(void) {
    return 0;
}
```
```c solution
#include <stdio.h>

typedef struct {
    int real;
    int imag;
} Complex;

Complex add(Complex a, Complex b) {
    Complex c;
    c.real = a.real + b.real;
    c.imag = a.imag + b.imag;
    return c;
}

int main(void) {
    Complex x, y, s;
    scanf("%d %d %d %d", &x.real, &x.imag, &y.real, &y.imag);
    s = add(x, y);
    printf("Sum = %d + %di\n", s.real, s.imag);
    return 0;
}
```
```test
=== input
3 4 1 2
=== output
Sum = 4 + 6i
```
```test
=== input
5 -2 -1 2
=== output
Sum = 4 + 0i
```
```test
=== input
-7 -3 2 -4
=== output
Sum = -5 + -7i
```
```hint
Add the real parts together and the imaginary parts together; store them in a new `Complex` and return it.
```
```hint
Print with `printf("Sum = %d + %di\n", s.real, s.imag);`.
```

# Problem: Nested structure: student with date of birth
id: structs-nested-dob
difficulty: medium
source: CSE103 Task Sheet - Structures and Unions #4

Define `struct date { int day, month, year; }` and a structure `student` that contains a `name` (no spaces), a `roll` and a **nested** `struct date dob`. Read one student and display the combined information.

**Input:** `name roll day month year` on one line.
**Output:** three lines, with day and month always two digits:
```
Name: <name>
Roll: <roll>
DOB: DD/MM/YYYY
```

```c starter
#include <stdio.h>

struct date {
    int day, month, year;
};

struct student {
    char name[20];
    int  roll;
    // add the nested date here
};

int main(void) {
    return 0;
}
```
```c solution
#include <stdio.h>

struct date {
    int day, month, year;
};

struct student {
    char        name[20];
    int         roll;
    struct date dob;
};

int main(void) {
    struct student s;
    scanf("%s %d %d %d %d", s.name, &s.roll, &s.dob.day, &s.dob.month, &s.dob.year);
    printf("Name: %s\n", s.name);
    printf("Roll: %d\n", s.roll);
    printf("DOB: %02d/%02d/%d\n", s.dob.day, s.dob.month, s.dob.year);
    return 0;
}
```
```test
=== input
Rahim 12 5 3 2002
=== output
Name: Rahim
Roll: 12
DOB: 05/03/2002
```
```test
=== input
Nila 40 25 12 1999
=== output
Name: Nila
Roll: 40
DOB: 25/12/1999
```
```test
=== input
Omar 3 1 1 2004
=== output
Name: Omar
Roll: 3
DOB: 01/01/2004
```
```hint
The nested members are reached with two dots: `s.dob.day`. Read them with `&s.dob.day`.
```
```hint
Use the format `%02d` to print a number with a leading zero when it has one digit.
```

# Problem: Structure versus union
id: structs-vs-union
difficulty: medium
source: CSE103 Task Sheet - Structures and Unions #5

Declare both of these types:

```c
struct S { int i; float f; char c; };
union  U { int i; float f; char c; };
```

Then write a program (no input) that:

1. prints the sizes of `struct S` and `union U`;
2. creates a struct `s` with `i = 10`, `f = 2.5`, `c = 'A'` and prints all three members;
3. creates a union `u`, sets `u.i = 10` and prints it, then sets `u.f = 2.5` and prints it.

**Output:**
```
Struct size = 12
Union size = 4
Struct: i=10 f=2.5 c=A
Union i = 10
Union f = 2.5
```
Print floats with one decimal (`%.1f`). Use `(int)sizeof(...)` with `%d`.

```c starter
#include <stdio.h>

struct S { int i; float f; char c; };
union  U { int i; float f; char c; };

int main(void) {
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

struct S { int i; float f; char c; };
union  U { int i; float f; char c; };

int main(void) {
    struct S s = {10, 2.5f, 'A'};
    union U u;

    printf("Struct size = %d\n", (int)sizeof(struct S));
    printf("Union size = %d\n", (int)sizeof(union U));
    printf("Struct: i=%d f=%.1f c=%c\n", s.i, s.f, s.c);

    u.i = 10;
    printf("Union i = %d\n", u.i);
    u.f = 2.5f;
    printf("Union f = %.1f\n", u.f);
    return 0;
}
```
```test
=== output
Struct size = 12
Union size = 4
Struct: i=10 f=2.5 c=A
Union i = 10
Union f = 2.5
```
```hint
The union is as large as its biggest member (4 bytes). The struct holds all three members plus padding (4 + 4 + 1, rounded up to 12).
```
```hint
Print each union member right after you assign it. Reading `u.i` after assigning `u.f` would give garbage because they share memory.
```

# Problem: Inventory system
id: structs-inventory
difficulty: medium
source: Aptech Elementary Programming in C - Advanced Data Types & Sorting #1

Store the **item number, name, rate and quantity on hand** of five items in an array of structures. Display each item's name and total price (rate x quantity), and finally the grand total value of the inventory.

**Input:** 5 lines, each `itemno name rate quantity` (name has no spaces, rate is a real number, quantity an integer).
**Output:** five lines `<name>: <total>` followed by `Grand total: <sum>`; all values with 2 decimals.

```c starter
#include <stdio.h>

typedef struct {
    int    no;
    char   name[20];
    double rate;
    int    qty;
} Item;

int main(void) {
    Item inv[5];
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

typedef struct {
    int    no;
    char   name[20];
    double rate;
    int    qty;
} Item;

int main(void) {
    Item inv[5];
    double grand = 0;

    for (int i = 0; i < 5; i++) {
        scanf("%d %s %lf %d", &inv[i].no, inv[i].name, &inv[i].rate, &inv[i].qty);
    }
    for (int i = 0; i < 5; i++) {
        double total = inv[i].rate * inv[i].qty;
        printf("%s: %.2f\n", inv[i].name, total);
        grand += total;
    }
    printf("Grand total: %.2f\n", grand);
    return 0;
}
```
```test
=== input
1 Pen 5.50 10
2 Book 120.00 3
3 Bag 850.00 1
4 Ink 25.25 4
5 Tape 10.00 7
=== output
Pen: 55.00
Book: 360.00
Bag: 850.00
Ink: 101.00
Tape: 70.00
Grand total: 1436.00
```
```test
=== input
1 A 1.5 2
2 B 2.25 2
3 C 100 1
4 D 0.5 10
5 E 7 7
=== output
A: 3.00
B: 4.50
C: 100.00
D: 5.00
E: 49.00
Grand total: 161.50
```
```hint
Read all five items first, then loop again to print totals and add each total to a running `grand` variable (a `double` starting at 0).
```

# Problem: Top 3 scores
id: structs-top3
difficulty: medium
source: Aptech Elementary Programming in C - Advanced Data Types & Sorting #2

Store the names and scores of 5 students in an array of structures, sort the array in **descending** order of score and display the top 3. All scores are different.

**Input:** 5 lines, each `name score` (score is an integer).
**Output:** three lines `<rank>. <name> <score>` for ranks 1 to 3.

```c starter
#include <stdio.h>

typedef struct {
    char name[20];
    int  score;
} Student;

int main(void) {
    Student s[5];
    // read, sort descending, print top 3
    return 0;
}
```
```c solution
#include <stdio.h>

typedef struct {
    char name[20];
    int  score;
} Student;

int main(void) {
    Student s[5];

    for (int i = 0; i < 5; i++) {
        scanf("%s %d", s[i].name, &s[i].score);
    }
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4 - i; j++) {
            if (s[j].score < s[j + 1].score) {
                Student t = s[j];
                s[j] = s[j + 1];
                s[j + 1] = t;
            }
        }
    }
    for (int i = 0; i < 3; i++) {
        printf("%d. %s %d\n", i + 1, s[i].name, s[i].score);
    }
    return 0;
}
```
```test
=== input
Ana 72
Ben 90
Cia 65
Dev 88
Eli 91
=== output
1. Eli 91
2. Ben 90
3. Dev 88
```
```test
=== input
Zed 50
Yan 60
Xia 70
Wes 80
Val 90
=== output
1. Val 90
2. Wes 80
3. Xia 70
```
```test
=== input
Max 99
Lia 12
Kim 45
Jon 77
Ian 63
=== output
1. Max 99
2. Jon 77
3. Ian 63
```
```hint
Use bubble sort and swap **whole** `Student` structs, so each name moves with its score.
```
```hint
After sorting, the best three are `s[0]`, `s[1]` and `s[2]`.
```

# Problem: Sort lengths in yards, feet and inches
id: structs-lengths-sort
difficulty: medium
source: Aptech Elementary Programming in C - Advanced Data Types & Sorting (Lab) #1

Store 5 lengths in an array of structures with members `yards`, `feet` and `inches`. Sort them in **ascending** order of total length and display them. (1 yard = 3 feet, 1 foot = 12 inches.) All inputs are already normal (feet 0-2, inches 0-11) and all lengths are different.

**Input:** 5 lines, each `yards feet inches`.
**Output:** 5 lines in the form `<y> yd <f> ft <i> in`.

```c starter
#include <stdio.h>

typedef struct {
    int yards, feet, inches;
} Length;

int totalInches(Length l) {
    // return the length in inches
}

int main(void) {
    Length a[5];
    return 0;
}
```
```c solution
#include <stdio.h>

typedef struct {
    int yards, feet, inches;
} Length;

int totalInches(Length l) {
    return l.yards * 36 + l.feet * 12 + l.inches;
}

int main(void) {
    Length a[5];

    for (int i = 0; i < 5; i++) {
        scanf("%d %d %d", &a[i].yards, &a[i].feet, &a[i].inches);
    }
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4 - i; j++) {
            if (totalInches(a[j]) > totalInches(a[j + 1])) {
                Length t = a[j];
                a[j] = a[j + 1];
                a[j + 1] = t;
            }
        }
    }
    for (int i = 0; i < 5; i++) {
        printf("%d yd %d ft %d in\n", a[i].yards, a[i].feet, a[i].inches);
    }
    return 0;
}
```
```test
=== input
2 1 5
1 2 10
0 2 0
3 0 3
1 0 11
=== output
0 yd 2 ft 0 in
1 yd 0 ft 11 in
1 yd 2 ft 10 in
2 yd 1 ft 5 in
3 yd 0 ft 3 in
```
```test
=== input
1 1 1
0 0 5
0 1 0
0 2 11
1 0 0
=== output
0 yd 0 ft 5 in
0 yd 1 ft 0 in
0 yd 2 ft 11 in
1 yd 0 ft 0 in
1 yd 1 ft 1 in
```
```hint
Compare lengths by converting them to a single unit: `yards * 36 + feet * 12 + inches`.
```
```hint
Sort the array of structs with a bubble sort that swaps whole `Length` structs.
```

# Problem: Employee salary menu
id: structs-employee-menu
difficulty: hard
source: Aptech Elementary Programming in C - Advanced Data Types & Sorting (Lab) #2

Store employees in an array of structures: **id, name, salary** and **date of joining** (a nested `struct date` with day, month, year). Then process menu commands.

**Input:**
- line 1: the current year `Y`
- line 2: `n`, the number of employees (n ≤ 20)
- next `n` lines: `id name salary day month year` (salary is an integer)
- then commands, one integer per line, until `0`:
  - `1`: increase salaries and print `Salaries updated.` The increase is **15%** if salary <= 2000, **10%** if salary > 2000 and <= 5000, **none** if salary > 5000.
  - `2`: print the employees who have completed at least 10 years (`Y - year >= 10`), in input order, as `id name salary`. Print `None` if there is nobody.
  - `3`: print all employees as `id name salary`.
  - `0`: stop.

Salaries are printed with 2 decimals (store them as `double`).

```c starter
#include <stdio.h>

typedef struct {
    int day, month, year;
} Date;

typedef struct {
    int    id;
    char   name[20];
    double salary;
    Date   joined;
} Employee;

int main(void) {
    Employee e[20];
    // your code here
    return 0;
}
```
```c solution
#include <stdio.h>

typedef struct {
    int day, month, year;
} Date;

typedef struct {
    int    id;
    char   name[20];
    double salary;
    Date   joined;
} Employee;

int main(void) {
    Employee e[20];
    int year, n, choice;

    scanf("%d %d", &year, &n);
    for (int i = 0; i < n; i++) {
        scanf("%d %s %lf %d %d %d", &e[i].id, e[i].name, &e[i].salary,
              &e[i].joined.day, &e[i].joined.month, &e[i].joined.year);
    }

    while (scanf("%d", &choice) == 1 && choice != 0) {
        if (choice == 1) {
            for (int i = 0; i < n; i++) {
                if (e[i].salary <= 2000) {
                    e[i].salary += e[i].salary * 15 / 100;
                } else if (e[i].salary <= 5000) {
                    e[i].salary += e[i].salary * 10 / 100;
                }
            }
            printf("Salaries updated.\n");
        } else if (choice == 2) {
            int found = 0;
            for (int i = 0; i < n; i++) {
                if (year - e[i].joined.year >= 10) {
                    printf("%d %s %.2f\n", e[i].id, e[i].name, e[i].salary);
                    found = 1;
                }
            }
            if (!found) {
                printf("None\n");
            }
        } else if (choice == 3) {
            for (int i = 0; i < n; i++) {
                printf("%d %s %.2f\n", e[i].id, e[i].name, e[i].salary);
            }
        }
    }
    return 0;
}
```
```test
=== input
2026
3
1 Anik 1500 10 5 2012
2 Bela 4000 1 1 2020
3 Chand 8000 3 3 2015
2
1
3
0
=== output
1 Anik 1500.00
3 Chand 8000.00
Salaries updated.
1 Anik 1725.00
2 Bela 4400.00
3 Chand 8000.00
```
```test
=== input
2030
2
10 Zara 2000 1 1 2020
11 Omar 5000 2 2 2025
1
3
2
0
=== output
Salaries updated.
10 Zara 2300.00
11 Omar 5500.00
10 Zara 2300.00
```
```test
=== input
2026
2
5 Tina 9000 1 1 2024
6 Uma 3000 1 1 2023
2
0
=== output
None
```
```hint
Use a `while (scanf("%d", &choice) == 1 && choice != 0)` loop and an `if / else if` chain on `choice`.
```
```hint
For command 1 check `salary <= 2000` first, then `salary <= 5000`; salaries above 5000 are not changed. `salary += salary * 15 / 100;` adds 15%.
```
