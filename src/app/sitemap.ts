import type { MetadataRoute } from "next";
import { allDocPages } from "@/config/docs-nav";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/docs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const docRoutes: MetadataRoute.Sitemap = allDocPages.map((page) => ({
    url: `${siteConfig.url}/docs/${page.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...coreRoutes, ...docRoutes];
}
