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
				id: 'first',
				title: 'First article',
				url: 'https://zenn.dev/someone/articles/first',
				pubDate: new Date('2026-10-01T10:15:55Z'),
			},
		]);
	});

	it('does not mistake the channel metadata for an article', () => {
		expect(parseZennFeed(feedOf())).toEqual([]);
	});

	it('keeps articles published under a publication', () => {
		const xml = feedOf(
			itemOf(
				'Publication article',
				'https://zenn.dev/some_publication/articles/abc123',
				'Tue, 24 Dec 2024 08:41:58 GMT',
			),
		);

		expect(parseZennFeed(xml).map((entry) => entry.id)).toEqual(['abc123']);
	});

	it('decodes XML entities in titles that are not wrapped in CDATA', () => {
		const xml = feedOf(
			'<item><title>A &amp; B &lt;C&gt;</title><link>https://zenn.dev/someone/articles/x</link><pubDate>Thu, 01 Oct 2026 10:15:55 GMT</pubDate></item>',
		);

		expect(parseZennFeed(xml)[0]?.title).toBe('A & B <C>');
	});

	it('rejects an item without a publication date', () => {
		const xml = feedOf(
			'<item><title>T</title><link>https://zenn.dev/someone/articles/x</link></item>',
		);

		expect(() => parseZennFeed(xml)).toThrow();
	});
});
