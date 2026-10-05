import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { type Ogp, parseOgp } from '../features/link-card/ogp';
import type { OgpResolver } from '../features/link-card/card-for';

const FETCH_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry {
	readonly fetchedAt: number;
	readonly ogp: Ogp;
}

type CacheFile = Record<string, CacheEntry>;

interface Options {
	readonly cacheFile: string;
	readonly fetch?: typeof fetch;
	readonly now?: () => number;
}

async function readCache(cacheFile: string): Promise<CacheFile> {
	try {
		return JSON.parse(await readFile(cacheFile, 'utf8')) as CacheFile;
	} catch {
		return {};
	}
}

async function writeCache(cacheFile: string, cache: CacheFile): Promise<void> {
	await mkdir(dirname(cacheFile), { recursive: true });
	await writeFile(cacheFile, JSON.stringify(cache));
}

export function createOgpResolver({
	cacheFile,
	fetch: fetchPage = fetch,
	now = Date.now,
}: Options): OgpResolver {
	let loaded: Promise<CacheFile> | undefined;
	let writing: Promise<void> = Promise.resolve();

	const cache = () => (loaded ??= readCache(cacheFile));

	async function download(url: string): Promise<Ogp | undefined> {
		try {
			const response = await fetchPage(url, {
				signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
				headers: { accept: 'text/html' },
			});
			return response.ok ? parseOgp(await response.text(), url) : undefined;
		} catch {
			return undefined;
		}
	}

	async function resolveUncoalesced(url: string): Promise<Ogp | undefined> {
		const entries = await cache();
		const cached = entries[url];
		if (cached && now() - cached.fetchedAt < CACHE_TTL_MS) {
			return cached.ogp;
		}
		const fresh = await download(url);
		if (!fresh) {
			return cached?.ogp;
		}
		entries[url] = { fetchedAt: now(), ogp: fresh };
		writing = writing.then(() => writeCache(cacheFile, entries));
		await writing;
		return fresh;
	}

	const inFlight = new Map<string, Promise<Ogp | undefined>>();

	return (url) => {
		const pending = inFlight.get(url);
		if (pending) {
			return pending;
		}
		const started = resolveUncoalesced(url).finally(() => inFlight.delete(url));
		inFlight.set(url, started);
		return started;
	};
}
