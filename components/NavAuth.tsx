"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AuthMenu from "@/components/AuthMenu";

export default function NavAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("subscription_status, subscription_period_end")
          .eq("user_id", user.id)
          .single();
        if (data) {
          const periodEnd = data.subscription_period_end
            ? new Date(data.subscription_period_end)
            : null;
          const premium =
            data.subscription_status === "premium" &&
            (!periodEnd || periodEnd > new Date());
          setIsPremium(premium);
        }
      }
      setLoaded(true);
    });
  }, []);

  // Placeholder om layout shift te voorkomen
  if (!loaded) return <div className="flex items-center gap-2 sm:gap-4 w-48 h-9" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/generate"
          className="hidden sm:inline text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Probeer gratis
        </Link>
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
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "Account";

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {!isPremium && (
        <Link
          href="/generate"
          className="hidden sm:inline text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Genereer
        </Link>
      )}
      {isPremium && (
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Dashboard
        </Link>
      )}
      <AuthMenu
        displayName={displayName}
        email={user.email ?? ""}
        isPremium={isPremium}
      />
    </div>
  );
}
