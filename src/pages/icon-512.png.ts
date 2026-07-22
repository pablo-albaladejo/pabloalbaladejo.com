import type { APIRoute } from "astro";
import { renderIcon } from "../lib/og-card";

export const GET: APIRoute = async () => {
  const png = await renderIcon(512);
  return new Response(png, {
    headers: { "Content-Type": "image/png" },
  });
};
