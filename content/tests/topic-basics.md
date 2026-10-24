---
id: topic-basics
title: "Topic Test: Basics"
group: topic
lesson: basics
order: 101
duration: 25
covers: printf and scanf, format specifiers, data types, sizeof, variable names, int vs double
summary: Six short questions and two coding problems on printf/scanf, data types and format specifiers.
---

# Question: Format specifiers and %%
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    printf("%d %c %s ", 65, 65, "C");
    printf("%d%%", 50);
    return 0;
}
~~~
- [ ] 65 65 C 50
- [x] 65 A C 50%
- [ ] A A C 50%
- [ ] 65 A C 50%%
> %d prints 65 as a number, %c prints the character with code 65 which is 'A', %s prints the string. %% prints one percent sign.
```

# Question: sizeof of basic types
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    printf("%d %d %d %d", (int)sizeof(int), (int)sizeof(char), (int)sizeof(double), (int)sizeof(float));
    return 0;
}
~~~
- [ ] 4 1 4 4
- [ ] 2 1 8 4
- [x] 4 1 8 4
- [ ] 4 2 8 8
> On this system int is 4 bytes, char is 1, double is 8 and float is 4.
```

# Question: int versus double division
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int x = 10 / 4;
    double y = 10 / 4;
    double z = 10 / 4.0;
    printf("%d %.1f %.1f", x, y, z);
    return 0;
}
~~~
- [ ] 2 2.5 2.5
- [x] 2 2.0 2.5
- [ ] 2.5 2.5 2.5
- [ ] 2 2 2.5
> 10 / 4 has two int operands, so it is already 2 before it is stored in y. Only 10 / 4.0 is a real division giving 2.5.
```

# Question: A char is a small number
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    char c = 'a';
    printf("%d %c %c", c, c + 1, c - 32);
    return 0;
}
~~~
- [ ] a b A
- [ ] 97 a A
- [x] 97 b A
- [ ] 97 b B
> 'a' has code 97. c + 1 is 98 which prints as 'b' with %c. c - 32 is 65 which is 'A'.
```

# Question: Missing address-of in scanf
marks: 2

```quiz
A student writes this to read an integer:
~~~
int age;
scanf("%d", age);
printf("%d", age);
~~~
What is wrong?
- [ ] %d must be %i
- [ ] age must be declared as float
- [x] scanf needs the address of the variable, so it must be &age
- [ ] printf must be called before scanf
> scanf stores the value at an address, so every ordinary variable needs &. Without it scanf is given the (garbage) value of age instead of its address.
```

# Question: Valid variable names
marks: 2

```quiz
Which one is a valid variable name in C?
- [ ] 2nd_num
- [ ] total-marks
- [x] _count
- [ ] int
> A name may contain letters, digits and underscores but must not start with a digit. The minus sign is not allowed, and int is a reserved keyword.
```

# Problem: Student card
id: topic-basics-student-card
difficulty: easy
marks: 6
source: Original (topic test)

Read a student's **id** (integer), a **grade** (a single letter) and a **CGPA** (real number), then print them on three lines in the format shown below. The CGPA must have exactly two decimal places.

**Input:** `id grade cgpa` on one line, for example `101 A 3.75`.
**Output:**
```
ID: 101
Grade: A
CGPA: 3.75
```

```c starter
#include <stdio.h>

int main(void) {
    int id;
    char grade;
    double cgpa;
    // read the three values, then print them
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int id;
    char grade;
    double cgpa;
    scanf("%d %c %lf", &id, &grade, &cgpa);
    printf("ID: %d\n", id);
    printf("Grade: %c\n", grade);
    printf("CGPA: %.2f\n", cgpa);
    return 0;
}
```

```test
=== input
101 A 3.75
=== output
ID: 101
Grade: A
CGPA: 3.75
```

```test
=== input
7 C 2.5
=== output
ID: 7
Grade: C
CGPA: 2.50
```

```test
=== input
2024 B 3.126
=== output
ID: 2024
Grade: B
CGPA: 3.13
```

```hint
Use %d for the int, %c for the char and %lf in scanf for the double. In printf, %.2f prints two decimals.
```

```hint
Put a space before %c in the scanf format (or between the specifiers) so the space after the id is skipped: scanf("%d %c %lf", ...).
```

# Problem: Average speed of a round trip
id: topic-basics-round-trip
difficulty: medium
marks: 8
source: Original (topic test)

A car travels a distance **d** km at speed **s1** km/h and returns the same distance at speed **s2** km/h. Read d, s1 and s2 (positive integers) and print the total travel time in hours and the average speed for the whole round trip.

Total time = d / s1 + d / s2, and average speed = total distance / total time = 2d / total time.

Beware of integer division: the values must be computed as real numbers.

**Input:** three integers d s1 s2.
**Output:** two lines, each with two decimal places:
```
Total time = T
Average speed = V
```

```c starter
#include <stdio.h>

int main(void) {
    int d, s1, s2;
    scanf("%d %d %d", &d, &s1, &s2);
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int d, s1, s2;
    scanf("%d %d %d", &d, &s1, &s2);
    double t = (double)d / s1 + (double)d / s2;
    double avg = 2.0 * d / t;
    printf("Total time = %.2f\n", t);
    printf("Average speed = %.2f\n", avg);
    return 0;
}
```

```test
=== input
60 30 60
=== output
Total time = 3.00
Average speed = 40.00
```

```test
=== input
100 50 50
=== output
Total time = 4.00
Average speed = 50.00
```

```test
=== input
10 40 60
=== output
Total time = 0.42
Average speed = 48.00
```

```test
=== input
90 45 90
=== output
Total time = 3.00
Average speed = 60.00
```

```hint
d / s1 with two ints throws away the fraction. Cast one operand first: (double)d / s1.
```

```hint
Store the total time in a double t, then the average speed is 2.0 * d / t. Print both with %.2f.
```
