import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { BrandGuideResult } from "@/types/brand";
import BrandGuidePreview from "@/components/BrandGuidePreview";
import ShareButton from "@/components/ShareButton";
import { notFound } from "next/navigation";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient();
  const { data: guide, error } = await supabase
    .from("brand_guides")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !guide) notFound();

  const result = guide.result as BrandGuideResult;

  const createdAt = new Date(guide.created_at).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-neutral-900">
            Merkly
          </Link>
          <Link
            href="/generate"
            className="text-sm bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            Nieuwe huisstijl
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
              {result.companyName}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-full px-3 py-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {createdAt}
            </span>
          </div>
          <ShareButton />
        </div>

        <BrandGuidePreview result={result} isPremium={false} guideId={id} />
      </div>
    </main>
  );
}
