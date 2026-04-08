import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookieverklaring",
  description:
    "Informatie over welke cookies Merkly gebruikt, waarvoor, en hoe je ze kunt beheren.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookieverklaring" lastUpdated="8 april 2026">
      <p>
        Merkly gebruikt een minimale hoeveelheid cookies. Op deze pagina leggen we uit welke
        cookies we plaatsen en waarvoor, zodat je een bewuste keuze kunt maken.
      </p>

      <LegalSection heading="1. Wat zijn cookies?">
        <p>
          Cookies zijn kleine tekstbestanden die door je browser worden opgeslagen wanneer je een
          website bezoekt. Ze onthouden informatie zoals voorkeursinstellingen of of je bent
          ingelogd.
        </p>
      </LegalSection>

      <LegalSection heading="2. Welke cookies gebruiken wij?">
        <p>
          <strong className="text-neutral-300">Functionele cookies (altijd actief):</strong>{" "}
          noodzakelijk voor het functioneren van de website. Denk aan sessie-cookies voor het
          inloggen en voor het bewaren van een brand guide die je genereert. Voor deze cookies is
          geen toestemming vereist.
        </p>
        <p>
          <strong className="text-neutral-300">Analytische cookies (optioneel):</strong> wij kunnen
          privacy-vriendelijke analytics gebruiken (bijvoorbeeld Plausible of een vergelijkbare
          cookieloze oplossing) om te begrijpen hoe Merkly wordt gebruikt. Deze verzamelen geen
          persoonlijke gegevens en zetten geen tracking-cookies.
        </p>
        <p>
          <strong className="text-neutral-300">Tracking/marketing cookies:</strong> deze plaatsen
          wij niet. We gebruiken geen Google Analytics, Facebook Pixel of vergelijkbare trackers.
        </p>
      </LegalSection>

      <LegalSection heading="3. Derden-cookies">
        <p>
          Bij het afronden van een betaling via Stripe kan Stripe cookies plaatsen voor
          fraudepreventie. Deze zijn noodzakelijk voor het veilig verwerken van de transactie.
        </p>
      </LegalSection>

      <LegalSection heading="4. Cookies beheren">
        <p>
          Je kunt cookies altijd zelf beheren of verwijderen via je browserinstellingen. Let op: het
          uitschakelen van functionele cookies kan ervoor zorgen dat delen van Merkly niet meer
          goed werken.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Chrome: Instellingen → Privacy en beveiliging → Cookies</li>
          <li>Firefox: Instellingen → Privacy en beveiliging</li>
          <li>Safari: Voorkeuren → Privacy</li>
          <li>Edge: Instellingen → Cookies en sitemachtigingen</li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Contact">
        <p>
          Vragen over onze cookieverklaring? Mail naar{" "}
          <a href="mailto:privacy@merkly.nl" className="text-violet-400 hover:text-violet-300">
            privacy@merkly.nl
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
