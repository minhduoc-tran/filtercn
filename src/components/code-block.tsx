import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { CopyButton } from "@/components/copy-button";

interface CodeBlockProps {
  code: string;
  lang?: string | undefined;
  filename?: string | undefined;
}

// Aliases to Shiki's BundledLanguage names
const LANG_MAP: Record<string, BundledLanguage> = {
  text: "text" as BundledLanguage,
  plain: "text" as BundledLanguage,
  terminal: "bash",
  shell: "bash",
  sh: "bash",
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  json: "json",
  css: "css",
  html: "html",
  mdx: "mdx",
  bash: "bash",
};

function resolveLang(lang: string): BundledLanguage {
  return LANG_MAP[lang.toLowerCase()] ?? ("text" as BundledLanguage);
}

export async function CodeBlock({ code, lang = "text", filename }: CodeBlockProps) {
  const safeLang = resolveLang(lang);

  let html: string;
  try {
    html = await codeToHtml(code, { lang: safeLang, theme: "github-dark" });
  } catch {
    // Fallback: plain pre block
    html = `<pre><code>${code}</code></pre>`;
  }

  const headerLabel = filename ?? (lang !== "text" ? lang : null);

  return (
    <div className="not-prose group relative my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      {/* Header: filename or language badge + copy button */}
      {headerLabel && (
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2">
          <div className="flex items-center gap-2">
            {filename && <div className="h-2.5 w-2.5 rounded-full bg-zinc-500" />}
            <span className="font-mono text-xs text-zinc-300">{headerLabel}</span>
          </div>
          <CopyButton content={code} />
        </div>
      )}

      {/* Highlighted code */}
      <div
        className="overflow-x-auto p-5 text-sm leading-relaxed [&>pre]:m-0 [&>pre]:bg-transparent! [&>pre]:p-0"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted Shiki output
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Floating copy button when no header */}
      {!headerLabel && (
        <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
          <CopyButton content={code} />
        </div>
      )}
    </div>
  );
}
