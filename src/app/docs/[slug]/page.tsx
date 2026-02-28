import fs from "fs";
import GithubSlugger from "github-slugger";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import path from "path";
import { allDocPages } from "@/config/docs-nav";

// --- Dynamic imports for each MDX doc ---
const docModules: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  introduction: () => import("@/content/docs/introduction.mdx"),
  "installation-cli": () => import("@/content/docs/installation-cli.mdx"),
  "installation-manual": () => import("@/content/docs/installation-manual.mdx"),
  "usage-examples": () => import("@/content/docs/usage-examples.mdx"),
  configuration: () => import("@/content/docs/configuration.mdx"),
  "field-definitions": () => import("@/content/docs/field-definitions.mdx"),
};

const docFiles: Record<string, string> = {
  introduction: "src/content/docs/introduction.mdx",
  "installation-cli": "src/content/docs/installation-cli.mdx",
  "installation-manual": "src/content/docs/installation-manual.mdx",
  "usage-examples": "src/content/docs/usage-examples.mdx",
  configuration: "src/content/docs/configuration.mdx",
  "field-definitions": "src/content/docs/field-definitions.mdx",
};

interface TocItem {
  id: string;
  title: string;
  level: number;
}

function extractToc(content: string): TocItem[] {
  const slugger = new GithubSlugger();
  const headings: TocItem[] = [];
  const matcher = /^(#{2,3})\s+(.+)$/gm;
  let match = matcher.exec(content);
  while (match !== null) {
    if (match[1] && match[2]) {
      const rawTitle = match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[`*]/g, "");
      headings.push({ level: match[1].length, title: rawTitle, id: slugger.slug(rawTitle) });
    }
    match = matcher.exec(content);
  }
  return headings;
}

// --- Page titles for metadata ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = allDocPages.find((p) => p.slug === slug);
  return { title: page ? `${page.title} | FilterCN Docs` : "Docs | FilterCN" };
}

// --- Static params for pre-rendering ---
export function generateStaticParams() {
  return allDocPages.map((page) => ({ slug: page.slug }));
}

export default async function DocSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loader = docModules[slug];
  if (!loader) notFound();

  const { default: Content } = await loader();
  const page = allDocPages.find((p) => p.slug === slug);

  // Build TOC from raw file
  let toc: TocItem[] = [];
  try {
    const filePath = path.join(process.cwd(), docFiles[slug] ?? "");
    const raw = fs.readFileSync(filePath, "utf8");
    toc = extractToc(raw);
  } catch {}

  return (
    <div className="flex gap-8">
      {/* Main content */}
      <article className="flex-1 min-w-0 prose prose-zinc dark:prose-invert max-w-none prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-headings:scroll-mt-20 px-6 lg:px-10 py-8">
        {page && <h1 className="text-3xl font-bold tracking-tight mb-2">{page.title}</h1>}
        <Content />
      </article>

      {/* Right TOC */}
      {toc.length > 0 && (
        <aside className="hidden xl:block shrink-0 w-52 py-8">
          <div className="sticky top-20">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              On This Page
            </p>
            <nav className="flex flex-col gap-2 text-sm leading-relaxed">
              {toc.map((item) => (
                <Link
                  key={item.id}
                  href={`#${item.id}`}
                  className={`text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ${
                    item.level === 3 ? "ml-4" : "font-medium text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}
