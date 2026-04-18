/**
 * SVG Processing Module
 *
 * Derives color variants and cleans up SVG logos from Recraft.
 * Handles both hex (#RRGGBB) and rgb(R,G,B) color formats.
 */

interface ParsedColor {
  original: string;   // exact string as found in SVG
  r: number;
  g: number;
  b: number;
}

/** Parse an rgb() or hex color string into components */
function parseColor(str: string): ParsedColor | null {
  // rgb(R,G,B) or rgb(R, G, B)
  const rgbMatch = str.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    return { original: str, r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
  }
  // #RRGGBB
  const hexMatch = str.match(/#([0-9a-fA-F]{6})/);
  if (hexMatch) {
    const c = hexMatch[1];
    return {
      original: str,
      r: parseInt(c.slice(0, 2), 16),
      g: parseInt(c.slice(2, 4), 16),
      b: parseInt(c.slice(4, 6), 16),
    };
  }
  return null;
}

function isNearWhite(c: ParsedColor): boolean {
  return c.r > 240 && c.g > 240 && c.b > 240;
}

/**
 * Extract all fill/stroke color values from an SVG string.
 * Handles both hex and rgb() formats used by Recraft.
 */
function extractFillColors(svg: string): ParsedColor[] {
  const seen = new Set<string>();
  const colors: ParsedColor[] = [];

  // Match fill="..." and stroke="..." attributes
  const attrPattern = /(?:fill|stroke)="([^"]+)"/g;
  let match;
  while ((match = attrPattern.exec(svg)) !== null) {
    const val = match[1];
    if (val === "none" || val === "currentColor" || seen.has(val)) continue;
    const parsed = parseColor(val);
    if (parsed) {
      seen.add(val);
      colors.push(parsed);
    }
  }

  // Also match inline style fill/stroke
  const stylePattern = /(?:fill|stroke):\s*([^;}"]+)/g;
  while ((match = stylePattern.exec(svg)) !== null) {
    const val = match[1].trim();
    if (val === "none" || val === "currentColor" || seen.has(val)) continue;
    const parsed = parseColor(val);
    if (parsed) {
      seen.add(val);
      colors.push(parsed);
    }
  }

  // Also match stop-color in gradients
  const stopPattern = /stop-color="([^"]+)"/g;
  while ((match = stopPattern.exec(svg)) !== null) {
    const val = match[1];
    if (val === "none" || val === "currentColor" || seen.has(val)) continue;
    const parsed = parseColor(val);
    if (parsed) {
      seen.add(val);
      colors.push(parsed);
    }
  }
  const stopStylePattern = /stop-color:\s*([^;}"]+)/g;
  while ((match = stopStylePattern.exec(svg)) !== null) {
    const val = match[1].trim();
    if (val === "none" || val === "currentColor" || seen.has(val)) continue;
    const parsed = parseColor(val);
    if (parsed) {
      seen.add(val);
      colors.push(parsed);
    }
  }

  return colors;
}

/** Convert RGB values to a hex string */
function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
}

/** Format a target color as the same notation (rgb or hex) as the original */
function formatAs(original: string, targetHex: string): string {
  const parsed = parseColor(targetHex);
  if (!parsed) return targetHex;

  // If original was rgb(), output rgb()
  if (original.startsWith("rgb(")) {
    return `rgb(${parsed.r},${parsed.g},${parsed.b})`;
  }
  return targetHex;
}

/**
 * Replace all non-white colors in the SVG with a target color.
 * Preserves white/near-white backgrounds.
 */
function recolorSvg(svg: string, targetHex: string): string {
  const colors = extractFillColors(svg);
  let result = svg;

  for (const color of colors) {
    if (isNearWhite(color)) continue;
    const replacement = formatAs(color.original, targetHex);
    // Use split+join for reliable replacement (no regex special chars)
    result = result.split(color.original).join(replacement);
  }

  return result;
}

/**
 * Create a white mono logo: all colored shapes become white, near-white fills
 * (which are painted cutouts/negative space) become transparent so the
 * background shows through correctly on dark surfaces.
 */
export function recolorSvgToWhite(svg: string): string {
  const colors = extractFillColors(svg);
  let result = svg;

  for (const color of colors) {
    if (isNearWhite(color)) {
      // Near-white fills are cutout shapes — make transparent
      result = result
        .split(`fill="${color.original}"`).join(`fill="none"`)
        .split(`fill: ${color.original}`).join(`fill: none`)
        .split(`fill:${color.original}`).join(`fill:none`);
      continue;
    }
    const replacement = formatAs(color.original, "#FFFFFF");
    result = result.split(color.original).join(replacement);
  }

  return result;
}

/**
 * Remove the white background rectangle that Recraft V4 adds.
 * Recraft V4 outputs a full-viewport path as the first element:
 * <path d="M 0 0 L 2048 0 L 2048 2048 L 0 2048 L 0 0 z" fill="rgb(255,255,255)" transform="translate(0,0)"></path>
 *
 * Also handles <rect> elements used as white backgrounds.
 * Note: handles both self-closing (/>) and explicit close tags.
 */
function removeWhiteBackground(svg: string): string {
  const isWhiteFill = (tag: string) =>
    /fill="(?:rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|#[Ff]{6}|#[Ff]{3}|white)"/.test(tag) ||
    /fill:\s*(?:rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|#[Ff]{6}|#[Ff]{3}|white)/.test(tag);

  const isFullRectPath = (tag: string) =>
    /d="M\s*0\s+0\s+L\s+\d+\s+0\s+L\s+\d+\s+\d+\s+L\s+0\s+\d+/.test(tag);

  // <rect> that covers the whole canvas: x=0 y=0 (or no x/y) with width/height matching canvas
  const isFullCoverRect = (tag: string) =>
    /^<rect\b/.test(tag) && !/x="[^0]/.test(tag) && !/y="[^0]/.test(tag);

  // Match both <path .../> and <path ...></path>
  let result = svg.replace(/<path\b[^>]*(?:\/>|>(?:<\/path>)?)/g, (match) => {
    if (isWhiteFill(match) && isFullRectPath(match)) return "";
    return match;
  });

  // Also remove white <rect> background elements
  result = result.replace(/<rect\b[^>]*(?:\/>|>(?:<\/rect>)?)/g, (match) => {
    if (isWhiteFill(match) && isFullCoverRect(match)) return "";
    return match;
  });

  return result;
}

/**
 * Clean up an SVG from Recraft for use in the brand guide.
 * Normalizes viewBox, removes fixed dimensions.
 */
export function cleanSvg(svg: string): string {
  return svg
    .replace(/\s+width="\d+"/g, "")
    .replace(/\s+height="\d+"/g, "")
    .replace(/\s+preserveAspectRatio="none"/g, "")
    .replace(/\s+style="display:\s*block;?"/g, "");
}

export interface LogoVariants {
  fullColor: string;
  monoBlack: string;
  monoWhite: string;
  monoPrimary: string;
  transparent: string;
}

/**
 * Generate all color variants from a single SVG source.
 */
export function deriveLogoVariants(
  svg: string,
  primaryColor: string,
): LogoVariants {
  const cleaned = cleanSvg(svg);
  const noBackground = removeWhiteBackground(cleaned);

  return {
    fullColor: noBackground,
    monoBlack: recolorSvg(noBackground, "#000000"),
    monoWhite: recolorSvgToWhite(noBackground),
    monoPrimary: recolorSvg(noBackground, primaryColor.toUpperCase()),
    transparent: noBackground,
  };
}

/**
 * Wrap an SVG with proper attributes for embedding in HTML.
 */
export function svgForDisplay(svg: string, maxWidth = "100%"): string {
  if (!svg.includes("viewBox")) {
    const widthMatch = svg.match(/width="(\d+)"/);
    const heightMatch = svg.match(/height="(\d+)"/);
    if (widthMatch && heightMatch) {
      svg = svg.replace("<svg", `<svg viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"`);
    }
  }

  return svg
    .replace(/<svg([^>]*)>/, (_, attrs) => {
      const cleaned = attrs
        .replace(/\s+width="[^"]*"/g, "")
        .replace(/\s+height="[^"]*"/g, "")
        .replace(/\s+style="[^"]*"/g, "");
      return `<svg${cleaned} style="width:${maxWidth};height:auto;display:block;">`;
    });
}
