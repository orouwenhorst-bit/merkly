import { createServiceClient } from "@/lib/supabase";

export interface SubscriptionInfo {
  isPremium: boolean;
  status: "free" | "premium";
  periodEnd: Date | null;
}

/**
 * Haalt abonnementsstatus op voor een user.
 * Gebruikt service client (bypast RLS) — veilig in server-side contexts.
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_period_end")
    .eq("user_id", userId)
    .single();

  if (!data) return { isPremium: false, status: "free", periodEnd: null };

  const periodEnd = data.subscription_period_end
    ? new Date(data.subscription_period_end)
    : null;

  const isPremium =
    data.subscription_status === "premium" &&
    (!periodEnd || periodEnd > new Date());

  return {
    isPremium,
    status: isPremium ? "premium" : "free",
    periodEnd,
  };
}

/**
 * Haalt of maakt een Stripe customer aan voor een user en slaat het op in profiles.
 * Geeft stripe_customer_id terug.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string | undefined
): Promise<string> {
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Maak nieuwe Stripe customer aan
  const { getStripe } = await import("@/lib/stripe");
  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("user_id", userId);

  return customer.id;
}
