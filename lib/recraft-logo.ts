import { createClient } from "@/lib/supabase";

const RECRAFT_API = "https://external.api.recraft.ai/v1/images/generations";

// Industry-to-visual-concept mapping for prompt construction
const INDUSTRY_HINTS: Record<string, string> = {
  horeca: "a fork, flame, or leaf",
  food: "a fork, flame, or leaf",
  technologie: "a circuit node, pixel grid, or data stream",
  software: "a bracket, code block, or digital wave",
  mode: "an elegant curve, fabric fold, or thread spool",
  lifestyle: "a flowing line, sun, or organic wave",
  zorg: "a heart, open hands, or protective shield",
  welzijn: "a lotus, balance scale, or calm wave",
  bouw: "a building block, arch, or foundation beam",
  vastgoed: "a rooftop, door frame, or key",
  consultancy: "a compass, lighthouse, or upward arrow",
  advies: "a guiding star, pathway, or compass needle",
  creatief: "a spark, paintbrush stroke, or creative burst",
  design: "a pen nib, grid, or golden ratio spiral",
  retail: "a shopping bag, tag, or storefront arch",
  "e-commerce": "a cart, package box, or click cursor",
  sport: "a motion trail, lightning bolt, or dynamic arc",
  fitness: "a flexed form, power ring, or upward streak",
  interieur: "an arch, window frame, or furniture silhouette",
  financieel: "a rising graph, shield, or abstract column",
  onderwijs: "an open book, lightbulb, or ascending stairs",
  "non-profit": "connected hands, growing seedling, or community circle",
};

/**
 * Build a tightly controlled Recraft prompt based on Claude's brand direction.
 * The prompt should be very specific to get a single clean result.
 */
function buildLogoPrompt(
  industry: string,
  mood: string,
  primaryColor: string,
  brandPersonality: string[],
): string {
  const industryLower = industry.toLowerCase();
  let visualConcept = "an abstract geometric symbol";
  for (const [key, hint] of Object.entries(INDUSTRY_HINTS)) {
    if (industryLower.includes(key)) {
      visualConcept = hint;
      break;
    }
  }

  // Use personality traits to steer visual direction
  const personalityHint = brandPersonality.length > 0
    ? `style reflects: ${brandPersonality.slice(0, 3).join(", ")}`
    : "";

  return [
    `flat geometric brand symbol of ${visualConcept}`,
    `solid ${primaryColor} on white background`,
    `minimal, single shape, centered, isolated`,
    `no text, no letters, no words, no frame, no outline, no background patterns`,
    `clean vector, professional brand mark`,
    personalityHint,
    `mood: ${mood}`,
  ]
    .filter(Boolean)
    .join(", ");
}

export interface LogoGenerationResult {
  /** Raw SVG string from Recraft V4 */
  svg: string;
  /** Recraft image ID for reference */
  imageId: string;
  /** Public URL if stored in Supabase */
  publicUrl?: string;
}

/**
 * Generate a logo using Recraft V4 with native SVG output.
 * Returns the SVG string directly — no raster conversion needed.
 */
export async function generateLogoSvg(
  industry: string,
  mood: string,
  primaryColor: string,
  brandPersonality: string[] = [],
): Promise<LogoGenerationResult | null> {
  if (!process.env.RECRAFT_API_KEY) return null;

  try {
    const prompt = buildLogoPrompt(industry, mood, primaryColor, brandPersonality);

    const res = await fetch(RECRAFT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RECRAFT_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        model: "recraftv4",
        style: "vector_illustration",
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Recraft V4 API error:", res.status, err);
      return null;
    }

    const json = await res.json();
    const imageUrl = json.data?.[0]?.url;
    const imageId = json.data?.[0]?.image_id ?? "";
    if (!imageUrl) return null;

    // Fetch the SVG content
    const svgRes = await fetch(imageUrl);
    if (!svgRes.ok) return null;
    const svg = await svgRes.text();

    // Verify it's actually SVG
    if (!svg.trimStart().startsWith("<svg") && !svg.trimStart().startsWith("<?xml")) {
      console.error("Recraft V4 did not return SVG despite vector_illustration style");
      return null;
    }

    return { svg, imageId };
  } catch (err) {
    console.error("Recraft V4 logo generation failed:", err);
    return null;
  }
}

/**
 * Store a logo SVG in Supabase storage and return the public URL of a PNG version.
 * Also stores the original SVG for web rendering.
 * Returns the PNG URL since it's universally compatible (PDF, <img>, etc.).
 */
export async function storeLogoSvg(
  guideId: string,
  svg: string,
  variant: string = "primary",
): Promise<string | null> {
  try {
    const supabase = createClient();

    // Store the original SVG
    const svgFileName = `${guideId}-${variant}.svg`;
    await supabase.storage
      .from("logos")
      .upload(svgFileName, svg, {
        contentType: "image/svg+xml",
        upsert: true,
      });

    // Convert to PNG and store for universal compatibility
    try {
      const sharp = (await import("sharp")).default;
      const pngBuf = await sharp(Buffer.from(svg))
        .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer();

      const pngFileName = `${guideId}-${variant}.png`;
      const { error: pngError } = await supabase.storage
        .from("logos")
        .upload(pngFileName, pngBuf, {
          contentType: "image/png",
          upsert: true,
        });

      if (!pngError) {
        const { data } = supabase.storage.from("logos").getPublicUrl(pngFileName);
        return data.publicUrl;
      }
    } catch (convErr) {
      console.error("SVG to PNG conversion failed during storage:", convErr);
    }

    // Fallback: return SVG URL if PNG conversion failed
    const { data } = supabase.storage.from("logos").getPublicUrl(svgFileName);
    return data.publicUrl;
  } catch (err) {
    console.error("Logo storage failed:", err);
    return null;
  }
}
