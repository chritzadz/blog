---
title: Introduction
order: 1
---

## Welcome

This series follows along the book "Crafting Interpreters" by Robert Nystrom, building a small language called Lox from scratch. The goal is not just to have an interpreter at the end, but to actually understand every line that gets us there.

> An interpreter is a machine that takes source code and, well... interprets it. No compilation, no assembly, no virtual machine. One program just directly executes another.

## The Plan

We will build the language in two passes, just like the book does:

1. A tree-walking interpreter written in Java
2. A bytecode virtual machine in C

Each chapter of the series gets its own post here.

### Why bother?

Because writing an interpreter forces you to understand every piece of your toolchain that you usually get for free: parsing, scoping, garbage collection, and evaluation order. Once you have built one, stack traces and syntax errors never feel like magic again.

## The Language

Lox is small but complete enough to be fun: numbers, strings, booleans, `print`, variables, control flow, functions, and classes.

```java
// Hello, Lox!
var greeting = "Hello";
print greeting + " world";
```

The full grammar is coming in a later post, but the shape is roughly:

| Construct | Syntax |
| --- | --- |
| Variable | `var name = value;` |
| Function | `fun add(a, b) { return a + b; }` |
| Control flow | `if (a < b) print "yes";` |

## Where We Start

The first real post builds the scanner: turning a stream of characters into tokens. That is where this whole journey actually begins.
