---
id: functions
title: "User-Defined Functions"
order: 9
summary: Why we use functions, prototype / definition / call, parameters and return values, the four kinds of functions, call by value, scope and lifetime, and passing arrays to functions.
---

# Step: Why functions?

A **function** is a named block of code that does one job. It runs only when it is **called**. You already use functions all the time: `printf`, `scanf` and `main` are functions. A C program is a collection of functions, and execution always starts at `main`.

Why write your own functions?

- **Reuse:** write the code once, call it many times (no copy-paste).
- **Readability:** `printf("%d", fact(5))` is easier to read than a loop in the middle of the program.
- **Easier testing and fixing:** a bug is fixed in one place.
- **Teamwork and top-down design:** split a big problem into small ones.

When a called function finishes, the program continues **right after the call**.

```c run
#include <stdio.h>

void line(void)
{
    printf("--------\n");
}

int main(void)
{
    line();
    printf("Report\n");
    line();
    printf("Done\n");
    line();
    return 0;
}
```
```output
--------
Report
--------
Done
--------
```

The line-drawing code is written once and used three times. In the visualizer, every call creates its own **stack frame**, which disappears when the function returns.

A function can also compute something and give it back. The number of combinations C(n, r) = n! / (r! (n-r)!) needs three factorials; with a function we write the factorial loop only once:

```c run
#include <stdio.h>

int fact(int n)
{
    int f = 1, i;
    for (i = 1; i <= n; i++) {
        f = f * i;
    }
    return f;
}

int main(void)
{
    printf("5C2 = %d\n", fact(5) / (fact(2) * fact(3)));
    return 0;
}
```
```output
5C2 = 10
```

### Common mistakes

- Copy-pasting the same loop several times instead of making a function.
- Thinking the function body runs when the program starts. It runs only when called.

```quiz
When a function finishes, where does the program continue?
- [ ] At the beginning of main
- [x] Right after the place where the function was called
- [ ] At the end of the program
- [ ] At the next function in the file
> Control returns to the caller, to the statement after the call.
```

```quiz
Which is NOT a good reason to use functions?
- [ ] Avoid repeating the same code
- [ ] Make a big program easier to read
- [x] Make the program use less memory in every case
- [ ] Fix a bug in one place only
> Functions help organisation and reuse; saving memory is not their purpose.
```

# Step: Prototype, definition and call

A function has three parts that you must keep apart.

| Part | Example | Role |
|---|---|---|
| **Prototype** (declaration) | `int add(int a, int b);` | tells the compiler the name, parameter types and return type before it is used |
| **Definition** | `int add(int a, int b) { return a + b; }` | the real code |
| **Call** | `add(3, 4)` | runs the function |

The general shape of a definition:

```c
return_type function_name(parameter_list)
{
    // body
}
```

C reads the file from top to bottom, so a function must be **known before it is called**. You have two choices: define the function above `main`, or put a prototype above `main` and the definition below it. A prototype ends with a semicolon and the parameter names are optional (`int add(int, int);`).

```c run
#include <stdio.h>

int add(int a, int b);

int main(void)
{
    int r = add(3, 4);
    printf("%d\n", r);
    printf("%d\n", add(10, 20));
    return 0;
}

int add(int a, int b)
{
    return a + b;
}
```
```output
7
30
```

The order of execution matters. Follow it with `printf` messages:

```c run
#include <stdio.h>

void hello(void);

int main(void)
{
    printf("main starts\n");
    hello();
    printf("main ends\n");
    return 0;
}

void hello(void)
{
    printf("inside hello\n");
}
```
```output
main starts
inside hello
main ends
```

> **Tip:** Use `void` in the parameter list (`void hello(void)`) when a function takes no parameters.

### Common mistakes

- Calling a function before it is defined and without a prototype.
- A prototype that does not match the definition (different types or number of parameters).
- Writing a semicolon after the function header in the **definition**: `int add(int a, int b); { ... }` is wrong.
- Forgetting the semicolon after a prototype.

```quiz
Which line is a function prototype?
- [ ] int add(int a, int b) { return a + b; }
- [x] int add(int a, int b);
- [ ] add(3, 4);
- [ ] int r = add(3, 4);
> A prototype is only the header followed by a semicolon. The first line is a definition, the other two are calls.
```

```quiz
What does this program print?
~~~
void hello(void);
int main(void)
{
    printf("A");
    hello();
    printf("C");
    return 0;
}
void hello(void) { printf("B"); }
~~~
- [ ] ACB
- [x] ABC
- [ ] BAC
- [ ] AC
> main prints A, then hello prints B, then control returns to main which prints C.
```

# Step: Parameters, arguments and return values

- **Parameters** (formal parameters) are the variables in the function **definition**: `int add(int a, int b)`.
- **Arguments** (actual parameters) are the values you pass in the **call**: `add(3, 4)`.
- The arguments are matched to the parameters **by position**, and each argument is converted to the parameter's type (an `int` passed to a `double` parameter becomes a `double`).

A function gives a value back to its caller with **`return value;`**. The return type in front of the name says what type it is. `return` also **ends the function immediately**. A function with return type `void` returns nothing.

```c run
#include <stdio.h>

double circleArea(double r)
{
    return 3.14159 * r * r;
}

int main(void)
{
    double a = circleArea(3.0);
    printf("Area = %.2f\n", a);
    printf("Area = %.2f\n", circleArea(2));
    return 0;
}
```
```output
Area = 28.27
Area = 12.57
```

The second call passes the `int` 2, which is converted to the `double` 2.0.

A function may contain several `return` statements. The first one reached ends the function:

```c run
#include <stdio.h>

int sign(int n)
{
    if (n < 0) {
        return -1;
    }
    if (n == 0) {
        return 0;
    }
    return 1;
}

int main(void)
{
    printf("%d %d %d\n", sign(-8), sign(0), sign(15));
    return 0;
}
```
```output
-1 0 1
```

### Common mistakes

- Passing arguments in the wrong order or with the wrong count.
- Forgetting `return` in a non-void function (the caller then gets a garbage value).
- Writing code after `return` and expecting it to run.
- A function returns **one** value only. To produce several results you will need other tools (pointers, arrays).
- Printing inside a function when it was supposed to **return** the value (the caller cannot use it).

```quiz
In the call total = add(3, 4); what are 3 and 4 called?
- [ ] Parameters
- [x] Arguments
- [ ] Return values
- [ ] Prototypes
> The values in the call are arguments. The variables in the function header are parameters.
```

```quiz
What does this print?
~~~
int f(int x)
{
    return x * 2;
    printf("hello");
}
int main(void)
{
    printf("%d", f(4));
    return 0;
}
~~~
- [ ] hello8
- [ ] 8hello
- [x] 8
- [ ] hello
> return ends f immediately, so the printf after it never runs. f(4) is 8.
```

# Step: The four kinds of functions

Ask two questions about any function: **does it take input (parameters)?** and **does it give back a result (return value)?** That gives four kinds:

| Kind | Header example | Typical use |
|---|---|---|
| 1. No parameters, no return | `void greet(void)` | print a banner |
| 2. Parameters, no return | `void printSum(int a, int b)` | compute and print |
| 3. No parameters, returns value | `int readNumber(void)` | read a value from the user |
| 4. Parameters and returns value | `int square(int x)` | calculate and give the answer back |

Kind 4 is the most useful: the function only calculates, and the caller decides what to do with the result (print it, store it, use it in `if`).

```c run
#include <stdio.h>

void greet(void)
{
    printf("Hello!\n");
}

void printSum(int a, int b)
{
    printf("Sum = %d\n", a + b);
}

int readNumber(void)
{
    int x;
    scanf("%d", &x);
    return x;
}

int square(int x)
{
    return x * x;
}

int main(void)
{
    int n;
    greet();
    printSum(2, 3);
    n = readNumber();
    printf("%d squared is %d\n", n, square(n));
    return 0;
}
```
```input
6
```
```output
Hello!
Sum = 5
6 squared is 36
```

A function that **returns** a result is easy to use in conditions. Here `isEven` returns 1 for true and 0 for false:

```c run
#include <stdio.h>

int isEven(int n)
{
    return n % 2 == 0;
}

int main(void)
{
    int n;
    scanf("%d", &n);
    if (isEven(n)) {
        printf("%d is even\n", n);
    } else {
        printf("%d is odd\n", n);
    }
    return 0;
}
```
```input
10
```
```output
10 is even
```

> **Tip:** Prefer kind 4 when possible: a function that calculates and returns can be reused in any program, while one that also prints is tied to one use.

### Common mistakes

- Using a `void` function in an expression: `int x = greet();` is an error.
- Writing `int result = printSum(2, 3);` when `printSum` only prints.
- Reading input inside a function and also passing the value as a parameter (do one or the other).

```quiz
Which header is a function that takes two ints and returns an int?
- [ ] void f(int a, int b)
- [ ] int f(void)
- [x] int f(int a, int b)
- [ ] void f(void)
> It must have two int parameters and the return type int.
```

```quiz
What kind of function is int readNumber(void)?
- [ ] No parameters, no return value
- [ ] Parameters, no return value
- [x] No parameters, returns a value
- [ ] Parameters and returns a value
> It takes nothing in (void) but gives an int back.
```

# Step: Call by value

When you call a function, C **copies the values of the arguments** into the parameters. The function works on its own copies, so **changing a parameter does not change the caller's variable**. This is called **call by value**.

```c run
#include <stdio.h>

int f(int x)
{
    x = x + 10;
    return x;
}

int main(void)
{
    int a = 5;
    int b = f(a);
    printf("a = %d, b = %d\n", a, b);
    return 0;
}
```
```output
a = 5, b = 15
```

`a` is still 5: `f` changed only its own copy `x`. Only the returned value 15 got out, and we stored it in `b`.

The classic example is a swap function that **does not work**:

```c run
#include <stdio.h>

void swap(int x, int y)
{
    int t = x;
    x = y;
    y = t;
    printf("inside swap: x = %d, y = %d\n", x, y);
}

int main(void)
{
    int a = 1, b = 2;
    swap(a, b);
    printf("in main: a = %d, b = %d\n", a, b);
    return 0;
}
```
```output
inside swap: x = 2, y = 1
in main: a = 1, b = 2
```

Step through it in the visualizer: `main` and `swap` are two separate stack frames with different variables. (To really modify the caller's variables you will use **pointers**, a later topic. Arrays are a special case, see the next steps.)

### Common mistakes

- Expecting a function to change the caller's variable when you pass a plain `int`, `float` or `char`.
- Forgetting to store the returned value (`f(a);` alone throws the result away).

```quiz
What does this print?
~~~
void inc(int n) { n = n + 1; }
int main(void)
{
    int k = 7;
    inc(k);
    printf("%d", k);
    return 0;
}
~~~
- [x] 7
- [ ] 8
- [ ] 6
- [ ] Nothing
> inc changes only its own copy of k. The variable k in main stays 7.
```

```quiz
How can inc be changed so that k becomes 8 using only what you know so far?
- [ ] Rename the parameter to k
- [ ] Add return; at the end of inc
- [x] Make it int inc(int n) { return n + 1; } and write k = inc(k);
- [ ] Declare n as static
> Return the new value and assign it back in the caller.
```

# Step: Scope and lifetime: local, global, static

**Scope** is where a name can be used. **Lifetime** is how long the variable exists.

| Kind | Declared | Scope | Lifetime | Initial value |
|---|---|---|---|---|
| **Local** | inside a function or block | only that function/block | created at the call, destroyed when it returns | garbage if not set |
| **Global** | outside all functions | whole file after the declaration | whole program | 0 |
| **static local** | inside a function with `static` | only that function | whole program (keeps its value between calls) | 0 (set once) |

If a local variable has the same name as a global one, the local one **shadows** (hides) the global one inside its scope.

```c run
#include <stdio.h>

int total = 0;

void addToTotal(int n)
{
    total = total + n;
}

int nextId(void)
{
    static int id = 0;
    id++;
    return id;
}

int plain(void)
{
    int c = 0;
    c++;
    return c;
}

int main(void)
{
    int i;
    addToTotal(5);
    addToTotal(7);
    printf("total = %d\n", total);
    for (i = 0; i < 3; i++) {
        int a = nextId();
        int b = plain();
        printf("static id: %d, plain: %d\n", a, b);
    }
    return 0;
}
```
```output
total = 12
static id: 1, plain: 1
static id: 2, plain: 1
static id: 3, plain: 1
```

`id` is created and initialised **once** and remembers its value. `c` is created fresh at every call, so it is always 1.

Shadowing and block scope:

```c run
#include <stdio.h>

int x = 10;

void show(void)
{
    int x = 99;
    printf("show: x = %d\n", x);
}

int main(void)
{
    show();
    printf("main: x = %d\n", x);
    {
        int x = 5;
        printf("block: x = %d\n", x);
    }
    printf("main again: x = %d\n", x);
    return 0;
}
```
```output
show: x = 99
main: x = 10
block: x = 5
main again: x = 10
```

> **Tip:** Prefer parameters and return values over global variables. Globals can be changed from anywhere, which makes bugs hard to find.

### Common mistakes

- Using a local variable of one function inside another function (each function cannot see the other's locals).
- Reading an uninitialised local variable (its value is garbage).
- Expecting an ordinary local to remember its value between calls (use `static` if you really need that).
- Overusing global variables.

```quiz
What does each call of this function return, first call then second call?
~~~
int counter(void)
{
    static int n = 0;
    n++;
    return n;
}
~~~
- [ ] 1 then 1
- [x] 1 then 2
- [ ] 0 then 1
- [ ] 2 then 3
> The static variable is set to 0 only once and keeps its value between calls, so the results are 1, 2, 3, ...
```

```quiz
Where can a variable declared inside a function be used?
- [ ] In every function of the file
- [x] Only inside that function (or block)
- [ ] Only in main
- [ ] Anywhere after it is called
> A local variable is visible only in the block where it is declared.
```

# Step: Passing arrays to functions

To pass an array, write the array **name** in the call and `type name[]` in the parameter list. The function does not know the length, so pass the **size as a separate parameter**.

```c
int sum(int arr[], int n);     // prototype
total = sum(a, 5);             // call: no brackets, just the name
```

Important difference from ordinary variables: the function receives the **address of the first element**, not a copy of the whole array. So the function works on the **original** array, and changes made inside the function are **visible in the caller**.

```c run
#include <stdio.h>

int sum(int arr[], int n)
{
    int s = 0, i;
    for (i = 0; i < n; i++) {
        s = s + arr[i];
    }
    return s;
}

void doubleAll(int arr[], int n)
{
    int i;
    for (i = 0; i < n; i++) {
        arr[i] = arr[i] * 2;
    }
}

int main(void)
{
    int a[5] = {1, 2, 3, 4, 5};
    printf("sum = %d\n", sum(a, 5));
    doubleAll(a, 5);
    printf("a[0] = %d, a[4] = %d\n", a[0], a[4]);
    printf("sum = %d\n", sum(a, 5));
    return 0;
}
```
```output
sum = 15
a[0] = 2, a[4] = 10
sum = 30
```

Strings are char arrays, so they are passed the same way. A string does not need a size parameter, because it ends with `'\0'`:

```c run
#include <stdio.h>
#include <ctype.h>

int countVowels(char s[])
{
    int i, count = 0;
    for (i = 0; s[i] != '\0'; i++) {
        char c = tolower((unsigned char)s[i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
            count++;
        }
    }
    return count;
}

void shout(char s[])
{
    int i;
    for (i = 0; s[i] != '\0'; i++) {
        s[i] = toupper((unsigned char)s[i]);
    }
}

int main(void)
{
    char word[] = "education";
    printf("vowels: %d\n", countVowels(word));
    shout(word);
    printf("%s\n", word);
    return 0;
}
```
```output
vowels: 5
EDUCATION
```

> **Warning:** Inside the function, `sizeof(arr)` does **not** give the size of the array (it is only an address there). Always pass the length yourself.

### Common mistakes

- Writing brackets in the call: `sum(a[], 5)` is wrong; write `sum(a, 5)`.
- Forgetting to pass the size and looping over the wrong number of elements.
- Being surprised that the function changed the caller's array (arrays are not copied).
- Using `sizeof(arr)` inside the function to find the length.

```quiz
What does this print?
~~~
void set(int arr[]) { arr[0] = 99; }
int main(void)
{
    int a[3] = {1, 2, 3};
    set(a);
    printf("%d", a[0]);
    return 0;
}
~~~
- [ ] 1
- [x] 99
- [ ] 3
- [ ] 0
> The function receives the address of the original array, so changing arr[0] changes a[0].
```

```quiz
Which is the correct call of void show(int arr[], int n) for an array int data[10]?
- [ ] show(data[], 10);
- [ ] show(int data[], 10);
- [x] show(data, 10);
- [ ] show(&data[10]);
> Pass the array name and its size. No brackets and no types in a call.
```

# Step: Library functions vs user-defined functions

Functions come from two places.

- **Library functions** are already written for you and declared in header files: `printf`, `scanf` (`stdio.h`), `strlen`, `strcpy` (`string.h`), `sqrt`, `pow` (`math.h`), `abs`, `rand` (`stdlib.h`), `toupper`, `isdigit` (`ctype.h`). You only `#include` the header and call them.
- **User-defined functions** are the ones you write yourself, like `add` or `fact`.

```c run
#include <stdio.h>
#include <math.h>
#include <stdlib.h>

int main(void)
{
    printf("sqrt(49) = %.1f\n", sqrt(49.0));
    printf("pow(2, 10) = %.0f\n", pow(2.0, 10.0));
    printf("abs(-9) = %d\n", abs(-9));
    return 0;
}
```
```output
sqrt(49) = 7.0
pow(2, 10) = 1024
abs(-9) = 9
```

**Top-down design:** solve a big problem by breaking it into small functions, and let functions call other functions. Here `nCr` and `nPr` are built from one `fact` function:

```c run
#include <stdio.h>

int fact(int n)
{
    int f = 1, i;
    for (i = 2; i <= n; i++) {
        f = f * i;
    }
    return f;
}

int nCr(int n, int r)
{
    return fact(n) / (fact(r) * fact(n - r));
}

int nPr(int n, int r)
{
    return fact(n) / fact(n - r);
}

int main(void)
{
    printf("5C2 = %d\n", nCr(5, 2));
    printf("5P2 = %d\n", nPr(5, 2));
    return 0;
}
```
```output
5C2 = 10
5P2 = 20
```

> **Note:** `int` overflows for `fact(13)` and larger. This is why practice inputs for factorial stay small.

### Common mistakes

- Forgetting `#include <math.h>` when you use `sqrt` or `pow`.
- Naming your own function the same as a library function (`int abs(int x)`, `int pow(...)`).
- Writing a huge `main` instead of small functions that each do one job.

```quiz
Which of these is a user-defined function?
- [ ] printf
- [ ] strlen
- [x] A function named average that you wrote in your own program
- [ ] sqrt
> The other three are library functions. User-defined functions are written by the programmer.
```

```quiz
Which header must be included to use sqrt() and pow()?
- [ ] stdio.h
- [ ] string.h
- [x] math.h
- [ ] ctype.h
> sqrt and pow are declared in math.h.
```

# Problem: Sum of two numbers using a function
id: func-sum-two
difficulty: easy
source: CSE103 Task Sheet - Functions #1

Write a function `int add(int a, int b)` that returns the sum of two numbers. Read two integers in `main`, call the function and print the result.

**Input:** two integers `a` and `b` (-10000 ≤ a, b ≤ 10000).
**Output:** `Sum = S`

```c starter
#include <stdio.h>

int add(int a, int b)
{
    // return the sum
}

int main(void)
{
    int x, y;
    scanf("%d %d", &x, &y);
    // call add and print the result
    return 0;
}
```

```c solution
#include <stdio.h>

int add(int a, int b)
{
    return a + b;
}

int main(void)
{
    int x, y;
    scanf("%d %d", &x, &y);
    printf("Sum = %d\n", add(x, y));
    return 0;
}
```

```test
=== input
3 4
=== output
Sum = 7
```

```test
=== input
-5 2
=== output
Sum = -3
```

```test
=== input
0 0
=== output
Sum = 0
```

```hint
The function body is just `return a + b;`.
```

# Problem: Even or odd using a function
id: func-even-odd
difficulty: easy
source: CSE103 Task Sheet - Functions #2

Write a function `int isEven(int n)` that returns 1 if `n` is even and 0 otherwise. Use it in `main` to print whether the number is even or odd.

**Input:** one integer n (-10000 ≤ n ≤ 10000).
**Output:** `Even` or `Odd`.

```c starter
#include <stdio.h>

int isEven(int n)
{
    // return 1 for even, 0 for odd
}

int main(void)
{
    int n;
    scanf("%d", &n);
    // print Even or Odd
    return 0;
}
```

```c solution
#include <stdio.h>

int isEven(int n)
{
    return n % 2 == 0;
}

int main(void)
{
    int n;
    scanf("%d", &n);
    if (isEven(n)) {
        printf("Even\n");
    } else {
        printf("Odd\n");
    }
    return 0;
}
```

```test
=== input
10
=== output
Even
```

```test
=== input
7
=== output
Odd
```

```test
=== input
0
=== output
Even
```

```test
=== input
-3
=== output
Odd
```

```hint
`n % 2 == 0` is already 1 (true) or 0 (false), so you can return it directly.
```

```hint
For a negative odd number `n % 2` is -1, not 1. Compare with `== 0` and you are safe.
```

# Problem: Factorial using a function
id: func-factorial
difficulty: easy
source: CSE103 Task Sheet - Functions #3

Write a function `int factorial(int n)` that returns n! (n factorial). Remember that 0! = 1.

**Input:** one integer n (0 ≤ n ≤ 12).
**Output:** `Factorial = F`

```c starter
#include <stdio.h>

int factorial(int n)
{
    // multiply 1 * 2 * ... * n
}

int main(void)
{
    int n;
    scanf("%d", &n);
    // print the result
    return 0;
}
```

```c solution
#include <stdio.h>

int factorial(int n)
{
    int f = 1, i;
    for (i = 2; i <= n; i++) {
        f = f * i;
    }
    return f;
}

int main(void)
{
    int n;
    scanf("%d", &n);
    printf("Factorial = %d\n", factorial(n));
    return 0;
}
```

```test
=== input
5
=== output
Factorial = 120
```

```test
=== input
0
=== output
Factorial = 1
```

```test
=== input
10
=== output
Factorial = 3628800
```

```test
=== input
12
=== output
Factorial = 479001600
```

```hint
Start with `f = 1` and multiply it by every number from 2 to n. For n = 0 or 1 the loop does not run and the answer stays 1.
```

# Problem: Prime check using a function
id: func-prime
difficulty: medium
source: CSE103 Task Sheet - Functions #4

Write a function `int isPrime(int n)` that returns 1 if `n` is prime and 0 otherwise. A prime is greater than 1 and has no divisor other than 1 and itself. Print the answer from `main`.

**Input:** one integer n (1 ≤ n ≤ 10000).
**Output:** `Prime` or `Not prime`.

```c starter
#include <stdio.h>

int isPrime(int n)
{
    // return 1 if prime, 0 otherwise
}

int main(void)
{
    int n;
    scanf("%d", &n);
    // print Prime or Not prime
    return 0;
}
```

```c solution
#include <stdio.h>

int isPrime(int n)
{
    int i;
    if (n < 2) {
        return 0;
    }
    for (i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            return 0;
        }
    }
    return 1;
}

int main(void)
{
    int n;
    scanf("%d", &n);
    if (isPrime(n)) {
        printf("Prime\n");
    } else {
        printf("Not prime\n");
    }
    return 0;
}
```

```test
=== input
7
=== output
Prime
```

```test
=== input
1
=== output
Not prime
```

```test
=== input
2
=== output
Prime
```

```test
=== input
91
=== output
Not prime
```

```test
=== input
97
=== output
Prime
```

```hint
Numbers below 2 are not prime. For the rest, try every divisor `i` from 2 while `i * i <= n`; if any divides `n`, return 0 at once.
```

```hint
91 = 7 x 13, so it is not prime even though it looks like one.
```

# Problem: Grade of a student using a function
id: func-grade
difficulty: easy
source: CSE103 Task Sheet - Functions #5

Write a function `char grade(int marks)` that returns the grade letter: 90-100 is `A`, 80-89 is `B`, 70-79 is `C`, 60-69 is `D`, and below 60 is `F`.

**Input:** one integer marks (0 ≤ marks ≤ 100).
**Output:** `Grade: X`

```c starter
#include <stdio.h>

char grade(int marks)
{
    // return 'A', 'B', 'C', 'D' or 'F'
}

int main(void)
{
    int m;
    scanf("%d", &m);
    // print the grade
    return 0;
}
```

```c solution
#include <stdio.h>

char grade(int marks)
{
    if (marks >= 90) {
        return 'A';
    } else if (marks >= 80) {
        return 'B';
    } else if (marks >= 70) {
        return 'C';
    } else if (marks >= 60) {
        return 'D';
    }
    return 'F';
}

int main(void)
{
    int m;
    scanf("%d", &m);
    printf("Grade: %c\n", grade(m));
    return 0;
}
```

```test
=== input
85
=== output
Grade: B
```

```test
=== input
90
=== output
Grade: A
```

```test
=== input
59
=== output
Grade: F
```

```test
=== input
60
=== output
Grade: D
```

```hint
Use an else-if ladder from the highest limit down. Each `return` ends the function, so you do not need to check the upper limit again.
```

# Problem: Area and perimeter of a circle
id: func-circle
difficulty: easy
source: Aptech Elementary Programming in C - Functions (Lab) #1

Write two functions, `double area(double r)` and `double perimeter(double r)`, using `PI = 3.14159`. Area is PI * r * r and perimeter is 2 * PI * r. Print both with 2 decimal places.

**Input:** the radius r (a real number, 0 < r ≤ 100).
**Output:** two lines:
`Area = A`
`Perimeter = P`

```c starter
#include <stdio.h>

#define PI 3.14159

double area(double r)
{
    // return the area
}

double perimeter(double r)
{
    // return the perimeter
}

int main(void)
{
    double r;
    scanf("%lf", &r);
    // print both results with %.2f
    return 0;
}
```

```c solution
#include <stdio.h>

#define PI 3.14159

double area(double r)
{
    return PI * r * r;
}

double perimeter(double r)
{
    return 2 * PI * r;
}

int main(void)
{
    double r;
    scanf("%lf", &r);
    printf("Area = %.2f\n", area(r));
    printf("Perimeter = %.2f\n", perimeter(r));
    return 0;
}
```

```test
=== input
2.5
=== output
Area = 19.63
Perimeter = 15.71
```

```test
=== input
1
=== output
Area = 3.14
Perimeter = 6.28
```

```test
=== input
10
=== output
Area = 314.16
Perimeter = 62.83
```

```hint
Read a `double` with `%lf` in `scanf`, print it with `%f` or `%.2f` in `printf`.
```

# Problem: Average of an array using a function
id: func-average
difficulty: medium
source: Aptech Elementary Programming in C - Strings #2

Read `n` integers into an array and write a function `double average(int arr[], int n)` that returns their average. Print it with 2 decimal places.

**Input:** `n` (1 ≤ n ≤ 100) on the first line, then `n` integers (each between -1000 and 1000).
**Output:** `Average = X`

```c starter
#include <stdio.h>

double average(int arr[], int n)
{
    // add the elements and divide by n
}

int main(void)
{
    int a[100], n, i;
    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // print the average
    return 0;
}
```

```c solution
#include <stdio.h>

double average(int arr[], int n)
{
    int sum = 0, i;
    for (i = 0; i < n; i++) {
        sum += arr[i];
    }
    return (double)sum / n;
}

int main(void)
{
    int a[100], n, i;
    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    printf("Average = %.2f\n", average(a, n));
    return 0;
}
```

```test
=== input
4
1 2 3 4
=== output
Average = 2.50
```

```test
=== input
3
10 20 30
=== output
Average = 20.00
```

```test
=== input
3
1 2 2
=== output
Average = 1.67
```

```test
=== input
1
7
=== output
Average = 7.00
```

```hint
Add the elements in an `int` sum, then divide using `(double)sum / n` so the division keeps its decimals.
```

# Problem: Maximum and minimum of an array using functions
id: func-max-min
difficulty: medium
source: Aptech Elementary Programming in C - Arrays (Lab) #1

Read `n` integers. Write two functions, `int maxOf(int arr[], int n)` and `int minOf(int arr[], int n)`, and print the maximum and the minimum.

**Input:** `n` (1 ≤ n ≤ 100) on the first line, then `n` integers.
**Output:** two lines:
`Max = M`
`Min = m`

```c starter
#include <stdio.h>

int maxOf(int arr[], int n)
{
    // return the largest element
}

int minOf(int arr[], int n)
{
    // return the smallest element
}

int main(void)
{
    int a[100], n, i;
    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    // print Max and Min
    return 0;
}
```

```c solution
#include <stdio.h>

int maxOf(int arr[], int n)
{
    int m = arr[0], i;
    for (i = 1; i < n; i++) {
        if (arr[i] > m) {
            m = arr[i];
        }
    }
    return m;
}

int minOf(int arr[], int n)
{
    int m = arr[0], i;
    for (i = 1; i < n; i++) {
        if (arr[i] < m) {
            m = arr[i];
        }
    }
    return m;
}

int main(void)
{
    int a[100], n, i;
    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &a[i]);
    }
    printf("Max = %d\n", maxOf(a, n));
    printf("Min = %d\n", minOf(a, n));
    return 0;
}
```

```test
=== input
5
3 9 -2 7 4
=== output
Max = 9
Min = -2
```

```test
=== input
1
5
=== output
Max = 5
Min = 5
```

```test
=== input
3
-1 -5 -3
=== output
Max = -1
Min = -5
```

```hint
Start with the first element as the best so far and compare it with the remaining ones.
```

# Problem: Power function with a loop
id: func-power
difficulty: easy
source: Class Notes 06 - Section 6.12 (Power)

Write a function `int power(int base, int exp)` that returns base raised to exp using a loop (do not use `pow`). Anything to the power 0 is 1.

**Input:** two integers `base` and `exp` (1 ≤ base ≤ 10, 0 ≤ exp ≤ 9).
**Output:** `Power = P`

```c starter
#include <stdio.h>

int power(int base, int exp)
{
    // multiply base by itself exp times
}

int main(void)
{
    int b, e;
    scanf("%d %d", &b, &e);
    // print the result
    return 0;
}
```

```c solution
#include <stdio.h>

int power(int base, int exp)
{
    int result = 1, i;
    for (i = 0; i < exp; i++) {
        result = result * base;
    }
    return result;
}

int main(void)
{
    int b, e;
    scanf("%d %d", &b, &e);
    printf("Power = %d\n", power(b, e));
    return 0;
}
```

```test
=== input
2 10
=== output
Power = 1024
```

```test
=== input
5 0
=== output
Power = 1
```

```test
=== input
3 4
=== output
Power = 81
```

```test
=== input
7 1
=== output
Power = 7
```

```hint
Start `result` at 1 and multiply it by `base` exactly `exp` times.
```

# Problem: Combinations nCr using a factorial function
id: func-ncr
difficulty: medium
source: Class Notes 06 - Solved example 6.10 / Lecture 9 slides

Write `int factorial(int n)` and use it to compute nCr = n! / (r! * (n-r)!).

**Input:** two integers `n` and `r` (0 ≤ r ≤ n ≤ 12).
**Output:** `nCr = V`

```c starter
#include <stdio.h>

int factorial(int n)
{
    // return n!
}

int main(void)
{
    int n, r;
    scanf("%d %d", &n, &r);
    // print nCr
    return 0;
}
```

```c solution
#include <stdio.h>

int factorial(int n)
{
    int f = 1, i;
    for (i = 2; i <= n; i++) {
        f = f * i;
    }
    return f;
}

int main(void)
{
    int n, r;
    scanf("%d %d", &n, &r);
    printf("nCr = %d\n", factorial(n) / (factorial(r) * factorial(n - r)));
    return 0;
}
```

```test
=== input
5 2
=== output
nCr = 10
```

```test
=== input
6 3
=== output
nCr = 20
```

```test
=== input
4 4
=== output
nCr = 1
```

```test
=== input
12 0
=== output
nCr = 1
```

```hint
Call `factorial` three times: for `n`, for `r` and for `n - r`. Multiply the two small ones before dividing.
```

# Problem: Sum of digits using a function
id: func-digit-sum
difficulty: medium
source: Lecture 10 slides - Functions (sumOfDigits)

Write a function `int sumOfDigits(int x)` that returns the sum of the digits of a non-negative number (for example 12345 gives 15).

**Input:** one integer x (0 ≤ x ≤ 1000000000).
**Output:** `Sum of digits = S`

```c starter
#include <stdio.h>

int sumOfDigits(int x)
{
    // use % 10 and / 10
}

int main(void)
{
    int x;
    scanf("%d", &x);
    // print the result
    return 0;
}
```

```c solution
#include <stdio.h>

int sumOfDigits(int x)
{
    int s = 0;
    while (x > 0) {
        s += x % 10;
        x /= 10;
    }
    return s;
}

int main(void)
{
    int x;
    scanf("%d", &x);
    printf("Sum of digits = %d\n", sumOfDigits(x));
    return 0;
}
```

```test
=== input
12345
=== output
Sum of digits = 15
```

```test
=== input
0
=== output
Sum of digits = 0
```

```test
=== input
9
=== output
Sum of digits = 9
```

```test
=== input
1001
=== output
Sum of digits = 2
```

```hint
`x % 10` is the last digit and `x / 10` removes it. Repeat while `x > 0`.
```

# Problem: Count vowels in a line using a function
id: func-count-vowels
difficulty: medium
source: Aptech Elementary Programming in C - Arrays #2 (with a function)

Write a function `int countVowels(char s[])` that returns how many vowels (a, e, i, o, u, in either case) are in the string. Read a whole line with `fgets` and remove the newline.

**Input:** one line (up to 100 characters).
**Output:** `Vowels: N`

```c starter
#include <stdio.h>
#include <string.h>
#include <ctype.h>

int countVowels(char s[])
{
    // loop until '\0'
}

int main(void)
{
    char line[205];
    fgets(line, sizeof(line), stdin);
    line[strcspn(line, "\n")] = '\0';
    // print the number of vowels
    return 0;
}
```

```c solution
#include <stdio.h>
#include <string.h>
#include <ctype.h>

int countVowels(char s[])
{
    int i, count = 0;
    for (i = 0; s[i] != '\0'; i++) {
        char c = tolower((unsigned char)s[i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
            count++;
        }
    }
    return count;
}

int main(void)
{
    char line[205];
    fgets(line, sizeof(line), stdin);
    line[strcspn(line, "\n")] = '\0';
    printf("Vowels: %d\n", countVowels(line));
    return 0;
}
```

```test
=== input
Hello World
=== output
Vowels: 3
```

```test
=== input
rhythm
=== output
Vowels: 0
```

```test
=== input
Education
=== output
Vowels: 5
```

```test
=== input
I love Bangladesh
=== output
Vowels: 6
```

```hint
Convert each character with `tolower` and compare it with the five vowels.
```
