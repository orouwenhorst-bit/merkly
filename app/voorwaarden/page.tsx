import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description:
    "De algemene voorwaarden voor het gebruik van Merkly: de dienst, betalingen, intellectueel eigendom en aansprakelijkheid.",
  alternates: { canonical: "/voorwaarden" },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Algemene voorwaarden" lastUpdated="8 april 2026">
      <p>
        Door gebruik te maken van Merkly ga je akkoord met deze algemene voorwaarden. Lees ze
        aandachtig door. Heb je vragen? Neem dan contact op via{" "}
        <a href="mailto:info@merkly.nl" className="text-violet-400 hover:text-violet-300">
          info@merkly.nl
        </a>
        .
      </p>

      <LegalSection heading="1. Definities">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong className="text-neutral-300">Merkly:</strong> de online dienst waarmee je
            AI-gegenereerde brand guides maakt.
          </li>
          <li>
            <strong className="text-neutral-300">Gebruiker:</strong> iedere natuurlijke of
            rechtspersoon die gebruikmaakt van Merkly.
          </li>
          <li>
            <strong className="text-neutral-300">Dienst:</strong> alle functionaliteit binnen
            Merkly, inclusief gratis en betaalde onderdelen.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. Toepasselijkheid">
        <p>
          Deze voorwaarden zijn van toepassing op iedere overeenkomst tussen Merkly en de
          gebruiker. Afwijkingen zijn alleen geldig als ze schriftelijk zijn overeengekomen.
        </p>
      </LegalSection>

      <LegalSection heading="3. De dienst">
        <p>
          Merkly genereert brand guides met behulp van AI (onder andere Anthropic Claude en
          Recraft AI). De output is een creatieve suggestie en geen garantie voor commercieel
          succes, originaliteit, of juridische beschikbaarheid (bijv. als merk of handelsnaam).
        </p>
        <p>
          Je bent zelf verantwoordelijk voor het controleren van merkrechten, handelsnaamrechten en
          domeinbeschikbaarheid voordat je een gegenereerde identiteit commercieel gebruikt.
        </p>
      </LegalSection>

      <LegalSection heading="4. Account en gebruik">
        <p>
          Voor Premium-functionaliteit is een account vereist. Je bent zelf verantwoordelijk voor
          het geheimhouden van je inloggegevens. Het is niet toegestaan om:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>De dienst te gebruiken voor onrechtmatige of illegale doeleinden.</li>
          <li>
            Geautomatiseerde scripts, bots of scrapers te gebruiken zonder uitdrukkelijke
            toestemming.
          </li>
          <li>
            Haatdragende, discriminerende, gewelddadige of anderszins ongepaste content te
            genereren.
          </li>
          <li>De dienst opnieuw aan te bieden (resale) zonder schriftelijke toestemming.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Prijzen en betaling">
        <p>
          De basisversie van Merkly is gratis. Premium is beschikbaar via een
          maandabonnement. Alle prijzen zijn in euro&apos;s en inclusief BTW voor Nederlandse
          consumenten. Betalingen worden verwerkt door Stripe.
        </p>
        <p>
          Het abonnement wordt automatisch maandelijks verlengd totdat je opzegt. Opzeggen kan op
          elk moment via je accountinstellingen; de opzegging gaat in aan het einde van de lopende
          periode.
        </p>
      </LegalSection>

      <LegalSection heading="6. Herroepingsrecht" id="herroeping">
        <p>
          Als consument heb je 14 dagen herroepingsrecht na het afsluiten van een Premium-abonnement.
          Door direct na aankoop de digitale dienst te gebruiken (zoals het genereren van brand
          guides), doe je uitdrukkelijk afstand van je herroepingsrecht voor reeds geleverde digitale
          content, conform art. 6:230p BW.
        </p>
      </LegalSection>

      <LegalSection heading="7. Intellectueel eigendom">
        <p>
          De door jou gegenereerde brand guide (tekst, kleuren, logo-afbeelding) mag je vrij
          gebruiken voor commerciële en niet-commerciële doeleinden. Je bent zelf verantwoordelijk
          voor het verifiëren dat het gebruik niet in strijd is met rechten van derden.
        </p>
        <p>
          Het platform Merkly zelf (inclusief de software, het ontwerp, de prompt-logica en het
          merk &quot;Merkly&quot;) blijft eigendom van Merkly.
        </p>
      </LegalSection>

      <LegalSection heading="8. Aansprakelijkheid">
        <p>
          Merkly spant zich in om de dienst zo goed mogelijk te leveren, maar geeft geen
          garantie op foutloze werking of onafgebroken beschikbaarheid. Onze aansprakelijkheid is
          beperkt tot het bedrag dat je in de 12 maanden voorafgaand aan het schadeveroorzakende
          feit hebt betaald, met een maximum van &euro;250 voor gratis gebruikers.
        </p>
        <p>
          Merkly is niet aansprakelijk voor indirecte schade, gevolgschade, gemiste omzet of
          reputatieschade voortvloeiend uit het gebruik van de gegenereerde brand guides.
        </p>
      </LegalSection>

      <LegalSection heading="9. Beschikbaarheid en onderhoud">
        <p>
          Wij streven naar een beschikbaarheid van 99% op jaarbasis. Geplande onderhoudsmomenten
          worden waar mogelijk vooraf aangekondigd. Wij zijn niet verantwoordelijk voor uitval bij
          externe diensten (Anthropic, Recraft, Supabase, Stripe, Vercel).
        </p>
      </LegalSection>

      <LegalSection heading="10. Wijzigingen">
        <p>
          Merkly kan deze voorwaarden aanpassen. Bij belangrijke wijzigingen informeren wij
          gebruikers minimaal 30 dagen van tevoren. Gebruik van de dienst na de ingangsdatum
          betekent acceptatie van de nieuwe voorwaarden.
        </p>
      </LegalSection>

      <LegalSection heading="11. Toepasselijk recht en geschillen">
        <p>
          Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan
          de bevoegde rechter in het arrondissement waar Merkly is gevestigd, tenzij de wet
          dwingend anders bepaalt.
        </p>
        <p>
          Als consument kun je ook gebruikmaken van het Europese platform voor online
          geschillenbeslechting (ODR). Dit platform is te vinden op{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300"
          >
            ec.europa.eu/consumers/odr
          </a>
          . Ons e-mailadres voor dit doel is{" "}
          <a href="mailto:info@merkly.nl" className="text-violet-400 hover:text-violet-300">
            info@merkly.nl
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
