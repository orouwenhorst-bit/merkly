import { createServiceClient } from "@/lib/supabase";
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import MerklyLogo from "@/components/MerklyLogo";
import AdminChart from "./AdminChart";
import LinkedInSection from "./LinkedInSection";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "o.rouwenhorst@gmail.com";

// Alleen data vanaf deze datum tellen — alles daarvoor was testdata.
const LIVE_SINCE = "2026-05-06T00:00:00.000Z";

// ── helpers ──────────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, number> {
  return arr.reduce<Record<string, number>>((acc, item) => {
    const k = key(item) || "onbekend";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

function topN(map: Record<string, number>, n: number) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

// ── page ─────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  // Auth guard (middleware handles redirect, but double-check here)
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect("/");

  const supabase = createServiceClient();

  // Date boundaries
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - 6);
  const monthStart = new Date(today); monthStart.setDate(1);
  const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(today.getDate() - 29);

  // ── Parallel data fetching — alles gefilterd op LIVE_SINCE ──────────────
  const [
    { count: totalGenerations },
    { count: todayCount },
    { count: weekCount },
    { count: monthCount },
    { count: premiumUserCount },
    { data: allGuidesMeta },
    { data: chartGuides },
    { data: recentActivity },
    { data: analyticsEvents },
    { data: premiumProfiles },
    { data: linkedinCampaigns },
  ] = await Promise.all([
    supabase.from("brand_guides").select("*", { count: "exact", head: true }).gte("created_at", LIVE_SINCE),
    supabase.from("brand_guides").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("brand_guides").select("*", { count: "exact", head: true }).gte("created_at", weekStart.toISOString()),
    supabase.from("brand_guides").select("*", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("subscription_status", "premium").gte("upgraded_at", LIVE_SINCE),
    supabase.from("brand_guides").select("industry, mood, user_id, is_premium").gte("created_at", LIVE_SINCE),
    supabase.from("brand_guides").select("created_at, is_premium").gte("created_at", thirtyDaysAgo.toISOString()),
    supabase.from("brand_guides").select("id, company_name, industry, created_at, is_premium, user_id, updated_at").gte("created_at", LIVE_SINCE).order("created_at", { ascending: false }).limit(20),
    supabase.from("analytics_events").select("event_type, created_at, user_id").gte("created_at", LIVE_SINCE),
    supabase.from("profiles").select("user_id, upgraded_at").eq("subscription_status", "premium").not("upgraded_at", "is", null).gte("upgraded_at", LIVE_SINCE),
    supabase.from("linkedin_campaigns").select("*").order("week_start", { ascending: false }).limit(16),
  ]);

  // ── Computed stats ────────────────────────────────────────────────────────
  const guides = allGuidesMeta ?? [];
  const uniqueUsers = new Set(guides.filter((g) => g.user_id).map((g) => g.user_id)).size;
  const conversionRatio =
    uniqueUsers > 0 ? (((premiumUserCount ?? 0) / uniqueUsers) * 100).toFixed(1) : "0";

  // Funnel: started vs completed (from analytics_events, may be empty initially)
  const events = analyticsEvents ?? [];
  const startedCount = events.filter((e) => e.event_type === "generation_started").length;
  const completedCount = events.filter((e) => e.event_type === "generation_completed").length;
  const funnelRate = startedCount > 0 ? Math.round((completedCount / startedCount) * 100) : null;

  // Feature usage this month
  const featureEvents: Record<string, number> = {
    "PDF download": events.filter((e) => e.event_type === "pdf_downloaded").length,
    "Logo regeneratie": events.filter((e) => e.event_type === "logo_regenerated").length,
    "Kleuren regeneratie": events.filter((e) => e.event_type === "colors_regenerated").length,
    "Typografie regeneratie": events.filter((e) => e.event_type === "typography_regenerated").length,
    "Strategie regeneratie": events.filter((e) => e.event_type === "strategy_regenerated").length,
  };
  const totalFeatureEvents = Object.values(featureEvents).reduce((s, v) => s + v, 0);

  // Avg conversion time (days from first generation to upgrade)
  let avgConversionDays: number | null = null;
  if ((premiumProfiles ?? []).length > 0) {
    const firstGenByUser: Record<string, string> = {};
    for (const g of guides) {
      if (!g.user_id) continue;
      if (!firstGenByUser[g.user_id]) firstGenByUser[g.user_id] = (g as { created_at?: string }).created_at ?? "";
    }
    const diffs = (premiumProfiles ?? [])
      .filter((p) => p.upgraded_at && firstGenByUser[p.user_id])
      .map((p) => daysBetween(firstGenByUser[p.user_id], p.upgraded_at!));
    if (diffs.length > 0) {
      avgConversionDays = Math.round(diffs.reduce((s, d) => s + d, 0) / diffs.length);
    }
  }

  // Chart data: generaties per dag, afgelopen 30 dagen (nooit vóór LIVE_SINCE)
  const liveFrom = new Date(Math.max(thirtyDaysAgo.getTime(), new Date(LIVE_SINCE).getTime()));
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(liveFrom);
    d.setDate(liveFrom.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayGuides = (chartGuides ?? []).filter((g) => g.created_at.startsWith(dateStr));
    return { date: dateStr, total: dayGuides.length, premium: dayGuides.filter((g) => g.is_premium).length };
  });

  // Industry & mood breakdown
  const industryMap = groupBy(guides.filter((g) => g.industry), (g) => g.industry!);
  const moodMap = groupBy(guides.filter((g) => g.mood), (g) => g.mood!);
  const topIndustries = topN(industryMap, 10);
  const topMoods = topN(moodMap, 10);
  const maxIndustry = topIndustries[0]?.[1] ?? 1;
  const maxMood = topMoods[0]?.[1] ?? 1;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-neutral-900/60 bg-neutral-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <MerklyLogo size={24} variant="gradient" />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Merk</span>
              <span className="text-violet-400">ly</span>
            </span>
          </Link>
          <span className="text-neutral-600">/</span>
          <span className="text-sm font-semibold text-violet-300">Admin</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span>{now.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          <Link href="/dashboard" className="text-neutral-400 hover:text-white transition-colors">
            Jouw dashboard →
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Overzicht metrics ── */}
        <section>
          <div className="flex items-baseline gap-3 mb-3">
            <SectionTitle>Overzicht</SectionTitle>
            <span className="text-xs text-neutral-600">
              Telt vanaf {new Date(LIVE_SINCE).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })} — testdata uitgesloten
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Totaal generaties" value={totalGenerations ?? 0} accent />
            <StatCard label="Vandaag" value={todayCount ?? 0} />
            <StatCard label="Deze week" value={weekCount ?? 0} />
            <StatCard label="Deze maand" value={monthCount ?? 0} />
            <StatCard label="Unieke gebruikers" value={uniqueUsers} />
            <StatCard label="Premium gebruikers" value={premiumUserCount ?? 0} accent />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <StatCard
              label="Conversieratio gratis → premium"
              value={`${conversionRatio}%`}
              subtext={`${premiumUserCount ?? 0} van ${uniqueUsers} gebruikers`}
              accent
            />
            <StatCard
              label="Gem. tijd tot upgrade"
              value={avgConversionDays !== null ? `${avgConversionDays} dagen` : "—"}
              subtext={avgConversionDays !== null ? "na eerste generatie" : "Nog geen conversies gelogd"}
            />
            <StatCard
              label="Generaties voltooid (maand)"
              value={funnelRate !== null ? `${funnelRate}%` : "—"}
              subtext={startedCount > 0 ? `${completedCount} van ${startedCount} gestart` : "Event logging nog nieuw"}
            />
          </div>
        </section>

        {/* ── Grafiek ── */}
        <section>
          <SectionTitle>Generaties per dag — afgelopen 30 dagen</SectionTitle>
          <Card>
            <AdminChart data={chartData} />
          </Card>
        </section>

        {/* ── Inhoudelijke data ── */}
        <section>
          <SectionTitle>Populaire branches &amp; stijlen</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-semibold text-neutral-300 mb-4">Top branches</h3>
              <div className="space-y-2">
                {topIndustries.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 w-36 truncate shrink-0">{name}</span>
                    <div className="flex-1 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full"
                        style={{ width: `${(count / maxIndustry) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 w-8 text-right">{count}</span>
                  </div>
                ))}
                {topIndustries.length === 0 && <p className="text-xs text-neutral-600 italic">Geen data</p>}
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-neutral-300 mb-4">Top stijlen / moods</h3>
              <div className="space-y-2">
                {topMoods.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 w-36 truncate shrink-0 capitalize">{name}</span>
                    <div className="flex-1 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-600 to-violet-500 rounded-full"
                        style={{ width: `${(count / maxMood) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 w-8 text-right">{count}</span>
                  </div>
                ))}
                {topMoods.length === 0 && <p className="text-xs text-neutral-600 italic">Geen data</p>}
              </div>
            </Card>
          </div>
        </section>

        {/* ── Premium feature gebruik ── */}
        <section>
          <SectionTitle>Premium feature gebruik deze maand</SectionTitle>
          <Card>
            {totalFeatureEvents === 0 ? (
              <p className="text-sm text-neutral-600 italic">
                Event logging is net actief — hier verschijnt data zodra premium features worden gebruikt.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {Object.entries(featureEvents).map(([name, count]) => (
                  <div key={name} className="text-center">
                    <p className="text-2xl font-bold text-violet-300">{count}</p>
                    <p className="text-xs text-neutral-500 mt-1">{name}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        {/* ── Recente activiteit ── */}
        <section>
          <SectionTitle>Recente activiteit (laatste 20)</SectionTitle>
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500">
                  <th className="pb-3 pr-4 font-medium">Merknaam</th>
                  <th className="pb-3 pr-4 font-medium">Branche</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Tijdstip</th>
                  <th className="pb-3 font-medium">Bewerkt</th>
                </tr>
              </thead>
              <tbody>
                {(recentActivity ?? []).map((g) => {
                  const hasEdits = g.updated_at && g.updated_at !== g.created_at;
                  return (
                    <tr key={g.id} className="border-b border-neutral-800/40 hover:bg-neutral-900/30 transition-colors">
                      <td className="py-2.5 pr-4 font-medium text-neutral-200">{g.company_name || "—"}</td>
                      <td className="py-2.5 pr-4 text-neutral-400">{g.industry || "—"}</td>
                      <td className="py-2.5 pr-4">
                        {g.is_premium ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/20 rounded-full px-2 py-0.5">
                            ✦ Premium
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-600">Gratis</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-neutral-500 text-xs">{formatDate(g.created_at)}</td>
                      <td className="py-2.5">
                        {hasEdits ? (
                          <span className="text-xs text-violet-400">Ja</span>
                        ) : (
                          <span className="text-xs text-neutral-700">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(recentActivity ?? []).length === 0 && (
              <p className="text-sm text-neutral-600 italic py-4">Nog geen generaties.</p>
            )}
          </Card>
        </section>

        {/* ── LinkedIn ── */}
        <section>
          <SectionTitle>LinkedIn campagne tracking</SectionTitle>
          <p className="text-xs text-neutral-600 mb-4">
            Voer hier wekelijks je LinkedIn advertentiedata in. Klik→site→generatie→upgrade funnel is zichtbaar zodra meerdere weken ingevoerd zijn.
          </p>
          <Card>
            <LinkedInSection campaigns={linkedinCampaigns ?? []} />
          </Card>
        </section>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">{children}</h2>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  accent,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "bg-gradient-to-br from-violet-600/10 to-fuchsia-600/5 border-violet-500/20"
          : "bg-neutral-900/40 border-neutral-800"
      }`}
    >
      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2 leading-tight">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-violet-100" : "text-white"}`}>{value}</p>
      {subtext && <p className="text-xs text-neutral-600 mt-1">{subtext}</p>}
    </div>
  );
}
