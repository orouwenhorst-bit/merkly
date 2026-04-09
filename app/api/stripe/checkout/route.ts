import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { guideId } = await req.json();
    if (!guideId) {
      return NextResponse.json({ error: "guideId ontbreekt" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: guide, error } = await supabase
      .from("brand_guides")
      .select("id, company_name, is_premium")
      .eq("id", guideId)
      .single();

    if (error || !guide) {
      return NextResponse.json({ error: "Huisstijl niet gevonden" }, { status: 404 });
    }

    if (guide.is_premium) {
      const origin = req.nextUrl.origin;
      return NextResponse.json({ url: `${origin}/result/${guideId}` });
    }

    const origin = req.nextUrl.origin;
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 1400,
            product_data: {
              name: `Merkly Premium — ${guide.company_name}`,
              description:
                "Volledige brand guide als PDF, logo-varianten, merktoepassingen en alle premium features.",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { guideId: String(guide.id) },
      success_url: `${origin}/result/${guideId}?paid=1`,
      cancel_url: `${origin}/upgrade?guideId=${guideId}&canceled=1`,
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
