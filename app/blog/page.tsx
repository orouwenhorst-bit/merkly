import type { Metadata } from "next";
import Link from "next/link";
import MerklyLogo from "@/components/MerklyLogo";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Alles over huisstijl, branding en merkidentiteit",
  description:
    "Praktische artikelen over huisstijl maken, merkidentiteit opbouwen en AI-branding voor Nederlandse ondernemers.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Merkly Blog | Branding & huisstijl voor ondernemers",
    description:
      "Praktische artikelen over huisstijl maken, merkidentiteit opbouwen en AI-branding voor Nederlandse ondernemers.",
    url: "/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-white">
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
              href="/generate"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors hidden sm:block"
            >
              Gratis proberen
            </Link>
            <Link
              href="/generate"
              className="text-sm bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-700 transition-colors"
            >
              Genereer →
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-sm font-medium text-violet-600 mb-2">Kennisbank</p>
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight mb-4">
            Alles over huisstijl & branding
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl">
            Praktische gidsen voor ondernemers die een professioneel merk willen
            bouwen — snel en zonder groot budget.
          </p>
        </div>

        <div className="grid gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-white border border-neutral-200 rounded-2xl p-6 hover:border-violet-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-xs font-medium text-violet-600 bg-violet-50 rounded-full px-3 py-1 mb-3">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-semibold text-neutral-900 group-hover:text-violet-700 transition-colors mb-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-3 mt-4 text-xs text-neutral-400">
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span>·</span>
                    <span>{post.readingTime} min leestijd</span>
                  </div>
                </div>
                <span className="text-neutral-300 group-hover:text-violet-400 transition-colors mt-1 shrink-0">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">
            Klaar om te starten?
          </h2>
          <p className="text-neutral-600 mb-6">
            Genereer jouw complete huisstijl in minder dan 2 minuten — gratis,
            zonder account.
          </p>
          <Link
            href="/generate"
            className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium px-6 py-3 rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all"
          >
            Start nu gratis →
          </Link>
        </div>
      </div>
    </main>
  );
}
