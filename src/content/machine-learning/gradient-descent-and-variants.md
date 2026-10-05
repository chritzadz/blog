---
title: Gradient Descent and Variants
order: 4
---

## Introduction

So far this series has been kind to us. Every classifier came with a neat closed-form answer — count a few things, plug them into a formula, and you are done. But most of machine learning does not work that way. Most of the time we cannot solve for the parameters directly. We have to *search* for them. That search is called **optimization**, and the tool we use to carry it out is **gradient descent**.

Before we can appreciate gradient descent, though, we need to talk about the basic stuff of gradient first. Specifically, we need to talk about **convexity** — the property that makes the search easy. So let me answer two questions first: what is this optimization actually for, and why do our problems turn out to be convex in the first place?

### What Is This Optimization For?

Training a model is really just a search. We pick a form for the model — a line, a logistic curve, a hyperplane — and that form comes with a handful of dials: the parameters (see parameters from the previous classifier models). Our job is to set those dials so that the model earns a minimal *error rate* give the training data.

To make "least wrong" precise, we write down a single number that measures it, called the **loss** (also called the objective or the cost — people use the words interchangeably). Feed the model a training example, compare its prediction to the true label, and the loss tells you how badly it missed. Add those misses up over the whole training set and you get one number:

$$
J(\theta)
$$

where $$\theta$$ — "theta" — is just the bundle of all the parameters we are allowed to tune. A big $$J$$ means the model is doing badly; a small $$J$$ means it is doing well. So learning becomes a clean, geometric problem: find the parameters that make the loss as small as possible,

$$
\theta^* = \operatorname*{arg\,min}_{\theta} J(\theta)
$$

The $$\operatorname*{arg\,min}$$ just means "the $$\theta$$ that gives the smallest value".

Now, why can't we simply try every possible setting of the dials and keep the best? Because the parameters are continuous and there are no limited number to try on. The number of combinations is beyond astronomically large, so brute force is no use here. We need a smarter strategy, one that feels its way downhill instead of checking everywhere. That strategy is gradient descent, and it is the subject of the rest of this post.

For now, notice that the models we have already met all fit this pattern.
1. Linear regression minimizes the squared error between its line and the data.
2. Logistic regression minimizes a log loss on its predicted probabilities.
3. The SVM minimizes a hinge loss over the margin.

Different-looking problems, same shape: pick the parameters that make one number as small as possible.

### Why Is It Convex?

Here is the good news. For the problems above, the loss $$J(\theta)$$ is **convex**. In plain terms, a convex function looks like a bowl — or, if you prefer, a valley with a single low point. It never has the wavy, bumpy shape of a mountain range.

Picture two marbles. Drop the first into a bowl: no matter where on the rim you release it, it rolls down and settles at the bottom — every marble, from every starting point, ends up in the same place. Drop the second onto a mountain range: it settles into a small dip near where it landed, never knowing that a much deeper valley exists somewhere else. The bowl is convex; the mountain range is not.

That single difference is worth a lot, because it gives us three guarantees:

- **There is only one valley to fall into.** In a convex loss, any local minimum *is* the global minimum. We can never get stuck in a "pretty good but not the best" dip.
- **The starting point does not matter.** Roll downhill from anywhere and you reach the bottom. We do not need to be clever or lucky about where we begin.
- **Downhill always means progress.** There is no misleading plateau or false floor that tricks us into stopping early.

So a convex problem is one we can actually solve reliably, and the search is easy to reason about.

And this is not luck. It comes from three ingredients, each of which keeps the bowl shape intact.

First, the model depends on its parameters in a simple, straight-line way: the prediction is a **weighted sum** of the features, where each parameter just scales one feature and everything is added up. Logistic regression does exactly this, then bends the result through the sigmoid — a fixed S-shaped curve with no dials of its own. Doubling a parameter doubles its contribution; nothing wild happens.

Second, the loss we measure the misses with is itself convex: a bowl in the prediction. Stick a convex loss onto a straight-line model and the result is still convex — a bowl in the parameters.

Third, combining things never breaks the shape. Adding up the per-example losses is just adding bowls together, and a sum of bowls is still a bowl. Adding an L2 penalty, $$\lambda \sum_i \theta_i^2$$, throws in one more bowl made of squares. Bowl plus bowl is bowl.

Put together, the total loss as a function of the parameters is convex. The clean valley is a consequence of how we built the model and the loss, not a lucky accident.

The contrast is worth keeping in mind. A neural network is *not* convex: its loss landscape really is a mountain range, full of dips, ridges, and flat spots. There, the starting point and the step size suddenly matter a great deal, and plain gradient descent is no longer enough. That is exactly why the "variants" in the title exist — momentum, stochastic updates, and adaptive step sizes were invented to survive a landscape that is not a nice clean bowl. We will get to them, but first we need the plain version.

## Convex Optimization

Almost everything in machine learning can be written in the same shape:

$$
\min_{\theta} \; J(D, \theta)
$$

Read it as: "over every possible setting of the parameters $$\theta$$, find the one that makes the objective $$J$$ as small as possible, given the training data $$D$$." And that objective is nearly always two things added together — the **loss** over the examples, plus a **regularizer** that keeps the model in check:

$$
J(D, \theta) = \underbrace{\sum_{i=1}^{M} L\big(x^{(i)}, y^{(i)}; \theta\big)}_{\text{how wrong on each example}} + \underbrace{r(\theta)}_{\text{keep it simple}}
$$

Let me make this concrete with logistic regression. Its parameters are the weight vector and the bias, $$\theta = \{w, b\}$$, and the loss for a single example is

$$
L\big(x^{(i)}, y^{(i)}; \theta\big) = \log\left(1 + \exp\left(-y^{(i)}(w^\top x^{(i)} + b)\right)\right)
$$

This is the same log loss we met in the logistic regression post, written for labels $$y \in \{-1, +1\}$$: it is small when the model has the right sign and is confident, and it grows the more the model is wrong. Adding it up over every training example gives the total loss, and the L2 regularizer is

$$
r(\theta) = \frac{1}{C}\, w^\top w
$$

which is nothing more than the sum of squared weights — a penalty for letting the weights grow too large. The knob $$C$$ sets how much we care: a bigger $$C$$ means a smaller penalty, so the model is free to fit the data closely; a smaller $$C$$ pulls the weights toward zero and keeps the model cautious. Putting it all together, logistic regression is just

$$
\min_{\theta} \; \sum_{i=1}^{M} \log\left(1 + \exp\left(-y^{(i)}(w^\top x^{(i)} + b)\right)\right) + \frac{1}{C}\, w^\top w
$$

One objective, one number to make small.

### Two Flavors: Convex and Non-Convex

These problems come in exactly two flavors.

**Convex — the easy case.** The objective is a single bowl. This is where the models from earlier live: linear regression, logistic regression, and the SVM. Gradient descent is guaranteed to find the one global minimum, no matter where it starts.

**Non-convex — the hard case.** The objective is a mountain range, full of pits, ridges, and flat spots. Deep learning lives here. There are many local minima, the starting point matters, and plain gradient descent can settle for something far from the best.

That is the whole reason the "variants" later in this post exist: they are tools for surviving the second case.

### Convex Sets

Before we can talk about sets of points, we should say where those points actually live. The symbol $$\mathbb{R}$$ just means the real numbers — ordinary numbers, positive or negative. The little exponent tells us how many of them we are stacking together:

- $$\mathbb{R}^N$$ is the space of **vectors** made of $$N$$ real numbers: $$x = (x_1, x_2, \dots, x_N)$$. One feature vector lives here, and so does a class mean $$\mu_c$$.
- $$\mathbb{R}^{M \times N}$$ is the space of **matrices** with $$M$$ rows and $$N$$ columns. A dataset of $$M$$ examples with $$N$$ features each is one such matrix, and so is an $$N \times N$$ covariance matrix $$\Sigma$$.

So "a convex set in $$\mathbb{R}^N$$" is just "a collection of points in $$N$$-dimensional space". When we draw pictures in 2D ($$\mathbb{R}^2$$) or 3D ($$\mathbb{R}^3$$), we are using the very same idea with $$N = 2$$ or $$3$$.

Now to the sets themselves. Start with a **line segment**. Take any two points $$a$$ and $$b$$. The straight segment joining them is every point of the form

$$
(1 - t)\,a + t\,b \qquad \text{for } 0 \le t \le 1
$$

At $$t = 0$$ we are at $$a$$, at $$t = 1$$ we are at $$b$$, and for values in between we slide along the straight line.

A set is **convex** if, for *any* two points you pick inside it, the whole segment between them also stays inside the set. In plain words: no holes, and no dents that bend inward.

Examples of convex sets:

- a disk (a filled-in circle),
- a triangle, a square, any filled-in polygon,
- a straight line, or a half-plane,
- the whole plane.

Counterexamples (not convex):

- a crescent moon — the segment between the two tips leaves the shape,
- a donut — the segment that cuts through the hole is not inside,
- the letter C — the gap lets the segment between the two ends escape,
- a star — the segment between two tips crosses outside the shape,
- the outline of a circle — the segment between two points on the rim cuts through the middle, which is not part of the outline.

This is exactly the idea behind convex functions. A function is convex when the region *above* its graph is a convex set — which is just a fancy way of saying its graph is a bowl. Equivalently: pick any two points on the curve, and the straight segment between them always sits *above* the curve. If that holds everywhere, the function is convex, and the search for its lowest point is easy.

### Affine Sets and Affine Functions

A convex set allows the segment between two of its points. An **affine set** is stricter: it must contain the *entire infinite line* through any two of its points,

$$
(1 - t)\,a + t\,b \qquad \text{for every real } t
$$

with no restriction to $$0 \le t \le 1$$. So affine sets are perfectly flat — a single point, a line, a plane, or a hyperplane. Every affine set is convex, but many convex sets are not affine: a disk is convex, yet the infinite line through two points on its rim shoots straight outside it.

An **affine function** is a straight-line function with a possible shift: $$f(x) = Ax + b$$ (or, for a single output, $$w^\top x + b$$). "Linear" usually means there is no constant term and the graph passes through the origin; "affine" simply allows the shift $$b$$. Affine functions send straight lines to straight lines, and their graphs are flat — exactly the hyperplanes. The LDA boundary $$w^\top x + b = 0$$ is the set where an affine function equals zero, which is why it comes out as a hyperplane.

### Norms

A **norm** is a way to measure the length of a vector, written $$\|x\|$$. Any sensible length has three properties:

- it is never negative, and is zero only for the zero vector,
- scaling the vector scales the length: $$\|c\,x\| = |c|\,\|x\|$$,
- the triangle inequality: going straight is never longer than going around, $$\|x + y\| \le \|x\| + \|y\|$$.

Three common ones:

- $$\ell_2$$ (Euclidean): $$\|x\|_2 = \sqrt{\sum_i x_i^2}$$ — the ordinary straight-line length,
- $$\ell_1$$ (Manhattan): $$\|x\|_1 = \sum_i |x_i|$$ — the distance if you can only walk along grid lines,
- $$\ell_\infty$$ (max): $$\|x\|_\infty = \max_i |x_i|$$ — the largest single coordinate.

The first two are special cases of the general **$$\ell_p$$ norm**, which we write down in the examples below.

**So what is a norm actually for?** It answers three questions we ask constantly, all with the same symbol: *how big is this thing?* (size), *how far apart are these two?* (distance), and *how wrong is this prediction?* (error). Those three show up everywhere:

- **Loss functions.** Linear regression's squared error is a norm of the residual, $$\|Xw - y\|_2^2$$ — "how wrong is the model", measured with the $$\ell_2$$ ruler. Swap in $$\ell_1$$ and large outliers stop dominating, which is why the $$\ell_1$$ loss is called *robust*.
- **Regularization.** Ridge adds $$\lambda \|w\|_2^2$$ and lasso adds $$\lambda \|w\|_1$$ — "how big are the weights". The $$\ell_1$$ penalty tends to push weights all the way to zero (sparse, automatic feature selection), while $$\ell_2$$ just keeps them small and smooth.
- **The SVM margin.** The width of the gap the SVM maximizes is $$2 / \|w\|$$ — "how wide is the safe zone".
- **Gradient descent.** The norm of the gradient, $$\|\nabla J\|$$, tells you how steep the ground is; when it is tiny you are near the bottom, and that is the stopping rule.
- **Distance-based methods.** k-NN, clustering, and cosine similarity all compare points with $$\|x - x'\|$$.

That is the real reason norms are worth knowing: $$\|\cdot\|$$ is compact notation for "measure the size, distance, or error of this", and once you can read it, half the formulas in machine learning stop looking cryptic.

Norms matter here because of **norm balls** — the set of all points whose length is at most one:

$$
\{x : \|x\| \le 1\}
$$

Every norm ball is a convex set. The $$\ell_2$$ ball is a disk, the $$\ell_1$$ ball is a diamond, and the $$\ell_\infty$$ ball is a square — and all three are convex. This is the geometric reason the L1 and L2 penalties we add for regularization keep our optimization convex: they are built from norms, and norms carve out convex shapes.

### Examples on Vectors and Matrices

Now that the pieces are in place, here is how they look in the two spaces we keep meeting.

**On $$\mathbb{R}^N$$ (vectors).** The affine function is a dot product plus a shift,

$$
f(x) = a^\top x + b = \sum_{j=1}^{N} a_j x_j + b
$$

and the norms are the general $$\ell_p$$ family,

$$
\|x\|_p = \left(\sum_{j=1}^{N} |x_j|^p\right)^{1/p} \quad \text{for } p \ge 1,
\qquad
\|x\|_\infty = \max_j |x_j|
$$

The $$\ell_1$$ and $$\ell_2$$ norms from before are just $$p = 1$$ and $$p = 2$$, and the $$\ell_\infty$$ norm is the limiting case as $$p$$ grows without bound.

**On $$\mathbb{R}^{M \times N}$$ (matrices).** Everything carries over, with the matrix playing the role of the vector. The affine function pairs every entry with a matching weight and adds them up,

$$
f(X) = \sum_{i=1}^{M} \sum_{j=1}^{N} A_{ij} X_{ij} + b = \operatorname{tr}(A^\top X) + b
$$

where $$\operatorname{tr}$$ is the **trace**, the sum of the diagonal entries. The trace form is just the matrix version of a dot product: flatten both matrices into long vectors and take $$a^\top x$$.

For matrices, the natural "length" is the **spectral norm** (also written $$\|\cdot\|_2$$), which is the largest singular value,

$$
\|X\|_2 = \sigma_{\max}(X) = \left(\lambda_{\max}(X^\top X)\right)^{1/2}
$$

In words: the singular values measure how much the matrix stretches different directions, and the spectral norm is the biggest stretch of all. It is to matrices what the $$\ell_2$$ norm is to vectors.

### Operations That Preserve Convexity

We have been saying that sums and compositions of convex functions stay convex. Here is that claim made precise — these are the rules that let us know an objective is convex without checking every single point.

- **Non-negative combination.** If $$f$$ and $$g$$ are convex and $$a, b \ge 0$$, then

  $$
  h(x) = a\,f(x) + b\,g(x)
  $$

  is convex. This is why adding up the per-example losses, and adding a non-negative penalty such as $$\lambda \|w\|_2^2$$, keeps the whole objective convex. The coefficients have to be non-negative: a negative one flips a bowl upside down into a hill.

- **Composition with an affine map.** If $$f$$ is convex, then

  $$
  h(x) = f(Ax + b)
  $$

  is convex. Feeding a straight-line (affine) map into a convex function preserves the bowl shape. This is exactly the case we used earlier — a convex loss sitting on top of a linear model, like squared error on $$w^\top x + b$$, stays convex in the parameters.

- **Pointwise maximum.** If $$f$$ and $$g$$ are convex, then

  $$
  h(x) = \max\{f(x), g(x)\}
  $$

  is convex. The higher of two bowls is still a bowl: the surface just switches from one to the other, and that switch only bends it upward. The hinge loss is built this way — $$\max\{0, 1 - y\,s\}$$ is the max of a constant and a straight line, so it is convex.

- **But composition of convex functions is not generally convex.** For a general pair of convex functions,

  $$
  h(x) = f(g(x))
  $$

  can easily fail to be convex. A neural network is exactly this — a stack of nonlinear layers composed one after another — so its loss is usually non-convex. That is the mountain range again, and it is the reason the affine rule above is special: it is the one composition we get to use for free.

### First-Order and Second-Order Conditions

So far we have described convexity with a picture: the graph is a bowl. It is worth having a way to *check* that with calculus, and the first-order and second-order conditions are exactly that.

First, some vocabulary. A function is **differentiable** if its **gradient** exists at every point of its domain — the gradient $$\nabla f(x)$$ is the vector of partial derivatives, one per input, and it points in the direction of steepest ascent. If the function can be differentiated twice, we also get the **Hessian** $$\nabla^2 f(x)$$, the matrix of second partial derivatives, whose entry in row $$i$$, column $$j$$ is $$\partial^2 f / \partial x_i \partial x_j$$.

**First-order condition (testing convexity).** A differentiable function is convex exactly when its graph lies *above* every tangent hyperplane:

$$
f(y) \ge f(x) + \nabla f(x)^\top (y - x) \qquad \text{for all } x, y
$$

The right-hand side is the first-order Taylor approximation — the tangent line (or plane) at $$x$$. For a bowl this is obvious: because the surface keeps curving upward, it can never dip below its own tangent. So the tangent is a **global underestimator**, and that inequality is what convexity looks like in calculus.

**First-order optimality (finding a minimum).** If $$x^*$$ is a minimum, then the tangent is flat there:

$$
\nabla f(x^*) = 0
$$

This is the familiar "set the derivative to zero" from calculus. For a convex function it is not just necessary but also *sufficient*: any point with zero gradient is automatically the global minimum. That is the whole reason convex problems are easy.

**Second-order condition (testing convexity).** For a twice-differentiable function, convexity is the same as the **Hessian being positive semi-definite** at every point:

$$
\nabla^2 f(x) \succeq 0 \qquad \text{for all } x
$$

"Positive semi-definite" means the Hessian curves upward in every direction: for any direction $$v$$, $$v^\top \nabla^2 f(x)\, v \ge 0$$. In one dimension the Hessian is just the second derivative, and this reduces to the rule you already know — $$f''(x) \ge 0$$ means the curve bends upward. In several dimensions it is the same idea applied to every direction at once.

**A word on the $$\succeq 0$$ notation.** The symbol $$\succeq$$ is a curly "greater than or equal", and it is a *different relation* from the ordinary $$\ge$$. You cannot compare a whole matrix to a number entry by entry, so $$\nabla^2 f(x) \succeq 0$$ is **defined** through the quadratic form:

$$
\nabla^2 f(x) \succeq 0
\quad\Longleftrightarrow\quad
v^\top \nabla^2 f(x)\, v \ge 0 \ \text{ for every vector } v
$$

The "$$0$$" on the right is the zero matrix, and the comparison is made through $$v^\top (\cdot)\, v$$, not entry by entry. It says: no matter which direction $$v$$ you look, the curvature is non-negative — the surface never bends downward anywhere. (This is why we write the curly $$\succeq$$ instead of $$\ge$$: a positive semi-definite matrix is allowed to have negative entries off its diagonal, so an entry-by-entry comparison would mean something else entirely.)

**Why this matters.** PSD is the *test* for convexity: a twice-differentiable function is convex exactly when its Hessian is positive semi-definite everywhere. So if you can show the Hessian is PSD, you have proven the problem is a bowl — a single global minimum that gradient descent will find. That one check is what separates the easy convex problems from the hard non-convex ones.

**So where does the "$$= 0$$" actually go?** It belongs to the *gradient*, not the Hessian. Setting $$\nabla f(x^*) = 0$$ finds the flat spots — the candidates for a minimum. The Hessian then tells you *what kind* of flat spot it is:

- positive semi-definite ($$\succeq 0$$) → a minimum (a bowl),
- negative semi-definite ($$\preceq 0$$) → a maximum (a hill),
- indefinite (up in some directions, down in others) → a saddle.

So the second-order *condition for convexity* is not "the Hessian is zero" — it is "the Hessian is non-negative in every direction". The "$$= 0$$" is the first-order optimality condition, and the two work together: the zero gradient finds the spot, and the positive semi-definite Hessian confirms it is the bottom of the bowl.

### Local Optimality Is Global (Convex Only)

Here is the single most useful fact about convex problems, the one all the gradient-descent guarantees lean on:

> For a convex problem, every locally optimal point is globally optimal.

(Remember the cubic $$f(x) = x^3 - 3x$$ from the standard-form post: it had a local minimum that was *not* global, and that could only happen because the function was not convex.)

Let us prove it by contradiction. Suppose, just to see what breaks, that $$x$$ is **locally optimal but not globally optimal**.

**What "locally optimal" gives us.** There is a radius $$R > 0$$ such that nothing nearby does better — every feasible point $$z$$ with $$\|z - x\|_2 \le R$$ satisfies

$$
f(x) \le f(z)
$$

**What "not globally optimal" gives us.** Somewhere out there is a feasible point that actually beats $$x$$:

$$
f(y) < f(x)
$$

That $$y$$ has to lie *outside* the ball — if it were inside, it would already contradict the line above.

**Take a tiny step from $$x$$ toward $$y$$.** Choose a small $$t$$ with $$0 < t < 1$$, small enough that we stay inside the ball:

$$
z = (1 - t)\,x + t\,y, \qquad \text{with } t \text{ small enough that } \|z - x\|_2 = t\,\|y - x\|_2 \le R
$$

Two things make $$z$$ useful: the feasible set is convex, so $$z$$ is feasible; and $$z$$ is inside the ball, so it lives in the "local" neighbourhood.

**Convexity drags $$z$$ below the chord.** Because $$f$$ is convex, the value at a blend never exceeds the blend of the values:

$$
f(z) = f\big((1 - t)\,x + t\,y\big) \le (1 - t)\,f(x) + t\,f(y)
$$

Now use $$f(y) < f(x)$$:

$$
f(z) \le (1 - t)\,f(x) + t\,f(y) < (1 - t)\,f(x) + t\,f(x) = f(x)
$$

So $$f(z) < f(x)$$ — and $$z$$ is a *feasible point inside the ball*. That flatly contradicts $$x$$ being locally optimal.

Since assuming the opposite led to a contradiction, the assumption must be false: $$x$$ really is globally optimal. ∎

The picture behind the algebra is one line: in a bowl there is no "pretty good but not the best" resting place. If any other point is lower, then a point just a hair *toward* it is already lower too — so nothing can be a local bottom unless it is *the* bottom.

## Gradient Descent

We have the setup: choose the parameters $$\theta$$ to make a loss $$\ell(\theta)$$ as small as possible, and — for now — assume the loss is convex, so there is a single bottom to reach. Gradient descent is the simplest way to actually get there. The idea is almost embarrassingly simple: work out which way is downhill, take a small step that way, and repeat.

(Here we write the loss as $$\ell$$; in the introduction we called the same thing $$J$$. Same idea, different letter.)

### The Update Rule

At any point $$\theta$$, the gradient $$\nabla \ell(\theta)$$ points in the direction where the loss grows fastest. So to go *down*, we step in the opposite direction:

$$
\theta \leftarrow \theta - \alpha \nabla \ell(\theta)
$$

Two pieces to name:

- $$\nabla \ell(\theta)$$ is the **gradient** — the vector of partial derivatives, pointing uphill. The minus sign flips it into a downhill direction.
- $$\alpha$$ — "alpha" — is the **learning rate**, a small positive number that sets the size of each step. Too small and you crawl toward the bottom; too big and you overshoot the valley, or bounce around, or shoot off to infinity.

Start from some initial guess $$\theta^{(0)}$$ and apply the rule again and again:

$$
\theta^{(t+1)} = \theta^{(t)} - \alpha \nabla \ell(\theta^{(t)})
$$

In practice the loss is an average over the $$M$$ training examples, so its gradient is the average of the per-example gradients:

$$
\nabla \ell(D; \theta) = \frac{1}{M} \sum_{i=1}^{M} \nabla \ell\big(x^{(i)}, y^{(i)}; \theta\big)
$$

which turns the update into

$$
\theta^{(t+1)} = \theta^{(t)} - \alpha\, \frac{1}{M} \sum_{i=1}^{M} \nabla \ell\big(x^{(i)}, y^{(i)}; \theta^{(t)}\big)
$$

This version looks at the whole dataset to take a single step — we will meet cheaper variants later.

### When Do We Stop?

Gradient descent is a loop, so it needs a way to know when it is finished. Two common stopping rules:

- the parameters barely move: $$\| \theta^{(t+1)} - \theta^{(t)} \|_2 \le \varepsilon$$,
- the gradient is nearly flat: $$\| \nabla \ell(D; \theta^{(t)}) \|_2 \le \varepsilon$$.

Here

$$
\|\theta\|_2 = \sqrt{\sum_j |\theta_j|^2}
$$

is the $$\ell_2$$ norm of $$\theta$$ — the ordinary Euclidean length from the section on norms — and $$\varepsilon$$ — "epsilon" — is a small positive constant such as $$10^{-6}$$. If either rule holds, we are essentially at the bottom and we stop. In practice we also cap the number of iterations, so a run always ends eventually.

### Why a Step Decreases the Loss

The whole promise of gradient descent is that each step makes the loss smaller. Let us check that this is true, and see exactly when it can go wrong.

**The short version.** The gradient points uphill, so we step the other way. For a small step, the change in the loss is, to a first approximation,

$$
\ell(\theta - \alpha \nabla \ell(\theta)) \approx \ell(\theta) - \alpha \|\nabla \ell(\theta)\|_2^2
$$

The change is $$-\alpha \|\nabla \ell\|_2^2$$: since $$\alpha > 0$$ and a squared length is never negative, the loss goes down — and it drops faster when the slope is steep.

**The catch.** "To a first approximation" is doing a lot of work. It ignores how the slope itself changes as we move — the *curvature*. On a sharply curving surface a big step can overshoot so far that the loss ends up *higher* than before. So the size of the step really matters.

**A concrete check.** Take the simplest loss there is, a parabola:

$$
\ell(\theta) = \theta^2
$$

Its gradient is $$\nabla \ell(\theta) = 2\theta$$, so one step gives

$$
\theta_{\text{new}} = \theta - \alpha(2\theta) = (1 - 2\alpha)\,\theta
$$

and squaring it,

$$
\ell_{\text{new}} = (1 - 2\alpha)^2\,\theta^2 = (1 - 2\alpha)^2\,\ell(\theta)
$$

So every step multiplies the loss by the factor $$(1 - 2\alpha)^2$$. That factor is smaller than 1 — the loss shrinks — exactly when

$$
0 < \alpha < 1
$$

Step too timidly ($$\alpha$$ near $$0$$) and it barely moves; pick $$\alpha = 0.5$$ and the factor is $$0$$, reaching the bottom in a single step; push $$\alpha$$ past $$1$$ and the factor is bigger than $$1$$, so the loss *grows* and the run blows up. That is the entire learning-rate trade-off in one line.

**The general bound.** For a loss whose curvature never exceeds some number $$L$$ (for the parabola, $$L = 2$$), the same idea gives a guarantee for *any* step size:

$$
\ell(\theta - \alpha \nabla \ell(\theta)) \le \ell(\theta) - \alpha\left(1 - \tfrac{\alpha L}{2}\right) \|\nabla \ell(\theta)\|_2^2
$$

The bracket tells the whole story. When $$0 < \alpha < 2/L$$ it is positive, so the loss strictly decreases (unless the gradient is already zero); once $$\alpha$$ grows past $$2/L$$ it turns negative and the loss can increase. For the parabola, $$2/L = 2/2 = 1$$, matching the range we found by hand. That is why the learning rate has to be tuned: too small and you crawl, too large and you diverge.

### The Initial Point Matters

For a convex loss the starting point really does not matter: every run rolls to the same single bottom. But most real problems — deep learning, for instance — are not convex, and there the initial point can decide where you end up.

A tiny example makes it vivid. Take

$$
f(x) = x \cos(x)
$$

which is not convex: it has several valleys of different depths. Run gradient descent from different starting points and it settles into whichever valley is nearby — begin on the left and you land in a left valley, even if a deeper one sits somewhere else. The final point depends a lot on where you began.

The practical fix is blunt and effective: run gradient descent several times from different random initializations, then keep the run that ended with the lowest loss. It is cheap, easy to parallelize, and often the difference between a bad local minimum and a good one.

### Learning Rate Matters

The learning rate $$\alpha$$ is the single most important knob in gradient descent, and getting it wrong breaks the run in opposite ways:

- **Too big.** Each step jumps far. The loss can bounce around, overshoot the bottom, or grow without bound — the algorithm never converges.
- **Too small.** Each step is tiny. The loss creeps downward so slowly that you may run out of patience (or iterations) long before reaching the minimum.

A picture helps. Consider

$$
f(x) = 2x^2 \cos(x) - 5x
$$

a wavy function with several dips. Crank the learning rate up and the iterates leap across the valleys, sometimes landing higher than where they started; dial it down and they inch along the curve. No single value is magically right for every problem.

And that is the bad news: **there is no magic bullet.** No formula hands you the perfect $$\alpha$$. In practice you try a few values — often on a log scale like $$0.1, 0.01, 0.001, \dots$$ — watch the loss curve, and keep the one that descends fastest without blowing up. (Later we will see adaptive methods that tune the step size automatically, though even those have knobs to set.)

## Variants

Full-batch gradient descent has a hidden cost. Every single step needs the gradient over the *entire* dataset:

$$
\nabla \ell(D; \theta) = \frac{1}{M} \sum_{i=1}^{M} \nabla \ell\big(x^{(i)}, y^{(i)}; \theta\big)
$$

That sum runs over all $$M$$ examples, so one iteration costs $$O(M)$$ work, growing linearly with the dataset. On millions of examples a single step becomes painfully slow — you might take only a handful of steps in the time you have. The variants below trade a little accuracy in the step direction for a large speedup.

### Stochastic Gradient Descent

The fix is almost cheeky: instead of averaging over all $$M$$ examples, sample just **one** example at random and use its gradient as the step. At iteration $$t$$, pick an index $$i$$ uniformly at random and update

$$
\theta^{(t+1)} = \theta^{(t)} - \alpha \nabla \ell\big(x^{(i)}, y^{(i)}; \theta^{(t)}\big)
$$

Now each iteration costs $$O(1)$$ — a single example — instead of $$O(M)$$, so you can take roughly $$M$$ times as many steps for the same work.

Is one example's gradient a fair substitute for the full one? On average, yes. Because the example is drawn at random, its gradient is an **unbiased estimate** of the full gradient:

$$
\mathbb{E}\big[\nabla \ell(x, y; \theta)\big] = \frac{1}{M} \sum_{i=1}^{M} \nabla \ell\big(x^{(i)}, y^{(i)}; \theta\big) = \nabla \ell(D; \theta)
$$

In words: each single gradient is noisy and points a little off, but the noise averages out to zero. So SGD *wanders* rather than marching straight — its path is jittery — yet in expectation it heads downhill exactly like the full gradient. That noise is often a feature rather than a bug: on a non-convex landscape it helps the iterates hop out of shallow dips.

### Mini-Batch Gradient Descent

One example at a time is noisy and slow to settle, since a single gradient is a rough guess. **Mini-batch gradient descent** takes the middle road: average the gradient over a small random batch of $$b$$ examples,

$$
\theta^{(t+1)} = \theta^{(t)} - \alpha\, \frac{1}{b} \sum_{i \in \mathcal{B}} \nabla \ell\big(x^{(i)}, y^{(i)}; \theta^{(t)}\big)
$$

where $$\mathcal{B}$$ is a random batch of size $$b$$ (something like 32, 64, or 256). This costs $$O(b)$$ per step — a fixed, small amount — while giving a much steadier direction than a single example. It is the version people actually use, and "SGD" in modern code almost always means mini-batch.

So the three methods sit on a spectrum:

| Method | Examples per step | Cost per step | Noise |
| --- | --- | --- | --- |
| Batch (full) GD | all $$M$$ | $$O(M)$$ | none |
| Mini-batch GD | a batch of size $$b$$ | $$O(b)$$ | some |
| Stochastic GD | one | $$O(1)$$ | lots |

Momentum and adaptive methods like Adam come later.
