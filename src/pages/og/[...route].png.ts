import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { renderCard, truncate } from "../../lib/og-card";

type Target = { route: string; headline: string; subtitle: string };

async function targets(): Promise<Target[]> {
  const posts = await getCollection("blog");
  const fixed: Target[] = [
    {
      route: "index",
      headline: "I build production software with AI agents.",
      subtitle: "Senior Backend + AI Engineer — AWS, TypeScript — Madrid",
    },
    {
      route: "cv",
      headline: "Curriculum vitae",
      subtitle:
        "Senior Software Engineer & AI Architect — 9× AWS Certified — 17+ years",
    },
    {
      route: "talks",
      headline: "Talks",
      subtitle:
        "Shipping production software with AI agents · Evals · GEO",
    },
    {
      route: "blog",
      headline: "Writing",
      subtitle: "Evals, agentic development, and observability",
    },
  ];
  const blogCards: Target[] = posts.map((post) => ({
    route: `blog/${post.id}`,
    headline: post.data.title,
    subtitle: truncate(post.data.description),
  }));
  return [...fixed, ...blogCards];
}

export const getStaticPaths: GetStaticPaths = async () => {
  const all = await targets();
  return all.map((t) => ({
    params: { route: t.route },
    props: { headline: t.headline, subtitle: t.subtitle },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { headline, subtitle } = props as {
    headline: string;
    subtitle: string;
  };
  const png = await renderCard(headline, subtitle);
  return new Response(png, {
    headers: { "Content-Type": "image/png" },
  });
};
