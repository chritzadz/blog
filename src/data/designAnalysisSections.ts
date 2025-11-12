export type SubItem = { id: string; title: string; href?: string }
export type Section = { id: string; title: string; items?: SubItem[] }

export const mainPageRef = "/blogs/design-analysis-and-algorithm"

export const sections: Section[] = [
    {
        id: "introduction",
        title: "Introduction",
        items: [
        { id: "background", title: "Background" },
        { id: "design-principles", title: "Design principles" },
        ],
    },
    {
        id: "greedy",
        title: "Greedy",
        items: [
            {id: "background", title: "Background"},
            { id: "basic-idea", title: "Basic Idea" },
            { id: "shortest-job-first", title: "Shorted Job " },
        ],
    },
    {
        id: "divide-and-conquer",
        title: "Divide and Conquer",
        items: [],
    },
    {
        id: "dynamic-programming",
        title: "Dynamic Programming",
        items: [],
    },
]

export default sections
