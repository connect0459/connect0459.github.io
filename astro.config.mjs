// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://connect0459.github.io',
	integrations: [mdx(), sitemap()],
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
