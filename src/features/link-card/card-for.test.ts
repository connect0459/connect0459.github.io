import type { Element } from 'hast';
import { describe, expect, it } from 'vitest';
import type { Ogp } from './ogp';
import { cardFor } from './card-for';

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

const OGP: Ogp = {
	url: 'https://example.com/a',
	title: 'Example title',
	description: 'Example description',
	image: 'https://example.com/ogp.png',
	siteName: 'Example',
};

const resolveFromMemory = (known: Record<string, Ogp>) => async (url: string) =>
	known[url];

function textOf(node: Element): string {
	return node.children
		.map((child) =>
			child.type === 'text'
				? child.value
				: child.type === 'element'
					? textOf(child)
					: '',
		)
		.join('');
}

describe('cardFor', () => {
	it('builds a card that shows the page metadata for a bare URL paragraph', async () => {
		const card = await cardFor(
			paragraph(link(OGP.url)),
			resolveFromMemory({ [OGP.url]: OGP }),
		);
		expect(card?.tagName).toBe('a');
		expect(card?.properties.href).toBe(OGP.url);
		expect(textOf(card!)).toContain('Example title');
		expect(textOf(card!)).toContain('Example description');
		expect(textOf(card!)).toContain('Example');
	});

	it('keeps the plain link when the page metadata is unavailable', async () => {
		expect(
			await cardFor(paragraph(link(OGP.url)), resolveFromMemory({})),
		).toBeUndefined();
	});

	it('keeps the plain link when resolving the page fails', async () => {
		expect(
			await cardFor(paragraph(link(OGP.url)), async () => {
				throw new Error('network down');
			}),
		).toBeUndefined();
	});

	it('leaves links with custom text untouched', async () => {
		let resolved = false;
		const card = await cardFor(
			paragraph(link(OGP.url, 'read this')),
			async () => {
				resolved = true;
				return OGP;
			},
		);
		expect(card).toBeUndefined();
		expect(resolved).toBe(false);
	});

	it('omits the image block when the page declares no image', async () => {
		const card = await cardFor(
			paragraph(link(OGP.url)),
			resolveFromMemory({ [OGP.url]: { ...OGP, image: undefined } }),
		);
		expect(JSON.stringify(card)).not.toContain('"img"');
	});

	it('omits the description block when the page declares no description', async () => {
		const card = await cardFor(
			paragraph(link(OGP.url)),
			resolveFromMemory({ [OGP.url]: { ...OGP, description: undefined } }),
		);
		expect(JSON.stringify(card)).not.toContain('link-card__description');
	});
});
