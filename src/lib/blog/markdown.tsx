import type { ReactNode } from "react";

import type {
  Blockquote,
  Code,
  Content,
  Delete,
  Emphasis,
  Heading,
  Html,
  Image,
  InlineCode,
  Link,
  List,
  ListItem,
  Paragraph,
  Root,
  Strong,
  Table,
  Text,
} from "mdast";
import type { PhrasingContent } from "mdast";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";

import ArticleSection from "@/components/ArticleSection";
import QuoteBox from "@/components/QuoteBox";
import SubcontentBox from "@/components/SubcontentBox";
import { getHighlighter } from "./highlighter";
import { parseMarkdown } from "./parse";

async function CodeBlock({ code, lang }: { code: string; lang: string | null }) {
  const highlighter = await getHighlighter();
  const html = highlighter.codeToHtml(code, {
    lang: lang ?? "text",
    theme: "github-dark",
  });
  return (
    <div
      className="my-4 overflow-x-auto rounded-lg text-sm [&_pre]:m-0 [&_pre]:p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderInline(nodes: PhrasingContent[], slugger: GithubSlugger): ReactNode {
  return nodes.map((node, i) => renderPhrasing(node, i, slugger));
}

function renderPhrasing(node: PhrasingContent, key: number, slugger: GithubSlugger): ReactNode {
  switch (node.type) {
    case "text":
      return (node as Text).value;
    case "inlineCode":
      return (
        <code
          key={key}
          className="rounded bg-gray-200 px-1.5 py-0.5 text-[0.9em] dark:bg-gray-800"
        >
          {(node as InlineCode).value}
        </code>
      );
    case "strong":
      return <strong key={key}>{renderInline((node as Strong).children, slugger)}</strong>;
    case "emphasis":
      return <em key={key}>{renderInline((node as Emphasis).children, slugger)}</em>;
    case "delete":
      return <del key={key}>{renderInline((node as Delete).children, slugger)}</del>;
    case "link": {
      const link = node as Link;
      const external = /^https?:\/\//.test(link.url);
      return (
        <a
          key={key}
          href={link.url}
          className="text-sky-600 underline decoration-dotted underline-offset-2 hover:text-sky-400"
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {renderInline(link.children, slugger)}
        </a>
      );
    }
    case "image": {
      const image = node as Image;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={key} src={image.url} alt={image.alt ?? ""} className="my-4 max-w-full" />
      );
    }
    case "break":
      return <br key={key} />;
    case "html":
      return (
        <span key={key} dangerouslySetInnerHTML={{ __html: (node as Html).value }} />
      );
    default:
      return null;
  }
}

function renderBlock(node: Content, key: string, slugger: GithubSlugger): ReactNode {
  switch (node.type) {
    case "paragraph":
      return <p key={key} className="mt-4">{renderInline((node as Paragraph).children, slugger)}</p>;
    case "blockquote": {
      const quote = node as Blockquote;
      return (
        <QuoteBox key={key} className="my-8">
          {quote.children.map((child, i) =>
            child.type === "paragraph"
              ? renderInline((child as Paragraph).children, slugger)
              : renderBlock(child, `${key}-${i}`, slugger),
          )}
        </QuoteBox>
      );
    }
    case "code": {
      const code = node as Code;
      return <CodeBlock key={key} code={code.value} lang={code.lang ?? null} />;
    }
    case "heading": {
      const heading = node as Heading;
      const cls =
        heading.depth === 1
          ? "mt-6 mb-2 text-4xl font-bold"
          : heading.depth === 4
            ? "mt-4 text-xl font-semibold"
            : "mt-4 text-lg font-semibold";
      return (
        <div key={key} className={cls}>
          {renderInline(heading.children, slugger)}
        </div>
      );
    }
    case "list": {
      const list = node as List;
      const items = list.children.map((item, i) => renderBlock(item, `${key}-${i}`, slugger));
      return list.ordered ? (
        <ol key={key} className="mt-4 list-decimal space-y-1 pl-6">
          {items}
        </ol>
      ) : (
        <ul key={key} className="mt-4 list-disc space-y-1 pl-6">
          {items}
        </ul>
      );
    }
    case "listItem": {
      const item = node as ListItem;
      return (
        <li key={key}>
          {item.children.map((child, i) =>
            child.type === "paragraph" && i === 0
              ? renderInline((child as Paragraph).children, slugger)
              : renderBlock(child, `${key}-${i}`, slugger),
          )}
        </li>
      );
    }
    case "table": {
      const table = node as Table;
      const rows = table.children.map((row, ri) => {
        const isHead = ri === 0;
        return (
          <tr
            key={ri}
            className="border-b border-gray-300 dark:border-gray-700"
          >
            {row.children.map((cell, ci) =>
              isHead ? (
                <th key={ci} className="px-2 py-1 text-left">
                  {renderInline(cell.children, slugger)}
                </th>
              ) : (
                <td key={ci} className="px-2 py-1">
                  {renderInline(cell.children, slugger)}
                </td>
              ),
            )}
          </tr>
        );
      });
      return (
        <table key={key} className="my-4 w-full border-collapse text-sm">
          <tbody>{rows}</tbody>
        </table>
      );
    }
    case "thematicBreak":
      return <hr key={key} className="my-8 border-gray-300 dark:border-gray-700" />;
    default:
      console.warn("[blog] unhandled markdown node:", (node as { type: string }).type);
      return null;
  }
}

interface Container {
  nodes: ReactNode[];
}

/**
 * Render a markdown body into React using the existing blog components:
 * `## Heading` -> ArticleSection (wrapping its content), `### Heading` ->
 * SubcontentBox, blockquote -> QuoteBox, fenced code -> Shiki block.
 */
export function renderMarkdown(body: string): ReactNode {
  const tree: Root = parseMarkdown(body);
  const slugger = new GithubSlugger();

  const top: ReactNode[] = [];
  let section: { id: string; title: string; nodes: ReactNode[] } | null = null;
  let sub: { title: string; nodes: ReactNode[] } | null = null;

  const currentSink = (): Container => sub ?? section ?? { nodes: top };

  const closeSub = () => {
    if (!sub) return;
    const target = section ? section.nodes : top;
    target.push(
      <SubcontentBox key={`sub-${sub.title}-${target.length}`} title={sub.title} className="mt-4">
        {sub.nodes}
      </SubcontentBox>,
    );
    sub = null;
  };

  const closeSection = () => {
    if (!section) return;
    top.push(
      <ArticleSection key={section.id} id={section.id} title={section.title} className="mt-8">
        {section.nodes}
      </ArticleSection>,
    );
    section = null;
  };

  tree.children.forEach((node, i) => {
    if (node.type === "heading" && node.depth === 2) {
      closeSub();
      closeSection();
      const title = toString(node);
      section = { id: slugger.slug(title), title, nodes: [] };
      return;
    }
    if (node.type === "heading" && node.depth === 3) {
      closeSub();
      sub = { title: toString(node), nodes: [] };
      return;
    }
    if (node.type === "heading") {
      // depth 1 or 4+: terminates any open SubcontentBox, renders inline.
      closeSub();
    }
    currentSink().nodes.push(renderBlock(node, `b-${i}`, slugger));
  });

  closeSub();
  closeSection();
  return top;
}
