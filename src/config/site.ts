import packageJson from "../../package.json";

export const siteConfig = {
  name: "FilterCN",
  version: packageJson.version,
  title: "FilterCN - URL-Driven Conditional Filter for Next.js and React",
  description:
    "FilterCN is a type-safe, customizable conditional filter component for Next.js and React with URL synchronization, global search, and CLI-based setup.",
  url: "https://filtercn.vercel.app",
  repoUrl: "https://github.com/tmduoc/filtercn",
  creator: "tmduoc",
  keywords: [
    "FilterCN",
    "conditional filter",
    "Next.js filter",
    "React filter component",
    "shadcn ui",
    "URL query builder",
  ],
  ogImage: "/opengraph-image.png",
} as const;
