"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type {
  FontSpec,
  TypeScaleEntry,
  ColorSwatch,
  BrandStrategy,
  ToneOfVoice,
} from "@/types/brand";

/* ─────────────────────────── Shared building blocks ─────────────────────── */

type Phase = "idle" | "describing" | "loading" | "cycling" | "saving";

function Spinner({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin shrink-0`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/** Pill-style trigger button — matches LogoRegenerateButton / SloganCycler look */
function PillButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-300 hover:text-violet-200 border border-violet-500/30 hover:border-violet-400/50 rounded-full px-2.5 py-1 transition-colors disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Premium-locked stand-in shown when the user isn't on a paid plan */
function PremiumPill({ label }: { label: string }) {
  return (
    <a
      href="/upgrade"
      className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-1 transition-colors"
    >
      ✦ {label}
    </a>
  );
}

/** Wrapper card for the "describe what you want" step. */
function DescribeCard({
  title,
  placeholder,
  description,
  setDescription,
  onSubmit,
  onCancel,
  extraFields,
}: {
  title: string;
  placeholder: string;
  description: string;
  setDescription: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  extraFields?: ReactNode;
}) {
  return (
    <div className="w-full mt-3 bg-neutral-900 border border-violet-500/30 rounded-xl p-4 space-y-3">
      <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
        {title}
      </p>
      {extraFields}
      <div>
        <label className="block text-[10px] text-neutral-400 mb-1.5">
          Wensen / richting <span className="text-neutral-600">(optioneel)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder}
          rows={2}
          maxLength={160}
          className="w-full bg-neutral-800 border border-neutral-700 focus:border-violet-500/60 rounded-lg px-3 py-2 text-[11px] text-neutral-200 placeholder:text-neutral-600 resize-none outline-none transition-colors"
        />
        <p className="text-right text-[9px] text-neutral-600 mt-0.5">
          {description.length}/160
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          className="flex-1 text-[11px] font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2 transition-colors"
        >
          ↻ Genereer alternatieven
        </button>
        <button
          onClick={onCancel}
          className="text-[11px] text-neutral-500 hover:text-neutral-300 border border-neutral-700 rounded-lg px-3 py-2 transition-colors"
        >
          Annuleer
        </button>
      </div>
    </div>
  );
}

/** Cycler control bar (vorige / volgende / gebruik / annuleer). */
function CyclerControls({
  index,
  total,
  onPrev,
  onNext,
  onApply,
  onCancel,
  saving,
  applyLabel = "Gebruik deze ✓",
}: {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onApply: () => void;
  onCancel: () => void;
  saving: boolean;
  applyLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mr-1">
        {index + 1} / {total}
      </span>
      <button
        onClick={onPrev}
        disabled={saving}
        className="text-[11px] text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-600 rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
      >
        ← Vorige
      </button>
      <button
        onClick={onNext}
        disabled={saving}
        className="text-[11px] text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-600 rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
      >
        Volgende →
      </button>
      <button
        onClick={onApply}
        disabled={saving}
        className="text-[11px] font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
      >
        {saving && <Spinner />}
        {saving ? "Opslaan..." : applyLabel}
      </button>
      <button
        onClick={onCancel}
        disabled={saving}
        className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors ml-auto disabled:opacity-50"
      >
        Annuleren
      </button>
    </div>
  );
}

/** Generic regenerator hook handling the phase state machine + API calls. */
function useRegenerator<TOption>({
  generateUrl,
  applyUrl,
  responseKey,
  buildApplyBody,
  onApplied,
}: {
  generateUrl: string;
  applyUrl: string;
  responseKey: string;
  buildApplyBody: (option: TOption) => unknown;
  onApplied?: () => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [options, setOptions] = useState<TOption[]>([]);
  const [index, setIndex] = useState(0);
  const [description, setDescription] = useState("");

  async function generate(extraBody: Record<string, unknown> = {}) {
    setPhase("loading");
    try {
      const res = await fetch(generateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userHint: description.trim() || undefined,
          ...extraBody,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = data[responseKey] as TOption[];
      if (!Array.isArray(list) || list.length === 0) throw new Error();
      setOptions(list);
      setIndex(0);
      setPhase("cycling");
    } catch {
      alert("Genereren mislukt. Probeer het opnieuw.");
      setPhase("idle");
    }
  }

  async function apply(option: TOption) {
    setPhase("saving");
    try {
      const res = await fetch(applyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildApplyBody(option)),
      });
      if (!res.ok) throw new Error();
      onApplied?.();
      router.refresh();
      setPhase("idle");
      setOptions([]);
      setDescription("");
    } catch {
      alert("Opslaan mislukt. Probeer het opnieuw.");
      setPhase("cycling");
    }
  }

  return {
    phase,
    setPhase,
    options,
    index,
    setIndex,
    description,
    setDescription,
    generate,
    apply,
  };
}

/* ─────────────────────────── Typography regenerator ─────────────────────── */

interface FontPairing {
  fonts: FontSpec[];
  typeScale: TypeScaleEntry[];
  pairingRationale: string;
  googleFontsUrl: string;
}

export function TypographyRegenerator({
  guideId,
  isPremiumUser,
}: {
  guideId: string;
  isPremiumUser: boolean;
}) {
  const r = useRegenerator<FontPairing>({
    generateUrl: `/api/guides/${guideId}/regenerate-typography`,
    applyUrl: `/api/guides/${guideId}/apply-typography`,
    responseKey: "pairings",
    buildApplyBody: (p) => p,
  });

  if (!isPremiumUser) return <PremiumPill label="Nieuwe fonts" />;

  if (r.phase === "describing") {
    return (
      <DescribeCard
        title="Nieuwe typografie genereren"
        placeholder="bijv. moderner, meer serif-karakter, minder formeel…"
        description={r.description}
        setDescription={r.setDescription}
        onSubmit={() => r.generate()}
        onCancel={() => r.setPhase("idle")}
      />
    );
  }

  if (r.phase === "loading") {
    return (
      <button disabled className="inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-1 opacity-60">
        <Spinner /> Genereren...
      </button>
    );
  }

  if (r.phase === "cycling" || r.phase === "saving") {
    const current = r.options[r.index];
    if (!current) return null;
    const display = current.fonts.find((f) => f.category === "display") ?? current.fonts[0];
    const body = current.fonts.find((f) => f.category === "body") ?? current.fonts[1] ?? display;

    return (
      <div className="w-full mt-3 bg-neutral-900 border border-violet-500/30 rounded-xl p-4 space-y-4">
        {/* Inject Google Fonts for this preview */}
        {current.googleFontsUrl && (
          // eslint-disable-next-line @next/next/no-css-tags
          <link rel="stylesheet" href={current.googleFontsUrl} />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[display, body].map((font, i) => (
            <div
              key={`${font.name}-${i}`}
              className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2"
            >
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                {font.category === "display" ? "Display" : "Body"}
              </p>
              <p
                className="text-3xl font-bold text-white leading-none"
                style={{ fontFamily: `'${font.name}', ${font.fallback}` }}
              >
                Aa
              </p>
              <p
                className="text-[11px] text-neutral-300 leading-relaxed"
                style={{ fontFamily: `'${font.name}', ${font.fallback}` }}
              >
                The quick brown fox jumps over the lazy dog. 0123456789
              </p>
              <p className="text-xs font-semibold text-white pt-2 border-t border-neutral-800">
                {font.name}
              </p>
            </div>
          ))}
        </div>
        {current.pairingRationale && (
          <p className="text-[11px] text-neutral-400 leading-relaxed italic">
            {current.pairingRationale}
          </p>
        )}
        <CyclerControls
          index={r.index}
          total={r.options.length}
          onPrev={() => r.setIndex((i) => (i - 1 + r.options.length) % r.options.length)}
          onNext={() => r.setIndex((i) => (i + 1) % r.options.length)}
          onApply={() => r.apply(current)}
          onCancel={() => r.setPhase("idle")}
          saving={r.phase === "saving"}
          applyLabel="Gebruik deze fonts ✓"
        />
      </div>
    );
  }

  return (
    <PillButton onClick={() => r.setPhase("describing")}>
      ↻ Nieuwe fonts
    </PillButton>
  );
}

/* ─────────────────────────── Color palette regenerator ──────────────────── */

interface PaletteOption {
  label?: string;
  ratioGuideline?: string;
  colors: ColorSwatch[];
}

export function ColorPaletteRegenerator({
  guideId,
  isPremiumUser,
}: {
  guideId: string;
  isPremiumUser: boolean;
}) {
  const [keepPrimary, setKeepPrimary] = useState(false);
  const r = useRegenerator<PaletteOption>({
    generateUrl: `/api/guides/${guideId}/regenerate-colors`,
    applyUrl: `/api/guides/${guideId}/apply-colors`,
    responseKey: "palettes",
    buildApplyBody: (p) => p,
  });

  if (!isPremiumUser) return <PremiumPill label="Nieuw palet" />;

  if (r.phase === "describing") {
    return (
      <DescribeCard
        title="Nieuw kleurenpalet genereren"
        placeholder="bijv. warmer, aardetinten, minder paars…"
        description={r.description}
        setDescription={r.setDescription}
        onSubmit={() => r.generate({ keepPrimary })}
        onCancel={() => r.setPhase("idle")}
        extraFields={
          <label className="flex items-center gap-2 text-[11px] text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={keepPrimary}
              onChange={(e) => setKeepPrimary(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-violet-500"
            />
            Behoud huidige primaire kleur
          </label>
        }
      />
    );
  }

  if (r.phase === "loading") {
    return (
      <button disabled className="inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-1 opacity-60">
        <Spinner /> Genereren...
      </button>
    );
  }

  if (r.phase === "cycling" || r.phase === "saving") {
    const current = r.options[r.index];
    if (!current) return null;
    return (
      <div className="w-full mt-3 bg-neutral-900 border border-violet-500/30 rounded-xl p-4 space-y-3">
        {current.label && (
          <p className="text-xs font-semibold text-white">{current.label}</p>
        )}
        <div className="flex h-12 rounded-xl overflow-hidden border border-neutral-800">
          {current.colors.map((c, i) => (
            <div
              key={`${c.hex}-${i}`}
              title={`${c.name} ${c.hex}`}
              className="flex-1"
              style={{ background: c.hex }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {current.colors.map((c, i) => (
            <div
              key={`${c.hex}-${i}-l`}
              className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5"
            >
              <div
                className="w-4 h-4 rounded shrink-0 border border-black/20"
                style={{ background: c.hex }}
              />
              <div className="min-w-0">
                <p className="text-[10px] text-white font-medium truncate">{c.name}</p>
                <p className="text-[9px] text-neutral-500 font-mono">
                  {c.hex.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
        {current.ratioGuideline && (
          <p className="text-[10px] text-neutral-500">
            Verhouding: {current.ratioGuideline}
          </p>
        )}
        <CyclerControls
          index={r.index}
          total={r.options.length}
          onPrev={() => r.setIndex((i) => (i - 1 + r.options.length) % r.options.length)}
          onNext={() => r.setIndex((i) => (i + 1) % r.options.length)}
          onApply={() => r.apply(current)}
          onCancel={() => r.setPhase("idle")}
          saving={r.phase === "saving"}
          applyLabel="Gebruik dit palet ✓"
        />
      </div>
    );
  }

  return (
    <PillButton onClick={() => r.setPhase("describing")}>
      ↻ Nieuw palet
    </PillButton>
  );
}

/* ─────────────────────────── Strategy regenerator ───────────────────────── */

type StrategyOption = Pick<
  BrandStrategy,
  "mission" | "vision" | "brandStory" | "personalityTraits" | "personalityDescription"
>;

export function StrategyRegenerator({
  guideId,
  isPremiumUser,
}: {
  guideId: string;
  isPremiumUser: boolean;
}) {
  const r = useRegenerator<StrategyOption>({
    generateUrl: `/api/guides/${guideId}/regenerate-strategy`,
    applyUrl: `/api/guides/${guideId}/apply-strategy`,
    responseKey: "strategies",
    buildApplyBody: (s) => s,
  });

  if (!isPremiumUser) return <PremiumPill label="Nieuwe strategie" />;

  if (r.phase === "describing") {
    return (
      <DescribeCard
        title="Nieuwe merkstrategie genereren"
        placeholder="bijv. ambitieuzer, minder corporate, focus op duurzaamheid…"
        description={r.description}
        setDescription={r.setDescription}
        onSubmit={() => r.generate()}
        onCancel={() => r.setPhase("idle")}
      />
    );
  }

  if (r.phase === "loading") {
    return (
      <button disabled className="inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-1 opacity-60">
        <Spinner /> Genereren...
      </button>
    );
  }

  if (r.phase === "cycling" || r.phase === "saving") {
    const current = r.options[r.index];
    if (!current) return null;
    return (
      <div className="w-full mt-3 bg-neutral-900 border border-violet-500/30 rounded-xl p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
              Missie
            </p>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {current.mission}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
              Visie
            </p>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {current.vision}
            </p>
          </div>
          {current.brandStory && (
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                Merkverhaal
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed italic">
                {current.brandStory}
              </p>
            </div>
          )}
          {current.personalityTraits?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                Merkpersoonlijkheid
              </p>
              <div className="flex flex-wrap gap-1.5">
                {current.personalityTraits.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="text-[10px] px-2.5 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {current.personalityDescription && (
                <p className="text-[11px] text-neutral-400 leading-relaxed mt-2">
                  {current.personalityDescription}
                </p>
              )}
            </div>
          )}
        </div>
        <CyclerControls
          index={r.index}
          total={r.options.length}
          onPrev={() => r.setIndex((i) => (i - 1 + r.options.length) % r.options.length)}
          onNext={() => r.setIndex((i) => (i + 1) % r.options.length)}
          onApply={() => r.apply(current)}
          onCancel={() => r.setPhase("idle")}
          saving={r.phase === "saving"}
          applyLabel="Gebruik deze strategie ✓"
        />
      </div>
    );
  }

  return (
    <PillButton onClick={() => r.setPhase("describing")}>
      ↻ Nieuwe strategie
    </PillButton>
  );
}

/* ─────────────────────────── Tone of voice regenerator ──────────────────── */

type ToneOption = Pick<
  ToneOfVoice,
  "voiceAttributes" | "doList" | "dontList" | "boilerplate"
>;

export function ToneRegenerator({
  guideId,
  isPremiumUser,
}: {
  guideId: string;
  isPremiumUser: boolean;
}) {
  const r = useRegenerator<ToneOption>({
    generateUrl: `/api/guides/${guideId}/regenerate-tone`,
    applyUrl: `/api/guides/${guideId}/apply-tone`,
    responseKey: "tones",
    buildApplyBody: (t) => t,
  });

  if (!isPremiumUser) return <PremiumPill label="Nieuwe tone of voice" />;

  if (r.phase === "describing") {
    return (
      <DescribeCard
        title="Nieuwe tone of voice genereren"
        placeholder="bijv. directer, minder formeel, jonger publiek…"
        description={r.description}
        setDescription={r.setDescription}
        onSubmit={() => r.generate()}
        onCancel={() => r.setPhase("idle")}
      />
    );
  }

  if (r.phase === "loading") {
    return (
      <button disabled className="inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-1 opacity-60">
        <Spinner /> Genereren...
      </button>
    );
  }

  if (r.phase === "cycling" || r.phase === "saving") {
    const current = r.options[r.index];
    if (!current) return null;
    return (
      <div className="w-full mt-3 bg-neutral-900 border border-violet-500/30 rounded-xl p-4 space-y-4">
        <div>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
            Stem-attributen
          </p>
          <div className="flex flex-wrap gap-1.5">
            {current.voiceAttributes.map((a, i) => (
              <span
                key={`${a}-${i}`}
                className="text-[10px] px-2.5 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-200"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
              Wel doen
            </p>
            <ul className="space-y-1">
              {current.doList.map((item, i) => (
                <li key={i} className="text-[11px] text-neutral-300 leading-relaxed">
                  ✓ {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">
              Niet doen
            </p>
            <ul className="space-y-1">
              {current.dontList.map((item, i) => (
                <li key={i} className="text-[11px] text-neutral-300 leading-relaxed">
                  ✕ {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {current.boilerplate && (
          <div>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
              Boilerplate
            </p>
            <p className="text-[11px] text-neutral-400 leading-relaxed italic">
              &ldquo;{current.boilerplate}&rdquo;
            </p>
          </div>
        )}
        <CyclerControls
          index={r.index}
          total={r.options.length}
          onPrev={() => r.setIndex((i) => (i - 1 + r.options.length) % r.options.length)}
          onNext={() => r.setIndex((i) => (i + 1) % r.options.length)}
          onApply={() => r.apply(current)}
          onCancel={() => r.setPhase("idle")}
          saving={r.phase === "saving"}
          applyLabel="Gebruik deze tone ✓"
        />
      </div>
    );
  }

  return (
    <PillButton onClick={() => r.setPhase("describing")}>
      ↻ Nieuwe tone of voice
    </PillButton>
  );
}
