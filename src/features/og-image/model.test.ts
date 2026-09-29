import { describe, expect, it } from 'vitest';
import {
	HOME_OG_IMAGE_PATH,
	buildOgImageNode,
	ogImagePath,
	type OgImageNode,
} from './model';

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
	byline: 'connect0459',
	avatarSrc: 'data:image/jpeg;base64,AAAA',
};

describe('ogImagePath', () => {
	it('places an article image under /og/ named after its slug', () => {
		expect(ogImagePath('my-post')).toBe('/og/my-post.png');
	});
});

describe('HOME_OG_IMAGE_PATH', () => {
	it('places the home page image under /og/', () => {
		expect(HOME_OG_IMAGE_PATH).toBe('/og/index.png');
	});
});

describe('buildOgImageNode', () => {
	it('shows the article title', () => {
		expect(collectTexts(buildOgImageNode(card))).toContain(card.title);
	});

	it('shows the publication date as yyyy-MM-dd', () => {
		expect(collectTexts(buildOgImageNode(card))).toContain('2026-09-21');
	});

	it('drops emoji from the title because the bundled font cannot draw them', () => {
		const texts = collectTexts(
			buildOgImageNode({ ...card, title: '🍓 いちご 👨‍👩‍👧 アイス✨' }),
		);

		expect(texts).toContain('いちご アイス');
	});

	it('keeps ideographic and symbol characters the font can draw', () => {
		const texts = collectTexts(
			buildOgImageNode({ ...card, title: '𠮷野家 ㈱ v1.0 #tag' }),
		);

		expect(texts).toContain('𠮷野家 ㈱ v1.0 #tag');
	});

	it('omits the date for a card without a publication date', () => {
		const homeCard = {
			title: card.title,
			byline: card.byline,
			avatarSrc: card.avatarSrc,
		};

		expect(collectTexts(buildOgImageNode(homeCard))).toEqual([
			card.title,
			card.byline,
		]);
	});

	it('shows the byline next to the avatar', () => {
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
