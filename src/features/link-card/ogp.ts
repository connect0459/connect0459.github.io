export interface Ogp {
	readonly url: string;
	readonly title: string;
	readonly description?: string;
	readonly image?: string;
	readonly favicon?: string;
	readonly siteName: string;
}

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
};

const MAX_CODE_POINT = 0x10ffff;

function decodeEntities(value: string): string {
	return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, body: string) => {
		if (body.startsWith('#')) {
			const isHex = body[1].toLowerCase() === 'x';
			const code = Number.parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
			return code > MAX_CODE_POINT ? match : String.fromCodePoint(code);
		}
		return NAMED_ENTITIES[body.toLowerCase()] ?? match;
	});
}

const TAG_BODY = `(?:"[^"]*"|'[^']*'|[^>"'])*`;

function* attributesOfTags(
	html: string,
	tagName: string,
): Generator<Map<string, string>> {
	for (const [tag] of html.matchAll(
		new RegExp(`<${tagName}\\s${TAG_BODY}>`, 'gi'),
	)) {
		const attributes = new Map<string, string>();
		for (const match of tag.matchAll(
			/([a-z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
		)) {
			attributes.set(match[1].toLowerCase(), match[2] ?? match[3]);
		}
		yield attributes;
	}
}

function metaContents(html: string): Map<string, string> {
	const contents = new Map<string, string>();
	for (const attributes of attributesOfTags(html, 'meta')) {
		const key = (
			attributes.get('property') ?? attributes.get('name')
		)?.toLowerCase();
		const content = attributes.get('content');
		if (key !== undefined && content !== undefined && !contents.has(key)) {
			contents.set(key, decodeEntities(content).trim());
		}
	}
	return contents;
}

function titleElementText(html: string): string | undefined {
	const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
	return match ? decodeEntities(match[1]).trim() : undefined;
}

function resolveWebAddress(address: string | undefined, pageUrl: string) {
	if (!address) {
		return undefined;
	}
	try {
		const resolved = new URL(address, pageUrl);
		return resolved.protocol === 'http:' || resolved.protocol === 'https:'
			? resolved.href
			: undefined;
	} catch {
		return undefined;
	}
}

function faviconHref(html: string): string | undefined {
	for (const attributes of attributesOfTags(html, 'link')) {
		const relations = attributes.get('rel')?.toLowerCase().split(/\s+/) ?? [];
		const href = attributes.get('href');
		if (relations.includes('icon') && href) {
			return decodeEntities(href).trim();
		}
	}
	return undefined;
}

export function parseOgp(html: string, pageUrl: string): Ogp | undefined {
	const meta = metaContents(html);
	const title = meta.get('og:title') || titleElementText(html);
	if (!title) {
		return undefined;
	}
	return {
		url: pageUrl,
		title,
		description:
			meta.get('og:description') || meta.get('description') || undefined,
		image: resolveWebAddress(meta.get('og:image'), pageUrl),
		favicon: resolveWebAddress(faviconHref(html), pageUrl),
		siteName: meta.get('og:site_name') || new URL(pageUrl).hostname,
	};
}
