import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import AuthMenu from "@/components/AuthMenu";

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
    <AuthMenu
      displayName={displayName}
      email={user.email ?? ""}
      isPremium={isPremium}
    />
  );
}
