import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-neutral-900/50 bg-neutral-950/80 backdrop-blur-xl">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-white">Merk</span>
          <span className="text-violet-400">ly</span>
        </span>
        <div className="flex items-center gap-4">
          <Link href="/generate" className="text-sm text-neutral-400 hover:text-white transition-colors">
            Probeer gratis
          </Link>
          <Link
            href="/generate"
            className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            Start nu
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-32">
        {/* Gradient glow behind heading */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-violet-600/20 via-fuchsia-500/10 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative inline-flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-full px-4 py-1.5 text-sm text-neutral-400 mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          AI-powered branding in 2 minuten
        </div>
        <h1 className="relative text-5xl sm:text-7xl font-bold tracking-tight max-w-3xl leading-tight mb-6">
          Jouw professionele
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">
            huisstijl, nu direct.
          </span>
        </h1>
        <p className="relative text-lg text-neutral-400 max-w-xl leading-relaxed mb-10">
          Geen grafisch bureau nodig. Vul 4 velden in en ontvang een complete brand guide:
          kleurenpalet, typografie, merkverhaal en tone of voice.
        </p>
        <Link
          href="/generate"
          className="relative group bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
        >
          Genereer mijn huisstijl gratis
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>
        <p className="relative text-sm text-neutral-600 mt-4">Geen account vereist. Resultaat binnen 30 seconden.</p>

        {/* Animated color swatches preview */}
        <div className="relative mt-16 flex items-center gap-3">
          {[
            { color: "bg-violet-500", delay: "delay-0" },
            { color: "bg-fuchsia-500", delay: "delay-100" },
            { color: "bg-rose-400", delay: "delay-200" },
            { color: "bg-amber-400", delay: "delay-300" },
            { color: "bg-cyan-400", delay: "delay-500" },
          ].map(({ color, delay }, i) => (
            <div
              key={i}
              className={`w-12 h-12 sm:w-16 sm:h-16 ${color} rounded-xl animate-bounce ${delay}`}
              style={{ animationDuration: "3s", animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-xs text-neutral-700 mt-3">Voorbeeld kleurenpalet</p>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 pb-32">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Hoe het werkt</h2>
        <p className="text-neutral-400 text-center mb-16 max-w-lg mx-auto">
          In drie simpele stappen van idee naar professionele huisstijl.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          {/* Connecting lines (visible on desktop) */}
          <div className="hidden sm:block absolute top-10 left-[calc(16.66%+40px)] right-[calc(16.66%+40px)] h-px bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-cyan-500/50" />

          {[
            {
              step: "1",
              title: "Vul in",
              desc: "Beantwoord 4 simpele vragen over je bedrijf, branche, stijlvoorkeur en doelgroep.",
              gradient: "from-violet-500 to-violet-600",
            },
            {
              step: "2",
              title: "AI genereert",
              desc: "Onze AI analyseert jouw input en creëert een complete, unieke merkidentiteit.",
              gradient: "from-fuchsia-500 to-fuchsia-600",
            },
            {
              step: "3",
              title: "Gebruik direct",
              desc: "Download je brand guide en begin direct met het bouwen van je merk.",
              gradient: "from-cyan-500 to-cyan-600",
            },
          ].map(({ step, title, desc, gradient }) => (
            <div key={step} className="flex flex-col items-center text-center">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl font-bold mb-6 shadow-lg`}
              >
                {step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-32 scroll-mt-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Alles wat je nodig hebt</h2>
        <p className="text-neutral-400 text-center mb-16 max-w-lg mx-auto">
          Een complete brand guide met alle elementen voor een professionele uitstraling.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Kleurenpalet",
              desc: "5 zorgvuldig gekozen kleuren die passen bij jouw branche en sfeer, met hex-codes en toepassingsregels.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                </svg>
              ),
              accent: "border-violet-500/20 hover:border-violet-500/40",
              iconBg: "bg-violet-500/10 text-violet-400",
            },
            {
              title: "Typografie",
              desc: "Een professioneel lettertype-duo van Google Fonts, met hiërarchie en toepassingsregels.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              ),
              accent: "border-fuchsia-500/20 hover:border-fuchsia-500/40",
              iconBg: "bg-fuchsia-500/10 text-fuchsia-400",
            },
            {
              title: "Merkidentiteit",
              desc: "Merkverhaal, tone of voice en merkpersoonlijkheid in begrijpelijk Nederlands.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              ),
              accent: "border-cyan-500/20 hover:border-cyan-500/40",
              iconBg: "bg-cyan-500/10 text-cyan-400",
            },
            {
              title: "Logo ontwerp",
              desc: "AI-gegenereerde logo-concepten en richtlijnen voor gebruik op verschillende achtergronden.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              ),
              accent: "border-amber-500/20 hover:border-amber-500/40",
              iconBg: "bg-amber-500/10 text-amber-400",
            },
            {
              title: "Merktoepassing",
              desc: "Mockups van visitekaartjes, briefpapier en social media zodat je direct ziet hoe je merk eruitziet.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              ),
              accent: "border-rose-500/20 hover:border-rose-500/40",
              iconBg: "bg-rose-500/10 text-rose-400",
            },
            {
              title: "Brand voice copy",
              desc: "Voorbeeldteksten voor je website, social media en e-mail die passen bij jouw merkpersoonlijkheid.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              ),
              accent: "border-emerald-500/20 hover:border-emerald-500/40",
              iconBg: "bg-emerald-500/10 text-emerald-400",
            },
          ].map(({ title, desc, icon, accent, iconBg }) => (
            <div
              key={title}
              className={`bg-neutral-900/50 border ${accent} rounded-2xl p-6 transition-all duration-300 hover:bg-neutral-900`}
            >
              <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                {icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Preview Section */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Bekijk het resultaat</h2>
        <p className="text-neutral-400 text-center mb-16 max-w-lg mx-auto">
          Dit is wat je krijgt: een complete, downloadbare brand guide.
        </p>
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Fake brand guide header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold">
              B
            </div>
            <div>
              <p className="font-semibold text-lg">Bloom Bakery</p>
              <p className="text-xs text-neutral-500">Brand Guide - gegenereerd door Merkly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Color palette */}
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Kleurenpalet</p>
              <div className="flex gap-2">
                {[
                  { bg: "bg-indigo-600", label: "#4F46E5" },
                  { bg: "bg-violet-500", label: "#8B5CF6" },
                  { bg: "bg-fuchsia-400", label: "#E879F9" },
                  { bg: "bg-slate-100", label: "#F1F5F9" },
                  { bg: "bg-slate-800", label: "#1E293B" },
                ].map(({ bg, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${bg}`} />
                    <span className="text-[10px] text-neutral-600 font-mono">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Typografie</p>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold tracking-tight">Playfair Display</p>
                  <p className="text-xs text-neutral-600">Koppen - serif, elegant</p>
                </div>
                <div>
                  <p className="text-base text-neutral-300">Inter - body tekst</p>
                  <p className="text-xs text-neutral-600">Broodtekst - sans-serif, modern</p>
                </div>
              </div>
            </div>

            {/* Brand story excerpt */}
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Merkverhaal</p>
              <p className="text-sm text-neutral-400 leading-relaxed italic">
                &ldquo;Bloom Bakery staat voor ambachtelijke kwaliteit met een moderne twist.
                Elk product wordt met liefde bereid en vertelt het verhaal van seizoenen en
                lokale ingrediënten...&rdquo;
              </p>
            </div>

            {/* Tone of voice */}
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Tone of Voice</p>
              <div className="flex flex-wrap gap-2">
                {["Warm", "Ambachtelijk", "Toegankelijk", "Persoonlijk"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-between">
            <p className="text-xs text-neutral-600">Voorbeeld brand guide - dit is wat je ontvangt</p>
            <Link
              href="/generate"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              Maak jouw versie &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-4xl mx-auto px-6 pb-32 text-center">
        <p className="text-sm text-neutral-500 uppercase tracking-widest mb-4">Social proof</p>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Vertrouwd door 500+ ondernemers</h2>
        <div className="flex items-center justify-center gap-1 mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-sm text-neutral-400 ml-2">4.9/5 gemiddelde beoordeling</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              quote: "Binnen 2 minuten had ik een complete huisstijl die er professioneel uitziet. Mijn grafisch ontwerper was verbaasd.",
              name: "Lisa de Vries",
              role: "Eigenaar, Bloom Studio",
            },
            {
              quote: "Perfect voor startups. We hebben duizenden euro's bespaard op branding en het resultaat is top.",
              name: "Mark Jansen",
              role: "Co-founder, TechFlow",
            },
            {
              quote: "De tone of voice en het merkverhaal waren verrassend goed. Alsof iemand echt mijn bedrijf kent.",
              name: "Sophie Bakker",
              role: "Freelancer, SB Design",
            },
          ].map(({ quote, name, role }) => (
            <div
              key={name}
              className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 text-left"
            >
              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
              <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-neutral-500">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-3xl mx-auto px-6 pb-32 scroll-mt-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Eenvoudige prijzen</h2>
        <p className="text-neutral-400 text-center mb-12 max-w-md mx-auto">
          Begin gratis. Upgrade wanneer je meer nodig hebt.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
            <p className="text-sm text-neutral-400 mb-1">Gratis</p>
            <p className="text-4xl font-bold mb-1">€0</p>
            <p className="text-sm text-neutral-600 mb-6">Voor altijd gratis</p>
            <ul className="space-y-2.5 text-sm text-neutral-400 mb-8">
              {[
                "Kleurenpalet & typografie",
                "Merkverhaal & tone of voice",
                "Logo-richtlijnen",
                "3 generaties per maand",
              ].map((f) => (
                <li key={f} className="flex gap-2.5 items-start">
                  <svg className="w-4 h-4 text-neutral-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/generate"
              className="block text-center w-full py-3 border border-neutral-700 rounded-xl hover:border-neutral-500 transition-colors text-sm font-medium"
            >
              Start gratis
            </Link>
          </div>

          <div className="relative bg-white text-black rounded-2xl p-8">
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg">
                Meest gekozen
              </span>
            </div>
            <p className="text-sm text-neutral-600 mb-1">Premium</p>
            <p className="text-4xl font-bold mb-1">
              €14<span className="text-lg font-normal text-neutral-500"> eenmalig</span>
            </p>
            <p className="text-sm text-neutral-500 mb-6">Per brand guide · levenslang toegang</p>
            <ul className="space-y-2.5 text-sm text-neutral-600 mb-8">
              {[
                "Alles uit gratis",
                "Download als PDF",
                "Social media templates",
                "Logo-varianten (SVG/PNG)",
                "Onbeperkt genereren",
                "Opslaan in dashboard",
              ].map((f) => (
                <li key={f} className="flex gap-2.5 items-start">
                  <svg className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/generate"
              className="block text-center w-full py-3 bg-black text-white rounded-xl hover:bg-neutral-900 transition-colors text-sm font-medium"
            >
              Start Premium
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-4xl mx-auto px-6 pb-32">
        <div className="relative bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
          <h2 className="relative text-3xl sm:text-4xl font-bold mb-4">
            Klaar om je merk te bouwen?
          </h2>
          <p className="relative text-neutral-400 mb-8 max-w-md mx-auto">
            Sluit je aan bij 500+ ondernemers die hun professionele huisstijl hebben
            gegenereerd met Merkly.
          </p>
          <Link
            href="/generate"
            className="relative inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
          >
            Begin nu gratis &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 px-8 py-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <span className="font-bold tracking-tight">
              <span className="text-white">Merk</span>
              <span className="text-violet-400">ly</span>
            </span>
            <span className="text-sm text-neutral-600">AI-powered brand guides</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link href="/generate" className="hover:text-white transition-colors">
              Generator
            </Link>
            <Link href="#features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-white transition-colors">
              Prijzen
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-neutral-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-700">&copy; 2026 Merkly. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-4 text-xs text-neutral-700">
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">
              Privacybeleid
            </Link>
            <Link href="/voorwaarden" className="hover:text-neutral-400 transition-colors">
              Algemene voorwaarden
            </Link>
            <Link href="/cookies" className="hover:text-neutral-400 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
