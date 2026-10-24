---
id: ct3
title: Class Test 3
order: 3
duration: 45
covers: 1D arrays, 2D arrays, characters and strings
summary: Trace array and string programs, spot classic bugs, then write three array, matrix and string programs.
---

# Question: Partial initialization
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a[5] = {1, 2};
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        printf("%d ", a[i]);
        sum += a[i];
    }
    printf("%d", sum);
    return 0;
}
~~~
- [ ] 1 2 garbage garbage garbage 3
- [x] 1 2 0 0 0 3
- [ ] 1 2 0 0 0 0
- [ ] 1 2 2 2 2 9
> When fewer initializers than elements are given, the rest are set to 0. The sum is 1 + 2 + 0 + 0 + 0 = 3.
```

# Question: strlen versus sizeof
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <string.h>
int main(void) {
    char s[10] = "exam";
    s[2] = '\0';
    printf("%d %d %s", (int)strlen(s), (int)sizeof(s), s);
    return 0;
}
~~~
- [ ] 4 10 exam
- [ ] 2 2 ex
- [x] 2 10 ex
- [ ] 4 5 ex
> strlen counts characters up to the first '\0', which is now at index 2, so it is 2 and printf stops there too. sizeof(s) is the size of the whole array, 10 bytes.
```

# Question: Character arithmetic
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    char ch = 'D';
    printf("%c %d %c", ch + 2, ch - 'A', ch + 'a' - 'A');
    return 0;
}
~~~
- [ ] F 3 D
- [x] F 3 d
- [ ] 70 3 d
- [ ] E 4 d
> Letters are consecutive codes. 'D' + 2 is 'F'; 'D' - 'A' is 3; adding 'a' - 'A' (32) converts upper case to lower case, giving 'd'.
```

# Question: Index arithmetic
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int a[6] = {4, 8, 15, 16, 23, 42};
    int i = 1;
    printf("%d %d %d", a[i + 2], a[a[0] - 3], a[5 - i]);
    return 0;
}
~~~
- [ ] 15 4 16
- [ ] 16 15 23
- [x] 16 8 23
- [ ] 23 8 16
> a[i+2] = a[3] = 16. a[0] is 4, so a[a[0]-3] = a[1] = 8. a[5-i] = a[4] = 23.
```

# Question: Walking over a matrix
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    int m[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    int above = 0, anti = 0;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            if (i < j) above += m[i][j];
        }
        anti += m[i][2 - i];
    }
    printf("%d %d", above, anti);
    return 0;
}
~~~
- [ ] 15 11
- [ ] 11 11
- [x] 11 15
- [ ] 12 15
> Above the main diagonal (i < j) lie 2, 3 and 6, which sum to 11. The anti-diagonal elements m[0][2], m[1][1], m[2][0] are 3, 5, 7, which sum to 15.
```

# Question: Off-by-one loop
marks: 2

```quiz
This program is meant to add up the five marks. What is wrong with it?
~~~
int marks[5] = {70, 65, 80, 90, 55};
int total = 0;
for (int i = 0; i <= 5; i++) {
    total += marks[i];
}
~~~
- [ ] marks must be declared with size 6
- [x] The condition i <= 5 makes the loop read marks[5], which is outside the array; it should be i < 5
- [ ] total must be a float
- [ ] The loop variable cannot be declared inside for
> Valid indexes of an array of 5 elements are 0 to 4. Using <= visits index 5, which is out of bounds.
```

# Question: Comparing strings
marks: 2

```quiz
The program should print "Welcome" when the user types Rina, but it never does even when the input is Rina. Why?
~~~
char name[20];
scanf("%s", name);
if (name == "Rina") {
    printf("Welcome");
}
~~~
- [ ] scanf cannot read into a char array
- [ ] "Rina" must be written in single quotes
- [x] == compares the addresses of the two strings, not their characters; use strcmp(name, "Rina") == 0
- [ ] name must be declared as char name[4]
> Strings are arrays, and == on arrays compares where they are stored. Use strcmp from string.h, which returns 0 when the contents are equal.
```

# Question: The missing terminator
marks: 2

```quiz
This code copies the string s into t by hand, then prints t. What is the bug?
~~~
char s[] = "hello";
char t[20];
int i;
for (i = 0; i < 5; i++) {
    t[i] = s[i];
}
printf("%s", t);
~~~
- [ ] The loop should start at i = 1
- [ ] t must be the same size as s
- [x] t is never given a '\0' at the end, so printf does not know where the string stops; add t[i] = '\0'; after the loop
- [ ] %s cannot print an array
> A C string must end with '\0'. The copy loop copies only the five letters, so t is not a valid string until the terminator is stored.
```

# Problem: Rotate an array left
id: ct3-rotate-left
difficulty: medium
source: Original (mock test)
marks: 6

Read an array of **n** integers and a number **k**. Rotate the array **left by k positions** (the first k elements move to the end, in the same order) and print the result. Note that **k can be larger than n**; rotating by n gives the original array again.

**Input:** the first line has two integers n and k (1 ≤ n ≤ 100, 0 ≤ k ≤ 1000). The second line has the n array elements.
**Output:** the rotated array on one line, elements separated by single spaces.

```c starter
#include <stdio.h>

int main(void) {
    int n, k;
    int a[100];
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n, k;
    int a[100], b[100];
    scanf("%d %d", &n, &k);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    k = k % n;
    for (int i = 0; i < n; i++) {
        b[i] = a[(i + k) % n];
    }
    for (int i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", b[i]);
    }
    printf("\n");
    return 0;
}
```

```test
=== input
5 2
1 2 3 4 5
=== output
3 4 5 1 2
```

```test
=== input
6 8
10 20 30 40 50 60
=== output
30 40 50 60 10 20
```

```test
=== input
1 5
7
=== output
7
```

```test
=== input
4 0
-1 0 9 -4
=== output
-1 0 9 -4
```

```hint
The element that ends up at position i is the one that was at position i + k. When i + k goes past the end, it wraps around to the start.
```

```hint
First replace k by k % n so a large k is reduced. Then store b[i] = a[(i + k) % n] in a second array and print b.
```

# Problem: Identity or upper triangular
id: ct3-matrix-class
difficulty: medium
source: Original (mock test)
marks: 8

A square matrix is an **identity matrix** if every diagonal element is 1 and every other element is 0. It is an **upper triangular matrix** if every element below the main diagonal is 0 (the other elements can be anything). Every identity matrix is also upper triangular, but report only the most specific type.

Read an n x n matrix and print exactly one of: `Identity matrix`, `Upper triangular matrix`, or `Neither`.

**Input:** the first line has n (1 ≤ n ≤ 10). The next n lines each have n integers.
**Output:** one of the three lines above.

```c starter
#include <stdio.h>

int main(void) {
    int n;
    int a[10][10];
    // your code here
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    int n;
    int a[10][10];
    int isIdentity = 1, isUpper = 1;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &a[i][j]);
        }
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (i == j) {
                if (a[i][j] != 1) isIdentity = 0;
            } else if (i > j) {
                if (a[i][j] != 0) {
                    isUpper = 0;
                    isIdentity = 0;
                }
            } else {
                if (a[i][j] != 0) isIdentity = 0;
            }
        }
    }
    if (isIdentity) {
        printf("Identity matrix\n");
    } else if (isUpper) {
        printf("Upper triangular matrix\n");
    } else {
        printf("Neither\n");
    }
    return 0;
}
```

```test
=== input
3
1 0 0
0 1 0
0 0 1
=== output
Identity matrix
```

```test
=== input
3
1 2 3
0 5 6
0 0 9
=== output
Upper triangular matrix
```

```test
=== input
3
1 2 3
4 5 6
0 0 9
=== output
Neither
```

```test
=== input
2
2 0
0 2
=== output
Upper triangular matrix
```

```hint
Use two flags, one for identity and one for upper triangular, both starting as 1. Loop over every element and clear a flag when you find a violation.
```

```hint
Compare i and j. When i > j the element is below the diagonal and must be 0 for both types. When i == j it must be 1 for identity. When i < j it must be 0 for identity but is unrestricted for upper triangular.
```

# Problem: Text report
id: ct3-text-report
difficulty: hard
source: Original (mock test)
marks: 10

Read one line of text and produce a small report in three lines:

1. The text with the **first letter of every word capitalized and all other letters in lower case**. Words are separated by one or more spaces; keep the spacing exactly as it was. A word that does not start with a letter (for example `9lives`) is left with its first character unchanged, but its other letters are still made lower case.
2. `Vowel words: K` where K is the number of words whose first character is a vowel (a, e, i, o, u, in either case).
3. `Most frequent letter: c (N)` where c is the lower-case letter that occurs most often in the whole text (upper and lower case count as the same letter; ignore non-letters) and N is its count. If several letters tie, print the one that comes first in the alphabet.

**Input:** one line of at most 100 characters, containing at least one letter. Read it with `fgets` and remove the trailing newline.
**Output:** the three lines described above.

```c starter
#include <stdio.h>
#include <ctype.h>
#include <string.h>

int main(void) {
    char s[105];
    // read the line with fgets, remove '\n', then build the report
    return 0;
}
```

```c solution
#include <stdio.h>
#include <ctype.h>
#include <string.h>

int main(void) {
    char s[105];
    int freq[26] = {0};
    int newWord = 1, vowelWords = 0;
    fgets(s, sizeof(s), stdin);
    int len = (int)strlen(s);
    if (len > 0 && s[len - 1] == '\n') {
        s[len - 1] = '\0';
        len--;
    }
    for (int i = 0; i < len; i++) {
        char c = s[i];
        if (c == ' ') {
            newWord = 1;
            continue;
        }
        if (isalpha((unsigned char)c)) {
            freq[tolower((unsigned char)c) - 'a']++;
        }
        if (newWord) {
            char lc = (char)tolower((unsigned char)c);
            if (lc == 'a' || lc == 'e' || lc == 'i' || lc == 'o' || lc == 'u') {
                vowelWords++;
            }
            s[i] = (char)toupper((unsigned char)c);
            newWord = 0;
        } else {
            s[i] = (char)tolower((unsigned char)c);
        }
    }
    int best = 0;
    for (int i = 1; i < 26; i++) {
        if (freq[i] > freq[best]) best = i;
    }
    printf("%s\n", s);
    printf("Vowel words: %d\n", vowelWords);
    printf("Most frequent letter: %c (%d)\n", 'a' + best, freq[best]);
    return 0;
}
```

```test
=== input
the quick brown fox jumps over the lazy dog
=== output
The Quick Brown Fox Jumps Over The Lazy Dog
Vowel words: 1
Most frequent letter: o (4)
```

```test
=== input
  hELLO   wORLD  eVERY  island
=== output
  Hello   World  Every  Island
Vowel words: 2
Most frequent letter: l (4)
```

```test
=== input
Aa Ee Ii
=== output
Aa Ee Ii
Vowel words: 3
Most frequent letter: a (2)
```

```test
=== input
123 apple 9LIVES
=== output
123 Apple 9lives
Vowel words: 1
Most frequent letter: e (2)
```

```hint
Keep a flag newWord that is 1 at the start and after each space. When you see a non-space character and newWord is 1, it is the first letter of a word: capitalize it, test for a vowel, and set the flag to 0.
```

```hint
Use int freq[26] and increment freq[tolower(c) - 'a'] for each letter c. To find the most frequent letter, scan from 'a' to 'z' and update the best index only when a count is strictly greater, so ties keep the earlier letter.
```
