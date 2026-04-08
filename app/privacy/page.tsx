import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacybeleid",
  description:
    "Lees hoe Merkly persoonsgegevens verwerkt, bewaart en beschermt in overeenstemming met de AVG/GDPR.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacybeleid" lastUpdated="8 april 2026">
      <p>
        Merkly (&quot;wij&quot;, &quot;ons&quot;) hecht grote waarde aan jouw privacy. In dit
        privacybeleid leggen we uit welke persoonsgegevens wij verzamelen, waarom wij dat doen en
        welke rechten je hebt. Dit beleid is opgesteld in overeenstemming met de Algemene Verordening
        Gegevensbescherming (AVG/GDPR).
      </p>

      <LegalSection heading="1. Wie is verantwoordelijk?">
        <p>
          De verwerkingsverantwoordelijke voor jouw persoonsgegevens is Merkly. Voor vragen over
          dit privacybeleid of je persoonsgegevens kun je contact opnemen via{" "}
          <a href="mailto:privacy@merkly.nl" className="text-violet-400 hover:text-violet-300">
            privacy@merkly.nl
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="2. Welke gegevens verwerken wij?">
        <p>Wij verwerken de volgende categorieën persoonsgegevens:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong className="text-neutral-300">Bedrijfsinformatie die je invult:</strong>{" "}
            bedrijfsnaam, branche, doelgroep, beschrijving en voorkeursstijl.
          </li>
          <li>
            <strong className="text-neutral-300">Accountgegevens (bij Premium):</strong> e-mailadres,
            naam en betalingsgegevens (verwerkt door Stripe, wij zien nooit je kaartgegevens).
          </li>
          <li>
            <strong className="text-neutral-300">Gegenereerde brand guides:</strong> opgeslagen zodat
            je ze later opnieuw kunt bekijken of downloaden.
          </li>
          <li>
            <strong className="text-neutral-300">Technische gegevens:</strong> IP-adres, browser,
            apparaat en paginabezoeken voor beveiliging en foutopsporing.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Waarom verwerken wij deze gegevens?">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Om de Merkly-dienst te leveren (jouw brand guide genereren en tonen).</li>
          <li>Om betalingen voor Premium-accounts af te handelen.</li>
          <li>Om de kwaliteit van onze dienst te verbeteren.</li>
          <li>Om te voldoen aan wettelijke verplichtingen (bijv. administratie).</li>
          <li>Om fraude en misbruik tegen te gaan.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. Grondslag van de verwerking">
        <p>
          Wij verwerken jouw gegevens op basis van: (a) de uitvoering van de overeenkomst met jou,
          (b) jouw toestemming waar vereist, (c) ons gerechtvaardigd belang (bijv. productverbetering
          en beveiliging), en (d) wettelijke verplichtingen.
        </p>
      </LegalSection>

      <LegalSection heading="5. Met wie delen wij jouw gegevens?">
        <p>
          Wij delen alleen gegevens met verwerkers die we nodig hebben om de dienst te leveren.
          Huidige subverwerkers:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong className="text-neutral-300">Anthropic (Claude AI):</strong> verwerkt jouw input
            om brand-guide-tekst te genereren. Geen training op jouw data.
          </li>
          <li>
            <strong className="text-neutral-300">Recraft AI:</strong> verwerkt abstracte
            promptomschrijvingen om logo-afbeeldingen te genereren.
          </li>
          <li>
            <strong className="text-neutral-300">Supabase (EU-regio):</strong> databank en opslag
            voor brand guides en logo-afbeeldingen.
          </li>
          <li>
            <strong className="text-neutral-300">Stripe:</strong> betalingsverwerking voor Premium.
          </li>
          <li>
            <strong className="text-neutral-300">Vercel:</strong> hosting van de website.
          </li>
        </ul>
        <p>
          Wij verkopen jouw gegevens nooit aan derden. Met alle subverwerkers zijn
          verwerkersovereenkomsten gesloten.
        </p>
      </LegalSection>

      <LegalSection heading="6. Doorgifte buiten de EU">
        <p>
          Sommige subverwerkers (Anthropic, Recraft, Stripe) zijn in de VS gevestigd. Doorgifte vindt
          plaats op basis van de EU Standard Contractual Clauses (SCC&apos;s) en, waar van toepassing,
          het EU-US Data Privacy Framework.
        </p>
      </LegalSection>

      <LegalSection heading="7. Hoe lang bewaren wij gegevens?">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Gegenereerde brand guides: zolang jouw account actief is of jij ze niet verwijdert.</li>
          <li>Accountgegevens: tot 30 dagen na verwijdering van het account.</li>
          <li>Facturatiegegevens: 7 jaar (wettelijke bewaarplicht Belastingdienst).</li>
          <li>Logbestanden: maximaal 90 dagen.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="8. Jouw rechten">
        <p>Onder de AVG heb je de volgende rechten:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Recht op inzage in jouw persoonsgegevens.</li>
          <li>Recht op correctie van onjuiste gegevens.</li>
          <li>Recht op verwijdering (&quot;recht om vergeten te worden&quot;).</li>
          <li>Recht op beperking van de verwerking.</li>
          <li>Recht op dataportabiliteit.</li>
          <li>Recht om bezwaar te maken tegen de verwerking.</li>
          <li>Recht om je toestemming in te trekken.</li>
        </ul>
        <p>
          Stuur een verzoek naar{" "}
          <a href="mailto:privacy@merkly.nl" className="text-violet-400 hover:text-violet-300">
            privacy@merkly.nl
          </a>
          . Wij reageren binnen 30 dagen. Als je niet tevreden bent, kun je een klacht indienen bij
          de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).
        </p>
      </LegalSection>

      <LegalSection heading="9. Beveiliging">
        <p>
          Wij nemen passende technische en organisatorische maatregelen om jouw gegevens te
          beschermen, waaronder versleuteling in transit (TLS) en at-rest, toegangscontrole en
          regelmatige beveiligingsreviews.
        </p>
      </LegalSection>

      <LegalSection heading="10. Wijzigingen">
        <p>
          Wij kunnen dit privacybeleid van tijd tot tijd aanpassen. De meest actuele versie vind je
          altijd op deze pagina. Bij ingrijpende wijzigingen informeren we je per e-mail of via een
          melding op de website.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
