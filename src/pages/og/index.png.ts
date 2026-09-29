import type { APIRoute } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../consts';
import { renderOgImage } from '../../lib/og-image-renderer';

export const GET: APIRoute = () =>
	renderOgImage({ title: SITE_TITLE, byline: SITE_DESCRIPTION });
