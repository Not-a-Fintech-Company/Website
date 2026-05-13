// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z
      .enum(['guides', 'models', 'docs', 'tools', 'resources', 'about'])
      .optional(),
    template: z
      .enum(['article', 'section-index', 'model', 'tool'])
      .optional(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().optional().default(false),
    ogImage: z.string().optional(),
    hideToc: z.boolean().optional().default(false),
    hideSidebar: z.boolean().optional().default(false),
  }),
});

export const collections = { pages };
