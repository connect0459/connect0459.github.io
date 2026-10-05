import { describe, expect, it } from 'vitest';
import { parseOgp } from './ogp';

const PAGE_URL = 'https://example.com/post';

describe('parseOgp', () => {
	it('extracts the Open Graph title, description, image and site name', () => {
		const html = `<html><head>
			<meta property="og:title" content="Hello">
			<meta property="og:description" content="A greeting">
			<meta property="og:image" content="https://example.com/ogp.png">
			<meta property="og:site_name" content="Example">
		</head></html>`;
		expect(parseOgp(html, PAGE_URL)).toEqual({
			url: PAGE_URL,
			title: 'Hello',
			description: 'A greeting',
			image: 'https://example.com/ogp.png',
			siteName: 'Example',
		});
	});

	it('reads metadata regardless of attribute order and quote style', () => {
		const html = `<meta content='Hello' property='og:title'><meta content="Desc" name="og:description">`;
		const ogp = parseOgp(html, PAGE_URL);
		expect(ogp?.title).toBe('Hello');
		expect(ogp?.description).toBe('Desc');
	});

	it('falls back to the title element and the description meta tag', () => {
		const html = `<title>Plain title</title><meta name="description" content="Plain desc">`;
		const ogp = parseOgp(html, PAGE_URL);
		expect(ogp?.title).toBe('Plain title');
		expect(ogp?.description).toBe('Plain desc');
	});

	it('resolves a relative image address against the page address', () => {
		const html = `<meta property="og:title" content="T"><meta property="og:image" content="/img/ogp.png">`;
		expect(parseOgp(html, PAGE_URL)?.image).toBe(
			'https://example.com/img/ogp.png',
		);
	});

	it('decodes HTML entities in the content', () => {
		const html = `<meta property="og:title" content="Tom &amp; Jerry &quot;live&quot;">`;
		expect(parseOgp(html, PAGE_URL)?.title).toBe('Tom & Jerry "live"');
	});

	it('uses the host name as the site name when none is declared', () => {
		const html = `<meta property="og:title" content="T">`;
		expect(parseOgp(html, PAGE_URL)?.siteName).toBe('example.com');
	});

	it('yields nothing when the page has no usable title', () => {
		expect(
			parseOgp('<html><body>no head</body></html>', PAGE_URL),
		).toBeUndefined();
	});

	it('drops an image whose address is not http or https', () => {
		const html = `<meta property="og:title" content="T"><meta property="og:image" content="javascript:alert(1)">`;
		expect(parseOgp(html, PAGE_URL)?.image).toBeUndefined();
	});

	it('decodes numeric character references in decimal and hexadecimal', () => {
		const html = `<meta property="og:title" content="&#65;&#x42;&#99999999;&unknown;">`;
		expect(parseOgp(html, PAGE_URL)?.title).toBe('AB&#99999999;&unknown;');
	});

	it('ignores meta tags that lack a name or a content', () => {
		const html = `<meta charset="utf-8"><meta property="og:description"><meta property="og:title" content="T">`;
		const ogp = parseOgp(html, PAGE_URL);
		expect(ogp?.title).toBe('T');
		expect(ogp?.description).toBeUndefined();
	});

	it('prefers the first declaration and matches names case-insensitively', () => {
		const html = `<meta property="OG:Title" content="First"><meta property="og:title" content="Second">`;
		expect(parseOgp(html, PAGE_URL)?.title).toBe('First');
	});

	it('drops an image whose address cannot be parsed', () => {
		const html = `<meta property="og:title" content="T"><meta property="og:image" content="http://[bad">`;
		expect(parseOgp(html, PAGE_URL)?.image).toBeUndefined();
	});

	it('reads the favicon address declared by the page', () => {
		const html = `<meta property="og:title" content="T"><link rel="icon" href="/favicon.svg">`;
		expect(parseOgp(html, PAGE_URL)?.favicon).toBe(
			'https://example.com/favicon.svg',
		);
	});

	it('accepts the shortcut icon spelling and any attribute order', () => {
		const html = `<meta property="og:title" content="T"><link href='https://cdn.example.com/f.ico' rel='shortcut icon'>`;
		expect(parseOgp(html, PAGE_URL)?.favicon).toBe(
			'https://cdn.example.com/f.ico',
		);
	});

	it('does not mistake other link relations for a favicon', () => {
		const html = `<meta property="og:title" content="T"><link rel="stylesheet" href="/a.css"><link rel="apple-touch-icon" href="/touch.png">`;
		expect(parseOgp(html, PAGE_URL)?.favicon).toBeUndefined();
	});

	it('omits the favicon when none is declared or it is not an http address', () => {
		const html = `<meta property="og:title" content="T"><link href="/no-rel.png"><link rel="icon" href="data:image/png;base64,AAAA"><link rel="icon">`;
		expect(parseOgp(html, PAGE_URL)?.favicon).toBeUndefined();
	});

	it('skips an icon declaration without an address and uses the next one', () => {
		const html = `<meta property="og:title" content="T"><link rel="icon"><link rel="icon" href="/second.ico">`;
		expect(parseOgp(html, PAGE_URL)?.favicon).toBe(
			'https://example.com/second.ico',
		);
	});
});
