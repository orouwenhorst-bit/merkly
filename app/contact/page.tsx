import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Neem contact op met Merkly voor vragen, feedback, partnerships of ondersteuning.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <LegalLayout title="Contact" lastUpdated="8 april 2026">
      <p>
        We horen graag van je. Of je nu een vraag hebt over je brand guide, een probleem wilt
        melden, of gewoon feedback wilt delen: je bent welkom.
      </p>

      <LegalSection heading="Algemene vragen">
        <p>
          Voor algemene vragen, feedback of partnerships kun je mailen naar{" "}
          <a href="mailto:info@merkly.nl" className="text-violet-400 hover:text-violet-300">
            info@merkly.nl
          </a>
          . We reageren doorgaans binnen 1&ndash;2 werkdagen.
        </p>
      </LegalSection>

      <LegalSection heading="Support">
        <p>
          Loop je tegen een technisch probleem aan of werkt je Premium-account niet zoals verwacht?
          Mail dan naar{" "}
          <a
            href="mailto:info@merkly.nl"
            className="text-violet-400 hover:text-violet-300"
          >
            info@merkly.nl
          </a>{" "}
          en vermeld zoveel mogelijk details (schermafbeelding, browser, stappen om het probleem te
          reproduceren).
        </p>
      </LegalSection>

      <LegalSection heading="Privacy en gegevens">
        <p>
          Wil je je gegevens inzien, corrigeren of laten verwijderen? Stuur een verzoek naar{" "}
          <a href="mailto:privacy@merkly.nl" className="text-violet-400 hover:text-violet-300">
            privacy@merkly.nl
          </a>
          . We reageren binnen 30 dagen, conform de AVG.
        </p>
      </LegalSection>

      <LegalSection heading="Bedrijfsgegevens">
        <p>
          Merkly
          <br />
          Eenmanszaak
          <br />
          Lokomotiefstraat 14
          <br />
          7331 AC Apeldoorn
          <br />
          Nederland
          <br />
          <br />
          KvK-nummer: 98654500
          <br />
          Btw-nummer: NL005346485B13
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
