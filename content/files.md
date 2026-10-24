---
id: files
title: File Handling
order: 14
summary: Read and write files with FILE*, fopen/fclose, fputc/fgetc, fprintf/fscanf, fgets/fputs, append mode; count, copy and store records.
---

# Step: Why files? FILE*, fopen and fclose

Variables live in memory and disappear when the program ends. A **file** keeps data on disk so it can be used later, or by another program. A program that stores student records, a log or a high-score list needs files.

In C every file is handled through a **file pointer**, of type `FILE *`:

1. **Open** the file with `fopen(name, mode)`. It returns a `FILE *`, or `NULL` on failure.
2. **Use** it (read or write).
3. **Close** it with `fclose(fp)`. This flushes the data and frees the resources.

| Mode | Meaning | If the file does not exist | If it exists |
|---|---|---|---|
| `"r"` | read | fails (`NULL`) | read from the start |
| `"w"` | write | created | **emptied first** |
| `"a"` | append | created | new data goes at the end |
| `"r+"`, `"w+"`, `"a+"` | read and write | as above | as above |
| `"rb"`, `"wb"`, `"ab"` | binary versions | | |

In this site, files are kept in a **virtual file system** and they show up in the *Files* panel next to the editor.

```c run
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("hello.txt", "w");
    if (fp == NULL) {
        printf("Cannot open file\n");
        return 1;
    }
    fprintf(fp, "Hello, file!\n");
    fclose(fp);

    printf("File written.\n");
    return 0;
}
```
```output
File written.
```

**Always check for `NULL`.** Opening a file that does not exist in `"r"` mode fails:

```c run
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("missing.txt", "r");
    if (fp == NULL) {
        printf("missing.txt does not exist\n");
        return 0;
    }
    printf("opened\n");
    fclose(fp);
    return 0;
}
```
```output
missing.txt does not exist
```

### Common mistakes

- Not checking whether `fopen` returned `NULL`, then using the pointer (crash).
- Forgetting `fclose`: data may never reach the file.
- Opening with `"w"` when you meant to keep the old content: `"w"` erases it.
- Writing the path with single backslashes in a string (`"C:\data\a.txt"`): `\d` is not what you want. Use a plain file name here.

```quiz
`fopen("data.txt", "r")` is called but data.txt does not exist. What is returned?
- [ ] An empty file is created
- [ ] 0 bytes of data
- [x] NULL
- [ ] EOF
> Read mode never creates a file. A NULL pointer tells you the open failed.
```

```quiz
Which mode erases the old content of an existing file?
- [ ] "r"
- [ ] "a"
- [x] "w"
- [ ] "rb"
> "w" truncates the file to zero length (or creates it). Use "a" to keep the old data and add to the end.
```

# Step: Characters: fputc, fgetc and EOF

The simplest way to move data is one character at a time:

- `fputc(ch, fp)` writes the character `ch` to the file.
- `fgetc(fp)` reads the next character, or returns **`EOF`** when there is nothing left.

`EOF` is a special value (usually -1) that is **not** a valid character, so store the result of `fgetc` in an **`int`**, not a `char`.

```c run
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("abc.txt", "w");
    for (char c = 'A'; c <= 'E'; c++) {
        fputc(c, fp);
    }
    fclose(fp);

    fp = fopen("abc.txt", "r");
    int ch;
    while ((ch = fgetc(fp)) != EOF) {
        putchar(ch);
    }
    putchar('\n');
    fclose(fp);
    return 0;
}
```
```output
ABCDE
```

The loop `while ((ch = fgetc(fp)) != EOF)` reads a character, stores it in `ch` and tests it, all in one expression. It is the standard pattern for reading a file until the end.

### Common mistakes

- Declaring `char ch;` for `fgetc`. On some systems a `char` can never equal `EOF`, causing an infinite loop.
- Using `while (!feof(fp))` as the loop condition. `feof` only becomes true **after** a read fails, so the last character or line is processed twice. Test the return value of the read function instead.
- Reading from a file opened in `"w"` mode (or writing to one opened in `"r"`).

```quiz
Why should the variable that stores the result of fgetc be an int?
- [ ] Because characters are 4 bytes long
- [ ] Because fgetc cannot return letters
- [x] Because it must be able to hold EOF, which is not a valid char value
- [ ] It does not matter, char is fine
> fgetc returns a character code or EOF (-1). An int can hold both, a char may not be able to tell them apart.
```

# Step: Formatted I/O: fprintf and fscanf

`fprintf` and `fscanf` work exactly like `printf` and `scanf`, except the first argument is the file pointer. They are ideal for numbers and records.

`fscanf` returns the **number of items it read successfully**, so `fscanf(fp, "%d", &x) == 1` is a good loop condition: it becomes false at end of file.

```c run
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("nums.txt", "w");
    fprintf(fp, "%d %d %d\n", 10, 20, 30);
    fclose(fp);

    fp = fopen("nums.txt", "r");
    int x, count = 0, sum = 0;
    while (fscanf(fp, "%d", &x) == 1) {
        sum += x;
        count++;
    }
    fclose(fp);

    printf("Read %d numbers, sum = %d\n", count, sum);
    return 0;
}
```
```output
Read 3 numbers, sum = 60
```

Records with several fields are read the same way:

```c run
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("marks.txt", "w");
    fprintf(fp, "%s %d\n", "Ana", 80);
    fprintf(fp, "%s %d\n", "Ben", 65);
    fclose(fp);

    fp = fopen("marks.txt", "r");
    char name[20];
    int marks;
    while (fscanf(fp, "%s %d", name, &marks) == 2) {
        printf("%s scored %d\n", name, marks);
    }
    fclose(fp);
    return 0;
}
```
```output
Ana scored 80
Ben scored 65
```

### Common mistakes

- Forgetting the file pointer: `fprintf("%d", x)` instead of `fprintf(fp, "%d", x)`.
- Forgetting `&` for numbers in `fscanf`.
- Writing fields without a separator (`"%d%d"`): they run together and cannot be read back.

```quiz
What does `fscanf(fp, "%d", &x)` return when the file has no more numbers?
- [ ] 0 always
- [ ] The last number read
- [x] A value other than 1 (EOF)
- [ ] NULL
> It returns the count of items read. At end of file it returns EOF (-1), so `== 1` is false and the loop stops.
```

# Step: Lines: fgets and fputs

To work with whole lines (text containing spaces) use:

- `fputs(text, fp)` writes a string (it does **not** add a newline).
- `fgets(buf, size, fp)` reads **one line**, at most `size - 1` characters, including the `'\n'`. It returns `NULL` at end of file.

```c run
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("poem.txt", "w");
    fputs("first line\n", fp);
    fputs("second line\n", fp);
    fclose(fp);

    fp = fopen("poem.txt", "r");
    char line[100];
    int n = 0;
    while (fgets(line, sizeof line, fp) != NULL) {
        n++;
        printf("%d: %s", n, line);   // line already ends with \n
    }
    fclose(fp);
    return 0;
}
```
```output
1: first line
2: second line
```

Because `fgets` keeps the `'\n'`, the `printf` format above has no `\n` of its own. If you need the text without the newline, replace the `'\n'` in the buffer with `'\0'`.

### Common mistakes

- Using `gets`: it cannot limit the length and is unsafe. Always use `fgets(buf, sizeof buf, stdin)` for keyboard input.
- Printing a line read by `fgets` with `"%s\n"` and getting blank lines (the string already has `'\n'`).
- A buffer that is too small: long lines are split over several `fgets` calls.

```quiz
Which function returns NULL when the end of the file is reached?
- [ ] fputs
- [ ] fprintf
- [x] fgets
- [ ] fclose
> fgets returns the buffer pointer on success and NULL at end of file (or on error).
```

# Step: Append mode

Opening with `"w"` **destroys** the old content. To add data to the end of an existing file use `"a"` (append). If the file does not exist, it is created.

```c run
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("log.txt", "w");
    fputs("one\n", fp);
    fclose(fp);

    fp = fopen("log.txt", "a");     // add at the end
    fputs("two\n", fp);
    fclose(fp);

    fp = fopen("log.txt", "r");
    char line[50];
    while (fgets(line, sizeof line, fp) != NULL) {
        printf("%s", line);
    }
    fclose(fp);
    return 0;
}
```
```output
one
two
```

Compare with opening the same file with `"w"` again:

```c run
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("log.txt", "w");
    fputs("one\n", fp);
    fclose(fp);

    fp = fopen("log.txt", "w");     // wipes "one"
    fputs("fresh\n", fp);
    fclose(fp);

    fp = fopen("log.txt", "r");
    char line[50];
    while (fgets(line, sizeof line, fp) != NULL) {
        printf("%s", line);
    }
    fclose(fp);
    return 0;
}
```
```output
fresh
```

### Common mistakes

- Using `"w"` to add a line to a log or database file. Everything before is lost.
- Appending text that does not start on a new line because the old last line had no `'\n'`. End every line with `\n`.

```quiz
A file contains "A\n". After this code, what is in the file?
~~~
FILE *fp = fopen("f.txt", "a");
fputs("B\n", fp);
fclose(fp);
~~~
- [ ] B
- [x] A then B on the next line
- [ ] Nothing, the file is empty
- [ ] B then A
> Append mode keeps the old content and writes the new text after it.
```

# Step: Counting lines, words and characters

Reading a file once character by character is enough to count everything:

- every character read adds 1 to the **character** count;
- every `'\n'` adds 1 to the **line** count;
- a **word** starts when a non-space character follows a space (or the start of the file).

```c run
#include <stdio.h>
#include <ctype.h>

int main(void) {
    FILE *fp = fopen("text.txt", "w");
    fputs("Hello world\nC is fun\nbye\n", fp);
    fclose(fp);

    fp = fopen("text.txt", "r");
    int ch, lines = 0, words = 0, chars = 0, inWord = 0;

    while ((ch = fgetc(fp)) != EOF) {
        chars++;
        if (ch == '\n') {
            lines++;
        }
        if (isspace(ch)) {
            inWord = 0;
        } else if (!inWord) {
            inWord = 1;
            words++;
        }
    }
    fclose(fp);

    printf("Lines: %d\n", lines);
    printf("Words: %d\n", words);
    printf("Chars: %d\n", chars);
    return 0;
}
```
```output
Lines: 3
Words: 6
Chars: 25
```

The variable `inWord` remembers whether we are in the middle of a word, so a word of five letters is counted once, not five times. The 25 characters include the three newline characters.

### Common mistakes

- Counting a word for every letter (no `inWord` flag).
- Counting lines by `'\n'` when the last line has no newline: the last line is missed. Counting `fgets` calls avoids this.

```quiz
Why do we need the `inWord` flag when counting words?
- [ ] To count the lines
- [x] To count a word once, at its first character, not for every letter
- [ ] To detect EOF
- [ ] To skip digits
> The flag switches on when a word starts and off at the next whitespace, so each word is counted exactly once.
```

# Step: Copying files and transforming text

Copying is a loop that reads a character from the source and writes it to the destination. Because you handle each character, you can also **change or skip** characters on the way (convert case, remove vowels, ...).

```c run
#include <stdio.h>

int main(void) {
    FILE *src = fopen("source.txt", "w");
    fputs("Copy me!\nLine 2\n", src);
    fclose(src);

    src = fopen("source.txt", "r");
    FILE *dst = fopen("dest.txt", "w");
    if (src == NULL || dst == NULL) {
        printf("File error\n");
        return 1;
    }

    int ch;
    while ((ch = fgetc(src)) != EOF) {
        fputc(ch, dst);
    }
    fclose(src);
    fclose(dst);

    dst = fopen("dest.txt", "r");
    while ((ch = fgetc(dst)) != EOF) {
        putchar(ch);
    }
    fclose(dst);
    return 0;
}
```
```output
Copy me!
Line 2
```

A transforming copy only changes the middle of the loop:

```c run
#include <stdio.h>
#include <ctype.h>

int main(void) {
    FILE *in = fopen("in.txt", "w");
    fputs("hello file", in);
    fclose(in);

    in = fopen("in.txt", "r");
    FILE *out = fopen("out.txt", "w");
    int ch;
    while ((ch = fgetc(in)) != EOF) {
        fputc(toupper(ch), out);
    }
    fclose(in);
    fclose(out);

    out = fopen("out.txt", "r");
    while ((ch = fgetc(out)) != EOF) {
        putchar(ch);
    }
    putchar('\n');
    fclose(out);
    return 0;
}
```
```output
HELLO FILE
```

### Common mistakes

- Closing the destination **after** reading it back, or never closing it: close a file you wrote before you reopen it for reading.
- Using the same file as source and destination.
- Opening the destination with `"a"` and getting the old content mixed with the copy.

```quiz
In a copy loop, which statement writes the character `ch` to the destination file `dst`?
- [ ] fprintf(ch, dst);
- [x] fputc(ch, dst);
- [ ] fgetc(ch, dst);
- [ ] putchar(dst, ch);
> `fputc(character, file)` writes one character; the character comes first, then the file pointer.
```

# Step: Storing records in a file

To save structured data, write one record per line with `fprintf`, and read it back with `fscanf`. Use `"a"` to **add** a record without losing the others. A list function simply reads until `fscanf` stops returning the expected count.

```c run
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("students.txt", "w");
    fprintf(fp, "%d %s %.2f\n", 101, "Rahim", 3.75);
    fprintf(fp, "%d %s %.2f\n", 102, "Karim", 3.2);
    fclose(fp);

    fp = fopen("students.txt", "a");          // add one more
    fprintf(fp, "%d %s %.2f\n", 103, "Salma", 3.9);
    fclose(fp);

    fp = fopen("students.txt", "r");
    int roll;
    char name[20];
    float cgpa;
    while (fscanf(fp, "%d %s %f", &roll, name, &cgpa) == 3) {
        printf("%d %s %.2f\n", roll, name, cgpa);
    }
    fclose(fp);
    return 0;
}
```
```output
101 Rahim 3.75
102 Karim 3.20
103 Salma 3.90
```

Text files are human-readable. **Binary** files store the raw bytes of memory using `fwrite` and `fread`, which is compact and can save a whole struct in one call:

```c run
#include <stdio.h>

typedef struct {
    int   roll;
    float cgpa;
} Student;

int main(void) {
    Student s = {101, 3.5f};
    FILE *fp = fopen("one.bin", "wb");
    fwrite(&s, sizeof(Student), 1, fp);   // address, size, count, file
    fclose(fp);

    Student t;
    fp = fopen("one.bin", "rb");
    fread(&t, sizeof(Student), 1, fp);
    fclose(fp);

    printf("%d %.2f\n", t.roll, t.cgpa);
    return 0;
}
```
```output
101 3.50
```

### Common mistakes

- Using `fprintf` with spaces inside a field (a name like `Mary Ann`): `fscanf("%s")` then reads two fields. Use one word per field, or `fgets`.
- Mixing text and binary modes on the same file.
- Writing a record with `"w"` each time: only the last record survives. Use `"a"`.

```quiz
You want to add one more student record to students.txt without losing the old ones. Which mode do you open the file with?
- [ ] "r"
- [ ] "w"
- [x] "a"
- [ ] "rb"
> "a" (append) keeps the existing records and writes new data at the end.
```

# Problem: Write text to a file and read it back
id: files-write-read
difficulty: easy
source: CSE103 Task Sheet - File Handling #1

Read one line of text from the keyboard, write it to a file called `note.txt`, close the file, then open it again for reading and print the text that you read from the file.

**Input:** one line of text (at most 150 characters, may contain spaces).
**Output:** `Read from file: <text>`

```c starter
#include <stdio.h>

int main(void) {
    char text[200], back[200];
    // 1. read a line with fgets(text, sizeof text, stdin)
    // 2. write it to note.txt
    // 3. read it back and print
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    char text[200], back[200];
    fgets(text, sizeof text, stdin);

    FILE *fp = fopen("note.txt", "w");
    if (fp == NULL) {
        return 1;
    }
    fputs(text, fp);
    fclose(fp);

    fp = fopen("note.txt", "r");
    if (fp == NULL) {
        return 1;
    }
    fgets(back, sizeof back, fp);
    fclose(fp);

    printf("Read from file: %s\n", back);
    return 0;
}
```
```test
=== input
Hello, File Handling!
=== output
Read from file: Hello, File Handling!
```
```test
=== input
C programming is fun
=== output
Read from file: C programming is fun
```
```hint
Use `fgets(text, sizeof text, stdin)` to read a whole line, including spaces.
```
```hint
Write with `fputs(text, fp)`, close the file, then `fopen("note.txt", "r")` and read with `fgets(back, sizeof back, fp)`.
```

# Problem: Count lines, words and characters
id: files-count-lwc
difficulty: medium
source: CSE103 Task Sheet - File Handling #2

The file `data.txt` already exists. Count its **lines**, **words** and **characters** (the characters on each line, **not counting the newline characters**). A word is a run of non-space characters. Every line, including a last line without a trailing newline, counts as one line.

**Input:** none (read `data.txt`).
**Output:**
```
Lines: <L>
Words: <W>
Characters: <C>
```

```c starter
#include <stdio.h>
#include <ctype.h>

int main(void) {
    FILE *fp = fopen("data.txt", "r");
    // count lines, words, characters
    return 0;
}
```
```c solution
#include <stdio.h>
#include <ctype.h>

int main(void) {
    FILE *fp = fopen("data.txt", "r");
    char line[256];
    int lines = 0, words = 0, chars = 0;

    if (fp == NULL) {
        printf("Cannot open data.txt\n");
        return 1;
    }
    while (fgets(line, sizeof line, fp) != NULL) {
        int inWord = 0;
        lines++;
        for (int i = 0; line[i] != '\0'; i++) {
            if (line[i] == '\n') {
                continue;
            }
            chars++;
            if (isspace((unsigned char)line[i])) {
                inWord = 0;
            } else if (!inWord) {
                inWord = 1;
                words++;
            }
        }
    }
    fclose(fp);

    printf("Lines: %d\n", lines);
    printf("Words: %d\n", words);
    printf("Characters: %d\n", chars);
    return 0;
}
```
```test
=== file data.txt
Hello world
C is fun
bye
=== output
Lines: 3
Words: 6
Characters: 22
```
```test
=== file data.txt
one
two  three
=== output
Lines: 2
Words: 3
Characters: 13
```
```test
=== file data.txt
The quick brown fox jumps over the lazy dog
=== output
Lines: 1
Words: 9
Characters: 43
```
```hint
Read the file line by line with `fgets`; each successful call is one line. Then walk through the characters of the line.
```
```hint
Use a flag `inWord`: set it to 0 on a space, and when you meet a non-space while it is 0, set it to 1 and add one to the word count. Skip the `'\n'` when counting characters.
```

# Problem: Copy one file to another
id: files-copy
difficulty: easy
source: CSE103 Task Sheet - File Handling #3

The file `source.txt` already exists. Copy its contents to a new file `copy.txt`, then open `copy.txt` and print its contents to the screen.

**Input:** none.
**Output:** the contents of the file, unchanged.

```c starter
#include <stdio.h>

int main(void) {
    FILE *src = fopen("source.txt", "r");
    // copy to copy.txt, then print copy.txt
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    FILE *src = fopen("source.txt", "r");
    FILE *dst = fopen("copy.txt", "w");
    int ch;

    if (src == NULL || dst == NULL) {
        printf("File error\n");
        return 1;
    }
    while ((ch = fgetc(src)) != EOF) {
        fputc(ch, dst);
    }
    fclose(src);
    fclose(dst);

    dst = fopen("copy.txt", "r");
    while ((ch = fgetc(dst)) != EOF) {
        putchar(ch);
    }
    fclose(dst);
    return 0;
}
```
```test
=== file source.txt
Roses are red
Violets are blue
=== output
Roses are red
Violets are blue
```
```test
=== file source.txt
Copying files is easy.
Line two.
Line three.
=== output
Copying files is easy.
Line two.
Line three.
```
```hint
Open the source with `"r"` and the destination with `"w"`. Loop with `while ((ch = fgetc(src)) != EOF) fputc(ch, dst);`.
```
```hint
Close `copy.txt` after writing, then reopen it with `"r"` to print it.
```

# Problem: Append data to a text file
id: files-append
difficulty: easy
source: CSE103 Task Sheet - File Handling #4

Create `log.txt` containing the line `Entries:`. Then **append** `n` words, one per line, to the same file (open it in append mode). Finally print the whole file.

**Input:** an integer `n` (0 ≤ n ≤ 20), then `n` words separated by spaces or newlines.
**Output:** the file content: `Entries:` followed by the n words, each on its own line.

```c starter
#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    // 1. create log.txt with "Entries:"
    // 2. append the n words
    // 3. print the file
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int n;
    char word[50];
    scanf("%d", &n);

    FILE *fp = fopen("log.txt", "w");
    fprintf(fp, "Entries:\n");
    fclose(fp);

    fp = fopen("log.txt", "a");
    for (int i = 0; i < n; i++) {
        scanf("%s", word);
        fprintf(fp, "%s\n", word);
    }
    fclose(fp);

    fp = fopen("log.txt", "r");
    char line[100];
    while (fgets(line, sizeof line, fp) != NULL) {
        printf("%s", line);
    }
    fclose(fp);
    return 0;
}
```
```test
=== input
3
red green blue
=== output
Entries:
red
green
blue
```
```test
=== input
1
solo
=== output
Entries:
solo
```
```test
=== input
0
=== output
Entries:
```
```hint
The first file open uses `"w"` (it creates the file); the second uses `"a"` so the first line is not erased.
```
```hint
Read each word with `scanf("%s", word)` and write it with `fprintf(fp, "%s\n", word)`.
```

# Problem: Student records: add and list
id: files-student-records
difficulty: medium
source: CSE103 Task Sheet - File Handling #5

Keep student records in a file `students.txt` (start with an empty file). Process commands:

- `1 name roll cgpa`: **add** the record to the end of the file (append mode) and print `Record added.`
- `2`: **list** all records in the file, one per line as `roll name cgpa` (CGPA with 2 decimals). If there are none print `No records.`
- `0`: stop.

**Input:** commands as described, one per line. Names have no spaces.

```c starter
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("students.txt", "w");   // start with an empty file
    fclose(fp);

    int cmd;
    while (scanf("%d", &cmd) == 1 && cmd != 0) {
        // handle 1 (add) and 2 (list)
    }
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    FILE *fp = fopen("students.txt", "w");
    int cmd, roll, count;
    char name[30];
    float cgpa;
    fclose(fp);

    while (scanf("%d", &cmd) == 1 && cmd != 0) {
        if (cmd == 1) {
            scanf("%s %d %f", name, &roll, &cgpa);
            fp = fopen("students.txt", "a");
            fprintf(fp, "%d %s %.2f\n", roll, name, cgpa);
            fclose(fp);
            printf("Record added.\n");
        } else if (cmd == 2) {
            count = 0;
            fp = fopen("students.txt", "r");
            while (fscanf(fp, "%d %s %f", &roll, name, &cgpa) == 3) {
                printf("%d %s %.2f\n", roll, name, cgpa);
                count++;
            }
            fclose(fp);
            if (count == 0) {
                printf("No records.\n");
            }
        }
    }
    return 0;
}
```
```test
=== input
1 Rahim 101 3.75
1 Karim 102 3.20
2
0
=== output
Record added.
Record added.
101 Rahim 3.75
102 Karim 3.20
```
```test
=== input
2
0
=== output
No records.
```
```test
=== input
1 Mina 7 4.00
2
1 Nabil 8 2.50
2
0
=== output
Record added.
7 Mina 4.00
Record added.
7 Mina 4.00
8 Nabil 2.50
```
```hint
For command 1 open the file with `"a"`, write one line with `fprintf`, and close it again. For command 2 open with `"r"`.
```
```hint
Read records with `while (fscanf(fp, "%d %s %f", &roll, name, &cgpa) == 3)`. Count the records; if the count is 0, print `No records.`
```

# Problem: Print a file's data in reverse
id: files-reverse
difficulty: medium
source: Aptech Elementary Programming in C - File Handling #1

Read one line of text, store it in a file `data.txt` (without the newline), then read the file back and print its characters in **reverse order**.

**Input:** one line of text (at most 150 characters).
**Output:** the reversed text on one line.

```c starter
#include <stdio.h>

int main(void) {
    char text[200];
    fgets(text, sizeof text, stdin);
    // write to data.txt, read it back, print reversed
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    char text[200], buf[200];
    int n = 0, ch;

    fgets(text, sizeof text, stdin);

    FILE *fp = fopen("data.txt", "w");
    for (int i = 0; text[i] != '\0' && text[i] != '\n'; i++) {
        fputc(text[i], fp);
    }
    fclose(fp);

    fp = fopen("data.txt", "r");
    while ((ch = fgetc(fp)) != EOF) {
        buf[n++] = (char)ch;
    }
    fclose(fp);

    for (int i = n - 1; i >= 0; i--) {
        putchar(buf[i]);
    }
    putchar('\n');
    return 0;
}
```
```test
=== input
Hello World
=== output
dlroW olleH
```
```test
=== input
C is fun
=== output
nuf si C
```
```test
=== input
level up 123
=== output
321 pu level
```
```hint
Read the characters of the file into an array first, counting them, then print the array from the last index down to 0.
```
```hint
Do not write the trailing `'\n'` of the input line into the file, or it would come out first when reversed.
```

# Problem: Copy a file without vowels
id: files-remove-vowels
difficulty: medium
source: Aptech Elementary Programming in C - File Handling #2

Read one line of text and store it in `in.txt`. Copy `in.txt` to `out.txt`, **leaving out all vowels** (`a e i o u`, upper and lower case). Then display the contents of `out.txt`.

**Input:** one line of text (at most 150 characters).
**Output:** the text without vowels.

```c starter
#include <stdio.h>
#include <ctype.h>

int main(void) {
    char text[200];
    fgets(text, sizeof text, stdin);
    // write in.txt, copy without vowels to out.txt, show out.txt
    return 0;
}
```
```c solution
#include <stdio.h>
#include <ctype.h>

int isVowel(int c) {
    c = tolower(c);
    return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
}

int main(void) {
    char text[200];
    int ch;

    fgets(text, sizeof text, stdin);

    FILE *in = fopen("in.txt", "w");
    fputs(text, in);
    fclose(in);

    in = fopen("in.txt", "r");
    FILE *out = fopen("out.txt", "w");
    while ((ch = fgetc(in)) != EOF) {
        if (!isVowel(ch)) {
            fputc(ch, out);
        }
    }
    fclose(in);
    fclose(out);

    out = fopen("out.txt", "r");
    while ((ch = fgetc(out)) != EOF) {
        putchar(ch);
    }
    fclose(out);
    return 0;
}
```
```test
=== input
Programming in C is Fun
=== output
Prgrmmng n C s Fn
```
```test
=== input
Education IS Easy
=== output
dctn S sy
```
```test
=== input
rhythm
=== output
rhythm
```
```hint
Write a helper `isVowel(c)` that converts `c` with `tolower` and compares it with the five vowels.
```
```hint
In the copy loop, only call `fputc` when the character is **not** a vowel.
```

# Problem: Copy a file excluding the words a, an, the
id: files-skip-articles
difficulty: medium
source: Aptech Elementary Programming in C - File Handling (Lab) #1

The file `text.txt` already exists. Copy its words to `result.txt`, leaving out the words **a**, **an** and **the** (in any letter case). Then print `result.txt` as **one line** with the remaining words separated by single spaces. The text has no punctuation, and at least one word remains.

**Input:** none.
**Output:** the remaining words on one line.

```c starter
#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main(void) {
    FILE *in = fopen("text.txt", "r");
    // read words with fscanf("%s"), skip a / an / the
    return 0;
}
```
```c solution
#include <stdio.h>
#include <string.h>
#include <ctype.h>

int isArticle(const char *w) {
    char low[50];
    int i;
    for (i = 0; w[i] != '\0' && i < 49; i++) {
        low[i] = (char)tolower((unsigned char)w[i]);
    }
    low[i] = '\0';
    return strcmp(low, "a") == 0 || strcmp(low, "an") == 0 || strcmp(low, "the") == 0;
}

int main(void) {
    FILE *in = fopen("text.txt", "r");
    FILE *out = fopen("result.txt", "w");
    char word[50];

    while (fscanf(in, "%s", word) == 1) {
        if (!isArticle(word)) {
            fprintf(out, "%s\n", word);
        }
    }
    fclose(in);
    fclose(out);

    out = fopen("result.txt", "r");
    int first = 1;
    while (fscanf(out, "%s", word) == 1) {
        if (!first) {
            printf(" ");
        }
        printf("%s", word);
        first = 0;
    }
    printf("\n");
    fclose(out);
    return 0;
}
```
```test
=== file text.txt
The cat sat on a mat
and ate an apple in the house
=== output
cat sat on mat and ate apple in house
```
```test
=== file text.txt
A an THE
there is another a
=== output
there is another
```
```test
=== file text.txt
An elephant and the ant
ate a banana
=== output
elephant and ant ate banana
```
```hint
`fscanf(in, "%s", word)` reads one whitespace-separated word at a time and returns 1 while there are words left.
```
```hint
Make a lowercase copy of the word and compare it with `"a"`, `"an"` and `"the"` using `strcmp`. Careful: "another" and "there" must be kept.
```

# Problem: Merge two sorted series using files
id: files-merge-series
difficulty: hard
source: Aptech Elementary Programming in C - File Handling (Lab) #2

Read two series of integers. Store each series in its own file (`a.txt` and `b.txt`), sort the numbers **inside each file**, then merge both series into a third file `c.txt` sorted in ascending order, and display the contents of `c.txt`.

**Input:** `n`, then `n` integers (first series), then `m`, then `m` integers (second series). 1 ≤ n, m ≤ 50.
**Output:** the numbers of `c.txt` in ascending order on one line, separated by single spaces.

```c starter
#include <stdio.h>

void save(const char *file, int a[], int n) {
    // write the n numbers to the file
}

int load(const char *file, int a[]) {
    // read all numbers from the file, return how many
    return 0;
}

int main(void) {
    return 0;
}
```
```c solution
#include <stdio.h>

void save(const char *file, int a[], int n) {
    FILE *fp = fopen(file, "w");
    for (int i = 0; i < n; i++) {
        fprintf(fp, "%d\n", a[i]);
    }
    fclose(fp);
}

int load(const char *file, int a[]) {
    FILE *fp = fopen(file, "r");
    int n = 0;
    while (fscanf(fp, "%d", &a[n]) == 1) {
        n++;
    }
    fclose(fp);
    return n;
}

void sortArr(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                int t = a[j];
                a[j] = a[j + 1];
                a[j + 1] = t;
            }
        }
    }
}

int main(void) {
    int a[100], b[100], c[100];
    int n, m, k;

    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    scanf("%d", &m);
    for (int i = 0; i < m; i++) {
        scanf("%d", &b[i]);
    }
    save("a.txt", a, n);
    save("b.txt", b, m);

    n = load("a.txt", a);
    sortArr(a, n);
    save("a.txt", a, n);

    m = load("b.txt", b);
    sortArr(b, m);
    save("b.txt", b, m);

    for (int i = 0; i < n; i++) {
        c[i] = a[i];
    }
    for (int i = 0; i < m; i++) {
        c[n + i] = b[i];
    }
    sortArr(c, n + m);
    save("c.txt", c, n + m);

    k = load("c.txt", c);
    for (int i = 0; i < k; i++) {
        if (i > 0) {
            printf(" ");
        }
        printf("%d", c[i]);
    }
    printf("\n");
    return 0;
}
```
```test
=== input
5
9 3 7 1 5
3
8 2 6
=== output
1 2 3 5 6 7 8 9
```
```test
=== input
3
5 5 1
2
4 1
=== output
1 1 4 5 5
```
```test
=== input
1
-3
4
10 -20 0 7
=== output
-20 -3 0 7 10
```
```hint
Write small helper functions: `save(file, array, count)` and `load(file, array)` that returns the count. Reuse them for all three files.
```
```hint
Steps: read both series, save, load each back and sort, save again; then copy both arrays into one, sort it, save to `c.txt`, load it and print.
```

# Problem: Student management system (menu, structs and files)
id: files-student-management
difficulty: hard
source: CSE103 Task Sheet - Integration Problems #1

Build a menu-driven student manager using an **array of structures** (up to 100 students) and a file `students.txt`. Process commands until `0`. Rolls are unique. Names have no spaces.

| Command | Meaning | Output |
|---|---|---|
| `1 roll name cgpa` | add a student | `Added.` or `Duplicate roll.` if the roll exists |
| `2 roll` | search | `Found: roll name cgpa` or `Not found.` |
| `3 roll cgpa` | update the CGPA | `Updated.` or `Not found.` |
| `4 roll` | delete (keep the order of the rest) | `Deleted.` or `Not found.` |
| `5` | list all, in order | one line `roll name cgpa` each, or `No students.` |
| `6` | save to `students.txt` | `Saved: N` (N = number of students) |
| `7` | clear the array and load from `students.txt` | `Loaded: N` |
| `0` | exit | |

Print every CGPA with 2 decimals. Use `float` for CGPA.

```c starter
#include <stdio.h>

typedef struct {
    int   roll;
    char  name[30];
    float cgpa;
} Student;

Student st[100];
int count = 0;

int findRoll(int roll) {
    // return the index or -1
    return -1;
}

int main(void) {
    int cmd;
    while (scanf("%d", &cmd) == 1 && cmd != 0) {
        // handle the commands
    }
    return 0;
}
```
```c solution
#include <stdio.h>

typedef struct {
    int   roll;
    char  name[30];
    float cgpa;
} Student;

Student st[100];
int count = 0;

int findRoll(int roll) {
    for (int i = 0; i < count; i++) {
        if (st[i].roll == roll) {
            return i;
        }
    }
    return -1;
}

int main(void) {
    int cmd;

    while (scanf("%d", &cmd) == 1 && cmd != 0) {
        if (cmd == 1) {
            Student s;
            scanf("%d %s %f", &s.roll, s.name, &s.cgpa);
            if (findRoll(s.roll) >= 0) {
                printf("Duplicate roll.\n");
            } else {
                st[count++] = s;
                printf("Added.\n");
            }
        } else if (cmd == 2) {
            int r, i;
            scanf("%d", &r);
            i = findRoll(r);
            if (i < 0) {
                printf("Not found.\n");
            } else {
                printf("Found: %d %s %.2f\n", st[i].roll, st[i].name, st[i].cgpa);
            }
        } else if (cmd == 3) {
            int r, i;
            float g;
            scanf("%d %f", &r, &g);
            i = findRoll(r);
            if (i < 0) {
                printf("Not found.\n");
            } else {
                st[i].cgpa = g;
                printf("Updated.\n");
            }
        } else if (cmd == 4) {
            int r, i;
            scanf("%d", &r);
            i = findRoll(r);
            if (i < 0) {
                printf("Not found.\n");
            } else {
                for (int j = i; j < count - 1; j++) {
                    st[j] = st[j + 1];
                }
                count--;
                printf("Deleted.\n");
            }
        } else if (cmd == 5) {
            if (count == 0) {
                printf("No students.\n");
            }
            for (int i = 0; i < count; i++) {
                printf("%d %s %.2f\n", st[i].roll, st[i].name, st[i].cgpa);
            }
        } else if (cmd == 6) {
            FILE *fp = fopen("students.txt", "w");
            for (int i = 0; i < count; i++) {
                fprintf(fp, "%d %s %.2f\n", st[i].roll, st[i].name, st[i].cgpa);
            }
            fclose(fp);
            printf("Saved: %d\n", count);
        } else if (cmd == 7) {
            FILE *fp = fopen("students.txt", "r");
            Student s;
            count = 0;
            if (fp != NULL) {
                while (count < 100 && fscanf(fp, "%d %s %f", &s.roll, s.name, &s.cgpa) == 3) {
                    st[count++] = s;
                }
                fclose(fp);
            }
            printf("Loaded: %d\n", count);
        }
    }
    return 0;
}
```
```test
=== input
1 101 Rahim 3.50
1 102 Karim 3.20
1 103 Salma 3.90
2 102
3 102 3.60
4 101
5
6
0
=== output
Added.
Added.
Added.
Found: 102 Karim 3.20
Updated.
Deleted.
102 Karim 3.60
103 Salma 3.90
Saved: 2
```
```test
=== input
1 5 Ali 2.50
1 6 Bina 3.00
6
4 5
4 6
5
7
5
2 9
0
=== output
Added.
Added.
Saved: 2
Deleted.
Deleted.
No students.
Loaded: 2
5 Ali 2.50
6 Bina 3.00
Not found.
```
```test
=== input
1 7 Zed 1.00
1 7 Amy 2.00
3 8 1.0
5
0
=== output
Added.
Duplicate roll.
Not found.
7 Zed 1.00
```
```hint
Write a helper `findRoll(roll)` that returns the index of a student or -1. Every command except add and list needs it.
```
```hint
Delete by shifting every later element one place left (`st[j] = st[j + 1]`) and decreasing `count`.
```
```hint
Save writes one line per student with `fprintf`. Load sets `count = 0` and reads with `fscanf(...) == 3` into `st[count++]`.
```

# Problem: Library management system
id: files-library-management
difficulty: hard
source: CSE103 Task Sheet - Integration Problems #2

Build a library system with an array of structures (up to 100 books) and a file `library.txt`. A book has an **id** (integer, unique), **title** and **author** (single words) and an **issued** flag. Process commands until `0`:

| Command | Meaning | Output |
|---|---|---|
| `1 id title author` | add a book (available) | `Added.` |
| `2 id` | issue a book | `Issued.`, `Already issued.` or `Not found.` |
| `3 id` | return a book | `Returned.`, `Not issued.` or `Not found.` |
| `4 word` | search: every book whose title **or** author is exactly `word` | one line per match in the list format, or `No match.` |
| `5` | list all books in insertion order | one line per book, or nothing if empty |
| `6` | save to `library.txt`, clear memory, load it back | `Books reloaded: N` |
| `0` | exit | |

**List format:** `id title author Status` where Status is `Available` or `Issued`.

```c starter
#include <stdio.h>
#include <string.h>

typedef struct {
    int  id;
    char title[30];
    char author[30];
    int  issued;
} Book;

Book lib[100];
int count = 0;

int main(void) {
    int cmd;
    while (scanf("%d", &cmd) == 1 && cmd != 0) {
        // handle the commands
    }
    return 0;
}
```
```c solution
#include <stdio.h>
#include <string.h>

typedef struct {
    int  id;
    char title[30];
    char author[30];
    int  issued;
} Book;

Book lib[100];
int count = 0;

int findId(int id) {
    for (int i = 0; i < count; i++) {
        if (lib[i].id == id) {
            return i;
        }
    }
    return -1;
}

void showBook(Book b) {
    printf("%d %s %s %s\n", b.id, b.title, b.author, b.issued ? "Issued" : "Available");
}

int main(void) {
    int cmd;

    while (scanf("%d", &cmd) == 1 && cmd != 0) {
        if (cmd == 1) {
            Book b;
            scanf("%d %s %s", &b.id, b.title, b.author);
            b.issued = 0;
            lib[count++] = b;
            printf("Added.\n");
        } else if (cmd == 2) {
            int id, i;
            scanf("%d", &id);
            i = findId(id);
            if (i < 0) {
                printf("Not found.\n");
            } else if (lib[i].issued) {
                printf("Already issued.\n");
            } else {
                lib[i].issued = 1;
                printf("Issued.\n");
            }
        } else if (cmd == 3) {
            int id, i;
            scanf("%d", &id);
            i = findId(id);
            if (i < 0) {
                printf("Not found.\n");
            } else if (!lib[i].issued) {
                printf("Not issued.\n");
            } else {
                lib[i].issued = 0;
                printf("Returned.\n");
            }
        } else if (cmd == 4) {
            char word[30];
            int found = 0;
            scanf("%s", word);
            for (int i = 0; i < count; i++) {
                if (strcmp(lib[i].title, word) == 0 || strcmp(lib[i].author, word) == 0) {
                    showBook(lib[i]);
                    found = 1;
                }
            }
            if (!found) {
                printf("No match.\n");
            }
        } else if (cmd == 5) {
            for (int i = 0; i < count; i++) {
                showBook(lib[i]);
            }
        } else if (cmd == 6) {
            FILE *fp = fopen("library.txt", "w");
            Book b;
            for (int i = 0; i < count; i++) {
                fprintf(fp, "%d %s %s %d\n", lib[i].id, lib[i].title, lib[i].author, lib[i].issued);
            }
            fclose(fp);
            count = 0;
            fp = fopen("library.txt", "r");
            while (count < 100 && fscanf(fp, "%d %s %s %d", &b.id, b.title, b.author, &b.issued) == 4) {
                lib[count++] = b;
            }
            fclose(fp);
            printf("Books reloaded: %d\n", count);
        }
    }
    return 0;
}
```
```test
=== input
1 1 Dune Herbert
1 2 Emma Austen
1 3 Persuasion Austen
2 2
2 2
4 Austen
3 2
3 2
5
6
5
0
=== output
Added.
Added.
Added.
Issued.
Already issued.
2 Emma Austen Issued
3 Persuasion Austen Available
Returned.
Not issued.
1 Dune Herbert Available
2 Emma Austen Available
3 Persuasion Austen Available
Books reloaded: 3
1 Dune Herbert Available
2 Emma Austen Available
3 Persuasion Austen Available
```
```test
=== input
1 10 Ulysses Joyce
2 10
6
5
4 Dune
2 99
0
=== output
Added.
Issued.
Books reloaded: 1
10 Ulysses Joyce Issued
No match.
Not found.
```
```test
=== input
1 1 Dune Herbert
1 2 Emma Austen
4 Dune
4 Emma
3 1
0
=== output
Added.
Added.
1 Dune Herbert Available
2 Emma Austen Available
Not issued.
```
```hint
Keep an `issued` flag (0 or 1) in the struct. Issue checks the flag first, then sets it; return does the reverse.
```
```hint
Search compares the keyword with both fields using `strcmp(..., word) == 0`.
```
```hint
For command 6 write every book with `fprintf(fp, "%d %s %s %d\n", ...)`, set `count = 0`, then read them back with `fscanf(...) == 4`. The issued flag must survive the round trip.
```

# Problem: Banking operations with a transaction log
id: files-banking
difficulty: hard
source: CSE103 Task Sheet - Integration Problems #3

Simulate a small bank using functions, an array of structures (up to 50 accounts) and a **transaction log file** `log.txt`. Start by creating an empty log (open with `"w"`). Process commands until `0`:

| Command | Meaning | Output |
|---|---|---|
| `1 accno name amount` | create account with opening balance | `Account created.` or `Account exists.` |
| `2 accno amount` | deposit | `Deposited.` |
| `3 accno amount` | withdraw | `Withdrawn.` |
| `4 accno` | balance inquiry | `Balance: B` (2 decimals) |
| `5` | print the whole log file | one line per logged transaction |
| `0` | exit | |

Rules for commands 2 and 3, checked in this order: unknown account gives `No such account.`; amount <= 0 gives `Invalid amount.`; for a withdrawal that is more than the balance print `Insufficient funds.` (withdrawing exactly the balance is allowed). Command 4 on an unknown account prints `No such account.`

Each **successful** create, deposit and withdrawal appends one line to `log.txt`: `accno TYPE amount` where TYPE is `CREATE`, `DEPOSIT` or `WITHDRAW` and the amount has 2 decimals. Balances are `double`.

```c starter
#include <stdio.h>

typedef struct {
    int    no;
    char   name[30];
    double balance;
} Account;

Account acc[50];
int count = 0;

void logTransaction(int no, const char *type, double amount) {
    // append "no TYPE amount" to log.txt
}

int main(void) {
    FILE *fp = fopen("log.txt", "w");
    fclose(fp);
    int cmd;
    while (scanf("%d", &cmd) == 1 && cmd != 0) {
        // handle the commands
    }
    return 0;
}
```
```c solution
#include <stdio.h>
#include <string.h>

typedef struct {
    int    no;
    char   name[30];
    double balance;
} Account;

Account acc[50];
int count = 0;

int find(int no) {
    for (int i = 0; i < count; i++) {
        if (acc[i].no == no) {
            return i;
        }
    }
    return -1;
}

void logTransaction(int no, const char *type, double amount) {
    FILE *fp = fopen("log.txt", "a");
    fprintf(fp, "%d %s %.2f\n", no, type, amount);
    fclose(fp);
}

int main(void) {
    FILE *fp = fopen("log.txt", "w");
    int cmd;
    fclose(fp);

    while (scanf("%d", &cmd) == 1 && cmd != 0) {
        if (cmd == 1) {
            int no;
            char name[30];
            double amt;
            scanf("%d %s %lf", &no, name, &amt);
            if (find(no) >= 0) {
                printf("Account exists.\n");
            } else {
                acc[count].no = no;
                strcpy(acc[count].name, name);
                acc[count].balance = amt;
                count++;
                logTransaction(no, "CREATE", amt);
                printf("Account created.\n");
            }
        } else if (cmd == 2 || cmd == 3) {
            int no, i;
            double amt;
            scanf("%d %lf", &no, &amt);
            i = find(no);
            if (i < 0) {
                printf("No such account.\n");
            } else if (amt <= 0) {
                printf("Invalid amount.\n");
            } else if (cmd == 2) {
                acc[i].balance += amt;
                logTransaction(no, "DEPOSIT", amt);
                printf("Deposited.\n");
            } else if (amt > acc[i].balance) {
                printf("Insufficient funds.\n");
            } else {
                acc[i].balance -= amt;
                logTransaction(no, "WITHDRAW", amt);
                printf("Withdrawn.\n");
            }
        } else if (cmd == 4) {
            int no, i;
            scanf("%d", &no);
            i = find(no);
            if (i < 0) {
                printf("No such account.\n");
            } else {
                printf("Balance: %.2f\n", acc[i].balance);
            }
        } else if (cmd == 5) {
            char line[100];
            fp = fopen("log.txt", "r");
            while (fgets(line, sizeof line, fp) != NULL) {
                printf("%s", line);
            }
            fclose(fp);
        }
    }
    return 0;
}
```
```test
=== input
1 1001 Rahim 500
2 1001 250.50
3 1001 100
3 1001 1000
4 1001
2 9999 10
5
0
=== output
Account created.
Deposited.
Withdrawn.
Insufficient funds.
Balance: 650.50
No such account.
1001 CREATE 500.00
1001 DEPOSIT 250.50
1001 WITHDRAW 100.00
```
```test
=== input
1 1 Ann 100
1 2 Bob 50
3 2 50
4 2
2 1 25
4 1
2 1 -5
5
0
=== output
Account created.
Account created.
Withdrawn.
Balance: 0.00
Deposited.
Balance: 125.00
Invalid amount.
1 CREATE 100.00
2 CREATE 50.00
2 WITHDRAW 50.00
1 DEPOSIT 25.00
```
```test
=== input
1 5 Zoe 10
1 5 Yan 20
4 5
4 6
0
=== output
Account created.
Account exists.
Balance: 10.00
No such account.
```
```hint
Write helper functions: `find(accno)` returning an index or -1, and `logTransaction(accno, type, amount)` that opens `log.txt` in `"a"` mode, writes one line and closes it.
```
```hint
Commands 2 and 3 share the first checks (account exists, amount > 0). Only after those do you branch on deposit or withdrawal.
```
```hint
Command 5 simply opens `log.txt` for reading and prints it with a `fgets` loop.
```

# Problem: Quiz game with questions loaded from a file
id: files-quiz-game
difficulty: hard
source: CSE103 Task Sheet - Integration Problems #4

The file `quiz.txt` already exists. Its first line is the number of questions `n`. Each question then takes **6 lines**: the question text, four option lines (`A) ...`, `B) ...`, `C) ...`, `D) ...`) and a line with the correct letter.

Write a quiz program. For question `i` (starting at 1):

1. print `Q<i>: <question text>`, then the four option lines;
2. read the player's answer (a single letter, upper or lower case) from the keyboard;
3. print `Correct!` or `Wrong! Answer: <letter>`.

After all questions, write `Score: s/n` to a file `result.txt`, then read that file back and print it.

**Input:** `n` answer letters separated by whitespace.

```c starter
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

int main(void) {
    FILE *fp = fopen("quiz.txt", "r");
    // read n, then loop over the questions
    return 0;
}
```
```c solution
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

void trim(char *s) {
    int n = (int)strlen(s);
    while (n > 0 && (s[n - 1] == '\n' || s[n - 1] == '\r')) {
        s[--n] = '\0';
    }
}

int main(void) {
    FILE *fp = fopen("quiz.txt", "r");
    char line[100], question[100], opt[4][100];
    int n, score = 0;

    if (fp == NULL) {
        printf("Cannot open quiz.txt\n");
        return 1;
    }
    fgets(line, sizeof line, fp);
    n = atoi(line);

    for (int i = 1; i <= n; i++) {
        char correct, ans;

        fgets(question, sizeof question, fp);
        trim(question);
        for (int k = 0; k < 4; k++) {
            fgets(opt[k], sizeof opt[k], fp);
            trim(opt[k]);
        }
        fgets(line, sizeof line, fp);
        correct = line[0];

        printf("Q%d: %s\n", i, question);
        for (int k = 0; k < 4; k++) {
            printf("%s\n", opt[k]);
        }

        scanf(" %c", &ans);
        ans = (char)toupper((unsigned char)ans);
        if (ans == correct) {
            score++;
            printf("Correct!\n");
        } else {
            printf("Wrong! Answer: %c\n", correct);
        }
    }
    fclose(fp);

    fp = fopen("result.txt", "w");
    fprintf(fp, "Score: %d/%d\n", score, n);
    fclose(fp);

    fp = fopen("result.txt", "r");
    fgets(line, sizeof line, fp);
    printf("%s", line);
    fclose(fp);
    return 0;
}
```
```test
=== file quiz.txt
3
Capital of Bangladesh?
A) Dhaka
B) Delhi
C) Dhanbad
D) Doha
A
Which symbol ends a C statement?
A) .
B) ;
C) :
D) ,
B
What is sizeof(char)?
A) 1
B) 2
C) 4
D) 8
A
=== input
A B B
=== output
Q1: Capital of Bangladesh?
A) Dhaka
B) Delhi
C) Dhanbad
D) Doha
Correct!
Q2: Which symbol ends a C statement?
A) .
B) ;
C) :
D) ,
Correct!
Q3: What is sizeof(char)?
A) 1
B) 2
C) 4
D) 8
Wrong! Answer: A
Score: 2/3
```
```test
=== file quiz.txt
3
Capital of Bangladesh?
A) Dhaka
B) Delhi
C) Dhanbad
D) Doha
A
Which symbol ends a C statement?
A) .
B) ;
C) :
D) ,
B
What is sizeof(char)?
A) 1
B) 2
C) 4
D) 8
A
=== input
a b a
=== output
Q1: Capital of Bangladesh?
A) Dhaka
B) Delhi
C) Dhanbad
D) Doha
Correct!
Q2: Which symbol ends a C statement?
A) .
B) ;
C) :
D) ,
Correct!
Q3: What is sizeof(char)?
A) 1
B) 2
C) 4
D) 8
Correct!
Score: 3/3
```
```test
=== file quiz.txt
2
Which keyword makes a loop that runs at least once?
A) for
B) while
C) do
D) goto
C
Which header declares printf?
A) stdio.h
B) stdlib.h
C) string.h
D) math.h
A
=== input
D D
=== output
Q1: Which keyword makes a loop that runs at least once?
A) for
B) while
C) do
D) goto
Wrong! Answer: C
Q2: Which header declares printf?
A) stdio.h
B) stdlib.h
C) string.h
D) math.h
Wrong! Answer: A
Score: 0/2
```
```hint
Read the first line with `fgets` and convert it with `atoi`. Every question then needs six `fgets` calls: the question, four options, the answer line (its first character is the letter).
```
```hint
Remove the trailing `'\n'` from each line you read before printing it, or you will get blank lines.
```
```hint
Read the player's letter with `scanf(" %c", &ans)` (the space before `%c` skips whitespace) and convert it with `toupper` before comparing.
```
