import { createHighlighter, type Highlighter } from "shiki";

let instance: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
  if (!instance) {
    instance = createHighlighter({
      themes: ["github-dark"],
      langs: [
        "javascript",
        "typescript",
        "tsx",
        "python",
        "java",
        "c",
        "cpp",
        "json",
        "bash",
        "sql",
        "html",
        "css",
        "yaml",
        "markdown",
      ],
    });
  }
  return instance;
}
