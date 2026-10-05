import type { Element } from 'hast';
import { describe, expect, it } from 'vitest';
import { bareUrlOf } from './bare-url';

function link(href: string, text: string = href): Element {
	return {
		type: 'element',
		tagName: 'a',
		properties: { href },
		children: [{ type: 'text', value: text }],
	};
}

function paragraph(...children: Element['children']): Element {
	return { type: 'element', tagName: 'p', properties: {}, children };
}

describe('bareUrlOf', () => {
	it('detects a paragraph that contains only a link whose text is its address', () => {
		expect(bareUrlOf(paragraph(link('https://example.com/a')))).toBe(
			'https://example.com/a',
		);
	});

	it('ignores a link whose text differs from its address', () => {
		expect(
			bareUrlOf(paragraph(link('https://example.com', 'Example'))),
		).toBeUndefined();
	});

	it('ignores a link surrounded by other text in the same paragraph', () => {
		expect(
			bareUrlOf(
				paragraph({ type: 'text', value: 'See ' }, link('https://example.com')),
			),
		).toBeUndefined();
	});

	it('ignores a paragraph that contains several links', () => {
		expect(
			bareUrlOf(
				paragraph(link('https://example.com/a'), link('https://example.com/b')),
			),
		).toBeUndefined();
	});

	it('tolerates whitespace around the link', () => {
		expect(
			bareUrlOf(
				paragraph({ type: 'text', value: '\n' }, link('https://example.com'), {
					type: 'text',
					value: '\n',
				}),
			),
		).toBe('https://example.com');
	});

	it('ignores addresses that are not http or https', () => {
		expect(bareUrlOf(paragraph(link('mailto:me@example.com')))).toBeUndefined();
	});

	it('ignores elements that are not paragraphs', () => {
		const element: Element = {
			...paragraph(link('https://example.com')),
			tagName: 'li',
		};
		expect(bareUrlOf(element)).toBeUndefined();
	});

	it('ignores a link that wraps other elements instead of plain text', () => {
		const wrapped: Element = {
			...link('https://example.com'),
			children: [
				{
					type: 'element',
					tagName: 'code',
					properties: {},
					children: [{ type: 'text', value: 'https://example.com' }],
				},
			],
		};
		expect(bareUrlOf(paragraph(wrapped))).toBeUndefined();
	});

	it('detects an address whose path contains Japanese characters', () => {
		expect(
			bareUrlOf(
				paragraph(
					link(
						'https://ja.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E8%AA%9E',
						'https://ja.wikipedia.org/wiki/日本語',
					),
				),
			),
		).toBe('https://ja.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E8%AA%9E');
	});

	it('detects an address whose query contains Japanese characters', () => {
		expect(
			bareUrlOf(
				paragraph(
					link(
						'https://example.com/a?q=%E3%81%82&x=1',
						'https://example.com/a?q=あ&x=1',
					),
				),
			),
		).toBe('https://example.com/a?q=%E3%81%82&x=1');
	});

	it('ignores a link whose text is not an address at all', () => {
		expect(
			bareUrlOf(paragraph(link('https://example.com', 'not a url'))),
		).toBeUndefined();
	});

	it('ignores a link whose text is a different address', () => {
		expect(
			bareUrlOf(
				paragraph(link('https://example.com/a', 'https://example.com/b')),
			),
		).toBeUndefined();
	});
});
