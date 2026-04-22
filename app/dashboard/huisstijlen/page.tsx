import Link from "next/link";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import GuideList from "@/components/dashboard/GuideList";
import { toGuideCardData } from "@/lib/guide-card";

export const dynamic = "force-dynamic";

export default async function HuisstijlenPage() {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  if (!user) redirect("/login");

  const { isPremium } = await getUserSubscription(user.id);

  const supabase = createServiceClient();
  const { data: rawGuides } = await supabase
    .from("brand_guides")
    .select("id, company_name, industry, created_at, is_premium, result")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const guides = (rawGuides ?? []).map(toGuideCardData);

  return (
    <DashboardShell active="huisstijlen">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Alle huisstijlen</h1>
          <p className="text-sm text-neutral-500">
            {guides.length === 0
              ? "Nog geen huisstijlen. Genereer je eerste."
              : `${guides.length} ${guides.length === 1 ? "huisstijl" : "huisstijlen"} totaal`}
          </p>
        </div>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nieuw
        </Link>
      </div>

      <GuideList guides={guides} viewerIsPremium={isPremium} />
    </DashboardShell>
  );
}
