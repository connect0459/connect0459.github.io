import type { Element, ElementContent } from 'hast';

function isBlankText(node: ElementContent): boolean {
	return node.type === 'text' && node.value.trim() === '';
}

function textOf(element: Element): string {
	return element.children
		.map((child) => (child.type === 'text' ? child.value : ''))
		.join('');
}

export function bareUrlOf(paragraph: Element): string | undefined {
	if (paragraph.tagName !== 'p') {
		return undefined;
	}
	const meaningful = paragraph.children.filter((child) => !isBlankText(child));
	const [only] = meaningful;
	if (
		meaningful.length !== 1 ||
		only.type !== 'element' ||
		only.tagName !== 'a'
	) {
		return undefined;
	}
	const href = only.properties.href;
	if (typeof href !== 'string' || !/^https?:\/\//.test(href)) {
		return undefined;
	}
	return textOf(only).trim() === href ? href : undefined;
}
