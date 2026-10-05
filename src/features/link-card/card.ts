import type { Element, ElementContent } from 'hast';
import type { Ogp } from './ogp';

function el(
	tagName: string,
	properties: Element['properties'],
	children: ElementContent[] = [],
): Element {
	return { type: 'element', tagName, properties, children };
}

function text(value: string): ElementContent {
	return { type: 'text', value };
}

export function buildCard(ogp: Ogp): Element {
	const body = [
		el('span', { className: ['link-card__title'] }, [text(ogp.title)]),
		...(ogp.description
			? [
					el('span', { className: ['link-card__description'] }, [
						text(ogp.description),
					]),
				]
			: []),
		el('span', { className: ['link-card__site'] }, [
			...(ogp.favicon
				? [
						el('img', {
							className: ['link-card__favicon'],
							src: ogp.favicon,
							alt: '',
							loading: 'lazy',
							referrerPolicy: 'no-referrer',
						}),
					]
				: []),
			text(ogp.siteName),
		]),
	];
	const image = ogp.image
		? [
				el('img', {
					className: ['link-card__image'],
					src: ogp.image,
					alt: '',
					loading: 'lazy',
					referrerPolicy: 'no-referrer',
				}),
			]
		: [];
	return el(
		'a',
		{
			className: ['link-card'],
			href: ogp.url,
			target: '_blank',
			rel: ['noopener', 'noreferrer'],
		},
		[el('span', { className: ['link-card__body'] }, body), ...image],
	);
}
