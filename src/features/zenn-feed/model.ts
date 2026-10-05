export interface ZennFeedEntry {
	readonly id: string;
	readonly title: string;
	readonly url: string;
	readonly pubDate: Date;
}

const ZENN_ORIGIN = 'https://zenn.dev';

const XML_ENTITIES: Readonly<Record<string, string>> = {
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&apos;': "'",
	'&amp;': '&',
};

function decodeText(raw: string): string {
	const trimmed = raw.trim();
	const cdata = /^<!\[CDATA\[([\s\S]*)\]\]>$/.exec(trimmed);
	if (cdata) {
		return cdata[1] ?? '';
	}
	return trimmed.replace(
		/&(?:lt|gt|quot|apos|amp);/g,
		(m) => XML_ENTITIES[m] ?? m,
	);
}

function readTag(item: string, tag: string): string | undefined {
	const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`).exec(
		item,
	);
	return match?.[1] === undefined ? undefined : decodeText(match[1]);
}

function assertZennUrl(url: string): URL {
	const parsed = new URL(url);
	if (parsed.origin !== ZENN_ORIGIN) {
		throw new Error(`Zenn feed item links outside ${ZENN_ORIGIN}: ${url}`);
	}
	return parsed;
}

function toId(url: string): string {
	const segments = assertZennUrl(url).pathname.split('/').filter(Boolean);
	const owner = segments[0];
	const slug = segments.at(-1);
	if (!owner || !slug) {
		throw new Error(`Zenn feed item has an unexpected link: ${url}`);
	}
	return `${owner}/${slug}`;
}

function toEntry(item: string): ZennFeedEntry {
	const title = readTag(item, 'title');
	const url = readTag(item, 'link');
	const rawDate = readTag(item, 'pubDate');
	const missing = (
		[
			['title', title],
			['link', url],
			['pubDate', rawDate],
		] as const
	)
		.filter(([, value]) => !value)
		.map(([name]) => name);
	if (!title || !url || !rawDate) {
		throw new Error(`Zenn feed item is missing ${missing.join(', ')}`);
	}
	const pubDate = new Date(rawDate);
	if (Number.isNaN(pubDate.getTime())) {
		throw new Error(`Zenn feed item has an invalid pubDate: ${rawDate}`);
	}
	return { id: toId(url), title, url, pubDate };
}

export function parseZennFeed(xml: string): ZennFeedEntry[] {
	if (!/<rss[\s>]/.test(xml) || !xml.includes('<channel>')) {
		throw new Error('Zenn feed response is not an RSS feed');
	}
	const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
	if (items.length === 0) {
		throw new Error('Zenn feed contains no articles');
	}
	return items.map(toEntry);
}
