import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { BrandGuideResult } from "@/types/brand";
import { recolorSvgToWhite } from "@/lib/svg-processing";

export const dynamic = "force-dynamic";

/**
 * GET /api/guides/[id]/download-logo?variant=fullColor|monoBlack|monoWhite|monoPrimary|transparent
 * Returns the SVG file for the requested logo variant. Premium only.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  // Fetch guide
  const supabase = createServiceClient();
  const { data: guide, error } = await supabase
    .from("brand_guides")
    .select("id, user_id, is_premium, result")
    .eq("id", id)
    .single();

  if (error || !guide) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  if (guide.user_id !== user.id) {
    return NextResponse.json({ error: "Niet toegestaan" }, { status: 403 });
  }

  // Premium check — either the guide is premium OR the user has an active subscription
  const { getUserSubscription } = await import("@/lib/subscription");
  const { isPremium } = await getUserSubscription(user.id);
  if (!isPremium && !guide.is_premium) {
    return NextResponse.json({ error: "Premium vereist" }, { status: 403 });
  }

  const result = guide.result as BrandGuideResult;
  const variant = req.nextUrl.searchParams.get("variant") as keyof typeof result.logoVariants | null;

  const validVariants = ["fullColor", "monoBlack", "monoWhite", "monoPrimary", "transparent"] as const;
  if (!variant || !validVariants.includes(variant as (typeof validVariants)[number])) {
    return NextResponse.json({ error: "Ongeldige variant" }, { status: 400 });
  }

  let svgString = result.logoVariants?.[variant as keyof typeof result.logoVariants];
  if (!svgString || typeof svgString !== "string") {
    return NextResponse.json({ error: "Logo variant niet beschikbaar" }, { status: 404 });
  }

  // For monoWhite, derive from monoBlack so cutouts are transparent (not white)
  if (variant === "monoWhite") {
    const monoBlack = result.logoVariants?.monoBlack;
    svgString = recolorSvgToWhite(monoBlack && typeof monoBlack === "string" ? monoBlack : svgString);
  }

  const safeName = result.companyName
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const format = req.nextUrl.searchParams.get("format") === "png" ? "png" : "svg";

  if (format === "png") {
    const sharp = (await import("sharp")).default;
    // Give sharp a default size; the SVG viewBox preserves the logo's aspect ratio
    const pngBuffer = await sharp(Buffer.from(svgString))
      .resize(512, 512, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${safeName}-logo-${variant}.png"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return new NextResponse(svgString, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="${safeName}-logo-${variant}.svg"`,
      "Cache-Control": "no-store",
    },
  });
}
