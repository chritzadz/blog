import type { Metadata } from "next";
import { notFound } from "next/navigation";

import NextCard from "@/components/NextCard";
import TocLayout from "@/components/TocLayout";
import { getAllRouteParams, getPost, getPrevNext, getToc, humanizeSeries } from "@/lib/blog/content";
import { renderMarkdown } from "@/lib/blog/markdown";

interface PostPageProps {
  params: Promise<{ series: string; post: string }>;
}

export function generateStaticParams() {
  return getAllRouteParams();
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { series, post } = await params;
  const article = getPost(series, post);
  return { title: article ? `${article.title} - ${humanizeSeries(series)}` : "Blog" };
}

export default async function PostPage({ params }: PostPageProps) {
  const { series, post } = await params;
  const article = getPost(series, post);
  if (!article) notFound();

  const { prev, next } = getPrevNext(series, post);

  return (
    <TocLayout sections={getToc(series)} title={humanizeSeries(series)} parentRef={`/blogs/${series}`}>
      <div style={{ fontFamily: '"Consolas", Times, serif' }}>
        <h1 className="text-6xl font-bold">{article.title}</h1>
        {renderMarkdown(article.body)}
        <div className="mt-12 flex flex-col gap-6">
          {prev && <NextCard text={`Previous: ${prev.title}`} href={`/blogs/${series}/${prev.slug}`} />}
          {next && <NextCard text={`Next: ${next.title}`} href={`/blogs/${series}/${next.slug}`} />}
        </div>
      </div>
    </TocLayout>
  );
}
