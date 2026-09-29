export interface NativeArticleSource {
	readonly type: 'article';
	readonly slug: string;
	readonly title: string;
	readonly pubDate: Date;
}

export interface ExternalLinkSource {
	readonly type: 'link';
	readonly url: string;
	readonly title: string;
	readonly pubDate: Date;
}

export interface NativeTimelineEntry {
	readonly kind: 'native';
	readonly title: string;
	readonly pubDate: Date;
	readonly href: string;
}

export interface ExternalTimelineEntry {
	readonly kind: 'external';
	readonly title: string;
	readonly pubDate: Date;
	readonly href: string;
	readonly domain: string;
}

export type TimelineEntry = NativeTimelineEntry | ExternalTimelineEntry;

export function toTimelineEntry(
	source: NativeArticleSource | ExternalLinkSource,
): TimelineEntry {
	if (source.type === 'article') {
		return {
			kind: 'native',
			title: source.title,
			pubDate: source.pubDate,
			href: `/articles/${source.slug}/`,
		};
	}

	return {
		kind: 'external',
		title: source.title,
		pubDate: source.pubDate,
		href: source.url,
		domain: new URL(source.url).hostname,
	};
}

export function formatFullDate(date: Date): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export interface YearGroup {
	readonly year: number;
	readonly entries: readonly TimelineEntry[];
}

export function groupByYear(
	entries: readonly TimelineEntry[],
): readonly YearGroup[] {
	const byYear = new Map<number, TimelineEntry[]>();
	for (const entry of entries) {
		const year = entry.pubDate.getUTCFullYear();
		const group = byYear.get(year);
		if (group) {
			group.push(entry);
		} else {
			byYear.set(year, [entry]);
		}
	}

	return Array.from(byYear.entries())
		.sort(([a], [b]) => b - a)
		.map(([year, yearEntries]) => ({
			year,
			entries: yearEntries
				.slice()
				.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()),
		}));
}

export interface AdjacentEntries {
	readonly prev: NativeTimelineEntry | null;
	readonly next: NativeTimelineEntry | null;
}

export function findAdjacentEntries(
	entries: readonly NativeTimelineEntry[],
	currentHref: string,
): AdjacentEntries {
	const index = entries.findIndex((entry) => entry.href === currentHref);
	if (index === -1) {
		return { prev: null, next: null };
	}

	return {
		prev: entries[index - 1] ?? null,
		next: entries[index + 1] ?? null,
	};
}
