import Anthropic from "@anthropic-ai/sdk";
import { BrandInput, BrandGuideResult } from "@/types/brand";
import { generateWordmarkSvg, generateIconSvg, generatePatternSvg } from "@/lib/logo-generator";
import { ICON_KEYS, renderIcon } from "@/lib/icon-library";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateBrandGuide(input: BrandInput): Promise<BrandGuideResult> {
  const prompt = `Je bent een senior brand strategist en grafisch ontwerper met 15 jaar ervaring bij een top-bureau.
Je maakt brand guides die klanten omverblazen — alles klopt, van kleurpsychologie tot typografische hiërarchie.

BEDRIJFSGEGEVENS:
- Naam: ${input.companyName}
- Branche: ${input.industry}
- Gewenste sfeer/uitstraling: ${input.mood}
- Doelgroep: ${input.targetAudience}
${input.description ? `- Bedrijfsbeschrijving: ${input.description}` : ""}
${input.values ? `- Kernwaarden: ${input.values}` : ""}
${input.preferredColor ? `- VOORKEURSKLEUR (verplicht als basis): ${input.preferredColor} — gebruik dit EXACTE hex als de primaire merkkleur (positie 1 in colorPalette) en bouw de rest van het palet hier op (harmoniërend, ondersteunend).` : ""}
${input.logoUrl ? `- Er is een logo aangeleverd` : ""}

INSTRUCTIES:
Genereer een volledige brand guide als JSON. Wees specifiek en praktisch.

KLEUREN:
- Kies kleuren die ECHT bij de branche en sfeer passen — geen generieke blauw/grijs combinaties.
- Zorg voor voldoende contrast: primaire kleur moet leesbare witte tekst erop toestaan (donker genoeg).
- De achtergrondkleur moet subtiel zijn (licht), niet wit (#FFFFFF) maar iets warmer of koeler.
- De accentkleur moet opvallen naast de primaire kleur, niet te dichtbij in tint.
- Geef elke kleur een creatieve, merkgebonden naam (niet "Primaire kleur" maar bijv. "Bos Groen" of "Zonsondergang Oranje").
${input.preferredColor ? `- BELANGRIJK: De eerste kleur in colorPalette MOET exact ${input.preferredColor} zijn. Bouw vervolgens 4 ondersteunende kleuren die er natuurlijk bij passen (analoog/complementair).` : ""}

TYPOGRAFIE — heel belangrijk dat dit varieert per branche en sfeer:
- Kies lettertypes die ECHT op Google Fonts staan. Geen verzonnen namen.
- Het display font moet karakter hebben dat past bij het merk. VARIEER actief — gebruik NIET standaard Inter, Poppins, Montserrat of Roboto tenzij het echt het beste past.
- Inspiratie per type merk:
  * Luxe / mode / lifestyle → serif: Playfair Display, Cormorant Garamond, Italiana, DM Serif Display, Fraunces
  * Modern tech / SaaS → grotesk: Space Grotesk, General Sans, Manrope, Sora, Plus Jakarta Sans
  * Ambachtelijk / horeca → display serif of warme sans: Lora, Bitter, Libre Caslon Text, Recoleta-achtige zoals "Frank Ruhl Libre", Bricolage Grotesque
  * Speels / creatief → expressief: Bricolage Grotesque, Big Shoulders Display, Unbounded, Caprasimo, Fraunces
  * Editorial / professioneel → klassiek: Crimson Pro, Source Serif 4, IBM Plex Serif, Newsreader
  * Stoer / sport → industrieel: Anton, Bebas Neue, Archivo Black, Oswald, Barlow Condensed
  * Duurzaam / wellness → zacht en warm: Nunito, Quicksand, DM Sans, Outfit, Albert Sans
- Het body font moet goed leesbaar zijn in kleine formaten en harmoniëren met het display font.
- Geef de EXACTE Google Fonts URL met de juiste family names (URL-encoded met +) en weights 400/500/600/700 waar nodig.

COPY:
- Schrijf alles in het Nederlands. Wees concreet, inspirerend en merkwaardig.
- De heroHeadline moet krachtig zijn, max 8 woorden, direct de doelgroep aanspreken.
- De Instagram caption moet echt voelen — met relevante emoji en hashtags.
- De aboutUs moet authentiek klinken, niet generiek.
- Het merkverhaal moet emotie oproepen en de missie helder maken.

LOGO ICOON:
- Kies EXACT één iconKey uit deze lijst die het beste past bij de branche en het merk:
${ICON_KEYS.join(", ")}
- Geef alleen de exacte string van de gekozen key terug in het veld "iconKey".

Retourneer ALLEEN geldige JSON zonder markdown. Exact dit formaat:

{
  "companyName": "${input.companyName}",
  "tagline": "Een pakkende slogan van maximaal 6 woorden",
  "brandPersonality": ["Kernwoord1", "Kernwoord2", "Kernwoord3", "Kernwoord4", "Kernwoord5"],
  "brandStory": "2-3 zinnen merkidentiteit in wij-vorm.",
  "toneOfVoice": "Beschrijf in 2-3 zinnen hoe het merk communiceert.",
  "colorPalette": [
    { "name": "Creatieve naam voor primaire kleur", "hex": "#HEXCODE", "rgb": "rgb(R, G, B)", "usage": "Gebruik voor: hoofdknoppen, koppen, logo-achtergrond" },
    { "name": "Creatieve naam voor secundaire kleur", "hex": "#HEXCODE", "rgb": "rgb(R, G, B)", "usage": "Gebruik voor: accenten en iconen" },
    { "name": "Creatieve naam voor achtergrondkleur", "hex": "#HEXCODE (subtiel, niet #FFFFFF)", "rgb": "rgb(R, G, B)", "usage": "Gebruik voor: paginaachtergronden" },
    { "name": "Creatieve naam voor tekstkleur", "hex": "#HEXCODE (donker)", "rgb": "rgb(R, G, B)", "usage": "Gebruik voor: hoofdtekst en paragrafen" },
    { "name": "Creatieve naam voor accentkleur", "hex": "#HEXCODE (opvallend, contrasteert met primair)", "rgb": "rgb(R, G, B)", "usage": "Gebruik voor: CTA-knoppen en highlights" }
  ],
  "typography": {
    "displayFont": "Google Fonts displaylettertype",
    "bodyFont": "Google Fonts bodytekstlettertype",
    "displayUsage": "Gebruik voor: koppen H1 en H2",
    "bodyUsage": "Gebruik voor: broodtekst en UI",
    "googleFontsUrl": "https://fonts.googleapis.com/css2?family=Font1:wght@400;700&family=Font2:wght@400;500&display=swap"
  },
  "brandVoiceExamples": {
    "heroHeadline": "Een krachtige website-hoofdkop van max 8 woorden die direct aanspreekt",
    "subHeadline": "Een ondersteunende zin van max 15 woorden die de waarde verduidelijkt",
    "instagramCaption": "Een complete Instagram-caption met emoji en 5 relevante hashtags",
    "adCopy": "Twee zinnen advertentietekst die converteert, specifiek voor deze doelgroep",
    "emailSubjectLine": "Een e-mailonderwerpregel die wordt geopend (max 50 tekens)",
    "aboutUs": "Een 'Over ons' alinea van 3 zinnen in de merkstijl",
    "callToAction": "Een krachtige call-to-action knoptekst van 2-4 woorden"
  },
  "logoGuidelines": {
    "doList": [
      "Gebruik het logo op lichte en donkere achtergronden",
      "Houd minimaal 20px vrije ruimte rondom het logo",
      "Gebruik het logo in de primaire merkkleur of wit"
    ],
    "dontList": [
      "Verander de verhoudingen van het logo niet",
      "Gebruik geen effecten zoals slagschaduw op het logo",
      "Plaats het logo nooit op een drukke achtergrond"
    ]
  },
  "iconKey": "een-key-uit-de-lijst-hierboven",
  "usageExamples": {
    "businessCard": "Beschrijf het visitekaartje: achtergrondkleur, logo positie, typografie",
    "socialPost": "Beschrijf een Instagram-post: achtergrond, tekststijl, kleurgebruik",
    "emailSignature": "Beschrijf de e-mailhandtekening: opmaak, kleuren, lettertypes"
  }
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  let brandGuide: Omit<BrandGuideResult, "logoSvg" | "logoIconSvg" | "brandPatternSvg"> & { iconKey?: string };
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    brandGuide = JSON.parse(cleaned);
  } catch {
    throw new Error("Claude retourneerde geen geldige JSON: " + text.slice(0, 200));
  }

  const primary = brandGuide.colorPalette[0]?.hex ?? "#1a1a1a";
  const accent = brandGuide.colorPalette[4]?.hex ?? brandGuide.colorPalette[1]?.hex ?? "#888888";

  // Generate logos programmatically — fast, consistent, always professional
  const logoSvg = generateWordmarkSvg(input.companyName, input.industry, input.mood, primary, accent);
  const logoIconSvg = generateIconSvg(input.companyName, input.industry, input.mood, primary, accent);
  const brandPatternSvg = generatePatternSvg(primary, accent);

  const iconSvg = renderIcon(brandGuide.iconKey);

  return { ...brandGuide, iconSvg, logoSvg, logoIconSvg, brandPatternSvg };
}
