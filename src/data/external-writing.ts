// Writing published on other platforms (guest posts, publications).
// Kept here so the home page and /blog list stay in sync. Newest first.
// `iso` is the single source of truth for the date: it is both the
// <time datetime> value and what the display label is derived from.
export const externalWriting = [
  {
    title: "Stop Chatting, Start Specifying: Spec-Driven Design with Kiro IDE",
    href: "https://dev.to/kirodotdev/stop-chatting-start-specifying-spec-driven-design-with-kiro-ide-3b3o",
    venue: "Kiro blog",
    iso: "2025-12-01",
  },
  {
    title: "Observable AI Streaming on AWS",
    href: "https://dev.to/pabloalbaladejo/observable-ai-streaming-on-aws-part-1-api-gateway-rest-with-lambda-595a",
    venue: "dev.to · 4-part series",
    iso: "2025-02",
  },
];

// Render an ISO date ("YYYY-MM" or "YYYY-MM-DD") as a "Mon YYYY" label.
export const fmtMonthYear = (iso: string): string =>
  new Date(iso.length === 7 ? `${iso}-01` : iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
