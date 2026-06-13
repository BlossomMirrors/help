import { mdsvex } from 'mdsvex';
import remarkGfm from 'remark-gfm';
import remarkAlerts from './src/lib/remark-alerts.js';
import rehypeSlug from 'rehype-slug';
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: [mdsvex({ remarkPlugins: [remarkGfm, remarkAlerts], rehypePlugins: [rehypeSlug] })],
	kit: {
		adapter: adapter()
	}
};

export default config;
