export interface DocPage {
  title: string;
  slug: string;
  indent?: boolean; // show as sub-item in sidebar
}

export interface DocSection {
  title: string;
  pages: DocPage[];
}

export const docsNav: DocSection[] = [
  {
    title: "Getting Started",
    pages: [
      { title: "Introduction", slug: "introduction" },
      { title: "Auto Install (CLI)", slug: "installation-cli", indent: true },
      { title: "Manual Install", slug: "installation-manual", indent: true },
      { title: "Usage Examples", slug: "usage-examples" },
    ],
  },
  {
    title: "API Reference",
    pages: [
      { title: "Configuration (Config)", slug: "configuration" },
      { title: "Field Definitions", slug: "field-definitions" },
    ],
  },
];

export const allDocPages: DocPage[] = docsNav.flatMap((s) => s.pages);
