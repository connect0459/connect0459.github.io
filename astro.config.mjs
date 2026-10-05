// @ts-check

import { satteri } from '@astrojs/markdown-satteri';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { linkCardPlugin } from './src/lib/satteri-link-card.ts';

// https://astro.build/config
export default defineConfig({
	site: 'https://connect0459.github.io',
	integrations: [mdx(), sitemap()],
	markdown: {
		processor: satteri({ hastPlugins: [linkCardPlugin()] }),
	},
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Noto Sans JP',
			cssVariable: '--font-sans',
			fallbacks: ['sans-serif'],
			display: 'block',
			weights: ['300', '400', '500', '700'],
			subsets: ['latin', 'japanese'],
		},
	],
});
