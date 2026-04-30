import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MerklyLogo from "@/components/MerklyLogo";
import { getAllPosts, getPost } from "@/lib/blog";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["Merkly"],
    },
  };
}

async function getContent(slug: string) {
  switch (slug) {
    case "wat-is-een-huisstijl": {
      const { default: Content } = await import("@/lib/blog-posts/wat-is-een-huisstijl");
      return Content;
    }
    case "huisstijl-kosten": {
      const { default: Content } = await import("@/lib/blog-posts/huisstijl-kosten");
      return Content;
    }
    case "ai-huisstijl-generator": {
      const { default: Content } = await import("@/lib/blog-posts/ai-huisstijl-generator");
      return Content;
    }
    case "merkidentiteit-opbouwen": {
      const { default: Content } = await import("@/lib/blog-posts/merkidentiteit-opbouwen");
      return Content;
    }
    case "huisstijl-zzp": {
      const { default: Content } = await import("@/lib/blog-posts/huisstijl-zzp");
      return Content;
    }
    case "logo-laten-maken": {
      const { default: Content } = await import("@/lib/blog-posts/logo-laten-maken");
      return Content;
    }
    default:
      return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const Content = await getContent(slug);
  if (!Content) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.merkly.nl";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${siteUrl}/blog/${slug}`,
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: "nl-NL",
    url: `${siteUrl}/blog/${slug}`,
    author: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Merkly",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Merkly",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${slug}`,
    },
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <MerklyLogo size={24} variant="gradient" />
            <span className="text-lg font-bold tracking-tight text-neutral-900">
              Merk<span className="text-violet-600">ly</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors hidden sm:block"
            >
              ← Blog
            </Link>
            <Link
              href="/generate"
              className="text-sm bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-700 transition-colors"
            >
              Genereer gratis →
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
          <Link href="/" className="hover:text-neutral-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-neutral-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-neutral-600 truncate">{post.title}</span>
        </div>

        {/* Header */}
        <header className="mb-10">
          <span className="inline-block text-xs font-medium text-violet-600 bg-violet-50 rounded-full px-3 py-1 mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-neutral-500 leading-relaxed mb-6">
            {post.description}
          </p>
          <div className="flex items-center gap-3 text-sm text-neutral-400 pb-8 border-b border-neutral-100">
            <span>
              {new Date(post.publishedAt).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>·</span>
            <span>{post.readingTime} min leestijd</span>
            <span>·</span>
            <span>Merkly</span>
          </div>
        </header>

        {/* Content */}
        <Content />

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-neutral-100 flex items-center justify-between">
          <Link
            href="/blog"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            ← Terug naar blog
          </Link>
          <Link
            href="/generate"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Genereer jouw huisstijl →
          </Link>
        </div>
      </div>
    </main>
  );
}
