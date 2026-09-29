import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import sharp from 'sharp';
import satori from 'satori';
import { SITE_TITLE } from '../../consts';
import {
	OG_IMAGE_HEIGHT,
	OG_IMAGE_WIDTH,
	buildOgImageNode,
} from '../../features/og-image/model';

type Props = CollectionEntry<'articles'>;

export const getStaticPaths = (async () => {
	const posts = await getCollection('articles');
	return posts.map((post) => ({
		params: { slug: post.id },
		props: post,
	}));
}) satisfies GetStaticPaths;

const assetPath = (file: string) =>
	path.resolve(process.cwd(), 'src/assets', file);

export const GET: APIRoute<Props> = async ({ props }) => {
	const [font, avatar] = await Promise.all([
		readFile(assetPath('fonts/NotoSansJP-Bold.otf')),
		readFile(assetPath('avatar.jpg')),
	]);

	const svg = await satori(
		buildOgImageNode({
			title: props.data.title,
			pubDate: props.data.pubDate,
			siteTitle: SITE_TITLE,
			avatarSrc: `data:image/jpeg;base64,${avatar.toString('base64')}`,
		}) as Parameters<typeof satori>[0],
		{
			width: OG_IMAGE_WIDTH,
			height: OG_IMAGE_HEIGHT,
			fonts: [{ name: 'Noto Sans JP', data: font, weight: 700 }],
		},
	);

	const png = await sharp(Buffer.from(svg)).png().toBuffer();
	return new Response(new Uint8Array(png), {
		headers: { 'Content-Type': 'image/png' },
	});
};
