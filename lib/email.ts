import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Merkly <noreply@merkly.nl>";

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Merkly</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                <span style="color:#ffffff;">Merk</span><span style="color:#a78bfa;">ly</span>
              </span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background:#141414;border:1px solid #222;border-radius:16px;padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#555;">
                © ${new Date().getFullYear()} Merkly · <a href="https://www.merkly.nl" style="color:#555;text-decoration:none;">merkly.nl</a>
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

export async function sendWelcomeEmail(email: string, name?: string) {
  const firstName = name?.split(" ")[0] ?? "daar";

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">
      Welkom bij Merkly, ${firstName}!
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#888;line-height:1.6;">
      Je account is aangemaakt. Je kunt nu direct je eerste huisstijl genereren, gratis.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        ["🎨", "Kleurenpalet & typografie", "AI kiest harmonieuze kleuren en lettertypes"],
        ["✍️", "Merkverhaal & tone of voice", "Een authentiek verhaal dat bij jou past"],
        ["📄", "Online brand guide", "Direct te bekijken en te delen"],
      ].map(([icon, title, desc]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #222;">
            <span style="font-size:18px;">${icon}</span>
            <span style="display:inline-block;margin-left:12px;vertical-align:middle;">
              <span style="display:block;font-size:14px;font-weight:600;color:#fff;">${title}</span>
              <span style="display:block;font-size:13px;color:#666;">${desc}</span>
            </span>
          </td>
        </tr>
      `).join("")}
    </table>

    <a href="https://www.merkly.nl/generate"
       style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">
      Maak je eerste huisstijl →
    </a>

    <p style="margin:28px 0 0;font-size:13px;color:#555;line-height:1.6;">
      Wil je meer? Upgrade naar <strong style="color:#a78bfa;">Merkly Premium</strong> voor onbeperkt genereren, PDF-downloads, AI-logo's en meer, voor €18,95/maand.
    </p>
  `);

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welkom bij Merkly: maak je eerste huisstijl",
    html,
  });
}

export async function sendPremiumEmail(email: string, name?: string) {
  const firstName = name?.split(" ")[0] ?? "daar";

  const html = baseTemplate(`
    <div style="display:inline-block;background:linear-gradient(135deg,#7c3aed22,#a855f722);border:1px solid #7c3aed55;border-radius:20px;padding:4px 14px;margin-bottom:20px;">
      <span style="font-size:12px;font-weight:600;color:#a78bfa;">✦ Merkly Premium</span>
    </div>

    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;">
      Premium actief, ${firstName}!
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#888;line-height:1.6;">
      Je abonnement is geactiveerd. Alle premium functies staan nu voor je klaar.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        ["⚡", "Onbeperkt genereren", "Geen daglimieten meer"],
        ["📄", "PDF-download", "Volledige brand guide als professioneel PDF"],
        ["🎨", "AI-gegenereerd logo", "SVG + PNG klaar voor gebruik"],
        ["📱", "Mockups", "Visitekaartje, social media en meer"],
      ].map(([icon, title, desc]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #222;">
            <span style="font-size:18px;">${icon}</span>
            <span style="display:inline-block;margin-left:12px;vertical-align:middle;">
              <span style="display:block;font-size:14px;font-weight:600;color:#fff;">${title}</span>
              <span style="display:block;font-size:13px;color:#666;">${desc}</span>
            </span>
          </td>
        </tr>
      `).join("")}
    </table>

    <a href="https://www.merkly.nl/generate"
       style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">
      Ga naar Merkly →
    </a>

    <p style="margin:28px 0 0;font-size:13px;color:#555;line-height:1.6;">
      Je kunt je abonnement op elk moment opzeggen via je <a href="https://www.merkly.nl/dashboard/account" style="color:#a78bfa;text-decoration:none;">accountinstellingen</a>.
    </p>
  `);

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Premium actief: je Merkly account is geüpgraded",
    html,
  });
}
