---
title: Naive Bayes and Linear Discriminant
order: 2
---

## Overview

Now that we have those basic definitions, we can look at two of the simplest classifiers: Naive Bayes and Linear Discriminant. They make a good pair to start with because they attack the same problem from two very different angles.

- **Naive Bayes** starts from probability. It asks: given these features, what is the probability of each label? Then it simply picks the label with the highest probability. The "naive" part is that it assumes every feature is independent of the others, which is rarely true in real data, yet the method still works surprisingly well.

- **Linear Discriminant** starts from geometry. It tries to draw a straight line (or in higher dimensions, a flat surface) that separates the classes as cleanly as possible, then classifies a new point by which side of that line it falls on.

Both answer the same question and both can end up with a straight boundary, but they get there in different ways: one through probabilities, the other through distances and spreads. In the sections below, we look at each on its own.

## Naive Bayes

As we said earlier, our goal is to find, for a given feature vector $$x$$, the probability of each label:

$$
P(Y = c \mid x)
$$

This is called the **posterior probability** — the probability of class $$c$$ *after* seeing the features. Once we have it for every class, we just pick the one with the highest value:

$$
\hat{y} = \operatorname*{arg\,max}_{c} P(Y = c \mid x)
$$

If we could compute this exactly, we would have the best possible classifier — the one that always picks the most probable label. It is called the **Bayes optimal classifier**, and no classifier can beat it on average. The trouble is that the posterior is hard to work with directly, so we use a formula to rewrite it in terms of things that are easier to estimate.

A quick reminder of the Greek letters we will meet (they are just names for ordinary quantities):

| Symbol | Read as | Meaning |
| --- | --- | --- |
| $$\mu$$ | "mu" | a mean (an average) |
| $$\sigma^2$$ | "sigma squared" | a variance (how spread out something is) |
| $$\sigma$$ | "sigma" | a standard deviation, the square root of the variance |
| $$\alpha$$ | "alpha" | a small smoothing constant that we choose by hand |

### The Idea

That formula is **Bayes' rule**, which flips the conditional probability around:

$$
P(Y = c \mid x) = \frac{P(x \mid Y = c) \cdot P(Y = c)}{P(x)}
$$

Each piece has a name:

| Term | Name | Meaning |
| --- | --- | --- |
| $$P(Y = c)$$ | prior | how common class $$c$$ is before seeing any features |
| $$P(x \mid Y = c)$$ | likelihood | how likely the features $$x$$ are if the label is $$c$$ |
| $$P(x)$$ | evidence | how likely the features $$x$$ are overall |
| $$P(Y = c \mid x)$$ | posterior | what we actually want |

The evidence $$P(x)$$ is the same for every class, so it does not change which class wins the argmax. For classification we only need to compare the numerators:

$$
P(Y = c \mid x) \propto P(x \mid Y = c) \cdot P(Y = c)
$$

The prior is easy: just count how often each class appears in the training data. The hard part is the likelihood $$P(x \mid Y = c)$$, because $$x$$ is a whole vector of features. This is where the "naive" assumption comes in.

### The Naive Assumption

Naive Bayes makes the problem tractable with three simplifying ideas:

1. **It approximates the Bayes optimal classifier.** We cannot compute the true posterior, so we approximate it using a simple form of the likelihood $$P(x \mid Y = c)$$. The result is only as good as that approximation. The likelihood is too hard to predict due to we can't know for sure the TRUE distribution.

2. **All features are assumed independent.** Given the label, the features are treated as if they have nothing to do with one another. This is what makes the method *naive* — in real data features are almost always correlated (think of word counts in an email). The assumption is strong and usually false, yet it keeps the math simple and often works well in practice.

3. **Each dimension is modeled by a simple univariate distribution.** Here is the trick that makes the math easy. The likelihood $$P(x \mid Y = c)$$ asks how all $$N$$ features look together for class $$c$$ — every combination of them, and how they move with each other. That is one huge, complicated object, and estimating it would need mountains of data. Naive Bayes refuses. Instead it describes each feature on its own with a small one-dimensional distribution — "univariate" literally means "one variable at a time". For a numeric feature, a Gaussian (a bell curve) is fully described by just two numbers: where it is centered (the mean) and how much it spreads (the variance). So one impossible $$N$$-dimensional problem becomes $$N$$ easy one-dimensional problems. And we fit a separate set of these small distributions for each class: the word "lottery" shows up often in spam emails and rarely in normal ones — two simple counts, not one tangled joint model.

Because of assumption 2, the likelihood factorizes into a product:

$$
P(x \mid Y = c) = \prod_{i=1}^{N} P(x_i \mid Y = c)
$$

and assumption 3 tells us how to compute each of those small factors. Putting it together, the class we pick is:

$$
\hat{y} = \operatorname*{arg\,max}_{c} P(Y = c) \prod_{i=1}^{N} P(x_i \mid Y = c)
$$

So the whole method reduces to counting priors and multiplying per-feature probabilities. No joint distribution over all features is ever needed.

### Parameter

Before we can classify anything, the model needs numbers. For Gaussian Naive Bayes, each class $$c$$ is described by three kinds of parameters:

- a **class prior**, $$P(Y = c)$$,
- a **mean** $$\mu_{i,c}$$ — "mu sub i,c" — the average of feature $$i$$ among the examples of class $$c$$,
- a **variance** $$\sigma^2_{i,c}$$ — "sigma squared sub i,c" — how much feature $$i$$ spreads out within class $$c$$.

We estimate all of them by **maximum likelihood** — choose the values that make the observed training data as likely as possible. The answers turn out to be exactly the intuitive ones. With $$M_c$$ training examples in class $$c$$:

- Prior: $$P(Y = c) = \frac{M_c}{M}$$
- Mean: $$\mu_{i,c} = \frac{1}{M_c} \sum_{m:\, y_m = c} x_{m,i}$$
- Variance: $$\sigma^2_{i,c} = \frac{1}{M_c} \sum_{m:\, y_m = c} \left(x_{m,i} - \mu_{i,c}\right)^2$$

In words: the prior is the fraction of examples in the class, the mean is the average of that feature within the class, and the variance is the average squared distance from that mean.

Counting the parameters:

| Parameter | Count |
| --- | --- |
| Class priors | $$C - 1$$ |
| Feature means | $$N \times C$$ |
| Feature variances | $$N \times C$$ |

The priors only contribute $$C - 1$$ because they must sum to one, so the last one is already determined by the others. Adding everything up:

$$
(C - 1) + N \cdot C + N \cdot C = 2NC + C - 1 = O(NC)
$$

So even in the worst case — many features, many classes — the model grows only linearly in $$N$$ and $$C$$. Compare that with a full Gaussian model that keeps a whole covariance matrix per class: $$O(N^2 C)$$ parameters. That difference is the entire reason Naive Bayes still works when $$N$$ is large and the data is scarce.

### Decision Boundary

To classify, we compare the posterior probabilities. It is easier to compare their logs, and we are allowed to because $$\log$$ is **monotonic**: it stretches values but never reorders them. So

$$
\operatorname*{arg\,max}_{c} P(Y = c \mid x) = \operatorname*{arg\,max}_{c} \log P(Y = c \mid x)
$$

Define the discriminant of class $$c$$ as that log-posterior:

$$
g_c(x) = \log P(Y = c \mid x)
$$

By Bayes' rule, and dropping $$P(x)$$ because it is the same for every class:

$$
g_c(x) = \log P(Y = c) + \log P(x \mid Y = c)
$$

Now substitute the Gaussian likelihood. By independence, $$P(x \mid Y = c)$$ is the product of one bell curve per feature, and each factor looks like this:

$$
P(x_i \mid Y = c) = \frac{1}{\sqrt{2\pi}\,\sigma_{i,c}} \exp\left(-\frac{(x_i - \mu_{i,c})^2}{2\,\sigma^2_{i,c}}\right)
$$

Here $$\sigma_{i,c}$$ — "sigma sub i,c" — is the standard deviation, the square root of the variance $$\sigma^2_{i,c}$$, and $$\mu_{i,c}$$ is the mean we defined above.

The log turns the product into a sum — one term per feature (read $$\sum_i$$ as "add this up over all features $$i$$"):

$$
\log P(x \mid Y = c) = \sum_i \left[-\log \sigma_{i,c} - \frac{1}{2}\log(2\pi) - \frac{(x_i - \mu_{i,c})^2}{2\,\sigma^2_{i,c}}\right]
$$

The $$\frac{1}{2}\log(2\pi)$$ term is identical for every class, so it cannot change the argmax and we drop it:

$$
g_c(x) = \log P(Y = c) - \sum_i \log \sigma_{i,c} - \sum_i \frac{(x_i - \mu_{i,c})^2}{2\,\sigma^2_{i,c}}
$$

Expand the square to see the shape:

$$
g_c(x) = \log P(Y = c) - \sum_i \log \sigma_{i,c} - \sum_i \frac{x_i^2}{2\,\sigma^2_{i,c}} + \sum_i \frac{x_i\,\mu_{i,c}}{\sigma^2_{i,c}} - \sum_i \frac{\mu_{i,c}^2}{2\,\sigma^2_{i,c}}
$$

The boundary between two classes $$c$$ and $$d$$ is simply where the two scores tie: $$g_c(x) = g_d(x)$$. Now look back at the score — it contains $$x_i^2$$ terms, the square of each feature. Squares bend, so the boundary bends with them. That is why Gaussian Naive Bayes usually draws a curved line instead of a straight one.

There is one clean exception. If both classes agree on the variance of every feature ($$\sigma^2_{i,c} = \sigma^2_i$$ for every $$c$$), then the $$x_i^2$$ terms are identical on both sides of the tie and cancel out. All the bending disappears, and what is left is straight:

$$
g_c(x) = \log P(Y = c) - \sum_i \log \sigma_i + \sum_i \frac{x_i\,\mu_{i,c}}{\sigma^2_i} - \sum_i \frac{\mu_{i,c}^2}{2\,\sigma^2_i}
$$

No squared terms remain — just plain $$x$$ multiplied by constants — so the boundary becomes a straight line (a flat surface in higher dimensions). That "same variance for everyone" assumption is exactly what **Linear Discriminant Analysis** makes, and it is where we go next.

### Others

**Boolean features.** So far we assumed each feature is a number and gave it a bell curve. But many features are simply true or false: does the email contain the word "lottery"? Does the pixel have ink? For these, each feature $$x_i$$ is either $$0$$ or $$1$$, and we describe it with a single coin-flip probability per class:

$$
P(x_i = 1 \mid Y = c) = p_{i,c}
$$

which means $$P(x_i = 0 \mid Y = c) = 1 - p_{i,c}$$. This is the **Bernoulli distribution** — one biased coin per feature, per class. Both cases can be written in a single line using powers:

$$
P(x_i \mid Y = c) = p_{i,c}^{x_i} (1 - p_{i,c})^{1 - x_i}
$$

When $$x_i = 1$$ the second factor becomes 1 and we are left with $$p_{i,c}$$; when $$x_i = 0$$ the first factor becomes 1 and we are left with $$1 - p_{i,c}$$. Independence then gives the likelihood as a product, exactly like before:

$$
P(x \mid Y = c) = \prod_{i=1}^{N} P(x_i \mid Y = c)
$$

where each factor is the little coin-flip expression above.

The maximum likelihood estimate is just counting. With $$M_c$$ examples in class $$c$$:

$$
p_{i,c} = \frac{\text{count of } x_i = 1 \text{ in class } c}{M_c}
$$

In words: if 40 of your 100 spam emails contain the word "lottery", then $$p = \frac{40}{100} = 0.4$$ for that feature in the spam class. Taking the log, the score becomes:

$$
\log P(x \mid Y = c) = \sum_i \left[x_i \log p_{i,c} + (1 - x_i)\log(1 - p_{i,c})\right]
$$

**Smoothing.** Here is a problem that shows up the moment you start counting. Suppose the word "lottery" never appears in the non-spam emails of your training set. The count is 0, so the estimate is $$p = 0$$. Now an email arrives that *does* contain "lottery": the factor $$p^{1} = 0$$ wipes out the entire likelihood for the non-spam class, and the score hits $$\log(0)$$, which is negative infinity. One feature overrules all the others. That is clearly wrong — "never seen in training" does not mean "impossible".

The fix is **smoothing**: pretend we saw a few extra imaginary examples of every outcome before we count. The simplest version, called additive (or Laplace) smoothing, adds a small number $$\alpha$$ — "alpha", the smoothing constant we pick by hand — to each count:

$$
p_{i,c} = \frac{\text{count of } x_i = 1 \text{ in class } c + \alpha}{M_c + 2\,\alpha}
$$

For a boolean feature there are two possible values, which is where the $$2\,\alpha$$ in the denominator comes from: we add $$\alpha$$ for "yes" and $$\alpha$$ for "no", so the probabilities still sum to 1. In general, if a feature can take $$V$$ different values, the denominator becomes $$M_c + \alpha \cdot V$$.

$$\alpha$$ is a **hyperparameter** — a knob we set *before* training, unlike the parameters ($$p$$, $$\mu$$, $$\sigma^2$$) that are learned from the data. What it actually does:

- $$\alpha = 0$$ → no smoothing, plain counting.
- $$\alpha = 1$$ → the classic Laplace smoothing: every outcome gets one imaginary example.
- Larger $$\alpha$$ → more imaginary examples, so every probability is pulled toward uniform (toward $$0.5$$ for a boolean). The model trusts the data less and becomes more cautious.
- Smaller $$\alpha$$ → closer to raw counting, but a higher risk of zero probabilities.

Picking $$\alpha$$ is a matter of trying a few values and keeping the one that does best on held-out data. But the point is simple: smoothing guarantees that no probability is ever exactly zero, so a single unseen feature can no longer wipe out a whole class.

### Example

TODO: A small worked example, e.g. spam classification.

## Linear Discriminant

The second classifier is **Linear Discriminant Analysis** (LDA), introduced by Ronald Fisher in the 1930s. Like Naive Bayes, it is an approximation to the Bayes optimal classifier, but its picture of the data is very different. Naive Bayes gave every feature its own independent bell curve; LDA gives each class one **multivariate** Gaussian — a single joint bell shape over all the features at once — and, most importantly, all classes **share the same covariance matrix**.

A reminder of the symbols for this section (again, just names for ordinary quantities):

| Symbol | Read as | Meaning |
| --- | --- | --- |
| $$\mu_c$$ | "mu sub c" | the mean vector of class $$c$$ — one mean per feature |
| $$\Sigma$$ | "capital sigma" | the covariance matrix, shared by every class |
| $$S_W, S_B$$ | "S within", "S between" | within-class and between-class scatter (ordinary Latin S) |
| $$\lambda$$ | "lambda" | an eigenvalue, used in the multiclass version |
| $$\top$$ | "transpose" | turns a column vector into a row vector |

### The Idea

Instead of one independent curve per feature, LDA says: for each class, the whole feature vector $$x$$ comes from one multivariate Gaussian. Writing $$\mu_c$$ for the class mean vector and $$\Sigma$$ for the shared covariance matrix, the likelihood is

$$
P(x \mid Y = c) = \frac{1}{(2\pi)^{N/2}\,|\Sigma|^{1/2}} \exp\left(-\frac{1}{2}(x - \mu_c)^\top \Sigma^{-1} (x - \mu_c)\right)
$$

Reading the pieces:

- $$\mu_c$$ is now a **vector** ($$N$$ numbers, one mean per feature) and it differs from class to class.
- $$\Sigma$$ — capital sigma — is the **covariance matrix**, an $$N \times N$$ grid that is **identical for every class**. Its diagonal entries are the variances, and its off-diagonal entries are the covariances: how two features move together.
- $$|\Sigma|$$ is its determinant and $$\Sigma^{-1}$$ its inverse; the little exponent $$-\frac{1}{2}(x-\mu_c)^\top\Sigma^{-1}(x-\mu_c)$$ measures how far $$x$$ is from the class mean, with the features' spreads and correlations taken into account.

This is where LDA and Naive Bayes part ways. In Naive Bayes the covariance matrix is **diagonal** (only variances, no correlations) and each class gets its own. LDA allows features to correlate — the off-diagonal entries are usually non-zero — but forces all classes to use the **same** matrix. Remember the exception at the end of the Naive Bayes section: when all classes shared their variances, the boundary became straight. LDA turns that observation into its central assumption, and the shared matrix is what keeps the boundary linear.

### Parameter

Once again, the model is described by three kinds of parameters:

- a **class prior**, $$P(Y = c)$$,
- a **mean vector** $$\mu_c$$ — one mean per feature for class $$c$$,
- one **shared covariance matrix** $$\Sigma$$ — the same for every class.

The maximum likelihood estimates look familiar. With $$M_c$$ examples in class $$c$$:

- Prior: $$P(Y = c) = \frac{M_c}{M}$$
- Mean: $$\mu_c = \frac{1}{M_c} \sum_{m:\, y_m = c} x_m$$
- Covariance (pooled over all classes): $$\Sigma = \frac{1}{M} \sum_{c} \sum_{m:\, y_m = c} (x_m - \mu_c)(x_m - \mu_c)^\top$$

The mean estimate is just the vector of feature averages inside the class, and the covariance pools the spread of every class around its own mean.

Now the interesting part: **counting**. The covariance matrix looks like it has $$N^2$$ numbers, but it is **symmetric**. The covariance between feature $$i$$ and feature $$j$$ is exactly the same as the covariance between $$j$$ and $$i$$, so $$\Sigma_{ij} = \Sigma_{ji}$$. Everything below the diagonal is just a mirror of everything above it. That leaves only the diagonal plus the upper triangle as genuinely free numbers:

$$
N + \frac{N(N-1)}{2} = \frac{N(N+1)}{2}
$$

| Parameter | Count |
| --- | --- |
| Class priors | $$C - 1$$ |
| Class means | $$N \times C$$ |
| Shared covariance | $$\frac{N(N+1)}{2}$$ |

Adding it up gives

$$
(C - 1) + NC + \frac{N(N+1)}{2}
$$

Compare this with Naive Bayes, which needed $$2NC$$ numbers for its means and variances. LDA replaces the per-class variances with one shared symmetric matrix, which is why it is cheaper on data when features correlate, but more expensive than Naive Bayes when $$N$$ is very large.

### The Geometry

Fisher did not start from probabilities at all. He asked a purely geometric question: can we squash the $$N$$-dimensional data down onto a **single line** so that the classes are as easy as possible to tell apart?

**What projecting onto a line really means.** A direction is just a list of $$N$$ numbers, $$w = (w_1, w_2, \dots, w_N)$$ — think of it as an arrow through the feature space. Projecting a point $$x$$ onto that arrow produces a single number:

$$
w^\top x = w_1 x_1 + w_2 x_2 + \dots + w_N x_N
$$

Multiply feature by feature, then add. Picture a sunbeam shining straight down onto the line: every point casts a shadow, and $$w^\top x$$ is where that shadow lands. That is all "projecting onto a line" means — we replace each $$N$$-dimensional point by one number.

The little transpose $$\top$$ is just bookkeeping. $$x$$ is a column vector, and to multiply two vectors into a single number, one of them must be flipped into a row first: $$(1 \times N)$$ times $$(N \times 1)$$ gives $$1 \times 1$$, a number. Leave the transpose off and you get an $$N \times N$$ matrix instead — which is exactly the outer product hiding inside $$S_B$$ below.

A tiny example: if $$w = (1, 0)$$, then $$w^\top x = x_1$$, so the shadow only sees the first feature. If $$w = \left(\frac{1}{\sqrt{2}}, \frac{1}{\sqrt{2}}\right)$$, the shadow sees the average of the two features. Different arrows, different shadows.

**What we want from the shadows.** A class mean is a point too, so it also casts a shadow: class 1 lands at $$w^\top \mu_1$$ and class 2 at $$w^\top \mu_2$$. Two things make the classes easy to tell apart on the line:

- the two mean-shadows should be **far apart**,
- each class's own shadows should be **tight**, with little spread.

Two matrices capture this. The **between-class scatter** $$S_B = (\mu_1 - \mu_2)(\mu_1 - \mu_2)^\top$$ measures how separated the means are, and the **within-class scatter** $$S_W$$ measures how spread out each class is around its own mean. Fisher's criterion is their ratio:

$$
J(w) = \frac{w^\top S_B\, w}{w^\top S_W\, w}
$$

**Why that ratio is really "separation ÷ spread".** The numerator looks scary, but substitute $$S_B$$ and regroup — everything here is just a number, so the order does not matter:

$$
w^\top S_B\, w = w^\top(\mu_1 - \mu_2)(\mu_1 - \mu_2)^\top w = \left(w^\top \mu_1 - w^\top \mu_2\right)^2
$$

which is nothing more than the **squared gap between the two projected means**. In the same way, $$w^\top S_W\, w$$ is the total squared spread of the shadows inside the classes. So

$$
J(w) = \frac{(\text{gap between the projected means})^2}{\text{spread of the projected classes}}
$$

and maximizing it means choosing the viewing angle where the two piles of shadows sit furthest apart relative to how fat each pile is. Picture a cloud of red and blue points: from some angles they overlap into one blur, but from the best angle they fall into two thin, clearly separated shadows.

We want the gap big and the spread small, so we maximize $$J(w)$$. The answer is

$$
w^* = S_W^{-1}(\mu_1 - \mu_2)
$$

Notice it is *almost* just "the line joining the two means", $$\mu_1 - \mu_2$$ — but multiplied by $$S_W^{-1}$$. That extra factor rescales the direction: directions in which the data is naturally noisy get down-weighted, so the line leans away from the messy directions and toward the clean ones.

With more than two classes there is not one direction but up to $$C - 1$$ of them (you cannot separate $$C$$ groups with fewer than $$C-1$$ independent lines). They are found by solving the generalized eigenvalue problem

$$
S_B\, v = \lambda\, S_W\, v
$$

and keeping the eigenvectors $$v$$ with the largest $$\lambda$$ — "lambda", the eigenvalue that measures how good each direction is. With two classes this collapses back to the single $$w^*$$ above.

### Decision Boundary

Now put the probabilities back in and follow exactly the same recipe as before. Take the log-posterior of class $$c$$:

$$
g_c(x) = \log P(Y = c) + \log P(x \mid Y = c)
$$

Substitute the multivariate Gaussian. Its normalizer $$(2\pi)^{N/2}|\Sigma|^{1/2}$$ is the same for every class, so it drops out, leaving

$$
g_c(x) = \log P(Y = c) - \frac{1}{2}(x - \mu_c)^\top \Sigma^{-1} (x - \mu_c)
$$

Expand the quadratic form:

$$
g_c(x) = \log P(Y = c) - \frac{1}{2} x^\top \Sigma^{-1} x + \mu_c^\top \Sigma^{-1} x - \frac{1}{2} \mu_c^\top \Sigma^{-1} \mu_c
$$

Here is the punchline. The term $$-\frac{1}{2} x^\top \Sigma^{-1} x$$ does **not** contain $$c$$, because every class uses the *same* $$\Sigma$$. It is identical for all classes, so when we compare two classes it cancels, and what is left is **linear in $$x$$**:

$$
g_c(x) = \mu_c^\top \Sigma^{-1} x - \frac{1}{2} \mu_c^\top \Sigma^{-1} \mu_c + \log P(Y = c)
$$

Writing $$w_c = \Sigma^{-1}\mu_c$$ and $$b_c = -\frac{1}{2}\mu_c^\top\Sigma^{-1}\mu_c + \log P(Y = c)$$, the score is simply

$$
g_c(x) = w_c^\top x + b_c
$$

The boundary between two classes, $$g_c(x) = g_d(x)$$, is a straight line — a hyperplane in higher dimensions. That is exactly why it is called **Linear** Discriminant. Compare this with Naive Bayes, whose boundary was curved (quadratic) unless the classes happened to share their variances. LDA builds the shared covariance into the model, so its boundary is *always* straight — and, unlike the Naive Bayes special case, it can still account for correlations between features through the off-diagonal entries of $$\Sigma$$.

### The Linear Classifier

Step back and look at the object we have built. Every score has the shape

$$
g(x) = w^\top x + b
$$

with a **weight vector** $$w$$ and a **bias** (offset) $$b$$. This is the simplest and most important classifier in machine learning — the **linear classifier** — so it is worth reading geometrically.

**It splits the feature space in two.** The equation $$g(x) = 0$$ is the decision boundary: a line in 2D, a plane in 3D, a hyperplane in $$N$$ dimensions. It slices the space into two **half-spaces**:

- on one side $$g(x) > 0$$,
- on the other side $$g(x) < 0$$.

Every point in the same half-space gets the same label, so classifying just means asking which side of the boundary a point falls on.

**The weight vector is perpendicular to the boundary.** Take any two points $$x^{(1)}$$ and $$x^{(2)}$$ that both lie *on* the boundary, so both score zero. Then

$$
w^\top x^{(1)} + b = w^\top x^{(2)} + b
\qquad\Longrightarrow\qquad
w^\top\left(x^{(1)} - x^{(2)}\right) = 0
$$

The difference $$x^{(1)} - x^{(2)}$$ is a direction that runs *along* the boundary, and the equation says $$w$$ is perpendicular to it. In other words, $$w$$ is the **normal vector**: it sticks straight out of the boundary at a right angle.

**The weight vector points into the positive class.** Since $$w$$ is normal to the boundary, moving along $$w$$ changes $$g$$ the fastest — and it increases. Step from a boundary point a little in the direction of $$w$$ and the score becomes positive. So $$w$$ is an arrow pointing directly into the region where the positive class lives, exactly as your lecturer described. Flip the sign of $$w$$ and it points at the other class.

**Changing $$w$$ tilts the boundary; changing $$b$$ slides it.** The direction of $$w$$ sets the boundary's orientation (its tilt angle) — rotate $$w$$ and the boundary rotates with it. The bias $$b$$ only shifts the boundary back and forth, without tilting it.

**The prediction is a sign.** For a two-class problem we name the classes $$-1$$ and $$+1$$. The classifier computes the score and reports which side you are on:

$$
\hat{y} = \operatorname{sign}\left(w^\top x + b\right) = \operatorname{sign}\big(g(x)\big)
$$

which is $$+1$$ when $$g(x) > 0$$ and $$-1$$ when $$g(x) < 0$$. Each entry of $$w$$ is a weight saying how strongly its feature pushes the answer toward $$+1$$, while $$b$$ sets the default. That is why $$w$$ is called the *weight vector*: the prediction is a weighted sum of the features, and the sign turns that sum into a class.

And it closes the loop with Fisher. For LDA the weight vector is not chosen by hand — comparing two classes gives $$w = \Sigma^{-1}(\mu_1 - \mu_2)$$, which is exactly the $$w^*$$ that maximized the scatter ratio in the geometry section. The projection view and the boundary view describe the very same arrow.

### Example

TODO: A small worked example.

## Naive Bayes vs Linear Discriminant

TODO: Similarities, differences, and when to use which.

## Summary

TODO: Wrap up and tease the next post.
