import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.merkly.nl";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries = getAllPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
  }));

  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date("2026-04-29"),
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date("2026-04-30"),
    },
    ...blogEntries,
    {
      url: `${siteUrl}/generate`,
      lastModified: new Date("2026-04-29"),
    },
    {
      url: `${siteUrl}/upgrade`,
      lastModified: new Date("2026-04-29"),
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date("2026-04-08"),
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date("2026-04-08"),
    },
    {
      url: `${siteUrl}/voorwaarden`,
      lastModified: new Date("2026-04-08"),
    },
    {
      url: `${siteUrl}/cookies`,
      lastModified: new Date("2026-04-08"),
    },
  ];
}
