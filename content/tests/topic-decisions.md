---
id: topic-decisions
title: "Topic Test: Decision Making"
group: topic
lesson: decisions
order: 103
duration: 30
covers: if / else if ordering, stray semicolon after if, = vs ==, switch fall-through and default, nested ?:
summary: Six short questions and two coding problems on if/else chains, switch and the conditional operator.
---

# Question: Order of an else-if chain
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int marks = 85;
    if (marks >= 40)
        printf("C ");
    else if (marks >= 60)
        printf("B ");
    else if (marks >= 80)
        printf("A ");
    printf("end");
    return 0;
}
~~~
- [ ] A end
- [ ] A B C end
- [x] C end
- [ ] B end
> The chain stops at the first true condition. 85 >= 40 is true, so C is printed and the tests for B and A are never reached. Put the strictest test first.
```

# Question: default in the middle of a switch
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int n = 3;
    switch (n) {
        default: printf("D ");
        case 1: printf("1 ");
                break;
        case 2: printf("2 ");
    }
    return 0;
}
~~~
- [ ] D
- [ ] 2
- [x] D 1
- [ ] D 1 2
> No case matches 3, so execution starts at default and prints D. With no break it falls into case 1 and prints 1, and then break leaves the switch.
```

# Question: The stray semicolon
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int x = 5;
    if (x > 10);
        printf("big ");
    printf("done");
    return 0;
}
~~~
- [ ] done
- [x] big done
- [ ] big
- [ ] nothing is printed
> The semicolon right after the condition is an empty statement, which becomes the body of the if. The printf("big ") line is then an ordinary statement that always runs.
```

# Question: Assignment inside a condition
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a = 3;
    if (a = 5)
        printf("%d ", a);
    if (a == 3)
        printf("three");
    else
        printf("other");
    return 0;
}
~~~
- [ ] three
- [ ] 3 three
- [x] 5 other
- [ ] 5 three
> a = 5 assigns 5 to a and the value 5 is true, so 5 is printed and a stays 5. Then a == 3 is false, so other is printed.
```

# Question: Nested conditional operator
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a = 0, b = -4;
    printf("%s %s", a > 0 ? "pos" : a < 0 ? "neg" : "zero",
                    b > 0 ? "pos" : b < 0 ? "neg" : "zero");
    return 0;
}
~~~
- [ ] zero zero
- [ ] pos neg
- [x] zero neg
- [ ] neg neg
> a is neither positive nor negative so the last alternative zero is chosen. b is not positive, but b < 0 is true, so neg is chosen.
```

# Question: What may appear in a switch
marks: 2

```quiz
Which statement about switch is true?
- [ ] The switch expression may be a double
- [ ] A case label may be a range such as case 1 to 5
- [ ] Every case must end with a break or the program will not compile
- [x] Case labels must be constant integer or character values
> The switch expression must be an integer type (char is fine) and each case label must be a constant such as 3 or 'a'. Ranges are not allowed, and a missing break is legal; it just causes fall-through.
```

# Problem: Median of three
id: topic-decisions-median3
difficulty: easy
marks: 6
source: Original (topic test)

Read three integers and print the **middle** one, that is, the value that would be in the middle if the three were sorted. If values repeat, the answer is still the middle value of the sorted order (for `5 5 9` it is `5`).

**Input:** three integers a b c.
**Output:** `Median = M`

```c starter
#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    int m;
    if ((a >= b && a <= c) || (a <= b && a >= c))
        m = a;
    else if ((b >= a && b <= c) || (b <= a && b >= c))
        m = b;
    else
        m = c;
    printf("Median = %d\n", m);
    return 0;
}
```

```test
=== input
3 1 2
=== output
Median = 2
```

```test
=== input
5 5 9
=== output
Median = 5
```

```test
=== input
9 7 7
=== output
Median = 7
```

```test
=== input
-1 -5 0
=== output
Median = -1
```

```hint
A number is the median if it lies between the other two: (a >= b && a <= c) or (a <= b && a >= c).
```

```hint
Test a first, then b, and if neither is the median it must be c. Use >= and <= so that repeated values work.
```

# Problem: Is this date valid?
id: topic-decisions-valid-date
difficulty: medium
marks: 8
source: Original (topic test)

Read a date as three integers **day month year** and decide whether it is a real calendar date. Print `Valid` or `Invalid`.

- The year must be at least 1 and the month must be 1 to 12.
- April, June, September and November have 30 days. January, March, May, July, August, October and December have 31 days.
- February has 29 days in a leap year and 28 otherwise. A year is a leap year if it is divisible by 400, or divisible by 4 but not by 100.
- The day must be at least 1 and at most the number of days in that month.

**Input:** three integers d m y.
**Output:** `Valid` or `Invalid`.

```c starter
#include <stdio.h>

int main(void) {
    int d, m, y;
    scanf("%d %d %d", &d, &m, &y);
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int d, m, y;
    scanf("%d %d %d", &d, &m, &y);
    int days = 0;
    if (y >= 1 && m >= 1 && m <= 12) {
        switch (m) {
            case 4: case 6: case 9: case 11:
                days = 30;
                break;
            case 2:
                if ((y % 400 == 0) || (y % 4 == 0 && y % 100 != 0))
                    days = 29;
                else
                    days = 28;
                break;
            default:
                days = 31;
        }
    }
    if (days > 0 && d >= 1 && d <= days)
        printf("Valid\n");
    else
        printf("Invalid\n");
    return 0;
}
```

```test
=== input
29 2 2024
=== output
Valid
```

```test
=== input
29 2 2023
=== output
Invalid
```

```test
=== input
31 4 2021
=== output
Invalid
```

```test
=== input
31 12 1999
=== output
Valid
```

```hint
First find how many days the month has (a switch with grouped cases 4, 6, 9, 11 works well), then compare the day with it. Treat a bad month or year as "no days".
```

```hint
For February use the leap year rule: divisible by 400, or divisible by 4 but not by 100. Remember that 1900 is not a leap year but 2000 is.
```
