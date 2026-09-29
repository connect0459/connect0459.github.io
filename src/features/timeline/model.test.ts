import { describe, expect, it } from 'vitest';
import {
	findAdjacentEntries,
	formatFullDate,
	groupByYear,
	type NativeTimelineEntry,
	toTimelineEntry,
} from './model';

function nativeEntry(title: string, pubDate: string): NativeTimelineEntry {
	return {
		kind: 'native',
		title,
		pubDate: new Date(pubDate),
		href: `/articles/${title}/`,
	};
}

describe('toTimelineEntry', () => {
	it('maps a native article to an entry linking to /articles/<slug>/', () => {
		const entry = toTimelineEntry({
			type: 'article',
			slug: 'my-post',
			title: 'My Post',
			pubDate: new Date('2024-05-01'),
		});

		expect(entry).toEqual({
			kind: 'native',
			title: 'My Post',
			pubDate: new Date('2024-05-01'),
			href: '/articles/my-post/',
		});
	});

	it('maps an external link to an entry linking directly to its URL', () => {
		const entry = toTimelineEntry({
			type: 'link',
			url: 'https://zenn.dev/connect0459/articles/example',
			title: 'External Post',
			pubDate: new Date('2024-06-01'),
		});

		expect(entry).toEqual({
			kind: 'external',
			title: 'External Post',
			pubDate: new Date('2024-06-01'),
			href: 'https://zenn.dev/connect0459/articles/example',
			domain: 'zenn.dev',
		});
	});
});

describe('formatFullDate', () => {
	it('formats a date as yyyy-MM-dd', () => {
		expect(formatFullDate(new Date(Date.UTC(2024, 5, 15)))).toBe('2024-06-15');
	});

	it('zero-pads a single-digit month and day', () => {
		expect(formatFullDate(new Date(Date.UTC(2024, 0, 5)))).toBe('2024-01-05');
	});

	it('reads the year, month, and day in UTC regardless of the host timezone', () => {
		const originalTz = process.env.TZ;
		process.env.TZ = 'Pacific/Kiritimati'; // UTC+14, rolls the local date to Jan 1
		try {
			expect(formatFullDate(new Date(Date.UTC(2024, 11, 31, 23)))).toBe(
				'2024-12-31',
			);
		} finally {
			process.env.TZ = originalTz;
		}
	});
});

describe('groupByYear', () => {
	it('groups entries by the calendar year of their publish date', () => {
		const groups = groupByYear([
			nativeEntry('a', '2023-01-01'),
			nativeEntry('b', '2024-01-01'),
		]);

		expect(groups.map((g) => g.year)).toEqual([2024, 2023]);
	});

	it('orders years newest first', () => {
		const groups = groupByYear([
			nativeEntry('a', '2022-01-01'),
			nativeEntry('b', '2024-01-01'),
			nativeEntry('c', '2023-01-01'),
		]);

		expect(groups.map((g) => g.year)).toEqual([2024, 2023, 2022]);
	});

	it('orders entries within a year newest first', () => {
		const groups = groupByYear([
			nativeEntry('early', '2024-01-01'),
			nativeEntry('late', '2024-06-01'),
		]);

		expect(groups[0].entries.map((e) => e.title)).toEqual(['late', 'early']);
	});

	it('returns no groups for an empty entry list', () => {
		expect(groupByYear([])).toEqual([]);
	});
});

describe('findAdjacentEntries', () => {
	const entries = [
		nativeEntry('newest', '2024-03-01'),
		nativeEntry('middle', '2024-02-01'),
		nativeEntry('oldest', '2024-01-01'),
	];

	it('returns the entries before and after the current one in list order', () => {
		const { prev, next } = findAdjacentEntries(entries, '/articles/middle/');

		expect(prev?.title).toBe('newest');
		expect(next?.title).toBe('oldest');
	});

	it('returns null for prev when the current entry is first in the list', () => {
		const { prev } = findAdjacentEntries(entries, '/articles/newest/');

		expect(prev).toBeNull();
	});

	it('returns null for next when the current entry is last in the list', () => {
		const { next } = findAdjacentEntries(entries, '/articles/oldest/');

		expect(next).toBeNull();
	});

	it('returns null for both when the current href is not found', () => {
		const result = findAdjacentEntries(entries, '/articles/missing/');

		expect(result).toEqual({ prev: null, next: null });
	});
});
