import Link from "next/link";

export default function LogoLatenMaken() {
  return (
    <article className="prose-content">
      <p className="text-lg text-neutral-600 leading-relaxed mb-8">
        Een logo is het gezicht van je bedrijf. Maar hoe laat je er een maken —
        en wat kost dat? In deze gids zetten we alle opties naast elkaar: van
        goedkoop tot premium, en van snel tot grondig.
      </p>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        Waarom een goed logo zo belangrijk is
      </h2>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Je logo verschijnt overal: op je website, visitekaartje, facturen, social
        media, verpakkingen en misschien zelfs op een bedrijfsauto. Het is het
        meest zichtbare element van je merk en bepaalt voor een groot deel de eerste
        indruk die mensen van je bedrijf hebben.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Een goed logo is:
      </p>
      <ul className="list-disc list-inside space-y-2 text-neutral-700 mb-6 pl-2">
        <li><strong>Eenvoudig</strong> — herkenbaar op elk formaat, van favicon tot billboard</li>
        <li><strong>Tijdloos</strong> — geen trendy effecten die over 3 jaar gedateerd zijn</li>
        <li><strong>Onderscheidend</strong> — anders dan de concurrentie in jouw branche</li>
        <li><strong>Veelzijdig</strong> — werkt in kleur én zwart-wit, op licht én donker</li>
        <li><strong>Passend</strong> — sluit aan bij het karakter van je merk en doelgroep</li>
      </ul>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        De opties voor een logo laten maken
      </h2>

      <h3 className="text-xl font-semibold text-neutral-900 mt-6 mb-3">
        Optie 1: AI logo generator
      </h3>
      <p className="text-neutral-700 leading-relaxed mb-4">
        AI-tools kunnen tegenwoordig in seconden een logo genereren op basis van
        een beschrijving. Tools als Merkly gebruiken geavanceerde AI (zoals Recraft
        V4) om vectorlogo&apos;s te genereren in meerdere varianten — kleur, zwart,
        wit en transparant.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        <strong>Voordelen:</strong> razendsnel, betaalbaar (vaak gratis of een
        paar euro per maand), meerdere varianten direct beschikbaar in SVG en PNG.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        <strong>Beperkingen:</strong> minder maatwerk dan een menselijke designer,
        al neemt de kwaliteit van AI-logo&apos;s snel toe. Voor de meeste starters
        en kleine bedrijven is de kwaliteit prima.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        <strong>Kosten:</strong> €0 tot circa €20 per maand.
      </p>

      <h3 className="text-xl font-semibold text-neutral-900 mt-6 mb-3">
        Optie 2: Fiverr of freelanceplatform
      </h3>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Via platforms als Fiverr, 99designs of Malt kun je een freelance designer
        inhuren voor een logo. Prijzen lopen uiteen van €30 (Fiverr basisaanbieding)
        tot €500+ voor een ervaren designer.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Let op: goedkope logo-aanbiedingen op Fiverr zijn vaak gebaseerd op
        stockiconen of templates. Voor een echt uniek logo heb je doorgaans een
        budget van minimaal €150-300 nodig.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        <strong>Tips bij het inhuren:</strong>
      </p>
      <ul className="list-disc list-inside space-y-2 text-neutral-700 mb-6 pl-2">
        <li>Bekijk het portfolio zorgvuldig en kijk of de stijl bij jou past</li>
        <li>Vraag hoeveel revisierondes inbegrepen zijn</li>
        <li>Zorg dat je de bronbestanden (AI, EPS of SVG) ontvangt</li>
        <li>Controleer de auteursrechten — zijn die volledig overgedragen?</li>
        <li>Vraag om meerdere concepten, niet direct één uitwerking</li>
      </ul>

      <h3 className="text-xl font-semibold text-neutral-900 mt-6 mb-3">
        Optie 3: Lokale freelance designer
      </h3>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Een Nederlandse freelance designer rekent doorgaans €75-150 per uur.
        Een compleet logotraject (inclusief briefing, concepten en uitwerking)
        kost al snel €500-1.500. Het voordeel: persoonlijk contact, een designer
        die jouw markt kent en professionele afronding.
      </p>

      <h3 className="text-xl font-semibold text-neutral-900 mt-6 mb-3">
        Optie 4: Ontwerpbureau
      </h3>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Bureaus bieden een completer traject: merkonderzoek, concurrentieanalyse,
        meerdere conceptrichtingen en professionele presentatie. Rekening houden
        met een budget van €1.500-5.000 voor een logotraject, en meer voor een
        volledig huisstijltraject.
      </p>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        Welke bestanden heb je nodig bij een logo?
      </h2>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Dit is een veelgemaakte fout: je krijgt alleen een PNG-bestand en merkt
        later dat je geen schaalbaar logo hebt voor drukwerk. Zorg altijd dat je
        de volgende bestanden ontvangt:
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-100 text-left">
              <th className="px-4 py-3 font-semibold text-neutral-700 border border-neutral-200">Bestand</th>
              <th className="px-4 py-3 font-semibold text-neutral-700 border border-neutral-200">Gebruik</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-200">
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200 font-mono">SVG</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Website, schaalbaar drukwerk, vectorbewerking</td>
            </tr>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200 font-mono">PNG (transparant)</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Digitaal gebruik, social media, presentaties</td>
            </tr>
            <tr className="border-b border-neutral-200">
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200 font-mono">PNG (wit op transparant)</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Donkere achtergronden, merchandise</td>
            </tr>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200 font-mono">PNG (zwart op transparant)</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Zwart-wit print, stempels, watermerken</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200 font-mono">AI / EPS (bronbestand)</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Bewerking in Adobe Illustrator, drukwerk op grote formaten</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        Logo alleen is niet genoeg
      </h2>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Een logo is het startpunt van je huisstijl, niet het eindpunt. Zonder
        een passend kleurenpalet, consistente typografie en een duidelijke
        merkstem ziet je communicatie er snel onsamenhanging uit — ook met een
        mooi logo.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        De meeste professionele designtrajecten leveren dan ook een complete
        huisstijl op, niet alleen een logo. Als je kiest voor een AI-tool als
        Merkly, krijg je het logo automatisch als onderdeel van een complete
        merkidentiteit: kleuren, fonts, merkverhaal en tone of voice inbegrepen.
      </p>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        Samenvatting: wat kost een logo laten maken?
      </h2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-100 text-left">
              <th className="px-4 py-3 font-semibold text-neutral-700 border border-neutral-200">Route</th>
              <th className="px-4 py-3 font-semibold text-neutral-700 border border-neutral-200">Kosten</th>
              <th className="px-4 py-3 font-semibold text-neutral-700 border border-neutral-200">Kwaliteit</th>
              <th className="px-4 py-3 font-semibold text-neutral-700 border border-neutral-200">Tijd</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-200">
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">AI-tool (Merkly)</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">€0–€19/mnd</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Goed</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Minuten</td>
            </tr>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Fiverr (basis)</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">€30–€150</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Wisselend</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">1–5 dagen</td>
            </tr>
            <tr className="border-b border-neutral-200">
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Freelancer NL</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">€500–€1.500</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Goed–uitstekend</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">1–3 weken</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Bureau</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">€1.500–€5.000+</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Uitstekend</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">3–8 weken</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-6 mt-8">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Krijg een AI-logo inclusief complete huisstijl
        </h3>
        <p className="text-neutral-600 mb-4 text-sm">
          Merkly genereert een professioneel AI-logo in 5 varianten (SVG + PNG),
          inclusief kleurenpalet, typografie, merkverhaal en tone of voice.
          Gratis proberen, geen account vereist.
        </p>
        <Link
          href="/generate"
          className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all"
        >
          Genereer mijn logo →
        </Link>
      </div>
    </article>
  );
}
