---
id: topic-files
title: "Topic Test: File Handling"
group: topic
lesson: files
order: 114
duration: 30
covers: fopen modes (r, w, a), fclose, fprintf/fscanf, fgets/fputs, fgetc and EOF, the feof trap
summary: A short test on text files with six trace-and-debug questions and two coding problems that write a file and read it back.
---

# Question: "w" erases the file
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

int main(void) {
    FILE *fp;
    int x, n = 0, sum = 0;

    fp = fopen("d.txt", "w");
    if (fp == NULL)
        return 1;
    fprintf(fp, "10 20 30");
    fclose(fp);

    fp = fopen("d.txt", "w");
    if (fp == NULL)
        return 1;
    fprintf(fp, "5");
    fclose(fp);

    fp = fopen("d.txt", "r");
    if (fp == NULL)
        return 1;
    while (fscanf(fp, "%d", &x) == 1) {
        n++;
        sum += x;
    }
    fclose(fp);
    printf("%d %d", n, sum);
    return 0;
}
~~~
- [ ] 4 65
- [ ] 3 60
- [x] 1 5
- [ ] 1 10
> Opening a file with "w" empties it. The second fopen throws away "10 20 30", so only the number 5 can be read back: one number, sum 5.
```

# Question: Append mode
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>

int main(void) {
    FILE *fp;
    char word[20];
    char last[20] = "";
    int count = 0;

    fp = fopen("t.txt", "w");
    if (fp == NULL)
        return 1;
    fprintf(fp, "x y\n");
    fclose(fp);

    fp = fopen("t.txt", "a");
    if (fp == NULL)
        return 1;
    fprintf(fp, "z\n");
    fclose(fp);

    fp = fopen("t.txt", "r");
    if (fp == NULL)
        return 1;
    while (fscanf(fp, "%s", word) == 1) {
        count++;
        sprintf(last, "%s", word);
    }
    fclose(fp);
    printf("%d %s", count, last);
    return 0;
}
~~~
- [ ] 1 z
- [ ] 2 y
- [x] 3 z
- [ ] 3 x
> "a" keeps the old content and adds at the end, so the file holds x, y and z (three words). The last word read is z.
```

# Question: fgets keeps the newline
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <string.h>

int main(void) {
    FILE *fp;
    char line[20];
    int first = -1, total = 0;

    fp = fopen("n.txt", "w");
    if (fp == NULL)
        return 1;
    fputs("hi\n", fp);
    fputs("yo\n", fp);
    fclose(fp);

    fp = fopen("n.txt", "r");
    if (fp == NULL)
        return 1;
    while (fgets(line, sizeof(line), fp) != NULL) {
        if (first < 0)
            first = (int)strlen(line);
        total += (int)strlen(line);
    }
    fclose(fp);
    printf("%d %d", first, total);
    return 0;
}
~~~
- [ ] 2 4
- [ ] 2 6
- [x] 3 6
- [ ] 3 4
> fgets stores the '\n' too, so each line "hi\n" and "yo\n" has length 3. The first length is 3 and the total is 6.
```

# Question: Characters, newlines and EOF
marks: 2

```quiz run
What is the output of this program?
~~~
#include <stdio.h>
#include <ctype.h>

int main(void) {
    FILE *fp;
    int c;
    int chars = 0, lines = 0, letters = 0;

    fp = fopen("v.txt", "w");
    if (fp == NULL)
        return 1;
    fputs("ab\ncd\n", fp);
    fclose(fp);

    fp = fopen("v.txt", "r");
    if (fp == NULL)
        return 1;
    while ((c = fgetc(fp)) != EOF) {
        chars++;
        if (c == '\n')
            lines++;
        if (isalpha(c))
            letters++;
    }
    fclose(fp);
    printf("%d %d %d", chars, lines, letters);
    return 0;
}
~~~
- [ ] 4 2 4
- [x] 6 2 4
- [ ] 6 2 6
- [ ] 4 0 4
> The file holds the six characters a, b, newline, c, d, newline. Every character counts, including the two newlines. Only a, b, c and d are letters. The loop stops when fgetc returns EOF (kept in an int).
```

# Question: Find the bug: no check after fopen
marks: 2

```quiz
The file data.txt does not exist. What happens when this code runs?
~~~
FILE *fp = fopen("data.txt", "r");
int x;
fscanf(fp, "%d", &x);
printf("%d\n", x);
fclose(fp);
~~~
- [ ] fopen creates an empty data.txt, so x becomes 0.
- [ ] fopen stops the program with an error message.
- [x] fopen returns NULL, and using that NULL pointer in fscanf is an error: the result must be checked with if (fp == NULL).
- [ ] The file is created automatically because "r" means "read or create".
> In "r" mode fopen never creates a file. A missing file gives NULL, so always test the result before reading from it.
```

# Question: Find the bug: EOF in a char
marks: 2

```quiz
This loop is meant to copy every character of fp to the screen. What is the problem?
~~~
char c;
while ((c = fgetc(fp)) != EOF)
    putchar(c);
~~~
- [ ] putchar cannot print a char.
- [ ] fgetc must be replaced by fscanf("%c").
- [x] fgetc returns an int so that EOF (-1) can be told apart from real characters; c must be declared as int.
- [ ] The loop prints the end-of-file mark as well.
> EOF is an int value outside the range of char. Storing the result in a char can make the loop stop too early (or never stop), depending on whether char is signed. Declare `int c;`.
```

# Problem: Pass list
id: topic-files-pass-list
difficulty: easy
marks: 6
source: Original (topic test)

The file `marks.txt` already exists. It holds exam scores (integers, separated by spaces and/or newlines; at least 1 and at most 100 of them). Write a program that:

1. reads every score from `marks.txt`,
2. writes the scores that are **40 or more** into a new file `pass.txt`, one per line, in the original order,
3. closes `pass.txt`, opens it again for reading and prints each score it holds, one per line,
4. finally prints `Passed: K of N`, where K is the number of passing scores and N the total number of scores.

Check that every `fopen` succeeded.

**Input:** none (the data is in `marks.txt`).
**Output:** the passing scores, one per line, then the line `Passed: K of N`.

```c starter
#include <stdio.h>

int main(void) {
    FILE *in, *out;
    int x, n = 0, k = 0;

    in = fopen("marks.txt", "r");
    if (in == NULL) {
        printf("Cannot open marks.txt\n");
        return 1;
    }
    // write passing scores to pass.txt, then read pass.txt back and print them
    fclose(in);
    return 0;
}
```

```c solution
#include <stdio.h>

int main(void) {
    FILE *in, *out;
    int x, n = 0, k = 0;

    in = fopen("marks.txt", "r");
    if (in == NULL) {
        printf("Cannot open marks.txt\n");
        return 1;
    }
    out = fopen("pass.txt", "w");
    if (out == NULL) {
        fclose(in);
        return 1;
    }
    while (fscanf(in, "%d", &x) == 1) {
        n++;
        if (x >= 40) {
            fprintf(out, "%d\n", x);
            k++;
        }
    }
    fclose(in);
    fclose(out);

    out = fopen("pass.txt", "r");
    if (out == NULL)
        return 1;
    while (fscanf(out, "%d", &x) == 1)
        printf("%d\n", x);
    fclose(out);

    printf("Passed: %d of %d\n", k, n);
    return 0;
}
```

```test
=== file marks.txt
75 32 40 18
91 39
=== output
75
40
91
Passed: 3 of 6
```

```test
=== file marks.txt
10 20
=== output
Passed: 0 of 2
```

```test
=== file marks.txt
100
=== output
100
Passed: 1 of 1
```

```test
=== file marks.txt
40 40 39 41
=== output
40
40
41
Passed: 3 of 4
```

```hint
Read with `while (fscanf(in, "%d", &x) == 1)`. Inside the loop count every score, and when `x >= 40` write it with `fprintf(out, "%d\n", x)` and count it as passed.
```

```hint
Close `pass.txt` after writing (so the data is saved), then `fopen("pass.txt", "r")` and read it with another fscanf loop that prints each number.
```

# Problem: Numbered lines and the longest line
id: topic-files-numbered-lines
difficulty: medium
marks: 8
source: Original (topic test)

The file `text.txt` already exists and holds between 1 and 20 non-empty lines of text (each at most 80 characters, spaces allowed). Write a program that:

1. reads `text.txt` line by line with `fgets`,
2. writes a numbered copy into `numbered.txt`, where line k is written as `k: <line>` (for example `1: hello world`),
3. remembers the **first** line with the greatest length (the newline does not count as a character),
4. closes both files, opens `numbered.txt` for reading and prints its contents,
5. prints `Longest: line N (L characters)`.

Check that every `fopen` succeeded.

**Input:** none (the data is in `text.txt`).
**Output:** the lines of `numbered.txt`, then the `Longest:` line.

```c starter
#include <stdio.h>
#include <string.h>

int main(void) {
    FILE *in, *out;
    char line[128];
    int n = 0;

    in = fopen("text.txt", "r");
    if (in == NULL) {
        printf("Cannot open text.txt\n");
        return 1;
    }
    // write numbered.txt, remember the longest line
    // read numbered.txt back and print it, then the Longest: line
    fclose(in);
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>

int main(void) {
    FILE *in, *out;
    char line[128];
    int n = 0, longest = 0, longestLen = -1, len;

    in = fopen("text.txt", "r");
    if (in == NULL) {
        printf("Cannot open text.txt\n");
        return 1;
    }
    out = fopen("numbered.txt", "w");
    if (out == NULL) {
        fclose(in);
        return 1;
    }
    while (fgets(line, sizeof(line), in) != NULL) {
        len = (int)strlen(line);
        if (len > 0 && line[len - 1] == '\n') {
            line[len - 1] = '\0';
            len--;
        }
        n++;
        fprintf(out, "%d: %s\n", n, line);
        if (len > longestLen) {
            longestLen = len;
            longest = n;
        }
    }
    fclose(in);
    fclose(out);

    out = fopen("numbered.txt", "r");
    if (out == NULL)
        return 1;
    while (fgets(line, sizeof(line), out) != NULL)
        printf("%s", line);
    fclose(out);

    printf("Longest: line %d (%d characters)\n", longest, longestLen);
    return 0;
}
```

```test
=== file text.txt
hello world
hi
the quick brown fox
ok
=== output
1: hello world
2: hi
3: the quick brown fox
4: ok
Longest: line 3 (19 characters)
```

```test
=== file text.txt
single line
=== output
1: single line
Longest: line 1 (11 characters)
```

```test
=== file text.txt
abc
xyz
a b
=== output
1: abc
2: xyz
3: a b
Longest: line 1 (3 characters)
```

```test
=== file text.txt
C is fun
Files keep data after the program ends
Short
Another fairly long line here ok
=== output
1: C is fun
2: Files keep data after the program ends
3: Short
4: Another fairly long line here ok
Longest: line 2 (38 characters)
```

```hint
Remove the `'\n'` that fgets keeps before measuring the length: `if (line[len - 1] == '\n') line[len - 1] = '\0';`. Then write it back with `fprintf(out, "%d: %s\n", n, line);`.
```

```hint
Keep `longest` (line number) and `longestLen`. Update them only when the new length is strictly greater, so the first of equally long lines wins. Close `numbered.txt` before reopening it for reading.
```
