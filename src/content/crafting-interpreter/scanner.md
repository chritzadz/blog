---
title: The Scanner
order: 2
---

## Tokens First

Before we can parse anything, we need to chop the source text into tokens. The scanner (or lexer) reads characters one at a time and groups them into lexemes with a type attached.

> The scanner's only job is to know what kind of thing it is looking at. It has no idea what the program means.

## Single Pass Design

We scan lazily: the parser asks for one token at a time instead of building a whole token list upfront.

### Why lazy?

- We never store tokens we do not need
- Syntax errors point at exactly the character being read
- The buffer stays tiny even for large files

The scanner keeps three pointers into the source: `start`, `current`, and `line`.

```java
private char advance() {
    current++;
    return source.charAt(current - 1);
}

private char peek() {
    return isAtEnd() ? '\0' : source.charAt(current);
}
```

## Matching Characters

The heart of the scanner is a big switch over the first character, with a little lookahead for two-character operators:

- `!` alone is an operator, but `!=` is a comparison
- `"` opens a string literal that runs until the closing quote
- `//` starts a comment that the scanner simply skips

## What Comes Next

With tokens flowing, the parser is next: a recursive descent grammar that turns our token stream into the abstract syntax tree the interpreter walks later.
