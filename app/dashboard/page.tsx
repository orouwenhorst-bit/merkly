import Link from "next/link";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import AuthButton from "@/components/AuthButton";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5 font-medium">
      ✦ Premium
    </span>
  );
}

function FreeBadge() {
  return (
    <span className="inline-flex items-center text-xs bg-neutral-800 text-neutral-500 border border-neutral-700 rounded-full px-2 py-0.5">
      Gratis
    </span>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const justSubscribed = sp.subscribed === "1";

  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) redirect("/login");

  const { isPremium, status } = await getUserSubscription(user.id);

  // Haal guides op via service client (bypast RLS)
  const supabase = createServiceClient();
  const { data: guides } = await supabase
    .from("brand_guides")
    .select("id, company_name, industry, created_at, is_premium")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Tel generaties van vandaag
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount =
    guides?.filter((g) => new Date(g.created_at) >= today).length ?? 0;

  const displayName =
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "Account";

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-neutral-900/50 bg-neutral-950/80 backdrop-blur-xl">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-white">Merk</span>
          <span className="text-violet-400">ly</span>
        </Link>
        <AuthButton />
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Welkomsttekst */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            Welkom, {displayName}
          </h1>
          <p className="text-neutral-500 text-sm">Hier vind je al je gegenereerde huisstijlen.</p>
        </div>

        {/* Abonnementsbanner */}
        {justSubscribed && (
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
            <span className="text-violet-300 text-lg">✦</span>
            <div>
              <p className="font-semibold text-violet-200">Premium actief — welkom!</p>
              <p className="text-sm text-neutral-400">Je kunt nu onbeperkt volledige huisstijlen genereren.</p>
            </div>
          </div>
        )}

        {isPremium ? (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl px-5 py-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <PremiumBadge />
              <span className="text-sm text-neutral-300">Premium actief · Onbeperkt genereren</span>
            </div>
            <form action="/api/stripe/portal" method="POST">
              <button
                type="submit"
                className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 transition-colors"
              >
                Abonnement beheren →
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl px-5 py-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <FreeBadge />
              <span className="text-sm text-neutral-400">
                {todayCount} van 3 generaties vandaag gebruikt
              </span>
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-1.5 rounded-full ${i < todayCount ? "bg-violet-500" : "bg-neutral-700"}`}
                  />
                ))}
              </div>
            </div>
            <Link
              href="/upgrade"
              className="text-xs bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-4 py-1.5 rounded-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all"
            >
              Upgrade naar Premium →
            </Link>
          </div>
        )}

        {/* Guides grid */}
        {!guides || guides.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-2xl">
            <p className="text-neutral-500 mb-4">Nog geen huisstijlen. Genereer je eerste!</p>
            <Link
              href="/generate"
              className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/20"
            >
              Genereer een huisstijl →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {guides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/result/${guide.id}`}
                  className="group bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 transition-all hover:bg-neutral-900"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300">
                      {guide.company_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    {guide.is_premium ? <PremiumBadge /> : <FreeBadge />}
                  </div>
                  <p className="font-semibold text-white group-hover:text-violet-200 transition-colors mb-1 truncate">
                    {guide.company_name}
                  </p>
                  <p className="text-xs text-neutral-500 mb-3 truncate">{guide.industry}</p>
                  <p className="text-xs text-neutral-600">
                    {new Date(guide.created_at).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/generate"
                className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/20"
              >
                + Nieuwe huisstijl genereren
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
