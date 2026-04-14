/**
 * Programmatic SVG logo generator.
 * Produces clean, professional logos without AI — always consistent.
 */

type Template = "square" | "circle" | "hexagon" | "split" | "overlap" | "bar";

function selectTemplate(industry: string, mood: string): Template {
  const i = industry.toLowerCase();
  const m = mood.toLowerCase();

  if (i.includes("zorg") || i.includes("welzijn") || i.includes("sport") || i.includes("fitness"))
    return "circle";
  if (i.includes("bouw") || i.includes("vastgoed") || i.includes("technologie") || i.includes("software"))
    return "hexagon";
  if (i.includes("creatief") || i.includes("design") || i.includes("mode") || i.includes("lifestyle"))
    return "split";
  if (i.includes("retail") || i.includes("e-commerce") || i.includes("horeca") || i.includes("food"))
    return "overlap";
  if (i.includes("consultancy") || i.includes("advies"))
    return "bar";
  if (m.includes("luxe") || m.includes("exclusief")) return "split";
  if (m.includes("gedurfd") || m.includes("innovatief")) return "hexagon";
  if (m.includes("warm") || m.includes("persoonlijk")) return "circle";
  if (m.includes("speels") || m.includes("energiek")) return "overlap";

  return "square";
}

function iconMark(
  initial: string,
  primary: string,
  accent: string,
  template: Template,
  size = 60
): string {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s / 2;
  const fontSize = Math.round(s * 0.48);

  switch (template) {
    case "square":
      return `
        <rect width="${s}" height="${s}" rx="${Math.round(s * 0.2)}" fill="${primary}"/>
        <text x="${cx}" y="${Math.round(s * 0.72)}" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle" fill="white">${initial}</text>`;

    case "circle":
      return `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${primary}"/>
        <circle cx="${cx}" cy="${cy}" r="${Math.round(r * 0.76)}" fill="none" stroke="white" stroke-width="${Math.round(s * 0.04)}" opacity="0.25"/>
        <text x="${cx}" y="${Math.round(s * 0.7)}" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle" fill="white">${initial}</text>`;

    case "hexagon": {
      const pts = [0, 60, 120, 180, 240, 300]
        .map((deg) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`;
        })
        .join(" ");
      return `
        <polygon points="${pts}" fill="${primary}"/>
        <text x="${cx}" y="${Math.round(s * 0.72)}" font-family="Arial,sans-serif" font-size="${Math.round(fontSize * 0.88)}" font-weight="700" text-anchor="middle" fill="white">${initial}</text>`;
    }

    case "split":
      return `
        <rect width="${s}" height="${s}" rx="${Math.round(s * 0.16)}" fill="${primary}"/>
        <path d="M0,${s} L${s},${Math.round(s * 0.28)} L${s},${s} Z" fill="${accent}" opacity="0.22"/>
        <text x="${cx}" y="${Math.round(s * 0.72)}" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle" fill="white">${initial}</text>`;

    case "overlap": {
      const r1 = Math.round(r * 0.8);
      return `
        <circle cx="${Math.round(s * 0.38)}" cy="${cy}" r="${r1}" fill="${primary}"/>
        <circle cx="${Math.round(s * 0.62)}" cy="${cy}" r="${r1}" fill="${accent}" opacity="0.7"/>
        <text x="${cx}" y="${Math.round(s * 0.68)}" font-family="Arial,sans-serif" font-size="${Math.round(fontSize * 0.84)}" font-weight="700" text-anchor="middle" fill="white">${initial}</text>`;
    }

    case "bar": {
      const barW = Math.round(s * 0.14);
      const boxX = Math.round(s * 0.2);
      return `
        <rect x="0" y="${Math.round(s * 0.08)}" width="${barW}" height="${Math.round(s * 0.84)}" rx="${Math.round(barW / 2)}" fill="${accent}"/>
        <rect x="${boxX}" y="0" width="${s - boxX}" height="${s}" rx="${Math.round(s * 0.14)}" fill="${primary}"/>
        <text x="${boxX + (s - boxX) / 2}" y="${Math.round(s * 0.72)}" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle" fill="white">${initial}</text>`;
    }
  }
}

/** Full wordmark: icon mark + company name text */
export function generateWordmarkSvg(
  companyName: string,
  industry: string,
  mood: string,
  primaryColor: string,
  accentColor: string
): string {
  const initial = companyName.charAt(0).toUpperCase();
  const template = selectTemplate(industry, mood);

  const iconSize = 52;
  const gap = 16;
  const fontSize = 38;
  // Approximate character width for Arial Bold at given font-size
  const approxCharWidth = fontSize * 0.58;
  const textWidth = Math.ceil(companyName.length * approxCharWidth);
  const totalW = iconSize + gap + textWidth + 4;
  const totalH = iconSize;

  const mark = iconMark(initial, primaryColor, accentColor, template, iconSize);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" style="width:100%;height:auto;display:block;">
  <g>${mark}</g>
  <text x="${iconSize + gap}" y="${Math.round(totalH * 0.72)}" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="700" fill="${primaryColor}">${companyName}</text>
</svg>`;
}

/** Standalone square icon — for favicon, avatar, app icon */
export function generateIconSvg(
  companyName: string,
  industry: string,
  mood: string,
  primaryColor: string,
  accentColor: string
): string {
  const initial = companyName.charAt(0).toUpperCase();
  const template = selectTemplate(industry, mood);
  const mark = iconMark(initial, primaryColor, accentColor, template, 100);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="width:100%;height:auto;display:block;">
  ${mark}
</svg>`;
}

/**
 * Subtle background pattern using brand color.
 * Picks one of 6 distinct pattern styles based on the primary color value
 * so each brand gets a unique-feeling pattern.
 */
export function generatePatternSvg(primaryColor: string, accentColor: string): string {
  const hex = primaryColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Deterministic pattern selection from color value (0–5)
  const patternIndex = (r + g * 3 + b * 7) % 6;
  const lo = 0.07;  // low opacity
  const hi = 0.11;  // high opacity

  const wrap = (inner: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none" style="width:100%;height:100%;display:block;"><defs><pattern id="p" patternUnits="userSpaceOnUse" width="48" height="48">${inner}</pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>`;

  switch (patternIndex) {
    // 0: dot grid — kleine stippen op regelmatig raster
    case 0:
      return wrap(`
        <circle cx="6" cy="6" r="1.5" fill="${primaryColor}" opacity="${hi}"/>
        <circle cx="30" cy="6" r="1.5" fill="${primaryColor}" opacity="${hi}"/>
        <circle cx="6" cy="30" r="1.5" fill="${primaryColor}" opacity="${hi}"/>
        <circle cx="30" cy="30" r="1.5" fill="${primaryColor}" opacity="${hi}"/>
        <circle cx="18" cy="18" r="2" fill="${accentColor}" opacity="${hi}"/>
      `);

    // 1: diagonale lijnen — dunne evenwijdige schuine lijnen
    case 1:
      return wrap(`
        <line x1="0" y1="48" x2="48" y2="0" stroke="${primaryColor}" stroke-width="0.8" opacity="${hi}"/>
        <line x1="24" y1="48" x2="48" y2="24" stroke="${primaryColor}" stroke-width="0.8" opacity="${lo}"/>
        <line x1="0" y1="24" x2="24" y2="0" stroke="${primaryColor}" stroke-width="0.8" opacity="${lo}"/>
      `);

    // 2: ruitenpatroon — overlappende diagonale lijnen in twee richtingen
    case 2:
      return wrap(`
        <line x1="0" y1="48" x2="48" y2="0" stroke="${primaryColor}" stroke-width="0.6" opacity="${lo}"/>
        <line x1="24" y1="48" x2="48" y2="24" stroke="${primaryColor}" stroke-width="0.6" opacity="${lo}"/>
        <line x1="0" y1="24" x2="24" y2="0" stroke="${primaryColor}" stroke-width="0.6" opacity="${lo}"/>
        <line x1="0" y1="0" x2="48" y2="48" stroke="${accentColor}" stroke-width="0.6" opacity="${lo}"/>
        <line x1="0" y1="24" x2="24" y2="48" stroke="${accentColor}" stroke-width="0.6" opacity="${lo}"/>
        <line x1="24" y1="0" x2="48" y2="24" stroke="${accentColor}" stroke-width="0.6" opacity="${lo}"/>
      `);

    // 3: cirkels — concentrische ringen als stempel
    case 3:
      return wrap(`
        <circle cx="24" cy="24" r="18" fill="none" stroke="${primaryColor}" stroke-width="0.8" opacity="${lo}"/>
        <circle cx="24" cy="24" r="10" fill="none" stroke="${primaryColor}" stroke-width="0.6" opacity="${hi}"/>
        <circle cx="24" cy="24" r="3" fill="${accentColor}" opacity="${hi}"/>
        <circle cx="0" cy="0" r="10" fill="none" stroke="${primaryColor}" stroke-width="0.6" opacity="${lo}"/>
        <circle cx="48" cy="48" r="10" fill="none" stroke="${primaryColor}" stroke-width="0.6" opacity="${lo}"/>
      `);

    // 4: kleine kruisjes / plusjes
    case 4:
      return wrap(`
        <line x1="4" y1="2" x2="4" y2="8" stroke="${primaryColor}" stroke-width="1" opacity="${hi}" stroke-linecap="round"/>
        <line x1="1" y1="5" x2="7" y2="5" stroke="${primaryColor}" stroke-width="1" opacity="${hi}" stroke-linecap="round"/>
        <line x1="28" y1="26" x2="28" y2="32" stroke="${primaryColor}" stroke-width="1" opacity="${hi}" stroke-linecap="round"/>
        <line x1="25" y1="29" x2="31" y2="29" stroke="${primaryColor}" stroke-width="1" opacity="${hi}" stroke-linecap="round"/>
        <line x1="16" y1="14" x2="16" y2="18" stroke="${accentColor}" stroke-width="0.8" opacity="${lo}" stroke-linecap="round"/>
        <line x1="14" y1="16" x2="18" y2="16" stroke="${accentColor}" stroke-width="0.8" opacity="${lo}" stroke-linecap="round"/>
        <line x1="40" y1="38" x2="40" y2="42" stroke="${accentColor}" stroke-width="0.8" opacity="${lo}" stroke-linecap="round"/>
        <line x1="38" y1="40" x2="42" y2="40" stroke="${accentColor}" stroke-width="0.8" opacity="${lo}" stroke-linecap="round"/>
      `);

    // 5: driehoeken — kleine gestikte driehoekjes
    default:
      return wrap(`
        <polygon points="24,4 44,42 4,42" fill="none" stroke="${primaryColor}" stroke-width="0.8" opacity="${lo}"/>
        <polygon points="0,26 14,2 14,48" fill="none" stroke="${accentColor}" stroke-width="0.6" opacity="${lo}"/>
        <polygon points="48,26 34,2 34,48" fill="none" stroke="${accentColor}" stroke-width="0.6" opacity="${lo}"/>
      `);
  }
}
