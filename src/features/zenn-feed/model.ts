export interface ZennFeedEntry {
	readonly id: string;
	readonly title: string;
	readonly url: string;
	readonly pubDate: Date;
}

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
	const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(item);
	return match?.[1] === undefined ? undefined : decodeText(match[1]);
}

function toId(url: string): string {
	const segments = new URL(url).pathname.split('/').filter(Boolean);
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
	if (!title || !url || !rawDate) {
		throw new Error('Zenn feed item is missing title, link or pubDate');
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
	return items.map(toEntry);
}
