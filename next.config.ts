import type { NextConfig } from "next";
import "./src/config/env";
import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: ["remark-gfm", "remark-mdx-code-meta"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withBundleAnalyzer(withMDX(nextConfig));
