import { mdsvex } from 'mdsvex';
import { highlight } from './src/lib/md-highlighter.js';
import remarkGfm from 'remark-gfm';
import remarkAlerts from './src/lib/remark-alerts.js';
import rehypeSlug from 'rehype-slug';
import adapter from '@sveltejs/adapter-node';

const layoutPath = new URL('src/lib/md-layout.svelte', import.meta.url).pathname;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: [
		mdsvex({
			layout: layoutPath,
			highlight: { highlighter: highlight },
			remarkPlugins: [remarkGfm, remarkAlerts],
			rehypePlugins: [rehypeSlug]
		})
	],
	kit: {
		adapter: adapter()
	}
};

export default config;
