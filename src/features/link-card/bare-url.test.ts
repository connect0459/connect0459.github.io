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
});
