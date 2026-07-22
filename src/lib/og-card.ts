// Build-time Open Graph card renderer. satori turns a small virtual-DOM tree
// into SVG, then @resvg/resvg-js rasterises that SVG to PNG — both ship
// prebuilt binaries, so no system rasteriser (poppler/rsvg) is required.
//
// satori needs real font buffers (ttf/otf/woff, NOT woff2). We read the STATIC
// @fontsource/source-serif-4 `.woff` files (weights 400/600/700) off disk. The
// "latin" subset covers every glyph the cards use (· × — ' etc. live in the
// U+0000-00FF and U+2000-206F ranges the subset declares).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

// Brand tokens (light palette) — mirror of src/styles/global.css.
const PAPER = "#fafaf7";
const INK = "#1c1b18";
const MUTED = "#57534b";
const FAINT = "#78716a";
const ACCENT_BR = "#e8571c"; // bermellón

const FONT = "Source Serif 4";

const fontDir = new URL(
  "../../node_modules/@fontsource/source-serif-4/files/",
  import.meta.url,
);

function loadFont(weight: 400 | 600 | 700): Buffer {
  return readFileSync(
    fileURLToPath(
      new URL(`source-serif-4-latin-${weight}-normal.woff`, fontDir),
    ),
  );
}

const fonts = [
  { name: FONT, data: loadFont(400), weight: 400 as const, style: "normal" as const },
  { name: FONT, data: loadFont(600), weight: 600 as const, style: "normal" as const },
  { name: FONT, data: loadFont(700), weight: 700 as const, style: "normal" as const },
];

// Minimal satori-node factory. satori accepts React-element-shaped nodes:
// { type, props: { style, children } }. `children` may be a string, one node,
// or an array. Every element with more than one child MUST set an explicit
// `display: flex` + `flexDirection`, so we always spell those out below.
type Node = { type: string; props: Record<string, unknown> };

function el(
  type: string,
  style: Record<string, unknown>,
  children?: string | Node | Node[],
): Node {
  return { type, props: children === undefined ? { style } : { style, children } };
}

// The "pa" logo tile: dark rounded square, light "pa" in serif 700, and a short
// bermellón bar to its right — a scaled copy of the header lockup in Base.astro.
function tile(size: number): Node {
  return el(
    "div",
    {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      backgroundColor: INK,
      paddingBottom: Math.round(size * 0.17),
    },
    [
      el(
        "div",
        {
          color: PAPER,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: Math.round(size * 0.52),
          lineHeight: 1,
        },
        "pa",
      ),
      el("div", {
        width: Math.round(size * 0.14),
        height: Math.round(size * 0.08),
        marginLeft: Math.round(size * 0.03),
        marginBottom: Math.round(size * 0.07),
        backgroundColor: ACCENT_BR,
      }),
    ],
  );
}

// Headlines vary from one word ("Talks") to ~57-char post titles; scale the
// type so long titles wrap to 2–3 lines and still fit the 630px canvas.
function headlineSize(text: string): number {
  const n = text.length;
  if (n <= 24) return 68;
  if (n <= 40) return 60;
  if (n <= 54) return 54;
  return 48;
}

function cardTree(headline: string, subtitle: string): Node {
  return el(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: 1200,
      height: 630,
      padding: 80,
      backgroundColor: PAPER,
      fontFamily: FONT,
    },
    [
      // Brand lockup
      el(
        "div",
        { display: "flex", flexDirection: "row", alignItems: "center" },
        [
          tile(72),
          el(
            "div",
            {
              marginLeft: 24,
              color: INK,
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 30,
            },
            "Pablo Albaladejo",
          ),
        ],
      ),
      // Headline + subtitle
      el("div", { display: "flex", flexDirection: "column" }, [
        el(
          "div",
          {
            color: INK,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: headlineSize(headline),
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          },
          headline,
        ),
        el(
          "div",
          {
            marginTop: 26,
            color: MUTED,
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 30,
            lineHeight: 1.4,
          },
          subtitle,
        ),
      ]),
      // Footer: wordmark URL + bermellón accent bar
      el(
        "div",
        {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        [
          el(
            "div",
            {
              color: FAINT,
              fontFamily: FONT,
              fontWeight: 400,
              fontSize: 22,
              letterSpacing: "0.06em",
            },
            "pabloalbaladejo.com",
          ),
          el("div", {
            width: 128,
            height: 8,
            borderRadius: 4,
            backgroundColor: ACCENT_BR,
          }),
        ],
      ),
    ],
  );
}

async function toPng(tree: Node, width: number, height: number): Promise<Buffer> {
  const svg = await satori(tree as never, { width, height, fonts });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  return resvg.render().asPng();
}

/** 1200×630 Open Graph card for a page. */
export function renderCard(headline: string, subtitle: string): Promise<Buffer> {
  return toPng(cardTree(headline, subtitle), 1200, 630);
}

/** Square "pa" tile icon (default 180 = apple-touch-icon). */
export function renderIcon(size = 180): Promise<Buffer> {
  return toPng(tile(size), size, size);
}

/** Truncate a subtitle to ~120 chars on a word boundary, adding an ellipsis. */
export function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : max).trimEnd()}…`;
}
