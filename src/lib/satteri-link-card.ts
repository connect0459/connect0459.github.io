import { defineHastPlugin } from 'satteri';
import { cardFor } from '../features/link-card/card-for';
import { createOgpResolver } from './ogp-resolver';

const CACHE_FILE = 'node_modules/.cache/link-card/ogp.json';

export function linkCardPlugin() {
	const resolve = createOgpResolver({ cacheFile: CACHE_FILE });
	return defineHastPlugin({
		name: 'link-card',
		element: {
			filter: ['p'],
			visit: (node) => cardFor(node, resolve),
		},
	});
}
