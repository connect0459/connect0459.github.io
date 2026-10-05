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
});
