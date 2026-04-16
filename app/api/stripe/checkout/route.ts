import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase";
import { getOrCreateStripeCustomer, getUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // User moet ingelogd zijn voor abonnement
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    // Check of al premium
    const { isPremium } = await getUserSubscription(user.id);
    if (isPremium) {
      const origin = req.nextUrl.origin;
      return NextResponse.json({ url: `${origin}/dashboard` });
    }

    const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "Stripe price niet geconfigureerd" }, { status: 500 });
    }

    const customerId = await getOrCreateStripeCustomer(user.id, user.email);
    const origin = req.nextUrl.origin;
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,

      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: user.id },
      success_url: `${origin}/dashboard?subscribed=1`,
      cancel_url: `${origin}/upgrade?canceled=1`,
      locale: "nl",
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Checkout mislukt", detail: String(err) },
      { status: 500 }
    );
  }
}
