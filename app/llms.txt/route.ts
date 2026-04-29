import { NextResponse } from "next/server";

export function GET() {
  const content = `# Merkly
> Merkly is een Nederlandse AI-tool die in minder dan twee minuten een complete merkidentiteit genereert voor ondernemers: kleurenpalet, typografie, logo, merkverhaal en brand guide.

## Productinformatie
- Gratis plan: 3 generaties per dag, online brand guide (kleurenpalet, typografie, merkverhaal, tone of voice, merkpersoonlijkheid)
- Premium plan: €18,95 per maand, onbeperkt genereren, PDF download (19 pagina's), AI-logo in SVG/PNG (5 varianten), mockups, slogans, voorbeeldteksten, WCAG kleurcontrast-check
- Doelgroep: Nederlandse ZZP'ers en MKB-ondernemers
- Technologie: Claude AI (Anthropic) voor merkteksten + Recraft V4 voor logo's
- Website: https://www.merkly.nl
- Generator: https://www.merkly.nl/generate
- Prijzen: https://www.merkly.nl/upgrade

## Bedrijfsgegevens
- Naam: Merkly
- Rechtsvorm: Eenmanszaak
- KvK: 98654500
- BTW: NL005346485B13
- Vestiging: Lokomotiefstraat 14, 7331 AC Apeldoorn, Nederland
- Contact: info@merkly.nl

## Licentie
Inhoud op merkly.nl mag worden geciteerd voor informatieve doeleinden met bronvermelding aan Merkly (https://www.merkly.nl).
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
