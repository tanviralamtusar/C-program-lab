---
id: topic-strings
title: "Topic Test: Characters & Strings"
group: topic
lesson: strings
order: 108
duration: 30
covers: char codes, the null terminator, strlen vs sizeof, strcmp/strcat/strcpy, reading strings, character arithmetic
summary: Trace string and character programs, spot classic string bugs, then write two short string programs.
---

# Question: sizeof versus strlen
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <string.h>
int main(void) {
    char s[] = "hello";
    printf("%d %d", (int)sizeof(s), (int)strlen(s));
    return 0;
}
~~~
- [ ] 5 5
- [ ] 5 6
- [ ] 6 6
- [x] 6 5
> The array s holds the five letters plus the terminating '\0', so sizeof(s) is 6. strlen counts only the characters before the '\0', so it is 5.
```

# Question: Character arithmetic
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
int main(void) {
    printf("%d %c %d", '7' - '0', 'x' - 1, 'Z' - 'A');
    return 0;
}
~~~
- [ ] 55 w 26
- [x] 7 w 25
- [ ] 7 y 25
- [ ] 7 w 26
> '7' - '0' is the digit value 7. 'x' - 1 is the character before x, which is w. 'Z' - 'A' is 25 because the letters are 25 positions apart.
```

# Question: What strcmp returns
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <string.h>
int main(void) {
    int p = strcmp("apple", "apple") == 0;
    int q = strcmp("Apple", "apple") < 0;
    int r = strcmp("ab", "abc") > 0;
    printf("%d %d %d", p, q, r);
    return 0;
}
~~~
- [ ] 1 0 1
- [ ] 0 1 0
- [x] 1 1 0
- [ ] 1 1 1
> Equal strings give 0, so the first test is 1. 'A' (65) is smaller than 'a' (97), so "Apple" < "apple" is true. "ab" is a prefix of "abc" and so it is smaller, making the third test false (0).
```

# Question: Concatenating after a cut
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <string.h>
int main(void) {
    char a[20] = "ab";
    strcat(a, "cd");
    a[1] = '\0';
    strcat(a, "xyz");
    printf("%s %d", a, (int)strlen(a));
    return 0;
}
~~~
- [ ] abxyz 5
- [ ] abcdxyz 7
- [x] axyz 4
- [ ] a 1
> After strcat the string is abcd. Storing '\0' at index 1 ends the string after "a". strcat then appends xyz at that new end, giving axyz with length 4.
```

# Question: Reading a name with spaces
marks: 2

```quiz
The user types Md Rahim and presses Enter. What does this program print?
~~~
char name[30];
scanf("%s", name);
printf("Hello, %s!", name);
~~~
- [ ] Hello, Md Rahim!
- [ ] Hello, Rahim!
- [x] Hello, Md!
- [ ] Hello, !
> scanf with %s stops reading at the first whitespace, so only Md is stored. To read a whole line with spaces use fgets (and remove the trailing newline).
```

# Question: Copying by assignment
marks: 2

```quiz
The code below does not compile. What is the correct way to copy the text?
~~~
char src[] = "copy me";
char dst[20];
dst = src;
~~~
- [ ] dst = &src;
- [ ] dst[] = src;
- [x] strcpy(dst, src);
- [ ] dst == src;
> An array name is not a modifiable variable, so one array cannot be assigned to another. Copy the characters with strcpy(dst, src) (dst must be large enough), or with a loop that also stores '\0'.
```

# Problem: Initials of a name
id: topic-strings-initials
difficulty: easy
source: Original (topic test)
marks: 6

Read a person's full name on one line and print the **initials** of its words in capital letters, each followed by a dot. Words are separated by one or more spaces, and the line may start or end with spaces. Every word starts with a letter, which may be upper or lower case.

**Input:** one line of at most 100 characters with at least one word. Read it with `fgets` and remove the trailing newline.
**Output:** the initials, for example `R.U.A.`

```c starter
#include <stdio.h>
#include <ctype.h>
#include <string.h>

int main(void) {
    char s[105];
    // read the line with fgets, remove '\n', then print the initials
    return 0;
}
```

```c solution
#include <stdio.h>
#include <ctype.h>
#include <string.h>

int main(void) {
    char s[105];
    int newWord = 1;
    fgets(s, sizeof(s), stdin);
    int len = (int)strlen(s);
    if (len > 0 && s[len - 1] == '\n') {
        s[len - 1] = '\0';
        len--;
    }
    for (int i = 0; i < len; i++) {
        if (s[i] == ' ') {
            newWord = 1;
        } else if (newWord) {
            printf("%c.", toupper((unsigned char)s[i]));
            newWord = 0;
        }
    }
    printf("\n");
    return 0;
}
```

```test
=== input
rahim uddin ahmed
=== output
R.U.A.
```

```test
=== input
  mary   jane  
=== output
M.J.
```

```test
=== input
Kamal
=== output
K.
```

```test
=== input
john f kennedy
=== output
J.F.K.
```

```hint
A new word starts at a letter that comes right after a space (or at the very start of the line). Use a flag that is 1 at the start and after each space.
```

```hint
When the flag is 1 and the current character is not a space, print toupper(ch) followed by a dot and set the flag to 0. When you see a space, set the flag to 1 again.
```

# Problem: Caesar cipher
id: topic-strings-caesar
difficulty: medium
source: Original (topic test)
marks: 8

A **Caesar cipher** shifts every letter forward in the alphabet by **k** places, wrapping from `z` back to `a`. Upper-case letters stay upper case, lower-case letters stay lower case, and every other character (spaces, digits, punctuation) is copied unchanged. For example, with k = 3, `xyz` becomes `abc`.

Read a line of text and the shift k, then print the encrypted text. Note that k may be larger than 26.

**Input:** the first line is the text (at most 100 characters; read it with `fgets` and remove the trailing newline). The second line has the integer k (0 ≤ k ≤ 1000).
**Output:** the encrypted text on one line.

```c starter
#include <stdio.h>
#include <string.h>

int main(void) {
    char s[105];
    int k;
    // read the text with fgets, remove '\n', then read k
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void) {
    char s[105];
    int k;
    fgets(s, sizeof(s), stdin);
    int len = (int)strlen(s);
    if (len > 0 && s[len - 1] == '\n') {
        s[len - 1] = '\0';
        len--;
    }
    scanf("%d", &k);
    k = k % 26;
    for (int i = 0; i < len; i++) {
        char ch = s[i];
        if (ch >= 'a' && ch <= 'z') {
            s[i] = (char)('a' + (ch - 'a' + k) % 26);
        } else if (ch >= 'A' && ch <= 'Z') {
            s[i] = (char)('A' + (ch - 'A' + k) % 26);
        }
    }
    printf("%s\n", s);
    return 0;
}
```

```test
=== input
Hello, World!
3
=== output
Khoor, Zruog!
```

```test
=== input
xyz ABC
29
=== output
abc DEF
```

```test
=== input
No change 123
0
=== output
No change 123
```

```test
=== input
Zebra-Crossing
26
=== output
Zebra-Crossing
```

```hint
Handle lower-case and upper-case letters separately. Convert the letter to a number 0 to 25 by subtracting 'a' (or 'A'), add the shift, wrap around with % 26, then add 'a' (or 'A') back.
```

```hint
Reduce k with k = k % 26 first. Characters that are not letters must be left untouched, so only change s[i] inside the two letter checks.
```
