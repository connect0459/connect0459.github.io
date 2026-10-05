import type { Element, Root } from 'hast';
import { describe, expect, it } from 'vitest';
import type { Ogp } from './ogp';
import { replaceBareUrls } from './transform';

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

function root(...children: Root['children']): Root {
	return { type: 'root', children };
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

function textOf(node: Root | Element): string {
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

describe('replaceBareUrls', () => {
	it('replaces a bare URL paragraph with a card that shows the page metadata', async () => {
		const tree = root(paragraph(link(OGP.url)));
		await replaceBareUrls(tree, resolveFromMemory({ [OGP.url]: OGP }));
		const card = tree.children[0] as Element;
		expect(card.tagName).toBe('a');
		expect(card.properties.href).toBe(OGP.url);
		expect(textOf(card)).toContain('Example title');
		expect(textOf(card)).toContain('Example description');
		expect(textOf(card)).toContain('Example');
	});

	it('keeps the plain link when the page metadata is unavailable', async () => {
		const tree = root(paragraph(link(OGP.url)));
		await replaceBareUrls(tree, resolveFromMemory({}));
		expect((tree.children[0] as Element).tagName).toBe('p');
	});

	it('keeps the plain link when resolving the page fails', async () => {
		const tree = root(paragraph(link(OGP.url)));
		await replaceBareUrls(tree, async () => {
			throw new Error('network down');
		});
		expect((tree.children[0] as Element).tagName).toBe('p');
	});

	it('leaves links with custom text untouched', async () => {
		const tree = root(paragraph(link(OGP.url, 'read this')));
		await replaceBareUrls(tree, resolveFromMemory({ [OGP.url]: OGP }));
		expect((tree.children[0] as Element).tagName).toBe('p');
	});

	it('converts bare URLs nested inside other elements', async () => {
		const quote: Element = {
			type: 'element',
			tagName: 'blockquote',
			properties: {},
			children: [paragraph(link(OGP.url))],
		};
		const tree = root(quote);
		await replaceBareUrls(tree, resolveFromMemory({ [OGP.url]: OGP }));
		expect((quote.children[0] as Element).tagName).toBe('a');
	});

	it('resolves each distinct address once even when it appears repeatedly', async () => {
		const tree = root(paragraph(link(OGP.url)), paragraph(link(OGP.url)));
		let calls = 0;
		await replaceBareUrls(tree, async () => {
			calls += 1;
			return OGP;
		});
		expect(calls).toBe(1);
		expect(tree.children.every((c) => (c as Element).tagName === 'a')).toBe(
			true,
		);
	});

	it('omits the image block when the page declares no image', async () => {
		const tree = root(paragraph(link(OGP.url)));
		await replaceBareUrls(
			tree,
			resolveFromMemory({ [OGP.url]: { ...OGP, image: undefined } }),
		);
		const html = JSON.stringify(tree);
		expect(html).not.toContain('"img"');
	});

	it('omits the description block when the page declares no description', async () => {
		const tree = root(paragraph(link(OGP.url)));
		await replaceBareUrls(
			tree,
			resolveFromMemory({ [OGP.url]: { ...OGP, description: undefined } }),
		);
		expect(JSON.stringify(tree)).not.toContain('link-card__description');
	});
});
