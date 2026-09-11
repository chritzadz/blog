import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";

import { parseMarkdown } from "./parse";

export interface Heading {
  id: string;
  title: string;
}

export interface Post {
  series: string;
  slug: string;
  title: string;
  order: number;
  body: string;
  headings: Heading[];
}

export interface Series {
  slug: string;
  title: string;
  postCount: number;
}

/** Shape consumed by TocLayout. */
export interface TocSection {
  id: string;
  title: string;
  items: Heading[];
}

const CONTENT_DIR = path.join(process.cwd(), "src", "content");

export function humanizeSeries(slug: string): string {
  return slug.replace(/-/g, " ");
}

function seriesDirs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/** Depth-2 headings with the same slug algorithm the renderer uses. */
export function extractHeadings(body: string): Heading[] {
  const tree = parseMarkdown(body);
  const slugger = new GithubSlugger();
  return tree.children
    .filter((node): node is Extract<typeof node, { type: "heading" }> => node.type === "heading")
    .filter((node) => node.depth === 2)
    .map((node) => {
      const title = toString(node);
      return { id: slugger.slug(title), title };
    });
}

function readPost(series: string, file: string): Post | null {
  const slug = path.basename(file, ".md");
  try {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, series, file), "utf8");
    const { data, content } = matter(raw);
    return {
      series,
      slug,
      title: typeof data.title === "string" ? data.title : humanizeSeries(slug),
      order: Number.isFinite(Number(data.order)) ? Number(data.order) : 9999,
      body: content,
      headings: extractHeadings(content),
    };
  } catch {
    return null;
  }
}

export function getPosts(series: string): Post[] {
  const dir = path.join(CONTENT_DIR, series);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readPost(series, f))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getPost(series: string, slug: string): Post | null {
  return getPosts(series).find((p) => p.slug === slug) ?? null;
}

export function getSeriesList(): Series[] {
  return seriesDirs().map((slug) => ({
    slug,
    title: humanizeSeries(slug),
    postCount: getPosts(slug).length,
  }));
}

export function getToc(series: string): TocSection[] {
  return getPosts(series).map((post) => ({
    id: post.slug,
    title: post.title,
    items: post.headings,
  }));
}

export function getPrevNext(series: string, slug: string): { prev: Post | null; next: Post | null } {
  const posts = getPosts(series);
  const idx = posts.findIndex((p) => p.slug === slug);
  return {
    prev: idx > 0 ? posts[idx - 1] : null,
    next: idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null,
  };
}

export function getAllRouteParams(): { series: string; post: string }[] {
  return seriesDirs().flatMap((series) =>
    getPosts(series).map((post) => ({ series, post: post.slug })),
  );
}
