import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";

/**
 * Server Component — toont inlogknop of gebruikersmenu op basis van sessie.
 * Te gebruiken in elke nav.
 */
export default async function AuthButton() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-sm text-neutral-400 hover:text-white transition-colors px-3 py-2"
        >
          Inloggen
        </Link>
        <Link
          href="/signup"
          className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
        >
          Aanmelden
        </Link>
      </div>
    );
  }

  const { isPremium } = await getUserSubscription(user.id);
  const displayName =
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "Account";

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="text-sm text-neutral-400 hover:text-white transition-colors hidden sm:block"
      >
        Dashboard
      </Link>

      {isPremium ? (
        <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-0.5 font-medium">
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

      {/* Avatar + dropdown */}
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
  );
}
