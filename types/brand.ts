export interface BrandInput {
  companyName: string;
  industry: string;
  mood: string;
  targetAudience: string;
  description?: string;
  values?: string;
  logoUrl?: string;
  preferredColor?: string;
}

// --- Brand Strategy ---

export interface BrandValue {
  value: string;
  description: string;
}

export interface BrandPersona {
  name: string;
  age: string;
  occupation: string;
  needs: string[];
  frustrations: string[];
  description: string;
}

export interface BrandStrategy {
  mission: string;
  vision: string;
  coreValues: BrandValue[];
  brandStory: string;
  personas: BrandPersona[];
  personalityTraits: string[];        // 5 adjectieven (sincerity, excitement, etc.)
  personalityDescription: string;     // uitleg hoe de personality zich uit
}

// --- Kleuren ---

export interface ColorSwatch {
  name: string;
  hex: string;
  rgb: string;
  cmyk: string;
  pantone: string;
  usage: string;
  category: "primary" | "secondary" | "neutral";
}

export interface ColorAccessibility {
  combination: string;        // bijv. "Primair op Wit"
  foreground: string;         // hex
  background: string;         // hex
  contrastRatio: string;      // bijv. "7.2:1"
  wcagAA: boolean;
  wcagAAA: boolean;
}

export interface ColorPalette {
  colors: ColorSwatch[];
  ratioGuideline: string;     // bijv. "60% primair, 30% secundair, 10% accent"
  accessibility: ColorAccessibility[];
}

// --- Typografie ---

export interface TypeScaleEntry {
  level: string;              // "H1", "H2", ..., "body", "small", "caption"
  fontFamily: string;
  weight: number;
  sizePx: number;
  lineHeight: string;         // bijv. "1.2"
  letterSpacing: string;      // bijv. "0px" of "-0.5px"
  usage: string;
}

export interface FontSpec {
  name: string;
  category: "display" | "body" | "accent";
  weights: number[];
  source: string;             // bijv. "Google Fonts"
  googleFontsUrl: string;
  fallback: string;           // bijv. "Georgia, serif"
  usage: string;
}

export interface Typography {
  fonts: FontSpec[];
  typeScale: TypeScaleEntry[];
  pairingRationale: string;   // waarom deze fonts samen werken
  googleFontsUrl: string;     // gecombineerde URL voor alle fonts
}

// --- Tone of Voice ---

export interface VoiceExample {
  context: string;            // bijv. "Social media post", "E-mail", "Foutmelding"
  example: string;
}

export interface ToneOfVoice {
  voiceAttributes: string[];  // bijv. ["helder", "warm", "direct", "niet corporate"]
  doList: string[];
  dontList: string[];
  tagline: string;
  boilerplate: string;        // standaard bedrijfsbeschrijving
  examples: VoiceExample[];
}

// --- Brand Voice Examples (expanded) ---

export interface BrandVoiceExamples {
  heroHeadline: string;
  subHeadline: string;
  instagramCaption: string;
  adCopy: string;
  emailSubjectLine: string;
  aboutUs: string;
  callToAction: string;
}

// --- Logo ---

export interface LogoGuidelines {
  doList: string[];
  dontList: string[];
  clearSpaceRule: string;     // bijv. "Minimaal de hoogte van de letter 'M' rondom"
  minimumSizes: {
    digitalPx: number;
    printMm: number;
  };
}

// --- Imagery & Iconografie ---

export interface ImageryGuidelines {
  photoStyle: string;
  colorTreatment: string;
  subjects: string;
  composition: string;
  doList: string[];
  dontList: string[];
}

export interface IconographyGuidelines {
  style: string;              // bijv. "line", "filled", "duotone"
  strokeWidth: string;
  cornerStyle: string;        // bijv. "rounded" of "sharp"
  colorUsage: string;
}

// --- Grafische elementen ---

export interface GraphicElements {
  description: string;
  shapes: string;
  patterns: string;
  usage: string;
}

// --- Usage Examples ---

export interface UsageExamples {
  businessCard: string;
  socialPost: string;
  emailSignature: string;
  letterhead: string;
  presentationSlide: string;
  websiteHeader: string;
  merchandise: string;
}

// --- Volledige Brand Guide ---

export interface BrandGuideResult {
  // Identificatie
  companyName: string;

  // Brand Strategy
  strategy: BrandStrategy;

  // Visuele identiteit
  colorPalette: ColorPalette;
  typography: Typography;
  imageryGuidelines: ImageryGuidelines;
  iconographyGuidelines: IconographyGuidelines;
  graphicElements: GraphicElements;

  // Tone of voice
  toneOfVoice: ToneOfVoice;
  brandVoiceExamples: BrandVoiceExamples;

  // Logo
  logoGuidelines: LogoGuidelines;

  // Toepassingen
  usageExamples: UsageExamples;

  // Generated assets (filled by code, not Claude)
  logoSvg: string;
  logoIconSvg: string;
  brandPatternSvg: string;
  logoImageUrl?: string;
  iconSvg?: string;

  // Recraft V4 logo variants (derived from primary SVG)
  logoVariants?: {
    fullColor: string;
    monoBlack: string;
    monoWhite: string;
    monoPrimary: string;
    transparent: string;
    recraftImageId?: string;
  };

  // ----- Legacy compat aliases -----
  // These mirror old flat fields so existing components keep working
  // during the migration. They are populated from the new structures.
  tagline: string;
  brandPersonality: string[];
  brandStory: string;
}

// Re-export legacy interfaces for components that import them directly
export type { FontSpec as FontPairing };
