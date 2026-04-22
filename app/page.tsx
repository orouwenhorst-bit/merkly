import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import { createServerClient } from "@/lib/supabase";
import { getUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isPremium = user ? (await getUserSubscription(user.id)).isPremium : false;

  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-neutral-900/50 bg-neutral-950/80 backdrop-blur-xl">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-white">Merk</span>
          <span className="text-violet-400">ly</span>
        </span>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="#features" className="hidden sm:block text-sm text-neutral-400 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#premium" className="hidden sm:block text-sm text-neutral-400 hover:text-white transition-colors">
            Premium
          </Link>
          <Link href="#pricing" className="hidden sm:block text-sm text-neutral-400 hover:text-white transition-colors">
            Prijzen
          </Link>
          {(!user || !isPremium) && (
            <Link href="/generate" className="hidden sm:inline text-sm text-neutral-400 hover:text-white transition-colors">
              {user ? "Genereer" : "Probeer gratis"}
            </Link>
          )}
          {user && isPremium && (
            <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Dashboard
            </Link>
          )}
          <AuthButton />
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-28">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-br from-violet-600/25 via-fuchsia-500/15 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative inline-flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-full px-4 py-1.5 text-sm text-neutral-400 mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          AI-powered branding in 2 minuten
        </div>

        <h1 className="relative text-5xl sm:text-7xl font-bold tracking-tight max-w-3xl leading-[1.05] mb-6">
          Jouw professionele
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">
            huisstijl, nu direct.
          </span>
        </h1>

        <p className="relative text-lg text-neutral-400 max-w-xl leading-relaxed mb-10">
          Geen grafisch bureau nodig. Beschrijf je merk en ontvang binnen een minuut
          een complete brand guide: kleurenpalet, typografie, logo, merkverhaal en meer.
        </p>

        <div className="relative flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/generate"
            className="group bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
          >
            Genereer mijn huisstijl gratis
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
          <Link
            href="#premium"
            className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="text-violet-400">✦</span>
            Bekijk Premium features
          </Link>
        </div>
        <p className="relative text-sm text-neutral-600 mt-4">Geen account nodig &middot; Gratis te proberen</p>

        {/* Kleurenswatch preview */}
        <div className="relative mt-16 flex items-center gap-3">
          {[
            { color: "bg-violet-500" },
            { color: "bg-fuchsia-500" },
            { color: "bg-rose-400" },
            { color: "bg-amber-400" },
            { color: "bg-cyan-400" },
          ].map(({ color }, i) => (
            <div
              key={i}
              className={`w-12 h-12 sm:w-16 sm:h-16 ${color} rounded-xl animate-bounce`}
              style={{ animationDuration: "3s", animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-xs text-neutral-700 mt-3">Voorbeeld kleurenpalet</p>
      </section>

      {/* ── Hoe het werkt ── */}
      <section className="max-w-4xl mx-auto px-6 pb-28">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Hoe het werkt</h2>
        <p className="text-neutral-400 text-center mb-16 max-w-lg mx-auto">
          In drie simpele stappen van idee naar professionele merkidentiteit.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          <div className="hidden sm:block absolute top-10 left-[calc(16.66%+40px)] right-[calc(16.66%+40px)] h-px bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-cyan-500/50" />
          {[
            {
              step: "1",
              title: "Vul in",
              desc: "Beschrijf je bedrijf, branche, stijlvoorkeur en doelgroep. Duurt minder dan een minuut.",
              gradient: "from-violet-500 to-violet-600",
            },
            {
              step: "2",
              title: "AI genereert",
              desc: "Claude AI analyseert jouw input en bouwt een complete, unieke merkidentiteit op maat.",
              gradient: "from-fuchsia-500 to-fuchsia-600",
            },
            {
              step: "3",
              title: "Gebruik direct",
              desc: "Bekijk je brand guide online, download als PDF en begin meteen met bouwen.",
              gradient: "from-cyan-500 to-cyan-600",
            },
          ].map(({ step, title, desc, gradient }) => (
            <div key={step} className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl font-bold mb-6 shadow-lg`}>
                {step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gratis features ── */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-28 scroll-mt-24">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Gratis inbegrepen</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Alles wat je nodig hebt om te starten</h2>
          <p className="text-neutral-400 max-w-lg mx-auto">
            Elke gratis brand guide bevat al de bouwstenen voor een consistente merkuitstraling.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Kleurenpalet",
              desc: "7 zorgvuldig gekozen kleuren: primair, secundair en neutraal, met hex-codes, verhoudingen en toepassingsregels.",
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
              desc: "Een professioneel fontduo van Google Fonts met typehiërarchie (H1–body), lettertyperationale en toepassingsregels.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              ),
              accent: "border-fuchsia-500/20 hover:border-fuchsia-500/40",
              iconBg: "bg-fuchsia-500/10 text-fuchsia-400",
            },
            {
              title: "Merkstrategie",
              desc: "Missie, visie, kernwaarden en een volledig merkverhaal: de strategische fundering van jouw merk.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              ),
              accent: "border-cyan-500/20 hover:border-cyan-500/40",
              iconBg: "bg-cyan-500/10 text-cyan-400",
            },
            {
              title: "Merkpersoonlijkheid",
              desc: "5 persoonlijkheidskenmerken plus een beschrijving die bepaalt hoe jouw merk overkomt op klanten.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              ),
              accent: "border-amber-500/20 hover:border-amber-500/40",
              iconBg: "bg-amber-500/10 text-amber-400",
            },
            {
              title: "Tone of voice",
              desc: "Concrete do's & don'ts voor je communicatie, plus een tagline die je merk in één zin vangt.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              ),
              accent: "border-rose-500/20 hover:border-rose-500/40",
              iconBg: "bg-rose-500/10 text-rose-400",
            },
            {
              title: "Online brand guide",
              desc: "Jouw volledige brand guide direct te bekijken via een unieke link, te delen met je team, klanten of leveranciers.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
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

      {/* ── Premium Spotlight ── */}
      <section id="premium" className="relative px-6 pb-28 scroll-mt-24 overflow-hidden">
        {/* Achtergrond glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-violet-950/20 to-neutral-950 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-300 mb-6">
              ✦ Merkly Premium
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5">
              Alles wat een professioneel
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> merk nodig heeft</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              Premium geeft je volledige controle: van logo tot PDF, van slogans tot mockups.
              Onbeperkt, direct en zonder gedoe.
            </p>
          </div>

          {/* Feature grid — grote kaarten */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Logo regenereren */}
            <div className="relative overflow-hidden bg-neutral-900 border border-violet-500/20 rounded-3xl p-7 group hover:border-violet-500/40 transition-all">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Logo regenereren
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Onbeperkt nieuwe logo&apos;s genereren</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-5">
                  Niet tevreden met je logo? Genereer met één klik een nieuw concept. Vergelijk oud en nieuw naast elkaar
                  en kies zelf welke je behoudt, zonder de rest van je huisstijl te verliezen.
                </p>
                {/* Logo vergelijking mockup */}
                <div className="flex gap-3">
                  <div className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800/50 p-3">
                    <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-2 text-center">Huidig</p>
                    <div className="h-14 rounded-lg bg-neutral-700/40 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-400 opacity-60" />
                    </div>
                  </div>
                  <div className="flex items-center text-neutral-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                  <div className="flex-1 rounded-xl border border-violet-500/40 bg-violet-500/5 p-3">
                    <p className="text-[9px] text-violet-400 uppercase tracking-widest mb-2 text-center font-semibold">Nieuw ✦</p>
                    <div className="h-14 rounded-lg bg-violet-900/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-400 to-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 logo varianten */}
            <div className="relative overflow-hidden bg-neutral-900 border border-fuchsia-500/20 rounded-3xl p-7 group hover:border-fuchsia-500/40 transition-all">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-4">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  </svg>
                  Logo-varianten
                </div>
                <h3 className="text-xl font-bold text-white mb-2">5 varianten, klaar voor elk formaat</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-5">
                  Download je logo in SVG én PNG: volledig kleur, zwart, wit, merkkleur en transparant.
                  Geschikt voor websites, drukwerk, social media en merchandise.
                </p>
                {/* 5 varianten mockup */}
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { bg: "bg-white", label: "Kleur" },
                    { bg: "bg-white", label: "Zwart", dark: true },
                    { bg: "bg-neutral-900 border border-neutral-700", label: "Wit" },
                    { bg: "bg-violet-50", label: "Merk" },
                    { bg: "bg-[repeating-conic-gradient(#d4d4d4_0%_25%,white_0%_50%)_0_0/12px_12px]", label: "Transp." },
                  ].map(({ bg, label, dark }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                      <div className={`w-full aspect-square rounded-lg ${bg} flex items-center justify-center`}>
                        <div className={`w-4 h-4 rounded ${dark ? "bg-neutral-900" : "bg-gradient-to-br from-violet-500 to-fuchsia-500"}`} />
                      </div>
                      <span className="text-[9px] text-neutral-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tweede rij — 3 medium kaarten */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">

            {/* PDF brand guide */}
            <div className="relative overflow-hidden bg-neutral-900 border border-cyan-500/20 rounded-3xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-2">PDF brand guide</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Professioneel 11-pagina PDF-document met je complete merkrichtlijnen.
                  Print het uit, stuur het naar je designer of gebruik het intern.
                </p>
                <div className="mt-4 flex items-center gap-1.5">
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full px-2 py-0.5">11 pagina's</span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-full px-2 py-0.5">Direct download</span>
                </div>
              </div>
            </div>

            {/* Mockups */}
            <div className="relative overflow-hidden bg-neutral-900 border border-amber-500/20 rounded-3xl p-6 hover:border-amber-500/40 transition-all">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-2">Merktoepassing mockups</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Zie je merk direct in de praktijk: visitekaartje, Instagram post,
                  website header en e-mailhandtekening, allemaal in jouw kleuren.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Visitekaartje", "Instagram", "Website", "E-mail"].map((m) => (
                    <span key={m} className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Slogans */}
            <div className="relative overflow-hidden bg-neutral-900 border border-emerald-500/20 rounded-3xl p-6 hover:border-emerald-500/40 transition-all">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-2">Slogans regenereren</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Niet blij met je tagline? Genereer een set nieuwe slogans, blader erdoorheen
                  en sla de perfecte oneliner op in je huisstijl.
                </p>
                <div className="mt-4 space-y-1.5">
                  {['"Stijl die voor zich spreekt."', '"Jouw verhaal, ons ontwerp."'].map((s, i) => (
                    <p key={i} className={`text-[11px] italic ${i === 0 ? "text-emerald-300" : "text-neutral-600"}`}>{s}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Derde rij — 2 kleinere kaarten */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Voorbeeldteksten & brand voice */}
            <div className="bg-neutral-900 border border-rose-500/20 rounded-3xl p-6 hover:border-rose-500/40 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white mb-1.5">Voorbeeldteksten & brand voice</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Kant-en-klare teksten voor je website, social media en e-mail, geschreven in jouw tone of voice.
                    Kopieer en gebruik direct.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Hero headline", "Instagram caption", "Over ons", "E-mailonderwerp"].map((t) => (
                      <span key={t} className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full px-2 py-0.5">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* WCAG + onbeperkt */}
            <div className="bg-neutral-900 border border-violet-500/20 rounded-3xl p-6 hover:border-violet-500/40 transition-all">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4.5 h-4.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">WCAG kleurcontrast-check</p>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Automatische toegankelijkheidsvalidatie: je kleuren worden gecontroleerd op AA- en AAA-normen.
                    </p>
                  </div>
                </div>
                <div className="h-px bg-neutral-800" />
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4.5 h-4.5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">Onbeperkt genereren</p>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Geen daglimieten. Genereer zoveel huisstijlen als je wilt, voor elke klant, elk project, elk idee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA premium */}
          <div className="mt-10 text-center">
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-8 py-4 rounded-xl text-base hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              ✦ Start met Premium · €18,95/maand
            </Link>
            <p className="text-sm text-neutral-600 mt-3">Maandelijks opzegbaar &middot; Direct actief na betaling</p>
          </div>
        </div>
      </section>

      {/* ── Brand guide preview ── */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Bekijk het resultaat</h2>
        <p className="text-neutral-400 text-center mb-12 max-w-lg mx-auto">
          Zo ziet een door Merkly gegenereerde brand guide eruit.
        </p>
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 text-white text-xl font-bold"
              style={{ backgroundColor: "#DB2777" }}
            >
              B
            </div>
            <div>
              <p className="font-semibold text-lg">Bloesem</p>
              <p className="text-xs text-neutral-500">Brand Guide &mdash; gegenereerd door Merkly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Kleurenpalet</p>
              <div className="flex gap-2">
                {[
                  { hex: "#DB2777", label: "Bloesem" },
                  { hex: "#F472B6", label: "Kers" },
                  { hex: "#FB7185", label: "Koraal" },
                  { hex: "#FBBF24", label: "Perzik" },
                  { hex: "#57534E", label: "Schaduw" },
                ].map(({ hex, label }) => (
                  <div key={hex} className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" style={{ backgroundColor: hex }} />
                    <span className="text-[10px] text-neutral-600 font-mono">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Typografie</p>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>Crimson Text</p>
                  <p className="text-xs text-neutral-600">Koppen &mdash; elegant, warm</p>
                </div>
                <div>
                  <p className="text-base text-neutral-300">Source Sans Pro</p>
                  <p className="text-xs text-neutral-600">Broodtekst &mdash; helder, leesbaar</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Merkpersoonlijkheid</p>
              <p className="text-sm text-neutral-300 font-medium italic mb-3">&ldquo;Bloemen die je verhaal vertellen&rdquo;</p>
              <div className="flex flex-wrap gap-2">
                {["Hartelijk", "Authentiek", "Zorgzaam", "Creatief", "Betrouwbaar"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full border"
                    style={{ backgroundColor: "#DB277715", color: "#F472B6", borderColor: "#DB277730" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Tone of voice</p>
              <p className="text-sm text-neutral-400 leading-relaxed italic">
                &ldquo;Bloesem is jouw lokale bloemenspecialist voor handgemaakte boeketten en seizoensbloemen.
                Wij geloven dat elke bloem een verhaal heeft.&rdquo;
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-between">
            <p className="text-xs text-neutral-600">Voorbeeld &mdash; Premium bevat ook logo, mockups en voorbeeldteksten</p>
            <Link
              href="/generate"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              Maak de jouwe &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Waarom Merkly ── */}
      <section className="max-w-4xl mx-auto px-6 pb-28 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Waarom Merkly?</h2>
        <p className="text-neutral-400 mb-12 max-w-lg mx-auto">
          Een grafisch bureau rekent €2.000 tot €10.000 voor een huisstijl.
          Merkly doet het in minder dan een minuut.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              title: "Razendsnel",
              desc: "Volledige merkidentiteit in minder dan 2 minuten. Geen briefings, geen revisierondes, geen weken wachten.",
              gradient: "from-violet-500 to-violet-600",
            },
            {
              title: "Volledig compleet",
              desc: "Van kleurenpalet en typografie tot logo, mockups, merkverhaal en voorbeeldteksten: alles in één keer.",
              gradient: "from-fuchsia-500 to-fuchsia-600",
            },
            {
              title: "Fractie van de prijs",
              desc: "Gratis te proberen. Premium voor €18,95/maand, minder dan de koffie bij je eerste bureaugesprek.",
              gradient: "from-cyan-500 to-cyan-600",
            },
          ].map(({ title, desc, gradient }) => (
            <div
              key={title}
              className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 text-left"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Prijzen ── */}
      <section id="pricing" className="max-w-3xl mx-auto px-6 pb-28 scroll-mt-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Eenvoudige prijzen</h2>
        <p className="text-neutral-400 text-center mb-12 max-w-md mx-auto">
          Begin gratis. Upgrade wanneer je meer nodig hebt. Geen verborgen kosten.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Gratis */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
            <p className="text-sm text-neutral-400 mb-1">Gratis</p>
            <p className="text-4xl font-bold mb-1">€0</p>
            <p className="text-sm text-neutral-600 mb-6">Voor altijd gratis</p>
            <ul className="space-y-2.5 text-sm text-neutral-400 mb-8">
              {[
                "Kleurenpalet & typografie",
                "Merkverhaal & tone of voice",
                "Merkpersoonlijkheid & strategie",
                "3 generaties per dag",
                "Online brand guide bekijken",
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

          {/* Premium */}
          <div className="relative bg-white text-black rounded-2xl p-8">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg">
                Aanbevolen
              </span>
            </div>
            <p className="text-sm text-neutral-600 mb-1">Premium</p>
            <p className="text-4xl font-bold mb-1">
              €18,95<span className="text-lg font-normal text-neutral-500">/maand</span>
            </p>
            <p className="text-sm text-neutral-500 mb-6">Maandelijks opzegbaar</p>
            <ul className="space-y-2.5 text-sm text-neutral-600 mb-8">
              {[
                "Alles uit gratis",
                "Onbeperkt genereren",
                "Volledige brand guide direct",
                "Download als PDF (11 pagina's)",
                "AI-logo SVG/PNG: 5 varianten",
                "Onbeperkt logo regenereren",
                "Slogans regenereren & bewaren",
                "Mockups: visitekaartje, social media",
                "Voorbeeldteksten & brand voice",
                "WCAG kleurcontrast-check",
                "Maandelijks opzegbaar",
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
              href="/upgrade"
              className="block text-center w-full py-3 bg-black text-white rounded-xl hover:bg-neutral-900 transition-colors text-sm font-medium"
            >
              Start Premium
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative max-w-4xl mx-auto px-6 pb-28">
        <div className="relative bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="relative text-3xl sm:text-4xl font-bold mb-4">
            Klaar om je merk te bouwen?
          </h2>
          <p className="relative text-neutral-400 mb-8 max-w-md mx-auto">
            Probeer Merkly gratis, geen account nodig. Of ga direct voor Premium
            en krijg alles wat je nodig hebt in één abonnement.
          </p>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/generate"
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-8 py-4 rounded-xl text-base hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
            >
              Begin nu gratis &rarr;
            </Link>
            <Link
              href="/upgrade"
              className="w-full sm:w-auto bg-white/5 border border-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-all"
            >
              ✦ Bekijk Premium
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-900 px-8 py-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <span className="font-bold tracking-tight">
              <span className="text-white">Merk</span>
              <span className="text-violet-400">ly</span>
            </span>
            <span className="text-sm text-neutral-600">AI-huisstijlgenerator</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link href="/generate" className="hover:text-white transition-colors">Generator</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#premium" className="hover:text-white transition-colors">Premium</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Prijzen</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-neutral-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-700">&copy; 2026 Merkly. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-4 text-xs text-neutral-700">
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">Privacybeleid</Link>
            <Link href="/voorwaarden" className="hover:text-neutral-400 transition-colors">Algemene voorwaarden</Link>
            <Link href="/cookies" className="hover:text-neutral-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
