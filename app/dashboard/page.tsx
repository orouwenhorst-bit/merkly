import Link from "next/link";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import GuideCard from "@/components/dashboard/GuideCard";
import { toGuideCardData } from "@/lib/guide-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const justSubscribed = sp.subscribed === "1";

  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  if (!user) redirect("/login");

  const { isPremium, periodEnd } = await getUserSubscription(user.id);

  const supabase = createServiceClient();
  const { data: rawGuides } = await supabase
    .from("brand_guides")
    .select("id, company_name, industry, created_at, is_premium, result")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const guides = (rawGuides ?? []).map(toGuideCardData);

  // Stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayCount = guides.filter((g) => new Date(g.createdAt) >= today).length;
  const monthCount = guides.filter((g) => new Date(g.createdAt) >= startOfMonth).length;
  const premiumCount = guides.filter((g) => g.isPremium).length;

  const displayName =
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "daar";

  const recentGuides = guides.slice(0, 6);

  return (
    <DashboardShell active="overview">
      {/* Welcome header */}
      <div className="mb-8">
        <p className="text-sm text-violet-300/80 mb-1 font-medium">Welkom terug</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Hallo, {displayName}
          <span className="text-violet-400">.</span>
        </h1>
        <p className="text-neutral-400 text-sm">
          Hier vind je al je gegenereerde huisstijlen, downloads en accountinstellingen op één plek.
        </p>
      </div>

      {justSubscribed && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <span className="text-violet-300 text-lg">✦</span>
          <div>
            <p className="font-semibold text-violet-200">Premium actief — welkom!</p>
            <p className="text-sm text-neutral-400">
              Je kunt nu onbeperkt volledige huisstijlen genereren en alles als PDF downloaden.
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Totaal huisstijlen"
          value={guides.length}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard
          label="Deze maand"
          value={monthCount}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Premium huisstijlen"
          value={premiumCount}
          accent="violet"
          icon={<span className="text-xs">✦</span>}
        />
        <StatCard
          label={isPremium ? "Vandaag" : "Vandaag (3 gratis)"}
          value={isPremium ? todayCount : `${todayCount}/3`}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      {/* Plan status */}
      {isPremium ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-neutral-900/50 border border-violet-500/30 rounded-2xl p-5 mb-10">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-xs bg-violet-500/30 text-violet-100 border border-violet-400/40 rounded-full px-2.5 py-0.5 font-semibold">
                  ✦ Premium
                </span>
                <span className="text-sm text-neutral-300">Onbeperkt genereren · PDF export · Logo-varianten</span>
              </div>
              {periodEnd && (
                <p className="text-xs text-neutral-500 mt-1">
                  Verlengt op{" "}
                  {periodEnd.toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <form action="/api/stripe/portal" method="POST">
              <button
                type="submit"
                className="text-xs font-medium text-neutral-300 bg-neutral-900/60 border border-neutral-700 hover:border-neutral-600 hover:text-white rounded-lg px-3 py-1.5 transition-colors"
              >
                Abonnement beheren →
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 mb-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center text-xs bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-full px-2.5 py-0.5 font-medium">
                  Gratis plan
                </span>
                <span className="text-sm text-neutral-400">
                  {todayCount} van 3 generaties vandaag gebruikt
                </span>
              </div>
              <div className="flex gap-1 mb-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-12 rounded-full transition-all ${
                      i < todayCount ? "bg-gradient-to-r from-violet-500 to-fuchsia-500" : "bg-neutral-800"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-500">
                Upgrade voor onbeperkt genereren, PDF download en volledige brand guides.
              </p>
            </div>
            <Link
              href="/upgrade"
              className="shrink-0 text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-violet-500/25 transition-all"
            >
              Upgrade naar Premium →
            </Link>
          </div>
        </div>
      )}

      {/* Recent guides */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Jouw recente huisstijlen</h2>
          <p className="text-sm text-neutral-500">
            {guides.length === 0
              ? "Nog geen huisstijlen — begin hieronder."
              : `${guides.length} totaal · toont de ${Math.min(guides.length, 6)} nieuwste`}
          </p>
        </div>
        {guides.length > 6 && (
          <Link
            href="/dashboard/huisstijlen"
            className="text-sm text-violet-300 hover:text-violet-200 font-medium transition-colors"
          >
            Bekijk alle →
          </Link>
        )}
      </div>

      {guides.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {recentGuides.map((g) => (
              <GuideCard key={g.id} guide={g} viewerIsPremium={isPremium} />
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nieuwe huisstijl genereren
            </Link>
          </div>
        </>
      )}
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: "violet";
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent === "violet"
          ? "bg-gradient-to-br from-violet-600/10 to-fuchsia-600/5 border-violet-500/20"
          : "bg-neutral-900/40 border-neutral-800"
      }`}
    >
      <div className="flex items-center gap-2 text-neutral-500 mb-2">
        <span className={accent === "violet" ? "text-violet-300" : ""}>{icon}</span>
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${accent === "violet" ? "text-violet-100" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 pointer-events-none" />
      <div className="relative">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/20 items-center justify-center mb-4">
          <svg className="w-6 h-6 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-1">Begin je eerste huisstijl</h3>
        <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
          Beschrijf je merk en ontvang binnen enkele seconden een complete brand guide:
          kleuren, typografie, logo en merkverhaal.
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
        >
          Genereer mijn huisstijl →
        </Link>
      </div>
    </div>
  );
}
