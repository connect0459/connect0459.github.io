import type { Loader } from 'astro/loaders';
import { parseZennFeed } from '../features/zenn-feed/model';

const FETCH_TIMEOUT_MS = 10_000;

export function zennFeedLoader(feedUrl: string): Loader {
	return {
		name: 'zenn-feed-loader',
		load: async ({ store, parseData }) => {
			const response = await fetch(feedUrl, {
				signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
			});
			if (!response.ok) {
				throw new Error(
					`Failed to fetch Zenn feed (${response.status}): ${feedUrl}`,
				);
			}
			const entries = parseZennFeed(await response.text());
			if (entries.length === 0) {
				throw new Error(`Zenn feed contains no articles: ${feedUrl}`);
			}
			store.clear();
			for (const { id, ...data } of entries) {
				store.set({ id, data: await parseData({ id, data }) });
			}
		},
	};
}
