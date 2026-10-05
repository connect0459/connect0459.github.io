import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { createOgpResolver } from './ogp-resolver';

const URL_A = 'https://example.com/a';
const PAGE = `<meta property="og:title" content="Title A">`;
const DAY_MS = 24 * 60 * 60 * 1000;

function htmlResponse(body: string, status = 200): Response {
	return new Response(body, {
		status,
		headers: { 'content-type': 'text/html' },
	});
}

describe('createOgpResolver', () => {
	let cacheFile: string;
	let calls: string[];

	beforeEach(async () => {
		cacheFile = join(await mkdtemp(join(tmpdir(), 'ogp-')), 'cache.json');
		calls = [];
	});

	function resolverAt(
		now: number,
		respond: () => Response | Promise<Response>,
	) {
		return createOgpResolver({
			cacheFile,
			now: () => now,
			fetch: async (url) => {
				calls.push(String(url));
				return respond();
			},
		});
	}

	it('fetches the page and extracts its metadata', async () => {
		const resolve = resolverAt(0, () => htmlResponse(PAGE));
		expect((await resolve(URL_A))?.title).toBe('Title A');
	});

	it('serves a later run from the disk cache without fetching again', async () => {
		await resolverAt(0, () => htmlResponse(PAGE))(URL_A);
		const second = await resolverAt(DAY_MS, () => htmlResponse(''))(URL_A);
		expect(second?.title).toBe('Title A');
		expect(calls).toHaveLength(1);
	});

	it('refetches once the cached entry is older than a week', async () => {
		await resolverAt(0, () => htmlResponse(PAGE))(URL_A);
		const refreshed = await resolverAt(8 * DAY_MS, () =>
			htmlResponse(`<meta property="og:title" content="New">`),
		)(URL_A);
		expect(refreshed?.title).toBe('New');
		expect(calls).toHaveLength(2);
	});

	it('keeps serving a stale entry when refetching fails', async () => {
		await resolverAt(0, () => htmlResponse(PAGE))(URL_A);
		const stale = await resolverAt(30 * DAY_MS, () => htmlResponse('', 500))(
			URL_A,
		);
		expect(stale?.title).toBe('Title A');
	});

	it('yields nothing and caches nothing when the page cannot be fetched', async () => {
		const resolve = resolverAt(0, () => htmlResponse('', 404));
		expect(await resolve(URL_A)).toBeUndefined();
		await expect(readFile(cacheFile, 'utf8')).rejects.toThrow();
	});

	it('yields nothing when the request throws', async () => {
		const resolve = resolverAt(0, () => {
			throw new Error('offline');
		});
		expect(await resolve(URL_A)).toBeUndefined();
	});

	it('survives a corrupted cache file', async () => {
		await writeFile(cacheFile, '{not json');
		const resolve = resolverAt(0, () => htmlResponse(PAGE));
		expect((await resolve(URL_A))?.title).toBe('Title A');
	});

	it('fetches an address once even when it is requested concurrently', async () => {
		const resolve = resolverAt(0, () => htmlResponse(PAGE));
		await Promise.all([resolve(URL_A), resolve(URL_A), resolve(URL_A)]);
		expect(calls).toHaveLength(1);
	});

	describe('when the cache cannot be written', () => {
		const URL_B = 'https://example.com/b';

		beforeEach(async () => {
			const blocker = join(await mkdtemp(join(tmpdir(), 'ogp-')), 'blocker');
			await writeFile(blocker, '');
			cacheFile = join(blocker, 'cache.json');
		});

		it('still returns the metadata that was just fetched', async () => {
			const resolve = resolverAt(0, () => htmlResponse(PAGE));
			expect((await resolve(URL_A))?.title).toBe('Title A');
		});

		it('keeps resolving later addresses after a failed write', async () => {
			const resolve = resolverAt(0, () => htmlResponse(PAGE));
			await resolve(URL_A);
			expect((await resolve(URL_B))?.title).toBe('Title A');
		});
	});
});
