import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase";
import { sendPremiumEmail } from "@/lib/email";
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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string | null;

      if (userId && subscriptionId) {
        const { error } = await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: subscriptionId,
            subscription_status: "premium",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Failed to set premium status:", error);
        } else {
          // Stuur premium activatie mail
          const email = session.customer_details?.email;
          const name = session.customer_details?.name ?? undefined;
          if (email) {
            sendPremiumEmail(email, name).catch(
              (e) => console.error("[premium email]", e)
            );
          }
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status === "active" ? "premium" : "free";
      const periodEnd = new Date(
        (subscription as unknown as { current_period_end: number }).current_period_end * 1000
      ).toISOString();

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: status,
          subscription_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);

      if (error) console.error("Failed to update subscription status:", error);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "free",
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);

      if (error) console.error("Failed to cancel subscription:", error);
      break;
    }

    default:
      // Negeer andere events
      break;
  }

  return NextResponse.json({ received: true });
}
