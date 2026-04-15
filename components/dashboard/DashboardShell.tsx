import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";
import DashboardNav from "./DashboardNav";

export default async function DashboardShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: "overview" | "huisstijlen" | "account";
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const { isPremium } = await getUserSubscription(user.id);

  const displayName =
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "Account";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 border-b border-neutral-900/60 bg-neutral-950/80 backdrop-blur-xl">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-white">Merk</span>
          <span className="text-violet-400">ly</span>
        </Link>

        <div className="flex items-center gap-3">
          {isPremium ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-violet-500/20 text-violet-200 border border-violet-500/30 rounded-full px-2.5 py-0.5 font-medium">
              ✦ Premium
            </span>
          ) : (
            <Link
              href="/upgrade"
              className="hidden sm:inline-flex items-center text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full px-2.5 py-0.5 font-medium hover:bg-amber-500/20 transition-colors"
            >
              Upgrade
            </Link>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {displayName[0]}
            </div>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-xs text-neutral-500 hover:text-white transition-colors"
                title={`Uitloggen (${user.email})`}
              >
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-10">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 self-start">
            <DashboardNav active={active} isPremium={isPremium} />
          </aside>

          {/* Content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
