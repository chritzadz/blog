import { notFound, redirect } from "next/navigation";

import { getPosts, getSeriesList } from "@/lib/blog/content";

export function generateStaticParams() {
  return getSeriesList().map((series) => ({ series: series.slug }));
}

export default async function SeriesPage({ params }: { params: Promise<{ series: string }> }) {
  const { series } = await params;
  const posts = getPosts(series);
  if (posts.length === 0) notFound();
  redirect(`/blogs/${series}/${posts[0].slug}`);
}
