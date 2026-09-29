import { describe, expect, it } from 'vitest';
import { buildOgImageNode, ogImagePath, type OgImageNode } from './model';

function collectTexts(node: OgImageNode | string): string[] {
	if (typeof node === 'string') {
		return [node];
	}
	const children = node.props.children;
	if (children === undefined) {
		return [];
	}
	return (Array.isArray(children) ? children : [children]).flatMap(
		collectTexts,
	);
}

function collectImageSources(node: OgImageNode | string): string[] {
	if (typeof node === 'string') {
		return [];
	}
	const own = node.type === 'img' ? [String(node.props.src)] : [];
	const children = node.props.children;
	if (children === undefined) {
		return own;
	}
	return own.concat(
		(Array.isArray(children) ? children : [children]).flatMap(
			collectImageSources,
		),
	);
}

const card = {
	title: 'Astroで個人ブログを作った',
	pubDate: new Date('2026-09-21'),
	siteTitle: 'connect0459',
	avatarSrc: 'data:image/jpeg;base64,AAAA',
};

describe('ogImagePath', () => {
	it('places an article image under /og/ named after its slug', () => {
		expect(ogImagePath('my-post')).toBe('/og/my-post.png');
	});
});

describe('buildOgImageNode', () => {
	it('shows the article title', () => {
		expect(collectTexts(buildOgImageNode(card))).toContain(card.title);
	});

	it('shows the publication date as yyyy-MM-dd', () => {
		expect(collectTexts(buildOgImageNode(card))).toContain('2026-09-21');
	});

	it('shows the site title as the byline', () => {
		expect(collectTexts(buildOgImageNode(card))).toContain('connect0459');
	});

	it('shows the author avatar', () => {
		expect(collectImageSources(buildOgImageNode(card))).toEqual([
			card.avatarSrc,
		]);
	});

	it('renders at the standard 1200x630 OGP size', () => {
		const root = buildOgImageNode(card);

		expect(root.props.style).toMatchObject({ width: 1200, height: 630 });
	});
});
