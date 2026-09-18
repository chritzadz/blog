---
title: Introduction
order: 1
---

## Background

Welcome to my Machine Learning series! This is a topic that everyone talks about these days, from news headlines to job postings, yet few people explain what it actually means. In simple terms, Machine Learning is about teaching computers to learn patterns from data instead of programming them with explicit rules.

If that sounds abstract, think of it this way: instead of writing step-by-step instructions like "if the email contains the word 'lottery', mark it as spam", you show the computer thousands of emails labeled as spam or not spam, and let it figure out the rules on its own.

## What is Learning?

Before diving into algorithms, it helps to pin down what "learning" means for a machine. Roughly speaking, a program learns from experience with respect to a task if its performance at that task improves with more experience. That experience usually comes in the form of data: examples, measurements, or records of past events.

Most of what I will cover in this series falls under supervised learning, where each example comes with a label (like "spam" or "not spam"). The unsupervised kind, where the data has no labels, is a story for another time.

## What is Classification?

Before we can talk about any specific algorithm, we need to say precisely what problem we are trying to solve. Classification is a supervised learning task: given an input, we want to assign it to one of a fixed set of categories. Spam or not spam. Malignant or benign. Digit 0 through 9.

Here is the same idea in math terms.

Let the **input space** $$X$$ be the set of all possible inputs. Each input is a vector of $$N$$ features:

$$
x = (x_1, x_2, \dots, x_N) \in \mathbb{R}^N
$$

Let the **label space** $$Y$$ be the finite set of $$C$$ classes we want to predict:

$$
Y = \{1, 2, \dots, C\}
$$

When $$C = 2$$ we call it binary classification; when $$C > 2$$, multiclass classification.

A **classifier** is just a function that maps an input to a label:

$$
f : X \to Y
$$

We never get to see the true rule that assigns labels. Instead we are given a **training set** of $$M$$ labeled examples:

$$
D = \{(x_1, y_1), (x_2, y_2), \dots, (x_M, y_M)\}
$$

assumed to be drawn independently from the same (unknown) joint distribution $$P(X, Y)$$. The learning problem is to use $$D$$ to pick a function $$f$$ that does well on new, unseen inputs — not just on the examples it has already seen.
