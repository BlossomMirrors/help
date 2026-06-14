import { escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';

const theme = 'github-dark';
const highlighter = await createHighlighter({
	themes: [theme],
	langs: ['javascript', 'typescript', 'css', 'bash', 'svelte', 'json']
});

/** @param {string} code @param {string} [lang] */
export async function highlight(code, lang = 'text') {
	const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme }));
	return `{@html \`${html}\`}`;
}
