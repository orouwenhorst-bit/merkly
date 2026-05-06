import { createServiceClient } from "@/lib/supabase";

export type AnalyticsEvent =
  | "generation_started"
  | "generation_completed"
  | "generation_failed"
  | "pdf_downloaded"
  | "logo_regenerated"
  | "colors_regenerated"
  | "typography_regenerated"
  | "strategy_regenerated"
  | "tone_regenerated"
  | "upgraded_to_premium"
  | "subscription_cancelled";

export async function trackEvent(
  eventType: AnalyticsEvent,
  options: {
    userId?: string | null;
    guideId?: string | null;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.from("analytics_events").insert({
      event_type: eventType,
      user_id: options.userId ?? null,
      guide_id: options.guideId ?? null,
      metadata: options.metadata ?? {},
    });
  } catch {
    // Nooit een generatie blokkeren door logging-fouten
  }
}
