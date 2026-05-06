"use server";

import { createServiceClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function upsertLinkedInCampaign(formData: FormData) {
  const weekStart = formData.get("week_start") as string;
  if (!weekStart) return { error: "week_start ontbreekt" };

  const impressions = parseInt(formData.get("impressions") as string) || 0;
  const clicks = parseInt(formData.get("clicks") as string) || 0;
  const spendEuros = parseFloat(formData.get("spend_euros") as string) || 0;
  const notes = (formData.get("notes") as string) || null;

  const supabase = createServiceClient();
  const { error } = await supabase.from("linkedin_campaigns").upsert(
    { week_start: weekStart, impressions, clicks, spend_euros: spendEuros, notes },
    { onConflict: "week_start" }
  );

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}
