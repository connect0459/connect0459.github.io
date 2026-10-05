import { describe, expect, it } from 'vitest';
import { canReuseStoredFeed } from './offline-fallback';

describe('canReuseStoredFeed', () => {
	it('reuses previously loaded links while running the dev server', () => {
		expect(canReuseStoredFeed(['dev'], 3)).toBe(true);
	});

	it('reuses previously loaded links while type checking', () => {
		expect(canReuseStoredFeed(['check'], 3)).toBe(true);
	});

	it('ignores flags that precede the command', () => {
		expect(canReuseStoredFeed(['--verbose', 'dev', '--port', '4321'], 3)).toBe(
			true,
		);
	});

	it('never reuses previously loaded links in a production build', () => {
		expect(canReuseStoredFeed(['build'], 3)).toBe(false);
	});

	it('never reuses previously loaded links when the command is unknown', () => {
		expect(canReuseStoredFeed([], 3)).toBe(false);
		expect(canReuseStoredFeed(['preview'], 3)).toBe(false);
	});

	it('fails on a fresh clone that has no previously loaded links', () => {
		expect(canReuseStoredFeed(['dev'], 0)).toBe(false);
		expect(canReuseStoredFeed(['check'], 0)).toBe(false);
	});
});
