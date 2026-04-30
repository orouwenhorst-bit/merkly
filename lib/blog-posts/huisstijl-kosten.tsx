import Link from "next/link";

export default function HuisstijlKosten() {
  return (
    <article className="prose-content">
      <p className="text-lg text-neutral-600 leading-relaxed mb-8">
        &quot;Wat kost een huisstijl laten maken?&quot; — het is een van de eerste vragen die
        ondernemers stellen. Het antwoord is: dat hangt sterk af van de route die je
        kiest. In deze gids zetten we alle opties naast elkaar, zodat je een weloverwogen
        keuze kunt maken voor jouw budget en situatie.
      </p>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        Overzicht: huisstijl opties en kosten in 2026
      </h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-100 text-left">
              <th className="px-4 py-3 font-semibold text-neutral-700 border border-neutral-200 rounded-tl-lg">Optie</th>
              <th className="px-4 py-3 font-semibold text-neutral-700 border border-neutral-200">Kosten</th>
              <th className="px-4 py-3 font-semibold text-neutral-700 border border-neutral-200">Doorlooptijd</th>
              <th className="px-4 py-3 font-semibold text-neutral-700 border border-neutral-200 rounded-tr-lg">Geschikt voor</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-200">
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200 font-medium">Zelf doen (Canva)</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">€0 – €180/jaar</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Meerdere dagen</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Hobbyprojecten, tijdelijk</td>
            </tr>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200 font-medium">AI-tool (Merkly)</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">€0 – €18,95/mnd</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">2 minuten</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Starters, ZZP&apos;ers, MKB</td>
            </tr>
            <tr className="border-b border-neutral-200">
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200 font-medium">Freelance designer</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">€500 – €3.000</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">2 – 6 weken</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Groeiende bedrijven</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200 font-medium">Ontwerpbureau</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">€3.000 – €25.000+</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">4 – 16 weken</td>
              <td className="px-4 py-3 text-neutral-700 border border-neutral-200">Grote merken, rebranding</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        Optie 1: Zelf doen met Canva of vergelijkbare tools
      </h2>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Canva is populair, betaalbaar en laagdrempelig. Voor €0 (gratis) of €180 per
        jaar (Pro) kun je logo&apos;s, social posts en visitekaartjes maken vanuit
        templates. Maar er zitten haken en ogen aan:
      </p>
      <ul className="list-disc list-inside space-y-2 text-neutral-700 mb-4 pl-2">
        <li>Je merk ziet er uit als een template — want dat is het ook</li>
        <li>Er is geen merkstrategie: geen tone of voice, geen merkverhaal, geen positionering</li>
        <li>Consistentie bewaken kost veel tijd als je geen vaste richtlijnen hebt</li>
        <li>Canva-logo&apos;s zijn niet exclusief — anderen gebruiken dezelfde ontwerpen</li>
      </ul>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Zelf doen is prima als tijdelijke oplossing of voor een bijproject, maar voor
        een serieus bedrijf heb je iets professioneler nodig.
      </p>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        Optie 2: AI huisstijl generator
      </h2>
      <p className="text-neutral-700 leading-relaxed mb-4">
        AI-tools hebben het speelveld de afgelopen jaren drastisch veranderd. Tools
        als Merkly genereren in minuten een volledige merkidentiteit: een AI-logo in
        meerdere varianten, een doordacht kleurenpalet, typografieadvies, een
        merkverhaal, tone of voice en kant-en-klare copy.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        <strong>Kosten:</strong> Merkly is gratis te proberen (3 generaties per dag,
        zonder account). Merkly Premium kost €18,95 per maand en geeft toegang tot
        onbeperkt genereren, AI-logo&apos;s in SVG en PNG, een PDF brand guide van 19
        pagina&apos;s, mockups en slogans.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        <strong>Voordeel:</strong> snelheid en kosten. Voor minder dan €20 heb je een
        professionele merkbasis die je direct kunt gebruiken. Ideaal voor starters,
        ZZP&apos;ers en MKB-bedrijven die snel willen lanceren zonder groot design-budget.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        <strong>Beperking:</strong> AI-tools leveren een uitstekende basis, maar bij
        zeer specifieke nichemarkten of als je volledige maatwerk wilt, blijft een
        menselijke designer meerwaarde bieden.
      </p>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        Optie 3: Freelance designer inhuren
      </h2>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Een ervaren freelance designer rekent doorgaans €75 tot €150 per uur. Een
        basispakket (logo + kleurenpalet + typografie) kost al snel €500 tot €1.500.
        Wil je een uitgebreider brand guide met merkstrategie, dan loop je al snel
        op tot €3.000.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Voordelen: maatwerk, persoonlijk contact en de mogelijkheid om feedback te
        geven tijdens het proces. Nadelen: doorlooptijd (meerdere weken), en de
        kwaliteit verschilt sterk per designer.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Let bij het inhuren van een freelancer op: bekijk altijd een portfolio, vraag
        referenties op en zorg voor een duidelijke briefing met je doelgroep,
        concurrenten en gewenste uitstraling.
      </p>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        Optie 4: Reclame- of ontwerpbureau
      </h2>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Een volledig bureau levert het meest uitgebreide traject: merkonderzoek,
        positionering, strategie, ontwerp, implementatie en soms ook campagnes. De
        kosten starten bij €3.000 voor een basispakket en kunnen oplopen tot
        €25.000 of meer voor een complete rebranding van een gevestigd bedrijf.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Bureaus zijn zinvol voor bedrijven die serieus willen investeren in hun merk
        en de middelen hebben om dat te doen. Voor de meeste starters en kleine
        ondernemers is dit echter niet de meest efficiënte investering.
      </p>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        Wat bepaalt de prijs van een huisstijl?
      </h2>
      <ul className="list-disc list-inside space-y-2 text-neutral-700 mb-6 pl-2">
        <li><strong>Scope:</strong> alleen een logo, of een complete brand guide inclusief strategie?</li>
        <li><strong>Ervaring van de designer:</strong> een junior freelancer vs. een senior bureau</li>
        <li><strong>Aantal revisierondes:</strong> meer feedback = meer uren = hogere kosten</li>
        <li><strong>Bestanden en rechten:</strong> vector-bestanden (SVG/AI/EPS) en volledige auteursrechten</li>
        <li><strong>Extra uitingen:</strong> visitekaartjes, briefpapier, social media templates</li>
      </ul>

      <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">
        Welke optie past bij jou?
      </h2>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Als je net start of een beperkt budget hebt: begin met een AI-tool. Je hebt
        binnen twee minuten een professionele basis waarmee je kunt lanceren.
        Naarmate je bedrijf groeit, kun je altijd nog investeren in een freelancer
        of bureau.
      </p>
      <p className="text-neutral-700 leading-relaxed mb-4">
        Heb je al omzet en wil je een duurzame merkidentiteit bouwen? Dan is een
        goede freelance designer een verstandige investering. Voor volledige
        merkpositionering en grootschalige communicatie is een bureau de beste keuze.
      </p>

      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-6 mt-8">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Start met een gratis huisstijl
        </h3>
        <p className="text-neutral-600 mb-4 text-sm">
          Merkly genereert in minder dan 2 minuten een complete merkidentiteit.
          Gratis proberen, zonder account. Premium vanaf €18,95 per maand.
        </p>
        <Link
          href="/generate"
          className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all"
        >
          Genereer jouw huisstijl →
        </Link>
      </div>
    </article>
  );
}
