import { formatFullDate } from '../timeline/model';

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export interface OgImageNode {
	readonly type: string;
	readonly props: {
		readonly style?: Readonly<Record<string, string | number>>;
		readonly src?: string;
		readonly children?:
			OgImageNode | string | readonly (OgImageNode | string)[];
	};
}

export interface OgImageCard {
	readonly title: string;
	readonly pubDate: Date;
	readonly siteTitle: string;
	readonly avatarSrc: string;
}

export function ogImagePath(slug: string): string {
	return `/og/${slug}.png`;
}

export function buildOgImageNode(card: OgImageCard): OgImageNode {
	return {
		type: 'div',
		props: {
			style: {
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				width: OG_IMAGE_WIDTH,
				height: OG_IMAGE_HEIGHT,
				padding: 80,
				background: '#f9f9f9',
				color: '#121212',
				fontFamily: 'Noto Sans JP',
				fontWeight: 700,
			},
			children: [
				{
					type: 'div',
					props: {
						style: {
							display: 'block',
							fontSize: 64,
							lineHeight: 1.3,
							lineClamp: 4,
						},
						children: card.title,
					},
				},
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							fontSize: 30,
							color: '#5e5e5e',
						},
						children: [
							{
								type: 'div',
								props: {
									style: { display: 'flex', alignItems: 'center', gap: 20 },
									children: [
										{
											type: 'img',
											props: {
												src: card.avatarSrc,
												style: { width: 72, height: 72 },
											},
										},
										{
											type: 'div',
											props: {
												style: { color: '#121212' },
												children: card.siteTitle,
											},
										},
									],
								},
							},
							{
								type: 'div',
								props: { children: formatFullDate(card.pubDate) },
							},
						],
					},
				},
			],
		},
	};
}
