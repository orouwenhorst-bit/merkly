import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Merkly <noreply@merkly.nl>";
const LOGO_URL = "https://www.merkly.nl/logo-white.png";
const BASE_URL = "https://www.merkly.nl";

function baseTemplate(preheader: string, content: string) {
  return `<!DOCTYPE html>
<html lang="nl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Merkly</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;min-width:100%;">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <!-- Container -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header / Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <a href="${BASE_URL}" style="text-decoration:none;display:inline-block;">
                <img src="${LOGO_URL}" alt="Merkly" width="120" height="auto" style="display:block;border:0;max-width:120px;" />
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#111111;border:1px solid #222222;border-radius:16px;padding:40px 40px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#444444;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                © ${new Date().getFullYear()} Merkly &middot;
                <a href="${BASE_URL}" style="color:#444444;text-decoration:none;">merkly.nl</a>
                &middot;
                <a href="${BASE_URL}/dashboard/account" style="color:#444444;text-decoration:none;">Accountinstellingen</a>
              </p>
              <p style="margin:0;font-size:11px;color:#333333;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                Je ontvangt deze e-mail omdat je een Merkly-account hebt.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0;">
    <tr>
      <td style="border-radius:10px;background:linear-gradient(135deg,#7c3aed,#a855f7);">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function featureRow(icon: string, title: string, desc: string) {
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="32" style="vertical-align:top;padding-top:1px;">
            <span style="font-size:18px;">${icon}</span>
          </td>
          <td style="vertical-align:top;padding-left:8px;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${title}</p>
            <p style="margin:0;font-size:13px;color:#666666;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${desc}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export async function sendConfirmationEmail(email: string, confirmUrl: string) {
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      Bevestig je e-mailadres
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#888888;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      Klik op de knop hieronder om je account te activeren en direct aan de slag te gaan met Merkly.
    </p>

    ${ctaButton(confirmUrl, "E-mailadres bevestigen →")}

    <p style="margin:28px 0 0;font-size:13px;color:#555555;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      Werkt de knop niet? Kopieer dan deze link naar je browser:<br />
      <a href="${confirmUrl}" style="color:#a78bfa;text-decoration:none;word-break:break-all;">${confirmUrl}</a>
    </p>

    <hr style="margin:28px 0;border:0;border-top:1px solid #1e1e1e;" />

    <p style="margin:0;font-size:12px;color:#444444;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      Heb je geen account aangemaakt? Dan kun je deze e-mail negeren.
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bevestig je Merkly-account",
    html: baseTemplate("Activeer je account met één klik.", content),
  });
}

export async function sendWelcomeEmail(email: string, name?: string) {
  const firstName = name?.split(" ")[0] ?? "daar";

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      Welkom bij Merkly, ${firstName}!
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#888888;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      Je account is klaar. Genereer nu je eerste complete huisstijl, gratis, in minder dan een minuut.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${featureRow("🎨", "Kleurenpalet & typografie", "AI kiest harmonieuze kleuren en lettertypes die bij jouw merk passen")}
      ${featureRow("✍️", "Merkverhaal & tone of voice", "Een authentiek merkverhaal dat bij jou en je doelgroep past")}
      ${featureRow("🖼️", "AI-gegenereerd logo", "Een uniek logo in SVG én PNG, klaar voor gebruik")}
      ${featureRow("📄", "Online brand guide", "Direct te bekijken en te delen met je team of klanten")}
    </table>

    ${ctaButton(`${BASE_URL}/generate`, "Maak je eerste huisstijl →")}

    <hr style="margin:28px 0;border:0;border-top:1px solid #1e1e1e;" />

    <p style="margin:0;font-size:13px;color:#555555;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      Wil je meer? Met <strong style="color:#a78bfa;">Merkly Premium</strong> voor €18,95/maand krijg je onbeperkt genereren, PDF-downloads, AI-logo's en professionele mockups.
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welkom bij Merkly: maak je eerste huisstijl",
    html: baseTemplate("Je account is klaar. Start met je eerste huisstijl.", content),
  });
}

export async function sendPremiumEmail(email: string, name?: string) {
  const firstName = name?.split(" ")[0] ?? "daar";

  const content = `
    <div style="display:inline-block;background-color:#1a0f2e;border:1px solid #4c1d95;border-radius:20px;padding:4px 14px;margin-bottom:24px;">
      <span style="font-size:12px;font-weight:600;color:#a78bfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">✦ Merkly Premium actief</span>
    </div>

    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      Gefeliciteerd, ${firstName}!
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#888888;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      Je Merkly Premium abonnement is actief. Alle premium functies staan nu voor je klaar, zonder limieten.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${featureRow("⚡", "Onbeperkt genereren", "Geen daglimieten, genereer zoveel huisstijlen als je wilt")}
      ${featureRow("📄", "PDF brand guide", "Download een volledige, professionele brand guide als PDF")}
      ${featureRow("🖼️", "AI-gegenereerd logo", "SVG + PNG logo's, klaar voor print en digitaal gebruik")}
      ${featureRow("📱", "Professionele mockups", "Visitekaartje, social media en andere brandingmaterialen")}
    </table>

    ${ctaButton(`${BASE_URL}/generate`, "Ga naar Merkly →")}

    <hr style="margin:28px 0;border:0;border-top:1px solid #1e1e1e;" />

    <p style="margin:0;font-size:13px;color:#555555;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      Je kunt je abonnement op elk moment opzeggen via je
      <a href="${BASE_URL}/dashboard/account" style="color:#a78bfa;text-decoration:none;">accountinstellingen</a>.
      Je betaalt €18,95/maand en kunt op elk moment stoppen.
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Premium actief: welkom in Merkly Premium",
    html: baseTemplate("Je Merkly Premium abonnement is actief.", content),
  });
}
