// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'connect0459';
export const SITE_DESCRIPTION = 'Personal website of connect0459.';

export interface AuthorProfile {
	readonly realName: string;
	readonly introduction: readonly string[];
}

export const AUTHOR_PROFILE: AuthorProfile = {
	realName: 'Akira Nakaoka',
	introduction: [
		'技術のことや日々のことを書き残すブログです。',
		'Web・モバイルを中心に、フルサイクルな開発に取り組んでいます。',
	],
};

export interface AuthorLink {
	readonly label: string;
	readonly href: string;
}

export const AUTHOR_LINKS: readonly AuthorLink[] = [
	{ label: 'GitHub', href: 'https://github.com/connect0459' },
	{
		label: 'LinkedIn',
		href: 'https://www.linkedin.com/in/akira-nakaoka-150368382',
	},
	{ label: 'X', href: 'https://x.com/connect0459' },
	{ label: 'Zenn', href: 'https://zenn.dev/connect0459' },
];
