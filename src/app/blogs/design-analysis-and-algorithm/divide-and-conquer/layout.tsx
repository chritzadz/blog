import React from "react";
import TocLayout from "@/components/TocLayout";
import sectionsData, { mainPageRef } from '@/data/designAnalysisSections';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return <TocLayout sections={sectionsData} title="design analysis and algorithm" parentRef={mainPageRef}>{children}</TocLayout>;
}

