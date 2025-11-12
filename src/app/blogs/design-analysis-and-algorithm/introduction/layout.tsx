import React from "react";
import TocLayout from "@/components/TocLayout";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	const mainPageRef = "/blogs/design-analysis-and-algorithm";

	const sections = [
		{
			id: "introduction",
			title: "Introduction",
			items: [
				{ id: "background", title: "Background",},
				{ id: "design-principles", title: "Design principles" }
			],
		},
		{
			id: "greedy",
			title: "Greedy",
			items: [
			],
		},
		{
			id: "divide-and-conquer",
			title: "Divide and Conquer",
			items: [
			],
		},
		{
			id: "dynamic-programming",
			title: "Dynamic Programming",
			items: [
			],
		},
	];

	return <TocLayout sections={sections} title="design analysis and algorithm" parentRef={mainPageRef}>{children}</TocLayout>;
}

