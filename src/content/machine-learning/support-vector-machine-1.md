---
title: SVM 1
order: 5
---

We have spent this series building classifiers, and they keep landing in the same place. Linear Discriminant Analysis, in particular, closed with the **linear classifier**: a weight vector $$w$$, a bias $$b$$, and a decision boundary

$$
w^\top x + b = 0
$$

that slices the feature space into two halves. Points on one side get one label, points on the other side get the other.

But we quietly skipped over something. When the data can be separated by a straight boundary at all, there is **not just one** such boundary. There are infinitely many. Slide it a little, tilt it a little, and the data is still cleanly split. Every one of them is *perfect* on the training set. So which one should we choose?

The **Support Vector Machine** (SVM) is the answer to that question, and the answer is purely geometric.

## Maximum Margin

### Why Any Line Won't Do

Picture two clouds of points, one class on each side, clean enough that a straight line can separate them. Now imagine two candidate lines. The first threads the gap right down the middle, leaving a comfortable strip of empty space on both sides. The second is jammed right up against a point of one class — technically it still separates everything, but it is one noisy measurement away from getting the answer wrong.

Both lines score 100% on the training data, yet the second is clearly the riskier bet. The difference between them is **room to breathe**. We want the boundary that sits as far as possible from every point, so that small wiggles in the data — noise, measurement error, a new point that lands a bit off — do not flip the prediction.

So we need to measure that room. The **margin** of a boundary is the distance from the boundary to the **closest** training point, measured straight out at a right angle. The closest point is what matters: it sets how tight the squeeze is. Every other point is farther away and does not constrain us.

This gives us the **maximum margin principle**: among all the hyperplanes that separate the data, pick the one whose margin is largest. Because the problem is symmetric, the winning boundary will end up with the closest points of both classes exactly touching it — at least one from each side. Those special points are the **support vectors**, and they are the only training examples that actually determine where the boundary sits. Move any other point and nothing changes; move a support vector and the whole boundary shifts. They are the tent poles holding up the decision surface.

To turn this picture into math, we need two ways of measuring a margin. They look similar and their names sound alike, so it is worth keeping them apart.

Here are the symbols we will use (again, just names for ordinary quantities):

| Symbol | Read as | Meaning |
| --- | --- | --- |
| $$x^{(i)}$$ | "x super i" | the $$i$$-th training example (a feature vector) |
| $$y^{(i)}$$ | "y super i" | its label, either $$-1$$ or $$+1$$ |
| $$w, b$$ | "w", "b" | the weight vector and bias that define the boundary |
| $$\hat{\gamma}^{(i)}$$ | "gamma hat super i" | the functional margin of example $$i$$ |
| $$\gamma^{(i)}$$ | "gamma super i" | the geometric margin of example $$i$$ |
| $$\lVert w \rVert$$ | "norm of w" | the length of $$w$$ |
| $$M$$ | "M" | the number of training examples |

### Functional Margin

The decision function on its own tells us which side of the boundary a point is on:

$$
w^\top x + b
$$

and its sign is the predicted class. To fold the true label in, we name the two classes $$-1$$ and $$+1$$ and multiply:

$$
\hat{\gamma}^{(i)} = y^{(i)}\left(w^\top x^{(i)} + b\right)
$$

This is the **functional margin** of example $$i$$. The sign trick is the whole point: if the prediction agrees with the label, both factors have the same sign and the product is **positive**; if it disagrees, the product is **negative**. So the sign of $$\hat{\gamma}^{(i)}$$ tells us *correct or not*, and its size tells us how confidently we are on that side.

The margin of the whole dataset is then set by the worst example:

$$
\hat{\gamma} = \min_{i=1,\dots,M} \hat{\gamma}^{(i)}
$$

In words: measure every point, take the smallest. If that number is positive, the boundary separates the data cleanly, and the smallest value is exactly the tightest squeeze.

There is a problem, though. The functional margin depends on the **scale** of $$w$$ and $$b$$. Watch what happens if we replace $$w$$ with $$\gamma w$$ and $$b$$ with $$\gamma b$$, for any $$\gamma > 0$$:

$$
w^\top x + b = 0 \quad\Longleftrightarrow\quad \gamma w^\top x + \gamma b = 0
$$

The boundary is **exactly the same line** — every point falls on the same side as before — but the functional margin gets multiplied by $$\gamma$$. We could make it as large as we like just by blowing up $$w$$, without changing the classifier at all. A quantity that can be inflated for free cannot be a real distance. We have been measuring "how far" in units that stretch whenever we feel like it.

### Geometric Margin

What we actually want is the ordinary perpendicular distance from the point to the boundary. That is what dividing by the length of $$w$$ gives us. Recall that the **norm** $$\lVert w \rVert = \sqrt{w_1^2 + \dots + w_N^2}$$ is just the length of the vector $$w$$, the same way you would measure the length of an arrow. The **geometric margin** is the functional margin rescaled by that length:

$$
\gamma^{(i)} = \frac{y^{(i)}\left(w^\top x^{(i)} + b\right)}{\lVert w \rVert}
$$

This is a true distance: the shortest straight line from the point to the hyperplane, in the same units as the data. The dataset geometric margin is again the tightest one:

$$
\gamma = \min_{i=1,\dots,M} \gamma^{(i)}
$$

And here is the payoff. Rescaling $$w \to \gamma w$$, $$b \to \gamma b$$ multiplies the numerator by $$\gamma$$ **and** the denominator by $$\gamma$$, so they cancel:

$$
\frac{y^{(i)}\left(\gamma w^\top x^{(i)} + \gamma b\right)}{\lVert \gamma w \rVert}
= \frac{\gamma\, y^{(i)}\left(w^\top x^{(i)} + b\right)}{\gamma\,\lVert w \rVert}
= \gamma^{(i)}
$$

The geometric margin does not move. That is exactly the property we wanted from a real distance, and it is the whole reason we bother dividing by $$\lVert w \rVert$$.

Now the maximum margin principle can be written precisely. We want the largest possible geometric margin, subject to every point being at least that far away:

$$
\max_{w,b} \gamma
\qquad \text{subject to} \qquad
\frac{y^{(i)}\left(w^\top x^{(i)} + b\right)}{\lVert w \rVert} \ge \gamma,
\quad i = 1,\dots,M
$$

The constraint says "no point is closer than the margin." The objective says "push the margin as far out as it will go." Between them they describe the boundary with the most room to breathe.

### Fixing the Scale

Look again at the freedom we found earlier. Scaling $$w$$ and $$b$$ together changes nothing about the boundary or the geometric margin — it is a pure redundancy in our description. When a problem has a free parameter like this, the standard move is to **use it up**: pin the description down so the numbers mean something.

The cleanest choice is to fix the functional margin of the closest points to $$1$$:

$$
\hat{\gamma} = 1
$$

This is not a restriction on which boundaries we can consider. Any true boundary can be rescaled until its closest points sit at functional margin $$1$$, and the geometric margin is untouched. It is just a convenient way to choose one representative from each family of identical lines.

Once we do that, the awkward ratio disappears. Every constraint becomes a plain inequality:

$$
y^{(i)}\left(w^\top x^{(i)} + b\right) \ge 1,
\qquad i = 1,\dots,M
$$

and the margin we are maximizing is now simply

$$
\gamma = \frac{1}{\lVert w \rVert}
$$

So maximizing the margin is the same as **minimizing** $$\lVert w \rVert$$ — or, more conveniently later, minimizing $$\frac{1}{2}\lVert w \rVert^2$$. The geometric picture has turned into a tidy optimization problem: find the smallest $$w$$ such that every point stays on its correct side with a functional margin of at least $$1$$.

Those closest points, the ones where the inequality is tight, are the support vectors we met at the start. Everything else is slack, and everything the boundary cares about is carried by those few. That is the seed of the whole method.

### The Primal Problem

Everything we have built so far can be written as a single optimization problem. This is the **primal form** of the hard-margin SVM:

$$
\min_{w,b} \frac{1}{2}\lVert w\rVert^2
\qquad \text{subject to} \qquad
y^{(i)}\left(w^\top x^{(i)} + b\right) \ge 1,
\quad i = 1,\dots,M
$$

Read it in two parts:

- The **objective** $$\frac{1}{2}\lVert w\rVert^2$$ is what we minimize. Since the margin is $$1/\lVert w\rVert$$, shrinking $$\lVert w\rVert$$ stretches the margin. This is the maximum margin principle in disguise — the loss is really "how narrow is the street."
- The **constraints** are the promise that every training point sits on its correct side, at least one functional margin away from the boundary. No point is allowed inside the strip.

Once we have solved it, predicting a new point $$x^*$$ is a single sign check:

$$
\hat{y} = \operatorname{sign}\left(w^\top x^* + b\right)
$$

If the score is positive we answer $$+1$$; if negative, $$-1$$. Notice that the training set is gone by prediction time — the whole dataset has been distilled into just $$w$$ and $$b$$.

### Why the $$\frac{1}{2}$$?

The factor $$\frac{1}{2}$$ is pure convenience, and it pays for itself the moment we differentiate. Since $$\lVert w\rVert^2 = w^\top w$$,

$$
\nabla_w \left(\frac{1}{2}\,w^\top w\right) = w
$$

Clean and free of stray constants. Without the $$\frac{1}{2}$$ every derivative would drag a factor of $$2$$ along, through every gradient step and every derivation. The same trick appears all over machine learning: before squaring something you are about to differentiate, put a $$\frac{1}{2}$$ in front. The minimizer does not change, because multiplying a function by a positive constant never moves where its minimum sits.

### Why Maximizing the Margin Is Good

The wiggle-room talk becomes concrete once we notice there are **two** things we are uncertain about.

**The true $$w$$ is uncertain.** Our training data is a finite sample, so the boundary we learn is only an estimate of the real one. If we pick a boundary that barely separates the classes, then a slightly different estimate of $$w$$ — the kind a different sample would produce — could start misclassifying points. A large margin gives $$w$$ the most room to shift before anything breaks. We are choosing the boundary that is *most robust to being slightly wrong*.

**The data points are uncertain.** New points at test time never land exactly where the training points did. If every point is allowed to move by up to half the margin before it crosses the boundary, then the classifier keeps answering correctly under that much noise. The wider the street, the more each point can wander.

Both uncertainties point the same way: a big margin is the best insurance we can buy while still classifying the training data correctly. And the insurance is only as good as the tightest point — which is why the margin is defined by the closest support vectors, not the average.

## Soft Margin

### The Limits of Hard Margin

Everything so far has assumed the data can be separated cleanly and that we are willing to forbid every mistake. Real data rarely cooperates. A few points overlap, sit on the wrong side, or are outright outliers, and a hard-margin boundary has no choice but to contort itself into a thin, nervous sliver that threads between them. That thin margin generalizes badly. Pursuing perfection on the training set, we buy overfitting.

The fix is to **allow some samples to break the rule, and charge them for it**. We let the boundary keep a wide margin and simply pay a price for every point that violates it.

### The Slack Variable

For each example we introduce a **slack variable** $$\xi_i \ge 0$$ (read "xi sub i"). It records how badly that point breaks the margin rule:

- $$\xi_i = 0$$: the point is outside the margin strip — no violation, no cost.
- $$\xi_i > 0$$: the point is inside the strip, or on the wrong side — it violates, and $$\xi_i$$ is the amount.

Then we soften the constraint from $$\ge 1$$ to $$\ge 1 - \xi_i$$:

$$
\min_{w,b,\xi} \frac{1}{2}\lVert w\rVert^2 + C\sum_{i=1}^{M}\xi_i
\qquad \text{subject to} \qquad
y^{(i)}\left(w^\top x^{(i)} + b\right) \ge 1 - \xi_i,
\quad \xi_i \ge 0,
\quad i = 1,\dots,M
$$

A point that already sits at margin $$\ge 1$$ needs no slack, so its cheapest choice is $$\xi_i = 0$$. A point that falls short picks up exactly the deficit. Reading the sizes: a point sitting right on the boundary has $$\xi_i = 1$$, and a point on the wrong side has $$\xi_i > 1$$. So $$\xi_i$$ measures both *how far inside the margin* a point is and *how wrong* the classifier is about it.

The two terms of the new objective pull against each other:

- $$\frac{1}{2}\lVert w\rVert^2$$ wants a **wide margin** (small $$w$$).
- $$C\sum_i \xi_i$$ wants **no violations** (small slack).

This is the **soft-margin SVM**, and it is the version used in practice.

### The Penalty $$C$$

$$C$$ is the **penalty parameter**, and it is a hyperparameter, not something learned from the data. It sets the exchange rate between margin width and violations:

| $$C$$ | Violations | Margin | Behavior |
| --- | --- | --- | --- |
| small | cheap | wide | tolerates many mistakes, more bias |
| large | expensive | narrow | forces correctness, more variance |

- **Small $$C$$** — mistakes cost little, so the model happily lets points violate the margin in exchange for a wider, calmer boundary.
- **Large $$C$$** — mistakes are expensive, so the model does almost anything to classify every point correctly — even if that means a thin margin that overfits.
- **As $$C \to \infty$$** the price of any violation becomes infinite, and we recover the hard-margin problem exactly.

In words: $$C$$ is the price tag on a violation. Turn it up to insist on correctness; turn it down to prioritize robustness.

### From Hinge Loss to SVM

The soft-margin primal looks like a constrained geometry problem, but it is secretly the same thing as an unconstrained loss function. Define the **hinge loss** of one example as

$$
\max\left(0,\; 1 - y^{(i)}\left(w^\top x^{(i)} + b\right)\right)
$$

It is zero whenever the point is on the correct side with a functional margin of at least $$1$$, and it grows linearly once the point slips inside. Now minimize the total hinge loss plus a regularizer:

$$
\min_{w,b} \; \sum_{i=1}^{M} \max\left(0,\; 1 - y^{(i)}\left(w^\top x^{(i)} + b\right)\right) + \frac{1}{2C}\,\lVert w\rVert^2
$$

These two problems are equivalent, and the bridge between them is the slack variable itself. Look at how $$\xi_i$$ is used: it never appears in the objective except as $$C\sum_i \xi_i$$, and it is only bounded below by $$\xi_i \ge 1 - y^{(i)}(w^\top x^{(i)} + b)$$ and $$\xi_i \ge 0$$. To make the cost as small as possible, each $$\xi_i$$ should therefore be exactly the smallest value the constraints allow:

$$
\xi_i = \max\left(0,\; 1 - y^{(i)}\left(w^\top x^{(i)} + b\right)\right)
$$

which is precisely the hinge loss. Substitute it back and the constrained primal collapses into the unconstrained form above — then divide both terms by the constant $$C$$ to match the $$1/(2C)$$ weighting.

Seen this way, the SVM is just **empirical risk minimization with hinge loss and L2 regularization**: a data-fit term plus a penalty on how large $$w$$ gets.

The hinge loss was not invented as part of the SVM. It existed earlier, as a natural loss for a linear classifier. What the SVM contributed was a *geometric reason* for it: the same formula falls out of asking for the widest margin. It took years for the two — the loss view and the max-margin view — to be understood as one and the same method, and that delayed connection is part of why the SVM's history reads a little strangely.
