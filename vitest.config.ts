import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['src/features/**/*.test.ts', 'src/lib/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			include: ['src/features/**/*.ts', 'src/lib/ogp-resolver.ts'],
			exclude: ['src/**/*.test.ts'],
			thresholds: {
				100: true,
			},
		},
	},
});
