import type { Element } from 'hast';
import { bareUrlOf } from './bare-url';
import { buildCard } from './card';
import type { Ogp } from './ogp';

export type OgpResolver = (url: string) => Promise<Ogp | undefined>;

export async function cardFor(
	paragraph: Element,
	resolve: OgpResolver,
): Promise<Element | undefined> {
	const url = bareUrlOf(paragraph);
	if (url === undefined) {
		return undefined;
	}
	try {
		const ogp = await resolve(url);
		return ogp ? buildCard(ogp) : undefined;
	} catch {
		return undefined;
	}
}
