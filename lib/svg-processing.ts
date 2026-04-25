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
 * Preserves white/near-white backgrounds and cutouts so the
 * mono-white variant can later turn them into transparent holes.
 */
function recolorSvg(svg: string, targetHex: string): string {
  const colors = extractFillColors(svg);
  let result = svg;

  for (const color of colors) {
    // Use the same robust luminance check as `isNearWhiteString` so a cutout
    // shaded as e.g. rgb(238,238,238) is preserved (not collapsed to target).
    if (isNearWhiteString(color.original)) continue;
    const replacement = formatAs(color.original, targetHex);
    // Use split+join for reliable replacement (no regex special chars)
    result = result.split(color.original).join(replacement);
  }

  return result;
}

/**
 * Compute relative luminance (0–1) of a color string in any common format.
 * Returns null if the format is not recognized.
 * Supports: named colors, #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba(), hsl(), hsla().
 */
function computeLuminance(s: string): number | null {
  const lower = s.trim().toLowerCase();

  // Named colors (focus on whites + black; for unknowns we fall through to parsers)
  const NAMED: Record<string, [number, number, number]> = {
    white: [255, 255, 255],
    snow: [255, 250, 250],
    ivory: [255, 255, 240],
    floralwhite: [255, 250, 240],
    whitesmoke: [245, 245, 245],
    ghostwhite: [248, 248, 255],
    aliceblue: [240, 248, 255],
    seashell: [255, 245, 238],
    oldlace: [253, 245, 230],
    linen: [250, 240, 230],
    mintcream: [245, 255, 250],
    lavenderblush: [255, 240, 245],
    azure: [240, 255, 255],
    cornsilk: [255, 248, 220],
    beige: [245, 245, 220],
    honeydew: [240, 255, 240],
    black: [0, 0, 0],
    transparent: [255, 255, 255], // treat as cutout
  };
  if (lower in NAMED) {
    const [r, g, b] = NAMED[lower];
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  // #RGB (3-char hex)
  let m = lower.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
  if (m) {
    const r = parseInt(m[1] + m[1], 16);
    const g = parseInt(m[2] + m[2], 16);
    const b = parseInt(m[3] + m[3], 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  // #RRGGBB or #RRGGBBAA
  m = lower.match(/^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/);
  if (m) {
    const c = m[1];
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  // rgb() / rgba() — accept integers or percentages
  m = lower.match(
    /^rgba?\(\s*(\d+(?:\.\d+)?)(%?)\s*,\s*(\d+(?:\.\d+)?)(%?)\s*,\s*(\d+(?:\.\d+)?)(%?)/,
  );
  if (m) {
    const toByte = (n: string, pct: string) =>
      pct === "%" ? (parseFloat(n) / 100) * 255 : parseFloat(n);
    const r = toByte(m[1], m[2]);
    const g = toByte(m[3], m[4]);
    const b = toByte(m[5], m[6]);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  // hsl() / hsla() — luminance approximated from L
  m = lower.match(/^hsla?\(\s*[\d.]+(?:deg)?\s*,\s*[\d.]+%\s*,\s*([\d.]+)%/);
  if (m) {
    return parseFloat(m[1]) / 100;
  }

  return null;
}

/**
 * Return true if a fill value string represents a "background" or "cutout"
 * — i.e. white or near-white in any common color format. Threshold ~0.85
 * catches anti-aliased / quantized off-whites like rgb(238,238,238).
 */
function isNearWhiteString(s: string): boolean {
  const lum = computeLuminance(s);
  return lum !== null && lum >= 0.85;
}

/**
 * Create a white mono logo using regex-based recoloring.
 * - Near-white fills/strokes/stop-colors → "none" (transparent cutouts)
 * - All other fills/strokes/stop-colors  → "#ffffff" (white logo shapes)
 * Handles every common color format: named, #RGB, #RRGGBB, #RRGGBBAA,
 * rgb(), rgba(), hsl(), hsla() — and inline styles inside `style="..."`
 * or <style> blocks.
 */
export function recolorSvgToWhite(svg: string): string {
  // First, drop any remaining full-canvas white background shapes that
  // might have slipped past `removeWhiteBackground` (different path notation,
  // different element type, etc.). This is belt-and-braces: even when
  // bg detection fails, the recolor below still neutralises white fills.
  let result = removeWhiteBackground(svg);

  const remap = (value: string): string =>
    isNearWhiteString(value) ? "none" : "#ffffff";

  // Replace fill="..." / stroke="..." / stop-color="..." attributes
  result = result.replace(
    /\b(fill|stroke|stop-color)\s*=\s*"([^"]*)"/gi,
    (_, attr: string, value: string) => {
      if (
        value === "none" ||
        value === "currentColor" ||
        value === "inherit" ||
        value.startsWith("url(")
      ) {
        return `${attr}="${value}"`;
      }
      return `${attr}="${remap(value)}"`;
    },
  );

  // Replace fill: ... / stroke: ... / stop-color: ... in inline styles
  // (also covers <style> blocks)
  result = result.replace(
    /\b(fill|stroke|stop-color)\s*:\s*([^;}"']+)/gi,
    (_, attr: string, value: string) => {
      const v = value.trim();
      if (
        v === "none" ||
        v === "currentColor" ||
        v === "inherit" ||
        v.startsWith("url(")
      ) {
        return `${attr}: ${v}`;
      }
      return `${attr}: ${remap(v)}`;
    },
  );

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
  const isWhiteFill = (tag: string): boolean => {
    const attrMatch = tag.match(/\bfill\s*=\s*"([^"]*)"/i);
    if (attrMatch && isNearWhiteString(attrMatch[1])) return true;
    const styleMatch = tag.match(/\bfill\s*:\s*([^;}"']+)/i);
    if (styleMatch && isNearWhiteString(styleMatch[1].trim())) return true;
    // No explicit fill = default black, not a white bg
    return false;
  };

  // Detect a path whose `d` starts at the canvas origin and traces the full
  // rectangle. Tolerant of comma vs space separators and missing whitespace
  // (Recraft sometimes minifies path data).
  const isFullRectPath = (tag: string): boolean => {
    const d = tag.match(/\bd\s*=\s*"([^"]*)"/i)?.[1];
    if (!d) return false;
    // Normalise path data so we can match consistently regardless of how
    // Recraft formatted it: insert a space between every command letter and
    // its operands, between digits and command letters, and treat commas as
    // separators. End result: tokens always separated by single spaces.
    const norm = d
      .toLowerCase()
      .replace(/([a-z])/g, " $1 ") // pad command letters
      .replace(/[,\s]+/g, " ") // collapse separators
      .trim();
    // Match: m 0 0 l W 0 l W H l 0 H ...
    return /^m\s+0\s+0\s+l\s+\d+\s+0\s+l\s+\d+\s+\d+\s+l\s+0\s+\d+/.test(norm);
  };

  // <rect> that covers the whole canvas: x=0 y=0 (or no x/y).
  // We don't strictly check width/height — any white full-cover rect at the
  // origin is considered a background.
  const isFullCoverRect = (tag: string): boolean =>
    /^<rect\b/i.test(tag) && !/\bx\s*=\s*"[^0"]/.test(tag) && !/\by\s*=\s*"[^0"]/.test(tag);

  // Match both <path .../> and <path ...></path>
  let result = svg.replace(/<path\b[^>]*(?:\/>|>(?:<\/path>)?)/gi, (match) => {
    if (isWhiteFill(match) && isFullRectPath(match)) return "";
    return match;
  });

  // Also remove white <rect> background elements
  result = result.replace(/<rect\b[^>]*(?:\/>|>(?:<\/rect>)?)/gi, (match) => {
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
