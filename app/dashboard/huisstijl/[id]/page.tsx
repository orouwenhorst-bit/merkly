import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  LogoDownloadButton,
  PdfDownloadButton,
  PdfDownloadButtonSmall,
  CopyHexButton,
  CopyLinkButton,
  FontLoader,
} from "@/components/dashboard/HuisstijlDetailActions";
import { recolorSvgToWhite } from "@/lib/svg-processing";
import type { BrandGuideResult } from "@/types/brand";

export const dynamic = "force-dynamic";

function normalizeSvg(svg: string): string {
  return svg.replace(/<svg([^>]*)>/, (_, attrs) => {
    const cleaned = attrs
      .replace(/\s+width="[^"]*"/g, "")
      .replace(/\s+height="[^"]*"/g, "")
      .replace(/\s+style="[^"]*"/g, "");
    return `<svg${cleaned} style="width:100%;height:100%;display:block;">`;
  });
}

function isDark(hex: string) {
  const c = hex.replace("#", "");
  return (
    (parseInt(c.slice(0, 2), 16) * 299 +
      parseInt(c.slice(2, 4), 16) * 587 +
      parseInt(c.slice(4, 6), 16) * 114) /
      1000 <
    128
  );
}

const LOGO_VARIANTS = [
  { key: "fullColor", label: "Volledig kleur", bg: "#ffffff" },
  { key: "monoBlack", label: "Zwart", bg: "#ffffff" },
  { key: "monoWhite", label: "Wit", bg: "#111111" },
  { key: "monoPrimary", label: "Merkkleur", bg: "#f4f4f5" },
  {
    key: "transparent",
    label: "Transparant",
    bg: "repeating-conic-gradient(#cccccc 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px",
  },
] as const;

export default async function HuisstijlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Auth
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  if (!user) redirect(`/login?redirect=/dashboard/huisstijl/${id}`);

  // Guide ophalen
  const supabase = createServiceClient();
  const { data: guide, error } = await supabase
    .from("brand_guides")
    .select("id, company_name, industry, created_at, is_premium, user_id, result")
    .eq("id", id)
    .single();

  if (error || !guide) notFound();
  if (guide.user_id !== user.id) notFound();

  const { isPremium: isPremiumUser } = await getUserSubscription(user.id);
  const canDownload = isPremiumUser || Boolean(guide.is_premium);

  const result = guide.result as BrandGuideResult;
  const colors = result?.colorPalette?.colors ?? [];
  const primary =
    colors.find((c) => c.category === "primary")?.hex ??
    colors[0]?.hex ??
    "#8b5cf6";
  const fonts = result?.typography?.fonts ?? [];
  const fontsUrl = result?.typography?.googleFontsUrl ?? "";
  const hasLogo = !!result?.logoVariants?.fullColor;

  const createdAt = new Date(guide.created_at).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardShell active="huisstijlen">
      {/* Inject Google Fonts for typography preview */}
      {fontsUrl && <FontLoader url={fontsUrl} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link
          href="/dashboard/huisstijlen"
          className="hover:text-white transition-colors"
        >
          Huisstijlen
        </Link>
        <span>/</span>
        <span className="text-white font-medium">{guide.company_name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          {result?.logoVariants?.fullColor ? (
            <div className="w-16 h-16 rounded-xl bg-white border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
              <div
                className="w-12 h-12 [&_svg]:w-full [&_svg]:h-full"
                dangerouslySetInnerHTML={{
                  __html: normalizeSvg(result.logoVariants.fullColor),
                }}
              />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
              style={{ backgroundColor: primary }}
            >
              {guide.company_name[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {guide.company_name}
              </h1>
              {guide.is_premium && (
                <span className="inline-flex items-center gap-1 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-0.5 font-medium">
                  ✦ Premium
                </span>
              )}
            </div>
            {guide.industry && (
              <p className="text-neutral-500 text-sm mt-1">{guide.industry}</p>
            )}
            {result?.toneOfVoice?.tagline && (
              <p className="text-neutral-400 text-sm mt-1 italic">
                &ldquo;{result.toneOfVoice.tagline}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Acties */}
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Link
            href={`/result/${guide.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Online bekijken
          </Link>
          <PdfDownloadButtonSmall
            guideId={guide.id}
            companyName={guide.company_name}
            canDownload={canDownload}
          />
        </div>
      </div>

      {/* Premium upsell banner */}
      {!canDownload && (
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-neutral-900 p-5">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white mb-1">
                ✦ Upgrade naar Premium
              </p>
              <p className="text-xs text-neutral-400 max-w-md">
                Download je brand guide als PDF, alle logo-varianten (SVG) en
                gebruik de guide onbeperkt voor elk project.
              </p>
            </div>
            <Link
              href="/upgrade"
              className="shrink-0 text-sm font-semibold bg-white text-neutral-900 hover:bg-neutral-100 px-5 py-2.5 rounded-xl transition-colors"
            >
              Bekijk Premium →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linker kolom */}
        <div className="lg:col-span-2 space-y-6">

          {/* Logo varianten */}
          {hasLogo && (
            <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">
                  Logo-varianten
                </h2>
                {!canDownload && (
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Downloads vereisen Premium
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {LOGO_VARIANTS.map(({ key, label, bg }) => {
                  const svgString =
                    result?.logoVariants?.[
                      key as keyof typeof result.logoVariants
                    ];
                  if (!svgString || typeof svgString !== "string") return null;
                  return (
                    <div
                      key={key}
                      className="group relative rounded-xl border border-neutral-800 overflow-hidden flex flex-col"
                    >
                      <div
                        className="aspect-square flex items-center justify-center p-4"
                        style={{ background: bg }}
                      >
                        <div
                          className="w-3/4 h-3/4 [&_svg]:w-full [&_svg]:h-full"
                          dangerouslySetInnerHTML={{
                            __html: normalizeSvg(
                              key === "monoWhite" ? recolorSvgToWhite(svgString) : svgString
                            ),
                          }}
                        />
                      </div>
                      <div className="p-2.5 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-neutral-400 truncate">
                          {label}
                        </span>
                        <LogoDownloadButton
                          guideId={guide.id}
                          variantKey={key}
                          canDownload={canDownload}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Kleurenpalet */}
          {colors.length > 0 && (
            <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-4">
                Kleurenpalet
              </h2>
              <div className="space-y-2">
                {colors.map((color) => (
                  <div
                    key={color.hex}
                    className="flex items-center gap-4 rounded-xl border border-neutral-800 overflow-hidden"
                  >
                    <div
                      className="w-14 h-12 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1 min-w-0 py-2">
                      <p className="text-sm font-semibold text-white truncate">
                        {color.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {color.usage}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pr-4 shrink-0">
                      <span className="text-xs font-mono text-neutral-400">
                        {color.hex.toUpperCase()}
                      </span>
                      <CopyHexButton hex={color.hex} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Typografie */}
          {fonts.length > 0 && (
            <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-4">
                Typografie
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fonts.map((font) => (
                  <div
                    key={font.name}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        {font.category === "display"
                          ? "Display"
                          : font.category === "body"
                          ? "Body"
                          : "Accent"}
                      </span>
                      {font.name && (
                        <a
                          href={`https://fonts.google.com/specimen/${font.name.replace(/ /g, "+")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                        >
                          Google Fonts
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: `'${font.name}', ${font.fallback ?? "sans-serif"}`,
                      }}
                    >
                      <p className="text-4xl font-bold text-white leading-none">
                        Aa
                      </p>
                      <p
                        className="text-[11px] text-neutral-400 mt-3 leading-relaxed"
                        style={{
                          fontFamily: `'${font.name}', ${font.fallback ?? "sans-serif"}`,
                        }}
                      >
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                        <br />
                        abcdefghijklmnopqrstuvwxyz
                        <br />
                        0123456789 !@#&
                      </p>
                    </div>
                    <div className="pt-3 border-t border-neutral-800 space-y-0.5">
                      <p className="text-xs font-semibold text-white">
                        {font.name}
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        {font.usage}
                      </p>
                      <p className="text-[10px] text-neutral-600">
                        Gewichten: {font.weights?.join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {result?.typography?.pairingRationale && (
                <div className="mt-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                    Waarom deze combinatie
                  </p>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {result.typography.pairingRationale}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Rechter kolom */}
        <div className="space-y-6">

          {/* Overzicht */}
          <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">
              Overzicht
            </h2>
            <div className="space-y-3">
              {(
                [
                  { label: "Gegenereerd", value: createdAt },
                  {
                    label: "Type",
                    value: guide.is_premium ? "Premium guide" : "Gratis guide",
                  },
                  { label: "Branche", value: guide.industry ?? "—" },
                  { label: "Kleuren", value: `${colors.length} kleuren` },
                  {
                    label: "Lettertypen",
                    value:
                      fonts.length > 0
                        ? fonts.map((f) => f.name).join(" + ")
                        : "—",
                  },
                ] as { label: string; value: string }[]
              ).map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-neutral-500 shrink-0">
                    {label}
                  </span>
                  <span className="text-xs text-neutral-300 text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* PDF download */}
          <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-3">
              Brand guide PDF
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed mb-4">
              Professionele PDF met alle merkrichtlijnen: logo, kleuren,
              typografie, tone of voice, mockups en meer.
            </p>
            <PdfDownloadButton
              guideId={guide.id}
              companyName={guide.company_name}
              canDownload={canDownload}
            />
          </section>

          {/* Deel-link */}
          <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-3">
              Deel je huisstijl
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed mb-4">
              Stuur de publieke link naar klanten, medewerkers of partners.
            </p>
            <CopyLinkButton guideId={guide.id} />
          </section>

          {/* Merkstrategie */}
          {result?.strategy && (
            <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-white mb-4">
                Merkstrategie
              </h2>
              <div className="space-y-4">
                {result.strategy.mission && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                      Missie
                    </p>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {result.strategy.mission}
                    </p>
                  </div>
                )}
                {result.strategy.vision && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                      Visie
                    </p>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {result.strategy.vision}
                    </p>
                  </div>
                )}
                {result.strategy.personalityTraits?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                      Merkpersoonlijkheid
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.strategy.personalityTraits.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2.5 py-1 rounded-full border border-neutral-700 text-neutral-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
