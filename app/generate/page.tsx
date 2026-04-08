"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const INDUSTRIES = [
  "Horeca & Food",
  "Technologie & Software",
  "Mode & Lifestyle",
  "Zorg & Welzijn",
  "Bouw & Vastgoed",
  "Consultancy & Advies",
  "Creatief & Design",
  "Retail & E-commerce",
  "Sport & Fitness",
  "Financieel & Verzekeringen",
  "Onderwijs & Training",
  "Non-profit & Sociaal",
  "Anders",
];

const MOODS = [
  "Professioneel en betrouwbaar",
  "Speels en energiek",
  "Luxe en exclusief",
  "Duurzaam en bewust",
  "Minimalistisch en modern",
  "Warm en persoonlijk",
  "Gedurfd en innovatief",
  "Stoer en krachtig",
];

const GENERATION_STEPS = [
  { label: "Merkidentiteit analyseren", duration: 3000 },
  { label: "Kleurenpalet samenstellen", duration: 5000 },
  { label: "Typografie selecteren", duration: 4000 },
  { label: "Merkverhaal schrijven", duration: 5000 },
  { label: "Logo ontwerpen", duration: 8000 },
  { label: "Mockups genereren", duration: 4000 },
  { label: "Brand guide afronden", duration: 3000 },
];

function ProgressOverlay({ companyName }: { companyName: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    let stepTimer: ReturnType<typeof setTimeout>;
    let progressInterval: ReturnType<typeof setInterval>;

    function advanceStep() {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= GENERATION_STEPS.length) return prev;
        setStepProgress(0);
        return next;
      });
    }

    progressInterval = setInterval(() => {
      setStepProgress((prev) => Math.min(prev + 2, 100));
    }, GENERATION_STEPS[currentStep]?.duration / 50 || 100);

    stepTimer = setTimeout(advanceStep, GENERATION_STEPS[currentStep]?.duration || 5000);

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressInterval);
    };
  }, [currentStep]);

  const totalProgress = Math.round(
    ((currentStep + stepProgress / 100) / GENERATION_STEPS.length) * 100
  );

  return (
    <div className="fixed inset-0 bg-neutral-950 z-50 flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-violet-600/15 via-fuchsia-500/10 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 text-center">
        {/* Animated logo shape */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {companyName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">{companyName}</h2>
          <p className="text-neutral-500 text-sm mt-1">Huisstijl wordt gegenereerd</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <p className="text-xs text-neutral-600">{totalProgress}%</p>
        </div>

        {/* Steps */}
        <div className="space-y-2.5 text-left">
          {GENERATION_STEPS.map((step, i) => (
            <div
              key={step.label}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                i < currentStep
                  ? "text-neutral-500"
                  : i === currentStep
                  ? "text-white"
                  : "text-neutral-700"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {i < currentStep ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : i === currentStep ? (
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-neutral-700" />
                )}
              </div>
              {step.label}
              {i === currentStep && (
                <span className="text-neutral-600 text-xs ml-auto">bezig...</span>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-neutral-600 pt-4">
          Dit duurt ongeveer 30 seconden. Je brand guide bevat kleuren, typografie,
          merkverhaal, logo en mockups.
        </p>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    mood: "",
    targetAudience: "",
    description: "",
    values: "",
    preferredColor: "",
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        router.push(`/result/${data.id}`);
      } catch (err) {
        console.error("Generate error:", err);
        setLoading(false);
        setError("Er ging iets mis bij het genereren. Probeer het opnieuw.");
      }
    },
    [form, router]
  );

  const isFormValid = form.companyName && form.industry && form.mood && form.targetAudience;

  return (
    <>
      {loading && <ProgressOverlay companyName={form.companyName} />}

      <main className="min-h-screen bg-neutral-950 text-white overflow-x-hidden">
        {/* Nav */}
        <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-5 border-b border-neutral-900/50 bg-neutral-950/80 backdrop-blur-xl">
          <a href="/" className="text-xl font-bold tracking-tight">
            <span className="text-white">Brand</span>
            <span className="text-violet-400">Forge</span>
          </a>
          <a href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
            ← Terug
          </a>
        </nav>

        <div className="relative flex items-center justify-center px-6 py-12 sm:py-16">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-br from-violet-600/10 via-fuchsia-500/5 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="relative w-full max-w-xl space-y-8">
            {/* Header */}
            <div className="space-y-3 text-center">
              <div className="inline-flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-full px-4 py-1.5 text-xs text-neutral-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                AI-powered branding
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Vertel ons over je{" "}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  merk
                </span>
              </h1>
              <p className="text-neutral-400 text-sm max-w-md mx-auto">
                Hoe meer je ons vertelt, hoe beter je huisstijl wordt. De velden met * zijn verplicht.
              </p>
            </div>

            {/* Form card */}
            <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Row 1: Naam + Branche */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Bedrijfsnaam <span className="text-violet-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="bijv. Studio Bloom"
                    className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all placeholder:text-neutral-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Branche <span className="text-violet-400">*</span>
                  </label>
                  <select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all appearance-none"
                    required
                  >
                    <option value="">Kies een branche</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sfeer dropdown */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Gewenste sfeer <span className="text-violet-400">*</span>
                </label>
                <select
                  value={form.mood}
                  onChange={(e) => setForm({ ...form, mood: e.target.value })}
                  className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all appearance-none"
                  required
                >
                  <option value="">Kies een sfeer/uitstraling</option>
                  {MOODS.map((mood) => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>

              {/* Doelgroep */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Doelgroep <span className="text-violet-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  placeholder="bijv. Jonge professionals 25-40 die bewust leven"
                  className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all placeholder:text-neutral-600"
                  required
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-neutral-800" />
                <span className="text-xs text-neutral-600">Optioneel — voor een beter resultaat</span>
                <div className="flex-1 h-px bg-neutral-800" />
              </div>

              {/* Beschrijving */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Beschrijf je bedrijf
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Wat doet je bedrijf? Wat maakt jullie uniek? Wat is jullie missie?"
                  rows={3}
                  className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all placeholder:text-neutral-600 resize-none"
                />
              </div>

              {/* Kernwaarden */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Kernwaarden
                </label>
                <input
                  type="text"
                  value={form.values}
                  onChange={(e) => setForm({ ...form, values: e.target.value })}
                  placeholder="bijv. Duurzaamheid, innovatie, kwaliteit"
                  className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all placeholder:text-neutral-600"
                />
              </div>

              {/* Voorkeurskleur */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Voorkeurskleur
                  <span className="ml-2 text-xs font-normal text-neutral-500">— optioneel, bouwt het palet hieromheen</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { hex: "", label: "Geen" },
                    { hex: "#7C3AED", label: "Violet" },
                    { hex: "#2563EB", label: "Blauw" },
                    { hex: "#0F766E", label: "Teal" },
                    { hex: "#15803D", label: "Groen" },
                    { hex: "#CA8A04", label: "Oker" },
                    { hex: "#EA580C", label: "Oranje" },
                    { hex: "#DC2626", label: "Rood" },
                    { hex: "#DB2777", label: "Roze" },
                    { hex: "#1F2937", label: "Antraciet" },
                  ].map((swatch) => {
                    const selected = form.preferredColor === swatch.hex;
                    return (
                      <button
                        key={swatch.label}
                        type="button"
                        onClick={() => setForm({ ...form, preferredColor: swatch.hex })}
                        title={swatch.label}
                        aria-label={swatch.label}
                        className={`w-9 h-9 rounded-lg border transition-all ${
                          selected
                            ? "border-white ring-2 ring-violet-400/60 scale-105"
                            : "border-neutral-700/60 hover:border-neutral-500"
                        } ${swatch.hex === "" ? "bg-neutral-800/50" : ""}`}
                        style={swatch.hex ? { backgroundColor: swatch.hex } : undefined}
                      >
                        {swatch.hex === "" && (
                          <span className="text-[10px] text-neutral-400">aut</span>
                        )}
                      </button>
                    );
                  })}
                  <label className="flex items-center gap-2 ml-2 text-xs text-neutral-400">
                    <span>of eigen:</span>
                    <input
                      type="color"
                      value={form.preferredColor || "#7C3AED"}
                      onChange={(e) => setForm({ ...form, preferredColor: e.target.value })}
                      className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-neutral-700/60"
                    />
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold py-4 rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-base shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
            >
              Genereer mijn huisstijl →
            </button>

            <p className="text-xs text-neutral-600 text-center">
              Je ontvangt: kleurenpalet · typografie · logo · merkverhaal · mockups · brand voice copy
            </p>
          </form>
        </div>
      </main>
    </>
  );
}
