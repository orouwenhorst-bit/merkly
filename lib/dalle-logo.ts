import { createClient } from "@/lib/supabase";

const RECRAFT_API = "https://external.api.recraft.ai/v1/images/generations";

export async function generateAndStoreLogo(
  guideId: string,
  companyName: string,
  industry: string,
  mood: string,
  primaryColor: string
): Promise<string | null> {
  try {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    // Map industry to a concrete visual concept
    const industryHints: Record<string, string> = {
      "horeca": "a fork, flame, or leaf",
      "food": "a fork, flame, or leaf",
      "technologie": "a circuit node, pixel grid, or data stream",
      "software": "a bracket, code block, or digital wave",
      "mode": "an elegant curve, fabric fold, or thread spool",
      "lifestyle": "a flowing line, sun, or organic wave",
      "zorg": "a heart, open hands, or protective shield",
      "welzijn": "a lotus, balance scale, or calm wave",
      "bouw": "a building block, arch, or foundation beam",
      "vastgoed": "a rooftop, door frame, or key",
      "consultancy": "a compass, lighthouse, or upward arrow",
      "advies": "a guiding star, pathway, or compass needle",
      "creatief": "a spark, paintbrush stroke, or creative burst",
      "design": "a pen nib, grid, or golden ratio spiral",
      "retail": "a shopping bag, tag, or storefront arch",
      "e-commerce": "a cart, package box, or click cursor",
      "sport": "a motion trail, lightning bolt, or dynamic arc",
      "fitness": "a flexed form, power ring, or upward streak",
    };

    const industryLower = industry.toLowerCase();
    let visualConcept = "an abstract geometric symbol";
    for (const [key, hint] of Object.entries(industryHints)) {
      if (industryLower.includes(key)) {
        visualConcept = hint;
        break;
      }
    }

    const variationToken = Math.random().toString(36).slice(2, 8);

    // Recraft v3 drifts when the prompt is long — it latches onto words like
    // "studio" or "coffee" and starts adding literal cameras / coffee cups with
    // text labels. Keep the prompt extremely short and abstract.
    // Avoid the company name entirely (Recraft tends to render it as text).
    const prompt = [
      `flat geometric brand symbol of ${visualConcept}`,
      `solid ${primaryColor} on white`,
      `minimal, single shape, no text, no letters, no frame, no outline`,
      `mood: ${mood}`,
      `(${variationToken})`,
    ].join(", ");

    const res = await fetch(RECRAFT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RECRAFT_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        // recraftv2 supports the `icon` style which is purpose-built for clean
        // flat brand marks. `offset_fill` substyle = flat solid color shape
        // with a subtle offset (no line art, no busy multi-color, no engraving).
        // recraftv3 does NOT support `icon` style — its vector_illustration
        // defaults to a sketchy line-art look, which the user disliked.
        model: "recraftv2",
        style: "icon",
        substyle: "offset_fill",
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Recraft API error:", res.status, err);
      return null;
    }

    const json = await res.json();
    const imageUrl = json.data?.[0]?.url;
    if (!imageUrl) return null;

    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) return null;
    const imageBuffer = await imageRes.arrayBuffer();

    // Recraft `vector_illustration` style returns SVG, not PNG.
    // Detect the actual format from the file header so we store with the
    // right extension + content-type (browsers refuse PNG mime on SVG bytes).
    const head = new TextDecoder().decode(new Uint8Array(imageBuffer.slice(0, 64))).trimStart();
    const isSvg = head.startsWith("<svg") || head.startsWith("<?xml");
    const ext = isSvg ? "svg" : "png";
    const contentType = isSvg ? "image/svg+xml" : "image/png";

    // Upload to Supabase Storage
    const supabase = createClient();
    const fileName = `${guideId}.${ext}`;

    const { error } = await supabase.storage
      .from("logos")
      .upload(fileName, imageBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return null;
    }

    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    console.error("Recraft logo generation failed:", err);
    return null;
  }
}
