/**
 * Shared helpers for regenerating individual sections of a brand guide.
 * Used by /api/guides/[id]/regenerate-* endpoints.
 *
 * Common shape:
 * 1. Auth + premium check
 * 2. Fetch guide + ensure ownership
 * 3. Call Claude with a section-specific prompt
 * 4. Parse JSON, return to client
 *
 * The client then calls a corresponding /apply-* endpoint to persist
 * the user's choice.
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import type { BrandGuideResult } from "@/types/brand";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export interface GuideContext {
  guideId: string;
  userId: string;
  guide: {
    id: string;
    user_id: string;
    company_name: string;
    industry: string | null;
    result: BrandGuideResult;
  };
}

/**
 * Auth + ownership + premium gate. Returns either a context for the section
 * regeneration logic, or a NextResponse error to pass back directly.
 */
export async function loadPremiumGuideContext(
  guideId: string,
): Promise<GuideContext | NextResponse> {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { isPremium } = await getUserSubscription(user.id);
  if (!isPremium) {
    return NextResponse.json(
      { error: "Premium abonnement vereist" },
      { status: 403 },
    );
  }

  const supabase = createServiceClient();
  const { data: guide, error } = await supabase
    .from("brand_guides")
    .select("id, user_id, company_name, industry, result")
    .eq("id", guideId)
    .single();

  if (error || !guide) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  if (guide.user_id !== user.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  return {
    guideId,
    userId: user.id,
    guide: guide as GuideContext["guide"],
  };
}

/**
 * Load the guide for a non-gated /apply-* call: requires login + ownership
 * but NOT a current premium subscription. (If they already paid for the
 * generation that produced this guide, they may apply variants.)
 */
export async function loadOwnedGuideContext(
  guideId: string,
): Promise<GuideContext | NextResponse> {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: guide, error } = await supabase
    .from("brand_guides")
    .select("id, user_id, company_name, industry, result")
    .eq("id", guideId)
    .single();

  if (error || !guide) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  if (guide.user_id !== user.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  return {
    guideId,
    userId: user.id,
    guide: guide as GuideContext["guide"],
  };
}

/**
 * Persist a partial update to brand_guides.result (merging with the existing
 * result) for the given guide.
 */
export async function persistResultPatch(
  guideId: string,
  patch: Partial<BrandGuideResult>,
  current: BrandGuideResult,
): Promise<void> {
  const supabase = createServiceClient();
  const merged: BrandGuideResult = { ...current, ...patch };
  await supabase.from("brand_guides").update({ result: merged }).eq("id", guideId);
}

/**
 * Call Claude with a JSON-only prompt and return the parsed object,
 * tolerating fences and surrounding text.
 */
export async function generateJsonSection<T>(
  prompt: string,
  options: { maxTokens?: number; model?: string } = {},
): Promise<T> {
  const response = await client.messages.create({
    model: options.model ?? "claude-haiku-4-5-20251001",
    max_tokens: options.maxTokens ?? 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  const stripped = text.replace(/```json\n?|\n?```/g, "").trim();
  // Extract first {...} or [...] block in case Claude wrapped it
  const objectMatch = stripped.match(/\{[\s\S]*\}/);
  const arrayMatch = stripped.match(/\[[\s\S]*\]/);
  const candidate =
    arrayMatch && (!objectMatch || arrayMatch.index! < objectMatch.index!)
      ? arrayMatch[0]
      : objectMatch?.[0] ?? stripped;

  try {
    return JSON.parse(candidate) as T;
  } catch (err) {
    throw new Error(
      "Claude retourneerde geen geldige JSON: " +
        (err instanceof Error ? err.message : String(err)) +
        " — start: " +
        text.slice(0, 200),
    );
  }
}

/**
 * Build a compact context block describing the brand, used as preamble in
 * regeneration prompts so Claude keeps coherency with the rest of the guide.
 */
export function buildBrandContextBlock(guide: GuideContext["guide"]): string {
  const result = guide.result;
  const colors = result.colorPalette?.colors ?? [];
  const primary = colors.find((c) => c.category === "primary")?.hex ?? "#000";
  const secondary =
    colors.find((c) => c.category === "secondary")?.hex ?? "#888";
  const fonts = result.typography?.fonts ?? [];
  const personality =
    result.strategy?.personalityTraits?.slice(0, 5).join(", ") ?? "";
  const voice =
    result.toneOfVoice?.voiceAttributes?.slice(0, 4).join(", ") ?? "";
  const tagline = result.toneOfVoice?.tagline ?? "";
  const mission = result.strategy?.mission ?? "";

  return [
    `Merk: ${guide.company_name}`,
    guide.industry ? `Branche: ${guide.industry}` : null,
    mission ? `Missie: ${mission}` : null,
    tagline ? `Tagline: "${tagline}"` : null,
    personality ? `Persoonlijkheid: ${personality}` : null,
    voice ? `Tone of voice: ${voice}` : null,
    `Primaire kleur: ${primary}`,
    `Secundaire kleur: ${secondary}`,
    fonts.length > 0
      ? `Huidige fonts: ${fonts.map((f) => `${f.name} (${f.category})`).join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}
