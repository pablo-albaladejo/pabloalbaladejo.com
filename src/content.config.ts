import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!AGENTS.md"],
    base: "./src/content/blog",
  }),
  schema: z.object({
    title: z.string().max(65),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string().optional(),
    faq: z
      .array(
        z.object({
          q: z.string(),
          a: z.string(),
        }),
      )
      .optional(),
    sources: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
        }),
      )
      .optional(),
  }),
});

export const collections = { blog };
