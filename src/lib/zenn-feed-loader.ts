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
			const parsed = await Promise.all(
				entries.map(async ({ id, ...data }) => ({
					id,
					data: await parseData({ id, data }),
				})),
			);
			store.clear();
			for (const entry of parsed) {
				store.set(entry);
			}
		},
	};
}
