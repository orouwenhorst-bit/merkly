import Link from "next/link";
import { createClient, createServerClient } from "@/lib/supabase";
import { BrandGuideResult } from "@/types/brand";
import BrandGuidePreview from "@/components/BrandGuidePreview";
import ShareButton from "@/components/ShareButton";
import AuthButton from "@/components/AuthButton";
import ClaimBanner from "@/components/ClaimBanner";
import { notFound } from "next/navigation";

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  await searchParams; // ongebruikt maar vereist door Next.js

  // Guide ophalen via service client (publiek toegankelijk via URL)
  const supabase = createClient();
  const { data: guide, error } = await supabase
    .from("brand_guides")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !guide) notFound();

  // Huidige gebruiker controleren voor claim-banner
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  const result = guide.result as BrandGuideResult;
  const isUnclaimed = !guide.user_id;
  const showClaimBanner = !!user && isUnclaimed;
  const showLoginPrompt = !user && isUnclaimed;

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
          <div className="flex items-center gap-3">
            <Link
              href="/generate"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors hidden sm:block"
            >
              Nieuwe huisstijl
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Claim banner */}
      {showClaimBanner && <ClaimBanner guideId={id} />}

      {/* Login prompt for anonymous users */}
      {showLoginPrompt && (
        <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-violet-200 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-violet-900">
              <span className="font-medium">Wil je deze huisstijl bewaren?</span>{" "}
              <span className="text-violet-700">
                Log in om &apos;m aan je account toe te voegen.
              </span>
            </p>
            <Link
              href={`/login?redirect=${encodeURIComponent(`/result/${id}`)}`}
              className="text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg px-3 py-1.5 transition-all shrink-0"
            >
              Inloggen &amp; bewaren →
            </Link>
          </div>
        </div>
      )}

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

        <BrandGuidePreview result={result} isPremium={Boolean(guide.is_premium)} guideId={id} />
      </div>
    </main>
  );
}
