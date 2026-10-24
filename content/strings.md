---
id: strings
title: "Characters & Strings"
order: 8
summary: Characters and ASCII, ctype.h, char arrays and the null terminator, reading and printing strings, string.h, manual string algorithms and arrays of strings.
---

# Step: Characters and ASCII codes

A `char` holds **one character**, but inside the computer it is just a small integer. Each character has a number called its **ASCII code**. A few you should remember:

| Character | Code |
|---|---|
| `'A'` ... `'Z'` | 65 ... 90 |
| `'a'` ... `'z'` | 97 ... 122 |
| `'0'` ... `'9'` | 48 ... 57 |
| space `' '` | 32 |

Write a single character in **single quotes**: `'A'`. With `printf`, `%c` prints the symbol and `%d` prints the number of the same variable.

Because characters are numbers you can compare and calculate with them:

- `'b' - 'a'` is 1, and `'a' - 'A'` is 32 (the gap between lower and upper case).
- `'7' - '0'` is the number 7. This is how you turn a digit character into a digit value.
- `ch >= 'A' && ch <= 'Z'` tests for a capital letter.

```c run
#include <stdio.h>

int main(void)
{
    char ch = 'A';
    printf("%c %d\n", ch, ch);
    ch = ch + 1;
    printf("%c %d\n", ch, ch);
    printf("%d\n", 'a' - 'A');
    printf("%d\n", '7' - '0');
    return 0;
}
```
```output
A 65
B 66
32
7
```

A `char` can be used as a loop counter, so you can walk through the alphabet:

```c run
#include <stdio.h>

int main(void)
{
    char c;
    for (c = 'a'; c <= 'e'; c++) {
        printf("%c", c);
    }
    printf("\n");
    for (c = 'a'; c <= 'c'; c++) {
        printf("%c=%d\n", c, c);
    }
    return 0;
}
```
```output
abcde
a=97
b=98
c=99
```

### Common mistakes

- Using double quotes for one character: `'A'` is a character, `"A"` is a **string** (two bytes: `'A'` and `'\0'`).
- Mixing up the character `'5'` (code 53) and the number 5. To get the number, write `'5' - '0'`.
- Forgetting that `printf("%d", ch)` shows the code, not the symbol.

```quiz
What does this print?
~~~
printf("%c", 'A' + 2);
~~~
- [ ] A2
- [ ] 67
- [x] C
- [ ] B
> 'A' is 65, so 'A' + 2 is 67. With %c, code 67 is printed as the character 'C'.
```

```quiz
What is the value of the expression '9' - '0'?
- [ ] 57
- [ ] 48
- [x] 9
- [ ] 0
> The digit characters have consecutive codes, so '9' - '0' = 57 - 48 = 9.
```

# Step: Character functions in ctype.h

Writing `ch >= 'a' && ch <= 'z'` every time is tiring. The header **`<ctype.h>`** gives ready-made tests and converters. They work on one character.

| Function | Meaning |
|---|---|
| `isalpha(c)` | letter (a-z, A-Z) |
| `isdigit(c)` | digit 0-9 |
| `isalnum(c)` | letter or digit |
| `isupper(c)` / `islower(c)` | upper-case / lower-case letter |
| `isspace(c)` | space, tab, newline |
| `ispunct(c)` | punctuation such as `, . ! ?` |
| `toupper(c)` / `tolower(c)` | return the converted character (unchanged if no change is needed) |

The `is...` tests return **non-zero (true)** or **0 (false)**, so use them directly in `if`.

```c run
#include <stdio.h>
#include <ctype.h>

int main(void)
{
    char s[] = "Hello, World 42!";
    int upper = 0, lower = 0, digit = 0, space = 0, punct = 0;
    int i;

    for (i = 0; s[i] != '\0'; i++) {
        if (isupper((unsigned char)s[i])) upper++;
        else if (islower((unsigned char)s[i])) lower++;
        else if (isdigit((unsigned char)s[i])) digit++;
        else if (isspace((unsigned char)s[i])) space++;
        else if (ispunct((unsigned char)s[i])) punct++;
    }
    printf("upper=%d lower=%d digit=%d space=%d punct=%d\n", upper, lower, digit, space, punct);
    return 0;
}
```
```output
upper=2 lower=8 digit=2 space=2 punct=2
```

The `(unsigned char)` cast is a safe-programming habit for ctype functions; for plain English text it makes no visible difference.

```c run
#include <stdio.h>
#include <ctype.h>

int main(void)
{
    char ch;
    scanf(" %c", &ch);
    if (isalpha((unsigned char)ch)) {
        printf("%c is a letter, upper: %c, lower: %c\n", ch, toupper((unsigned char)ch), tolower((unsigned char)ch));
    } else {
        printf("%c is not a letter\n", ch);
    }
    return 0;
}
```
```input
q
```
```output
q is a letter, upper: Q, lower: q
```

> **Tip:** The space in `scanf(" %c", &ch)` skips leftover whitespace (like a newline) before reading the character.

### Common mistakes

- Forgetting `#include <ctype.h>`.
- Thinking `isdigit` returns exactly 1. It returns any non-zero value, so never compare it with `== 1`.
- Expecting `toupper(c)` to change `c` itself. It only **returns** the new value; write `c = toupper(c);`.

```quiz
What does toupper('b') return?
- [ ] 'b'
- [x] 'B'
- [ ] 'a'
- [ ] 'b' - 32 only works for whole strings
> toupper returns the upper-case version of a lower-case letter, here 'B' (code 66).
```

```quiz
What is the result of isalpha('5')?
- [x] 0 (false), because '5' is a digit, not a letter
- [ ] 1 (true)
- [ ] 5
- [ ] A compile error
> '5' is a digit character, so isalpha returns 0.
```

# Step: Strings and the null terminator

A **string** in C is a `char` array whose last character is the **null terminator** `'\0'` (the character with code 0). Text in double quotes gets this `'\0'` added for you.

```c
char color[6] = "green";   // g r e e n \0  -> 5 letters, 6 boxes
```

So the array must be **one element bigger** than the number of visible characters. If the array is bigger than the text, the unused boxes are filled with `'\0'`.

Functions such as `printf("%s")`, `puts` and `strlen` know where a string ends only because they stop at the first `'\0'`.

- `strlen(s)` counts the characters **before** `'\0'` (needs `<string.h>`).
- `sizeof(s)` is the size of the whole array, including the `'\0'` and any unused boxes.

```c run
#include <stdio.h>
#include <string.h>

int main(void)
{
    char color[6] = "green";
    int i;

    printf("strlen = %d, sizeof = %d\n", (int)strlen(color), (int)sizeof(color));
    for (i = 0; i < 6; i++) {
        printf("color[%d] = %d\n", i, color[i]);
    }
    return 0;
}
```
```output
strlen = 5, sizeof = 6
color[0] = 103
color[1] = 114
color[2] = 101
color[3] = 101
color[4] = 110
color[5] = 0
```

Open this in the visualizer: you can see the six boxes and the `'\0'` in the last one.

If you build a string yourself, **you must write the `'\0'`**. Moving the `'\0'` earlier cuts the string short:

```c run
#include <stdio.h>

int main(void)
{
    char w[4];
    w[0] = 'c';
    w[1] = 'a';
    w[2] = 't';
    w[3] = '\0';
    printf("%s\n", w);
    w[1] = '\0';
    printf("%s\n", w);
    return 0;
}
```
```output
cat
c
```

### Common mistakes

- Forgetting the extra box: `char s[3] = "cat";` has no room for `'\0'`. Use `char s[4]` or `char s[] = "cat";`.
- Building a string character by character and never adding `'\0'`; printing it then runs past the end (undefined behaviour).
- Treating `sizeof` as the length of the string. Use `strlen` for the length.
- Trying to assign a string after declaration: `name = "Bob";` is illegal. Use `strcpy(name, "Bob");`.

```quiz
How many bytes does this array occupy, and what does strlen give?
~~~
char s[] = "cat";
~~~
- [ ] sizeof = 3, strlen = 3
- [x] sizeof = 4, strlen = 3
- [ ] sizeof = 4, strlen = 4
- [ ] sizeof = 3, strlen = 4
> "cat" has 3 letters plus the '\0', so the array has 4 boxes, but strlen does not count the '\0'.
```

```quiz
What is the smallest safe size for an array that must hold the string "hello"?
- [ ] 5
- [x] 6
- [ ] 4
- [ ] 7
> Five letters plus one box for '\0' makes 6.
```

# Step: Reading and printing strings

**Printing:** `printf("%s", str)` prints the characters up to `'\0'`. `puts(str)` does the same and adds a newline automatically.

**Reading** has three common tools:

| Tool | Behaviour |
|---|---|
| `scanf("%s", str)` | reads **one word** (stops at the first space/newline). No `&` is needed, because an array name is already an address. |
| `gets(str)` | reads a **whole line** including spaces (taught in the course, but unsafe: it cannot limit the length and was removed from C11). |
| `fgets(str, size, stdin)` | reads a **whole line**, at most `size - 1` characters, always adds `'\0'`. **Preferred.** |

`fgets` keeps the newline `'\n'` if the line fit. To remove it, use `strcspn` from `<string.h>`:

```c
str[strcspn(str, "\n")] = '\0';
```

```c run
#include <stdio.h>
#include <string.h>

int main(void)
{
    char line[50];

    fgets(line, sizeof(line), stdin);
    line[strcspn(line, "\n")] = '\0';

    printf("Line: %s\n", line);
    printf("Length: %d\n", (int)strlen(line));
    puts(line);
    return 0;
}
```
```input
Green University
```
```output
Line: Green University
Length: 16
Green University
```

With `scanf("%s")` each word is read separately and the spaces/newlines between words are skipped:

```c run
#include <stdio.h>

int main(void)
{
    char first[20], last[20];

    scanf("%19s %19s", first, last);
    printf("%s, %s\n", last, first);
    return 0;
}
```
```input
Ada Lovelace
```
```output
Lovelace, Ada
```

> **Tip:** Put a width in `%s` (array size minus 1), like `%19s`, so a long word cannot overflow the array.

> **Note:** On a real compiler `gets` may give a warning or not exist at all. The practice site accepts it for the "gets and puts" problem because the course teaches it, but prefer `fgets` in your own programs.

### Common mistakes

- Expecting `scanf("%s", s)` to read "Good morning" fully. It stops at the space and reads only `Good`.
- Writing `scanf("%s", &s)`; for arrays use `s` without `&`.
- Forgetting that `fgets` keeps the `'\n'` in the string, which then shows up in your output or in comparisons.
- Mixing `scanf("%d", ...)` and `fgets`: scanf leaves the newline in the input, so the next `fgets` returns an empty line. Read it away first, for example with `getchar();`.

```quiz
The user types: Good morning
What does this print?
~~~
char s[30];
scanf("%s", s);
printf("%s", s);
~~~
- [ ] Good morning
- [x] Good
- [ ] morning
- [ ] Nothing
> %s stops at the first whitespace, so only the first word "Good" is stored.
```

```quiz
What does fgets(s, 4, stdin) store when the user types "abcdef"?
- [ ] abcdef
- [ ] abcd
- [x] abc followed by '\0'
- [ ] Nothing, it fails
> fgets reads at most size - 1 = 3 characters and always adds the terminating '\0'.
```

# Step: Library functions from string.h

The header **`<string.h>`** has the ready-made string tools. The ones you need first:

| Function | What it does |
|---|---|
| `strlen(s)` | length of `s` (not counting `'\0'`) |
| `strcpy(dest, src)` | copy `src` (with its `'\0'`) into `dest` |
| `strcat(dest, src)` | append `src` to the end of `dest` |
| `strcmp(a, b)` | compare alphabetically by ASCII codes: `0` if equal, negative if `a` comes first, positive if `a` comes after `b` |
| `strchr(s, c)` | pointer to the first `c` in `s`, or `NULL` |
| `strstr(s, sub)` | pointer to the first occurrence of `sub` in `s`, or `NULL` |

`dest` must be big enough for the copied or joined text **including the `'\0'`**.

```c run
#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[20] = "Hello";
    char b[20];

    strcpy(b, a);
    strcat(a, " World");
    printf("a = %s (%d)\n", a, (int)strlen(a));
    printf("b = %s (%d)\n", b, (int)strlen(b));
    return 0;
}
```
```output
a = Hello World (11)
b = Hello (5)
```

Never compare strings with `==`. For arrays, `==` compares **addresses**, not letters. Use `strcmp`.

```c run
#include <stdio.h>
#include <string.h>

int main(void)
{
    char x[] = "abc", y[] = "abc", z[] = "abd";
    char text[] = "I love Bangladesh";

    printf("%d %d %d\n", strcmp(x, y) == 0, strcmp(x, z) < 0, strcmp(z, x) > 0);
    printf("%s\n", strstr(text, "Bang"));
    printf("%s\n", strchr(text, 'v'));
    return 0;
}
```
```output
1 1 1
Bangladesh
ve Bangladesh
```

`strstr` and `strchr` return a pointer into the original string, so printing the result with `%s` prints the rest of the string from the place that was found.

> **Warning:** `strrev`, `strupr` and `strlwr` appear in some textbooks and old compilers, but they are **non-standard** (not part of C). Do not rely on them. In the exercises you will write reversing and case conversion by hand, which is also a good practice.

### Common mistakes

- `if (s1 == s2)` or `s1 = s2;` for strings. Use `strcmp` and `strcpy`.
- Copying or joining into a destination array that is too small (buffer overflow).
- Treating the result of `strcmp` as "1 for equal". It returns **0** when the strings are equal.

```quiz
What does strcmp("Zebra", "apple") return?
- [ ] 0
- [x] A negative number, because 'Z' (90) comes before 'a' (97) in ASCII
- [ ] A positive number, because Zebra is longer
- [ ] 1
> strcmp compares the first different characters by ASCII code: 'Z' = 90 is less than 'a' = 97.
```

```quiz
char a[20] = "ab";
strcat(a, "cd");
What is strlen(a) now?
- [ ] 2
- [ ] 20
- [x] 4
- [ ] 5
> a becomes "abcd", which has 4 characters before the '\0'.
```

# Step: Manual string operations: length, copy, join, compare

Every string function is just a loop that runs until `'\0'`. The standard pattern is:

```c
for (i = 0; s[i] != '\0'; i++) { ... }
```

Exams often ask you to do these **without** the library. The key rules:

- **Length:** count until `s[i] == '\0'`.
- **Copy:** copy each character, then **write `'\0'` yourself** at the end of the destination.
- **Concatenate:** continue writing at the end of the first string, then add `'\0'`.
- **Compare:** walk while both characters are equal and not `'\0'`; the first difference decides.

```c run
#include <stdio.h>

int main(void)
{
    char src[] = "data", tail[] = "base", dest[20];
    int i, j;

    for (i = 0; src[i] != '\0'; i++) {
        dest[i] = src[i];
    }
    dest[i] = '\0';
    printf("copy: %s\n", dest);

    for (j = 0; tail[j] != '\0'; j++, i++) {
        dest[i] = tail[j];
    }
    dest[i] = '\0';
    printf("joined: %s (%d chars)\n", dest, i);
    return 0;
}
```
```output
copy: data
joined: database (8 chars)
```

Notice that after the copy loop `i` already equals the length of `src` (4), so it is exactly the place where the next piece should start.

```c run
#include <stdio.h>

int main(void)
{
    char a[] = "apple", b[] = "apply";
    int i = 0;

    while (a[i] != '\0' && a[i] == b[i]) {
        i++;
    }
    if (a[i] == b[i]) {
        printf("equal\n");
    } else {
        printf("differ at index %d: %c vs %c\n", i, a[i], b[i]);
    }
    return 0;
}
```
```output
differ at index 4: e vs y
```

If both strings end together (`a[i]` and `b[i]` are both `'\0'`), the strings are equal.

### Common mistakes

- Loop condition `i <= len` (touches the `'\0'`) or `i < len - 1` (skips the last character).
- Forgetting to write `'\0'` at the end of the destination.
- Copying into an array that is too small.

```quiz
What is the value of i after this loop?
~~~
char s[] = "a b";
int i = 0;
while (s[i] != '\0') i++;
~~~
- [ ] 2
- [x] 3
- [ ] 4
- [ ] 1
> The characters are 'a', ' ' and 'b'. The space counts, so the loop stops at index 3 where '\0' is.
```

```quiz
After copying "hi" character by character into dest (without writing anything else), what must you still do?
- [ ] Nothing, the copy is complete
- [x] Write '\0' into dest after the last copied character
- [ ] Call strlen on dest
- [ ] Add one more letter
> A string must end with '\0'. A manual copy loop stops before copying it, so you add it yourself.
```

# Step: Reverse, palindrome, case conversion and counting

Combining loops and `<ctype.h>` solves the classic string tasks.

- **Reverse in place:** find the length `len`, then swap `s[i]` with `s[len-1-i]` for `i < len/2`.
- **Palindrome:** a string is a palindrome if `s[i] == s[len-1-i]` for every `i < len/2`.
- **Case conversion:** use `toupper`/`tolower`, or the ASCII gap: `c - 'a' + 'A'` turns a lower-case letter into upper case.
- **Counting:** loop over the string and increase a counter when the character meets a condition.

```c run
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[] = "stressed";
    char w[] = "level";
    int len = (int)strlen(s);
    int n = (int)strlen(w);
    int i, ok = 1;

    for (i = 0; i < len / 2; i++) {
        char t = s[i];
        s[i] = s[len - 1 - i];
        s[len - 1 - i] = t;
    }
    printf("reversed: %s\n", s);

    for (i = 0; i < n / 2; i++) {
        if (w[i] != w[n - 1 - i]) {
            ok = 0;
        }
    }
    printf("%s is %s\n", w, ok ? "a palindrome" : "not a palindrome");
    return 0;
}
```
```output
reversed: desserts
level is a palindrome
```

```c run
#include <stdio.h>
#include <ctype.h>

int main(void)
{
    char s[] = "Hello World";
    char up[20];
    int i, vowels = 0;

    for (i = 0; s[i] != '\0'; i++) {
        char c = tolower((unsigned char)s[i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
            vowels++;
        }
    }
    for (i = 0; s[i] != '\0'; i++) {
        up[i] = toupper((unsigned char)s[i]);
    }
    up[i] = '\0';

    printf("vowels: %d\n", vowels);
    printf("upper: %s\n", up);
    return 0;
}
```
```output
vowels: 3
upper: HELLO WORLD
```

> **Tip:** Convert to one case (`tolower`) before comparing letters when upper and lower case should count the same.

### Common mistakes

- Comparing letters of different case without converting: `'A' != 'a'`.
- Swapping for all `i < len` instead of `i < len / 2`; that swaps every pair twice and restores the original string.
- Modifying a string literal through a pointer (`char *p = "abc"; p[0] = 'x';` is undefined). Use an array: `char p[] = "abc";`.

```quiz
What does this print?
~~~
char s[] = "abcd";
int len = 4;
for (int i = 0; i < len / 2; i++) {
    char t = s[i]; s[i] = s[len - 1 - i]; s[len - 1 - i] = t;
}
printf("%s", s);
~~~
- [ ] abcd
- [x] dcba
- [ ] bcda
- [ ] dcbad
> The loop swaps a with d and b with c, which reverses the string.
```

```quiz
Which condition correctly tests that c is a lower-case letter?
- [ ] c > 'a' || c < 'z'
- [ ] c >= 'A' && c <= 'Z'
- [x] c >= 'a' && c <= 'z'
- [ ] c == 'a' - 'z'
> Lower-case letters have codes 97 to 122, so both bounds must hold at once.
```

# Step: Arrays of strings

To store several strings, use a **2D char array**:

```c
char names[3][10];   // 3 strings, each up to 9 letters + '\0'
```

- `names[i]` is the i-th string. Use it with `%s`, `strcpy`, `strcmp`, `strlen`.
- `names[i][j]` is the j-th character of the i-th string.
- Every row must be wide enough for the longest string **plus `'\0'`**.
- Read one word into a row with `scanf("%9s", names[i]);` (no `&`).

```c run
#include <stdio.h>
#include <string.h>

int main(void)
{
    char names[3][10] = {"Rahim", "Sumi", "Karim"};
    int i;

    for (i = 0; i < 3; i++) {
        printf("%d: %s (%d letters)\n", i, names[i], (int)strlen(names[i]));
    }
    printf("first letter of the last name: %c\n", names[2][0]);
    return 0;
}
```
```output
0: Rahim (5 letters)
1: Sumi (4 letters)
2: Karim (5 letters)
first letter of the last name: K
```

Sorting strings uses the same bubble sort as numbers, but compares with `strcmp` and swaps with `strcpy` through a temporary string:

```c run
#include <stdio.h>
#include <string.h>

int main(void)
{
    char w[3][10], tmp[10];
    int i, j;

    for (i = 0; i < 3; i++) {
        scanf("%9s", w[i]);
    }
    for (i = 0; i < 2; i++) {
        for (j = 0; j < 2 - i; j++) {
            if (strcmp(w[j], w[j + 1]) > 0) {
                strcpy(tmp, w[j]);
                strcpy(w[j], w[j + 1]);
                strcpy(w[j + 1], tmp);
            }
        }
    }
    for (i = 0; i < 3; i++) {
        printf("%s\n", w[i]);
    }
    return 0;
}
```
```input
pear apple mango
```
```output
apple
mango
pear
```

Because `strcmp` uses ASCII codes, **all upper-case words sort before lower-case words** ("Zoo" comes before "apple").

### Common mistakes

- A row that is too narrow for the longest string plus `'\0'`.
- Swapping two strings with `=` instead of `strcpy` through a temporary array.
- Using `scanf("%s", &names[i])`; write `names[i]` without `&`.

```quiz
Given char n[3][6] = {"ab", "cde", "f"}; what is n[1][2]?
- [ ] 'd'
- [x] 'e'
- [ ] "cde"
- [ ] '\0'
> n[1] is "cde", and index 2 of "cde" is 'e'.
```

```quiz
Which declaration can hold 5 names of up to 19 letters each?
- [ ] char names[5][19];
- [x] char names[5][20];
- [ ] char names[19][5];
- [ ] char names[20];
> 5 rows are needed, each with 19 letters + 1 box for '\0' = 20 columns.
```

# Problem: Read and print a string with gets() and puts()
id: str-gets-puts
difficulty: easy
source: CSE103 Task Sheet - Strings #1

Read one line of text (it may contain spaces) with `gets()` and print it back with `puts()`.

**Input:** one line, at most 100 characters.
**Output:** the same line.

```c starter
#include <stdio.h>

int main(void)
{
    char s[101];
    // read the line with gets, print it with puts
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void)
{
    char s[101];
    gets(s);
    puts(s);
    return 0;
}
```

```test
=== input
Hello Green University
=== output
Hello Green University
```

```test
=== input
C
=== output
C
```

```test
=== input
I love C programming
=== output
I love C programming
```

```hint
`gets(s)` reads the whole line including spaces. `puts(s)` prints it and adds a newline.
```

# Problem: Read and print a string with scanf() and printf()
id: str-scanf-printf
difficulty: easy
source: CSE103 Task Sheet - Strings #2

Read a string with `scanf("%s", ...)` and print it with `printf`. Remember that `%s` stops at the first whitespace, so if the input line has several words only the first one is read.

**Input:** one line of text (at most 100 characters).
**Output:** `You entered: WORD` where WORD is the first word of the input.

```c starter
#include <stdio.h>

int main(void)
{
    char word[101];
    // read one word and print it
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void)
{
    char word[101];
    scanf("%100s", word);
    printf("You entered: %s\n", word);
    return 0;
}
```

```test
=== input
Bangladesh
=== output
You entered: Bangladesh
```

```test
=== input
Hello World
=== output
You entered: Hello
```

```test
=== input
x
=== output
You entered: x
```

```hint
No `&` is needed in front of an array name in `scanf`.
```

# Problem: Length of a string (manual and strlen)
id: str-length
difficulty: easy
source: CSE103 Task Sheet - Strings #3

Read a line of text and print its length twice: once counted manually with a loop, and once with `strlen()`. Spaces count as characters.

**Input:** one line (1 to 100 characters). Read it with `fgets` and remove the newline.
**Output:** two lines:
`Manual length: N`
`strlen length: N`

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205];
    int count = 0;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    // count the characters with a loop, then print both results
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205];
    int count = 0;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    while (s[count] != '\0') {
        count++;
    }
    printf("Manual length: %d\n", count);
    printf("strlen length: %d\n", (int)strlen(s));
    return 0;
}
```

```test
=== input
I love Bangladesh
=== output
Manual length: 17
strlen length: 17
```

```test
=== input
Hello
=== output
Manual length: 5
strlen length: 5
```

```test
=== input
a
=== output
Manual length: 1
strlen length: 1
```

```test
=== input
a b c
=== output
Manual length: 5
strlen length: 5
```

```hint
Start `count` at 0 and increase it while `s[count]` is not `'\0'`.
```

# Problem: Copy a string without library functions
id: str-copy
difficulty: easy
source: CSE103 Task Sheet - Strings #4

Read a line and copy it into a second array **without** `strcpy`. Then print the copy.

**Input:** one line (1 to 100 characters).
**Output:** `Copied: TEXT`

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char src[205], dest[205];
    int i;

    fgets(src, sizeof(src), stdin);
    src[strcspn(src, "\n")] = '\0';

    // copy src into dest by hand
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char src[205], dest[205];
    int i;

    fgets(src, sizeof(src), stdin);
    src[strcspn(src, "\n")] = '\0';

    for (i = 0; src[i] != '\0'; i++) {
        dest[i] = src[i];
    }
    dest[i] = '\0';
    printf("Copied: %s\n", dest);
    return 0;
}
```

```test
=== input
Structured Programming
=== output
Copied: Structured Programming
```

```test
=== input
x
=== output
Copied: x
```

```test
=== input
C is fun
=== output
Copied: C is fun
```

```hint
Copy `src[i]` into `dest[i]` for every `i` until `'\0'`.
```

```hint
The loop stops before the `'\0'`, so write `dest[i] = '\0';` after the loop.
```

# Problem: Concatenate two strings
id: str-concat
difficulty: easy
source: CSE103 Task Sheet - Strings #5

Read two words and join them into one string (first followed by second, with nothing between them) **without** `strcat`.

**Input:** two words separated by whitespace, each at most 50 characters.
**Output:** `Result: JOINED`

```c starter
#include <stdio.h>

int main(void)
{
    char a[51], b[51], r[101];

    scanf("%50s %50s", a, b);

    // build r = a followed by b
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void)
{
    char a[51], b[51], r[101];
    int i = 0, j = 0, k = 0;

    scanf("%50s %50s", a, b);

    while (a[i] != '\0') {
        r[k++] = a[i++];
    }
    while (b[j] != '\0') {
        r[k++] = b[j++];
    }
    r[k] = '\0';
    printf("Result: %s\n", r);
    return 0;
}
```

```test
=== input
Hello World
=== output
Result: HelloWorld
```

```test
=== input
Green
University
=== output
Result: GreenUniversity
```

```test
=== input
A B
=== output
Result: AB
```

```test
=== input
CSE 103
=== output
Result: CSE103
```

```hint
Use one index `k` for the result array. Copy all of `a`, then keep `k` going while copying all of `b`.
```

# Problem: Compare two strings
id: str-compare
difficulty: easy
source: CSE103 Task Sheet - Strings #6

Read two words and print whether they are equal. The comparison is case-sensitive (`apple` and `Apple` are different).

**Input:** two words separated by whitespace (each at most 50 characters).
**Output:** `Equal` or `Not equal`.

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[51], b[51];

    scanf("%50s %50s", a, b);

    // compare with strcmp and print the result
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[51], b[51];

    scanf("%50s %50s", a, b);
    if (strcmp(a, b) == 0) {
        printf("Equal\n");
    } else {
        printf("Not equal\n");
    }
    return 0;
}
```

```test
=== input
apple apple
=== output
Equal
```

```test
=== input
apple Apple
=== output
Not equal
```

```test
=== input
abc abcd
=== output
Not equal
```

```test
=== input
a a
=== output
Equal
```

```hint
`strcmp(a, b)` returns 0 when the strings are equal. Do not use `==` on strings.
```

# Problem: Count vowels, consonants, digits and spaces
id: str-count-kinds
difficulty: medium
source: CSE103 Task Sheet - Strings #7

Read a line and count its vowels (a, e, i, o, u in either case), consonants (all other letters), digits and spaces. Other characters (punctuation) are not counted.

**Input:** one line (up to 100 characters). Read it with `fgets` and remove the newline.
**Output:** four lines:
`Vowels: V`
`Consonants: C`
`Digits: D`
`Spaces: S`

```c starter
#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main(void)
{
    char s[205];
    int v = 0, c = 0, d = 0, sp = 0;
    int i;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    // loop over s and update the four counters
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main(void)
{
    char s[205];
    int v = 0, c = 0, d = 0, sp = 0;
    int i;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    for (i = 0; s[i] != '\0'; i++) {
        char ch = s[i];
        if (isalpha((unsigned char)ch)) {
            char lc = tolower((unsigned char)ch);
            if (lc == 'a' || lc == 'e' || lc == 'i' || lc == 'o' || lc == 'u') {
                v++;
            } else {
                c++;
            }
        } else if (isdigit((unsigned char)ch)) {
            d++;
        } else if (ch == ' ') {
            sp++;
        }
    }
    printf("Vowels: %d\n", v);
    printf("Consonants: %d\n", c);
    printf("Digits: %d\n", d);
    printf("Spaces: %d\n", sp);
    return 0;
}
```

```test
=== input
Hello World 123
=== output
Vowels: 3
Consonants: 7
Digits: 3
Spaces: 2
```

```test
=== input
AEIOU aeiou
=== output
Vowels: 10
Consonants: 0
Digits: 0
Spaces: 1
```

```test
=== input
C programming, 2024!
=== output
Vowels: 3
Consonants: 9
Digits: 4
Spaces: 2
```

```test
=== input
xyz
=== output
Vowels: 0
Consonants: 3
Digits: 0
Spaces: 0
```

```hint
Check `isalpha` first. Inside it, convert with `tolower` and test the five vowels; any other letter is a consonant.
```

# Problem: Reverse a string manually
id: str-reverse
difficulty: easy
source: CSE103 Task Sheet - Strings #8

Reverse a line of text **without** `strrev` (it is not standard C) and print the result.

**Input:** one line (1 to 100 characters). Read it with `fgets` and remove the newline.
**Output:** `Reversed: TEXT`

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205];
    int len, i;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    // reverse s in place
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205];
    int len, i;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    len = (int)strlen(s);
    for (i = 0; i < len / 2; i++) {
        char t = s[i];
        s[i] = s[len - 1 - i];
        s[len - 1 - i] = t;
    }
    printf("Reversed: %s\n", s);
    return 0;
}
```

```test
=== input
Hello World
=== output
Reversed: dlroW olleH
```

```test
=== input
a
=== output
Reversed: a
```

```test
=== input
abcd
=== output
Reversed: dcba
```

```test
=== input
Level up
=== output
Reversed: pu leveL
```

```hint
Swap `s[i]` with `s[len - 1 - i]` while `i < len / 2`.
```

# Problem: Palindrome check
id: str-palindrome
difficulty: medium
source: CSE103 Task Sheet - Strings #9

A word is a palindrome if it reads the same forwards and backwards. Read one word and decide. The check is case-sensitive, so `Level` is **not** a palindrome (`L` and `l` differ).

**Input:** one word (1 to 50 characters, no spaces).
**Output:** `Palindrome` or `Not palindrome`.

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[51];
    int len, i, ok = 1;

    scanf("%50s", s);

    // compare s[i] with s[len - 1 - i]
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[51];
    int len, i, ok = 1;

    scanf("%50s", s);
    len = (int)strlen(s);
    for (i = 0; i < len / 2; i++) {
        if (s[i] != s[len - 1 - i]) {
            ok = 0;
            break;
        }
    }
    if (ok) {
        printf("Palindrome\n");
    } else {
        printf("Not palindrome\n");
    }
    return 0;
}
```

```test
=== input
madam
=== output
Palindrome
```

```test
=== input
hello
=== output
Not palindrome
```

```test
=== input
a
=== output
Palindrome
```

```test
=== input
Level
=== output
Not palindrome
```

```test
=== input
abba
=== output
Palindrome
```

```hint
Start with `ok = 1`. If any pair `s[i]` and `s[len - 1 - i]` differs, set `ok = 0`.
```

# Problem: Convert to uppercase and lowercase
id: str-case
difficulty: easy
source: CSE103 Task Sheet - Strings #10

Read a line and print it converted to upper case and to lower case. Do not use `strupr`/`strlwr` (non-standard); use a loop with `toupper`/`tolower` or the ASCII gap. Characters that are not letters stay unchanged.

**Input:** one line (up to 100 characters).
**Output:** two lines:
`Uppercase: TEXT`
`Lowercase: text`

```c starter
#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main(void)
{
    char s[205], up[205], low[205];
    int i;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    // fill up[] and low[] with the converted characters
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main(void)
{
    char s[205], up[205], low[205];
    int i;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    for (i = 0; s[i] != '\0'; i++) {
        up[i] = toupper((unsigned char)s[i]);
        low[i] = tolower((unsigned char)s[i]);
    }
    up[i] = '\0';
    low[i] = '\0';
    printf("Uppercase: %s\n", up);
    printf("Lowercase: %s\n", low);
    return 0;
}
```

```test
=== input
Hello World 123
=== output
Uppercase: HELLO WORLD 123
Lowercase: hello world 123
```

```test
=== input
CSE103
=== output
Uppercase: CSE103
Lowercase: cse103
```

```test
=== input
a
=== output
Uppercase: A
Lowercase: a
```

```hint
`toupper` and `tolower` return the converted character. Do not forget the final `'\0'` in both output arrays.
```

# Problem: Remove all spaces
id: str-remove-spaces
difficulty: easy
source: CSE103 Task Sheet - Strings #11

Read a line and print it with all spaces removed.

**Input:** one line (up to 100 characters).
**Output:** `Result: TEXT`

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205], r[205];
    int i, j = 0;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    // copy every non-space character into r
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205], r[205];
    int i, j = 0;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    for (i = 0; s[i] != '\0'; i++) {
        if (s[i] != ' ') {
            r[j++] = s[i];
        }
    }
    r[j] = '\0';
    printf("Result: %s\n", r);
    return 0;
}
```

```test
=== input
Hello World
=== output
Result: HelloWorld
```

```test
=== input
a b c
=== output
Result: abc
```

```test
=== input
NoSpaces
=== output
Result: NoSpaces
```

```test
=== input
  x  y 
=== output
Result: xy
```

```hint
Use two indices: `i` walks over the input, `j` is the next free place in the result. Increase `j` only when you copy a character.
```

# Problem: Does the first string end the second?
id: str-ends-with
difficulty: medium
source: Aptech Elementary Programming in C - Strings #1

Read two words. Print `Yes` if the first word occurs at the **end** of the second word, otherwise print `No`. A word longer than the second can never be at its end.

**Input:** two words separated by whitespace (each at most 50 characters).
**Output:** `Yes` or `No`.

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[51], b[51];
    int la, lb, i, ok = 1;

    scanf("%50s %50s", a, b);

    // compare a with the last la characters of b
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[51], b[51];
    int la, lb, i, ok = 1;

    scanf("%50s %50s", a, b);
    la = (int)strlen(a);
    lb = (int)strlen(b);

    if (la > lb) {
        ok = 0;
    } else {
        for (i = 0; i < la; i++) {
            if (a[i] != b[lb - la + i]) {
                ok = 0;
                break;
            }
        }
    }
    printf("%s\n", ok ? "Yes" : "No");
    return 0;
}
```

```test
=== input
ing programming
=== output
Yes
```

```test
=== input
gram programming
=== output
No
```

```test
=== input
abc abc
=== output
Yes
```

```test
=== input
longer abc
=== output
No
```

```hint
The last `la` characters of `b` start at index `lb - la`. Compare `a[i]` with `b[lb - la + i]`.
```

# Problem: Add a prefix to five names
id: str-prefix-names
difficulty: medium
source: Aptech Elementary Programming in C - Strings (Lab) #1

Read a prefix and then 5 names (all single words). Insert the prefix at the beginning of each name and print the modified names, one per line, with no space between the prefix and the name.

**Input:** the prefix, followed by 5 names, separated by whitespace (each at most 20 characters).
**Output:** 5 lines, each is prefix + name.

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char prefix[21], names[5][21], result[50];
    int i;

    // read the prefix and the 5 names, then print prefix + name
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char prefix[21], names[5][21], result[50];
    int i;

    scanf("%20s", prefix);
    for (i = 0; i < 5; i++) {
        scanf("%20s", names[i]);
    }
    for (i = 0; i < 5; i++) {
        strcpy(result, prefix);
        strcat(result, names[i]);
        printf("%s\n", result);
    }
    return 0;
}
```

```test
=== input
Dr.
Ali Sumi Karim Nila Raju
=== output
Dr.Ali
Dr.Sumi
Dr.Karim
Dr.Nila
Dr.Raju
```

```test
=== input
Mr
Rahim Karim Jamal Salam Babu
=== output
MrRahim
MrKarim
MrJamal
MrSalam
MrBabu
```

```test
=== input
un
happy kind lucky real fair
=== output
unhappy
unkind
unlucky
unreal
unfair
```

```hint
Build each result with `strcpy(result, prefix);` followed by `strcat(result, names[i]);`.
```

# Problem: Frequency of a character
id: str-char-frequency
difficulty: easy
source: Lab Manual - Lab 8 Task 3

Read a line of text and then a single character. Count how many times that character appears in the line. The comparison is case-sensitive.

**Input:** line 1: the text (up to 100 characters, read with `fgets`). Line 2: one character.
**Output:** `Count: N`

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205], ch;
    int i, count = 0;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';
    scanf(" %c", &ch);

    // count the occurrences of ch in s
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205], ch;
    int i, count = 0;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';
    scanf(" %c", &ch);

    for (i = 0; s[i] != '\0'; i++) {
        if (s[i] == ch) {
            count++;
        }
    }
    printf("Count: %d\n", count);
    return 0;
}
```

```test
=== input
banana
a
=== output
Count: 3
```

```test
=== input
Hello World
o
=== output
Count: 2
```

```test
=== input
Hello World
O
=== output
Count: 0
```

```test
=== input
mississippi
s
=== output
Count: 4
```

```hint
Loop over the text and increase `count` whenever `s[i] == ch`.
```

# Problem: Replace spaces with a character
id: str-replace-spaces
difficulty: easy
source: Lab Manual - Lab 8 Exercise 4

Read a line of text and then a replacement character. Print the text with every space replaced by that character.

**Input:** line 1: the text (up to 100 characters). Line 2: one non-space character.
**Output:** the modified text.

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205], ch;
    int i;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';
    scanf(" %c", &ch);

    // replace every ' ' in s by ch, then print s
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205], ch;
    int i;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';
    scanf(" %c", &ch);

    for (i = 0; s[i] != '\0'; i++) {
        if (s[i] == ' ') {
            s[i] = ch;
        }
    }
    printf("%s\n", s);
    return 0;
}
```

```test
=== input
Hello big World
_
=== output
Hello_big_World
```

```test
=== input
a b
-
=== output
a-b
```

```test
=== input
nospace
*
=== output
nospace
```

```hint
A string in an array can be changed in place: `s[i] = ch;`.
```

# Problem: Extract a substring
id: str-substring
difficulty: medium
source: Lab Manual - Lab 8 Exercise 3

Read a line of text, then a start index and a length. Print the substring that begins at index `start` (counting from 0) and has `len` characters. The input is always valid (`start + len` does not exceed the text length).

**Input:** line 1: the text (up to 100 characters). Line 2: two integers `start len`.
**Output:** the substring.

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205], sub[205];
    int start, len, i;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';
    scanf("%d %d", &start, &len);

    // copy len characters beginning at s[start] into sub
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205], sub[205];
    int start, len, i;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';
    scanf("%d %d", &start, &len);

    for (i = 0; i < len; i++) {
        sub[i] = s[start + i];
    }
    sub[len] = '\0';
    printf("%s\n", sub);
    return 0;
}
```

```test
=== input
Programming
3 4
=== output
gram
```

```test
=== input
Hello World
6 5
=== output
World
```

```test
=== input
abc
0 3
=== output
abc
```

```test
=== input
Structured Programming
0 10
=== output
Structured
```

```hint
Copy `s[start + i]` into `sub[i]` for `i` from 0 to `len - 1`, then end `sub` with `'\0'`.
```

# Problem: Count words in a line
id: str-word-count
difficulty: medium
source: Original practice problem (string scanning)

Read a line and count the words in it. A word is a group of non-space characters; there may be several spaces between words, and spaces at the start or end.

**Input:** one line (up to 100 characters).
**Output:** `Words: N`

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205];
    int i, words = 0, inWord = 0;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    // a new word starts when a non-space follows a space (or the start)
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[205];
    int i, words = 0, inWord = 0;

    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\n")] = '\0';

    for (i = 0; s[i] != '\0'; i++) {
        if (s[i] == ' ') {
            inWord = 0;
        } else if (inWord == 0) {
            inWord = 1;
            words++;
        }
    }
    printf("Words: %d\n", words);
    return 0;
}
```

```test
=== input
Hello World
=== output
Words: 2
```

```test
=== input
I love Bangladesh
=== output
Words: 3
```

```test
=== input
one
=== output
Words: 1
```

```test
=== input
a  b   c
=== output
Words: 3
```

```hint
Keep a flag `inWord`. When you meet a space set it to 0. When you meet a non-space while the flag is 0, you have found the start of a new word.
```

# Problem: Sort names alphabetically
id: str-sort-names
difficulty: hard
source: Aptech Elementary Programming in C - Arrays #1

Read `N` names (single words) and print them in alphabetical (ASCII) order, one per line. Use `strcmp` and a bubble sort. Remember that upper-case letters come before lower-case letters.

**Input:** `N` (1 to 10) on the first line, then `N` names separated by whitespace (each at most 20 characters).
**Output:** the names in sorted order, one per line.

```c starter
#include <stdio.h>
#include <string.h>

int main(void)
{
    char names[10][21], tmp[21];
    int n, i, j;

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%20s", names[i]);
    }

    // bubble sort with strcmp / strcpy, then print
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void)
{
    char names[10][21], tmp[21];
    int n, i, j;

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%20s", names[i]);
    }

    for (i = 0; i < n - 1; i++) {
        for (j = 0; j < n - 1 - i; j++) {
            if (strcmp(names[j], names[j + 1]) > 0) {
                strcpy(tmp, names[j]);
                strcpy(names[j], names[j + 1]);
                strcpy(names[j + 1], tmp);
            }
        }
    }
    for (i = 0; i < n; i++) {
        printf("%s\n", names[i]);
    }
    return 0;
}
```

```test
=== input
7
George Albert Tina Xavier Roger Tim William
=== output
Albert
George
Roger
Tim
Tina
William
Xavier
```

```test
=== input
3
pear Apple mango
=== output
Apple
mango
pear
```

```test
=== input
1
solo
=== output
solo
```

```hint
Same bubble sort as for numbers: compare neighbours `names[j]` and `names[j + 1]` with `strcmp` and swap when the first is greater.
```

```hint
Swap strings with a temporary array: `strcpy(tmp, a); strcpy(a, b); strcpy(b, tmp);`.
```
