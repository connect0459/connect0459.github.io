import type { Loader } from 'astro/loaders';
import { parseZennFeed } from '../features/zenn-feed/model';
import { canReuseStoredFeed } from '../features/zenn-feed/offline-fallback';

const FETCH_TIMEOUT_MS = 10_000;

function describeFailure(error: unknown): string {
	if (!(error instanceof Error)) {
		return String(error);
	}
	const cause = error.cause;
	const code =
		cause instanceof Error && 'code' in cause ? String(cause.code) : undefined;
	return code ? `${error.message}: ${code}` : error.message;
}

export function zennFeedLoader(feedUrl: string): Loader {
	return {
		name: 'zenn-feed-loader',
		load: async ({ store, parseData, logger }) => {
			let response: Response;
			try {
				response = await fetch(feedUrl, {
					signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
				});
			} catch (error) {
				const storedCount = store.keys().length;
				if (canReuseStoredFeed(process.argv.slice(2), storedCount)) {
					logger.warn(
						`Could not reach the Zenn feed (${describeFailure(error)}); using ${storedCount} previously loaded links, which may be outdated. Production builds always fetch the feed: ${feedUrl}`,
					);
					return;
				}
				throw error;
			}
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
