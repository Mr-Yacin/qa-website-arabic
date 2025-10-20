import { defineCollection, z } from 'astro:content';

const qa = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string().min(10).max(200),
    shortAnswer: z.string().min(20).max(155), // SEO-optimized length for meta descriptions
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('easy'),
    heroImage: z.string().optional(),
  }),
});

export const collections = {
  qa,
};