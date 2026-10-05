---
title: Duality
order: 6
---

## The Standard Form of an Optimization Problem

Almost every optimization problem — in machine learning or anywhere else — can be written in one common shape. Pick a variable $$x$$, and we

$$
\begin{aligned}
\text{minimize} \quad & f_0(x) \\
\text{subject to} \quad & f_i(x) \le 0, \quad i = 1, \dots, r \\
& h_i(x) = 0, \quad i = 1, \dots, s
\end{aligned}
$$

Each piece has a name:

- The variable $$x$$ is the **optimization variable** — what we get to choose.
- The symbol $$f_0$$ is the **objective** (or cost) — the thing we want as small as possible.
- The inequalities $$f_i(x) \le 0$$ are the **inequality constraints**, and $$h_i(x) = 0$$ the **equality constraints** — the rules the answer must obey.
- A point $$x$$ is **feasible** if it lies in the domain of $$f_0$$ and satisfies every constraint. The collection of all feasible points is the **feasible set**.

The best value the objective can take over the feasible set is the **optimal value**,

$$
p^* = \inf\{\, f_0(x) \mid f_i(x) \le 0,\ h_i(x) = 0 \,\}
$$

Two special cases are worth naming:

- $$p^* = +\infty$$ when the problem is **infeasible** — no $$x$$ satisfies the constraints at all, so there is nothing to minimize over.
- $$p^* = -\infty$$ when the problem is **unbounded below** — the objective can be driven as low as we like.

A feasible point $$x$$ is **optimal** if it actually attains the best value, $$f_0(x) = p^*$$. It is **locally optimal** if it is optimal within some small ball around it: there is an $$R > 0$$ such that $$x$$ solves

$$
\begin{aligned}
\text{minimize} \quad & f_0(z) \\
\text{subject to} \quad & f_i(z) \le 0, \quad i = 1, \dots, r \\
& h_i(z) = 0, \quad i = 1, \dots, s \\
& \|z - x\|_2 \le R
\end{aligned}
$$

In words: nothing nearby does better. Local optimality is the kind gradient descent can actually find — it rolls downhill and stops at the bottom of the nearest dip.

**Examples.** The difference between "unbounded" and "has a bottom" is easy to miss, so here are three objectives on their own (no constraints):

- $$f_0(x) = -\log x$$ on $$x > 0$$. As $$x \to \infty$$, $$-\log x \to -\infty$$, so the objective slides down forever: $$p^* = -\infty$$, unbounded below.
- $$f_0(x) = x \log x$$ on $$x > 0$$. This one has a genuine bottom at $$x = 1/e$$, where $$f_0 = -1/e$$. So $$p^* = -1/e$$, attained at $$x = 1/e$$.
- $$f_0(x) = x^3 - 3x$$. Differentiate: $$f_0'(x) = 3x^2 - 3 = 3(x-1)(x+1)$$, so the slope is zero at $$x = 1$$ and $$x = -1$$. The second derivative $$f_0''(x) = 6x$$ says $$x = 1$$ is a local minimum (value $$-2$$) and $$x = -1$$ a local maximum. But as $$x \to -\infty$$ the $$x^3$$ term dominates, so $$f_0(x) \to -\infty$$ and the problem is unbounded below: $$p^* = -\infty$$. There really is a local minimum at $$x = 1$$, yet it is not the global one — a deeper "nothing" waits off to the left. This is exactly the trap convexity removes, since a convex function's local minima are all global.

**The feasibility problem.** Sometimes we do not care about an objective at all — we just want *any* point that satisfies the constraints. Setting $$f_0(x) = 0$$ turns the problem into

$$
\begin{aligned}
\text{find} \quad & x \\
\text{subject to} \quad & f_i(x) \le 0, \quad i = 1, \dots, r \\
& h_i(x) = 0, \quad i = 1, \dots, s
\end{aligned}
$$

which is simply "find a feasible point." The optimal value is then $$p^* = 0$$ when the problem is feasible, and $$p^* = +\infty$$ when it is not.

### The Convex Optimization Problem

The standard form becomes especially friendly when all the functions are convex. The **convex optimization problem** is

$$
\begin{aligned}
\text{minimize} \quad & f_0(x) \\
\text{subject to} \quad & f_i(x) \le 0, \quad i = 1, \dots, r \\
& a_i^\top x = b_i, \quad i = 1, \dots, s
\end{aligned}
$$

where the objective $$f_0$$ and every inequality constraint $$f_i$$ are convex, and the equality constraints are **affine** (a straight line plus a shift). Two things make this the nice case:

- the feasible set is convex — each inequality keeps a convex region, and each affine equality is a flat slice of it, and
- a local minimum is automatically the global minimum, so "roll downhill and stop" finds the true answer.

Why must the equality constraints be affine? Because a set like $$\{x : a^\top x = b\}$$ is flat, and flat means convex. A *curved* equality such as $$h(x) = 0$$ would carve out a bent surface, and a bent feasible set is not convex — which would break the very property we are leaning on.

**Example.** The simplest convex problem is

$$
\text{minimize} \quad f_0(x) = x_1^2 + x_2^2
$$

with no constraints. That is just the squared distance from the origin, minimized at $$x = (0, 0)$$ with $$p^* = 0$$. Add a single affine constraint, say $$x_1 + x_2 = 1$$, and the answer becomes the point on that line closest to the origin: $$x = (0.5, 0.5)$$, with $$p^* = 0.5$$.

## Duality

Now we get to the main event. Duality starts from one simple observation: a constrained problem can be folded into a single function by charging a price for every rule we break. That folded function is the **Lagrangian**, and it opens the door to a second, complementary problem whose answer always sits below the original one.

### The Lagrangian

Start from the standard form (not necessarily convex):

$$
\begin{aligned}
\text{minimize} \quad & f_0(x) \\
\text{subject to} \quad & f_i(x) \le 0, \quad i = 1, \dots, r \\
& h_i(x) = 0, \quad i = 1, \dots, s
\end{aligned}
$$

with variable $$x \in \mathbb{R}^N$$, domain $$X$$, and optimal value $$p^*$$. The **Lagrangian** glues the objective and every constraint into one weighted sum:

$$
L(x, \lambda, \nu) = f_0(x) + \sum_{i=1}^{r} \lambda_i f_i(x) + \sum_{i=1}^{s} \nu_i h_i(x)
$$

Read it as: "how good am I" ($$f_0$$) plus "how much am I paying for breaking each rule." The domain of the Lagrangian is $$X \times \mathbb{R}^r \times \mathbb{R}^s$$ — the variable, the inequality prices, and the equality prices, all free to vary.

The weights are the **Lagrange multipliers**, and each kind follows its own rule:

- $$\lambda_i$$ is the price for the inequality $$f_i(x) \le 0$$, and it must be **non-negative**, $$\lambda_i \ge 0$$. If you *violate* the rule ($$f_i(x) > 0$$), the term $$\lambda_i f_i(x)$$ is positive and **penalizes** you; if you obey it ($$f_i(x) \le 0$$), the term is at most zero and does not hurt. A negative price would *reward* breaking the rule, which makes no sense.
- $$\nu_i$$ is the price for the equality $$h_i(x) = 0$$, and it can take **any sign**, because the violation $$h_i(x)$$ can be positive or negative.

### The Lower-Bound Property (Weak Duality)

Here is the payoff. Take any $$\lambda \ge 0$$ (meaning **every** $$\lambda_i \ge 0$$) and any $$\nu$$, then look at a **feasible** $$x$$:

- $$f_i(x) \le 0$$ and $$\lambda_i \ge 0$$ give $$\lambda_i f_i(x) \le 0$$,
- $$h_i(x) = 0$$ gives $$\nu_i h_i(x) = 0$$.

So for every feasible $$x$$,

$$
L(x, \lambda, \nu) = f_0(x) + \underbrace{(\text{terms } \le 0)}_{\text{inequalities}} + \underbrace{(\text{terms } = 0)}_{\text{equalities}} \;\le\; f_0(x)
$$

**In words: for feasible points, the Lagrangian never overestimates the objective** — provided $$\lambda \ge 0$$.

Now define the **dual function** as the *minimum of the Lagrangian over all* $$x$$:

$$
g(\lambda, \nu) = \inf_x L(x, \lambda, \nu)
$$

Because $$g$$ is the smallest value the Lagrangian can reach, and the Lagrangian sits at or below $$f_0$$ on every feasible point, we get $$g(\lambda, \nu) \le f_0(x)$$ for every feasible $$x$$. Taking the inf over all feasible $$x$$:

$$
g(\lambda, \nu) \;\le\; p^*
$$

So the dual function gives a **lower bound** on the optimal value. For *any* $$\lambda \ge 0$$ and any $$\nu$$, you get a valid bound on $$p^*$$. This is **weak duality**: the dual value never exceeds the optimum.

**Why it works, in one line.** Setting $$\lambda \ge 0$$ *relaxes* the problem — you swap the constraints for penalties and minimize freely over $$x$$. That relaxed problem is easier, and its minimum can only sit at or below the true answer; the prices can only ever under-charge you.

**A notation warning.** Here $$\lambda \succeq 0$$ means "$$\lambda_i \ge 0$$ for every component" — $$\lambda$$ is a vector, and $$\succeq 0$$ is entrywise. That is a different meaning of $$\succeq$$ than the matrix positive-semi-definite one we used for the Hessian. Same squiggle, different object.

### Why We Care (the Purpose)

Before the machinery, the reason anyone bothers with duality at all. You have a hard **primal** problem. The dual is a companion built from the *same* ingredients — same objective, same constraints — but often far easier to solve, and its value is always a **lower bound** on the primal's answer. That one fact buys us four things:

- **A certificate of optimality.** If your solution scores $$f_0(x) = 3.14$$ and the dual says $$g = 3.12$$, you *know* you are within $$0.02$$ of the best possible. No guessing.
- **An easier problem.** The least-norm dual is an unconstrained concave maximization; the LP dual is another LP; the SVM dual shrinks the problem and enables the kernel trick. Solve the easy one, then recover the primal answer.
- **Meaningful multipliers.** $$\lambda_i$$ is the "shadow price" of constraint $$i$$: how much the optimum improves if you relax that rule a little.
- **A foundation for algorithms.** Dual ascent, ADMM, and support vector machines all live on the dual.

The picture in one line: the primal says "do well while obeying the rules"; the dual says "what is the most I would pay per rule to be allowed to ignore it." Since buying your way out can only make things easier, the dual sits at or below the true answer.

### Two Worked Examples

**Least-norm solution of linear equations.** Primal:

$$
\begin{aligned}
\text{minimize} \quad & x^\top x \\
\text{subject to} \quad & Ax = b
\end{aligned}
$$

The Lagrangian is $$L(x, \nu) = x^\top x + \nu^\top(Ax - b)$$. To minimize it over $$x$$, set the gradient to zero:

$$
\nabla_x L(x, \nu) = 2x + A^\top \nu = 0 \quad\Longrightarrow\quad x = -\tfrac{1}{2} A^\top \nu
$$

Plug that back in and the dual function is

$$
g(\nu) = L\left(-\tfrac{1}{2}A^\top \nu, \nu\right) = -\tfrac{1}{4}\,\nu^\top A A^\top \nu - b^\top \nu
$$

which is a **concave** quadratic in $$\nu$$ (the $$\nu^\top A A^\top \nu$$ piece is negative semi-definite). Weak duality says $$p^* \ge g(\nu)$$ for every $$\nu$$. Maximizing $$g$$ over $$\nu$$ recovers the minimum-norm solution,

$$
x^* = A^\top (A A^\top)^{-1} b
$$

**Standard-form linear program.** Primal:

$$
\begin{aligned}
\text{minimize} \quad & c^\top x \\
\text{subject to} \quad & Ax = b, \quad x \succeq 0
\end{aligned}
$$

The Lagrangian is

$$
L(x, \lambda, \nu) = c^\top x + \nu^\top(Ax - b) - \lambda^\top x = -b^\top \nu + (A^\top \nu - \lambda + c)^\top x
$$

This is **affine in $$x$$**, so its infimum over $$x$$ is either finite or $$-\infty$$:

$$
g(\lambda, \nu) = \inf_x L(x, \lambda, \nu) =
\begin{cases}
-b^\top \nu & \text{if } A^\top \nu - \lambda + c = 0, \\
-\infty & \text{otherwise.}
\end{cases}
$$

On the slice where the coefficient vanishes, $$g$$ is **linear** in $$\nu$$, hence concave. Weak duality gives the lower bound

$$
p^* \ge -b^\top \nu \qquad \text{whenever } A^\top \nu + c \succeq 0
$$

that is, whenever $$\lambda = A^\top \nu + c$$ is non-negative. This is exactly the standard LP dual: maximize $$-b^\top \nu$$ subject to $$A^\top \nu + c \succeq 0$$.

### The Dual Problem

Weak duality hands us a bound for *every* choice of multipliers. The natural move is to take the *best* bound — the **dual problem**:

$$
\begin{aligned}
\text{maximize} \quad & g(\lambda, \nu) \\
\text{subject to} \quad & \lambda \succeq 0
\end{aligned}
$$

with optimal value $$d^*$$. There are exactly two cases:

- **Weak duality** (always holds): $$d^* \le p^*$$. The dual never beats the primal.
- **Strong duality** (convex problem plus a mild regularity condition such as Slater's): $$d^* = p^*$$. The two problems are exact mirrors, and you may solve whichever is easier.

### Complementary Slackness

At a primal-dual optimal point $$(x^*, \lambda^*, \nu^*)$$, every inequality price pairs with its constraint:

$$
\lambda_i\, f_i(x^*) = 0 \qquad \text{for each } i
$$

Read it as: you only pay for rules that are actually biting.

- If the constraint is **slack** ($$f_i(x^*) < 0$$), then $$\lambda_i = 0$$ — you pay nothing for a rule you were not breaking.
- If the price is **positive** ($$\lambda_i > 0$$), then $$f_i(x^*) = 0$$ — the constraint is tight.

This is what makes the KKT proof work: at the optimum the penalty terms all vanish, so the Lagrangian and the objective agree.

### Karush–Kuhn–Tucker (KKT) Conditions

For convex, differentiable $$f_0, \dots, f_r$$ and affine $$h_1, \dots, h_s$$, a point $$(x^*, \lambda^*, \nu^*)$$ is optimal exactly when all four hold:

1. **Primal feasibility** — $$f_i(x^*) \le 0$$ and $$h_i(x^*) = 0$$ (the rules are obeyed),
2. **Dual feasibility** — $$\lambda^* \succeq 0$$ (the prices are non-negative),
3. **Stationarity** — $$\nabla_x L(x^*, \lambda^*, \nu^*) = 0$$ (the derivative of the whole thing is zero),
4. **Complementary slackness** — $$\lambda_i\, f_i(x^*) = 0$$ for every $$i$$.

**Why these are sufficient (the proof, plainly).** Because $$\lambda^* \succeq 0$$, the Lagrangian is convex in $$x$$. Stationarity then means $$x^*$$ *minimizes* it, so

$$
g(\lambda^*, \nu^*) = \inf_x L(x, \lambda^*, \nu^*) = L(x^*, \lambda^*, \nu^*)
$$

Primal feasibility plus complementary slackness make the penalty terms vanish, so

$$
L(x^*, \lambda^*, \nu^*) = f_0(x^*)
$$

Weak duality gives the sandwich

$$
g(\lambda^*, \nu^*) \;\le\; d^* \;\le\; p^* \;\le\; f_0(x^*)
$$

but the two ends just turned out equal, so everything in the middle is equal too. Hence $$x^*$$ is primal-optimal and $$(\lambda^*, \nu^*)$$ is dual-optimal.

In one line: **KKT says "set the derivative to zero" still works with constraints — you just also check that the prices are non-negative and you are not paying for rules you kept.** The SVM dual, and how all of this turns the SVM into a problem solved with inner products, is next.
