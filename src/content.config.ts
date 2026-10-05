import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { ZENN_FEED_URL } from './consts';
import { zennFeedLoader } from './lib/zenn-feed-loader';

const articles = defineCollection({
	// Load Markdown and MDX files in the `src/content/articles/` directory.
	loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const links = defineCollection({
	loader: zennFeedLoader(ZENN_FEED_URL),
	schema: z.object({
		title: z.string(),
		url: z.url(),
		pubDate: z.coerce.date(),
	}),
});

export const collections = { articles, links };
