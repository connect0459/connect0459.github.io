import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { renderOgImage } from '../../lib/og-image-renderer';

type Props = CollectionEntry<'articles'>;

export const getStaticPaths = (async () => {
	const posts = await getCollection('articles');
	return posts.map((post) => ({
		params: { slug: post.id },
		props: post,
	}));
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = ({ props }) =>
	renderOgImage({ title: props.data.title, pubDate: props.data.pubDate });
