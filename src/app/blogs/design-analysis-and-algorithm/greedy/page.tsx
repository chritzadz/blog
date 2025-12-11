'use client';

import ArticleSection from "@/components/ArticleSection";
import NextCard from "@/components/NextCard";
import QuoteBox from "@/components/QuoteBox";
import SubcontentBox from "@/components/SubcontentBox";
import { usePathname } from "next/navigation";

export default function Greedy() {
    const pathname = usePathname();
    const segments = pathname ? pathname.split('/').filter(Boolean) : [];
    const base = segments.length >= 2 ? `/${segments[0]}/${segments[1]}` : '/blogs/design-analysis-and-algorithm';
    const nextHref = `${base}/divide-and-conquer`;

    return (
        <div className="" style={{ fontFamily: '"Consolas", Times, serif' }}>
            <h1 className="text-6xl font-bold">Greedy</h1>

            <div className="mt-8">
                <ArticleSection id="basic-idea" title="Basic Idea">
                    <p className="mt-4">
                        {
                            `
                                As what the name has stated, it is a greedy algorithm. The basic idea of it is to be greedy.
                                Being greedy can also means that you are only thinking about the 'now' instead of the consequences of
                                the future. If you are greedy by taking all of your friends food stock in the refrigerator, then you will
                                got a lot of food stock to eat during study session at midnight. Greedy does not care if there are bad consequences
                                later on in the future, but at least for now, we got food am I right?
                            `
                        }
                    </p>
                    <p className="mt-4">
                        {
                            `
                                Let's not get to far away. But, what I am trying to say is that Greedy tries to solve the locally best
                                subproblem, in hopes that it will solve the larger problems. Although, one point to note out, that greedy
                                might cause consequences. Which is why not all problems can be solve by Greedy.
                            `
                        }
                    </p>
                </ArticleSection>
                <div className="w-1/2">
                    {/* for comments if any */}
                </div>
            </div>

            <div className="mt-8">
                <ArticleSection id="interval-scheduling" title="Interval Scheduling">
                    <p className="mt-4">
                        {
                            `
                                Interval scheduling is presumably the most basic problem solved by greedy. The problem
                                states:
                            `
                        }
                    </p>
                    <QuoteBox className="my-8">
                        <p>Given a set of jobs (si, fi), where s is the start time of the job and f is the finish time of the job, determine the number of maximum jobs that could be in the interval</p>
                    </QuoteBox>
                    <p className="mt-4">
                        {
                            `
                                Basically, we want to fit these jobs (or whatever
                                you want to call it) within the given time. However, we could not
                                put the jobs if they are colliding with each other. I usually say, "two jobs is not compatible if they are not colliding with each other". 
                                The problem wants us to give a maximum list of jobs
                                that could fit within the given time. Note that the output of the subset of jobs
                                is not exclusive. That is why we do not care about the list of set jobs. Rather we focus on the maximum number of compatible jobs.
                            `
                        }
                    </p>
                    <p className="mt-4">
                        {
                            `
                                Now, this is where it gets fun. When using the greedy approach, it is important for us to determine
                                what is the greedy score. Greedy score is basically a parametric value to determine a way so that we can be greedy.
                                Confusing? let's start with an example. If the greedy score is by the earliest start of the job, then we always take the job 
                                with the earliest start first. and iteratively take the other jobs (that is compatible) until it is finish.
                            `
                        }
                    </p>
                    <p className="mt-4">
                        {
                            `
                                We could see some of the possibilities of greedy scoring when trying to solve the problem:
                            `
                        }
                    </p>

                    {/* Picture of earliest jobs yeah for example */}

                    <SubcontentBox className="mt-4" title="Earliest Start Time">
                        <p className="mt-1">
                            {
                                `
                                    Earliest start time is one of the intuitive answer in determining the greedy score. 
                                    If we take the one that start first, then it will be maximum right? Well, a counter example
                                    could be that if you are in a queue - which is First-Come-First-Serve, there is a chance that the person
                                    infront takes, say, a whole hour. If we are given an interval of 1 hour, then we are populating only 1 job for the whole
                                    interval. Maybe it is not this.
                                `
                            }
                        </p>
                    </SubcontentBox>
                    <SubcontentBox className="mt-4" title="Shortest Job First">
                        <p className="mt-1">
                            {
                                `
                                    One might say, we should serve the people that has the lowest service time (duration). Which means, we should
                                    serve a job where |si-fi| (this is absolute value btw) is small first. This should be right, right? Although
                                    it might seems right, the duration is by no means irrelevant here. Consider a job (4, 6). and assume two other jobs (1, 4) and (6, 10).
                                    Greedy will always put (4, 6) first. And then? no jobs could be fitted anymore because by adding (4,6) first, we create more collision with the other two jobs.
                                `
                            }
                        </p>
                    </SubcontentBox>
                    <SubcontentBox className="mt-4" title="Earliest Finish Time">
                        <p className="mt-1">
                            {
                                `
                                    Here, we arrived to the appropriate greedy score. By taking the one that finished first, we could output the maximum number of jobs.
                                    By considering the finish time, we are indirectly put into account the start time start time too (why? because f >= s). Additionally, we are eliminating the
                                    jobs that collides, by taking the next job that starts right after the current job's finish time. But how can we proof this? I will give an example of the case, and then
                                    proceed on how to proof greedy algorithms.
                                `
                            }
                        </p>
                    </SubcontentBox>
                    <h1 className="text-xl mt-4">Example</h1>
                    <QuoteBox className="my-8">
                        <p>
                            {
                                `
                                    Let J be a set of job (si, fi), such that si is the start time and fi is the finish time,
                                    where the jobs are (1,4), (3,5), (0,6), (3,9), (5,9), (8,11), (8,12), (12,16).
                                `
                            }
                        </p>
                    </QuoteBox>
                    <p className="mt-4">
                        {
                            `
                                Now, first let us sort the jobs by fi, such that fi is the finish time of each job.
                                We would get, (1, 4), (3, 5), (0, 6), (3,9), (5,9), (8,11), (8,12), (12,16). And we would just 
                                iterate through out the whole array, and grab whenever it is convenient (or in this case compatible).
                            `
                        }
                    </p>
                    <p className="mt-4">{`1. Choose (1, 4)`}</p>
                    <p className="mt-4">{`2. Skip (3, 5) -> because the last job that we picked finished at 4, hence we need to find a job that starts at or after 4`}</p>
                    <p className="mt-4">{`3. Skip (0, 6)`}</p>
                    <p className="mt-4">{`3. Skip (3, 9)`}</p>
                    <p className="mt-4">{`4. Choose (5, 9) -> here the job starts at 5, while the first we chose ends in (4)`}</p>
                    <p className="mt-4">{`5. Skip (8, 11)`}</p>
                    <p className="mt-4">{`6. Skip (8, 12)`}</p>
                    <p className="mt-4">{`7. Choose (12, 16) -> it starts after 9`}</p>
                    <p className="mt-4">
                        {
                            `
                                Here we could see that S = {(1, 4), (5, 9), (12, 16)}, |S| = 3. This is the maximum amount of jobs that is compatible. The set itself
                                is not mutually exclusive such that S' = {(3, 5), (8, 12), (12, 16)} has also 3 mutually compatible jobs. All I know, is that we only care about the 
                                number of jobs not the actualy subset of the job. Keeping this in mind will help in proving the algorithm. 
                            `
                        }
                    </p>
                </ArticleSection>
                <div className="w-1/2">
                    {/* for comments if any */}
                </div>
            </div>

            <div className="">
                <ArticleSection id="proof-approaches" title="Greedy Proof Approaches">
                    <p className="mt-4">
                        {
                            `
                                Proving greedy algorithm is actually quite simple. One simple argument that is fairly common to use
                                is using the Exchange Argument. Basically, we are trying to prove greedy algorithm optimality by showing that
                                for another non-greedy optimal solution, it can be change to greedy such that |G| = |O|. G here the greedy output while O is another optimal 
                                optimal solution that is not greedy.
                            `
                        }
                    </p>
                    <p className="mt-4">
                        {
                            `
                                When proving by exchange argument, always start by defining the two sets that is in the greedy algorithm:
                            `
                        }
                    </p>
                    <QuoteBox className="my-8">
                        <p>
                            {`
                                let G be the greedy output of the set of jobs. let O be another optimal solution of the set of jobs.
                            `}
                        </p>
                    </QuoteBox>
                    <p className="mt-4">
                        {
                            `
                                Then, we are trying to imagine how the output would look like. We know that greedy sorts the job in ascending
                                order by the finish time. Hence, we know that g1 < g2 < g3 < ... < gn.
                                Similarly, we could say the same for O, such that o1 < o2 < o3 < ... < om.
                                
                                Here we must let gk != ok, because optimal should be different from greedy. What we know is that because of greedy, g1 start time must be before oi start time.
                                Drawing this out it would like this,
                            `
                        }
                    </p>
                    <QuoteBox className="mt-4">
                        <p className="mt-4">
                            {
                                `
                                    Let o1 = g1, o2 = g2, ..., ok != gk, ..., on = gn. By greedy, gk start < ok start.
                                `
                            }
                        </p>
                        <p className="mt-4">
                            {
                                `
                                    G = ______|  gk  |_______
                                `
                            }
                        </p>
                        <p className="mt-4">
                            {
                                `
                                    O = ________|  ok  |______
                                `
                            }
                        </p>
                    </QuoteBox>
                    <p className="mt-4">
                        {
                            `
                                The rest of gi and oi, should be equal, except when i = k. Now this is where the exchange can happen. If we swap ok with gk. Without losing it's generality, 
                                for every ok != gk, we could swap ok with gk such that |O| = |G|, |O| will not increase in size. Hence we prove greedy is also optimal.

                            `
                        }
                    </p>
                    <p className="mt-4">
                        {
                            `
                                For a rule of thumb, for any proof of greedy algorithm, you should find an array of jobs that needs to be sorted (ascending/descending), and let that be the
                                main parameter for the proving. Exchange argument works great for any greedy algorithm that maintains an array. Once we have that, proving that |O| = |G| will just require a little visualization,
                                or a little bit of math. One thing we should keep note that when we are doing the swap, opt must be the same or improve.

                            `
                        }
                    </p>
                </ArticleSection>
                <ArticleSection id="partition-interval-scheduling" title="Minimum Partition Interval Scheduling">

                </ArticleSection>
                <div className="w-1/2">
                    {/* for comments if any */}
                </div>
            </div>


            <NextCard className="mt-12" text={"Next: Divide and Conquer"} href={nextHref} />
        </div>
    )
}