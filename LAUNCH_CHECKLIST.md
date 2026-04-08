# Merkly — NL Launch Checklist

Dit is wat er nog moet gebeuren om Merkly echt te kunnen lanceren op de Nederlandse markt. Alles wat ik technisch kon voorbereiden is al gedaan — de rest zijn dingen waarvoor ik jou nodig heb (KvK, betaalaccounts, domeinen, etc.).

## Wat ik al heb voorbereid (code-kant)

- [x] Root layout `app/layout.tsx` volledig in NL met correcte SEO metadata (title template, description, OG-tags, Twitter card, canonical, `lang="nl"`, robots, viewport, theme-color, icons)
- [x] `app/robots.ts` — dynamische robots.txt, blokkeert `/api/` en `/result/`
- [x] `app/sitemap.ts` — automatische sitemap.xml met alle publieke pagina's
- [x] `/privacy` — AVG/GDPR-conforme privacyverklaring (noemt Anthropic, Recraft, Supabase, Stripe, Vercel als subverwerkers)
- [x] `/voorwaarden` — Algemene voorwaarden met NL-recht, herroepingsrecht art. 6:230p BW
- [x] `/cookies` — Cookieverklaring (privacy-vriendelijke aanpak zonder trackers)
- [x] `/contact` — Contactpagina met info@, support@, privacy@ mailadressen
- [x] Footer-links op homepage wijzen nu naar de nieuwe legal pages (geen dead links meer naar `/generate`)
- [x] Scroll-anchors (`#features`, `#pricing`) op de homepage

## Wat jij moet doen

### 1. Juridisch / bedrijfsmatig (hoogste prioriteit)

- [ ] **KvK-inschrijving** — je hebt een ingeschreven onderneming nodig voor Stripe, BTW-afdracht en facturatie. Kosten: eenmalig ~€80. Doen bij [kvk.nl](https://www.kvk.nl).
- [ ] **BTW-nummer aanvragen** — krijg je automatisch na KvK-inschrijving van de Belastingdienst.
- [ ] **KvK- en BTW-nummer invullen** in `app/contact/page.tsx` (nu staat er placeholder-tekst).
- [ ] **Juridische check van de legal pages** — laat `/privacy` en `/voorwaarden` door een jurist checken voordat je live gaat. Mijn teksten zijn solide startpunten maar geen vervanging voor juridisch advies, zeker niet voor een betaalde SaaS. Probeer [DoNotPay](https://donotpay.com), [Legalloom](https://legalloom.nl), of een juridisch abonnement bij je verzekering.
- [ ] **Verwerkersovereenkomsten** afsluiten met alle subverwerkers (Anthropic, Recraft, Supabase, Stripe, Vercel). De meeste zijn standaard beschikbaar via hun dashboards — check de Data Processing Addendum (DPA) pagina's.

### 2. Domein en hosting

- [ ] **Domein kopen** — `merkly.nl` of alternatief. Check beschikbaarheid via [SIDN](https://www.sidn.nl) of [TransIP](https://transip.nl). Kosten: ~€10/jaar.
- [ ] **DNS instellen** — wijzen naar Vercel (A/CNAME records).
- [ ] **Vercel productie deploy** — `vercel.com` account, repo koppelen, `main` branch als production. Zet alle env vars over naar Vercel dashboard.
- [ ] **Environment variables** in Vercel zetten:
  - `ANTHROPIC_API_KEY`
  - `RECRAFT_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (als je die gebruikt)
  - `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (als Premium live gaat)
  - `NEXT_PUBLIC_SITE_URL=https://merkly.nl`
- [ ] **Custom domein** koppelen in Vercel en SSL-certificaat laten genereren (gebeurt automatisch).

### 3. Betalingen (Stripe)

- [ ] **Stripe account** activeren ([stripe.com](https://stripe.com)) met KvK-gegevens.
- [ ] **Identiteitsverificatie** doorlopen in Stripe Dashboard.
- [ ] **Stripe Tax** activeren voor automatische BTW-berekening in de EU.
- [ ] **Product + Price** aanmaken voor Premium €14/maand.
- [ ] **Webhook endpoint** configureren: `https://merkly.nl/api/stripe/webhook` met de events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- [ ] **Live-keys** invoeren in Vercel env vars.

### 4. Supabase productie

- [ ] **Nieuw Supabase project** aanmaken in **EU-regio** (Frankfurt of Ierland) — belangrijk voor AVG.
- [ ] **Database schema** migreren (tabellen `brand_guides` etc.). Als je migraties hebt: `supabase db push`. Anders handmatig kopiëren vanuit dev-project.
- [ ] **Storage bucket `logos`** aanmaken met public read access.
- [ ] **Row Level Security (RLS)** policies checken op alle tabellen.
- [ ] **Backups** inschakelen (Pro-plan, €25/maand — aanrader zodra je betalende klanten hebt).
- [ ] Productie-URL en keys in Vercel env vars zetten.

### 5. API-billing

- [ ] **Anthropic billing** — credit card toevoegen op [console.anthropic.com](https://console.anthropic.com), spend limits instellen zodat je nooit voor verrassingen komt te staan. Reken ~€0.02 per brand guide.
- [ ] **Recraft billing** — [recraft.ai](https://recraft.ai) account met credits. Reken ~€0.04 per logo (recraftv2).
- [ ] **Spend alerts** instellen bij beide API's.
- [ ] **Rate limiting** toevoegen aan `/api/generate` om abuse te voorkomen (bijv. max 3 gratis generaties per IP per uur — nog niet geïmplementeerd).

### 6. E-mail

- [ ] **Mailboxen opzetten**: `info@`, `support@`, `privacy@` — bijvoorbeeld via je domein-provider of [Fastmail](https://fastmail.com) (~€5/maand).
- [ ] **SPF, DKIM, DMARC** records in DNS zetten (anders gaat uitgaande mail naar spam).
- [ ] **Transactionele e-mail** (voor Premium-bevestigingen) — [Resend](https://resend.com), [Postmark](https://postmarkapp.com) of [Loops](https://loops.so). Resend heeft een royale free tier en werkt goed met Next.js.

### 7. Analytics en monitoring

- [ ] **Privacy-vriendelijke analytics** — [Plausible](https://plausible.io) (€9/maand) of [Simple Analytics](https://simpleanalytics.com). Beide cookieloos → geen cookiebanner nodig.
- [ ] **Error tracking** — [Sentry](https://sentry.io) gratis tier voor een solo project is prima.
- [ ] **Uptime monitoring** — [Better Stack](https://betterstack.com) of [UptimeRobot](https://uptimerobot.com), beide hebben gratis tiers.

### 8. Marketing-basics

- [ ] **OG-afbeelding** maken (1200×630) en plaatsen in `public/og-image.png` — ik heb de metadata er al naar laten verwijzen. Canva of Figma templates werken prima. Je zou zelfs Merkly kunnen gebruiken 😉
- [ ] **Favicon set** (`favicon.ico`, `apple-touch-icon.png`) in `public/`.
- [ ] **Google Search Console** verifiëren (DNS TXT record of HTML meta tag).
- [ ] **Sitemap indienen** in Google Search Console na launch.
- [ ] **LinkedIn/X/Instagram account** voor Merkly, of gebruik je persoonlijke account.

### 9. Pre-launch checks

- [ ] **Lighthouse audit** draaien (Performance, Accessibility, SEO) — mikken op >90 op alle assen.
- [ ] **Cross-browser test** — Chrome, Safari, Firefox, mobile Safari.
- [ ] **Responsive check** — iPhone SE (375px), iPad, desktop.
- [ ] **Cookiebanner** — als je toch trackers toevoegt, heb je er een nodig (bijv. [cookiebot.com](https://cookiebot.com)). Zolang je alleen Plausible + functionele cookies gebruikt, is er geen banner nodig.
- [ ] **Load test** — `/api/generate` onder druk zetten (bijv. via [k6](https://k6.io)) om te zien of rate limiting werkt.

### 10. Nice-to-have (voor na launch)

- [ ] Referral systeem (geef 1 gratis generatie weg voor elke aanmelding)
- [ ] Blog (SEO-content over merknamen kiezen, kleurpsychologie, etc.)
- [ ] Affiliate-programma voor freelance ontwerpers/consultants
- [ ] Template-bibliotheek met voorbeeld brand guides per branche
- [ ] Export naar Figma / Notion
- [ ] Nederlandstalige case studies van echte klanten

## Volgorde die ik zou aanhouden

1. KvK + BTW + domein kopen (week 1)
2. Juridische check legal pages (parallel, kan even duren)
3. Supabase EU productie + Vercel deploy + env vars (week 2)
4. Stripe productie + Premium checkout live (week 2-3)
5. E-mail setup + analytics + Sentry (week 3)
6. OG-image + favicon + Google Search Console (week 3)
7. Soft launch via LinkedIn / Twitter / IndieHackers (week 4)
8. Feedback verwerken, dan bredere launch

Laat me weten waar je vastloopt, dan help ik met de technische kanten.
