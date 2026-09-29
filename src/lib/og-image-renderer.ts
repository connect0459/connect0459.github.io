import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import satori from 'satori';
import { SITE_TITLE } from '../consts';
import {
	OG_IMAGE_HEIGHT,
	OG_IMAGE_WIDTH,
	buildOgImageNode,
} from '../features/og-image/model';

const assetPath = (file: string) =>
	path.resolve(process.cwd(), 'src/assets', file);

const font = readFile(assetPath('fonts/NotoSansJP-Bold.otf'));
const avatarSrc = readFile(assetPath('avatar.png')).then(
	(avatar) => `data:image/png;base64,${avatar.toString('base64')}`,
);

export async function renderOgImage(card: {
	title: string;
	pubDate?: Date;
	byline?: string;
}): Promise<Response> {
	const svg = await satori(
		buildOgImageNode({
			byline: SITE_TITLE,
			...card,
			avatarSrc: await avatarSrc,
		}) as Parameters<typeof satori>[0],
		{
			width: OG_IMAGE_WIDTH,
			height: OG_IMAGE_HEIGHT,
			fonts: [{ name: 'Noto Sans JP', data: await font, weight: 700 }],
		},
	);

	const png = await sharp(Buffer.from(svg)).png().toBuffer();
	return new Response(new Uint8Array(png), {
		headers: { 'Content-Type': 'image/png' },
	});
}
