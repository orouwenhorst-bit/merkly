export interface BrandInput {
  companyName: string;
  industry: string;
  mood: string;
  targetAudience: string;
  description?: string;
  values?: string;
  logoUrl?: string;
  preferredColor?: string; // optional hex color the user wants the palette to revolve around
}

export interface ColorSwatch {
  name: string;
  hex: string;
  rgb: string;
  usage: string;
}

export interface FontPairing {
  displayFont: string;
  bodyFont: string;
  displayUsage: string;
  bodyUsage: string;
  googleFontsUrl: string;
}

export interface BrandVoiceExamples {
  heroHeadline: string;
  subHeadline: string;
  instagramCaption: string;
  adCopy: string;
  emailSubjectLine: string;
  aboutUs: string;
  callToAction: string;
}

export interface BrandGuideResult {
  logoImageUrl?: string;     // DALL-E generated logo (legacy fallback)
  iconSvg?: string;          // Lucide-style inline SVG icon (preferred)
  companyName: string;
  tagline: string;
  brandPersonality: string[];
  brandStory: string;
  toneOfVoice: string;
  colorPalette: ColorSwatch[];
  typography: FontPairing;
  logoSvg: string;
  logoIconSvg: string;
  brandPatternSvg: string;
  brandVoiceExamples: BrandVoiceExamples;
  logoGuidelines: {
    doList: string[];
    dontList: string[];
  };
  usageExamples: {
    businessCard: string;
    socialPost: string;
    emailSignature: string;
  };
}
