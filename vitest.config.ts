import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['src/features/**/*.test.ts', 'src/lib/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			include: ['src/features/**/*.ts'],
			exclude: ['src/features/**/*.test.ts'],
			thresholds: {
				100: true,
			},
		},
	},
});
