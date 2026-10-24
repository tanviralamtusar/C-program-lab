---
id: basics
title: "Basics: Your First C Programs"
order: 1
summary: Structure of a C program, printf and escape sequences, comments, variables, data types, format specifiers, scanf and simple formulas.
---

# Step: The structure of a C program

A program is a list of instructions the computer follows one by one, like a recipe. C is a mid-level language: it reads almost like English, but it lets you control the machine closely. A computer only understands 0s and 1s, so your C code is first **compiled** into machine code and then run.

Every C program has a function called `main`. **Execution always starts at `main`.**

```c run
#include <stdio.h>

int main(void) {
    printf("Hello, World!\n");
    return 0;
}
```
```output
Hello, World!
```

| Part | Meaning |
|---|---|
| `#include <stdio.h>` | Pulls in the standard input/output library (needed for `printf` and `scanf`) |
| `int main(void)` | The entry point: every C program starts here |
| `{ }` | Start and end of a block (here, the body of `main`) |
| `printf("...");` | Prints text on the screen |
| `;` | Ends every statement |
| `return 0;` | Ends `main`; `0` means "finished successfully" |

Statements run from top to bottom. Add a second `printf` and it runs after the first one:

```c run
#include <stdio.h>

int main(void) {
    printf("Step 1\n");
    printf("Step 2\n");
    printf("Step 3\n");
    return 0;
}
```
```output
Step 1
Step 2
Step 3
```

> **Note:** To build a program on your own computer you would run `gcc main.c -o main` and then start `main`. On this site, just press Run.

### Common mistakes

- Forgetting a semicolon `;` at the end of a statement, or a closing `}`.
- Forgetting `#include <stdio.h>` before using `printf`.
- Writing `Main` or `MAIN`: C is **case sensitive**, so it is not `main`.
- Writing `printf` with a capital P or forgetting the quotes around the text.

```quiz
Where does a C program start executing?
- [ ] At the first line of the file
- [ ] At the first #include
- [x] At main()
- [ ] At the last function
> Execution always begins at main(), no matter where it appears in the file.
```

```quiz
What does `return 0;` at the end of main tell the operating system?
- [ ] An error happened
- [x] The program finished successfully
- [ ] Print the number zero
- [ ] Nothing at all
> By convention 0 means success.
```

# Step: Printing text and escape sequences

`printf` prints whatever is inside the double quotes. It does **not** add a new line by itself. To control the layout, use **escape sequences**: a backslash followed by a letter.

| Sequence | Meaning |
|---|---|
| `\n` | New line |
| `\t` | Tab |
| `\\` | One backslash |
| `\"` | A double quote |
| `%%` | A percent sign (because `%` starts a format specifier) |

```c run
#include <stdio.h>

int main(void) {
    printf("Hello, World!\n");
    printf("She said \"hi\"\n");
    printf("Folder: C:\\code\n");
    printf("100%% done\n");
    printf("A\tB\n");
    return 0;
}
```
```output
Hello, World!
She said "hi"
Folder: C:\code
100% done
A	B
```

(In the last line, the gap between `A` and `B` is one tab.)

### Comments

A **comment** is a note for humans; the compiler ignores it. Use `//` for one line or `/* ... */` for several lines.

```c run
#include <stdio.h>

/* This program prints a message.
   Comments can span several lines. */
int main(void) {
    // this line is ignored too
    printf("Learning C\n"); // a comment after code
    return 0;
}
```
```output
Learning C
```

> **Tip:** Only `\n` makes a new line. A forward slash `/n` is not an escape sequence: `printf("a/nb")` prints `a/nb`.

### Common mistakes

- Using `/n` instead of `\n`.
- Forgetting `\n`, so the next output glues onto the same line.
- Forgetting to escape a quote inside a string: `"She said "hi""` is a syntax error.
- Writing `printf("100%")`: write `%%` to print a percent sign.

```quiz
What does this print?
~~~
printf("a\nb");
~~~
- [ ] a\nb
- [x] a, then b on the next line
- [ ] ab
- [ ] a/nb
> \n is the new-line escape, so b starts on a new line.
```

```quiz
What does this print?
~~~
printf("Hi\\n");
~~~
- [ ] Hi followed by a new line
- [x] Hi\n
- [ ] Hi/n
- [ ] A compile error
> \\ prints one backslash, and then n is just an ordinary letter.
```

```quiz
What is the correct way to print 50%?
- [ ] printf("50%");
- [ ] printf("50\%");
- [x] printf("50%%");
- [ ] printf("50/%");
> %% prints a single percent sign.
```

# Step: Variables, constants and identifiers

A **variable** is a named box in memory that holds a value, and the value can change while the program runs. Declare a variable with `type name = value;` (the `= value` part is optional).

```c
int age = 20;      // whole number
float height;      // declared, no value yet
char grade = 'A';  // one character, in single quotes
```

`y = x;` **copies** the current value of `x`; changing `x` later does not change `y`. And `z = z + 6;` is not a maths equation: it means "take the current `z`, add 6, store it back in `z`".

```c run
#include <stdio.h>

int main(void) {
    int x, y;
    x = 1;
    y = x;
    x = 2;
    printf("%d\n", y);

    int z = 5;
    printf("%d", z);
    z = 7;
    printf("%d", z);
    z = z + 6;
    printf("%d", z);
    z = z - 20;
    printf("%d\n", z);
    return 0;
}
```
```output
1
5713-7
```

The values of `z` over time are 5, 7, 13, -7. There is no `\n` between those `printf` calls, so the numbers run together.

### Rules for identifiers (names)

- Must start with a letter or underscore `_`; the rest can be letters, digits and underscores.
- No spaces, and it cannot be a keyword such as `int` or `return`.
- Uppercase and lowercase are different: `Age` and `age` are two variables.
- Choose meaningful names (`total_marks`, not `t1`).

A **constant** is a value that never changes: `15`, `'A'`, `3.5`. You can also make a named constant with `const`:

```c run
#include <stdio.h>

int main(void) {
    const double PI = 3.14159;
    double r = 2.0;
    printf("%.2f\n", PI * r * r);
    return 0;
}
```
```output
12.57
```

### Common mistakes

- Using a variable before giving it a value: it holds garbage.
- Starting a name with a digit (`2cats`), using a space (`my var`) or a keyword (`int`).
- Mixing case: `Total` and `total` are different names.
- Thinking `y = x;` links `y` to `x` forever.

```quiz
What does this print?
~~~
int x = 4;
int y = x;
x = x * 2;
printf("%d %d", x, y);
~~~
- [ ] 4 4
- [ ] 8 8
- [x] 8 4
- [ ] 4 8
> y copied 4 before x was doubled to 8.
```

```quiz
Which of these is a valid C variable name?
- [ ] 2cats
- [ ] my var
- [ ] int
- [x] _count
> A name may start with an underscore. The others start with a digit, contain a space, or are a keyword.
```

```quiz
After `int x = 5; x = x - 20;` what is x?
- [ ] 15
- [x] -15
- [ ] 5
- [ ] 25
> 5 - 20 = -15.
```

# Step: Data types and sizeof

Every variable has a **type** that says what kind of value it stores and how much memory it uses.

| Type | Stores | Typical size |
|---|---|---|
| `char` | one character (really a small integer, its ASCII code) | 1 byte |
| `short` | small whole number | 2 bytes |
| `int` | whole number | 4 bytes |
| `long long` | very large whole number | 8 bytes |
| `float` | decimal number, about 6-7 digits of precision | 4 bytes |
| `double` | decimal number, about 15-16 digits of precision | 8 bytes |

`unsigned` types (like `unsigned int`) hold zero and positive numbers only, with twice the positive range. The `sizeof` operator tells you how many bytes a type or variable uses. Sizes can differ between machines, so check with `sizeof` instead of guessing.

```c run
#include <stdio.h>

int main(void) {
    printf("char      : %d byte(s)\n", (int)sizeof(char));
    printf("short     : %d byte(s)\n", (int)sizeof(short));
    printf("int       : %d byte(s)\n", (int)sizeof(int));
    printf("long long : %d byte(s)\n", (int)sizeof(long long));
    printf("float     : %d byte(s)\n", (int)sizeof(float));
    printf("double    : %d byte(s)\n", (int)sizeof(double));
    return 0;
}
```
```output
char      : 1 byte(s)
short     : 2 byte(s)
int       : 4 byte(s)
long long : 8 byte(s)
float     : 4 byte(s)
double    : 8 byte(s)
```

Choose the type that fits the data:

```c run
#include <stdio.h>

int main(void) {
    int age = 25;
    long long population = 7830000000LL;
    float price = 19.05;
    double pi = 3.141592653589793;
    printf("%d\n", age);
    printf("%lld\n", population);
    printf("%.2f\n", price);
    printf("%.10f\n", pi);
    return 0;
}
```
```output
25
7830000000
19.05
3.1415926536
```

> **Note:** Old textbooks describe a 2-byte `int` (range -32768 to 32767). Modern computers use a 4-byte `int` (about -2.1 billion to 2.1 billion). The number `7830000000` does not fit in an `int`, so we use `long long` and the suffix `LL`.

Assigning a decimal to an `int` throws away the fractional part: `int a = 23.34;` stores `23`.

### Common mistakes

- Storing a huge number in an `int`: it overflows. Use `long long`.
- Assuming sizes are the same on every machine.
- Using `float` when you need many digits of precision. Prefer `double`.
- Writing a character in double quotes: `char c = "D";` is wrong. Use `'D'`.

```quiz
What is `sizeof(char)` in C?
- [x] 1 byte
- [ ] 2 bytes
- [ ] 4 bytes
- [ ] It depends on the machine
> A char is always exactly 1 byte.
```

```quiz
Which type should store the value 7830000000 safely?
- [ ] int
- [ ] short
- [x] long long
- [ ] char
> It does not fit in 32 bits, but long long has 64 bits.
```

```quiz
What does this print?
~~~
int a = 23.34;
printf("%d", a);
~~~
- [ ] 23.34
- [x] 23
- [ ] 24
- [ ] 0
> An int cannot hold a fraction; the .34 is cut off (truncated, not rounded).
```

# Step: Format specifiers

A **format specifier** is a placeholder inside a `printf` string. It starts with `%` and a letter that tells `printf` the type of the value. The specifier must match the type of the variable.

| Type | Specifier | Example output |
|---|---|---|
| `int` | `%d` | `15` |
| `float` / `double` | `%f` | `5.990000` |
| `char` | `%c` | `D` |
| string | `%s` | `Hello` |
| `long long` | `%lld` | `7830000000` |
| `unsigned int` | `%u` | `42` |
| `int` in octal / hex | `%o` / `%x` or `%X` | `101` / `41` |

`%f` prints 6 digits after the decimal point. Use `%.2f` to print exactly 2.

```c run
#include <stdio.h>

int main(void) {
    int myNum = 15;
    float myFloatNum = 5.99;
    char myLetter = 'D';

    printf("%d\n", myNum);
    printf("%f\n", myFloatNum);
    printf("%.2f\n", myFloatNum);
    printf("%c\n", myLetter);
    return 0;
}
```
```output
15
5.990000
5.99
D
```

A `char` is really a small integer (its **ASCII code**). `%c` shows the character, `%d` shows the code:

```c run
#include <stdio.h>

int main(void) {
    char ch = 'A';
    printf("%c %d %o %X\n", ch, ch, ch, ch);
    return 0;
}
```
```output
A 65 101 41
```

You can also set a **width** and padding: `%5d` right-aligns in 5 columns, `%-5d` left-aligns, `%05d` pads with zeros, and `%8.3f` uses 8 columns with 3 decimals.

```c run
#include <stdio.h>

int main(void) {
    printf("[%5d]\n", 42);
    printf("[%-5d]\n", 42);
    printf("[%05d]\n", 42);
    printf("[%8.3f]\n", 3.14159);
    return 0;
}
```
```output
[   42]
[42   ]
[00042]
[   3.142]
```

### Common mistakes

- Using the wrong specifier (for example `%d` with a decimal number): the output is garbage.
- Giving `printf` fewer or more values than there are specifiers.
- Expecting `%f` to print only the digits you typed: use `%.2f` to control it.
- Using `%d` for a `long long`: it needs `%lld`.

```quiz
What does this print?
~~~
printf("%d %c", 'A', 'A');
~~~
- [ ] A A
- [ ] 65 65
- [x] 65 A
- [ ] A 65
> %d prints the ASCII code of 'A' (65); %c prints the character.
```

```quiz
What does `printf("%f", 5.5);` print?
- [ ] 5.5
- [x] 5.500000
- [ ] 5
- [ ] 5.50
> %f defaults to 6 digits after the decimal point.
```

```quiz
What does `printf("%.2f", 3.14159);` print?
- [x] 3.14
- [ ] 3.1
- [ ] 3.15
- [ ] 3.141590
> Exactly two digits after the point; 3.14159 rounds to 3.14.
```

# Step: Reading input with scanf

`scanf` reads data typed by the user. You give it a format and the **address** of the variable where the value should go. The address-of operator is `&`.

```c
scanf("%d", &age);      // read an int
scanf("%f", &height);   // read a float
scanf("%lf", &d);       // read a double (note: %lf!)
scanf(" %c", &ch);      // read a char (the space skips whitespace)
```

```c run
#include <stdio.h>

int main(void) {
    int age;
    float height;

    printf("Enter your age: ");
    scanf("%d", &age);

    printf("Enter your height in metres: ");
    scanf("%f", &height);

    printf("You are %d years old and %.2f m tall.\n", age, height);
    return 0;
}
```
```input
20
1.75
```
```output
Enter your age: Enter your height in metres: You are 20 years old and 1.75 m tall.
```

(What you type is not part of the program's output, so the prompts appear side by side here.)

You can read several values with one `scanf`. Here is the ASCII-code program for a character typed by the user:

```c run
#include <stdio.h>

int main(void) {
    char ch;
    printf("Enter a character: ");
    scanf("%c", &ch);
    printf("Character: %c\n", ch);
    printf("ASCII in Decimal: %d\n", ch);
    printf("ASCII in Octal : %o\n", ch);
    printf("ASCII in Hexa : %X\n", ch);
    return 0;
}
```
```input
A
```
```output
Enter a character: Character: A
ASCII in Decimal: 65
ASCII in Octal : 101
ASCII in Hexa : 41
```

```c run
#include <stdio.h>

int main(void) {
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    printf("Sum = %d, Product = %d\n", a + b, a * b);
    return 0;
}
```
```input
6 7
```
```output
Enter two numbers: Sum = 13, Product = 42
```

> **Warning:** With `scanf`, a `double` needs `%lf`, but `printf` accepts `%f` for both `float` and `double`.

> **Tip:** After reading a number, the Enter key you pressed stays in the input. A following `scanf("%c", &ch)` would read that newline. Write `scanf(" %c", &ch)` (with a space before `%c`) to skip it.

### Common mistakes

- Forgetting the `&`: `scanf("%d", n);` is a serious bug.
- Using `%f` to read a `double`: use `%lf`.
- Reading a `char` right after a number without the leading space in `" %c"`.
- Putting `\n` inside the `scanf` format, such as `"%d\n"`.
- Using `gets()`: it is unsafe and removed from modern C.

```quiz
What is missing in this code?
~~~
int n;
scanf("%d", n);
~~~
- [ ] A semicolon
- [x] The & before n
- [ ] %f instead of %d
- [ ] Nothing
> scanf needs the address of n (&n) so it knows where to store the value.
```

```quiz
For `double d;` which call reads a value into d correctly?
- [ ] scanf("%f", &d);
- [ ] scanf("%d", &d);
- [x] scanf("%lf", &d);
- [ ] scanf("%c", &d);
> scanf distinguishes float (%f) from double (%lf).
```

```quiz
The input is 5, then Enter, then Z. What does this print?
~~~
int n;
char ch;
scanf("%d", &n);
scanf("%c", &ch);
printf("%d", ch);
~~~
- [ ] 90
- [ ] 5
- [x] 10
- [ ] 0
> %c reads the leftover newline (ASCII 10), not 'Z' (which would be 90).
```

# Step: Simple formulas

Now combine everything: read input, compute with a formula, print with a fixed number of decimals. For constants like pi, use `#define` (a name that the preprocessor replaces; no `=` and no `;`).

```c run
#include <stdio.h>
#define PI 3.14159265358979

int main(void) {
    double r, area;
    scanf("%lf", &r);
    area = PI * r * r;
    printf("%.2f\n", area);
    return 0;
}
```
```input
5
```
```output
78.54
```

Careful with fractions in formulas. To convert Celsius to Fahrenheit use `F = C * 9 / 5 + 32`. If `C` were an `int`, then `9/5` is integer division, so write `9.0 / 5.0` or use a `double`:

```c run
#include <stdio.h>

int main(void) {
    double c, f;
    scanf("%lf", &c);
    f = c * 9.0 / 5.0 + 32;
    printf("%.2f\n", f);
    printf("%.2f\n", 9 / 5 * 100.0);
    return 0;
}
```
```input
100
```
```output
212.00
100.00
```

The last line shows the trap: `9 / 5` is `1` (integer division), so `9 / 5 * 100.0` is `100.0`, not `180.0`. You will study this more in the Operators lesson.

### Common mistakes

- Writing `4/3` instead of `4.0/3.0` in a formula (it gives 1).
- Reading a `double` with `%f` in `scanf`.
- Forgetting the precision in `printf`, so you get 6 decimals.
- Putting `=` or `;` in a `#define`: write `#define PI 3.14159`.

```quiz
What does this print?
~~~
float f = 9 / 5;
printf("%.1f", f);
~~~
- [ ] 1.8
- [x] 1.0
- [ ] 2.0
- [ ] 1.5
> 9 / 5 is integer division and gives 1; only then it is stored in the float.
```

```quiz
If r = 2.0, what does `printf("%.2f", 3.14159265358979 * r * r);` print?
- [x] 12.57
- [ ] 6.28
- [ ] 12.56
- [ ] 3.14
> pi * 4 = 12.566..., which rounds to 12.57.
```

# Step: Swapping two values

Swapping is a classic exercise: after it, `a` holds the old `b` and `b` holds the old `a`. You cannot simply write `a = b; b = a;` because the first line overwrites `a` and the original value is lost. Use a **temporary variable** (a third box) to hold it:

```c run
#include <stdio.h>

int main(void) {
    int a, b, temp;
    scanf("%d %d", &a, &b);
    printf("Before swap: a = %d, b = %d\n", a, b);
    temp = a;
    a = b;
    b = temp;
    printf("After swap : a = %d, b = %d\n", a, b);
    return 0;
}
```
```input
3 7
```
```output
Before swap: a = 3, b = 7
After swap : a = 7, b = 3
```

You can also swap **without** a third variable by using only `+` and `-`:

```c run
#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    a = a + b;   /* a holds the total */
    b = a - b;   /* total - old b = old a */
    a = a - b;   /* total - old a = old b */
    printf("a = %d, b = %d\n", a, b);
    return 0;
}
```
```input
3 7
```
```output
a = 7, b = 3
```

> **Tip:** In the Operators lesson you will see a third way that uses the XOR operator `^`.

### Common mistakes

- Swapping with `a = b; b = a;`: both variables end up holding the old `b`.
- Forgetting that the `+`/`-` trick can overflow when the numbers are huge.

```quiz
After this code, what are a and b?
~~~
int a = 5, b = 9;
a = a + b;
b = a - b;
a = a - b;
~~~
- [ ] a = 14, b = 5
- [x] a = 9, b = 5
- [ ] a = 5, b = 9
- [ ] a = 9, b = 14
> a becomes 14, then b = 14 - 9 = 5, then a = 14 - 5 = 9.
```

```quiz
What is wrong with this swap?
~~~
a = b;
b = a;
~~~
- [ ] Nothing, it swaps correctly
- [x] After the first line the old value of a is lost
- [ ] It needs & in front of a and b
- [ ] It only works for float
> a = b overwrites a, so the second line copies the new a (which equals b) back into b.
```

# Problem: Print your identity
id: basics-identity
difficulty: easy
source: CSE103 Task Sheet - Basics #1

Write a program that prints your name, department and university. For auto-judging, print **exactly** these three lines (use these fixed values):

```
Name: Rahim Uddin
Department: CSE
University: Green University of Bangladesh
```

**Input:** none.
**Output:** the three lines above.

```c starter
#include <stdio.h>

int main(void) {
    // print the three lines here
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    printf("Name: Rahim Uddin\n");
    printf("Department: CSE\n");
    printf("University: Green University of Bangladesh\n");
    return 0;
}
```
```test
=== output
Name: Rahim Uddin
Department: CSE
University: Green University of Bangladesh
```
```hint
Use one `printf` per line and end each with `\n`.
```

# Problem: Sum of two integers
id: basics-sum-two
difficulty: easy
source: CSE103 Task Sheet - Basics #2

Read two integers and print their sum.

**Input:** two integers `a` and `b` separated by a space (|a|, |b| ≤ 1,000,000).
**Output:** `Sum = S`

```c starter
#include <stdio.h>

int main(void) {
    int a, b;
    // read a and b, then print the sum
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Sum = %d\n", a + b);
    return 0;
}
```
```test
=== input
12 30
=== output
Sum = 42
```
```test
=== input
-5 3
=== output
Sum = -2
```
```test
=== input
1000000 1000000
=== output
Sum = 2000000
```
```hint
Read both numbers with `scanf("%d %d", &a, &b);` and print with `%d`.
```

# Problem: Celsius to Fahrenheit
id: basics-c-to-f
difficulty: easy
source: CSE103 Task Sheet - Basics #3 / Aptech Practice - Basics #1

Read a temperature in degrees Celsius and convert it to Fahrenheit using F = C × 9/5 + 32.

**Input:** one real number `C`.
**Output:** `F = x` where `x` is printed with 2 decimal places (`%.2f`).

```c starter
#include <stdio.h>

int main(void) {
    double c, f;
    // read c, compute f, print it
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double c, f;
    scanf("%lf", &c);
    f = c * 9.0 / 5.0 + 32;
    printf("F = %.2f\n", f);
    return 0;
}
```
```test
=== input
100
=== output
F = 212.00
```
```test
=== input
0
=== output
F = 32.00
```
```test
=== input
-40
=== output
F = -40.00
```
```test
=== input
36.6
=== output
F = 97.88
```
```hint
Use `double` and write `9.0 / 5.0`. The expression `9 / 5` would be integer division and give 1.
```
```hint
Read a `double` with `%lf`.
```

# Problem: Area and perimeter of three shapes
id: basics-shapes
difficulty: medium
source: CSE103 Task Sheet - Basics #4

Read the data of a rectangle, a circle and a triangle, then print the area and perimeter of each. Use π = 3.141592653589793 (`#define PI 3.141592653589793`). For the triangle use Heron's formula with `sqrt` from `<math.h>`: s = (a+b+c)/2, area = √(s(s-a)(s-b)(s-c)).

**Input:**
- Line 1: rectangle length and width.
- Line 2: circle radius.
- Line 3: the three sides of a valid triangle.

**Output:** three lines, all numbers with 2 decimals (`%.2f`):
```
Rectangle: area = A, perimeter = P
Circle: area = A, circumference = C
Triangle: area = A, perimeter = P
```

```c starter
#include <stdio.h>
#include <math.h>
#define PI 3.141592653589793

int main(void) {
    double l, w, r, a, b, c;
    // read the data and print the three lines
    return 0;
}
```
```c solution
#include <stdio.h>
#include <math.h>
#define PI 3.141592653589793

int main(void) {
    double l, w, r, a, b, c, s;
    scanf("%lf %lf", &l, &w);
    scanf("%lf", &r);
    scanf("%lf %lf %lf", &a, &b, &c);
    s = (a + b + c) / 2.0;
    printf("Rectangle: area = %.2f, perimeter = %.2f\n", l * w, 2 * (l + w));
    printf("Circle: area = %.2f, circumference = %.2f\n", PI * r * r, 2 * PI * r);
    printf("Triangle: area = %.2f, perimeter = %.2f\n", sqrt(s * (s - a) * (s - b) * (s - c)), a + b + c);
    return 0;
}
```
```test
=== input
5 3
2
3 4 5
=== output
Rectangle: area = 15.00, perimeter = 16.00
Circle: area = 12.57, circumference = 12.57
Triangle: area = 6.00, perimeter = 12.00
```
```test
=== input
10 2.5
1
5 5 6
=== output
Rectangle: area = 25.00, perimeter = 25.00
Circle: area = 3.14, circumference = 6.28
Triangle: area = 12.00, perimeter = 16.00
```
```test
=== input
7 7
3
13 14 15
=== output
Rectangle: area = 49.00, perimeter = 28.00
Circle: area = 28.27, circumference = 18.85
Triangle: area = 84.00, perimeter = 42.00
```
```hint
Rectangle: area = l × w, perimeter = 2(l + w). Circle: area = πr², circumference = 2πr.
```
```hint
Compute `s` first for the triangle, then `sqrt(s * (s - a) * (s - b) * (s - c))`.
```

# Problem: Simple and compound interest
id: basics-interest
difficulty: medium
source: CSE103 Task Sheet - Basics #5

Read the principal P, the yearly rate R (in percent) and the time T (in years). Compute simple interest SI = P × R × T / 100 and compound interest CI = P × (1 + R/100)^T - P. Use `pow` from `<math.h>`.

**Input:** three real numbers `P R T`.
**Output:** two lines, each with 2 decimals:
```
Simple Interest = x
Compound Interest = y
```

```c starter
#include <stdio.h>
#include <math.h>

int main(void) {
    double p, r, t;
    // read the values, compute both interests, print them
    return 0;
}
```
```c solution
#include <stdio.h>
#include <math.h>

int main(void) {
    double p, r, t, si, ci;
    scanf("%lf %lf %lf", &p, &r, &t);
    si = p * r * t / 100.0;
    ci = p * pow(1 + r / 100.0, t) - p;
    printf("Simple Interest = %.2f\n", si);
    printf("Compound Interest = %.2f\n", ci);
    return 0;
}
```
```test
=== input
1000 10 2
=== output
Simple Interest = 200.00
Compound Interest = 210.00
```
```test
=== input
2000 5 2
=== output
Simple Interest = 200.00
Compound Interest = 205.00
```
```test
=== input
1500 4 1
=== output
Simple Interest = 60.00
Compound Interest = 60.00
```
```hint
`pow(x, y)` gives x raised to the power y.
```

# Problem: ASCII value of a character
id: basics-ascii
difficulty: easy
source: CSE103 Task Sheet - Basics #6

Read a single character and print its ASCII value.

**Input:** one character (a letter, digit or symbol, not a space).
**Output:** `ASCII value = N`

```c starter
#include <stdio.h>

int main(void) {
    char ch;
    // read the character and print its ASCII code
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    char ch;
    scanf(" %c", &ch);
    printf("ASCII value = %d\n", ch);
    return 0;
}
```
```test
=== input
A
=== output
ASCII value = 65
```
```test
=== input
z
=== output
ASCII value = 122
```
```test
=== input
9
=== output
ASCII value = 57
```
```test
=== input
#
=== output
ASCII value = 35
```
```hint
A `char` is a small integer. Print it with `%d` instead of `%c`.
```

# Problem: Swap with a temporary variable
id: basics-swap-temp
difficulty: easy
source: CSE103 Task Sheet - Basics #7

Read two integers and swap them using a third (temporary) variable.

**Input:** two integers `a b`.
**Output:** `After swap: a = X, b = Y`

```c starter
#include <stdio.h>

int main(void) {
    int a, b, temp;
    // read, swap using temp, print
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b, temp;
    scanf("%d %d", &a, &b);
    temp = a;
    a = b;
    b = temp;
    printf("After swap: a = %d, b = %d\n", a, b);
    return 0;
}
```
```test
=== input
3 7
=== output
After swap: a = 7, b = 3
```
```test
=== input
-5 10
=== output
After swap: a = 10, b = -5
```
```test
=== input
4 4
=== output
After swap: a = 4, b = 4
```
```hint
Save `a` in `temp`, then copy `b` into `a`, then copy `temp` into `b`.
```

# Problem: Swap without a temporary variable
id: basics-swap-no-temp
difficulty: easy
source: CSE103 Task Sheet - Basics #8

Read two integers and swap them **without** a third variable (use `+` and `-`).

**Input:** two integers `a b` (|a|, |b| ≤ 1,000,000).
**Output:** `After swap: a = X, b = Y`

```c starter
#include <stdio.h>

int main(void) {
    int a, b;
    // read, swap without a third variable, print
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    a = a + b;
    b = a - b;
    a = a - b;
    printf("After swap: a = %d, b = %d\n", a, b);
    return 0;
}
```
```test
=== input
3 7
=== output
After swap: a = 7, b = 3
```
```test
=== input
-8 20
=== output
After swap: a = 20, b = -8
```
```test
=== input
0 0
=== output
After swap: a = 0, b = 0
```
```hint
After `a = a + b;` the variable `a` holds the total. What is `a - b` now?
```

# Problem: Total and average marks
id: basics-marks-avg
difficulty: easy
source: Aptech Practice - Basics #2

Read a student's marks in Physics, Chemistry and Biology. Print the total and the average.

**Input:** three real numbers (marks).
**Output:** two lines, each with 2 decimals:
```
Total = x
Average = y
```

```c starter
#include <stdio.h>

int main(void) {
    double phy, chem, bio;
    // read the marks, print the total and the average
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double phy, chem, bio, total;
    scanf("%lf %lf %lf", &phy, &chem, &bio);
    total = phy + chem + bio;
    printf("Total = %.2f\n", total);
    printf("Average = %.2f\n", total / 3.0);
    return 0;
}
```
```test
=== input
78 65 90
=== output
Total = 233.00
Average = 77.67
```
```test
=== input
100 100 100
=== output
Total = 300.00
Average = 100.00
```
```test
=== input
55.5 60.25 70
=== output
Total = 185.75
Average = 61.92
```
```hint
Average = total / 3.0. Dividing by `3.0` keeps the decimals.
```

# Problem: Salary and age
id: basics-salary-age
difficulty: easy
source: Aptech Practice - Variables and Data Types (Lab) #2

Read an employee's salary and age and display them.

**Input:** a real number `salary`, then an integer `age`, separated by a space.
**Output:** two lines:
```
Age: A
Salary: S
```
where `S` has 2 decimals.

```c starter
#include <stdio.h>

int main(void) {
    double salary;
    int age;
    // read salary and age, then print them
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double salary;
    int age;
    scanf("%lf %d", &salary, &age);
    printf("Age: %d\n", age);
    printf("Salary: %.2f\n", salary);
    return 0;
}
```
```test
=== input
25000.5 21
=== output
Age: 21
Salary: 25000.50
```
```test
=== input
18000 30
=== output
Age: 30
Salary: 18000.00
```
```hint
Use `%lf` for a `double` in `scanf` and `%d` for the `int`.
```

# Problem: Print values of different types
id: basics-printf-types
difficulty: easy
source: Aptech Practice - Input and Output #1

Read an integer `sum`, a character `letter`, a float `discount` and a float `dump`. Print five lines: the value of `sum`; the text `Welcome`; the character `letter`; `discount` with the default `%f` format; `dump` with 2 decimals.

**Input:** one line: `sum letter discount dump` (separated by spaces).
**Output:**
```
<sum>
Welcome
<letter>
<discount with %f>
<dump with %.2f>
```

```c starter
#include <stdio.h>

int main(void) {
    int sum;
    char letter;
    float discount, dump;
    // read the four values, then print the five lines
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    int sum;
    char letter;
    float discount, dump;
    scanf("%d %c %f %f", &sum, &letter, &discount, &dump);
    printf("%d\n", sum);
    printf("Welcome\n");
    printf("%c\n", letter);
    printf("%f\n", discount);
    printf("%.2f\n", dump);
    return 0;
}
```
```test
=== input
5 A 12.5 3.14159
=== output
5
Welcome
A
12.500000
3.14
```
```test
=== input
-20 z 0.25 2.5
=== output
-20
Welcome
z
0.250000
2.50
```
```hint
Specifiers: `%d` int, `%c` char, `%f` float. Remember the space in `"%d %c"` format so the character is read correctly.
```

# Problem: Sum of two floats in a given style
id: basics-float-sum
difficulty: easy
source: Lab Manual - Lab 1 Exercise #5

Read two real numbers and print their sum in the style `a + b = sum`.

**Input:** two real numbers separated by a space.
**Output:** `a + b = s`, all three numbers with 2 decimals.

```c starter
#include <stdio.h>

int main(void) {
    float a, b;
    // read a and b, print "a + b = sum"
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double a, b;
    scanf("%lf %lf", &a, &b);
    printf("%.2f + %.2f = %.2f\n", a, b, a + b);
    return 0;
}
```
```test
=== input
1.5 2.25
=== output
1.50 + 2.25 = 3.75
```
```test
=== input
10 -4.5
=== output
10.00 + -4.50 = 5.50
```
```test
=== input
0 0
=== output
0.00 + 0.00 = 0.00
```
```hint
Print the sum with `a + b` as an argument: `printf("%.2f + %.2f = %.2f\n", a, b, a + b);`
```

# Problem: Employee salary
id: basics-employee-salary
difficulty: medium
source: Aptech Practice - Input and Output #4

Compute an employee's salary with the formula `salary = basic + basic * daper / 100 + bonper * basic / 100 - loandet`, where `daper` is the percentage of dearness allowance, `bonper` is the percentage of bonus and `loandet` is the loan amount to be debited.

**Input:** four real numbers: `basic daper bonper loandet`.
**Output:** `Salary = x` with 2 decimals.

```c starter
#include <stdio.h>

int main(void) {
    double basic, daper, bonper, loandet, salary;
    // read the four values, compute and print the salary
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double basic, daper, bonper, loandet, salary;
    scanf("%lf %lf %lf %lf", &basic, &daper, &bonper, &loandet);
    salary = basic + basic * daper / 100 + bonper * basic / 100 - loandet;
    printf("Salary = %.2f\n", salary);
    return 0;
}
```
```test
=== input
2500 55 33.33 250.00
=== output
Salary = 4458.25
```
```test
=== input
1000 10 5 0
=== output
Salary = 1150.00
```
```hint
Store everything in `double` variables and type the formula exactly as given.
```

# Problem: Arithmetic sequence
id: basics-arith-seq
difficulty: medium
source: Class Notes 02 - Exercises 1 and 2

An arithmetic sequence has first term `a1` and common difference `d`. The n-th term is a_n = a1 + (n-1)·d and the sum of the first n terms is S_n = (a1 + a_n)·n / 2. Read `a1`, `d` and `n` and print both.

**Input:** `a1 d n` (`a1` and `d` real numbers, `n` an integer ≥ 1).
**Output:** two lines, each with 2 decimals:
```
an = x
Sn = y
```

```c starter
#include <stdio.h>

int main(void) {
    double a1, d, an, sn;
    int n;
    // read a1, d, n, compute an and sn, print them
    return 0;
}
```
```c solution
#include <stdio.h>

int main(void) {
    double a1, d, an, sn;
    int n;
    scanf("%lf %lf %d", &a1, &d, &n);
    an = a1 + (n - 1) * d;
    sn = (a1 + an) * n / 2.0;
    printf("an = %.2f\n", an);
    printf("Sn = %.2f\n", sn);
    return 0;
}
```
```test
=== input
1 2 9
=== output
an = 17.00
Sn = 81.00
```
```test
=== input
5 -2 4
=== output
an = -1.00
Sn = 8.00
```
```test
=== input
2.5 0.5 5
=== output
an = 4.50
Sn = 17.50
```
```hint
Do not forget `n - 1` in the formula for the n-th term.
```

# Problem: Distance between two points
id: basics-distance
difficulty: medium
source: Class Notes 01 - Exercise C

Read the coordinates of two points (x1, y1) and (x2, y2). Print the distance between them: d = √((x2-x1)² + (y2-y1)²). Use `sqrt` from `<math.h>`.

**Input:** four real numbers `x1 y1 x2 y2`.
**Output:** `Distance = d` with 2 decimals.

```c starter
#include <stdio.h>
#include <math.h>

int main(void) {
    double x1, y1, x2, y2;
    // read the points and print the distance
    return 0;
}
```
```c solution
#include <stdio.h>
#include <math.h>

int main(void) {
    double x1, y1, x2, y2, d;
    scanf("%lf %lf %lf %lf", &x1, &y1, &x2, &y2);
    d = sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    printf("Distance = %.2f\n", d);
    return 0;
}
```
```test
=== input
0 0 3 4
=== output
Distance = 5.00
```
```test
=== input
-1 -1 2 3
=== output
Distance = 5.00
```
```test
=== input
0 0 1 1
=== output
Distance = 1.41
```
```hint
Square a number by multiplying it by itself: `dx * dx`.
```
