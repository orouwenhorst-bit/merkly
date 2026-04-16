import Link from "next/link";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PortalButton from "@/components/PortalButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  if (!user) redirect("/login");

  const { isPremium, periodEnd } = await getUserSubscription(user.id);

  const supabase = createServiceClient();
  const { count } = await supabase
    .from("brand_guides")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Gebruiker";

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const provider =
    (user.app_metadata?.provider as string | undefined) ??
    (user.identities?.[0]?.provider as string | undefined) ??
    "email";

  const memberSince = new Date(user.created_at).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardShell active="account">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Account</h1>
        <p className="text-sm text-neutral-500">
          Beheer je profiel, abonnement en accountinstellingen.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile card */}
        <section className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">
            Profiel
          </h2>
          <div className="flex items-center gap-4 mb-6">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-16 h-16 rounded-full border border-neutral-800"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-xl font-bold uppercase">
                {displayName[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-white text-lg truncate">{displayName}</p>
              <p className="text-sm text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Row label="E-mailadres" value={user.email ?? "—"} />
            <Row
              label="Inlogmethode"
              value={provider === "google" ? "Google" : "E-mail link"}
            />
            <Row label="Lid sinds" value={memberSince} />
            <Row label="Huisstijlen gegenereerd" value={String(count ?? 0)} />
          </dl>
        </section>

        {/* Subscription */}
        <section className="relative overflow-hidden bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
          {isPremium && (
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-500/15 blur-3xl rounded-full pointer-events-none" />
          )}
          <div className="relative">
            <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">
              Abonnement
            </h2>

            {isPremium ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-violet-500/20 text-violet-200 border border-violet-500/30 rounded-full px-2.5 py-0.5 font-semibold">
                    ✦ Premium
                  </span>
                  <span className="text-sm text-neutral-300">Actief</span>
                </div>
                <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
                  Je hebt toegang tot onbeperkte generaties, PDF-export, logo-varianten en
                  alle premium functies.
                  {periodEnd && (
                    <>
                      {" "}
                      Je abonnement verlengt op{" "}
                      <span className="text-white">
                        {periodEnd.toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      .
                    </>
                  )}
                </p>
                <PortalButton className="inline-flex items-center gap-2 text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-200 px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
                  Abonnement beheren
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </PortalButton>
                <p className="text-xs text-neutral-600 mt-3">
                  Beheer betaalmethodes, facturen en opzeggen via het Stripe portaal.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center text-xs bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-full px-2.5 py-0.5 font-medium">
                    Gratis plan
                  </span>
                  <span className="text-sm text-neutral-400">3 generaties per dag</span>
                </div>
                <ul className="text-sm text-neutral-400 space-y-1.5 mb-5">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 shrink-0">✦</span>
                    <span>Onbeperkt huisstijlen genereren</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 shrink-0">✦</span>
                    <span>Volledige brand guide als PDF downloaden</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 shrink-0">✦</span>
                    <span>Logo-varianten (zwart, wit, kleur, transparant)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 shrink-0">✦</span>
                    <span>Merkstem voorbeelden en mockups</span>
                  </li>
                </ul>
                <Link
                  href="/upgrade"
                  className="inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 px-4 py-2.5 rounded-xl shadow-lg shadow-violet-500/25 transition-all"
                >
                  Upgrade naar Premium
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Quick links */}
        <section className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">
            Snel naar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickLink
              href="/dashboard/huisstijlen"
              title="Alle huisstijlen"
              description="Bekijk, download of verwijder"
            />
            <QuickLink
              href="/generate"
              title="Nieuwe huisstijl"
              description="Start een nieuwe generatie"
            />
            <QuickLink href="/contact" title="Hulp nodig?" description="Stuur ons een bericht" />
            <QuickLink href="/privacy" title="Privacy" description="Bekijk ons privacybeleid" />
          </div>
        </section>

        {/* Sign out */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-red-300 uppercase tracking-wider mb-2">
            Uitloggen
          </h2>
          <p className="text-sm text-neutral-400 mb-4">
            Je wordt uitgelogd van Merkly op dit apparaat. Je huisstijlen blijven bewaard.
          </p>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm font-medium bg-red-500/10 text-red-200 border border-red-500/30 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors"
            >
              Uitloggen
            </button>
          </form>
        </section>
      </div>
    </DashboardShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-neutral-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-white truncate">{value}</dd>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 rounded-xl px-4 py-3 transition-all"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-white group-hover:text-violet-200 transition-colors">
          {title}
        </p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      <svg
        className="w-4 h-4 text-neutral-600 group-hover:text-violet-300 group-hover:translate-x-0.5 transition-all"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
