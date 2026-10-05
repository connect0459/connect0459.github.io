import { describe, expect, it } from 'vitest';
import { parseZennFeed } from './model';

function feedOf(...items: string[]): string {
	return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title><![CDATA[Feed]]></title><link>https://zenn.dev/someone</link>${items.join('')}</channel></rss>`;
}

function itemOf(title: string, link: string, pubDate: string): string {
	return `<item><title><![CDATA[${title}]]></title><description><![CDATA[body]]></description><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${pubDate}</pubDate></item>`;
}

describe('parseZennFeed', () => {
	it('extracts title, url and publication date from each feed item', () => {
		const xml = feedOf(
			itemOf(
				'First article',
				'https://zenn.dev/someone/articles/first',
				'Thu, 01 Oct 2026 10:15:55 GMT',
			),
		);

		expect(parseZennFeed(xml)).toEqual([
			{
				id: 'someone/first',
				title: 'First article',
				url: 'https://zenn.dev/someone/articles/first',
				pubDate: new Date('2026-10-01T10:15:55Z'),
			},
		]);
	});

	it('rejects a feed that contains no articles', () => {
		expect(() => parseZennFeed(feedOf())).toThrow(/no articles/);
	});

	it('does not mistake the channel metadata for an article', () => {
		const xml = feedOf(
			itemOf(
				'Only article',
				'https://zenn.dev/someone/articles/only',
				'Thu, 01 Oct 2026 10:15:55 GMT',
			),
		);

		expect(parseZennFeed(xml).map((entry) => entry.title)).toEqual([
			'Only article',
		]);
	});

	it('keeps articles published under a publication', () => {
		const xml = feedOf(
			itemOf(
				'Publication article',
				'https://zenn.dev/some_publication/articles/abc123',
				'Tue, 24 Dec 2024 08:41:58 GMT',
			),
		);

		expect(parseZennFeed(xml).map((entry) => entry.id)).toEqual([
			'some_publication/abc123',
		]);
	});

	it('decodes XML entities in titles that are not wrapped in CDATA', () => {
		const xml = feedOf(
			'<item><title>A &amp; B &lt;C&gt;</title><link>https://zenn.dev/someone/articles/x</link><pubDate>Thu, 01 Oct 2026 10:15:55 GMT</pubDate></item>',
		);

		expect(parseZennFeed(xml)[0]?.title).toBe('A & B <C>');
	});

	it('keeps articles with the same slug under different owners apart', () => {
		const xml = feedOf(
			itemOf(
				'A',
				'https://zenn.dev/alice/articles/same',
				'Thu, 01 Oct 2026 10:15:55 GMT',
			),
			itemOf(
				'B',
				'https://zenn.dev/bob/articles/same',
				'Thu, 01 Oct 2026 10:15:55 GMT',
			),
		);

		const ids = parseZennFeed(xml).map((entry) => entry.id);

		expect(new Set(ids).size).toBe(2);
	});

	it('rejects input that is not an RSS feed', () => {
		expect(() =>
			parseZennFeed('<html><body>Under maintenance</body></html>'),
		).toThrow();
	});

	it('rejects links that point outside zenn.dev', () => {
		const xml = feedOf(
			itemOf(
				'T',
				'https://example.com/someone/articles/x',
				'Thu, 01 Oct 2026 10:15:55 GMT',
			),
		);

		expect(() => parseZennFeed(xml)).toThrow(/zenn\.dev/);
	});

	it('rejects links that use a non-https scheme', () => {
		const xml = feedOf(
			itemOf('T', 'javascript:alert(1)', 'Thu, 01 Oct 2026 10:15:55 GMT'),
		);

		expect(() => parseZennFeed(xml)).toThrow();
	});

	it('reads tags that carry attributes', () => {
		const xml = feedOf(
			'<item><title domain="x">T</title><link rel="alternate">https://zenn.dev/someone/articles/x</link><pubDate>Thu, 01 Oct 2026 10:15:55 GMT</pubDate></item>',
		);

		expect(parseZennFeed(xml)[0]?.title).toBe('T');
	});

	it('leaves numeric character references in non-CDATA titles undecoded', () => {
		const xml = feedOf(
			'<item><title>It&#39;s</title><link>https://zenn.dev/someone/articles/x</link><pubDate>Thu, 01 Oct 2026 10:15:55 GMT</pubDate></item>',
		);

		expect(parseZennFeed(xml)[0]?.title).toBe('It&#39;s');
	});

	it('names the missing field when an item is incomplete', () => {
		const xml = feedOf(
			'<item><title>T</title><pubDate>Thu, 01 Oct 2026 10:15:55 GMT</pubDate></item>',
		);

		expect(() => parseZennFeed(xml)).toThrow(/missing link$/);
	});

	it('rejects an item without a title', () => {
		const xml = feedOf(
			'<item><link>https://zenn.dev/someone/articles/x</link><pubDate>Thu, 01 Oct 2026 10:15:55 GMT</pubDate></item>',
		);

		expect(() => parseZennFeed(xml)).toThrow();
	});

	it('rejects an item without a link', () => {
		const xml = feedOf(
			'<item><title>T</title><pubDate>Thu, 01 Oct 2026 10:15:55 GMT</pubDate></item>',
		);

		expect(() => parseZennFeed(xml)).toThrow();
	});

	it('rejects an item without a publication date', () => {
		const xml = feedOf(
			'<item><title>T</title><link>https://zenn.dev/someone/articles/x</link></item>',
		);

		expect(() => parseZennFeed(xml)).toThrow();
	});

	it('rejects an item whose publication date cannot be parsed', () => {
		const xml = feedOf(
			itemOf('T', 'https://zenn.dev/someone/articles/x', 'not a date'),
		);

		expect(() => parseZennFeed(xml)).toThrow();
	});
});
