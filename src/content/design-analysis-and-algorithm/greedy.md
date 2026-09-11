---
title: Greedy
order: 2
---

## Basic Idea

As what the name has stated, it is a greedy algorithm. The basic idea of it is to be greedy. Being greedy can also means that you are only thinking about the 'now' instead of the consequences of the future. If you are greedy by taking all of your friends food stock in the refrigerator, then you will got a lot of food stock to eat during study session at midnight. Greedy does not care if there are bad consequences later on in the future, but at least for now, we got food am I right?

Let's not get to far away. But, what I am trying to say is that Greedy tries to solve the locally best subproblem, in hopes that it will solve the larger problems. Although, one point to note out, that greedy might cause consequences. Which is why not all problems can be solve by Greedy.

## Interval Scheduling

Interval scheduling is presumably the most basic problem solved by greedy. The problem states:

> Given a set of jobs (si, fi), where s is the start time of the job and f is the finish time of the job, determine the number of maximum jobs that could be in the interval

Basically, we want to fit these jobs (or whatever you want to call it) within the given time. However, we could not put the jobs if they are colliding with each other. I usually say, "two jobs is not compatible if they are not colliding with each other". The problem wants us to give a maximum list of jobs that could fit within the given time. Note that the output of the subset of jobs is not exclusive. That is why we do not care about the list of set jobs. Rather we focus on the maximum number of compatible jobs.

Now, this is where it gets fun. When using the greedy approach, it is important for us to determine what is the greedy score. Greedy score is basically a parametric value to determine a way so that we can be greedy. Confusing? let's start with an example. If the greedy score is by the earliest start of the job, then we always take the job with the earliest start first. and iteratively take the other jobs (that is compatible) until it is finish.

We could see some of the possibilities of greedy scoring when trying to solve the problem:

### Earliest Start Time

Earliest start time is one of the intuitive answer in determining the greedy score. If we take the one that start first, then it will be maximum right? Well, a counter example could be that if you are in a queue - which is First-Come-First-Serve, there is a chance that the person infront takes, say, a whole hour. If we are given an interval of 1 hour, then we are populating only 1 job for the whole interval. Maybe it is not this.

### Shortest Job First

One might say, we should serve the people that has the lowest service time (duration). Which means, we should serve a job where |si-fi| (this is absolute value btw) is small first. This should be right, right? Although it might seems right, the duration is by no means irrelevant here. Consider a job (4, 6). and assume two other jobs (1, 4) and (6, 10). Greedy will always put (4, 6) first. And then? no jobs could be fitted anymore because by adding (4,6) first, we create more collision with the other two jobs.

### Earliest Finish Time

Here, we arrived to the appropriate greedy score. By taking the one that finished first, we could output the maximum number of jobs. By considering the finish time, we are indirectly put into account the start time start time too (why? because f >= s). Additionally, we are eliminating the jobs that collides, by taking the next job that starts right after the current job's finish time. But how can we proof this? I will give an example of the case, and then proceed on how to proof greedy algorithms.

#### Example

> Let J be a set of job (si, fi), such that si is the start time and fi is the finish time, where the jobs are (1,4), (3,5), (0,6), (3,9), (5,9), (8,11), (8,12), (12,16).

Now, first let us use...

## Proofing
