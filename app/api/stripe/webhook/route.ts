import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const guideId = session.metadata?.guideId;
    if (guideId && session.payment_status === "paid") {
      // Mark as premium first
      const { error } = await supabase
        .from("brand_guides")
        .update({ is_premium: true })
        .eq("id", guideId);
      if (error) console.error("Failed to mark guide premium:", error);

      // Trigger full premium generation in the background
      // (non-blocking — the user can already see their page)
      const origin = req.nextUrl.origin;
      fetch(`${origin}/api/generate-premium`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId }),
      }).catch(err => console.error("Failed to trigger premium generation:", err));
    }
  }

  return NextResponse.json({ received: true });
}
