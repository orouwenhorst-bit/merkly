import Anthropic from "@anthropic-ai/sdk";
import { BrandInput, BrandGuideResult } from "@/types/brand";
import { generateWordmarkSvg, generateIconSvg, generatePatternSvg } from "@/lib/logo-generator";
import { ICON_KEYS, renderIcon } from "@/lib/icon-library";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * LIGHT generation — only what's needed for the free preview.
 * Saves ~75% tokens vs the full call.
 */
export async function generateBrandGuideLight(input: BrandInput): Promise<BrandGuideResult> {
  const lightPrompt = `Je bent een senior brand strategist. Maak een BEKNOPTE merkidentiteit-preview.

BEDRIJFSGEGEVENS:
- Naam: ${input.companyName}
- Branche: ${input.industry}
- Sfeer: ${input.mood}
- Doelgroep: ${input.targetAudience}
${input.description ? `- Beschrijving: ${input.description}` : ""}
${input.values ? `- Kernwaarden: ${input.values}` : ""}
${input.preferredColor ? `- VOORKEURSKLEUR (verplicht als basis): ${input.preferredColor}` : ""}

Genereer ALLEEN deze velden (niets meer). Schrijf alles in het Nederlands. Vul ALLE velden volledig in — geen lege arrays of lege strings.

KLEURENPALET: Exact 7 kleuren: 2 primair, 2 secundair, 3 neutraal.
${input.preferredColor ? `De EERSTE primaire kleur MOET exact ${input.preferredColor} zijn.` : ""}
Geef per kleur: creatieve naam, HEX, en category.

KLEURHARMONIE-REGELS (verplicht):
- Secundaire kleuren moeten harmoniëren met de primaire — kies analoge tinten (±30° op kleurwiel), toon-op-toon variaties, of gedempte complementaire kleuren.
- GEEN neon, fluorescerend of ongerelateerde kleuren als tweede of secundaire kleur.
- Alle kleuren moeten samen voelen als één samenhangend palet — alsof ze door één ontwerper bedacht zijn.
- Vermijd grote toonsprongen (bijv. roze + felblauw, groen + paars) tenzij de sfeer dit expliciet vraagt.
- Geef neutrale kleuren die passen bij het kleurthema (geen losse grijzen die nergens bij aansluiten).

TYPOGRAFIE: Kies 2 Google Fonts (display + body). VARIEER — geen Inter/Poppins/Montserrat/Roboto tenzij echt passend.
Vul de typeScale volledig in op basis van de gekozen fonts: H1 (display, 700, 48px), H2 (display, 600, 32px), H3 (display, 600, 24px), body (body, 400, 16px), small (body, 400, 14px).

Retourneer ALLEEN geldige JSON:

{
  "companyName": "${input.companyName}",
  "strategy": {
    "mission": "Eén zin",
    "vision": "Eén zin",
    "coreValues": [{ "value": "Naam", "description": "Korte uitleg" }],
    "brandStory": "2-3 zinnen",
    "personas": [],
    "personalityTraits": ["adj1", "adj2", "adj3", "adj4", "adj5"],
    "personalityDescription": "1 zin"
  },
  "colorPalette": {
    "colors": [
      { "name": "Naam", "hex": "#HEX", "rgb": "", "cmyk": "", "pantone": "", "usage": "Kort", "category": "primary" }
    ],
    "ratioGuideline": "",
    "accessibility": []
  },
  "typography": {
    "fonts": [
      { "name": "FontNaam", "category": "display", "weights": [400, 700], "source": "Google Fonts", "googleFontsUrl": "https://fonts.googleapis.com/css2?family=FontNaam:wght@400;700&display=swap", "fallback": "serif", "usage": "Koppen" }
    ],
    "typeScale": [
      { "level": "H1", "fontFamily": "DisplayFontNaam", "weight": 700, "sizePx": 48, "lineHeight": "1.1", "letterSpacing": "-1px", "usage": "Paginatitels" },
      { "level": "H2", "fontFamily": "DisplayFontNaam", "weight": 600, "sizePx": 32, "lineHeight": "1.2", "letterSpacing": "-0.5px", "usage": "Sectiekoppen" },
      { "level": "H3", "fontFamily": "DisplayFontNaam", "weight": 600, "sizePx": 24, "lineHeight": "1.3", "letterSpacing": "0px", "usage": "Subkoppen" },
      { "level": "body", "fontFamily": "BodyFontNaam", "weight": 400, "sizePx": 16, "lineHeight": "1.6", "letterSpacing": "0px", "usage": "Lopende tekst" },
      { "level": "small", "fontFamily": "BodyFontNaam", "weight": 400, "sizePx": 14, "lineHeight": "1.5", "letterSpacing": "0px", "usage": "Bijschriften en metadata" }
    ],
    "pairingRationale": "",
    "googleFontsUrl": ""
  },
  "toneOfVoice": {
    "voiceAttributes": ["woord1", "woord2", "woord3", "woord4"],
    "doList": ["Concrete richtlijn 1", "Concrete richtlijn 2", "Concrete richtlijn 3", "Concrete richtlijn 4"],
    "dontList": ["Verbod 1", "Verbod 2", "Verbod 3", "Verbod 4"],
    "tagline": "Max 6 woorden",
    "boilerplate": "Standaard bedrijfsbeschrijving van 2 zinnen.",
    "examples": []
  },
  "brandVoiceExamples": {
    "heroHeadline": "Krachtige websitekop max 8 woorden",
    "subHeadline": "Ondersteunende ondertitel max 15 woorden",
    "instagramCaption": "Echte Instagram-caption met emoji en 3 relevante hashtags",
    "adCopy": "Twee zinnen advertentietekst die aanzet tot actie.",
    "emailSubjectLine": "E-mailonderwerpregel max 50 tekens",
    "aboutUs": "Over ons alinea van 2-3 zinnen in wij-vorm.",
    "callToAction": "2-4 woorden CTA"
  },
  "imageryGuidelines": null,
  "iconographyGuidelines": null,
  "graphicElements": null,
  "logoGuidelines": { "doList": [], "dontList": [], "clearSpaceRule": "", "minimumSizes": { "digitalPx": 24, "printMm": 15 } },
  "usageExamples": null,
  "iconKey": "een-key-uit-de-lijst: ${ICON_KEYS.join(", ")}"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: lightPrompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  let raw: Record<string, unknown>;
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    raw = JSON.parse(cleaned);
  } catch {
    throw new Error("Claude retourneerde geen geldige JSON: " + text.slice(0, 300));
  }

  const brandGuide = raw as Omit<BrandGuideResult, "logoSvg" | "logoIconSvg" | "brandPatternSvg" | "tagline" | "brandPersonality" | "brandStory"> & { iconKey?: string };

  const colors = brandGuide.colorPalette?.colors ?? [];
  const primary = colors.find(c => c.category === "primary")?.hex ?? "#1a1a1a";
  const accent = colors.find(c => c.category === "secondary")?.hex ?? colors[1]?.hex ?? "#888888";

  const logoSvg = generateWordmarkSvg(input.companyName, input.industry, input.mood, primary, accent);
  const logoIconSvg = generateIconSvg(input.companyName, input.industry, input.mood, primary, accent);
  const brandPatternSvg = generatePatternSvg(primary, accent);
  const iconSvg = renderIcon(brandGuide.iconKey);

  const tagline = brandGuide.toneOfVoice?.tagline ?? "";
  const brandPersonality = brandGuide.strategy?.personalityTraits ?? [];
  const brandStory = brandGuide.strategy?.brandStory ?? "";

  return {
    ...brandGuide,
    iconSvg,
    logoSvg,
    logoIconSvg,
    brandPatternSvg,
    tagline,
    brandPersonality,
    brandStory,
  } as BrandGuideResult;
}

/**
 * FULL generation — all 11 sections. Only called after payment.
 */
export async function generateBrandGuide(input: BrandInput): Promise<BrandGuideResult> {
  const prompt = `Je bent een senior brand strategist en visueel ontwerper met 15+ jaar ervaring bij top-bureaus zoals Pentagram, Wolff Olins en Kossmann.dejong. Je maakt merkstijlgidsen die strategisch onderbouwd zijn — elke visuele keuze vloeit voort uit de merkstrategie.

BEDRIJFSGEGEVENS:
- Naam: ${input.companyName}
- Branche: ${input.industry}
- Gewenste sfeer/uitstraling: ${input.mood}
- Doelgroep: ${input.targetAudience}
${input.description ? `- Bedrijfsbeschrijving: ${input.description}` : ""}
${input.values ? `- Kernwaarden van de oprichter: ${input.values}` : ""}
${input.preferredColor ? `- VOORKEURSKLEUR (verplicht als basis): ${input.preferredColor} — gebruik dit EXACTE hex als de eerste primaire merkkleur en bouw het palet hierop.` : ""}

===== STAP 1: MERKSTRATEGIE (dit stuurt ALLES) =====

Begin met de strategielaag. Alle visuele keuzes die je straks maakt MOETEN logisch voortvloeien uit deze strategie.

MISSIE: Waarom bestaat dit bedrijf? Eén krachtige zin.
VISIE: Waar gaat dit bedrijf heen? Eén ambitieuze zin.
KERNWAARDEN: Exact 3 tot 5 waarden, elk met een concrete uitleg van 1-2 zinnen die beschrijft hoe deze waarde zich uit in de praktijk.
MERKVERHAAL: Eén alinea (3-4 zinnen) ontstaansverhaal of bestaansreden in wij-vorm. Authentiek, emotioneel, niet generiek.
PERSONA'S: Exact 2 persona's uit de doelgroep. Geef per persona: naam, leeftijd, beroep, 2-3 behoeften, 2-3 frustraties, en een korte beschrijving (1 zin).
MERKPERSOONLIJKHEID: Exact 5 adjectieven die het merk beschrijven, plus een korte uitleg (2 zinnen) van hoe die persoonlijkheid zich uit in communicatie en vormgeving.

===== STAP 2: VISUELE IDENTITEIT (afgeleid van strategie) =====

KLEURENPALET:
- Exact 2 PRIMAIRE kleuren — de signature kleuren van het merk
- Exact 2 SECUNDAIRE kleuren — ondersteunend, harmoniërend
- Exact 3 NEUTRALE kleuren — voor tekst, achtergronden, subtiele accenten
${input.preferredColor ? `- De EERSTE primaire kleur MOET exact ${input.preferredColor} zijn.` : ""}
- Primaire kleuren moeten krachtig en herkenbaar zijn.
- Zorg dat de primaire kleur leesbare witte tekst toestaat (donker genoeg, WCAG AA).
- Neutrale kleuren: één donkere tekstkleur, één lichte achtergrond (niet #FFFFFF), één medium grijs.
- Geef per kleur: creatieve merknaam, HEX, RGB (als "rgb(R, G, B)"), CMYK (als "cmyk(C%, M%, Y%, K%)"), en de dichtstbijzijnde Pantone-code.
- Geef de kleurverhouding-richtlijn (bijv. "60% neutraal, 30% primair, 10% secundair/accent").
- Geef 4 toegankelijkheidscombinaties: test de primaire kleur als tekst op wit, wit op primair, donker neutraal op licht neutraal, en primair op licht neutraal. Bereken de contrastratio en beoordeel WCAG AA en AAA.

KLEURHARMONIE-REGELS (strikt):
- Secundaire kleuren MOETEN harmoniëren met de primaire — kies analoge tinten (±30° op kleurwiel), toon-op-toon variaties, of subtiel complementair.
- VERBODEN: neon, fluorescente of tonaal ongerelateerde kleuren als secundaire kleur.
- Het volledige palet moet voelen alsof het door één ontwerper is samengesteld — geen losse uitschieters.
- Groot contrast tussen primaire en secundaire kleuren is alleen toegestaan als de sfeer (mood) dit expliciet vraagt (bijv. "gedurfd", "playful", "maximalistisch").
- Als de primaire kleur warm is (rood/oranje/geel), kies secundaire kleuren ook in het warme spectrum of in neutrale aardtinten.
- Als de primaire kleur koel is (blauw/groen/paars), kies secundaire kleuren ook koel of neutraal.

TYPOGRAFIE:
- Kies exact 2 typefaces (display + body), optioneel een 3e accent font.
- ALLE fonts MOETEN op Google Fonts staan. Geen verzonnen namen.
- VARIEER actief — gebruik NIET standaard Inter, Poppins, Montserrat of Roboto tenzij het echt het beste past.
- Inspiratie per type merk:
  * Luxe / mode → serif: Playfair Display, Cormorant Garamond, DM Serif Display, Fraunces
  * Modern tech / SaaS → grotesk: Space Grotesk, Manrope, Sora, Plus Jakarta Sans
  * Ambachtelijk / horeca → warm: Lora, Bitter, Libre Caslon Text, Bricolage Grotesque
  * Speels / creatief → expressief: Bricolage Grotesque, Big Shoulders Display, Unbounded
  * Professioneel → klassiek: Crimson Pro, Source Serif 4, IBM Plex Serif
  * Stoer / sport → industrieel: Anton, Bebas Neue, Archivo Black, Barlow Condensed
  * Duurzaam / wellness → zacht: Nunito, Quicksand, DM Sans, Outfit
- Geef per font: naam, categorie ("display"/"body"/"accent"), beschikbare gewichten (als array van nummers), bron ("Google Fonts"), de individuele Google Fonts URL, fallback-stack, en gebruiksbeschrijving.
- Leg in 1-2 zinnen uit WAAROM deze fonts samen werken (pairing rationale).
- Maak een type scale met exact deze levels: H1, H2, H3, H4, H5, H6, body, small, caption. Per level: fontFamily (naam), weight, sizePx, lineHeight (als string bijv. "1.2"), letterSpacing (als string bijv. "0px"), en usage (waarvoor).
- Geef één gecombineerde Google Fonts URL voor alle fonts samen.

BEELDTAAL & FOTOGRAFIE:
- photoStyle: beschrijf de fotostijl (warm/koel, candid/geposeerd, licht)
- colorTreatment: kleurbehandeling (verzadigd, desaturated, duotone, etc.)
- subjects: welke onderwerpen passen bij het merk
- composition: compositieprincipes
- doList: 3 richtlijnen voor goede beelden
- dontList: 3 dingen om te vermijden

ICONOGRAFIE:
- style: "line", "filled", of "duotone"
- strokeWidth: bijv. "1.5px" of "2px"
- cornerStyle: "rounded" of "sharp"
- colorUsage: hoe kleuren worden toegepast op icons

GRAFISCHE ELEMENTEN:
- description: beschrijf de visuele signature elementen van het merk
- shapes: welke vormen worden gebruikt
- patterns: beschrijf eventuele patronen of texturen
- usage: waar en hoe deze elementen worden ingezet

===== STAP 3: TONE OF VOICE =====

STEMATTRIBUTEN: Exact 4 woorden die beschrijven hoe het merk klinkt.
DO'S: 4 concrete richtlijnen voor woordkeuze en toon.
DON'TS: 4 dingen die het merk NOOIT doet in communicatie.
TAGLINE: Eén krachtige merkslogan van max 6 woorden.
BOILERPLATE: Een standaard bedrijfsbeschrijving van 2-3 zinnen voor gebruik in footers, social media bio's, etc.
VOORBEELDEN: Geef 6 voorbeeldzinnen voor deze contexten: "Social media post", "Website header", "E-mail nieuwsbrief", "Klantenservice", "Advertentie", "Foutmelding".

BRAND VOICE VOORBEELDEN:
- heroHeadline: krachtige websitekop, max 8 woorden
- subHeadline: ondersteunende zin, max 15 woorden
- instagramCaption: echte Instagram-caption met emoji en 5 hashtags
- adCopy: 2 zinnen advertentietekst
- emailSubjectLine: e-mailonderwerpregel, max 50 tekens
- aboutUs: "Over ons" alinea van 3 zinnen
- callToAction: CTA-knoptekst van 2-4 woorden

===== STAP 4: LOGO & TOEPASSINGEN =====

LOGO RICHTLIJNEN:
- doList: 4 do's voor loggebruik
- dontList: 4 don'ts voor logogebruik
- clearSpaceRule: beschrijf de vrije-ruimte-regel (bijv. "Minimaal de hoogte van de letter 'M' uit het logo rondom")
- minimumSizes: digitalPx (kleinste px voor scherm) en printMm (kleinste mm voor print)

TOEPASSINGEN: Beschrijf kort hoe het merk eruitziet op elk van deze touchpoints:
- businessCard: voorkant en achterkant
- socialPost: Instagram post
- emailSignature: e-mailhandtekening
- letterhead: briefpapier
- presentationSlide: presentatie titelslide
- websiteHeader: website navigatie/header
- merchandise: t-shirt of tas

ICOON: Kies EXACT één iconKey uit deze lijst: ${ICON_KEYS.join(", ")}

===== SAMENHANG-CHECK =====

Voordat je het JSON-resultaat geeft, toets intern:
1. Vloeien de kleurkeuzes logisch voort uit de merkpersoonlijkheid?
2. Past de typografie bij de toon en doelgroep?
3. Vertellen alle elementen samen hetzelfde verhaal?
4. Is er genoeg contrast en variatie voor professioneel gebruik?
Als iets niet klopt, pas het aan voordat je antwoordt.

===== OUTPUT =====

Schrijf alles in het Nederlands. Retourneer ALLEEN geldige JSON, geen markdown.

{
  "companyName": "${input.companyName}",
  "strategy": {
    "mission": "...",
    "vision": "...",
    "coreValues": [
      { "value": "Waarde", "description": "Concrete uitleg..." }
    ],
    "brandStory": "...",
    "personas": [
      {
        "name": "Voornaam",
        "age": "Leeftijd",
        "occupation": "Beroep",
        "needs": ["behoefte1", "behoefte2"],
        "frustrations": ["frustratie1", "frustratie2"],
        "description": "Korte beschrijving"
      }
    ],
    "personalityTraits": ["adj1", "adj2", "adj3", "adj4", "adj5"],
    "personalityDescription": "Hoe de persoonlijkheid zich uit..."
  },
  "colorPalette": {
    "colors": [
      { "name": "Creatieve naam", "hex": "#HEX", "rgb": "rgb(R, G, B)", "cmyk": "cmyk(C%, M%, Y%, K%)", "pantone": "Pantone XXXX C", "usage": "Gebruik voor...", "category": "primary" }
    ],
    "ratioGuideline": "60% neutraal, 30% primair, 10% accent",
    "accessibility": [
      { "combination": "Primair op Wit", "foreground": "#HEX", "background": "#FFFFFF", "contrastRatio": "X.X:1", "wcagAA": true, "wcagAAA": false }
    ]
  },
  "typography": {
    "fonts": [
      {
        "name": "Font Name",
        "category": "display",
        "weights": [400, 700],
        "source": "Google Fonts",
        "googleFontsUrl": "https://fonts.googleapis.com/css2?family=Font+Name:wght@400;700&display=swap",
        "fallback": "Georgia, serif",
        "usage": "Koppen en titels"
      }
    ],
    "typeScale": [
      { "level": "H1", "fontFamily": "Font Name", "weight": 700, "sizePx": 48, "lineHeight": "1.1", "letterSpacing": "-1px", "usage": "Pagina-titels" }
    ],
    "pairingRationale": "Waarom deze fonts samen werken...",
    "googleFontsUrl": "https://fonts.googleapis.com/css2?family=Font1:wght@400;700&family=Font2:wght@400;500&display=swap"
  },
  "imageryGuidelines": {
    "photoStyle": "...",
    "colorTreatment": "...",
    "subjects": "...",
    "composition": "...",
    "doList": ["...", "...", "..."],
    "dontList": ["...", "...", "..."]
  },
  "iconographyGuidelines": {
    "style": "line",
    "strokeWidth": "1.5px",
    "cornerStyle": "rounded",
    "colorUsage": "..."
  },
  "graphicElements": {
    "description": "...",
    "shapes": "...",
    "patterns": "...",
    "usage": "..."
  },
  "toneOfVoice": {
    "voiceAttributes": ["woord1", "woord2", "woord3", "woord4"],
    "doList": ["...", "...", "...", "..."],
    "dontList": ["...", "...", "...", "..."],
    "tagline": "Max 6 woorden",
    "boilerplate": "Standaard bedrijfsbeschrijving...",
    "examples": [
      { "context": "Social media post", "example": "..." },
      { "context": "Website header", "example": "..." },
      { "context": "E-mail nieuwsbrief", "example": "..." },
      { "context": "Klantenservice", "example": "..." },
      { "context": "Advertentie", "example": "..." },
      { "context": "Foutmelding", "example": "..." }
    ]
  },
  "brandVoiceExamples": {
    "heroHeadline": "...",
    "subHeadline": "...",
    "instagramCaption": "...",
    "adCopy": "...",
    "emailSubjectLine": "...",
    "aboutUs": "...",
    "callToAction": "..."
  },
  "logoGuidelines": {
    "doList": ["...", "...", "...", "..."],
    "dontList": ["...", "...", "...", "..."],
    "clearSpaceRule": "...",
    "minimumSizes": { "digitalPx": 24, "printMm": 15 }
  },
  "usageExamples": {
    "businessCard": "...",
    "socialPost": "...",
    "emailSignature": "...",
    "letterhead": "...",
    "presentationSlide": "...",
    "websiteHeader": "...",
    "merchandise": "..."
  },
  "iconKey": "een-key-uit-de-lijst"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  let raw: Record<string, unknown>;
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    raw = JSON.parse(cleaned);
  } catch {
    throw new Error("Claude retourneerde geen geldige JSON: " + text.slice(0, 300));
  }

  // Cast parsed output
  const brandGuide = raw as Omit<BrandGuideResult, "logoSvg" | "logoIconSvg" | "brandPatternSvg" | "tagline" | "brandPersonality" | "brandStory"> & { iconKey?: string };

  // Extract colors for logo generation
  const colors = brandGuide.colorPalette?.colors ?? [];
  const primary = colors.find(c => c.category === "primary")?.hex ?? "#1a1a1a";
  const accent = colors.find(c => c.category === "secondary")?.hex ?? colors[1]?.hex ?? "#888888";

  // Generate logos programmatically
  const logoSvg = generateWordmarkSvg(input.companyName, input.industry, input.mood, primary, accent);
  const logoIconSvg = generateIconSvg(input.companyName, input.industry, input.mood, primary, accent);
  const brandPatternSvg = generatePatternSvg(primary, accent);

  const iconSvg = renderIcon(brandGuide.iconKey);

  // Legacy compat aliases
  const tagline = brandGuide.toneOfVoice?.tagline ?? "";
  const brandPersonality = brandGuide.strategy?.personalityTraits ?? [];
  const brandStory = brandGuide.strategy?.brandStory ?? "";

  return {
    ...brandGuide,
    iconSvg,
    logoSvg,
    logoIconSvg,
    brandPatternSvg,
    tagline,
    brandPersonality,
    brandStory,
  };
}
