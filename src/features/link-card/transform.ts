import type { Element, Parent, Root } from 'hast';
import { bareUrlOf } from './bare-url';
import { buildCard } from './card';
import type { Ogp } from './ogp';

export type OgpResolver = (url: string) => Promise<Ogp | undefined>;

interface Replacement {
	readonly parent: Parent;
	readonly index: number;
	readonly url: string;
}

function collect(node: Root | Element, found: Replacement[]): void {
	node.children.forEach((child, index) => {
		if (child.type !== 'element') {
			return;
		}
		const url = bareUrlOf(child);
		if (url !== undefined) {
			found.push({ parent: node, index, url });
			return;
		}
		collect(child, found);
	});
}

async function safelyResolve(
	resolve: OgpResolver,
	url: string,
): Promise<Ogp | undefined> {
	try {
		return await resolve(url);
	} catch {
		return undefined;
	}
}

export async function replaceBareUrls(
	tree: Root,
	resolve: OgpResolver,
): Promise<void> {
	const found: Replacement[] = [];
	collect(tree, found);
	const urls = [...new Set(found.map(({ url }) => url))];
	const resolved = new Map(
		await Promise.all(
			urls.map(
				async (url) => [url, await safelyResolve(resolve, url)] as const,
			),
		),
	);
	for (const { parent, index, url } of found) {
		const ogp = resolved.get(url);
		if (ogp) {
			parent.children[index] = buildCard(ogp);
		}
	}
}
