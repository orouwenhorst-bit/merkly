import { BrandGuideResult } from "@/types/brand";
import type { GuideCardData } from "@/components/dashboard/GuideCard";

type GuideRow = {
  id: string;
  company_name: string;
  industry: string | null;
  created_at: string;
  is_premium: boolean | null;
  result: Partial<BrandGuideResult> | null;
};

/**
 * Convert a raw `brand_guides` row into the lightweight shape expected by
 * <GuideCard>. Pulls out up to 5 hex colors and the tagline.
 */
export function toGuideCardData(row: GuideRow): GuideCardData {
  const colors =
    row.result?.colorPalette?.colors
      ?.slice(0, 5)
      .map((c) => c.hex)
      .filter((h): h is string => typeof h === "string" && h.startsWith("#")) ?? [];

  return {
    id: row.id,
    companyName: row.company_name,
    industry: row.industry,
    createdAt: row.created_at,
    isPremium: Boolean(row.is_premium),
    colors,
    tagline: row.result?.tagline || row.result?.toneOfVoice?.tagline || null,
    logoSvg: null, // keep cards light; logo is shown on the result page
  };
}
