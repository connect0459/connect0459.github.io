import type { Loader } from 'astro/loaders';
import { parseZennFeed } from '../features/zenn-feed/model';

export function zennFeedLoader(feedUrl: string): Loader {
	return {
		name: 'zenn-feed-loader',
		load: async ({ store, parseData }) => {
			const response = await fetch(feedUrl);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch Zenn feed (${response.status}): ${feedUrl}`,
				);
			}
			const entries = parseZennFeed(await response.text());
			store.clear();
			for (const { id, ...data } of entries) {
				store.set({ id, data: await parseData({ id, data }) });
			}
		},
	};
}
