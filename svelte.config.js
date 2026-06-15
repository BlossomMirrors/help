import { mdsvex } from 'mdsvex';
import { highlight } from './src/lib/md-highlighter.js';
import remarkGfm from 'remark-gfm';
import remarkAlerts from './src/lib/remark-alerts.js';
import rehypeSlug from 'rehype-slug';
import adapter from '@sveltejs/adapter-node';
import { injectSvxComponents } from './src/lib/svx-inject-components.js';
import { rehypeExtractHeadings } from './src/lib/rehype-extract-headings.js';

const layoutPath = new URL('src/lib/md-layout.svelte', import.meta.url).pathname;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: [
		injectSvxComponents(),
		mdsvex({
			layout: layoutPath,
			highlight: { highlighter: highlight },
			remarkPlugins: [remarkGfm, remarkAlerts],
			rehypePlugins: [rehypeSlug, rehypeExtractHeadings]
		})
	],
	kit: {
		adapter: adapter()
	}
};

export default config;
