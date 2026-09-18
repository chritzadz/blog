/// <reference types="mdast-util-math" />

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import type { Root } from "mdast";

const processor = unified()
  .use(remarkParse)
  .use(remarkMath, { singleDollarTextMath: false })
  .use(remarkGfm);

export function parseMarkdown(md: string): Root {
  return processor.parse(md) as Root;
}
